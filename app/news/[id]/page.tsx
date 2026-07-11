import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ConfidenceBadge } from '@/components/ConfidenceBadge';
import { RelatedArticles } from '@/components/RelatedArticles';
import { ShareButtons } from '@/components/ShareButtons';
import { AdBanner } from '@/components/AdBanner';
import { getArticleById, getRelatedArticles } from '@/lib/mockData';
import { formatDate, formatNumber, stripMarkdown } from '@/lib/utils';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const article = getArticleById(id);
  if (!article || article.status !== 'published') return { title: 'Article not found' };
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/news/${article.id}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt,
      url: `/news/${article.id}`,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: [article.author.name],
      images: article.coverImage ? [{ url: article.coverImage, width: 1200, height: 630, alt: article.title }] : undefined,
      tags: article.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.coverImage ? [article.coverImage] : undefined,
    },
  };
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { id } = await params;
  const article = getArticleById(id);
  if (!article || article.status !== 'published') notFound();

  const related = getRelatedArticles(article);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: article.coverImage ? [article.coverImage] : undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: {
      '@type': article.author.role === 'human' ? 'Person' : 'Organization',
      name: article.author.name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Qawla',
      logo: { '@type': 'ImageObject', url: '/favicon.svg' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `/news/${article.id}` },
    articleSection: article.category,
    keywords: article.tags.join(', '),
    wordCount: stripMarkdown(article.content).split(/\s+/).length,
  };

  return (
    <article className="pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero */}
      <header className="night-gradient pitch-pattern text-cream">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
          <nav aria-label="Breadcrumb" className="mb-4 text-xs sm:text-sm text-cream/60">
            <Link href="/" className="hover:text-pitch">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/news" className="hover:text-pitch">News</Link>
            <span className="mx-2">/</span>
            <span className="text-cream">{article.category}</span>
          </nav>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="badge bg-pitch text-white">{article.category}</span>
            {article.trending && <span className="badge bg-gold text-night">Trending</span>}
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-[1.05] text-cream">
            {article.title}
          </h1>
          {article.subtitle && (
            <p className="mt-4 text-lg sm:text-xl text-cream/80 leading-relaxed">{article.subtitle}</p>
          )}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-cream/70">
            <span className="font-semibold text-cream">{article.author.name}</span>
            <span>·</span>
            <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
            <span>·</span>
            <span>{article.readingTimeMinutes} min read</span>
            <span>·</span>
            <span>{formatNumber(article.viewCount)} views</span>
          </div>
          {article.confidence && (
            <div className="mt-6">
              <ConfidenceBadge
                score={article.confidence.score}
                label={article.confidence.label}
                className="bg-white/10 backdrop-blur border-white/20 text-cream"
              />
            </div>
          )}
        </div>
      </header>

      {/* Cover image */}
      {article.coverImage && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12">
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-2xl bg-gray-100">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Body */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-8 sm:mt-12">
        <div className="prose-qawla">
          {renderMarkdown(article.content)}
        </div>

        {/* Share */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <ShareButtons url={`/news/${article.id}`} title={article.title} />
        </div>

        {/* Confidence breakdown */}
        {article.confidence && (
          <section className="mt-8 p-5 sm:p-6 rounded-2xl bg-cream border border-gray-200" aria-labelledby="confidence-heading">
            <h2 id="confidence-heading" className="font-display font-bold text-lg text-night mb-4 flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pitch-dk">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              Confidence breakdown
            </h2>
            <div className="space-y-3">
              {[
                { label: 'Source tier', value: article.confidence.breakdown.sourceTier, weight: 40 },
                { label: 'Cross-reference', value: article.confidence.breakdown.crossReference, weight: 30 },
                { label: 'Entity match', value: article.confidence.breakdown.entityMatch, weight: 20 },
                { label: 'Historical accuracy', value: article.confidence.breakdown.historical, weight: 10 },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-night/70">{row.label} <span className="text-night/40">({row.weight}%)</span></span>
                    <span className="font-bold text-night">{Math.round(row.value * 100)}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                    <div
                      className="h-full pitch-gradient rounded-full"
                      style={{ width: `${row.value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-night/70 italic">{article.confidence.rationale}</p>
          </section>
        )}

        {/* Ad */}
        <div className="mt-8">
          <AdBanner slot="article-bottom" format="horizontal" />
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-12">
          <RelatedArticles articles={related} />
        </div>
      )}
    </article>
  );
}

/** Minimal Markdown renderer (headings, paragraphs, lists, blockquotes, bold). */
function renderMarkdown(md: string): React.ReactNode {
  const lines = md.split('\n');
  const out: React.ReactNode[] = [];
  let list: React.ReactNode[] = [];
  let quote: React.ReactNode[] = [];
  let para: string[] = [];

  const flushPara = () => {
    if (para.length > 0) {
      out.push(<p key={`p-${out.length}`}>{inline(para.join(' '))}</p>);
      para = [];
    }
  };
  const flushList = () => {
    if (list.length > 0) {
      out.push(<ul key={`ul-${out.length}`}>{list}</ul>);
      list = [];
    }
  };
  const flushQuote = () => {
    if (quote.length > 0) {
      out.push(<blockquote key={`bq-${out.length}`}>{quote}</blockquote>);
      quote = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('## ')) {
      flushPara(); flushList(); flushQuote();
      out.push(<h2 key={`h-${out.length}`}>{inline(trimmed.slice(3))}</h2>);
    } else if (trimmed.startsWith('### ')) {
      flushPara(); flushList(); flushQuote();
      out.push(<h3 key={`h-${out.length}`}>{inline(trimmed.slice(4))}</h3>);
    } else if (trimmed.startsWith('> ')) {
      flushPara(); flushList();
      quote.push(<p key={`qp-${quote.length}`}>{inline(trimmed.slice(2))}</p>);
    } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      flushPara(); flushQuote();
      list.push(<li key={`li-${list.length}`}>{inline(trimmed.slice(2))}</li>);
    } else if (trimmed === '') {
      flushPara(); flushList(); flushQuote();
    } else {
      flushList(); flushQuote();
      para.push(trimmed);
    }
  }
  flushPara(); flushList(); flushQuote();
  return out;
}

function inline(text: string): React.ReactNode {
  // Bold **text**
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    return <span key={i}>{p}</span>;
  });
}
