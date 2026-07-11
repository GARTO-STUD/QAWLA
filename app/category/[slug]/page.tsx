import type { Metadata } from 'next';
import Link from 'next/link';
import { ArticleCard } from '@/components/ArticleCard';
import { PageHero, EmptyState } from '@/components/premium';
import { ARTICLES, CATEGORIES } from '@/lib/mockData';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) return { title: 'Category not found' };
  return {
    title: `${cat.label} — Football ${cat.label.toLowerCase()}`,
    description: cat.description,
    alternates: { canonical: `/category/${slug}` },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const cat = CATEGORIES.find((c) => c.slug === slug);
  if (!cat) {
    return (
      <PageHero title="Category not found" variant="dark">
        <Link href="/news" className="btn-primary">Browse all news</Link>
      </PageHero>
    );
  }
  const articles = ARTICLES.filter((a) => a.category === slug && a.status === 'published');

  return (
    <>
      <PageHero
        eyebrow="Category"
        title={cat.label}
        description={cat.description}
        variant="dark"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto pb-3 mb-8 -mx-4 px-4 sm:mx-0 sm:px-0">
          <Link href="/news" className="badge bg-white border border-gray-200 text-night/70 hover:border-pitch hover:text-pitch-dk whitespace-nowrap flex-shrink-0 transition-colors">All</Link>
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className={`badge whitespace-nowrap flex-shrink-0 transition-colors ${c.slug === slug ? 'bg-pitch text-white' : 'bg-white border border-gray-200 text-night/70 hover:border-pitch hover:text-pitch-dk'}`}
            >
              {c.label}
            </Link>
          ))}
        </div>

        {articles.length === 0 ? (
          <EmptyState
            title={`No ${cat.label.toLowerCase()} articles yet`}
            description="Check back soon — our editorial pipeline is always running."
            action={{ label: 'Browse all news', href: '/news' }}
            icon={<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
