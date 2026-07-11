'use client';

import { useEffect, useState, useRef } from 'react';
import { PageHero } from '@/components/premium';
import { EmptyState } from '@/components/premium';
import { LIVE_MATCHES, LIVE_EVENTS } from '@/lib/mockData';
import type { LiveMatch, LiveEvent } from '@/types';
import { cn } from '@/lib/utils';

const EVENT_ICONS: Record<string, string> = {
  goal: '⚽',
  yellow_card: '🟨',
  red_card: '🟥',
  substitution: '🔄',
  penalty: '🎯',
  var: '📺',
  halftime: '⏸️',
  fulltime: '🏁',
  kickoff: '⚽',
  chance: '🔥',
  commentary: '📝',
  injury: '🩹',
};

export default function LivePage() {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(LIVE_MATCHES[0]?.id ?? '');
  const [events, setEvents] = useState<LiveEvent[]>(LIVE_EVENTS);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const selectedMatch = LIVE_MATCHES.find((m) => m.id === selectedMatchId);
  const matchEvents = events.filter((e) => e.matchId === selectedMatchId).sort((a, b) => b.minute - a.minute);

  // Simulated SSE: in production, /api/live would stream real events.
  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/live');
      eventSourceRef.current = es;
      es.onopen = () => setConnected(true);
      es.onerror = () => {
        setConnected(false);
        // IMPORTANT: do NOT call es.close() here. The browser's native
        // EventSource already retries automatically after a connection
        // error (readyState briefly goes CONNECTING, then reconnects on its
        // own) — calling close() ourselves permanently ends it instead,
        // since a closed EventSource never reconnects. The previous version
        // closed the connection on the very first transient error (e.g. a
        // normal Cloudflare Workers connection recycle) and killed the live
        // feed for the rest of the session, while the UI kept claiming
        // "Reconnecting…" the whole time.
      };
      es.addEventListener('event', (e) => {
        try {
          const data = JSON.parse((e as MessageEvent).data) as LiveEvent;
          setEvents((prev) => prev.some((ev) => ev.id === data.id) ? prev : [data, ...prev]);
        } catch { /* ignore */ }
      });
    } catch {
      // EventSource unsupported (e.g. very old browser) — no live fallback,
      // page still works with the initial static events.
    }
    return () => {
      es?.close();
    };
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Live matches"
        title="Real-time football,"
        highlight="as it happens."
        description="Live match commentary, goals, cards, and tactical notes delivered via Server-Sent Events. Tap a match to follow the action."
        variant="pitch"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Connection indicator */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className={cn(
              'relative flex h-2.5 w-2.5',
            )}>
              <span className={cn(
                'absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping',
                connected ? 'bg-pitch' : 'bg-amber-400',
              )} />
              <span className={cn(
                'relative inline-flex rounded-full h-2.5 w-2.5',
                connected ? 'bg-pitch' : 'bg-amber-400',
              )} />
            </span>
            <span className="text-sm font-semibold text-night/70">
              {connected ? 'Live · connected' : 'Reconnecting…'}
            </span>
          </div>
          <span className="text-sm text-night/50">{LIVE_MATCHES.filter(m => m.status === 'live' || m.status === 'halftime').length} live now</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Match list */}
          <div className="lg:col-span-1 space-y-3">
            <h2 className="font-display font-bold text-lg text-night mb-3">Matches</h2>
            {LIVE_MATCHES.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                selected={match.id === selectedMatchId}
                onClick={() => setSelectedMatchId(match.id)}
              />
            ))}
          </div>

          {/* Commentary feed */}
          <div className="lg:col-span-2">
            {selectedMatch ? (
              <div className="card overflow-hidden">
                {/* Match header */}
                <div className="p-5 sm:p-6 night-gradient pitch-pattern text-cream">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-cream/70">
                      {selectedMatch.competition} · {selectedMatch.matchday}
                    </span>
                    {selectedMatch.status === 'live' && (
                      <span className="badge bg-pitch text-white">
                        <span className="relative flex h-2 w-2">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                        </span>
                        LIVE {selectedMatch.minute}'
                      </span>
                    )}
                    {selectedMatch.status === 'halftime' && <span className="badge bg-amber-500 text-white">Half-time</span>}
                    {selectedMatch.status === 'scheduled' && <span className="badge bg-white/15 text-cream backdrop-blur">Upcoming</span>}
                  </div>
                  <div className="grid grid-cols-3 items-center gap-2">
                    <TeamBlock name={selectedMatch.homeTeam.name} shortName={selectedMatch.homeTeam.shortName} />
                    <div className="text-center">
                      {selectedMatch.status === 'scheduled' ? (
                        <div className="text-2xl sm:text-3xl font-display font-extrabold text-cream/60">vs</div>
                      ) : (
                        <div className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold text-cream">
                          {selectedMatch.homeScore} - {selectedMatch.awayScore}
                        </div>
                      )}
                    </div>
                    <TeamBlock name={selectedMatch.awayTeam.name} shortName={selectedMatch.awayTeam.shortName} />
                  </div>
                  {selectedMatch.venue && (
                    <p className="mt-4 text-center text-xs text-cream/60">{selectedMatch.venue}</p>
                  )}
                </div>

                {/* Commentary */}
                <div className="p-5 sm:p-6">
                  <h3 className="font-display font-bold text-base text-night mb-4 flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pitch-dk">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Live commentary
                  </h3>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {matchEvents.length === 0 ? (
                      <EmptyState
                        title="No events yet"
                        description="Events will appear here as the match unfolds."
                        icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>}
                      />
                    ) : (
                      matchEvents.map((event) => (
                        <EventRow key={event.id} event={event} />
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <EmptyState
                title="Select a match"
                description="Choose a match from the list to view live commentary."
                icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6" /></svg>}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function MatchCard({ match, selected, onClick }: { match: LiveMatch; selected: boolean; onClick: () => void }) {
  const isLive = match.status === 'live' || match.status === 'halftime';
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left p-4 rounded-xl border transition-all min-h-[80px]',
        selected ? 'border-pitch bg-pitch/5 shadow-md' : 'border-gray-200 bg-white hover:border-pitch/50',
      )}
      aria-pressed={selected}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-night/50">{match.competition}</span>
        {isLive ? (
          <span className="badge bg-pitch text-white text-[10px]">{match.status === 'halftime' ? 'HT' : `${match.minute}'`}</span>
        ) : match.status === 'scheduled' ? (
          <span className="badge bg-gray-100 text-night/60 text-[10px]">Upcoming</span>
        ) : (
          <span className="badge bg-gray-100 text-night/60 text-[10px]">FT</span>
        )}
      </div>
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-bold text-night truncate flex-1">{match.homeTeam.shortName}</span>
        <span className="font-display font-extrabold text-base text-night">
          {match.status === 'scheduled' ? '–' : match.homeScore}
        </span>
        <span className="text-night/30 text-xs">vs</span>
        <span className="font-display font-extrabold text-base text-night">
          {match.status === 'scheduled' ? '–' : match.awayScore}
        </span>
        <span className="text-sm font-bold text-night truncate flex-1 text-right">{match.awayTeam.shortName}</span>
      </div>
    </button>
  );
}

function TeamBlock({ name, shortName }: { name: string; shortName: string }) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-full bg-white/10 backdrop-blur flex items-center justify-center font-display font-extrabold text-cream text-sm sm:text-base mb-2">
        {shortName.slice(0, 3)}
      </div>
      <p className="text-xs sm:text-sm font-semibold text-cream/90 leading-tight">{name}</p>
    </div>
  );
}

function EventRow({ event }: { event: LiveEvent }) {
  return (
    <div className="flex gap-3 group">
      <div className="flex-shrink-0 w-12 text-right">
        <span className="font-mono font-bold text-sm text-pitch-dk">{event.minute}'</span>
      </div>
      <div className="flex-shrink-0 text-xl">{EVENT_ICONS[event.type] ?? '📝'}</div>
      <div className="flex-1 pb-3 border-b border-gray-100 group-last:border-0">
        {event.player && <span className="font-bold text-night text-sm">{event.player} — </span>}
        <span className="text-sm text-night/80">{event.description}</span>
        {event.detail && <p className="text-xs text-night/50 mt-0.5">{event.detail}</p>}
      </div>
    </div>
  );
}
