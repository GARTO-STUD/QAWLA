
## AI Engine

The AI runtime now supports arbitrary OpenAI-compatible providers through `QAWLA_AI_PROVIDERS_JSON`, in addition to the built-in NVIDIA NIM, Groq and Gemini integrations. Providers can be marked `free: true`, assigned priorities and editorial tasks. Set `QAWLA_AI_FREE_ONLY=true` to guarantee the router uses only providers marked as free.
