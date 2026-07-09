import { createClient } from '@/utils/supabase/server'
import type { QuotationWithCustomer, Customer } from '@/lib/types'
import { QuotationsView } from './quotations-view'

export const dynamic = 'force-dynamic'

export default async function TekliflerPage() {
  const supabase = await createClient()

  const [{ data: quotationsData, error: qErr }, { data: customersData }] = await Promise.all([
    supabase
      .from('quotations')
      .select('*, customers(id, company_name, contact_name)')
      .order('created_at', { ascending: false }),
    supabase
      .from('customers')
      .select('id, company_name, contact_name, email, phone, tax_office, tax_number, address, city, district')
      .order('company_name', { ascending: true }),
  ])

  const setupError = qErr && (qErr.code === 'PGRST205' || /relation .*quotations/i.test(qErr.message))
    ? "Supabase'de \"quotations\" tablosu bulunamadı. Lütfen supabase/migrations/004_quotations.sql dosyasını Supabase SQL Editor'de çalıştırın."
    : null

  return (
    <QuotationsView
      quotations={(quotationsData ?? []) as QuotationWithCustomer[]}
      customers={(customersData ?? []) as Customer[]}
      setupError={setupError}
      loadError={!setupError && qErr ? qErr.message : null}
    />
  )
}
