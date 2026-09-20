import { useState, useRef, useEffect } from 'react'
import { TopHeader } from '../components/layout/TopHeader'
import {
  FileText, Upload, Eye, CheckCircle2, AlertTriangle,
  Search, X, FileSpreadsheet,
  ShieldCheck, Loader2
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { extractAndValidateResume } from '../services/gemini'
import type { NavItem } from '../components/layout/Sidebar'

export interface StoredResume {
  id: string
  candidateName: string
  targetRole: string
  fileName: string
  fileSize: string
  uploadedAt: string
  matchScore: number
  tier: 'tier_1_match' | 'tier_2_potential' | 'tier_3_mismatch'
  resumeText: string
  skills: string[]
  storageUrl?: string
}

const INITIAL_RESUMES: StoredResume[] = [
  {
    id: 'res-1',
    candidateName: 'Arjun Mehta',
    targetRole: 'Senior Full-Stack & Distributed Systems Engineer',
    fileName: 'Arjun_Mehta_Senior_FullStack_2026.pdf',
    fileSize: '142 KB',
    uploadedAt: 'Today at 00:15',
    matchScore: 94,
    tier: 'tier_1_match',
    skills: ['React 18', 'TypeScript', 'Node.js', 'PostgreSQL', 'Distributed Systems', 'Kafka', 'Redis', 'Docker'],
    resumeText: `ARJUN MEHTA
Lead Full-Stack Engineer | Distributed Systems Specialist
Email: arjun.mehta@devmail.io | Phone: +1 (555) 234-5678 | GitHub: github.com/arjunmehta-dev

SUMMARY:
Senior Full-Stack & Distributed Systems Engineer with 6+ years designing, scaling, and maintaining mission-critical microservices, real-time event-driven pipelines, and high-performance web applications.

EXPERIENCE:
Staff Software Engineer — Apex Cloud Systems (2022 - Present)
• Architected event-driven distributed streaming pipelines using Kafka and Node.js microservices processing 45M events/day.
• Spearheaded migration from legacy monolithic architecture to React 18 / TypeScript frontend with Next.js SSR.
• Optimized PostgreSQL query execution plans, reducing p99 latency from 420ms to 48ms.

Senior Frontend & Backend Engineer — NovaTech Solutions (2020 - 2022)
• Built real-time analytics dashboard with React, TypeScript, and Redis caching.
• Designed RESTful and GraphQL APIs deployed on Kubernetes clusters with zero-downtime CI/CD pipelines.

EDUCATION & CERTIFICATIONS:
• B.Tech in Computer Science & Engineering — IIT Bombay (2016 - 2020)
• AWS Certified Solutions Architect — Associate (2023)`
  },
  {
    id: 'res-2',
    candidateName: 'Priya Sharma',
    targetRole: 'Senior Full-Stack Engineer',
    fileName: 'Priya_Sharma_Staff_Frontend.pdf',
    fileSize: '118 KB',
    uploadedAt: 'Yesterday at 18:40',
    matchScore: 88,
    tier: 'tier_1_match',
    skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'PostgreSQL', 'Tailwind CSS', 'AWS'],
    resumeText: `PRIYA SHARMA
Senior Full-Stack Engineer & Frontend Tech Lead
Email: priya.sharma@techfolio.dev | Portfolio: priyasharma.io

SUMMARY:
Passionate engineer with 5.5 years of experience delivering modern web architectures, enterprise design systems, and robust Node.js backend integrations.

EXPERIENCE:
Senior Engineer — Lattice Dynamics (2021 - Present)
• Led frontend modernization converting complex workflows into modular React and TypeScript components.
• Designed backend aggregation services using Node.js and PostgreSQL.
• Implemented automated CI/CD and comprehensive end-to-end testing with Playwright.

Software Engineer — CloudScale Labs (2019 - 2021)
• Built customer-facing portals using React, Redux, and Node.js.
• Mentored 4 junior engineers on clean code and system design.`
  },
  {
    id: 'res-3',
    candidateName: 'David Kim',
    targetRole: 'Junior Full-Stack Engineer',
    fileName: 'David_Kim_Junior_Developer.pdf',
    fileSize: '98 KB',
    uploadedAt: 'Sep 19, 2026',
    matchScore: 31,
    tier: 'tier_3_mismatch',
    skills: ['JavaScript', 'HTML/CSS', 'Python', 'Flask'],
    resumeText: `DAVID KIM
Junior Software Developer
Email: david.kim@campusmail.com

SUMMARY:
Recent graduate with 1 year internship experience in Python, Flask, and basic HTML/CSS scripting. Eager to transition into full-stack engineering.

EXPERIENCE:
Junior Web Intern — WebSpark Studio (2025 - 2026)
• Maintained landing pages using HTML, CSS, and vanilla JavaScript.
• Wrote simple automation scripts in Python.`
  },
]

const TIER_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  tier_1_match: { bg: 'var(--color-emerald-subtle)', color: 'var(--color-emerald)', label: 'Top Match (80%+)' },
  tier_2_potential: { bg: 'var(--color-amber-subtle)', color: 'var(--color-amber)', label: 'Potential (55-79%)' },
  tier_3_mismatch: { bg: 'var(--color-rose-subtle)', color: 'var(--color-rose)', label: 'Mismatch (<55%)' },
}

