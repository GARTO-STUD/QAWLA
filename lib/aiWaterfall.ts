// Qawla — AI provider waterfall: Nvidia NIM (Kimi K2 free) → Groq → Gemini → Tavily (search)
//
// The waterfall tries each provider in order. The first successful response wins.
// On failure (network, auth, parse), it falls through to the next provider.
//
// Provider 1: Nvidia NIM — hosts Kimi K2 (moonshotai/kimi-k2.6-instruct) for FREE
//   Get a free key at https://build.nvidia.com (no credit card required)
//   This replaces the need for a paid Moonshot API key.
//
// Provider 2: Groq — Llama 3.3 70B, very fast, generous free tier
//   Get a free key at https://console.groq.com
//
// Provider 3: Gemini 1.5 Pro — Google's free tier
//   Get a free key at https://aistudio.google.com/apikey
//
// Provider 4: Tavily — AI-optimized web search (used for fact-checking enrichment)
//   Get a free key at https://tavily.com (1,000 searches/month free)
//   Used via searchWeb() function, NOT as a chat completion provider.

export type AIProvider = 'nvidia' | 'groq' | 'gemini' | 'fallback';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface WaterfallOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface WaterfallResult {
  provider: AIProvider;
  model: string;
  content: string;
  tokensIn?: number;
  tokensOut?: number;
  durationMs: number;
  attempts: Array<{ provider: AIProvider; error?: string }>;
}

export interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
}

export interface TavilyResponse {
  query: string;
  results: TavilySearchResult[];
  answer?: string;
}

interface ProviderConfig {
  name: AIProvider;
  apiKeyEnv: string;
  endpoint: string;
  model: string;
}

const PROVIDERS: ProviderConfig[] = [
  {
    name: 'nvidia',
    apiKeyEnv: 'NVIDIA_API_KEY',
    endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions',
    model: 'moonshotai/kimi-k2.6-instruct',
  },
  {
    name: 'groq',
    apiKeyEnv: 'GROQ_API_KEY',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
  },
  {
    name: 'gemini',
    apiKeyEnv: 'GEMINI_API_KEY',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent',
    model: 'gemini-1.5-pro',
  },
];

function withTimeout<T>(promise: Promise<T>, ms: number, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
    const onAbort = () => {
      clearTimeout(timer);
      reject(new Error('Aborted'));
    };
    signal?.addEventListener('abort', onAbort, { once: true });
    promise
      .then((val) => { clearTimeout(timer); signal?.removeEventListener('abort', onAbort); resolve(val); })
      .catch((err) => { clearTimeout(timer); signal?.removeEventListener('abort', onAbort); reject(err); });
  });
}

/**
 * Call Nvidia NIM (hosts Kimi K2 for free).
 * Uses the OpenAI-compatible chat completions endpoint.
 */
async function callNvidia(messages: ChatMessage[], opts: WaterfallOptions, cfg: ProviderConfig): Promise<{ content: string; tokensIn?: number; tokensOut?: number }> {
  const apiKey = process.env[cfg.apiKeyEnv];
  if (!apiKey) throw new Error(`${cfg.apiKeyEnv} not set`);
  const body = {
    model: cfg.model,
    messages,
    temperature: opts.temperature ?? 0.4,
    max_tokens: opts.maxTokens ?? 2048,
    stream: false,
    ...(opts.jsonMode ? { response_format: { type: 'json_object' } } : {}),
  };
  const res = await withTimeout(fetch(cfg.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  }), opts.timeoutMs ?? 30_000, opts.signal);
  if (!res.ok) throw new Error(`Nvidia NIM ${res.status}: ${await res.text()}`);
  const json = await res.json() as { choices: Array<{ message: { content: string } }>; usage?: { prompt_tokens: number; completion_tokens: number } };
  return {
    content: json.choices[0]?.message?.content ?? '',
    tokensIn: json.usage?.prompt_tokens,
    tokensOut: json.usage?.completion_tokens,
  };
}

async function callGroq(messages: ChatMessage[], opts: WaterfallOptions, cfg: ProviderConfig): Promise<{ content: string; tokensIn?: number; tokensOut?: number }> {
  const apiKey = process.env[cfg.apiKeyEnv];
  if (!apiKey) throw new Error(`${cfg.apiKeyEnv} not set`);
  const body = {
    model: cfg.model,
    messages,
    temperature: opts.temperature ?? 0.4,
    max_tokens: opts.maxTokens ?? 2048,
    ...(opts.jsonMode ? { response_format: { type: 'json_object' } } : {}),
  };
  const res = await withTimeout(fetch(cfg.endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  }), opts.timeoutMs ?? 30_000, opts.signal);
  if (!res.ok) throw new Error(`Groq ${res.status}: ${await res.text()}`);
  const json = await res.json() as { choices: Array<{ message: { content: string } }>; usage?: { prompt_tokens: number; completion_tokens: number } };
  return {
    content: json.choices[0]?.message?.content ?? '',
    tokensIn: json.usage?.prompt_tokens,
    tokensOut: json.usage?.completion_tokens,
  };
}

