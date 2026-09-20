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
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, hsl(231,76%,52%), hsl(198,76%,46%))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'pulse 1.5s infinite',
        }}>
          <span style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>V</span>
        </div>
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
