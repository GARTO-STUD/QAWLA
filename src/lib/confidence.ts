// Qawla — Confidence scoring engine
// Composite weighted score with a decision gate that determines whether
// content publishes, holds for review, escalates, or is rejected.

import type { RawEvent, CredibilitySource, ConfidenceResult, ConfidenceBreakdown, DecisionLabel } from '@/types';

const WEIGHTS = {
  sourceTier: 0.4,
  crossReference: 0.3,
  entityMatch: 0.2,
  historical: 0.1,
} as const;

const TIER_SCORES: Record<string, number> = {
  official: 1.0,
  tier1: 0.9,
  tier2: 0.75,
  tier3: 0.55,
  social: 0.45,
};

export function scoreSourceTier(events: RawEvent[]): number {
  if (events.length === 0) return 0;
  // Take the maximum tier score across contributing sources
  const maxTier = Math.max(...events.map((e) => TIER_SCORES[e.sourceTier] ?? 0.5));
  // Slight bonus when multiple tier1 sources corroborate
  const tier1Count = events.filter((e) => e.sourceTier === 'tier1' || e.sourceTier === 'official').length;
  return Math.min(1, maxTier + (tier1Count > 1 ? 0.05 : 0));
}

export function scoreCrossReference(events: RawEvent[]): number {
  if (events.length === 0) return 0;
  if (events.length === 1) return 0.2;
  // 2 sources: 0.6, 3+: 0.85, 5+: 1.0
  if (events.length === 2) return 0.6;
  if (events.length <= 4) return 0.85;
  return 1.0;
}

export function scoreEntityMatch(events: RawEvent[]): number {
  if (events.length === 0) return 0;
  // Find the canonical entity set from the strongest event
  const canonical = new Set(events[0]!.entities.map((e) => e.name.toLowerCase()));
  if (canonical.size === 0) return 0.3;
  // Measure how many subsequent events share entities
  const matches = events.slice(1).map((ev) => {
    const overlap = ev.entities.filter((e) => canonical.has(e.name.toLowerCase())).length;
    return overlap / Math.max(canonical.size, 1);
  });
  if (matches.length === 0) return 0.5;
  const avg = matches.reduce((a, b) => a + b, 0) / matches.length;
  return Math.min(1, 0.5 + avg * 0.5);
}

export function scoreHistorical(sources: CredibilitySource[]): number {
  if (sources.length === 0) return 0.5;
  const avg = sources.reduce((sum, s) => sum + s.reliabilityScore, 0) / sources.length;
  return Math.min(1, avg);
}

export function computeConfidence(
  events: RawEvent[],
  sources: CredibilitySource[],
): ConfidenceResult {
  const sourceTierScore = scoreSourceTier(events);
  const crossRefScore = scoreCrossReference(events);
  const entityMatchScore = scoreEntityMatch(events);
  const historicalScore = scoreHistorical(sources);

  const breakdown: ConfidenceBreakdown = {
    sourceTier: sourceTierScore,
    crossReference: crossRefScore,
    entityMatch: entityMatchScore,
    historical: historicalScore,
  };

  const raw =
    sourceTierScore * WEIGHTS.sourceTier +
    crossRefScore * WEIGHTS.crossReference +
    entityMatchScore * WEIGHTS.entityMatch +
    historicalScore * WEIGHTS.historical;

  const score = Math.round(Math.max(0, Math.min(1, raw)) * 100);

  const { label, decision, rationale } = decide(score, events.length, breakdown);
  return {
    score,
    label,
    breakdown,
    rationale,
    decision,
    evaluatedAt: new Date().toISOString(),
  };
}

