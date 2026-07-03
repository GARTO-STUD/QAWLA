'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Header } from './Header';
import { Footer } from './Footer';
import { ArticleCard } from './ArticleCard';
import { LegalModal } from './LegalModal';
import { PRIVACY_SECTIONS, TERMS_SECTIONS } from './legal';
import { ARTICLES, LIVE_MATCHES, LIVE_EVENTS, getFeaturedArticle } from '@/lib/mockData';
import { formatRelative, formatNumber, cn } from '@/lib/utils';

/* ─── Static content ──────────────────────────────────────────────────────── */

const FEATURES = [
  {
    title: 'Verified reporting',
    description:
      'Every story is researched, cross-checked, and edited by our newsroom before it reaches you. Accuracy above speed, always.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    title: 'Tactical depth',
    description:
      'Formation breakdowns, pressing schemes, xG analysis, and key battles — written for readers who think the game.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
      </svg>
    ),
  },
  {
    title: 'Transfer coverage',
    description:
      'Every rumour weighed against reporting standards. We separate the real from the noise — no clickbait, no recycled whispers.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3h5v5M21 3l-7 7M8 21H3v-5M3 21l7-7" />
      </svg>
    ),
  },
  {
    title: 'Live commentary',
    description:
      'Real-time match events as they happen. Goals, cards, substitutions, and tactical notes — delivered the moment they occur.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12h4l3-9 4 18 3-9h4" />
      </svg>
    ),
  },
  {
    title: 'Independent & reader-funded',
    description:
      'No paywall, no clickbait. We are funded by readers and a strict editorial standard — not by the clubs we cover.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    title: 'Multi-league coverage',
    description:
      'Premier League, La Liga, Serie A, Bundesliga, Ligue 1, Champions League, Europa League, and international football.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
];

