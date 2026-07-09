'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'
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
  Package, Plus, Search, MoreHorizontal, Pencil, Trash2, Star,
  AlertCircle, Filter, Percent, Coins,
} from 'lucide-react'
import { ProductDialog } from './product-dialog'
import { deleteProduct, toggleFavorite } from '@/app/actions/products'
import { cn } from '@/lib/utils'

type Props = {
  products: Product[]
  setupError: string | null
  loadError: string | null
}

export function ProductsView({ products, setupError, loadError }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Product | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)
  const [isPending, startTransition] = useTransition()

  const filtered = useMemo(() => {
    let list = products
    if (favoritesOnly) list = list.filter((p) => p.is_favorite)
    const q = query.trim().toLowerCase()
    if (q) {
      list = list.filter((p) =>
        [p.product_code, p.product_name].some((v) => v?.toLowerCase().includes(q))
      )
    }
    return list
  }, [products, query, favoritesOnly])

  const favoriteCount = products.filter((p) => p.is_favorite).length

  function handleAdd() { setEditing(null); setDialogOpen(true) }
  function handleEdit(p: Product) { setEditing(p); setDialogOpen(true) }

  function handleToggleFav(p: Product) {
    startTransition(async () => {
      const res = await toggleFavorite(p.id, p.is_favorite)
      if (res.ok) {
        toast.success(p.is_favorite ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi', { description: p.product_name })
        router.refresh()
      } else {
        toast.error('İşlem başarısız', { description: res.error })
      }
    })
  }

  function handleDelete() {
    if (!deleteTarget) return
    const target = deleteTarget
    startTransition(async () => {
      const res = await deleteProduct(target.id)
      if (res.ok) {
        toast.success('Ürün silindi', { description: target.product_name })
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
        <Header count={0} favCount={0} onAdd={handleAdd} />
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900">Veritabanı kurulumu gerekli</h3>
              <p className="mt-1 text-sm text-amber-800">{setupError}</p>
              <ol className="mt-3 space-y-1.5 text-sm text-amber-900 list-decimal list-inside">
                <li>Supabase Dashboard&apos;a gidin → <span className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">SQL Editor</span></li>
                <li><span className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">supabase/migrations/003_products.sql</span> dosyasını yapıştırıp <b>Run</b> deyin</li>
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
      <Header count={products.length} favCount={favoriteCount} onAdd={handleAdd} />

      {loadError && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      )}

      {products.length === 0 ? (
        <EmptyState onAdd={handleAdd} />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="flex flex-col sm:flex-row gap-2 flex-1 sm:items-center">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Ürün kodu veya adı ara..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
              <Button
                type="button"
                variant={favoritesOnly ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFavoritesOnly(!favoritesOnly)}
                className="h-10 gap-2 shrink-0"
              >
                <Star className={cn('h-4 w-4', favoritesOnly && 'fill-current')} />
                Sadece Favoriler
                {favoriteCount > 0 && (
                  <Badge variant={favoritesOnly ? 'secondary' : 'outline'} className="ml-0.5 h-5 min-w-5 px-1.5">
                    {favoriteCount}
                  </Badge>
                )}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{filtered.length}</span> / {products.length} kayıt
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-10"></TableHead>
                    <TableHead className="font-semibold">Ürün Kodu</TableHead>
                    <TableHead className="font-semibold">Ürün Adı</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell text-center">Birim</TableHead>
                    <TableHead className="font-semibold text-right">Birim Fiyat</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell text-center">KDV</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-16 text-center text-muted-foreground">
                        <Search className="h-8 w-8 mx-auto mb-3 opacity-40" />
                        <p>
                          {favoritesOnly && !query
                            ? 'Hiç favori ürününüz yok'
                            : `“${query}” araması için sonuç bulunamadı`}
                        </p>
                        {(query || favoritesOnly) && (
                          <button
                            onClick={() => { setQuery(''); setFavoritesOnly(false) }}
                            className="mt-2 text-sm text-primary hover:underline"
                          >
                            Filtreleri temizle
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((p) => (
                      <TableRow key={p.id} className="cursor-pointer group" onClick={() => handleEdit(p)}>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => handleToggleFav(p)}
                            className="p-1.5 rounded-md hover:bg-muted transition-colors"
                            title={p.is_favorite ? 'Favorilerden çıkar' : 'Favorilere ekle'}
                          >
                            <Star
                              className={cn(
                                'h-4 w-4 transition-colors',
                                p.is_favorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground hover:text-amber-400'
                              )}
                            />
                          </button>
                        </TableCell>
                        <TableCell>
                          {p.product_code ? (
                            <span className="font-mono text-xs font-medium text-primary bg-primary/5 px-2 py-1 rounded">{p.product_code}</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                              <Package className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <div className="font-medium">{p.product_name}</div>
                              {p.description && (
                                <div className="text-xs text-muted-foreground truncate max-w-md">{p.description}</div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-center">
                          <Badge variant="outline" className="font-normal">{p.unit}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-semibold tabular-nums">{formatPrice(p.unit_price)}</div>
                          <div className="md:hidden text-xs text-muted-foreground">/{p.unit}</div>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-center">
                          <Badge variant="outline" className="font-mono text-xs">%{p.vat_rate}</Badge>
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-60 group-hover:opacity-100">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => handleEdit(p)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Düzenle
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleFav(p)}>
                                <Star className={cn('mr-2 h-4 w-4', p.is_favorite && 'fill-amber-400 text-amber-400')} />
                                {p.is_favorite ? 'Favoriden çıkar' : 'Favoriye ekle'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => setDeleteTarget(p)}
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

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        product={editing}
        onSaved={() => {
          setDialogOpen(false)
          router.refresh()
        }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ürün silinsin mi?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">{deleteTarget?.product_name}</span> kalıcı olarak silinecek. Bu işlem geri alınamaz.
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

function formatPrice(v: number) {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(v || 0)
}

function Header({ count, favCount, onAdd }: { count: number; favCount: number; onAdd: () => void }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Package className="h-3.5 w-3.5" />
          <span>Ürün Kataloğu</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Ürünler</h1>
        <p className="mt-1 text-muted-foreground">
          Toplam <span className="font-semibold text-foreground">{count}</span> ürün
          {favCount > 0 && (
            <> • <Star className="inline h-3.5 w-3.5 fill-amber-400 text-amber-400" /> <span className="font-semibold text-foreground">{favCount}</span> favori</>
          )}
        </p>
      </div>
      <Button onClick={onAdd} className="h-10 shadow-sm shadow-primary/20">
        <Plus className="mr-1.5 h-4 w-4" />
        Yeni Ürün
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
          <Package className="h-9 w-9 text-white" />
        </div>
        <h3 className="text-xl font-bold tracking-tight">Ürün kataloğunuz boş</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Kablolar, panolar, sigortalar ve diğer elektrik malzemelerinizi kataloğa ekleyin. Teklif oluştururken saniyeler içinde seçebilirsiniz.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-2">
          <Button onClick={onAdd} className="h-11 px-6 shadow-md shadow-primary/20">
            <Plus className="mr-1.5 h-4 w-4" />
            İlk Ürünü Ekle
          </Button>
        </div>
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto text-left">
          <FeatureHint icon={Coins} title="Fiyat Yönetimi" desc="Birim fiyat ve para birimi" />
          <FeatureHint icon={Percent} title="KDV Oranı" desc="Ürün bazında KDV" />
          <FeatureHint icon={Star} title="Favoriler" desc="Sık kullanılan ürünler" />
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
