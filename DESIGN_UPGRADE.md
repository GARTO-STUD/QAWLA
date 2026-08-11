# Qawla Frontend & Dashboard Upgrade

This release upgrades the product surface to a premium editorial/broadcast UI.

## Frontend
- Cinematic stadium hero using the existing `/public/images/hero-stadium.jpg` asset.
- Glass surfaces, editorial cards, richer hover states and image zoom treatment.
- Ambient motion and grid overlays with `prefers-reduced-motion` support.
- Rounded, premium league cards and CTA surfaces.
- Existing Framer Motion reveal/stagger primitives remain the animation engine.

## Dashboard
- Dark newsroom command-center sidebar.
- New **AI Studio** workspace.
- New **Analytics** workspace.
- New **Settings / system health** workspace.
- Pipeline tab now attempts to load real jobs from `/api/orchestrator?limit=20` and falls back to seeded demo data when unavailable.
- AI Studio can execute the authenticated orchestrator and supports draft-only mode.
- Editorial focus is passed into the Scout agent so the requested angle actually affects content triage.

## AI workflow
`ingest → scout → fact-check → analyst → writer → editor → confidence → publish`

The UI intentionally defaults to draft-only mode so editors can review AI output before publication.
