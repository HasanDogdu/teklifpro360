'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { Customer } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { FileText, Loader2, Hash, Calendar, Clock, Building2, User, Info } from 'lucide-react'
import { createDraftQuotation, suggestQuoteNumber } from '@/app/actions/quotations'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  customers: Customer[]
  onSaved: () => void
}

function toDateInputValue(d: Date) {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function QuotationDraftDialog({ open, onOpenChange, customers, onSaved }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [loadingNumber, setLoadingNumber] = useState(false)

  const today = new Date()
  const in30 = new Date(); in30.setDate(today.getDate() + 30)

  const [customerId, setCustomerId] = useState<string>('')
  const [quoteNumber, setQuoteNumber] = useState<string>('')
  const [issueDate, setIssueDate] = useState<string>(toDateInputValue(today))
  const [validUntil, setValidUntil] = useState<string>(toDateInputValue(in30))
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (open) {
      setErrors({})
      setCustomerId('')
      setIssueDate(toDateInputValue(new Date()))
      const d = new Date(); d.setDate(d.getDate() + 30)
      setValidUntil(toDateInputValue(d))
      // Fetch next quote number
      setLoadingNumber(true)
      suggestQuoteNumber().then((res) => {
        if (res.ok) setQuoteNumber(res.quote_number)
        else toast.error('Teklif numarası alınamadı', { description: res.error })
      }).finally(() => setLoadingNumber(false))
    }
  }, [open])

  const selectedCustomer = customers.find((c) => c.id === customerId) ?? null

  function validate() {
    const e: Record<string, string> = {}
    if (!customerId) e.customer_id = 'Lütfen bir müşteri seçin'
    if (!quoteNumber.trim()) e.quote_number = 'Teklif numarası zorunludur'
    if (!issueDate) e.issue_date = 'Teklif tarihi zorunludur'
    if (issueDate && validUntil && validUntil < issueDate) e.valid_until = 'Geçerlilik tarihi teklif tarihinden önce olamaz'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return

    startTransition(async () => {
      const res = await createDraftQuotation({
        customer_id: customerId,
        quote_number: quoteNumber.trim(),
        issue_date: issueDate,
        valid_until: validUntil || null,
      })
      if (res.ok) {
        toast.success('Taslak oluşturuldu', { description: res.quote_number })
        onSaved()
        router.refresh()
      } else {
        toast.error('Kaydetme başarısız', { description: res.error })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-xl flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-4 w-4 text-primary" />
              </div>
              Yeni Teklif Oluştur
            </DialogTitle>
            <DialogDescription>
              Taslak olarak kaydedin. Kalem ekleme, fiyat hesaplama ve PDF oluşturma bir sonraki adımda gelecek.
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5 space-y-4">
            {/* Quote number */}
            <Field label="Teklif Numarası" icon={Hash} required error={errors.quote_number}>
              <div className="relative">
                <Input
                  value={quoteNumber}
                  onChange={(e) => setQuoteNumber(e.target.value)}
                  placeholder="TKL-2025-0001"
                  className="font-mono pr-24"
                  disabled={loadingNumber}
                />
                {loadingNumber && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground flex items-center gap-1.5">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Oluşturuluyor...
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Otomatik oluşturuldu — gerekirse düzenleyebilirsiniz.</p>
            </Field>

            {/* Customer */}
            <Field label="Müşteri" icon={Building2} required error={errors.customer_id}>
              <Select value={customerId} onValueChange={setCustomerId}>
                <SelectTrigger>
                  <SelectValue placeholder="Müşteri seçin..." />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {customers.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{c.company_name}</span>
                        {c.contact_name && <span className="text-xs text-muted-foreground">{c.contact_name}</span>}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedCustomer && (
                <div className="mt-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-xs text-muted-foreground flex items-center gap-2">
                  <User className="h-3.5 w-3.5" />
                  {[selectedCustomer.contact_name, selectedCustomer.city].filter(Boolean).join(' • ') || 'Müşteri seçildi'}
                </div>
              )}
            </Field>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Teklif Tarihi" icon={Calendar} required error={errors.issue_date}>
                <Input type="date" value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
              </Field>
              <Field label="Geçerlilik Tarihi" icon={Clock} error={errors.valid_until}>
                <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </Field>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2.5 text-xs text-blue-900 flex items-start gap-2">
              <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-blue-600" />
              <div>
                Bu teklif <b>taslak</b> olarak kaydedilecek. Ürün/kalem ekleme, hesaplama ve PDF çıktısı sonraki adımlarda gelecek.
              </div>
            </div>
          </div>

          <DialogFooter className="px-6 py-4 bg-muted/30 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              İptal
            </Button>
            <Button type="submit" disabled={isPending || loadingNumber} className="shadow-sm shadow-primary/20">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Taslak Olarak Kaydet
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label, icon: Icon, required, error, children,
}: {
  label: string; icon?: any; required?: boolean; error?: string; children: React.ReactNode
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
