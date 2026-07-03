# Qawla — Editorial Dashboard

> The newsroom behind the newsroom. A seven-tab command center for editors to manage the editorial pipeline, articles, sources, transfers, live coverage, and reader donations.

The dashboard is gated behind a login screen and hidden from public visitors — it is accessible only via the direct URL `#/dashboard`. Once authenticated, editors land on a dark, glassmorphic interface built on the Qawla design system (night-navy backdrop, pitch-green accents, gold highlights, Bricolage Grotesque + Outfit typography).

---

## Architecture

```
src/components/qawla/dashboard/
├── LoginScreen.tsx        # Split-screen editorial login
├── DashboardShell.tsx     # Sidebar + topbar + tab router
├── shared.tsx             # Reusable dashboard primitives
├── index.tsx              # Barrel exports
└── tabs/
    ├── OverviewTab.tsx    # Newsroom at a glance
    ├── ArticlesTab.tsx    # Article management table
    ├── PipelineTab.tsx    # 5-agent editorial pipeline
    ├── SourcesTab.tsx     # Credibility source management
    ├── TransfersTab.tsx   # Transfer rumour tracker
    ├── LiveTab.tsx        # Live match commentary
    └── DonorsTab.tsx      # Reader donations & revenue
```

**Routing**: The dashboard is a single-page application rendered inside the `#/dashboard` hash route. Tab switching is handled by React state in `DashboardShell` (no URL sub-routes) — this keeps the sandbox simple while still feeling like a full multi-page app.

**Theme**: The entire dashboard uses a dark theme (`night-gradient` backdrop, `glass` cards, cream text). This contrasts with the light public site and signals to the editor that they are in a different mode.

**Data**: All dashboard data comes from `src/lib/mockData.ts` — `ARTICLES`, `PIPELINE_JOBS`, `SOURCES`, `TRANSFERS`, `LIVE_MATCHES`, `LIVE_EVENTS`, `DONORS`, `DONOR_STATS`, `SITE_STATS`, `ACTIVITY_FEED`, `DEMO_ADMIN`. In production these would be fetched from Firestore via the `lib/firebase.ts` REST adapter.

---

## Components

### `LoginScreen`

**File**: `LoginScreen.tsx`
**Purpose**: Split-screen editorial login with branding on the left and a sign-in form on the right.

**Layout**:
- **Left panel (desktop only)**: Night-gradient branding with the Qawla logo, "The newsroom, behind the stories" headline, three editorial promises (verified reporting, public confidence, reader-funded), and a clickable rotating testimonial block.
- **Right panel**: Sign-in form with email + password fields, show/hide password toggle, "Remember me" checkbox, "Forgot password?" link, submit button with loading state, and a demo credentials hint box.
- **Mobile**: Form-only layout with centered logo above.

**Behavior**:
- Pre-fills demo credentials (`editor@qawla.com` / `qawla2025`)
- 700ms simulated auth check with loading spinner
- Permissive in demo mode — any valid email + password (≥4 chars) succeeds
- On success: calls `onLogin()` which persists auth to `localStorage`
- Testimonials cycle on click (3 quotes from Patron/Member/Supporter readers)

**Accessibility**:
- Proper `<label>` associations for email and password
- `aria-label` on password toggle button
- Form submission via `<button type="submit">`
- Keyboard-accessible show/hide password

---

### `DashboardShell`

**File**: `DashboardShell.tsx`
**Purpose**: The persistent dashboard layout — collapsible sidebar, sticky topbar, and tab content area.

**Sidebar (desktop)**:
- Width: 256px expanded, 68px collapsed (persisted to `localStorage` under `qawla-dash-collapsed`)
- 7 tab buttons with icon + label + description, active state with pitch-green highlight and pulse dot
- Collapse toggle at the bottom (chevron icon, rotates when collapsed)
- User card at the very bottom: Qawla logo avatar, editor name, editor email, sign-out button

**Topbar**:
- Sticky, 64px tall, `bg-night/85 backdrop-blur-xl`
- Mobile: tab dropdown trigger (expands to show all 7 tabs)
- Desktop: active tab title + description
- Global search input (56-char width on desktop, hidden on mobile) with `⌘K` hint
- Notifications bell with pulsing pitch-green dot
- "View site" button (navigates back to `#/`)
- Mobile: compact sign-out icon button

**Tab content area**:
- Scrollable main region with `scroll-area-dark` custom scrollbar
- Max-width 1280px container, responsive padding (16/24/32px)
- Each tab is a separate component rendered conditionally based on `active` state

**Mobile tab drawer**:
- When the mobile tab trigger is tapped, a 2-column grid of tab buttons appears below the topbar
- Selecting a tab closes the drawer and switches the view

