'use client';

import { useState, useEffect } from 'react';
import { Logo } from '../Logo';
import { DEMO_ADMIN } from '@/lib/mockData';
import { cn, formatRelative } from '@/lib/utils';
import { OverviewTab } from './tabs/OverviewTab';
import { ArticlesTab } from './tabs/ArticlesTab';
import { PipelineTab } from './tabs/PipelineTab';
import { SourcesTab } from './tabs/SourcesTab';
import { TransfersTab } from './tabs/TransfersTab';
import { LiveTab } from './tabs/LiveTab';
import { DonorsTab } from './tabs/DonorsTab';
import { AdminTab } from './tabs/AdminTab';

/**
 * DashboardShell — the editorial dashboard's persistent layout.
 *
 * Renders a three-region layout:
 *
 *   ┌─────────┬───────────────────────────────────┐
 *   │         │  Topbar (sticky)                   │
 *   │ Sidebar │  ─────────────────────────────────│
 *   │ (sticky)│                                    │
 *   │         │  Tab content (scrollable)          │
 *   │         │                                    │
 *   │         │                                    │
 *   └─────────┴───────────────────────────────────┘
 *
 * ── Sidebar (desktop, md+) ──
 *   • Width: 256px expanded, 68px collapsed
 *   • Collapse state persisted to localStorage (qawla-dash-collapsed)
 *   • 7 tab buttons (Overview, Articles, Pipeline, Sources, Transfers,
 *     Live, Donors) with icon + label + description
 *   • Active tab: pitch-green highlight, pulse dot, accent text
 *   • Collapse toggle at the bottom (chevron icon, rotates)
 *   • User card: Qawla logo avatar, editor name, email, sign-out button
 *
 * ── Topbar (sticky) ──
 *   • Mobile: tab dropdown trigger (expands to 2-col grid of tabs)
 *   • Desktop: active tab title + description
 *   • Global search input (with ⌘K hint on lg+)
 *   • Notifications bell with pulsing pitch-green dot
 *   • "View site" button → navigates to #/
 *   • Mobile: compact sign-out icon button
 *
 * ── Tab content ──
 *   • Scrollable main region with custom dark scrollbar
 *   • Max-width 1280px container, responsive padding (16/24/32px)
 *   • Each tab is a separate component, conditionally rendered by `active`
 *
 * See DASHBOARD.md for per-tab documentation.
 */
export type DashTab =
  | 'overview'
  | 'articles'
  | 'pipeline'
  | 'sources'
  | 'transfers'
  | 'live'
  | 'donors'
  | 'admin';

const TABS: { id: DashTab; label: string; icon: React.ReactNode; description: string }[] = [
  {
    id: 'overview',
    label: 'Overview',
    description: 'Newsroom at a glance',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="9" rx="1" />
        <rect x="14" y="3" width="7" height="5" rx="1" />
        <rect x="14" y="12" width="7" height="9" rx="1" />
        <rect x="3" y="16" width="7" height="5" rx="1" />
      </svg>
    ),
  },
  {
    id: 'articles',
    label: 'Articles',
    description: 'Published & draft stories',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
      </svg>
    ),
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    description: 'Five-stage editorial flow',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h4l3-9 4 18 3-9h4" />
      </svg>
    ),
  },
  {
    id: 'sources',
    label: 'Sources',
    description: 'RSS & credibility feeds',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16" />
        <circle cx="5" cy="19" r="1" />
      </svg>
    ),
  },
  {
    id: 'transfers',
    label: 'Transfers',
    description: 'Rumour tracker & confidence',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7" />
      </svg>
    ),
  },
  {
    id: 'live',
    label: 'Live',
    description: 'Match commentary feed',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    id: 'donors',
    label: 'Donors',
    description: 'Reader backers & revenue',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    id: 'admin',
    label: 'Admin',
    description: 'Create & manage content',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
  },
];

export interface DashboardShellProps {
  onLogout: () => void;
  onBackToSite: () => void;
}

