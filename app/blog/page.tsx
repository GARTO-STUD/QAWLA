import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { PageHero } from '@/components/premium';
import { BLOG_POSTS } from '@/lib/mockData';
import { formatDate } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Blog — Long-form football features & analysis',
  description: 'In-depth football features, tactical essays, and investigative reporting from the Qawla editorial desk.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  const featured = BLOG_POSTS.find((p) => p.featured) ?? BLOG_POSTS[0]!;
  const rest = BLOG_POSTS.filter((p) => p.id !== featured.id);

  return (
    <>
      <PageHero
        eyebrow="The Qawla Blog"
        title="Long-form football,"
        highlight="deeply considered."
        description="Essays, investigations, and tactical deep dives from the Qawla editorial desk. Slow journalism for readers who want more than the scoreline."
        variant="dark"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        {/* Featured post */}
        <Link
          href={`/blog/${featured.slug}`}
          className="group grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 card card-hover overflow-hidden mb-10 sm:mb-14"
        >
          <div className="relative aspect-[16/9] lg:aspect-auto lg:h-full min-h-[280px] bg-gray-100 overflow-hidden">
            <Image
              src={featured.coverImage}
              alt={featured.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="p-6 sm:p-8 lg:py-10 lg:pr-10 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-3">
              <span className="badge bg-pitch text-white">Featured</span>
              <span className="text-xs font-bold uppercase tracking-wider text-pitch-dk">
                {featured.tags[0]}
              </span>
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-night leading-tight group-hover:text-pitch-dk transition-colors">
              {featured.title}
            </h2>
            <p className="mt-3 text-base sm:text-lg text-night/70 leading-relaxed">{featured.excerpt}</p>
            <div className="mt-5 flex items-center gap-3 text-sm text-night/60">
              <span className="font-semibold text-night/80">{featured.author.name}</span>
              <span>·</span>
              <span>{formatDate(featured.publishedAt)}</span>
              <span>·</span>
              <span>{featured.readingTimeMinutes} min read</span>
            </div>
          </div>
        </Link>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {rest.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group flex flex-col card card-hover overflow-hidden"
            >
              <div className="relative aspect-[16/9] bg-gray-100 overflow-hidden">
                <Image
                  src={post.coverImage}
                  alt={post.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 sm:p-6 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="badge bg-pitch/10 text-pitch-dk">{post.tags[0]}</span>
                  <span className="text-xs text-night/50">{post.readingTimeMinutes} min read</span>
                </div>
                <h3 className="font-display font-extrabold text-xl sm:text-2xl text-night leading-tight group-hover:text-pitch-dk transition-colors">
                  {post.title}
                </h3>
                <p className="mt-2 text-sm text-night/70 leading-relaxed flex-1">{post.excerpt}</p>
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-night/50">
                  <span className="font-medium text-night/70">{post.author.name}</span>
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
