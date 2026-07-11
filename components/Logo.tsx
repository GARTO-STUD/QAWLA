import { useId } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Qawla Logo — A stadium floodlight beam emerging from a football,
 * enclosed in a hexagonal shield. Unique, premium, brand-defining.
 */
export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
  const dim = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;
  // Gradient <defs> ids used to be hardcoded literals ("qawla-pitch-grad" etc).
  // SVG/HTML ids are scoped to the whole document, not to each individual
  // <svg>, and this component renders more than once on every single page
  // simultaneously: Header.tsx alone renders it twice (desktop nav + the
  // mobile hamburger menu, which is only hidden via CSS, not unmounted from
  // the DOM), plus once more in Footer.tsx — three duplicate id sets on
  // every page load. That's invalid HTML, and `url(#id)` gradient references
  // are only guaranteed to resolve to the first matching id in the document,
  // which is fragile. useId() gives each mounted instance its own ids.
  const uid = useId();
  const pitchGradId = `qawla-pitch-grad-${uid}`;
  const goldGradId = `qawla-gold-grad-${uid}`;
  const beamGradId = `qawla-beam-${uid}`;
  return (
    <a
      href="/"
      className={cn('inline-flex items-center gap-2.5 group', className)}
      aria-label="Qawla home"
    >
      <span className="relative inline-flex" style={{ width: dim, height: dim }}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full transition-transform group-hover:scale-105"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={pitchGradId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00a854" />
              <stop offset="0.5" stopColor="#00d96a" />
              <stop offset="1" stopColor="#007a3d" />
            </linearGradient>
            <linearGradient id={goldGradId} x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffc857" />
              <stop offset="1" stopColor="#ff9d00" />
            </linearGradient>
            <linearGradient id={beamGradId} x1="24" y1="48" x2="24" y2="4" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00d96a" stopOpacity="0" />
              <stop offset="0.4" stopColor="#00d96a" stopOpacity="0.3" />
              <stop offset="1" stopColor="#ffc857" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Hexagonal shield outline */}
          <path
            d="M24 2 L42 12 L42 36 L24 46 L6 36 L6 12 Z"
            stroke={`url(#${goldGradId})`}
            strokeWidth="2"
            fill="#060d1f"
            opacity="0.95"
          />

          {/* Floodlight beams emanating from bottom center */}
          <path d="M24 40 L8 4 M24 40 L16 2 M24 40 L24 0 M24 40 L32 2 M24 40 L40 4" stroke={`url(#${beamGradId})`} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

          {/* Football at the base */}
          <circle cx="24" cy="34" r="8" fill={`url(#${pitchGradId})`} />
          {/* Pentagon pattern on ball */}
          <polygon points="24,30 27,32 26,35 22,35 21,32" fill="#060d1f" opacity="0.8" />
          {/* Seam lines */}
          <path d="M20 33 Q24 35 28 33" stroke="#060d1f" strokeWidth="0.6" fill="none" opacity="0.5" />
          <path d="M21 37 Q24 39 27 37" stroke="#060d1f" strokeWidth="0.6" fill="none" opacity="0.5" />

          {/* Pulse line cutting across */}
          <path
            d="M8 24 L16 24 L19 18 L22 30 L24 24 L40 24"
            stroke={`url(#${pitchGradId})`}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.9"
          />
        </svg>
      </span>
      {showText && (
        <span className="font-display font-extrabold text-xl sm:text-2xl tracking-tight">
          <span className="text-night">Qawla</span>
        </span>
      )}
    </a>
  );
}
