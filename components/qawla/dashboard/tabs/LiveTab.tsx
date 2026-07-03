'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { DashCard } from '../shared';
import { LIVE_MATCHES, LIVE_EVENTS } from '@/lib/mockData';
import { fetchImageForMatch } from '@/lib/imageMatcher';
import { formatRelative, cn } from '@/lib/utils';
import type { LiveMatch, LiveEventType, LiveEvent } from '@/types';

const EVENT_ICON: Record<LiveEventType, React.ReactNode> = {
  kickoff: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>,
  goal: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>,
  yellow_card: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="18" rx="2" /></svg>,
  red_card: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="3" width="14" height="18" rx="2" /></svg>,
  substitution: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 1l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3" /></svg>,
  penalty: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>,
  var: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01" /></svg>,
  halftime: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>,
  fulltime: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>,
  chance: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18M7 14l4-4 4 4 5-5" /></svg>,
  commentary: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  injury: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4M12 17h.01" /></svg>,
};

const EVENT_COLOR: Record<LiveEventType, string> = {
  kickoff: 'bg-black/[0.04] text-night/70',
  goal: 'bg-pitch/12 text-pitch-darker',
  yellow_card: 'bg-gold/15 text-gold-dark',
  red_card: 'bg-red-500/12 text-red-600',
  substitution: 'bg-blue-500/12 text-blue-700',
  penalty: 'bg-amber-500/12 text-amber-700',
  var: 'bg-purple-500/12 text-purple-700',
  halftime: 'bg-black/[0.04] text-night/60',
  fulltime: 'bg-black/[0.04] text-night/60',
  chance: 'bg-emerald-500/12 text-emerald-700',
  commentary: 'bg-black/[0.04] text-night/60',
  injury: 'bg-red-500/12 text-red-600',
};

// Players for random goal generation
const GOAL_SCORERS: Record<string, string[]> = {
  home: ['Haaland', 'Foden', 'De Bruyne', 'Salah', 'Saka', 'Bellingham', 'Osimhen'],
  away: ['Saka', 'Ødegaard', 'Martinelli', 'Vinicius', 'Pedri', 'Kvaratskhelia'],
};

const COMMENTARY_LINES = [
  'Chance at the near post — saved brilliantly.',
  'Free kick conceded in a dangerous area.',
  'Corner won, the crowd rises.',
  'Substitution being prepared on the touchline.',
  ' VAR check for a possible penalty.',
  'Booking for a late challenge.',
  'Long ball over the top, chased down.',
  'Throw-in deep in the opposition half.',
];

/**
 * LiveTab — live matches + commentary feed.
 *
 * When `liveMode` is true (activated via the dashboard "Go live" button),
 * the tab periodically simulates real-time match events:
 *   - Goals are scored (score updates)
 *   - Commentary events are added to the feed
 *   - Match minute advances
 * This simulates a live data feed from Football-Data.org or similar.
 */
export interface LiveTabProps {
  liveMode?: boolean;
}

