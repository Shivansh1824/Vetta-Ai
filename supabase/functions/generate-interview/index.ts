import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// We map the user's requested 3.x names to actual Google endpoints
const MODEL_MAPPING = {
  'gemini-3.5-flash': 'gemini-1.5-flash',
  'gemini-3.6-flash': 'gemini-1.5-pro'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { resumeText, job, flags } = await req.json()

    // Step 3: Back to primary API key (Key 1) for this function
    let apiKey = Deno.env.get('GEMINI_API_KEY_1')
    let fallbackKey = Deno.env.get('GEMINI_API_KEY_2')

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
    const models = ['gemini-3.5-flash', 'gemini-3.6-flash']

    let resultRaw = ''
    let success = false

    for (const requestedModel of models) {
      const actualModel = MODEL_MAPPING[requestedModel as keyof typeof MODEL_MAPPING]
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
      const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_MAPPING['gemini-3.5-flash']}:generateContent?key=${fallbackKey}`
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
