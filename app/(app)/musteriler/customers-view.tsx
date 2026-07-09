'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Customer } from '@/lib/types'
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
  Users, Plus, Search, MoreHorizontal, Pencil, Trash2, Mail, Phone,
  MapPin, Building2, AlertCircle,
} from 'lucide-react'
import { CustomerDialog } from './customer-dialog'
import { deleteCustomer } from '@/app/actions/customers'

type Props = {
  customers: Customer[]
  setupError: string | null
  loadError: string | null
}

export function CustomersView({ customers, setupError, loadError }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Customer | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) =>
      [c.company_name, c.contact_name, c.email, c.phone, c.city, c.district, c.tax_number]
        .some((v) => v?.toLowerCase().includes(q))
    )
  }, [customers, query])

  function handleAdd() {
    setEditing(null)
    setDialogOpen(true)
  }

  function handleEdit(c: Customer) {
    setEditing(c)
    setDialogOpen(true)
  }

  function handleDelete() {
    if (!deleteTarget) return
    const target = deleteTarget
    startTransition(async () => {
      const res = await deleteCustomer(target.id)
      if (res.ok) {
        toast.success('Müşteri silindi', { description: target.company_name })
        setDeleteTarget(null)
        router.refresh()
      } else {
        toast.error('Silme başarısız', { description: res.error })
      }
    })
  }

  // Setup error — needs SQL migration
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
                <li>Supabase Dashboard'a gidin → <span className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">SQL Editor</span></li>
                <li>Projedeki <span className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">supabase/migrations/001_customers.sql</span> dosyasının içeriğini kopyalayın</li>
                <li>SQL Editor'e yapıştırıp <b>Run</b> deyin</li>
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
      <Header count={customers.length} onAdd={handleAdd} />

      {loadError && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      )}

      {/* Empty state */}
      {customers.length === 0 ? (
        <EmptyState onAdd={handleAdd} />
      ) : (
        <div className="space-y-4">
          {/* Search */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Müşteri adı, e-posta, telefon, şehir ara..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filtered.length}</span> / {customers.length} kayıt
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="font-semibold">Firma</TableHead>
                    <TableHead className="font-semibold">İletişim Kişisi</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">İletişim</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Konum</TableHead>
                    <TableHead className="font-semibold hidden xl:table-cell">Vergi No</TableHead>
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
                    filtered.map((c) => (
                      <TableRow key={c.id} className="cursor-pointer group" onClick={() => handleEdit(c)}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <Building2 className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium truncate">{c.company_name}</div>
                              {c.tax_office && <div className="text-xs text-muted-foreground truncate">{c.tax_office} VD.</div>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {c.contact_name ? (
                            <span className="text-sm">{c.contact_name}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="space-y-0.5">
                            {c.phone && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Phone className="h-3 w-3" /> {c.phone}
                              </div>
                            )}
                            {c.email && (
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Mail className="h-3 w-3" /> {c.email}
                              </div>
                            )}
                            {!c.phone && !c.email && <span className="text-xs text-muted-foreground">—</span>}
                          </div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {(c.city || c.district) ? (
                            <div className="flex items-center gap-1.5 text-sm">
                              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{[c.district, c.city].filter(Boolean).join(', ')}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          {c.tax_number ? (
                            <Badge variant="outline" className="font-mono text-xs">{c.tax_number}</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-60 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40">
                              <DropdownMenuItem onClick={() => handleEdit(c)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteTarget(c)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit dialog */}
      <CustomerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        customer={editing}
        onSaved={() => {
          setDialogOpen(false)
          router.refresh()
        }}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Müşteri silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{deleteTarget?.company_name}</span> kalıcı olarak silinecek. Bu işlem geri alınamaz.
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

function Header({ count, onAdd }: { count: number; onAdd: () => void }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Users className="h-3.5 w-3.5" />
          <span>Müşteri Yönetimi</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Müşteriler</h1>
        <p className="mt-1 text-muted-foreground">
          Toplam <span className="font-semibold text-foreground">{count}</span> müşteri
        </p>
      </div>
      <Button onClick={onAdd} className="h-10 shadow-sm shadow-primary/20">
        <Plus className="mr-1.5 h-4 w-4" />
        Yeni Müşteri
      </Button>
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="relative rounded-2xl border border-dashed border-border bg-gradient-to-br from-blue-50/50 via-white to-white py-16 px-6 text-center overflow-hidden">
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(37, 99, 235, 0.08) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      <div className="relative">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
          <Users className="h-9 w-9 text-white" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">Henüz müşteri eklenmedi</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Müşteri veritabanınızı oluşturmaya başlayın. Kurumsal ve bireysel müşterilerinizi tek yerden yönetebilir, teklif oluştururken hızlıca seçebilirsiniz.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-2">
          <Button onClick={onAdd} className="h-11 px-6 shadow-md shadow-primary/20">
            <Plus className="mr-1.5 h-4 w-4" />
            İlk Müşteriyi Ekle
          </Button>
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
          <FeatureHint icon={Building2} title="Firma Bilgileri" desc="Vergi dairesi, vergi no, adres" />
          <FeatureHint icon={Phone} title="İletişim" desc="Telefon, e-posta, kişi" />
          <FeatureHint icon={MapPin} title="Konum" desc="Şehir ve ilçe bilgisi" />
        </div>
      </div>
    </div>
  )
}

function FeatureHint({ icon: Icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border/60 bg-white/80 backdrop-blur p-3">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </div>
  )
}
