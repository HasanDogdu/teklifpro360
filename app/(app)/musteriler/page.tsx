import { createClient } from '@/utils/supabase/server'
import type { Customer } from '@/lib/types'
import { CustomersView } from './customers-view'

export const dynamic = 'force-dynamic'

export default async function MusterilerPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })

  const setupError = error && (error.code === 'PGRST205' || /relation .*customers/i.test(error.message))
    ? "Supabase'de \"customers\" tablosu bulunamadı. Lütfen supabase/migrations/001_customers.sql dosyasını Supabase SQL Editor'de çalıştırın."
    : null

  return (
    <CustomersView
      customers={(data ?? []) as Customer[]}
      setupError={setupError}
      loadError={!setupError && error ? error.message : null}
    />
  )
}
