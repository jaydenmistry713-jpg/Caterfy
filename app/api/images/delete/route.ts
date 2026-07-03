import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { CATERER_BUCKET, objectPathFromPublicUrl } from '@/lib/supabase/storage'

// Removes images from the caterer-images bucket via the Storage API (service
// role — direct SQL deletes from storage.objects are blocked by a trigger).
// A caterer can only delete their own objects: hero/{id}.*, logos/{id}.*,
// gallery/{id}/*.
export async function POST(request: NextRequest) {
  try {
    const { urls } = await request.json()
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })

    const paths = Array.from(
      new Set(
        (urls as string[])
          .map((u) => objectPathFromPublicUrl(u))
          .filter((p): p is string => Boolean(p))
      )
    ).filter(
      (p) =>
        p.startsWith(`gallery/${user.id}/`) ||
        p.startsWith(`hero/${user.id}.`) ||
        p.startsWith(`logos/${user.id}.`)
    )

    if (paths.length === 0) return NextResponse.json({ removed: 0 })

    const service = await createServiceClient()
    const { error } = await service.storage.from(CATERER_BUCKET).remove(paths)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ removed: paths.length })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Failed to delete images' }, { status: 500 })
  }
}
