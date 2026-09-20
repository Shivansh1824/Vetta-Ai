# Vetta AI — Project Context & Hackathon Architecture

## Project Overview
**Name:** Vetta AI  
**Hackathon Problem Statement:** HireFlow: AI Candidate Screening & Interview Intelligence Agent  
**Mission:** Build an AI-powered recruitment intelligence agent that helps hiring teams organize and evaluate candidate information while keeping human hiring decisions at the center of the process.

## Architecture & Technology Stack
- **Framework:** Vite + React (TypeScript)
- **Styling:** Tailwind CSS + Lucide Icons + Custom Glassmorphic Dark/Light Modern UI
- **AI Processing:** Dual Mode:
  1. Built-in Deterministic & Preloaded Intelligence Engine (instant offline zero-latency demo for judges)
  2. Live Gemini 2.5 Flash / OpenAI API Client (for real-time resume parsing & dynamic extraction)
- **Document Ingestion:** Client-side PDF text extraction & structured JD requirement parsing
- **Data Persistence:** LocalStorage + In-Memory State for fast live interaction during hackathon presentations

## Core Feature Modules
1. **JD & Batch Resume Ingestion:** Upload or paste job descriptions and drag-and-drop candidate resumes (PDF/DOCX/Text).
2. **Structured Information Extraction:** Extract skills, years of experience, key projects, degrees, and career milestones.
3. **Requirement Mapping & Gap Analysis:** Automatic cross-matching of candidate credentials against JD requirements (Must-Have vs. Nice-to-Have).
4. **Validation Flags & Inconsistency Detection:** Highlights unverified claims, employment gaps, or vague tech stack mentions that require interview scrutiny.
5. **Candidate Tiering & Clustering:** Dynamic grouping into Top Matches (Tier 1), High Potential with Gaps (Tier 2), and Unqualified/Pivot (Tier 3).
6. **Executive Candidate Summaries:** Concise, recruiter-friendly briefings with pros, cons, and interview focal points.
7. **Personalized Role-Specific Interview Questions:** Tailored question bank targeting the candidate's exact background and detected risks.
8. **Interactive Live Interview Cockpit:** Note-taking scratchpad that triggers real-time follow-up question suggestions as the interviewer types.
9. **Requirement Coverage Heatmap:** Real-time meter showing which JD requirements have been evaluated vs. unanswered.
10. **Standardized Evaluation Scorecard:** 1-click generation of structured hiring recommendation reports with evidence links.
11. **Natural Language Candidate Pool Query ("Ask Vetta"):** Omnibar allowing conversational queries across all candidates with ranked grounded cards.
12. **Explainability & Split-Screen Source Audit Trail:** Every AI insight, badge, or flag links directly to the exact source quote in the resume or interview notes.

## Coding Conventions
- Strictly adhere to global AI coding guidelines: simplicity first, surgical changes, modular components under 600 lines.
- Premium aesthetics: sleek dark mode with modern typography, smooth transitions, clear information hierarchy, and intuitive recruiter workflows.
