export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://qawla.com").replace(/\/$/, "");

export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function cleanDescription(value: string, max = 160) {
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

export function articleKeywords(tags: string[] = [], category?: string) {
  return Array.from(new Set([...(category ? [category] : []), ...tags])).filter(Boolean);
}
