'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { QuotationPDF } from '@/lib/pdf/quotation-pdf'
import { safeFilename } from '@/lib/pdf/pdf-utils'
import type { Quotation, QuotationItem, CompanySettings, Customer } from '@/lib/types'

type Props = {
  quotation: Quotation
  items: QuotationItem[]
  company: CompanySettings | null
  customer: Customer | null
  disabled?: boolean
}

export function PdfDownloadButton({ quotation, items, company, customer, disabled }: Props) {
  const [busy, setBusy] = useState(false)

  async function handleDownload() {
    if (busy) return
    if (items.length === 0) {
      toast.error('PDF oluşturulamadı', { description: 'Teklife en az bir kalem ekleyip kaydedin.' })
      return
    }
    setBusy(true)
    try {
      // Dynamic import so react-pdf loads only when needed (↓ initial bundle)
      const { pdf } = await import('@react-pdf/renderer')
      const blob = await pdf(
        <QuotationPDF quotation={quotation} items={items} company={company} customer={customer} />
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const custName = (customer?.company_name || (quotation as any).customer_snapshot?.company_name || 'musteri').toString()
      a.href = url
      a.download = `${safeFilename(quotation.quote_number)}_${safeFilename(custName)}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      toast.success('PDF indirildi', { description: quotation.quote_number })
    } catch (e: any) {
      console.error('PDF error:', e)
      toast.error('PDF oluşturma hatası', { description: e?.message ?? 'Bilinmeyen hata' })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleDownload}
      disabled={disabled || busy}
      className="h-10 gap-2"
    >
      {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
      PDF İndir
    </Button>
  )
}
