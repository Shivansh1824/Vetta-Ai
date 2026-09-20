// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// We map the user's requested 3.x names to actual Google endpoints

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resumeText, job } = await req.json()

    // Step 2: Use secondary API key for this function (Key 2) to prevent rate limits
    let apiKey = Deno.env.get('GEMINI_API_KEY_2') || Deno.env.get('VITE_GEMINI_API_KEY_2')
    let fallbackKey = Deno.env.get('GEMINI_API_KEY_1') || Deno.env.get('VITE_GEMINI_API_KEY_1')

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY_2 is not set")
    }

    const prompt = `You are an elite Talent Intelligence AI screening evaluator for Vetta AI.
Perform an A+ Grade, thorough, objective, and positively-framed evaluation of the candidate against the role requirements.

ROLE: ${job.title}
MUST-HAVES: ${job.must_haves.join(', ')}
NICE-TO-HAVES: ${job.nice_to_haves.join(', ')}
JOB CONTEXT: ${job.description_text.slice(0, 2000)}

CANDIDATE RESUME:
${resumeText.slice(0, 4000)}

EVALUATION PRINCIPLES:
1. POSITIVE & CONSTRUCTIVE PERSPECTIVE:
   - Highlight genuine achievements, leadership, and transferable technical mastery.
   - For missing or partial requirements, maintain a constructive stance; frame them as productive technical interview validation topics rather than punitive flaws.
2. A+ GRADE PRECISION:
   - Systematically map EVERY Must-Have and Nice-to-Have requirement.
   - For each requirement, supply an exact verbatim citation ('evidence_quote') from the candidate resume.
   - Compute an authentic, calibrated match_score (0-100):
     * tier_1_match (80-100): Strong match, meets core requirements with proven achievements.
     * tier_2_potential (55-79): Potential candidate with solid fundamentals; key areas to validate in interview.
     * tier_3_mismatch (<55): Role or experience mismatch; acknowledge transferable background constructively.
   - Provide 2-4 standout positive key strengths.
   - Identify constructive validation flags with actionable interview follow-up guidance.
3. MINIMAL & CONCISE OUTPUT:
   - Return strictly valid JSON matching the schema below. No conversational chatter, no markdown wrappers.

JSON SCHEMA:
{
  "match_score": <integer 0-100>,
  "tier": "tier_1_match" | "tier_2_potential" | "tier_3_mismatch",
  "summary": "<Positive, 2-3 sentence executive synthesis for recruiters highlighting core strengths and overall fit>",
  "strengths": ["<Positive standout highlight 1>", "<Positive standout highlight 2>"],
  "requirements": [
    {
      "requirement_text": "<Requirement>",
      "status": "met" | "partial" | "missing",
      "evidence_quote": "<Exact quote from resume or empty string>"
    }
  ],
  "flags": [
    {
      "flag_type": "vague_claim" | "missing_info" | "inconsistency" | "unverified_tenure",
      "description": "<Constructive note on what to validate in technical interview>",
      "severity": "low" | "medium" | "high",
      "evidence_quote": "<Quote or empty string>"
    }
  ]
}`

    const parts = [{ text: prompt }]
    const models = ['gemini-3.8-flash', 'gemini-3.6-flash']

    let resultRaw = ''
    let success = false

    for (const requestedModel of models) {
      const actualModel = requestedModel
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${actualModel}:generateContent?key=${apiKey}`

      try {
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts }],
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 4096,
              response_mime_type: 'application/json',
            },
          }),
        })

        if (!res.ok) {
          throw new Error(`API Error ${res.status}`)
        }

        const data = await res.json()
        const resParts = data.candidates?.[0]?.content?.parts
        resultRaw = Array.isArray(resParts) ? resParts.find((p: any) => typeof p.text === 'string')?.text : ''
        success = true
        break
      } catch (err) {
        console.error(`Failed with model ${requestedModel}, trying next...`)
      }
    }

    if (!success && fallbackKey) {
      console.log("Trying fallback key...")
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/${'gemini-3.8-flash'}:generateContent?key=${fallbackKey}`
      const res = await fetch(fallbackUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 4096, response_mime_type: 'application/json' },
        }),
      })
      if (res.ok) {
        const data = await res.json()
        const resParts = data.candidates?.[0]?.content?.parts
        resultRaw = Array.isArray(resParts) ? resParts.find((p: any) => typeof p.text === 'string')?.text : ''
        success = true
      }
    }

    if (!success || !resultRaw) {
      throw new Error("All model fallbacks and keys failed.")
    }

    // Parse output
    const jsonMatch = resultRaw.match(/(\{[\s\S]*\}|\[[\s\S]*\])/)
    let parsed
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0])
    } else {
      const cleaned = resultRaw.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim()
      parsed = JSON.parse(cleaned)
    }

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
