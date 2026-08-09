'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import { ExternalLink, Megaphone, X } from 'lucide-react';

type Ad = { id: string; title: string; advertiser?: string; imageUrl?: string; targetUrl: string };

export function AdSlot() {
  const pathname = usePathname();
  const [ads, setAds] = useState<Ad[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    if (!pathname || pathname.startsWith('/admin')) return;
    fetch(`/api/ads?page=${encodeURIComponent(pathname)}`, { cache: 'no-store' })
      .then((r) => r.ok ? r.json() : { ads: [] })
      .then((d) => setAds(Array.isArray(d.ads) ? d.ads : []))
      .catch(() => setAds([]));
  }, [pathname]);

  const visible = ads.filter((a) => !dismissed.includes(a.id));
  if (!visible.length) return null;

  return (
    <section className="border-b border-night/10 bg-night text-cream" aria-label="Sponsored content">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3 space-y-2">
        {visible.map((ad) => (
          <a key={ad.id} href={ad.targetUrl} target="_blank" rel="sponsored noopener noreferrer" className="group relative flex items-center gap-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[.06] p-3 sm:p-4 hover:bg-white/[.1] transition-all">
            {ad.imageUrl ? <Image src={ad.imageUrl} alt="" width={120} height={64} className="h-16 w-24 sm:w-32 rounded-xl object-cover" unoptimized /> : <div className="h-16 w-24 sm:w-32 rounded-xl bg-pitch/15 flex items-center justify-center"><Megaphone className="text-pitch" /></div>}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-pitch font-bold"><span>Sponsored</span>{ad.advertiser && <span className="text-cream/45 normal-case tracking-normal">· {ad.advertiser}</span>}</div>
              <h2 className="font-display font-bold text-sm sm:text-base truncate group-hover:text-pitch transition-colors">{ad.title}</h2>
              <span className="inline-flex items-center gap-1 text-xs text-cream/45 mt-1">Learn more <ExternalLink size={12} /></span>
            </div>
            <button type="button" aria-label="Dismiss advertisement" onClick={(e) => { e.preventDefault(); e.stopPropagation(); setDismissed((v) => [...v, ad.id]); }} className="absolute right-2 top-2 rounded-full p-1.5 text-cream/45 hover:text-white hover:bg-white/10"><X size={14} /></button>
          </a>
        ))}
      </div>
    </section>
  );
}
