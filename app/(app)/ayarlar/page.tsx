import { createClient } from '@/utils/supabase/server'
import type { CompanySettings } from '@/lib/types'
import { SettingsView } from './settings-view'

export const dynamic = 'force-dynamic'

export default async function AyarlarPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('company_settings')
    .select('*')
    .maybeSingle()

  const setupError = error && (error.code === 'PGRST205' || /relation .*company_settings/i.test(error.message))
    ? "Supabase'de \"company_settings\" tablosu bulunamadı. Lütfen supabase/migrations/002_company_settings.sql dosyasını Supabase SQL Editor'de çalıştırın."
    : null

  return (
    <SettingsView
      initialSettings={(data ?? null) as CompanySettings | null}
      setupError={setupError}
      loadError={!setupError && error ? error.message : null}
    />
  )
}
