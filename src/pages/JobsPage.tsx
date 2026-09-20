import { useState } from 'react'
import { TopHeader } from '../components/layout/TopHeader'
import {
  Briefcase, Plus, ChevronRight, Users,
  ArrowUpRight, X, ShieldCheck
} from 'lucide-react'
import type { NavItem } from '../components/layout/Sidebar'

interface MatchedCandidate {
  id: string
  name: string
  score: number
  tier: 'tier_1_match' | 'tier_2_potential' | 'tier_3_mismatch'
  skillsMatched: string[]
  missingSkills: string[]
  experience: string
}

interface JobPost {
  id: string
  title: string
  department: string
  experience_level: string
  status: 'active' | 'draft' | 'closed'
  must_haves: string[]
  nice_to_haves: string[]
  candidatesCount: number
  created_at: string
  matchedCandidates: MatchedCandidate[]
}

const JOBS_DATA: JobPost[] = [
  {
    id: 'job-1',
    title: 'Senior Full-Stack & Distributed Systems Engineer',
    department: 'Core Infrastructure & Platform',
    experience_level: '5+ years',
    status: 'active',
    must_haves: ['React 18', 'TypeScript', 'Node.js', 'PostgreSQL', 'Distributed Systems'],
    nice_to_haves: ['Kafka / Event Streaming', 'Redis', 'Docker', 'System Security'],
    candidatesCount: 3,
    created_at: '2026-09-20',
    matchedCandidates: [
      {
        id: 'c-1',
        name: 'Arjun Mehta',
        score: 94,
        tier: 'tier_1_match',
        skillsMatched: ['React 18', 'TypeScript', 'Node.js', 'PostgreSQL', 'Distributed Systems', 'Kafka'],
        missingSkills: [],
        experience: '6.5 yrs exp',
      },
      {
        id: 'c-2',
        name: 'Priya Sharma',
        score: 88,
        tier: 'tier_1_match',
        skillsMatched: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
        missingSkills: ['Kafka / Event Streaming'],
        experience: '5.5 yrs exp',
      },
      {
        id: 'c-3',
        name: 'David Kim',
        score: 31,
        tier: 'tier_3_mismatch',
        skillsMatched: ['Basic JavaScript'],
        missingSkills: ['Distributed Systems', 'Node.js', 'PostgreSQL', 'Kafka'],
        experience: '1 yr exp',
      },
    ],
  },
  {
    id: 'job-2',
    title: 'Frontend Tech Lead & Design Systems Architect',
    department: 'Product Experience',
    experience_level: '6+ years',
    status: 'active',
    must_haves: ['React', 'TypeScript', 'Design Systems', 'State Management'],
    nice_to_haves: ['Tailwind CSS', 'Micro-Frontends', 'Accessibility (a11y)'],
    candidatesCount: 2,
    created_at: '2026-09-19',
    matchedCandidates: [
      {
        id: 'c-2',
        name: 'Priya Sharma',
        score: 92,
        tier: 'tier_1_match',
        skillsMatched: ['React', 'TypeScript', 'Design Systems', 'State Management', 'Tailwind CSS'],
        missingSkills: [],
        experience: '5.5 yrs exp',
      },
      {
        id: 'c-1',
        name: 'Arjun Mehta',
        score: 82,
        tier: 'tier_1_match',
        skillsMatched: ['React', 'TypeScript', 'State Management'],
        missingSkills: ['Micro-Frontends'],
        experience: '6.5 yrs exp',
      },
    ],
  },
  {
    id: 'job-3',
    title: 'DevOps & Cloud Infrastructure Engineer',
    department: 'Platform Operations',
    experience_level: '3+ years',
    status: 'draft',
    must_haves: ['Kubernetes', 'CI/CD Pipelines', 'AWS / Cloud Architecture'],
    nice_to_haves: ['Terraform', 'Prometheus / Grafana', 'Helm'],
    candidatesCount: 0,
    created_at: '2026-09-18',
    matchedCandidates: [],
  },
]

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: 'var(--color-emerald-subtle)', color: 'var(--color-emerald)', label: 'Active' },
  draft: { bg: 'var(--color-border)', color: 'var(--color-text-muted)', label: 'Draft' },
  closed: { bg: 'var(--color-rose-subtle)', color: 'var(--color-rose)', label: 'Closed' },
}

const TIER_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  tier_1_match: { bg: 'var(--color-emerald-subtle)', color: 'var(--color-emerald)', label: 'Tier 1 Match' },
  tier_2_potential: { bg: 'var(--color-amber-subtle)', color: 'var(--color-amber)', label: 'Tier 2 Review' },
  tier_3_mismatch: { bg: 'var(--color-rose-subtle)', color: 'var(--color-rose)', label: 'Tier 3 Mismatch' },
}

export interface JobsPageProps {
  onOpenOnboarding?: () => void
  onNavigate?: (page: NavItem) => void
}