---

### `shared.tsx` — Dashboard UI Primitives

A collection of reusable building blocks used across all tabs.

#### `DashCard`
Glassmorphic card container with optional title, subtitle, and action slot. The base unit of dashboard layout.

#### `KpiTile`
Key Performance Indicator tile with icon, value, delta indicator (positive/negative with arrow), and label. Used in the Overview tab for top-level metrics. Variants: `default`, `pitch` (green), `gold`, `red`.

#### `StatusPill`
Colored status badge for articles and pipeline jobs. Maps status strings (`published`, `draft`, `in_review`, `fact_checking`, `running`, `pending`, `completed`, `failed`, `skipped`) to color-coded pills. Running/fact-checking states include a pulsing dot.

#### `ConfidenceChip`
Compact 0–100 confidence score display with color-coded label (Verified ≥85, Likely ≥70, Unverified ≥55, Disputed ≥35, Rejected <35). Used in article tables and pipeline job lists.

#### `ConfidenceRing`
SVG circular progress ring (default 56px) showing a confidence score. Color-coded by threshold. The ring animates from 0 to the target value on mount via the `ring-progress` CSS class. Used in the Pipeline tab's job detail view and the Sources tab.

#### `MiniBarChart`
Responsive bar chart (default 120px tall) for small datasets. Bars use a vertical gradient (solid color → 50% opacity). Hover reveals the value label above each bar. Used in Overview (article views) and Donors (revenue by tier).

#### `Sparkline`
SVG line chart with gradient area fill (default 280×60px). Plots a series of numbers as a smooth line with a colored area fill underneath. Used in Overview (revenue trend) and Donors (monthly revenue).

#### `DashEmptyState`
Empty-state card with icon, title, and description. Used when a filtered list has no results.

---

## Tabs

### 1. Overview Tab

**File**: `tabs/OverviewTab.tsx`
**Purpose**: Newsroom at a glance — the editor's morning dashboard.

**Sections**:
1. **Welcome row**: Personalized greeting ("Good evening, Editor.") with pipeline status summary (X running, Y completed, Z failed) and a "New pipeline run" primary button.

2. **KPI grid (4 tiles)**:
   - Published articles (with +12% delta, pitch variant)
   - Pipeline jobs in last 24h (with +8% delta, gold variant)
   - Total raised (with +5.2% delta)
   - Avg confidence (with +2pt delta, pitch variant)

3. **Charts row (2 columns)**:
   - **Article views bar chart**: Top 8 articles by view count, hover to see exact numbers
   - **Reader revenue sparkline**: 12-month donation trend with totals (12mo total, avg/mo, active donors)

4. **Pipeline + Activity row (2 columns)**:
   - **Pipeline status**: List of 5 most recent pipeline jobs with status pills, confidence chips, and relative timestamps
   - **Activity feed**: 6 most recent newsroom events (publish, pipeline, donor, source, comment, fail) with colored icons and relative timestamps

**Data sources**: `SITE_STATS`, `PIPELINE_JOBS`, `ARTICLES`, `DONOR_STATS.monthly`, `ACTIVITY_FEED`

---

### 2. Articles Tab

**File**: `tabs/ArticlesTab.tsx`
**Purpose**: Searchable, filterable table of all articles — the editor's content management view.

**Features**:
- **Search bar**: Full-width input that filters articles by title (case-insensitive)
- **Category filter pills**: 8 categories (All, News, Transfers, Previews, Reviews, Tactical, Opinion, Youth) — horizontally scrollable on mobile
- **Bulk selection**: Header checkbox selects/deselects all filtered rows; per-row checkboxes for individual selection. When items are selected, a bulk-action bar appears with Publish, Archive, and Delete buttons.
- **Desktop table**: 8 columns — checkbox, title (with ID + author), category, status pill, confidence chip, view count, published date, row actions menu
- **Mobile cards**: Stacked card layout with checkbox, status pill, confidence chip, title, and meta line (category · views · date)
- **Pagination footer**: Shows "Showing X of Y articles" with page navigation (Prev, 1, 2, 3, Next)

**Data source**: `ARTICLES` (8 articles)

---

### 3. Pipeline Tab

**File**: `tabs/PipelineTab.tsx`
**Purpose**: Visual workflow for the five-agent editorial pipeline — the showcase tab.

**Layout**: 2-column grid (1fr / 1.4fr on desktop).

**Left column — Job list**:
- Summary tiles at top: Running, Completed (24h), Pending, Failed — each with colored icon
- Scrollable list of 6 pipeline jobs, each showing status pill, job ID, stage, trigger type, relative timestamp, and confidence score (if available)
- Clicking a job selects it and updates the detail view on the right

