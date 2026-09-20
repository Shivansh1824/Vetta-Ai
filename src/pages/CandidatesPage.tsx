import { useState } from 'react'
import { TopHeader } from '../components/layout/TopHeader'
import {
  Search, Eye, FileText, X, Sparkles
} from 'lucide-react'
import type { NavItem } from '../components/layout/Sidebar'

export interface CandidateItem {
  id: string
  name: string
  age: number
  experienceYears: number
  targetRole: string
  score: number
  tier: 'tier_1_match' | 'tier_2_potential' | 'tier_3_mismatch'
  matchedSkills: string[]
  unmatchedSkills: string[]
  resumeSnippet: string
  fullResumeText: string
  fileName: string
}

const CANDIDATES_DATA: CandidateItem[] = [
  {
    id: 'cand-1',
    name: 'Arjun Mehta',
    age: 28,
    experienceYears: 6.5,
    targetRole: 'Senior Full-Stack & Distributed Systems Engineer',
    score: 94,
    tier: 'tier_1_match',
    matchedSkills: ['React 18', 'TypeScript', 'Node.js', 'PostgreSQL', 'Distributed Systems', 'Kafka', 'Redis'],
    unmatchedSkills: [],
    resumeSnippet: 'Staff Software Engineer at Apex Cloud Systems. Architected distributed Kafka streaming pipelines processing 45M events/day. React 18 / TypeScript Next.js SSR.',
    fullResumeText: `ARJUN MEHTA (Age: 28)
Lead Full-Stack Engineer | Distributed Systems Specialist
Email: arjun.mehta@devmail.io | Phone: +1 (555) 234-5678

SUMMARY:
Senior Full-Stack & Distributed Systems Engineer with 6.5 years designing, scaling, and maintaining mission-critical microservices and real-time event-driven pipelines.

CORE SKILLS:
React 18, TypeScript, Node.js, PostgreSQL, Distributed Systems, Kafka, Redis, Docker, Kubernetes.

EXPERIENCE:
Staff Software Engineer — Apex Cloud Systems (2022 - Present)
• Architected event-driven distributed streaming pipelines using Kafka and Node.js microservices processing 45M events/day.
• Spearheaded migration from legacy monolithic architecture to React 18 / TypeScript frontend with Next.js SSR.
• Optimized PostgreSQL query execution plans, reducing p99 latency from 420ms to 48ms.

Senior Frontend & Backend Engineer — NovaTech Solutions (2020 - 2022)
• Built real-time analytics dashboard with React, TypeScript, and Redis caching.
• Designed RESTful and GraphQL APIs deployed on Kubernetes clusters with zero-downtime CI/CD pipelines.`,
    fileName: 'Arjun_Mehta_Resume.pdf',
  },
  {
    id: 'cand-2',
    name: 'Priya Sharma',
    age: 29,
    experienceYears: 5.5,
    targetRole: 'Senior Full-Stack Engineer',
    score: 88,
    tier: 'tier_1_match',
    matchedSkills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Tailwind CSS', 'GraphQL'],
    unmatchedSkills: ['Kafka / Event Streaming'],
    resumeSnippet: 'Senior Engineer at Lattice Dynamics. Led frontend modernization with modular React & TypeScript components. Node.js and PostgreSQL backend microservices.',
    fullResumeText: `PRIYA SHARMA (Age: 29)
Senior Full-Stack Engineer & Frontend Tech Lead
Email: priya.sharma@techfolio.dev

SUMMARY:
5.5 years delivering modern web architectures, enterprise design systems, and robust Node.js backend integrations.

CORE SKILLS:
React, TypeScript, Node.js, GraphQL, PostgreSQL, Tailwind CSS, AWS, Jest.

EXPERIENCE:
Senior Engineer — Lattice Dynamics (2021 - Present)
• Led frontend modernization converting complex workflows into modular React and TypeScript components.
• Designed backend aggregation services using Node.js and PostgreSQL.
• Implemented automated CI/CD and comprehensive end-to-end testing with Playwright.`,
    fileName: 'Priya_Sharma_Staff_Frontend.pdf',
  },
  {
    id: 'cand-3',
    name: 'Marcus Vance',
    age: 32,
    experienceYears: 7,
    targetRole: 'Senior Full-Stack & Distributed Systems Engineer',
    score: 74,
    tier: 'tier_2_potential',
    matchedSkills: ['Node.js', 'PostgreSQL', 'Distributed Systems', 'Docker'],
    unmatchedSkills: ['React 18', 'TypeScript'],
    resumeSnippet: 'Backend & Systems Engineer with strong Node.js, Go, and PostgreSQL experience. Limited recent production experience in modern React 18 frameworks.',
    fullResumeText: `MARCUS VANCE (Age: 32)
Senior Backend & Systems Engineer
Email: marcus.vance@systemslab.org

SUMMARY:
7 years backend software development focusing on distributed computing, high-concurrency databases, and Docker containerization.

CORE SKILLS:
Node.js, PostgreSQL, Distributed Systems, Go, Docker, RabbitMQ.

EXPERIENCE:
Systems Engineer — OrbitScale (2020 - Present)
• Maintained high-throughput data processing microservices in Node.js.
• Managed relational databases with PostgreSQL replication.`,
    fileName: 'Marcus_Vance_Systems.pdf',
  },
  {
    id: 'cand-4',
    name: 'David Kim',
    age: 23,
    experienceYears: 1,
    targetRole: 'Junior Full-Stack Engineer',
    score: 31,
    tier: 'tier_3_mismatch',
    matchedSkills: ['JavaScript Basics'],
    unmatchedSkills: ['React 18', 'TypeScript', 'Node.js', 'PostgreSQL', 'Distributed Systems'],
    resumeSnippet: 'Recent graduate with 1 year internship experience in Python, Flask, and basic HTML/CSS scripting. Gaps in enterprise distributed systems and TypeScript.',
    fullResumeText: `DAVID KIM (Age: 23)
Junior Software Developer
Email: david.kim@campusmail.com

SUMMARY:
Recent CS graduate seeking entry-level software engineering roles.

CORE SKILLS:
Python, Flask, JavaScript Basics, HTML5, CSS3.

EXPERIENCE:
Junior Web Intern — WebSpark Studio (2025 - 2026)
• Maintained landing pages using HTML, CSS, and vanilla JavaScript.
• Wrote simple automation scripts in Python.`,
    fileName: 'David_Kim_Junior_Developer.pdf',
  },
]

