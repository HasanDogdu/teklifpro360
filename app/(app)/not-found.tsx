import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion, Home } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
        <FileQuestion className="h-8 w-8 text-muted-foreground" />
      </div>
      <h1 className="text-2xl font-bold">Sayfa bulunamadı</h1>
      <p className="mt-2 text-muted-foreground max-w-md">
        Aradığınız sayfa mevcut değil veya bu kayda erişim yetkiniz yok.
      </p>
      <Button asChild className="mt-6 gap-2">
        <Link href="/dashboard"><Home className="h-4 w-4" />Panele Dön</Link>
      </Button>
    </div>
  )
}
