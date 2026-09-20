import { Bell, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface TopHeaderProps {
  title: string
  subtitle?: string
}

export function TopHeader({ title, subtitle }: TopHeaderProps) {
  const { user } = useAuth()

  return (
    <header style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px',
      height: 60,
      background: 'var(--color-surface)',
      borderBottom: '1px solid var(--color-border)',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      {/* Left: page title */}
      <div>
        <h1 style={{
          margin: 0, fontSize: 'var(--text-base)', fontWeight: 800,
          color: 'var(--color-text-primary)', letterSpacing: '-0.02em',
        }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: 0, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right: search + bell + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
          }} />
          <input
            placeholder="Search…"
            style={{
              padding: '7px 12px 7px 30px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-pill)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              background: 'var(--color-surface-elevated)',
              outline: 'none',
              width: 180,
              transition: 'border-color 0.15s, width 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-accent)'; e.target.style.width = '220px' }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.width = '180px' }}
          />
        </div>

        <button style={{
          width: 36, height: 36, borderRadius: 9,
          background: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: 'var(--color-text-muted)',
          transition: 'all 0.15s',
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.color = 'var(--color-accent)' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.color = 'var(--color-text-muted)' }}
          aria-label="Notifications"
        >
          <Bell size={15} />
        </button>

        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, hsl(231,76%,52%), hsl(198,76%,46%))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: '#fff', cursor: 'default',
          userSelect: 'none',
        }}>
          {user?.email?.slice(0, 2).toUpperCase() ?? 'RU'}
        </div>
      </div>
    </header>
  )
}
