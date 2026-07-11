// Qawla — Mock/seed data for development & static rendering
// In production these would be fetched from Firestore; here we provide
// realistic English sample content so the UI is fully populated.

import type { Article, LiveMatch, DonateTier, CredibilitySource, Transfer, SiteStats, PipelineJob, Donor, AdminUser } from '@/types';
import { DEFAULT_SOURCES } from '@/lib/ingestion';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  excerpt: string;
  content: string;
  coverImage: string;
  author: { name: string; role: string; avatarUrl?: string };
  tags: string[];
  readingTimeMinutes: number;
  publishedAt: string;
  updatedAt: string;
  featured?: boolean;
}

const now = Date.now();
const hoursAgo = (h: number) => new Date(now - h * 3600_000).toISOString();
const daysAgo = (d: number) => new Date(now - d * 86_400_000).toISOString();

// Topic-relevant images for each article — matched by content
const IMG_CITY_ARSENAL = 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=675&fit=crop';
const IMG_TRANSFER = 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&h=675&fit=crop';
const IMG_TACTICS = 'https://images.unsplash.com/photo-1551038247-3d9af20df552?w=1200&h=675&fit=crop';
const IMG_CONTRACT = 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&h=675&fit=crop';
const IMG_CHAMPIONS = 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=1200&h=675&fit=crop';
const IMG_BAYERN = 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&h=675&fit=crop';
const IMG_NAPOLI = 'https://images.unsplash.com/photo-1610552050890-fe99536c2615?w=1200&h=675&fit=crop';
const IMG_STADIUM = 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200&h=675&fit=crop';

function makeArticle(partial: Partial<Article> & { id: string; title: string }): Article {
  return {
    id: partial.id,
    title: partial.title,
    slug: partial.id,
    subtitle: partial.subtitle ?? 'Editorial analysis',
    excerpt: partial.excerpt ?? partial.title,
    content: partial.content ?? `## ${partial.title}\n\nFull article body...`,
    coverImage: partial.coverImage ?? IMG_CITY_ARSENAL,
    category: partial.category ?? 'reviews',
    tags: partial.tags ?? ['football'],
    contentType: 'news',
    status: 'published',
    author: partial.author ?? { id: 'qawla_writer', name: 'Qawla Newsroom', handle: 'qawla', role: 'writer' },
    entities: partial.entities ?? [],
    featured: partial.featured ?? false,
    trending: partial.trending ?? false,
    readingTimeMinutes: partial.readingTimeMinutes ?? 4,
    viewCount: partial.viewCount ?? Math.floor(Math.random() * 5000) + 500,
    shareCount: partial.shareCount ?? Math.floor(Math.random() * 200),
    publishedAt: partial.publishedAt ?? hoursAgo(1),
    updatedAt: partial.updatedAt ?? hoursAgo(1),
    createdAt: partial.createdAt ?? hoursAgo(1),
    confidence: partial.confidence ?? {
      score: Math.floor(Math.random() * 30) + 70,
      label: 'verified',
      breakdown: { sourceTier: 0.9, crossReference: 0.85, entityMatch: 0.8, historical: 0.92 },
      rationale: 'Corroborated by multiple tier-1 sources',
      decision: 'publish',
      evaluatedAt: hoursAgo(1),
    },
  };
}

