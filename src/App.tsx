import { useAuth } from './context/AuthContext'
import { LoginPage } from './components/auth/LoginPage'
import { AppShell } from './AppShell'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--color-bg)',
        flexDirection: 'column', gap: 12,
      }}>
        <img
          src="/vetta-logo.png"
          alt="Vetta AI"
          style={{
            width: 44, height: 44, borderRadius: 12,
            objectFit: 'contain',
            boxShadow: '0 4px 16px hsla(231,76%,52%,0.25)',
            animation: 'pulse 1.5s infinite',
          }}
        />
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Loading Vetta AI…
        </p>
        <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
      </div>
    )
  }

  return user ? <AppShell /> : <LoginPage />
}

export default App
