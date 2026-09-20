# Vetta AI — AI Candidate Screening & Interview Intelligence Agent

> **Hackathon Track:** HireFlow — AI Candidate Screening & Interview Intelligence Agent  
> **Core Philosophy:** Reduce repetitive recruitment work while keeping human hiring decisions at the center of the process through verifiable, citation-backed intelligence.

---

## 1. System Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                                     VETTA AI                                      |
+-----------------------------------------------------------------------------------+
                                          |
         +--------------------------------+--------------------------------+
         |                                                                 |
         v                                                                 v
+--------------------------+                                 +--------------------------+
|      INGESTION LAYER     |                                 |   INTELLIGENCE ENGINE    |
| - Job Description (JD)   |                                 | - Dual-Mode Engine:      |
| - Resumes (PDF / Text)   |                                 |   * Built-in Deterministic|
| - Client-side Text Parser|                                 |   * Live Gemini / OpenAI |
+--------------------------+                                 +--------------------------+
         |                                                                 |
         +--------------------------------+--------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                              CORE PROCESSING PIPELINE                             |
|  1. Skill & Experience Extraction                                                 |
|  2. Requirement Mapping (Must-Have vs. Nice-to-Have)                              |
|  3. Inconsistency & Validation Flag Detection                                     |
|  4. Candidate Tier Clustering (Tier 1: Match | Tier 2: Review | Tier 3: Gap)       |
+-----------------------------------------------------------------------------------+
                                          |
         +--------------------------------+--------------------------------+
         |                                                                 |
         v                                                                 v
+--------------------------+                                 +--------------------------+
|  AUDIT TRAIL & GROUNDING |                                 |  INTERVIEW INTELLIGENCE  |
| - Split-screen inspector |                                 | - Tailored question bank |
| - Click-to-highlight     |                                 | - Real-time follow-ups   |
| - Verifiable citations   |                                 | - Live coverage meter    |
+--------------------------+                                 +--------------------------+
                                          |
         +--------------------------------+--------------------------------+
                                          |
                                          v
+-----------------------------------------------------------------------------------+
|                           OUTPUT & DISCOVERY INTERFACES                           |
|  - Standardized Candidate Scorecard & Evaluation Report                           |
|  - "Ask Vetta" Natural Language Candidate Pool Omnibar                            |
+-----------------------------------------------------------------------------------+
```

---

## 2. Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend Framework** | **Vite + React (TypeScript)** | Extremely fast development cycle, zero bundle bloat, robust type safety. |
| **Styling & Design** | **Tailwind CSS + Lucide Icons** | Modern, responsive dark-mode UI with glassmorphism and clear visual hierarchy. |
| **AI Intelligence** | **Dual Mode (Offline + Live LLM)** | • **Offline Engine:** Instant zero-latency hackathon demo with zero risk of API limits.<br>• **Live LLM:** Gemini 2.5 Flash / OpenAI for dynamic live document analysis. |
| **Document Processing** | **Client-side PDF & Text Parser** | Extracts raw text directly in browser without requiring external storage backends. |
| **State Management** | **React State + LocalStorage** | Maintains session persistence across candidate profiles, notes, and evaluations. |

---

## 3. Step-by-Step Architecture Pipeline

### Step 1: Ingestion & Extraction
- Recruiter inputs a Job Description and uploads resumes (PDF/TXT).
- The extraction engine extracts:
  - Technical & soft skills
  - Years of relevant experience
  - Key projects & impact metrics
  - Education & certifications

### Step 2: Requirement Mapping & Validation Flags
- Candidate credentials are cross-referenced against JD requirements.
- The engine calculates a match index and flags anomalies:
  - **Overstated tenure / Inconsistencies** (e.g., claiming 7 years in a tech that has existed for 4).
  - **Vague claims** (e.g., "Led team" without size or outcome).
  - **Missing critical requirements** (e.g., missing distributed systems experience).

### Step 3: Candidate Grouping & Tiers
Candidates are grouped into actionable clusters:
- **Tier 1 (Strong Match):** Meets all must-haves, proven track record, high confidence.
- **Tier 2 (Potential with Gaps / Needs Validation):** Strong fundamentals with specific unverified claims or minor gaps.
- **Tier 3 (Mismatched / Unqualified):** Significant skill gaps or role misalignment.

### Step 4: Split-Screen Evidence Inspector (Grounding & Audit Trail)
- Every insight, score, and red flag is linked to an exact quote.
- Clicking an insight highlights the exact sentence in the candidate's resume or interview notes, ensuring zero ungrounded AI hallucinations.

### Step 5: Live Interview Cockpit
- **Role-Specific Questions:** Dynamically generated based on the candidate's specific background and flagged risk areas.
- **Live Scratchpad & Follow-Up Prompts:** As the interviewer types notes, Vetta AI analyzes answers in real time and suggests targeted follow-up questions.
- **Coverage Heatmap:** Live meter showing which JD criteria have been validated vs. left untested.

### Step 6: Standardized Evaluation & Talent Discovery
- **Scorecard Report:** Generates a structured hiring decision memo with evidence citations.
- **"Ask Vetta" Omnibar:** Natural language query interface allowing recruiters to query the entire candidate database (e.g., *"Show candidates with Kafka experience who led a team"*).

---

## 4. Step-by-Step Build Roadmap

- [ ] **Phase 1: Foundation & Project Scaffolding**
  - Initialize Vite + React (TypeScript) + Tailwind CSS.
  - Establish data models (`types/index.ts`) and preloaded realistic candidate dataset (`data/mockData.ts`).
- [ ] **Phase 2: Recruiter Dashboard & Candidate Grouping**
  - Build the main pipeline view, role selector, and candidate tier cards (Tier 1, 2, 3).
- [ ] **Phase 3: Split-Screen Evidence Inspector (Audit Trail)**
  - Implement the two-pane view with click-to-highlight source citations.
- [ ] **Phase 4: Live Interview Cockpit**
  - Implement dynamic interview questions, real-time note-taking, follow-up suggestions, and coverage meter.
- [ ] **Phase 5: "Ask Vetta" Natural Language Query & Final Polish**
  - Build the talent pool omnibar, evaluation report modal, and hackathon presentation polish.
