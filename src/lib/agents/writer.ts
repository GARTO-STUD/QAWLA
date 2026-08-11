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
- Every paragraph must add a new fact, piece of context, implication, or transition.
- Avoid repetitive sentence openings, AI clichés, generic conclusions, and padded prose.
- Prefer concrete verbs and named entities over abstract language.
- Never manufacture a source, quote, statistic, event, date, fee, injury, or tactical detail.
- If evidence is thin, write a shorter, precise story rather than filling space.

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
  factCheck?: FactCheckReport,
  analyst?: TacticalReport | null,
): Promise<AgentResult> {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  const event = events[0]!;

  // Pull whatever intelligence is available from previous agent results.
  // IMPORTANT: factCheck/analyst are now actually used below — a previous
  // version of this function accepted no such parameters at all, and the
  // orchestrator called runWriter() with only raw events + a numeric
  // confidence score. That meant the Writer never saw the Fact-Checker's
  // per-claim veracity findings or the Analyst's tactical breakdown, despite
  // the whole point of running those agents first being to feed their
  // verified findings into the prose. The "editorial pipeline" was
  // effectively cosmetic past the confidence gate: agents ran and logged
  // reports, but the article text was written blind to almost all of them.
  const factCheckSection = factCheck ? `
VERIFIED FACT-CHECK FINDINGS (from the Qawla Fact-Checker — respect this verdict)
Overall verdict: ${factCheck.overallVerdict}
${factCheck.claims.map((c) => `- [${c.veracity}] ${c.claim}${c.notes ? ` — ${c.notes}` : ''}`).join('\n')}
${factCheck.contradictions.length ? `Contradictions to acknowledge in the prose:\n${factCheck.contradictions.map((c) => `- ${c}`).join('\n')}` : ''}
${factCheck.missingInformation.length ? `Missing information (do not state as fact):\n${factCheck.missingInformation.map((m) => `- ${m}`).join('\n')}` : ''}
` : '';

  const analystSection = analyst ? `
TACTICAL ANALYSIS (from the Qawla Tactical Analyst — incorporate this depth)
Formations: ${analyst.formationHome} vs ${analyst.formationAway}
Pressing scheme: ${analyst.pressingScheme}
Defensive shape: ${analyst.defensiveShape}
Key battles: ${analyst.keyBattles.map((b) => `${b.homePlayer} vs ${b.awayPlayer} (${b.zone}) — ${b.significance}`).join('; ')}
Narrative context: ${analyst.narrativeContext}
${analyst.xgAnalysis ? `xG analysis: ${analyst.xgAnalysis}` : ''}
Statistical insights: ${analyst.statisticalInsights.map((s) => `${s.topic}: ${s.detail} (${s.evidence})`).join('; ')}
` : '';

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
${factCheckSection}${analystSection}
CONFIDENCE
Score: ${confidence.score}/100 (${confidence.label})
Decision: ${confidence.decision}
Rationale: ${confidence.rationale}

INSTRUCTIONS
- Target length: 600-900 words for news; 1200-1800 for analysis, but prioritize evidence density over word count.
- Write as original editorial synthesis, never as a source-by-source paraphrase.
- Preserve uncertainty precisely: distinguish confirmed facts, attributed reports, and speculation.
- Make the headline specific and informative, never clickbait.
- The excerpt must add context rather than repeat the headline.
- Match the Qawla voice: authoritative, vivid, evidence-led.
- Open with a specific hook — never generic.
- Cite sources inline on first mention.
- If confidence is below "likely", include a clear verification caveat.
- If fact-check findings are provided above, respect the per-claim veracity —
  do not state an "unverified" or "likely_false" claim as settled fact.
- If tactical analysis is provided above, weave its specifics (formations,
  key battles, narrative context) into the reporting rather than ignoring it.
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
    task: 'writer',
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
    imageSourceUrl: event.imageSourceUrl ?? existing?.imageSourceUrl,
    imageSourceName: event.imageSourceName ?? existing?.imageSourceName,
    imageVerified: event.imageVerified ?? existing?.imageVerified,
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
  return runWriter(events, confidence, undefined, factCheck, analyst ?? undefined);
}
