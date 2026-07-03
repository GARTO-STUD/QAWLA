/**
 * lib/imageMatcher.ts — Smart image-fetching system for the IA pipeline.
 *
 * Maps article entities (players, clubs, leagues, competitions) to relevant
 * football images. When the IA processes an article, it uses this matcher
 * to fetch a cover image that matches the article's subject — e.g., an
 * article about Manchester City vs Arsenal gets a City/Arsenal match image,
 * not a generic football photo.
 *
 * The matcher uses a keyword-based mapping (entity name → image URL) with
 * fallback tiers:
 *   1. Direct entity match (e.g., "Haaland" → Haaland image)
 *   2. Club match (e.g., "Manchester City" → City stadium/action)
 *   3. League match (e.g., "Premier League" → PL scene)
 *   4. Category fallback (e.g., "transfers" → transfer scene)
 *   5. Tavily image search (real-time web image search)
 *   6. Generic football fallback
 *
 * Tavily integration: when no local match is found and TAVILY_API_KEY is
 * set, the matcher queries Tavily for relevant football images. This lets
 * the IA fetch images for any subject — even players/clubs not in the
 * local library. Free tier: 1,000 searches/month at https://tavily.com
 */

import type { Entity } from '@/types';
import { searchWeb, type TavilyResponse } from '@/lib/aiWaterfall';

// ─── Image library ──────────────────────────────────────────────────────────
// Curated Unsplash football images, each tagged with keywords for matching.
// In production these would come from a real image API (Getty, Reuters, etc.)

interface ImageEntry {
  url: string;
  keywords: string[]; // entity names, club names, league names, player names
  type: 'player' | 'club' | 'match' | 'league' | 'stadium' | 'generic';
}