**Right column — Job detail**:
- **Header card**: Status pill, job ID, trigger type, current stage, timestamps, error message (if any), and a 64px confidence ring
- **Agent timeline**: Vertical timeline of all 5 stages (Scout → Fact-checker → Analyst → Writer → Editor). Each stage shows:
  - Stage icon (colored gradient badge when completed, blue spinner when running, red X when failed, gray dash when skipped)
  - Stage name + description
  - Status pill
  - 4-stat grid: Duration (seconds), Tokens in, Tokens out, Model name
  - Error message (if the stage failed)
  - Vertical connector line between stages (green if completed, white if not)
- **Run totals card**: Total tokens in, tokens out, duration, and estimated cost (calculated at $0.000002/token)
- **Confidence breakdown card**: 4 weighted bars (Source tier 40%, Cross-reference 30%, Entity match 20%, Historical 10%) with the rationale quote at the bottom

**Data source**: `PIPELINE_JOBS` (6 jobs with full agent results, confidence, and error states)

---

### 4. Sources Tab

**File**: `tabs/SourcesTab.tsx`
**Purpose**: Credibility source management — the RSS feeds and APIs that power the pipeline.

**Layout**:
- **Summary row**: 4 stat tiles (Active sources, Avg reliability, Tier-1 sources, Official feeds)
- **Source grid**: 8 source cards in a responsive grid (1/2/3 columns)

**Each source card**:
- Confidence ring (48px) showing the source's reliability score (0–100%)
- Source name (e.g., BBC Sport, The Guardian, Sky Sports, The Athletic, Fabrizio Romano, Premier League, The Telegraph, The Times)
- Tier badge: Official (pitch green), Tier 1 (emerald), Tier 2 (blue), Tier 3 (amber), Social (purple)
- Source URL (clickable, truncates nicely)
- Type + last-polled timestamp
- Active/Paused indicator with colored dot (green pulse when active)
- "Configure" link

**Data source**: `SOURCES` (8 credibility sources)

---

### 5. Transfers Tab

**File**: `tabs/TransfersTab.tsx`
**Purpose**: Transfer rumour tracker with confidence scoring.

**Layout**:
- **Summary row**: 4 stat tiles (Tracked transfers, Total value, Avg confidence, Rumours with low confidence)
- **Transfer grid**: Cards in a 2-column grid

**Each transfer card**:
- 56px confidence ring
- Status pill (rumour, negotiating, agreed, medical, signed, rejected, loan)
- Transfer window label
- Player name (large display font)
- From-club → to-club with arrow icon
- 3-cell grid: Fee (with currency), Type (permanent/loan/free/release), Reported (relative time)
- Contract length + wage (if available)
- Confidence rationale (italic quote)

**Data source**: `TRANSFERS` (3 transfers: Wirtz, Osimhen, Bruno Guimarães)

---

### 6. Live Tab

**File**: `tabs/LiveTab.tsx`
**Purpose**: Live match commentary feed — real-time match events.

**Layout**: 2-column grid (1fr / 1.4fr on desktop).

**Left column — Match list**:
- "Matches" heading
- 4 match cards (Manchester City vs Arsenal [LIVE 67'], Real Madrid vs Sevilla [LIVE 23'], Inter vs Juventus [HT], Bayern vs Dortmund [UPCOMING])
- Each card: competition, live/HT/scheduled status badge, team names, score (if applicable), last event snippet

**Right column — Event feed**:
- Score header: home team + formation, score (large tabular), away team + formation, match status with live dot
- Scrollable list of match events, each showing:
  - Minute badge (monospace)
  - Event icon (12 types: kickoff, goal, yellow card, red card, substitution, penalty, VAR, halftime, fulltime, chance, commentary, injury) — color-coded by type
  - Event description + detail + player name (if applicable)
  - Relative timestamp

**Data sources**: `LIVE_MATCHES` (4 matches), `LIVE_EVENTS` (5 events for Manchester City vs Arsenal)

---

### 7. Donors Tab

**File**: `tabs/DonorsTab.tsx`
**Purpose**: Reader donations and revenue tracking.

**Layout**:
- **KPI row**: 4 tiles (Total donors, Active monthly, Total raised, Churn rate)
- **Charts row (2 columns)**:
  - **Monthly revenue sparkline**: 12-month donation trend with 12mo total, avg/mo, and avg contribution
  - **Revenue by tier bar chart**: 4 tiers (Patron, Member, Supporter, Founding backer) with per-tier donor count and revenue breakdown
- **Donor table**: Searchable table with 12 recent donors

