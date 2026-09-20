import * as fs from 'fs'

async function callAPI() {
  const apiKey = process.env.VITE_GEMINI_API_KEY_2 || process.env.VITE_GEMINI_API_KEY_1;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: 'Hello' }] }],
    }),
  });
  console.log("Status:", res.status);
  console.log(await res.text());
}

// polyfill and run
Object.assign(globalThis, {
  import: { meta: { env: { VITE_GEMINI_API_KEY_1: process.env.VITE_GEMINI_API_KEY_1, VITE_GEMINI_API_KEY_2: process.env.VITE_GEMINI_API_KEY_2 } } }
});
callAPI();
