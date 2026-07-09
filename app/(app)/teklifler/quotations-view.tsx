'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { QuotationWithCustomer, Customer, QuotationStatus } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  FileText, Plus, Search, MoreHorizontal, Trash2, AlertCircle,
  Calendar, Building2, Clock, CheckCircle2, XCircle, TimerOff, Send,
} from 'lucide-react'
import { QuotationDraftDialog } from './quotation-draft-dialog'
import { deleteQuotation } from '@/app/actions/quotations'

type Props = {
  quotations: QuotationWithCustomer[]
  customers: Customer[]
  setupError: string | null
  loadError: string | null
}

const STATUS_META: Record<QuotationStatus, { label: string; class: string; icon: any }> = {
  draft:    { label: 'Taslak',     class: 'bg-slate-100 text-slate-700 border-slate-200',       icon: Clock },
  sent:     { label: 'Gönderildi', class: 'bg-blue-100 text-blue-700 border-blue-200',           icon: Send },
  accepted: { label: 'Onaylandı',  class: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Reddedildi', class: 'bg-red-100 text-red-700 border-red-200',              icon: XCircle },
  expired:  { label: 'Süresi Doldu', class: 'bg-amber-100 text-amber-700 border-amber-200',       icon: TimerOff },
}

export function QuotationsView({ quotations, customers, setupError, loadError }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<QuotationWithCustomer | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return quotations
    return quotations.filter((r) =>
      [r.quote_number, r.customers?.company_name, r.customers?.contact_name]
        .some((v) => v?.toLowerCase().includes(q))
    )
  }, [quotations, query])

  const noCustomers = customers.length === 0

  function handleAdd() {
    if (noCustomers) {
      toast.error('Önce müşteri eklemelisiniz', { description: 'Teklif oluşturmak için en az bir müşteri gerekli.' })
      return
    }
    setDialogOpen(true)
  }

  function handleDelete() {
    if (!deleteTarget) return
    const target = deleteTarget
    startTransition(async () => {
      const res = await deleteQuotation(target.id)
      if (res.ok) {
        toast.success('Teklif silindi', { description: target.quote_number })
        setDeleteTarget(null)
        router.refresh()
      } else {
        toast.error('Silme başarısız', { description: res.error })
      }
    })
  }

  if (setupError) {
    return (
      <div>
        <Header count={0} onAdd={handleAdd} />
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900">Veritabanı kurulumu gerekli</h3>
              <p className="mt-1 text-sm text-amber-800">{setupError}</p>
              <ol className="mt-3 space-y-1.5 text-sm text-amber-900 list-decimal list-inside">
                <li>Supabase Dashboard&apos;a gidin → <span className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">SQL Editor</span></li>
                <li><span className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">supabase/migrations/004_quotations.sql</span> dosyasını yapıştırıp <b>Run</b> deyin</li>
                <li>Bu sayfayı yenileyin</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Header count={quotations.length} onAdd={handleAdd} />

      {loadError && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      )}

      {noCustomers && (
        <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">Henüz müşteri kaydı yok</p>
            <p className="text-blue-800/90">Teklif oluşturmadan önce Müşteriler sayfasından müşteri ekleyin.</p>
          </div>
          <a href="/musteriler" className="text-sm font-medium text-primary hover:underline shrink-0">Müşteri ekle →</a>
        </div>
      )}

      {quotations.length === 0 ? (
        <EmptyState onAdd={handleAdd} disabled={noCustomers} />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Teklif no veya müşteri ara..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filtered.length}</span> / {quotations.length} kayıt
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="font-semibold">Teklif No</TableHead>
                    <TableHead className="font-semibold">Müşteri</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Teklif Tarihi</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Geçerlilik</TableHead>
                    <TableHead className="font-semibold text-center">Durum</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-16 text-center text-muted-foreground">
                        <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
                        <p>“{query}” araması için sonuç bulunamadı</p>
                        <button onClick={() => setQuery('')} className="mt-2 text-sm text-primary hover:underline">Aramayı temizle</button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((q) => {
                      const meta = STATUS_META[q.status]
                      return (
                        <TableRow key={q.id} className="group">
                          <TableCell>
                            <span className="font-mono text-xs font-medium text-primary bg-primary/5 px-2 py-1 rounded">{q.quote_number}</span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                <Building2 className="h-4 w-4" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium truncate">{q.customers?.company_name ?? (q.customer_snapshot?.company_name ?? '—')}</div>
                                {q.customers?.contact_name && (
                                  <div className="text-xs text-muted-foreground truncate">{q.customers.contact_name}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <div className="flex items-center gap-1.5 text-sm">
                              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                              {formatDate(q.issue_date)}
                            </div>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {q.valid_until ? (
                              <div className="flex items-center gap-1.5 text-sm">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                {formatDate(q.valid_until)}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="outline" className={`${meta.class} font-medium`}>
                              <meta.icon className="mr-1 h-3 w-3" />
                              {meta.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-60 group-hover:opacity-100">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-40">
                                <DropdownMenuItem disabled className="text-muted-foreground">
                                  <FileText className="mr-2 h-4 w-4" />
                                  Düzenle (yakında)
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setDeleteTarget(q)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Sil
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      <QuotationDraftDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customers={customers}
        onSaved={() => {
          setDialogOpen(false)
          router.refresh()
        }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Teklif silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-mono font-medium text-foreground">{deleteTarget?.quote_number}</span> ve içindeki tüm kalemler kalıcı olarak silinecek.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDelete() }}
              disabled={isPending}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {isPending ? 'Siliniyor...' : 'Evet, Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function formatDate(v: string | null | undefined) {
  if (!v) return '—'
  try {
    return new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(v))
  } catch { return v }
}

function Header({ count, onAdd }: { count: number; onAdd: () => void }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <FileText className="h-3.5 w-3.5" />
          <span>Teklif Yönetimi</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Teklifler</h1>
        <p className="mt-1 text-muted-foreground">Toplam <span className="font-semibold text-foreground">{count}</span> teklif</p>
      </div>
      <Button onClick={onAdd} className="h-10 shadow-sm shadow-primary/20">
        <Plus className="mr-1.5 h-4 w-4" />
        Yeni Teklif
      </Button>
    </div>
  )
}

function EmptyState({ onAdd, disabled }: { onAdd: () => void; disabled: boolean }) {
  return (
    <div className="relative rounded-2xl border border-dashed border-border bg-gradient-to-br from-blue-50/50 via-white to-white py-16 px-6 text-center overflow-hidden">
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="relative">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
          <FileText className="h-9 w-9 text-white" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">Henüz teklif oluşturulmadı</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Elektrik projeleriniz için profesyonel teklifler hazırlayın. Taslak olarak kaydedin, daha sonra kalemleri ve tutarı ekleyin.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-2">
          <Button onClick={onAdd} disabled={disabled} className="h-11 px-6 shadow-md shadow-primary/20">
            <Plus className="mr-1.5 h-4 w-4" />
            İlk Teklifi Oluştur
          </Button>
        </div>
      </div>
    </div>
  )
}
