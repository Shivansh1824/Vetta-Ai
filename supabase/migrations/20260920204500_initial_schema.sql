-- ==============================================================================
-- VETTA AI — SUPABASE DATABASE SCHEMA
-- Hackathon Track: HireFlow (AI Candidate Screening & Interview Intelligence Agent)
-- ==============================================================================

-- 1. RECRUITERS TABLE (Step 1: Recruiter Onboarding)
CREATE TABLE IF NOT EXISTS public.recruiters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    email TEXT,
    role_title TEXT NOT NULL, -- e.g. 'Lead Technical Recruiter', 'Hiring Manager'
    company_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. JOBS TABLE (Step 2: Job Role Creation)
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID REFERENCES public.recruiters(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    department TEXT,
    experience_level TEXT, -- 'Senior', 'Mid-Level', 'Lead', 'Staff'
    must_haves TEXT[] NOT NULL DEFAULT '{}',
    nice_to_haves TEXT[] NOT NULL DEFAULT '{}',
    description_text TEXT NOT NULL,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. CANDIDATES TABLE (Step 3 & 4: Resume Ingestion & AI Screening)
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    current_title TEXT,
    total_years_exp NUMERIC,
    resume_text TEXT NOT NULL,
    resume_url TEXT,
    match_score INTEGER DEFAULT 0, -- 0 to 100
    tier TEXT CHECK (tier IN ('tier_1_match', 'tier_2_potential', 'tier_3_mismatch')) DEFAULT 'tier_2_potential',
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. CANDIDATE REQUIREMENTS MAPPING (Requirement #3: Map candidate experience against JD)
CREATE TABLE IF NOT EXISTS public.candidate_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    requirement_text TEXT NOT NULL,
    status TEXT CHECK (status IN ('met', 'partial', 'missing')) DEFAULT 'partial',
    evidence_quote TEXT, -- Exact quote from resume
    page_number INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. VALIDATION FLAGS (Requirement #4: Inconsistencies, missing info & vague claims)
CREATE TABLE IF NOT EXISTS public.validation_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    flag_type TEXT CHECK (flag_type IN ('inconsistency', 'missing_info', 'vague_claim', 'unverified_tenure')) NOT NULL,
    description TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('high', 'medium', 'low')) DEFAULT 'medium',
    evidence_quote TEXT,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. INTERVIEW SESSIONS (Step 6: Live Interview Cockpit)
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    interviewer_notes TEXT DEFAULT '',
    coverage_score INTEGER DEFAULT 0, -- 0 to 100 (% of JD requirements tested)
    status TEXT CHECK (status IN ('draft', 'in_progress', 'completed')) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 7. INTERVIEW QUESTIONS (Requirements #7 & #8: Tailored questions & adaptive follow-ups)
CREATE TABLE IF NOT EXISTS public.interview_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    target_criterion TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('foundational', 'intermediate', 'advanced')) DEFAULT 'intermediate',
    candidate_response TEXT,
    suggested_followups JSONB DEFAULT '[]'::jsonb, -- Array of real-time generated follow-up prompts
    is_answered BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. EVALUATION REPORTS (Requirement #11: Standardized interview evaluation report)
CREATE TABLE IF NOT EXISTS public.evaluation_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES public.candidates(id) ON DELETE CASCADE,
    overall_rating TEXT CHECK (overall_rating IN ('strong_hire', 'hire', 'lean_hire', 'lean_no_hire', 'no_hire')) DEFAULT 'lean_hire',
    executive_summary TEXT NOT NULL,
    strengths TEXT[] DEFAULT '{}',
    areas_of_concern TEXT[] DEFAULT '{}',
    audit_trail_citations JSONB DEFAULT '[]'::jsonb, -- Verifiable quotes & document references
    created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter_id ON public.jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_candidates_job_id ON public.candidates(job_id);
CREATE INDEX IF NOT EXISTS idx_candidates_tier ON public.candidates(tier);
CREATE INDEX IF NOT EXISTS idx_candidate_reqs_candidate_id ON public.candidate_requirements(candidate_id);
CREATE INDEX IF NOT EXISTS idx_validation_flags_candidate_id ON public.validation_flags(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_candidate_id ON public.interview_sessions(candidate_id);
CREATE INDEX IF NOT EXISTS idx_interview_questions_session_id ON public.interview_questions(session_id);
CREATE INDEX IF NOT EXISTS idx_evaluation_reports_candidate_id ON public.evaluation_reports(candidate_id);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enables open access for anon & authenticated roles during hackathon prototyping
-- ==============================================================================
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.validation_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluation_reports ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for rapid hackathon testing
DO $$
DECLARE
    tbl text;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Allow all for anon on %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Allow all for anon on %I" ON public.%I FOR ALL TO anon USING (true) WITH CHECK (true)', tbl, tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Allow all for authenticated on %I" ON public.%I', tbl, tbl);
        EXECUTE format('CREATE POLICY "Allow all for authenticated on %I" ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)', tbl, tbl);
    END LOOP;
END $$;
