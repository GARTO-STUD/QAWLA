// Qawla — Central domain types
// Football news, transfers, tactical analysis, live commentary platform

/* ----------------------------------------------------------------------------
 * Articles & editorial
 * -------------------------------------------------------------------------- */

export type ArticleStatus = 'draft' | 'in_review' | 'fact_checking' | 'published' | 'archived' | 'rejected';
export type ArticleCategory =
  | 'news'
  | 'transfers'
  | 'previews'
  | 'reviews'
  | 'tactical'
  | 'opinion'
  | 'live'
  | 'youth'
  | 'international';

export type ContentType = 'news' | 'blog' | 'analysis' | 'live' | 'transfer';

export interface Author {
  id: string;
  name: string;
  handle: string;
  role: 'scout' | 'analyst' | 'writer' | 'editor' | 'human';
  avatarUrl?: string;
  bio?: string;
}

export interface Entity {
  id: string;
  name: string;
  type: 'player' | 'club' | 'manager' | 'competition' | 'nation' | 'official';
  aliases?: string[];
  wikidataId?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  excerpt: string;
  content: string; // Markdown
  html?: string;
  coverImage?: string;
  category: ArticleCategory;
  tags: string[];
  contentType: ContentType;
  status: ArticleStatus;
  author: Author;
  entities: Entity[];
  league?: string;
  featured: boolean;
  trending: boolean;
  readingTimeMinutes: number;
  viewCount: number;
  shareCount: number;
  publishedAt: string; // ISO
  updatedAt: string; // ISO
  createdAt: string; // ISO
  confidence?: ConfidenceResult;
  sourceIds?: string[];
  ogImage?: string;
}

/* ----------------------------------------------------------------------------
 * Ingestion & raw events
 * -------------------------------------------------------------------------- */

export type SourceTier = 'tier1' | 'tier2' | 'tier3' | 'social' | 'official';
export type SourceType = 'rss' | 'api' | 'social' | 'press_release' | 'official_site';

export interface CredibilitySource {
  id: string;
  name: string;
  url: string;
  tier: SourceTier;
  type: SourceType;
  reliabilityScore: number; // 0..1 historical accuracy
  feedUrl?: string;
  language: 'en';
  active: boolean;
  lastPolledAt?: string;
}

export interface RawEvent {
  id: string;
  sourceId: string;
  sourceName: string;
  sourceTier: SourceTier;
  headline: string;
  summary?: string;
  body?: string;
  url: string;
  publishedAt: string;
  image?: string;
  language: 'en';
  entities: Entity[];
  tags: string[];
  category?: ArticleCategory;
  rawHash: string; // dedupe key
  ingestedAt: string;
  crossReferences?: string[]; // other source ids confirming
}

/* ----------------------------------------------------------------------------
 * AI agents & pipeline
 * -------------------------------------------------------------------------- */

export type AgentName = 'scout' | 'factCheck' | 'analyst' | 'writer' | 'editor' | 'guardian';
export type AgentStatus = 'pending' | 'running' | 'completed' | 'failed' | 'skipped';

export interface AgentResult {
  agent: AgentName;
  status: AgentStatus;
  startedAt: string;
  completedAt?: string;
  durationMs: number;
  tokensIn?: number;
  tokensOut?: number;
  model?: string;
  provider?: 'nvidia' | 'groq' | 'gemini' | 'fallback';
  output?: unknown;
  error?: string;
  confidenceContribution?: number;
}

export type JobStage =
  | 'ingest'
  | 'scout'
  | 'fact_check'
  | 'analyst'
  | 'writer'
  | 'editor'
  | 'publish'
  | 'complete';

export interface PipelineJob {
  id: string;
  stage: JobStage;
  status: AgentStatus;
  trigger: 'cron' | 'manual' | 'webhook';
  rawEventId?: string;
  articleId?: string;
  agentResults: AgentResult[];
  confidence?: ConfidenceResult;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}

/* ----------------------------------------------------------------------------
 * Confidence scoring
 * -------------------------------------------------------------------------- */

export interface ConfidenceBreakdown {
  sourceTier: number; // weighted 0.4
  crossReference: number; // weighted 0.3
  entityMatch: number; // weighted 0.2
  historical: number; // weighted 0.1
}

