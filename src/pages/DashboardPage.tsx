import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import {
  Users, Briefcase, ShieldCheck, TrendingUp,
  ArrowRight, CheckCircle2, AlertTriangle, Minus
} from 'lucide-react'
import { TopHeader } from '../components/layout/TopHeader'

const RECENT_CANDIDATES = [
  { name: 'Arjun Mehta', role: 'Senior Full-Stack Engineer', score: 94, tier: 'tier_1_match', time: '2 min ago' },
  { name: 'Elena Rostova', role: 'Frontend Tech Lead', score: 82, tier: 'tier_1_match', time: '14 min ago' },
  { name: 'Marcus Vance', role: 'Backend Engineer', score: 67, tier: 'tier_2_potential', time: '1 hr ago' },
  { name: 'Sarah Jenkins', role: 'Full-Stack Developer', score: 58, tier: 'tier_2_potential', time: '2 hr ago' },
  { name: 'David Kim', role: 'Junior Developer', score: 31, tier: 'tier_3_mismatch', time: '3 hr ago' },
]

const TIER_STYLES: Record<string, { bg: string; color: string; label: string; icon: React.ReactNode }> = {
  tier_1_match: { bg: 'var(--color-emerald-subtle)', color: 'var(--color-emerald)', label: 'Top Match', icon: <CheckCircle2 size={11} /> },
  tier_2_potential: { bg: 'var(--color-amber-subtle)', color: 'var(--color-amber)', label: 'Review', icon: <Minus size={11} /> },
  tier_3_mismatch: { bg: 'var(--color-rose-subtle)', color: 'var(--color-rose)', label: 'Mismatch', icon: <AlertTriangle size={11} /> },
}

export interface DashboardProps {
  onOpenOnboarding?: () => void
  customData?: {
    recruiterName?: string
    companyName?: string
    roleTitle?: string
    jobTitle?: string
    newCandidate?: {
      name: string
      role: string
      score: number
      tier: 'tier_1_match' | 'tier_2_potential' | 'tier_3_mismatch'
    }
  }
}

