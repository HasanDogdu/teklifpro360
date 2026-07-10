'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('App error:', error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-16 w-16 rounded-2xl bg-destructive/10 flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <h1 className="text-2xl font-bold">Bir hata oluştu</h1>
      <p className="mt-2 text-muted-foreground max-w-md">
        Bu sayfa yüklenirken beklenmedik bir sorun yaşandı. Lütfen tekrar deneyin.
      </p>
      {error?.digest && (
        <p className="mt-2 text-xs text-muted-foreground font-mono">Hata kodu: {error.digest}</p>
      )}
      <div className="mt-6 flex gap-2">
        <Button onClick={() => reset()} variant="default" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Yeniden Dene
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href="/dashboard"><Home className="h-4 w-4" />Panele Dön</Link>
        </Button>
      </div>
    </div>
  )
}
