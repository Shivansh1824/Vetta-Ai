import React, { useState } from 'react'
import { TopHeader } from '../layout/TopHeader'
import { MessageSquare, Brain, Loader2, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react'
import { generateInterviewQuestions } from '../../services/gemini'
import type { Job, GeminiInterviewResult } from '../../types'

const MOCK_JOB: Job = {
  id: 'demo-job-1', recruiter_id: null,
  title: 'Senior Full-Stack Engineer', department: 'Engineering',
  experience_level: '5+ years',
  must_haves: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'System Design'],
  nice_to_haves: ['Kubernetes', 'Redis'],
  description_text: 'Core product team senior engineer role.',
  status: 'active', created_at: new Date().toISOString(),
}

const DIFFICULTY_STYLE = {
  foundational: { color: 'var(--color-emerald)', bg: 'var(--color-emerald-subtle)' },
  intermediate: { color: 'var(--color-amber)', bg: 'var(--color-amber-subtle)' },
  advanced: { color: 'var(--color-accent)', bg: 'var(--color-accent-subtle)' },
}

export function InterviewPage() {
  const [resumeText, setResumeText] = useState('')
  const [result, setResult] = useState<GeminiInterviewResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [answered, setAnswered] = useState<Set<number>>(new Set())
  const [responses, setResponses] = useState<Record<number, string>>({})
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null)

  const handleGenerate = async () => {
    if (!resumeText.trim()) { setError('Paste the resume first.'); return }
    setError(null)
    setLoading(true)
    setResult(null)
    setAnswered(new Set())
    setResponses({})
    try {
      const res = await generateInterviewQuestions(resumeText, MOCK_JOB, [])
      setResult(res)
    } catch {
      setError('Gemini API error — check your API keys or network.')
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
        subtitle="Gemini generates candidate-specific questions with evidence-based targeting."
      />

      <main style={{ flex: 1, padding: '28px', overflowY: 'auto', display: 'flex', gap: 20 }}>

        {/* Left: input + questions */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Input */}
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)', padding: '20px', boxShadow: 'var(--shadow-sm)',
          }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 8 }}>
              Candidate Resume
            </label>
            <textarea
              value={resumeText}
              onChange={e => setResumeText(e.target.value)}
              placeholder="Paste resume text to generate tailored questions…"
              rows={5}
              style={{
                width: '100%', padding: '10px 12px',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)', fontFamily: 'inherit',
                resize: 'vertical', background: 'var(--color-surface-elevated)',
                outline: 'none', lineHeight: 1.6, boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
            />
            {error && <div style={{ marginTop: 6, fontSize: 'var(--text-xs)', color: 'var(--color-rose)' }}>{error}</div>}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <button
                onClick={handleGenerate}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 20px',
                  background: loading ? 'var(--color-border)' : 'linear-gradient(135deg, hsl(231,76%,52%), hsl(231,76%,46%))',
                  color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-sm)', fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {loading ? <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> : <Brain size={14} />}
                {loading ? 'Generating…' : 'Generate Questions'}
              </button>
            </div>
          </div>

          {/* Questions list */}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {result.questions.map((q, i) => {
                const diff = DIFFICULTY_STYLE[q.difficulty]
                const isOpen = expandedIdx === i
                const isDone = answered.has(i)
                return (
                  <div key={i} style={{
                    background: 'var(--color-surface)', border: `1px solid ${isDone ? 'var(--color-emerald)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)', overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)', transition: 'border-color 0.2s',
                  }}>
                    <button
                      onClick={() => setExpandedIdx(isOpen ? null : i)}
                      style={{
                        width: '100%', padding: '14px 16px',
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
                      }}
                    >
                      <button
                        onClick={e => { e.stopPropagation(); toggleAnswer(i) }}
                        style={{
                          width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                          border: `2px solid ${isDone ? 'var(--color-emerald)' : 'var(--color-border)'}`,
                          background: isDone ? 'var(--color-emerald)' : 'transparent',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.15s',
                        }}
                        aria-label={isDone ? 'Mark unanswered' : 'Mark answered'}
                      >
                        {isDone && <CheckCircle2 size={12} color="#fff" />}
                      </button>
                      <span style={{
                        flex: 1, fontSize: 'var(--text-sm)', fontWeight: 600,
                        color: isDone ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                        textDecoration: isDone ? 'line-through' : 'none',
                      }}>
                        {q.question_text}
                      </span>
                      <span style={{
                        padding: '2px 7px', borderRadius: 5,
                        background: diff.bg, color: diff.color,
                        fontSize: 10, fontWeight: 800, textTransform: 'capitalize', flexShrink: 0,
                      }}>{q.difficulty}</span>
                      {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </button>

                    {isOpen && (
                      <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--color-border)' }}>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginBottom: 8, marginTop: 10 }}>
                          Targeting: <strong style={{ color: 'var(--color-text-secondary)' }}>{q.target_criterion}</strong>
                        </div>
                        <textarea
                          value={responses[i] ?? ''}
                          onChange={e => setResponses(r => ({ ...r, [i]: e.target.value }))}
                          placeholder="Notes from candidate response…"
                          rows={3}
                          style={{
                            width: '100%', padding: '8px 10px',
                            border: '1px solid var(--color-border)',
                            borderRadius: 'var(--radius-md)',
                            fontSize: 'var(--text-xs)', fontFamily: 'inherit',
                            resize: 'vertical', background: 'var(--color-surface-elevated)',
                            outline: 'none', lineHeight: 1.5, boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Right: coverage panel */}
        {result && (
          <div style={{ width: 240, flexShrink: 0 }}>
            <div style={{
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)', padding: '20px',
              boxShadow: 'var(--shadow-sm)', position: 'sticky', top: 20,
            }}>
              <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', marginBottom: 16 }}>
                Coverage
              </div>
              {/* Coverage ring */}
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <svg width={100} height={100} viewBox="0 0 100 100">
                  <circle cx={50} cy={50} r={40} fill="none" stroke="var(--color-border)" strokeWidth={8} />
                  <circle
                    cx={50} cy={50} r={40} fill="none"
                    stroke="var(--color-accent)" strokeWidth={8}
                    strokeDasharray={`${2 * Math.PI * 40 * coverage / 100} ${2 * Math.PI * 40}`}
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dasharray 0.5s ease' }}
                  />
                  <text x={50} y={55} textAnchor="middle" fontSize={18} fontWeight={900} fill="var(--color-text-primary)">
                    {coverage}%
                  </text>
                </svg>
              </div>
              <div style={{ fontSize: 'var(--text-xs)', textAlign: 'center', color: 'var(--color-text-muted)', marginBottom: 16 }}>
                {answered.size} of {result.questions.length} questions covered
              </div>
              {/* By difficulty */}
              {(['foundational', 'intermediate', 'advanced'] as const).map(d => {
                const count = result.questions.filter(q => q.difficulty === d).length
                const done = result.questions.filter((q, i) => q.difficulty === d && answered.has(i)).length
                const diff = DIFFICULTY_STYLE[d]
                return (
                  <div key={d} style={{ marginBottom: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'capitalize', color: diff.color }}>{d}</span>
                      <span style={{ fontSize: 10, color: 'var(--color-text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>{done}/{count}</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--color-border)', borderRadius: 9999, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: count > 0 ? `${(done / count) * 100}%` : '0%', background: diff.color, borderRadius: 9999, transition: 'width 0.4s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
