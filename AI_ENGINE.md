# Qawla AI Engine — Multi-Model Architecture

Qawla now uses a provider-neutral AI gateway instead of a hard-coded three-model waterfall.

## Supported model types

- Built-in NVIDIA NIM / Kimi
- Built-in Groq
- Built-in Gemini
- Any OpenAI-compatible chat-completions endpoint
- Free-tier providers
- Paid providers
- Self-hosted/local gateways such as Ollama when exposed through a reachable OpenAI-compatible endpoint

## Provider configuration

Add providers through `QAWLA_AI_PROVIDERS_JSON`. API keys are referenced by environment-variable name and are never returned to the browser.

Example:

```json
[
  {
    "id": "openrouter-free",
    "label": "OpenRouter Free",
    "apiKeyEnv": "OPENROUTER_API_KEY",
    "endpoint": "https://openrouter.ai/api/v1/chat/completions",
    "model": "your-free-model",
    "type": "openai-compatible",
    "free": true,
    "priority": 5,
    "tasks": ["scout", "writer", "general"]
  }
]
```

## Free-only mode

Set `QAWLA_AI_FREE_ONLY=true` to guarantee the router will only select providers explicitly marked `free: true`.

## Task-aware routing

Agents identify themselves to the gateway as:

`scout → factCheck → analyst → writer → editor`

A provider can be assigned to specific tasks. If a provider fails, the gateway automatically falls through to the next eligible provider.

## Writing quality

The Writer now receives stronger editorial rules: evidence density over padding, original synthesis instead of source-by-source paraphrase, precise uncertainty, concrete language, anti-cliché rules, and strict prohibition on invented facts, quotes, statistics or source details.
