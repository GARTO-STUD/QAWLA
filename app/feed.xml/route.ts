import { ARTICLES, BLOG_POSTS } from '@/lib/mockData';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://qawla.com';

// RSS 2.0 feed with Media RSS extensions for images.
export async function GET() {
  const items = ARTICLES.slice(0, 20).map((a) => {
    const pubDate = new Date(a.publishedAt).toUTCString();
    return `    <item>
      <title>${escapeXml(a.title)}</title>
      <link>${SITE_URL}/news/${a.id}</link>
      <guid isPermaLink="true">${SITE_URL}/news/${a.id}</guid>
      <description>${escapeXml(a.excerpt)}</description>
      <category>${escapeXml(a.category)}</category>
      <author>${escapeXml(a.author.name)}</author>
      <pubDate>${pubDate}</pubDate>
      ${a.coverImage ? `<media:content url="${escapeXml(a.coverImage)}" medium="image" />` : ''}
      ${a.tags.map((t) => `<category>${escapeXml(t)}</category>`).join('\n      ')}
    </item>`;
  }).join('\n');

  const blogItems = BLOG_POSTS.slice(0, 5).map((b) => {
    const pubDate = new Date(b.publishedAt).toUTCString();
    return `    <item>
      <title>${escapeXml(b.title)}</title>
      <link>${SITE_URL}/blog/${b.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${b.slug}</guid>
      <description>${escapeXml(b.excerpt)}</description>
      <category>blog</category>
      <author>${escapeXml(b.author.name)}</author>
      <pubDate>${pubDate}</pubDate>
      ${b.coverImage ? `<media:content url="${escapeXml(b.coverImage)}" medium="image" />` : ''}
    </item>`;
  }).join('\n');

  const lastBuild = new Date().toUTCString();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Qawla — Football news, transfers, tactical analysis</title>
    <link>${SITE_URL}</link>
    <description>Premium football journalism powered by an editorial team. Verified, tactical, and always honest.</description>
    <language>en</language>
    <lastBuildDate>${lastBuild}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>${SITE_URL}/favicon.svg</url>
      <title>Qawla</title>
      <link>${SITE_URL}</link>
    </image>
${items}
${blogItems}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=600',
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
