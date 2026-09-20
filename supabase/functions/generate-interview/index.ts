// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// We map the user's requested 3.x names to actual Google endpoints

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resumeText, job, flags } = await req.json()

    // Step 3: Back to primary API key (Key 1) for this function
    let apiKey = Deno.env.get('GEMINI_API_KEY_1') || Deno.env.get('VITE_GEMINI_API_KEY_1')
    let fallbackKey = Deno.env.get('GEMINI_API_KEY_2') || Deno.env.get('VITE_GEMINI_API_KEY_2')

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY_1 is not set")
    }

    const flagSummary = flags && flags.length
      ? flags.map((f: any) => `- ${f.flag_type}: ${f.description}`).join('\n')
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

    const parts = [{ text: prompt }]
    const models = [
      'gemini-3.8-flash',
      'gemini-3.6-flash',
      'gemini-3.7-flash',
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
    ]

    let resultRaw = ''
    let success = false
    let lastError = ''

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
          const errText = await res.text(); throw new Error(`API Error ${res.status}: ${errText}`)
        }

        const data = await res.json()
        const resParts = data.candidates?.[0]?.content?.parts
        resultRaw = Array.isArray(resParts) ? resParts.find((p: any) => typeof p.text === 'string')?.text : ''
        success = true
        break
      } catch (err: any) {
        lastError = err?.message || String(err)
        console.error(`Failed with model ${requestedModel}, trying next... ERROR:`, err?.message)
      }
    }

    if (!success && fallbackKey) {
      console.log("Trying fallback key...")
      for (const fallbackModel of models) {
        const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent?key=${fallbackKey}`
        try {
          const res = await fetch(fallbackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: { temperature: 0.1, maxOutputTokens: 4096, response_mime_type: 'application/json' },
            }),
          })
          if (!res.ok) continue
          const data = await res.json()
          const resParts = data.candidates?.[0]?.content?.parts
          resultRaw = Array.isArray(resParts) ? resParts.find((p: any) => typeof p.text === 'string')?.text : ''
          if (resultRaw) {
            success = true
            break
          }
        } catch (err: any) {
          lastError = err?.message || String(err)
        }
      }
    }

    if (!success || !resultRaw) {
      throw new Error(`All model fallbacks and keys failed. Details: ${lastError}`)
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
