import { ARTICLES } from '@/lib/mockData';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://qawla.com';

// Google News sitemap — includes articles published in the last 48 hours.
// https://support.google.com/news/publisher-center/answer/9606709
export async function GET() {
  const now = Date.now();
  const twoDaysAgo = now - 48 * 3600_000;

  const recent = ARTICLES
    .filter((a) => new Date(a.publishedAt).getTime() > twoDaysAgo)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const urls = recent.map((a) => {
    const pubDate = new Date(a.publishedAt);
    const newsDate = pubDate.toISOString();
    const title = escapeXml(a.title);
    return `  <url>
    <loc>${SITE_URL}/news/${a.id}</loc>
    <lastmod>${new Date(a.updatedAt).toISOString()}</lastmod>
    <news:news>
      <news:publication>
        <news:name>Qawla</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${newsDate}</news:publication_date>
      <news:title>${title}</news:title>
      <news:keywords>${escapeXml(a.tags.join(', '))}</news:keywords>
    </news:news>
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900, s-maxage=900',
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
