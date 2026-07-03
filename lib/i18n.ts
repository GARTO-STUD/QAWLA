/**
 * lib/i18n.ts — Multi-language support for Qawla
 *
 * Supported languages: English (en), Spanish (es), French (fr), Arabic (ar)
 *
 * Usage in client components:
 *   const { t, locale, setLocale } = useI18n();
 *   <h1>{t('home.title')}</h1>
 *
 * Usage in server components:
 *   import { getTranslations } from '@/lib/i18n';
 *   const t = getTranslations('en');
 *   <h1>{t('home.title')}</h1>
 */

export type Locale = 'en' | 'es' | 'fr' | 'ar';

export const LOCALES: Locale[] = ['en', 'es', 'fr', 'ar'];

export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  ar: 'العربية',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  es: '🇪🇸',
  fr: '🇫🇷',
  ar: '🇸🇦',
};

// ─── Translation dictionary ─────────────────────────────────────────────────

type TranslationKey =
  // Navigation
  | 'nav.home' | 'nav.news' | 'nav.live' | 'nav.transfers' | 'nav.blog'
  | 'nav.about' | 'nav.support' | 'nav.search'
  // Homepage
  | 'home.badge' | 'home.title' | 'home.title_highlight'
  | 'home.description' | 'home.browse_news' | 'home.live_matches'
  | 'home.stats_sources' | 'home.stats_coverage' | 'home.stats_stages' | 'home.stats_independent'
  | 'home.why_title' | 'home.why_subtitle' | 'home.latest_news' | 'home.view_all'
  | 'home.leagues_title' | 'home.support_title' | 'home.support_desc' | 'home.support_btn'
  // Features
  | 'feature.verified' | 'feature.verified_desc'
  | 'feature.realtime' | 'feature.realtime_desc'
  | 'feature.tactical' | 'feature.tactical_desc'
  | 'feature.scoring' | 'feature.scoring_desc'
  // Footer
  | 'footer.newsletter_title' | 'footer.newsletter_desc' | 'footer.subscribe'
  | 'footer.explore' | 'footer.club' | 'footer.legal' | 'footer.independent'
  | 'footer.ad_free' | 'footer.realtime' | 'footer.rights'
  // Common
  | 'common.loading' | 'common.error' | 'common.try_again' | 'common.back_home'
  | 'common.search_placeholder' | 'common.no_results' | 'common.read_more'
  | 'common.published' | 'common.views' | 'common.confidence' | 'common.tags'
  | 'common.related_stories' | 'common.share' | 'common.copy_link';

type Translations = Record<TranslationKey, string>;

