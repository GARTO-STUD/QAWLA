import { LIVE_MATCHES, LIVE_EVENTS } from '@/lib/mockData';
import type { LiveEvent } from '@/types';

// SSE live commentary stream. Falls back to a simulated stream when no
// Football-Data.org webhook is wired up. Consumed by the /live page via
// `new EventSource('/api/live')`.

export async function GET(req: Request) {
  const encoder = new TextEncoder();

  let closed = false;
  let tickInterval: ReturnType<typeof setInterval> | null = null;
  let eventInterval: ReturnType<typeof setInterval> | null = null;
  let controllerRef: ReadableStreamDefaultController | null = null;

  // Cleanup must run on EVERY path that ends the stream — not just the
  // request's abort signal. The previous version only cleared the two
  // setInterval timers from an 'abort' listener; if enqueue() failed and
  // `close()` ran on its own, or if the platform tore down the stream via
  // the standard ReadableStream `cancel()` callback instead of firing
  // `abort` (implementation-dependent across runtimes), both intervals
  // kept firing forever in that isolate — a real timer/resource leak.
  const cleanup = () => {
    if (tickInterval) clearInterval(tickInterval);
    if (eventInterval) clearInterval(eventInterval);
  };
  const close = () => {
    if (!closed) {
      closed = true;
      cleanup();
      try { controllerRef?.close(); } catch { /* ignore */ }
    }
  };

  const stream = new ReadableStream({
    start(controller) {
      controllerRef = controller;
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
      tickInterval = setInterval(() => {
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
      eventInterval = setInterval(() => {
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
    },
    cancel() {
      // Called by the platform when the consumer disconnects/cancels the
      // stream directly. Now shares the exact same close()/cleanup() as the
      // abort-signal path above, instead of the previous version's
      // dispatchEvent() hack (which doesn't reliably reflect signal.aborted
      // and just re-fired a synthetic event on a signal we don't control).
      close();
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
