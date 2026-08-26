import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { ArticleCard } from '@/components/ArticleCard';
import { Reveal, StaggerContainer, StaggerItem, FadeIn } from '@/components/motion';
import { ARTICLES, LIVE_MATCHES, SITE_STATS, getFeaturedArticle } from '@/lib/mockData';
import { formatNumber } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Qawla — Premium football news, transfers & tactical analysis',
  description: 'Verified football journalism. Transfers, tactical breakdowns, live commentary, and long-form features — across every major league.',
  alternates: { canonical: '/' },
};

const FEATURES = [
  {
    title: 'Verified reporting',
    description: 'Every story passes through a five-stage editorial pipeline: scout, fact-checker, analyst, writer, editor. Every claim is sourced.',
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
  { name: 'Premier League', country: 'England', image: '/images/league-premier.jpg' },
  { name: 'La Liga', country: 'Spain', image: '/images/league-laliga.jpg' },
  { name: 'Serie A', country: 'Italy', image: '/images/league-seriea.jpg' },
  { name: 'Bundesliga', country: 'Germany', image: '/images/league-bundesliga.jpg' },
  { name: 'Ligue 1', country: 'France', image: '/images/league-ligue1.jpg' },
  { name: 'Champions League', country: 'Europe', image: '/images/league-champions.jpg' },
  { name: 'Europa League', country: 'Europe', image: '/images/league-europa.jpg' },
  { name: 'International', country: 'Global', image: '/images/league-international.jpg' },
];

export default function HomePage() {
  const featured = getFeaturedArticle()!;
  const latest = ARTICLES.filter((a) => !a.featured && a.status === 'published').slice(0, 6);
  const heroMatch = LIVE_MATCHES.find((m) => m.status === 'live' || m.status === 'halftime');

  return (
    <>
      {/* ─────────── Broadcast hero ─────────── */}
      <section className="relative overflow-hidden bg-night text-cream hero-cinematic">
        <div className="absolute inset-0 hero-grid opacity-60 pointer-events-none" aria-hidden />
        <div className="absolute -top-24 left-[48%] w-72 h-72 rounded-full bg-pitch/12 blur-3xl ambient-orb pointer-events-none" aria-hidden />
        <div className="absolute bottom-0 right-[-8rem] w-96 h-96 rounded-full bg-indigo-500/10 blur-3xl ambient-orb-delay pointer-events-none" aria-hidden />
        <div className="absolute -top-40 right-0 w-[34rem] h-[34rem] rounded-full bg-pitch/10 blur-[100px] pointer-events-none" aria-hidden />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-14 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-24">
          {/* Score strip */}
          <FadeIn>
            {heroMatch ? <Link href="/live" className="inline-flex items-center gap-3 qawla-glass-dark rounded-full px-4 py-2.5 hover:bg-white/10 transition-colors">
              <span className="badge bg-red-500/15 text-red-400"><span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />Live {heroMatch.minute}&apos;</span>
              <span className="text-sm font-black">{heroMatch.homeTeam.shortName}</span>
              <span className="text-sm font-black text-pitch">{heroMatch.homeScore} – {heroMatch.awayScore}</span>
              <span className="text-sm font-black">{heroMatch.awayTeam.shortName}</span>
            </Link> : <Link href="/live" className="inline-flex items-center gap-3 qawla-glass-dark rounded-full px-4 py-2.5 hover:bg-white/10 transition-colors"><span className="badge bg-pitch/15 text-pitch">Match centre</span><span className="text-sm font-black text-cream/80">Fixtures, scores &amp; analysis</span></Link>}
          </FadeIn>

          <FadeIn delay={0.06}>
            <h1 className="heading-serif text-cream text-[15vw] leading-[0.86] sm:text-6xl lg:text-7xl xl:text-8xl mt-6 max-w-4xl">
              Full-time.
              <br />
              Every <span className="gradient-text-pitch">angle.</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.12}>
            <p className="mt-6 text-base sm:text-lg lg:text-xl leading-relaxed text-cream/60 max-w-xl font-light normal-case">
              Qawla runs football coverage like a broadcast desk — every story scouted, fact-checked, analysed and edited before the whistle stops echoing.
            </p>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link href="/news" className="btn-primary justify-center">
                Read the latest
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <Link href="/live" className="btn-night border border-white/15 justify-center">
                Watch live feed
              </Link>
            </div>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="mt-7 flex flex-wrap items-center gap-2" aria-label="Leagues covered">
              {['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Champions League'].map((lg) => (
                <span key={lg} className="px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide bg-white/5 text-cream/60 ring-1 ring-white/10">
                  {lg}
                </span>
              ))}
            </div>
          </FadeIn>
        </div>

        {/* Diagonal stat bar */}
        <FadeIn delay={0.36}>
          <div className="relative border-t border-white/10 bg-black/20 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center gap-x-10 gap-y-4 py-5">
                <div>
                  <p className="heading-serif text-2xl sm:text-3xl text-pitch">5</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cream/45 mt-0.5">Editorial stages</p>
                </div>
                <div className="w-px h-8 bg-white/10 hidden sm:block" />
                <div>
                  <p className="heading-serif text-2xl sm:text-3xl text-pitch">8</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cream/45 mt-0.5">Leagues tracked</p>
                </div>
                <div className="w-px h-8 bg-white/10 hidden sm:block" />
                <div>
                  <p className="heading-serif text-2xl sm:text-3xl text-pitch">{ARTICLES.length}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cream/45 mt-0.5">Stories live</p>
                </div>
                <div className="w-px h-8 bg-white/10 hidden sm:block" />
                <div>
                  <p className="heading-serif text-2xl sm:text-3xl text-pitch">0</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-cream/45 mt-0.5">Paywalls</p>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Matchday spotlight — creative replacement for stat cards */}
      <MatchdaySpotlight />

      {/* Featured + latest */}
      <section className="py-12 sm:py-16 lg:py-20 bg-cream" aria-labelledby="latest-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="flex items-end justify-between mb-8 sm:mb-10">
            <div>
              <span className="badge bg-pitch/20 text-pitch-dk mb-2">Top story</span>
              <h2 id="latest-heading" className="heading-serif text-3xl sm:text-4xl lg:text-5xl text-night">
                Latest from the newsroom
              </h2>
            </div>
            <Link href="/news" className="hidden sm:inline-flex text-sm font-black uppercase tracking-wide text-pitch-dk hover:text-pitch-darker transition-colors">
              All news →
            </Link>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <Reveal>
              <ArticleCard article={featured} variant="featured" priority />
            </Reveal>
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6" stagger={0.12}>
              {latest.slice(0, 2).map((article) => (
                <StaggerItem key={article.id}>
                  <ArticleCard article={article} />
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" stagger={0.1}>
            {latest.slice(2, 6).map((article) => (
              <StaggerItem key={article.id}>
                <ArticleCard article={article} />
              </StaggerItem>
            ))}
          </StaggerContainer>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/news" className="btn-primary justify-center">
              All news
            </Link>
          </div>
        </div>
      </section>

      {/* Features — light, elegant white cards */}
      <section className="py-12 sm:py-16 lg:py-24 bg-white" aria-labelledby="features-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
            <span className="badge bg-pitch/10 text-pitch-dk mb-3">Why Qawla</span>
            <h2 id="features-heading" className="heading-serif text-3xl sm:text-4xl lg:text-5xl text-night">
              Built different. Built honest.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-night/60 max-w-2xl mx-auto font-light">
              We are not a content farm. We are a newsroom — engineered for accuracy, transparency, and depth.
            </p>
          </Reveal>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" stagger={0.1}>
            {FEATURES.map((f) => (
              <StaggerItem key={f.title}>
                <div className="group h-full rounded-sm bg-cream border border-black/5 p-6 sm:p-8 hover:shadow-xl hover:shadow-night/5 hover:-translate-y-1 hover:border-pitch/20 transition-all duration-300">
                  <h3 className="heading-serif text-xl sm:text-2xl text-night mb-3">{f.title}</h3>
                  <p className="text-sm text-night/60 leading-relaxed">{f.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Leagues — bigger, more elegant cards */}
      <section className="py-12 sm:py-16 lg:py-24 bg-cream" aria-labelledby="leagues-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-10 sm:mb-14">
            <span className="badge bg-pitch/10 text-pitch-dk mb-3">Coverage</span>
            <h2 id="leagues-heading" className="heading-serif text-3xl sm:text-4xl lg:text-5xl text-night">
              Every major league. Every angle.
            </h2>
            <p className="mt-4 text-base sm:text-lg text-night/60 max-w-2xl mx-auto font-light">
              From the Premier League to the Champions League — dedicated coverage of every competition that matters.
            </p>
          </Reveal>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8" stagger={0.08}>
            {LEAGUES.map((league) => (
              <StaggerItem key={league.name}>
                <Link
                  href={`/category/${league.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="group relative overflow-hidden rounded-3xl aspect-[4/3] flex flex-col justify-end shadow-lg shadow-night/5 ring-1 ring-black/5 hover:shadow-2xl hover:shadow-night/20 hover:-translate-y-1.5 transition-all duration-300"
                >
                  <Image
                    src={league.image}
                    alt={league.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-night/92 via-night/35 to-transparent" />
                  <div className="league-shine absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" aria-hidden />
                  <div className="relative p-6 sm:p-7">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/15 text-white backdrop-blur-sm mb-3">
                      {league.country}
                    </span>
                    <p className="heading-serif font-bold text-2xl sm:text-3xl text-white leading-tight">{league.name}</p>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white/90 group-hover:gap-2.5 transition-all">
                      Explore coverage
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </span>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA — light, elegant */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white" aria-labelledby="cta-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl pitch-gradient-soft border border-pitch/15 p-8 sm:p-12 lg:p-16">
            <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-pitch/15 blur-3xl animate-float-slow" aria-hidden />
            <div className="absolute -bottom-24 -left-16 w-72 h-72 rounded-full bg-gold/15 blur-3xl animate-float" aria-hidden />
            <Reveal className="relative max-w-2xl">
              <h2 id="cta-heading" className="heading-serif text-3xl sm:text-4xl lg:text-5xl text-night leading-tight">
                Independent journalism needs independent backers.
              </h2>
              <p className="mt-5 text-base sm:text-lg text-night/70 max-w-xl font-light">
                Qawla is reader-funded. No paywall, no intrusive ads, no club sponsorship. If you value verified football reporting, become a supporter today.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link href="/donate" className="btn-primary justify-center">
                  Become a supporter
                </Link>
                <Link href="/about" className="btn-secondary justify-center">
                  How we work
                </Link>
              </div>
              <p className="mt-6 text-sm text-night/60">
                <span className="font-bold text-night">{formatNumber(SITE_STATS.totalDonors)}</span> readers already support Qawla.
              </p>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}

/* ───────────────────────────────────────────────────────────────────────────
 * Matchday spotlight — a creative editorial band that replaces the old
 * 4-stat-card row. Shows a live match scorecard, today's trending tags,
 * and a quick leagues rail. All content-driven (no vanity metrics).
 * ──────────────────────────────────────────────────────────────────────── */
function MatchdaySpotlight() {
  const liveMatch = LIVE_MATCHES.find((m) => m.status === 'live') ?? LIVE_MATCHES[0];
  const upcoming = LIVE_MATCHES.filter((m) => m.status === 'scheduled').slice(0, 2);
  const trendingTags = ['Transfers', 'Champions League', 'Tactical', 'Premier League', 'Transfers Deadline'];
  const leagues = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga'];

  return (
    <section className="bg-white border-y border-black/5" aria-label="Matchday spotlight">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <Reveal className="flex items-center gap-3 mb-5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <h2 className="text-sm font-bold uppercase tracking-[0.14em] text-night/60">Matchday spotlight</h2>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 sm:gap-6">
          {/* Left: live match scorecard */}
          {liveMatch && (
            <Reveal>
              <Link
                href="/live"
                className="group relative overflow-hidden rounded-sm block"
              >
                <div className="relative p-6 sm:p-8 pitch-gradient-soft border border-pitch/15 rounded-sm hover:shadow-xl hover:shadow-pitch/10 transition-all">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-night/50">{liveMatch.competition} · {liveMatch.matchday}</span>
                    {liveMatch.status === 'live' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-500 text-white">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="absolute inline-flex h-full w-full rounded-full bg-white opacity-75 animate-ping" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-white" />
                        </span>
                        LIVE {liveMatch.minute}'
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="text-center flex-1">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-sm bg-white shadow-sm flex items-center justify-center font-display font-extrabold text-night text-lg sm:text-xl mb-2">
                        {liveMatch.homeTeam.shortName.slice(0, 3)}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-night/80 leading-tight">{liveMatch.homeTeam.name}</p>
                    </div>
                    <div className="text-center px-2">
                      <p className="font-display font-extrabold text-3xl sm:text-4xl text-night leading-none">
                        {liveMatch.homeScore} <span className="text-night/30 mx-1">–</span> {liveMatch.awayScore}
                      </p>
                      <p className="mt-1 text-[10px] uppercase tracking-wider text-night/40">{liveMatch.venue}</p>
                    </div>
                    <div className="text-center flex-1">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-sm bg-white shadow-sm flex items-center justify-center font-display font-extrabold text-night text-lg sm:text-xl mb-2">
                        {liveMatch.awayTeam.shortName.slice(0, 3)}
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-night/80 leading-tight">{liveMatch.awayTeam.name}</p>
                    </div>
                  </div>
                  <p className="mt-5 text-center text-xs font-semibold text-pitch-dk group-hover:gap-2 inline-flex items-center gap-1.5 transition-all">
                    Follow live commentary
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </p>
                </div>
              </Link>
            </Reveal>
          )}

          {/* Right: trending + quick leagues */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Trending tags */}
            <Reveal>
              <div className="rounded-sm bg-cream border border-black/5 p-5 sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-night/50 mb-3">Trending now</p>
                <div className="flex flex-wrap gap-2">
                  {trendingTags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-white border border-black/8 text-night/70 hover:border-pitch/40 hover:text-pitch-dk hover:bg-pitch/5 transition-all"
                    >
                      #{tag}
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
            {/* Quick leagues rail */}
            <Reveal>
              <div className="rounded-sm bg-cream border border-black/5 p-5 sm:p-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-night/50 mb-3">Jump to a league</p>
                <div className="grid grid-cols-2 gap-2">
                  {leagues.map((lg) => (
                    <Link
                      key={lg}
                      href={`/category/${lg.toLowerCase().replace(/\s+/g, '-')}`}
                      className="flex items-center justify-between px-3 py-2.5 rounded-sm bg-white border border-black/5 text-sm font-semibold text-night/75 hover:border-pitch/30 hover:text-pitch-dk transition-all"
                    >
                      {lg}
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-night/30"><path d="m9 18 6-6-6-6"/></svg>
                    </Link>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
