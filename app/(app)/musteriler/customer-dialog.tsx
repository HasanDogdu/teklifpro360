'use client'

import { useEffect, useState, useTransition } from 'react'
import { toast } from 'sonner'
import type { Customer } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Building2, User, MapPin, FileText, Loader2 } from 'lucide-react'
import { createCustomer, updateCustomer } from '@/app/actions/customers'

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  customer: Customer | null
  onSaved: () => void
}

const EMPTY = {
  company_name: '',
  contact_name: '',
  phone: '',
  email: '',
  tax_office: '',
  tax_number: '',
  address: '',
  city: '',
  district: '',
  notes: '',
}

export function CustomerDialog({ open, onOpenChange, customer, onSaved }: Props) {
  const [form, setForm] = useState<Record<string, string>>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (open) {
      setErrors({})
      if (customer) {
        setForm({
          company_name: customer.company_name || '',
          contact_name: customer.contact_name || '',
          phone: customer.phone || '',
          email: customer.email || '',
          tax_office: customer.tax_office || '',
          tax_number: customer.tax_number || '',
          address: customer.address || '',
          city: customer.city || '',
          district: customer.district || '',
          notes: customer.notes || '',
        })
      } else {
        setForm(EMPTY)
      }
    }
  }, [open, customer])

  function setField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: '' }))
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.company_name.trim()) e.company_name = 'Firma adı zorunludur'
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Geçersiz e-posta'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (!validate()) return

    startTransition(async () => {
      const res = customer
        ? await updateCustomer(customer.id, form)
        : await createCustomer(form)

      if (res.ok) {
        toast.success(customer ? 'Müşteri güncellendi' : 'Müşteri eklendi', {
          description: form.company_name,
        })
        onSaved()
      } else {
        toast.error('İşlem başarısız', { description: res.error })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="px-6 pt-6">
            <DialogTitle className="text-xl">
              {customer ? 'Müşteriyi Düzenle' : 'Yeni Müşteri Ekle'}
            </DialogTitle>
            <DialogDescription>
              {customer
                ? 'Müşteri bilgilerini güncelleyin. Değişiklikler anında kaydedilir.'
                : 'Yeni bir müşteri kaydı oluşturun. Yalnızca firma adı zorunludur.'}
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-5 space-y-6">
            {/* Firma */}
            <Section icon={Building2} title="Firma Bilgileri">
              <div className="grid grid-cols-1 gap-4">
                <Field label="Firma Adı" required error={errors.company_name}>
                  <Input
                    value={form.company_name}
                    onChange={(e) => setField('company_name', e.target.value)}
                    placeholder="Örn. Aksoy İnşaat A.Ş."
                    autoFocus
                  />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Vergi Dairesi">
                    <Input
                      value={form.tax_office}
                      onChange={(e) => setField('tax_office', e.target.value)}
                      placeholder="Örn. Kadıköy"
                    />
                  </Field>
                  <Field label="Vergi Numarası">
                    <Input
                      value={form.tax_number}
                      onChange={(e) => setField('tax_number', e.target.value)}
                      placeholder="Örn. 1234567890"
                      inputMode="numeric"
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Separator />

            {/* Contact */}
            <Section icon={User} title="İletişim">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="İletişim Kişisi">
                  <Input
                    value={form.contact_name}
                    onChange={(e) => setField('contact_name', e.target.value)}
                    placeholder="Ad Soyad"
                  />
                </Field>
                <Field label="Telefon">
                  <Input
                    value={form.phone}
                    onChange={(e) => setField('phone', e.target.value)}
                    placeholder="+90 555 000 00 00"
                    inputMode="tel"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="E-posta" error={errors.email}>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                      placeholder="ornek@firma.com"
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Separator />

            {/* Address */}
            <Section icon={MapPin} title="Adres">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Şehir">
                  <Input
                    value={form.city}
                    onChange={(e) => setField('city', e.target.value)}
                    placeholder="Örn. İstanbul"
                  />
                </Field>
                <Field label="İlçe">
                  <Input
                    value={form.district}
                    onChange={(e) => setField('district', e.target.value)}
                    placeholder="Örn. Kadıköy"
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Açık Adres">
                    <Textarea
                      value={form.address}
                      onChange={(e) => setField('address', e.target.value)}
                      placeholder="Mahalle, cadde, no..."
                      rows={2}
                    />
                  </Field>
                </div>
              </div>
            </Section>

            <Separator />

            {/* Notes */}
            <Section icon={FileText} title="Notlar">
              <Field label="İç Notlar">
                <Textarea
                  value={form.notes}
                  onChange={(e) => setField('notes', e.target.value)}
                  placeholder="Müşteri hakkında iç notlarınız..."
                  rows={3}
                />
              </Field>
            </Section>
          </div>

          <DialogFooter className="px-6 py-4 bg-muted/30 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              İptal
            </Button>
            <Button type="submit" disabled={isPending} className="shadow-sm shadow-primary/20">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {customer ? 'Değişiklikleri Kaydet' : 'Müşteri Ekle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function Section({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <h3 className="text-sm font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  )
}

function Field({
  label, required, error, children,
}: {
  label: string; required?: boolean; error?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
