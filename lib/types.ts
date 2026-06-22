export type CustomerStatus = 'active' | 'inactive' | 'suspended'

export type Package = {
  id: string
  name: string
  mbps: string
  price_afn: number
  description: string | null
  is_active: boolean
  created_at: string
}

export type Customer = {
  id: string
  customer_code: string
  full_name: string
  full_name_dari: string | null
  phone_1: string | null
  phone_2: string | null
  address_dari: string | null
  address_english: string | null
  zone: string | null
  package_id: string | null
  signup_date: string
  status: CustomerStatus
  comments: string | null
  created_at: string
  updated_at: string
  packages?: Package | null
}

export type BillingRecord = {
  id: string
  record_date: string
  customer_id: string
  bill_number: string | null
  amount_afn: number
  exchange_rate: number
  amount_usd: number
  running_total_afn: number
  payment_status: 'paid' | 'pending' | 'partial'
  comments: string | null
  created_at: string
  customers?: Customer | null
}