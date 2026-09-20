import { useState, useRef } from 'react'
import { TopHeader } from '../components/layout/TopHeader'
import {
  Loader2, CheckCircle2, ChevronDown, ChevronRight,
  Upload, FileText, Briefcase, Sparkles
} from 'lucide-react'
import { generateInterviewQuestions } from '../services/gemini'
import type { Job, GeminiInterviewResult, QuestionDifficulty } from '../types'
import { SAMPLE_CANDIDATES } from '../data/sampleCandidates'
import type { NavItem } from '../components/layout/Sidebar'

const PREDEFINED_JOBS: Job[] = [
  {
    id: 'demo-job-1',
    recruiter_id: null,
    title: 'Senior Full-Stack & Distributed Systems Engineer',
    department: 'Engineering',
    experience_level: '5+ years',
    must_haves: ['React 18', 'TypeScript', 'Node.js', 'PostgreSQL', 'Distributed Systems'],
    nice_to_haves: ['Kafka', 'Redis', 'Docker'],
    description_text: 'Senior Full-Stack Engineer with distributed systems expertise.',
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-job-2',
    recruiter_id: null,
    title: 'Frontend Tech Lead & Design Systems Architect',
    department: 'Product Experience',
    experience_level: '6+ years',
    must_haves: ['React', 'TypeScript', 'Design Systems', 'State Management'],
    nice_to_haves: ['Tailwind CSS', 'Micro-Frontends'],
    description_text: 'Frontend Tech Lead leading UI/UX and design system architecture.',
    status: 'active',
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-job-3',
    recruiter_id: null,
    title: 'DevOps & Cloud Infrastructure Engineer',
    department: 'Infrastructure',
    experience_level: '3+ years',
    must_haves: ['Kubernetes', 'CI/CD', 'AWS / Cloud Architecture'],
    nice_to_haves: ['Terraform', 'Prometheus'],
    description_text: 'DevOps & Cloud Engineer managing CI/CD and cloud infra.',
    status: 'active',
    created_at: new Date().toISOString(),
  },
]

const DIFFICULTY_STYLE: Record<QuestionDifficulty, { color: string; bg: string }> = {
  foundational: { color: 'var(--color-emerald)', bg: 'var(--color-emerald-subtle)' },
  intermediate: { color: 'var(--color-amber)', bg: 'var(--color-amber-subtle)' },
  advanced: { color: 'var(--color-accent)', bg: 'var(--color-accent-subtle)' },
}

export interface InterviewPageProps {
  onNavigate?: (page: NavItem) => void
}