const en: Translations = {
  'nav.home': 'Home',
  'nav.news': 'News',
  'nav.live': 'Live',
  'nav.transfers': 'Transfers',
  'nav.blog': 'Blog',
  'nav.about': 'About',
  'nav.support': 'Support',
  'nav.search': 'Search',
  'home.badge': 'Multi-Source Verified Football News',
  'home.title': 'Every story,',
  'home.title_highlight': 'verified before published',
  'home.description': 'Qawla is your trusted source for football news, transfer rumors, tactical analysis, and live match commentary. We cross-reference every story with multiple independent sources before publication.',
  'home.browse_news': 'Browse News',
  'home.live_matches': 'Live Matches',
  'home.stats_sources': 'Sources Tracked',
  'home.stats_coverage': 'Live Coverage',
  'home.stats_stages': 'Verification Stages',
  'home.stats_independent': 'Independent',
  'home.why_title': 'Built different. Built better.',
  'home.why_subtitle': "We don't just republish press releases. Every story goes through a rigorous multi-stage verification process before it reaches you.",
  'home.latest_news': 'Latest News',
  'home.view_all': 'View all',
  'home.leagues_title': 'Every major league covered',
  'home.support_title': 'Support independent football journalism',
  'home.support_desc': 'Qawla is reader-supported. No paywalls. No invasive ads. Help us keep the lights on and the news flowing.',
  'home.support_btn': 'Support Qawla',
  'feature.verified': 'Verified Sources',
  'feature.verified_desc': 'Every story cross-referenced with multiple independent sources before publication.',
  'feature.realtime': 'Real-time Updates',
  'feature.realtime_desc': 'Breaking news, transfer whispers, and live match commentary as it happens.',
  'feature.tactical': 'Tactical Analysis',
  'feature.tactical_desc': 'Formations, xG, possession stats, and tactical breakdowns for every big match.',
  'feature.scoring': 'Transfer Rumor Scoring',
  'feature.scoring_desc': 'Confidence score for every transfer rumor — never get fooled by clickbait again.',
  'footer.newsletter_title': 'Never miss a story',
  'footer.newsletter_desc': 'Get the biggest football news, transfer whispers, and tactical breakdowns in your inbox. Weekly digest. No spam, ever.',
  'footer.subscribe': 'Subscribe',
  'footer.explore': 'Explore',
  'footer.club': 'Club',
  'footer.legal': 'Legal',
  'footer.independent': 'Verified Sources',
  'footer.ad_free': 'Independent & Ad-free',
  'footer.realtime': 'Real-time Coverage',
  'footer.rights': 'All rights reserved.',
  'common.loading': 'Loading...',
  'common.error': 'Something went wrong',
  'common.try_again': 'Try again',
  'common.back_home': 'Homepage',
  'common.search_placeholder': 'Search for players, teams, competitions...',
  'common.no_results': 'No results found',
  'common.read_more': 'Read More',
  'common.published': 'Published',
  'common.views': 'views',
  'common.confidence': 'Confidence',
  'common.tags': 'Tags',
  'common.related_stories': 'Related Stories',
  'common.share': 'Share',
  'common.copy_link': 'Copy link',
};

const es: Translations = {
  'nav.home': 'Inicio',
  'nav.news': 'Noticias',
  'nav.live': 'En Vivo',
  'nav.transfers': 'Fichajes',
  'nav.blog': 'Blog',
  'nav.about': 'Acerca de',
  'nav.support': 'Apoyar',
  'nav.search': 'Buscar',
  'home.badge': 'Noticias de Fútbol Verificadas',
  'home.title': 'Cada historia,',
  'home.title_highlight': 'verificada antes de publicar',
  'home.description': 'Qawla es tu fuente confiable de noticias de fútbol, rumores de fichajes, análisis táctico y comentarios en vivo. Verificamos cada historia con múltiples fuentes independientes antes de publicarla.',
  'home.browse_news': 'Ver Noticias',
  'home.live_matches': 'Partidos en Vivo',
  'home.stats_sources': 'Fuentes Monitoreadas',
  'home.stats_coverage': 'Cobertura en Vivo',
  'home.stats_stages': 'Etapas de Verificación',
  'home.stats_independent': 'Independiente',
  'home.why_title': 'Diferente. Mejor.',
  'home.why_subtitle': 'No solo republicamos comunicados de prensa. Cada historia pasa por un riguroso proceso de verificación antes de llegar a ti.',
  'home.latest_news': 'Últimas Noticias',
  'home.view_all': 'Ver todo',
  'home.leagues_title': 'Cada liga importante cubierta',
  'home.support_title': 'Apoya el periodismo de fútbol independiente',
  'home.support_desc': 'Qawla es mantenido por lectores. Sin muros de pago. Sin anuncios invasivos. Ayúdanos a mantener las luces encendidas.',
  'home.support_btn': 'Apoyar a Qawla',
  'feature.verified': 'Fuentes Verificadas',
  'feature.verified_desc': 'Cada historia contrastada con múltiples fuentes independientes antes de publicar.',
  'feature.realtime': 'Actualizaciones en Tiempo Real',
  'feature.realtime_desc': 'Noticias de última hora, rumores de fichajes y comentarios en vivo.',
  'feature.tactical': 'Análisis Táctico',
  'feature.tactical_desc': 'Formaciones, xG, estadísticas de posesión y análisis táctico.',
  'feature.scoring': 'Puntuación de Rumores',
  'feature.scoring_desc': 'Puntuación de confianza para cada rumor de fichaje — nunca te engañen con clickbait.',
  'footer.newsletter_title': 'No te pierdas ninguna historia',
  'footer.newsletter_desc': 'Recibe las mejores noticias de fútbol, rumores de fichajes y análisis táctico en tu bandeja. Resumen semanal. Sin spam.',
  'footer.subscribe': 'Suscribirse',
  'footer.explore': 'Explorar',
  'footer.club': 'Club',
  'footer.legal': 'Legal',
  'footer.independent': 'Fuentes Verificadas',
  'footer.ad_free': 'Independiente y Sin Anuncios',
  'footer.realtime': 'Cobertura en Tiempo Real',
  'footer.rights': 'Todos los derechos reservados.',
  'common.loading': 'Cargando...',
  'common.error': 'Algo salió mal',
  'common.try_again': 'Intentar de nuevo',
  'common.back_home': 'Inicio',
  'common.search_placeholder': 'Buscar jugadores, equipos, competiciones...',
  'common.no_results': 'No se encontraron resultados',
  'common.read_more': 'Leer más',
  'common.published': 'Publicado',
  'common.views': 'vistas',
  'common.confidence': 'Confianza',
  'common.tags': 'Etiquetas',
  'common.related_stories': 'Historias Relacionadas',
  'common.share': 'Compartir',
  'common.copy_link': 'Copiar enlace',
};

