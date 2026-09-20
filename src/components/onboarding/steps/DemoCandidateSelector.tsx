import { Sparkles } from 'lucide-react'
import { SAMPLE_CANDIDATES, type SampleCandidate } from '../../../data/sampleCandidates'

interface Props {
  selectedSampleId: string | null
  isSampleActive: boolean
  onSelectSample: (cand: SampleCandidate) => void
}

export function DemoCandidateSelector({ selectedSampleId, isSampleActive, onSelectSample }: Props) {
  return (
    <div style={{
      background: isSampleActive ? 'var(--color-accent-subtle)' : 'var(--color-surface-elevated)',
      border: `1.5px ${isSampleActive ? 'solid var(--color-accent)' : 'dashed var(--color-border)'}`,
      borderRadius: 'var(--radius-lg)', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'all 0.2s',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={15} style={{ color: 'var(--color-accent)' }} />
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
            Hackathon Fast-Track: Auto-Fill Demo Candidate (100% Editable)
          </span>
        </div>
        {isSampleActive && (
          <span style={{
            fontSize: 10, fontWeight: 800, color: 'var(--color-accent)',
            background: '#fff', padding: '2px 8px', borderRadius: 4,
          }}>
            DEMO SAMPLE ACTIVE
          </span>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
        {SAMPLE_CANDIDATES.map((cand) => {
          const isSelected = selectedSampleId === cand.id
          return (
            <button
              key={cand.id}
              type="button"
              onClick={() => onSelectSample(cand)}
              style={{
                textAlign: 'left', padding: '10px 14px', borderRadius: 'var(--radius-md)',
                background: 'var(--color-surface)',
                border: `1.5px solid ${isSelected ? 'var(--color-accent)' : 'var(--color-border)'}`,
                cursor: 'pointer', transition: 'all 0.15s',
                boxShadow: isSelected ? '0 2px 8px hsla(231,76%,52%,0.2)' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                <span style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
                  {cand.name}
                </span>
                <span style={{
                  fontSize: 10, fontWeight: 900, padding: '1px 6px', borderRadius: 4,
                  background: cand.tier === 'tier_1_match' ? 'var(--color-emerald-subtle)' : cand.tier === 'tier_2_potential' ? 'var(--color-amber-subtle)' : 'var(--color-rose-subtle)',
                  color: cand.tier === 'tier_1_match' ? 'var(--color-emerald)' : cand.tier === 'tier_2_potential' ? 'var(--color-amber)' : 'var(--color-rose)',
                }}>
                  {cand.expectedScore}%
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-text-muted)', lineHeight: 1.3 }}>
                {cand.tagline}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