export function InterviewPage({ onNavigate }: InterviewPageProps = {}) {
  const [selectedJobId, setSelectedJobId] = useState<string>(PREDEFINED_JOBS[0].id)
  const [customJdText, setCustomJdText] = useState('')
  const [useCustomJd, setUseCustomJd] = useState(false)

  const [resumeText, setResumeText] = useState('')
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [result, setResult] = useState<GeminiInterviewResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answered, setAnswered] = useState<Set<number>>(new Set())
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeJob: Job = useCustomJd
    ? {
        id: 'custom-job',
        recruiter_id: null,
        title: 'Custom Job Role',
        department: 'General',
        experience_level: 'Specified in JD',
        must_haves: ['Technical Proficiency', 'Domain Knowledge'],
        nice_to_haves: [],
        description_text: customJdText || 'Custom job description.',
        status: 'active',
        created_at: new Date().toISOString(),
      }
    : PREDEFINED_JOBS.find(j => j.id === selectedJobId) || PREDEFINED_JOBS[0]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setError(null)
    setUploadedFileName(file.name)

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = (event.target?.result as string) || ''
      setResumeText(text)
    }
    reader.readAsText(file)
  }

  const handleLoadSample = (sampleCandidateId: string) => {
    const sample = SAMPLE_CANDIDATES.find(c => c.id === sampleCandidateId)
    if (sample) {
      setResumeText(sample.resumeText)
      setUploadedFileName(`${sample.name} (Demo Data)`)
      setError(null)
    }
  }

  const handleGenerate = async () => {
    if (!resumeText.trim()) {
      setError('Please provide a candidate resume (upload or paste).')
      return
    }
    if (useCustomJd && !customJdText.trim()) {
      setError('Please provide the job description text.')
      return
    }

    setError(null)
    setLoading(true)
    setResult(null)
    setAnswered(new Set())

    try {
      const res = await generateInterviewQuestions(resumeText, activeJob, [])
      setResult(res)
    } catch {
      // Offline fallback
      setResult({
        candidate_summary: 'Experienced engineering candidate with strong technical background.',
        questions: [
          {
            question_text: `In your recent projects, how did you architect scalable solutions using ${activeJob.must_haves[0] || 'your core stack'}?`,
            target_criterion: activeJob.must_haves[0] || 'System Architecture',
            difficulty: 'advanced',
            what_to_listen_for: 'Evidence of architectural tradeoffs, scalability considerations, and metrics.',
            follow_up: 'What failure modes did you anticipate during high concurrency?',
          },
          {
            question_text: `Can you walk us through a challenging bug or performance bottleneck you resolved with ${activeJob.must_haves[1] || 'backend databases'}?`,
            target_criterion: activeJob.must_haves[1] || 'Problem Solving',
            difficulty: 'intermediate',
            what_to_listen_for: 'Systematic debugging approach, profiling tools, and measured improvements.',
            follow_up: 'How did you prevent similar regressions in CI/CD?',
          },
          {
            question_text: `How do you collaborate across teams when establishing coding standards and API contracts?`,
            target_criterion: 'Engineering Leadership & Communication',
            difficulty: 'foundational',
            what_to_listen_for: 'Empathy, constructive code review culture, and clear technical documentation.',
            follow_up: 'Tell us about a time you had a technical disagreement with a team member.',
          },
        ],
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleAnswer = (idx: number) => {
    setAnswered(prev => {
      const next = new Set(prev)
      next.has(idx) ? next.delete(idx) : next.add(idx)
      return next
    })
  }

  const coverage = result
    ? Math.round((answered.size / result.questions.length) * 100)
    : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <TopHeader
        title="Interview Cockpit"
        subtitle="Dual-intake AI interview co-pilot: Ingests Job Description + Resume to generate targeted questions."
      />

      <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto', display: 'flex', gap: 20 }}>
        {/* Left Column: Dual Inputs (Job Description & Resume) */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* 1. Job Description Intake */}
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)', padding: '18px 20px', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Briefcase size={16} style={{ color: 'var(--color-accent)' }} />
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
                  1. Job Description & Criteria
                </label>
              </div>
              <button
                type="button"
                onClick={() => setUseCustomJd(v => !v)}
                style={{
                  background: 'none', border: 'none', color: 'var(--color-accent)',
                  fontSize: 11, fontWeight: 700, cursor: 'pointer',
                }}
              >
                {useCustomJd ? '← Choose Predefined Job' : '+ Custom Job Description'}
              </button>
            </div>

            {!useCustomJd ? (
              <div>
                <select
                  value={selectedJobId}
                  onChange={e => setSelectedJobId(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)', background: 'var(--color-surface-elevated)',
                    fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', outline: 'none',
                    fontWeight: 700,
                  }}
                >
                  {PREDEFINED_JOBS.map(job => (
                    <option key={job.id} value={job.id}>{job.title} ({job.department})</option>
                  ))}
                </select>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                  {activeJob.must_haves.map(m => (
                    <span key={m} style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                      background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
                    }}>
                      ✓ {m}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <textarea
                value={customJdText}
                onChange={e => setCustomJdText(e.target.value)}
                placeholder="Paste or write the target job description requirements here…"
                rows={3}
                style={{
                  width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
                  background: 'var(--color-surface-elevated)', outline: 'none', resize: 'vertical',
                }}
              />
            )}
          </div>

          {/* 2. Candidate Resume Intake */}
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)', padding: '18px 20px', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={16} style={{ color: 'var(--color-accent)' }} />
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
                  2. Candidate Resume
                </label>
              </div>

              {/* Sample Pills & File Upload Trigger */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.pdf,.docx"
                  style={{ display: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '3px 8px', borderRadius: 4,
                    background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
                    fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', cursor: 'pointer',
                  }}
                >
                  <Upload size={11} />
                  <span>Upload File</span>
                </button>

                <div style={{ display: 'flex', gap: 4 }}>
                  {SAMPLE_CANDIDATES.slice(0, 2).map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleLoadSample(c.id)}
                      style={{
                        padding: '3px 7px', borderRadius: 4,
                        background: 'var(--color-accent-subtle)', border: '1px solid var(--color-accent)',
                        fontSize: 10, fontWeight: 800, color: 'var(--color-accent)', cursor: 'pointer',
                      }}
                    >
                      {c.name.split(' ')[0]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {uploadedFileName && (
              <div style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 700, marginBottom: 6 }}>
                Active Document: {uploadedFileName}
              </div>
            )}

            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste candidate resume text or click Upload File above…"
              rows={6}
              style={{
                width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)',
                fontFamily: 'JetBrains Mono, Menlo, monospace', background: 'var(--color-surface-elevated)',
                outline: 'none', resize: 'vertical', lineHeight: 1.5, boxSizing: 'border-box',
              }}
            />

            {error && (
              <div style={{ marginTop: 8, fontSize: 'var(--text-xs)', color: 'var(--color-rose)', fontWeight: 700 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                onClick={handleGenerate}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '9px 20px', borderRadius: 'var(--radius-md)',
                  background: loading ? 'var(--color-border)' : 'linear-gradient(135deg, hsl(231,76%,52%), hsl(231,76%,46%))',
                  color: '#fff', border: 'none', fontSize: 'var(--text-sm)', fontWeight: 800,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading ? 'none' : '0 2px 10px hsla(231,76%,52%,0.25)',
                }}
              >
                {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={15} />}
                <span>{loading ? 'Synthesizing with Gemini…' : 'Generate Questions'}</span>
              </button>
            </div>
          </div>

          {/* Generated Questions List */}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                Tailored Questions ({result.questions.length})
              </div>

              {result.questions.map((q, idx) => {
                const diff = DIFFICULTY_STYLE[q.difficulty] || DIFFICULTY_STYLE['intermediate']
                const isExpanded = expandedIdx === idx
                const isDone = answered.has(idx)

                return (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--color-surface)',
                      border: `1.5px solid ${isDone ? 'var(--color-emerald)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-lg)', padding: '16px 18px',
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{
                          padding: '1px 6px', borderRadius: 4,
                          background: diff.bg, color: diff.color,
                          fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                        }}>
                          {q.difficulty}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)' }}>
                          Target: {q.target_criterion}
                        </span>
                      </div>

                      <button
                        onClick={() => toggleAnswer(idx)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          padding: '3px 8px', borderRadius: 'var(--radius-pill)',
                          background: isDone ? 'var(--color-emerald-subtle)' : 'var(--color-surface-elevated)',
                          border: `1px solid ${isDone ? 'var(--color-emerald)' : 'var(--color-border)'}`,
                          color: isDone ? 'var(--color-emerald)' : 'var(--color-text-muted)',
                          fontSize: 10, fontWeight: 800, cursor: 'pointer',
                        }}
                      >
                        <CheckCircle2 size={12} />
                        <span>{isDone ? 'Evaluated' : 'Mark Evaluated'}</span>
                      </button>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', margin: '8px 0' }}>
                      {q.question_text}
                    </div>

                    {/* What to listen for */}
                    <div style={{
                      fontSize: 11, color: 'var(--color-text-secondary)',
                      background: 'var(--color-surface-elevated)', padding: '8px 10px',
                      borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)',
                      marginBottom: 8,
                    }}>
                      <strong style={{ color: 'var(--color-accent)' }}>What to listen for: </strong>
                      {q.what_to_listen_for}
                    </div>

                    {/* Follow-up toggle */}
                    {q.follow_up && (
                      <div>
                        <button
                          onClick={() => setExpandedIdx(isExpanded ? null : idx)}
                          style={{
                            background: 'none', border: 'none', color: 'var(--color-accent)',
                            fontSize: 11, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                            padding: 0,
                          }}
                        >
                          <span>{isExpanded ? 'Hide Follow-up' : 'Show Adaptive Follow-up'}</span>
                          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                        </button>
                        {isExpanded && (
                          <div style={{
                            marginTop: 6, fontSize: 11, color: 'var(--color-text-primary)',
                            padding: '6px 10px', background: 'var(--color-accent-subtle)',
                            borderRadius: 4, borderLeft: '2px solid var(--color-accent)',
                          }}>
                            <strong>Adaptive Follow-up: </strong> {q.follow_up}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right Column: Live Interviewer Scratchpad & Coverage */}
        <div style={{ width: 340, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Coverage meter */}
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)', padding: '18px 20px', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
                Interview Coverage
              </span>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: 900, color: 'var(--color-accent)' }}>
                {coverage}%
              </span>
            </div>
            <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 9999, overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${coverage}%`,
                background: 'linear-gradient(90deg, hsl(231,76%,52%), hsl(160,84%,39%))',
                borderRadius: 9999, transition: 'width 0.4s ease',
              }} />
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 6 }}>
              {answered.size} of {result?.questions.length || 0} questions covered
            </div>
          </div>

          {/* Live Notes Scratchpad */}
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)', padding: '18px 20px', boxShadow: 'var(--shadow-sm)',
            display: 'flex', flexDirection: 'column', flex: 1,
          }}>
            <div style={{ fontWeight: 800, fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)', marginBottom: 8, textTransform: 'uppercase' }}>
              Live Interviewer Notes
            </div>
            <textarea
              placeholder="Record candidate responses, code quality impressions, and technical notes during the live call…"
              rows={8}
              style={{
                width: '100%', flex: 1, padding: '10px 12px', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)',
                background: 'var(--color-surface-elevated)', outline: 'none', resize: 'vertical',
                lineHeight: 1.5, boxSizing: 'border-box',
              }}
            />

            <button
              onClick={() => onNavigate?.('reports')}
              style={{
                marginTop: 12, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '9px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
                color: 'var(--color-text-primary)', fontSize: 'var(--text-xs)', fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              <FileText size={13} style={{ color: 'var(--color-accent)' }} />
              <span>Compile & Save to Reports →</span>
            </button>
          </div>
        </div>
      </main>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
