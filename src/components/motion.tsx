'use client';

import {
  motion,
  useReducedMotion,
} from 'framer-motion';
import { Children, useRef, type ReactNode, type CSSProperties } from 'react';

/**
 * Qawla motion primitives — lightweight, scroll-triggered animations
 * built on framer-motion. All respect prefers-reduced-motion.
 *
 * Each animated element is SELF-CONTAINED with its own `whileInView`
 * trigger (no parent variant propagation), which is the most reliable
 * approach. The StaggerContainer injects an incremental transition
 * delay into each child via React.cloneElement to create the stagger.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

/** Fade + slide up into view on scroll. */
export function Reveal({
  children,
  delay = 0,
  y = 24,
  className,
  once = true,
  amount = 0.15,
}: RevealProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, amount }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  once?: boolean;
  amount?: number;
}

/**
 * Container that staggers its <StaggerItem> children.
 * Injects an incremental `style={{ --stagger-i }}` into each child
 * so StaggerItem can compute its own delay.
 */
export function StaggerContainer({
  children,
  className,
  stagger = 0.1,
}: StaggerProps) {
  const reduce = useReducedMotion();
  const arr = Children.toArray(children);
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <div className={className}>
      {arr.map((child, i) => (
        <StaggerItemWrapper key={i} index={i} stagger={stagger}>
          {child}
        </StaggerItemWrapper>
      ))}
    </div>
  );
}

/** Internal wrapper that applies the stagger delay to a StaggerItem child. */
function StaggerItemWrapper({
  index,
  stagger,
  children,
}: {
  index: number;
  stagger: number;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <>{children}</>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.55, delay: index * stagger, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerItemProps {
  children: ReactNode;
  className?: string;
  y?: number;
  scale?: number;
  style?: CSSProperties;
}

/**
 * StaggerItem — when used inside a StaggerContainer, the container
 * wraps each child automatically. When used standalone, it animates
 * on its own when scrolled into view.
 */
export function StaggerItem({
  children,
  className,
  y = 28,
  scale = 1,
  style,
}: StaggerItemProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className} style={style}>{children}</div>;
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y, scale: scale * 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.55, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

interface FadeInProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}

/** Simple fade-in (no movement). Good for hero overlays. */
export function FadeIn({ children, className, delay = 0, duration = 0.8 }: FadeInProps) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxImageProps {
  src: string;
  alt: string;
  className?: string;
  intensity?: number;
}

/**
 * Background image with a subtle scroll-driven parallax + slow zoom.
 * Use inside a `relative overflow-hidden` parent.
 */
export function ParallaxImage({ src, alt, className, intensity = 40 }: ParallaxImageProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={`absolute inset-0 ${className ?? ''}`}
      initial={reduce ? { opacity: 1 } : { scale: 1.15 }}
      animate={reduce ? {} : { scale: 1 }}
      transition={{ duration: 1.6, ease: EASE }}
    >
      <motion.img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
        style={{ willChange: 'transform' }}
        initial={reduce ? {} : { y: -intensity }}
        whileInView={reduce ? {} : { y: intensity }}
        viewport={{ once: true }}
        transition={reduce ? {} : { duration: 2.4, ease: 'linear' }}
      />
    </motion.div>
  );
}
