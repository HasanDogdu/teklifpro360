'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import type { CompanySettings, Currency } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import {
  Building2, User, Phone, Mail, Globe, FileText, MapPin, CreditCard, Percent,
  Calendar, Coins, Palette, Loader2, AlertCircle, Save, CheckCircle2,
} from 'lucide-react'
import { upsertCompanySettings } from '@/app/actions/company'
import { LogoUploader } from './logo-uploader'

type Props = {
  initialSettings: CompanySettings | null
  setupError: string | null
  loadError: string | null
}

const DEFAULTS = {
  company_name: '',
  logo_url: null,
  authorized_person: '',
  phone: '',
  email: '',
  website: '',
  tax_office: '',
  tax_number: '',
  registry_number: '',
  address: '',
  city: '',
  district: '',
bank_name: '',
iban: '',
default_currency: 'TRY' as Currency,
  default_vat_rate: 20,
  default_payment_terms: 'Teslimat sonrası 15 gün içinde havale/EFT.',
  default_validity_days: 30,
  quotation_footer_notes: 'Bu teklif KDV hariçtir. Fiyatlar bilgi amaçlıdır ve döviz kurlarına göre güncellenebilir.',
  show_logo: true,
  show_signature: true,
  show_stamp: false,
}

export function SettingsView({ initialSettings, setupError, loadError }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [form, setForm] = useState<any>(() => hydrate(initialSettings))
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    setForm(hydrate(initialSettings))
    setDirty(false)
  }, [initialSettings])

  function setField(key: string, value: any) {
    setForm((f: any) => ({ ...f, [key]: value }))
    setDirty(true)
  }

  function handleLogoChange(url: string | null) {
    setForm((f: any) => ({ ...f, logo_url: url }))
    setDirty(true)
  }

  function handleSave() {
    if (!form.company_name?.trim()) {
      toast.error('Firma adı zorunludur')
      return
    }
    startTransition(async () => {
      const res = await upsertCompanySettings(form)
      if (res.ok) {
        toast.success('Ayarlar kaydedildi', { description: 'Değişiklikler başarıyla uygulandı.' })
        setDirty(false)
        router.refresh()
      } else {
        toast.error('Kaydetme başarısız', { description: res.error })
      }
    })
  }

  if (setupError) {
    return (
      <div>
        <Header dirty={false} isPending={false} onSave={() => {}} />
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-amber-900">Veritabanı kurulumu gerekli</h3>
              <p className="mt-1 text-sm text-amber-800">{setupError}</p>
              <ol className="mt-3 space-y-1.5 text-sm text-amber-900 list-decimal list-inside">
                <li>Supabase Dashboard&apos;a gidin → <span className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">SQL Editor</span></li>
                <li><span className="font-mono text-xs bg-amber-100 px-1.5 py-0.5 rounded">supabase/migrations/002_company_settings.sql</span> dosyasının içeriğini yapıştırıp <b>Run</b> deyin</li>
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
      <Header dirty={dirty} isPending={isPending} onSave={handleSave} />

      {loadError && (
        <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      )}

      <Tabs defaultValue="firma" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto p-1 gap-1">
          <TabsTrigger value="firma" className="gap-2 py-2.5">
            <Building2 className="h-4 w-4" /> <span className="hidden sm:inline">Firma</span> Bilgileri
          </TabsTrigger>
          <TabsTrigger value="defaults" className="gap-2 py-2.5">
            <Coins className="h-4 w-4" /> Teklif Varsayılanları
          </TabsTrigger>
          <TabsTrigger value="footer" className="gap-2 py-2.5">
            <FileText className="h-4 w-4" /> Teklif Notu
          </TabsTrigger>
          <TabsTrigger value="pdf" className="gap-2 py-2.5">
            <Palette className="h-4 w-4" /> PDF Ayarları
          </TabsTrigger>
        </TabsList>

        {/* ============= FIRMA BILGILERI ============= */}
        <TabsContent value="firma" className="space-y-6 mt-0">
          {/* Logo card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                  <Palette className="h-3.5 w-3.5 text-primary" />
                </div>
                Firma Logosu
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LogoUploader
                currentUrl={form.logo_url}
                companyName={form.company_name}
                onChange={handleLogoChange}
              />
            </CardContent>
          </Card>

          {/* Firma bilgileri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-3.5 w-3.5 text-primary" />
                </div>
                Firma Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Firma Adı" required>
                <Input value={form.company_name} onChange={(e) => setField('company_name', e.target.value)} placeholder="Örn. Örnek Elektrik San. ve Tic. Ltd. Şti." />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Yetkili Kişi" icon={User}>
                  <Input value={form.authorized_person} onChange={(e) => setField('authorized_person', e.target.value)} placeholder="Ad Soyad" />
                </Field>
                <Field label="Telefon" icon={Phone}>
                  <Input value={form.phone} onChange={(e) => setField('phone', e.target.value)} placeholder="+90 212 000 00 00" />
                </Field>
                <Field label="E-posta" icon={Mail}>
                  <Input type="email" value={form.email} onChange={(e) => setField('email', e.target.value)} placeholder="info@firma.com" />
                </Field>
                <Field label="Web Sitesi" icon={Globe}>
                  <Input value={form.website} onChange={(e) => setField('website', e.target.value)} placeholder="www.firma.com" />
                </Field>
              </div>
            </CardContent>
          </Card>

          {/* Vergi */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                </div>
                Vergi & Fatura Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
      placeholder="1234567890"
      inputMode="numeric"
    />
  </Field>

  <Field label="Ticaret Sicil No">
    <Input
      value={form.registry_number}
      onChange={(e) => setField('registry_number', e.target.value)}
      placeholder="Örn. 123456"
    />
  </Field>

  <Field label="Banka Adı">
    <Input
      value={form.bank_name}
      onChange={(e) => setField('bank_name', e.target.value)}
      placeholder="Örn. Türkiye İş Bankası"
    />
  </Field>

  <div className="md:col-span-2">
    <Field label="IBAN" icon={CreditCard}>
      <Input
        value={form.iban}
        onChange={(e) =>
          setField('iban', e.target.value.toUpperCase())
        }
        placeholder="TR00 0000 0000 0000 0000 0000 00"
        className="font-mono"
      />
    </Field>
  </div>
</div>
            </CardContent>
          </Card>

          {/* Adres */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                </div>
                Adres
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Şehir">
                  <Input value={form.city} onChange={(e) => setField('city', e.target.value)} placeholder="Örn. İstanbul" />
                </Field>
                <Field label="İlçe">
                  <Input value={form.district} onChange={(e) => setField('district', e.target.value)} placeholder="Örn. Kadıköy" />
                </Field>
              </div>
              <Field label="Açık Adres">
                <Textarea value={form.address} onChange={(e) => setField('address', e.target.value)} placeholder="Mahalle, cadde, no..." rows={2} />
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============= TEKLIF VARSAYILANLARI ============= */}
        <TabsContent value="defaults" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                  <Coins className="h-3.5 w-3.5 text-primary" />
                </div>
                Teklif Varsayılanları
              </CardTitle>
              <p className="text-sm text-muted-foreground pt-1">Yeni teklifler bu değerlerle oluşturulacak. Her teklifte değiştirilebilir.</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Varsayılan Para Birimi" icon={Coins}>
                  <Select value={form.default_currency} onValueChange={(v) => setField('default_currency', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TRY">🇹🇷 Türk Lirası (₺)</SelectItem>
                      <SelectItem value="USD">🇺🇸 ABD Doları ($)</SelectItem>
                      <SelectItem value="EUR">🇪🇺 Euro (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Varsayılan KDV Oranı (%)" icon={Percent}>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={form.default_vat_rate}
                    onChange={(e) => setField('default_vat_rate', e.target.value)}
                  />
                </Field>
                <Field label="Geçerlilik Süresi (gün)" icon={Calendar}>
                  <Input
                    type="number"
                    min="0"
                    max="3650"
                    value={form.default_validity_days}
                    onChange={(e) => setField('default_validity_days', e.target.value)}
                  />
                </Field>
                <div className="hidden md:block" />
                <div className="md:col-span-2">
                  <Field label="Ödeme Şartları (Varsayılan)">
                    <Textarea
                      value={form.default_payment_terms}
                      onChange={(e) => setField('default_payment_terms', e.target.value)}
                      placeholder="Örn. Teslimat sonrası 15 gün içinde havale/EFT."
                      rows={2}
                    />
                  </Field>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============= TEKLIF NOTU ============= */}
        <TabsContent value="footer" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                </div>
                Teklif Alt Notu
              </CardTitle>
              <p className="text-sm text-muted-foreground pt-1">Bu metin tüm tekliflerin altında otomatik olarak gösterilir. Her teklifte özelleştirilebilir.</p>
            </CardHeader>
            <CardContent>
              <Field label="Alt Not / Açıklama">
                <Textarea
                  value={form.quotation_footer_notes}
                  onChange={(e) => setField('quotation_footer_notes', e.target.value)}
                  placeholder="Örn. Bu teklif KDV hariçtir. Fiyatlar 15 gün geçerlidir..."
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  İpucu: Garanti şartları, teslimat süresi, kur bilgisi gibi bilgileri buraya ekleyebilirsiniz.
                </p>
              </Field>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============= PDF AYARLARI ============= */}
        <TabsContent value="pdf" className="space-y-6 mt-0">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                  <Palette className="h-3.5 w-3.5 text-primary" />
                </div>
                PDF Çıktı Ayarları
              </CardTitle>
              <p className="text-sm text-muted-foreground pt-1">Teklif PDF&apos;lerinde hangi öğelerin görüneceğini seçin.</p>
            </CardHeader>
            <CardContent className="space-y-1 divide-y divide-border/60">
              <SwitchRow
                icon={Palette}
                title="Firma Logosu"
                description="Teklifin üst kısmında firma logonuz görünecek"
                checked={form.show_logo}
                onChange={(v) => setField('show_logo', v)}
              />
              <SwitchRow
                icon={FileText}
                title="İmza Alanı"
                description="Teklifin altında yetkili imza alanı yer alacak"
                checked={form.show_signature}
                onChange={(v) => setField('show_signature', v)}
              />
              <SwitchRow
                icon={CheckCircle2}
                title="Kaşe / Mühür Alanı"
                description="Firma kaşesi için ayrılmış alan gösterilecek"
                checked={form.show_stamp}
                onChange={(v) => setField('show_stamp', v)}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sticky save bar (mobile) */}
      {dirty && (
        <div className="fixed bottom-4 left-4 right-4 md:hidden z-40">
          <div className="rounded-xl border border-border bg-background/95 backdrop-blur shadow-lg p-3 flex items-center gap-3">
            <span className="flex-1 text-sm text-muted-foreground">Kaydedilmemiş değişiklikler</span>
            <Button size="sm" onClick={handleSave} disabled={isPending}>
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Kaydet'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function hydrate(s: CompanySettings | null) {
  if (!s) return { ...DEFAULTS }
  return {
    company_name: s.company_name ?? '',
    logo_url: s.logo_url,
    authorized_person: s.authorized_person ?? '',
    phone: s.phone ?? '',
    email: s.email ?? '',
    website: s.website ?? '',
    tax_office: s.tax_office ?? '',
tax_number: s.tax_number ?? '',
registry_number: (s as any).registry_number ?? '',
address: s.address ?? '',
    city: s.city ?? '',
    district: s.district ?? '',
bank_name: s.bank_name ?? '',
iban: s.iban ?? '',
default_currency: s.default_currency,
    default_vat_rate: s.default_vat_rate,
    default_payment_terms: s.default_payment_terms ?? '',
    default_validity_days: s.default_validity_days,
    quotation_footer_notes: s.quotation_footer_notes ?? '',
    show_logo: s.show_logo,
    show_signature: s.show_signature,
    show_stamp: s.show_stamp,
  }
}

function Header({ dirty, isPending, onSave }: { dirty: boolean; isPending: boolean; onSave: () => void }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
          <Building2 className="h-3.5 w-3.5" />
          <span>Firma Profili & Ayarlar</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
        <p className="mt-1 text-muted-foreground">
          Firma bilgilerinizi, teklif varsayılanlarını ve PDF çıktı tercihlerinizi yönetin.
        </p>
      </div>
      <div className="hidden md:flex items-center gap-3">
        {dirty && (
          <span className="text-xs text-amber-600 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Kaydedilmemiş değişiklikler
          </span>
        )}
        <Button onClick={onSave} disabled={isPending || !dirty} className="h-10 shadow-sm shadow-primary/20">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Değişiklikleri Kaydet
        </Button>
      </div>
    </div>
  )
}

function Field({
  label, required, icon: Icon, children,
}: {
  label: string; required?: boolean; icon?: any; children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium flex items-center gap-1.5">
        {Icon && <Icon className="h-3 w-3 text-muted-foreground" />}
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
    </div>
  )
}

function SwitchRow({
  icon: Icon, title, description, checked, onChange,
}: {
  icon: any; title: string; description: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
