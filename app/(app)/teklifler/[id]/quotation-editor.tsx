'use client'

import { useMemo, useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Quotation, QuotationItem, Product, Customer, Currency, CompanySettings } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Popover, PopoverContent, PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, FileText, Building2,
  Calendar, Clock, Package, Star, Check,
} from 'lucide-react'
import { saveQuotationItems } from '@/app/actions/quotations'
import { PdfDownloadButton } from './pdf-download-button'
import { cn } from '@/lib/utils'

type Row = {
  key: string
  product_id: string | null
  product_code: string | null
  description: string
  unit: string
  quantity: number
  unit_price: number
  discount_rate: number
  vat_rate: number
}

type Props = {
  quotation: Quotation
  initialItems: QuotationItem[]
  products: Product[]
  customer: Customer | null
  company: CompanySettings | null
}

function toRow(it: QuotationItem): Row {
  return {
    key: it.id,
    product_id: it.product_id,
    product_code: it.product_code,
    description: it.description,
    unit: it.unit,
    quantity: Number(it.quantity),
    unit_price: Number(it.unit_price),
    discount_rate: Number(it.discount_rate),
    vat_rate: Number(it.vat_rate),
  }
}

function newRow(defaults: { vat_rate: number }): Row {
  return {
    key: Math.random().toString(36).slice(2),
    product_id: null,
    product_code: null,
    description: '',
    unit: 'adet',
    quantity: 1,
    unit_price: 0,
    discount_rate: 0,
    vat_rate: defaults.vat_rate,
  }
}

