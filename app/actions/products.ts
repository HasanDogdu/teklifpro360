'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { z } from 'zod'

const ProductSchema = z.object({
  product_code: z.string().max(100).nullable().optional(),
  product_name: z.string().min(1, 'Ürün adı zorunludur').max(300),
  unit: z.string().max(50).default('adet'),
  unit_price: z.coerce.number().min(0, 'Birim fiyat negatif olamaz').max(999999999),
  vat_rate: z.coerce.number().min(0).max(100).default(20),
  description: z.string().max(2000).nullable().optional(),
  is_favorite: z.coerce.boolean().default(false),
})

export type ProductActionResult = { ok: true; id?: string } | { ok: false; error: string }

function toNull(v: unknown) {
  const s = typeof v === 'string' ? v.trim() : v
  return s === '' || s === undefined ? null : s
}

function normalize(input: Record<string, any>) {
  return {
    product_code: toNull(input.product_code),
    product_name: (input.product_name ?? '').trim(),
    unit: (input.unit ?? 'adet').trim() || 'adet',
    unit_price: input.unit_price ?? 0,
    vat_rate: input.vat_rate ?? 20,
    description: toNull(input.description),
    is_favorite: input.is_favorite ?? false,
  }
}

export async function createProduct(input: Record<string, any>): Promise<ProductActionResult> {
  const parsed = ProductSchema.safeParse(normalize(input))
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || 'Geçersiz veri' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Oturum bulunamadı' }

  const { data, error } = await supabase
    .from('products')
    .insert({ ...parsed.data, owner_id: user.id })
    .select('id')
    .single()

  if (error) return { ok: false, error: error.message }

  revalidatePath('/urunler')
  return { ok: true, id: data.id }
}

export async function updateProduct(id: string, input: Record<string, any>): Promise<ProductActionResult> {
  if (!id) return { ok: false, error: 'ID zorunludur' }

  const parsed = ProductSchema.safeParse(normalize(input))
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || 'Geçersiz veri' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Oturum bulunamadı' }

  const { error } = await supabase
    .from('products')
    .update(parsed.data)
    .eq('id', id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/urunler')
  return { ok: true, id }
}

export async function deleteProduct(id: string): Promise<ProductActionResult> {
  if (!id) return { ok: false, error: 'ID zorunludur' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Oturum bulunamadı' }

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { ok: false, error: error.message }

  revalidatePath('/urunler')
  return { ok: true, id }
}

export async function toggleFavorite(id: string, current: boolean): Promise<ProductActionResult> {
  if (!id) return { ok: false, error: 'ID zorunludur' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Oturum bulunamadı' }

  const { error } = await supabase
    .from('products')
    .update({ is_favorite: !current })
    .eq('id', id)

  if (error) return { ok: false, error: error.message }

  revalidatePath('/urunler')
  return { ok: true, id }
}
