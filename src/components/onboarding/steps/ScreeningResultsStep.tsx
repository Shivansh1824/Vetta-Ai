import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import {
  Brain, AlertTriangle, ShieldCheck,
  ArrowRight, ArrowLeft, LayoutDashboard, MessageSquare, Sparkles
} from 'lucide-react'
import type { GeminiScreeningResult, Tier, RequirementStatus, FlagSeverity } from '../../../types'

const TIER_META: Record<Tier, { label: string; color: string; bg: string; badge: string }> = {
  tier_1_match: { label: 'Tier 1 — Top Match', color: 'var(--color-emerald)', bg: 'var(--color-emerald-subtle)', badge: 'Strong Candidate' },
  tier_2_potential: { label: 'Tier 2 — Potential Review', color: 'var(--color-amber)', bg: 'var(--color-amber-subtle)', badge: 'Moderate Fit' },
  tier_3_mismatch: { label: 'Tier 3 — Mismatch', color: 'var(--color-rose)', bg: 'var(--color-rose-subtle)', badge: 'Gap Detected' },
}

const STATUS_COLORS: Record<RequirementStatus, string> = {
  met: 'var(--color-emerald)',
  partial: 'var(--color-amber)',
  missing: 'var(--color-rose)',
}

const SEVERITY_COLORS: Record<FlagSeverity, string> = {
  high: 'var(--color-rose)',
  medium: 'var(--color-amber)',
  low: 'var(--color-text-muted)',
}

interface Props {
  candidateName: string
  jobTitle: string
  loading: boolean
  result: GeminiScreeningResult | null
  errorMsg: string | null
  onPrev: () => void
  onCompleteAndEnterDashboard: () => void
  onGoToInterview: () => void
}

