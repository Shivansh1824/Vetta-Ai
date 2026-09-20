import React from 'react'
import { TopHeader } from '../layout/TopHeader'
import { Briefcase, Plus, ChevronRight, Clock, Users } from 'lucide-react'

const MOCK_JOBS = [
  {
    id: '1', title: 'Senior Full-Stack Engineer', department: 'Engineering',
    experience_level: '5+ years', status: 'active',
    must_haves: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    candidates: 12, created_at: '2026-09-18',
  },
  {
    id: '2', title: 'Frontend Tech Lead', department: 'Product',
    experience_level: '7+ years', status: 'active',
    must_haves: ['React', 'System Design', 'Team Leadership'],
    candidates: 8, created_at: '2026-09-17',
  },
  {
    id: '3', title: 'DevOps Engineer', department: 'Infrastructure',
    experience_level: '3+ years', status: 'draft',
    must_haves: ['Kubernetes', 'CI/CD', 'AWS'],
    candidates: 0, created_at: '2026-09-19',
  },
]

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  active: { bg: 'var(--color-emerald-subtle)', color: 'var(--color-emerald)', label: 'Active' },
  draft: { bg: 'var(--color-border)', color: 'var(--color-text-muted)', label: 'Draft' },
  closed: { bg: 'var(--color-rose-subtle)', color: 'var(--color-rose)', label: 'Closed' },
}

export function JobsPage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <TopHeader title="Job Posts" subtitle="Create and manage your open positions." />

      <main style={{ flex: 1, padding: '28px', overflowY: 'auto' }}>

        {/* Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
            {MOCK_JOBS.length} positions total
          </p>
          <button style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 16px',
            background: 'linear-gradient(135deg, hsl(231,76%,52%), hsl(231,76%,46%))',
            color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
            fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 2px 12px hsla(231,76%,52%,0.3)',
            transition: 'transform 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.02)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          >
            <Plus size={15} /> New Job Post
          </button>
        </div>

        {/* Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {MOCK_JOBS.map(job => {
            const statusStyle = STATUS_STYLE[job.status] ?? STATUS_STYLE['draft']
            return (
              <div key={job.id} style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '20px 22px',
                boxShadow: 'var(--shadow-sm)',
                display: 'flex', alignItems: 'center', gap: 20,
                cursor: 'pointer', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)'; e.currentTarget.style.borderColor = 'var(--color-accent-border)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-sm)'; e.currentTarget.style.borderColor = 'var(--color-border)' }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'var(--color-accent-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, color: 'var(--color-accent)',
                }}>
                  <Briefcase size={18} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 800, fontSize: 'var(--text-base)', color: 'var(--color-text-primary)' }}>
                      {job.title}
                    </span>
                    <span style={{
                      padding: '2px 8px', borderRadius: 6,
                      background: statusStyle.bg, color: statusStyle.color,
                      fontSize: 'var(--text-xs)', fontWeight: 700,
                    }}>
                      {statusStyle.label}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      {job.department} · {job.experience_level}
                    </span>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {job.must_haves.slice(0, 3).map(skill => (
                        <span key={skill} style={{
                          padding: '2px 7px', borderRadius: 5,
                          background: 'var(--color-surface-elevated)',
                          border: '1px solid var(--color-border)',
                          fontSize: 10, color: 'var(--color-text-secondary)', fontWeight: 600,
                        }}>{skill}</span>
                      ))}
                      {job.must_haves.length > 3 && (
                        <span style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>+{job.must_haves.length - 3} more</span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-secondary)' }}>
                      <Users size={13} />
                      <span style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>{job.candidates}</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--color-text-muted)' }}>candidates</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-text-muted)', fontSize: 'var(--text-xs)' }}>
                      <Clock size={11} /> {job.created_at}
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--color-text-muted)' }} />
                </div>
              </div>
            )
          })}
        </div>

        {/* Empty state placeholder for no jobs */}
        {MOCK_JOBS.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '80px 40px',
            background: 'var(--color-surface)',
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-xl)',
          }}>
            <Briefcase size={36} style={{ color: 'var(--color-border-strong)', marginBottom: 12 }} />
            <h3 style={{ margin: '0 0 6px', fontWeight: 800, color: 'var(--color-text-primary)' }}>No jobs yet</h3>
            <p style={{ margin: '0 0 20px', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
              Create your first job posting to start screening candidates.
            </p>
            <button style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, hsl(231,76%,52%), hsl(231,76%,46%))',
              color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)', fontWeight: 700, cursor: 'pointer',
            }}>
              Post your first job
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
