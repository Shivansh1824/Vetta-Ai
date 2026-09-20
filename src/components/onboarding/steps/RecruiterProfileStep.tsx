import { User, Building2, Briefcase, Mail, ArrowRight, Sparkles } from 'lucide-react'

export interface RecruiterProfileData {
  fullName: string
  email: string
  roleTitle: string
  companyName: string
  companySize: string
  industry: string
}

interface Props {
  data: RecruiterProfileData
  onChange: (updates: Partial<RecruiterProfileData>) => void
  onNext: () => void
}

export function RecruiterProfileStep({ data, onChange, onNext }: Props) {
  const canProceed = data.fullName.trim().length > 0 && data.companyName.trim().length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Step Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
            padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800,
          }}>
            STEP 1 OF 4
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Recruiter & Organization Profile
          </span>
        </div>
        <h2 style={{ margin: '0 0 6px', fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
          Welcome to Vetta AI — Tell us about yourself
        </h2>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Pre-filled with demo credentials for instant hackathon evaluation. You can edit any details below.
        </p>
      </div>

      {/* Pre-fill Notice Banner */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 14px', borderRadius: 'var(--radius-md)',
        background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={14} style={{ color: 'var(--color-accent)' }} />
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
            Demo Access profile loaded. Feel free to modify your name, organization, or hiring role.
          </span>
        </div>
      </div>

      {/* Form Fields Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Recruiter Full Name */}
        <div>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
            Your Full Name *
          </label>
          <div style={{ position: 'relative' }}>
            <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={data.fullName}
              onChange={e => onChange({ fullName: e.target.value })}
              placeholder="e.g. Sarah Chen"
              style={{
                width: '100%', padding: '10px 12px 10px 36px',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)',
                background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Work Email */}
        <div>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
            Work Email
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="email"
              value={data.email}
              onChange={e => onChange({ email: e.target.value })}
              placeholder="you@company.com"
              style={{
                width: '100%', padding: '10px 12px 10px 36px',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)',
                background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Recruiter Role Title */}
        <div>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
            Your Role / Designation
          </label>
          <div style={{ position: 'relative' }}>
            <Briefcase size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={data.roleTitle}
              onChange={e => onChange({ roleTitle: e.target.value })}
              placeholder="e.g. Lead Technical Recruiter"
              style={{
                width: '100%', padding: '10px 12px 10px 36px',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)',
                background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Company Name */}
        <div>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
            Company / Organization Name *
          </label>
          <div style={{ position: 'relative' }}>
            <Building2 size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              value={data.companyName}
              onChange={e => onChange({ companyName: e.target.value })}
              placeholder="e.g. Vetta AI Labs"
              style={{
                width: '100%', padding: '10px 12px 10px 36px',
                border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)',
                background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Organization Size */}
        <div>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
            Organization Size
          </label>
          <select
            value={data.companySize}
            onChange={e => onChange({ companySize: e.target.value })}
            style={{
              width: '100%', padding: '10px 12px',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)',
              background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box',
            }}
          >
            <option value="1-10 employees">1 - 10 employees (Early Startup)</option>
            <option value="10-50 employees">10 - 50 employees (Growth)</option>
            <option value="50-200 employees">50 - 200 employees (Mid-Market)</option>
            <option value="200-1000 employees">200 - 1,000 employees (Enterprise)</option>
            <option value="1000+ employees">1,000+ employees (Global Scale)</option>
          </select>
        </div>

        {/* Industry */}
        <div>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 6 }}>
            Primary Industry
          </label>
          <input
            type="text"
            value={data.industry}
            onChange={e => onChange({ industry: e.target.value })}
            placeholder="e.g. AI & Cloud Infrastructure"
            style={{
              width: '100%', padding: '10px 12px',
              border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
              fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)',
              background: 'var(--color-surface)', outline: 'none', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--color-border)' }}>
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
          Next: Target Hiring Role <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
