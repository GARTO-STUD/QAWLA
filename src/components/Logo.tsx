import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps { className?: string; showText?: boolean; size?: 'sm' | 'md' | 'lg'; light?: boolean; }

/**
 * The Qawla signal: a football pitch drawn into a Q-shaped broadcast frame.
 * The open corner is the Q tail and doubles as the direction of play.
 */
export function Logo({ className, showText = true, size = 'md', light = false }: LogoProps) {
  const dim = size === 'sm' ? 30 : size === 'lg' ? 46 : 38;
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl';
  return <Link href="/" className={cn('inline-flex items-center gap-2.5 group', className)} aria-label="Qawla home">
    <span className="qawla-signal relative inline-flex shrink-0 items-center justify-center overflow-hidden" style={{ width: dim, height: dim }} aria-hidden>
      <svg viewBox="0 0 48 48" className="h-full w-full" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="44" height="44" rx="13" fill="#CDF544"/>
        <path d="M14 10.5H30.5C35.19 10.5 39 14.31 39 19V28.5C39 33.19 35.19 37 30.5 37H17.2L11.4 42.2V19C11.4 14.31 14.31 10.5 19 10.5H14Z" fill="#0A0A0C"/>
        <path d="M17 17H33M17 24H33M17 31H26" stroke="#CDF544" strokeWidth="2.15" strokeLinecap="round"/>
        <circle cx="34" cy="32.5" r="3.6" fill="#0A0A0C" stroke="#CDF544" strokeWidth="1.5"/>
        <path d="M32.5 32.5H35.5M34 31V34" stroke="#CDF544" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
    </span>
    {showText && <span className={cn('qawla-wordmark font-serif font-bold tracking-[-.055em]', light ? 'text-cream' : 'text-night', textSize)}>Qawla</span>}
  </Link>;
}
