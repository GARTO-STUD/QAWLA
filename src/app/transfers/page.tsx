import type { Metadata } from 'next';
import { PageHero } from '@/components/premium';
import { AdBanner } from '@/components/AdBanner';
import { TRANSFERS } from '@/lib/mockData';
import { TransfersClient } from './TransfersClient';

export const metadata: Metadata = {
  title: 'Transfers — Verified transfer news & rumours',
  description: 'A visual transfer tracker with source transparency, live filtering and market intelligence.',
  alternates: { canonical: '/transfers' },
};

export default function TransfersPage() {
  return (
    <>
      <PageHero
        eyebrow="Transfer intelligence"
        title="The market,"
        highlight="decoded."
        description="Track every move from first rumour to completed deal. Search players, compare destinations and see the status of the market at a glance."
        variant="light"
      />
      <TransfersClient transfers={TRANSFERS} />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <AdBanner slot="transfers-bottom" format="horizontal" />
      </div>
    </>
  );
}
