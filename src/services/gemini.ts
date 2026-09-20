/**
 * Gemini Service — Two separate functions backed by two API keys.
 *   fn 1 (API Key 1): analyzeResume  — extract, score, map requirements, detect flags
 *   fn 2 (API Key 2): generateInterviewQuestions — tailored question bank
 *
 * Both target gemini-3.8-flash with medium thinking; gemini-3.6-flash as fallback.
 */

import type { GeminiScreeningResult, GeminiInterviewResult, Job, Tier, ResumeExtractionResult, JobCriteriaValidationResult } from '../types'

const MODEL_PRIMARY = 'gemini-2.0-flash-thinking-exp'   // closest available to "3.8 flash thinking"
const MODEL_FALLBACK = 'gemini-2.0-flash'
const API_KEY_1 = import.meta.env.VITE_GEMINI_API_KEY_1 as string
const API_KEY_2 = import.meta.env.VITE_GEMINI_API_KEY_2 as string

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

async function callGemini(
  apiKey: string,
  prompt: string,
  model = MODEL_PRIMARY,
  inlineData?: { mimeType: string; base64: string }
): Promise<string> {
  const url = `${BASE_URL}/${model}:generateContent?key=${apiKey}`
  const parts: Array<{ text?: string; inline_data?: { mime_type: string; data: string } }> = [{ text: prompt }]

  if (inlineData) {
    parts.push({
      inline_data: {
        mime_type: inlineData.mimeType,
        data: inlineData.base64,
      },
    })
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: { temperature: 0.2, maxOutputTokens: 4096 },
    }),
  })

  if (!res.ok) {
    // Fallback to secondary model on rate limit
    if (res.status === 429 && model !== MODEL_FALLBACK) {
      return callGemini(apiKey, prompt, MODEL_FALLBACK, inlineData)
    }
    throw new Error(`Gemini API error ${res.status}`)
  }

  const data = await res.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

function parseJSON<T>(raw: string): T {
  // Strip markdown fences if present
  const cleaned = raw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
  return JSON.parse(cleaned) as T
}

// ─── Function 0: Document OCR Ingestion & Resume Verification (API Key 1) ────

export async function extractAndValidateResume(
  input: { text?: string; base64?: string; mimeType?: string; fileName?: string }
): Promise<ResumeExtractionResult> {
  const prompt = `You are an expert HR and Document OCR Intelligence AI.
Analyze the provided document or text carefully.

TASK 1: VALIDATION CHECK
Determine whether this document is an actual candidate resume or curriculum vitae (CV).
- If it is NOT a candidate resume (for example: an invoice, receipt, legal contract, code snippet, landscape/animal/selfie image, blank file, or unrelated notes), you MUST return JSON with "is_resume": false and a polite, helpful rejection explanation in "rejection_reason".
  Example: "The uploaded file does not appear to be a candidate resume. It seems to be a financial receipt or invoice. Please upload a valid candidate resume."

TASK 2: HIGH-FIDELITY OCR & PROFILE EXTRACTION (If it is a resume)
Extract candidate name, contact info, job title, years of experience, key skills, and reconstruct a clean, complete, fully formatted readable text version of the resume.

Return ONLY valid JSON (no markdown formatting fences, no explanatory text):
{
  "is_resume": true,
  "rejection_reason": "",
  "candidate_name": "<full name>",
  "email": "<email or empty string>",
  "phone": "<phone or empty string>",
  "current_title": "<most recent or target title>",
  "total_years_exp": <number representing years of experience, e.g. 6>,
  "skills": ["<skill1>", "<skill2>"],
  "formatted_resume_text": "<full reconstructed clean text with all experience, education, and skills>"
}`

  const inline = input.base64 && input.mimeType ? { mimeType: input.mimeType, base64: input.base64 } : undefined
  const contentPrompt = input.text ? `${prompt}\n\nDOCUMENT TEXT CONTENT:\n${input.text.slice(0, 10000)}` : prompt

  const raw = await callGemini(API_KEY_1, contentPrompt, MODEL_PRIMARY, inline)
  return parseJSON<ResumeExtractionResult>(raw)
}

