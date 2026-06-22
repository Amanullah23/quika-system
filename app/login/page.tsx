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

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Inter', sans-serif; }

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #054247 0%, #0c7177 100%);
          padding: 16px;
        }

        .login-card {
          background: #ffffff;
          border-radius: 16px;
          padding: 40px 36px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }

        .login-logo {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 32px;
          gap: 10px;
        }

        .login-logo-icon {
          width: 52px;
          height: 52px;
          background: #0c7177;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          font-weight: 800;
          font-size: 22px;
        }

        .login-logo-title {
          font-size: 22px;
          font-weight: 800;
          color: #054247;
          letter-spacing: -0.5px;
        }

        .login-logo-sub {
          font-size: 13px;
          color: #6b7280;
          margin-top: -4px;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .login-field label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }

        .login-field input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 9px;
          font-size: 15px;
          outline: none;
          transition: border-color 0.2s;
          color: #111827;
          background: #fff;
          font-family: inherit;
        }

        .login-field input:focus {
          border-color: #0c7177;
          box-shadow: 0 0 0 3px rgba(12,113,119,0.08);
        }

        .login-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: #dc2626;
        }

        .login-btn {
          width: 100%;
          padding: 13px;
          background: #0c7177;
          color: #fff;
          border: none;
          border-radius: 9px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s;
          font-family: inherit;
          margin-top: 4px;
          letter-spacing: 0.2px;
        }

        .login-btn:hover:not(:disabled) {
          background: #054247;
        }

        .login-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .login-footer {
          text-align: center;
          margin-top: 24px;
          font-size: 12px;
          color: #9ca3af;
        }

        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 4px 0;
        }

        .login-divider-line {
          flex: 1;
          height: 1px;
          background: #f3f4f6;
        }

        /* Mobile */
        @media (max-width: 480px) {
          .login-card {
            padding: 32px 20px;
            border-radius: 14px;
          }

          .login-logo-title {
            font-size: 20px;
          }

          .login-field input {
            font-size: 16px; /* prevents iOS zoom */
            padding: 12px 14px;
          }

          .login-btn {
            padding: 14px;
            font-size: 16px;
          }
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">

          {/* Logo */}
          <div className="login-logo">
            <div className="login-logo-icon">Q</div>
            <div>
              <div className="login-logo-title">Quika</div>
              <div className="login-logo-sub">ISP Management System</div>
            </div>
          </div>

          {/* Form */}
          <div className="login-form">
            <div className="login-field">
              <label>Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="you@quika.af"
                autoComplete="email"
                autoCapitalize="none"
              />
            </div>

            <div className="login-field">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              className="login-btn"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          {/* Footer */}
          <div className="login-footer">
            Quika · Licensed ISP · Afghanistan 🇦🇫
          </div>
        </div>
      </div>
    </>
  )
}