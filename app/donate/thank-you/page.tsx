import Link from 'next/link';
import type { Metadata } from 'next';
import { Logo } from '@/components/Logo';

// This page did not exist at all. Lemon Squeezy's checkout previously had no
// `redirect_url` configured (see lib/lemonsqueezy.ts), so donors who
// completed a payment had nowhere on Qawla to land — they'd stay on Lemon
// Squeezy's own generic receipt page, with no branded confirmation and no
// path back to the site. This is the destination that fix now points to.
//
// NOTE: this page confirms that the *checkout flow* completed and sends the
// donor back to the site — it does not itself verify the payment. The
// authoritative source of truth for "did this donation actually succeed" is
// the Lemon Squeezy webhook (order_created / subscription_payment_success),
// once that webhook handler exists — see the roadmap note on
// /api/webhooks/lemonsqueezy. Someone could technically land on this URL
// without having paid (e.g. by typing it directly), so nothing security- or
// financial-sensitive should ever be gated on merely reaching this page.

export const metadata: Metadata = {
  title: 'Thank you',
  robots: { index: false, follow: false },
};

export default function DonateThankYouPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-lg text-center">
        <div className="inline-flex mb-6">
          <Logo size="lg" />
        </div>

        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-pitch/10 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pitch-dk">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-night mb-3">
          Thank you for supporting Qawla
        </h1>
        <p className="text-night/70 text-sm sm:text-base leading-relaxed mb-8">
          Your contribution helps keep our reporting independent, ad-light, and verified.
          A receipt has been sent to your email by Lemon Squeezy, our payment processor.
          If anything looks off with your payment, reach out and we'll sort it out.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="btn-primary justify-center min-h-[48px] w-full sm:w-auto">
            Back to Qawla
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-night/70 font-semibold hover:border-pitch/40 hover:text-pitch-dk transition-colors min-h-[48px] w-full sm:w-auto"
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
