import { useState } from 'react'
import { Briefcase, ArrowLeft, ArrowRight, Plus, X, Tag } from 'lucide-react'

export interface JobRoleData {
  title: string
  department: string
  experienceLevel: string
  mustHaves: string[]
  niceToHaves: string[]
  descriptionText: string
}

interface Props {
  data: JobRoleData
  onChange: (updates: Partial<JobRoleData>) => void
  onPrev: () => void
  onNext: () => void
}

export function JobRoleSetupStep({ data, onChange, onPrev, onNext }: Props) {
  const [newMustHave, setNewMustHave] = useState('')
  const [newNiceToHave, setNewNiceToHave] = useState('')

  const handleAddMustHave = () => {
    if (!newMustHave.trim()) return
    if (!data.mustHaves.includes(newMustHave.trim())) {
      onChange({ mustHaves: [...data.mustHaves, newMustHave.trim()] })
    }
    setNewMustHave('')
  }

  const handleRemoveMustHave = (tag: string) => {
    onChange({ mustHaves: data.mustHaves.filter(t => t !== tag) })
  }

  const handleAddNiceToHave = () => {
    if (!newNiceToHave.trim()) return
    if (!data.niceToHaves.includes(newNiceToHave.trim())) {
      onChange({ niceToHaves: [...data.niceToHaves, newNiceToHave.trim()] })
    }
    setNewNiceToHave('')
  }

  const handleRemoveNiceToHave = (tag: string) => {
    onChange({ niceToHaves: data.niceToHaves.filter(t => t !== tag) })
  }

  const canProceed = data.title.trim().length > 0 && data.mustHaves.length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
            padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800,
          }}>
            STEP 2 OF 4
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Target Hiring Role & Evaluation Criteria
          </span>
        </div>
        <h2 style={{ margin: '0 0 6px', fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
          Configure the Position for AI Evaluation
        </h2>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Our AI model will screen incoming candidate resumes against these exact requirements.
        </p>
      </div>

      {/* Role Title & Department */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 14 }}>
        <div>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
            Job Title *
          </label>
          <div style={{ position: 'relative' }}>
            <Briefcase size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={data.title}
              onChange={e => onChange({ title: e.target.value })}
              placeholder="e.g. Senior Full-Stack Engineer"
              style={{
                width: '100%', padding: '10px 12px 10px 36px',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)',
                background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
            Department
          </label>
          <input
            type="text"
            value={data.department}
            onChange={e => onChange({ department: e.target.value })}
            placeholder="e.g. Platform Engineering"
            style={{
              width: '100%', padding: '10px 12px',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)',
              background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
            Experience Level
          </label>
          <select
            value={data.experienceLevel}
            onChange={e => onChange({ experienceLevel: e.target.value })}
            style={{
              width: '100%', padding: '10px 12px',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)',
              background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box',
            }}
          >
            <option value="Junior (1-3 years)">Junior (1-3 years)</option>
            <option value="Mid-Level (3-5 years)">Mid-Level (3-5 years)</option>
            <option value="Senior (5+ years)">Senior (5+ years)</option>
            <option value="Staff / Principal (8+ years)">Staff / Principal (8+ years)</option>
          </select>
        </div>
      </div>

      {/* Must-Haves Tags */}
      <div style={{
        background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
            Must-Have Criteria (Hard Gates for AI Match) *
          </label>
          <span style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>Click tag to remove</span>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {data.mustHaves.map((tag) => (
            <span
              key={tag}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 10px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
                fontSize: 'var(--text-xs)', fontWeight: 700,
              }}
            >
              <Tag size={11} />
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveMustHave(tag)}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent)', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <input
            type="text"
            value={newMustHave}
            onChange={e => setNewMustHave(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddMustHave() } }}
            placeholder="Add another must-have skill and press Enter…"
            style={{
              flex: 1, padding: '8px 12px', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)',
              background: 'var(--color-surface)', outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={handleAddMustHave}
            style={{
              padding: '8px 14px', borderRadius: 'var(--radius-md)',
              background: 'var(--color-accent)', color: '#fff', border: 'none',
              fontSize: 'var(--text-xs)', fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <Plus size={13} /> Add
          </button>
        </div>
      </div>

      {/* Nice-To-Haves Tags */}
      <div style={{
        background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-secondary)', textTransform: 'uppercase' }}>
            Nice-To-Have Skills (Bonus Weighting)
          </label>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {data.niceToHaves.map((tag) => (
            <span
              key={tag}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '5px 10px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface)', color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)', fontSize: 'var(--text-xs)', fontWeight: 600,
              }}
            >
              {tag}
              <button
                type="button"
                onClick={() => handleRemoveNiceToHave(tag)}
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                <X size={12} />
              </button>
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
          <input
            type="text"
            value={newNiceToHave}
            onChange={e => setNewNiceToHave(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddNiceToHave() } }}
            placeholder="Add bonus skill (e.g. Kafka, Redis)…"
            style={{
              flex: 1, padding: '8px 12px', border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)',
              background: 'var(--color-surface)', outline: 'none',
            }}
          />
          <button
            type="button"
            onClick={handleAddNiceToHave}
            style={{
              padding: '8px 14px', borderRadius: 'var(--radius-md)',
              background: 'var(--color-surface)', border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)', fontSize: 'var(--text-xs)', fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <Plus size={13} /> Add
          </button>
        </div>
      </div>

      {/* Role Description Summary */}
      <div>
        <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
          Role Description / Objectives
        </label>
        <textarea
          value={data.descriptionText}
          onChange={e => onChange({ descriptionText: e.target.value })}
          rows={3}
          style={{
            width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
            color: 'var(--color-text-primary)', background: 'var(--color-surface)',
            outline: 'none', resize: 'vertical', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
        <button
          type="button"
          onClick={onPrev}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '9px 18px', borderRadius: 'var(--radius-md)',
            background: 'none', border: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)', fontWeight: 700, fontSize: 'var(--text-sm)',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={15} /> Back
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 24px', borderRadius: 'var(--radius-md)',
            background: canProceed ? 'linear-gradient(135deg, hsl(231,76%,52%), hsl(231,76%,46%))' : 'var(--color-border)',
            color: '#fff', border: 'none', fontWeight: 800, fontSize: 'var(--text-sm)',
            cursor: canProceed ? 'pointer' : 'not-allowed',
            boxShadow: canProceed ? '0 2px 10px hsla(231,76%,52%,0.25)' : 'none',
          }}
        >
          Next: Candidate Intake & Ingestion <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