**Donor table columns**:
- Donor (avatar with first initial, name, masked email)
- Tier badge (color-coded: Patron=gold, Member=pitch, Founding backer=purple, Supporter=gray)
- Total contributed (currency-formatted)
- Since (relative date)
- Row actions menu (appears on hover)

**Data sources**: `DONORS` (12 donors), `DONOR_STATS` (totals, churn, by-tier breakdown, 12-month revenue series)

---

## Authentication

**Demo credentials**: `editor@qawla.com` / `qawla2025` (pre-filled in the login form)

**Auth flow**:
1. User navigates to `#/dashboard` (direct URL — not linked from public site)
2. `LoginScreen` renders (or dashboard if already authed)
3. On successful login, `handleLogin()` sets `authed=true` in React state and persists `qawla-authed=true` to `localStorage`
4. `DashboardShell` renders with all 7 tabs accessible
5. On sign-out (sidebar user card or mobile topbar button), `handleLogout()` clears auth state and `localStorage`, then navigates back to `#/` (public homepage)

**Security note**: This is a demo auth flow for the sandbox. Production uses HMAC-signed JWT sessions (8-hour TTL) via `lib/session.ts` with PBKDF2 password hashing — see the session module and the original README for details.

---

## Design System

The dashboard uses the same Qawla design system as the public site, but in dark mode:

| Token | Value |
|---|---|
| Background | `bg-night` (#060d1f) with `pitch-pattern` texture |
| Card | `dash-card` (white/3% bg, white/6% border, backdrop-blur) |
| Text primary | `text-cream` (#f8faff) |
| Text secondary | `text-cream/55` |
| Accent | `text-pitch` (#00d96a) |
| Gold accent | `text-gold` (#ffc857) |
| Font display | Bricolage Grotesque (600, 800) |
| Font body | Outfit (400, 600, 700) |

**Animations**: `animate-fade-in-up` (entrance), `animate-pulse-glow` (active states), `animate-scale-in` (modals), `ring-progress` (confidence rings), `card-lift` (hover).

---

## File Dependencies

```
DashboardShell
├── Logo (from ../Logo)
├── DEMO_ADMIN (from @/lib/mockData)
├── cn, formatRelative (from @/lib/utils)
└── tabs/
    ├── OverviewTab
    │   ├── DashCard, KpiTile, StatusPill, ConfidenceChip, MiniBarChart, Sparkline (from ../shared)
    │   ├── SITE_STATS, ARTICLES, PIPELINE_JOBS, ACTIVITY_FEED, DONOR_STATS (from @/lib/mockData)
    │   └── formatRelative, formatNumber, formatCurrency, cn (from @/lib/utils)
    ├── ArticlesTab
    │   ├── DashCard, StatusPill, ConfidenceChip, DashEmptyState (from ../shared)
    │   ├── ARTICLES (from @/lib/mockData)
    │   └── formatRelative, formatNumber, cn (from @/lib/utils)
    ├── PipelineTab
    │   ├── DashCard, StatusPill, ConfidenceChip, ConfidenceRing (from ../shared)
    │   ├── PIPELINE_JOBS (from @/lib/mockData)
    │   └── formatRelative, cn (from @/lib/utils)
    ├── SourcesTab
    │   ├── DashCard, ConfidenceRing (from ../shared)
    │   ├── SOURCES (from @/lib/mockData)
    │   └── formatRelative, cn (from @/lib/utils)
    ├── TransfersTab
    │   ├── DashCard, ConfidenceRing, StatusPill (from ../shared)
    │   ├── TRANSFERS (from @/lib/mockData)
    │   └── formatRelative, formatCurrency, formatNumber, cn (from @/lib/utils)
    ├── LiveTab
    │   ├── DashCard (from ../shared)
    │   ├── LIVE_MATCHES, LIVE_EVENTS (from @/lib/mockData)
    │   └── formatRelative, cn (from @/lib/utils)
    └── DonorsTab
        ├── DashCard, MiniBarChart, Sparkline (from ../shared)
        ├── DONORS, DONOR_STATS (from @/lib/mockData)
        └── formatCurrency, formatNumber, formatRelative, cn (from @/lib/utils)
```

---

## Extending the Dashboard

To add a new tab:

1. Create `src/components/qawla/dashboard/tabs/YourTab.tsx` — a client component exporting a default function
2. Add the tab to the `TABS` array in `DashboardShell.tsx` with `id`, `label`, `description`, and `icon`
3. Add the `DashTab` union type entry in `DashboardShell.tsx`
4. Add the conditional render in the `DashboardShell` main content area: `{active === 'yourtab' && <YourTab />}`
5. (Optional) Add mock data to `src/lib/mockData.ts`

The sidebar, topbar, mobile drawer, and search will automatically pick up the new tab.
