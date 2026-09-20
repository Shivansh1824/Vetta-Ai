# AI Context — Vetta AI

## Project Overview
**Vetta AI** is an intelligent candidate screening and interview co-pilot platform built for hackathon evaluation and technical recruiting teams.

- **Stack**: React 18 + Vite, TypeScript, Tailwind CSS v4, GSAP 3 animations, Supabase Database & Auth, Google Gemini API (Fn 1: Candidate Screening & Requirement Mapping, Fn 2: Adaptive Interview Cockpit).
- **Core Design System**: Moderate light theme with high-contrast slate surfaces, indigo-blue brand accents (`hsl(231,76%,52%)`), Plus Jakarta Sans typography, and GSAP micro-animations.

## Key Workflows
1. **Onboarding / Candidate Intake Flow** (`src/components/onboarding/OnboardingFlow.tsx`):
   - **Step 1: Role Configuration**: Confirms target job position, must-haves, and nice-to-haves.
   - **Step 2: Candidate Intake & File Upload**:
     - Includes **"✨ Load Sample Candidate Data"** option for immediate demo screening (Arjun Mehta - 94%, Marcus Vance - 76%, David Kim - 42%).
     - **Auto-Clear on Upload**: When a user uploads their own file or pastes custom text, sample data is automatically cleared and replaced with live candidate content.
   - **Step 3: AI Screening & Analysis**:
     - Runs live Gemini analysis (or offline intelligence fallback).
     - Renders Match Score, Tier (Tier 1 Top Match, Tier 2 Potential, Tier 3 Mismatch), requirement evidence citations, and validation flags.
     - Direct CTA links into the **Interview Cockpit** or **Pipeline Dashboard**.
2. **Supabase Database Seed**:
   - `supabase/seed_demo_data.sql`: Ready-to-execute SQL script populating 12 realistic candidates across all 3 tiers with full resumes, mapped requirements, validation flags, and interview questions for the *Senior Full-Stack & Distributed Systems Engineer* role.
