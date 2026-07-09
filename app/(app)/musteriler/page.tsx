import { PageHeader, EmptyState } from '@/components/empty-state'
import { Users } from 'lucide-react'

export default function MusterilerPage() {
  return (
    <div>
      <PageHeader
        breadcrumb="Müşteri Yönetimi"
        title="Müşteriler"
        description="Müşterilerinizi ekleyin, düzenleyin ve iletişim bilgilerini yönetin."
        actionLabel="+ Yeni Müşteri"
      />
      <EmptyState
        icon={Users}
        title="Henüz müşteri eklenmedi"
        description="İlk müşterinizi ekleyerek başlayın. Kurumsal ve bireysel müşterilerinizi tek yerden yönetebilirsiniz."
        actionLabel="İlk Müşteriyi Ekle"
      />
    </div>
  )
}
