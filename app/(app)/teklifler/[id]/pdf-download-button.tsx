'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { QuotationPDF } from '@/lib/pdf/quotation-pdf'
import { safeFilename } from '@/lib/pdf/pdf-utils'
import type {
  Quotation,
  QuotationItem,
  CompanySettings,
  Customer,
} from '@/lib/types'

type Props = {
  quotation: Quotation
  items: QuotationItem[]
  company: CompanySettings | null
  customer: Customer | null
  disabled?: boolean
}

async function imageUrlToDataUrl(
  imageUrl?: string | null
): Promise<string | null> {
  if (!imageUrl) return null

  try {
    // Logo zaten data URL ise yeniden indirmeye çalışma.
    if (imageUrl.startsWith('data:')) {
      return imageUrl
    }

    const response = await fetch(imageUrl, {
      method: 'GET',
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`Logo indirilemedi. HTTP durum kodu: ${response.status}`)
    }

    const blob = await response.blob()

    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()

      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result)
        } else {
          reject(new Error('Logo data URL formatına çevrilemedi.'))
        }
      }

      reader.onerror = () => {
        reject(new Error('Logo okunurken bir hata oluştu.'))
      }

      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('PDF logosu hazırlanamadı:', error)
    return null
  }
}

export function PdfDownloadButton({
  quotation,
  items,
  company,
  customer,
  disabled,
}: Props) {
  const [busy, setBusy] = useState(false)

  async function handleDownload() {
    if (busy) return

    if (items.length === 0) {
      toast.error('PDF oluşturulamadı', {
        description: 'Teklife en az bir kalem ekleyip kaydedin.',
      })
      return
    }

    setBusy(true)

    try {
      const logoDataUrl =
        company?.show_logo && company.logo_url
          ? await imageUrlToDataUrl(company.logo_url)
          : null

      const companyForPdf: CompanySettings | null = company
        ? {
            ...company,
            logo_url: logoDataUrl,
          }
        : null

      if (company?.show_logo && company.logo_url && !logoDataUrl) {
        toast.warning('Logo PDF’ye eklenemedi', {
          description:
            'PDF oluşturulacak ancak firma logosu gösterilemeyebilir.',
        })
      }

      // React PDF yalnızca butona basıldığında yüklensin.
      const { pdf } = await import('@react-pdf/renderer')

      const blob = await pdf(
        <QuotationPDF
          quotation={quotation}
          items={items}
          company={companyForPdf}
          customer={customer}
        />
      ).toBlob()

      const url = URL.createObjectURL(blob)
      const downloadLink = document.createElement('a')

      const customerName = (
        customer?.company_name ||
        quotation.customer_snapshot?.company_name ||
        'musteri'
      ).toString()

      downloadLink.href = url
      downloadLink.download =
        `${safeFilename(quotation.quote_number)}_` +
        `${safeFilename(customerName)}.pdf`

      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)

      setTimeout(() => {
        URL.revokeObjectURL(url)
      }, 1000)

      toast.success('PDF indirildi', {
        description: quotation.quote_number,
      })
    } catch (error: unknown) {
      console.error('PDF error:', error)

      const message =
        error instanceof Error ? error.message : 'Bilinmeyen hata'

      toast.error('PDF oluşturma hatası', {
        description: message,
      })
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
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}

      PDF İndir
    </Button>
  )
}