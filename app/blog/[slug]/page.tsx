import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { ShareButtons } from '@/components/ShareButtons';
import { getBlogPostBySlug, BLOG_POSTS } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) return { title: 'Post not found' };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      images: [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getBlogPostBySlug(slug);
  if (!post) notFound();

  const related = BLOG_POSTS.filter((p) => p.id !== post.id).slice(0, 2);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: { '@type': 'Person', name: post.author.name },
    publisher: {
      '@type': 'Organization',
      name: 'Qawla',
      logo: { '@type': 'ImageObject', url: '/favicon.svg' },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `/blog/${post.slug}` },
    keywords: post.tags.join(', '),
    wordCount: post.content.split(/\s+/).length,
  };

  return (
    <article className="pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero image */}
      <header className="relative">
        <div className="relative aspect-[16/9] sm:aspect-[21/9] max-h-[480px] bg-night overflow-hidden">
          <Image
            src={post.coverImage}
            alt={post.title}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-night via-night/60 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
            <nav aria-label="Breadcrumb" className="mb-3 text-xs sm:text-sm text-cream/60">
              <Link href="/" className="hover:text-pitch">Home</Link>
              <span className="mx-2">/</span>
              <Link href="/blog" className="hover:text-pitch">Blog</Link>
            </nav>
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-cream leading-[1.05] max-w-3xl">
              {post.title}
            </h1>
            <p className="mt-3 text-base sm:text-lg text-cream/80 max-w-2xl">{post.subtitle}</p>
            <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-cream/70">
              <span className="font-semibold text-cream">{post.author.name}</span>
              <span>·</span>
              <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              <span>·</span>
              <span>{post.readingTimeMinutes} min read</span>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14">
        <div className="prose-qawla">
          {renderMarkdown(post.content)}
        </div>

        {/* Share */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <ShareButtons url={`/blog/${post.slug}`} title={post.title} />
        </div>
      </div>

      {/* More from the blog */}
      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-14 sm:mt-20" aria-labelledby="more-heading">
          <h2 id="more-heading" className="font-display font-extrabold text-2xl sm:text-3xl text-night mb-6">
            More from the blog
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {related.map((p) => (
              <Link
                key={p.id}
                href={`/blog/${p.slug}`}
                className="group flex flex-col card card-hover overflow-hidden"
              >
                <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                  <Image
                    src={p.coverImage}
                    alt={p.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-5">
                  <span className="text-xs font-bold uppercase tracking-wider text-pitch-dk">{p.tags[0]}</span>
                  <h3 className="font-display font-bold text-lg sm:text-xl text-night mt-1 group-hover:text-pitch-dk transition-colors line-clamp-2">
                    {p.title}
                  </h3>
                  <p className="mt-2 text-sm text-night/60">{p.readingTimeMinutes} min read · {formatDate(p.publishedAt)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

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
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2) {
      return <em key={i}>{p.slice(1, -1)}</em>;
    }
    if (p.startsWith('`') && p.endsWith('`')) {
      return <code key={i} className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">{p.slice(1, -1)}</code>;
    }
    return <span key={i}>{p}</span>;
  });
}
