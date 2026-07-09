'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const DraftSchema = z.object({
  customer_id: z.string().uuid('Lütfen bir müşteri seçin'),
  issue_date: z.string().min(1, 'Teklif tarihi zorunludur'),
  valid_until: z.string().optional().nullable(),
  quote_number: z.string().min(1, 'Teklif numarası zorunludur').max(100),
})

export type QuotationActionResult =
  | { ok: true; id: string; quote_number: string }
  | { ok: false; error: string }

/**
 * Generate next quote number for the current user, format: TKL-YYYY-NNNN
 * Numbering resets each year and is per-owner.
 */
export async function suggestQuoteNumber(): Promise<{ ok: true; quote_number: string } | { ok: false; error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Oturum bulunamadı' }

  const year = new Date().getFullYear()
  const prefix = `TKL-${year}-`

  // Fetch existing quote numbers for this year, extract max suffix
  const { data, error } = await supabase
    .from('quotations')
    .select('quote_number')
    .eq('owner_id', user.id)
    .ilike('quote_number', `${prefix}%`)

  if (error) return { ok: false, error: error.message }

  let max = 0
  for (const row of data ?? []) {
    const m = /-(\d+)$/.exec(row.quote_number as string)
    if (m) {
      const n = parseInt(m[1], 10)
      if (Number.isFinite(n) && n > max) max = n
    }
  }
  const next = String(max + 1).padStart(4, '0')
  return { ok: true, quote_number: `${prefix}${next}` }
}

export async function createDraftQuotation(input: Record<string, any>): Promise<QuotationActionResult> {
  const parsed = DraftSchema.safeParse({
    customer_id: input.customer_id,
    issue_date: input.issue_date,
    valid_until: input.valid_until || null,
    quote_number: (input.quote_number ?? '').trim(),
  })
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || 'Geçersiz veri' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Oturum bulunamadı' }

  // Pull customer for snapshot
  const { data: customer } = await supabase
    .from('customers')
    .select('id, company_name, contact_name, email, phone, tax_office, tax_number, address, city, district')
    .eq('id', parsed.data.customer_id)
    .maybeSingle()

  if (!customer) return { ok: false, error: 'Müşteri bulunamadı' }

  // Pull defaults from company_settings (currency, vat, payment terms, footer)
  const { data: settings } = await supabase
    .from('company_settings')
    .select('default_currency, default_vat_rate, default_payment_terms, quotation_footer_notes')
    .maybeSingle()

  const { data, error } = await supabase
    .from('quotations')
    .insert({
      owner_id: user.id,
      quote_number: parsed.data.quote_number,
      customer_id: parsed.data.customer_id,
      customer_snapshot: customer,
      issue_date: parsed.data.issue_date,
      valid_until: parsed.data.valid_until,
      status: 'draft',
      currency: settings?.default_currency ?? 'TRY',
      vat_rate: settings?.default_vat_rate ?? 20,
      payment_terms: settings?.default_payment_terms ?? null,
      footer_notes: settings?.quotation_footer_notes ?? null,
    })
    .select('id, quote_number')
    .single()

  if (error) {
    if (error.code === '23505') {
      return { ok: false, error: 'Bu teklif numarası zaten kullanılıyor. Lütfen farklı bir numara girin.' }
    }
    return { ok: false, error: error.message }
  }

  revalidatePath('/teklifler')
  return { ok: true, id: data.id, quote_number: data.quote_number }
}

export async function deleteQuotation(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!id) return { ok: false, error: 'ID zorunludur' }
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Oturum bulunamadı' }

  const { error } = await supabase.from('quotations').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }
  revalidatePath('/teklifler')
  return { ok: true }
}
