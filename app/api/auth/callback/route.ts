import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendWelcomeEmail } from '@/lib/resend/emails'
import { slugify } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      const user = data.user
      const businessName = user.user_metadata?.business_name || 'My Catering Business'
      const slug = user.user_metadata?.slug || slugify(businessName)

      // Create caterer record if it doesn't exist
      const { data: existing } = await supabase.from('caterers').select('id').eq('id', user.id).single()

      if (!existing) {
        // Generate unique slug
        let finalSlug = slug
        let attempts = 0
        while (attempts < 10) {
          const { data: slugExists } = await supabase.from('caterers').select('id').eq('slug', finalSlug).single()
          if (!slugExists) break
          finalSlug = `${slug}-${attempts + 1}`
          attempts++
        }

        await supabase.from('caterers').insert({
          id: user.id,
          email: user.email!,
          business_name: businessName,
          slug: finalSlug,
          subscription_status: 'trialling',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          is_accepting_orders: false,
          auto_accept_orders: false,
          show_contact_publicly: true,
        })

        // Create default caterer_pages record
        await supabase.from('caterer_pages').insert({
          caterer_id: user.id,
          template: 'classic',
        })

        // Send welcome email
        try {
          await sendWelcomeEmail(user.email!, businessName)
        } catch (emailErr) {
          console.error('Welcome email failed:', emailErr)
        }
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`)
}
