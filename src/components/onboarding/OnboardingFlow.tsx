import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import {
  Briefcase, FileText, AlertTriangle,
  Brain, ArrowRight, ArrowLeft, Sparkles, Trash2, ShieldCheck,
  Check, FileUp, RefreshCw
} from 'lucide-react'
import { SAMPLE_CANDIDATES } from '../../data/sampleCandidates'
import type { SampleCandidate } from '../../data/sampleCandidates'
import { analyzeResume, buildOfflineScreeningResult } from '../../services/gemini'
import type { Job, GeminiScreeningResult } from '../../types'

const TARGET_JOB: Job = {
  id: 'target-job-demo',
  recruiter_id: null,
  title: 'Senior Full-Stack & Distributed Systems Engineer',
  department: 'Platform Engineering',
  experience_level: 'Senior (5+ years)',
  must_haves: ['React', 'TypeScript', 'Node.js', 'Distributed Systems / Microservices', 'PostgreSQL / SQL'],
  nice_to_haves: ['Kafka / Event Streaming', 'Redis Caching', 'Kubernetes / Docker', 'gRPC'],
  description_text: 'We are seeking a seasoned Senior Full-Stack & Distributed Systems Engineer to design resilient microservices, scale transactional data pipelines with PostgreSQL and Redis, and architect real-time interactive user interfaces using modern React and TypeScript.',
  status: 'active',
  created_at: new Date().toISOString(),
}

const TIER_META = {
  tier_1_match: { label: 'Tier 1 — Top Match', color: 'var(--color-emerald)', bg: 'var(--color-emerald-subtle)', badge: 'Strong Candidate' },
  tier_2_potential: { label: 'Tier 2 — Potential Review', color: 'var(--color-amber)', bg: 'var(--color-amber-subtle)', badge: 'Moderate Fit' },
  tier_3_mismatch: { label: 'Tier 3 — Mismatch', color: 'var(--color-rose)', bg: 'var(--color-rose-subtle)', badge: 'Gap Detected' },
}

const STATUS_COLORS = { met: 'var(--color-emerald)', partial: 'var(--color-amber)', missing: 'var(--color-rose)' }

interface OnboardingFlowProps {
  onComplete?: (candidateData?: { name: string; result: GeminiScreeningResult }) => void
  onNavigateToInterview?: (candidateName: string, resumeText: string) => void
  onNavigateToDashboard?: () => void
}

