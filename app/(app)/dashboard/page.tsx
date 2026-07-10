import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText, Users, Package, CheckCircle2, TrendingUp, Clock, Zap,
  ArrowUpRight, Building2, Plus, Sparkles,
} from 'lucide-react'
import type { QuotationStatus, Currency } from '@/lib/types'

export const dynamic = 'force-dynamic'

const STATUS_META: Record<QuotationStatus, { label: string; class: string }> = {
  draft:    { label: 'Taslak',       class: 'bg-slate-100 text-slate-700 border-slate-200' },
  sent:     { label: 'Gönderildi',   class: 'bg-blue-100 text-blue-700 border-blue-200' },
  accepted: { label: 'Onaylandı',    class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  rejected: { label: 'Reddedildi',   class: 'bg-red-100 text-red-700 border-red-200' },
  expired:  { label: 'Süresi Doldu', class: 'bg-amber-100 text-amber-700 border-amber-200' },
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Parallel queries
  const [
    { count: quotationsTotal },
    { data: statusRows },
    { data: recentQuotes },
    { count: customersCount },
    { count: productsCount },
    { data: company },
  ] = await Promise.all([
    supabase.from('quotations').select('id', { count: 'exact', head: true }),
    supabase.from('quotations').select('status, total, currency'),
    supabase
      .from('quotations')
      .select('id, quote_number, status, total, currency, issue_date, customers(company_name), customer_snapshot')
      .order('created_at', { ascending: false })
      .limit(5),
    supabase.from('customers').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('company_settings').select('company_name, default_currency').maybeSingle(),
  ])

  const rows = statusRows ?? []
  const draftCount    = rows.filter((r) => r.status === 'draft').length
  const acceptedCount = rows.filter((r) => r.status === 'accepted').length
  const sentCount     = rows.filter((r) => r.status === 'sent').length
  const conversionRate = rows.length > 0 ? Math.round((acceptedCount / rows.length) * 100) : 0

  const defaultCurrency = (company?.default_currency ?? 'TRY') as Currency
  // Sum totals in default currency (best-effort — mixed currency support is out of MVP)
  const totalRevenue = rows
    .filter((r) => (r.currency as Currency) === defaultCurrency)
    .reduce((s, r) => s + Number(r.total || 0), 0)
  const avgQuote = rows.length > 0
    ? rows.reduce((s, r) => s + Number(r.total || 0), 0) / rows.length
    : 0

  const displayName = (company?.company_name || user?.email?.split('@')[0] || 'Kullanıcı').toString()

  const stats = [
    { title: 'Toplam Teklif',     value: String(quotationsTotal ?? 0), icon: FileText,     color: 'text-blue-600',    bg: 'bg-blue-50',    href: '/teklifler',  hint: `${draftCount} taslak` },
    { title: 'Müşteriler',        value: String(customersCount ?? 0),  icon: Users,        color: 'text-emerald-600', bg: 'bg-emerald-50', href: '/musteriler', hint: 'Aktif kayıt' },
    { title: 'Ürünler',            value: String(productsCount ?? 0),   icon: Package,      color: 'text-violet-600',  bg: 'bg-violet-50',  href: '/urunler',    hint: 'Katalog' },
    { title: `Toplam ${defaultCurrency} Ciro`, value: fmt(totalRevenue, defaultCurrency, true), icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50', href: '/teklifler', hint: `%${conversionRate} dönüşüm` },
  ]

  const isEmpty = (quotationsTotal ?? 0) === 0 && (customersCount ?? 0) === 0 && (productsCount ?? 0) === 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span>Kontrol Paneli</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Merhaba, <span className="truncate">{displayName}</span> 👋</h1>
          <p className="mt-1 text-muted-foreground">İşletmenizin genel görünümü — tekliflerinizi ve müşterilerinizi takip edin.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/teklifler" className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
            <FileText className="h-4 w-4" />
            Yeni Teklif
          </Link>
        </div>
      </div>

      {/* Empty state onboarding */}
      {isEmpty && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold">TeklifPro&apos;ya hoş geldiniz</h2>
                <p className="text-sm text-muted-foreground mt-1">Başlamak için şunları yapın:</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <OnboardStep n={1} label="Firma bilgilerinizi tamamlayın" href="/ayarlar" />
                  <OnboardStep n={2} label="İlk müşterinizi ekleyin"       href="/musteriler" />
                  <OnboardStep n={3} label="Ürün kataloğunuzu oluşturun"  href="/urunler" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.title} href={s.href} className="group">
            <Card className="relative overflow-hidden border-border/60 group-hover:border-primary/30 group-hover:shadow-md group-hover:shadow-primary/5 transition-all cursor-pointer h-full">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className={`h-11 w-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground font-medium">{s.title}</p>
                  <p className="mt-1 text-3xl font-bold tracking-tight">{s.value}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Recent quotes + Quick stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">Son Teklifler</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">En son oluşturduğunuz 5 teklif</p>
            </div>
            <Link href="/teklifler" className="text-sm font-medium text-primary hover:underline">Tümünü gör →</Link>
          </CardHeader>
          <CardContent className="p-0">
            {(recentQuotes?.length ?? 0) === 0 ? (
              <div className="py-16 text-center text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p>Henüz teklif oluşturulmadı</p>
                <Link href="/teklifler" className="mt-2 inline-block text-sm text-primary hover:underline">İlk teklifi oluştur →</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/40 border-y border-border/60">
                    <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                      <th className="text-left font-medium px-6 py-3">Teklif No</th>
                      <th className="text-left font-medium px-6 py-3">Müşteri</th>
                      <th className="text-right font-medium px-6 py-3">Tutar</th>
                      <th className="text-center font-medium px-6 py-3">Durum</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {(recentQuotes ?? []).map((q: any) => {
                      const meta = STATUS_META[q.status as QuotationStatus]
                      const cust = q.customers?.company_name ?? q.customer_snapshot?.company_name ?? '—'
                      return (
                        <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4">
                            <Link href={`/teklifler/${q.id}`} className="text-sm font-mono font-medium text-primary hover:underline">{q.quote_number}</Link>
                          </td>
                          <td className="px-6 py-4 text-sm">{cust}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-right tabular-nums">{fmt(Number(q.total), q.currency as Currency)}</td>
                          <td className="px-6 py-4 text-center">
                            <Badge variant="outline" className={meta.class}>{meta.label}</Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Hızlı Özet</CardTitle>
            <p className="text-sm text-muted-foreground">Genel durum</p>
          </CardHeader>
          <CardContent className="space-y-1 divide-y divide-border/60">
            <StatRow icon={Clock}       label="Taslak Teklif"    value={draftCount}      color="text-slate-600" />
            <StatRow icon={FileText}    label="Gönderilen"        value={sentCount}       color="text-blue-600" />
            <StatRow icon={CheckCircle2} label="Onaylanan"         value={acceptedCount}   color="text-emerald-600" />
            <StatRow icon={TrendingUp}  label="Ortalama Teklif"   value={fmt(avgQuote, defaultCurrency)} color="text-violet-600" isText />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function OnboardStep({ n, label, href }: { n: number; label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl border border-border/60 bg-white/80 backdrop-blur p-3 hover:border-primary/40 hover:shadow-sm transition-all group">
      <div className="h-7 w-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">{n}</div>
      <span className="text-sm font-medium flex-1">{label}</span>
      <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  )
}

function StatRow({ icon: Icon, label, value, color, isText }: any) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div className={`h-9 w-9 rounded-lg bg-muted flex items-center justify-center ${color}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className={`text-lg font-bold tabular-nums ${isText ? '' : color}`}>{value}</div>
      </div>
    </div>
  )
}

function fmt(v: number, currency: Currency, compact?: boolean) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: compact ? 0 : 2,
    maximumFractionDigits: compact ? 0 : 2,
    notation: compact && v >= 100000 ? 'compact' : 'standard',
  }).format(v || 0)
}
