# Task ID 8-c — Light theme + serif headings (About/Donate/Blog/Search/Contact/Privacy/Terms)

## Scope
Convert 8 pages from dark `night-gradient` / `bg-night` / `glass` cards + `font-display font-extrabold` headings to the new white/cream light theme with `.heading-serif` (Playfair Display) headings.

## Files edited
1. `src/app/about/page.tsx` (Server)
2. `src/app/donate/page.tsx` (Client)
3. `src/app/blog/page.tsx` (Server)
4. `src/app/blog/[slug]/page.tsx` (Server)
5. `src/app/search/page.tsx` (Client)
6. `src/app/contact/page.tsx` (Client)
7. `src/app/privacy/page.tsx` (Server)
8. `src/app/terms/page.tsx` (Server)

## Key conversions
- **PageHero**: every page now uses `variant="light"` (no bgImage, no overlay prop).
- **Section h2s**: `font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-night` → `heading-serif text-3xl sm:text-4xl lg:text-5xl text-night`.
- **About editorial pipeline section**: `night-gradient pitch-pattern text-cream` → `bg-white pitch-pattern-light text-night`. Cards: `glass` → `bg-cream border border-black/5 shadow-sm hover:shadow-xl transition-all`. Stage name/role/desc flipped from `text-cream*` to `text-night*`. Step number `pitch-gradient text-white` kept. Arrow `text-night/30`. Eyebrow badge `bg-white/10 text-pitch backdrop-blur` → `bg-pitch/10 text-pitch-dk`. Tactics-board bg kept at `opacity-[0.04]` for subtle texture.
- **Blog [slug] header**: dark image-overlay hero restructured to a clean editorial layout — full-opacity cover image in a `bg-cream` container with a soft cream fade, then serif title block stacked below in dark text.
- **Privacy & Terms**: dropped the `.prose-qawla` wrapper (because `.prose-qawla h2` in `@layer components` would override `.heading-serif` in `@layer base` for font-family). Each section now uses explicit Tailwind classes on h2 (`heading-serif text-xl sm:text-2xl text-night mb-4 border-b-2 border-pitch/30 pb-2`) and p (`text-[15px] sm:text-base leading-7 sm:leading-8 text-night/75 whitespace-pre-line`). Terms TOC card: `bg-cream border border-gray-200` → `bg-cream border border-black/5 shadow-sm`.

## What was preserved
- All Server/Client component statuses.
- All `metadata` exports (Privacy, Terms, About, Blog listing, Blog [slug]'s generateMetadata + generateStaticParams + jsonLd).
- All `Reveal` / `StaggerContainer` / `StaggerItem` wrappers from Task 5-c.
- Donate's Lemon Squeezy overlay SDK, `paymentDone` state, `handleCheckout`, `CRYPTO_WALLETS`, PayPal link, all `useToast` calls.
- Search's `useMemo` search logic, `extractHighlights`, `highlightTerms`, `NotFoundState`.
- Contact's `handleSubmit`, FAQ accordion `openFaq` state.
- AdBanner placements (none of these pages had any, but checked).
- Did NOT touch: home page, footer, header, Logo, PageHero component, news/article pages, transfers/live pages.

## Final HTTP codes (verified via curl)
- /about → 200
- /donate → 200
- /blog → 200
- /search → 200
- /contact → 200
- /privacy → 200
- /terms → 200
- /blog/the-art-of-the-deep-lying-playmaker → 200

## Lint
`bun run lint` shows only pre-existing errors in untouched files (Analytics.tsx, I18nProvider.tsx, lib/db.ts, PageHero.tsx warnings). Confirmed via grep filter that NONE of the 8 edited files appear in lint output.

## Dev log
Clean compiles for every edited page; no runtime errors. Sample:
- `GET /about 200 in 577ms (compile: 109ms, render: 468ms)`
- `GET /blog/the-art-of-the-deep-lying-playmaker 200 in 561ms (compile: 106ms, generate-params: 33ms, render: 455ms)`
