'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

/**
 * Loads analytics scripts conditionally based on environment variables:
 *  - GA4 (Google Analytics)
 *  - Plausible
 *  - AdSense
 *
 * Respects Do-Not-Track and only runs in production.
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;
  const isProd = process.env.NODE_ENV === 'production';
  const [doNotTrack, setDoNotTrack] = useState<boolean | null>(null);

  useEffect(() => {
    // IMPORTANT: this previously did a bare `return` inside the effect when
    // DNT was set — that only exits the *effect callback*, it does nothing
    // to the JSX below, which rendered the GA4/Plausible/AdSense <Script>
    // tags completely unconditionally. The component's own comment claims
    // to "respect Do-Not-Track", but no tracking script was ever actually
    // skipped for users with that preference. This now gates the returned
    // JSX on real state instead.
    const dnt = navigator.doNotTrack || (window as unknown as { doNotTrack?: string }).doNotTrack;
    setDoNotTrack(dnt === '1' || dnt === 'yes');
  }, []);

  if (!isProd || doNotTrack !== false) return null;

  return (
    <>
      {gaId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {plausibleDomain && (
        <Script
          defer
          data-domain={plausibleDomain}
          src="https://plausible.io/js/script.js"
          strategy="afterInteractive"
        />
      )}

      {adsenseId && (
        <Script
          id="adsense-init"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}
    </>
  );
}
