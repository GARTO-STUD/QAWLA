'use client';

import { useState, useMemo } from 'react';
import { DashCard, MiniBarChart, Sparkline } from '../shared';
import { DONORS, DONOR_STATS } from '@/lib/mockData';
import { formatCurrency, formatNumber, formatRelative, cn } from '@/lib/utils';

/**
 * DonorsTab — reader backers & revenue.
 *
 * Top: 4 KPIs (total donors, active monthly, total raised, churn).
 * Middle: revenue sparkline + tier breakdown bar chart.
 * Bottom: searchable donor table.
 */
export function DonorsTab() {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search) return DONORS;
    return DONORS.filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.email.toLowerCase().includes(search.toLowerCase()) ||
      (d.tier || '').toLowerCase().includes(search.toLowerCase()),
    );
  }, [search]);

  return (
    <div className="space-y-5">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatBox label="Total donors" value={formatNumber(DONOR_STATS.totalDonors)} variant="pitch" />
        <StatBox label="Active monthly" value={formatNumber(DONOR_STATS.activeMonthly)} />
        <StatBox label="Total raised" value={formatCurrency(DONOR_STATS.totalRaised)} variant="gold" />
        <StatBox label="Churn rate" value={`${(DONOR_STATS.churnRate * 100).toFixed(1)}%`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DashCard
          title="Monthly revenue"
          subtitle="Last 12 months"
          action={<span className="badge badge-pitch">{formatCurrency(DONOR_STATS.monthly[DONOR_STATS.monthly.length - 1].revenue)}/mo</span>}
        >
          <Sparkline data={DONOR_STATS.monthly.map((m) => m.revenue)} height={120} color="#ffc857" />
          <div className="mt-3 pt-3 border-t border-black/0.5 grid grid-cols-3 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-night/40 font-semibold">12mo total</p>
              <p className="font-display font-bold text-base text-night tabular-nums">
                {formatCurrency(DONOR_STATS.monthly.reduce((a, b) => a + b.revenue, 0))}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-night/40 font-semibold">Avg/mo</p>
              <p className="font-display font-bold text-base text-night tabular-nums">
                {formatCurrency(Math.round(DONOR_STATS.monthly.reduce((a, b) => a + b.revenue, 0) / 12))}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-night/40 font-semibold">Avg contribution</p>
              <p className="font-display font-bold text-base text-night tabular-nums">
                {formatCurrency(DONOR_STATS.avgContribution)}
              </p>
            </div>
          </div>
        </DashCard>

        <DashCard title="Revenue by tier" subtitle="Active subscribers">
          <MiniBarChart
            data={DONOR_STATS.byTier.map((t) => ({ label: t.tier.charAt(0), value: t.revenue }))}
            height={140}
            color="#00d96a"
          />
          <div className="mt-3 pt-3 border-t border-black/0.5 space-y-1.5">
            {DONOR_STATS.byTier.map((t) => (
              <div key={t.tier} className="flex items-center justify-between text-xs">
                <span className="text-night/70">{t.tier}</span>
                <span className="text-night tabular-nums">
                  <span className="text-night/50">{t.count} donors</span>
                  <span className="mx-1.5 text-night/30">·</span>
                  <span className="font-semibold">{formatCurrency(t.revenue)}</span>
                </span>
              </div>
            ))}
          </div>
        </DashCard>
      </div>

      {/* Donor table */}
      <DashCard
        title="Recent donors"
        subtitle={`${DONORS.length} shown · ${formatNumber(DONOR_STATS.totalDonors)} total`}
        action={
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 text-night/40" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="dash-input !py-1.5 !pl-7 !text-xs w-40"
            />
          </div>
        }
        className="!p-0 overflow-hidden"
      >
        <div className="overflow-x-auto scroll-area-qawla">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/0.5 text-[10px] uppercase tracking-wider text-night/40">
                <th className="text-left p-3 pl-4 font-semibold">Donor</th>
                <th className="text-left p-3 font-semibold">Tier</th>
                <th className="text-right p-3 font-semibold">Total contributed</th>
                <th className="text-left p-3 font-semibold">Since</th>
                <th className="p-3 pr-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => {
                const tierColor =
                  d.tier === 'Patron' ? 'bg-gold/15 text-gold' :
                  d.tier === 'Member' ? 'bg-pitch/15 text-pitch' :
                  d.tier === 'Founding backer' ? 'bg-purple-500/15 text-purple-400' :
                  'bg-black/[0.06] text-night/60';
                return (
                  <tr key={d.id} className="border-b border-black/0.5 hover:bg-black/[0.02] transition-colors group">
                    <td className="p-3 pl-4">
                      <div className="flex items-center gap-2.5">
                        <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-pitch to-pitch-dark text-white font-display font-bold text-xs flex items-center justify-center">
                          {d.name === 'Anonymous' ? '?' : d.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-night truncate">{d.name}</p>
                          <p className="text-[10px] text-night/40 truncate">{d.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={cn('inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider', tierColor)}>
                        {d.tier}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-sm font-semibold text-night tabular-nums">
                        {formatCurrency(d.totalContributed, d.currency)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-night/55">{formatRelative(d.since)}</span>
                    </td>
                    <td className="p-3 pr-4 text-right">
                      <button className="opacity-0 group-hover:opacity-100 w-7 h-7 inline-flex items-center justify-center rounded-md text-night/50 hover:text-night hover:bg-black/[0.05] transition-all">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </DashCard>
    </div>
  );
}

function StatBox({ label, value, variant }: { label: string; value: string | number; variant?: 'pitch' | 'gold' }) {
  const cls = variant === 'pitch' ? 'text-pitch' : variant === 'gold' ? 'text-gold' : 'text-night';
  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white shadow-sm hover:shadow-md transition-all rounded-2xl p-4">
      <p className={cn('font-display font-extrabold text-2xl tabular-nums', cls)}>{value}</p>
      <p className="text-[11px] uppercase tracking-wider text-night/50 mt-1 font-semibold">{label}</p>
    </div>
  );
}

export default DonorsTab;