const TIER_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  tier_1_match: { bg: 'var(--color-emerald-subtle)', color: 'var(--color-emerald)', label: 'Tier 1 Top Match' },
  tier_2_potential: { bg: 'var(--color-amber-subtle)', color: 'var(--color-amber)', label: 'Tier 2 Review' },
  tier_3_mismatch: { bg: 'var(--color-rose-subtle)', color: 'var(--color-rose)', label: 'Tier 3 Mismatch' },
}

export interface CandidatesPageProps {
  onNavigate?: (page: NavItem) => void
}

export function CandidatesPage({ onNavigate }: CandidatesPageProps) {
  const [candidates] = useState<CandidateItem[]>(CANDIDATES_DATA)
  const [search, setSearch] = useState('')
  const [selectedTier, setSelectedTier] = useState<string>('all')
  const [activeResumeModal, setActiveResumeModal] = useState<CandidateItem | null>(null)

  const filtered = candidates.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.targetRole.toLowerCase().includes(search.toLowerCase()) ||
      c.matchedSkills.some(s => s.toLowerCase().includes(search.toLowerCase()))
    const matchesTier = selectedTier === 'all' || c.tier === selectedTier
    return matchesSearch && matchesTier
  })

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <TopHeader
        title="Candidates"
        subtitle="Screened candidates across all roles with skill match breakdown and attached resumes."
      />

      <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {/* Toolbar */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 20, flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, maxWidth: 520 }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1 }}>
              <Search size={14} style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--color-text-muted)',
              }} />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search candidates by name, role, or skill…"
                style={{
                  width: '100%', padding: '8px 12px 8px 34px',
                  border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--text-xs)', background: 'var(--color-surface)',
                  color: 'var(--color-text-primary)', outline: 'none',
                }}
              />
            </div>

            {/* Filter Tabs */}
            <div style={{
              display: 'flex', background: 'var(--color-surface-elevated)',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: 2,
            }}>
              {[
                { id: 'all', label: 'All' },
                { id: 'tier_1_match', label: 'Tier 1' },
                { id: 'tier_2_potential', label: 'Tier 2' },
                { id: 'tier_3_mismatch', label: 'Tier 3' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTier(tab.id)}
                  style={{
                    padding: '4px 10px', border: 'none', borderRadius: 4,
                    fontSize: 11, fontWeight: selectedTier === tab.id ? 800 : 500,
                    cursor: 'pointer',
                    background: selectedTier === tab.id ? 'var(--color-surface)' : 'transparent',
                    color: selectedTier === tab.id ? 'var(--color-accent)' : 'var(--color-text-muted)',
                    boxShadow: selectedTier === tab.id ? 'var(--shadow-xs)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            Showing <strong>{filtered.length}</strong> of {candidates.length} candidates
          </div>
        </div>

        {/* Candidate Cards Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {filtered.map(candidate => {
            const tierStyle = TIER_CONFIG[candidate.tier] || TIER_CONFIG['tier_2_potential']
            return (
              <div
                key={candidate.id}
                style={{
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px 22px',
                  boxShadow: 'var(--shadow-sm)',
                  display: 'flex', flexDirection: 'column', gap: 14,
                  transition: 'border-color 0.15s',
                }}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 10,
                      background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: 15,
                    }}>
                      {candidate.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                          {candidate.name}
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 700, color: 'var(--color-text-muted)',
                          padding: '2px 7px', background: 'var(--color-surface-elevated)',
                          borderRadius: 4, border: '1px solid var(--color-border)',
                        }}>
                          {candidate.age} yrs old • {candidate.experienceYears} yrs exp
                        </span>
                      </div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                        Target Role: <strong>{candidate.targetRole}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Score & Tier */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{
                      padding: '4px 10px', borderRadius: 6,
                      background: tierStyle.bg, color: tierStyle.color,
                      fontSize: 12, fontWeight: 900,
                    }}>
                      {candidate.score}% Match ({tierStyle.label})
                    </span>

                    {/* Small Button: Click Resume to View */}
                    <button
                      onClick={() => setActiveResumeModal(candidate)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 'var(--radius-pill)',
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
                      <Eye size={12} />
                      <span>Click Resume to View</span>
                    </button>
                  </div>
                </div>

                {/* Skills Matched & Missing Chips */}
                <div style={{
                  background: 'var(--color-surface-elevated)', borderRadius: 'var(--radius-md)',
                  padding: '12px 14px', border: '1px solid var(--color-border)',
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  {/* Matched */}
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-emerald)', marginRight: 4 }}>
                      MATCHED SKILLS:
                    </span>
                    {candidate.matchedSkills.map(skill => (
                      <span key={skill} style={{
                        fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                        background: 'var(--color-emerald-subtle)', color: 'var(--color-emerald)',
                        border: '1px solid hsla(160,84%,39%,0.25)',
                      }}>
                        ✓ {skill}
                      </span>
                    ))}
                  </div>

                  {/* Unmatched */}
                  {candidate.unmatchedSkills.length > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-rose)', marginRight: 4 }}>
                        MISSING / GAPS:
                      </span>
                      {candidate.unmatchedSkills.map(skill => (
                        <span key={skill} style={{
                          fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                          background: 'var(--color-rose-subtle)', color: 'var(--color-rose)',
                          border: '1px solid hsla(350,89%,60%,0.25)',
                        }}>
                          ✕ {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Resume Attached Snippet */}
                <div style={{
                  fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)',
                  lineHeight: 1.5, display: 'flex', alignItems: 'flex-start', gap: 8,
                }}>
                  <FileText size={13} style={{ color: 'var(--color-accent)', marginTop: 2, flexShrink: 0 }} />
                  <span>{candidate.resumeSnippet}</span>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Candidate Resume Preview Modal */}
      {activeResumeModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={() => setActiveResumeModal(null)}
        >
          <div
            style={{
              width: '100%', maxWidth: 740, maxHeight: '88vh',
              background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-xl)',
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{
              padding: '16px 22px', borderBottom: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--color-surface-elevated)',
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 'var(--text-base)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                    {activeResumeModal.name} ({activeResumeModal.age} yrs old)
                  </h3>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4,
                    background: TIER_CONFIG[activeResumeModal.tier]?.bg,
                    color: TIER_CONFIG[activeResumeModal.tier]?.color,
                    fontSize: 10, fontWeight: 900,
                  }}>
                    {activeResumeModal.score}% Match
                  </span>
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {activeResumeModal.fileName} • {activeResumeModal.targetRole}
                </div>
              </div>
              <button
                onClick={() => setActiveResumeModal(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase' }}>
                  Matched Skills vs Gaps
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                  {activeResumeModal.matchedSkills.map(s => (
                    <span key={s} style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                      background: 'var(--color-emerald-subtle)', color: 'var(--color-emerald)',
                    }}>
                      ✓ {s}
                    </span>
                  ))}
                  {activeResumeModal.unmatchedSkills.map(s => (
                    <span key={s} style={{
                      fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                      background: 'var(--color-rose-subtle)', color: 'var(--color-rose)',
                    }}>
                      ✕ {s}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase' }}>
                  Attached Resume Text
                </div>
                <pre style={{
                  margin: 0, padding: '16px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
                  fontSize: 'var(--text-xs)', fontFamily: 'JetBrains Mono, Menlo, monospace',
                  lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--color-text-primary)',
                  maxHeight: '45vh', overflowY: 'auto',
                }}>
                  {activeResumeModal.fullResumeText}
                </pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div style={{
              padding: '14px 22px', borderTop: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'var(--color-surface-elevated)',
            }}>
              <button
                onClick={() => {
                  setActiveResumeModal(null)
                  onNavigate?.('resumes')
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 'var(--radius-md)',
                  background: 'transparent', border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)', fontSize: 11, fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <FileText size={12} />
                <span>Open in Resume Vault</span>
              </button>

              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  onClick={() => setActiveResumeModal(null)}
                  style={{
                    padding: '6px 14px', borderRadius: 'var(--radius-md)',
                    background: 'transparent', border: '1px solid var(--color-border)',
                    color: 'var(--color-text-muted)', fontSize: 11, fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setActiveResumeModal(null)
                    onNavigate?.('interview')
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '6px 14px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-accent)', color: '#fff', border: 'none',
                    fontSize: 11, fontWeight: 800, cursor: 'pointer',
                  }}
                >
                  <Sparkles size={12} />
                  <span>Generate Interview Questions</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
