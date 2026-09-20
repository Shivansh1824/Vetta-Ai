# Vetta AI — Master Project Tracker & Integration Guide

> **Hackathon Track:** HireFlow — AI Candidate Screening & Interview Intelligence Agent  
> **Mission:** Build an AI-powered recruitment intelligence agent that streamlines candidate screening, provides an auditable evidence trail, and assists interviewers in real time with dynamic follow-up prompts.

---

## 1. End-to-End User Journey (The 8 Steps)

```
[Step 1: Recruiter Onboarding] ─────────► [Step 2: Job Role Creation]
          │                                           │
          ▼                                           ▼
[Step 3: Resume Ingestion]     ─────────► [Step 4: AI Screening & Ranking]
          │                                           │
          ▼                                           ▼
[Step 5: Evidence Inspector]   ─────────► [Step 6: Live Interview Cockpit]
          │                                           │
          ▼                                           ▼
[Step 7: Evaluation Report]    ─────────► [Step 8: Natural Language Search]
```

| Step | Screen / Module | User Action & System Response | Database / AI Action |
| :--- | :--- | :--- | :--- |
| **Step 1** | **Recruiter Onboarding** | Recruiter signs up or inputs Name, Role (e.g. Lead Technical Recruiter), and Company Name. | Inserts into `recruiters` table in Supabase. |
| **Step 2** | **Job Role Creation** | Recruiter inputs Job Title, Department, Seniority, Must-Haves, Nice-to-Haves, and full JD text. | Inserts into `jobs` table in Supabase. |
| **Step 3** | **Resume Ingestion** | Recruiter uploads single or batch resumes (PDF/DOCX/TXT) or selects a folder. | Ingests into `candidates` table and extracts raw text. |
| **Step 4** | **AI Screening & Tiers** | System analyzes resumes against JD, computes Match Score (0–100%), and groups candidates into Tier 1 (Match), Tier 2 (Needs Validation), and Tier 3 (Mismatch). | **Gemini 3.8 Flash** extracts skills & projects; saves to `candidate_requirements` & `validation_flags`. |
| **Step 5** | **Split-Screen Evidence Inspector** | Recruiter clicks a candidate. Left pane shows structured summary & red flags; right pane shows original resume with **click-to-highlight source citations**. | Reads from `candidate_requirements` & `validation_flags` with exact text offsets. |
| **Step 6** | **Live Interview Cockpit** | Recruiter conducts the interview. Tailored questions appear; as interviewer types notes, **adaptive follow-up questions** are suggested in real time. Live coverage meter tracks tested JD criteria. | Inserts/updates `interview_sessions` and `interview_questions`. |
| **Step 7** | **Standardized Evaluation Report** | 1-click generation of the final candidate scorecard (Strong Hire / Lean Hire / No Hire) with evidence-backed justification. | Saves to `evaluation_reports` table. |
| **Step 8** | **"Ask Vetta" NL Pool Search** | Recruiter queries talent pool in plain English (e.g., *"Show candidates with 5+ yrs Kafka who led teams"*). | Semantic filter & ranking across `candidates` table. |

---

## 2. Backend & Supabase Configuration Guide

### How to Apply the Schema in Supabase:
1. Open your [Supabase Dashboard](https://supabase.com/dashboard/project/tuguxuxhdmnxkpzjwjga).
2. Go to the **SQL Editor** from the left-hand menu.
3. Click **New Query**.
4. Open the generated file [`supabase/schema.sql`](file:///Users/shivanshrana/Desktop/Vetta%20Ai/supabase/schema.sql) in this project, copy the entire SQL script, paste it into the editor, and click **Run**.
5. All 8 tables, indexes, and Row Level Security (RLS) policies will be created instantly.

### Supabase Tables Created:
1. `public.recruiters` — Recruiter profile & onboarding data.
2. `public.jobs` — Job descriptions, requirements, and status.
3. `public.candidates` — Candidate profiles, match scores, tiers, and raw resumes.
4. `public.candidate_requirements` — Requirement-by-requirement evidence mapping.
5. `public.validation_flags` — Flagged inconsistencies, unverified claims, and gaps.
6. `public.interview_sessions` — Active interview sessions, notes, and coverage scores.
7. `public.interview_questions` — Personalized questions & live adaptive follow-ups.
8. `public.evaluation_reports` — Standardized final hiring decision scorecards.

---

## 3. Project Status & Roadmap Tracker

### Phase 1: Architecture, Security & Backend
- [x] Project Context & AI Rules setup (`ai-context.md`)
- [x] Architecture Specification (`README.md`)
- [x] Security Configuration: Environment credentials locked in `.env.local` & protected via `.gitignore`
- [x] Master Project Tracker & Integration Guide created (`TRACKER.md` & `tracker.html`)
- [x] Supabase SQL Schema defined & prepared (`supabase/schema.sql`)
- [x] **Supabase CLI Linked & Deployed**: All 8 tables, indexes, and RLS policies pushed live to `tuguxuxhdmnxkpzjwjga`!

### Phase 2: Frontend Scaffolding & Setup *(Next Chat)*
- [ ] Initialize Vite + React (TypeScript) + Tailwind CSS + Lucide Icons
- [ ] Configure Supabase Client (`src/lib/supabase.ts`)
- [ ] Define TypeScript interfaces (`src/types/index.ts`) matching Supabase schema

### Phase 3: Onboarding & Job Setup Views *(Next Chat)*
- [ ] Build **Step 1: Recruiter Onboarding Page** (Name, Role, Company)
- [ ] Build **Step 2: Job Creation Page** (Title, Must-Haves, Nice-to-Haves, JD Upload)
- [ ] Build **Step 3: Resume Ingestion Modal** (Single/Batch PDF Drag-and-Drop)

### Phase 4: Screening, Tiers & Evidence Inspector *(Next Chat)*
- [ ] Build **Step 4: AI Screening Dashboard** (Tiers 1/2/3, Match Scores, Candidate Cards)
- [ ] Build **Step 5: Split-Screen Evidence Inspector** (Click-to-highlight citations)

### Phase 5: Live Interview Cockpit & Scorecard *(Next Chat)*
- [ ] Build **Step 6: Live Interview Cockpit** (Question checklist, live note-taking, real-time follow-ups, coverage meter)
- [ ] Build **Step 7: Standardized Evaluation Report Modal** (Scorecard generation & export)
- [ ] Build **Step 8: "Ask Vetta" Natural Language Omnibar** (Talent pool search)

---

## 4. AI Engine Configuration
- **Primary Model:** `gemini-3.8-flash` (for fast structured JSON extraction & live interview follow-ups)
- **Fallback Model:** `gemini-3.6-flash` (for failover redundancy)
- **Built-in Offline Engine:** Deterministic pre-loaded mock profiles ensuring zero-latency presentation reliability in front of hackathon judges.
