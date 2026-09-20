import { useState } from 'react'
import { TopHeader } from '../components/layout/TopHeader'
import {
  FileText, Printer, Search, ShieldCheck, X
} from 'lucide-react'

export interface EvaluationReport {
  id: string
  candidateName: string
  targetRole: string
  matchScore: number
  recommendation: 'STRONG HIRE' | 'LEAN HIRE' | 'DO NOT HIRE'
  evaluatedAt: string
  evaluatorName: string
  summary: string
  mustHavesMet: string[]
  mustHavesGaps: string[]
  keyEvidenceQuotes: string[]
  interviewNotes: string
}

const SAMPLE_REPORTS: EvaluationReport[] = [
  {
    id: 'rep-1',
    candidateName: 'Arjun Mehta',
    targetRole: 'Senior Full-Stack & Distributed Systems Engineer',
    matchScore: 94,
    recommendation: 'STRONG HIRE',
    evaluatedAt: '2026-09-20 at 23:45',
    evaluatorName: 'Sarah Chen (Lead Technical Recruiter)',
    summary: 'Exceptional candidate demonstrating deep hands-on expertise in high-concurrency event-driven distributed systems (Kafka, Node.js) and modern frontend architectures (React 18, TypeScript). Clear evidence of production scale (45M events/day, query latency reduction from 420ms to 48ms).',
    mustHavesMet: [
      'React 18 & TypeScript (Next.js SSR migration)',
      'Distributed Systems (Event-driven Kafka streaming)',
      'Node.js Microservices',
      'PostgreSQL Query Optimization',
    ],
    mustHavesGaps: [],
    keyEvidenceQuotes: [
      '"Architected event-driven distributed streaming pipelines using Kafka and Node.js microservices processing 45M events/day."',
      '"Spearheaded migration from legacy monolithic architecture to React 18 / TypeScript frontend with Next.js SSR."',
      '"Optimized PostgreSQL query execution plans, reducing p99 latency from 420ms to 48ms."',
    ],
    interviewNotes: 'Candidate excelled in live system design scenario. Accurately explained Kafka partitioning strategies, backpressure handling, and PostgreSQL indexing tradeoffs. Communication is articulate and senior-grade.',
  },
  {
    id: 'rep-2',
    candidateName: 'Priya Sharma',
    targetRole: 'Senior Full-Stack Engineer',
    matchScore: 88,
    recommendation: 'LEAN HIRE',
    evaluatedAt: '2026-09-20 at 19:10',
    evaluatorName: 'Sarah Chen (Lead Technical Recruiter)',
    summary: 'Very strong frontend and full-stack engineer with 5.5 years building modular React and TypeScript design systems. Minor gap in enterprise message queuing, but candidate exhibits rapid learning ability.',
    mustHavesMet: [
      'React & TypeScript Component Architecture',
      'Node.js Backend Aggregation Services',
      'PostgreSQL Relational Databases',
    ],
    mustHavesGaps: ['Kafka / Event-Driven Streaming'],
    keyEvidenceQuotes: [
      '"Led frontend modernization converting complex workflows into modular React and TypeScript components."',
      '"Designed backend aggregation services using Node.js and PostgreSQL."',
    ],
    interviewNotes: 'Strong frontend architectural fundamentals. Answered React 18 concurrency questions accurately. Would benefit from a brief onboarding ramp-up on event streaming.',
  },
  {
    id: 'rep-3',
    candidateName: 'David Kim',
    targetRole: 'Senior Full-Stack Engineer',
    matchScore: 31,
    recommendation: 'DO NOT HIRE',
    evaluatedAt: '2026-09-19 at 14:20',
    evaluatorName: 'Sarah Chen (Lead Technical Recruiter)',
    summary: 'Candidate experience is limited to 1 year junior web scripting with Python and basic HTML/CSS. Significant technical gaps in distributed systems, TypeScript, and enterprise backend engineering.',
    mustHavesMet: [],
    mustHavesGaps: [
      'React 18 & TypeScript',
      'Distributed Systems',
      'Node.js Microservices',
      'PostgreSQL',
    ],
    keyEvidenceQuotes: [
      '"Maintained landing pages using HTML, CSS, and vanilla JavaScript."',
    ],
    interviewNotes: 'Candidate was unable to answer basic system design or relational database optimization questions. Recommend considering for junior internship positions instead.',
  },
]

const RECOMMENDATION_STYLE: Record<string, { bg: string; color: string }> = {
  'STRONG HIRE': { bg: 'var(--color-emerald-subtle)', color: 'var(--color-emerald)' },
  'LEAN HIRE': { bg: 'var(--color-amber-subtle)', color: 'var(--color-amber)' },
  'DO NOT HIRE': { bg: 'var(--color-rose-subtle)', color: 'var(--color-rose)' },
}

