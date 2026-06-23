'use client'

import { useState } from 'react'
import { useRole } from '../../../lib/roleContext'
import { useRouter } from 'next/navigation'

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 13px',
  border: '1.5px solid #e5e7eb',
  borderRadius: '9px',
  fontSize: '13px',
  outline: 'none',
  background: '#f9fafb',
  color: '#111827',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '10px',
  fontWeight: 700,
  color: '#6b7280',
  marginBottom: '6px',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

const roleConfig: Record<string, { bg: string; color: string; border: string; icon: string; desc: string }> = {
  admin:   { bg: '#fef3c7', color: '#92400e', border: '#fde68a', icon: '👑', desc: 'Full control — all features including user management' },
  finance: { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe', icon: '💼', desc: 'Can add customers, record billing and view reports' },
  viewer:  { bg: '#f3f4f6', color: '#374151', border: '#e5e7eb', icon: '👁️', desc: 'Can view dashboard, customers, billing and reports' },
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

  function focusInput(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = '#1e40af'
    e.target.style.boxShadow = '0 0 0 3px rgba(30,64,175,0.08)'
    e.target.style.background = '#fff'
  }

  function blurInput(e: React.FocusEvent<HTMLInputElement>) {
    e.target.style.borderColor = '#e5e7eb'
    e.target.style.boxShadow = 'none'
    e.target.style.background = '#f9fafb'
  }

  async function handleSave() {
    setError('')
    setSuccess(false)
    if (!form.full_name.trim()) return setError('Full name is required')
    if (form.password && form.password.length < 6) return setError('Password must be at least 6 characters')
    if (form.password && form.password !== form.confirm_password) return setError('Passwords do not match')

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

  const rc = roleConfig[profile?.role || 'viewer']

  return (
    <div style={{ maxWidth: '600px' }}>
      <style>{`
        .prof-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        @media (max-width: 767px) {
          .prof-header { flex-direction: column !important; align-items: flex-start !important; gap: 10px !important; }
        }
      `}</style>

      {/* Header */}
      <div className="prof-header">
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
            My Profile
          </h2>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', fontWeight: 500 }}>
            Update your name and password
          </p>
        </div>
      </div>

      {/* Profile banner card */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
        borderRadius: '14px',
        padding: '24px',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(30,64,175,0.25)',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute', right: '-20px', top: '-20px',
          width: '120px', height: '120px',
          background: 'rgba(255,255,255,0.05)', borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', right: '60px', bottom: '-30px',
          width: '80px', height: '80px',
          background: 'rgba(255,255,255,0.04)', borderRadius: '50%',
        }} />

        {/* Avatar */}
        <div style={{
          width: '64px', height: '64px',
          background: 'rgba(255,255,255,0.2)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '26px', fontWeight: 800,
          flexShrink: 0, zIndex: 1,
          border: '3px solid rgba(255,255,255,0.3)',
        }}>
          {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
        </div>

        {/* Info */}
        <div style={{ zIndex: 1 }}>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#fff', letterSpacing: '-0.3px' }}>
            {profile?.full_name || 'User'}
          </div>
          <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
            {profile?.email}
          </div>
          <div style={{ marginTop: '8px' }}>
            <span style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              padding: '3px 10px', borderRadius: '20px',
              fontSize: '11px', fontWeight: 700,
              border: '1px solid rgba(255,255,255,0.2)',
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              textTransform: 'capitalize',
            }}>
              {rc?.icon} {profile?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Role info card */}
      <div style={{
        background: rc?.bg || '#f9fafb',
        border: `1px solid ${rc?.border || '#e5e7eb'}`,
        borderRadius: '12px',
        padding: '14px 18px',
        marginBottom: '16px',
        display: 'flex', alignItems: 'center', gap: '12px',
      }}>
        <span style={{ fontSize: '24px' }}>{rc?.icon}</span>
        <div>
          <div style={{
            fontSize: '12px', fontWeight: 700,
            color: rc?.color, textTransform: 'capitalize',
          }}>
            {profile?.role} Role
          </div>
          <div style={{ fontSize: '12px', color: rc?.color, opacity: 0.8, marginTop: '2px' }}>
            {rc?.desc}
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div style={{
        background: '#fff', borderRadius: '14px',
        padding: '24px',
        border: '1px solid #f3f4f6',
        boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
      }}>

        {error && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fecaca',
            borderRadius: '9px', padding: '11px 14px',
            color: '#dc2626', fontSize: '13px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            ⚠️ {error}
          </div>
        )}

        {success && (
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0',
            borderRadius: '9px', padding: '11px 14px',
            color: '#166534', fontSize: '13px', marginBottom: '20px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            ✅ Profile updated successfully
          </div>
        )}

        {/* Basic info section */}
        <div style={{
          fontSize: '13px', fontWeight: 700, color: '#1e40af',
          marginBottom: '14px', paddingBottom: '8px',
          borderBottom: '2px solid #eff6ff',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '16px' }}>👤</span> Basic Information
        </div>

        <div style={{ marginBottom: '24px' }}>
          <div style={{ marginBottom: '14px' }}>
            <label style={labelStyle}>Full Name *</label>
            <input
              style={inputStyle}
              value={form.full_name}
              onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
              onFocus={focusInput} onBlur={blurInput}
              placeholder="Your full name"
            />
          </div>

          <div>
            <label style={labelStyle}>Email Address</label>
            <div style={{
              ...inputStyle,
              background: '#f3f4f6',
              color: '#9ca3af',
              display: 'flex', alignItems: 'center', gap: '8px',
              cursor: 'not-allowed',
            }}>
              <span>✉️</span>
              {profile?.email}
            </div>
            <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '4px' }}>
              Email cannot be changed. Contact admin to update.
            </p>
          </div>
        </div>

        {/* Password section */}
        <div style={{
          fontSize: '13px', fontWeight: 700, color: '#1e40af',
          marginBottom: '14px', paddingBottom: '8px',
          borderBottom: '2px solid #eff6ff',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ fontSize: '16px' }}>🔒</span> Change Password
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
          <div>
            <label style={labelStyle}>New Password (leave empty to keep current)</label>
            <input
              type="password" style={inputStyle}
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              onFocus={focusInput} onBlur={blurInput}
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label style={labelStyle}>Confirm New Password</label>
            <input
              type="password" style={inputStyle}
              value={form.confirm_password}
              onChange={e => setForm(p => ({ ...p, confirm_password: e.target.value }))}
              onFocus={focusInput} onBlur={blurInput}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {form.password && form.confirm_password && form.password !== form.confirm_password && (
              <p style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>
                ⚠️ Passwords do not match
              </p>
            )}
            {form.password && form.confirm_password && form.password === form.confirm_password && (
              <p style={{ fontSize: '11px', color: '#166534', marginTop: '4px' }}>
                ✅ Passwords match
              </p>
            )}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleSave}
          disabled={loading}
          style={{
            padding: '12px 28px',
            background: loading ? '#9ca3af' : 'linear-gradient(135deg, #1e40af, #3b82f6)',
            color: '#fff', border: 'none', borderRadius: '9px',
            fontSize: '13px', fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'inherit',
            boxShadow: loading ? 'none' : '0 2px 8px rgba(30,64,175,0.25)',
          }}
        >
          {loading ? 'Saving...' : '💾 Save Changes'}
        </button>
      </div>
    </div>
  )
}