'use client';

import Script from 'next/script';
import { useEffect } from 'react';

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

  useEffect(() => {
    // Respect Do Not Track
    const dnt = navigator.doNotTrack || (window as unknown as { doNotTrack?: string }).doNotTrack;
    if (dnt === '1' || dnt === 'yes') return;
  }, []);

  if (!isProd) return null;

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
