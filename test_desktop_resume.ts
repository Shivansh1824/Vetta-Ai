// Mock import.meta.env
Object.assign(globalThis, {
  import: { meta: { env: { VITE_GEMINI_API_KEY_1: process.env.VITE_GEMINI_API_KEY_1, VITE_GEMINI_API_KEY_2: process.env.VITE_GEMINI_API_KEY_2 } } }
});

// Since import.meta is special, the easiest way to test Vite code in Node is to polyfill it or just run the vite command, OR let's just deploy the fix or check it.
