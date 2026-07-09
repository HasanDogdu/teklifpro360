'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'
import type { CompanySettings } from '@/lib/types'

const CompanySchema = z.object({
  company_name: z.string().max(200).default(''),
  logo_url: z.string().url().max(1000).nullable().optional(),
  authorized_person: z.string().max(200).nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
  email: z.string().max(200).nullable().optional().refine(
    (v) => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    'Geçersiz e-posta'
  ),
  website: z.string().max(500).nullable().optional(),
  tax_office: z.string().max(200).nullable().optional(),
  tax_number: z.string().max(50).nullable().optional(),
  address: z.string().max(2000).nullable().optional(),
  city: z.string().max(100).nullable().optional(),
  district: z.string().max(100).nullable().optional(),
  iban: z.string().max(50).nullable().optional(),

  default_currency: z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
  default_vat_rate: z.coerce.number().min(0).max(100).default(20),
  default_payment_terms: z.string().max(500).nullable().optional(),
  default_validity_days: z.coerce.number().int().min(0).max(3650).default(30),

  quotation_footer_notes: z.string().max(4000).nullable().optional(),

  show_logo: z.coerce.boolean().default(true),
  show_signature: z.coerce.boolean().default(true),
  show_stamp: z.coerce.boolean().default(false),
})

export type CompanyActionResult =
  | { ok: true; data: CompanySettings }
  | { ok: false; error: string }

function toNull(v: unknown) {
  const s = typeof v === 'string' ? v.trim() : v
  return s === '' || s === undefined ? null : s
}

function normalize(input: Record<string, any>) {
  return {
    company_name: (input.company_name ?? '').trim(),
    logo_url: toNull(input.logo_url),
    authorized_person: toNull(input.authorized_person),
    phone: toNull(input.phone),
    email: toNull(input.email),
    website: toNull(input.website),
    tax_office: toNull(input.tax_office),
    tax_number: toNull(input.tax_number),
    address: toNull(input.address),
    city: toNull(input.city),
    district: toNull(input.district),
    iban: toNull(input.iban),
    default_currency: input.default_currency ?? 'TRY',
    default_vat_rate: input.default_vat_rate ?? 20,
    default_payment_terms: toNull(input.default_payment_terms),
    default_validity_days: input.default_validity_days ?? 30,
    quotation_footer_notes: toNull(input.quotation_footer_notes),
    show_logo: input.show_logo ?? true,
    show_signature: input.show_signature ?? true,
    show_stamp: input.show_stamp ?? false,
  }
}

export async function upsertCompanySettings(input: Record<string, any>): Promise<CompanyActionResult> {
  const parsed = CompanySchema.safeParse(normalize(input))
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || 'Geçersiz veri' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Oturum bulunamadı' }

  const { data, error } = await supabase
    .from('company_settings')
    .upsert({ ...parsed.data, owner_id: user.id }, { onConflict: 'owner_id' })
    .select('*')
    .single()

  if (error) return { ok: false, error: error.message }

  revalidatePath('/ayarlar')
  revalidatePath('/dashboard')
  return { ok: true, data: data as CompanySettings }
}

export async function removeLogo(): Promise<CompanyActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Oturum bulunamadı' }

  // Best-effort remove stored objects under user's folder
  const { data: files } = await supabase.storage.from('company-logos').list(user.id, { limit: 100 })
  if (files && files.length > 0) {
    const paths = files.map((f) => `${user.id}/${f.name}`)
    await supabase.storage.from('company-logos').remove(paths)
  }

  const { data, error } = await supabase
    .from('company_settings')
    .update({ logo_url: null })
    .eq('owner_id', user.id)
    .select('*')
    .single()

  if (error) return { ok: false, error: error.message }

  revalidatePath('/ayarlar')
  return { ok: true, data: data as CompanySettings }
}