export function JobsPage({ onOpenOnboarding, onNavigate }: JobsPageProps) {
  const [jobs] = useState<JobPost[]>(JOBS_DATA)
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(JOBS_DATA[0])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <TopHeader
        title="Job Posts"
        subtitle="Manage active job criteria, semantic guardrails, and candidate matching pipelines."
      />

      <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {/* Header Toolbar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20, flexWrap: 'wrap', gap: 12,
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              Active Positions ({jobs.length})
            </h2>
            <p style={{ margin: '2px 0 0', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Select a position to inspect criteria and candidate screening matches.
            </p>
          </div>

          <button
            onClick={() => onOpenOnboarding?.()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '9px 18px',
              background: 'linear-gradient(135deg, hsl(231,76%,52%), hsl(231,76%,46%))',
              color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)', fontWeight: 800, cursor: 'pointer',
              boxShadow: '0 2px 12px hsla(231,76%,52%,0.3)',
              transition: 'transform 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Plus size={15} />
            <span>New Job Post</span>
          </button>
        </div>

        {/* 2-Column Layout: Jobs List & Interactive Matches Drawer */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: selectedJob ? '1.1fr 1fr' : '1fr',
          gap: 20,
          alignItems: 'start',
        }}>
          {/* Left Column: Job Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {jobs.map(job => {
              const isSelected = selectedJob?.id === job.id
              const statusStyle = STATUS_STYLE[job.status] ?? STATUS_STYLE['draft']

              return (
                <div
                  key={job.id}
                  onClick={() => setSelectedJob(job)}
                  style={{
                    background: 'var(--color-surface)',
                    border: `1.5px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-lg)',
                    padding: '18px 20px',
                    boxShadow: isSelected ? '0 4px 16px hsla(231,76%,52%,0.15)' : 'var(--shadow-sm)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 38, height: 38, borderRadius: 10,
                        background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <Briefcase size={17} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                          {job.title}
                        </div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                          {job.department} • {job.experience_level}
                        </div>
                      </div>
                    </div>

                    <span style={{
                      padding: '2px 8px', borderRadius: 4,
                      background: statusStyle.bg, color: statusStyle.color,
                      fontSize: 10, fontWeight: 800,
                    }}>
                      {statusStyle.label}
                    </span>
                  </div>

                  {/* Skills tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 12 }}>
                    {job.must_haves.map(skill => (
                      <span key={skill} style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 7px',
                        borderRadius: 4, background: 'var(--color-surface-elevated)',
                        color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)',
                      }}>
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    paddingTop: 10, borderTop: '1px solid var(--color-border)',
                    fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={13} style={{ color: 'var(--color-accent)' }} />
                      <strong style={{ color: 'var(--color-text-primary)' }}>{job.candidatesCount}</strong> candidates matched
                    </div>
                    <div style={{
                      color: isSelected ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3,
                    }}>
                      <span>{isSelected ? 'Viewing Matches' : 'View Matches'}</span>
                      <ChevronRight size={13} />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Column: Selected Job Matches & Candidate Deep Dive */}
          {selectedJob && (
            <div style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              padding: '22px',
              boxShadow: 'var(--shadow-md)',
              position: 'sticky', top: 24,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <span style={{
                    fontSize: 10, fontWeight: 900, textTransform: 'uppercase',
                    color: 'var(--color-accent)', letterSpacing: '0.04em',
                  }}>
                    Position Screening Ledger
                  </span>
                  <h3 style={{ margin: '2px 0 0', fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    {selectedJob.title}
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Requirements Summary */}
              <div style={{
                background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-md)',
                padding: '12px 14px', border: '1px solid var(--color-border)', marginBottom: 18,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  MUST-HAVE REQUIREMENTS:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
                  {selectedJob.must_haves.map(m => (
                    <span key={m} style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                      background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
                      border: '1px solid var(--color-accent-border)',
                    }}>
                      ✓ {m}
                    </span>
                  ))}
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6 }}>
                  NICE-TO-HAVE CRITERIA:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {selectedJob.nice_to_haves.map(n => (
                    <span key={n} style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 4,
                      background: 'var(--color-surface)', color: 'var(--color-text-muted)',
                      border: '1px solid var(--color-border)',
                    }}>
                      + {n}
                    </span>
                  ))}
                </div>
              </div>

              {/* Matched Candidates List */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: 10 }}>
                  Screened Candidates ({selectedJob.matchedCandidates.length})
                </div>

                {selectedJob.matchedCandidates.length === 0 ? (
                  <div style={{
                    padding: '24px', textAlign: 'center',
                    background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-md)',
                    color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)',
                  }}>
                    No candidates screened for this draft role yet. Run AI screening to ingest resumes.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {selectedJob.matchedCandidates.map(cand => {
                      const tier = TIER_STYLE[cand.tier] || TIER_STYLE['tier_2_potential']
                      return (
                        <div key={cand.id} style={{
                          padding: '12px 14px', borderRadius: 'var(--radius-md)',
                          background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <div>
                              <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                                {cand.name}
                              </strong>
                              <span style={{ fontSize: 11, color: 'var(--color-text-muted)', marginLeft: 8 }}>
                                {cand.experience}
                              </span>
                            </div>
                            <span style={{
                              padding: '2px 8px', borderRadius: 4,
                              background: tier.bg, color: tier.color,
                              fontSize: 11, fontWeight: 800,
                            }}>
                              {cand.score}% Match
                            </span>
                          </div>

                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', marginBottom: 6 }}>
                            <span style={{ color: 'var(--color-emerald)', fontWeight: 700 }}>Matched: </span>
                            {cand.skillsMatched.join(', ') || 'None'}
                          </div>

                          {cand.missingSkills.length > 0 && (
                            <div style={{ fontSize: 11, color: 'var(--color-rose)' }}>
                              <span style={{ fontWeight: 700 }}>Gaps: </span>
                              {cand.missingSkills.join(', ')}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button
                  onClick={() => onNavigate?.('screening')}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px 12px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-accent-subtle)', border: '1px solid var(--color-accent)',
                    color: 'var(--color-accent)', fontSize: 'var(--text-xs)', fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  <ShieldCheck size={13} />
                  <span>Run AI Screening</span>
                </button>
                <button
                  onClick={() => onNavigate?.('candidates')}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: '8px 12px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-accent)', color: '#fff', border: 'none',
                    fontSize: 'var(--text-xs)', fontWeight: 800, cursor: 'pointer',
                  }}
                >
                  <span>View All Candidates</span>
                  <ArrowUpRight size={13} />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
