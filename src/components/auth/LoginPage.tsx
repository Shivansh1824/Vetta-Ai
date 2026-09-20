import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { AuthShowcase } from './AuthShowcase'

export function LoginPage() {
  const { signIn, signUp } = useAuth()
  const formRef = useRef<HTMLDivElement>(null)

  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Entry animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.auth-form-item', {
        y: 20, autoAlpha: 0, stagger: 0.07, duration: 0.5,
        ease: 'power2.out', delay: 0.1,
      })
    }, formRef)
    return () => ctx.revert()
  }, [mode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    if (!email.trim() || !password) {
      setError('Please fill in all fields.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      if (mode === 'signin') {
        await signIn(email.trim(), password)
      } else {
        await signUp(email.trim(), password)
        setSuccess('Account created! Check your email to confirm, then sign in.')
        setMode('signin')
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.'
      setError(msg.includes('Invalid login') ? 'Incorrect email or password.' : msg)
    } finally {
      setLoading(false)
    }
  }

  const switchMode = () => {
    setMode(m => m === 'signin' ? 'signup' : 'signin')
    setError(null)
    setSuccess(null)
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      minHeight: '100vh',
      background: 'var(--color-bg)',
    }}>
      {/* ── Left: Product Showcase ── */}
      <div style={{
        background: 'linear-gradient(145deg, hsl(214,80%,97%) 0%, hsl(231,60%,95%) 100%)',
        borderRight: '1px solid var(--color-border)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative mesh blobs */}
        <div style={{
          position: 'absolute', top: -80, left: -80,
          width: 320, height: 320, borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(231,76%,65%,0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: -60, right: -60,
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, hsla(198,76%,60%,0.12) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <AuthShowcase />
      </div>

      {/* ── Right: Auth Form ── */}
      <div style={{
        display: 'flex', flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center',
        padding: '48px 40px',
        background: 'var(--color-surface)',
      }}>
        <div ref={formRef} style={{ width: '100%', maxWidth: 380 }}>

          {/* Logo + title */}
          <div className="auth-form-item" style={{ marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              marginBottom: 20,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'linear-gradient(135deg, hsl(231,76%,52%), hsl(198,76%,46%))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>V</span>
              </div>
              <span style={{ fontWeight: 900, fontSize: 18, color: 'var(--color-text-primary)', letterSpacing: '-0.03em' }}>
                Vetta AI
              </span>
            </div>
            <h2 style={{
              margin: 0, fontSize: 'var(--text-2xl)', fontWeight: 800,
              color: 'var(--color-text-primary)', lineHeight: 1.25,
            }}>
              {mode === 'signin' ? 'Welcome back' : 'Create account'}
            </h2>
            <p style={{
              margin: '6px 0 0', fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
            }}>
              {mode === 'signin'
                ? 'Sign in to continue to your recruiter dashboard.'
                : 'Set up your Vetta AI workspace in seconds.'}
            </p>
          </div>

          {/* Alert */}
          {(error || success) && (
            <div className="auth-form-item" style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              padding: '12px 14px', borderRadius: 'var(--radius-md)',
              background: error ? 'var(--color-rose-subtle)' : 'var(--color-emerald-subtle)',
              border: `1px solid ${error ? 'hsl(350,89%,85%)' : 'hsl(158,64%,82%)'}`,
              marginBottom: 20,
            }}>
              <AlertCircle size={15} style={{ color: error ? 'var(--color-rose)' : 'var(--color-emerald)', marginTop: 1, flexShrink: 0 }} />
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                {error ?? success}
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Email */}
            <div className="auth-form-item">
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
                Work Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)', pointerEvents: 'none',
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                  style={{
                    width: '100%', padding: '11px 12px 11px 36px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-primary)',
                    background: 'var(--color-surface)',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
                />
              </div>
            </div>

            {/* Password */}
            <div className="auth-form-item">
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{
                  position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)', pointerEvents: 'none',
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'Min. 6 characters' : 'Your password'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  style={{
                    width: '100%', padding: '11px 40px 11px 36px',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-primary)',
                    background: 'var(--color-surface)',
                    outline: 'none',
                    transition: 'border-color 0.15s',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
                  onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                    color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <div className="auth-form-item" style={{ marginTop: 6 }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: loading
                    ? 'var(--color-border)'
                    : 'linear-gradient(135deg, hsl(231,76%,52%), hsl(231,76%,46%))',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  transition: 'all 0.15s',
                  transform: 'scale(1)',
                  boxShadow: '0 2px 12px hsla(231,76%,52%,0.3)',
                }}
                onMouseEnter={e => { if (!loading) (e.currentTarget.style.transform = 'scale(1.01)') }}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                onMouseDown={e => (e.currentTarget.style.transform = 'scale(0.98)')}
                onMouseUp={e => (e.currentTarget.style.transform = 'scale(1.01)')}
              >
                {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : null}
                {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in to Vetta AI' : 'Create my account'}
              </button>
            </div>
          </form>

          {/* Switch mode */}
          <div className="auth-form-item" style={{
            textAlign: 'center', marginTop: 22,
            fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
          }}>
            {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={switchMode}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                color: 'var(--color-accent)', fontWeight: 700, fontSize: 'inherit',
              }}
            >
              {mode === 'signin' ? 'Sign up free' : 'Sign in'}
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns"] {
            grid-template-columns: 1fr !important;
          }
          div[style*="borderRight"] {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
