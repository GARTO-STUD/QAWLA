import type { AgentResult, Article } from '@/types';
import { aiWaterfall, searchWeb } from '@/lib/aiWaterfall';

export interface SEOReport {
  score: number;
  seoTitle: string;
  metaDescription: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: string;
  slug: string;
  recommendations: Array<{ priority: 'critical'|'high'|'medium'|'low'; title: string; action: string }>;
  internalLinkIdeas: string[];
  topicCluster: string[];
  newsReadiness: number;
  facts: { hasImage: boolean; hasAuthor: boolean; hasDates: boolean; hasCanonicalCandidate: boolean };
}

function fallbackReport(article: Article): SEOReport {
  const title = article.title.trim();
  const keywords = Array.from(new Set([...(article.tags ?? []), ...(article.entities ?? [])])).slice(0, 8);
  return {
    score: Math.max(55, Math.min(88, 65 + (article.coverImage ? 8 : 0) + (article.author ? 5 : 0))),
    seoTitle: title.slice(0, 60),
    metaDescription: (article.excerpt || title).replace(/\s+/g, ' ').slice(0, 155),
    primaryKeyword: keywords[0] || title.split(/\s+/).slice(0, 4).join(' '),
    secondaryKeywords: keywords.slice(1),
    searchIntent: 'informational',
    slug: article.slug,
    recommendations: [
      ...(article.coverImage ? [] : [{ priority: 'high' as const, title: 'Add a relevant image', action: 'Use the verified source image when licensing permits.' }]),
      { priority: 'medium', title: 'Strengthen internal linking', action: 'Link to relevant Qawla stories, entities and topic pages.' },
    ],
    internalLinkIdeas: article.entities?.slice(0, 5) ?? [],
    topicCluster: article.tags?.slice(0, 6) ?? [],
    newsReadiness: article.contentType === 'news' ? 80 : 65,
    facts: { hasImage: Boolean(article.coverImage), hasAuthor: Boolean(article.author), hasDates: Boolean(article.publishedAt), hasCanonicalCandidate: Boolean(article.slug) },
  };
}

export async function runSEOAgent(article: Article): Promise<AgentResult> {
  const started = Date.now();
  try {
    const query = `${article.title} ${article.tags?.slice(0, 3).join(' ') ?? ''}`.trim();
    const search = await searchWeb(query, { maxResults: 5, searchDepth: 'basic' });
    const context = search.results.slice(0, 5).map(r => `SOURCE: ${r.title}\nURL: ${r.url}\n${r.content.slice(0, 1200)}`).join('\n\n');

    const prompt = `Qawla SEO Intelligence Agent. Analyze this article for sustainable organic search visibility. Never promise Google rankings and never recommend spam, keyword stuffing, fake freshness, doorway pages, or fabricated claims. Return ONLY valid JSON.
ARTICLE:
Title: ${article.title}
Excerpt: ${article.excerpt}
Category: ${article.category}
Tags: ${(article.tags ?? []).join(', ')}
Entities: ${(article.entities ?? []).join(', ')}
Slug: ${article.slug}
Content: ${article.content.slice(0, 9000)}
SEARCH CONTEXT (may be empty):
${context}

JSON schema:
{"score":0,"seoTitle":"","metaDescription":"","primaryKeyword":"","secondaryKeywords":[],"searchIntent":"","slug":"","recommendations":[{"priority":"critical|high|medium|low","title":"","action":""}],"internalLinkIdeas":[],"topicCluster":[],"newsReadiness":0}
Score technical/editorial readiness, not a ranking guarantee. Keep title natural and <= 65 chars, description <= 160 chars.`;

    const result = await aiWaterfall([
      { role: 'system', content: 'You are Qawla SEO Intelligence, an expert in technical SEO, news SEO and editorial search optimization.' },
      { role: 'user', content: prompt },
    ], { task: 'seo', profileMode: 'best-quality', maxTokens: 2200, jsonMode: true });

    let parsed: Partial<SEOReport>;
    try { parsed = JSON.parse(result.content); } catch { parsed = {}; }
    const fallback = fallbackReport(article);
    const report: SEOReport = {
      ...fallback,
      ...parsed,
      score: Math.max(0, Math.min(100, Number(parsed.score ?? fallback.score))),
      newsReadiness: Math.max(0, Math.min(100, Number(parsed.newsReadiness ?? fallback.newsReadiness))),
      seoTitle: String(parsed.seoTitle || fallback.seoTitle).slice(0, 65),
      metaDescription: String(parsed.metaDescription || fallback.metaDescription).slice(0, 160),
      primaryKeyword: String(parsed.primaryKeyword || fallback.primaryKeyword),
      secondaryKeywords: Array.isArray(parsed.secondaryKeywords) ? parsed.secondaryKeywords.slice(0, 12) : fallback.secondaryKeywords,
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 12) : fallback.recommendations,
      internalLinkIdeas: Array.isArray(parsed.internalLinkIdeas) ? parsed.internalLinkIdeas.slice(0, 12) : fallback.internalLinkIdeas,
      topicCluster: Array.isArray(parsed.topicCluster) ? parsed.topicCluster.slice(0, 12) : fallback.topicCluster,
      facts: fallback.facts,
    };
    return {
      agent: 'seo', status: 'completed', startedAt: new Date(started).toISOString(),
      completedAt: new Date().toISOString(), durationMs: Date.now() - started,
      model: result.model, provider: result.provider, tokensIn: result.tokensIn, tokensOut: result.tokensOut,
      output: report,
    };
  } catch (err) {
    const fallback = fallbackReport(article);
    return {
      agent: 'seo', status: 'failed', startedAt: new Date(started).toISOString(),
      completedAt: new Date().toISOString(), durationMs: Date.now() - started,
      error: err instanceof Error ? err.message : String(err), output: fallback,
    };
  }
}
