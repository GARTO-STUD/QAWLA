'use client';

import { DashCard, ConfidenceRing } from '../shared';
import { SOURCES } from '@/lib/mockData';
import { formatRelative, cn } from '@/lib/utils';
import type { SourceTier } from '@/types';

const TIER_BADGE: Record<SourceTier, { label: string; cls: string }> = {
  official: { label: 'Official', cls: 'bg-pitch/15 text-pitch' },
  tier1: { label: 'Tier 1', cls: 'bg-emerald-500/15 text-emerald-400' },
  tier2: { label: 'Tier 2', cls: 'bg-blue-500/15 text-blue-400' },
  tier3: { label: 'Tier 3', cls: 'bg-amber-500/15 text-amber-400' },
  social: { label: 'Social', cls: 'bg-purple-500/15 text-purple-400' },
};

/**
 * SourcesTab — credibility source management.
 *
 * Top: aggregate stats (active sources, avg reliability, tiers).
 * Grid: source cards with reliability ring, tier badge, type,
 * last polled, and toggle.
 */
export function SourcesTab() {
  const active = SOURCES.filter((s) => s.active).length;
  const avgReliability = SOURCES.reduce((s, x) => s + x.reliabilityScore, 0) / SOURCES.length;
  const byTier = (tier: SourceTier) => SOURCES.filter((s) => s.tier === tier).length;

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox label="Active sources" value={active} variant="pitch" />
        <StatBox label="Avg reliability" value={`${Math.round(avgReliability * 100)}%`} />
        <StatBox label="Tier-1 sources" value={byTier('tier1')} />
        <StatBox label="Official feeds" value={byTier('official')} variant="gold" />
      </div>

      {/* Source grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SOURCES.map((s) => {
          const tier = TIER_BADGE[s.tier];
          return (
            <DashCard key={s.id} className="!p-4">
              <div className="flex items-start gap-3">
                <ConfidenceRing score={Math.round(s.reliabilityScore * 100)} size={48} stroke={4} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-display font-bold text-sm text-night truncate">{s.name}</h3>
                    <span className={cn('inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider', tier.cls)}>
                      {tier.label}
                    </span>
                  </div>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-night/50 hover:text-pitch truncate block"
                  >
                    {s.url.replace(/^https?:\/\//, '')}
                  </a>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-night/40">
                    <span className="capitalize">{s.type.replace('_', ' ')}</span>
                    <span>Polled {formatRelative(s.lastPolledAt || new Date().toISOString())}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-black/0.5 flex items-center justify-between">
                <span className={cn(
                  'inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider',
                  s.active ? 'text-pitch' : 'text-night/40',
                )}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', s.active ? 'bg-pitch animate-pulse' : 'bg-cream/30')} />
                  {s.active ? 'Active' : 'Paused'}
                </span>
                <button className="text-[11px] font-semibold text-night/55 hover:text-night transition-colors">
                  Configure →
                </button>
              </div>
            </DashCard>
          );
        })}
      </div>
    </div>
  );
}

function StatBox({ label, value, variant }: { label: string; value: string | number; variant?: 'pitch' | 'gold' }) {
  const cls = variant === 'pitch' ? 'text-pitch' : variant === 'gold' ? 'text-gold' : 'text-night';
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white shadow-sm hover:shadow-md transition-all rounded-2xl p-4">
      <p className={cn('font-display font-extrabold text-2xl tabular-nums', cls)}>{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-night/50 mt-1 font-semibold">{label}</p>
    </div>
  );
}

export default SourcesTab;