async function callGemini(messages: ChatMessage[], opts: WaterfallOptions, cfg: ProviderConfig): Promise<{ content: string; tokensIn?: number; tokensOut?: number }> {
  const apiKey = process.env[cfg.apiKeyEnv];
  if (!apiKey) throw new Error(`${cfg.apiKeyEnv} not set`);
  const systemInstruction = messages.find((m) => m.role === 'system')?.content;
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
  const body = {
    contents,
    ...(systemInstruction ? { systemInstruction: { parts: [{ text: systemInstruction }] } } : {}),
    generationConfig: {
      temperature: opts.temperature ?? 0.4,
      maxOutputTokens: opts.maxTokens ?? 2048,
      ...(opts.jsonMode ? { responseMimeType: 'application/json' } : {}),
    },
  };
  const url = `${cfg.endpoint}?key=${apiKey}`;
  const res = await withTimeout(fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }), opts.timeoutMs ?? 30_000, opts.signal);
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${await res.text()}`);
  const json = await res.json() as {
    candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
    usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number };
  };
  const content = json.candidates[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
  return {
    content,
    tokensIn: json.usageMetadata?.promptTokenCount,
    tokensOut: json.usageMetadata?.candidatesTokenCount,
  };
}

const CALLERS: Record<AIProvider, (m: ChatMessage[], o: WaterfallOptions, c: ProviderConfig) => Promise<{ content: string; tokensIn?: number; tokensOut?: number }>> = {
  nvidia: callNvidia,
  groq: callGroq,
  gemini: callGemini,
  fallback: callGroq,
};

/**
 * Run the waterfall. Returns the first successful provider's response.
 * Order: Nvidia NIM (Kimi K2 free) → Groq → Gemini
 */
export async function aiWaterfall(
  messages: ChatMessage[],
  opts: WaterfallOptions = {},
): Promise<WaterfallResult> {
  const startedAt = Date.now();
  const attempts: Array<{ provider: AIProvider; error?: string }> = [];
  for (const cfg of PROVIDERS) {
    try {
      const { content, tokensIn, tokensOut } = await CALLERS[cfg.name](messages, opts, cfg);
      return {
        provider: cfg.name,
        model: cfg.model,
        content,
        tokensIn,
        tokensOut,
        durationMs: Date.now() - startedAt,
        attempts,
      };
    } catch (err) {
      attempts.push({ provider: cfg.name, error: err instanceof Error ? err.message : String(err) });
    }
  }
  throw new Error(`All AI providers failed: ${attempts.map((a) => `${a.provider}=${a.error}`).join('; ')}`);
}

/**
 * Search the web using Tavily API (AI-optimized search).
 * Used by the Fact-Checker agent to cross-reference claims against live web content.
 *
 * Free tier: 1,000 searches/month at https://tavily.com
 *
 * @example
 * const results = await searchWeb('Mbappe Real Madrid transfer fee');
 * // results.results[0].title, results.results[0].url, results.results[0].content
 */
export async function searchWeb(
  query: string,
  opts: { maxResults?: number; searchDepth?: 'basic' | 'advanced'; includeAnswer?: boolean } = {},
): Promise<TavilyResponse> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return { query, results: [] };
  }

  const body = {
    api_key: apiKey,
    query,
    search_depth: opts.searchDepth ?? 'basic',
    max_results: opts.maxResults ?? 5,
    include_answer: opts.includeAnswer ?? true,
    include_raw_content: false,
  };

  const res = await withTimeout(
    fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    15_000,
  );

  if (!res.ok) {
    throw new Error(`Tavily search failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json() as TavilyResponse;
  return data;
}

/**
 * Search the web and format results as a context block for AI prompts.
 * Returns a string suitable for injection into a system or user prompt.
 *
 * @example
 * const ctx = await searchWebForContext('Haaland transfer rumor');
 * // Returns: "Web search results:\n[1] Title\nURL\nContent snippet\n\n[2]..."
 */
export async function searchWebForContext(
  query: string,
  maxResults = 5,
): Promise<string> {
  try {
    const response = await searchWeb(query, { maxResults, includeAnswer: true });
    if (response.results.length === 0) return '';

    let context = 'Web search results (via Tavily):\n';
    if (response.answer) {
      context += `\nAI Answer: ${response.answer}\n`;
    }
    response.results.forEach((r, i) => {
      context += `\n[${i + 1}] ${r.title}\n`;
      context += `URL: ${r.url}\n`;
      context += `Content: ${r.content.slice(0, 500)}\n`;
    });
    return context;
  } catch {
    return '';
  }
}

/** Try to extract a JSON object from an LLM response, tolerating fences and prose. */
export function extractJSON<T = unknown>(text: string): T {
  if (!text) throw new Error('Empty response');
  // Strip ```json fences
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1]! : text;
  // Try direct parse first
  try {
    return JSON.parse(candidate) as T;
  } catch {
    // Fall back: find first { ... last }
    const start = candidate.indexOf('{');
    const end = candidate.lastIndexOf('}');
    if (start >= 0 && end > start) {
      const slice = candidate.slice(start, end + 1);
      try {
        return JSON.parse(slice) as T;
      } catch {
        // Fall through
      }
    }
    // Try array
    const aStart = candidate.indexOf('[');
    const aEnd = candidate.lastIndexOf(']');
    if (aStart >= 0 && aEnd > aStart) {
      try {
        return JSON.parse(candidate.slice(aStart, aEnd + 1)) as T;
      } catch {
        // Fall through
      }
    }
    throw new Error(`Could not extract JSON from: ${candidate.slice(0, 200)}`);
  }
}

/** Simple prompt: send system + user, return raw text. */
export async function prompt(
  system: string,
  user: string,
  opts: WaterfallOptions = {},
): Promise<WaterfallResult> {
  return aiWaterfall(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    opts,
  );
}