export function ScreeningResultsStep({
  candidateName,
  jobTitle,
  loading,
  result,
  errorMsg,
  onPrev,
  onCompleteAndEnterDashboard,
  onGoToInterview,
}: Props) {
  const scoreRef = useRef<HTMLSpanElement>(null)
  const hudRef = useRef<HTMLDivElement>(null)

  // GSAP Scanning HUD Animation during loading
  useEffect(() => {
    if (loading && hudRef.current) {
      const scanBar = hudRef.current.querySelector('.scan-bar')
      if (scanBar) {
        gsap.fromTo(scanBar,
          { y: 0 },
          { y: 140, duration: 1.2, repeat: -1, yoyo: true, ease: 'power1.inOut' }
        )
      }
    }
  }, [loading])

  // GSAP Counter Animation when result lands
  useEffect(() => {
    if (!loading && result && scoreRef.current) {
      const targetScore = result.match_score
      gsap.fromTo(scoreRef.current,
        { innerText: 0 },
        {
          innerText: targetScore,
          duration: 1.2,
          ease: 'power2.out',
          snap: { innerText: 1 },
          onUpdate() {
            if (scoreRef.current) {
              scoreRef.current.textContent = Math.round(parseFloat(scoreRef.current.textContent || '0')).toString()
            }
          }
        }
      )
    }
  }, [loading, result])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
            padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800,
          }}>
            STEP 4 OF 4
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            AI Screening & Requirement Verification
          </span>
        </div>
        <h2 style={{ margin: '0 0 6px', fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
          AI Evaluation: {candidateName || 'Candidate'}
        </h2>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Screened against <strong>{jobTitle}</strong> must-haves and nice-to-haves.
        </p>
      </div>

      {loading ? (
        /* Loading HUD Animation */
        <div ref={hudRef} style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', padding: '50px 24px', textAlign: 'center',
          boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 16, position: 'relative', overflow: 'hidden',
        }}>
          {/* Laser scanning bar */}
          <div className="scan-bar" style={{
            position: 'absolute', left: 0, right: 0, top: 0, height: 2,
            background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
            boxShadow: '0 0 12px var(--color-accent)',
          }} />

          <div style={{
            width: 56, height: 56, borderRadius: 16,
            background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'pulse 1.5s infinite',
          }}>
            <Brain size={30} />
          </div>

          <div>
            <h3 style={{ margin: '0 0 4px', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              Analyzing Candidate with Gemini AI…
            </h3>
            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
              Cross-verifying claims, validating years of experience, and generating quote citations.
            </p>
          </div>
        </div>
      ) : result ? (
        <>
          {/* Tier & Score Banner */}
          {(() => {
            const meta = TIER_META[result.tier]
            return (
              <div style={{
                background: meta.bg, border: `1.5px solid ${meta.color}40`,
                borderRadius: 'var(--radius-xl)', padding: '22px 26px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 16,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: 20,
                    background: '#fff', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    border: `2px solid ${meta.color}`, boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  }}>
                    <span ref={scoreRef} style={{ fontWeight: 900, fontSize: 28, color: meta.color, lineHeight: 1 }}>
                      {result.match_score}
                    </span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)' }}>SCORE</span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{
                        background: meta.color, color: '#fff',
                        padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800,
                      }}>
                        {meta.badge}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                        {result.tier.replace(/_/g, ' ').toUpperCase()}
                      </span>
                    </div>
                    <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                      {candidateName}: {meta.label}
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', maxWidth: 580, lineHeight: 1.5 }}>
                      {result.summary}
                    </p>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Key Strengths & Standout Qualifications (Positive A+ Highlights) */}
          {result.strengths && result.strengths.length > 0 && (
            <div style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)', padding: '18px 22px',
              boxShadow: 'var(--shadow-xs)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div style={{
                  width: 26, height: 26, borderRadius: 8,
                  background: 'var(--color-emerald-subtle)', color: 'var(--color-emerald)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Sparkles size={14} />
                </div>
                <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  Key Strengths & Standout Qualifications
                </h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.strengths.map((str, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                    fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)',
                    lineHeight: 1.5,
                  }}>
                    <span style={{ color: 'var(--color-emerald)', fontWeight: 900, marginTop: 1 }}>✓</span>
                    <span>{str}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements Mapping */}
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)', padding: '20px 24px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <ShieldCheck size={16} style={{ color: 'var(--color-accent)' }} />
              <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Requirement Mapping ({result.requirements.length} Evaluated)
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {result.requirements.map((req, i) => (
                <div key={i} style={{
                  padding: '10px 14px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: STATUS_COLORS[req.status], flexShrink: 0, marginTop: 5,
                  }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontWeight: 700, fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>
                        {req.requirement_text}
                      </span>
                      <span style={{
                        fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
                        color: STATUS_COLORS[req.status],
                      }}>
                        {req.status}
                      </span>
                    </div>
                    {req.evidence_quote && (
                      <div style={{
                        fontSize: 11, color: 'var(--color-text-muted)', fontStyle: 'italic',
                        background: '#fff', padding: '4px 8px', borderRadius: 4,
                      }}>
                        "{req.evidence_quote}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Validation Flags */}
          {result.flags && result.flags.length > 0 && (
            <div style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)', padding: '20px 24px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                <AlertTriangle size={16} style={{ color: 'var(--color-amber)' }} />
                <h4 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  Validation Flags Detected ({result.flags.length})
                </h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {result.flags.map((flag, i) => (
                  <div key={i} style={{
                    padding: '10px 14px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-amber-subtle)', border: '1px solid hsla(38,92%,50%,0.2)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{
                        fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
                        color: SEVERITY_COLORS[flag.severity],
                      }}>
                        {flag.severity}
                      </span>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>
                        {flag.flag_type.replace('_', ' ')}
                      </span>
                    </div>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                      {flag.description}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {errorMsg && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-rose)', fontWeight: 700 }}>
              {errorMsg}
            </div>
          )}

          {/* Action Footer: Enter Dashboard (Auto-Filled) or Go to Interview */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            paddingTop: 16, borderTop: '1px solid var(--color-border)', flexWrap: 'wrap', gap: 12,
          }}>
            <button
              type="button"
              onClick={onPrev}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 'var(--radius-md)',
                background: 'none', border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: 'var(--text-sm)',
                cursor: 'pointer',
              }}
            >
              <ArrowLeft size={15} /> Back
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={onGoToInterview}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '10px 18px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)', fontWeight: 700, fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                }}
              >
                <MessageSquare size={15} /> Interview Cockpit
              </button>

              <button
                type="button"
                onClick={onCompleteAndEnterDashboard}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 24px', borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, hsl(231,76%,52%), hsl(231,76%,46%))',
                  color: '#fff', border: 'none', fontWeight: 800, fontSize: 'var(--text-sm)',
                  cursor: 'pointer', boxShadow: '0 2px 10px hsla(231,76%,52%,0.25)',
                }}
              >
                <LayoutDashboard size={16} /> Complete & Open Dashboard <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
