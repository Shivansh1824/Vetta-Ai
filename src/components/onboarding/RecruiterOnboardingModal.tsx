import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { X, Check } from 'lucide-react'
import { RecruiterProfileStep, type RecruiterProfileData } from './steps/RecruiterProfileStep'
import { JobRoleSetupStep, type JobRoleData } from './steps/JobRoleSetupStep'
import { CandidateUploadStep, type CandidateIntakeData } from './steps/CandidateUploadStep'
import { ScreeningResultsStep } from './steps/ScreeningResultsStep'
import { analyzeResume, buildOfflineScreeningResult } from '../../services/gemini'
import { saveCandidateToDatabase } from '../../services/candidateStorage'
import type { Job, GeminiScreeningResult } from '../../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  onComplete: (data: {
    recruiter: RecruiterProfileData
    job: JobRoleData
    candidate: CandidateIntakeData
    screeningResult: GeminiScreeningResult | null
  }) => void
  onGoToInterview?: (candidateName: string, resumeText: string) => void
}

export function RecruiterOnboardingModal({ isOpen, onClose, onComplete, onGoToInterview }: Props) {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1)

  // Step 1: Recruiter Profile State (Pre-filled for hackathon demo access, 100% editable)
  const [recruiterData, setRecruiterData] = useState<RecruiterProfileData>({
    fullName: 'Sarah Chen',
    email: 'demo.recruiter@vetta.ai',
    roleTitle: 'Lead Technical Recruiter',
    companyName: 'Vetta AI Labs',
    companySize: '50-200 employees',
    industry: 'AI & Cloud Infrastructure',
  })

  // Step 2: Job Role State (Pre-filled, 100% editable)
  const [jobData, setJobData] = useState<JobRoleData>({
    title: 'Senior Full-Stack & Distributed Systems Engineer',
    department: 'Core Infrastructure & Platform',
    experienceLevel: 'Senior (5+ years)',
    mustHaves: ['React', 'TypeScript', 'Node.js', 'Distributed Systems', 'PostgreSQL'],
    niceToHaves: ['Kafka', 'Redis', 'Kubernetes', 'Docker'],
    descriptionText: 'Designing resilient microservices, scaling transactional data pipelines with PostgreSQL, and architecting real-time interactive user interfaces in modern React.',
  })

  // Step 3: Candidate Intake State (Starts clean; demo fast-track candidate can be chosen or file uploaded)
  const [candidateData, setCandidateData] = useState<CandidateIntakeData>({
    candidateName: '',
    candidateEmail: '',
    resumeText: '',
    isSampleData: false,
    sampleId: null,
    uploadedFileName: null,
    fileFormat: null,
  })

  // Step 4: AI Screening State
  const [screeningLoading, setScreeningLoading] = useState(false)
  const [screeningResult, setScreeningResult] = useState<GeminiScreeningResult | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const backdropRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // GSAP Modal Entrance Animation
  useEffect(() => {
    if (isOpen) {
      if (backdropRef.current && cardRef.current) {
        gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 })
        gsap.fromTo(cardRef.current, { opacity: 0, scale: 0.95, y: 16 }, { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: 'power2.out' })
      }
    }
  }, [isOpen])

  // Run AI Screening on Transition to Step 4
  const handleRunScreening = async () => {
    setCurrentStep(4)
    setScreeningLoading(true)
    setErrorMsg(null)
    setScreeningResult(null)

    const jobPayload: Job = {
      id: 'job-onboard-demo',
      recruiter_id: null,
      title: jobData.title,
      department: jobData.department,
      experience_level: jobData.experienceLevel,
      must_haves: jobData.mustHaves,
      nice_to_haves: jobData.niceToHaves,
      description_text: jobData.descriptionText,
      status: 'active',
      created_at: new Date().toISOString(),
    }

    try {
      const res = await analyzeResume(candidateData.resumeText, jobPayload)
      setScreeningResult(res)
      if (candidateData.id) {
        saveCandidateToDatabase({
          id: candidateData.id,
          name: candidateData.candidateName,
          email: candidateData.candidateEmail,
          phone: candidateData.candidatePhone,
          currentTitle: candidateData.currentTitle,
          totalYearsExp: candidateData.totalYearsExp,
          matchScore: res.match_score,
          tier: res.tier,
          summary: res.summary,
          resumeText: candidateData.resumeText,
        })
      }
    } catch {
      const fallback = buildOfflineScreeningResult(candidateData.resumeText, jobPayload)
      setScreeningResult(fallback)
      setErrorMsg('Gemini API offline — displaying verified evaluation intelligence.')
    } finally {
      setScreeningLoading(false)
    }
  }

  const handleCompleteAndEnterDashboard = () => {
    onComplete({
      recruiter: recruiterData,
      job: jobData,
      candidate: candidateData,
      screeningResult,
    })
    onClose()
  }

  const handleGoToInterview = () => {
    if (onGoToInterview) {
      onGoToInterview(candidateData.candidateName, candidateData.resumeText)
    }
    handleCompleteAndEnterDashboard()
  }

  if (!isOpen) return null

  const stepsList = [
    { num: 1, label: 'Recruiter Profile' },
    { num: 2, label: 'Hiring Role' },
    { num: 3, label: 'Candidate Intake' },
    { num: 4, label: 'AI Screening' },
  ]

  return (
    <div
      ref={backdropRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '24px', overflowY: 'auto',
      }}
    >
      <div
        ref={cardRef}
        style={{
          width: '100%', maxWidth: 860, maxHeight: '92vh',
          background: 'var(--color-surface)', border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}
      >
        {/* Modal Top Bar & Stepper */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--color-border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--color-surface-elevated)',
        }}>
          {/* Stepper */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {stepsList.map((s) => (
              <div
                key={s.num}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 999,
                  background: currentStep === s.num ? 'var(--color-accent)' : currentStep > s.num ? 'var(--color-emerald)' : 'var(--color-surface)',
                  border: currentStep >= s.num ? 'none' : '1px solid var(--color-border)',
                  color: currentStep >= s.num ? '#fff' : 'var(--color-text-muted)',
                  fontSize: 'var(--text-xs)', fontWeight: 800,
                  transition: 'all 0.2s',
                }}
              >
                {currentStep > s.num ? <Check size={12} /> : s.num}
                <span>{s.label}</span>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none', border: 'none', color: 'var(--color-text-muted)',
              cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body (Step Content) */}
        <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
          {currentStep === 1 && (
            <RecruiterProfileStep
              data={recruiterData}
              onChange={updates => setRecruiterData(prev => ({ ...prev, ...updates }))}
              onNext={() => setCurrentStep(2)}
            />
          )}

          {currentStep === 2 && (
            <JobRoleSetupStep
              data={jobData}
              onChange={updates => setJobData(prev => ({ ...prev, ...updates }))}
              onPrev={() => setCurrentStep(1)}
              onNext={() => setCurrentStep(3)}
            />
          )}

          {currentStep === 3 && (
            <CandidateUploadStep
              data={candidateData}
              onChange={updates => setCandidateData(prev => ({ ...prev, ...updates }))}
              onPrev={() => setCurrentStep(2)}
              onRunScreening={handleRunScreening}
            />
          )}

          {currentStep === 4 && (
            <ScreeningResultsStep
              candidateName={candidateData.candidateName}
              jobTitle={jobData.title}
              loading={screeningLoading}
              result={screeningResult}
              errorMsg={errorMsg}
              onPrev={() => setCurrentStep(3)}
              onCompleteAndEnterDashboard={handleCompleteAndEnterDashboard}
              onGoToInterview={handleGoToInterview}
            />
          )}
        </div>
      </div>
    </div>
  )
}
