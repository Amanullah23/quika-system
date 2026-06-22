'use client'

import { useState } from 'react'
import { createClient } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #054247 0%, #0c7177 100%)',
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '420px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '8px',
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: '#0c7177',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '18px',
            }}>Q</div>
            <span style={{ fontSize: '22px', fontWeight: 700, color: '#054247' }}>
              Quika
            </span>
          </div>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            ISP Management System
          </p>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '6px',
            }}>
              Email address
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@quika.af"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#0c7177'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '6px',
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#0c7177'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          {error && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '13px',
              color: '#dc2626',
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? '#9ca3af' : '#0c7177',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: '4px',
              transition: 'background 0.2s',
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '12px',
          color: '#9ca3af',
        }}>
          Quika · Licensed ISP · Afghanistan
        </p>
      </div>
    </div>
  )
}