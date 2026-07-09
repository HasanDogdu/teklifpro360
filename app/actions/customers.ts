'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const CustomerSchema = z.object({
  company_name: z.string().min(1, 'Firma adı zorunludur').max(200),
  contact_name: z.string().max(200).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email('Geçersiz e-posta').max(200).optional().nullable().or(z.literal('')),
  tax_office: z.string().max(200).optional().nullable(),
  tax_number: z.string().max(50).optional().nullable(),
  address: z.string().max(1000).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  district: z.string().max(100).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
})

export type CustomerActionResult = { ok: true; id?: string } | { ok: false; error: string }

function toNull(v: unknown) {
  const s = typeof v === 'string' ? v.trim() : v
  return s === '' || s === undefined ? null : s
}

function normalize(input: Record<string, any>) {
  return {
    company_name: (input.company_name ?? '').trim(),
    contact_name: toNull(input.contact_name),
    phone: toNull(input.phone),
    email: toNull(input.email),
    tax_office: toNull(input.tax_office),
    tax_number: toNull(input.tax_number),
    address: toNull(input.address),
    city: toNull(input.city),
    district: toNull(input.district),
    notes: toNull(input.notes),
  }
}

export async function createCustomer(input: Record<string, any>): Promise<CustomerActionResult> {
  const parsed = CustomerSchema.safeParse(normalize(input))
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || 'Geçersiz veri' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Oturum bulunamadı' }

  const { data, error } = await supabase
    .from('customers')
    .insert({ ...parsed.data, owner_id: user.id })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }

  revalidatePath('/musteriler')
  return { ok: true, id: data.id }
}

export async function updateCustomer(id: string, input: Record<string, any>): Promise<CustomerActionResult> {
  if (!id) return { ok: false, error: 'ID zorunludur' }

  const parsed = CustomerSchema.safeParse(normalize(input))
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || 'Geçersiz veri' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Oturum bulunamadı' }

  const { error } = await supabase
    .from('customers')
    .update(parsed.data)
    .eq('id', id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/musteriler')
  return { ok: true, id }
}

export async function deleteCustomer(id: string): Promise<CustomerActionResult> {
  if (!id) return { ok: false, error: 'ID zorunludur' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Oturum bulunamadı' }

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/musteriler')
  return { ok: true, id }
}
