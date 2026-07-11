import type { Metadata } from 'next';
import { PageHero } from '@/components/premium';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { AdBanner } from '@/components/AdBanner';
import { TRANSFERS } from '@/lib/mockData';
import { formatDate, formatCurrency } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Transfers — Verified transfer news with confidence scoring',
  description: 'Every transfer rumour scored by source reliability, cross-reference, and historical accuracy. No more guessing what is real.',
  alternates: { canonical: '/transfers' },
};

const STATUS_COLORS: Record<string, string> = {
  rumour: 'bg-gray-100 text-night/60',
  negotiating: 'bg-amber-100 text-amber-700',
  agreed: 'bg-blue-100 text-blue-700',
  medical: 'bg-purple-100 text-purple-700',
  signed: 'bg-emerald-100 text-emerald-700',
  rejected: 'bg-red-100 text-red-700',
  loan: 'bg-indigo-100 text-indigo-700',
};

// Real club crest URLs from Wikipedia commons (publicly available)
const CLUB_CRESTS: Record<string, string> = {
  'Real Madrid': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/120px-Real_Madrid_CF.svg.png',
  'Bayern Munich': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/120px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png',
  'Liverpool': 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/120px-Liverpool_FC.svg.png',
  'PSG': 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/120px-Paris_Saint-Germain_F.C..svg.png',
  'Inter Milan': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/FC_Internazionale_Milano_2021.svg/120px-FC_Internazionale_Milano_2021.svg.png',
  'Manchester City': 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/120px-Manchester_City_FC_badge.svg.png',
  'Arsenal': 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/120px-Arsenal_FC.svg.png',
  'Napoli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/SSC_Napoli.svg/120px-SSC_Napoli.svg.png',
  'Dortmund': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_Logo.svg/120px-Borussia_Dortmund_Logo.svg.png',
  'Barcelona': 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28crest%29.svg/120px-FC_Barcelona_%28crest%29.svg.png',
};

// NOTE: A static hand-typed map of "real" Wikimedia player photo URLs used to
// live here, but 4 of its 6 entries (Wirtz, Salah, Rashford, Haaland) shared
// the exact same hash-prefix folder ("8/8e/") in their Wikimedia Commons
// thumbnail path. Wikimedia's thumbnail hash prefix is deterministically
// derived from the filename — genuinely distinct files essentially never
// collide on that prefix. That pattern is strong evidence those URLs were
// fabricated rather than verified, which means they were very likely 404s in
// production (broken image icons on a page that's supposed to build trust).
// Rather than guess new URLs I also can't verify, this now always uses the
// deterministic, guaranteed-working ui-avatars.com initials fallback for
// every player. Qawla already has lib/imageMatcher.ts built specifically to
// resolve real player/club images via live search — wire that in here
// instead of reintroducing another hand-typed URL map.
const PLAYER_IMAGES: Record<string, string> = {};

function getCrest(clubName: string): string {
  return CLUB_CRESTS[clubName] || `https://ui-avatars.com/api/?name=${encodeURIComponent(clubName)}&size=80&background=060d1f&color=00d96a&font-size=0.4`;
}

function getPlayerImage(playerName: string): string {
  return PLAYER_IMAGES[playerName] || `https://ui-avatars.com/api/?name=${encodeURIComponent(playerName)}&size=100&background=060d1f&color=00d96a&font-size=0.35`;
}

export default function TransfersPage() {
  return (
    <>
      <PageHero
        eyebrow="Transfer tracker"
        title="Transfers, scored for"
        highlight="confidence."
        description="Every rumour ranked by source reliability, cross-reference, and historical accuracy. We tell you what is real — and what is not."
        variant="dark"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Transfers grid */}
        <section aria-labelledby="transfers-heading">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
            <h2 id="transfers-heading" className="font-display font-extrabold text-2xl sm:text-3xl text-night">
              Current transfer window
            </h2>
            <span className="text-sm text-night/60">Summer 2025</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {TRANSFERS.map((t) => (
              <div key={t.id} className="card p-5 hover:shadow-lg hover:shadow-pitch/5 transition-all">
                {/* Player header */}
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={getPlayerImage(t.player.name)}
                    alt={t.player.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-pitch/20"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-bold text-lg text-night truncate">{t.player.name}</h3>
                    <p className="text-xs text-night/50 capitalize">{t.player.type}</p>
                  </div>
                  <span className={`badge ${STATUS_COLORS[t.status]} capitalize shrink-0`}>{t.status}</span>
                </div>

                {/* From → To with club crests */}
                <div className="flex items-center justify-between gap-2 mb-4 p-3 rounded-xl bg-gray-50">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <img
                      src={getCrest(t.fromClub.name)}
                      alt={t.fromClub.name}
                      className="w-8 h-8 object-contain shrink-0"
                      loading="lazy"
                    />
                    <span className="text-xs sm:text-sm font-semibold text-night/70 truncate">{t.fromClub.name}</span>
                  </div>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pitch-dk shrink-0">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                  <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
                    <span className="text-xs sm:text-sm font-semibold text-night/70 truncate text-right">{t.toClub.name}</span>
                    <img
                      src={getCrest(t.toClub.name)}
                      alt={t.toClub.name}
                      className="w-8 h-8 object-contain shrink-0"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Fee & confidence */}
                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div>
                    <p className="text-xs text-night/50 uppercase tracking-wider">Fee</p>
                    <p className="font-bold text-night">{t.fee ? formatCurrency(t.fee, t.currency) : 'Undisclosed'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-night/50 uppercase tracking-wider">Type</p>
                    <p className="font-bold text-night capitalize">{t.type.replace('_', ' ')}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <ConfidenceBadge score={t.confidence.score} label={t.confidence.label} compact={false} />
                  <p className="text-xs text-night/50">Reported {formatDate(t.reportedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-10">
          <AdBanner slot="transfers-bottom" format="horizontal" />
        </div>
      </div>
    </>
  );
}
