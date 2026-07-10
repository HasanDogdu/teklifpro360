import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { PwaInstaller } from '@/components/pwa-installer'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://quote-manager-97.preview.emergentagent.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'TeklifPro — Elektrik Müteahhitleri için Teklif Yönetimi',
    template: '%s — TeklifPro',
  },
  description: 'Elektrik müteahhitleri ve firmaları için profesyonel teklif hazırlama, müşteri yönetimi ve PDF çıktı platformu. Saniyeler içinde profesyonel teklifler hazırlayın.',
  keywords: [
    'teklif yönetimi', 'elektrik teklif', 'proforma fatura', 'elektrik müteahhit',
    'teklif hazırlama', 'quotation', 'saas', 'türkçe teklif yazılımı',
    'elektrik firması', 'pdf teklif', 'kdv hesaplama',
  ],
  authors: [{ name: 'TeklifPro' }],
  creator: 'TeklifPro',
  publisher: 'TeklifPro',
  applicationName: 'TeklifPro',
  category: 'business',
  formatDetection: { email: false, address: false, telephone: false },

  manifest: '/manifest.webmanifest',

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },

  appleWebApp: {
    capable: true,
    title: 'TeklifPro',
    statusBarStyle: 'default',
    startupImage: [{ url: '/apple-touch-icon.png' }],
  },

  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: BASE_URL,
    siteName: 'TeklifPro',
    title: 'TeklifPro — Elektrik Müteahhitleri için Teklif Yönetimi',
    description: 'Profesyonel teklifler hazırlayın, müşterilerinizi yönetin, PDF olarak anında paylaşın.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'TeklifPro' }],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'TeklifPro — Elektrik Teklif Yönetimi',
    description: 'Profesyonel teklifler hazırlayın, müşterilerinizi yönetin, PDF olarak anında paylaşın.',
    images: ['/og-image.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },

  alternates: { canonical: BASE_URL },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#2563eb' },
    { media: '(prefers-color-scheme: dark)',  color: '#1e40af' },
  ],
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
        <Toaster position="top-right" richColors />
        <PwaInstaller />
      </body>
    </html>
  )
}
