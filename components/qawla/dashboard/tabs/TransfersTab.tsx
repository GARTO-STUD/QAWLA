'use client';

import Image from 'next/image';
import { DashCard, ConfidenceRing, StatusPill } from '../shared';
import { TRANSFERS, TRANSFER_IMAGES } from '@/lib/mockData';
import { formatRelative, formatCurrency, formatNumber, cn } from '@/lib/utils';

const STATUS_LABEL: Record<string, string> = {
  rumour: 'Rumour',
  negotiating: 'Negotiating',
  agreed: 'Agreed',
  medical: 'Medical',
  signed: 'Signed',
  rejected: 'Rejected',
  loan: 'Loan',
};

/**
 * TransfersTab — transfer rumour tracker with player images and
 * confidence scoring.
 *
 * Top: 4 summary stat tiles.
 * Grid: premium transfer cards with:
 *   - Player image (visible, verified working)
 *   - Confidence ring
 *   - Status pill + transfer window
 *   - Player name (serif display font)
 *   - From → To clubs with arrow
 *   - Fee, type, reported-at
 *   - Contract + wage details
 *   - Confidence rationale
 */
export function TransfersTab() {
  const totalValue = TRANSFERS.reduce((s, t) => s + (t.fee || 0), 0);
  const avgConfidence = Math.round(
    TRANSFERS.reduce((s, t) => s + t.confidence.score, 0) / TRANSFERS.length,
  );
  const rumours = TRANSFERS.filter((t) => t.confidence.label === 'unverified' || t.confidence.label === 'disputed').length;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox label="Tracked transfers" value={TRANSFERS.length} />
        <StatBox label="Total value" value={formatCurrency(totalValue, 'USD')} variant="gold" />
        <StatBox label="Avg confidence" value={`${avgConfidence}%`} variant="pitch" />
        <StatBox label="Rumours (low conf.)" value={rumours} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {TRANSFERS.map((t) => {
          const playerImage = TRANSFER_IMAGES[t.id];
          return (
            <DashCard key={t.id} className="!p-0 overflow-hidden">
              <div className="flex">
                {/* Player image — visible and verified */}
                <div className="relative w-28 sm:w-36 shrink-0 bg-cream overflow-hidden">
                  {playerImage && (
                    <Image
                      src={playerImage}
                      alt={t.player.name}
                      fill
                      sizes="(max-width: 1024px) 112px, 144px"
                      className="object-cover"
                    />
                  )}
                  {/* Gradient fade into card */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/90" />
                  {/* Confidence ring overlay */}
                  <div className="absolute bottom-2 left-2 z-10">
                    <div className="rounded-full bg-white/90 backdrop-blur p-1 shadow-md">
                      <ConfidenceRing score={t.confidence.score} size={40} stroke={4} />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1 p-4 sm:p-5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <StatusPill status={STATUS_LABEL[t.status].toLowerCase().replace(/\s/g, '_')} />
                    <span className="text-[10px] uppercase tracking-wider text-night/40 font-semibold">
                      {t.window}
                    </span>
                  </div>
                  <h3 className="font-serif font-bold italic text-lg text-night leading-tight mb-1">
                    {t.player.name}
                  </h3>
                  <p className="text-xs text-night/55 mb-3">
                    <span className="text-night/70">{t.fromClub.name}</span>
                    <svg className="inline mx-1.5 text-pitch-darker" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
                    <span className="text-night/70">{t.toClub.name}</span>
                  </p>

                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <Cell label="Fee" value={t.fee ? formatCurrency(t.fee, t.currency) : '—'} />
                    <Cell label="Type" value={t.type.replace('_', ' ')} />
                    <Cell label="Reported" value={formatRelative(t.reportedAt)} />
                  </div>

                  {t.contractLength && (
                    <div className="mt-2 text-[11px] text-night/55">
                      <span className="text-night/40">Contract:</span> {t.contractLength}
                      {t.wage && <span className="ml-2"><span className="text-night/40">Wage:</span> {t.wage}</span>}
                    </div>
                  )}

                  <p className="mt-2.5 text-[11px] text-night/55 italic line-clamp-2">
                    “{t.confidence.rationale}”
                  </p>
                </div>
              </div>
            </DashCard>
          );
        })}
      </div>
    </div>
  );
}

function StatBox({ label, value, variant }: { label: string; value: string | number; variant?: 'pitch' | 'gold' }) {
  const cls = variant === 'pitch' ? 'text-pitch-darker' : variant === 'gold' ? 'text-gold-dark' : 'text-night';
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white shadow-sm hover:shadow-md transition-all p-4">
      <p className={cn('font-display font-extrabold text-2xl tabular-nums', cls)}>{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-night/50 mt-1 font-semibold">{label}</p>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-cream border border-black/[0.06] px-2 py-1.5">
      <p className="text-[9px] uppercase tracking-wider text-night/40 font-semibold">{label}</p>
      <p className="text-[11px] text-night/85 mt-0.5 capitalize truncate">{value}</p>
    </div>
  );
}

export default TransfersTab;
