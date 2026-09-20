import * as fs from 'fs'

async function callAPI() {
  const apiKey = process.env.VITE_GEMINI_API_KEY_2 || process.env.VITE_GEMINI_API_KEY_1;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Hello' }] }],
    }),
  });
  console.log("Status 3.6:", res.status);
  console.log(await res.text());
}
callAPI();
