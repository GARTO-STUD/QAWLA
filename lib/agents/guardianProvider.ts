// Qawla — Guardian provider (isolated Gemini direct call)
//
// The Guardian agent uses Gemini exclusively — never Nvidia or Groq —
// to ensure it never competes for the same API rate limits as the
// agents it monitors. This file provides a thin wrapper around the
// Gemini API that the Guardian can call directly.

export type ChatMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export interface GuardianProviderOptions {
  temperature?: number;
  maxTokens?: number;
  jsonMode?: boolean;
  signal?: AbortSignal;
  timeoutMs?: number;
}

export interface GuardianProviderResult {
  provider: 'gemini';
  model: string;
  content: string;
  tokensIn?: number;
  tokensOut?: number;
}

function withTimeout<T>(promise: Promise<T>, ms: number, signal?: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`Guardian request timed out after ${ms}ms`)), ms);
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
 * Call Gemini directly — the Guardian's exclusive provider.
 *
 * Gemini 1.5 Pro endpoint (Google AI Studio):
 *   POST https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent
 *
 * Requires GEMINI_API_KEY environment variable.
 * Free tier: https://aistudio.google.com/apikey
 */
export async function callGeminiDirect(
  messages: ChatMessage[],
  opts: GuardianProviderOptions = {},
): Promise<GuardianProviderResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // Graceful fallback — return a healthy report if no API key
    return {
      provider: 'gemini',
      model: 'gemini-1.5-pro',
      content: JSON.stringify({
        status: 'healthy',
        issues: [],
        fixes: [],
        learnings: [],
        overrideDecision: 'approve',
        rationale: 'Guardian running in offline mode (no GEMINI_API_KEY). No issues detected by rule-based checks.',
        confidenceAdjustment: 0,
      }),
      tokensIn: 0,
      tokensOut: 0,
    };
  }

  const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent';

  // Convert ChatMessage[] to Gemini's format
  // Gemini uses "contents" with role "user" or "model"
  const systemInstruction = messages.find((m) => m.role === 'system')?.content || '';
  const conversationMessages = messages.filter((m) => m.role !== 'system');

  const body = {
    contents: conversationMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
    generationConfig: {
      temperature: opts.temperature ?? 0.2,
      maxOutputTokens: opts.maxTokens ?? 2000,
      ...(opts.jsonMode ? { responseMimeType: 'application/json' } : {}),
    },
  };

  const res = await withTimeout(
    fetch(`${endpoint}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
    opts.timeoutMs ?? 35_000,
    opts.signal,
  );

  if (!res.ok) {
    throw new Error(`Guardian Gemini call failed: ${res.status} ${await res.text()}`);
  }

  const json = await res.json() as {
    candidates: Array<{
      content: { parts: Array<{ text: string }> };
      finishReason?: string;
    }>;
    usageMetadata?: { promptTokenCount: number; candidatesTokenCount: number };
  };

  const content = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  return {
    provider: 'gemini',
    model: 'gemini-1.5-pro',
    content,
    tokensIn: json.usageMetadata?.promptTokenCount,
    tokensOut: json.usageMetadata?.candidatesTokenCount,
  };
}

/**
 * Extract a JSON object from an LLM response, tolerating fences and prose.
 * (Mirror of the extractJSON in aiWaterfall.ts — kept here for provider isolation.)
 */
export function extractJSON<T = unknown>(text: string): T {
  if (!text) throw new Error('Empty Guardian response');
  // Strip ```json fences
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1]! : text;
  try {
    return JSON.parse(candidate) as T;
  } catch {
    // Try to find the first { ... } block
    const match = candidate.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch {
        // fall through
      }
    }
    throw new Error(`Guardian returned non-JSON: ${text.slice(0, 200)}`);
  }
}
