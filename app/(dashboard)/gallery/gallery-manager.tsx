'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { GalleryImage } from '@/types'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { deleteStoredImages } from '@/lib/supabase/storage'
import { toast } from '@/lib/utils/use-toast'
import { Upload, Trash2, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  caterererId: string
  initialImages: GalleryImage[]
}

const MAX_IMAGES = 20
const MIN_IMAGES = 3

export default function GalleryManager({ caterererId, initialImages }: Props) {
  const [images, setImages] = useState(initialImages)
  const [uploading, setUploading] = useState(false)
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  // Reorder images and persist the new sort_order to the DB (used by drag-drop and the move buttons)
  async function reorder(from: number, to: number) {
    if (to < 0 || to >= images.length || from === to) return
    const next = [...images]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setImages(next)
    const supabase = createClient()
    await Promise.all(
      next.map((img, i) => supabase.from('gallery_images').update({ sort_order: i }).eq('id', img.id))
    )
  }

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
    // Also remove the underlying file from storage so it isn't orphaned
    deleteStoredImages([image.image_url])
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
        <>
        <p className="text-xs text-gray-400 mb-3">Drag photos to reorder, or use the arrows on each photo. The order here is the order shown on your public page.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div
              key={image.id}
              className={`group relative ${dragIndex === index ? 'opacity-50' : ''}`}
              draggable
              onDragStart={() => setDragIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => { if (dragIndex !== null) reorder(dragIndex, index); setDragIndex(null) }}
              onDragEnd={() => setDragIndex(null)}
            >
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-move">
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
                {/* Move buttons — work on touch devices where drag is awkward */}
                <div className="absolute bottom-2 inset-x-2 flex justify-between">
                  <button
                    onClick={() => reorder(index, index - 1)}
                    disabled={index === 0}
                    className="bg-black/60 text-white rounded-full p-1 disabled:opacity-0"
                    aria-label="Move earlier"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => reorder(index, index + 1)}
                    disabled={index === images.length - 1}
                    className="bg-black/60 text-white rounded-full p-1 disabled:opacity-0"
                    aria-label="Move later"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
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
        </>
      )}
    </div>
  )
}
