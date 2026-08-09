import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, StatCard } from '@/components/premium';
import { Reveal, StaggerContainer, StaggerItem } from '@/components/motion';
import { SITE_STATS } from '@/lib/mockData';
import { formatNumber } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About Qawla — Our mission, values & editorial process',
  description: 'Qawla is a reader-funded, independent football newsroom. Learn about our mission, editorial values, and the five-stage editorial pipeline behind every story.',
  alternates: { canonical: '/about' },
};

const VALUES = [
  { title: 'Accuracy above speed', desc: 'We will hold a story rather than publish unverified. Every claim is sourced — always.' },
  { title: 'Independence', desc: 'Reader-funded, not club-sponsored. No editorial pressure from the subjects of our coverage.' },
  { title: 'Transparency', desc: 'Every story links to its sources. Every claim is traceable. Every donor count is public.' },
  { title: 'Depth over noise', desc: 'We do not chase the news cycle. We chase understanding — tactical, contextual, human.' },
  { title: 'Respect for the reader', desc: 'No clickbait. No SEO-engineered headlines. No intrusive ads. We treat your attention as sacred.' },
  { title: 'Diversity of voice', desc: 'The global game deserves global coverage. We cover women\'s football, lower leagues, and emerging markets with the same rigor as the Champions League.' },
];

const PIPELINE = [
  { step: '1', name: 'Scout', role: 'Intake & triage', desc: 'Ingests RSS feeds, official APIs, and credentialed social sources. Deduplicates, ranks by signal strength, extracts entities.' },
  { step: '2', name: 'Fact-checker', role: 'Verification', desc: 'Decomposes the story into atomic claims. Cross-references each claim against multiple sources. Flags contradictions explicitly.' },
  { step: '3', name: 'Analyst', role: 'Tactical depth', desc: 'Produces formation breakdowns, pressing schemes, key battles, and statistical insights. Only invoked for analysis content.' },
  { step: '4', name: 'Writer', role: 'Prose', desc: 'Turns verified intelligence into publication-ready Markdown. Vivid leads, precise language, sourced claims.' },
  { step: '5', name: 'Editor', role: 'Final gate', desc: 'Structural edit, headline sharpening, SEO metadata, house-style enforcement. Makes the publish/no-publish call.' },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Qawla"
        title="A newsroom engineered for"
        highlight="accuracy."
        description="Qawla is a reader-funded, independent football newsroom. Every story passes through a five-stage editorial pipeline — scout, fact-checker, analyst, writer, editor — before it reaches you."
        variant="light"
      />

      {/* Mission */}
      <section className="py-12 sm:py-16 lg:py-20" aria-labelledby="mission-heading">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 id="mission-heading" className="heading-serif text-3xl sm:text-4xl lg:text-5xl text-night">
              Our mission
            </h2>
            <div className="mt-6 prose-qawla">
              <p>
                Football is the most covered sport on earth — and the most poorly covered. The cycle rewards speed over accuracy, clicks over depth, and rumour over fact. Readers deserve better.
              </p>
              <p>
                Qawla exists to prove that premium football journalism can be both rigorous and accessible. We extend our editorial team, but to extend them — to verify faster, to analyse deeper, and to make the editorial process transparent. Every claim links to its source. Every reader can see how the sausage is made.
              </p>
              <p>
                We are independent. We are reader-funded. We are committed to the slow, difficult work of getting football right.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 sm:py-14 bg-cream" aria-label="Newsroom stats">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <StatCard label="Articles published" value={SITE_STATS.publishedArticles} variant="pitch" />
            <StatCard label="Sources monitored" value={SITE_STATS.activeSources} variant="gold" />
            <StatCard label="Reader supporters" value={SITE_STATS.totalDonors} variant="night" />
            <StatCard label="Editorial stages" value={5} variant="pitch" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 sm:py-16 lg:py-20" aria-labelledby="values-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-10">
            <h2 id="values-heading" className="heading-serif text-3xl sm:text-4xl lg:text-5xl text-night">
              What we stand for
            </h2>
          </Reveal>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6" stagger={0.1}>
            {VALUES.map((v) => (
              <StaggerItem key={v.title}>
                <div className="card p-5 sm:p-6 h-full">
                  <div className="w-10 h-10 rounded-xl bg-pitch/10 text-pitch-dk flex items-center justify-center mb-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-lg text-night mb-2">{v.title}</h3>
                  <p className="text-sm text-night/70 leading-relaxed">{v.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Editorial pipeline */}
      <section className="relative py-12 sm:py-16 lg:py-20 bg-white pitch-pattern-light text-night overflow-hidden" aria-labelledby="pipeline-heading">
        {/* Faint tactics-board background for texture */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04] bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: 'url(/images/tactics-board.jpg)' }}
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-10">
            <span className="badge bg-pitch/10 text-pitch-dk mb-3">How we work</span>
            <h2 id="pipeline-heading" className="heading-serif text-3xl sm:text-4xl lg:text-5xl text-night">
              The five-stage editorial pipeline
            </h2>
            <p className="mt-3 text-night/65 max-w-2xl mx-auto">
              Every story passes through five editorial stages before it reaches you. Each has a distinct role — and a distinct personality.
            </p>
          </Reveal>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4" stagger={0.1}>
            {PIPELINE.map((stage, i) => (
              <StaggerItem key={stage.step}>
                <div className="relative bg-cream border border-black/5 shadow-sm hover:shadow-xl transition-all rounded-2xl p-5 h-full">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="w-9 h-9 rounded-full pitch-gradient text-white font-display font-extrabold flex items-center justify-center">
                      {stage.step}
                    </span>
                    <div>
                      <h3 className="font-display font-bold text-night">{stage.name}</h3>
                      <p className="text-xs text-night/55">{stage.role}</p>
                    </div>
                  </div>
                  <p className="text-sm text-night/65 leading-relaxed">{stage.desc}</p>
                  {i < PIPELINE.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 text-night/30">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </div>
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 lg:py-20" aria-labelledby="join-heading">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <h2 id="join-heading" className="heading-serif text-3xl sm:text-4xl text-night">
              Join {formatNumber(SITE_STATS.totalDonors)} readers backing Qawla
            </h2>
            <p className="mt-4 text-night/70 max-w-xl mx-auto">
              Independent journalism needs independent backers. If you value what we do, support us with any amount.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/donate" className="btn-primary justify-center">Support Qawla</Link>
              <Link href="/contact" className="btn-secondary justify-center">Get in touch</Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
