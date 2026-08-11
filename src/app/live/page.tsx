'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { PageHero } from '@/components/premium';
import { EmptyState } from '@/components/premium';
import { Reveal, StaggerContainer, StaggerItem, FadeIn } from '@/components/motion';
import { LIVE_MATCHES, LIVE_EVENTS } from '@/lib/mockData';
import type { LiveMatch, LiveEvent } from '@/types';
import { cn } from '@/lib/utils';

const EVENT_STYLE: Record<string, { icon: string; color: string; bg: string }> = {
  goal:          { icon: '⚽', color: 'text-pitch-dk',  bg: 'bg-pitch/10' },
  yellow_card:   { icon: '🟨', color: 'text-amber-600', bg: 'bg-amber-100' },
  red_card:      { icon: '🟥', color: 'text-red-600',   bg: 'bg-red-100' },
  substitution:  { icon: '🔄', color: 'text-blue-600',  bg: 'bg-blue-100' },
  penalty:       { icon: '🎯', color: 'text-purple-600',bg: 'bg-purple-100' },
  var:           { icon: '📺', color: 'text-night/60',  bg: 'bg-night/5' },
  halftime:      { icon: '⏸️', color: 'text-amber-600', bg: 'bg-amber-100' },
  fulltime:      { icon: '🏁', color: 'text-night/60',  bg: 'bg-night/5' },
  kickoff:       { icon: '⚽', color: 'text-pitch-dk',  bg: 'bg-pitch/10' },
  chance:        { icon: '🔥', color: 'text-orange-600',bg: 'bg-orange-100' },
  commentary:    { icon: '📝', color: 'text-night/60',  bg: 'bg-night/5' },
  injury:        { icon: '🩹', color: 'text-red-500',   bg: 'bg-red-50' },
};

/** A 3-letter monogram for a team — no images. */
function monogram(name: string): string {
  const cleaned = name.replace(/^FC\s+/, '').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 3).toUpperCase();
  return (parts[0][0] + parts[1][0] + (parts[2]?.[0] ?? '')).toUpperCase();
}

