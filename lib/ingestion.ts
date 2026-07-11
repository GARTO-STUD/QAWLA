// Qawla — Ingestion: RSS feed parser, Football-Data.org polling, entity extraction
// Pure functions; no DOM. RSS is parsed with regex-based XML walking.

import type { CredibilitySource, RawEvent, Entity, ArticleCategory } from '@/types';

/* -------------------------------------------------------------------------- */
/* Hashing                                                                     */
/* -------------------------------------------------------------------------- */

async function sha256(input: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
  const bytes = new Uint8Array(buf);
  let hex = '';
  for (let i = 0; i < bytes.length; i++) hex += bytes[i].toString(16).padStart(2, '0');
  return hex;
}

function randomId(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, '0')).join('');
}

/* -------------------------------------------------------------------------- */
/* RSS parsing                                                                 */
/* -------------------------------------------------------------------------- */

interface RSSItem {
  title: string;
  link: string;
  pubDate?: string;
  description?: string;
  content?: string;
  creator?: string;
  categories?: string[];
  enclosure?: string;
}

function decodeEntities(input: string): string {
  return input
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .trim();
}

function tag(xml: string, name: string): string {
  const re = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i');
  const m = xml.match(re);
  return m ? decodeEntities(m[1]!) : '';
}

function allTags(xml: string, name: string): string[] {
  const re = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'gi');
  const out: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml))) out.push(m[1]!);
  return out;
}

function attribute(xml: string, tag: string, attr: string): string {
  const re = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["']`, 'i');
  const m = xml.match(re);
  return m ? m[1]! : '';
}

export function parseRSS(xml: string): RSSItem[] {
  const items = allTags(xml, 'item');
  return items.map((itemXml) => {
    const title = tag(itemXml, 'title');
    const link = tag(itemXml, 'link') || attribute(itemXml, 'link', 'href');
    const pubDate = tag(itemXml, 'pubDate');
    const description = tag(itemXml, 'description');
    const content = tag(itemXml, 'content:encoded') || tag(itemXml, 'content');
    const creator = tag(itemXml, 'dc:creator') || tag(itemXml, 'author');
    const categories = allTags(itemXml, 'category').map(decodeEntities);
    const enclosure = attribute(itemXml, 'enclosure', 'url');
    return { title, link, pubDate, description, content, creator, categories, enclosure };
  }).filter((i) => i.title && i.link);
}

/* -------------------------------------------------------------------------- */
/* Football-Data.org polling                                                   */
/* -------------------------------------------------------------------------- */

export interface FootballDataMatch {
  id: number;
  competition: { name: string; code: string };
  matchday: number;
  utcDate: string;
  status: string;
  homeTeam: { name: string; shortName?: string; crest?: string };
  awayTeam: { name: string; shortName?: string; crest?: string };
  score: { fullTime: { home: number | null; away: number | null } };
  venue?: string;
  referee?: string;
  attendance?: number;
}

export async function fetchFootballDataMatches(competitionCode: string = 'PL'): Promise<FootballDataMatch[]> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) return [];
  const res = await fetch(`https://api.football-data.org/v4/competitions/${competitionCode}/matches?status=LIVE,SCHEDULED,FINISHED`, {
    headers: { 'X-Auth-Token': apiKey },
    next: { revalidate: 60 },
  });
  if (!res.ok) return [];
  const json = await res.json() as { matches: FootballDataMatch[] };
  return json.matches ?? [];
}

/* -------------------------------------------------------------------------- */
/* Entity extraction                                                           */
/* -------------------------------------------------------------------------- */

const LEAGUE_KEYWORDS: Record<string, ArticleCategory> = {
  transfer: 'transfers',
  signing: 'transfers',
  medical: 'transfers',
  preview: 'previews',
  review: 'reviews',
  tactical: 'tactical',
  analysis: 'tactical',
  opinion: 'opinion',
  column: 'opinion',
  youth: 'youth',
  academy: 'youth',
  international: 'international',
  nations: 'international',
};