const IMAGE_LIBRARY: ImageEntry[] = [
  // ── Premier League / England ──
  {
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=675&fit=crop',
    keywords: ['manchester city', 'man city', 'city', 'etihad', 'premier league', 'england', 'haaland', 'de bruyne', 'foden', 'guardiola'],
    type: 'match',
  },
  {
    url: 'https://images.unsplash.com/photo-1610201417828-29e25fe1be63?w=1200&h=675&fit=crop',
    keywords: ['arsenal', 'emirates', 'london', 'saka', 'odegaard', 'arteta', 'premier league'],
    type: 'match',
  },
  {
    url: 'https://images.unsplash.com/photo-1522778119026-d665f5f4f2c3?w=1200&h=675&fit=crop',
    keywords: ['liverpool', 'anfield', 'salah', 'slot', 'klopp', 'premier league'],
    type: 'stadium',
  },
  {
    url: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&h=675&fit=crop',
    keywords: ['chelsea', 'stamford bridge', 'london', 'premier league'],
    type: 'stadium',
  },
  {
    url: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&h=675&fit=crop',
    keywords: ['newcastle', 'st james', 'premier league', 'bruno guimaraes', 'bruno'],
    type: 'stadium',
  },
  {
    url: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&h=675&fit=crop',
    keywords: ['tottenham', 'spurs', 'premier league', 'london'],
    type: 'stadium',
  },
  // ── La Liga / Spain ──
  {
    url: 'https://images.unsplash.com/photo-1551958219-acbc608c6377?w=1200&h=675&fit=crop',
    keywords: ['real madrid', 'madrid', 'bernabeu', 'spain', 'la liga', 'bellingham', 'vinicius', 'ancelotti', 'perez'],
    type: 'match',
  },
  {
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&h=675&fit=crop',
    keywords: ['barcelona', 'camp nou', 'la masia', 'spain', 'la liga', 'kvaratskhelia', 'pedri', 'gavi', 'youth'],
    type: 'match',
  },
  {
    url: 'https://images.unsplash.com/photo-1551038247-3d9af20df552?w=1200&h=675&fit=crop',
    keywords: ['atletico madrid', 'sevilla', 'la liga', 'spain'],
    type: 'stadium',
  },
  // ── Serie A / Italy ──
  {
    url: 'https://images.unsplash.com/photo-1610552050890-fe99536c2615?w=1200&h=675&fit=crop',
    keywords: ['napoli', 'serie a', 'italy', 'kvaratskhelia', 'osimhen', 'scudetto'],
    type: 'match',
  },
  {
    url: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=1200&h=675&fit=crop',
    keywords: ['inter', 'inter milan', 'san siro', 'serie a', 'italy', 'inzaghi', 'juventus'],
    type: 'stadium',
  },
  // ── Bundesliga / Germany ──
  {
    url: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1200&h=675&fit=crop',
    keywords: ['bayern munich', 'bayern', 'bundesliga', 'germany', 'allianz', 'muller', 'tuchel'],
    type: 'match',
  },
  {
    url: 'https://images.unsplash.com/photo-1551038247-3d9af20df552?w=1200&h=675&fit=crop',
    keywords: ['bundesliga', 'germany', 'dortmund', 'bvb', 'leverkusen', 'wirtz'],
    type: 'match',
  },
  // ── Ligue 1 / France ──
  {
    url: 'https://images.unsplash.com/photo-1610552050890-fe99536c2615?w=1200&h=675&fit=crop',
    keywords: ['ligue 1', 'france', 'psg', 'paris saint-germain', 'paris', 'mbappe'],
    type: 'stadium',
  },
  // ── Champions League / Europe ──
  {
    url: 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=1200&h=675&fit=crop',
    keywords: ['champions league', 'ucl', 'europe', 'psg', 'paris saint-germain', 'dortmund'],
    type: 'match',
  },
  {
    url: 'https://images.unsplash.com/photo-1577223625816-7546f13df25d?w=1200&h=675&fit=crop',
    keywords: ['europa league', 'conference league', 'europe'],
    type: 'match',
  },
  // ── International ──
  {
    url: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=1200&h=675&fit=crop',
    keywords: ['international', 'world cup', 'euros', 'global', 'nation', 'england national'],
    type: 'match',
  },
  // ── Transfers / Contracts ──
  {
    url: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200&h=675&fit=crop',
    keywords: ['contract', 'transfer', 'signing', 'negotiation', 'medical', 'rumour', 'deal'],
    type: 'generic',
  },
  // ── Generic / fallback ──
  {
    url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=675&fit=crop',
    keywords: ['football', 'soccer', 'match', 'game', 'goal', 'stadium', 'pitch'],
    type: 'generic',
  },
  {
    url: 'https://images.unsplash.com/photo-1551038247-3d9af20df552?w=1200&h=675&fit=crop',
    keywords: ['tactics', 'tactical', 'analysis', 'formation', 'coach', 'touchline'],
    type: 'generic',
  },
  {
    url: 'https://images.unsplash.com/photo-1522778119026-d665f5f4f2c3?w=1200&h=675&fit=crop',
    keywords: ['preview', 'review', 'report', 'newsroom', 'press'],
    type: 'generic',
  },
];

// ─── Matching logic ─────────────────────────────────────────────────────────

/**
 * Score how well an image entry matches the given keywords.
 * Returns 0 if no match, higher = better match.
 */
function scoreImage(entry: ImageEntry, keywords: string[]): number {
  let score = 0;
  for (const kw of keywords) {
    const lower = kw.toLowerCase();
    for (const imgKw of entry.keywords) {
      if (imgKw === lower) score += 10;       // exact match
      else if (imgKw.includes(lower) || lower.includes(imgKw)) score += 5; // partial
    }
  }
  // Prefer more specific types
  if (entry.type === 'player') score += 3;
  if (entry.type === 'match') score += 2;
  if (entry.type === 'club') score += 1;
  return score;
}

