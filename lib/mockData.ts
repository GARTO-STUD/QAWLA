// Qawla — Mock/seed data for development & static rendering
// In production these would be fetched from Firestore; here we provide
// realistic English sample content so the UI is fully populated.

import type { Article, LiveMatch, DonateTier, CredibilitySource, Transfer, SiteStats } from '@/types';

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
const IMG_TACTICS = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&h=675&fit=crop';
const IMG_CONTRACT = 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&h=675&fit=crop';
const IMG_CHAMPIONS = 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=1200&h=675&fit=crop';
const IMG_BAYERN = 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&h=675&fit=crop';
const IMG_NAPOLI = 'https://images.unsplash.com/photo-1610201417828-29e25fe1be63?w=1200&h=675&fit=crop';
const IMG_STADIUM = 'https://images.unsplash.com/photo-1522778119026-d665f5f4f2c3?w=1200&h=675&fit=crop';

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

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'bp1',
    slug: 'the-death-of-the-number-10',
    title: 'The slow death of the number 10 — and what comes next',
    subtitle: 'How the second striker was engineered out of modern football',
    excerpt: 'From Zidane to Özil to De Bruyne, the pure number 10 has been replaced by hybrid creators. A long read on the tactical evolution.',
    coverImage: IMG_TACTICS,
    author: { name: 'Qawla Editorial', role: 'Senior Writer' },
    tags: ['tactics', 'analysis', 'number-10', 'history'],
    readingTimeMinutes: 14,
    publishedAt: daysAgo(2),
    updatedAt: daysAgo(2),
    featured: true,
    content: `## The rise and fall of football's most romantic position

For thirty years, the number 10 was football's most romantic position. The trequartista, the enganche, the second striker — call it what you want, it was the player who made the game beautiful. Zinedine Zidane, Juan Román Riquelme, Kaká, Mesut Özil: artists in shirts two sizes too big, gliding between the lines, conducting the orchestra.

And then, sometime around 2018, they started disappearing.

### The pressing revolution

The first blow was Gegenpressing. A high-intensity press demands ten outfield players who can sprint, tackle, and recover — not nine runners plus a luxury creator. Pep Guardiola's Barcelona kept the 10 alive by giving Lionel Messi total freedom, but everywhere else, the role was being engineered out.

Jürgen Klopp's Liverpool won the Champions League in 2019 without a traditional 10. Roberto Firmino, nominally a false 9, dropped deeper than any number 10 would — but he also pressed like a winger. The message was clear: if you can't sprint, you can't play.

### The hybrid creator

What replaced the pure 10 is something messier and more interesting: the hybrid creator. Kevin De Bruyne is the archetype. He's listed as a central midfielder, but he drifts to the right, finds half-spaces, and produces assists at a rate that would shame any classic 10. Martin Ødegaard, Phil Foden, Florian Wirtz — they're all doing the same thing: creating from deeper positions, with more ground to cover.

> The modern 10 isn't a 10 at all. He's an 8 with the soul of a 10.

### What's next?

Watch Jude Bellingham. Watch Jamal Musiala. They're not 10s, and they're not 8s. They're something new — box-arriving, line-breaking, two-way midfielders who can score 20 goals a season and still press for 90 minutes. The position has been compressed, not killed. It just looks different now.

And that's okay. Football evolves. The 10 was beautiful, but it was also a luxury the modern game can no longer afford.`,
  },
  {
    id: 'bp2',
    slug: 'why-moneyball-never-really-worked-in-football',
    title: 'Why Moneyball never really worked in football',
    subtitle: 'The market inefficiency that wasn\'t',
    excerpt: "Baseball's statistical revolution transformed the sport. Football's equivalent stalled. Here's why — and what worked instead.",
    coverImage: IMG_CONTRACT,
    author: { name: 'Qawla Editorial', role: 'Senior Writer' },
    tags: ['analysis', 'data', 'transfers', 'moneyball'],
    readingTimeMinutes: 11,
    publishedAt: daysAgo(5),
    updatedAt: daysAgo(5),
    content: `## The promise and the problem

When Michael Lewis published *Moneyball* in 2003, football took note. If Billy Beane could find undervalued players in baseball using on-base percentage, surely the same logic applied to the world's most data-poor major sport. Clubs hired analysts. Models were built. Expected goals (xG) entered the mainstream.

Twenty years on, the revolution stalled. Here's why.

### Football is not baseball

Baseball is a series of discrete, isolated events. Each pitch, each at-bat, each play can be measured independently. Football is continuous and interactive. A striker's goal-scoring record depends on his teammates, his opponents, the system, the referee, the weather, the pitch. There is no isolated event to optimise.

> You can't measure a player in isolation because no player exists in isolation.

### The market corrected too fast

The other problem: by the time football's "Moneyball moment" arrived, every Premier League club had the same data. Brentford, Brighton, and Midtjylland were the pioneers — and for a few years, they found genuine inefficiencies. But the moment an edge became known, the market corrected. The next Florian Wirtz costs €130m, not €5m.

### What worked instead

What actually moved the needle wasn't finding undervalued players — it was finding undervalued *roles*. Brighton realised that wing-backs were underpriced relative to their xG contribution. Brentford bet on set-piece specialists when nobody else did. Liverpool bought a goalkeeper (Alisson) for what was then a record fee because the model said saves were worth more than goals.

The lesson isn't that data doesn't work. It's that data works differently in a continuous, eleven-a-side sport. You don't find undervalued players. You find undervalued questions.`,
  },
  {
    id: 'bp3',
    slug: 'the-anatomy-of-a-modern-transfer-saga',
    title: 'The anatomy of a modern transfer saga',
    subtitle: 'From first enquiry to unveiled photo — how deals really happen',
    excerpt: 'A behind-the-scenes look at the six stages of a modern football transfer, told from the perspective of the people who make them happen.',
    coverImage: IMG_TRANSFER,
    author: { name: 'Qawla Editorial', role: 'Senior Writer' },
    tags: ['transfers', 'analysis', 'behind-the-scenes'],
    readingTimeMinutes: 12,
    publishedAt: daysAgo(8),
    updatedAt: daysAgo(8),
    content: `## The six stages of a modern transfer

Every transfer saga — from the mundane to the messianic — follows roughly the same six-stage script. Here's how it actually works.

### 1. The first enquiry

It almost never starts with a bid. It starts with a phone call from a sporting director to an agent, asking: "Is your player happy? Would he consider a move?" The agent, naturally, says yes — even if the player has never heard of the interested club. This is how the music starts.

### 2. The leak

Within 48 hours, the story is in the press. Often the leak comes from the agent (to drum up interest), sometimes from the buying club (to gauge fan reaction), occasionally from the selling club (to drive up the price). The first headline is almost always wrong on the numbers.

### 3. The bid

A formal bid follows — usually lower than the eventual fee. This is the opening gambit. The selling club rejects it, the agent goes back to the player, and the dance begins.

### 4. The personal terms

In parallel, the buying club negotiates personal terms with the player. This is where deals often die. The player wants a release clause; the club won't give one. The agent wants a commission the club considers excessive. The player's wife wants to live in a specific postcode.

### 5. The medical

If personal terms are agreed, the medical is scheduled. This is the moment the deal is 90% done — but not 100%. Medicals fail. Sometimes genuinely (a knee issue); sometimes conveniently (the buying club gets cold feet and uses the medical as cover).

### 6. The unveiling

The photo drops. The player holds the shirt. The emoji tweets go out. The saga is over — until the next window, when it starts again.

> The transfer window isn't really about football. It's about information, leverage, and timing.

The clubs that win aren't the ones with the most money. They're the ones with the best information — and the discipline to walk away when the price is wrong.`,
  },
];

