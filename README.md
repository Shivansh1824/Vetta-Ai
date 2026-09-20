# Vetta AI — AI Candidate Screening & Interview Intelligence Agent

[![Live Deployment](https://img.shields.io/badge/Live_Demo-Vercel-6366f1?style=for-the-badge&logo=vercel)](https://vettaai-seven.vercel.app)
[![Protocol Status](https://img.shields.io/badge/7--Stage_Protocol-100%25_Complete-10b981?style=for-the-badge)](https://vettaai-seven.vercel.app/tracker.html)
[![Database](https://img.shields.io/badge/Supabase-Live_Ledger-3ecf8e?style=for-the-badge&logo=supabase)](https://supabase.com)
[![AI Engine](https://img.shields.io/badge/Google_Gemini-Flash_Multi--Model-4285f4?style=for-the-badge&logo=google)](https://ai.google.dev)

> **HireFlow Track:** AI Candidate Screening & Interview Intelligence Agent  
> **Core Philosophy:** Accelerate technical recruiting while eliminating ungrounded AI hallucinations through **verbatim resume citation grounding**, **constructive candidate synthesis**, and **real-time adaptive interview intelligence**.

---

## 1. System Architecture

```
+-----------------------------------------------------------------------------------+
|                                     VETTA AI                                      |
+-----------------------------------------------------------------------------------+
                                          │
         ┌────────────────────────────────┴────────────────────────────────┐
         ▼                                                                 ▼
┌──────────────────────────┐                                 ┌──────────────────────────┐
│     INGESTION LAYER      │                                 │   INTELLIGENCE ENGINE    │
│ • Job Description (JD)   │                                 │ • Dual Gemini Flash Keys │
│ • PDF / Image / Text OCR │                                 │ • Multi-model Fallback:  │
│ • Structured JSON Parser │                                 │   gemini-3.5/3.6/3.8     │
└──────────────────────────┘                                 └──────────────────────────┘
         │                                                                 │
         └────────────────────────────────┬────────────────────────────────┘
                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                             CORE PROCESSING PIPELINE                              │
│  Stage 1: Recruiter Profile & Multi-Tenant Workspace Setup                        │
│  Stage 2: Job Role Criteria Intake & AI Semantic Guardrails                       │
│  Stage 3: Multi-Format Candidate Ingestion & Flash OCR Profile Extraction         │
│  Stage 4: Positive A+ AI Screening with Verbatim Requirement Citation Mapping     │
│  Stage 5: Validation Flags & Anomaly Detection (Low/Medium/High Severity)         │
│  Stage 6: Multi-Tier Clustering (Tier 1: Top Match | Tier 2: Review | Tier 3: Gap)│
└───────────────────────────────────────────────────────────────────────────────────┘
                                          │
         ┌────────────────────────────────┴────────────────────────────────┐
         ▼                                                                 ▼
┌──────────────────────────┐                                 ┌──────────────────────────┐
│  AUDIT TRAIL & GROUNDING │                                 │  INTERVIEW INTELLIGENCE  │
│ • Verbatim quote ledger  │                                 │ • Stage 7 Live Cockpit   │
│ • Relational DB sync     │                                 │ • Tailored question bank │
│ • Zero AI hallucination  │                                 │ • Real-time follow-ups   │
└──────────────────────────┘                                 └──────────────────────────┘
                                          │
                                          ▼
┌───────────────────────────────────────────────────────────────────────────────────┐
│                               OUTPUT DELIVERABLES                                 │
│  • 1-Click Standardized Evaluation Scorecard Memo (Strong Hire / Lean Hire)       │
│  • Interactive Visual Pipeline Tracker (`tracker.html`)                           │
│  • Central Recruiter Pipeline Dashboard                                           │
+───────────────────────────────────────────────────────────────────────────────────+
```

---

## 2. The 7 Protocol Stages

| Stage | Name | Description | Deliverable |
| :---: | :--- | :--- | :--- |
| **01** | **Recruiter Profile** | Captures recruiter identity and workspace context. | Multi-tenant isolation in Supabase `recruiters` table. |
| **02** | **Job Role Criteria** | Must-Have and Nice-to-Have technical skill specification. | Semantic guardrails (`validateJobRoleCriteria`) block out-of-context terms. |
| **03** | **Candidate Intake** | PDF, image, and text ingestion powered by Gemini Flash OCR. | Editable form + A+ structured JSON schema viewer with 1-click copy. |
| **04** | **AI Screening** | Positive, constructive candidate evaluation. | Verbatim quotes (`evidence_quote`) for every requirement + Standout Strengths. |
| **05** | **Validation Flags** | Probes unverified claims and tenure ambiguities. | Actionable interview follow-up guidance in `validation_flags` table. |
| **06** | **Pipeline Tiers** | Clusters candidate pool into actionable cohorts. | Tier 1 (Match 80%+), Tier 2 (Review 55-79%), Tier 3 (Mismatch <55%). |
| **07** | **Interview Cockpit** | Live interviewer co-pilot and final recommendation. | Tailored question bank, live scratchpad with adaptive follow-ups, and printable **STRONG HIRE** memo. |

---

## 3. Technology Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS v4, Lucide Icons.
- **Animations:** GreenSock Animation Platform (GSAP 3) for scanning telemetry and micro-interactions.
- **AI Intelligence:** Google Gemini API (`gemini-3.5-flash`, `gemini-3.6-flash`, `gemini-3.8-flash`) with dual-key resilience and fallback chains.
- **Database & Auth:** Supabase PostgreSQL with 8 relational tables, Row-Level Security (RLS), and real-time session persistence.
- **Deployment:** Vercel edge network with single-page routing rewrite rules (`vercel.json`).

---

## 4. Local Development & Quickstart

```bash
# 1. Clone repository
git clone https://github.com/Shivansh1824/Vetta-Ai.git
cd Vetta-Ai

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Production build
npm run build
```

### Pre-configured Evaluator Access
- **URL:** [vettaai-seven.vercel.app](https://vettaai-seven.vercel.app)
- **Work Email:** `demo.recruiter@vetta.ai`
- **Password:** `VettaDemo2026!` (or 1-click **Auto-Fill**)
- **Visual Tracker:** [vettaai-seven.vercel.app/tracker.html](https://vettaai-seven.vercel.app/tracker.html)
