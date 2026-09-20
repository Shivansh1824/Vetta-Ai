import { useState, useRef, useEffect } from 'react'
import { TopHeader } from '../components/layout/TopHeader'
import { Upload, FileText, Loader2, CheckCircle2, AlertTriangle, Brain, ChevronDown, ChevronRight, Sparkles } from 'lucide-react'
import { analyzeResume, buildOfflineScreeningResult, extractAndValidateResume } from '../services/gemini'
import type { Job, GeminiScreeningResult, Tier, RequirementStatus, FlagSeverity } from '../types'
import { SAMPLE_CANDIDATES } from '../data/sampleCandidates'
import type { SampleCandidate } from '../data/sampleCandidates'

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

const TIER_CONFIG: Record<Tier, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  tier_1_match: { label: 'Tier 1 — Top Match', color: 'var(--color-emerald)', bg: 'var(--color-emerald-subtle)', icon: <CheckCircle2 size={16} /> },
  tier_2_potential: { label: 'Tier 2 — Review', color: 'var(--color-amber)', bg: 'var(--color-amber-subtle)', icon: <AlertTriangle size={16} /> },
  tier_3_mismatch: { label: 'Tier 3 — Mismatch', color: 'var(--color-rose)', bg: 'var(--color-rose-subtle)', icon: <AlertTriangle size={16} /> },
}

const STATUS_COLORS: Record<RequirementStatus, string> = { met: 'var(--color-emerald)', partial: 'var(--color-amber)', missing: 'var(--color-rose)' }
const SEVERITY_COLORS: Record<FlagSeverity, string> = { high: 'var(--color-rose)', medium: 'var(--color-amber)', low: 'var(--color-text-muted)' }

