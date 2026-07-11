import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero, StatCard } from '@/components/premium';
import { SITE_STATS } from '@/lib/mockData';
import { formatNumber } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About Qawla — Our mission, values & editorial process',
  description: 'Qawla is a reader-funded, independent football newsroom. Learn about our mission, editorial values, and the five-stage editorial pipeline behind every story.',
  alternates: { canonical: '/about' },
};

const VALUES = [
  { title: 'Accuracy above speed', desc: 'We will hold a story rather than publish unverified. The confidence score is public — always.' },
  { title: 'Independence', desc: 'Reader-funded, not club-sponsored. No editorial pressure from the subjects of our coverage.' },
  { title: 'Transparency', desc: 'Every story links to its sources. Every confidence score shows its breakdown. Every donor count is public.' },
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
        variant="dark"
      />

      {/* Mission */}
      <section className="py-12 sm:py-16 lg:py-20" aria-labelledby="mission-heading">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 id="mission-heading" className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-night leading-tight">
            Our mission
          </h2>
          <div className="mt-6 prose-qawla">
            <p>
              Football is the most covered sport on earth — and the most poorly covered. The cycle rewards speed over accuracy, clicks over depth, and rumour over fact. Readers deserve better.
            </p>
            <p>
              Qawla exists to prove that premium football journalism can be both rigorous and accessible. We extend our editorial team, but to extend them — to verify faster, to analyse deeper, and to make the editorial process transparent. Every story carries a confidence score. Every claim links to its source. Every reader can see how the sausage is made.
            </p>
            <p>
              We are independent. We are reader-funded. We are committed to the slow, difficult work of getting football right.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-10 sm:py-14 bg-cream" aria-label="Newsroom stats">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
            <StatCard label="Articles published" value={SITE_STATS.publishedArticles} variant="pitch" />
            <StatCard label="Sources monitored" value={SITE_STATS.activeSources} variant="gold" />
            <StatCard label="Reader supporters" value={SITE_STATS.totalDonors} variant="night" />
            <StatCard label="Avg confidence" value={SITE_STATS.avgConfidence} suffix="%" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-12 sm:py-16 lg:py-20" aria-labelledby="values-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="values-heading" className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-night mb-10 text-center">
            What we stand for
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {VALUES.map((v) => (
              <div key={v.title} className="card p-5 sm:p-6">
                <div className="w-10 h-10 rounded-xl bg-pitch/10 text-pitch-dk flex items-center justify-center mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <h3 className="font-display font-bold text-lg text-night mb-2">{v.title}</h3>
                <p className="text-sm text-night/70 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Editorial pipeline */}
      <section className="py-12 sm:py-16 lg:py-20 night-gradient pitch-pattern text-cream" aria-labelledby="pipeline-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="badge bg-white/10 text-pitch backdrop-blur mb-3">How we work</span>
            <h2 id="pipeline-heading" className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-cream">
              The five-stage editorial pipeline
            </h2>
            <p className="mt-3 text-cream/70 max-w-2xl mx-auto">
              Every story passes through five editorial stages before it reaches you. Each has a distinct role — and a distinct personality.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {PIPELINE.map((stage, i) => (
              <div key={stage.step} className="relative glass rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="w-9 h-9 rounded-full pitch-gradient text-white font-display font-extrabold flex items-center justify-center">
                    {stage.step}
                  </span>
                  <div>
                    <h3 className="font-display font-bold text-cream">{stage.name}</h3>
                    <p className="text-xs text-cream/60">{stage.role}</p>
                  </div>
                </div>
                <p className="text-sm text-cream/70 leading-relaxed">{stage.desc}</p>
                {i < PIPELINE.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 text-cream/30">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How we score transfers */}
      <section className="py-12 sm:py-16 lg:py-20 bg-cream" aria-labelledby="scoring-heading">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="badge bg-pitch/10 text-pitch-dk mb-3">Confidence scoring</span>
            <h2 id="scoring-heading" className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-night">
              How we score transfers
            </h2>
            <p className="mt-3 text-night/70 max-w-2xl mx-auto">
              Every transfer rumour receives a confidence score from 0-100. Here is what each range means — and how we calculate it.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-10">
            {[
              { range: '85-100', label: 'Verified', desc: 'Multiple tier-1 sources, official confirmation likely', color: 'bg-emerald-500' },
              { range: '70-84', label: 'Likely', desc: 'Strong sourcing, expect confirmation soon', color: 'bg-lime-500' },
              { range: '55-69', label: 'Unverified', desc: 'Insufficient corroboration, treat with caution', color: 'bg-amber-500' },
              { range: '35-54', label: 'Disputed', desc: 'Conflicting reports, escalation required', color: 'bg-orange-500' },
              { range: '0-34', label: 'Rejected', desc: 'Below threshold, will not be published', color: 'bg-red-500' },
            ].map((item) => (
              <div key={item.label} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="font-bold text-night">{item.label}</span>
                  <span className="text-xs text-night/50 ml-auto font-mono">{item.range}</span>
                </div>
                <p className="text-xs text-night/60 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <div className="card p-6 max-w-3xl mx-auto">
            <h3 className="font-display font-bold text-lg text-night mb-4">The formula</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-night/80 font-medium">Source tier (official vs. rumour mill)</span>
                <span className="font-bold text-pitch-dk">40%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-night/80 font-medium">Cross-reference count (independent sources)</span>
                <span className="font-bold text-pitch-dk">30%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-night/80 font-medium">Entity match (named players, clubs, competitions)</span>
                <span className="font-bold text-pitch-dk">20%</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <span className="text-night/80 font-medium">Historical source accuracy</span>
                <span className="font-bold text-pitch-dk">10%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16 lg:py-20" aria-labelledby="join-heading">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 id="join-heading" className="font-display font-extrabold text-3xl sm:text-4xl text-night">
            Join {formatNumber(SITE_STATS.totalDonors)} readers backing Qawla
          </h2>
          <p className="mt-4 text-night/70 max-w-xl mx-auto">
            Independent journalism needs independent backers. If you value what we do, support us with any amount.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/donate" className="btn-primary justify-center">Support Qawla</Link>
            <Link href="/contact" className="btn-secondary justify-center">Get in touch</Link>
          </div>
        </div>
      </section>
    </>
  );
}
