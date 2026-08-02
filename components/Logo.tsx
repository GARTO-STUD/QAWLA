import { useId } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Qawla Logo — An elegant typographic "Q" mark
 * Clean, modern, and sophisticated for premium football journalism
 */
export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const dim = size === 'sm' ? 32 : size === 'lg' ? 52 : 42;
  
  return (
    <a
      href="/"
      className={cn('inline-flex items-center gap-2.5 group', className)}
      aria-label="Qawla home"
    >
      <span 
        className="relative inline-flex items-center justify-center font-display font-black rounded-xl bg-gradient-to-br from-pitch via-pitch-dark to-pitch-darker text-white shadow-lg shadow-pitch/25"
        style={{ 
          width: dim, 
          height: dim,
          fontSize: size === 'sm' ? '20px' : size === 'lg' ? '32px' : '26px'
        }}
      >
        <span className="transform group-hover:scale-110 transition-transform duration-300">
          Q
        </span>
        {/* Subtle shine effect */}
        <span className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </span>
      {showText && (
        <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight">
          <span className="text-night">Qawla</span>
        </span>
      )}
    </a>
  );
}
