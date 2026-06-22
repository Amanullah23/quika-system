'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase/client'
import { RoleProvider, useRole } from '../../lib/roleContext'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['admin', 'finance', 'viewer'] },
  { href: '/dashboard/customers', label: 'Customers', icon: '👥', roles: ['admin', 'finance', 'viewer'] },
  { href: '/dashboard/billing', label: 'Daily Billing', icon: '💰', roles: ['admin', 'finance', 'viewer'] },
  { href: '/dashboard/reports', label: 'Reports', icon: '📈', roles: ['admin', 'finance', 'viewer'] },
  { href: '/dashboard/packages', label: 'Packages', icon: '📦', roles: ['admin'] },
  { href: '/dashboard/users', label: 'Users', icon: '🔐', roles: ['admin'] },
  { href: '/dashboard/backups', label: 'Backups', icon: '💾', roles: ['admin'] },
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
    function check() {
      setIsMobile(window.innerWidth < 768)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    setMobileSidebarOpen(false)
  }, [pathname])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const currentLabel = navItems.find(i =>
    i.href === pathname ||
    (i.href !== '/dashboard' && pathname.startsWith(i.href))
  )?.label ?? 'Dashboard'

  const SIDEBAR_W = sidebarOpen ? 220 : 60

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f8' }}>

      {/* Mobile overlay */}
      {isMobile && mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 98,
          }}
        />
      )}

      {/* ── Sidebar ── */}
      <aside style={{
        width: isMobile ? '220px' : `${SIDEBAR_W}px`,
        background: '#054247',
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
      }}>

        {/* Logo */}
        <div style={{
          padding: '0 14px',
          height: '56px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px',
              background: '#0c7177', borderRadius: '7px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '15px', flexShrink: 0,
            }}>Q</div>
            {(!isMobile ? sidebarOpen : true) && (
              <div>
                <div style={{ color: '#fff', fontWeight: 700, fontSize: '14px', lineHeight: 1.2 }}>Quika</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '10px' }}>ISP System</div>
              </div>
            )}
          </div>
          {isMobile && (
            <button onClick={() => setMobileSidebarOpen(false)} style={{
              background: 'rgba(255,255,255,0.08)', border: 'none',
              color: '#fff', width: '28px', height: '28px',
              borderRadius: '6px', cursor: 'pointer', fontSize: '14px',
            }}>✕</button>
          )}
        </div>

        {/* Nav — NO overflow scroll, just let sidebar be as tall as needed */}
       {/* Nav */}
        <nav
          id="sidebar-nav"
          style={{
            flex: 1,
            padding: '8px 6px',
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
            const showLabel = isMobile ? true : sidebarOpen
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center',
                gap: showLabel ? '10px' : '0',
                justifyContent: showLabel ? 'flex-start' : 'center',
                padding: showLabel ? '8px 10px' : '8px 0',
                borderRadius: '7px',
                textDecoration: 'none',
                background: isActive ? '#0c7177' : 'transparent',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.07)'
                  ;(e.currentTarget as HTMLElement).style.color = '#fff'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)'
                }
              }}
              >
                <span style={{ fontSize: '17px', flexShrink: 0 }}>{item.icon}</span>
                {showLabel && item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div style={{
          padding: '8px 6px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: '2px',
          flexShrink: 0,
          background: '#054247',
          position: 'relative',
          zIndex: 2,
        }}>
          {/* Profile */}
          <button onClick={() => setShowProfile(!showProfile)} style={{
            display: 'flex', alignItems: 'center',
            gap: sidebarOpen ? '10px' : '0',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            padding: sidebarOpen ? '8px 10px' : '8px 0',
            borderRadius: '7px',
            background: showProfile ? 'rgba(255,255,255,0.08)' : 'transparent',
            border: 'none', cursor: 'pointer', width: '100%',
          }}>
            <div style={{
              width: '28px', height: '28px', background: '#0c7177',
              borderRadius: '50%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#fff',
              fontSize: '12px', fontWeight: 700, flexShrink: 0,
            }}>
              {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            {(isMobile ? true : sidebarOpen) && (
              <div style={{ overflow: 'visible', flex: 1, textAlign: 'left' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.full_name || 'User'}
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.email}
                </div>
              </div>
            )}
          </button>

          {/* Profile popup */}
          {showProfile && (isMobile ? true : sidebarOpen) && (
            <div style={{
              background: 'rgba(255,255,255,0.07)',
              borderRadius: '7px', padding: '8px',
              display: 'flex', flexDirection: 'column', gap: '5px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.45)' }}>Role</span>
                <span style={{
                  fontSize: '10px', fontWeight: 700,
                  background: roleBadge.bg, color: roleBadge.color,
                  padding: '2px 7px', borderRadius: '8px', textTransform: 'capitalize',
                }}>
                  {profile?.role}
                </span>
              </div>
              <Link href="/dashboard/profile" onClick={() => setShowProfile(false)} style={{
                display: 'block', padding: '6px 10px',
                background: 'rgba(255,255,255,0.07)',
                color: '#fff', borderRadius: '5px',
                textDecoration: 'none', fontSize: '12px', textAlign: 'center',
              }}>
                ✏️ Edit Profile
              </Link>
            </div>
          )}

          {/* Collapse (desktop only) */}
          {!isMobile && (
            <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{
              display: 'flex', alignItems: 'center',
              gap: sidebarOpen ? '10px' : '0',
              justifyContent: sidebarOpen ? 'flex-start' : 'center',
              padding: sidebarOpen ? '8px 10px' : '8px 0',
              borderRadius: '7px', background: 'transparent',
              border: 'none', color: 'rgba(255,255,255,0.45)',
              fontSize: '12px', cursor: 'pointer', width: '100%',
              whiteSpace: 'nowrap',
            }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{sidebarOpen ? '◀' : '▶'}</span>
              {sidebarOpen && 'Collapse'}
            </button>
          )}

          {/* Sign out */}
          <button onClick={handleLogout} style={{
            display: 'flex', alignItems: 'center',
            gap: sidebarOpen ? '10px' : '0',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            padding: sidebarOpen ? '8px 10px' : '8px 0',
            borderRadius: '7px', background: 'transparent',
            border: 'none', color: 'rgba(255,255,255,0.5)',
            fontSize: '12px', cursor: 'pointer', width: '100%',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(206,20,61,0.2)'
            ;(e.currentTarget as HTMLElement).style.color = '#ff8080'
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'transparent'
            ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'
          }}
          >
            <span style={{ fontSize: '16px', flexShrink: 0 }}>🚪</span>
            {(isMobile ? true : sidebarOpen) && 'Sign out'}
          </button>
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
          background: '#fff',
          borderBottom: '1px solid #e5e7eb',
          height: '52px',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 40,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <h1 style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
              {currentLabel}
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              fontSize: '10px', fontWeight: 700,
              background: roleBadge.bg, color: roleBadge.color,
              padding: '2px 8px', borderRadius: '20px', textTransform: 'capitalize',
            }}>
              {profile?.role || 'viewer'}
            </span>
            {!isMobile && (
              <span style={{
                fontSize: '11px', color: '#6b7280',
                background: '#f3f4f6', padding: '4px 10px', borderRadius: '20px',
              }}>
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        </header>

        {/* Content */}
        <div style={{ flex: 1, padding: isMobile ? '14px' : '20px' }}>
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      {isMobile && (
        <nav style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: '#054247',
          borderTop: '1px solid rgba(255,255,255,0.08)',
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
                padding: '7px 2px', textDecoration: 'none',
                color: isActive ? '#fff' : 'rgba(255,255,255,0.45)',
                borderTop: isActive ? '2px solid #0c7177' : '2px solid transparent',
                background: isActive ? 'rgba(12,113,119,0.3)' : 'transparent',
                gap: '2px',
              }}>
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                <span style={{ fontSize: '9px', fontWeight: isActive ? 600 : 400 }}>
                  {item.label.split(' ')[0]}
                </span>
              </Link>
            )
          })}
          {visibleNav.length > 5 && (
            <button onClick={() => setMobileSidebarOpen(true)} style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '7px 2px', background: 'transparent',
              border: 'none', color: 'rgba(255,255,255,0.45)',
              cursor: 'pointer', gap: '2px',
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