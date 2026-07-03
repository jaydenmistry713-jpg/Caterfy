// Helpers for managing objects in the public `caterer-images` bucket.
// Direct DELETEs from storage.objects are blocked by Supabase's protect_delete
// trigger, so files must be removed via the Storage API. Deletion is done
// server-side with the service role (see app/api/images/delete/route.ts).

export const CATERER_BUCKET = 'caterer-images'

/**
 * Turn a public storage URL into its object path within the bucket.
 * e.g. https://x.supabase.co/storage/v1/object/public/caterer-images/logos/ID.png
 *   -> "logos/ID.png". Returns null if the URL isn't a caterer-images object.
 */
export function objectPathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const marker = `/${CATERER_BUCKET}/`
  const i = url.indexOf(marker)
  if (i === -1) return null
  let path = url.slice(i + marker.length)
  const q = path.indexOf('?')
  if (q !== -1) path = path.slice(0, q)
  try {
    path = decodeURIComponent(path)
  } catch {}
  return path || null
}

/**
 * Ask the server to delete stored images by their public URL. Best-effort:
 * the server verifies each object belongs to the signed-in caterer before
 * removing it. Safe to call fire-and-forget.
 */
export async function deleteStoredImages(urls: (string | null | undefined)[]): Promise<void> {
  const list = urls.filter(Boolean) as string[]
  if (list.length === 0) return
  try {
    await fetch('/api/images/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ urls: list }),
    })
  } catch {
    // best-effort; an orphaned file is harmless and can be cleaned later
  }
}
