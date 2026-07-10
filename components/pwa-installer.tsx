'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, X } from 'lucide-react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const STORAGE_KEY = 'teklifpro:install-dismissed'

export function PwaInstaller() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Register service worker in production only
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const isProd = process.env.NODE_ENV === 'production'
      if (isProd) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').catch(() => {})
        })
      }
    }

    const dismissed = typeof window !== 'undefined' && localStorage.getItem(STORAGE_KEY)
    if (dismissed) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    window.addEventListener('beforeinstallprompt', handler as any)

    // Hide if already installed (display-mode: standalone)
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setVisible(false)
    }

    return () => window.removeEventListener('beforeinstallprompt', handler as any)
  }, [])

  async function handleInstall() {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setVisible(false)
    setDeferred(null)
  }

  function handleDismiss() {
    setVisible(false)
    try { localStorage.setItem(STORAGE_KEY, '1') } catch {}
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border border-border bg-background shadow-lg shadow-primary/10 p-4 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center shrink-0">
          <Download className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm">TeklifPro&apos;yu yükle</div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Hızlı erişim için uygulamayı cihazınıza ekleyin.
          </p>
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" onClick={handleInstall} className="h-8">Yükle</Button>
            <Button size="sm" variant="ghost" onClick={handleDismiss} className="h-8">Daha sonra</Button>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-muted-foreground hover:text-foreground p-1" aria-label="Kapat">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
