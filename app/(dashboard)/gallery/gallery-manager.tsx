'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { GalleryImage } from '@/types'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/lib/utils/use-toast'
import { Upload, Trash2, ImageIcon } from 'lucide-react'

interface Props {
  caterererId: string
  initialImages: GalleryImage[]
}

const MAX_IMAGES = 20
const MIN_IMAGES = 3

export default function GalleryManager({ caterererId, initialImages }: Props) {
  const [images, setImages] = useState(initialImages)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return

    const remaining = MAX_IMAGES - images.length
    if (remaining <= 0) {
      toast({ title: `Maximum ${MAX_IMAGES} images allowed`, variant: 'destructive' })
      return
    }

    const toUpload = files.slice(0, remaining)
    setUploading(true)
    const supabase = createClient()

    for (const file of toUpload) {
      if (file.size > 5 * 1024 * 1024) {
        toast({ title: `${file.name} is too large (max 5MB)`, variant: 'destructive' })
        continue
      }

      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `gallery/${caterererId}/${Date.now()}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('caterer-images')
        .upload(path, file, { upsert: false })

      if (uploadError) {
        toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' })
        continue
      }

      const { data: { publicUrl } } = supabase.storage
        .from('caterer-images')
        .getPublicUrl(path)

      const { data: img, error: dbError } = await supabase
        .from('gallery_images')
        .insert({
          caterer_id: caterererId,
          image_url: publicUrl,
          sort_order: images.length,
        })
        .select()
        .single()

      if (!dbError && img) {
        setImages((prev) => [...prev, img])
      }
    }

    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
    toast({ title: 'Photos uploaded!', variant: 'success' })
  }

  async function deleteImage(image: GalleryImage) {
    if (images.length <= MIN_IMAGES) {
      toast({ title: `You need at least ${MIN_IMAGES} photos`, variant: 'destructive' })
      return
    }

    const supabase = createClient()
    await supabase.from('gallery_images').delete().eq('id', image.id)
    setImages((prev) => prev.filter((i) => i.id !== image.id))
    toast({ title: 'Photo deleted' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {images.length}/{MAX_IMAGES} photos · {images.length < MIN_IMAGES && (
            <span className="text-orange-500">Add {MIN_IMAGES - images.length} more to meet the minimum</span>
          )}
        </p>
        {images.length < MAX_IMAGES && (
          <>
            <Button onClick={() => fileRef.current?.click()} disabled={uploading}>
              <Upload className="h-4 w-4 mr-2" />
              {uploading ? 'Uploading...' : 'Upload Photos'}
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
          </>
        )}
      </div>

      {images.length === 0 ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-gray-400 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Upload your first photos</p>
          <p className="text-sm text-gray-400 mt-1">JPG, PNG, WebP up to 5MB each</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div key={image.id} className="group relative">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                <Image
                  src={image.image_url}
                  alt={image.caption || 'Gallery photo'}
                  fill
                  className="object-cover"
                />
                <button
                  onClick={() => deleteImage(image)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}

          {images.length < MAX_IMAGES && (
            <div
              className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="h-8 w-8 text-gray-400" />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
