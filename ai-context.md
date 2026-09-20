# AI Context — Vetta AI

## Project Overview
**Vetta AI** is an intelligent candidate screening and interview co-pilot platform built for hackathon evaluation and technical recruiting teams.

- **Stack**: React 18 + Vite, TypeScript, Tailwind CSS v4, GSAP 3 animations, Supabase Database & Auth, Google Gemini API (Fn 1: Candidate Screening & Requirement Mapping, Fn 2: Adaptive Interview Cockpit).
- **Core Design System**: Modern slate surfaces, indigo-blue brand accents (`hsl(231,76%,52%)`), Plus Jakarta Sans typography, and GSAP micro-animations.

---

## The 7 Evaluation Protocol Stages & Status

| Stage # | Stage Name | Status | Key Deliverables & Implementation |
| :--- | :--- | :--- | :--- |
| **Stage 1** | **Recruiter & Org Intake** | ✅ **Completed (100%)** | Recruiter name, company name, department, role title. Persisted to Supabase `recruiters` table. |
| **Stage 2** | **Job Criteria Configuration** | ✅ **Completed (100%)** | Must-haves and nice-to-haves intake. AI semantic validation (`validateJobRoleCriteria`) blocks offensive or out-of-context criteria. |
| **Stage 3** | **Candidate Intake & OCR** | ✅ **Completed (100%)** | Multi-format resume intake (PDF, image, docx, txt) powered by Gemini Flash OCR (`extractAndValidateResume`), editable form, A+ JSON viewer, and auto-save to `candidates` table. |
| **Stage 4** | **A+ Positive AI Screening** | ✅ **Completed (100%)** | High-fidelity screening (`screenCandidateWithAI` / `analyzeResume`) with positive tone, verbatim evidence quotes, standout strengths highlights, and relational sync to `candidate_requirements`. |
| **Stage 5** | **Validation Flags & Audit Trail** | ✅ **Completed (100%)** | Detects unverified claims, tenure gaps, and ambiguities with severity ratings and constructive interview probing advice in `validation_flags`. |
| **Stage 6** | **Clustering & Multi-Tier Pipeline**| ✅ **Completed (100%)** | Tier 1 (Match 80%+), Tier 2 (Review 55-79%), Tier 3 (Mismatch <55%) pipeline clustering, HUD score meters, and dashboard filters. |
| **Stage 7** | **Interview Cockpit & Reports** | ✅ **Completed (100%)** | Dynamic question generator based on candidate background (`generateInterviewQuestions`), live scratchpad with real-time follow-ups, coverage meter, and 1-click evaluation scorecard memo export. |

---

## AI Screening Function Specification (`src/services/gemini.ts`)
- **Primary Function**: `screenCandidateWithAI(resumeText: string, job: Job): Promise<GeminiScreeningResult>` (aliased to `analyzeResume`).
- **Tone**: Positive, constructive, and celebrating authentic engineering achievements. Missing criteria are framed as technical interview validation topics.
- **Precision**: Extracts verbatim quotes (`evidence_quote`) from the candidate resume for every Must-Have and Nice-to-Have requirement.
- **Standout Strengths**: Outputs 2-4 positive key strengths.
- **Minimal Output**: Pure structured JSON adhering to `response_mime_type: 'application/json'`.
