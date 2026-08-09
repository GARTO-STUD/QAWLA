'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to analytics / error tracking
    console.error('Qawla route error:', error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-red-50 flex items-center justify-center text-red-600 mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-night mb-3">
          Something went wrong
        </h1>
        <p className="text-night/60 mb-6">
          {error.message || 'An unexpected error occurred. Our team has been notified.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={reset} className="btn-primary justify-center">
            Try again
          </button>
          <Link href="/" className="btn-secondary justify-center">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
