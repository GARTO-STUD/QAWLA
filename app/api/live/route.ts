import { LIVE_MATCHES, LIVE_EVENTS } from '@/lib/mockData';
import type { LiveEvent } from '@/types';

// SSE live commentary stream. Falls back to a simulated stream when no
// Football-Data.org webhook is wired up. Consumed by the /live page via
// `new EventSource('/api/live?XTransformPort=3001')`.

export async function GET(req: Request) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const close = () => {
        if (!closed) {
          closed = true;
          try { controller.close(); } catch { /* ignore */ }
        }
      };

      // Abort signal from request
      req.signal.addEventListener('abort', close);

      // Send initial state
      const hello = {
        type: 'hello',
        matches: LIVE_MATCHES,
        timestamp: new Date().toISOString(),
      };
      controller.enqueue(encoder.encode(`event: hello\ndata: ${JSON.stringify(hello)}\n\n`));

      // Stream historical events for the first match (replay)
      const firstMatch = LIVE_MATCHES[0];
      if (firstMatch) {
        const matchEvents = LIVE_EVENTS
          .filter((e) => e.matchId === firstMatch.id)
          .sort((a, b) => a.minute - b.minute);
        for (const ev of matchEvents) {
          controller.enqueue(encoder.encode(`event: event\ndata: ${JSON.stringify(ev)}\n\n`));
        }
      }

      // Simulated live updates: tick match minutes forward
      const tickInterval = setInterval(() => {
        if (closed) return;
        for (const match of LIVE_MATCHES) {
          if (match.status === 'live' && match.minute !== undefined) {
            match.minute = Math.min(90, match.minute + 1);
            if (match.minute >= 90) match.status = 'finished';
          }
        }
        const tick = {
          type: 'tick',
          matches: LIVE_MATCHES.map((m) => ({ id: m.id, minute: m.minute, status: m.status })),
          timestamp: new Date().toISOString(),
        };
        try {
          controller.enqueue(encoder.encode(`event: tick\ndata: ${JSON.stringify(tick)}\n\n`));
        } catch {
          close();
        }
      }, 60_000);

      // Simulated random events (only in dev — would be real webhook in prod)
      const eventInterval = setInterval(() => {
        if (closed) return;
        const candidates: Omit<LiveEvent, 'id' | 'timestamp'>[] = [
          { matchId: firstMatch?.id ?? '', type: 'commentary', minute: firstMatch?.minute ?? 0, description: 'Half-chance falls to the forward, but the finish is dragged wide.' },
          { matchId: firstMatch?.id ?? '', type: 'chance', minute: firstMatch?.minute ?? 0, description: 'Brilliant save from the keeper tipping it over the bar.' },
          { matchId: firstMatch?.id ?? '', type: 'substitution', minute: firstMatch?.minute ?? 0, team: 'home', player: 'Substitution', description: 'Double change for the home side.' },
        ];
        const ev = candidates[Math.floor(Math.random() * candidates.length)];
        if (!ev) return;
        const full: LiveEvent = {
          ...ev,
          id: `live-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: new Date().toISOString(),
        };
        try {
          controller.enqueue(encoder.encode(`event: event\ndata: ${JSON.stringify(full)}\n\n`));
        } catch {
          close();
        }
      }, 45_000);

      // Cleanup on abort
      const cleanup = () => {
        clearInterval(tickInterval);
        clearInterval(eventInterval);
      };
      req.signal.addEventListener('abort', cleanup);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