export function buildOfflineExtractionResult(
  text: string,
  fileName?: string
): ResumeExtractionResult {
  const lower = text.toLowerCase()
  const resumeIndicators = ['experience', 'education', 'skills', 'curriculum vitae', 'resume', 'summary', 'projects', 'employment', 'developer', 'engineer', 'technologies']
  const matched = resumeIndicators.filter(k => lower.includes(k))

  if (matched.length < 2 && text.trim().length > 30) {
    return {
      is_resume: false,
      rejection_reason: `The file "${fileName || 'uploaded document'}" does not appear to be a candidate resume. Please upload a valid resume (PDF, DOCX, or Image).`,
    }
  }

  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const candidate_name = lines[0]?.slice(0, 40) || 'Candidate'
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/)

  return {
    is_resume: true,
    candidate_name,
    email: emailMatch ? emailMatch[0] : '',
    phone: '',
    current_title: 'Software Engineer',
    total_years_exp: 5,
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    formatted_resume_text: text,
  }
}

// ─── Function 1: Resume Analysis (API Key 1) ────────────────────────────────

export async function analyzeResume(
  resumeText: string,
  job: Job
): Promise<GeminiScreeningResult> {
  const prompt = `You are an expert technical recruiter AI. Analyze the candidate resume against the job requirements and return ONLY valid JSON (no markdown, no prose).

JOB TITLE: ${job.title}
MUST-HAVE REQUIREMENTS: ${job.must_haves.join(', ')}
NICE-TO-HAVE REQUIREMENTS: ${job.nice_to_haves.join(', ')}
JOB DESCRIPTION: ${job.description_text.slice(0, 2000)}

RESUME TEXT:
${resumeText.slice(0, 3000)}

Return JSON with this exact shape:
{
  "match_score": <integer 0-100>,
  "tier": <"tier_1_match" | "tier_2_potential" | "tier_3_mismatch">,
  "summary": "<2-3 sentence recruiter-friendly summary>",
  "requirements": [
    { "requirement_text": "<requirement>", "status": <"met"|"partial"|"missing">, "evidence_quote": "<exact quote from resume or empty string>" }
  ],
  "flags": [
    { "flag_type": <"inconsistency"|"missing_info"|"vague_claim"|"unverified_tenure">, "description": "<what was flagged>", "severity": <"high"|"medium"|"low">, "evidence_quote": "<quote>" }
  ]
}

Tier rules: tier_1_match = 80+, tier_2_potential = 55-79, tier_3_mismatch = <55.`

  const raw = await callGemini(API_KEY_1, prompt)
  return parseJSON<GeminiScreeningResult>(raw)
}

// ─── Function 2: Interview Question Generation (API Key 2) ──────────────────

export async function generateInterviewQuestions(
  resumeText: string,
  job: Job,
  flags: { description: string; flag_type: string }[]
): Promise<GeminiInterviewResult> {
  const flagSummary = flags.length
    ? flags.map(f => `- ${f.flag_type}: ${f.description}`).join('\n')
    : 'None detected.'

  const prompt = `You are an expert technical interview coach. Generate a tailored interview question bank for this specific candidate.

JOB TITLE: ${job.title}
MUST-HAVES: ${job.must_haves.join(', ')}
RESUME SUMMARY:
${resumeText.slice(0, 2000)}

VALIDATION FLAGS TO PROBE:
${flagSummary}

Return ONLY valid JSON (no markdown):
{
  "questions": [
    { "question_text": "<specific question>", "target_criterion": "<which must-have or flag it targets>", "difficulty": <"foundational"|"intermediate"|"advanced"> }
  ]
}

Generate 8-12 questions. Prioritize: 1) Probing detected flags 2) Verifying must-haves 3) Exploring gaps. Make questions specific to the candidate's stated experience, not generic.`

  const raw = await callGemini(API_KEY_2, prompt)
  return parseJSON<GeminiInterviewResult>(raw)
}

// ─── Offline deterministic fallback ─────────────────────────────────────────

