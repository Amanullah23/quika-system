import { createClient } from './supabase/server'

export async function getCurrentProfile() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    id: user.id,
    email: user.email || '',
    full_name: profile?.full_name || '',
    role: profile?.role || 'viewer',
  }
}