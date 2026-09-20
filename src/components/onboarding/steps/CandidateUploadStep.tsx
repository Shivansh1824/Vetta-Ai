import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import {
  FileText, ArrowLeft, ArrowRight, Sparkles,
  FileUp, Image as ImageIcon, FileCode, CheckCircle2,
  Trash2, RefreshCw, Brain, AlertCircle, Loader2
} from 'lucide-react'
import { SAMPLE_CANDIDATES } from '../../../data/sampleCandidates'
import type { SampleCandidate } from '../../../data/sampleCandidates'
import { extractAndValidateResume, buildOfflineExtractionResult } from '../../../services/gemini'

export interface CandidateIntakeData {
  candidateName: string
  candidateEmail: string
  resumeText: string
  isSampleData: boolean
  sampleId: string | null
  uploadedFileName: string | null
  fileFormat: 'pdf' | 'image' | 'text' | null
}

interface Props {
  data: CandidateIntakeData
  onChange: (updates: Partial<CandidateIntakeData>) => void
  onPrev: () => void
  onRunScreening: () => void
}

interface UploadedDocumentItem {
  name: string
  sizeKb: number
  format: 'pdf' | 'image' | 'text'
  status: 'verified' | 'rejected' | 'processing'
}

export function CandidateUploadStep({ data, onChange, onPrev, onRunScreening }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [processingStage, setProcessingStage] = useState<'idle' | 'uploading' | 'extracting' | 'success' | 'rejected'>('idle')
  const [uploadPercent, setUploadPercent] = useState(0)
  const [rejectionReason, setRejectionReason] = useState<string | null>(null)
  const [batchList, setBatchList] = useState<UploadedDocumentItem[]>([])

  // GSAP Progress Bar animation during upload
  useEffect(() => {
    if (processingStage === 'uploading' && progressBarRef.current) {
      gsap.fromTo(progressBarRef.current,
        { width: '0%' },
        { width: '100%', duration: 0.8, ease: 'power1.inOut' }
      )
    }
  }, [processingStage])

  // Pre-fill demo candidate data (100% editable)
  const handleLoadSample = (sample: SampleCandidate) => {
    setProcessingStage('success')
    setRejectionReason(null)
    onChange({
      candidateName: sample.name,
      candidateEmail: `${sample.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      resumeText: sample.resumeText,
      isSampleData: true,
      sampleId: sample.id,
      uploadedFileName: null,
      fileFormat: 'text',
    })
  }

  // Process live uploaded files with Gemini Flash OCR & Resume Validation
  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const primaryFile = files[0]
    const ext = primaryFile.name.split('.').pop()?.toLowerCase() || ''
    const isImg = ['png', 'jpg', 'jpeg', 'webp'].includes(ext)
    const isPdf = ext === 'pdf'
    const formatType: 'pdf' | 'image' | 'text' = isPdf ? 'pdf' : isImg ? 'image' : 'text'

    // Populate batch list if multiple files selected
    const docItems: UploadedDocumentItem[] = Array.from(files).map(f => {
      const fext = f.name.split('.').pop()?.toLowerCase() || ''
      const fmt: 'pdf' | 'image' | 'text' = fext === 'pdf' ? 'pdf' : ['png', 'jpg', 'jpeg', 'webp'].includes(fext) ? 'image' : 'text'
      return {
        name: f.name,
        sizeKb: Math.round(f.size / 1024),
        format: fmt,
        status: 'processing',
      }
    })
    setBatchList(docItems)
    // Immediately clear sample mode upon file selection
    onChange({
      isSampleData: false,
      sampleId: null,
      uploadedFileName: primaryFile.name,
      fileFormat: formatType,
      candidateName: '',
      candidateEmail: '',
      resumeText: '',
    })

    // Phase 1: Uploading
    setProcessingStage('uploading')
    setUploadPercent(0)
    setRejectionReason(null)

    // Simulate realistic network chunk upload with GSAP timer
    await new Promise(r => setTimeout(r, 700))
    setUploadPercent(100)

    // Phase 2: Gemini Flash OCR & Document Verification
    setProcessingStage('extracting')

    try {
      if (isImg || isPdf) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const base64Url = e.target?.result as string
          const base64Content = base64Url.split(',')[1] || ''
          const mimeType = primaryFile.type || (isPdf ? 'application/pdf' : 'image/jpeg')

          try {
            const result = await extractAndValidateResume({
              base64: base64Content,
              mimeType,
              fileName: primaryFile.name,
            })
            applyExtractionResult(result, primaryFile.name, formatType)
          } catch {
            // Offline fallback
            const fallback = buildOfflineExtractionResult(primaryFile.name, primaryFile.name)
            applyExtractionResult(fallback, primaryFile.name, formatType)
          }
        }
        reader.readAsDataURL(primaryFile)
      } else {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const textContent = (e.target?.result as string) || ''
          try {
            const result = await extractAndValidateResume({
              text: textContent,
              fileName: primaryFile.name,
            })
            applyExtractionResult(result, primaryFile.name, formatType)
          } catch {
            const fallback = buildOfflineExtractionResult(textContent, primaryFile.name)
            applyExtractionResult(fallback, primaryFile.name, formatType)
          }
        }
        reader.readAsText(primaryFile)
      }
    } catch {
      setProcessingStage('rejected')
      setRejectionReason('An error occurred during document reading. Please try uploading again.')
    }
  }

  const applyExtractionResult = (
    result: { is_resume: boolean; rejection_reason?: string; candidate_name?: string; email?: string; current_title?: string; formatted_resume_text?: string },
    fileName: string,
    formatType: 'pdf' | 'image' | 'text'
  ) => {
    if (!result.is_resume) {
      setProcessingStage('rejected')
      setRejectionReason(result.rejection_reason || 'The file you have uploaded is not a candidate resume. You have uploaded something else. Please upload a valid resume (PDF, DOCX, or Image).')
      setBatchList(prev => prev.map((item, idx) => idx === 0 ? { ...item, status: 'rejected' } : item))
      onChange({
        candidateName: '',
        candidateEmail: '',
        resumeText: '',
        uploadedFileName: fileName,
        fileFormat: formatType,
      })
    } else {
      setProcessingStage('success')
      setRejectionReason(null)
      setBatchList(prev => prev.map((item, idx) => idx === 0 ? { ...item, status: 'verified' } : item))

      const fallbackName = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ')
      onChange({
        candidateName: result.candidate_name || fallbackName,
        candidateEmail: result.email || `${fallbackName.toLowerCase().replace(/\s+/g, '.')}@candidate.io`,
        resumeText: result.formatted_resume_text || '',
        isSampleData: false,
        sampleId: null,
        uploadedFileName: fileName,
        fileFormat: formatType,
      })
    }
  }

  const handleClear = () => {
    setProcessingStage('idle')
    setRejectionReason(null)
    setBatchList([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onChange({
      candidateName: '',
      candidateEmail: '',
      resumeText: '',
      isSampleData: false,
      sampleId: null,
      uploadedFileName: null,
      fileFormat: null,
    })
  }

  const handleTryAgain = () => {
    setProcessingStage('idle')
    setRejectionReason(null)
    setBatchList([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onChange({
      candidateName: '',
      candidateEmail: '',
      resumeText: '',
      isSampleData: false,
      sampleId: null,
      uploadedFileName: null,
      fileFormat: null,
    })
    // Immediately open file picker to let user try again with another file
    setTimeout(() => {
      fileInputRef.current?.click()
    }, 50)
  }

  // Once someone uploads a document or starts processing, completely remove the hackathon fast-track demo section
  const hasUploadedDoc = Boolean(data.uploadedFileName || ['uploading', 'extracting', 'rejected'].includes(processingStage) || (!data.isSampleData && data.resumeText.length > 0))

  const canProceed = data.resumeText.trim().length > 0 && processingStage !== 'rejected'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Step Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            background: 'var(--color-accent-subtle)', color: 'var(--color-accent)',
            padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 800,
          }}>
            STEP 3 OF 4
          </span>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            Candidate Ingestion & OCR Intelligence
          </span>
        </div>
        <h2 style={{ margin: '0 0 6px', fontSize: 'var(--text-xl)', fontWeight: 900, color: 'var(--color-text-primary)' }}>
          Candidate Intake: Upload Document or Folder
        </h2>
        <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          Upload a resume in <strong>PDF</strong>, <strong>Image (PNG/JPG OCR)</strong>, or a <strong>list of documents</strong>. Google Gemini Flash will verify the resume and extract editable content.
        </p>
      </div>

      {/* Demo Quick Access - Removed if user uploads a document */}
      {!hasUploadedDoc && (
        <div style={{
        background: data.isSampleData ? 'var(--color-accent-subtle)' : 'var(--color-surface-elevated)',
        border: `1.5px ${data.isSampleData ? 'solid var(--color-accent)' : 'dashed var(--color-border)'}`,
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
          {data.isSampleData && (
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
            const isSelected = data.sampleId === cand.id
            return (
              <button
                key={cand.id}
                type="button"
                onClick={() => handleLoadSample(cand)}
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
      )}

      {/* Multi-Format File Dropzone (PDF, Images, Multiple Documents) */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${processingStage === 'rejected' ? 'var(--color-rose)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-lg)', padding: '24px', textAlign: 'center', cursor: 'pointer',
          background: processingStage === 'rejected' ? 'var(--color-rose-subtle)' : data.uploadedFileName ? 'var(--color-emerald-subtle)' : 'var(--color-surface-elevated)',
          transition: 'all 0.2s',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg,.webp,.txt,.md,.doc,.docx"
          style={{ display: 'none' }}
          onChange={e => handleFilesSelected(e.target.files)}
        />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, background: '#fff', border: '1px solid var(--color-border)', fontSize: 10, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
            <FileText size={12} style={{ color: 'var(--color-rose)' }} /> PDF Document
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, background: '#fff', border: '1px solid var(--color-border)', fontSize: 10, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
            <ImageIcon size={12} style={{ color: 'var(--color-accent)' }} /> PNG / JPG (OCR)
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 4, background: '#fff', border: '1px solid var(--color-border)', fontSize: 10, fontWeight: 700, color: 'var(--color-text-secondary)' }}>
            <FileCode size={12} style={{ color: 'var(--color-emerald)' }} /> Batch Documents
          </div>
        </div>

        <FileUp size={28} style={{ color: processingStage === 'rejected' ? 'var(--color-rose)' : data.uploadedFileName ? 'var(--color-emerald)' : 'var(--color-accent)', margin: '0 auto 8px' }} />
        <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
          {data.uploadedFileName ? `Active Document: ${data.uploadedFileName}` : 'Drag & drop a candidate resume, PDF, or list of documents'}
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          Gemini Flash automatically detects file authenticity, runs OCR, and extracts editable profile text.
        </span>
      </div>

      {/* Animation Stages: Uploading & Gemini OCR Extraction */}
      {processingStage === 'uploading' && (
        <div style={{
          padding: '14px 18px', borderRadius: 'var(--radius-md)',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          display: 'flex', flexDirection: 'column', gap: 8,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-xs)', fontWeight: 700 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-accent)' }}>
              <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> Uploading document…
            </span>
            <span style={{ color: 'var(--color-text-muted)' }}>{uploadPercent}%</span>
          </div>
          <div style={{ height: 6, background: 'var(--color-border)', borderRadius: 999, overflow: 'hidden' }}>
            <div ref={progressBarRef} style={{ height: '100%', background: 'var(--color-accent)', borderRadius: 999 }} />
          </div>
        </div>
      )}

      {processingStage === 'extracting' && (
        <div style={{
          padding: '16px 20px', borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, hsl(214,80%,97%), hsl(231,60%,96%))',
          border: '1.5px solid var(--color-accent)', display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'var(--color-accent)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0, animation: 'pulse 1.5s infinite',
          }}>
            <Brain size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
              Google Gemini Flash: OCR Extraction & Document Verification…
            </div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              Authenticating resume layout, reading multi-column structures, and extracting candidate data.
            </span>
          </div>
        </div>
      )}

      {/* Validation Rejection Error Alert */}
      {processingStage === 'rejected' && rejectionReason && (
        <div style={{
          padding: '16px 18px', borderRadius: 'var(--radius-md)',
          background: 'var(--color-rose-subtle)', border: '1.5px solid var(--color-rose)',
          display: 'flex', alignItems: 'flex-start', gap: 12,
        }}>
          <AlertCircle size={20} style={{ color: 'var(--color-rose)', marginTop: 2, flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 'var(--text-sm)', color: 'var(--color-rose)' }}>
              Invalid Document Type Detected
            </div>
            <p style={{ margin: '4px 0 12px', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              {rejectionReason}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleTryAgain}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '7px 16px', borderRadius: 'var(--radius-sm, 6px)',
                  background: 'var(--color-rose)', color: '#fff',
                  border: 'none', fontWeight: 800, fontSize: 'var(--text-xs)',
                  cursor: 'pointer', boxShadow: '0 2px 8px hsla(350,89%,60%,0.25)',
                  transition: 'all 0.15s',
                }}
              >
                <RefreshCw size={13} /> Try Again
              </button>
              <button
                type="button"
                onClick={handleClear}
                style={{
                  padding: '7px 14px', borderRadius: 'var(--radius-sm, 6px)',
                  background: '#fff', color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)', fontWeight: 600, fontSize: 'var(--text-xs)',
                  cursor: 'pointer',
                }}
              >
                Choose Different File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {processingStage === 'success' && !rejectionReason && data.resumeText && (
        <div style={{
          padding: '10px 14px', borderRadius: 'var(--radius-md)',
          background: 'var(--color-emerald-subtle)', border: '1px solid hsla(158,64%,52%,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CheckCircle2 size={15} style={{ color: 'var(--color-emerald)' }} />
            <span style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--color-emerald)' }}>
              {data.isSampleData ? 'Demo Candidate Loaded' : 'Candidate Resume Verified & Extracted via Gemini OCR'}
            </span>
          </div>
          <button
            onClick={handleClear}
            type="button"
            style={{
              background: 'none', border: 'none', color: 'var(--color-text-muted)',
              cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            <Trash2 size={12} /> Clear & Upload Another
          </button>
        </div>
      )}

      {/* Batch Documents List (if multiple files uploaded) */}
      {batchList.length > 1 && (
        <div style={{
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)', padding: '12px 16px',
        }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--color-text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Uploaded Batch Documents ({batchList.length})
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {batchList.map((doc, idx) => (
              <div key={idx} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '6px 10px', background: 'var(--color-surface-elevated)', borderRadius: 6,
                fontSize: 'var(--text-xs)',
              }}>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{doc.name}</span>
                <span style={{
                  fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 4,
                  background: doc.status === 'verified' ? 'var(--color-emerald-subtle)' : doc.status === 'rejected' ? 'var(--color-rose-subtle)' : 'var(--color-accent-subtle)',
                  color: doc.status === 'verified' ? 'var(--color-emerald)' : doc.status === 'rejected' ? 'var(--color-rose)' : 'var(--color-accent)',
                }}>
                  {doc.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Editable Candidate Information Form */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label style={{ fontSize: 'var(--text-xs)', fontWeight: 800, color: 'var(--color-text-primary)', textTransform: 'uppercase' }}>
            Extracted Candidate Information & Resume Content (Editable)
          </label>
          {data.resumeText && (
            <button
              onClick={handleClear}
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <input
            type="text"
            placeholder="Candidate Full Name"
            value={data.candidateName}
            onChange={e => onChange({ candidateName: e.target.value, isSampleData: false })}
            style={{ padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', background: 'var(--color-surface)', outline: 'none' }}
          />
          <input
            type="email"
            placeholder="Candidate Email (optional)"
            value={data.candidateEmail}
            onChange={e => onChange({ candidateEmail: e.target.value, isSampleData: false })}
            style={{ padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', background: 'var(--color-surface)', outline: 'none' }}
          />
        </div>

        <textarea
          value={data.resumeText}
          onChange={e => onChange({ resumeText: e.target.value, isSampleData: false })}
          placeholder="Extracted resume text will appear here. You can freely edit, append, or review before screening…"
          rows={8}
          style={{
            width: '100%', padding: '12px 14px', border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)',
            fontFamily: 'var(--font-mono, monospace)', color: 'var(--color-text-primary)',
            background: 'var(--color-surface)', resize: 'vertical', lineHeight: 1.5, boxSizing: 'border-box', outline: 'none',
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
          <ArrowLeft size={15} /> Back to Role
        </button>

        <button
          type="button"
          onClick={onRunScreening}
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
          <Brain size={16} /> Run AI Screening & Verification <ArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}
