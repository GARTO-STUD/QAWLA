'use client';

import { useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { LegalSection } from './legal';

export interface LegalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  subtitle: string;
  eyebrow: string;
  sections: LegalSection[];
}

/**
 * LegalModal — full-screen modal for displaying Privacy Policy or Terms.
 *
 * Renders a sticky table-of-contents alongside scrollable section content
 * so users can jump between clauses. The dialog is full-height on desktop
 * and stacked on mobile.
 */
export function LegalModal({
  open,
  onOpenChange,
  title,
  subtitle,
  eyebrow,
  sections,
}: LegalModalProps) {
  // Lock body scroll when modal is open (handled by Radix Dialog,
  // but we also focus the close button for keyboard users).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="!max-w-5xl !w-[95vw] !h-[90vh] !p-0 !gap-0 overflow-hidden flex flex-col"
        aria-describedby={undefined}
      >
        {/* Accessible title + description (visually hidden, used by Radix) */}
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">{subtitle}</DialogDescription>

        {/* Hero header */}
        <div className="relative bg-cream border-b border-black/[0.08] px-6 sm:px-8 py-6 sm:py-8 shrink-0">
          <div
            aria-hidden
            className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-pitch/8 blur-3xl pointer-events-none"
          />
          <div className="relative">
            <span className="badge badge-pitch mb-3">{eyebrow}</span>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl text-night">
              {title}
            </h2>
            <p className="mt-1 text-sm sm:text-base text-night/55 max-w-2xl">{subtitle}</p>
          </div>
        </div>

        {/* Body: TOC + scrollable sections */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-[260px_1fr] overflow-hidden">
          {/* TOC (desktop) */}
          <aside className="hidden md:block border-r border-gray-200 bg-cream/40 p-5 overflow-y-auto scroll-area-qawla">
            <p className="text-xs font-bold uppercase tracking-wider text-night/50 mb-3">
              Contents
            </p>
            <ol className="space-y-1.5 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block px-2.5 py-1.5 rounded-md text-night/70 hover:text-pitch-dark hover:bg-pitch/5 transition-colors"
                    onClick={(e) => {
                      // Smooth scroll inside the scroll area
                      e.preventDefault();
                      const el = document.getElementById(s.id);
                      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </aside>

          {/* Sections */}
          <ScrollArea className="h-full" type="always">
            <div className="px-6 sm:px-8 py-6 sm:py-8 prose-qawla max-w-none">
              {sections.map((s) => (
                <section key={s.id} id={s.id} className="mb-8 scroll-mt-6">
                  <h2>{s.title}</h2>
                  <p style={{ whiteSpace: 'pre-line' }}>{s.body}</p>
                </section>
              ))}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default LegalModal;
