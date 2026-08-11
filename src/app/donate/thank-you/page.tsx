import Link from 'next/link';
import type { Metadata } from 'next';
import { Logo } from '@/components/Logo';

// Standalone thank-you/confirmation page for donors. Lemon Squeezy (the
// hosted checkout that used to redirect here after payment) has been
// removed — donations now go through PayPal.me and direct crypto transfer,
// neither of which supports redirecting back to our site after payment.
// This page is no longer linked to automatically from any checkout flow;
// it's kept as a general confirmation page in case we want to link donors
// to it manually (e.g. from a follow-up email) or wire up a redirect for a
// future payment method.
//
// NOTE: this page does not itself verify that a payment occurred — anyone
// could land on this URL directly (e.g. by typing it). Nothing security- or
// financial-sensitive should ever be gated on merely reaching this page.

export const metadata: Metadata = {
  title: 'Thank you',
  robots: { index: false, follow: false },
};

export default function DonateThankYouPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-cream">
      <div className="w-full max-w-lg text-center card p-8 sm:p-10">
        <div className="inline-flex mb-6">
          <Logo size="lg" />
        </div>

        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-pitch/20 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-pitch-dk">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>

        <span className="badge bg-pitch/20 text-pitch-dk mb-3">Payment confirmed</span>
        <h1 className="heading-serif text-2xl sm:text-3xl text-night mb-3">
          Thank you for supporting Qawla
        </h1>
        <p className="text-night/70 text-sm sm:text-base leading-relaxed mb-8 normal-case">
          Your contribution helps keep our reporting independent, ad-light, and verified.
          If you paid via PayPal, a receipt has been sent to your email automatically.
          If anything looks off with your payment, reach out and we'll sort it out.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="btn-primary justify-center min-h-[48px] w-full sm:w-auto">
            Back to Qawla
          </Link>
          <Link
            href="/contact"
            className="btn-secondary justify-center min-h-[48px] w-full sm:w-auto"
          >
            Contact us
          </Link>
        </div>
      </div>
    </div>
  );
}