const LEAGUES = [
  { name: 'Premier League', country: 'England', color: 'from-purple-600 to-purple-800', accent: '#7c3aed', starImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=500&fit=crop' },
  { name: 'La Liga', country: 'Spain', color: 'from-orange-500 to-red-600', accent: '#ea580c', starImage: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=400&h=500&fit=crop' },
  { name: 'Serie A', country: 'Italy', color: 'from-blue-600 to-blue-800', accent: '#1d4ed8', starImage: 'https://images.unsplash.com/photo-1610552050890-fe99536c2615?w=400&h=500&fit=crop' },
  { name: 'Bundesliga', country: 'Germany', color: 'from-red-500 to-red-700', accent: '#b91c1c', starImage: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=400&h=500&fit=crop' },
  { name: 'Ligue 1', country: 'France', color: 'from-amber-500 to-amber-700', accent: '#b45309', starImage: 'https://images.unsplash.com/photo-1551038247-3d9af20df552?w=400&h=500&fit=crop' },
  { name: 'Champions League', country: 'Europe', color: 'from-indigo-600 to-indigo-900', accent: '#4338ca', starImage: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=400&h=500&fit=crop' },
  { name: 'Europa League', country: 'Europe', color: 'from-orange-400 to-orange-600', accent: '#c2410c', starImage: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=400&h=500&fit=crop' },
  { name: 'International', country: 'Global', color: 'from-emerald-600 to-emerald-800', accent: '#047857', starImage: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=400&h=500&fit=crop' },
];

/* ─── Hero — light backdrop with dynamic featured article image ───────────── */

function Hero() {
  const featured = getFeaturedArticle()!;
  const liveCount = LIVE_MATCHES.filter((m) => m.status === 'live' || m.status === 'halftime').length;

  return (
    <section className="relative overflow-hidden bg-cream pt-14 pb-16 sm:pt-20 sm:pb-20 lg:pt-24 lg:pb-24">
      {/* Dynamic featured article image as soft backdrop */}
      {featured.coverImage && (
        <div className="absolute inset-0">
          <Image
            src={featured.coverImage}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-12"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-cream via-cream/90 to-cream/70" />
        </div>
      )}

      {/* Ambient glows (light) */}
      <div aria-hidden className="absolute -top-32 left-1/2 -translate-x-1/2 w-[64rem] h-[32rem] rounded-full blur-3xl pointer-events-none bg-pitch/8" />
      <div aria-hidden className="absolute -bottom-32 -right-32 w-[40rem] h-[40rem] rounded-full blur-3xl pointer-events-none bg-gold/8" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 lg:gap-14 items-center">
          {/* Left: copy */}
          <div className="max-w-3xl">
            <span className="badge badge-pitch mb-5 animate-fade-in-up">
              <span className="w-1.5 h-1.5 rounded-full bg-pitch animate-pulse-glow" />
              Premium football journalism
            </span>

            <h1 className="font-display font-extrabold tracking-tight text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.02] text-night animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
              The game,
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-pitch-dark via-pitch to-gold-dark">
                beautifully covered.
              </span>
            </h1>

            <p className="mt-6 sm:mt-7 text-base sm:text-lg lg:text-xl leading-relaxed text-night/65 max-w-2xl animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              Qawla delivers football journalism with depth and integrity —
              transfers, tactical analysis, live commentary, and long-form
              features across every major league.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
              <a href="#latest" className="btn-primary justify-center">
                Read the latest
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a href="#/donate" className="btn-gold justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
                Support Qawla
              </a>
            </div>

            {/* Live indicator strip */}
            {liveCount > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-night/55 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <span className="inline-flex items-center gap-1.5 font-semibold text-pitch-darker">
                  <span className="live-dot" />
                  {liveCount} live now
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gold-dark">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                  Reader-funded
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pitch-darker">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  No clickbait
                </span>
              </div>
            )}
          </div>

          {/* Right: featured article preview card */}
          <div className="hidden lg:block animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
            <Link
              href={`/news/${featured.slug}`}
              className="group block relative overflow-hidden rounded-2xl shadow-xl border border-black/[0.08] aspect-[4/5] bg-white"
            >
              {featured.coverImage && (
                <Image
                  src={featured.coverImage}
                  alt={featured.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 0vw, 40vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-night/90 via-night/40 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className="badge bg-pitch text-white shadow-md">Top story</span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-[10px] font-bold uppercase tracking-wider text-pitch mb-2">
                  {featured.category}
                </p>
                <h3 className="font-display font-extrabold text-xl text-cream leading-tight mb-2 line-clamp-3 group-hover:text-pitch transition-colors">
                  {featured.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-cream/70">
                  <span className="font-semibold text-cream/90">{featured.author.name}</span>
                  <span aria-hidden>·</span>
                  <span>{formatRelative(featured.publishedAt)}</span>
                  <span aria-hidden>·</span>
                  <span>{featured.readingTimeMinutes} min</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Live matches ticker (light) ────────────────────────────────────────── */

function LiveTicker() {
  const live = LIVE_MATCHES.filter((m) => m.status === 'live' || m.status === 'halftime');
  if (live.length === 0) return null;

  return (
    <section className="py-6 sm:py-8 bg-white border-y border-black/[0.06]" aria-label="Live matches">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="live-dot" />
          <span className="text-xs font-bold uppercase tracking-wider text-pitch-darker">Live now</span>
          <span className="text-xs text-night/40">·</span>
          <span className="text-xs text-night/55">{live.length} matches</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {live.map((m) => {
            const lastEvent = LIVE_EVENTS.find((e) => e.matchId === m.id);
            return (
              <a
                key={m.id}
                href="#latest"
                className="group rounded-xl border border-black/[0.06] bg-cream/50 p-4 hover:bg-cream hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-night/50 mb-3">
                  <span>{m.competition}</span>
                  <span className="inline-flex items-center gap-1.5 text-pitch-darker font-bold">
                    {m.status === 'halftime' ? 'HT' : `${m.minute}'`}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="font-display font-bold text-sm text-night truncate">{m.homeTeam.name}</p>
                    <p className="font-display font-bold text-sm text-night/65 truncate">{m.awayTeam.name}</p>
                  </div>
                  <div className="shrink-0 ml-3 text-right">
                    <p className="font-display font-extrabold text-xl text-night tabular-nums">{m.homeScore}</p>
                    <p className="font-display font-extrabold text-xl text-night/55 tabular-nums">{m.awayScore}</p>
                  </div>
                </div>
                {lastEvent && (
                  <p className="mt-3 pt-3 border-t border-black/[0.06] text-xs text-night/55 line-clamp-1">
                    <span className="text-pitch-darker font-semibold">{lastEvent.minute}'</span> {lastEvent.description}
                  </p>
                )}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Latest news ────────────────────────────────────────────────────────── */

function LatestNews() {
  const featured = getFeaturedArticle()!;
  const latest = ARTICLES.filter((a) => !a.featured).slice(0, 6);

  return (
    <section
      id="latest"
      className="py-12 sm:py-16 lg:py-20 bg-cream scroll-mt-20"
      aria-labelledby="latest-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 sm:mb-10">
          <div>
            <span className="badge badge-pitch mb-2.5">Top story</span>
            <h2 id="latest-heading" className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-night tracking-tight">
              Latest from the newsroom
            </h2>
            <p className="mt-2 text-sm sm:text-base text-night/55 max-w-xl">
              Football reporting with depth, accuracy, and the game's best writers.
            </p>
          </div>
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
      </div>
    </section>
  );
}

/* ─── Features (Why Qawla) — light ───────────────────────────────────────── */

function Features() {
  return (
    <section
      id="features"
      className="py-16 sm:py-20 lg:py-28 bg-white scroll-mt-20"
      aria-labelledby="features-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <span className="badge badge-pitch mb-4">Why Qawla</span>
          <h2 id="features-heading" className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-night tracking-tight">
            Built different. Built honest.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-night/60 max-w-2xl mx-auto">
            We are not a content farm. We are a newsroom — engineered for accuracy, depth, and independence.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {FEATURES.map((f, idx) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-black/[0.06] bg-cream/60 p-6 hover:bg-cream hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.06}s` }}
            >
              <div className="w-12 h-12 rounded-xl bg-pitch/10 text-pitch-darker flex items-center justify-center mb-4 group-hover:bg-pitch/20 group-hover:scale-110 transition-all">
                {f.icon}
              </div>
              <h3 className="font-display font-bold text-lg sm:text-xl text-night mb-2">{f.title}</h3>
              <p className="text-sm text-night/60 leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Leagues — light with premium cards ─────────────────────────────────── */

function Leagues() {
  return (
    <section
      id="leagues"
      className="relative py-16 sm:py-20 lg:py-28 bg-cream overflow-hidden scroll-mt-20"
      aria-labelledby="leagues-heading"
    >
      {/* Ambient backdrop (light) */}
      <div aria-hidden className="absolute -top-40 left-1/2 -translate-x-1/2 w-[60rem] h-[30rem] rounded-full blur-3xl pointer-events-none bg-pitch/6" />
      <div aria-hidden className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none bg-gold/5" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <span className="badge badge-pitch mb-4">Coverage</span>
          <h2 id="leagues-heading" className="font-serif font-black italic text-3xl sm:text-4xl lg:text-5xl text-night tracking-tight">
            Every major league.
            <span className="block bg-clip-text text-transparent bg-gradient-to-r from-pitch-dark via-pitch to-gold-dark">
              Every angle.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-night/60 max-w-xl mx-auto">
            From Premier League nights to Champions League finals — covered with the same editorial rigor.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {LEAGUES.map((league, idx) => (
            <a
              key={league.name}
              href="#latest"
              className="group relative overflow-hidden rounded-2xl aspect-[4/5] sm:aspect-[4/4.5] animate-fade-in-up"
              style={{ animationDelay: `${idx * 0.06}s` }}
            >
              {/* Gradient base */}
              <div className={cn('absolute inset-0 bg-gradient-to-br', league.color)} />

              {/* Transparent star image — football star/scene for this league */}
              <Image
                src={league.starImage}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-25 group-hover:opacity-35 group-hover:scale-105 transition-all duration-700"
              />

              {/* Gradient overlay to keep text readable over the star image */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />

              {/* Inner frame */}
              <div className="absolute inset-[6px] rounded-xl border border-white/25 pointer-events-none" />

              {/* Subtle pattern texture */}
              <div className="absolute inset-0 pitch-pattern-fine opacity-10" />

              {/* Shine sweep on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none league-shine"
                style={{
                  background: `linear-gradient(115deg, transparent 30%, ${league.accent}55 50%, transparent 70%)`,
                  backgroundSize: '200% 100%',
                }}
              />

              {/* Glow on hover */}
              <div
                className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500 pointer-events-none"
                style={{ background: `radial-gradient(circle at 50% 100%, ${league.accent}, transparent 70%)` }}
              />

              {/* Content */}
              <div className="relative h-full flex flex-col justify-end p-4 sm:p-5 lg:p-6">
                <span
                  className="absolute top-3 right-3 font-display font-extrabold text-xs text-white/40 tabular-nums"
                  aria-hidden
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>

                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-white/80 mb-1.5">
                  {league.country}
                </p>
                <p className="font-serif font-black italic text-lg sm:text-xl lg:text-2xl text-white leading-tight drop-shadow-lg group-hover:translate-x-0.5 transition-transform duration-300 tracking-tight">
                  {league.name}
                </p>

                {/* Bottom accent line */}
                <div className="mt-3 h-0.5 w-8 bg-white/50 rounded-full overflow-hidden">
                  <div
                    className="h-full w-0 group-hover:w-full transition-all duration-500 ease-out"
                    style={{ backgroundColor: '#ffffff' }}
                  />
                </div>
              </div>

              {/* Top-left corner accent */}
              <div
                className="absolute top-0 left-0 w-12 h-12 pointer-events-none opacity-60"
                style={{
                  background: `linear-gradient(135deg, ${league.accent}55 0%, transparent 60%)`,
                  borderTopLeftRadius: '1rem',
                }}
              />
            </a>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-night/40 uppercase tracking-wider">
          Plus Champions League, Europa League, Conference League & international football
        </p>
      </div>
    </section>
  );
}

/* ─── CTA / Support — light ──────────────────────────────────────────────── */

function SupportCTA() {
  return (
    <section
      id="support"
      className="py-14 sm:py-18 lg:py-22 bg-white scroll-mt-20"
      aria-labelledby="cta-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl pitch-gradient p-8 sm:p-12 lg:p-16 text-white">
          <div className="absolute inset-0 pitch-pattern opacity-30" />
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-float-slow" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-gold/15 blur-3xl" />
          <div className="relative max-w-2xl">
            <span className="badge bg-white/15 text-white backdrop-blur mb-4">Reader-funded</span>
            <h2 id="cta-heading" className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-tight tracking-tight">
              Independent journalism needs independent backers.
            </h2>
            <p className="mt-5 text-base sm:text-lg lg:text-xl text-white/90 max-w-xl leading-relaxed">
              Qawla is reader-funded. No paywall, no intrusive ads, no club sponsorship. If you value football reporting done right, support us today.
            </p>
            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <a href="#/donate" className="btn-gold justify-center">
                Support Qawla
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 font-bold rounded-xl bg-white/15 backdrop-blur border border-white/20 text-white hover:bg-white/25 transition-all text-sm sm:text-base min-h-[44px]"
              >
                How we work
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Legal quick access ─────────────────────────────────────────────────── */

function LegalCards({
  onOpen,
}: {
  onOpen: (kind: 'privacy' | 'terms') => void;
}) {
  return (
    <section className="py-12 sm:py-16 bg-cream" aria-labelledby="legal-heading">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <span className="badge badge-pitch mb-2.5">Legal</span>
          <h2 id="legal-heading" className="font-display font-extrabold text-2xl sm:text-3xl text-night tracking-tight">
            The fine print, in plain English.
          </h2>
          <p className="mt-2 text-sm sm:text-base text-night/55 max-w-xl mx-auto">
            Our Privacy Policy and Terms of Service — GDPR and CCPA compliant, no legalese where avoidable.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-3xl mx-auto">
          <button
            type="button"
            onClick={() => onOpen('privacy')}
            className="group text-left rounded-2xl border border-black/[0.06] bg-white p-6 hover:shadow-xl hover:border-pitch/30 transition-all card-lift"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-pitch/10 text-pitch-darker flex items-center justify-center group-hover:bg-pitch/20 group-hover:scale-110 transition-all">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-bold text-lg text-night mb-1">Privacy Policy</h3>
                <p className="text-sm text-night/60 leading-relaxed">
                  What we collect, how we use it, your GDPR and CCPA rights, cookies, and retention windows.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-pitch-darker group-hover:gap-2 transition-all">
                  Read policy
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onOpen('terms')}
            className="group text-left rounded-2xl border border-black/[0.06] bg-white p-6 hover:shadow-xl hover:border-gold/40 transition-all card-lift"
          >
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-gold/20 text-gold-dark flex items-center justify-center group-hover:bg-gold/30 group-hover:scale-110 transition-all">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display font-bold text-lg text-night mb-1">Terms of Service</h3>
                <p className="text-sm text-night/60 leading-relaxed">
                  Acceptance, eligibility, acceptable use, intellectual property, donations, and governing law.
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-gold-dark group-hover:gap-2 transition-all">
                  Read terms
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </div>
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */

export function Homepage() {
  const [legalOpen, setLegalOpen] = useState<null | 'privacy' | 'terms'>(null);

  return (
    <div id="top" className="min-h-screen flex flex-col bg-cream">
      <Header />

      <main className="flex-1">
        <Hero />
        <LiveTicker />
        <LatestNews />
        <Features />
        <Leagues />
        <SupportCTA />
        <LegalCards onOpen={setLegalOpen} />
      </main>

      <Footer />

      <LegalModal
        open={legalOpen === 'privacy'}
        onOpenChange={(o) => !o && setLegalOpen(null)}
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="How Qawla collects, uses, and protects your personal data. GDPR and CCPA compliant."
        sections={PRIVACY_SECTIONS}
      />
      <LegalModal
        open={legalOpen === 'terms'}
        onOpenChange={(o) => !o && setLegalOpen(null)}
        eyebrow="Legal"
        title="Terms of Service"
        subtitle="The terms and conditions governing your use of Qawla."
        sections={TERMS_SECTIONS}
      />
    </div>
  );
}

export default Homepage;
