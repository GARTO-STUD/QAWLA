// Qawla — Multi-model AI Gateway
// Supports built-in providers plus arbitrary OpenAI-compatible APIs.
// Configure additional models with QAWLA_AI_PROVIDERS_JSON (server-side only).

export type AIProvider = string;
export type AITask = 'scout' | 'factCheck' | 'analyst' | 'writer' | 'editor' | 'seo' | 'guardian' | 'general';

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
  task?: AITask;
  preferredProvider?: string;
  preferredModel?: string;
  allowPaid?: boolean;
  profileMode?: 'best-quality'|'free-only'|'low-cost'|'fast'|'custom';
}

export interface WaterfallResult {
  provider: AIProvider;
  model: string;
  content: string;
  tokensIn?: number;
  tokensOut?: number;
  durationMs: number;
  attempts: Array<{ provider: AIProvider; model?: string; error?: string }>;
}

export interface AIProviderConfig {
  id: string;
  label: string;
  apiKeyEnv: string;
  endpoint: string;
  model: string;
  type?: 'openai-compatible' | 'gemini';
  free?: boolean;
  enabled?: boolean;
  priority?: number;
  tasks?: AITask[];
  temperature?: number;
  maxTokens?: number;
}

export interface TavilySearchResult { title: string; url: string; content: string; score: number; }
export interface TavilyResponse { query: string; results: TavilySearchResult[]; answer?: string; }

const BUILTIN_PROVIDERS: AIProviderConfig[] = [
  { id: 'nvidia', label: 'NVIDIA NIM / Kimi', apiKeyEnv: 'NVIDIA_API_KEY', endpoint: 'https://integrate.api.nvidia.com/v1/chat/completions', model: 'moonshotai/kimi-k2.6-instruct', type: 'openai-compatible', free: true, priority: 10 },
  { id: 'groq', label: 'Groq', apiKeyEnv: 'GROQ_API_KEY', endpoint: 'https://api.groq.com/openai/v1/chat/completions', model: 'llama-3.3-70b-versatile', type: 'openai-compatible', free: true, priority: 20 },
  { id: 'gemini', label: 'Google Gemini', apiKeyEnv: 'GEMINI_API_KEY', endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent', model: 'gemini-1.5-pro', type: 'gemini', free: true, priority: 30 },
];

function configuredProviders(): AIProviderConfig[] {
  let custom: AIProviderConfig[] = [];
  const raw = process.env.QAWLA_AI_PROVIDERS_JSON;
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) custom = parsed.filter((x) => x && x.id && x.endpoint && x.model && x.apiKeyEnv).map((x) => ({ ...x, type: x.type ?? 'openai-compatible', enabled: x.enabled !== false }));
    } catch { /* invalid config is ignored; built-ins remain available */ }
  }
  const map = new Map<string, AIProviderConfig>();
  for (const item of [...BUILTIN_PROVIDERS, ...custom]) map.set(item.id, item);
  return [...map.values()].filter((p) => p.enabled !== false && !!process.env[p.apiKeyEnv]).sort((a,b) => (a.priority ?? 100) - (b.priority ?? 100));
}

export function getConfiguredAIProviders(): Array<Omit<AIProviderConfig, 'apiKeyEnv'>> {
  return configuredProviders().map(({ apiKeyEnv: _secretEnv, ...safe }) => safe);
}

function inferTask(messages: ChatMessage[]): AITask {
  const text = messages.map(m => m.content).join(' ').toLowerCase();
  if (text.includes('qawla scout')) return 'scout';
  if (text.includes('fact-checker') || text.includes('fact checker')) return 'factCheck';
  if (text.includes('tactical analyst')) return 'analyst';
  if (text.includes('qawla writer')) return 'writer';
  if (text.includes('qawla editor')) return 'editor';
  if (text.includes('seo intelligence') || text.includes('seo agent')) return 'seo';
  if (text.includes('guardian')) return 'guardian';
  return 'general';
}

function selectProviders(messages: ChatMessage[], opts: WaterfallOptions): AIProviderConfig[] {
  const all = configuredProviders();
  const task = opts.task ?? inferTask(messages);
  const eligible = all.filter(p => !p.tasks?.length || p.tasks.includes(task) || p.tasks.includes('general'));
  const freeOnly = opts.allowPaid === false || opts.profileMode === 'free-only' || process.env.QAWLA_AI_FREE_ONLY === 'true';
  const filtered = freeOnly ? eligible.filter(p => p.free === true) : eligible;
  const pool = filtered.length ? filtered : (freeOnly ? [] : eligible);
  const ordered = opts.profileMode === 'fast' ? [...pool].sort((a,b) => (a.maxTokens ?? 2048) - (b.maxTokens ?? 2048) || (a.priority ?? 100) - (b.priority ?? 100)) : opts.profileMode === 'low-cost' ? [...pool].sort((a,b) => Number(b.free) - Number(a.free) || (a.priority ?? 100) - (b.priority ?? 100)) : pool;
  const preferred = ordered.filter(p => (opts.preferredProvider && p.id === opts.preferredProvider) || (opts.preferredModel && p.model === opts.preferredModel));
  return [...preferred, ...ordered.filter(p => !preferred.includes(p))];
}

