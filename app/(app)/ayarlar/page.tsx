import { PageHeader } from '@/components/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, User, Bell, Palette, CreditCard, Shield } from 'lucide-react'

const SETTINGS_SECTIONS = [
  { icon: User, title: 'Hesap Bilgileri', description: 'Profil, e-posta ve şifre ayarları.' },
  { icon: Building2, title: 'Firma Bilgileri', description: 'Firma adı, logo, vergi bilgileri.' },
  { icon: Palette, title: 'Teklif Şablonu', description: 'Teklif tasarımı ve varsayılan değerler.' },
  { icon: Bell, title: 'Bildirimler', description: 'E-posta ve uygulama bildirimleri.' },
  { icon: CreditCard, title: 'Abonelik & Faturalama', description: 'Paket, ödeme yöntemi ve faturalar.' },
  { icon: Shield, title: 'Güvenlik', description: 'İki adımlı doğrulama ve oturumlar.' },
]

export default function AyarlarPage() {
  return (
    <div>
      <PageHeader
        breadcrumb="Sistem"
        title="Ayarlar"
        description="Hesap, firma ve uygulama tercihlerinizi yönetin."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SETTINGS_SECTIONS.map((s) => (
          <Card key={s.title} className="group cursor-pointer border-border/60 hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all">
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <s.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-base">{s.title}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground">Yakında kullanıma açılacak</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
