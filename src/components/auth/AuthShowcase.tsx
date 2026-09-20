import React, { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Brain, CheckCircle2, AlertTriangle, Sparkles, ChevronRight } from 'lucide-react'

const CANDIDATES = [
  { name: 'Arjun Mehta', role: 'Senior Full-Stack Engineer', score: 94, tier: 'tier_1_match' as const },
  { name: 'Elena Rostova', role: 'Frontend Tech Lead', score: 82, tier: 'tier_1_match' as const },
  { name: 'Marcus Vance', role: 'Backend Engineer', score: 67, tier: 'tier_2_potential' as const },
  { name: 'Sarah Jenkins', role: 'Full-Stack Developer', score: 58, tier: 'tier_2_potential' as const },
  { name: 'David Kim', role: 'Junior Developer', score: 31, tier: 'tier_3_mismatch' as const },
]

const REQUIREMENTS = [
  { text: 'React + TypeScript (5+ yrs)', status: 'met' as const },
  { text: 'Distributed Systems', status: 'met' as const },
  { text: 'Kafka / Event Streaming', status: 'partial' as const },
  { text: 'System Security Architecture', status: 'missing' as const },
]

const TIER_COLORS = {
  tier_1_match: { bg: '#ecfdf5', text: '#065f46', dot: '#10b981', label: 'Top Match' },
  tier_2_potential: { bg: '#fffbeb', text: '#92400e', dot: '#f59e0b', label: 'Review' },
  tier_3_mismatch: { bg: '#fef2f2', text: '#991b1b', dot: '#ef4444', label: 'Gap' },
}

const STATUS_COLORS = {
  met: '#10b981',
  partial: '#f59e0b',
  missing: '#ef4444',
}

export function AuthShowcase() {
  const containerRef = useRef<HTMLDivElement>(null)
  const scoreRef = useRef<HTMLSpanElement>(null)
  const [activeIdx, setActiveIdx] = useState(0)

  // Cycle through candidates every 3s
  useEffect(() => {
    const id = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % CANDIDATES.length)
    }, 3000)
    return () => clearInterval(id)
  }, [])

  // Animate score counter
  useEffect(() => {
    const target = CANDIDATES[activeIdx].score
    if (!scoreRef.current) return
    gsap.fromTo(scoreRef.current,
      { innerText: 0 },
      {
        innerText: target,
        duration: 0.8,
        ease: 'power2.out',
        snap: { innerText: 1 },
        onUpdate() {
          if (scoreRef.current) {
            scoreRef.current.textContent = Math.round(parseFloat(scoreRef.current.textContent || '0')).toString()
          }
        },
      }
    )
  }, [activeIdx])

  // Entry animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.showcase-item', {
        y: 18, autoAlpha: 0, stagger: 0.1, duration: 0.55,
        ease: 'power2.out', delay: 0.2,
      })
    }, containerRef)
    return () => ctx.revert()
  }, [])

  const candidate = CANDIDATES[activeIdx]
  const tier = TIER_COLORS[candidate.tier]

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%',
        padding: '48px 40px',
        gap: '32px',
      }}
    >
      {/* Badge */}
      <div className="showcase-item" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', borderRadius: 9999,
          background: 'var(--color-accent-subtle)',
          border: '1px solid var(--color-accent-border)',
          color: 'var(--color-accent)',
          fontSize: 'var(--text-xs)', fontWeight: 700, letterSpacing: '0.05em',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          AI SCREENING IN PROGRESS
        </div>
      </div>

      {/* Headline */}
      <div className="showcase-item">
        <h1 style={{
          fontSize: 'var(--text-3xl)', fontWeight: 900,
          color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.2,
        }}>
          Screen faster.<br />
          <span style={{
            background: 'linear-gradient(135deg, hsl(231,76%,52%) 0%, hsl(198,76%,46%) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Hire smarter.
          </span>
        </h1>
        <p style={{
          margin: '12px 0 0', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)',
          maxWidth: 380, lineHeight: 1.65,
        }}>
          Vetta AI reads every resume, maps it to your JD requirements, and surfaces the right candidates — with verifiable evidence, not guesswork.
        </p>
      </div>

      {/* Live candidate card */}
      <div className="showcase-item" style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)',
        padding: '20px',
        boxShadow: 'var(--shadow-lg)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* top accent bar */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 3,
          background: 'linear-gradient(90deg, hsl(231,76%,52%), hsl(198,76%,46%))',
        }} />

        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--color-accent-subtle)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: 'var(--color-accent)', fontSize: 14,
            }}>
              {candidate.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{candidate.name}</div>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>{candidate.role}</div>
            </div>
          </div>
          <div style={{
            padding: '3px 10px', borderRadius: 9999,
            background: tier.bg, color: tier.text, fontSize: 'var(--text-xs)', fontWeight: 700,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: tier.dot, display: 'inline-block' }} />
            {tier.label}
          </div>
        </div>

        {/* Match score */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '12px 14px',
          background: 'var(--color-surface-elevated)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--color-border)',
          marginBottom: 14,
        }}>
          <Brain size={16} style={{ color: 'var(--color-accent)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Gemini Match Score</span>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-accent)', fontFamily: 'JetBrains Mono, monospace' }}>
                <span ref={activeIdx === 0 ? scoreRef : undefined}>{candidate.score}</span>%
              </span>
            </div>
            <div style={{ height: 5, background: 'var(--color-border)', borderRadius: 9999, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 9999,
                width: `${candidate.score}%`,
                background: `linear-gradient(90deg, var(--color-accent), hsl(198,76%,46%))`,
                transition: 'width 0.8s ease',
              }} />
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {REQUIREMENTS.map((req) => (
            <div key={req.text} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)',
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[req.status], flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{req.text}</span>
              <span style={{
                fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em',
                color: STATUS_COLORS[req.status],
              }}>{req.status}</span>
            </div>
          ))}
        </div>

        {/* Cycle indicator dots */}
        <div style={{ display: 'flex', gap: 5, marginTop: 14, justifyContent: 'center' }}>
          {CANDIDATES.map((_, i) => (
            <div key={i} style={{
              width: i === activeIdx ? 16 : 5,
              height: 5, borderRadius: 9999,
              background: i === activeIdx ? 'var(--color-accent)' : 'var(--color-border)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="showcase-item" style={{ display: 'flex', gap: 20 }}>
        {[
          { icon: <CheckCircle2 size={14} />, val: '5 candidates', label: 'screened in seconds' },
          { icon: <Sparkles size={14} />, val: '3 tiers', label: 'ranked automatically' },
          { icon: <AlertTriangle size={14} />, val: 'Evidence-backed', label: 'every insight cited' },
        ].map(s => (
          <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--color-accent)' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-primary)' }}>{s.val}</div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
