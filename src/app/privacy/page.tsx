import type { Metadata } from 'next';
import { PageHero } from '@/components/premium';
import { Reveal } from '@/components/motion';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Qawla collects, uses, and protects your personal data. GDPR and CCPA compliant.',
  alternates: { canonical: '/privacy' },
};

const SECTIONS = [
  {
    id: 'introduction',
    title: '1. Introduction',
    body: `Qawla ("we", "us", "our") operates the website qawla.com (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our Service.

We are committed to protecting your privacy and complying with the General Data Protection Regulation (GDPR), the California Consumer Privacy Act (CCPA), and other applicable data protection laws.`,
  },
  {
    id: 'data-we-collect',
    title: '2. Information we collect',
    body: `We collect the following categories of information:

• Information you provide: email address (when subscribing to the newsletter or contacting us), name, and message content when you submit our contact form.

• Automatic information: IP address, browser type, device information, pages visited, referring URLs, and timestamps. We use Google Analytics 4 and Plausible Analytics to collect this.

• Cookies and similar technologies: see Section 4 for details.

• Donation information: when you donate via PayPal, PayPal collects your payment details as your payment processor. We never receive or store your card or PayPal account details. Cryptocurrency donations are sent directly to our public wallet addresses and are not processed by us or any intermediary.`,
  },
  {
    id: 'how-we-use',
    title: '3. How we use your information',
    body: `We use your information to:

• Operate, maintain, and improve our Service
• Send our newsletter (only if you have subscribed)
• Respond to your inquiries and feedback
• Analyse usage patterns to improve content and user experience
• Detect, prevent, and address technical issues, fraud, or abuse
• Comply with legal obligations

We do not sell your personal information to third parties.`,
  },
  {
    id: 'cookies',
    title: '4. Cookies and tracking technologies',
    body: `We use the following types of cookies:

• Essential cookies: required for the Service to function (e.g., admin session).
• Analytics cookies: Google Analytics and Plausible to understand how visitors use our site. GA4 is configured with IP anonymisation.
• Advertising cookies: Google AdSense may set cookies to serve relevant ads. You can opt out of personalised advertising via Google Ads Settings.

You can control cookies through your browser settings. Disabling essential cookies will prevent you from using parts of the Service.`,
  },
  {
    id: 'third-parties',
    title: '5. Third-party services',
    body: `We use the following third-party services that may collect information:

• Google Analytics 4 (traffic analysis, IP anonymised)
• Plausible Analytics (privacy-friendly analytics, no cookies)
• Google AdSense (display advertising)
• PayPal (payment processing for PayPal donations)
• Cloudflare (CDN, DDoS protection, security)
• OpenAI / Anthropic / Google Gemini (content generation — no personal data is sent)

Each service has its own privacy policy. We encourage you to review them.`,
  },
  {
    id: 'data-retention',
    title: '6. Data retention',
    body: `We retain personal information only as long as necessary to fulfil the purposes outlined in this policy:

• Newsletter subscriptions: until you unsubscribe
• Contact form submissions: 12 months
• Analytics data: 26 months (Google Analytics default)
• Admin session data: 8 hours
• Donation records: 7 years (for tax and accounting compliance)

After the retention period, data is deleted or anonymised.`,
  },
  {
    id: 'your-rights',
    title: '7. Your rights',
    body: `Under GDPR and CCPA, you have the following rights:

• Access: request a copy of your personal data
• Rectification: request correction of inaccurate data
• Erasure: request deletion of your data ("right to be forgotten")
• Restriction: request limitation of processing
• Portability: receive your data in a structured, machine-readable format
• Objection: object to processing based on legitimate interests
• Withdraw consent: withdraw consent for processing based on consent at any time

To exercise these rights, email privacy@qawla.com. We respond within 30 days.`,
  },
  {
    id: 'security',
    title: '8. Security',
    body: `We implement industry-standard security measures:

• HTTPS/TLS encryption for all traffic
• Strict Content Security Policy headers
• HMAC-signed admin sessions
• PBKDF2 password hashing (100,000 iterations, SHA-256)
• Cloudflare DDoS protection and Web Application Firewall
• Regular security audits and dependency updates
• No storage of payment card data (PayPal handles this directly; crypto donations go straight to our public wallets)

No method of transmission over the Internet is 100% secure, but we do our utmost to protect your data.`,
  },
  {
    id: 'changes',
    title: '9. Changes to this policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the "Last updated" date. For significant changes, we will also send a notice to newsletter subscribers.

We encourage you to review this policy periodically. Continued use of the Service after changes constitutes acceptance of the updated policy.

Last updated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy"
        highlight="Policy."
        description="How Qawla collects, uses, and protects your personal data. GDPR and CCPA compliant."
        variant="light"
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="space-y-12">
          {SECTIONS.map((s) => (
            <Reveal key={s.id}>
              <section id={s.id} className="scroll-mt-24">
                <h2 className="heading-serif text-xl sm:text-2xl text-night mb-4 border-b-2 border-pitch/30 pb-2">{s.title}</h2>
                <p className="text-[15px] sm:text-base leading-7 sm:leading-8 text-night/75 whitespace-pre-line">{s.body}</p>
              </section>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}
