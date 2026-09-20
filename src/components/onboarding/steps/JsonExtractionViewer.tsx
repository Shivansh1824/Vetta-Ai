import { useState } from 'react'
import { Code, Copy, Check, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'

interface Props {
  rawJson: Record<string, any> | null
}

export function JsonExtractionViewer({ rawJson }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  if (!rawJson) return null

  const jsonString = JSON.stringify(rawJson, null, 2)

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      background: 'var(--color-surface-elevated)',
      overflow: 'hidden',
    }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          userSelect: 'none',
          background: 'var(--color-surface)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Code size={15} style={{ color: 'var(--color-accent)' }} />
          <span style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-primary)' }}>
            Gemini Flash A+ Grade Structured JSON Output
          </span>
          <span style={{
            fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4,
            background: 'var(--color-emerald-subtle)', color: 'var(--color-emerald)',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <Sparkles size={10} /> A+ Grade Schema
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              handleCopy()
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 8px', borderRadius: 4, border: '1px solid var(--color-border)',
              background: '#fff', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)',
              cursor: 'pointer',
            }}
          >
            {copied ? <Check size={12} style={{ color: 'var(--color-emerald)' }} /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
          {isOpen ? <ChevronUp size={16} style={{ color: 'var(--color-text-muted)' }} /> : <ChevronDown size={16} style={{ color: 'var(--color-text-muted)' }} />}
        </div>
      </div>

      {isOpen && (
        <div style={{ padding: 12, background: 'hsl(222, 47%, 11%)', borderTop: '1px solid var(--color-border)' }}>
          <pre style={{
            margin: 0,
            padding: 10,
            fontSize: 12,
            fontFamily: 'var(--font-mono, monospace)',
            color: '#e2e8f0',
            lineHeight: 1.5,
            overflowX: 'auto',
            maxHeight: 280,
            borderRadius: 6,
          }}>
            {jsonString}
          </pre>
        </div>
      )}
    </div>
  )
}