export function LiveTab({ liveMode = false }: LiveTabProps) {
  const [selectedMatch, setSelectedMatch] = useState<string>(LIVE_MATCHES[0].id);
  // Local copy of matches so we can update scores in real-time
  const [matches, setMatches] = useState<LiveMatch[]>(LIVE_MATCHES);
  // Local copy of events so we can append new ones
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>(LIVE_EVENTS);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const eventCounter = useRef(1000);

  const match = matches.find((m) => m.id === selectedMatch) || matches[0];
  const events = liveEvents.filter((e) => e.matchId === match.id);

  // Live mode: periodically simulate match events (goals, commentary)
  useEffect(() => {
    if (!liveMode) return;

    const interval = setInterval(() => {
      // Pick a random live match
      const liveMatches = matches.filter((m) => m.status === 'live');
      if (liveMatches.length === 0) return;

      const targetMatch = liveMatches[Math.floor(Math.random() * liveMatches.length)];
      const isGoal = Math.random() < 0.35; // 35% chance of a goal

      if (isGoal) {
        // Score a goal!
        const team: 'home' | 'away' = Math.random() < 0.5 ? 'home' : 'away';
        const scorers = GOAL_SCORERS[team];
        const scorer = scorers[Math.floor(Math.random() * scorers.length)];
        const newMinute = (targetMatch.minute || 0) + Math.floor(Math.random() * 5) + 1;

        setMatches((prev) =>
          prev.map((m) =>
            m.id === targetMatch.id
              ? {
                  ...m,
                  homeScore: team === 'home' ? m.homeScore + 1 : m.homeScore,
                  awayScore: team === 'away' ? m.awayScore + 1 : m.awayScore,
                  minute: Math.min(newMinute, 90),
                }
              : m,
          ),
        );

        const newEvent: LiveEvent = {
          id: `live-${eventCounter.current++}`,
          matchId: targetMatch.id,
          type: 'goal',
          minute: newMinute,
          team,
          player: scorer,
          description: `GOAL! ${scorer} scores for ${team === 'home' ? targetMatch.homeTeam.name : targetMatch.awayTeam.name}!`,
          detail: Math.random() < 0.5 ? 'Assist: ' + (scorers[Math.floor(Math.random() * scorers.length)]) : undefined,
          timestamp: new Date().toISOString(),
        };
        setLiveEvents((prev) => [newEvent, ...prev]);
        setLastUpdate(`Goal: ${scorer} (${targetMatch.homeTeam.shortName} ${targetMatch.homeScore}-${targetMatch.awayScore} ${targetMatch.awayTeam.shortName})`);
      } else {
        // Add a commentary event
        const newMinute = (targetMatch.minute || 0) + Math.floor(Math.random() * 3) + 1;
        const commentary = COMMENTARY_LINES[Math.floor(Math.random() * COMMENTARY_LINES.length)];

        setMatches((prev) =>
          prev.map((m) =>
            m.id === targetMatch.id
              ? { ...m, minute: Math.min(newMinute, 90) }
              : m,
          ),
        );

        const newEvent: LiveEvent = {
          id: `live-${eventCounter.current++}`,
          matchId: targetMatch.id,
          type: 'commentary',
          minute: newMinute,
          description: commentary,
          timestamp: new Date().toISOString(),
        };
        setLiveEvents((prev) => [newEvent, ...prev]);
        setLastUpdate(`${targetMatch.homeTeam.shortName} vs ${targetMatch.awayTeam.shortName}: ${commentary}`);
      }
    }, 4000); // Update every 4 seconds

    return () => clearInterval(interval);
  }, [liveMode, matches]);

  return (
    <div className="space-y-5">
      {/* Live mode banner */}
      {liveMode && (
        <div className="rounded-xl border border-pitch/30 bg-pitch/8 p-4 flex items-center gap-3 animate-scale-in">
          <div className="shrink-0">
            <span className="live-dot" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-night">Live data active — real-time updates</p>
            <p className="text-xs text-night/55 mt-0.5 truncate">
              {lastUpdate || 'Watching for goals, cards, and match events…'}
            </p>
          </div>
          <span className="shrink-0 text-[10px] uppercase tracking-wider text-pitch-darker font-bold">Live</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
        {/* Match list */}
        <div className="space-y-3">
          <h3 className="font-display font-bold text-sm text-night/80 uppercase tracking-wider">
            Matches
          </h3>
          {matches.map((m) => (
            <MatchCard
              key={m.id}
              match={m}
              selected={selectedMatch === m.id}
              onClick={() => setSelectedMatch(m.id)}
              liveMode={liveMode}
            />
          ))}
        </div>

        {/* Event feed */}
        <DashCard title={`${match.homeTeam.name} vs ${match.awayTeam.name}`} subtitle={`${match.competition} · ${match.venue || 'Venue TBC'}`}>
          {/* Score header */}
          <div className="flex items-center justify-center gap-6 py-4 mb-4 rounded-xl bg-black/[0.03] border border-black/[0.06]">
            <div className="text-center flex-1">
              <p className="font-display font-bold text-sm text-night truncate">{match.homeTeam.name}</p>
              {match.homeTeam.formation && <p className="text-[10px] text-night/40 mt-0.5">{match.homeTeam.formation}</p>}
            </div>
            <div className="text-center">
              <p className="font-display font-extrabold text-3xl text-night tabular-nums">
                {match.homeScore}<span className="text-night/30 mx-1">-</span>{match.awayScore}
              </p>
              <p className={cn(
                'inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider mt-1',
                match.status === 'live' ? 'text-red-600' : match.status === 'halftime' ? 'text-gold-dark' : 'text-night/50',
              )}>
                {match.status === 'live' && <span className="live-dot" />}
                {match.status === 'live' ? `${match.minute}'` : match.status === 'halftime' ? 'HT' : match.status.toUpperCase()}
              </p>
            </div>
            <div className="text-center flex-1">
              <p className="font-display font-bold text-sm text-night truncate">{match.awayTeam.name}</p>
              {match.awayTeam.formation && <p className="text-[10px] text-night/40 mt-0.5">{match.awayTeam.formation}</p>}
            </div>
          </div>

          {/* Events */}
          {events.length === 0 ? (
            <div className="text-center py-10 text-night/50 text-sm">
              No events yet. Kickoff pending.
            </div>
          ) : (
            <ul className="space-y-2.5">
              {events.map((e) => (
                <li
                  key={e.id}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-xl border hover:bg-cream/50 transition-colors',
                    e.type === 'goal' ? 'border-pitch/20 bg-pitch/5' : 'border-black/[0.06] bg-white/50',
                    e.id.startsWith('live-') && 'animate-fade-in-up',
                  )}
                >
                  <span className="shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-lg bg-black/[0.04] text-night/55 font-mono text-[10px] font-bold">
                    {e.minute}'
                  </span>
                  <span className={cn(
                    'shrink-0 w-7 h-7 rounded-lg flex items-center justify-center',
                    EVENT_COLOR[e.type],
                  )}>
                    {EVENT_ICON[e.type]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-night/85 leading-snug">{e.description}</p>
                    {e.detail && <p className="text-[10px] text-night/45 mt-0.5">{e.detail}</p>}
                    {e.player && (
                      <p className="text-[10px] text-pitch-darker font-semibold mt-0.5">{e.player}</p>
                    )}
                  </div>
                  <span className="text-[10px] text-night/40 shrink-0">
                    {formatRelative(e.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </DashCard>
      </div>
    </div>
  );
}

function MatchCard({ match, selected, onClick, liveMode }: { match: LiveMatch; selected: boolean; onClick: () => void; liveMode?: boolean }) {
  const matchImage = fetchImageForMatch(match.homeTeam.name, match.awayTeam.name, match.competition);

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-2xl p-0 border transition-all overflow-hidden',
        selected
          ? 'border-pitch/30 shadow-sm'
          : 'border-black/[0.06] hover:border-black/[0.12]',
      )}
    >
      <div className="flex items-stretch">
        {/* Match image */}
        <div className="relative w-16 sm:w-20 shrink-0 bg-cream overflow-hidden">
          {matchImage && (
            <Image
              src={matchImage}
              alt=""
              fill
              sizes="80px"
              className="object-cover opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/80" />
        </div>

        {/* Content */}
        <div className={cn('flex-1 p-3 sm:p-4', selected && 'bg-pitch/[0.04]')}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-night/50 font-semibold">
              {match.competition}
            </span>
            <span className={cn(
              'inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider',
              match.status === 'live' ? 'text-red-600' : match.status === 'halftime' ? 'text-gold-dark' : 'text-night/50',
            )}>
              {match.status === 'live' && <span className="live-dot" />}
              {match.status === 'live' ? `LIVE ${match.minute}'` : match.status === 'halftime' ? 'HT' : match.status === 'scheduled' ? 'UPCOMING' : match.status.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="font-display font-bold text-sm text-night truncate">{match.homeTeam.name}</p>
              <p className="font-display font-bold text-sm text-night/65 truncate">{match.awayTeam.name}</p>
            </div>
            {match.status !== 'scheduled' && (
              <div className="shrink-0 ml-3 text-right">
                <p className="font-display font-extrabold text-lg text-night tabular-nums">{match.homeScore}</p>
                <p className="font-display font-extrabold text-lg text-night/55 tabular-nums">{match.awayScore}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

export default LiveTab;
