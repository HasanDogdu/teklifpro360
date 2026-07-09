import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Users,
  CheckCircle2,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from 'lucide-react'

type Stat = {
  title: string
  value: string
  delta: string
  trend: 'up' | 'down'
  icon: any
  color: string
  bg: string
  hint: string
}

const STATS: Stat[] = [
  {
    title: 'Toplam Teklif',
    value: '147',
    delta: '+12.5%',
    trend: 'up',
    icon: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    hint: 'Bu ay',
  },
  {
    title: 'Bekleyen Teklifler',
    value: '23',
    delta: '+3',
    trend: 'up',
    icon: Clock,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    hint: 'Onay bekliyor',
  },
  {
    title: 'Onaylanan Teklifler',
    value: '89',
    delta: '+8.2%',
    trend: 'up',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    hint: 'Bu ay',
  },
  {
    title: 'Toplam Ciro',
    value: '₺1.247.500',
    delta: '-2.4%',
    trend: 'down',
    icon: TrendingUp,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    hint: 'Son 30 gün',
  },
]

const RECENT_QUOTES = [
  { id: 'TKL-2025-001', customer: 'Aksoy İnşaat A.Ş.', project: 'Villa Elektrik Tesisatı', amount: '₺124.500', status: 'Onaylandı', statusColor: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { id: 'TKL-2025-002', customer: 'Yılmaz Yapı Ltd.', project: 'Ofis Aydınlatma Sistemi', amount: '₺48.200', status: 'Beklemede', statusColor: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'TKL-2025-003', customer: 'Deniz Emlak', project: '3 Katlı Bina Tesisatı', amount: '₺215.800', status: 'İnceleniyor', statusColor: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'TKL-2025-004', customer: 'Mavi AVM', project: 'Panel Bakım & Onarım', amount: '₺32.900', status: 'Reddedildi', statusColor: 'bg-red-100 text-red-700 border-red-200' },
  { id: 'TKL-2025-005', customer: 'Güneş Endüstri', project: 'Fabrika Otomasyonu', amount: '₺487.300', status: 'Onaylandı', statusColor: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
]

const UPCOMING = [
  { title: 'Aksoy İnşaat toplantısı', date: 'Bugün, 14:30', color: 'bg-blue-500' },
  { title: 'Villa keşif ziyareti', date: 'Yarın, 10:00', color: 'bg-emerald-500' },
  { title: 'Yılmaz Yapı teklif revizyonu', date: '12 Haz, 09:00', color: 'bg-amber-500' },
  { title: 'Panel bakım servisi', date: '14 Haz, 15:00', color: 'bg-violet-500' },
]

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const displayName = user?.email?.split('@')[0] || 'Kullanıcı'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span>Kontrol Paneli</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Merhaba, <span className="capitalize">{displayName}</span> 👋</h1>
          <p className="mt-1 text-muted-foreground">İşletmenizin genel görünümü — tekliflerinizi ve müşterilerinizi takip edin.</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex h-10 items-center gap-2 rounded-lg border border-input bg-background px-4 text-sm font-medium hover:bg-accent transition-colors">
            Rapor İndir
          </button>
          <button className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm shadow-primary/20">
            <FileText className="h-4 w-4" />
            Yeni Teklif
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((s) => (
          <Card key={s.title} className="relative overflow-hidden border-border/60 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className={`h-11 w-11 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-semibold ${s.trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {s.trend === 'up' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {s.delta}
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground font-medium">{s.title}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight">{s.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.hint}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent quotes + upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-border/60">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-lg">Son Teklifler</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">En son oluşturduğunuz teklifler</p>
            </div>
            <a href="/teklifler" className="text-sm font-medium text-primary hover:underline">Tümünü gör →</a>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/40 border-y border-border/60">
                  <tr className="text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left font-medium px-6 py-3">Teklif No</th>
                    <th className="text-left font-medium px-6 py-3">Müşteri</th>
                    <th className="text-left font-medium px-6 py-3 hidden md:table-cell">Proje</th>
                    <th className="text-right font-medium px-6 py-3">Tutar</th>
                    <th className="text-center font-medium px-6 py-3">Durum</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {RECENT_QUOTES.map((q) => (
                    <tr key={q.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-mono font-medium text-primary">{q.id}</td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium">{q.customer}</div>
                        <div className="text-xs text-muted-foreground md:hidden">{q.project}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">{q.project}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-right">{q.amount}</td>
                      <td className="px-6 py-4 text-center">
                        <Badge variant="outline" className={q.statusColor}>{q.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Yaklaşan Aktiviteler</CardTitle>
            <p className="text-sm text-muted-foreground">Bu haftaki randevularınız</p>
          </CardHeader>
          <CardContent className="space-y-4">
            {UPCOMING.map((u, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-4 last:pb-0 border-b last:border-0 border-border/60">
                <div className={`mt-1.5 h-2 w-2 rounded-full ${u.color} shrink-0`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{u.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{u.date}</div>
                </div>
              </div>
            ))}
            <button className="w-full mt-2 h-9 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors">
              + Aktivite Ekle
            </button>
          </CardContent>
        </Card>
      </div>

      {/* Quick stats */}
      <Card className="border-border/60 bg-gradient-to-br from-blue-50/50 via-white to-white">
        <CardContent className="p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
              <Users className="h-3.5 w-3.5" /> Aktif Müşteri
            </div>
            <div className="text-2xl font-bold">42</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
              <FileText className="h-3.5 w-3.5" /> Kayıtlı Ürün
            </div>
            <div className="text-2xl font-bold">318</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
              <CheckCircle2 className="h-3.5 w-3.5" /> Dönüşüm Oranı
            </div>
            <div className="text-2xl font-bold">%68</div>
          </div>
          <div>
            <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wider mb-2">
              <TrendingUp className="h-3.5 w-3.5" /> Ort. Teklif Değeri
            </div>
            <div className="text-2xl font-bold">₺52.8K</div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
