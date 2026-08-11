# Task ID 8-b — full-stack-developer

## Task
Convert the Transfers page (`/transfers`) and the Live matches page (`/live`) from the old dark theme to the new Task 7 light theme (white/cream backgrounds, elegant `.heading-serif` headings).

## Context consumed
- Read `/home/z/my-project/worklog.md` Task 7: PageHero defaults to `variant="light"` (cream bg, pitch-pattern-light, dark Playfair serif title). `.heading-serif` and `.pitch-pattern-light` CSS classes are in `globals.css`. Dark section backgrounds (`night-gradient`, `bg-night`) are retired.
- Inspected `src/components/premium/PageHero.tsx`: its `PageHeroProps` interface only declares `variant?: 'light' | 'dark' | 'pitch'` and `bgImage?: string` — there is no `overlay` prop, so dropping `overlay="strong"` removes a stray-prop TS concern.

## Files edited

### 1. `src/app/transfers/page.tsx` (Server Component)
- **PageHero**: removed `variant="dark"`, `bgImage="/images/transfer-action.jpg"`, `overlay="strong"` → set `variant="light"`. Kept eyebrow/title/highlight/description.
- **Section heading**: `<h2 id="transfers-heading" className="font-display font-extrabold text-2xl sm:text-3xl text-night">` → `<h2 id="transfers-heading" className="heading-serif text-2xl sm:text-3xl text-night">`.
- **Preserved**: CLUB_CRESTS, PLAYER_IMAGES (empty map + ui-avatars fallback), getCrest, getPlayerImage, STATUS_COLORS, AdBanner, all `<img>` crest/player tags, Reveal/StaggerContainer/StaggerItem, metadata export. Main content section bg is default cream.

### 2. `src/app/live/page.tsx` (Client Component — kept 'use client')
- **PageHero**: removed `variant="pitch"`, `bgImage="/images/live-match.jpg"`, `overlay="strong"` → set `variant="light"`.
- **Match header div** (inside `<FadeIn key={selectedMatchId} className="card overflow-hidden">`): `p-5 sm:p-6 night-gradient pitch-pattern text-cream` → `p-5 sm:p-6 bg-cream pitch-pattern-light text-night border-b border-black/5`.
- **Match header text colors**:
  - Competition label: `text-cream/70` → `text-night/50`
  - "vs" separator: `text-cream/60` → `text-night/60` (kept muted)
  - Score: `text-cream` → `text-night`
  - Venue: `text-cream/60` → `text-night/50`
- **Badges**:
  - LIVE: kept `bg-pitch text-white` (with white ping dot)
  - Half-time: `bg-amber-500 text-white` → `bg-amber-100 text-amber-700`
  - Upcoming: `bg-white/15 text-cream backdrop-blur` → `bg-night/5 text-night/60`
- **TeamBlock**: team-initial circle `bg-white/10 backdrop-blur ... text-cream` → `bg-pitch/10 text-pitch-dk`; team name `text-cream/90` → `text-night/90`.
- **"Matches" h2**: `font-display font-bold text-lg text-night` → `heading-serif text-lg text-night`.
- **Left the small "Live commentary" h3 as-is** (optional per instructions).
- **Untouched**: EventSource SSE block (es.onopen, es.onerror with the "do NOT call es.close() on error" comment, es.addEventListener('event', ...), try/catch around `new EventSource`, `return () => es?.close()`), useState/useRef, MatchCard, EventRow (motion.div slide-in), EVENT_ICONS, all Reveal/StaggerContainer/StaggerItem/FadeIn wrappers, `key={selectedMatchId}` on FadeIn.

## Verification
- `curl /transfers` → **HTTP 200** (dev.log: compile 80ms, render 290ms)
- `curl /live` → **HTTP 200** (dev.log: compile 74ms, render 155ms)
- dev.log shows clean compiles for both routes, no runtime errors.
- `bun run lint`: 3 pre-existing errors (Analytics.tsx, I18nProvider.tsx, lib/db.ts) + 4 pre-existing warnings (PageHero.tsx unused eslint-disable, db.ts unused eslint-disable) — NONE introduced by these edits. Confirmed by grepping lint output for `transfers/page` and `live/page` → no matches.

## Final HTTP codes
- /transfers → 200
- /live → 200