const fr: Translations = {
  'nav.home': 'Accueil',
  'nav.news': 'Actualités',
  'nav.live': 'En Direct',
  'nav.transfers': 'Transferts',
  'nav.blog': 'Blog',
  'nav.about': 'À propos',
  'nav.support': 'Soutenir',
  'nav.search': 'Rechercher',
  'home.badge': 'Actualités Football Vérifiées',
  'home.title': 'Chaque histoire,',
  'home.title_highlight': 'vérifiée avant publication',
  'home.description': "Qawla est votre source de confiance pour l'actualité du football, les rumeurs de transferts, l'analyse tactique et les commentaires en direct. Nous vérifions chaque histoire auprès de plusieurs sources indépendantes avant publication.",
  'home.browse_news': 'Voir les Actualités',
  'home.live_matches': 'Matchs en Direct',
  'home.stats_sources': 'Sources Suivies',
  'home.stats_coverage': 'Couverture en Direct',
  'home.stats_stages': 'Étapes de Vérification',
  'home.stats_independent': 'Indépendant',
  'home.why_title': 'Différent. Meilleur.',
  'home.why_subtitle': "Nous ne nous contentons pas de republier des communiqués. Chaque histoire passe par un processus de vérification rigoureux avant de vous atteindre.",
  'home.latest_news': 'Dernières Actualités',
  'home.view_all': 'Voir tout',
  'home.leagues_title': 'Toutes les ligues majeures couvertes',
  'home.support_title': 'Soutenez le journalisme football indépendant',
  'home.support_desc': "Qawla est financé par les lecteurs. Pas de paywall. Pas de pubs intrusives. Aidez-nous à maintenir le project.",
  'home.support_btn': 'Soutenir Qawla',
  'feature.verified': 'Sources Vérifiées',
  'feature.verified_desc': 'Chaque histoire croisée avec plusieurs sources indépendantes avant publication.',
  'feature.realtime': 'Mises à jour en Temps Réel',
  'feature.realtime_desc': 'Dernières nouvelles, rumeurs de transferts et commentaires en direct.',
  'feature.tactical': 'Analyse Tactique',
  'feature.tactical_desc': 'Formations, xG, statistiques de possession et analyses tactiques.',
  'feature.scoring': 'Score des Rumeurs',
  'feature.scoring_desc': 'Score de confiance pour chaque rumeur de transfert — ne soyez plus dupé par le clickbait.',
  'footer.newsletter_title': 'Ne manquez aucune histoire',
  'footer.newsletter_desc': 'Recevez les meilleures actualités football, rumeurs de transferts et analyses tactiques. Résumé hebdomadaire. Sans spam.',
  'footer.subscribe': "S'abonner",
  'footer.explore': 'Explorer',
  'footer.club': 'Club',
  'footer.legal': 'Légal',
  'footer.independent': 'Sources Vérifiées',
  'footer.ad_free': 'Indépendant et Sans Pub',
  'footer.realtime': 'Couverture en Temps Réel',
  'footer.rights': 'Tous droits réservés.',
  'common.loading': 'Chargement...',
  'common.error': "Une erreur s'est produite",
  'common.try_again': 'Réessayer',
  'common.back_home': 'Accueil',
  'common.search_placeholder': 'Rechercher joueurs, équipes, compétitions...',
  'common.no_results': 'Aucun résultat trouvé',
  'common.read_more': 'Lire plus',
  'common.published': 'Publié',
  'common.views': 'vues',
  'common.confidence': 'Confiance',
  'common.tags': 'Tags',
  'common.related_stories': 'Articles Similaires',
  'common.share': 'Partager',
  'common.copy_link': 'Copier le lien',
};

