import { PageHeader, EmptyState } from '@/components/empty-state'
import { FileText } from 'lucide-react'

export default function TekliflerPage() {
  return (
    <div>
      <PageHeader
        breadcrumb="Teklif Yönetimi"
        title="Teklifler"
        description="Müşterilerinize gönderdiğiniz tüm teklifleri buradan yönetin."
        actionLabel="+ Yeni Teklif"
      />
      <EmptyState
        icon={FileText}
        title="Henüz teklif oluşturulmadı"
        description="İlk profesyonel teklifinizi hazırlayarak müşterilerinize gönderin. PDF olarak dışa aktarabilir ve durumlarını takip edebilirsiniz."
        actionLabel="İlk Teklifi Oluştur"
      />
    </div>
  )
}
