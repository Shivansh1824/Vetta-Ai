import { useState } from 'react'
import {
  LayoutDashboard, Briefcase, Users, ShieldCheck,
  MessageSquare, FileText, Settings,
  ChevronLeft, ChevronRight, Menu, X, Sparkles,
} from 'lucide-react'

export type NavItem =
  | 'onboarding'
  | 'dashboard'
  | 'jobs'
  | 'candidates'
  | 'screening'
  | 'interview'
  | 'reports'
  | 'settings'

const NAV_ITEMS: { id: NavItem; label: string; icon: React.ReactNode; badge?: string }[] = [
  { id: 'onboarding', label: 'Onboarding Intake', icon: <Sparkles size={16} />, badge: 'Flow' },
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { id: 'jobs', label: 'Job Posts', icon: <Briefcase size={16} /> },
  { id: 'candidates', label: 'Candidates', icon: <Users size={16} /> },
  { id: 'screening', label: 'AI Screening', icon: <ShieldCheck size={16} />, badge: 'AI' },
  { id: 'interview', label: 'Interview Cockpit', icon: <MessageSquare size={16} />, badge: 'AI' },
  { id: 'reports', label: 'Reports', icon: <FileText size={16} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
]

interface SidebarProps {
  active: NavItem
  onNavigate: (id: NavItem) => void
}

export function Sidebar({ active, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const SidebarContent = () => (
    <nav style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', padding: '0',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '16px 0' : '16px 14px',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'space-between',
        gap: 8, flexShrink: 0,
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <img
              src="/vetta-logo.png"
              alt="Vetta AI"
              style={{
                width: 30, height: 30, borderRadius: 8,
                objectFit: 'contain',
                boxShadow: '0 2px 8px hsla(231,76%,52%,0.25)',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 900, fontSize: 15, color: 'var(--color-text-primary)', letterSpacing: '-0.03em', lineHeight: 1.1 }}>
                Vetta AI
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Intelligence
              </span>
            </div>
          </div>
        )}
        {collapsed && (
          <img
            src="/vetta-logo.png"
            alt="Vetta AI"
            style={{
              width: 28, height: 28, borderRadius: 8,
              objectFit: 'contain',
              boxShadow: '0 2px 8px hsla(231,76%,52%,0.25)',
            }}
          />
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          style={{
            background: 'none', border: '1px solid var(--color-border)',
            borderRadius: 6, cursor: 'pointer', padding: '3px 5px',
            color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center',
            transition: 'all 0.15s',
          }}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
        </button>
      </div>

      {/* Nav links */}
      <div style={{ flex: '1 1 auto', minHeight: 0, overflowY: 'auto', padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id
          return (
            <button
              key={item.id}
              onClick={() => { onNavigate(item.id); setMobileOpen(false) }}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex', alignItems: 'center',
                gap: collapsed ? 0 : 9,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '8px' : '7px 10px',
                borderRadius: 'var(--radius-md)',
                border: 'none', cursor: 'pointer', width: '100%',
                textAlign: 'left',
                background: isActive ? 'var(--color-accent-subtle)' : 'transparent',
                color: isActive ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                fontWeight: isActive ? 700 : 500,
                fontSize: 'var(--text-xs)',
                transition: 'all 0.15s',
                position: 'relative',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--color-surface-elevated)'
                  e.currentTarget.style.color = 'var(--color-text-primary)'
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--color-text-secondary)'
                }
              }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              {!collapsed && <span style={{ flex: 1 }}>{item.label}</span>}
              {!collapsed && item.badge && (
                <span style={{
                  fontSize: 9, fontWeight: 800, padding: '1px 5px',
                  borderRadius: 4, letterSpacing: '0.05em',
                  background: 'linear-gradient(135deg, hsl(231,76%,52%), hsl(198,76%,46%))',
                  color: '#fff',
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </nav>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{
        width: collapsed ? 62 : 220,
        flexShrink: 0,
        background: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        height: '100vh',
        position: 'sticky', top: 0,
        overflow: 'hidden',
        transition: 'width 0.25s ease',
        display: 'flex', flexDirection: 'column',
      }}>
        <SidebarContent />
      </aside>

      {/* Mobile burger */}
      <button
        onClick={() => setMobileOpen(true)}
        style={{
          display: 'none',
          position: 'fixed', top: 14, left: 14, zIndex: 100,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 8, padding: 8, cursor: 'pointer',
          color: 'var(--color-text-primary)',
          boxShadow: 'var(--shadow-md)',
        }}
        id="mobile-burger"
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} onClick={() => setMobileOpen(false)} />
          <aside style={{
            position: 'relative', width: 220, background: 'var(--color-surface)',
            height: '100%', borderRight: '1px solid var(--color-border)',
            display: 'flex', flexDirection: 'column',
          }}>
            <button
              onClick={() => setMobileOpen(false)}
              style={{
                position: 'absolute', top: 14, right: 14,
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--color-text-muted)', padding: 4,
              }}
              aria-label="Close menu"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          #mobile-burger { display: flex !important; }
          aside:not([style*="zIndex"]) { display: none !important; }
        }
      `}</style>
    </>
  )
}
