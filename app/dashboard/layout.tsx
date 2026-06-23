'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import { RoleProvider, useRole } from '../../lib/roleContext'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', color: '#6366f1', roles: ['admin', 'finance', 'viewer'] },
  { href: '/dashboard/customers', label: 'Customers', icon: '👥', color: '#0ea5e9', roles: ['admin', 'finance', 'viewer'] },
  { href: '/dashboard/billing', label: 'Daily Billing', icon: '💰', color: '#10b981', roles: ['admin', 'finance', 'viewer'] },
  { href: '/dashboard/reports', label: 'Reports', icon: '📈', color: '#f59e0b', roles: ['admin', 'finance', 'viewer'] },
  { href: '/dashboard/packages', label: 'Packages', icon: '📦', color: '#8b5cf6', roles: ['admin'] },
  { href: '/dashboard/users', label: 'Users', icon: '🔐', color: '#ef4444', roles: ['admin'] },
  { href: '/dashboard/backups', label: 'Backups', icon: '💾', color: '#14b8a6', roles: ['admin'] },
]

const roleColors: Record<string, { bg: string; color: string }> = {
  admin:   { bg: '#fef3c7', color: '#92400e' },
  finance: { bg: '#dbeafe', color: '#1e40af' },
  viewer:  { bg: '#f3f4f6', color: '#374151' },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <LayoutInner>{children}</LayoutInner>
    </RoleProvider>
  )
}

function LayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const { profile } = useRole()

  const roleBadge = roleColors[profile?.role || 'viewer']
  const visibleNav = navItems.filter(i => i.roles.includes(profile?.role || 'viewer'))
  const bottomNavItems = visibleNav.slice(0, 5)

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768) }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => { setMobileSidebarOpen(false) }, [pathname])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const currentPage = navItems.find(i =>
    i.href === pathname ||
    (i.href !== '/dashboard' && pathname.startsWith(i.href))
  )

  const SIDEBAR_W = sidebarOpen ? 240 : 68

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>

      {/* Mobile overlay */}
      {isMobile && mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 98, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        width: isMobile ? '260px' : `${SIDEBAR_W}px`,
        background: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0,
        height: '100vh',
        zIndex: 99,
        transition: 'transform 0.25s ease, width 0.25s ease',
        transform: isMobile
          ? mobileSidebarOpen ? 'translateX(0)' : 'translateX(-100%)'
          : 'translateX(0)',
        overflow: 'hidden',
        boxShadow: isMobile && mobileSidebarOpen
          ? '4px 0 24px rgba(0,0,0,0.1)'
          : 'none',
      }}>

        {/* Logo */}
        <div style={{
          height: '64px',
          padding: '0 16px',
          borderBottom: '1px solid #f3f4f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px',
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 800, fontSize: '16px',
              flexShrink: 0,
              boxShadow: '0 2px 8px rgba(30,64,175,0.3)',
            }}>Q</div>
            {(isMobile || sidebarOpen) && (
              <div>
                <div style={{ color: '#111827', fontWeight: 800, fontSize: '15px', letterSpacing: '-0.3px' }}>
                  Quika
                </div>
                <div style={{ color: '#9ca3af', fontSize: '10px', fontWeight: 500 }}>
                  ISP System
                </div>
              </div>
            )}
          </div>
          {isMobile && (
            <button onClick={() => setMobileSidebarOpen(false)} style={{
              background: '#f3f4f6', border: 'none',
              color: '#6b7280', width: '28px', height: '28px',
              borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>✕</button>
          )}
        </div>

        {/* Nav label */}
        {(isMobile || sidebarOpen) && (
          <div style={{
            padding: '16px 16px 6px',
            fontSize: '10px', fontWeight: 700,
            color: '#9ca3af', letterSpacing: '0.08em',
            textTransform: 'uppercase', flexShrink: 0,
          }}>
            Navigation
          </div>
        )}

        {/* Nav */}
        <nav
          id="sidebar-nav"
          style={{
            flex: 1,
            padding: '4px 10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            overflowY: 'auto',
            overflowX: 'hidden',
          }}
        >
          {visibleNav.map(item => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            const showLabel = isMobile || sidebarOpen
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex',
                alignItems: 'center',
                gap: showLabel ? '10px' : '0',
                justifyContent: showLabel ? 'flex-start' : 'center',
                padding: showLabel ? '9px 10px' : '9px 0',
                borderRadius: '9px',
                textDecoration: 'none',
                background: isActive ? '#eff6ff' : 'transparent',
                color: isActive ? '#1e40af' : '#6b7280',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 500,
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                borderLeft: isActive ? '3px solid #1e40af' : '3px solid transparent',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = '#f9fafb'
                  ;(e.currentTarget as HTMLElement).style.color = '#374151'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = '#6b7280'
                }
              }}
              >
                {/* Icon badge */}
                <div style={{
                  width: '30px', height: '30px',
                  background: isActive ? item.color : '#f3f4f6',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '15px', flexShrink: 0,
                  transition: 'background 0.15s',
                }}>
                  {item.icon}
                </div>
                {showLabel && item.label}
              </Link>
            )
          })}
        </nav>

        {/* Divider */}
        <div style={{ height: '1px', background: '#f3f4f6', margin: '0 10px', flexShrink: 0 }} />

        {/* Bottom section */}
        <div style={{
          padding: '10px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          flexShrink: 0,
        }}>

          {/* Dark mode placeholder */}
          {(isMobile || sidebarOpen) && (
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderRadius: '9px',
              background: '#f9fafb',
              marginBottom: '4px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '30px', height: '30px',
                  background: '#f3f4f6', borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '15px',
                }}>🌙</div>
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#6b7280' }}>Dark mode</span>
              </div>
              <div style={{
                width: '36px', height: '20px',
                background: '#e5e7eb', borderRadius: '10px',
                position: 'relative', cursor: 'pointer',
              }}>
                <div style={{
                  width: '14px', height: '14px',
                  background: '#fff', borderRadius: '50%',
                  position: 'absolute', top: '3px', left: '3px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                }} />
              </div>
            </div>
          )}

          {/* Desktop collapse */}
          {!isMobile && (
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
              display: 'flex', alignItems: 'center',
              gap: sidebarOpen ? '10px' : '0',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              padding: sidebarOpen ? '8px 10px' : '8px 0',
              borderRadius: '9px', background: 'transparent',
              border: 'none', color: '#9ca3af',
              fontSize: '12px', cursor: 'pointer', width: '100%',
              whiteSpace: 'nowrap', fontWeight: 500,
            }}>
              <div style={{
                width: '30px', height: '30px',
                background: '#f3f4f6', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '13px', flexShrink: 0,
              }}>
                {sidebarOpen ? '◀' : '▶'}
              </div>
              {sidebarOpen && 'Collapse'}
            </button>
          )}

          {/* Profile */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            borderRadius: '9px',
            background: '#f9fafb',
            marginTop: '4px',
            cursor: 'pointer',
          }}
          onClick={() => setShowProfile(!showProfile)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              <div style={{
                width: '32px', height: '32px',
                background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: '13px', fontWeight: 700, flexShrink: 0,
              }}>
                {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              {(isMobile || sidebarOpen) && (
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <div style={{
                    fontSize: '12px', fontWeight: 700, color: '#111827',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {profile?.full_name || 'User'}
                  </div>
                  <div style={{
                    fontSize: '10px', color: '#9ca3af',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {profile?.role}
                  </div>
                </div>
              )}
            </div>
            {(isMobile || sidebarOpen) && (
              <button
                onClick={(e) => { e.stopPropagation(); handleLogout() }}
                title="Sign out"
                style={{
                  background: 'none', border: 'none',
                  color: '#9ca3af', cursor: 'pointer',
                  fontSize: '16px', padding: '2px',
                  display: 'flex', alignItems: 'center',
                  flexShrink: 0,
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = '#ef4444'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = '#9ca3af'}
              >
                →
              </button>
            )}
          </div>

          {/* Profile popup */}
          {showProfile && (isMobile || sidebarOpen) && (
            <div style={{
              background: '#f9fafb',
              borderRadius: '9px', padding: '8px',
              border: '1px solid #e5e7eb',
              display: 'flex', flexDirection: 'column', gap: '4px',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', padding: '2px 4px',
              }}>
                <span style={{ fontSize: '11px', color: '#9ca3af' }}>Role</span>
                <span style={{
                  fontSize: '10px', fontWeight: 700,
                  background: roleBadge.bg, color: roleBadge.color,
                  padding: '2px 7px', borderRadius: '8px',
                  textTransform: 'capitalize',
                }}>
                  {profile?.role}
                </span>
              </div>
              <Link
                href="/dashboard/profile"
                onClick={() => setShowProfile(false)}
                style={{
                  display: 'block', padding: '7px 10px',
                  background: '#fff', border: '1px solid #e5e7eb',
                  color: '#374151', borderRadius: '7px',
                  textDecoration: 'none', fontSize: '12px',
                  textAlign: 'center', fontWeight: 500,
                }}
              >
                ✏️ Edit Profile
              </Link>
              <button
                onClick={handleLogout}
                style={{
                  padding: '7px 10px',
                  background: '#fef2f2', border: '1px solid #fecaca',
                  color: '#dc2626', borderRadius: '7px',
                  fontSize: '12px', fontWeight: 600,
                  cursor: 'pointer', width: '100%',
                }}
              >
                🚪 Sign out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{
        flex: 1,
        marginLeft: isMobile ? 0 : `${SIDEBAR_W}px`,
        transition: 'margin-left 0.25s ease',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: isMobile ? '64px' : 0,
      }}>

        {/* Top bar */}
        <header style={{
          background: '#ffffff',
          borderBottom: '1px solid #e5e7eb',
          height: '60px',
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0, zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isMobile && (
              <button onClick={() => setMobileSidebarOpen(true)} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px', display: 'flex', flexDirection: 'column', gap: '4px',
              }}>
                <div style={{ width: '20px', height: '2px', background: '#374151', borderRadius: '2px' }} />
                <div style={{ width: '20px', height: '2px', background: '#374151', borderRadius: '2px' }} />
                <div style={{ width: '20px', height: '2px', background: '#374151', borderRadius: '2px' }} />
              </button>
            )}
            <div>
              <h1 style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
                {currentPage?.label ?? 'Dashboard'}
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Search bar — desktop only */}
            {!isMobile && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#f9fafb', border: '1px solid #e5e7eb',
                borderRadius: '8px', padding: '6px 12px',
                fontSize: '13px', color: '#9ca3af',
              }}>
                🔍
                <span>Search...</span>
              </div>
            )}

            {/* Role badge */}
            <span style={{
              fontSize: '10px', fontWeight: 700,
              background: roleBadge.bg, color: roleBadge.color,
              padding: '3px 8px', borderRadius: '20px',
              textTransform: 'capitalize',
            }}>
              {profile?.role || 'viewer'}
            </span>

            {/* Date */}
            {!isMobile && (
              <span style={{
                fontSize: '11px', color: '#6b7280',
                background: '#f3f4f6', padding: '5px 10px',
                borderRadius: '20px', fontWeight: 500,
              }}>
                {new Date().toLocaleDateString('en-US', {
                  weekday: 'short', month: 'short',
                  day: 'numeric', year: 'numeric',
                })}
              </span>
            )}

            {/* Avatar — links to profile */}
            <Link href="/dashboard/profile" style={{
              width: '34px', height: '34px',
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', flexShrink: 0,
              textDecoration: 'none',
              
              border: '2px solid transparent',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = '#93c5fd'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'transparent'}
            title="Edit Profile"
            >
              {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
            </Link>
          </div>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, padding: isMobile ? '14px' : '24px' }}>
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#ffffff',
          borderTop: '1px solid #e5e7eb',
          display: 'flex', zIndex: 50,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}>
          {bottomNavItems.map(item => {
            const isActive = pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href))
            return (
              <Link key={item.href} href={item.href} style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '8px 2px', textDecoration: 'none',
                color: isActive ? '#1e40af' : '#9ca3af',
                borderTop: isActive ? '2px solid #1e40af' : '2px solid transparent',
                background: isActive ? '#eff6ff' : 'transparent',
                gap: '3px',
              }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ fontSize: '9px', fontWeight: isActive ? 700 : 400 }}>
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            )
          })}
          {visibleNav.length > 5 && (
            <button onClick={() => setMobileSidebarOpen(true)} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '8px 2px', background: 'transparent',
              border: 'none', color: '#9ca3af',
              cursor: 'pointer', gap: '3px',
              borderTop: '2px solid transparent',
            }}>
              <span style={{ fontSize: '18px' }}>☰</span>
              <span style={{ fontSize: '9px' }}>More</span>
            </button>
          )}
        </nav>
      )}
    </div>
  )
}