export function DashboardPage({ onOpenOnboarding, customData }: DashboardProps) {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.dash-stat', { y: 16, autoAlpha: 0, stagger: 0.08, duration: 0.45, ease: 'power2.out' })
      gsap.from('.dash-section', { y: 20, autoAlpha: 0, stagger: 0.1, duration: 0.5, ease: 'power2.out', delay: 0.25 })
    }, pageRef)
    return () => ctx.revert()
  }, [])

  const recruiterName = customData?.recruiterName || 'Sarah Chen'
  const companyName = customData?.companyName || 'Vetta AI Labs'
  const jobTitle = customData?.jobTitle || 'Senior Full-Stack & Distributed Systems Engineer'

  // If newly onboarded candidate exists, prepend to candidates list
  const candidatesList = customData?.newCandidate
    ? [
        {
          name: customData.newCandidate.name,
          role: customData.newCandidate.role,
          score: customData.newCandidate.score,
          tier: customData.newCandidate.tier,
          time: 'Just now (Live Onboarded)',
        },
        ...RECENT_CANDIDATES,
      ]
    : RECENT_CANDIDATES

  const statsList = [
    { label: 'Active Jobs', value: '3', icon: <Briefcase size={18} />, color: 'var(--color-accent)', bg: 'var(--color-accent-subtle)' },
    { label: 'Candidates Screened', value: customData?.newCandidate ? '25' : '24', icon: <Users size={18} />, color: 'var(--color-emerald)', bg: 'var(--color-emerald-subtle)' },
    { label: 'Tier 1 Matches', value: customData?.newCandidate && customData.newCandidate.tier === 'tier_1_match' ? '9' : '8', icon: <CheckCircle2 size={18} />, color: 'var(--color-emerald)', bg: 'var(--color-emerald-subtle)' },
    { label: 'Flags Detected', value: '5', icon: <AlertTriangle size={18} />, color: 'var(--color-amber)', bg: 'var(--color-amber-subtle)' },
  ]

  return (
    <div ref={pageRef} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <TopHeader title="Dashboard" subtitle={`Welcome back, ${recruiterName} — here is your ${companyName} hiring pipeline.`} />

      <main style={{ flex: 1, padding: '28px 28px', overflowY: 'auto' }}>

        {/* Live Workspace Status Banner */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 18px', borderRadius: 'var(--radius-lg)',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          marginBottom: 22, boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <span style={{
                background: 'var(--color-emerald-subtle)', color: 'var(--color-emerald)',
                fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 4,
              }}>
                ACTIVE RECRUITER WORKSPACE
              </span>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                {companyName} • {recruiterName} ({customData?.roleTitle || 'Lead Technical Recruiter'})
              </span>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Target Active Role: <strong>{jobTitle}</strong>
            </div>
          </div>

          {onOpenOnboarding && (
            <button
              type="button"
              onClick={onOpenOnboarding}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-accent-subtle)', border: '1px solid var(--color-accent)',
                color: 'var(--color-accent)', fontSize: 'var(--text-xs)', fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              ⚡ Re-run Onboarding Modal
            </button>
          )}
        </div>

        {/* Stats grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 16, marginBottom: 28,
        }}>
          {statsList.map(stat => (
            <div key={stat.label} className="dash-stat" style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)',
              display: 'flex', alignItems: 'flex-start', gap: 14,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: stat.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, color: stat.color,
              }}>
                {stat.icon}
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 900, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 4 }}>
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main content grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>

          {/* Recent candidates */}
          <div className="dash-section" style={{
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
            overflow: 'hidden',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '18px 20px',
              borderBottom: '1px solid var(--color-border)',
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                  Recent Candidates
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Processed by Gemini AI
                </div>
              </div>
              <button style={{
                display: 'flex', alignItems: 'center', gap: 5,
                fontSize: 'var(--text-xs)', fontWeight: 600,
                color: 'var(--color-accent)',
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              }}>
                View all <ArrowRight size={12} />
              </button>
            </div>

            <div>
              {candidatesList.map((c, i) => {
                const tier = TIER_STYLES[c.tier as keyof typeof TIER_STYLES]
                return (
                  <div key={c.name} style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 20px',
                    borderBottom: i < candidatesList.length - 1 ? '1px solid var(--color-border)' : 'none',
                    transition: 'background 0.15s',
                    cursor: 'pointer',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-elevated)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 9,
                      background: 'var(--color-accent-subtle)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 700, color: 'var(--color-accent)', fontSize: 13, flexShrink: 0,
                    }}>
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{c.name}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.role}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        padding: '3px 8px', borderRadius: 6,
                        background: tier.bg, color: tier.color,
                        fontSize: 'var(--text-xs)', fontWeight: 700,
                      }}>
                        {tier.icon}
                        {tier.label}
                      </div>
                      <div style={{
                        fontWeight: 800, fontSize: 'var(--text-sm)',
                        color: 'var(--color-text-primary)',
                        fontFamily: 'JetBrains Mono, monospace',
                        minWidth: 36, textAlign: 'right',
                      }}>
                        {c.score}%
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--color-text-muted)', minWidth: 50, textAlign: 'right' }}>
                        {c.time}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Pipeline funnel */}
            <div className="dash-section" style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginBottom: 16 }}>
                Pipeline Overview
              </div>
              {[
                { label: 'Applied', count: 24, pct: 100, color: 'var(--color-accent)' },
                { label: 'Screened', count: 24, pct: 100, color: 'var(--color-accent)' },
                { label: 'Tier 1 Match', count: 8, pct: 33, color: 'var(--color-emerald)' },
                { label: 'Interviewed', count: 3, pct: 12, color: 'var(--color-amber)' },
                { label: 'Hired', count: 0, pct: 0, color: 'var(--color-text-muted)' },
              ].map(stage => (
                <div key={stage.label} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>{stage.label}</span>
                    <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>{stage.count}</span>
                  </div>
                  <div style={{ height: 5, background: 'var(--color-border)', borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${stage.pct}%`,
                      background: stage.color, borderRadius: 9999,
                      transition: 'width 0.8s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="dash-section" style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '20px',
              boxShadow: 'var(--shadow-sm)',
            }}>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginBottom: 14 }}>
                Quick Actions
              </div>
              {[
                { label: 'Post a new job', icon: <Briefcase size={14} />, accent: true },
                { label: 'Upload resumes', icon: <Users size={14} />, accent: false },
                { label: 'Run AI screening', icon: <ShieldCheck size={14} />, accent: false },
                { label: 'View reports', icon: <TrendingUp size={14} />, accent: false },
              ].map(a => (
                <button key={a.label} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', marginBottom: 6,
                  background: a.accent ? 'var(--color-accent-subtle)' : 'var(--color-surface-elevated)',
                  border: `1px solid ${a.accent ? 'var(--color-accent-border)' : 'var(--color-border)'}`,
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer', color: a.accent ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                  fontSize: 'var(--text-sm)', fontWeight: 600,
                  textAlign: 'left', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(2px)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateX(0)' }}
                >
                  {a.icon} {a.label}
                </button>
              ))}
            </div>

          </div>
        </div>

      </main>

      <style>{`
        @media (max-width: 1100px) {
          div[style*="gridTemplateColumns: repeat(4, 1fr)"] { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns: 1fr 340px"] { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
