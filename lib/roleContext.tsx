'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from './supabase/client'

type Profile = {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'finance' | 'viewer'
}

type RoleContextType = {
  profile: Profile | null
  isAdmin: boolean
  isFinance: boolean
  isViewer: boolean
  canWrite: boolean
  loading: boolean
}

const RoleContext = createContext<RoleContextType>({
  profile: null,
  isAdmin: false,
  isFinance: false,
  isViewer: false,
  canWrite: false,
  loading: true,
})

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile({
        id: user.id,
        email: user.email || '',
        full_name: data?.full_name || '',
        role: data?.role || 'viewer',
      })
      setLoading(false)
    }
    load()
  }, [])

  const role = profile?.role
  return (
    <RoleContext.Provider value={{
      profile,
      isAdmin: role === 'admin',
      isFinance: role === 'finance',
      isViewer: role === 'viewer',
      canWrite: role === 'admin' || role === 'finance',
      loading,
    }}>
      {children}
    </RoleContext.Provider>
  )
}

export function useRole() {
  return useContext(RoleContext)
}