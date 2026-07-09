'use client'

import { useRef, useState, useTransition } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { removeLogo } from '@/app/actions/company'
import { Upload, Trash2, ImageIcon, Loader2, Building2 } from 'lucide-react'

type Props = {
  currentUrl: string | null
  companyName: string
  onChange: (url: string | null) => void
}

const MAX_MB = 5
const ACCEPTED = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/svg+xml']

export function LogoUploader({ currentUrl, companyName, onChange }: Props) {
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function upload(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      toast.error('Desteklenmeyen dosya türü', { description: 'PNG, JPG, WEBP veya SVG yükleyin.' })
      return
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error('Dosya çok büyük', { description: `Maksimum ${MAX_MB} MB.` })
      return
    }

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Oturum bulunamadı')
        return
      }
      const ext = file.name.split('.').pop() || 'png'
      const path = `${user.id}/logo-${Date.now()}.${ext}`

      const { error } = await supabase.storage
        .from('company-logos')
        .upload(path, file, { upsert: true, cacheControl: '3600', contentType: file.type })

      if (error) {
        toast.error('Yükleme başarısız', { description: error.message })
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('company-logos').getPublicUrl(path)
      onChange(publicUrl)
      toast.success('Logo yüklendi', { description: 'Kaydetmeyi unutmayın.' })
    } finally {
      setUploading(false)
    }
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) upload(f)
    e.target.value = ''
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) upload(f)
  }

  function handleRemove() {
    startTransition(async () => {
      const res = await removeLogo()
      if (res.ok) {
        onChange(null)
        toast.success('Logo kaldırıldı')
      } else {
        toast.error('Silme başarısız', { description: res.error })
      }
    })
  }

  const initials = (companyName || 'F').substring(0, 2).toUpperCase()

  return (
    <div className="flex flex-col sm:flex-row items-start gap-6">
      {/* Preview */}
      <div className="shrink-0">
        <div className="relative h-28 w-28 rounded-2xl border-2 border-border bg-muted/40 overflow-hidden flex items-center justify-center">
          {currentUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={currentUrl} alt="Firma logosu" className="h-full w-full object-contain p-2" />
          ) : (
            <div className="flex flex-col items-center gap-1 text-muted-foreground">
              <Building2 className="h-8 w-8 opacity-40" />
              <span className="text-lg font-bold">{initials}</span>
            </div>
          )}
        </div>
      </div>

      {/* Uploader */}
      <div className="flex-1 w-full">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 hover:bg-muted/30'}`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED.join(',')}
            onChange={onFile}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              {uploading ? (
                <Loader2 className="h-5 w-5 text-primary animate-spin" />
              ) : (
                <Upload className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="text-sm">
              {uploading ? (
                <span className="font-medium">Yükleniyor...</span>
              ) : (
                <>
                  <span className="font-medium text-primary">Dosya seçin</span> veya buraya sürükleyin
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">PNG, JPG, WEBP veya SVG — en fazla {MAX_MB} MB</p>
          </div>
        </div>

        {currentUrl && (
          <div className="mt-3 flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              disabled={uploading || isPending}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Değiştir
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={uploading || isPending}
              className="text-destructive hover:text-destructive hover:bg-destructive/5 border-destructive/20"
            >
              {isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Trash2 className="mr-1.5 h-3.5 w-3.5" />}
              Kaldır
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
