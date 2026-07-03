import { getArticleById } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://qawla.com';
const SITE_NAME = 'Qawla';

// Dynamic OG image generator — renders an SVG card on the fly.
// No external image library required; works on Cloudflare Workers.
export async function GET(_req: Request, { params }: PageProps) {
  const { id } = await params;
  const article = getArticleById(id);

  const title = article?.title ?? 'Qawla — Premium football journalism';
  const excerpt = article?.excerpt ?? 'Verified, tactical, always honest.';
  const category = article?.category ?? 'news';
  const date = article ? formatDate(article.publishedAt) : '';
  const confidence = article?.confidence?.score;

  const svg = buildSVG({ title, excerpt, category, date, confidence });

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
    },
  });
}

function escapeXml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if ((current + ' ' + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + ' ' + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines.slice(0, 3);
}

function buildSVG(opts: { title: string; excerpt: string; category: string; date: string; confidence?: number }): string {
  const { title, excerpt, category, date, confidence } = opts;
  const titleLines = wrapText(title, 42);
  const excerptLines = wrapText(excerpt, 60).slice(0, 2);

  const titleTspans = titleLines.map((line, i) =>
    `<tspan x="80" y="${300 + i * 64}">${escapeXml(line)}</tspan>`,
  ).join('');

  const excerptTspans = excerptLines.map((line, i) =>
    `<tspan x="80" y="${300 + titleLines.length * 64 + 40 + i * 36}">${escapeXml(line)}</tspan>`,
  ).join('');

  const confidenceBlock = confidence !== undefined ? `
    <g transform="translate(80, ${300 + titleLines.length * 64 + excerptLines.length * 36 + 60})">
      <rect width="200" height="40" rx="20" fill="#00d96a" opacity="0.15"/>
      <text x="20" y="26" font-family="Outfit, sans-serif" font-size="16" font-weight="700" fill="#00a854">✓ ${confidence}% confidence</text>
    </g>` : '';

  const dateBlock = date ? `
    <text x="80" y="${300 + titleLines.length * 64 + excerptLines.length * 36 + (confidence !== undefined ? 130 : 70)}" font-family="Outfit, sans-serif" font-size="18" fill="#4a5570">
      ${escapeXml(date)} · ${escapeXml(category)}
    </text>` : '';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop stop-color="#060d1f"/>
      <stop offset="0.5" stop-color="#0c1530"/>
      <stop offset="1" stop-color="#060d1f"/>
    </linearGradient>
    <linearGradient id="pitch" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
      <stop stop-color="#00a854"/>
      <stop offset="0.5" stop-color="#00d96a"/>
      <stop offset="1" stop-color="#007a3d"/>
    </linearGradient>
    <linearGradient id="gold" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
      <stop stop-color="#ffc857"/>
      <stop offset="1" stop-color="#ff9d00"/>
    </linearGradient>
    <pattern id="pattern" x="0" y="0" width="80" height="60" patternUnits="userSpaceOnUse">
      <line x1="80" y1="0" x2="80" y2="60" stroke="rgba(255,255,255,0.04)" stroke-width="2"/>
      <line x1="0" y1="60" x2="80" y2="60" stroke="rgba(255,255,255,0.03)" stroke-width="2"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#pattern)"/>

  <!-- Decorative orbs -->
  <circle cx="1050" cy="100" r="200" fill="#00d96a" opacity="0.08"/>
  <circle cx="100" cy="580" r="180" fill="#ffc857" opacity="0.06"/>

  <!-- Top bar -->
  <rect x="80" y="80" width="200" height="6" rx="3" fill="url(#pitch)"/>

  <!-- Logo + brand -->
  <g transform="translate(80, 120)">
    <circle cx="20" cy="20" r="18" fill="url(#pitch)"/>
    <path d="M6 20 L14 20 L17 12 L21 28 L24 20 L34 20" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <text x="50" y="28" font-family="'Bricolage Grotesque', sans-serif" font-size="28" font-weight="800" fill="#f8faff">${escapeXml(SITE_NAME)}</text>
  </g>

  <!-- Category badge -->
  <g transform="translate(80, 220)">
    <rect width="${category.length * 11 + 32}" height="36" rx="18" fill="rgba(0, 217, 106, 0.15)"/>
    <text x="16" y="24" font-family="Outfit, sans-serif" font-size="14" font-weight="700" fill="#00d96a" letter-spacing="1">${escapeXml(category.toUpperCase())}</text>
  </g>

  <!-- Title -->
  <text font-family="'Bricolage Grotesque', sans-serif" font-size="48" font-weight="800" fill="#f8faff" letter-spacing="-1">
    ${titleTspans}
  </text>

  <!-- Excerpt -->
  <text font-family="Outfit, sans-serif" font-size="22" fill="rgba(248, 250, 255, 0.7)">
    ${excerptTspans}
  </text>

  ${confidenceBlock}
  ${dateBlock}

  <!-- Bottom URL -->
  <text x="80" y="580" font-family="Outfit, sans-serif" font-size="18" fill="rgba(248, 250, 255, 0.5)">
    ${escapeXml(SITE_URL.replace(/^https?:\/\//, ''))}
  </text>

  <!-- Bottom right gold accent -->
  <rect x="1120" y="560" width="80" height="6" rx="3" fill="url(#gold)"/>
</svg>`;
}
