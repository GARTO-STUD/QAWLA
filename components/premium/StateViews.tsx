import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: { label: string; href: string };
  className?: string;
}

export function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 sm:py-16 px-4',
        className,
      )}
    >
      {icon && (
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-pitch/10 flex items-center justify-center text-pitch-dk mb-4">
          {icon}
        </div>
      )}
      <h3 className="font-display font-extrabold text-xl sm:text-2xl text-night">{title}</h3>
      {description && (
        <p className="mt-2 text-sm sm:text-base text-night/60 max-w-md">{description}</p>
      )}
      {action && (
        <Link href={action.href} className="btn-primary mt-6">
          {action.label}
        </Link>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  retry?: () => void;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  retry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-12 sm:py-16 px-4',
        className,
      )}
      role="alert"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-red-50 flex items-center justify-center text-red-600 mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
      </div>
      <h3 className="font-display font-extrabold text-xl sm:text-2xl text-night">{title}</h3>
      <p className="mt-2 text-sm sm:text-base text-night/60 max-w-md">{message}</p>
      {retry && (
        <button onClick={retry} className="btn-primary mt-6">
          Try again
        </button>
      )}
    </div>
  );
}

interface NotFoundStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function NotFoundState({
  title = 'No results found',
  description = 'Try adjusting your search or browse our latest stories.',
  className,
}: NotFoundStateProps) {
  return (
    <div className={cn('text-center py-12 sm:py-16 px-4', className)}>
      <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
          <path d="M8 11h6" />
        </svg>
      </div>
      <h3 className="font-display font-extrabold text-xl sm:text-2xl text-night">{title}</h3>
      <p className="mt-2 text-sm sm:text-base text-night/60 max-w-md mx-auto">{description}</p>
      <Link href="/news" className="btn-primary mt-6">
        Browse latest news
      </Link>
    </div>
  );
}
