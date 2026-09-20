import { RefreshCw, Database, CheckCircle2, Tag } from 'lucide-react'
import type { CandidateIntakeData } from './CandidateUploadStep'

interface Props {
  data: CandidateIntakeData
  onChange: (updates: Partial<CandidateIntakeData>) => void
  onReset: () => void
  isDatabaseSaved?: boolean
}

export function ExtractedCandidateForm({ data, onChange, onReset, isDatabaseSaved }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
            Extracted Candidate Information (100% Editable)
          </label>
          {isDatabaseSaved && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
              background: 'var(--color-emerald-subtle)', color: 'var(--color-emerald)',
            }}>
              <Database size={11} /> Saved to Database
            </span>
          )}
        </div>
        {data.resumeText && (
          <button
            onClick={onReset}
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

      {/* Primary Details Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.2fr 1fr', gap: 10 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
            Candidate Full Name *
          </label>
          <input
            type="text"
            placeholder="Candidate Full Name"
            value={data.candidateName}
            onChange={e => onChange({ candidateName: e.target.value, isSampleData: false })}
            style={{
              width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
              background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
            Candidate Email
          </label>
          <input
            type="email"
            placeholder="e.g. candidate@example.com"
            value={data.candidateEmail}
            onChange={e => onChange({ candidateEmail: e.target.value, isSampleData: false })}
            style={{
              width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
              background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
            Contact Phone
          </label>
          <input
            type="text"
            placeholder="+1 (555) 000-0000"
            value={data.candidatePhone || ''}
            onChange={e => onChange({ candidatePhone: e.target.value, isSampleData: false })}
            style={{
              width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
              background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Role & Experience Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
            Current / Recent Job Title
          </label>
          <input
            type="text"
            placeholder="e.g. Senior Software Engineer"
            value={data.currentTitle || ''}
            onChange={e => onChange({ currentTitle: e.target.value, isSampleData: false })}
            style={{
              width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
              background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
            Years of Experience
          </label>
          <input
            type="number"
            min={0}
            max={40}
            placeholder="5"
            value={data.totalYearsExp ?? ''}
            onChange={e => onChange({ totalYearsExp: parseInt(e.target.value) || 0, isSampleData: false })}
            style={{
              width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
              background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Extracted Skills Chips */}
      {data.skills && data.skills.length > 0 && (
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
            Extracted Skills ({data.skills.length})
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {data.skills.map((skill, index) => (
              <span
                key={index}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 8px', borderRadius: 'var(--radius-sm, 6px)',
                  background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
                  color: 'var(--color-text-primary)', fontSize: 11, fontWeight: 600,
                }}
              >
                <Tag size={10} style={{ color: 'var(--color-accent)' }} />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Editable Full Resume Text */}
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
          Reconstructed Resume Markdown Content
        </label>
        <textarea
          value={data.resumeText}
          onChange={e => onChange({ resumeText: e.target.value, isSampleData: false })}
          placeholder="Extracted resume text will appear here. You can freely edit, append, or review before screening…"
          rows={7}
          style={{
            width: '100%', padding: '12px 14px', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-mono, monospace)', color: 'var(--color-text-primary)',
            background: 'var(--color-surface)', resize: 'vertical', lineHeight: 1.5, boxSizing: 'border-box', outline: 'none',
          }}
        />
      </div>
    </div>
  )
}
