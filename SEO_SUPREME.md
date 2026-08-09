# Qawla SEO Supreme Plan

This release establishes a technical SEO foundation designed for news/blog/transfer content.

## Core
- Unique metadata per route/article.
- Canonical URLs.
- Open Graph + Twitter cards.
- `robots.txt` with admin/private routes excluded.
- Dynamic XML sitemap for indexable content.
- Breadcrumb structured data.
- Article/NewsArticle structured data on article pages.
- Organization and WebSite structured data.
- Clean, stable slugs.
- `lang`/locale-aware metadata.
- Noindex for dashboard, auth, search utility and private pages where appropriate.

## Editorial SEO
Every article should generate:
- Primary keyword.
- Secondary entities.
- Search-intent classification.
- SEO title (not clickbait).
- Meta description.
- H1.
- Short intro that answers the topic quickly.
- Relevant internal links.
- Related articles.
- Image alt text based on the real image/topic.
- Author/publisher/date metadata.
- Last updated timestamp when materially changed.

## News SEO
For breaking/news stories:
- Use `NewsArticle` when appropriate.
- Preserve original publication date.
- Preserve source attribution.
- Do not fabricate `dateModified`.
- Use the actual article image as `image` when licensed/allowed.
- Avoid indexing thin duplicate versions.

## Performance
- Next/Image with explicit dimensions.
- Lazy-load below-the-fold media.
- Preload only the true LCP image.
- Avoid layout shift.
- Keep client components narrow.
- Minimize third-party scripts.
- Track Core Web Vitals.

## Internal linking
Articles should expose:
- Related stories.
- Topic/category links.
- Team/player/competition links when entities exist.
- Breadcrumbs.

## Important
SEO cannot honestly be called “guaranteed” or “dominant”. Search ranking depends on content quality, authority, crawl/indexation, competition, links, freshness and search-engine systems. This release focuses on strong technical and editorial foundations.
