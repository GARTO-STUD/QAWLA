/**
 * shared.tsx — Reusable dashboard UI primitives (light theme).
 *
 * A collection of building blocks used across all dashboard tabs.
 * All components are light-themed (night text on white/cream cards)
 * to match the dashboard's bright aesthetic.
 *
 * Components:
 *   • DashCard         — light card container with subtle border
 *   • KpiTile          — metric tile with icon + delta
 *   • StatusPill       — colored status badge
 *   • ConfidenceChip   — compact 0–100 confidence display
 *   • ConfidenceRing   — SVG circular progress ring
 *   • MiniBarChart     — responsive bar chart
 *   • Sparkline        — SVG line chart with area fill
 *   • DashEmptyState   — empty-state card
 *
 * See DASHBOARD.md for usage patterns.
 */

'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/* ─── Shared dashboard UI primitives ─────────────────────────────────────── */

/** A panel that mimics a clean white card on the cream dashboard. */
export function DashCard({
  children,
  className,
  title,
  subtitle,
  action,
}: {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className={cn('rounded-2xl border border-black/[0.06] bg-white shadow-sm hover:shadow-md transition-all', className)}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 mb-4 p-5 pb-0">
          <div>
            {title && (
              <h3 className="font-display font-bold text-base text-night">{title}</h3>
            )}
            {subtitle && (
              <p className="text-xs text-night/50 mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-5 pt-0">{!(title || action) && <div className="hidden" />}{children}</div>
    </div>
  );
}

/** KPI tile for the Overview tab. */
export function KpiTile({
  label,
  value,
  delta,
  icon,
  variant = 'default',
}: {
  label: string;
  value: string | number;
  delta?: { value: string; positive: boolean };
  icon: ReactNode;
  variant?: 'default' | 'pitch' | 'gold' | 'red';
}) {
  const variantClass = {
    default: 'text-night',
    pitch: 'text-pitch-darker',
    gold: 'text-gold-dark',
    red: 'text-red-600',
  }[variant];

  const iconBg = {
    default: 'bg-black/[0.04] text-night/60',
    pitch: 'bg-pitch/10 text-pitch-darker',
    gold: 'bg-gold/15 text-gold-dark',
    red: 'bg-red-500/10 text-red-600',
  }[variant];

  return (
    <div className="rounded-2xl border border-black/[0.06] bg-white shadow-sm p-4 hover:shadow-md transition-all">
      <div className="flex items-start justify-between mb-3">
        <span className={cn('w-9 h-9 rounded-lg flex items-center justify-center', iconBg)}>
          {icon}
        </span>
        {delta && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold',
              delta.positive
                ? 'bg-pitch/12 text-pitch-darker'
                : 'bg-red-500/12 text-red-600',
            )}
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={cn(!delta.positive && 'rotate-180')}>
              <path d="m6 15 6-6 6 6" />
            </svg>
            {delta.value}
          </span>
        )}
      </div>
      <p className="font-display font-extrabold text-2xl sm:text-3xl text-night tabular-nums leading-none">
        {value}
      </p>
      <p className="text-[11px] uppercase tracking-wider text-night/50 mt-2 font-semibold">
        {label}
      </p>
    </div>
  );
}

/** Status pill used across tables and lists. */
export function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    published: { label: 'Published', cls: 'bg-pitch/12 text-pitch-darker' },
    draft: { label: 'Draft', cls: 'bg-black/[0.06] text-night/60' },
    in_review: { label: 'In review', cls: 'bg-gold/15 text-gold-dark' },
    fact_checking: { label: 'Fact-checking', cls: 'bg-blue-500/12 text-blue-700' },
    archived: { label: 'Archived', cls: 'bg-black/[0.04] text-night/40' },
    rejected: { label: 'Rejected', cls: 'bg-red-500/12 text-red-600' },
    completed: { label: 'Completed', cls: 'bg-pitch/12 text-pitch-darker' },
    running: { label: 'Running', cls: 'bg-blue-500/12 text-blue-700' },
    pending: { label: 'Pending', cls: 'bg-black/[0.06] text-night/60' },
    failed: { label: 'Failed', cls: 'bg-red-500/12 text-red-600' },
    skipped: { label: 'Skipped', cls: 'bg-black/[0.04] text-night/40' },
  };
  const m = map[status] || { label: status, cls: 'bg-black/[0.06] text-night/60' };
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider', m.cls)}>
      {(status === 'running' || status === 'fact_checking') && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      )}
      {m.label}
    </span>
  );
}

/** Confidence chip with color coding. */
export function ConfidenceChip({ score }: { score: number }) {
  const visual =
    score >= 85 ? { label: 'Verified', cls: 'bg-pitch/12 text-pitch-darker' } :
    score >= 70 ? { label: 'Likely', cls: 'bg-emerald-500/12 text-emerald-700' } :
    score >= 55 ? { label: 'Unverified', cls: 'bg-amber-500/12 text-amber-700' } :
    score >= 35 ? { label: 'Disputed', cls: 'bg-orange-500/12 text-orange-700' } :
                   { label: 'Rejected', cls: 'bg-red-500/12 text-red-600' };
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider', visual.cls)}>
      <span className="tabular-nums">{score}</span>
      {visual.label}
    </span>
  );
}

/** Circular progress ring (SVG). */
export function ConfidenceRing({
  score,
  size = 56,
  stroke = 5,
}: {
  score: number;
  size?: number;
  stroke?: number;
}) {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (score / 100) * circ;

  const color =
    score >= 85 ? '#00a854' :
    score >= 70 ? '#10b981' :
    score >= 55 ? '#f59e0b' :
    score >= 35 ? '#fb923c' :
                  '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(6,13,31,0.08)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          className="ring-progress"
        />
      </svg>
      <span className="absolute font-display font-extrabold text-sm text-night tabular-nums">
        {score}
      </span>
    </div>
  );
}

/** Simple bar chart for the Overview tab. */
export function MiniBarChart({
  data,
  height = 120,
  color = '#00a854',
}: {
  data: { label: string; value: number }[];
  height?: number;
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-1.5" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center justify-end gap-1.5 group">
          <div className="text-[10px] text-night/40 opacity-0 group-hover:opacity-100 transition-opacity tabular-nums">
            {d.value.toLocaleString()}
          </div>
          <div
            className="w-full rounded-t-md transition-all duration-500 hover:opacity-80"
            style={{
              height: `${(d.value / max) * (height - 24)}px`,
              background: `linear-gradient(180deg, ${color} 0%, ${color}80 100%)`,
              minHeight: '4px',
            }}
          />
          <span className="text-[10px] text-night/50">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

/** Sparkline (line chart). */
export function Sparkline({
  data,
  width = 280,
  height = 60,
  color = '#00a854',
}: {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  if (data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1 || 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 8) - 4;
    return { x, y, v };
  });

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const area = `${path} L ${width} ${height} L 0 ${height} Z`;

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${color.replace('#', '')})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="2" fill={color} className="opacity-0 hover:opacity-100 transition-opacity" />
      ))}
    </svg>
  );
}

/** Empty state for tabs with no data. */
export function DashEmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-black/[0.12] bg-white/50 p-10 text-center">
      {icon && (
        <div className="mx-auto mb-3 w-12 h-12 rounded-xl bg-black/[0.04] text-night/60 flex items-center justify-center">
          {icon}
        </div>
      )}
      <h3 className="font-display font-bold text-base text-night mb-1">{title}</h3>
      {description && <p className="text-sm text-night/55 max-w-sm mx-auto">{description}</p>}
    </div>
  );
}
