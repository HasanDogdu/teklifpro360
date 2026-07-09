export type Customer = {
  id: string
  owner_id: string
  company_name: string
  contact_name: string | null
  phone: string | null
  email: string | null
  tax_office: string | null
  tax_number: string | null
  address: string | null
  city: string | null
  district: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type CustomerInput = Omit<Customer, 'id' | 'owner_id' | 'created_at' | 'updated_at'>

export type Currency = 'TRY' | 'USD' | 'EUR'

export type CompanySettings = {
  id: string
  owner_id: string
  company_name: string
  logo_url: string | null
  authorized_person: string | null
  phone: string | null
  email: string | null
  website: string | null
  tax_office: string | null
  tax_number: string | null
  address: string | null
  city: string | null
  district: string | null
  iban: string | null
  default_currency: Currency
  default_vat_rate: number
  default_payment_terms: string | null
  default_validity_days: number
  quotation_footer_notes: string | null
  show_logo: boolean
  show_signature: boolean
  show_stamp: boolean
  created_at: string
  updated_at: string
}

export type CompanySettingsInput = Omit<CompanySettings, 'id' | 'owner_id' | 'created_at' | 'updated_at'>

export type Product = {
  id: string
  owner_id: string
  product_code: string | null
  product_name: string
  unit: string
  unit_price: number
  vat_rate: number
  description: string | null
  is_favorite: boolean
  created_at: string
  updated_at: string
}

export type ProductInput = Omit<Product, 'id' | 'owner_id' | 'created_at' | 'updated_at'>
