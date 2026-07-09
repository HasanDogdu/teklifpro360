'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import type { Product } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Package, Loader2, Star, Coins, Percent, FileText, Hash } from 'lucide-react'
import { createProduct, updateProduct } from '@/app/actions/products'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: Product | null
  onSaved: () => void
}

const UNITS = ['adet', 'metre', 'kg', 'saat', 'm²', 'm³', 'paket', 'kutu', 'litre', 'set', 'takim']

const EMPTY = {
  product_code: '',
  product_name: '',
  unit: 'adet',
  unit_price: '',
  vat_rate: '20',
  description: '',
  is_favorite: false,
}

export function ProductDialog({ open, onOpenChange, product, onSaved }: Props) {
  const [form, setForm] = useState<Record<string, any>>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      setErrors({})
      if (product) {
        setForm({
          product_code: product.product_code || '',
          product_name: product.product_name || '',
          unit: product.unit || 'adet',
          unit_price: String(product.unit_price ?? ''),
          vat_rate: String(product.vat_rate ?? '20'),
          description: product.description || '',
          is_favorite: !!product.is_favorite,
        })
      } else {
        setForm({ ...EMPTY })
      }
    }
  }, [open, product])

  function setField(key: string, value: any) {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.product_name?.trim()) e.product_name = 'Ürün adı zorunludur'
    const price = Number(form.unit_price)
    if (form.unit_price === '' || Number.isNaN(price) || price < 0) e.unit_price = 'Geçerli bir fiyat girin'
    const vat = Number(form.vat_rate)
    if (form.vat_rate === '' || Number.isNaN(vat) || vat < 0 || vat > 100) e.vat_rate = 'KDV 0 - 100 arasında olmalı'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return
    startTransition(async () => {
      const res = product
        ? await updateProduct(product.id, form)
        : await createProduct(form)
      if (res.ok) {
        toast.success(product ? 'Ürün güncellendi' : 'Ürün eklendi', { description: form.product_name })
        onSaved()
      } else {
        toast.error('İşlem başarısız', { description: res.error })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="h-4 w-4 text-primary" />
              </div>
              {product ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
            </DialogTitle>
            <DialogDescription>
              {product ? 'Ürün bilgilerini güncelleyin.' : 'Kataloga yeni bir ürün ekleyin.'}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Ürün Kodu" icon={Hash}>
                <Input
                  value={form.product_code}
                  onChange={(e) => setField('product_code', e.target.value)}
                  placeholder="Örn. KBL-001"
                  className="font-mono"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Ürün Adı" required error={errors.product_name}>
                  <Input
                    value={form.product_name}
                    onChange={(e) => setField('product_name', e.target.value)}
                    placeholder="Örn. NYA Kablo 2.5mm²"
                    autoFocus
                  />
                </Field>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Field label="Birim">
                <Select value={form.unit} onValueChange={(v) => setField('unit', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNITS.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Birim Fiyat" required icon={Coins} error={errors.unit_price}>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.unit_price}
                  onChange={(e) => setField('unit_price', e.target.value)}
                  placeholder="0.00"
                  className="tabular-nums"
                />
              </Field>
              <Field label="KDV (%)" required icon={Percent} error={errors.vat_rate}>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={form.vat_rate}
                  onChange={(e) => setField('vat_rate', e.target.value)}
                  placeholder="20"
                  className="tabular-nums"
                />
              </Field>
            </div>

            <Field label="Açıklama" icon={FileText}>
              <Textarea
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                placeholder="Ürün hakkında kısa açıklama..."
                rows={3}
              />
            </Field>

            <Separator />

            <div className="flex items-center justify-between gap-4 py-1">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                  <Star className={form.is_favorite ? 'h-4 w-4 fill-amber-400 text-amber-400' : 'h-4 w-4 text-amber-500'} />
                </div>
                <div>
                  <div className="text-sm font-medium">Favori ürün</div>
                  <div className="text-xs text-muted-foreground">Favoriler listede en üstte gösterilir.</div>
                </div>
              </div>
              <Switch checked={form.is_favorite} onCheckedChange={(v) => setField('is_favorite', v)} />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-muted/30 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              İptal
            </Button>
            <Button type="submit" disabled={isPending} className="shadow-sm shadow-primary/20">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? 'Değişiklikleri Kaydet' : 'Ürün Ekle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label, required, icon: Icon, error, children,
}: {
  label: string; required?: boolean; icon?: any; error?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