export const ARTICLES: Article[] = [
  makeArticle({
    id: 'art-001',
    title: 'Manchester City edge Arsenal in five-goal thriller as Haaland strikes late',
    subtitle: 'Pep Guardiola\'s side reclaim top spot after dramatic Etihad finish',
    excerpt: 'Erling Haaland\'s 89th-minute winner handed City a 3-2 victory over Arsenal in a Premier League clash that lived up to its billing.',
    category: 'reviews',
    tags: ['premier-league', 'manchester-city', 'arsenal', 'haaland', 'title-race'],
    coverImage: IMG_CITY_ARSENAL,
    featured: true,
    trending: true,
    readingTimeMinutes: 6,
    viewCount: 12480,
    shareCount: 312,
    publishedAt: hoursAgo(2),
    entities: [
      { id: 'e1', name: 'Manchester City', type: 'club' },
      { id: 'e2', name: 'Arsenal', type: 'club' },
      { id: 'e3', name: 'Erling Haaland', type: 'player' },
      { id: 'e4', name: 'Pep Guardiola', type: 'manager' },
      { id: 'e5', name: 'Premier League', type: 'competition' },
    ],
    confidence: {
      score: 92, label: 'verified', decision: 'publish', evaluatedAt: hoursAgo(2),
      rationale: 'Confirmed by official Premier League data plus 4 tier-1 sources',
      breakdown: { sourceTier: 0.95, crossReference: 1.0, entityMatch: 0.9, historical: 0.95 },
    },
  }),
  makeArticle({
    id: 'art-002',
    title: 'Real Madrid agree €180m deal for Bundesliga star — medical scheduled Friday',
    subtitle: 'Florentino Perez lands his primary summer target ahead of Club World Cup',
    excerpt: 'Real Madrid have reached an agreement in principle worth €180m plus add-ons for the German international, with a medical booked for Friday.',
    category: 'transfers',
    tags: ['real-madrid', 'bundesliga', 'transfers', 'summer-window'],
    coverImage: IMG_TRANSFER,
    featured: false,
    trending: true,
    readingTimeMinutes: 5,
    viewCount: 8920,
    publishedAt: hoursAgo(4),
    entities: [
      { id: 'e6', name: 'Real Madrid', type: 'club' },
      { id: 'e7', name: 'Bayern Munich', type: 'club' },
      { id: 'e8', name: 'Florentino Perez', type: 'manager' },
    ],
    confidence: {
      score: 78, label: 'likely', decision: 'publish', evaluatedAt: hoursAgo(4),
      rationale: 'Two tier-1 sources plus Fabrizio Romano confirmation',
      breakdown: { sourceTier: 0.85, crossReference: 0.6, entityMatch: 0.75, historical: 0.88 },
    },
  }),
  makeArticle({
    id: 'art-003',
    title: 'Tactical breakdown: how Inter\'s 3-5-2 neutralised Barcelona\'s left flank',
    subtitle: 'Simone Inzaghi\'s defensive structure returns to the San Siro blueprint',
    excerpt: 'A deep dive into the pressing triggers and wing-back rotations that earned Inter a Champions League semifinal advantage.',
    category: 'tactical',
    tags: ['champions-league', 'inter-milan', 'barcelona', 'tactics', 'analysis'],
    coverImage: IMG_TACTICS,
    trending: false,
    readingTimeMinutes: 9,
    viewCount: 4310,
    publishedAt: hoursAgo(7),
    entities: [
      { id: 'e9', name: 'Inter Milan', type: 'club' },
      { id: 'e10', name: 'Barcelona', type: 'club' },
      { id: 'e11', name: 'Simone Inzaghi', type: 'manager' },
      { id: 'e12', name: 'Champions League', type: 'competition' },
    ],
    confidence: {
      score: 88, label: 'verified', decision: 'publish', evaluatedAt: hoursAgo(7),
      rationale: 'Tactical analysis verified against match footage',
      breakdown: { sourceTier: 0.9, crossReference: 0.85, entityMatch: 0.95, historical: 0.85 },
    },
  }),
  makeArticle({
    id: 'art-004',
    title: 'Liverpool and Slot agree contract extension through 2029',
    subtitle: 'Dutch coach rewarded for first-season Premier League title charge',
    excerpt: 'Arne Slot has committed his long-term future to Liverpool after guiding the club to the top of the table in his debut campaign.',
    category: 'news',
    tags: ['liverpool', 'arne-slot', 'contract', 'premier-league'],
    coverImage: IMG_CONTRACT,
    readingTimeMinutes: 3,
    viewCount: 6210,
    publishedAt: hoursAgo(12),
    entities: [
      { id: 'e13', name: 'Liverpool', type: 'club' },
      { id: 'e14', name: 'Arne Slot', type: 'manager' },
    ],
    confidence: {
      score: 95, label: 'verified', decision: 'publish', evaluatedAt: hoursAgo(12),
      rationale: 'Official club announcement',
      breakdown: { sourceTier: 1.0, crossReference: 1.0, entityMatch: 1.0, historical: 0.95 },
    },
  }),
  makeArticle({
    id: 'art-005',
    title: 'Champions League semifinal preview: PSG vs Dortmund — the key battles',
    subtitle: 'Luis Enrique\'s attacking trident meets Edin Terzic\'s compact block',
    excerpt: 'A position-by-position look at where Tuesday\'s semifinal first leg will be won and lost at the Parc des Princes.',
    category: 'previews',
    tags: ['champions-league', 'psg', 'dortmund', 'preview'],
    coverImage: IMG_CHAMPIONS,
    readingTimeMinutes: 7,
    viewCount: 3890,
    publishedAt: hoursAgo(18),
    entities: [
      { id: 'e15', name: 'Paris Saint-Germain', type: 'club' },
      { id: 'e16', name: 'Borussia Dortmund', type: 'club' },
      { id: 'e17', name: 'Luis Enrique', type: 'manager' },
    ],
    confidence: {
      score: 84, label: 'likely', decision: 'publish', evaluatedAt: hoursAgo(18),
      rationale: 'Preview based on confirmed lineups and recent form',
      breakdown: { sourceTier: 0.9, crossReference: 0.85, entityMatch: 0.8, historical: 0.82 },
    },
  }),
  makeArticle({
    id: 'art-006',
    title: 'Bayern Munich consider surprise move for Premier League winger',
    subtitle: 'German champions weigh up €60m bid as contract talks stall',
    excerpt: 'Bayern are monitoring the situation of the England international with his current club willing to sell this summer.',
    category: 'transfers',
    tags: ['bayern-munich', 'transfers', 'premier-league', 'rumour'],
    coverImage: IMG_BAYERN,
    readingTimeMinutes: 4,
    viewCount: 2780,
    publishedAt: daysAgo(1),
    entities: [
      { id: 'e18', name: 'Bayern Munich', type: 'club' },
    ],
    confidence: {
      score: 52, label: 'unverified', decision: 'hold', evaluatedAt: daysAgo(1),
      rationale: 'Single tier-2 source; no official confirmation',
      breakdown: { sourceTier: 0.55, crossReference: 0.2, entityMatch: 0.6, historical: 0.65 },
    },
  }),
  makeArticle({
    id: 'art-007',
    title: 'Why Napoli\'s Scudetto charge rests on Kvaratskhelia\'s left foot',
    subtitle: 'The Georgian winger has evolved into Serie A\'s most complete attacker',
    excerpt: 'An opinion piece on how Khvicha Kvaratskhelia has carried Napoli\'s title challenge with 14 goal involvements in 2025.',
    category: 'opinion',
    tags: ['napoli', 'serie-a', 'kvaratskhelia', 'opinion'],
    coverImage: IMG_NAPOLI,
    readingTimeMinutes: 8,
    viewCount: 1980,
    publishedAt: daysAgo(2),
    entities: [
      { id: 'e19', name: 'Napoli', type: 'club' },
      { id: 'e20', name: 'Khvicha Kvaratskhelia', type: 'player' },
      { id: 'e21', name: 'Serie A', type: 'competition' },
    ],
    confidence: {
      score: 80, label: 'likely', decision: 'publish', evaluatedAt: daysAgo(2),
      rationale: 'Statistical claims verified against FBref data',
      breakdown: { sourceTier: 0.85, crossReference: 0.7, entityMatch: 0.9, historical: 0.8 },
    },
  }),
  makeArticle({
    id: 'art-008',
    title: 'Barcelona\'s La Masia graduates are rewriting the youth development playbook',
    subtitle: 'Six academy products started the last Clasico — a club record',
    excerpt: 'A look at how Barcelona\'s commitment to La Masia is paying dividends amid ongoing financial constraints.',
    category: 'youth',
    tags: ['barcelona', 'la-masia', 'youth', 'academy'],
    coverImage: IMG_STADIUM,
    readingTimeMinutes: 6,
    viewCount: 3120,
    publishedAt: daysAgo(3),
    entities: [
      { id: 'e22', name: 'Barcelona', type: 'club' },
    ],
    confidence: {
      score: 90, label: 'verified', decision: 'publish', evaluatedAt: daysAgo(3),
      rationale: 'Lineup data confirmed by La Liga official records',
      breakdown: { sourceTier: 0.95, crossReference: 0.9, entityMatch: 0.9, historical: 0.88 },
    },
  }),
];

