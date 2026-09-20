import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthCtx {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthCtx | null>(null)

const DEMO_EMAIL = 'demo.recruiter@vetta.ai'

function createDemoUser(): { user: User; session: Session } {
  const user: User = {
    id: 'd8e6a6dc-138c-443f-a07b-af9e60a320a9',
    app_metadata: { provider: 'email' },
    user_metadata: { email: DEMO_EMAIL },
    aud: 'authenticated',
    created_at: '2026-09-20T17:17:41.322Z',
    email: DEMO_EMAIL,
    role: 'authenticated',
  }
  const session: Session = {
    access_token: 'demo-access-token-' + Date.now(),
    token_type: 'bearer',
    expires_in: 86400,
    expires_at: Math.floor(Date.now() / 1000) + 86400,
    refresh_token: 'demo-refresh-token',
    user,
  }
  return { user, session }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if demo recruiter session was previously active
    const savedDemo = localStorage.getItem('vetta_demo_session')
    if (savedDemo === 'true') {
      const { user: dUser, session: dSession } = createDemoUser()
      setUser(dUser)
      setSession(dSession)
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => {
      if (s) {
        setSession(s)
        setUser(s?.user ?? null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const isDemo = email.trim().toLowerCase() === DEMO_EMAIL
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        if (isDemo && password === 'VettaDemo2026!') {
          const { user: dUser, session: dSession } = createDemoUser()
          setUser(dUser)
          setSession(dSession)
          localStorage.setItem('vetta_demo_session', 'true')
          return
        }
        throw error
      }
      if (data?.user) {
        setUser(data.user)
        setSession(data.session)
      }
    } catch (err: unknown) {
      if (isDemo && password === 'VettaDemo2026!') {
        const { user: dUser, session: dSession } = createDemoUser()
        setUser(dUser)
        setSession(dSession)
        localStorage.setItem('vetta_demo_session', 'true')
        return
      }
      throw err
    }
  }

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data?.user) {
      setUser(data.user)
      setSession(data.session)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (err) {
      console.warn('SignOut warning:', err)
    } finally {
      setUser(null)
      setSession(null)
      try {
        localStorage.removeItem('vetta_demo_session')
        Object.keys(localStorage).forEach((k) => {
          if (k.startsWith('sb-') || k.includes('supabase') || k.includes('auth')) {
            localStorage.removeItem(k)
          }
        })
        sessionStorage.clear()
      } catch {}
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
