import Link from 'next/link';
import type { Metadata } from 'next';
import { ArticleCard } from '@/components/ArticleCard';
import { PageHero, StatCard } from '@/components/premium';
import { ARTICLES, LIVE_MATCHES, SITE_STATS, CATEGORIES, getFeaturedArticle } from '@/lib/mockData';
import { formatNumber } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Qawla — Premium football news, transfers & tactical analysis',
  description: 'Verified football journalism. Transfers, tactical breakdowns, live commentary, and long-form features — across every major league.',
  alternates: { canonical: '/' },
};

const FEATURES = [
  {
    title: 'Verified reporting',
    description: 'Every story passes through a five-stage editorial pipeline: scout, fact-checker, analyst, writer, editor. Confidence scores are public.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Tactical depth',
    description: 'Formation breakdowns, pressing schemes, xG analysis, and key battles — written for readers who think the game.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
      </svg>
    ),
  },
  {
    title: 'Transfer tracker',
    description: 'Every rumour scored by source reliability, cross-reference, and historical accuracy. No more guessing what is real.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7" />
      </svg>
    ),
  },
  {
    title: 'Live commentary',
    description: 'Real-time match events delivered via SSE. Goals, cards, substitutions, and tactical notes — as they happen.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h4l3-9 4 18 3-9h4" />
      </svg>
    ),
  },
  {
    title: 'Independent & reader-funded',
    description: 'No paywall, no clickbait. We are funded by readers and a strict editorial standard — not by the clubs we cover.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    title: 'Multi-league coverage',
    description: 'Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, Europa League, and international football.',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

const LEAGUES = [
  { name: 'Premier League', country: 'England', color: 'from-purple-500 to-purple-700' },
  { name: 'La Liga', country: 'Spain', color: 'from-orange-500 to-red-600' },
  { name: 'Serie A', country: 'Italy', color: 'from-blue-500 to-blue-700' },
  { name: 'Bundesliga', country: 'Germany', color: 'from-red-500 to-red-700' },
  { name: 'Ligue 1', country: 'France', color: 'from-amber-500 to-amber-700' },
  { name: 'Champions League', country: 'Europe', color: 'from-indigo-500 to-indigo-800' },
  { name: 'Europa League', country: 'Europe', color: 'from-orange-400 to-orange-600' },
  { name: 'International', country: 'Global', color: 'from-emerald-500 to-emerald-700' },
];

export default function HomePage() {
  const featured = getFeaturedArticle()!;
  const latest = ARTICLES.filter((a) => !a.featured && a.status === 'published').slice(0, 6);
  const liveCount = LIVE_MATCHES.filter((m) => m.status === 'live' || m.status === 'halftime').length;

  return (
    <>
      {/* Hero */}
      <PageHero
        eyebrow="Premium football journalism"
        title="The game, verified."
        highlight="Beautifully."
        description="Qawla delivers verified football journalism — every story scouted, fact-checked, analysed, written, and edited through a five-stage editorial pipeline before it reaches you."
        variant="dark"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/news" className="btn-primary justify-center">
            Read the latest
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
          <Link href="/donate" className="btn-gold justify-center">
            Support Qawla
          </Link>
        </div>
      </PageHero>

      {/* Stats */}
      <section className="py-10 sm:py-14 lg:py-16 bg-cream" aria-label="Site statistics">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <StatCard label="Published articles" value={SITE_STATS.publishedArticles} variant="pitch"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>} />
            <StatCard label="Live matches now" value={liveCount} variant="gold"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>} />
            <StatCard label="Active sources" value={SITE_STATS.activeSources} variant="night"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>} />
            <StatCard label="Avg confidence" value={SITE_STATS.avgConfidence} suffix="%" variant="default"
              icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>} />
          </div>
        </div>
      </section>

      {/* Featured + latest */}
      <section className="py-10 sm:py-14 lg:py-16 bg-cream" aria-labelledby="latest-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-6 sm:mb-8">
            <div>
              <span className="badge bg-pitch/10 text-pitch-dk mb-2">Top story</span>
              <h2 id="latest-heading" className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-night">
                Latest from the newsroom
              </h2>
            </div>
            <Link href="/news" className="hidden sm:inline-flex text-sm font-semibold text-pitch-dk hover:text-pitch-darker transition-colors">
              All news →
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <ArticleCard article={featured} variant="featured" priority />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {latest.slice(0, 2).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {latest.slice(2, 6).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/news" className="btn-primary justify-center">
              All news
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 lg:py-24 night-gradient pitch-pattern text-cream" aria-labelledby="features-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <span className="badge bg-white/10 text-pitch backdrop-blur mb-3">Why Qawla</span>
            <h2 id="features-heading" className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-cream">
              Built different. Built honest.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-cream/70 max-w-2xl mx-auto">
              We are not a content farm. We are a newsroom — engineered for accuracy, transparency, and depth.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="glass rounded-2xl p-5 sm:p-6 hover:bg-white/10 transition-all">
                <div className="w-12 h-12 rounded-xl bg-pitch/20 text-pitch flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-display font-bold text-lg sm:text-xl text-cream mb-2">{f.title}</h3>
                <p className="text-sm text-cream/70 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leagues */}
      <section className="py-12 sm:py-16 lg:py-20 bg-cream" aria-labelledby="leagues-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10">
            <span className="badge bg-pitch/10 text-pitch-dk mb-2">Coverage</span>
            <h2 id="leagues-heading" className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl text-night">
              Every major league. Every angle.
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {LEAGUES.map((league) => (
              <Link
                key={league.name}
                href={`/category/${league.name.toLowerCase().replace(/\s+/g, '-')}`}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${league.color} p-5 sm:p-6 aspect-[4/3] flex flex-col justify-end hover:scale-[1.02] transition-transform`}
              >
                <div className="absolute inset-0 pitch-pattern opacity-20" />
                <div className="relative">
                  <p className="font-display font-extrabold text-base sm:text-lg text-white leading-tight">{league.name}</p>
                  <p className="text-xs sm:text-sm text-white/70 mt-0.5">{league.country}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 lg:py-20 bg-cream" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl pitch-gradient p-8 sm:p-12 lg:p-16 text-white">
            <div className="absolute inset-0 pitch-pattern opacity-30" />
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 blur-3xl" />
            <div className="relative max-w-2xl">
              <h2 id="cta-heading" className="font-display font-extrabold text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-tight">
                Independent journalism needs independent backers.
              </h2>
              <p className="mt-4 text-base sm:text-lg text-white/85 max-w-xl">
                Qawla is reader-funded. No paywall, no intrusive ads, no club sponsorship. If you value verified football reporting, become a supporter today.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link href="/donate" className="btn-gold justify-center">
                  Become a supporter
                </Link>
                <Link href="/about" className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 font-bold rounded-xl bg-white/15 backdrop-blur border border-white/20 text-white hover:bg-white/25 transition-all text-sm sm:text-base min-h-[44px]">
                  How we work
                </Link>
              </div>
              <p className="mt-5 text-sm text-white/70">
                <span className="font-bold text-white">{formatNumber(SITE_STATS.totalDonors)}</span> readers already support Qawla.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
