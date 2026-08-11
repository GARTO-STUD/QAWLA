import { cn } from '@/lib/utils';

export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('card overflow-hidden', className)} aria-hidden>
      <div className="aspect-[16/9] shimmer" />
      <div className="p-5 space-y-3">
        <div className="h-4 w-20 rounded-full shimmer" />
        <div className="h-5 w-full rounded shimmer" />
        <div className="h-5 w-3/4 rounded shimmer" />
        <div className="h-4 w-full rounded shimmer" />
        <div className="h-4 w-2/3 rounded shimmer" />
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="h-3 w-20 rounded shimmer" />
          <div className="h-3 w-16 rounded shimmer" />
        </div>
      </div>
    </div>
  );
}

export function ArticleGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FeaturedSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden min-h-[400px] sm:min-h-[480px] shimmer" aria-hidden />
  );
}

export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex gap-4 p-4 rounded-xl border border-gray-100" aria-hidden>
          <div className="w-20 h-20 rounded-lg flex-shrink-0 shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-16 rounded shimmer" />
            <div className="h-4 w-full rounded shimmer" />
            <div className="h-4 w-2/3 rounded shimmer" />
            <div className="h-3 w-24 rounded shimmer" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-hidden>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100">
          <div className="w-8 h-8 rounded-full shimmer" />
          <div className="flex-1 h-4 rounded shimmer" />
          <div className="w-20 h-4 rounded shimmer" />
        </div>
      ))}
    </div>
  );
}

export function TextBlockSkeleton({ lines = 4 }: { lines?: number }) {
  return (
    <div className="space-y-2.5" aria-hidden>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 rounded shimmer"
          style={{ width: i === lines - 1 ? '60%' : '100%' }}
        />
      ))}
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <div className="bg-cream pitch-pattern-light min-h-[300px] sm:min-h-[400px] py-16" aria-hidden>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="h-6 w-32 rounded-full shimmer" />
        <div className="h-12 w-full max-w-2xl rounded shimmer" />
        <div className="h-12 w-3/4 max-w-xl rounded shimmer" />
        <div className="h-5 w-full max-w-lg rounded shimmer" />
        <div className="flex gap-3 pt-4">
          <div className="h-11 w-32 rounded-xl shimmer" />
          <div className="h-11 w-32 rounded-xl shimmer" />
        </div>
      </div>
    </div>
  );
}
