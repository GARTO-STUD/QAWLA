// Qawla — Fact-checker Agent
// Verifies key claims against source corroboration, flags contradictions,
// rates claim-level veracity, and produces a structured verification report.

import type { RawEvent, AgentResult, ConfidenceResult } from '@/types';
import type { ScoutReport } from '@/lib/agents/scout';
import { aiWaterfall, extractJSON, searchWebForContext, type ChatMessage } from '@/lib/aiWaterfall';

export interface ClaimVerification {
  claim: string;
  veracity: 'confirmed' | 'likely_true' | 'unverified' | 'likely_false' | 'false';
  corroboratingSources: string[];
  contradictingSources: string[];
  notes: string;
}

export interface FactCheckReport {
  overallVerdict: 'confirmed' | 'mostly_confirmed' | 'partially_confirmed' | 'unverified' | 'disputed';
  claims: ClaimVerification[];
  contradictions: string[];
  missingInformation: string[];
  recommendedActions: string[];
  confidenceAdjustment: number; // -20..+20 delta to apply to base confidence
  factCheckScore: number; // 0..100
}

const SYSTEM_PROMPT = `You are the Qawla Fact-checker, the verification layer of a premium football newsroom.

You operate with the rigor of a Reuters fact-check desk combined with the domain
expertise of a senior football investigator. Your single job is to verify claims
before they reach readers.

Methodology:
1. Decompose the scouting report into atomic, verifiable claims.
2. For each claim, attempt independent corroboration across the provided sources.
3. Cite specific source names when a claim is supported or contradicted.
4. Rate each claim's veracity on a 5-point scale:
   - confirmed: multiple independent tier-1 sources agree
   - likely_true: at least one tier-1 source plus consistent circumstantial evidence
   - unverified: only weak or single-source reporting
   - likely_false: contradicted by more reliable sources
   - false: demonstrably incorrect, retract
5. Surface explicit contradictions between sources — do not smooth them over.
6. Identify missing information that would be required for full verification.
7. Recommend concrete next steps: "seek official confirmation", "request comment",
   "monitor for 30 minutes", "publish with caveat", "do not publish".

Editorial principles:
- Treat social-media-only claims with skepticism unless from a credentialed insider
  with a documented track record (e.g. Ornstein, Romano, Fabrizio).
- Transfer rumors require status clarity: rumour vs. negotiated vs. signed.
- Injuries require official medical statements, not training-ground whispers.
- Quotes must be attributable to a named source or credentialed journalist.
- Never inflate confidence to satisfy a deadline. Hold the story if unsure.
- Apply a confidence adjustment: -20 if any claim is likely_false, +10 if all
  claims are confirmed by 3+ sources.

Output strict JSON matching the provided schema. No prose, no markdown fences.`;

export async function runFactCheck(
  events: RawEvent[],
  scoutResult: AgentResult,
): Promise<AgentResult> {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();
  const report = scoutResult.output as ScoutReport | undefined;

  if (!report) {
    return {
      agent: 'factCheck',
      status: 'failed',
      startedAt,
      completedAt: new Date().toISOString(),
      durationMs: 0,
      error: 'Scout report missing',
    };
  }

  // Perform Tavily web search to enrich fact-checking with live web data
  let webContext = '';
  try {
    const searchQuery = report.primaryEvent.headline.slice(0, 100);
    webContext = await searchWebForContext(searchQuery, 5);
  } catch {
    // Tavily not configured or failed — continue without web context
  }

  const userPrompt = `Verify the following scouting report.

Primary event: ${report.primaryEvent.headline}
Source: ${report.primaryEvent.sourceName} (${report.primaryEvent.sourceTier})
Published: ${report.primaryEvent.publishedAt}

Corroborating events: ${report.corroboratingEvents.length}
${report.corroboratingEvents.map((e) => `- [${e.sourceTier}] ${e.sourceName}: ${e.headline}`).join('\n')}

Key claims to verify:
${report.keyClaims.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Available sources (with tiers):
${events.map((e) => `- [${e.sourceTier}] ${e.sourceName}: ${e.headline}`).join('\n')}

${webContext ? `Live web search results (via Tavily):\n${webContext}\n` : ''}
Respond with JSON matching this schema:
{
  "overallVerdict": "confirmed|mostly_confirmed|partially_confirmed|unverified|disputed",
  "claims": [
    {
      "claim": "string",
      "veracity": "confirmed|likely_true|unverified|likely_false|false",
      "corroboratingSources": ["source names"],
      "contradictingSources": ["source names"],
      "notes": "string"
    }
  ],
  "contradictions": ["explicit contradictions between sources"],
  "missingInformation": ["what we need to fully verify"],
  "recommendedActions": ["concrete next steps"],
  "confidenceAdjustment": -20,
  "factCheckScore": 75
}`;

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];

  const result = await aiWaterfall(messages, {
    temperature: 0.2,
    maxTokens: 1800,
    jsonMode: true,
    timeoutMs: 30_000,
  });

  const parsed = extractJSON<FactCheckReport>(result.content);

  return {
    agent: 'factCheck',
    status: 'completed',
    startedAt,
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - t0,
    tokensIn: result.tokensIn,
    tokensOut: result.tokensOut,
    model: result.model,
    provider: result.provider,
    output: parsed,
    confidenceContribution: (parsed.factCheckScore ?? 50) * 0.3 / 100,
  };
}

export async function runFactCheckStandalone(
  events: RawEvent[],
  confidence: ConfidenceResult,
): Promise<AgentResult> {
  // Used when scout output isn't available — synthesize a minimal scout report
  const minimal: AgentResult = {
    agent: 'scout',
    status: 'completed',
    startedAt: new Date().toISOString(),
    completedAt: new Date().toISOString(),
    durationMs: 0,
    output: {
      primaryEvent: events[0]!,
      corroboratingEvents: events.slice(1),
      deduplicated: true,
      entities: events[0]!.entities,
      signalStrength: 'medium',
      category: events[0]!.category,
      recommendedTreatment: 'news',
      summary: events[0]!.summary ?? events[0]!.headline,
      keyClaims: [events[0]!.headline],
      novelAngle: '',
      targetWordCount: 600,
    } as ScoutReport,
  };
  void confidence;
  return runFactCheck(events, minimal);
}
