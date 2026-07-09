import { PageHeader, EmptyState } from '@/components/empty-state'
import { Package } from 'lucide-react'

export default function UrunlerPage() {
  return (
    <div>
      <PageHeader
        breadcrumb="Ürün Kataloğu"
        title="Ürünler"
        description="Elektrik malzemeleri kataloğunuzu ve fiyat listenizi yönetin."
        actionLabel="+ Yeni Ürün"
      />
      <EmptyState
        icon={Package}
        title="Ürün kataloğu boş"
        description="Kabloları, panoları, sigortaları ve diğer elektrik malzemelerinizi kataloğa ekleyin. Teklif oluştururken hızlıca seçebilirsiniz."
        actionLabel="İlk Ürünü Ekle"
      />
    </div>
  )
}
