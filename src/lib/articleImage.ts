/**
 * Source-first article image resolver.
 *
 * Priority:
 * 1) Exact image URL supplied by the RSS item (enclosure/media:content/thumbnail).
 * 2) og:image / twitter:image from the original source article, but only when
 *    the article host belongs to the configured source host (SSRF guard).
 * 3) Topic-matched fallback library/search.
 *
 * We never replace a verified source image with a generic football image.
 */
import type { CredibilitySource, RawEvent } from '@/types';
import { fetchImageForArticleWithSearch } from '@/lib/imageMatcher';

function isHttpUrl(value?: string | null): value is string {
  if (!value || value.length > 2048) return false;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}

function hostMatches(url: string, allowedHosts: string[]): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return allowedHosts.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

function sourceHosts(source: CredibilitySource): string[] {
  const values = [source.url, source.feedUrl].filter(Boolean) as string[];
  return values.flatMap((v) => {
    try { return [new URL(v).hostname.toLowerCase()]; } catch { return []; }
  });
}

function extractMetaImage(html: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["'][^>]*>/i,
  ];
  for (const re of patterns) {
    const match = html.match(re);
    if (match?.[1] && isHttpUrl(match[1])) return match[1];
  }
  return null;
}

async function fetchSourcePageImage(event: RawEvent, source: CredibilitySource): Promise<string | null> {
  if (!isHttpUrl(event.url)) return null;
  const allowedHosts = sourceHosts(source);
  if (!hostMatches(event.url, allowedHosts)) return null;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(event.url, {
      headers: { 'User-Agent': 'QawlaBot/2.0 (+https://qawla.com)' },
      redirect: 'follow',
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timer);
    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html')) return null;
    const html = (await response.text()).slice(0, 1_500_000);
    const image = extractMetaImage(html);
    return image && hostMatches(image, allowedHosts) ? image : image && isHttpUrl(image) ? image : null;
  } catch {
    return null;
  }
}

export async function resolveEventImage(event: RawEvent, source?: CredibilitySource): Promise<RawEvent> {
  // The feed's own image is the strongest and safest signal: it is explicitly
  // attached to this story by the publisher.
  if (isHttpUrl(event.image)) {
    return {
      ...event,
      image: event.image,
      imageSourceUrl: event.url,
      imageSourceName: event.sourceName,
      imageVerified: true,
    };
  }

  if (source) {
    const sourcePageImage = await fetchSourcePageImage(event, source);
    if (sourcePageImage) {
      return {
        ...event,
        image: sourcePageImage,
        imageSourceUrl: event.url,
        imageSourceName: event.sourceName,
        imageVerified: true,
      };
    }
  }

  // Only now use the topic matcher. This is explicitly marked as unverified
  // so the UI/agents can distinguish it from a publisher-supplied image.
  const fallback = await fetchImageForArticleWithSearch({
    title: event.headline,
    category: event.category,
    tags: event.tags,
    entities: event.entities,
  });

  return {
    ...event,
    image: fallback,
    imageSourceUrl: undefined,
    imageSourceName: 'Qawla topic-matched fallback',
    imageVerified: false,
  };
}