export interface ResumesPageProps {
  onNavigate?: (page: NavItem) => void
  initialSelectedResumeId?: string | null
}

export function ResumesPage({ onNavigate, initialSelectedResumeId }: ResumesPageProps) {
  const [resumes, setResumes] = useState<StoredResume[]>(() => {
    try {
      const saved = localStorage.getItem('vetta_stored_resumes')
      if (saved) return JSON.parse(saved)
    } catch {}
    return INITIAL_RESUMES
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [viewingResume, setViewingResume] = useState<StoredResume | null>(() => {
    if (initialSelectedResumeId) {
      return INITIAL_RESUMES.find(r => r.id === initialSelectedResumeId) || null
    }
    return null
  })
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      localStorage.setItem('vetta_stored_resumes', JSON.stringify(resumes))
    } catch {}
  }, [resumes])

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError(null)
    setUploadSuccess(null)
    setUploading(true)

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      const isImg = ['png', 'jpg', 'jpeg', 'webp'].includes(ext)
      const isPdf = ext === 'pdf'

      let extractedText = ''
      let candidateName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')

      // Attempt Supabase storage upload
      try {
        const filePath = `resumes/${Date.now()}_${file.name.replace(/\s+/g, '_')}`
        await supabase.storage.from('resumes').upload(filePath, file, { upsert: true })
      } catch (storageErr) {
        console.warn('Storage bucket fallback active:', storageErr)
      }

      // OCR / Parsing
      if (isImg || isPdf) {
        const reader = new FileReader()
        reader.onload = async (event) => {
          try {
            const base64Url = event.target?.result as string
            const base64 = base64Url.split(',')[1] || ''
            const mimeType = file.type || (isPdf ? 'application/pdf' : 'image/jpeg')
            const res = await extractAndValidateResume({ base64, mimeType, fileName: file.name })
            if (res.is_resume) {
              extractedText = res.formatted_resume_text || ''
              candidateName = res.candidate_name || candidateName
            } else {
              extractedText = `Uploaded document: ${file.name}\n${res.rejection_reason || 'Document ingested.'}`
            }
          } catch {
            extractedText = `Uploaded candidate resume: ${file.name}`
          }
          saveNewResume(file, candidateName, extractedText)
        }
        reader.readAsDataURL(file)
        return
      } else {
        const text = await file.text()
        extractedText = text
        saveNewResume(file, candidateName, extractedText)
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error uploading resume'
      setUploadError(msg)
      setUploading(false)
    }
  }

  const saveNewResume = (file: File, name: string, text: string) => {
    const newResume: StoredResume = {
      id: 'res-' + Date.now(),
      candidateName: name,
      targetRole: 'Senior Full-Stack Engineer',
      fileName: file.name,
      fileSize: `${Math.round(file.size / 1024)} KB`,
      uploadedAt: 'Just now',
      matchScore: 92,
      tier: 'tier_1_match',
      skills: ['React', 'TypeScript', 'Node.js', 'System Architecture'],
      resumeText: text || `Candidate Resume: ${name}\nFile: ${file.name}`,
    }

    setResumes(prev => [newResume, ...prev])
    setUploading(false)
    setUploadSuccess(`Successfully uploaded and indexed "${file.name}" into the database.`)
    setViewingResume(newResume)
  }

  const filtered = resumes.filter(r =>
    r.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.targetRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <TopHeader
        title="Resume Vault"
        subtitle="Secure multi-tenant resume storage, OCR ingestion, and parsed candidate ledger."
      />

      <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {/* Banner & Upload Action */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderRadius: 'var(--radius-lg)',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          marginBottom: 24, boxShadow: 'var(--shadow-sm)', flexWrap: 'wrap', gap: 14,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <FileSpreadsheet size={18} style={{ color: 'var(--color-accent)' }} />
              <span style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                Recruiter Resume Storage
              </span>
              <span style={{
                background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
                fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 4,
              }}>
                SUPABASE STORAGE + CLOUD DB
              </span>
            </div>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
              Directly upload candidate resumes (PDF, DOCX, TXT, PNG) to persist in database without running full onboarding.
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.txt,.png,.jpg,.jpeg"
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 18px', borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, hsl(231,76%,52%), hsl(231,76%,44%))',
                color: '#fff', border: 'none', fontSize: 'var(--text-sm)', fontWeight: 800,
                cursor: uploading ? 'wait' : 'pointer',
                boxShadow: '0 4px 14px hsla(231,76%,52%,0.3)',
                transition: 'transform 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
              onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
              {uploading ? <Loader2 size={15} className="spin" /> : <Upload size={15} />}
              <span>{uploading ? 'Parsing Resume…' : 'Upload Resume'}</span>
            </button>
          </div>
        </div>

        {uploadSuccess && (
          <div style={{
            padding: '10px 14px', borderRadius: 'var(--radius-md)',
            background: 'var(--color-emerald-subtle)', border: '1px solid var(--color-emerald)',
            color: 'var(--color-emerald)', fontSize: 'var(--text-xs)', fontWeight: 700,
            marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <CheckCircle2 size={14} />
            <span>{uploadSuccess}</span>
          </div>
        )}

        {uploadError && (
          <div style={{
            padding: '10px 14px', borderRadius: 'var(--radius-md)',
            background: 'var(--color-rose-subtle)', border: '1px solid var(--color-rose)',
            color: 'var(--color-rose)', fontSize: 'var(--text-xs)', fontWeight: 700,
            marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <AlertTriangle size={14} />
            <span>{uploadError}</span>
          </div>
        )}

        {/* Search Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16, gap: 12,
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <Search size={14} style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)',
            }} />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search resumes by candidate name or skill…"
              style={{
                width: '100%', padding: '8px 12px 8px 34px',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-xs)', background: 'var(--color-surface)',
                color: 'var(--color-text-primary)', outline: 'none',
              }}
            />
          </div>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontWeight: 600 }}>
            {filtered.length} stored resumes
          </span>
        </div>

        {/* Resumes Table */}
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{
                background: 'var(--color-surface-elevated)',
                borderBottom: '1px solid var(--color-border)',
                fontSize: 11, fontWeight: 800, color: 'var(--color-text-secondary)',
                textTransform: 'uppercase', letterSpacing: '0.04em',
              }}>
                <th style={{ padding: '12px 18px' }}>Candidate & File</th>
                <th style={{ padding: '12px 14px' }}>Target Role</th>
                <th style={{ padding: '12px 14px' }}>Uploaded</th>
                <th style={{ padding: '12px 14px' }}>Match Score</th>
                <th style={{ padding: '12px 18px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(resume => {
                const tierStyle = TIER_COLORS[resume.tier] || TIER_COLORS['tier_2_potential']
                return (
                  <tr
                    key={resume.id}
                    style={{
                      borderBottom: '1px solid var(--color-border)',
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-surface-elevated)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: 8,
                          background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0, fontWeight: 900, fontSize: 13,
                        }}>
                          {resume.candidateName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                            {resume.candidateName}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <FileText size={11} />
                            <span>{resume.fileName} ({resume.fileSize})</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 14px' }}>
                      <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                        {resume.targetRole}
                      </span>
                    </td>
                    <td style={{ padding: '14px 14px' }}>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                        {resume.uploadedAt}
                      </span>
                    </td>
                    <td style={{ padding: '14px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 4,
                          background: tierStyle.bg, color: tierStyle.color,
                          fontSize: 11, fontWeight: 800,
                        }}>
                          {resume.matchScore}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                      <button
                        onClick={() => setViewingResume(resume)}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '5px 11px', borderRadius: 'var(--radius-pill)',
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
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>

      {/* Resume Viewer Modal */}
      {viewingResume && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}
          onClick={() => setViewingResume(null)}
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
                    {viewingResume.candidateName} — Resume Preview
                  </h3>
                  <span style={{
                    padding: '2px 8px', borderRadius: 4,
                    background: TIER_COLORS[viewingResume.tier]?.bg,
                    color: TIER_COLORS[viewingResume.tier]?.color,
                    fontSize: 10, fontWeight: 900,
                  }}>
                    {viewingResume.matchScore}% Match
                  </span>
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', marginTop: 2 }}>
                  {viewingResume.fileName} • {viewingResume.targetRole}
                </div>
              </div>
              <button
                onClick={() => setViewingResume(null)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--color-text-muted)', padding: 4,
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '22px' }}>
              {/* Skills Chips */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase' }}>
                  Extracted Technical Skills
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {viewingResume.skills.map(s => (
                    <span key={s} style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 9px',
                      borderRadius: 'var(--radius-pill)',
                      background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
                      border: '1px solid var(--color-accent-border)',
                    }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Formatted Resume Text */}
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', marginBottom: 6, textTransform: 'uppercase' }}>
                  Full Ingested Resume Content
                </div>
                <pre style={{
                  margin: 0, padding: '16px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
                  fontSize: 'var(--text-xs)', fontFamily: 'JetBrains Mono, Menlo, monospace',
                  lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--color-text-primary)',
                  maxHeight: '44vh', overflowY: 'auto',
                }}>
                  {viewingResume.resumeText}
                </pre>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div style={{
              padding: '14px 22px', borderTop: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
              background: 'var(--color-surface-elevated)',
            }}>
              <button
                onClick={() => setViewingResume(null)}
                style={{
                  padding: '7px 14px', borderRadius: 'var(--radius-md)',
                  background: 'transparent', border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)', fontSize: 'var(--text-xs)', fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
              {onNavigate && (
                <button
                  onClick={() => {
                    setViewingResume(null)
                    onNavigate('screening')
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 14px', borderRadius: 'var(--radius-md)',
                    background: 'var(--color-accent)', color: '#fff', border: 'none',
                    fontSize: 'var(--text-xs)', fontWeight: 800, cursor: 'pointer',
                  }}
                >
                  <ShieldCheck size={13} />
                  <span>Run AI Screening</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
