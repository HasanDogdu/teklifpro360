'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Users,
  Package,
  FileText,
  Settings,
  Zap,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Müşteriler', href: '/musteriler', icon: Users },
  { label: 'Ürünler', href: '/urunler', icon: Package },
  { label: 'Teklifler', href: '/teklifler', icon: FileText },
  { label: 'Ayarlar', href: '/ayarlar', icon: Settings },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <Zap className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold tracking-tight text-sidebar-foreground">TeklifPro</span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Elektrik Teklif</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Menü</p>
        {NAV_ITEMS.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground'
              )}
            >
              <Icon className={cn('h-[18px] w-[18px] transition-colors', active ? 'text-primary' : 'text-muted-foreground group-hover:text-primary')} />
              {label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer card */}
      <div className="p-3">
        <div className="rounded-xl border border-sidebar-border bg-gradient-to-br from-blue-50 to-white p-4">
          <div className="text-xs font-semibold text-primary">Pro Paket</div>
          <p className="mt-1 text-xs text-muted-foreground">Gelişmiş özellikleri keşfedin.</p>
          <button className="mt-3 w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Yükselt
          </button>
        </div>
      </div>
    </aside>
  )
}
