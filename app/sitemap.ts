import type { MetadataRoute } from 'next';
import { ARTICLES, BLOG_POSTS, CATEGORIES } from '@/lib/mockData';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://qawla.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'hourly', priority: 1.0 },
    { url: `${SITE_URL}/news`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/live`, lastModified: now, changeFrequency: 'always', priority: 0.9 },
    { url: `${SITE_URL}/transfers`, lastModified: now, changeFrequency: 'hourly', priority: 0.8 },
    { url: `${SITE_URL}/search`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${SITE_URL}/donate`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${SITE_URL}/category/${c.slug}`,
    lastModified: now,
    changeFrequency: 'hourly',
    priority: 0.7,
  }));

  const articleRoutes: MetadataRoute.Sitemap = ARTICLES.map((a) => ({
    url: `${SITE_URL}/news/${a.id}`,
    lastModified: a.updatedAt,
    changeFrequency: 'daily' as const,
    priority: a.featured ? 0.9 : 0.7,
  }));

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((b) => ({
    url: `${SITE_URL}/blog/${b.slug}`,
    lastModified: b.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Collect all unique tags
  const allTags = new Set<string>();
  ARTICLES.forEach((a) => a.tags.forEach((t) => allTags.add(t)));
  BLOG_POSTS.forEach((b) => b.tags.forEach((t) => allTags.add(t)));
  const tagRoutes: MetadataRoute.Sitemap = Array.from(allTags).map((t) => ({
    url: `${SITE_URL}/tag/${encodeURIComponent(t)}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.4,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes, ...blogRoutes, ...tagRoutes];
}
