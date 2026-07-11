'use client';

import { useEffect } from 'react';
import type { WebVitalsMetric } from '@/types';

/**
 * Monitors Core Web Vitals (LCP, CLS, INP, FCP, TTFB) via PerformanceObserver
 * and reports to the configured analytics endpoint. No-op in development.
 */
export function WebVitals() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') return;
    if (typeof window === 'undefined') return;

    const send = (metric: WebVitalsMetric) => {
      // Use sendBeacon to avoid blocking on unload
      const blob = new Blob([JSON.stringify(metric)], { type: 'application/json' });
      try {
        navigator.sendBeacon('/api/vitals', blob);
      } catch {
        // ignore
      }
    };

    const rating = (name: WebVitalsMetric['name'], value: number): WebVitalsMetric['rating'] => {
      const thresholds: Record<string, [number, number]> = {
        LCP: [2500, 4000],
        FID: [100, 300],
        INP: [200, 500],
        CLS: [0.1, 0.25],
        FCP: [1800, 3000],
        TTFB: [800, 1800],
      };
      const [good, poor] = thresholds[name] ?? [0, Infinity];
      if (value <= good) return 'good';
      if (value <= poor) return 'needs-improvement';
      return 'poor';
    };

    // LCP
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const last = entries[entries.length - 1];
      if (last) {
        send({
          name: 'LCP',
          value: last.startTime,
          rating: rating('LCP', last.startTime),
          delta: last.startTime,
          id: 'lcp',
          pathname: location.pathname,
          timestamp: Date.now(),
        });
      }
    });
    try { lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true }); } catch { /* ignore */ }

    // CLS
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const layoutShift = entry as PerformanceEntry & { hadRecentInput?: boolean; value?: number };
        if (!layoutShift.hadRecentInput) {
          clsValue += layoutShift.value ?? 0;
        }
      }
      send({
        name: 'CLS',
        value: clsValue,
        rating: rating('CLS', clsValue),
        delta: clsValue,
        id: 'cls',
        pathname: location.pathname,
        timestamp: Date.now(),
      });
    });
    try { clsObserver.observe({ type: 'layout-shift', buffered: true }); } catch { /* ignore */ }

    // INP
    const inpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      let max = 0;
      for (const entry of entries) {
        const duration = (entry as PerformanceEntry & { duration?: number }).duration ?? 0;
        if (duration > max) max = duration;
      }
      if (max > 0) {
        send({
          name: 'INP',
          value: max,
          rating: rating('INP', max),
          delta: max,
          id: 'inp',
          pathname: location.pathname,
          timestamp: Date.now(),
        });
      }
    });
    try { inpObserver.observe({ type: 'event', buffered: true }); } catch { /* ignore */ }

    // FCP & TTFB from navigation entries
    const navObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const nav = entry as PerformanceEntry & {
          responseStart?: number;
          requestStart?: number;
          startTime?: number;
        };
        const ttfb = nav.responseStart ?? 0;
        if (ttfb > 0) {
          send({
            name: 'TTFB',
            value: ttfb,
            rating: rating('TTFB', ttfb),
            delta: ttfb,
            id: 'ttfb',
            pathname: location.pathname,
            timestamp: Date.now(),
          });
        }
      }
    });
    try { navObserver.observe({ type: 'navigation', buffered: true }); } catch { /* ignore */ }

    const fcpObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // The 'paint' entry type includes BOTH 'first-paint' and
        // 'first-contentful-paint' — without this filter, every
        // 'first-paint' entry was also reported as an "FCP" metric with
        // that entry's (earlier, different) timestamp, corrupting the
        // actual FCP data being collected.
        if (entry.name !== 'first-contentful-paint') continue;
        const fcp = entry.startTime;
        send({
          name: 'FCP',
          value: fcp,
          rating: rating('FCP', fcp),
          delta: fcp,
          id: 'fcp',
          pathname: location.pathname,
          timestamp: Date.now(),
        });
      }
    });
    try { fcpObserver.observe({ type: 'paint', buffered: true }); } catch { /* ignore */ }

    return () => {
      lcpObserver.disconnect();
      clsObserver.disconnect();
      inpObserver.disconnect();
      navObserver.disconnect();
      fcpObserver.disconnect();
    };
  }, []);

  return null;
}
