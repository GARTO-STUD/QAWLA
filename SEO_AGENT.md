# Qawla SEO Intelligence Agent

## Pipeline
Source → Scout → Fact Check → Analyst → Writer → Editor → **SEO Intelligence** → Guardian → Publish

The SEO agent runs after editorial editing so it evaluates the content that will actually be published.

## Current capabilities
- SEO title and meta description optimization.
- Primary/secondary keyword and search-intent suggestions.
- Topic cluster suggestions.
- Internal-link opportunities.
- Technical/editorial readiness score.
- News-readiness score.
- Web context via the configured search provider when available.
- Works through Qawla's multi-model AI waterfall, including Free Only mode.
- Graceful deterministic fallback when no AI/search provider is available.
- Dashboard/API-ready report attached to the pipeline job.

## Future learning loop
The architecture is intentionally ready for Google Search Console:
1. Store SEO report at publish time.
2. Import query/page metrics from Search Console.
3. Compare impressions, CTR, clicks and position against the report.
4. Learn which title patterns, entities, internal links and topics perform best.
5. Generate recommendations for existing pages and future articles.
6. Keep human approval for high-impact bulk changes.

The agent must never claim guaranteed Google rankings and must not automate spam, keyword stuffing, fake freshness, doorway pages or fabricated search data.
