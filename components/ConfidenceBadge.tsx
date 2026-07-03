import { confidenceColor, labelColor } from '@/lib/confidence';
import { cn } from '@/lib/utils';
import type { DecisionLabel } from '@/types';

interface ConfidenceBadgeProps {
  score: number;
  label?: DecisionLabel;
  compact?: boolean;
  showLabel?: boolean;
  className?: string;
}

export function ConfidenceBadge({
  score,
  label,
  compact = false,
  showLabel = true,
  className,
}: ConfidenceBadgeProps) {
  const colors = confidenceColor(score);
  const display = label ? label.charAt(0).toUpperCase() + label.slice(1) : '';

  if (compact) {
    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full border',
          colors.bg,
          colors.text,
          colors.border,
          className,
        )}
        title={`Confidence: ${score}/100${display ? ` — ${display}` : ''}`}
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping', colors.text.replace('text-', 'bg-'))} />
          <span className={cn('relative inline-flex rounded-full h-1.5 w-1.5', colors.text.replace('text-', 'bg-'))} />
        </span>
        {score}%
      </span>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-bold',
        colors.bg,
        colors.text,
        colors.border,
        className,
      )}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
      <span>Confidence: {score}/100</span>
      {showLabel && label && (
        <>
          <span className="opacity-40">·</span>
          <span className={cn('px-2 py-0.5 rounded-full text-xs', labelColor(label))}>
            {display}
          </span>
        </>
      )}
    </div>
  );
}