function withTimeout<T>(promise: Promise<T>, ms: number, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
    const abort = () => { clearTimeout(timer); reject(new Error('Aborted')); };
    signal?.addEventListener('abort', abort, { once: true });
    promise.then(v => { clearTimeout(timer); signal?.removeEventListener('abort', abort); resolve(v); }).catch(e => { clearTimeout(timer); signal?.removeEventListener('abort', abort); reject(e); });
  });
}

async function callOpenAICompatible(messages: ChatMessage[], opts: WaterfallOptions, cfg: AIProviderConfig) {
  const apiKey = process.env[cfg.apiKeyEnv];
  if (!apiKey) throw new Error(`${cfg.apiKeyEnv} not set`);
  const body = { model: cfg.model, messages, temperature: opts.temperature ?? cfg.temperature ?? 0.4, max_tokens: opts.maxTokens ?? cfg.maxTokens ?? 2048, stream: false, ...(opts.jsonMode ? { response_format: { type: 'json_object' } } : {}) };
  const res = await withTimeout(fetch(cfg.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` }, body: JSON.stringify(body) }), opts.timeoutMs ?? 40_000, opts.signal);
  if (!res.ok) throw new Error(`${cfg.id} ${res.status}: ${await res.text()}`);
  const json = await res.json() as any;
  const content = json.choices?.[0]?.message?.content ?? '';
  if (!content) throw new Error(`${cfg.id}: empty model response`);
  return { content, tokensIn: json.usage?.prompt_tokens, tokensOut: json.usage?.completion_tokens };
}

async function callGemini(messages: ChatMessage[], opts: WaterfallOptions, cfg: AIProviderConfig) {
  const apiKey = process.env[cfg.apiKeyEnv];
  if (!apiKey) throw new Error(`${cfg.apiKeyEnv} not set`);
  const system = messages.find(m => m.role === 'system')?.content;
  const contents = messages.filter(m => m.role !== 'system').map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }));
  const body = { contents, ...(system ? { systemInstruction: { parts: [{ text: system }] } } : {}), generationConfig: { temperature: opts.temperature ?? cfg.temperature ?? 0.4, maxOutputTokens: opts.maxTokens ?? cfg.maxTokens ?? 2048, ...(opts.jsonMode ? { responseMimeType: 'application/json' } : {}) } };
  const res = await withTimeout(fetch(`${cfg.endpoint}?key=${encodeURIComponent(apiKey)}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }), opts.timeoutMs ?? 40_000, opts.signal);
  if (!res.ok) throw new Error(`${cfg.id} ${res.status}: ${await res.text()}`);
  const json = await res.json() as any;
  const content = json.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('') ?? '';
  if (!content) throw new Error(`${cfg.id}: empty model response`);
  return { content, tokensIn: json.usageMetadata?.promptTokenCount, tokensOut: json.usageMetadata?.candidatesTokenCount };
}

export async function aiWaterfall(messages: ChatMessage[], opts: WaterfallOptions = {}): Promise<WaterfallResult> {
  const started = Date.now();
  const providers = selectProviders(messages, opts);
  if (!providers.length) throw new Error('No AI providers are configured for this request. Add a provider API key or disable free-only mode.');
  const attempts: WaterfallResult['attempts'] = [];
  for (const cfg of providers) {
    try {
      const result = cfg.type === 'gemini' ? await callGemini(messages, opts, cfg) : await callOpenAICompatible(messages, opts, cfg);
      return { provider: cfg.id, model: cfg.model, ...result, durationMs: Date.now() - started, attempts };
    } catch (err) {
      attempts.push({ provider: cfg.id, model: cfg.model, error: err instanceof Error ? err.message : String(err) });
    }
  }
  throw new Error(`All configured AI providers failed: ${attempts.map(a => `${a.provider}/${a.model}=${a.error}`).join('; ')}`);
}

export async function searchWeb(query: string, opts: { maxResults?: number; searchDepth?: 'basic'|'advanced'; includeAnswer?: boolean } = {}): Promise<TavilyResponse> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return { query, results: [] };
  const body = { api_key: apiKey, query, search_depth: opts.searchDepth ?? 'basic', max_results: opts.maxResults ?? 5, include_answer: opts.includeAnswer ?? true, include_raw_content: false };
  const res = await withTimeout(fetch('https://api.tavily.com/search', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) }), 15_000);
  if (!res.ok) throw new Error(`Tavily search failed: ${res.status}`);
  return await res.json() as TavilyResponse;
}

export async function searchWebForContext(query: string, maxResults = 5): Promise<string> {
  try {
    const response = await searchWeb(query, { maxResults, includeAnswer: true });
    if (!response.results.length) return '';
    return `Web search results:\n${response.results.map((r,i)=>`[${i+1}] ${r.title}\n${r.url}\n${r.content}`).join('\n\n')}${response.answer ? `\n\nSearch synthesis: ${response.answer}` : ''}`;
  } catch { return ''; }
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
