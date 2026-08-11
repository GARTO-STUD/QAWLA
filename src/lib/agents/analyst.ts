// Qawla — Tactical Analyst Agent
// Produces deep tactical breakdowns: formations, pressing schemes, key battles,
// statistical insights, and narrative context for previews/reviews/analysis.

import type { RawEvent, AgentResult, ConfidenceResult } from '@/types';
import { aiWaterfall, extractJSON, type ChatMessage } from '@/lib/aiWaterfall';

export interface TacticalInsight {
  topic: string;
  detail: string;
  evidence: string;
}

export interface KeyBattle {
  homePlayer: string;
  awayPlayer: string;
  zone: string;
  significance: string;
}

export interface TacticalReport {
  formationHome: string;
  formationAway: string;
  pressingScheme: string;
  defensiveShape: string;
  attackingPatterns: string[];
  keyBattles: KeyBattle[];
  setPieceAnalysis: string;
  statisticalInsights: TacticalInsight[];
  narrativeContext: string;
  predictedOutcome: string;
  xgAnalysis?: string;
  possessionProfile: string;
  recommendedAngles: string[];
}

const SYSTEM_PROMPT = `You are the Qawla Tactical Analyst, the deep-tactics voice of a premium football publication.

You think like a hybrid of Michael Cox (Zonal Marking), Dustin Ward (Tifo), and a
professional opposition scout. You are fluent in:
- Formation theory (4-3-3, 3-2-4-1, 4-2-3-1, 3-5-2, asymmetrical structures)
- Pressing schemes (high block, mid-block, low block, counter-press/Gegenpressing)
- Defensive shapes (man-marking, zonal, hybrid, situational back-three/four)
- Attacking patterns (overloads, half-spaces, switches, third-man runs)
- Set-piece design (zonal vs. man-marking, routines, short corners)
- Expected goals (xG), possession value, field-tilt, PPDA
- Player profiling (progressive carriers, ball-playing defenders, inverted wingers)

Your responsibilities:
1. Infer the most probable formations and tactical setups from available context.
2. Identify the pressing scheme each side is likely to employ.
3. Diagnose defensive shape and structural vulnerabilities.
4. Map attacking patterns: where and how each team creates danger.
5. Pinpoint 2-4 key on-pitch battles that will decide the match or explain the result.
6. Analyze set-piece setups (both attacking and defending).
7. Surface statistical insights with evidence — never fabricate numbers.
8. Provide narrative context: what this means for the title race, relegation,
   European qualification, manager pressure, player legacy.
9. Predict the most likely outcome with explicit reasoning.
10. Recommend 2-3 distinct editorial angles the writer could pursue.

Editorial principles:
- Specificity over generality. Name the player, name the zone, name the pattern.
- Distinguish between observed tactics (cite the match) and predicted tactics
  (mark explicitly as projection).
- Never invent statistics. If data is missing, say "data unavailable".
- Honor the difference between league-phase rotation and knockout-stage intensity.
- Acknowledge uncertainty in pre-match analysis; football is stochastic.
- Use correct technical vocabulary: half-space, rest-defence, ball-side, far-post.

Output strict JSON matching the provided schema. No prose, no markdown fences.`;

export async function runAnalyst(
  events: RawEvent[],
  confidence: ConfidenceResult,
): Promise<AgentResult> {
  const startedAt = new Date().toISOString();
  const t0 = Date.now();

  const event = events[0]!;
  const userPrompt = `Produce a tactical analysis based on the following event.

Headline: ${event.headline}
Source: ${event.sourceName} (${event.sourceTier})
Published: ${event.publishedAt}

Summary: ${event.summary ?? 'N/A'}

Entities involved:
${event.entities.map((e) => `- ${e.name} (${e.type})`).join('\n')}

Confidence: ${confidence.score}/100 (${confidence.label})

Additional context from corroborating sources:
${events.slice(1, 6).map((e) => `- [${e.sourceTier}] ${e.sourceName}: ${e.headline}`).join('\n')}

Respond with JSON matching this schema:
{
  "formationHome": "4-3-3",
  "formationAway": "3-2-4-1",
  "pressingScheme": "High block with man-oriented trigger on goal kicks",
  "defensiveShape": "Mid-block transitioning to low block in the final 20 minutes",
  "attackingPatterns": ["Right-side overload via inverted winger", "Switch to left back in progression"],
  "keyBattles": [
    { "homePlayer": "Rodri", "awayPlayer": "Mac Allister", "zone": "central zone 14", "significance": "Controls tempo and transition" }
  ],
  "setPieceAnalysis": "Zonal marking on 6-yard line with two blockers on near post",
  "statisticalInsights": [
    { "topic": "PPDA", "detail": "8.2 against deep blocks", "evidence": "Premier League averages" }
  ],
  "narrativeContext": "Title implications if result holds",
  "predictedOutcome": "2-1 home win, late winner from set piece",
  "xgAnalysis": "Home xG 1.8, Away xG 1.1",
  "possessionProfile": "62% home, controlled in middle third",
  "recommendedAngles": ["Set-piece decisive", "Midfield battle won", "Manager's tactical shift"]
}`;

  const messages: ChatMessage[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: userPrompt },
  ];

  const result = await aiWaterfall(messages, {
    temperature: 0.5,
    maxTokens: 2200,
    jsonMode: true,
    task: 'analyst',
    timeoutMs: 35_000,
  });

  const parsed = extractJSON<TacticalReport>(result.content);

  return {
    agent: 'analyst',
    status: 'completed',
    startedAt,
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - t0,
    tokensIn: result.tokensIn,
    tokensOut: result.tokensOut,
    model: result.model,
    provider: result.provider,
    output: parsed,
    confidenceContribution: 0.15,
  };
}