export function ScreeningPage() {
  const [resumeText, setResumeText] = useState('')
  const [candidateName, setCandidateName] = useState('')
  const [isSample, setIsSample] = useState(false)
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [result, setResult] = useState<GeminiScreeningResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>('requirements')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleLoadSample = (sample: SampleCandidate) => {
    setResumeText(sample.resumeText)
    setCandidateName(sample.name)
    setIsSample(true)
    setActiveSampleId(sample.id)
    setFileName(null)
    setError(null)
  }

  // Listen to quick Demo Data clicks from TopHeader or Sidebar
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<SampleCandidate>
      if (customEvent.detail) {
        handleLoadSample(customEvent.detail)
      }
    }
    window.addEventListener('vetta:load-sample-candidate', handler)
    return () => window.removeEventListener('vetta:load-sample-candidate', handler)
  }, [])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setLoading(true)

    const ext = file.name.split('.').pop()?.toLowerCase() || ''
    const isImg = ['png', 'jpg', 'jpeg', 'webp'].includes(ext)
    const isPdf = ext === 'pdf'

    if (isImg || isPdf) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const base64Url = event.target?.result as string
        const base64 = base64Url.split(',')[1] || ''
        const mimeType = file.type || (isPdf ? 'application/pdf' : 'image/jpeg')
        try {
          const res = await extractAndValidateResume({ base64, mimeType, fileName: file.name })
          if (!res.is_resume) {
            setError(res.rejection_reason || 'The resume you have uploaded is not a resume. You have uploaded something else. Please upload a valid candidate resume.')
            setResumeText('')
            setFileName(null)
          } else {
            setResumeText(res.formatted_resume_text || '')
            setCandidateName(res.candidate_name || file.name.replace(/\.[^/.]+$/, ''))
            setFileName(file.name)
            setIsSample(false)
            setActiveSampleId(null)
          }
        } catch {
          setError('Error analyzing document.')
        } finally {
          setLoading(false)
        }
      }
      reader.readAsDataURL(file)
    } else {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const text = (event.target?.result as string) || ''
        try {
          const res = await extractAndValidateResume({ text, fileName: file.name })
          if (!res.is_resume) {
            setError(res.rejection_reason || 'The resume you have uploaded is not a resume. You have uploaded something else. Please upload a valid candidate resume.')
            setResumeText('')
            setFileName(null)
          } else {
            setResumeText(res.formatted_resume_text || text)
            setCandidateName(res.candidate_name || file.name.replace(/\.[^/.]+$/, ''))
            setFileName(file.name)
            setIsSample(false)
            setActiveSampleId(null)
          }
        } catch {
          setError('Error reading file.')
        } finally {
          setLoading(false)
        }
      }
      reader.readAsText(file)
    }
  }

  const handleRun = async () => {
    if (!resumeText.trim()) { setError('Please upload a resume or select a sample candidate.'); return }
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
      setError('Gemini API reached limit/offline — displaying offline analysis.')
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

      <main style={{ flex: 1, padding: '14px 20px', minHeight: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 12 }}>

        {/* Top Control Bar: Target Role + Demo Candidates + Upload on 1 Screen */}
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', padding: '10px 16px', boxShadow: 'var(--shadow-xs)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <FileText size={15} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>
                Target Role: {MOCK_JOB.title}
              </div>
              <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>
                Must-haves: {MOCK_JOB.must_haves.slice(0, 4).join(', ')}…
              </div>
            </div>
          </div>

          {/* Quick Demo Data Pills */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Sparkles size={11} style={{ color: 'var(--color-amber)' }} /> Demo Data:
            </span>
            {SAMPLE_CANDIDATES.map(cand => {
              const isSelected = activeSampleId === cand.id
              return (
                <button
                  key={cand.id}
                  type="button"
                  onClick={() => handleLoadSample(cand)}
                  style={{
                    padding: '4px 9px', borderRadius: 'var(--radius-pill)',
                    background: isSelected ? 'var(--color-accent)' : 'var(--color-surface-elevated)',
                    color: isSelected ? '#fff' : 'var(--color-text-primary)',
                    border: `1px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    cursor: 'pointer', fontSize: 11, fontWeight: 700,
                    display: 'flex', alignItems: 'center', gap: 5,
                    transition: 'all 0.15s',
                  }}
                >
                  <span>{cand.name}</span>
                  <span style={{
                    fontSize: 9, fontWeight: 900, padding: '1px 4px', borderRadius: 3,
                    background: isSelected ? 'rgba(255,255,255,0.2)' : 'var(--color-surface)',
                    color: isSelected ? '#fff' : 'var(--color-accent)',
                  }}>
                    {cand.expectedScore}%
                  </span>
                </button>
              )
            })}
          </div>

          {/* Upload Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.pdf,.doc,.docx"
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)', fontSize: 11, fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Upload size={12} /> {fileName ? `File: ${fileName}` : 'Upload File'}
            </button>
          </div>
        </div>

        {/* Workspace: Dual View when Result Present, Single Editor when Idle */}
        {result && tier ? (
          <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 14, flex: 1, minHeight: 0, overflow: 'hidden' }}>
            {/* Left Column: Candidate Resume Editor / Preview */}
            <div style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)', padding: '16px', boxShadow: 'var(--shadow-xs)',
              display: 'flex', flexDirection: 'column', gap: 10, minHeight: 0,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                  {candidateName || 'Candidate Profile'}
                </span>
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-emerald)', background: 'var(--color-emerald-subtle)', padding: '2px 6px', borderRadius: 4 }}>
                  SCREENED
                </span>
              </div>

              <textarea
                value={resumeText}
                onChange={e => {
                  setResumeText(e.target.value)
                  if (isSample) { setIsSample(false); setActiveSampleId(null) }
                }}
                placeholder="Candidate resume content…"
                style={{
                  flex: 1, minHeight: 120, width: '100%', padding: '10px 12px',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)',
                  fontFamily: 'inherit', resize: 'none', background: 'var(--color-surface-elevated)',
                  outline: 'none', lineHeight: 1.5, boxSizing: 'border-box',
                }}
              />

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={handleRun}
                  disabled={loading}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px 12px',
                    background: loading ? 'var(--color-border)' : 'var(--color-accent)',
                    color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
                    fontSize: 'var(--text-xs)', fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Brain size={13} />}
                  <span>{loading ? 'Re-analyzing…' : 'Re-screen'}</span>
                </button>
                <button
                  onClick={() => setResult(null)}
                  style={{
                    padding: '8px 12px', background: 'none', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)', fontWeight: 700,
                    color: 'var(--color-text-secondary)', cursor: 'pointer',
                  }}
                >
                  Full View
                </button>
              </div>
            </div>

            {/* Right Column: Screening Results with its own scroll */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: 10,
              overflowY: 'auto', paddingRight: 4, minHeight: 0,
            }}>
              {/* Score banner */}
              <div style={{
                background: tier.bg, border: `1px solid ${tier.color}33`,
                borderRadius: 'var(--radius-lg)', padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: tier.color }}>
                  {tier.icon}
                  <span style={{ fontWeight: 900, fontSize: 'var(--text-xl)' }}>{result.match_score}%</span>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, color: tier.color, fontSize: 'var(--text-sm)' }}>{tier.label}</div>
                  <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {result.summary}
                  </p>
                </div>
              </div>

              {/* Standout Positive Strengths */}
              {result.strengths && result.strengths.length > 0 && (
                <div style={{
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)', padding: '12px 16px', boxShadow: 'var(--shadow-xs)',
                  flexShrink: 0,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <Sparkles size={14} style={{ color: 'var(--color-emerald)' }} />
                    <span style={{ fontWeight: 800, fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>
                      Standout Qualifications & Strengths
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {result.strengths.map((s, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.4 }}>
                        <span style={{ color: 'var(--color-emerald)', fontWeight: 800 }}>✓</span>
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Requirements accordion */}
              <div style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)',
              }}>
                <button
                  onClick={() => setExpanded(e => e === 'requirements' ? null : 'requirements')}
                  style={{
                    width: '100%', padding: '12px 16px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'none', border: 'none', cursor: 'pointer',
                    borderBottom: expanded === 'requirements' ? '1px solid var(--color-border)' : 'none',
                  }}
                >
                  <span style={{ fontWeight: 800, fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>
                    Requirement Mapping ({result.requirements.length})
                  </span>
                  {expanded === 'requirements' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
                {expanded === 'requirements' && (
                  <div style={{ padding: '6px 0' }}>
                    {result.requirements.map((req, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: 10, padding: '10px 16px',
                        borderBottom: i < result.requirements.length - 1 ? '1px solid var(--color-border)' : 'none',
                      }}>
                        <div style={{
                          width: 7, height: 7, borderRadius: '50%',
                          background: STATUS_COLORS[req.status], flexShrink: 0, marginTop: 5,
                        }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 2 }}>
                            {req.requirement_text}
                            <span style={{ marginLeft: 8, fontSize: 9, fontWeight: 800, textTransform: 'uppercase', color: STATUS_COLORS[req.status] }}>
                              {req.status}
                            </span>
                          </div>
                          {req.evidence_quote && (
                            <div style={{
                              fontSize: 11, color: 'var(--color-text-muted)',
                              fontStyle: 'italic', padding: '3px 8px',
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
                  borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-xs)',
                }}>
                  <button
                    onClick={() => setExpanded(e => e === 'flags' ? null : 'flags')}
                    style={{
                      width: '100%', padding: '12px 16px',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'none', border: 'none', cursor: 'pointer',
                      borderBottom: expanded === 'flags' ? '1px solid var(--color-border)' : 'none',
                    }}
                  >
                    <span style={{ fontWeight: 800, fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>
                      Validation Flags ({result.flags.length})
                    </span>
                    {expanded === 'flags' ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                  {expanded === 'flags' && (
                    <div style={{ padding: '6px 0' }}>
                      {result.flags.map((flag, i) => (
                        <div key={i} style={{
                          padding: '10px 16px',
                          borderBottom: i < result.flags.length - 1 ? '1px solid var(--color-border)' : 'none',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                            <span style={{
                              padding: '1px 6px', borderRadius: 4,
                              background: SEVERITY_COLORS[flag.severity] + '20',
                              color: SEVERITY_COLORS[flag.severity],
                              fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
                            }}>{flag.severity}</span>
                            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'capitalize' }}>
                              {flag.flag_type.replace('_', ' ')}
                            </span>
                          </div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)' }}>{flag.description}</div>
                          {flag.evidence_quote && (
                            <div style={{
                              marginTop: 4, fontSize: 11, color: 'var(--color-text-muted)',
                              fontStyle: 'italic', padding: '3px 8px',
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
            </div>
          </div>
        ) : (
          /* Single Editor Card when No Results: Fits comfortably on 1 screen */
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)', padding: '18px 22px', boxShadow: 'var(--shadow-xs)',
            display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minHeight: 0,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
                {candidateName ? `Candidate Resume: ${candidateName}` : 'Candidate Resume Content (Paste, Upload, or Pick Demo Data Above)'}
              </label>
              {isSample && (
                <span style={{ fontSize: 10, fontWeight: 800, color: 'var(--color-accent)', background: 'var(--color-accent-subtle)', padding: '2px 8px', borderRadius: 4 }}>
                  SAMPLE DATA ACTIVE
                </span>
              )}
            </div>

            <textarea
              value={resumeText}
              onChange={e => {
                setResumeText(e.target.value)
                if (isSample) { setIsSample(false); setActiveSampleId(null) }
              }}
              placeholder="Paste or review candidate resume text here, or click one of the Demo Data pills above…"
              style={{
                flex: 1, minHeight: 180, width: '100%', padding: '12px 14px',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)',
                fontFamily: 'inherit', resize: 'none', background: 'var(--color-surface-elevated)',
                outline: 'none', lineHeight: 1.5, boxSizing: 'border-box',
              }}
            />

            {error && (
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-rose)', fontWeight: 700 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                Gemini Flash benchmarks candidate against must-haves with verifiable evidence.
              </span>
              <button
                onClick={handleRun}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 22px',
                  background: loading ? 'var(--color-border)' : 'linear-gradient(135deg, hsl(231,76%,52%), hsl(231,76%,46%))',
                  color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)', fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 2px 10px hsla(231,76%,52%,0.25)',
                }}
              >
                {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Brain size={14} />}
                {loading ? 'Analyzing with Gemini…' : 'Run AI Screening'}
              </button>
            </div>
          </div>
        )}
      </main>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
