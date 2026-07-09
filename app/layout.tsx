import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'TeklifPro — Elektrik Müteahhitleri için Teklif Yönetimi',
  description: 'Elektrik müteahhitleri ve firmaları için profesyonel teklif hazırlama ve yönetim platformu.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