export function DashboardShell({ onLogout, onBackToSite }: DashboardShellProps) {
  const [active, setActive] = useState<DashTab>('overview');
  // Lazy initial state — read sidebar collapse from localStorage on the client only.
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('qawla-dash-collapsed') === 'true';
  });
  const [mobileTabOpen, setMobileTabOpen] = useState(false);
  const [liveMode, setLiveMode] = useState(false);
  const [livePulse, setLivePulse] = useState(false);

  // Persist sidebar collapse to localStorage whenever it changes.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('qawla-dash-collapsed', String(sidebarCollapsed));
    }
  }, [sidebarCollapsed]);

  const handleGoLive = () => {
    setLivePulse(true);
    setTimeout(() => {
      setLiveMode(true);
      setLivePulse(false);
    }, 1500);
  };

  const activeTab = TABS.find((t) => t.id === active)!;

  return (
    <div className="min-h-screen bg-cream text-night flex">
      {/* ── Sidebar (desktop) ──────────────────────────────────────────── */}
      <aside
        className={cn(
          'hidden md:flex flex-col sticky top-0 h-screen bg-white border-r border-black/[0.08] transition-all duration-300',
          sidebarCollapsed ? 'w-[68px]' : 'w-64',
        )}
      >
        {/* Brand */}
        <div className="h-16 flex items-center px-4 border-b border-black/[0.06]">
          {sidebarCollapsed ? (
            <Logo size="xs" wordmark={false} />
          ) : (
            <Logo size="sm" variant="dark" />
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto scroll-area-qawla" aria-label="Dashboard">
          {TABS.map((tab) => {
            const isActive = tab.id === active;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={cn(
                  'group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all',
                  isActive
                    ? 'bg-pitch/12 text-pitch-darker shadow-sm'
                    : 'text-night/60 hover:text-night hover:bg-black/[0.04]',
                  sidebarCollapsed && 'justify-center px-0',
                )}
                title={sidebarCollapsed ? tab.label : undefined}
              >
                <span className={cn('shrink-0', isActive && 'text-pitch-darker')}>{tab.icon}</span>
                {!sidebarCollapsed && (
                  <span className="flex-1 text-left">
                    <span className="block">{tab.label}</span>
                    <span className={cn('block text-[10px] mt-0.5 font-normal', isActive ? 'text-pitch-darker/70' : 'text-night/40')}>
                      {tab.description}
                    </span>
                  </span>
                )}
                {isActive && !sidebarCollapsed && (
                  <span className="w-1.5 h-1.5 rounded-full bg-pitch animate-pulse-glow" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="p-3 border-t border-black/[0.06]">
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-night/55 hover:text-night hover:bg-black/[0.04] transition-colors',
              sidebarCollapsed && 'justify-center',
            )}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={cn('transition-transform', sidebarCollapsed && 'rotate-180')}>
              <path d="M15 18l-6-6 6-6" />
            </svg>
            {!sidebarCollapsed && 'Collapse'}
          </button>
        </div>

        {/* User */}
        <div className="p-3 border-t border-black/[0.06]">
          <div className={cn('flex items-center gap-3 p-2 rounded-xl', !sidebarCollapsed && 'bg-black/[0.03]')}>
            <Logo size="xs" wordmark={false} className="shrink-0" />
            {!sidebarCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-night truncate">{DEMO_ADMIN.name}</p>
                <p className="text-[10px] text-night/50 truncate">{DEMO_ADMIN.email}</p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                type="button"
                onClick={onLogout}
                className="shrink-0 w-7 h-7 inline-flex items-center justify-center rounded-md text-night/40 hover:text-red-600 hover:bg-red-500/10 transition-colors"
                aria-label="Sign out"
                title="Sign out"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-xl border-b border-black/[0.08] flex items-center px-4 sm:px-6 gap-3">
          {/* Mobile: tab dropdown trigger */}
          <button
            type="button"
            onClick={() => setMobileTabOpen((v) => !v)}
            className="md:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-cream border border-black/[0.08] text-night text-sm font-semibold"
            aria-expanded={mobileTabOpen}
          >
            {activeTab.icon}
            {activeTab.label}
            <svg className={cn('transition-transform', mobileTabOpen && 'rotate-180')} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>

          {/* Title (desktop) */}
          <div className="hidden md:flex items-center gap-3">
            <h1 className="font-display font-bold text-lg text-night">{activeTab.label}</h1>
            <span className="text-xs text-night/40">·</span>
            <span className="text-xs text-night/55">{activeTab.description}</span>
          </div>

          <div className="flex-1" />

          {/* Search */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-cream border border-black/[0.08] w-56 lg:w-72">
            <svg className="text-night/40" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              placeholder="Search articles, sources, donors…"
              className="flex-1 bg-transparent text-xs text-night placeholder:text-night/40 focus:outline-none"
            />
            <kbd className="hidden lg:inline px-1.5 py-0.5 rounded text-[10px] font-mono text-night/40 bg-white border border-black/[0.08]">⌘K</kbd>
          </div>

          {/* Notifications */}
          <button
            type="button"
            className="relative w-9 h-9 inline-flex items-center justify-center rounded-lg bg-cream border border-black/[0.08] text-night/70 hover:text-night hover:bg-pitch/8 transition-colors"
            aria-label="Notifications"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-pitch animate-pulse" />
          </button>

          {/* Go live with real data */}
          <button
            type="button"
            onClick={handleGoLive}
            disabled={liveMode || livePulse}
            className={cn(
              'hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all text-xs min-h-[36px]',
              liveMode
                ? 'bg-pitch/12 text-pitch-darker border border-pitch/30'
                : livePulse
                  ? 'bg-pitch/8 text-pitch-darker border border-pitch/20 pointer-events-none'
                  : 'bg-gradient-to-br from-pitch to-pitch-dark text-white border border-transparent hover:shadow-md hover:shadow-pitch/20',
            )}
          >
            {livePulse ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Connecting…
              </>
            ) : liveMode ? (
              <>
                <span className="live-dot" />
                Live data active
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01" />
                </svg>
                Go live
              </>
            )}
          </button>

          {/* Back to site */}
          <button
            type="button"
            onClick={onBackToSite}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cream border border-black/[0.08] text-night/70 hover:text-night hover:bg-pitch/8 transition-colors text-xs font-semibold"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H10v7H5a1 1 0 0 1-1-1V9.5z" />
            </svg>
            View site
          </button>

          {/* Mobile: sign out */}
          <button
            type="button"
            onClick={onLogout}
            className="md:hidden w-9 h-9 inline-flex items-center justify-center rounded-lg bg-cream border border-black/[0.08] text-night/70 hover:text-red-600 hover:bg-red-500/10 transition-colors"
            aria-label="Sign out"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
          </button>
        </header>

        {/* Mobile tab drawer */}
        {mobileTabOpen && (
          <div className="md:hidden border-b border-black/[0.08] bg-white p-2 grid grid-cols-2 gap-1 animate-fade-in">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActive(tab.id);
                  setMobileTabOpen(false);
                }}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors',
                  tab.id === active
                    ? 'bg-pitch/12 text-pitch-darker'
                    : 'text-night/60 hover:bg-black/[0.04]',
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Tab content */}
        <main className="flex-1 overflow-y-auto scroll-area-qawla bg-cream">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {active === 'overview' && <OverviewTab />}
            {active === 'articles' && <ArticlesTab />}
            {active === 'pipeline' && <PipelineTab />}
            {active === 'sources' && <SourcesTab />}
            {active === 'transfers' && <TransfersTab />}
            {active === 'live' && <LiveTab liveMode={liveMode} />}
            {active === 'donors' && <DonorsTab />}
            {active === 'admin' && <AdminTab />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardShell;