export const LIVE_MATCHES: LiveMatch[] = [
  {
    id: 'lm-001',
    competition: 'Premier League',
    season: '2025/26',
    matchday: 'Matchday 24',
    homeTeam: { id: 't1', name: 'Manchester City', shortName: 'MCI', formation: '4-3-3', manager: 'Pep Guardiola' },
    awayTeam: { id: 't2', name: 'Arsenal', shortName: 'ARS', formation: '4-2-3-1', manager: 'Mikel Arteta' },
    homeScore: 2,
    awayScore: 1,
    status: 'live',
    minute: 67,
    kickoffAt: hoursAgo(1),
    venue: 'Etihad Stadium',
    referee: 'Michael Oliver',
  },
  {
    id: 'lm-002',
    competition: 'La Liga',
    season: '2025/26',
    matchday: 'Matchday 24',
    homeTeam: { id: 't3', name: 'Real Madrid', shortName: 'RMA', formation: '4-3-3', manager: 'Carlo Ancelotti' },
    awayTeam: { id: 't4', name: 'Sevilla', shortName: 'SEV', formation: '3-5-2' },
    homeScore: 0,
    awayScore: 0,
    status: 'live',
    minute: 23,
    kickoffAt: hoursAgo(0.5),
    venue: 'Santiago Bernabeu',
  },
  {
    id: 'lm-003',
    competition: 'Serie A',
    season: '2025/26',
    matchday: 'Matchday 24',
    homeTeam: { id: 't5', name: 'Inter Milan', shortName: 'INT', formation: '3-5-2', manager: 'Simone Inzaghi' },
    awayTeam: { id: 't6', name: 'Juventus', shortName: 'JUV', formation: '4-3-3' },
    homeScore: 1,
    awayScore: 1,
    status: 'halftime',
    minute: 45,
    kickoffAt: hoursAgo(1.2),
    venue: 'San Siro',
  },
  {
    id: 'lm-004',
    competition: 'Bundesliga',
    season: '2025/26',
    matchday: 'Matchday 24',
    homeTeam: { id: 't7', name: 'Bayern Munich', shortName: 'BAY', manager: 'Thomas Tuchel' },
    awayTeam: { id: 't8', name: 'Borussia Dortmund', shortName: 'BVB' },
    homeScore: 0,
    awayScore: 0,
    status: 'scheduled',
    kickoffAt: new Date(now + 2 * 3600_000).toISOString(),
    venue: 'Allianz Arena',
  },
];