export default function LivePage() {
  const [selectedMatchId, setSelectedMatchId] = useState<string>(LIVE_MATCHES[0]?.id ?? '');
  const [events, setEvents] = useState<LiveEvent[]>(LIVE_EVENTS);
  const [connected, setConnected] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const selectedMatch = LIVE_MATCHES.find((m) => m.id === selectedMatchId);
  const matchEvents = events.filter((e) => e.matchId === selectedMatchId).sort((a, b) => b.minute - a.minute);

  useEffect(() => {
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/live');
      eventSourceRef.current = es;
      es.onopen = () => setConnected(true);
      es.onerror = () => {
        setConnected(false);
        // Do NOT call es.close() — native EventSource auto-retries.
      };
      es.addEventListener('event', (e) => {
        try {
          const data = JSON.parse((e as MessageEvent).data) as LiveEvent;
          setEvents((prev) => prev.some((ev) => ev.id === data.id) ? prev : [data, ...prev]);
        } catch { /* ignore */ }
      });
    } catch {
      // EventSource unsupported — page works with static events.
    }
    return () => {
      es?.close();
    };
  }, []);

  const liveCount = LIVE_MATCHES.filter(m => m.status === 'live' || m.status === 'halftime').length;

  return (
    <>
      <PageHero
        eyebrow="Live matches"
        title="Real-time football,"
        highlight="as it happens."
        description="Live match commentary, goals, cards, and tactical notes delivered via Server-Sent Events. Tap a match to follow the action."
        variant="light"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Connection bar */}
        <Reveal className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-white border border-black/5 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping', connected ? 'bg-pitch' : 'bg-amber-400')} />
              <span className={cn('relative inline-flex rounded-full h-2.5 w-2.5', connected ? 'bg-pitch' : 'bg-amber-400')} />
            </span>
            <span className="text-xs font-bold text-night/70">
              {connected ? 'Live · connected' : 'Reconnecting…'}
            </span>
          </div>
          <span className="text-xs text-night/50 font-mono">{liveCount} live now · {LIVE_MATCHES.length} total</span>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 lg:gap-8">
          {/* Match list */}
          <div className="lg:order-1">
            <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-night/50 mb-3 px-1">Matches</h2>
            <StaggerContainer className="space-y-2.5" stagger={0.05}>
              {LIVE_MATCHES.map((match) => (
                <StaggerItem key={match.id}>
                  <MatchCard
                    match={match}
                    selected={match.id === selectedMatchId}
                    onClick={() => setSelectedMatchId(match.id)}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          {/* Match detail + commentary */}
          <div className="lg:order-2">
            {selectedMatch ? (
              <FadeIn key={selectedMatchId}>
                {/* Scoreboard */}
                <div className="relative overflow-hidden rounded-3xl bg-night text-cream shadow-xl shadow-night/20">
                  {/* Pitch-pattern texture */}
                  <div className="absolute inset-0 pitch-pattern opacity-40" aria-hidden />
                  <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-pitch/15 blur-3xl" aria-hidden />
                  <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-gold/10 blur-3xl" aria-hidden />

                  <div className="relative p-6 sm:p-8">
                    {/* Top row: comp + status */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-cream/55">
                        {selectedMatch.competition} · {selectedMatch.matchday}
                      </span>
                      {selectedMatch.status === 'live' && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                          </span>
                          LIVE {selectedMatch.minute}'
                        </span>
                      )}
                      {selectedMatch.status === 'halftime' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300">Half-time</span>
                      )}
                      {selectedMatch.status === 'scheduled' && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/10 text-cream/70">Upcoming</span>
                      )}
                    </div>

                    {/* Teams + score */}
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:gap-6">
                      <TeamBlock name={selectedMatch.homeTeam.name} monogram={monogram(selectedMatch.homeTeam.name)} align="left" />
                      <div className="text-center">
                        {selectedMatch.status === 'scheduled' ? (
                          <div className="font-serif italic text-2xl sm:text-3xl text-cream/50">vs</div>
                        ) : (
                          <div className="font-serif font-bold text-4xl sm:text-5xl lg:text-6xl text-cream leading-none tabular-nums">
                            {selectedMatch.homeScore}<span className="text-cream/25 mx-2">–</span>{selectedMatch.awayScore}
                          </div>
                        )}
                      </div>
                      <TeamBlock name={selectedMatch.awayTeam.name} monogram={monogram(selectedMatch.awayTeam.name)} align="right" />
                    </div>

                    {/* Venue + formations */}
                    <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] text-cream/55">
                      {selectedMatch.venue && <span>📍 {selectedMatch.venue}</span>}
                      {selectedMatch.homeTeam.formation && (
                        <span>{selectedMatch.homeTeam.shortName} {selectedMatch.homeTeam.formation}</span>
                      )}
                      {selectedMatch.awayTeam.formation && (
                        <span>{selectedMatch.awayTeam.formation} {selectedMatch.awayTeam.shortName}</span>
                      )}
                      {selectedMatch.referee && <span>🧑‍⚖️ {selectedMatch.referee}</span>}
                    </div>
                  </div>
                </div>

                {/* Commentary timeline */}
                <div className="mt-6 rounded-3xl bg-white border border-black/5 overflow-hidden">
                  <div className="px-5 sm:px-6 py-4 border-b border-black/5 flex items-center justify-between">
                    <h3 className="font-display font-bold text-sm text-night flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pitch-dk">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Live commentary
                    </h3>
                    <span className="text-[11px] text-night/40 font-mono">{matchEvents.length} events</span>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="space-y-1 max-h-[560px] overflow-y-auto pr-2 scroll-area-qawla">
                      {matchEvents.length === 0 ? (
                        <EmptyState
                          title="No events yet"
                          description="Events will appear here as the match unfolds."
                          icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /></svg>}
                        />
                      ) : (
                        <div className="relative">
                          {/* Timeline vertical line */}
                          <div className="absolute left-[22px] top-2 bottom-2 w-px bg-black/8" aria-hidden />
                          {matchEvents.map((event, i) => (
                            <EventRow key={event.id} event={event} isLast={i === matchEvents.length - 1} />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </FadeIn>
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
        'w-full text-left p-3.5 rounded-2xl border transition-all min-h-[72px]',
        selected
          ? 'border-pitch bg-pitch/5 shadow-md shadow-pitch/10'
          : 'border-black/8 bg-white hover:border-pitch/40 hover:shadow-sm',
      )}
      aria-pressed={selected}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-[9px] font-bold uppercase tracking-wider text-night/45 truncate">{match.competition}</span>
        {isLive ? (
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-pitch text-night">
            <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
            {match.status === 'halftime' ? 'HT' : `${match.minute}'`}
          </span>
        ) : match.status === 'scheduled' ? (
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-night/5 text-night/50">Soon</span>
        ) : (
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase bg-night/5 text-night/50">FT</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className={cn('text-sm font-bold flex-1 truncate', selected ? 'text-night' : 'text-night/85')}>{match.homeTeam.name}</span>
        <span className={cn('font-serif font-bold text-base tabular-nums', selected ? 'text-night' : 'text-night/70')}>
          {match.status === 'scheduled' ? '–' : match.homeScore}
        </span>
        <span className="text-night/25 text-xs">·</span>
        <span className={cn('font-serif font-bold text-base tabular-nums', selected ? 'text-night' : 'text-night/70')}>
          {match.status === 'scheduled' ? '–' : match.awayScore}
        </span>
        <span className={cn('text-sm font-bold flex-1 truncate text-right', selected ? 'text-night' : 'text-night/85')}>{match.awayTeam.name}</span>
      </div>
    </button>
  );
}

function TeamBlock({ name, monogram, align }: { name: string; monogram: string; align: 'left' | 'right' }) {
  return (
    <div className={cn('flex items-center gap-3 min-w-0', align === 'right' && 'flex-row-reverse')}>
      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/15 flex items-center justify-center font-display font-extrabold text-cream text-sm sm:text-base flex-shrink-0">
        {monogram}
      </div>
      <div className={cn('min-w-0', align === 'right' && 'text-right')}>
        <p className="text-xs sm:text-sm font-bold text-cream leading-tight truncate">{name}</p>
        <p className="text-[10px] text-cream/45 mt-0.5">{monogram}</p>
      </div>
    </div>
  );
}

function EventRow({ event, isLast }: { event: LiveEvent; isLast: boolean }) {
  const style = EVENT_STYLE[event.type] ?? EVENT_STYLE.commentary;
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="relative flex gap-3 sm:gap-4 group pl-0"
    >
      {/* Timeline node */}
      <div className="relative flex-shrink-0 z-10">
        <div className={cn('w-11 h-11 rounded-full flex items-center justify-center text-lg ring-4 ring-white', style.bg)}>
          {style.icon}
        </div>
      </div>
      {/* Content */}
      <div className={cn('flex-1 min-w-0', !isLast && 'pb-4')}>
        <div className="flex items-baseline gap-2 mb-0.5">
          <span className="font-mono font-bold text-xs text-pitch-dk">{event.minute}'</span>
          {event.player && <span className="font-bold text-sm text-night">{event.player}</span>}
        </div>
        <p className="text-sm text-night/75 leading-snug">{event.description}</p>
        {event.detail && <p className="text-xs text-night/45 mt-1">{event.detail}</p>}
      </div>
    </motion.div>
  );
}
