export type Customer = {
  id: string
  owner_id: string
  company_name: string
  contact_name: string | null
  phone: string | null
  email: string | null
 tax_office: string | null
tax_number: string | null
registry_number: string | null
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

export type QuotationStatus = 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired'

export type Quotation = {
  id: string
  owner_id: string
  quote_number: string
  customer_id: string | null
  customer_snapshot: any | null
  issue_date: string
  valid_until: string | null
  status: QuotationStatus
  currency: Currency
  vat_rate: number
  payment_terms: string | null
  footer_notes: string | null
  subtotal: number
  vat_amount: number
  discount_amount: number
  total: number
  notes: string | null
  created_at: string
  updated_at: string
}

export type QuotationWithCustomer = Quotation & {
  customers: Pick<Customer, 'id' | 'company_name' | 'contact_name'> | null
}

export type QuotationItem = {
  id: string
  owner_id: string
  quotation_id: string
  product_id: string | null
  position: number
  product_code: string | null
  description: string
  unit: string
  quantity: number
  unit_price: number
  discount_rate: number
  vat_rate: number
  line_total: number
  created_at: string
  updated_at: string
}
