import { createClient } from '@/utils/supabase/server'
import type { Product } from '@/lib/types'
import { ProductsView } from './products-view'

export const dynamic = 'force-dynamic'

export default async function UrunlerPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('is_favorite', { ascending: false })
    .order('created_at', { ascending: false })

  const setupError = error && (error.code === 'PGRST205' || /relation .*products/i.test(error.message))
    ? "Supabase'de \"products\" tablosu bulunamadı. Lütfen supabase/migrations/003_products.sql dosyasını Supabase SQL Editor'de çalıştırın."
    : null

  return (
    <ProductsView
      products={(data ?? []) as Product[]}
      setupError={setupError}
      loadError={!setupError && error ? error.message : null}
    />
  )
}
