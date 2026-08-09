import { cn, formatNumber } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: number | string;
  suffix?: string;
  icon?: React.ReactNode;
  trend?: number;
  variant?: 'default' | 'pitch' | 'gold' | 'night';
  className?: string;
}

export function StatCard({
  label,
  value,
  suffix,
  icon,
  trend,
  variant = 'default',
  className,
}: StatCardProps) {
  const displayValue = typeof value === 'number' ? formatNumber(value) : value;

  const styles = {
    default: 'bg-white border border-gray-100 text-night',
    pitch: 'pitch-gradient text-white border-0',
    gold: 'bg-gradient-to-br from-gold to-gold-dark text-night border-0',
    night: 'night-gradient text-cream border-0',
  };

  return (
    <div
      className={cn(
        'relative p-5 sm:p-6 rounded-2xl shadow-sm overflow-hidden group transition-all hover:shadow-lg',
        styles[variant],
        className,
      )}
    >
      <div className="absolute -top-8 -right-8 w-24 h-24 rounded-full bg-white/5 group-hover:scale-150 transition-transform duration-700" aria-hidden />

      <div className="relative flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className={cn(
            'text-xs sm:text-sm font-bold uppercase tracking-wider mb-2',
            variant === 'default' ? 'text-night/60' : 'opacity-80',
          )}>
            {label}
          </p>
          <p className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl leading-none">
            {displayValue}
            {suffix && <span className="text-lg sm:text-xl ml-0.5 opacity-80">{suffix}</span>}
          </p>
          {typeof trend === 'number' && (
            <div className={cn(
              'mt-2 inline-flex items-center gap-1 text-xs font-bold',
              trend >= 0 ? 'text-emerald-600' : 'text-red-600',
              variant !== 'default' && 'text-current opacity-90',
            )}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={trend < 0 ? 'rotate-180' : ''}>
                <path d="m6 17 11-11M11 6h6v6" />
              </svg>
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        {icon && (
          <div className={cn(
            'flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center',
            variant === 'default' ? 'bg-pitch/10 text-pitch-dk' : 'bg-white/15',
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
