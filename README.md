# Qawla

> Premium football journalism powered by an AI editorial desk. Verified, tactical, always honest.

[![CI](https://github.com/qawla/qawla/actions/workflows/ci.yml/badge.svg)](https://github.com/qawla/qawla/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Qawla is a Next.js 16 football news platform with a five-agent AI editorial pipeline (scout → fact-checker → analyst → writer → editor), public confidence scoring on every story, live match commentary via Server-Sent Events, and a reader-funded donation model.

Built for Cloudflare Workers via OpenNext.

---

## Table of contents

- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [The five-agent pipeline](#the-five-agent-pipeline)
- [Confidence scoring](#confidence-scoring)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Admin access](#admin-access)
- [API reference](#api-reference)
- [Deployment](#deployment)
- [Editorial standards](#editorial-standards)
- [License](#license)

---

## Architecture

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  RSS feeds   │     │ Football-Data│     │   Social     │
│  (tier 1-3)  │     │     .org     │     │  insiders    │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       └────────────┬───────┴────────────────────┘
                    ▼
            ┌───────────────┐
            │   Ingestion   │  ← lib/ingestion.ts (RSS parse, entity extract)
            └───────┬───────┘
                    ▼
            ┌───────────────┐
            │  Orchestrator │  ← lib/orchestrator.ts (stage-by-stage)
            └───────┬───────┘
                    ▼
    ┌───────────────────────────────┐
    │     Five-agent waterfall      │
    │  scout → factCheck → analyst  │
    │       → writer → editor       │
    └───────────────┬───────────────┘
                    ▼
            ┌───────────────┐
            │  Confidence   │  ← lib/confidence.ts (0-100 score)
            │    Engine     │
            └───────┬───────┘
                    ▼
            ┌───────────────┐
            │  Firestore    │  ← lib/firebase.ts (REST + Web Crypto JWT)
            └───────────────┘
                    ▼
            ┌───────────────┐
            │  Next.js 16   │  ← public site + admin dashboard
            └───────────────┘
```

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript 5 |
| Styling | Tailwind CSS 3.4 + custom design system |
| Database | Firestore (REST API + Web Crypto JWT signing — no Google SDK) |
| AI providers | Kimi K2 → Groq (Llama 3.3 70B) → Gemini 1.5 Pro (waterfall) |
| Live updates | Server-Sent Events (SSE) |
| Auth | HMAC-signed JWT sessions (PBKDF2 password hashing) |
| Payments | Lemon Squeezy (with PayPal + crypto fallbacks) |
| Rate limiting | In-memory sliding window (per-isolate) |
| Hosting | Cloudflare Workers via OpenNext |
| Analytics | Google Analytics 4 + Plausible + AdSense |
| Monitoring | Core Web Vitals (LCP, CLS, INP, FCP, TTFB) via PerformanceObserver |

## The five-agent pipeline

Every story passes through five specialised AI agents before publication:

1. **Scout** (`lib/agents/scout.ts`) — intake & triage. Deduplicates raw events, ranks by signal strength, extracts entities, recommends treatment (news / analysis / live blog / transfer tracker).

2. **Fact-checker** (`lib/agents/factCheck.ts`) — verification. Decomposes the story into atomic claims, cross-references each against multiple sources, flags contradictions, rates claim-level veracity on a 5-point scale.

3. **Analyst** (`lib/agents/analyst.ts`) — tactical depth. Produces formation breakdowns, pressing schemes, key battles, xG analysis, and statistical insights. Invoked only for tactical / preview / review content.

4. **Writer** (`lib/agents/writer.ts`) — prose. Turns verified intelligence into publication-ready Markdown with vivid leads, precise language, and sourced claims.

5. **Editor** (`lib/agents/editor.ts`) — final gate. Structural edit, headline sharpening, house-style enforcement, SEO metadata, and the publish / no-publish decision.

Each agent's system prompt encodes Qawla's editorial standards. All prompts are in English.

## Confidence scoring

Every published article carries a public confidence score from 0-100:

| Score | Label | Decision |
|---|---|---|
| 85-100 | Verified | Auto-publish |
| 70-84 | Likely | Auto-publish with monitoring |
| 55-69 | Unverified | Hold for editorial review |
| 35-54 | Disputed | Escalate to senior editor |
| 0-34 | Rejected | Do not publish |

The score is a weighted blend:
- **Source tier** (40%) — official > tier1 > tier2 > tier3 > social
- **Cross-reference** (30%) — number of independent corroborating sources
- **Entity match** (20%) — overlap of named entities (players, clubs, managers) across sources
- **Historical accuracy** (10%) — each source's tracked reliability score

## Project structure

```
qawla/
├── app/                      # Next.js 16 App Router
│   ├── (public pages)
│   ├── admin/                # Admin dashboard + login
│   ├── api/                  # API routes (auth, ingest, orchestrator, agents, …)
│   ├── layout.tsx
│   └── globals.css
├── components/               # React components
│   ├── premium/              # PageHero, StatCard, Skeletons, StateViews
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── …
├── lib/                      # Business logic
│   ├── agents/               # scout, factCheck, analyst, writer, editor
│   ├── firebase.ts           # Firestore REST + Web Crypto JWT
│   ├── session.ts            # HMAC-signed admin sessions
│   ├── rateLimit.ts          # In-memory rate limiter
│   ├── aiWaterfall.ts        # 3-provider AI waterfall
│   ├── ingestion.ts          # RSS parsing + entity extraction
│   ├── confidence.ts         # Confidence scoring engine
│   ├── lemonsqueezy.ts       # Donations
│   └── orchestrator.ts       # Pipeline orchestrator
├── types/                    # TypeScript domain types
├── proxy.ts                  # Next.js 16 edge proxy (admin protection)
├── open-next.config.ts       # OpenNext Cloudflare config
├── wrangler.toml             # Cloudflare Workers config
└── public/                   # Static assets
```

## Getting started

```bash
# 1. Install dependencies
bun install   # or: npm install

# 2. Copy environment variables
cp .env.example .env
# Edit .env — at minimum set ADMIN_JWT_SECRET (>= 32 chars)

# 3. Run the dev server
bun run dev   # or: npm run dev

# 4. Open the app
# Visit http://localhost:3000 (or your preview URL)
```

The app runs fully without external services — Firestore, AI providers, and Lemon Squeezy are all optional. Mock data in `lib/mockData.ts` provides realistic content.

## Environment variables

See [`.env.example`](.env.example) for the full list. Key ones:

| Variable | Purpose | Required |
|---|---|---|
| `ADMIN_JWT_SECRET` | HMAC secret for admin sessions (≥32 chars) | ✅ |
| `NVIDIA_API_KEY` / `GROQ_API_KEY` / `GEMINI_API_KEY` | AI providers (waterfall — at least one) | For pipeline |
| `TAVILY_API_KEY` | Web search for fact-checking (1,000 free/month) | Optional |
| `FIREBASE_PROJECT_ID` + `FIREBASE_CLIENT_EMAIL` + `FIREBASE_PRIVATE_KEY` | Firestore database | For persistence |
| `FOOTBALL_DATA_API_KEY` | Live matches & standings | For live data |
| `LEMONSQUEEZY_API_KEY` + `LEMONSQUEEZY_STORE_ID` | Donations | For checkout |
| `CRON_SECRET` | Protects `/api/cron` endpoint | ✅ for cron |

## Admin access

- **URL**: `/admin`
- **Login**: `/admin/login`
- **Demo credentials**: `editor@qawla.com` / `qawla2025`
- **Sessions**: HMAC-signed JWT, 8-hour TTL, HttpOnly + SameSite=Strict cookies
- **Rate limited**: 10 auth attempts per 15 minutes per IP

The admin dashboard has 7 tabs: Overview, Articles, Pipeline, Sources, Transfers, Live, Donors. On mobile, the sidebar collapses to a horizontal tab bar.

## API reference

### Public

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/articles` | List articles (filter by `category`, `tag`, `status`, `q`) |
| GET | `/api/articles?id=X` | Single article |
| GET | `/api/checkout` | List donate tiers |
| GET | `/api/live` | SSE live commentary stream |
| GET | `/api/og/[id]` | Dynamic OG image (SVG) |

### Authenticated (admin session required)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth` | Login |
| DELETE | `/api/auth` | Logout |
| GET | `/api/auth` | Session status |
| POST | `/api/ingest` | Trigger RSS ingestion |
| POST/GET/PATCH | `/api/orchestrator` | Pipeline job management |
| PATCH | `/api/articles` | Update article status/featured/trending |
| POST | `/api/checkout` | Create Lemon Squeezy checkout URL |
| POST | `/api/agents/scout` | Run scout agent |
| POST | `/api/agents/fact-check` | Run fact-checker |
| POST | `/api/agents/analyst` | Run analyst |
| POST | `/api/agents/writer` | Run writer |
| POST | `/api/agents/editor` | Run editor |

### Cron

| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/api/cron` | Ingestion + pipeline (protected by `X-Cron-Secret`) |

All endpoints are rate limited. Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `Retry-After` (on 429).

## Deployment

### Cloudflare Workers (recommended)

```bash
# 1. Install Wrangler
bun add -g wrangler

# 2. Login to Cloudflare
wrangler login

# 3. Set secrets
wrangler secret put ADMIN_JWT_SECRET
wrangler secret put NVIDIA_API_KEY
wrangler secret put GROQ_API_KEY
wrangler secret put GEMINI_API_KEY
wrangler secret put TAVILY_API_KEY
wrangler secret put FIREBASE_PRIVATE_KEY
wrangler secret put LEMONSQUEEZY_API_KEY
wrangler secret put LEMONSQUEEZY_WEBHOOK_SECRET
wrangler secret put CRON_SECRET

# 4. Build & deploy
bun run build:cloudflare
bun run deploy
```

Cron triggers fire every 15 minutes to run ingestion + pipeline. See `wrangler.toml`.

### Other platforms

The app is a standard Next.js 16 project and runs anywhere that supports Node.js 20+ or edge runtimes. Remove `open-next.config.ts` and `wrangler.toml` to deploy on Vercel, Netlify, or self-hosted.

## Editorial standards

- **Accuracy above speed.** We hold stories rather than publish unverified.
- **Public confidence scores.** Every story shows its breakdown.
- **Source transparency.** Every claim links to its source.
- **No clickbait.** Headlines must be specific and accurate.
- **Reader-funded.** No club sponsorship, no paid placement.
- **AI-assisted, human-gated.** AI drafts, humans publish.

Full standards in [`/about`](https://qawla.com/about).

## License

MIT © Qawla. See [LICENSE](LICENSE) for details.

---

Built with care for readers who think the game. ⚽