const CLUB_PATTERN = /\b(Manchester City|Manchester United|Liverpool|Arsenal|Chelsea|Tottenham|Newcastle|Brighton|Aston Villa|West Ham|Real Madrid|Barcelona|Atletico Madrid|Bayern Munich|Borussia Dortmund|Paris Saint-Germain|Juventus|Inter Milan|AC Milan|Napoli|Roma|Lazio|Atalanta|Sevilla|Villarreal|Real Sociedad|Athletic Bilbao|Valencia|Benfica|Porto|Sporting CP|Ajax|PSV|Feyenoord|Celtic|Rangers)\b/gi;

// Same pattern WITHOUT the global flag, used only for one-off `.test()` calls.
// Reusing CLUB_PATTERN (which has /g) with `.test()` in a loop is a classic
// JS footgun: a global regex object keeps its `lastIndex` between calls, so
// repeated `.test()` calls on the SAME shared module-level regex silently
// start searching from wherever the previous call left off — meaning some
// club names would stop matching (or match inconsistently) as more RSS items
// get processed in the same batch, corrupting entity extraction over time
// in a way that's very hard to notice from a single manual test.
const CLUB_PATTERN_TEST = /\b(Manchester City|Manchester United|Liverpool|Arsenal|Chelsea|Tottenham|Newcastle|Brighton|Aston Villa|West Ham|Real Madrid|Barcelona|Atletico Madrid|Bayern Munich|Borussia Dortmund|Paris Saint-Germain|Juventus|Inter Milan|AC Milan|Napoli|Roma|Lazio|Atalanta|Sevilla|Villarreal|Real Sociedad|Athletic Bilbao|Valencia|Benfica|Porto|Sporting CP|Ajax|PSV|Feyenoord|Celtic|Rangers)\b/i;

const PLAYER_PATTERN = /\b([A-Z][a-z]+ [A-Z][a-z]+)\b/g;

const MANAGER_PATTERN = /\b(Pep Guardiola|Mikel Arteta|Jurgen Klopp|Carlo Ancelotti|Diego Simeone|Xavi Hernandez|Hansi Flick|Thomas Tuchel|Antonio Conte|Mauricio Pochettino|Erik ten Hag|Roberto De Zerbi|Unai Emery|Luis Enrique)\b/gi;

const COMPETITION_PATTERN = /\b(Premier League|La Liga|Bundesliga|Serie A|Ligue 1|Champions League|Europa League|Europa Conference League|FA Cup|EFL Cup|Copa del Rey|World Cup|European Championship|Copa America)\b/gi;

