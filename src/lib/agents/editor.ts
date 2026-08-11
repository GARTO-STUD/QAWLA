// Qawla — Editor Agent
// Final polish: structural edit, headline sharpening, fact-vs-prose consistency
// check, SEO meta, house-style enforcement, and publish readiness gate.

import type { Article, AgentResult, ConfidenceResult } from '@/types';
import { aiWaterfall, extractJSON, type ChatMessage } from '@/lib/aiWaterfall';

export interface EditorReport {
  editedTitle: string;
  editedSubtitle: string;
  editedExcerpt: string;
  editedMarkdown: string;
  seoMetaTitle: string; // <=60 chars
  seoMetaDescription: string; // <=155 chars
  ogTitle: string;
  ogDescription: string;
  editorialNotes: string[];
  styleViolations: string[];
  publishReady: boolean;
  recommendedImageQuery: string;
  changesSummary: string;
}

const SYSTEM_PROMPT = `You are the Qawla Editor, the final gatekeeper of a premium football publication.

You operate at the standard of a senior long-form editor at The Athletic or
The Guardian sport desk. Your job is to take the writer's draft and produce
a publication-ready final version while preserving factual integrity.

Your responsibilities:
1. Sharpen the headline. It must be specific, accurate, and vivid — never
   clickbait. Avoid generic verbs ("wins", "scores"). Use the most informative
   detail. Max 90 characters.
2. Tighten the deck/subtitle. It should add context the headline cannot carry.
3. Rewrite the excerpt for cards and SEO: 2 sentences, <=220 characters,
   accurately summarizing the story.
4. Perform a structural edit:
   - Does the lede earn the reader's attention?
   - Is the nut graf in the first 3 paragraphs?
   - Are sections in logical order?
   - Does the close land?
5. Enforce house style:
   - Active voice preferred.
   - No clichés ("must-win", "statement victory", "six-pointer").
   - Specific names over generic descriptors.
   - Source attribution on first mention only.
   - Quotes attributed precisely; no invented quotes.
   - Numbers spelled out under 10, numerals for 10+.
   - Club names: full first mention, then short form (e.g. "Manchester City" → "City").
6. Cross-check facts against the confidence report. If the writer overstated
   certainty, soften the language. If the writer hedged unnecessarily, tighten.
7. Generate SEO metadata: title <=60 chars, description <=155 chars.
8. Generate Open Graph title/description for social cards.
9. Recommend a hero image search query (concrete: team + player + action).
10. Make the final publish/no-publish call.

Editorial principles:
- Never introduce new facts. You can restructure, sharpen, and rephrase — never invent.
- Preserve the writer's voice; do not homogenize.
- If the draft is publish-ready, return it largely unchanged with notes explaining why.
- If the draft has structural issues, rewrite — but preserve every sourced fact.
- The publishReady flag is true only if: headline is sharp, lede earns attention,
  nut graf is clear, no style violations remain, confidence caveat is honored.

Output strict JSON matching the provided schema. No prose, no markdown fences.`;

export async function runEditor(
  article: Article,
  confidence: ConfidenceResult,
): Promise<AgentResult> {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();

  const userPrompt = `Perform the final editorial pass on this draft.

ARTICLE DRAFT
Title: ${article.title}
Subtitle: ${article.subtitle ?? 'N/A'}
Excerpt: ${article.excerpt}
Category: ${article.category}
Tags: ${article.tags.join(', ')}
Reading time: ${article.readingTimeMinutes} min

CONFIDENCE
Score: ${confidence.score}/100 (${confidence.label})
Decision: ${confidence.decision}
Rationale: ${confidence.rationale}

MARKDOWN BODY
${article.content}

INSTRUCTIONS
- Apply the full editorial pass per your standards.
- Preserve every sourced fact; never invent.
- Honor the confidence caveat in the prose.
- Produce publish-ready metadata.

Respond with JSON matching this schema:
{
  "editedTitle": "string",
  "editedSubtitle": "string",
  "editedExcerpt": "string (<=220 chars)",
  "editedMarkdown": "the polished full article",
  "seoMetaTitle": "string (<=60 chars)",
  "seoMetaDescription": "string (<=155 chars)",
  "ogTitle": "string",
  "ogDescription": "string",
  "editorialNotes": ["what you changed and why"],
  "styleViolations": ["any remaining issues — empty array if clean"],
  "publishReady": true,
  "recommendedImageQuery": "concrete image search query",
  "changesSummary": "1-2 sentence summary of edits"
}`;

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];

  const result = await aiWaterfall(messages, {
    temperature: 0.4,
    maxTokens: 2600,
    jsonMode: true,
    task: 'editor',
    timeoutMs: 40_000,
  });

  const parsed = extractJSON<EditorReport>(result.content);

  // Apply edits to the article in-place
  const editedArticle: Article = {
    ...article,
    title: parsed.editedTitle || article.title,
    subtitle: parsed.editedSubtitle || article.subtitle,
    excerpt: parsed.editedExcerpt || article.excerpt,
    content: parsed.editedMarkdown || article.content,
    updatedAt: new Date().toISOString(),
    status: parsed.publishReady ? 'published' : 'in_review',
    ogImage: article.ogImage ?? `/api/og/${article.id}`,
  };

  return {
    agent: 'editor',
    status: 'completed',
    startedAt,
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - t0,
    tokensIn: result.tokensIn,
    tokensOut: result.tokensOut,
    model: result.model,
    provider: result.provider,
    output: editedArticle,
    confidenceContribution: 0.05,
  };
}
