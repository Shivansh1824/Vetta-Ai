// Types mapped 1-to-1 to Supabase schema

export type Tier = 'tier_1_match' | 'tier_2_potential' | 'tier_3_mismatch'
export type RequirementStatus = 'met' | 'partial' | 'missing'
export type FlagType = 'inconsistency' | 'missing_info' | 'vague_claim' | 'unverified_tenure'
export type FlagSeverity = 'high' | 'medium' | 'low'
export type SessionStatus = 'draft' | 'in_progress' | 'completed'
export type QuestionDifficulty = 'foundational' | 'intermediate' | 'advanced'
export type OverallRating = 'strong_hire' | 'hire' | 'lean_hire' | 'lean_no_hire' | 'no_hire'

export interface Recruiter {
  id: string
  full_name: string
  email: string | null
  role_title: string
  company_name: string
  created_at: string
}

export interface Job {
  id: string
  recruiter_id: string | null
  title: string
  department: string | null
  experience_level: string | null
  must_haves: string[]
  nice_to_haves: string[]
  description_text: string
  status: string
  created_at: string
}

export interface Candidate {
  id: string
  job_id: string | null
  name: string
  email: string | null
  phone: string | null
  current_title: string | null
  total_years_exp: number | null
  resume_text: string
  resume_url: string | null
  match_score: number
  tier: Tier
  summary: string | null
  created_at: string
}

export interface CandidateRequirement {
  id: string
  candidate_id: string
  requirement_text: string
  status: RequirementStatus
  evidence_quote: string | null
  page_number: number
  created_at: string
}

export interface ValidationFlag {
  id: string
  candidate_id: string
  flag_type: FlagType
  description: string
  severity: FlagSeverity
  evidence_quote: string | null
  created_at: string
}

export interface InterviewSession {
  id: string
  candidate_id: string
  interviewer_notes: string
  coverage_score: number
  status: SessionStatus
  created_at: string
  updated_at: string
}

export interface InterviewQuestion {
  id: string
  session_id: string
  candidate_id: string
  question_text: string
  target_criterion: string
  difficulty: QuestionDifficulty
  candidate_response: string | null
  suggested_followups: string[]
  is_answered: boolean
  created_at: string
}

export interface EvaluationReport {
  id: string
  session_id: string
  candidate_id: string
  overall_rating: OverallRating
  executive_summary: string
  strengths: string[]
  areas_of_concern: string[]
  audit_trail_citations: { quote: string; source: string; criterion: string }[]
  created_at: string
}

// Gemini service response shapes
export interface GeminiScreeningResult {
  match_score: number
  tier: Tier
  summary: string
  strengths?: string[]
  requirements: { requirement_text: string; status: RequirementStatus; evidence_quote: string }[]
  flags: { flag_type: FlagType; description: string; severity: FlagSeverity; evidence_quote: string }[]
}

export interface GeminiInterviewResult {
  questions: { question_text: string; target_criterion: string; difficulty: QuestionDifficulty }[]
}

export interface ResumeExtractionResult {
  is_resume: boolean
  rejection_reason?: string
  candidate_name?: string
  email?: string
  phone?: string
  location?: string
  current_title?: string
  total_years_exp?: number
  skills?: string[]
  summary?: string
  experience?: Array<{
    company: string
    role: string
    duration: string
    highlights: string[]
  }>
  education?: Array<{
    institution: string
    degree: string
    year: string
  }>
  formatted_resume_text?: string
  raw_json?: Record<string, any>
}

export interface JobCriteriaValidationResult {
  is_valid: boolean
  out_of_context_items: string[]
  explanation: string
}
