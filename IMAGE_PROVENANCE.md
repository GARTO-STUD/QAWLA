# Qawla image provenance

Qawla now uses a **source-first** image policy for News/Blog-style editorial content.

## Priority

1. RSS `enclosure` image.
2. RSS `media:content` image.
3. RSS `media:thumbnail` image.
4. `og:image` / `twitter:image` from the original source article, only when the source host matches the configured publisher host (SSRF guard).
5. Qawla topic-matched fallback only when the publisher does not provide an image.

A publisher-provided image is stored on the article with:

- `imageVerified: true`
- `imageSourceUrl`: original source article URL
- `imageSourceName`: publisher name

Fallback images are explicitly marked with `imageVerified: false` and shown in the UI as `Topic match` rather than `Source image`.

## Why this matters

The AI writer no longer gets to invent/select a generic cover image when the source already supplied the exact story image. The image is resolved **before** Scout/Fact-check/Writer/Editor run, and the same image provenance is carried into the final Article.

## Copyright

A source-associated image being technically retrievable does not automatically grant Qawla a republication license. For production, use images for which Qawla has permission/licensing or an applicable syndication/API agreement. Store attribution/licensing metadata when required by the provider.