export function OnboardingFlow({ onComplete, onNavigateToInterview, onNavigateToDashboard }: OnboardingFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [candidateName, setCandidateName] = useState('')
  const [resumeText, setResumeText] = useState('')
  const [isSampleData, setIsSampleData] = useState(false)
  const [sampleCandidateId, setSampleCandidateId] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)

  // Step 3 State
  const [screeningLoading, setScreeningLoading] = useState(false)
  const [screeningResult, setScreeningResult] = useState<GeminiScreeningResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const scoreNumberRef = useRef<HTMLSpanElement>(null)

  // Step transition animation
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelector('.step-container'),
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      )
    }
  }, [step])

  // Animated score counter in Step 3
  useEffect(() => {
    if (step === 3 && screeningResult && scoreNumberRef.current) {
      const targetScore = screeningResult.match_score
      gsap.fromTo(
        scoreNumberRef.current,
        { innerText: 0 },
        {
          innerText: targetScore,
          duration: 1.1,
          ease: 'power2.out',
          snap: { innerText: 1 },
          onUpdate() {
            if (scoreNumberRef.current) {
              scoreNumberRef.current.textContent = Math.round(
                parseFloat(scoreNumberRef.current.textContent || '0')
              ).toString()
            }
          },
        }
      )
    }
  }, [step, screeningResult])

  // Handle Loading Sample Candidate
  const handleLoadSample = (sample: SampleCandidate) => {
    setCandidateName(sample.name)
    setResumeText(sample.resumeText)
    setIsSampleData(true)
    setSampleCandidateId(sample.id)
    setUploadedFileName(null)
    setErrorMsg(null)
  }

  // Handle Real File Upload — Clears and replaces sample data immediately
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        setResumeText(content)
        // Deduce a name from filename or default
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
        setCandidateName(cleanName)
        setUploadedFileName(file.name)
        // Automatically clear sample flag
        setIsSampleData(false)
        setSampleCandidateId(null)
        setErrorMsg(null)
      }
    }
    reader.readAsText(file)
  }

  // Handle manual typing in textarea — if user types after sample was loaded, prompt to clear
  const handleTextChange = (val: string) => {
    setResumeText(val)
    if (isSampleData && val !== SAMPLE_CANDIDATES.find(s => s.id === sampleCandidateId)?.resumeText) {
      // User modified the text manually, convert out of sample lock
      setIsSampleData(false)
      setSampleCandidateId(null)
    }
  }

  // Clear all data
  const handleClear = () => {
    setResumeText('')
    setCandidateName('')
    setIsSampleData(false)
    setSampleCandidateId(null)
    setUploadedFileName(null)
    setErrorMsg(null)
  }

  // Run the AI Screening Analysis
  const handleRunScreening = async () => {
    if (!resumeText.trim()) {
      setErrorMsg('Please upload a resume or select a sample candidate first.')
      return
    }

    setStep(3)
    setScreeningLoading(true)
    setErrorMsg(null)
    setScreeningResult(null)

    try {
      const res = await analyzeResume(resumeText, TARGET_JOB)
      setScreeningResult(res)
      if (onComplete) onComplete({ name: candidateName || 'Candidate', result: res })
    } catch {
      // Offline fallback
      const offline = buildOfflineScreeningResult(resumeText, TARGET_JOB)
      setScreeningResult(offline)
      setErrorMsg('Gemini API reached limit/offline — displaying verified offline intelligence.')
      if (onComplete) onComplete({ name: candidateName || 'Candidate', result: offline })
    } finally {
      setScreeningLoading(false)
    }
  }

  return (
    <div ref={containerRef} style={{
      maxWidth: 920, margin: '0 auto', padding: '32px 24px',
      display: 'flex', flexDirection: 'column', gap: 24, width: '100%',
    }}>
      {/* Onboarding Header & Steps Progress */}
      <div style={{
        background: 'var(--color-surface)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-xl)', padding: '24px 28px',
        boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column', gap: 18,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
                padding: '3px 10px', borderRadius: 999, fontSize: 'var(--text-xs)', fontWeight: 800,
              }}>
                HACKATHON ONBOARDING FLOW
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                Step {step} of 3
              </span>
            </div>
            <h1 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
              {step === 1 && 'Step 1: Role Configuration & Position Setup'}
              {step === 2 && 'Step 2: Candidate Intake & Resume Upload'}
              {step === 3 && 'Step 3: AI Screening & Requirement Verification'}
            </h1>
          </div>

          {/* Stepper Dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 999,
                  background: step === s ? 'var(--color-accent)' : step > s ? 'var(--color-emerald)' : 'var(--color-surface-elevated)',
                  color: step >= s ? '#fff' : 'var(--color-text-muted)',
                  fontSize: 'var(--text-xs)', fontWeight: 800,
                  transition: 'all 0.2s',
                }}
              >
                {step > s ? <Check size={13} /> : s}
                <span>{s === 1 ? 'Role' : s === 2 ? 'Upload' : 'Analysis'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Contents */}
      <div className="step-container">
        {/* ==================================================================== */}
        {/* STEP 1: POSITION CONFIRMATION */}
        {/* ==================================================================== */}
        {step === 1 && (
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-sm)',
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Briefcase size={22} />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  {TARGET_JOB.title}
                </h2>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                  Department: {TARGET_JOB.department} • {TARGET_JOB.experience_level}
                </span>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {TARGET_JOB.description_text}
            </p>

            <div>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-primary)', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>
                Required Must-Haves (Evaluated by Gemini AI):
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {TARGET_JOB.must_haves.map((skill, idx) => (
                  <span key={idx} style={{
                    padding: '6px 12px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
                    fontSize: 'var(--text-xs)', fontWeight: 700,
                  }}>
                    ✓ {skill}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 12, borderTop: '1px solid var(--color-border)' }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 24px', borderRadius: 'var(--radius-md)',
                  background: 'linear-gradient(135deg, hsl(231,76%,52%), hsl(231,76%,46%))',
                  color: '#fff', border: 'none', fontWeight: 800, fontSize: 'var(--text-sm)',
                  cursor: 'pointer', boxShadow: '0 2px 10px hsla(231,76%,52%,0.25)',
                }}
              >
                Proceed to Candidate Intake <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 2: UPLOAD FILE & CANDIDATE INTAKE (WITH SAMPLE DATA OPTION) */}
        {/* ==================================================================== */}
        {step === 2 && (
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)', padding: '28px', boxShadow: 'var(--shadow-sm)',
            display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            {/* Header & Explanation */}
            <div>
              <h2 style={{ margin: '0 0 6px', fontSize: 'var(--text-lg)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Provide Candidate Resume
              </h2>
              <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                Upload a candidate resume, paste text, or use our verified <strong>sample candidate data</strong> to test the screening pipeline instantly.
              </p>
            </div>

            {/* Prominent Sample Data Selector Section */}
            <div style={{
              background: isSampleData ? 'var(--color-accent-subtle)' : 'var(--color-surface-elevated)',
              border: `1.5px ${isSampleData ? 'solid var(--color-accent)' : 'dashed var(--color-border)'}`,
              borderRadius: 'var(--radius-lg)', padding: '16px 20px',
              display: 'flex', flexDirection: 'column', gap: 10,
              transition: 'all 0.2s',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={16} style={{ color: 'var(--color-accent)' }} />
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
                    Quick Demo: Load Sample Candidate Data
                  </span>
                </div>
                {isSampleData && (
                  <span style={{
                    fontSize: 11, fontWeight: 800, color: 'var(--color-accent)',
                    background: '#fff', padding: '2px 8px', borderRadius: 999,
                  }}>
                    ACTIVE SAMPLE MODE
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
                {SAMPLE_CANDIDATES.map((sample) => {
                  const isSelected = sampleCandidateId === sample.id
                  return (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleLoadSample(sample)}
                      style={{
                        textAlign: 'left', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                        background: isSelected ? 'var(--color-surface)' : 'var(--color-surface)',
                        border: `1.5px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                        cursor: 'pointer', transition: 'all 0.15s',
                        boxShadow: isSelected ? '0 2px 8px hsla(231,76%,52%,0.2)' : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                        <span style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                          {sample.name}
                        </span>
                        <span style={{
                          fontSize: 10, fontWeight: 900, padding: '1px 6px', borderRadius: 4,
                          background: sample.tier === 'tier_1_match' ? 'var(--color-emerald-subtle)' : sample.tier === 'tier_2_potential' ? 'var(--color-amber-subtle)' : 'var(--color-rose-subtle)',
                          color: sample.tier === 'tier_1_match' ? 'var(--color-emerald)' : sample.tier === 'tier_2_potential' ? 'var(--color-amber)' : 'var(--color-rose)',
                        }}>
                          {sample.expectedScore}%
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.3 }}>
                        {sample.tagline}
                      </div>
                    </button>
                  )
                })}
              </div>

              {isSampleData && (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', background: '#fff', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <FileText size={14} style={{ color: 'var(--color-accent)' }} />
                    <span>Loaded <strong>{candidateName}</strong> sample resume. Uploading or entering your own file will <strong>automatically clear</strong> this sample data.</span>
                  </div>
                  <button
                    onClick={handleClear}
                    type="button"
                    style={{
                      background: 'none', border: 'none', color: 'var(--color-rose)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                      fontSize: 11, fontWeight: 700,
                    }}
                  >
                    <Trash2 size={12} /> Clear
                  </button>
                </div>
              )}
            </div>

            {/* File Upload Zone (Auto-clears sample data upon upload) */}
            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: '2px dashed var(--color-border)', borderRadius: 'var(--radius-lg)',
                padding: '24px', textAlign: 'center', cursor: 'pointer',
                background: uploadedFileName ? 'var(--color-emerald-subtle)' : 'var(--color-surface-elevated)',
                transition: 'all 0.15s',
              }}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.pdf,.md,.doc,.docx"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <FileUp size={28} style={{ color: uploadedFileName ? 'var(--color-emerald)' : 'var(--color-accent)', margin: '0 auto 8px' }} />
              <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                {uploadedFileName ? `Loaded File: ${uploadedFileName}` : 'Click to Upload Resume File or Drag & Drop'}
              </div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                {uploadedFileName ? 'Sample data removed. Live uploaded resume active.' : 'Supports .txt, .md, text. Uploading automatically replaces sample data.'}
              </span>
            </div>

            {/* Candidate Name & Resume Text Area */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
                  Candidate Name & Resume Text
                </label>
                {resumeText && (
                  <button
                    onClick={handleClear}
                    type="button"
                    style={{
                      background: 'none', border: 'none', color: 'var(--color-text-muted)',
                      cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4,
                    }}
                  >
                    <RefreshCw size={11} /> Reset
                  </button>
                )}
              </div>

              <input
                type="text"
                placeholder="Candidate Full Name"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                style={{
                  width: '100%', padding: '10px 14px', marginBottom: 10,
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)',
                  background: 'var(--color-surface)', boxSizing: 'border-box',
                }}
              />

              <textarea
                value={resumeText}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder="Paste or review candidate resume content here…"
                rows={9}
                style={{
                  width: '100%', padding: '12px 14px',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-mono, monospace)', resize: 'vertical',
                  background: 'var(--color-surface)', lineHeight: 1.5, boxSizing: 'border-box',
                }}
              />
            </div>

            {errorMsg && (
              <div style={{
                padding: '10px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-rose-subtle)', color: 'var(--color-rose)',
                fontSize: 'var(--text-xs)', fontWeight: 700,
              }}>
                {errorMsg}
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, borderTop: '1px solid var(--color-border)' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '9px 18px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: 'var(--text-sm)',
                  cursor: 'pointer',
                }}
              >
                <ArrowLeft size={15} /> Back to Role
              </button>

              <button
                onClick={handleRunScreening}
                disabled={!resumeText.trim()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '11px 24px', borderRadius: 'var(--radius-md)',
                  background: resumeText.trim()
                    ? 'linear-gradient(135deg, hsl(231,76%,52%), hsl(231,76%,46%))'
                    : 'var(--color-border)',
                  color: '#fff', border: 'none', fontWeight: 800, fontSize: 'var(--text-sm)',
                  cursor: resumeText.trim() ? 'pointer' : 'not-allowed',
                  boxShadow: resumeText.trim() ? '0 2px 10px hsla(231,76%,52%,0.25)' : 'none',
                }}
              >
                <Brain size={16} /> Run AI Screening <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* STEP 3: AI SCREENING RESULTS & ACTION DISPATCH */}
        {/* ==================================================================== */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {screeningLoading ? (
              <div style={{
                background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-xl)', padding: '60px 28px', textAlign: 'center',
                boxShadow: 'var(--shadow-sm)', display: 'flex', flexDirection: 'column',
                alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 16,
                  background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: 'pulse 1.5s infinite',
                }}>
                  <Brain size={28} />
                </div>
                <h3 style={{ margin: 0, fontWeight: 900, color: 'var(--color-text-primary)' }}>
                  Screening {candidateName || 'Candidate'} with Gemini AI…
                </h3>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                  Evaluating against 5 must-haves, checking tenure consistency, and mapping citations.
                </p>
              </div>
            ) : screeningResult ? (
              <>
                {/* Result Card with animated score */}
                {(() => {
                  const meta = TIER_META[screeningResult.tier]
                  return (
                    <div style={{
                      background: meta.bg, border: `1.5px solid ${meta.color}40`,
                      borderRadius: 'var(--radius-xl)', padding: '24px 28px',
                      boxShadow: 'var(--shadow-sm)', display: 'flex',
                      alignItems: 'center', justifyContent: 'space-between',
                      flexWrap: 'wrap', gap: 16,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{
                          width: 72, height: 72, borderRadius: 20,
                          background: '#fff', display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center',
                          border: `2px solid ${meta.color}`, boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                        }}>
                          <span
                            ref={scoreNumberRef}
                            style={{ fontWeight: 900, fontSize: 28, color: meta.color, lineHeight: 1 }}
                          >
                            {screeningResult.match_score}
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
                              {isSampleData ? 'Verified Sample Demo' : 'Live Analyzed Candidate'}
                            </span>
                          </div>
                          <h2 style={{ margin: 0, fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
                            {candidateName || 'Candidate'}: {meta.label}
                          </h2>
                          <p style={{ margin: '6px 0 0', fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', maxWidth: 620, lineHeight: 1.5 }}>
                            {screeningResult.summary}
                          </p>
                        </div>
                      </div>

                      {/* Quick action button to proceed to Interview Cockpit */}
                      {onNavigateToInterview && (
                        <button
                          onClick={() => onNavigateToInterview(candidateName, resumeText)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '12px 20px', borderRadius: 'var(--radius-md)',
                            background: 'var(--color-surface)', border: `1.5px solid ${meta.color}`,
                            color: meta.color, fontWeight: 800, fontSize: 'var(--text-sm)',
                            cursor: 'pointer', boxShadow: 'var(--shadow-sm)',
                          }}
                        >
                          Generate Interview Questions <ArrowRight size={15} />
                        </button>
                      )}
                    </div>
                  )
                })()}

                {/* Requirements Breakdown Accordion */}
                <div style={{
                  background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-xl)', padding: '24px 28px',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <ShieldCheck size={18} style={{ color: 'var(--color-accent)' }} />
                    <h3 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                      Requirement Mapping & Resume Evidence ({screeningResult.requirements.length})
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {screeningResult.requirements.map((req, i) => (
                      <div key={i} style={{
                        padding: '12px 16px', borderRadius: 'var(--radius-md)',
                        background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
                        display: 'flex', gap: 12, alignItems: 'flex-start',
                      }}>
                        <div style={{
                          width: 10, height: 10, borderRadius: '50%',
                          background: STATUS_COLORS[req.status], flexShrink: 0, marginTop: 4,
                        }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                            <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                              {req.requirement_text}
                            </span>
                            <span style={{
                              fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
                              color: STATUS_COLORS[req.status], padding: '2px 6px',
                              background: '#fff', borderRadius: 4,
                            }}>
                              {req.status}
                            </span>
                          </div>
                          {req.evidence_quote && (
                            <div style={{
                              fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)',
                              fontStyle: 'italic', background: '#fff', padding: '6px 10px',
                              borderRadius: 4, borderLeft: '3px solid var(--color-accent)',
                            }}>
                              "{req.evidence_quote}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Validation Flags (if any) */}
                {screeningResult.flags && screeningResult.flags.length > 0 && (
                  <div style={{
                    background: 'var(--color-surface)', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-xl)', padding: '24px 28px',
                    boxShadow: 'var(--shadow-sm)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                      <AlertTriangle size={18} style={{ color: 'var(--color-amber)' }} />
                      <h3 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                        AI Validation Flags ({screeningResult.flags.length})
                      </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {screeningResult.flags.map((flag, i) => (
                        <div key={i} style={{
                          padding: '12px 16px', borderRadius: 'var(--radius-md)',
                          background: 'var(--color-amber-subtle)', border: '1px solid hsla(38,92%,50%,0.2)',
                          display: 'flex', flexDirection: 'column', gap: 4,
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{
                              fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
                              color: 'var(--color-amber)', background: '#fff', padding: '1px 6px', borderRadius: 4,
                            }}>
                              {flag.severity} severity
                            </span>
                            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'capitalize' }}>
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

                {/* Bottom Navigation CTAs */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '18px 24px', background: 'var(--color-surface)',
                  borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)',
                }}>
                  <button
                    onClick={() => setStep(2)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '9px 18px', borderRadius: 'var(--radius-md)',
                      background: 'none', border: '1px solid var(--color-border)',
                      color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: 'var(--text-sm)',
                      cursor: 'pointer',
                    }}
                  >
                    <ArrowLeft size={15} /> Screen Another Candidate
                  </button>

                  <div style={{ display: 'flex', gap: 12 }}>
                    {onNavigateToDashboard && (
                      <button
                        onClick={onNavigateToDashboard}
                        style={{
                          padding: '10px 20px', borderRadius: 'var(--radius-md)',
                          background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
                          color: 'var(--color-text-primary)', fontWeight: 700, fontSize: 'var(--text-sm)',
                          cursor: 'pointer',
                        }}
                      >
                        Go to Dashboard
                      </button>
                    )}

                    {onNavigateToInterview && (
                      <button
                        onClick={() => onNavigateToInterview(candidateName, resumeText)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '10px 22px', borderRadius: 'var(--radius-md)',
                          background: 'linear-gradient(135deg, hsl(231,76%,52%), hsl(231,76%,46%))',
                          color: '#fff', border: 'none', fontWeight: 800, fontSize: 'var(--text-sm)',
                          cursor: 'pointer', boxShadow: '0 2px 10px hsla(231,76%,52%,0.25)',
                        }}
                      >
                        Interview Cockpit <ArrowRight size={15} />
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
