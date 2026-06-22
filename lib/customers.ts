import { createClient } from './supabase/server'
import type { Customer, Package } from './types'

export async function getCustomers(search?: string, status?: string) {
  const supabase = await createClient()

  let query = supabase
    .from('customers')
    .select(`
      *,
      packages (
        id, name, mbps, price_afn
      )
    `)
    .order('created_at', { ascending: false })

  if (search) {
    query = query.or(
      `full_name.ilike.%${search}%,customer_code.ilike.%${search}%,phone_1.ilike.%${search}%`
    )
  }

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) throw error
  return data as Customer[]
}

export async function getCustomerById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('customers')
    .select(`*, packages (*)`)
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Customer
}

export async function getPackages() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('packages')
    .select('*')
    .eq('is_active', true)
    .order('price_afn')

  if (error) throw error
  return data as Package[]
}

export async function createCustomer(formData: {
  customer_code: string
  full_name: string
  full_name_dari?: string
  phone_1?: string
  phone_2?: string
  address_dari?: string
  address_english?: string
  zone?: string
  package_id?: string
  signup_date: string
  status: string
  comments?: string
}) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('customers')
    .insert([formData])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateCustomer(id: string, formData: Partial<{
  customer_code: string
  full_name: string
  full_name_dari: string
  phone_1: string
  phone_2: string
  address_dari: string
  address_english: string
  zone: string
  package_id: string
  signup_date: string
  status: string
  comments: string
}>) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('customers')
    .update(formData)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', id)

  if (error) throw error
}