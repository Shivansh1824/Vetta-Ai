import React, { useState } from 'react'
import { TopHeader } from '../layout/TopHeader'
import { Upload, FileText, Loader2, CheckCircle2, AlertTriangle, Brain, ChevronDown, ChevronRight } from 'lucide-react'
import { analyzeResume, buildOfflineScreeningResult } from '../../services/gemini'
import type { Job, GeminiScreeningResult } from '../../types'

// Mock job for demo purposes — real version pulls from Supabase
const MOCK_JOB: Job = {
  id: 'demo-job-1',
  recruiter_id: null,
  title: 'Senior Full-Stack Engineer',
  department: 'Engineering',
  experience_level: '5+ years',
  must_haves: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'System Design'],
  nice_to_haves: ['Kubernetes', 'Redis', 'GraphQL'],
  description_text: 'We are looking for an experienced engineer to join our core product team...',
  status: 'active',
  created_at: new Date().toISOString(),
}

const TIER_CONFIG = {
  tier_1_match: { label: 'Tier 1 — Top Match', color: 'var(--color-emerald)', bg: 'var(--color-emerald-subtle)', icon: <CheckCircle2 size={16} /> },
  tier_2_potential: { label: 'Tier 2 — Review', color: 'var(--color-amber)', bg: 'var(--color-amber-subtle)', icon: <AlertTriangle size={16} /> },
  tier_3_mismatch: { label: 'Tier 3 — Mismatch', color: 'var(--color-rose)', bg: 'var(--color-rose-subtle)', icon: <AlertTriangle size={16} /> },
}

const STATUS_COLORS = { met: 'var(--color-emerald)', partial: 'var(--color-amber)', missing: 'var(--color-rose)' }
const SEVERITY_COLORS = { high: 'var(--color-rose)', medium: 'var(--color-amber)', low: 'var(--color-text-muted)' }

export function ScreeningPage() {
  const [resumeText, setResumeText] = useState('')
  const [result, setResult] = useState<GeminiScreeningResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>('requirements')

  const handleRun = async () => {
    if (!resumeText.trim()) { setError('Paste the resume text first.'); return }
    setError(null)
    setLoading(true)
    setResult(null)
    try {
      const res = await analyzeResume(resumeText, MOCK_JOB)
      setResult(res)
    } catch {
      // Graceful fallback for network or API issues
      const offline = buildOfflineScreeningResult(resumeText, MOCK_JOB)
      setResult(offline)
      setError('Gemini API unavailable — showing offline analysis.')
    } finally {
      setLoading(false)
    }
  }

  const tier = result ? TIER_CONFIG[result.tier] : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <TopHeader
        title="AI Screening"
        subtitle="Gemini analyzes resumes against job requirements in seconds."
      />

      <main style={{ flex: 1, padding: '28px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Input card */}
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', padding: '24px', boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <FileText size={16} style={{ color: 'var(--color-accent)' }} />
            <span style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
              Screening Against: {MOCK_JOB.title}
            </span>
          </div>
          <p style={{ margin: '0 0 14px', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Must-haves: {MOCK_JOB.must_haves.join(', ')}
          </p>

          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>
            Paste Resume Text
          </label>
          <textarea
            value={resumeText}
            onChange={e => setResumeText(e.target.value)}
            placeholder="Paste the full resume text here…"
            rows={8}
            style={{
              width: '100%', padding: '12px 14px',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)',
              fontFamily: 'inherit', resize: 'vertical',
              background: 'var(--color-surface-elevated)',
              outline: 'none', lineHeight: 1.6, boxSizing: 'border-box',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
          />

          {error && (
            <div style={{ marginTop: 10, fontSize: 'var(--text-xs)', color: 'var(--color-rose)' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            <button
              onClick={handleRun}
              disabled={loading}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 22px',
                background: loading ? 'var(--color-border)' : 'linear-gradient(135deg, hsl(231,76%,52%), hsl(231,76%,46%))',
                color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)', fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 2px 12px hsla(231,76%,52%,0.3)',
                transition: 'all 0.15s',
              }}
            >
              {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Brain size={15} />}
              {loading ? 'Analyzing with Gemini…' : 'Run AI Screening'}
            </button>
          </div>
        </div>

        {/* Results */}
        {result && tier && (
          <>
            {/* Score banner */}
            <div style={{
              background: tier.bg, border: `1px solid ${tier.color}33`,
              borderRadius: 'var(--radius-lg)', padding: '20px 24px',
              display: 'flex', alignItems: 'center', gap: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: tier.color }}>
                {tier.icon}
                <span style={{ fontWeight: 900, fontSize: 'var(--text-xl)' }}>{result.match_score}%</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 800, color: tier.color, fontSize: 'var(--text-base)' }}>{tier.label}</div>
                <p style={{ margin: '4px 0 0', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.55 }}>
                  {result.summary}
                </p>
              </div>
            </div>

            {/* Requirements accordion */}
            <div style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
            }}>
              <button
                onClick={() => setExpanded(e => e === 'requirements' ? null : 'requirements')}
                style={{
                  width: '100%', padding: '16px 20px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'none', border: 'none', cursor: 'pointer',
                  borderBottom: expanded === 'requirements' ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <span style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                  Requirement Mapping ({result.requirements.length})
                </span>
                {expanded === 'requirements' ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </button>
              {expanded === 'requirements' && (
                <div style={{ padding: '8px 0' }}>
                  {result.requirements.map((req, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 12, padding: '12px 20px',
                      borderBottom: i < result.requirements.length - 1 ? '1px solid var(--color-border)' : 'none',
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: STATUS_COLORS[req.status], flexShrink: 0, marginTop: 5,
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                          {req.requirement_text}
                          <span style={{ marginLeft: 8, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', color: STATUS_COLORS[req.status] }}>
                            {req.status}
                          </span>
                        </div>
                        {req.evidence_quote && (
                          <div style={{
                            fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
                            fontStyle: 'italic', padding: '4px 8px',
                            background: 'var(--color-surface-elevated)',
                            borderRadius: 4, borderLeft: '2px solid var(--color-border)',
                          }}>
                            "{req.evidence_quote}"
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Flags accordion */}
            {result.flags.length > 0 && (
              <div style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
              }}>
                <button
                  onClick={() => setExpanded(e => e === 'flags' ? null : 'flags')}
                  style={{
                    width: '100%', padding: '16px 20px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'none', border: 'none', cursor: 'pointer',
                    borderBottom: expanded === 'flags' ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                    Validation Flags ({result.flags.length})
                  </span>
                  {expanded === 'flags' ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                </button>
                {expanded === 'flags' && (
                  <div style={{ padding: '8px 0' }}>
                    {result.flags.map((flag, i) => (
                      <div key={i} style={{
                        padding: '12px 20px',
                        borderBottom: i < result.flags.length - 1 ? '1px solid var(--color-border)' : 'none',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span style={{
                            padding: '2px 7px', borderRadius: 4,
                            background: SEVERITY_COLORS[flag.severity] + '20',
                            color: SEVERITY_COLORS[flag.severity],
                            fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                          }}>{flag.severity}</span>
                          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                            {flag.flag_type.replace('_', ' ')}
                          </span>
                        </div>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{flag.description}</div>
                        {flag.evidence_quote && (
                          <div style={{
                            marginTop: 6, fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
                            fontStyle: 'italic', padding: '4px 8px',
                            background: 'var(--color-surface-elevated)',
                            borderRadius: 4, borderLeft: '2px solid var(--color-border)',
                          }}>
                            "{flag.evidence_quote}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
