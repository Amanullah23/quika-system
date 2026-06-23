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

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Inter', sans-serif;
          background: #f1f5f9;
        }

        /* Left panel — branding */
        .login-left {
          width: 45%;
          background: linear-gradient(145deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%);
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          position: relative;
          overflow: hidden;
        }

        .login-left-deco1 {
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: rgba(255,255,255,0.05);
          top: -80px; right: -80px;
        }
        .login-left-deco2 {
          position: absolute;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          bottom: 60px; left: -60px;
        }
        .login-left-deco3 {
          position: absolute;
          width: 120px; height: 120px;
          border-radius: 50%;
          background: rgba(245,158,11,0.15);
          bottom: 200px; right: 40px;
        }

        .login-left-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 1;
        }

        .login-left-logo-icon {
          width: 44px; height: 44px;
          background: rgba(255,255,255,0.15);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; font-weight: 800; color: #fff;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.2);
        }

        .login-left-logo-text {
          color: #fff;
          font-size: 20px;
          font-weight: 800;
          letter-spacing: -0.3px;
        }

        .login-left-logo-sub {
          color: rgba(255,255,255,0.6);
          font-size: 11px;
          font-weight: 500;
          margin-top: 1px;
        }

        .login-left-content {
          z-index: 1;
        }

        .login-left-content h1 {
          font-size: 32px;
          font-weight: 800;
          color: #ffffff;
          line-height: 1.2;
          letter-spacing: -0.5px;
          margin-bottom: 14px;
        }

        .login-left-content p {
          font-size: 14px;
          color: rgba(255,255,255,0.65);
          line-height: 1.7;
          max-width: 320px;
        }

        .login-left-features {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 28px;
        }

        .login-left-feature {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(255,255,255,0.8);
          font-weight: 500;
        }

        .login-left-feature-dot {
          width: 6px; height: 6px;
          background: #f59e0b;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .login-left-footer {
          font-size: 12px;
          color: rgba(255,255,255,0.4);
          z-index: 1;
        }

        /* Right panel — form */
        .login-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
        }

        .login-card-header {
          margin-bottom: 32px;
        }

        .login-card-header h2 {
          font-size: 24px;
          font-weight: 800;
          color: #111827;
          letter-spacing: -0.4px;
          margin-bottom: 6px;
        }

        .login-card-header p {
          font-size: 13px;
          color: #6b7280;
          font-weight: 400;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .login-field label {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: #374151;
          margin-bottom: 7px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .login-field input {
          width: 100%;
          padding: 12px 14px;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          color: #111827;
          background: #fff;
          font-family: inherit;
        }

        .login-field input:focus {
          border-color: #1e40af;
          box-shadow: 0 0 0 3px rgba(30,64,175,0.08);
        }

        .login-field input::placeholder {
          color: #d1d5db;
        }

        .login-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 9px;
          padding: 11px 14px;
          font-size: 13px;
          color: #dc2626;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .login-btn {
          width: 100%;
          padding: 13px;
          background: linear-gradient(135deg, #1e40af, #3b82f6);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          font-family: inherit;
          letter-spacing: 0.2px;
          box-shadow: 0 3px 12px rgba(30,64,175,0.3);
        }

        .login-btn:hover:not(:disabled) {
          opacity: 0.92;
          transform: translateY(-1px);
        }

        .login-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .login-card-footer {
          margin-top: 24px;
          text-align: center;
          font-size: 12px;
          color: #9ca3af;
        }

        /* Mobile — single column */
        @media (max-width: 768px) {
          .login-root {
            flex-direction: column;
          }

          .login-left {
            width: 100%;
            padding: 28px 24px;
            min-height: auto;
          }

          .login-left-content h1 {
            font-size: 22px;
          }

          .login-left-content p {
            font-size: 13px;
          }

          .login-left-features {
            display: none;
          }

          .login-left-footer {
            display: none;
          }

          .login-left-content {
            margin-top: 24px;
          }

          .login-right {
            padding: 28px 20px 40px;
            align-items: flex-start;
          }

          .login-card {
            max-width: 100%;
          }

          .login-card-header {
            margin-bottom: 24px;
          }

          .login-card-header h2 {
            font-size: 20px;
          }

          .login-field input {
            font-size: 16px;
            padding: 13px 14px;
          }

          .login-btn {
            padding: 14px;
            font-size: 15px;
          }
        }
      `}</style>

      <div className="login-root">

        {/* ── Left panel ── */}
        <div className="login-left">
          <div className="login-left-deco1" />
          <div className="login-left-deco2" />
          <div className="login-left-deco3" />

          {/* Logo */}
          <div className="login-left-logo">
            <div className="login-left-logo-icon">Q</div>
            <div>
              <div className="login-left-logo-text">Quika</div>
              <div className="login-left-logo-sub">ISP Management System</div>
            </div>
          </div>

          {/* Content */}
          <div className="login-left-content">
            <h1>Manage your ISP business smarter</h1>
            <p>
              Complete billing, customer management, and reporting system
              built for Quika — Afghanistan's licensed internet provider.
            </p>
            <div className="login-left-features">
              {[
                'Daily billing records in AFN & USD',
                'Customer management with Dari support',
                'Reports, exports and daily backups',
                'Role-based access for your team',
              ].map(f => (
                <div key={f} className="login-left-feature">
                  <div className="login-left-feature-dot" />
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="login-left-footer">
            © 2026 Quika · Licensed ISP · Kabul, Afghanistan 🇦🇫
          </div>
        </div>

        {/* ── Right panel ── */}
        <div className="login-right">
          <div className="login-card">

            <div className="login-card-header">
              <h2>Welcome back 👋</h2>
              <p>Sign in to your Quika account to continue</p>
            </div>

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
                  ⚠️ {error}
                </div>
              )}

              <button
                className="login-btn"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in to Quika'}
              </button>
            </div>

            <div className="login-card-footer">
              Quika · Licensed ISP · Afghanistan 🇦🇫
            </div>
          </div>
        </div>
      </div>
    </>
  )
}