export const LIVE_EVENTS = [
  { id: 'le1', matchId: 'lm-001', type: 'goal' as const, minute: 67, team: 'home' as const, player: 'Erling Haaland', description: 'GOAL! Haaland finishes off a sweeping City counter-attack.', detail: 'Assist: Kevin De Bruyne', timestamp: hoursAgo(0.1) },
  { id: 'le2', matchId: 'lm-001', type: 'yellow_card' as const, minute: 62, team: 'away' as const, player: 'Declan Rice', description: 'Rice booked for a late challenge on Rodri.', timestamp: hoursAgo(0.2) },
  { id: 'le3', matchId: 'lm-001', type: 'goal' as const, minute: 54, team: 'away' as const, player: 'Bukayo Saka', description: 'Saka levels it with a curling effort into the far corner.', timestamp: hoursAgo(0.3) },
  { id: 'le4', matchId: 'lm-001', type: 'goal' as const, minute: 38, team: 'home' as const, player: 'Phil Foden', description: 'Foden opens the scoring with a deflected strike from the edge of the box.', timestamp: hoursAgo(0.5) },
  { id: 'le5', matchId: 'lm-001', type: 'kickoff' as const, minute: 0, team: 'neutral' as const, description: 'Kickoff at the Etihad. Manchester City get us underway.', timestamp: hoursAgo(1) },
];

export const DONATE_TIERS: DonateTier[] = [
  {
    id: 'tier_supporter',
    name: 'Supporter',
    amount: 5,
    currency: 'USD',
    interval: 'monthly',
    description: 'Help keep Qawla independent and ad-light.',
    perks: ['Ad-free reading', 'Monthly newsletter', 'Discord community access', 'Early access to features'],
    variantId: 'supporter-variant-id',
  },
  {
    id: 'tier_member',
    name: 'Member',
    amount: 12,
    currency: 'USD',
    interval: 'monthly',
    description: 'For readers who want deeper analysis and direct access.',
    perks: ['Everything in Supporter', 'Premium tactical breakdowns', 'Transfer tracker dashboard', 'Q&A with editors', 'Exclusive long-form features'],
    variantId: 'member-variant-id',
    popular: true,
  },
  {
    id: 'tier_patron',
    name: 'Patron',
    amount: 25,
    currency: 'USD',
    interval: 'monthly',
    description: 'For patrons who want to fund original reporting.',
    perks: ['Everything in Member', 'Founding member badge', 'Vote on editorial priorities', 'Annual print edition', 'Direct line to the editor', 'Invite to quarterly editorial call'],
    variantId: 'patron-variant-id',
  },
];

