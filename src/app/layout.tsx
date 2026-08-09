import type { Metadata, Viewport } from 'next';
import { Archivo, Archivo_Black } from "next/font/google";
import { Header } from '@/components/Header';
import { AdSlot } from '@/components/AdSlot';
import { Footer } from '@/components/Footer';
import { Analytics } from '@/components/Analytics';
import { WebVitals } from '@/components/WebVitals';
import { ToastProvider } from '@/components/Toast';
import { I18nProvider } from '@/components/I18nProvider';
import { ScrollToTop } from '@/components/ScrollToTop';
import './globals.css';

// Broadcast-graphics identity: condensed heavy display + workhorse grotesque body.
// Reduced weights to avoid Cloudflare Worker resource limits (Error 1102).
const archivoBlack = Archivo_Black({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
});

const archivo = Archivo({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600", "700", "900"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://qawla.com';
const SITE_NAME = 'Qawla';
const SITE_DESCRIPTION = 'Premium football news, transfers, tactical analysis, and live match commentary — verified by an editorial team.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Football news, transfers, tactical analysis`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'football news', 'soccer news', 'transfers', 'tactical analysis',
    'Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Champions League',
    'live scores', 'football journalism',
  ],
  authors: [{ name: 'Qawla Editorial', url: SITE_URL }],
  creator: 'Qawla',
  publisher: 'Qawla',
  applicationName: SITE_NAME,
  category: 'Sports',
  alternates: {
    canonical: '/',
    types: {
      'application/rss+xml': [{ url: '/feed.xml', title: 'Qawla RSS Feed' }],
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Premium football journalism`,
    description: SITE_DESCRIPTION,
    images: [{ url: '/og-default.png', width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Football news, transfers, tactical analysis`,
    description: SITE_DESCRIPTION,
    creator: '@qawla',
    images: ['/og-default.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f5f5f2' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0c' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'NewsMediaOrganization',
  name: SITE_NAME,
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.svg`,
  description: SITE_DESCRIPTION,
  sameAs: [
    'https://x.com/qawla',
    'https://facebook.com/qawla',
    'https://instagram.com/qawla',
    'https://youtube.com/@qawla',
  ],
  publishingPrinciples: `${SITE_URL}/about`,
  actionableFeedbackPolicy: `${SITE_URL}/contact`,
  diversityPolicy: `${SITE_URL}/about`,
  ethicsPolicy: `${SITE_URL}/about`,
  masthead: `${SITE_URL}/about`,
  missionCoveragePrioritiesPolicy: `${SITE_URL}/about`,
  verificationFactCheckingPolicy: `${SITE_URL}/about`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${archivoBlack.variable} ${archivo.variable} min-h-screen flex flex-col bg-cream text-night antialiased`}>
        <I18nProvider>
          <ToastProvider>
            <a
              href="#main-content"
              className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:px-4 focus:py-2 focus:bg-pitch focus:text-white focus:rounded-lg"
            >
              Skip to content
            </a>
            <Header />
            <AdSlot />
            <main id="main-content" className="flex-1">
              {children}
            </main>
            <Footer />
            <ScrollToTop />
            <Analytics />
            <WebVitals />
          </ToastProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
