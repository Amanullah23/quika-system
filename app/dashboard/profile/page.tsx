'use client'

import { useState } from 'react'
import { useRole } from '../../../lib/roleContext'
import { useRouter } from 'next/navigation'

const inputStyle = {
  width: '100%',
  padding: '9px 14px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '8px',
  fontSize: '14px',
  outline: 'none',
  background: '#fff',
  color: '#111827',
}

const labelStyle = {
  display: 'block' as const,
  fontSize: '13px',
  fontWeight: 500 as const,
  color: '#374151',
  marginBottom: '6px',
}

const roleColors: Record<string, { bg: string; color: string }> = {
  admin:   { bg: '#fef3c7', color: '#92400e' },
  finance: { bg: '#dbeafe', color: '#1e40af' },
  viewer:  { bg: '#f3f4f6', color: '#374151' },
}

const roleDesc: Record<string, string> = {
  admin: 'Full control — all features including user management',
  finance: 'Can add customers, record billing, and view reports',
  viewer: 'Can view dashboard, customers, billing, and reports',
}

export default function ProfilePage() {
  const { profile } = useRole()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    password: '',
    confirm_password: '',
  })

  async function handleSave() {
    setError('')
    setSuccess(false)

    if (!form.full_name.trim()) return setError('Full name is required')
    if (form.password && form.password.length < 6) {
      return setError('Password must be at least 6 characters')
    }
    if (form.password && form.password !== form.confirm_password) {
      return setError('Passwords do not match')
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/users/${profile?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: form.full_name,
          password: form.password || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      setSuccess(true)
      setForm(p => ({ ...p, password: '', confirm_password: '' }))
      router.refresh()
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const rc = roleColors[profile?.role || 'viewer']

  return (
    <div style={{ maxWidth: '560px' }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
          My Profile
        </h2>
        <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
          Update your name and password
        </p>
      </div>

      {/* Profile card */}
      <div style={{
        background: '#ffffff', borderRadius: '12px',
        padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        marginBottom: '16px',
      }}>
        {/* Avatar + info */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '16px',
          marginBottom: '28px', paddingBottom: '24px',
          borderBottom: '1px solid #f3f4f6',
        }}>
          <div style={{
            width: '64px', height: '64px', background: '#0c7177',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', color: '#fff',
            fontSize: '24px', fontWeight: 700, flexShrink: 0,
          }}>
            {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>
              {profile?.full_name || 'User'}
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
              {profile?.email}
            </div>
            <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                background: rc.bg, color: rc.color,
                padding: '3px 10px', borderRadius: '20px',
                fontSize: '12px', fontWeight: 700, textTransform: 'capitalize',
              }}>
                {profile?.role}
              </span>
              <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                {roleDesc[profile?.role || 'viewer']}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '8px', padding: '10px 14px',
            color: '#dc2626', fontSize: '13px', marginBottom: '20px',
          }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: '8px', padding: '10px 14px',
            color: '#166534', fontSize: '13px', marginBottom: '20px',
          }}>
            ✅ Profile updated successfully
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={labelStyle}>Full Name *</label>
            <input
              style={inputStyle}
              value={form.full_name}
              onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
              placeholder="Your full name"
            />
          </div>

          <div style={{
            paddingTop: '16px',
            borderTop: '1px solid #f3f4f6',
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '16px' }}>
              Change Password
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>New Password (leave empty to keep current)</label>
                <input
                  type="password"
                  style={inputStyle}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label style={labelStyle}>Confirm New Password</label>
                <input
                  type="password"
                  style={inputStyle}
                  value={form.confirm_password}
                  onChange={e => setForm(p => ({ ...p, confirm_password: e.target.value }))}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '24px' }}>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              padding: '11px 28px',
              background: loading ? '#9ca3af' : '#0c7177',
              color: '#fff', border: 'none', borderRadius: '8px',
              fontSize: '14px', fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}