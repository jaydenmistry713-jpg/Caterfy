import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resend, FROM_EMAIL } from '@/lib/resend'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://caterfy.com'

function base(content: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;">
    <div style="text-align:center;margin-bottom:30px;"><h1 style="color:#1a1a1a;font-size:28px;margin:0;">Caterfy</h1></div>
    ${content}
    <hr style="border:none;border-top:1px solid #eee;margin:30px 0;"/>
    <p style="color:#999;font-size:12px;text-align:center;">
      Caterfy · <a href="${APP_URL}/terms" style="color:#999;">Terms</a> · <a href="${APP_URL}/privacy" style="color:#999;">Privacy</a>
    </p>
  </div>`
}

export async function POST(req: NextRequest) {
  try {
    const { caterer_id, sender_name, sender_email, message } = await req.json()

    if (!caterer_id || !sender_name || !sender_email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: caterer } = await supabase
      .from('caterers')
      .select('email, business_name, slug')
      .eq('id', caterer_id)
      .single()

    if (!caterer) return NextResponse.json({ error: 'Caterer not found' }, { status: 404 })

    await Promise.all([
      // Notify the caterer
      resend.emails.send({
        from: FROM_EMAIL,
        to: caterer.email,
        replyTo: sender_email,
        subject: `New message from ${sender_name}`,
        html: base(`
          <h2>You have a new message</h2>
          <p>Someone has sent you a message via your Caterfy page.</p>
          <table style="width:100%;border-collapse:collapse;margin:20px 0;">
            <tr><td style="padding:8px;color:#666;width:120px;">From</td><td style="padding:8px;font-weight:bold;">${sender_name}</td></tr>
            <tr style="background:#f9f9f9;"><td style="padding:8px;color:#666;">Email</td><td style="padding:8px;"><a href="mailto:${sender_email}">${sender_email}</a></td></tr>
          </table>
          <div style="background:#f5f5f5;border-left:3px solid #1a1a1a;padding:16px 20px;border-radius:4px;margin:20px 0;">
            <p style="margin:0;white-space:pre-wrap;line-height:1.7;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </div>
          <p style="color:#666;font-size:14px;">Hit reply to respond directly to ${sender_name}.</p>
        `),
      }),

      // Auto-reply to sender
      resend.emails.send({
        from: FROM_EMAIL,
        to: sender_email,
        subject: `Your message to ${caterer.business_name}`,
        html: base(`
          <h2>Message received</h2>
          <p>Hi ${sender_name}, your message has been sent to <strong>${caterer.business_name}</strong>. They'll be in touch soon.</p>
          <div style="background:#f5f5f5;border-left:3px solid #1a1a1a;padding:16px 20px;border-radius:4px;margin:20px 0;">
            <p style="margin:0;font-style:italic;color:#555;white-space:pre-wrap;line-height:1.7;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
          </div>
          ${caterer.slug ? `<div style="text-align:center;margin:30px 0;"><a href="${APP_URL}/${caterer.slug}" style="background:#1a1a1a;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">View their site</a></div>` : ''}
        `),
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