function decide(
  score: number,
  sourceCount: number,
  breakdown: ConfidenceBreakdown,
): { label: DecisionLabel; decision: ConfidenceResult['decision']; rationale: string } {
  // Hard rules first
  if (score >= 85 && sourceCount >= 2) {
    return {
      label: 'verified',
      decision: 'publish',
      rationale: `High-confidence (${score}) corroborated by ${sourceCount} independent sources. Source tier strength: ${(breakdown.sourceTier * 100).toFixed(0)}%.`,
    };
  }
  if (score >= 70 && sourceCount >= 2) {
    return {
      label: 'likely',
      decision: 'publish',
      rationale: `Likely accurate (${score}). Cross-reference strength ${(breakdown.crossReference * 100).toFixed(0)}%. Auto-publish with monitoring.`,
    };
  }
  if (score >= 55) {
    return {
      label: 'unverified',
      decision: 'hold',
      rationale: `Moderate confidence (${score}). Insufficient corroboration (sources: ${sourceCount}). Held for editorial review.`,
    };
  }
  if (score >= 35) {
    return {
      label: 'disputed',
      decision: 'escalate',
      rationale: `Low confidence (${score}). Conflicting or weak sourcing. Escalating to senior editor for verification.`,
    };
  }
  return {
    label: 'rejected',
    decision: 'reject',
    rationale: `Below threshold (${score}). Sources unreliable or uncorroborated. Rejecting per editorial standards.`,
  };
}

/* -------------------------------------------------------------------------- */
/* Decision engine — applies policy on top of confidence                       */
/* -------------------------------------------------------------------------- */

export interface DecisionContext {
  confidence: ConfidenceResult;
  isTransfer: boolean;
  involvesMinor?: boolean;
  hasLegalSensitivity?: boolean;
}

export function applyPolicy(ctx: DecisionContext): ConfidenceResult['decision'] {
  const { confidence, isTransfer, involvesMinor, hasLegalSensitivity } = ctx;
  // Minors: always escalate regardless of score
  if (involvesMinor) return 'escalate';
  // Legal sensitivity (e.g. ongoing court cases): never auto-publish
  if (hasLegalSensitivity && confidence.decision === 'publish') return 'hold';
  // Transfers: require the higher "verified" bar (score >= 85) to
  // auto-publish, not just "likely" (score >= 70) like regular news —
  // transfer rumors are inherently more speculative. This must only ever
  // make the outcome MORE restrictive, never less.
  //
  // IMPORTANT: 'publish' can only ever occur when score >= 70 in the first
  // place (see decide() above) — so a naive `score < 70 && decision ===
  // 'publish'` check (what a first attempt at this fix used) is logically
  // unreachable and would silently disable transfer caution entirely. The
  // real distinction that matters is inside the publish bucket itself:
  // 'likely' (70-84) vs 'verified' (85+).
  if (isTransfer && confidence.decision === 'publish' && confidence.score < 85) return 'hold';
  return confidence.decision;
}

/* -------------------------------------------------------------------------- */
/* Presentation helpers                                                        */
/* -------------------------------------------------------------------------- */

export function confidenceColor(score: number): { bg: string; text: string; border: string; ring: string; dot: string } {
  // `dot` uses literal Tailwind class strings (not built at runtime via
  // string replacement) so Tailwind's JIT/production build can actually see
  // and generate the CSS for them. ConfidenceBadge previously derived this
  // color by calling `colors.text.replace('text-', 'bg-')` at runtime —
  // since a string like "bg-emerald-700" never appears literally anywhere
  // in the source, Tailwind's static scan can't find it and won't emit that
  // rule in the production build, so the small "ping" indicator dot would
  // render with no background color at all once deployed.
  if (score >= 85) return { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200', ring: 'ring-emerald-500/20', dot: 'bg-emerald-700' };
  if (score >= 70) return { bg: 'bg-lime-100', text: 'text-lime-700', border: 'border-lime-200', ring: 'ring-lime-500/20', dot: 'bg-lime-700' };
  if (score >= 55) return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200', ring: 'ring-amber-500/20', dot: 'bg-amber-700' };
  if (score >= 35) return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', ring: 'ring-orange-500/20', dot: 'bg-orange-700' };
  return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', ring: 'ring-red-500/20', dot: 'bg-red-700' };
}

export function labelColor(label: DecisionLabel): string {
  switch (label) {
    case 'verified': return 'text-emerald-700 bg-emerald-100';
    case 'likely': return 'text-lime-700 bg-lime-100';
    case 'unverified': return 'text-amber-700 bg-amber-100';
    case 'disputed': return 'text-orange-700 bg-orange-100';
    case 'rejected': return 'text-red-700 bg-red-100';
    default: return 'text-slate-700 bg-slate-100';
  }
}