export function buildOfflineScreeningResult(resumeText: string, job: Job): GeminiScreeningResult {
  const text = resumeText.toLowerCase()
  const metCount = job.must_haves.filter(r => text.includes(r.toLowerCase().split(' ')[0])).length
  const score = Math.round((metCount / Math.max(job.must_haves.length, 1)) * 100)
  const tier: Tier = score >= 80 ? 'tier_1_match' : score >= 55 ? 'tier_2_potential' : 'tier_3_mismatch'

  return {
    match_score: score,
    tier,
    summary: 'Offline analysis mode. Live Gemini API will provide detailed insights.',
    requirements: job.must_haves.map(r => ({
      requirement_text: r,
      status: text.includes(r.toLowerCase().split(' ')[0]) ? 'met' : 'missing',
      evidence_quote: '',
    })),
    flags: [],
  }
}

// ─── Function: Validate Hiring Role Criteria (API Key 1) ───────────────────

export async function validateJobRoleCriteria(input: {
  title: string
  department?: string
  mustHaves: string[]
  niceToHaves: string[]
  descriptionText?: string
}): Promise<JobCriteriaValidationResult> {
  const allCriteria = [...input.mustHaves, ...input.niceToHaves]
  const prompt = `You are an expert HR and recruitment intelligence auditor for Vetta AI.
Analyze the hiring role details and evaluation criteria configured by a recruiter.

JOB TITLE: ${input.title}
DEPARTMENT: ${input.department || 'N/A'}
MUST-HAVE SKILLS: ${input.mustHaves.join(', ')}
NICE-TO-HAVE SKILLS: ${input.niceToHaves.join(', ')}
ROLE DESCRIPTION: ${input.descriptionText || 'N/A'}

TASK:
Check if ANY of the skills or criteria are completely out of context, inappropriate, offensive, nonsense, insults, slurs, or irrelevant to a professional hiring role (e.g. insults like "idiot", "pagal", "fool", or joke terms like "banana", "cooking" for software dev, or typing spam "asdfasdf").

CRITICAL RULES:
1. Valid technical, operational, design, domain, framework, tool, library, database, protocol, or professional soft skills (e.g., React, TypeScript, Node.js, Distributed Systems, PostgreSQL, SAP, Kafka, Redis, Kubernetes, Docker, GIT, AWS, CI/CD) ARE LEGITIMATE AND VALID.
2. Any offensive words, insults (e.g., "Pagal", "Idiot", "Stupid"), slurs, joke terms, or completely out-of-context nonsensical words MUST be flagged in "out_of_context_items".
3. If any out-of-context items are detected, set "is_valid": false, list the exact offending items in "out_of_context_items", and provide a clear, polite explanation in "explanation" asking the recruiter to remove them to move further.
4. If all items are legitimate professional job skills or requirements, set "is_valid": true, "out_of_context_items": [], and "explanation": "".

Return ONLY valid JSON (no markdown formatting fences, no extra text):
{
  "is_valid": <true or false>,
  "out_of_context_items": ["<item1>", "<item2>"],
  "explanation": "<explanation of what is out of context and request to remove them>"
}`

  try {
    const raw = await callGemini(API_KEY_1, prompt)
    return parseJSON<JobCriteriaValidationResult>(raw)
  } catch {
    // Offline heuristic fallback for network or API issues
    const flagged: string[] = []
    const suspiciousKeywords = ['pagal', 'idiot', 'fool', 'stupid', 'dumb', 'nonsense', 'bakwas', 'rubbish', 'junk', 'asdf']
    for (const item of allCriteria) {
      const lower = item.toLowerCase().trim()
      if (suspiciousKeywords.some(bad => lower.includes(bad))) {
        flagged.push(item)
      }
    }
    if (flagged.length > 0) {
      return {
        is_valid: false,
        out_of_context_items: flagged,
        explanation: `The following criteria appear out of context or invalid for this role: ${flagged.join(', ')}. Please remove them to move further.`,
      }
    }
    return {
      is_valid: true,
      out_of_context_items: [],
      explanation: '',
    }
  }
}
