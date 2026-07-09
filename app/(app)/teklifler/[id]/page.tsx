import { createClient } from '@/utils/supabase/server'
import { notFound, redirect } from 'next/navigation'
import type { Quotation, QuotationItem, Product, Customer, CompanySettings } from '@/lib/types'
import { QuotationEditor } from './quotation-editor'

export const dynamic = 'force-dynamic'

export default async function QuotationEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [
    { data: quotation },
    { data: items },
    { data: products },
    { data: customers },
    { data: company },
  ] = await Promise.all([
    supabase.from('quotations').select('*').eq('id', id).maybeSingle(),
    supabase.from('quotation_items').select('*').eq('quotation_id', id).order('position', { ascending: true }),
    supabase.from('products').select('*').order('is_favorite', { ascending: false }).order('product_name', { ascending: true }),
    supabase.from('customers').select('*'),
    supabase.from('company_settings').select('*').maybeSingle(),
  ])

  if (!quotation) notFound()

  const linkedCustomer = customers?.find((c) => c.id === quotation.customer_id) ?? null

  return (
    <QuotationEditor
      quotation={quotation as Quotation}
      initialItems={(items ?? []) as QuotationItem[]}
      products={(products ?? []) as Product[]}
      customer={linkedCustomer as Customer | null}
      company={(company ?? null) as CompanySettings | null}
    />
  )
}
