// Qawla — Scout Agent
// First-pass intake: triages raw events, deduplicates, ranks by signal strength,
// extracts entities, and produces a structured "scouting report" for downstream agents.

import type { RawEvent, AgentResult, ConfidenceResult, Entity } from '@/types';
import { aiWaterfall, extractJSON, type ChatMessage } from '@/lib/aiWaterfall';

export interface ScoutReport {
  primaryEvent: RawEvent;
  corroboratingEvents: RawEvent[];
  deduplicated: boolean;
  entities: Entity[];
  signalStrength: 'breaking' | 'high' | 'medium' | 'low';
  category: RawEvent['category'];
  recommendedTreatment: 'news' | 'analysis' | 'live_blog' | 'transfer_tracker';
  summary: string;
  keyClaims: string[];
  novelAngle: string;
  targetWordCount: number;
}

const SYSTEM_PROMPT = `You are the Qawla Scout, the intake editor of a premium football newsroom.

Your role is to triage a batch of raw events harvested from RSS feeds, official APIs,
and credentialed social sources. You think like a senior football journalist with
deep knowledge of the global game: Premier League, La Liga, Serie A, Bundesliga,
Ligue 1, Champions League, international football, and emerging markets.

Your responsibilities:
1. Identify the primary event — the single strongest signal in the batch.
2. Detect corroborating events that independently confirm the same story.
3. Deduplicate near-identical reports while preserving distinct angles.
4. Extract canonical entities (players, clubs, managers, competitions).
5. Rate signal strength using these thresholds:
   - breaking: official confirmation OR 3+ tier-1 sources within 30 minutes
   - high: 2+ tier-1 sources within 2 hours, consistent facts
   - medium: 1 tier-1 source plus corroborating tier-2/social
   - low: single source or conflicting reports
6. Recommend treatment: a hard news story, long-form analysis, live blog,
   or transfer tracker entry.
7. Surface a novel angle — what makes this story worth Qawla's editorial
   standard beyond wire-service repetition.
8. Estimate target word count based on signal strength and category.

Editorial principles:
- Never invent facts. If information is missing, mark it as unknown.
- Distinguish between confirmed facts, sourced claims, and speculation.
- Be precise about transfer status: rumour, negotiating, agreed, medical, signed.
- Respect the difference between official announcements and journalistic reporting.
- Note any contradictions between sources explicitly.

Output strict JSON matching the provided schema. No prose, no markdown fences.`;

export async function runScout(
  events: RawEvent[],
  confidence: ConfidenceResult,
): Promise<AgentResult> {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();

  if (events.length === 0) {
    return {
      agent: 'scout',
      status: 'failed',
      startedAt,
      completedAt: new Date().toISOString(),
      durationMs: 0,
      error: 'No events provided to scout',
    };
  }

  const userPrompt = `Triage the following raw events and produce a scouting report.

Confidence score: ${confidence.score}/100 (${confidence.label})
Decision: ${confidence.decision}

Events (JSON):
${JSON.stringify(events.slice(0, 12).map((e) => ({
  id: e.id,
  source: e.sourceName,
  tier: e.sourceTier,
  headline: e.headline,
  summary: e.summary,
  publishedAt: e.publishedAt,
  entities: e.entities.map((en) => en.name),
  url: e.url,
})), null, 2)}

Respond with JSON matching this schema:
{
  "primaryEventId": "string",
  "corroboratingEventIds": ["string"],
  "deduplicated": true,
  "entities": [{ "name": "string", "type": "player|club|manager|competition|nation" }],
  "signalStrength": "breaking|high|medium|low",
  "category": "transfers|previews|reviews|tactical|opinion|live|youth|international",
  "recommendedTreatment": "news|analysis|live_blog|transfer_tracker",
  "summary": "2-3 sentence newsroom-ready summary",
  "keyClaims": ["distinct factual claims worth verifying"],
  "novelAngle": "what makes this story worth Qawla's coverage",
  "targetWordCount": 600
}`;

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];

  const result = await aiWaterfall(messages, {
    temperature: 0.3,
    maxTokens: 1500,
    jsonMode: true,
    timeoutMs: 25_000,
  });

  const parsed = extractJSON<{
    primaryEventId: string;
    corroboratingEventIds: string[];
    entities: Entity[];
    signalStrength: ScoutReport['signalStrength'];
    category: RawEvent['category'];
    recommendedTreatment: ScoutReport['recommendedTreatment'];
    summary: string;
    keyClaims: string[];
    novelAngle: string;
    targetWordCount: number;
  }>(result.content);

  const primary = events.find((e) => e.id === parsed.primaryEventId) ?? events[0]!;
  const corroborating = events.filter((e) => parsed.corroboratingEventIds.includes(e.id));
  const report: ScoutReport = {
    primaryEvent: primary,
    corroboratingEvents: corroborating,
    deduplicated: true,
    entities: parsed.entities ?? primary.entities,
    signalStrength: parsed.signalStrength,
    category: parsed.category ?? primary.category,
    recommendedTreatment: parsed.recommendedTreatment,
    summary: parsed.summary,
    keyClaims: parsed.keyClaims ?? [],
    novelAngle: parsed.novelAngle,
    targetWordCount: parsed.targetWordCount ?? 600,
  };

  return {
    agent: 'scout',
    status: 'completed',
    startedAt,
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - t0,
    tokensIn: result.tokensIn,
    tokensOut: result.tokensOut,
    model: result.model,
    provider: result.provider,
    output: report,
    confidenceContribution: confidence.score * 0.4 / 100,
  };
}