export const SITE_STATS: SiteStats = {
  totalArticles: 1247,
  publishedArticles: 1183,
  totalTransfers: 312,
  liveMatches: 3,
  totalDonors: 1842,
  totalRaised: 47820,
  avgConfidence: 81,
  pipelineJobs: 56,
  activeSources: 24,
};

export const SOURCES: CredibilitySource[] = [
  { id: 'src_bbc', name: 'BBC Sport', url: 'https://bbc.co.uk/sport', tier: 'tier1', type: 'rss', reliabilityScore: 0.95, language: 'en', active: true, lastPolledAt: hoursAgo(0.2) },
  { id: 'src_guardian', name: 'The Guardian', url: 'https://theguardian.com/football', tier: 'tier1', type: 'rss', reliabilityScore: 0.94, language: 'en', active: true, lastPolledAt: hoursAgo(0.3) },
  { id: 'src_sky', name: 'Sky Sports', url: 'https://skysports.com/football', tier: 'tier1', type: 'rss', reliabilityScore: 0.92, language: 'en', active: true, lastPolledAt: hoursAgo(0.4) },
  { id: 'src_athletic', name: 'The Athletic', url: 'https://theathletic.com', tier: 'tier1', type: 'rss', reliabilityScore: 0.93, language: 'en', active: true, lastPolledAt: hoursAgo(0.5) },
  { id: 'src_fabrizio', name: 'Fabrizio Romano', url: 'https://x.com/FabrizioRomano', tier: 'social', type: 'social', reliabilityScore: 0.88, language: 'en', active: true, lastPolledAt: hoursAgo(0.1) },
  { id: 'src_pl', name: 'Premier League', url: 'https://premierleague.com', tier: 'official', type: 'official_site', reliabilityScore: 0.99, language: 'en', active: true, lastPolledAt: hoursAgo(0.6) },
  { id: 'src_telegraph', name: 'The Telegraph', url: 'https://telegraph.co.uk/football', tier: 'tier1', type: 'rss', reliabilityScore: 0.91, language: 'en', active: true, lastPolledAt: hoursAgo(0.7) },
  { id: 'src_times', name: 'The Times', url: 'https://thetimes.co.uk/sport/football', tier: 'tier1', type: 'rss', reliabilityScore: 0.92, language: 'en', active: true, lastPolledAt: hoursAgo(0.8) },
];