function dedupeEntities(entities: Entity[]): Entity[] {
  const seen = new Set<string>();
  const out: Entity[] = [];
  for (const e of entities) {
    const key = `${e.type}:${e.name.toLowerCase()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(e);
  }
  return out;
}

export function extractEntities(text: string): Entity[] {
  const entities: Entity[] = [];
  const max = 8;
  const seenPlayers = new Set<string>();

  for (const m of text.matchAll(CLUB_PATTERN)) {
    if (entities.filter((e) => e.type === 'club').length >= 4) break;
    entities.push({
      id: randomId(),
      name: m[0],
      type: 'club',
      aliases: [],
    });
  }
  for (const m of text.matchAll(MANAGER_PATTERN)) {
    if (entities.filter((e) => e.type === 'manager').length >= 2) break;
    entities.push({ id: randomId(), name: m[0], type: 'manager' });
  }
  for (const m of text.matchAll(COMPETITION_PATTERN)) {
    if (entities.filter((e) => e.type === 'competition').length >= 2) break;
    entities.push({ id: randomId(), name: m[0], type: 'competition' });
  }
  // Player extraction is noisy; only keep capitalized two-word names not already matched.
  for (const m of text.matchAll(PLAYER_PATTERN)) {
    if (entities.filter((e) => e.type === 'player').length >= max) break;
    const name = m[0];
    const lower = name.toLowerCase();
    if (seenPlayers.has(lower)) continue;
    // Skip common false positives
    if (/^(The|This|That|Last|Next|New|Old|San|Los|Las|El|La|Le|Van|Von|De|Da|Di|Del)\b/i.test(name)) continue;
    if (CLUB_PATTERN_TEST.test(name)) continue;
    seenPlayers.add(lower);
    entities.push({ id: randomId(), name, type: 'player' });
  }
  return dedupeEntities(entities).slice(0, 12);
}

export function inferCategory(text: string): ArticleCategory {
  const lower = text.toLowerCase();
  let best: { cat: ArticleCategory; score: number } = { cat: 'reviews', score: 0 };
  for (const [keyword, cat] of Object.entries(LEAGUE_KEYWORDS)) {
    const score = (lower.match(new RegExp(`\\b${keyword}\\b`, 'g')) ?? []).length;
    if (score > best.score) best = { cat, score };
  }
  return best.cat;
}

/* -------------------------------------------------------------------------- */
/* Ingestion pipeline                                                          */
/* -------------------------------------------------------------------------- */

export async function ingestSource(source: CredibilitySource): Promise<RawEvent[]> {
  if (!source.feedUrl) return [];
  let xml: string;
  try {
    const res = await fetch(source.feedUrl, {
      headers: { 'User-Agent': 'QawlaBot/2.0 (+https://qawla.com)' },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    xml = await res.text();
  } catch {
    return [];
  }
  const items = parseRSS(xml);
  const events: RawEvent[] = [];
  for (const item of items.slice(0, 25)) {
    const text = `${item.title}. ${item.description ?? ''} ${item.content ?? ''}`;
    const entities = extractEntities(text);
    const category = inferCategory(text);
    const rawHash = await sha256(`${source.id}:${item.link}`);
    events.push({
      id: randomId(),
      sourceId: source.id,
      sourceName: source.name,
      sourceTier: source.tier,
      headline: item.title,
      summary: item.description?.replace(/<[^>]+>/g, '').slice(0, 280),
      body: item.content?.replace(/<[^>]+>/g, ''),
      url: item.link,
      publishedAt: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      image: item.enclosure,
      language: 'en',
      entities,
      tags: item.categories ?? [],
      category,
      rawHash,
      ingestedAt: new Date().toISOString(),
    });
  }
  return events;
}

/** Default source catalog used for development/seed. */
export const DEFAULT_SOURCES: CredibilitySource[] = [
  { id: 'src_bbc', name: 'BBC Sport Football', url: 'https://bbc.co.uk/sport/football', tier: 'tier1', type: 'rss', reliabilityScore: 0.95, feedUrl: 'https://feeds.bbci.co.uk/sport/football/rss.xml', language: 'en', active: true },
  { id: 'src_guardian', name: 'The Guardian — Football', url: 'https://theguardian.com/football', tier: 'tier1', type: 'rss', reliabilityScore: 0.94, feedUrl: 'https://www.theguardian.com/football/rss', language: 'en', active: true },
  { id: 'src_sky', name: 'Sky Sports Football', url: 'https://skysports.com/football', tier: 'tier1', type: 'rss', reliabilityScore: 0.92, feedUrl: 'https://www.skysports.com/rss/12040', language: 'en', active: true },
  { id: 'src_athletic', name: 'The Athletic', url: 'https://theathletic.com', tier: 'tier1', type: 'rss', reliabilityScore: 0.93, feedUrl: 'https://theathletic.com/feed/', language: 'en', active: true },
  { id: 'src_fabrizio', name: 'Fabrizio Romano', url: 'https://twitter.com/FabrizioRomano', tier: 'social', type: 'social', reliabilityScore: 0.88, language: 'en', active: true },
  { id: 'src_pl', name: 'Premier League Official', url: 'https://premierleague.com', tier: 'official', type: 'official_site', reliabilityScore: 0.99, feedUrl: 'https://www.premierleague.com/rss', language: 'en', active: true },
];
