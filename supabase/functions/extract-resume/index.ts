// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from "../_shared/cors.ts"

// We map the user's requested 3.x names to actual Google endpoints

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, base64, mimeType, fileName } = await req.json()

    // Step 1: Use primary API key for this function (Key 1)
    let apiKey = Deno.env.get('GEMINI_API_KEY_1') || Deno.env.get('VITE_GEMINI_API_KEY_1')
    let fallbackKey = Deno.env.get('GEMINI_API_KEY_2') || Deno.env.get('VITE_GEMINI_API_KEY_2')

    if (!apiKey) {
      throw new Error("GEMINI_API_KEY_1 is not set")
    }

    const prompt = `You are an expert HR and Document OCR Intelligence AI for Vetta AI.
Analyze the provided document or text carefully.

TASK 1: VALIDATION CHECK
Determine whether this document is an actual candidate resume or curriculum vitae (CV).
- If it is NOT a candidate resume (e.g. an invoice, receipt, legal contract, code snippet, landscape/animal/selfie image, blank file, or unrelated notes), you MUST return JSON with:
  "is_resume": false,
  "rejection_reason": "The uploaded file does not appear to be a candidate resume. It seems to be an invalid document. Please upload a valid candidate resume (PDF, DOCX, or Image)."

TASK 2: HIGH-FIDELITY A+ GRADE RESUME EXTRACTION (If it is a resume)
Extract candidate details with pristine precision into structured JSON.

Return ONLY valid JSON matching this schema:
{
  "is_resume": true,
  "rejection_reason": "",
  "candidate_name": "<Full Name>",
  "email": "<Email or empty string>",
  "phone": "<Phone or empty string>",
  "location": "<City, State/Country or empty string>",
  "current_title": "<Current or target job title>",
  "total_years_exp": <number, e.g. 5>,
  "skills": ["<Skill 1>", "<Skill 2>"],
  "summary": "<2-3 sentence executive professional summary>",
  "experience": [
    {
      "company": "<Company Name>",
      "role": "<Job Title>",
      "duration": "<e.g. 2021 - Present>",
      "highlights": ["<Key achievement or responsibility>"]
    }
  ],
  "education": [
    {
      "institution": "<University or Institution>",
      "degree": "<Degree or Certification>",
      "year": "<Year or Period>"
    }
  ],
  "formatted_resume_text": "<Reconstruct a clean, complete, readable formatted markdown text version of the entire resume including summary, skills, experience, and education>"
}`

    const parts: any[] = []
    if (base64 && mimeType) {
      parts.push({
        inline_data: { mime_type: mimeType, data: base64 }
      })
    }

    const contentPrompt = text ? `${prompt}\n\nDOCUMENT FILENAME: ${fileName || 'Uploaded Document'}\nDOCUMENT TEXT CONTENT:\n${text.substring(0, 12000)}` : prompt
    parts.push({ text: contentPrompt })

    const models = [
      'gemini-3.8-flash',
      'gemini-3.6-flash',
      'gemini-3.7-flash',
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
    ]

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
        console.error(`Failed with model ${requestedModel}, error:`, err)
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
        } catch {
          // try next model
        }
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
