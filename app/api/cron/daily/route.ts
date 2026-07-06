import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import {
  sendOrderReminder,
  sendOrderAutoCancelled,
  sendReviewRequest,
  sendTrialDay1,
  sendTrialDay7,
  sendTrialEnding,
  sendTrialEnded,
  sendMonthlySummary,
} from '@/lib/resend/emails'

// Daily lifecycle cron. Idempotent: caterer emails are guarded by the
// lifecycle_emails unique key, order emails by columns on the order row —
// safe to run more than once a day.
//
// Trigger: GET/POST with `x-cron-key: $CRON_SECRET` (or ?key=). Wired to a
// Netlify scheduled function in netlify/functions/lifecycle-cron.mjs.

const DAY_MS = 24 * 60 * 60 * 1000

export async function GET(request: NextRequest) {
  return run(request)
}

export async function POST(request: NextRequest) {
  return run(request)
}

async function run(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return NextResponse.json({ error: 'CRON_SECRET is not configured' }, { status: 503 })
  }
  const provided =
    request.headers.get('x-cron-key') || new URL(request.url).searchParams.get('key')
  if (provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = await createServiceClient()
  const now = Date.now()
  const results: Record<string, number | string> = {}

  // Claim a lifecycle email slot; returns true only for the first claim.
  async function claim(catererId: string, key: string): Promise<boolean> {
    const { error } = await supabase
      .from('lifecycle_emails')
      .insert({ caterer_id: catererId, email_key: key })
    return !error
  }

  // ---- 1. Trial lifecycle emails --------------------------------------
  try {
    const { data: trials } = await supabase
      .from('caterers')
      .select('id, email, business_name, trial_ends_at')
      .eq('subscription_status', 'trialling')
      .not('trial_ends_at', 'is', null)

    let sent = 0
    for (const c of trials || []) {
      const endsAt = new Date(c.trial_ends_at).getTime()
      const daysLeft = Math.ceil((endsAt - now) / DAY_MS)
      const daysIn = 14 - daysLeft

      if (daysIn >= 1 && daysIn <= 3) {
        if (await claim(c.id, 'trial-day1')) {
          await sendTrialDay1(c.email, c.business_name)
          sent++
        }
      } else if (daysIn >= 7 && daysIn <= 9) {
        if (await claim(c.id, 'trial-day7')) {
          const since = new Date(now - 7 * DAY_MS).toISOString()
          const [{ data: views }, { count: orders }] = await Promise.all([
            supabase.from('page_views').select('views').eq('caterer_id', c.id),
            supabase.from('orders').select('id', { count: 'exact', head: true }).eq('caterer_id', c.id).gte('created_at', since),
          ])
          const pageViews = (views || []).reduce((s: number, r: any) => s + (r.views || 0), 0)
          await sendTrialDay7(c.email, c.business_name, { pageViews, orders: orders || 0 })
          sent++
        }
      } else if (daysLeft >= 1 && daysLeft <= 3) {
        if (await claim(c.id, 'trial-ending')) {
          await sendTrialEnding(c.email, c.business_name, daysLeft, c.trial_ends_at)
          sent++
        }
      } else if (daysLeft <= 0 && daysLeft >= -7) {
        // within a week of lapsing (avoids mailing long-lapsed accounts on first run)
        if (await claim(c.id, 'trial-ended')) {
          await sendTrialEnded(c.email, c.business_name)
          sent++
        }
      }
    }
    results.trial_emails = sent
  } catch (err: any) {
    results.trial_emails = `error: ${err.message}`
  }

  // ---- 2. Order reminders (pending > 24h, not yet reminded) ------------
  try {
    const dayAgo = new Date(now - DAY_MS).toISOString()
    const { data: stale } = await supabase
      .from('orders')
      .select('id, caterer_id, caterers(email, business_name)')
      .eq('status', 'pending')
      .lt('created_at', dayAgo)
      .is('reminder_sent_at', null)
      .limit(100)

    let sent = 0
    for (const o of (stale || []) as any[]) {
      if (!o.caterers?.email) continue
      await sendOrderReminder(o.caterers.email, o.caterers.business_name, o.id)
      await supabase.from('orders').update({ reminder_sent_at: new Date().toISOString() }).eq('id', o.id)
      sent++
    }
    results.order_reminders = sent
  } catch (err: any) {
    results.order_reminders = `error: ${err.message}`
  }

  // ---- 3. Auto-cancel (pending > 48h) ----------------------------------
  try {
    const twoDaysAgo = new Date(now - 2 * DAY_MS).toISOString()
    const { data: expired } = await supabase
      .from('orders')
      .select('id, reference_number, customer_email, caterers(business_name)')
      .eq('status', 'pending')
      .lt('created_at', twoDaysAgo)
      .limit(100)

    let cancelled = 0
    for (const o of (expired || []) as any[]) {
      await supabase
        .from('orders')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', o.id)
        .eq('status', 'pending') // guard against races
      try {
        await sendOrderAutoCancelled(o.customer_email, {
          reference_number: o.reference_number,
          business_name: o.caterers?.business_name || 'The caterer',
        })
      } catch {}
      cancelled++
    }
    results.auto_cancelled = cancelled
  } catch (err: any) {
    results.auto_cancelled = `error: ${err.message}`
  }

  // ---- 4. Review requests (event 1–3 days ago, accepted/completed) -----
  try {
    const yesterday = new Date(now - DAY_MS).toISOString().split('T')[0]
    const threeDaysAgo = new Date(now - 3 * DAY_MS).toISOString().split('T')[0]
    const { data: done } = await supabase
      .from('orders')
      .select('id, customer_name, customer_email, caterers(business_name)')
      .in('status', ['accepted', 'completed'])
      .gte('event_date', threeDaysAgo)
      .lte('event_date', yesterday)
      .is('review_request_sent_at', null)
      .limit(100)

    let sent = 0
    for (const o of (done || []) as any[]) {
      await sendReviewRequest(
        o.customer_email,
        o.customer_name,
        o.caterers?.business_name || 'your caterer',
        o.id
      )
      await supabase.from('orders').update({ review_request_sent_at: new Date().toISOString() }).eq('id', o.id)
      sent++
    }
    results.review_requests = sent
  } catch (err: any) {
    results.review_requests = `error: ${err.message}`
  }

  // ---- 5. Monthly summaries (1st of the month) --------------------------
  try {
    const today = new Date()
    if (today.getUTCDate() === 1) {
      const monthStart = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1))
      const monthEnd = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1))
      const monthKey = `summary-${monthStart.getUTCFullYear()}-${String(monthStart.getUTCMonth() + 1).padStart(2, '0')}`
      const monthLabel = monthStart.toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })

      const { data: liveCaterers } = await supabase
        .from('caterers')
        .select('id, email, business_name')
        .in('subscription_status', ['active', 'trialling'])

      let sent = 0
      for (const c of liveCaterers || []) {
        const [{ data: orders }, { count: reviews }, { data: views }] = await Promise.all([
          supabase
            .from('orders')
            .select('total, status')
            .eq('caterer_id', c.id)
            .gte('created_at', monthStart.toISOString())
            .lt('created_at', monthEnd.toISOString()),
          supabase
            .from('reviews')
            .select('id', { count: 'exact', head: true })
            .eq('caterer_id', c.id)
            .gte('created_at', monthStart.toISOString())
            .lt('created_at', monthEnd.toISOString()),
          supabase
            .from('page_views')
            .select('views')
            .eq('caterer_id', c.id)
            .gte('date', monthStart.toISOString().split('T')[0])
            .lt('date', monthEnd.toISOString().split('T')[0]),
        ])

        const orderCount = orders?.length || 0
        const revenue = (orders || [])
          .filter((o: any) => ['accepted', 'completed'].includes(o.status))
          .reduce((s: number, o: any) => s + Number(o.total || 0), 0)
        const pageViews = (views || []).reduce((s: number, r: any) => s + (r.views || 0), 0)

        // A month of zeros isn't worth an email
        if (orderCount === 0 && pageViews === 0) continue

        if (await claim(c.id, monthKey)) {
          await sendMonthlySummary(c.email, c.business_name, {
            monthLabel,
            orders: orderCount,
            revenue,
            newReviews: reviews || 0,
            pageViews,
          })
          sent++
        }
      }
      results.monthly_summaries = sent
    } else {
      results.monthly_summaries = 'skipped (not 1st)'
    }
  } catch (err: any) {
    results.monthly_summaries = `error: ${err.message}`
  }

  return NextResponse.json({ ok: true, ...results })
}