export const ONE_TIME_TIERS: DonateTier[] = [
  {
    id: 'tier_oneoff_10',
    name: 'Buy us a coffee',
    amount: 10,
    currency: 'USD',
    interval: 'one_time',
    description: 'A one-time thank-you for the work.',
    perks: ['Supporter badge for 30 days', 'Shout-out in our newsletter'],
    variantId: 'oneoff-10-variant',
  },
  {
    id: 'tier_oneoff_50',
    name: 'Fuel a story',
    amount: 50,
    currency: 'USD',
    interval: 'one_time',
    description: 'Help us chase an original investigation.',
    perks: ['Supporter badge for 6 months', 'Named credit on a future investigation', 'Behind-the-scenes notes'],
    variantId: 'oneoff-50-variant',
  },
  {
    id: 'tier_oneoff_250',
    name: 'Founding backer',
    amount: 250,
    currency: 'USD',
    interval: 'one_time',
    description: 'Become a founding backer of independent football journalism.',
    perks: ['Lifetime Supporter badge', 'Founding backer credit on the about page', 'Annual editorial strategy call', 'Signed print edition'],
    variantId: 'oneoff-250-variant',
  },
];

export const TRANSFERS: Transfer[] = [
  {
    id: 'tr1',
    player: { id: 'p1', name: 'Florian Wirtz', type: 'player' },
    fromClub: { id: 'c1', name: 'Bayer Leverkusen', type: 'club' },
    toClub: { id: 'c2', name: 'Manchester City', type: 'club' },
    fee: 130_000_000,
    currency: 'EUR',
    type: 'permanent',
    status: 'agreed',
    window: 'Summer 2025',
    reportedAt: hoursAgo(6),
    sources: [],
    contractLength: '5 years',
    wage: '£280,000/week',
    confidence: {
      score: 86, label: 'verified', decision: 'publish', evaluatedAt: hoursAgo(6),
      rationale: 'Confirmed by multiple tier-1 sources plus Fabrizio Romano',
      breakdown: { sourceTier: 0.9, crossReference: 0.85, entityMatch: 0.9, historical: 0.85 },
    },
  },
  {
    id: 'tr2',
    player: { id: 'p2', name: 'Victor Osimhen', type: 'player' },
    fromClub: { id: 'c3', name: 'Napoli', type: 'club' },
    toClub: { id: 'c4', name: 'Chelsea', type: 'club' },
    fee: 90_000_000,
    currency: 'GBP',
    type: 'loan',
    status: 'negotiating',
    window: 'Summer 2025',
    reportedAt: hoursAgo(10),
    sources: [],
    confidence: {
      score: 62, label: 'unverified', decision: 'hold', evaluatedAt: hoursAgo(10),
      rationale: 'Conflicting reports on fee structure',
      breakdown: { sourceTier: 0.7, crossReference: 0.4, entityMatch: 0.8, historical: 0.65 },
    },
  },
  {
    id: 'tr3',
    player: { id: 'p3', name: 'Bruno Guimarães', type: 'player' },
    fromClub: { id: 'c5', name: 'Newcastle United', type: 'club' },
    toClub: { id: 'c6', name: 'Real Madrid', type: 'club' },
    fee: 100_000_000,
    currency: 'GBP',
    type: 'release_clause',
    status: 'rumour',
    window: 'Summer 2025',
    reportedAt: daysAgo(1),
    sources: [],
    confidence: {
      score: 38, label: 'disputed', decision: 'escalate', evaluatedAt: daysAgo(1),
      rationale: 'Single social-media report; Newcastle deny',
      breakdown: { sourceTier: 0.45, crossReference: 0.2, entityMatch: 0.5, historical: 0.55 },
    },
  },
];

// Player images for transfer cards — football action shots
export const TRANSFER_IMAGES: Record<string, string> = {
  tr1: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=300&fit=crop',
  tr2: 'https://images.unsplash.com/photo-1610552050890-fe99536c2615?w=300&h=300&fit=crop',
  tr3: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=300&h=300&fit=crop',
};

/* ----------------------------------------------------------------------------
 * Categories, sources, blog posts, stats, donors, pipeline, activity
 * — added to satisfy imports across app routes and dashboard components.
 * -------------------------------------------------------------------------- */

/** Category catalog used by /news, /category/[slug], /sitemap. */
export const CATEGORIES: { slug: string; label: string; description: string }[] = [
  { slug: 'news', label: 'News', description: 'Breaking football news and match reports.' },
  { slug: 'transfers', label: 'Transfers', description: 'Verified transfer rumours and confirmed deals.' },
  { slug: 'previews', label: 'Previews', description: 'Match previews and team news.' },
  { slug: 'reviews', label: 'Reviews', description: 'Post-match analysis and reviews.' },
  { slug: 'tactical', label: 'Tactical', description: 'Formation breakdowns and tactical analysis.' },
  { slug: 'opinion', label: 'Opinion', description: 'Opinion pieces and editorials.' },
  { slug: 'live', label: 'Live', description: 'Live match commentary and updates.' },
  { slug: 'youth', label: 'Youth', description: 'Youth football and academy news.' },
  { slug: 'international', label: 'International', description: 'International football and tournaments.' },
];

