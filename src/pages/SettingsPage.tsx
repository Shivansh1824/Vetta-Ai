import { useState, useEffect } from 'react'
import { TopHeader } from '../components/layout/TopHeader'
import {
  User, Cpu, Sliders, CheckCircle2, Database, Save
} from 'lucide-react'

export function SettingsPage() {
  const [recruiterName, setRecruiterName] = useState('Sarah Chen')
  const [email, setEmail] = useState('demo.recruiter@vetta.ai')
  const [companyName, setCompanyName] = useState('Vetta AI Labs')
  const [roleTitle, setRoleTitle] = useState('Lead Technical Recruiter')

  const [aiModel, setAiModel] = useState('gemini-3.5-flash')
  const [positiveTone, setPositiveTone] = useState(true)
  const [dualKeyResilience, setDualKeyResilience] = useState(true)
  const [verbatimGrounding, setVerbatimGrounding] = useState(true)

  const [tier1Threshold, setTier1Threshold] = useState(80)
  const [tier2Threshold, setTier2Threshold] = useState(55)

  const [savedToast, setSavedToast] = useState(false)

  // Load saved settings if present
  useEffect(() => {
    try {
      const saved = localStorage.getItem('vetta_recruiter_settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.recruiterName) setRecruiterName(parsed.recruiterName)
        if (parsed.email) setEmail(parsed.email)
        if (parsed.companyName) setCompanyName(parsed.companyName)
        if (parsed.roleTitle) setRoleTitle(parsed.roleTitle)
        if (parsed.aiModel) setAiModel(parsed.aiModel)
        if (typeof parsed.positiveTone === 'boolean') setPositiveTone(parsed.positiveTone)
        if (typeof parsed.tier1Threshold === 'number') setTier1Threshold(parsed.tier1Threshold)
        if (typeof parsed.tier2Threshold === 'number') setTier2Threshold(parsed.tier2Threshold)
      }
    } catch {}
  }, [])

  const handleSave = () => {
    const settings = {
      recruiterName, email, companyName, roleTitle,
      aiModel, positiveTone, tier1Threshold, tier2Threshold,
    }
    try {
      localStorage.setItem('vetta_recruiter_settings', JSON.stringify(settings))
    } catch {}
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 3000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <TopHeader
        title="Settings & Workspace Configuration"
        subtitle="Configure recruiter profile, AI model intelligence, and pipeline clustering thresholds."
      />

      <main style={{ flex: 1, padding: '24px 28px', overflowY: 'auto' }}>
        {savedToast && (
          <div style={{
            padding: '10px 16px', borderRadius: 'var(--radius-md)',
            background: 'var(--color-emerald-subtle)', border: '1px solid var(--color-emerald)',
            color: 'var(--color-emerald)', fontSize: 'var(--text-xs)', fontWeight: 800,
            marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <CheckCircle2 size={15} />
            <span>Settings saved successfully to active workspace.</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 840 }}>

          {/* 1. Recruiter Profile & Organization */}
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <User size={16} style={{ color: 'var(--color-accent)' }} />
              <h3 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Recruiter Profile & Multi-Tenant Organization
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                  Recruiter Full Name
                </label>
                <input
                  type="text"
                  value={recruiterName}
                  onChange={e => setRecruiterName(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)',
                    background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                  Work Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)',
                    background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)',
                    background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                  Role Title
                </label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={e => setRoleTitle(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)',
                    background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', outline: 'none',
                  }}
                />
              </div>
            </div>
          </div>

          {/* 2. AI Intelligence Engine */}
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Cpu size={16} style={{ color: 'var(--color-accent)' }} />
              <h3 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Google Gemini Intelligence Configuration
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-secondary)', display: 'block', marginBottom: 4 }}>
                  Primary Target Model
                </label>
                <select
                  value={aiModel}
                  onChange={e => setAiModel(e.target.value)}
                  style={{
                    width: '100%', padding: '8px 12px', border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)', fontSize: 'var(--text-xs)',
                    background: 'var(--color-surface-elevated)', color: 'var(--color-text-primary)', outline: 'none',
                    fontWeight: 700,
                  }}
                >
                  <option value="gemini-3.5-flash">Google Gemini 3.5 Flash (Ultra-Fast Screening)</option>
                  <option value="gemini-3.6-flash">Google Gemini 3.6 Flash (Enhanced Reasoning)</option>
                  <option value="gemini-3.8-flash">Google Gemini 3.8 Flash (High-Capacity System Design)</option>
                </select>
              </div>

              {/* Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      Constructive & Positive Screening Tone (A+ Standard)
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      Celebrates genuine accomplishments and frames missing items as technical interview validation topics.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={positiveTone}
                    onChange={e => setPositiveTone(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--color-accent)' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      Dual API Key Failover Resilience
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      Automatically recovers quota or rate-limit errors by switching to backup Gemini key.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={dualKeyResilience}
                    onChange={e => setDualKeyResilience(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--color-accent)' }}
                  />
                </label>

                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                      Verbatim Resume Citation Enforcement
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      Eliminates ungrounded AI hallucinations by requiring direct quote extraction for each requirement.
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={verbatimGrounding}
                    onChange={e => setVerbatimGrounding(e.target.checked)}
                    style={{ width: 16, height: 16, accentColor: 'var(--color-accent)' }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* 3. Pipeline Clustering Thresholds */}
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Sliders size={16} style={{ color: 'var(--color-accent)' }} />
              <h3 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Pipeline Clustering Thresholds
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Tier 1 (Top Match) Threshold
                  </label>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-emerald)' }}>
                    {tier1Threshold}%+
                  </span>
                </div>
                <input
                  type="range"
                  min={70}
                  max={95}
                  value={tier1Threshold}
                  onChange={e => setTier1Threshold(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-emerald)' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <label style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                    Tier 2 (Review / Potential) Threshold
                  </label>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-amber)' }}>
                    {tier2Threshold}% - {tier1Threshold - 1}%
                  </span>
                </div>
                <input
                  type="range"
                  min={40}
                  max={75}
                  value={tier2Threshold}
                  onChange={e => setTier2Threshold(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-amber)' }}
                />
              </div>
            </div>
          </div>

          {/* 4. Storage & Cloud Infrastructure Telemetry */}
          <div style={{
            background: 'var(--color-surface)', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-lg)', padding: '20px 24px', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Database size={16} style={{ color: 'var(--color-accent)' }} />
              <h3 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                Cloud Database & Storage Telemetry
              </h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 'var(--text-xs)' }}>
              <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>Storage Bucket:</span>
                <strong style={{ color: 'var(--color-emerald)' }}>resumes (Active & Provisioned)</strong>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: 'var(--radius-md)', background: 'var(--color-surface-elevated)', border: '1px solid var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-muted)', display: 'block', marginBottom: 2 }}>Row Level Security (RLS):</span>
                <strong style={{ color: 'var(--color-emerald)' }}>Enforced on 8 Tables</strong>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
            <button
              onClick={handleSave}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '10px 24px', borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, hsl(231,76%,52%), hsl(231,76%,44%))',
                color: '#fff', border: 'none', fontSize: 'var(--text-sm)', fontWeight: 800,
                cursor: 'pointer', boxShadow: '0 2px 10px hsla(231,76%,52%,0.25)',
              }}
            >
              <Save size={15} />
              <span>Save Workspace Settings</span>
            </button>
          </div>

        </div>
      </main>
    </div>
  )
}