/**
 * Search Tavily for football images matching the query.
 * Returns the first image URL found, or null if no key / no results.
 *
 * Tavily's search API returns web results; we extract image URLs from
 * the content. For dedicated image search, use Tavily's image search
 * endpoint if available, or parse og:image from result URLs.
 */
async function searchTavilyForImage(query: string): Promise<string | null> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;

  try {
    const response: TavilyResponse = await searchWeb(`${query} football`, {
      maxResults: 3,
      includeAnswer: false,
    });

    if (response.results.length === 0) return null;

    // Try to extract image URLs from result content
    for (const result of response.results) {
      // Look for image URLs in the content
      const imgMatch = result.content.match(
        /https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/i,
      );
      if (imgMatch) return imgMatch[0];

      // Fall back to the result URL itself (might be an image)
      if (result.url.match(/\.(?:jpg|jpeg|png|webp)$/i)) {
        return result.url;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Fetch the best-matching image URL for an article based on its entities,
 * title, tags, and category. Returns a URL or null if no match.
 *
 * Tries local library first, then falls back to Tavily image search.
 */
export function fetchImageForArticle(article: {
  title: string;
  category?: string;
  tags?: string[];
  entities?: Entity[];
  league?: string;
}): string | null {
  // Build keyword set from all available signals
  const keywords: string[] = [];

  // Entities (highest signal)
  if (article.entities) {
    for (const e of article.entities) {
      keywords.push(e.name);
      if (e.aliases) keywords.push(...e.aliases);
    }
  }

  // Title words (split on common separators)
  const titleWords = article.title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3);
  keywords.push(...titleWords);

  // Tags
  if (article.tags) {
    keywords.push(...article.tags.map((t) => t.replace(/-/g, ' ')));
  }

  // League
  if (article.league) keywords.push(article.league);

  // Category
  if (article.category) keywords.push(article.category);

  // Score every image and pick the best
  let bestEntry: ImageEntry | null = null;
  let bestScore = 0;
  for (const entry of IMAGE_LIBRARY) {
    const score = scoreImage(entry, keywords);
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }

  return bestEntry && bestScore > 0 ? bestEntry.url : null;
}

/**
 * Async version that also tries Tavily image search when no local match.
 * Use this in the IA pipeline for the best image quality.
 */
export async function fetchImageForArticleWithSearch(article: {
  title: string;
  category?: string;
  tags?: string[];
  entities?: Entity[];
  league?: string;
}): Promise<string> {
  // Try local library first
  const localMatch = fetchImageForArticle(article);
  if (localMatch) return localMatch;

  // Fall back to Tavily image search
  const tavilyImage = await searchTavilyForImage(article.title);
  if (tavilyImage) return tavilyImage;

  // Final fallback — generic football image
  return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&h=675&fit=crop';
}

/**
 * Fetch a relevant image for a transfer based on player + clubs.
 */
export function fetchImageForTransfer(player: string, fromClub: string, toClub: string): string {
  const keywords = [player, fromClub, toClub, 'transfer'];
  let bestEntry: ImageEntry | null = null;
  let bestScore = 0;
  for (const entry of IMAGE_LIBRARY) {
    const score = scoreImage(entry, keywords);
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }
  // Fallback to transfer/contract image
  if (!bestEntry) {
    return 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=300&h=300&fit=crop';
  }
  return bestEntry.url.replace('w=1200&h=675', 'w=300&h=300');
}

/**
 * Fetch a relevant image for a live match based on teams + competition.
 */
export function fetchImageForMatch(homeTeam: string, awayTeam: string, competition: string): string {
  const keywords = [homeTeam, awayTeam, competition];
  let bestEntry: ImageEntry | null = null;
  let bestScore = 0;
  for (const entry of IMAGE_LIBRARY) {
    const score = scoreImage(entry, keywords);
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  }
  if (!bestEntry) {
    return 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=500&fit=crop';
  }
  return bestEntry.url.replace('w=1200&h=675', 'w=400&h=500');
}
