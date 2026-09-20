import { Bell, Search, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

interface TopHeaderProps {
  title: string
  subtitle?: string
}

export function TopHeader({ title, subtitle }: TopHeaderProps) {
  const { user, signOut } = useAuth()

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

      {/* Right: search + bell + avatar + signout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

        <div style={{ position: 'relative' }}>
          <Search size={14} style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
          }} />
          <input
            placeholder="Search…"
            style={{
              padding: '6px 12px 6px 30px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-pill)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-secondary)',
              background: 'var(--color-surface-elevated)',
              outline: 'none',
              width: 150,
              transition: 'border-color 0.15s, width 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--color-accent)'; e.target.style.width = '190px' }}
            onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.width = '150px' }}
          />
        </div>

        <button style={{
          width: 32, height: 32, borderRadius: 8,
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
          <Bell size={14} />
        </button>

        <div style={{
          width: 30, height: 30, borderRadius: '50%',
          background: 'linear-gradient(135deg, hsl(231,76%,52%), hsl(198,76%,46%))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: '#fff', cursor: 'default',
          userSelect: 'none',
        }}>
          {user?.email?.slice(0, 2).toUpperCase() ?? 'RU'}
        </div>

        {/* Dedicated Sign out button in top header */}
        <button
          onClick={signOut}
          type="button"
          title="Sign out of Vetta AI"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '6px 11px', borderRadius: 'var(--radius-pill)',
            border: '1px solid var(--color-border)',
            background: 'var(--color-surface-elevated)',
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--text-xs)', fontWeight: 600,
            cursor: 'pointer', transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--color-rose)'
            e.currentTarget.style.color = 'var(--color-rose)'
            e.currentTarget.style.background = 'var(--color-rose-subtle)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--color-border)'
            e.currentTarget.style.color = 'var(--color-text-secondary)'
            e.currentTarget.style.background = 'var(--color-surface-elevated)'
          }}
        >
          <LogOut size={13} />
          <span>Sign out</span>
        </button>
      </div>
    </header>
  )
}