const ar: Partial<Translations> = {
  'nav.home': 'الرئيسية',
  'nav.news': 'الأخبار',
  'nav.live': 'مباشر',
  'nav.transfers': 'الانتقالات',
  'nav.blog': 'المدونة',
  'nav.about': 'حول',
  'nav.support': 'ادعمنا',
  'nav.search': 'بحث',
  'home.badge': 'أخبار كرة القدم الموثقة',
  'home.title': 'كل قصة،',
  'home.title_highlight': 'موثقة قبل النشر',
  'home.description': 'قولة مصدرك الموثوق لأخبار كرة القدم، شائعات الانتقالات، التحليل التكتيكي، والتعليق المباشر. نتحقق من كل قصة بمصادر مستقلة متعددة قبل النشر.',
  'home.browse_news': 'تصفح الأخبار',
  'home.live_matches': 'المباريات المباشرة',
  'home.stats_sources': 'مصادر متابَعة',
  'home.stats_coverage': 'تغطية مباشرة',
  'home.stats_stages': 'مراحل التحقق',
  'home.stats_independent': 'مستقل',
  'home.why_title': 'مختلف. أفضل.',
  'home.why_subtitle': 'لا نعيد نشر البيانات الصحفية فقط. كل قصة تمر بعملية تحقق صارمة متعددة المراحل قبل أن تصل إليك.',
  'home.latest_news': 'آخر الأخبار',
  'home.view_all': 'عرض الكل',
  'home.leagues_title': 'كل الدوريات الكبرى مغطاة',
  'home.support_title': 'ادعم الصحافة الرياضية المستقلة',
  'home.support_desc': 'قولة مدعوم من القراء. لا جدران دفع. لا إعلانات مزعجة. ساعدنا على الاستمرار.',
  'home.support_btn': 'ادعم قولة',
  'common.loading': 'جاري التحميل...',
  'common.error': 'حدث خطأ ما',
  'common.try_again': 'حاول مرة أخرى',
  'common.back_home': 'الرئيسية',
};

// Fallback: Arabic uses English for missing keys
const TRANSLATIONS: Record<Locale, Translations> = {
  en,
  es,
  fr,
  ar: { ...en, ...ar } as Translations,
};

// ─── Server-side helper ─────────────────────────────────────────────────────

export function getTranslations(locale: Locale = 'en') {
  const dict = TRANSLATIONS[locale] || TRANSLATIONS.en;
  return function t(key: TranslationKey): string {
    return dict[key] ?? TRANSLATIONS.en[key] ?? key;
  };
}

// ─── Type exports ───────────────────────────────────────────────────────────

export type { TranslationKey };
export type TranslationFn = ReturnType<typeof getTranslations>;
