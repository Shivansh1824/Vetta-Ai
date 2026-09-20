import { useState } from 'react'
import { Briefcase, ArrowLeft, ArrowRight, Plus, X, Tag, AlertCircle, Loader2, Trash2 } from 'lucide-react'
import { validateJobRoleCriteria } from '../../../services/gemini'

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
  const [isValidating, setIsValidating] = useState(false)
  const [validationError, setValidationError] = useState<{ outOfContextItems: string[]; explanation: string } | null>(null)

  const isFlagged = (tag: string) =>
    Boolean(validationError?.outOfContextItems?.some(
      item => item.toLowerCase().trim() === tag.toLowerCase().trim()
    ))

  const handleAddMustHave = () => {
    if (!newMustHave.trim()) return
    if (!data.mustHaves.includes(newMustHave.trim())) {
      onChange({ mustHaves: [...data.mustHaves, newMustHave.trim()] })
    }
    setNewMustHave('')
    if (validationError) setValidationError(null)
  }

  const handleRemoveMustHave = (tag: string) => {
    const nextMustHaves = data.mustHaves.filter(t => t !== tag)
    onChange({ mustHaves: nextMustHaves })
    if (validationError) {
      const remainingFlagged = validationError.outOfContextItems.filter(
        i => nextMustHaves.some(m => m.toLowerCase().trim() === i.toLowerCase().trim()) ||
             data.niceToHaves.some(n => n.toLowerCase().trim() === i.toLowerCase().trim())
      )
      if (remainingFlagged.length === 0) {
        setValidationError(null)
      } else {
        setValidationError({ ...validationError, outOfContextItems: remainingFlagged })
      }
    }
  }

  const handleAddNiceToHave = () => {
    if (!newNiceToHave.trim()) return
    if (!data.niceToHaves.includes(newNiceToHave.trim())) {
      onChange({ niceToHaves: [...data.niceToHaves, newNiceToHave.trim()] })
    }
    setNewNiceToHave('')
    if (validationError) setValidationError(null)
  }

  const handleRemoveNiceToHave = (tag: string) => {
    const nextNiceToHaves = data.niceToHaves.filter(t => t !== tag)
    onChange({ niceToHaves: nextNiceToHaves })
    if (validationError) {
      const remainingFlagged = validationError.outOfContextItems.filter(
        i => data.mustHaves.some(m => m.toLowerCase().trim() === i.toLowerCase().trim()) ||
             nextNiceToHaves.some(n => n.toLowerCase().trim() === i.toLowerCase().trim())
      )
      if (remainingFlagged.length === 0) {
        setValidationError(null)
      } else {
        setValidationError({ ...validationError, outOfContextItems: remainingFlagged })
      }
    }
  }

  const handleRemoveAllOutOfContext = () => {
    if (!validationError) return
    const flaggedLower = validationError.outOfContextItems.map(i => i.toLowerCase().trim())
    onChange({
      mustHaves: data.mustHaves.filter(t => !flaggedLower.includes(t.toLowerCase().trim())),
      niceToHaves: data.niceToHaves.filter(t => !flaggedLower.includes(t.toLowerCase().trim())),
    })
    setValidationError(null)
  }

  const handleProceed = async () => {
    if (!canProceed || isValidating) return
    setIsValidating(true)
    setValidationError(null)

    try {
      const result = await validateJobRoleCriteria({
        title: data.title,
        department: data.department,
        mustHaves: data.mustHaves,
        niceToHaves: data.niceToHaves,
        descriptionText: data.descriptionText,
      })

      if (!result.is_valid && result.out_of_context_items && result.out_of_context_items.length > 0) {
        setValidationError({
          outOfContextItems: result.out_of_context_items,
          explanation: result.explanation || 'Some criteria appear to be out of context for a professional role. Please remove them to move further.',
        })
        setIsValidating(false)
        return
      }

      onNext()
    } catch (err) {
      console.error('Validation check error:', err)
      onNext()
    } finally {
      setIsValidating(false)
    }
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
          {data.mustHaves.map((tag) => {
            const flagged = isFlagged(tag)
            return (
              <span
                key={tag}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px', borderRadius: 'var(--radius-md)',
                  background: flagged ? 'hsla(0, 84%, 60%, 0.12)' : 'var(--color-accent-subtle)',
                  border: flagged ? '1.5px solid hsl(0, 72%, 51%)' : '1px solid transparent',
                  color: flagged ? 'hsl(0, 72%, 45%)' : 'var(--color-accent)',
                  fontSize: 'var(--text-xs)', fontWeight: 700,
                  transition: 'all 0.2s ease',
                }}
              >
                {flagged ? <AlertCircle size={12} style={{ color: 'hsl(0, 72%, 51%)' }} /> : <Tag size={11} />}
                {tag}
                {flagged && (
                  <span style={{
                    fontSize: 9, textTransform: 'uppercase', background: 'hsl(0, 72%, 51%)',
                    color: '#fff', padding: '1px 4px', borderRadius: 3, fontWeight: 800,
                  }}>
                    Out of Context
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveMustHave(tag)}
                  title="Remove requirement"
                  style={{
                    background: 'none', border: 'none',
                    color: flagged ? 'hsl(0, 72%, 51%)' : 'var(--color-accent)',
                    cursor: 'pointer', padding: 0, display: 'flex',
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            )
          })}
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
          {data.niceToHaves.map((tag) => {
            const flagged = isFlagged(tag)
            return (
              <span
                key={tag}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '5px 10px', borderRadius: 'var(--radius-md)',
                  background: flagged ? 'hsla(0, 84%, 60%, 0.12)' : 'var(--color-surface)',
                  border: flagged ? '1.5px solid hsl(0, 72%, 51%)' : '1px solid var(--color-border)',
                  color: flagged ? 'hsl(0, 72%, 45%)' : 'var(--color-text-secondary)',
                  fontSize: 'var(--text-xs)', fontWeight: 600,
                  transition: 'all 0.2s ease',
                }}
              >
                {flagged && <AlertCircle size={12} style={{ color: 'hsl(0, 72%, 51%)' }} />}
                {tag}
                {flagged && (
                  <span style={{
                    fontSize: 9, textTransform: 'uppercase', background: 'hsl(0, 72%, 51%)',
                    color: '#fff', padding: '1px 4px', borderRadius: 3, fontWeight: 800,
                  }}>
                    Out of Context
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveNiceToHave(tag)}
                  title="Remove requirement"
                  style={{
                    background: 'none', border: 'none',
                    color: flagged ? 'hsl(0, 72%, 51%)' : 'var(--color-text-muted)',
                    cursor: 'pointer', padding: 0, display: 'flex',
                  }}
                >
                  <X size={12} />
                </button>
              </span>
            )
          })}
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

      {/* Out of context validation banner */}
      {validationError && (
        <div style={{
          background: 'hsla(0, 84%, 60%, 0.08)',
          border: '1px solid hsla(0, 72%, 51%, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '14px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <AlertCircle size={20} style={{ color: 'hsl(0, 72%, 51%)', flexShrink: 0, marginTop: 1 }} />
              <div>
                <div style={{ fontSize: 'var(--text-sm)', fontWeight: 800, color: 'hsl(0, 72%, 45%)', marginBottom: 2 }}>
                  Out-of-Context Hiring Criteria Detected
                </div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                  {validationError.explanation}
                </div>
                <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: 'hsl(0, 72%, 45%)' }}>Please remove:</span>
                  {validationError.outOfContextItems.map((item) => (
                    <span
                      key={item}
                      style={{
                        fontSize: 11, fontWeight: 800, color: 'hsl(0, 72%, 45%)',
                        background: 'hsla(0, 84%, 60%, 0.15)', padding: '2px 8px',
                        borderRadius: 4, textDecoration: 'line-through',
                      }}
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveAllOutOfContext}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 12px', borderRadius: 'var(--radius-md)',
                background: 'hsl(0, 72%, 51%)', color: '#fff',
                border: 'none', fontSize: 'var(--text-xs)', fontWeight: 700,
                cursor: 'pointer', flexShrink: 0,
              }}
            >
              <Trash2 size={13} />
              Remove Out-of-Context Items
            </button>
          </div>
        </div>
      )}

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
          onClick={handleProceed}
          disabled={!canProceed || isValidating}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '11px 24px', borderRadius: 'var(--radius-md)',
            background: canProceed && !isValidating
              ? 'linear-gradient(135deg, hsl(231,76%,52%), hsl(231,76%,46%))'
              : 'var(--color-border)',
            color: '#fff', border: 'none', fontWeight: 800, fontSize: 'var(--text-sm)',
            cursor: canProceed && !isValidating ? 'pointer' : 'not-allowed',
            boxShadow: canProceed && !isValidating ? '0 2px 10px hsla(231,76%,52%,0.25)' : 'none',
          }}
        >
          {isValidating ? (
            <>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Verifying Criteria with AI…
            </>
          ) : (
            <>
              Next: Candidate Intake & Ingestion <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  )
}
