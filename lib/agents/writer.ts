// Qawla — Writer Agent
// Turns verified intelligence into publication-ready long-form prose in Markdown.
// Voice: authoritative, vivid, evidence-led. Never invents quotes or statistics.

import type { RawEvent, AgentResult, ConfidenceResult, Article, ArticleCategory, Author } from '@/types';
import type { ScoutReport } from '@/lib/agents/scout';
import type { FactCheckReport } from '@/lib/agents/factCheck';
import type { TacticalReport } from '@/lib/agents/analyst';
import { aiWaterfall, extractJSON, type ChatMessage } from '@/lib/aiWaterfall';

const SYSTEM_PROMPT = `You are the Qawla Writer, the lead prose voice of a premium global football publication.

You write with the authority of a long-read features journalist (think The Athletic
at its best, Jonathan Wilson, Rory Smith) combined with the precision of a wire
service. Your job is to turn verified intelligence from the scout, fact-checker,
and tactical analyst into publication-ready prose.

Voice & Style:
- Lead with a vivid, specific hook — a moment, a quote, a statistic, a scene.
  Never start with "In a recent development" or generic throat-clearing.
- Use second-person only in commentary; third-person in reported news.
- Vary sentence length deliberately. Short sentences for emphasis. Long, layered
  sentences for nuance and texture.
- Show, don't tell. "Salah checked inside onto his left" beats "Salah did well".
- Be specific: name the player, the minute, the zone, the body of the goal.
- Cite sources inline the first time: "according to BBC Sport", "as reported by
  The Athletic's David Ornstein".
- Attribute quotes precisely. Never invent quotes. If a quote is unavailable,
  paraphrase and attribute the claim.
- Use the active voice. Avoid clichés ("must-win", "six-pointer", "statement win").
- Structure: hook (2-3 sentences) → context → core reporting → tactical/analytical
  depth → stakes/implications → forward-looking close.

Editorial integrity:
- Never invent statistics, xG values, or match data. If the analyst provided them,
  use them. If not, omit.
- Never fabricate quotes. Use only quotes present in the source material.
- Distinguish between confirmed facts and reported claims. Use "reportedly",
  "according to", "is understood to" for sourced-but-unconfirmed claims.
- Respect the confidence verdict. If fact-checker says "unverified", reflect
  that caveat in the prose — do not paper over it.
- Honor transfer status precision: rumour vs. negotiating vs. signed.

Format:
- Output Markdown.
- Use ## for section headings (3-5 sections for a 600-900 word piece).
- Use **bold** for the most important player/team names on first mention.
- Use > blockquote for direct quotes.
- Use - bullet lists only for tactical points or lists of outcomes.
- Include a single-line dateline at the top: *[City, Date] —*

Output strict JSON matching the provided schema. No prose, no markdown fences.`;

function defaultAuthor(): Author {
  return {
    id: 'qawla_writer',
    name: 'Qawla Newsroom',
    handle: 'qawla',
    role: 'writer',
    bio: 'The Qawla editorial desk',
  };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 80);
}

function randomId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function estimateReadingTime(markdown: string): number {
  const words = markdown.split(/\s+/).length;
  return Math.max(2, Math.round(words / 220));
}

export async function runWriter(
  events: RawEvent[],
  confidence: ConfidenceResult,
  existing?: Article,
): Promise<AgentResult> {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  const event = events[0]!;

  // Pull whatever intelligence is available from previous agent results.
  // These are passed via the orchestrator context indirectly — here we use the
  // events themselves plus confidence.
  const userPrompt = `Write a publication-ready article based on the following verified intelligence.

PRIMARY EVENT
Headline: ${event.headline}
Source: ${event.sourceName} (${event.sourceTier})
Published: ${event.publishedAt}
URL: ${event.url}

SUMMARY
${event.summary ?? 'No summary available'}

CORROBORATING SOURCES
${events.slice(1, 6).map((e) => `- [${e.sourceTier}] ${e.sourceName}: ${e.headline}`).join('\n')}

ENTITIES
${event.entities.map((e) => `- ${e.name} (${e.type})`).join('\n')}

CONFIDENCE
Score: ${confidence.score}/100 (${confidence.label})
Decision: ${confidence.decision}
Rationale: ${confidence.rationale}

INSTRUCTIONS
- Target length: 600-900 words for news; 1200-1800 for analysis.
- Match the Qawla voice: authoritative, vivid, evidence-led.
- Open with a specific hook — never generic.
- Cite sources inline on first mention.
- If confidence is below "likely", include a clear verification caveat.
- Close with stakes/implications, not a generic wrap.

Respond with JSON matching this schema:
{
  "title": "compelling, specific headline (max 90 chars)",
  "subtitle": "deck/subtitle that adds context (max 140 chars)",
  "excerpt": "2-sentence summary for cards and SEO meta (max 220 chars)",
  "markdown": "the full article in Markdown with ## sections",
  "tags": ["5-8 lowercase tags"],
  "category": "transfers|previews|reviews|tactical|opinion|live|youth|international"
}`;

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];

  const result = await aiWaterfall(messages, {
    temperature: 0.6,
    maxTokens: 2400,
    jsonMode: true,
    timeoutMs: 40_000,
  });

  const parsed = extractJSON<{
    title: string;
    subtitle: string;
    excerpt: string;
    markdown: string;
    tags: string[];
    category: ArticleCategory;
  }>(result.content);

  const now = new Date().toISOString();
  const article: Article = {
    id: existing?.id ?? randomId(),
    slug: existing?.slug ?? slugify(parsed.title),
    title: parsed.title,
    subtitle: parsed.subtitle,
    excerpt: parsed.excerpt,
    content: parsed.markdown,
    coverImage: event.image ?? existing?.coverImage,
    category: parsed.category ?? event.category ?? 'reviews',
    tags: parsed.tags ?? [],
    contentType: 'news',
    status: 'draft',
    author: existing?.author ?? defaultAuthor(),
    entities: event.entities,
    league: event.entities.find((e) => e.type === 'competition')?.name,
    featured: false,
    trending: events.length >= 3,
    readingTimeMinutes: estimateReadingTime(parsed.markdown),
    viewCount: 0,
    shareCount: 0,
    publishedAt: now,
    updatedAt: now,
    createdAt: existing?.createdAt ?? now,
    confidence,
    sourceIds: events.map((e) => e.sourceId),
  };

  return {
    agent: 'writer',
    status: 'completed',
    startedAt,
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - t0,
    tokensIn: result.tokensIn,
    tokensOut: result.tokensOut,
    model: result.model,
    provider: result.provider,
    output: article,
    confidenceContribution: 0.1,
  };
}

/** Convenience: write from explicit agent outputs (for tests/manual runs). */
export async function runWriterFromReports(
  scout: ScoutReport,
  factCheck: FactCheckReport,
  analyst: TacticalReport | null,
  confidence: ConfidenceResult,
): Promise<AgentResult> {
  const events = [scout.primaryEvent, ...scout.corroboratingEvents];
  void factCheck; void analyst;
  return runWriter(events, confidence);
}