/** Re-export the ingestion source catalog for the admin UI. */
export const SOURCES: CredibilitySource[] = DEFAULT_SOURCES;

/** Site-wide statistics shown on the homepage, about page, and admin. */
export const SITE_STATS: SiteStats = {
  totalArticles: ARTICLES.length,
  publishedArticles: ARTICLES.filter((a) => a.status === 'published').length,
  totalTransfers: TRANSFERS.length,
  liveMatches: LIVE_MATCHES.filter((m) => m.status === 'live' || m.status === 'halftime').length,
  totalDonors: 1284,
  totalRaised: 184_320,
  avgConfidence: Math.round(
    ARTICLES.reduce((sum, a) => sum + (a.confidence?.score ?? 0), 0) / ARTICLES.length,
  ),
  pipelineJobs: 0,
  activeSources: DEFAULT_SOURCES.filter((s) => s.active).length,
};

/** Demo admin credentials shown on the login screen. */
export const DEMO_ADMIN: AdminUser & { password: string } = {
  id: 'admin-demo',
  email: 'editor@qawla.com',
  name: 'Demo Editor',
  role: 'admin',
  createdAt: daysAgo(365),
  lastLoginAt: hoursAgo(1),
  password: 'qawla2025',
};

/** Long-form blog posts for /blog and /blog/[slug]. */
export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-001',
    slug: 'the-art-of-the-deep-lying-playmaker',
    title: 'The art of the deep-lying playmaker',
    subtitle: 'Why registas are back in fashion — and why they never really left',
    excerpt: 'From Pirlo to Rodri, the deep-lying playmaker has shaped modern football more than any other role. A long-form essay on the evolution of the regista.',
    content: `## The art of the deep-lying playmaker\n\nThe deep-lying playmaker — the *regista* — is football's quietest revolutionary. Operating between the lines, rarely touching the box, they dictate the tempo of the entire match with a single pass.\n\n### Andrea Pirlo and the modern template\n\nPirlo redefined the role at Milan and Juventus...\n\n- **Vision**: seeing angles others don't\n- **Weight of pass**: the difference between a chance and a turnover\n- **Composure under pressure**: the press-resistant anchor\n\n> "Football is played with the head. Your feet are just tools." — Andrea Pirlo\n\n### Rodri: the contemporary regista\n\nUnder Guardiola, Rodri has become the most influential player in world football. His 2024 Ballon d'Or was recognition not just of goals, but of the architecture he provides.\n\n### Why the role endures\n\nEvery great team needs a conductor. The regista is football's conductor — and the role will never go out of fashion.`,
    coverImage: 'https://images.unsplash.com/photo-1551038247-3d9af20df552?w=1200&h=675&fit=crop',
    author: { name: 'Carla Méndez', role: 'Tactical Analyst', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop' },
    tags: ['tactics', 'regista', 'analysis'],
    readingTimeMinutes: 8,
    publishedAt: daysAgo(2),
    updatedAt: daysAgo(2),
    featured: true,
  },
  {
    id: 'blog-002',
    slug: 'how-data-changed-the-transfer-market',
    title: 'How data changed the transfer market',
    subtitle: 'From Moneyball to multi-club ownership — a decade of analytics in football',
    excerpt: 'A decade after Brentford and Midtjylland pioneered data-driven recruitment, every top club now employs a team of analysts. What did the data revolution actually change?',
    content: `## How data changed the transfer market\n\nThe story of data in football is not the story of algorithms replacing scouts. It is the story of clubs learning to ask better questions.\n\n### The Moneyball moment\n\nWhen Brentford reached the Premier League in 2021, they did so on the back of a recruitment model that valued set-piece dominance and undervalued headers from throw-ins...\n\n### What the data actually measures\n\n- **Expected goals (xG)**: shot quality, not just shot count\n- **Progressive carries**: breaking lines with the ball\n- **Pressing success rate**: defensive contribution beyond tackles\n\n### The limits of data\n\nData cannot measure heart. It cannot measure the way a player lifts a dressing room. The best clubs use data as a complement to traditional scouting, not a replacement.`,
    coverImage: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&h=675&fit=crop',
    author: { name: 'James Whitfield', role: 'Senior Writer', avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop' },
    tags: ['data', 'transfers', 'analysis'],
    readingTimeMinutes: 11,
    publishedAt: daysAgo(5),
    updatedAt: daysAgo(5),
  },
  {
    id: 'blog-003',
    slug: 'the-tactical-evolution-of-the-false-9',
    title: 'The tactical evolution of the false 9',
    subtitle: 'From Messi to Firmino — how the strikerless system reshaped modern attacks',
    excerpt: 'The false 9 is no longer a tactical curiosity. It is a mainstream system. We trace its journey from Pep\'s Barcelona to the modern Premier League.',
    content: `## The tactical evolution of the false 9\n\nThe false 9 — a striker who drops deep to create overloads in midfield — has gone from heresy to orthodoxy in fifteen years.\n\n### Messi at Barcelona\n\nUnder Guardiola, Messi\'s move from the right wing to a central false 9 role changed football. Defenders didn\'t know whether to follow him or hold their line...\n\n### Firmino at Liverpool\n\nRoberto Firmino made the false 9 a defensive position. His pressing from the front allowed Salah and Mané to thrive in the channels.\n\n### The modern false 9\n\nToday, the role has split into variants: the dropping 9, the half-space 9, and the rotating front three. The principle remains the same: create space by vacating it.`,
    coverImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=675&fit=crop',
    author: { name: 'Carla Méndez', role: 'Tactical Analyst', avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop' },
    tags: ['tactics', 'false-9', 'analysis'],
    readingTimeMinutes: 9,
    publishedAt: daysAgo(8),
    updatedAt: daysAgo(8),
  },
  {
    id: 'blog-004',
    slug: 'why-womens-football-deserves-better-coverage',
    title: 'Why women\'s football deserves better coverage',
    subtitle: 'The growth is real. The coverage hasn\'t kept up.',
    excerpt: 'The Women\'s World Cup broke attendance records. The WSL is growing fast. Yet mainstream coverage still lags. We argue for a different approach.',
    content: `## Why women's football deserves better coverage\n\nWomen's football is the fastest-growing sport on earth. The 2023 World Cup final was watched by 2 billion people. Yet coverage in mainstream outlets remains tokenistic.\n\n### The growth is real\n\n- WSL attendance up 400% in five years\n- NWSL valuation crossing $500m\n- Spain, England, Germany all investing heavily\n\n### What better coverage looks like\n\nNot "giving them a section." Treating women's football with the same tactical depth, transfer scrutiny, and investigative rigour as the men's game.\n\n### Our commitment\n\nQawla covers women's football with the same editorial pipeline. Same scouts. Same fact-checkers. Same confidence scores.`,
    coverImage: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&h=675&fit=crop',
    author: { name: 'Aisha Patel', role: 'Staff Writer', avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop' },
    tags: ['womens-football', 'opinion', 'editorial'],
    readingTimeMinutes: 7,
    publishedAt: daysAgo(12),
    updatedAt: daysAgo(12),
  },
];

/** Donors backing the newsroom (used by the dashboard Donors tab). */
export const DONORS: Donor[] = [
  { id: 'd1', email: 'carla.m@example.com', name: 'Carla M.', totalContributed: 360, currency: 'USD', tier: 'Patron', since: daysAgo(420) },
  { id: 'd2', email: 'liam.o@example.com', name: 'Liam O.', totalContributed: 144, currency: 'USD', tier: 'Member', since: daysAgo(280) },
  { id: 'd3', email: 'james.w@example.com', name: 'James W.', totalContributed: 300, currency: 'USD', tier: 'Patron', since: daysAgo(190) },
  { id: 'd4', email: 'anon@example.com', name: 'Anonymous', totalContributed: 250, currency: 'USD', tier: 'Founding backer', since: daysAgo(150) },
  { id: 'd5', email: 'maria.s@example.com', name: 'Maria S.', totalContributed: 60, currency: 'USD', tier: 'Member', since: daysAgo(95) },
  { id: 'd6', email: 'tomas.k@example.com', name: 'Tomas K.', totalContributed: 25, currency: 'USD', tier: 'Supporter', since: daysAgo(60) },
  { id: 'd7', email: 'priya.n@example.com', name: 'Priya N.', totalContributed: 12, currency: 'USD', tier: 'Supporter', since: daysAgo(30) },
];

/** Aggregate donor statistics for the dashboard. */
export const DONOR_STATS: {
  totalDonors: number;
  activeMonthly: number;
  totalRaised: number;
  avgContribution: number;
  churnRate: number;
  monthly: { month: string; revenue: number }[];
  byTier: { tier: string; count: number; revenue: number }[];
} = {
  totalDonors: SITE_STATS.totalDonors,
  activeMonthly: 842,
  totalRaised: SITE_STATS.totalRaised,
  avgContribution: 18,
  churnRate: 0.034,
  monthly: [
    { month: 'Jan', revenue: 11200 },
    { month: 'Feb', revenue: 12450 },
    { month: 'Mar', revenue: 13100 },
    { month: 'Apr', revenue: 12800 },
    { month: 'May', revenue: 14200 },
    { month: 'Jun', revenue: 15800 },
    { month: 'Jul', revenue: 16100 },
    { month: 'Aug', revenue: 15400 },
    { month: 'Sep', revenue: 16900 },
    { month: 'Oct', revenue: 17800 },
    { month: 'Nov', revenue: 18200 },
    { month: 'Dec', revenue: 19400 },
  ],
  byTier: [
    { tier: 'Supporter', count: 612, revenue: 3060 },
    { tier: 'Member', count: 184, revenue: 2208 },
    { tier: 'Patron', count: 46, revenue: 13800 },
  ],
};

/** Mock pipeline jobs for the dashboard (admin page defines its own local copy). */
export const PIPELINE_JOBS: PipelineJob[] = [
  {
    id: 'job-001',
    stage: 'complete',
    status: 'completed',
    trigger: 'cron',
    articleId: 'art-001',
    agentResults: [],
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
    completedAt: hoursAgo(2),
  },
  {
    id: 'job-002',
    stage: 'writer',
    status: 'running',
    trigger: 'manual',
    articleId: 'art-002',
    agentResults: [],
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(0.2),
  },
  {
    id: 'job-003',
    stage: 'fact_check',
    status: 'failed',
    trigger: 'webhook',
    agentResults: [],
    createdAt: hoursAgo(0.5),
    updatedAt: hoursAgo(0.4),
    error: 'Cross-reference threshold not met',
  },
];

/** Activity feed entries for the dashboard overview. */
export const ACTIVITY_FEED: {
  id: string;
  icon: 'publish' | 'pipeline' | 'donor' | 'source' | 'comment' | 'fail';
  actor: string;
  target: string;
  timestamp: string;
}[] = [
  { id: 'a1', icon: 'publish', actor: 'Editor agent', target: 'published "Manchester City edge Arsenal"', timestamp: hoursAgo(0.2) },
  { id: 'a2', icon: 'pipeline', actor: 'Pipeline', target: 'started job-002 for transfer rumour', timestamp: hoursAgo(0.5) },
  { id: 'a3', icon: 'donor', actor: 'New donor', target: 'Patron tier — $25/mo', timestamp: hoursAgo(1) },
  { id: 'a4', icon: 'source', actor: 'BBC Sport', target: 'ingested 12 new events', timestamp: hoursAgo(1.5) },
  { id: 'a5', icon: 'fail', actor: 'Fact-checker', target: 'flagged low-confidence claim in job-003', timestamp: hoursAgo(0.4) },
  { id: 'a6', icon: 'comment', actor: 'Guardian agent', target: 'approved editorial revisions on art-004', timestamp: hoursAgo(2) },
  { id: 'a7', icon: 'publish', actor: 'Editor agent', target: 'published "Real Madrid agree €180m deal"', timestamp: hoursAgo(4) },
  { id: 'a8', icon: 'pipeline', actor: 'Pipeline', target: 'completed job-001 (5 agents, 24s)', timestamp: hoursAgo(2) },
];

/* ----------------------------------------------------------------------------
 * Lookup helpers
 * -------------------------------------------------------------------------- */

/** Find a single article by its id (e.g. /news/art-001). */
export function getArticleById(id: string): Article | undefined {
  return ARTICLES.find((a) => a.id === id);
}

/** Find a single blog post by its slug (e.g. /blog/the-art-of-the-deep-lying-playmaker). */
export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

/** Return the featured article (first one flagged `featured`), or the first article. */
export function getFeaturedArticle(): Article | undefined {
  const published = ARTICLES.filter((a) => a.status === 'published');
  return published.find((a) => a.featured) ?? published[0];
}

/** Return up to 3 related articles sharing tags or category with the given article. */
export function getRelatedArticles(article: Article, limit = 3): Article[] {
  return ARTICLES.filter((a) => a.id !== article.id && a.status === 'published')
    .map((a) => {
      const sharedTags = a.tags.filter((t) => article.tags.includes(t)).length;
      const sameCategory = a.category === article.category ? 1 : 0;
      return { a, score: sharedTags * 2 + sameCategory };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.a);
}