export function ReportsPage() {
  const [reports] = useState<EvaluationReport[]>(SAMPLE_REPORTS)
  const [search, setSearch] = useState('')
  const [activeMemo, setActiveMemo] = useState<EvaluationReport | null>(null)

  const filtered = reports.filter(r =>
    r.candidateName.toLowerCase().includes(search.toLowerCase()) ||
    r.targetRole.toLowerCase().includes(search.toLowerCase()) ||
    r.recommendation.toLowerCase().includes(search.toLowerCase())
  )

  const handlePrint = () => {
    window.print()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <TopHeader
        title="Evaluation Reports"
        subtitle="Standardized candidate evaluation scorecard memos, citation ledgers, and hiring audit logs."
      />

      <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20, flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: 380 }}>
            <Search size={14} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search reports by candidate or recommendation…"
              style={{
                width: '100%', padding: '8px 12px 8px 34px',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-xs)', background: 'var(--color-surface)',
                color: 'var(--color-text-primary)', outline: 'none',
              }}
            />
          </div>

          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            {filtered.length} compiled evaluation memos
          </div>
        </div>

        {/* Reports Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(report => {
            const recStyle = RECOMMENDATION_STYLE[report.recommendation] || RECOMMENDATION_STYLE['LEAN HIRE']
            return (
              <div
                key={report.id}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 22px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex', flexDirection: 'column', gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                        {report.candidateName}
                      </span>
                      <span style={{
                        padding: '2px 8px', borderRadius: 4,
                        background: recStyle.bg, color: recStyle.color,
                        fontSize: 11, fontWeight: 900, letterSpacing: '0.04em',
                      }}>
                        {report.recommendation} ({report.matchScore}%)
                      </span>
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 3 }}>
                      Role: <strong>{report.targetRole}</strong> • Evaluator: {report.evaluatorName} • {report.evaluatedAt}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveMemo(report)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 14px', borderRadius: 'var(--radius-pill)',
                      background: 'var(--color-accent-subtle)', border: '1px solid var(--color-accent)',
                      color: 'var(--color-accent)', fontSize: 11, fontWeight: 800,
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'var(--color-accent)'
                      e.currentTarget.style.color = '#fff'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'var(--color-accent-subtle)'
                      e.currentTarget.style.color = 'var(--color-accent)'
                    }}
                  >
                    <FileText size={12} />
                    <span>View Scorecard Memo</span>
                  </button>
                </div>

                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {report.summary}
                </div>

                {/* Requirements badges */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {report.mustHavesMet.map(m => (
                    <span key={m} style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                      background: 'var(--color-emerald-subtle)', color: 'var(--color-emerald)',
                    }}>
                      ✓ {m}
                    </span>
                  ))}
                  {report.mustHavesGaps.map(g => (
                    <span key={g} style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                      background: 'var(--color-rose-subtle)', color: 'var(--color-rose)',
                    }}>
                      ✕ {g}
                    </span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Printable Scorecard Memo Modal */}
      {activeMemo && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={() => setActiveMemo(null)}
        >
          <div
            style={{
              width: '100%', maxWidth: 760, maxHeight: '88vh',
              background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xl)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              padding: '16px 22px', borderBottom: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--color-surface-elevated)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={18} style={{ color: 'var(--color-accent)' }} />
                <h3 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                  Standardized Candidate Evaluation Scorecard Memo
                </h3>
              </div>
              <button
                onClick={() => setActiveMemo(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Memo Content */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {/* Top Meta */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
                padding: '14px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
                marginBottom: 18, fontSize: 'var(--text-xs)',
              }}>
                <div><strong>Candidate:</strong> {activeMemo.candidateName}</div>
                <div><strong>Target Role:</strong> {activeMemo.targetRole}</div>
                <div><strong>Evaluator:</strong> {activeMemo.evaluatorName}</div>
                <div><strong>Date:</strong> {activeMemo.evaluatedAt}</div>
              </div>

              {/* Recommendation Callout */}
              <div style={{
                padding: '14px 18px', borderRadius: 'var(--radius-md)',
                background: RECOMMENDATION_STYLE[activeMemo.recommendation]?.bg,
                border: `1.5px solid ${RECOMMENDATION_STYLE[activeMemo.recommendation]?.color}`,
                marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 900, textTransform: 'uppercase', color: RECOMMENDATION_STYLE[activeMemo.recommendation]?.color }}>
                    FINAL RECOMMENDATION
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: RECOMMENDATION_STYLE[activeMemo.recommendation]?.color }}>
                    {activeMemo.recommendation}
                  </div>
                </div>
                <div style={{ fontSize: 24, fontWeight: 900, color: RECOMMENDATION_STYLE[activeMemo.recommendation]?.color }}>
                  {activeMemo.matchScore}%
                </div>
              </div>

              {/* Executive Summary */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase' }}>
                  Executive Summary
                </div>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', lineHeight: 1.6, color: 'var(--color-text-primary)' }}>
                  {activeMemo.summary}
                </p>
              </div>

              {/* Verbatim Citation Grounding Ledger */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase' }}>
                  Verbatim Citation Grounding Ledger (Zero AI Hallucination)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {activeMemo.keyEvidenceQuotes.map((q, i) => (
                    <div key={i} style={{
                      padding: '8px 12px', borderRadius: 4,
                      background: 'var(--color-surface-elevated)', borderLeft: '3px solid var(--color-accent)',
                      fontSize: 'var(--text-xs)', color: 'var(--color-text-primary)', fontStyle: 'italic',
                    }}>
                      {q}
                    </div>
                  ))}
                </div>
              </div>

              {/* Interview Debrief Notes */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase' }}>
                  Live Interviewer Debrief & Notes
                </div>
                <p style={{ margin: 0, fontSize: 'var(--text-xs)', lineHeight: 1.6, color: 'var(--color-text-secondary)' }}>
                  {activeMemo.interviewNotes}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              padding: '14px 22px', borderTop: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--color-surface-elevated)',
            }}>
              <button
                onClick={handlePrint}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '7px 14px', borderRadius: 'var(--radius-md)',
                  background: 'transparent', border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)', fontSize: 11, fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <Printer size={13} />
                <span>Print Scorecard Memo</span>
              </button>

              <button
                onClick={() => setActiveMemo(null)}
                style={{
                  padding: '7px 16px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-accent)', color: '#fff', border: 'none',
                  fontSize: 11, fontWeight: 800, cursor: 'pointer',
                }}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