export type DecisionLabel = 'verified' | 'likely' | 'unverified' | 'disputed' | 'rejected';

export interface ConfidenceResult {
  score: number; // 0..100
  label: DecisionLabel;
  breakdown: ConfidenceBreakdown;
  rationale: string;
  decision: 'publish' | 'hold' | 'reject' | 'escalate';
  evaluatedAt: string;
}

/* ----------------------------------------------------------------------------
 * Live matches & SSE
 * -------------------------------------------------------------------------- */

export type MatchStatus = 'scheduled' | 'live' | 'halftime' | 'finished' | 'postponed' | 'cancelled';
export type LiveEventType = 'kickoff' | 'goal' | 'yellow_card' | 'red_card' | 'substitution'
  | 'penalty' | 'var' | 'halftime' | 'fulltime' | 'chance' | 'commentary' | 'injury';

export interface LiveMatch {
  id: string;
  competition: string;
  season: string;
  matchday?: string;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  homeScore: number;
  awayScore: number;
  status: MatchStatus;
  minute?: number;
  kickoffAt: string;
  venue?: string;
  referee?: string;
  attendance?: number;
}

export interface TeamInfo {
  id: string;
  name: string;
  shortName: string;
  crest?: string;
  formation?: string;
  manager?: string;
}

export interface LiveEvent {
  id: string;
  matchId: string;
  type: LiveEventType;
  minute: number;
  team?: 'home' | 'away' | 'neutral';
  player?: string;
  description: string;
  detail?: string;
  timestamp: string;
}

/* ----------------------------------------------------------------------------
 * Transfers
 * -------------------------------------------------------------------------- */

export type TransferStatus = 'rumour' | 'negotiating' | 'agreed' | 'medical' | 'signed' | 'rejected' | 'loan';
export type TransferType = 'permanent' | 'loan' | 'free_transfer' | 'release_clause';

export interface Transfer {
  id: string;
  player: Entity;
  fromClub: Entity;
  toClub: Entity;
  fee?: number;
  currency: string;
  type: TransferType;
  status: TransferStatus;
  confidence: ConfidenceResult;
  window: string; // e.g. "Summer 2025"
  reportedAt: string;
  sources: CredibilitySource[];
  contractLength?: string;
  wage?: string;
}

/* ----------------------------------------------------------------------------
 * Search & API
 * -------------------------------------------------------------------------- */

export interface SearchResult {
  id: string;
  type: ContentType;
  title: string;
  excerpt: string;
  url: string;
  coverImage?: string;
  publishedAt: string;
  score: number;
  highlights: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

/* ----------------------------------------------------------------------------
 * Donations & checkout
 * -------------------------------------------------------------------------- */

export interface DonateTier {
  id: string;
  name: string;
  amount: number;
  currency: string;
  interval: 'one_time' | 'monthly' | 'yearly';
  description: string;
  perks: string[];
  variantId: string;
  popular?: boolean;
}

export interface CheckoutSession {
  id: string;
  url: string;
  tierId: string;
  amount: number;
  currency: string;
  createdAt: string;
  expiresAt: string;
}

export interface Donor {
  id: string;
  email: string;
  name?: string;
  totalContributed: number;
  currency: string;
  tier?: string;
  since: string;
}

/* ----------------------------------------------------------------------------
 * Admin & auth
 * -------------------------------------------------------------------------- */

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'contributor';
  createdAt: string;
  lastLoginAt?: string;
}

export interface AdminSession {
  token: string;
  userId: string;
  email: string;
  name: string;
  role: AdminUser['role'];
  expiresAt: number;
  issuedAt: number;
}

/* ----------------------------------------------------------------------------
 * Analytics
 * -------------------------------------------------------------------------- */

export interface WebVitalsMetric {
  name: 'CLS' | 'LCP' | 'FID' | 'INP' | 'TTFB' | 'FCP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  pathname: string;
  timestamp: number;
}

export interface SiteStats {
  totalArticles: number;
  publishedArticles: number;
  totalTransfers: number;
  liveMatches: number;
  totalDonors: number;
  totalRaised: number;
  avgConfidence: number;
  pipelineJobs: number;
  activeSources: number;
}
