import Link from 'next/link'
import { Zap, WifiOff } from 'lucide-react'

export const metadata = {
  title: 'Çevrimdışı — TeklifPro',
  robots: 'noindex',
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex items-center gap-2.5 mb-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary">
          <Zap className="h-6 w-6 text-primary-foreground" />
        </div>
        <span className="text-xl font-bold tracking-tight">TeklifPro</span>
      </div>
      <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center border border-border shadow-sm mb-4">
        <WifiOff className="h-7 w-7 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold text-center">İnternet bağlantınız yok</h1>
      <p className="mt-2 text-muted-foreground text-center max-w-sm">
        Şu an çevrimdışısınız. İnternete bağlandığınızda TeklifPro&apos;yu tekrar kullanmaya devam edebilirsiniz.
      </p>
      <Link href="/dashboard" className="mt-6 inline-flex h-10 items-center rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
        Yeniden Dene
      </Link>
    </div>
  )
}
