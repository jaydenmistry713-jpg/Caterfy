import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { isAdminAuthenticated } from '@/lib/admin/auth'
import { validateSlug } from '@/lib/utils'

// Admin caterer management. All actions are guarded by the admin cookie and run
// with the service role. Kept to reversible, non-destructive operations
// (edit details, suspend/reactivate, extend trial, toggle order acceptance).
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const supabase = await createServiceClient()

  const update: Record<string, any> = {}

  // High-level lifecycle actions
  switch (body.action) {
    case 'suspend':
      // Takes the public site offline via the same isLive() check the site uses.
      update.subscription_status = 'cancelled'
      break
    case 'activate':
      update.subscription_status = 'active'
      break
    case 'reactivate_trial': {
      const ends = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      update.subscription_status = 'trialling'
      update.trial_ends_at = ends.toISOString()
      break
    }
    case 'extend_trial': {
      // Extend from the later of now or the current trial end, by N days (default 14).
      const days = Number(body.days) > 0 ? Number(body.days) : 14
      const { data: current } = await supabase
        .from('caterers').select('trial_ends_at').eq('id', id).single()
      const base = current?.trial_ends_at && new Date(current.trial_ends_at) > new Date()
        ? new Date(current.trial_ends_at)
        : new Date()
      base.setDate(base.getDate() + days)
      update.trial_ends_at = base.toISOString()
      if (body.setTrialling) update.subscription_status = 'trialling'
      break
    }
    case 'toggle_orders':
      update.is_accepting_orders = !!body.value
      break
    case undefined:
    case null:
      break
    default:
      return NextResponse.json({ error: `Unknown action: ${body.action}` }, { status: 400 })
  }

  // Field edits (only an explicit allowlist can be changed)
  const fields = body.fields || {}
  if (typeof fields.business_name === 'string' && fields.business_name.trim()) {
    update.business_name = fields.business_name.trim()
  }
  if (typeof fields.email === 'string' && fields.email.trim()) {
    update.email = fields.email.trim().toLowerCase()
  }
  if (typeof fields.phone === 'string') {
    update.phone = fields.phone.trim() || null
  }
  if (typeof fields.slug === 'string' && fields.slug.trim()) {
    const slug = fields.slug.trim().toLowerCase()
    const err = validateSlug(slug)
    if (err) return NextResponse.json({ error: err }, { status: 400 })
    // Reject a slug already taken by another caterer.
    const { data: clash } = await supabase
      .from('caterers').select('id').eq('slug', slug).neq('id', id).maybeSingle()
    if (clash) return NextResponse.json({ error: 'That URL is already taken by another caterer' }, { status: 400 })
    update.slug = slug
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('caterers').update(update).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ ok: true, caterer: data })
}
