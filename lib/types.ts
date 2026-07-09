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