export function getArticleById(id: string): Article | undefined {
  return ARTICLES.find((a) => a.id === id || a.slug === id);
}

export function getArticlesByCategory(category: string): Article[] {
  return ARTICLES.filter((a) => a.category === category);
}

export function getArticlesByTag(tag: string): Article[] {
  return ARTICLES.filter((a) => a.tags.includes(tag));
}

export function getFeaturedArticle(): Article | undefined {
  return ARTICLES.find((a) => a.featured) ?? ARTICLES[0];
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((b) => b.slug === slug);
}

export function getRelatedArticles(article: Article, limit = 3): Article[] {
  const entityNames = new Set(article.entities.map((e) => e.name.toLowerCase()));
  const tags = new Set(article.tags.map((t) => t.toLowerCase()));
  return ARTICLES
    .filter((a) => a.id !== article.id)
    .map((a) => {
      let score = 0;
      a.entities.forEach((e) => entityNames.has(e.name.toLowerCase()) && score++);
      a.tags.forEach((t) => tags.has(t.toLowerCase()) && score++);
      if (a.category === article.category) score += 2;
      return { a, score };
    })
    .filter((x) => x.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, limit)
    .map((x) => x.a);
}

export const CATEGORIES: { slug: string; label: string; description: string }[] = [
  { slug: 'transfers', label: 'Transfers', description: 'Verified transfer news and rumours with confidence scoring' },
  { slug: 'previews', label: 'Previews', description: 'Match previews, team news, and predicted lineups' },
  { slug: 'reviews', label: 'Reviews', description: 'Post-match analysis and player ratings' },
  { slug: 'tactical', label: 'Tactical', description: 'Deep tactical breakdowns and formations' },
  { slug: 'opinion', label: 'Opinion', description: 'Columns and long-form features' },
  { slug: 'live', label: 'Live', description: 'Real-time match commentary' },
  { slug: 'youth', label: 'Youth', description: 'Academy prospects and breakthrough talents' },
  { slug: 'international', label: 'International', description: 'World Cup, Euros, and international football' },
];