export function QuotationEditor({ quotation, initialItems, products, customer, company }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [rows, setRows] = useState<Row[]>(() => initialItems.map(toRow))
  const [dirty, setDirty] = useState(false)

  const cur = quotation.currency as Currency
  const defaultVat = Number(quotation.vat_rate) || 20

  function update(idx: number, patch: Partial<Row>) {
    setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)))
    setDirty(true)
  }
  function addRow() {
    setRows((rs) => [...rs, newRow({ vat_rate: defaultVat })])
    setDirty(true)
  }
  function removeRow(idx: number) {
    setRows((rs) => rs.filter((_, i) => i !== idx))
    setDirty(true)
  }
  function pickProduct(idx: number, p: Product) {
    update(idx, {
      product_id: p.id,
      product_code: p.product_code,
      description: p.product_name + (p.description ? ` — ${p.description}` : ''),
      unit: p.unit,
      unit_price: Number(p.unit_price),
      vat_rate: Number(p.vat_rate),
    })
  }

  // Totals
  const totals = useMemo(() => {
    let sub = 0, disc = 0, vat = 0
    for (const r of rows) {
      const gross = r.quantity * r.unit_price
      const d = gross * (r.discount_rate / 100)
      const net = gross - d
      const v = net * (r.vat_rate / 100)
      sub += gross; disc += d; vat += v
    }
    const total = sub - disc + vat
    return { sub, disc, vat, total }
  }, [rows])

  function handleSave() {
    // Warn about empty/invalid rows before saving
    const emptyRows = rows.filter((r) => !r.description?.trim() || r.quantity <= 0)
    if (emptyRows.length > 0) {
      toast.warning(`${emptyRows.length} satır kaydedilmeyecek`, {
        description: 'Boş açıklama veya sıfır miktarlı satırlar atlanacak.',
      })
    }

    startTransition(async () => {
      const res = await saveQuotationItems(
        quotation.id,
        rows.map((r) => ({
          product_id: r.product_id,
          product_code: r.product_code,
          description: r.description,
          unit: r.unit,
          quantity: r.quantity,
          unit_price: r.unit_price,
          discount_rate: r.discount_rate,
          vat_rate: r.vat_rate,
        }))
      )
      if (res.ok) {
        toast.success('Teklif kaydedildi', { description: `${rows.length} kalem • ${fmt(totals.total, cur)}` })
        setDirty(false)
        router.refresh()
      } else {
        toast.error('Kaydetme başarısız', { description: res.error })
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Button asChild variant="outline" size="icon" className="shrink-0">
            <Link href="/teklifler" aria-label="Geri"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <FileText className="h-3.5 w-3.5" />
              <Link href="/teklifler" className="hover:underline">Teklifler</Link>
              <span>›</span>
              <span className="font-mono text-primary">{quotation.quote_number}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">{customer?.company_name ?? '(müşteri yok)'}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {formatDate(quotation.issue_date)}</span>
              {quotation.valid_until && <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> {formatDate(quotation.valid_until)}</span>}
              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">{cur}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {dirty && (
            <span className="text-xs text-amber-600 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
              Kaydedilmemiş
            </span>
          )}
          <PdfDownloadButton
            quotation={quotation}
            items={initialItems}
            company={company}
            customer={customer}
            disabled={dirty}
          />
          <Button onClick={handleSave} disabled={isPending} className="h-10 shadow-sm shadow-primary/20">
            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Kaydet
          </Button>
        </div>
      </div>

      {/* Items table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="w-10 px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground">#</th>
                  <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground min-w-[280px]">Açıklama / Ürün</th>
                  <th className="px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground w-20">Birim</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground w-24">Miktar</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground w-32">Birim Fiyat</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground w-20">İsk. %</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground w-20">KDV %</th>
                  <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground w-32">Satır Toplamı</th>
                  <th className="w-10 px-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-3 opacity-40" />
                      <p>Bu teklife henüz kalem eklenmedi</p>
                      <Button onClick={addRow} size="sm" className="mt-3"><Plus className="mr-1.5 h-3.5 w-3.5" />İlk Kalemi Ekle</Button>
                    </td>
                  </tr>
                ) : (
                  rows.map((r, i) => {
                    const gross = r.quantity * r.unit_price
                    const net = gross * (1 - r.discount_rate / 100)
                    return (
                      <tr key={r.key} className="hover:bg-muted/20">
                        <td className="px-3 py-2 text-center text-xs text-muted-foreground tabular-nums">{i + 1}</td>
                        <td className="px-3 py-2">
                          <div className="space-y-1.5">
                            <ProductPicker
                              products={products}
                              value={r.product_id}
                              onPick={(p) => pickProduct(i, p)}
                            />
                            <Input
                              value={r.description}
                              onChange={(e) => update(i, { description: e.target.value })}
                              placeholder="Açıklama..."
                              className="h-8 text-sm"
                            />
                          </div>
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            value={r.unit}
                            onChange={(e) => update(i, { unit: e.target.value })}
                            className="h-8 text-sm text-center"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            type="number" step="0.001" min="0"
                            value={r.quantity}
                            onChange={(e) => update(i, { quantity: Number(e.target.value) || 0 })}
                            className="h-8 text-sm text-right tabular-nums"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            type="number" step="0.01" min="0"
                            value={r.unit_price}
                            onChange={(e) => update(i, { unit_price: Number(e.target.value) || 0 })}
                            className="h-8 text-sm text-right tabular-nums"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            type="number" step="0.01" min="0" max="100"
                            value={r.discount_rate}
                            onChange={(e) => update(i, { discount_rate: Number(e.target.value) || 0 })}
                            className="h-8 text-sm text-right tabular-nums"
                          />
                        </td>
                        <td className="px-2 py-2">
                          <Input
                            type="number" step="0.01" min="0" max="100"
                            value={r.vat_rate}
                            onChange={(e) => update(i, { vat_rate: Number(e.target.value) || 0 })}
                            className="h-8 text-sm text-right tabular-nums"
                          />
                        </td>
                        <td className="px-3 py-2 text-right font-semibold tabular-nums">{fmt(net, cur)}</td>
                        <td className="px-1 py-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeRow(i)}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-border bg-muted/20">
            <Button variant="outline" size="sm" onClick={addRow} className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Yeni Kalem
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2" />
        <Card>
          <CardContent className="p-5 space-y-3">
            <Row label="Ara Toplam" value={fmt(totals.sub, cur)} />
            <Row label="İskonto" value={`- ${fmt(totals.disc, cur)}`} variant="muted" />
            <Row label="KDV" value={fmt(totals.vat, cur)} variant="muted" />
            <div className="h-px bg-border my-2" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold">Genel Toplam</span>
              <span className="text-2xl font-bold tabular-nums text-primary">{fmt(totals.total, cur)}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function ProductPicker({ products, value, onPick }: { products: Product[]; value: string | null; onPick: (p: Product) => void }) {
  const [open, setOpen] = useState(false)
  const selected = products.find((p) => p.id === value) ?? null
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" role="combobox" className="h-8 w-full justify-between text-xs font-normal">
          <span className="flex items-center gap-1.5 min-w-0">
            <Package className="h-3 w-3 text-muted-foreground shrink-0" />
            {selected ? (
              <span className="truncate">
                {selected.product_code && <span className="font-mono text-primary mr-1.5">{selected.product_code}</span>}
                {selected.product_name}
              </span>
            ) : (
              <span className="text-muted-foreground">Katalogdan ürün seç...</span>
            )}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Ürün ara (kod veya isim)..." />
          <CommandList>
            <CommandEmpty>Ürün bulunamadı. Önce ürünler sayfasından ekleyin.</CommandEmpty>
            <CommandGroup>
              {products.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`${p.product_code ?? ''} ${p.product_name}`}
                  onSelect={() => { onPick(p); setOpen(false) }}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full min-w-0">
                    {p.is_favorite && <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 text-xs">
                        {p.product_code && <span className="font-mono text-primary">{p.product_code}</span>}
                        <span className="font-medium truncate">{p.product_name}</span>
                      </div>
                      <div className="text-[10px] text-muted-foreground tabular-nums">{p.unit} • {fmt(Number(p.unit_price), 'TRY')} • KDV %{p.vat_rate}</div>
                    </div>
                    <Check className={cn('h-3.5 w-3.5 text-primary shrink-0', value === p.id ? 'opacity-100' : 'opacity-0')} />
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function Row({ label, value, variant }: { label: string; value: string; variant?: 'muted' }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-sm', variant === 'muted' ? 'text-muted-foreground' : 'font-medium')}>{label}</span>
      <span className="text-sm font-semibold tabular-nums">{value}</span>
    </div>
  )
}

function fmt(v: number, currency: Currency) {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v || 0)
}
function formatDate(v: string | null | undefined) {
  if (!v) return '—'
  try { return new Intl.DateTimeFormat('tr-TR').format(new Date(v)) } catch { return v }
}
