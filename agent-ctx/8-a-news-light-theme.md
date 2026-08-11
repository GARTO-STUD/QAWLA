# Task ID 8-a — News listing + Article detail → light theme

## Scope
- Convert `/news` (listing) and `/news/[id]` (article detail) from the dark photo hero to the new white/cream light theme established in Task 7.
- Apply elegant `.heading-serif` style to the article h1.

## Files edited
1. `src/app/news/page.tsx` — PageHero now `variant="light"` (removed `bgImage` + `overlay`).
2. `src/app/news/[id]/page.tsx` — Replaced the dark `<header>` (newsroom.jpg bg + 3 dark gradient overlays + `pitch-pattern opacity-30`) with a clean light header using `bg-cream pitch-pattern-light text-night`. h1 switched to `heading-serif … text-night`. Breadcrumb/subtitle/meta colors retuned to `text-night/50`, `text-night/70`, `text-night/60`; author name to `text-night`. ConfidenceBadge className changed from dark `bg-white/10 backdrop-blur border-white/20 text-cream` to light `bg-pitch/10 text-pitch-dk border border-pitch/20`. Category/trending badges, cover image block, prose body, confidence breakdown section, RelatedArticles, ShareButtons, AdBanner, generateMetadata, renderMarkdown all untouched.

## Verification
- `curl /news` → HTTP 200 (render 285ms)
- `curl /news/art-001` → HTTP 200 (render 1068ms)
- Rendered HTML spot-check:
  - `/news` PageHero section now `class="relative overflow-hidden bg-cream pitch-pattern-light"`
  - `/news/art-001` header now `bg-cream pitch-pattern-light text-night` and h1 uses `heading-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-night leading-[1.05]`
  - No `newsroom.jpg` and no `from-night … to-night/60` overlay inside either hero (the only remaining `from-night via-night/60` reference on `/news` comes from `ArticleCard.tsx`'s cover-image gradient — out of scope, intentionally left untouched per task instructions).
- `dev.log` shows clean compiles with no new errors introduced.

## Notes for downstream agents
- The article header no longer references `/images/newsroom.jpg` at all — the newsroom image is now only used as a faint 6% opacity background on PageHero `variant="light"` heroes (handled internally by PageHero when `bgImage` is passed), which I did NOT pass here for the cleanest look.
- ArticleCard still has its own dark image-overlay gradient (`from-night via-night/60 to-transparent`) on each card thumbnail — that is per-card styling and intentionally preserved.
