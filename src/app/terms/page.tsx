import type { Metadata } from 'next';
import { PageHero } from '@/components/premium';
import { Reveal } from '@/components/motion';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms and conditions governing your use of Qawla.',
  alternates: { canonical: '/terms' },
};

const SECTIONS = [
  {
    id: 'acceptance',
    title: '1. Acceptance of terms',
    body: `By accessing or using Qawla (the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, you may not access or use the Service.

These Terms constitute a legally binding agreement between you and Qawla ("we", "us", "our"). If you are using the Service on behalf of an organisation, you represent that you have authority to bind that organisation to these Terms.`,
  },
  {
    id: 'description',
    title: '2. Description of service',
    body: `Qawla is a football news platform that provides:

• Verified football news and analysis
• Transfer tracking with confidence scoring
• Live match commentary via Server-Sent Events
• Long-form editorial features
• A donation system for reader support

The Service is provided free of charge, with optional paid memberships. We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time.`,
  },
  {
    id: 'eligibility',
    title: '3. Eligibility',
    body: `You must be at least 13 years old to use the Service. If you are under 18, you represent that your parent or legal guardian has reviewed and agreed to these Terms on your behalf.

By using the Service, you represent that you are legally capable of entering into a binding agreement and that your use does not violate any law or regulation applicable to you.`,
  },
  {
    id: 'accounts',
    title: '4. Accounts and admin access',
    body: `Most of the Service does not require an account. Admin access to the Qawla dashboard is restricted to authorised editorial staff and is protected by HMAC-signed sessions.

You are responsible for maintaining the confidentiality of any credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorised use.`,
  },
  {
    id: 'user-content',
    title: '5. User contributions',
    body: `If you submit content to the Service (e.g., story tips via the contact form), you grant Qawla a non-exclusive, royalty-free, worldwide, perpetual licence to use, reproduce, modify, adapt, publish, and distribute that content for the purpose of editorial reporting.

You represent that you own or have the necessary rights to submit the content, and that the content does not violate the rights of any third party.`,
  },
  {
    id: 'acceptable-use',
    title: '6. Acceptable use',
    body: `You agree not to:

• Use the Service for any unlawful purpose
• Attempt to gain unauthorised access to any part of the Service
• Interfere with the proper functioning of the Service
• Scrape, crawl, or otherwise extract bulk content without permission
• Republish, redistribute, or syndicate our content without attribution
• Use automated tools to overwhelm our servers (rate limits apply)
• Submit false or misleading information via our contact form
• Impersonate any person or entity

Violation of these rules may result in termination of access and legal action.`,
  },
  {
    id: 'intellectual-property',
    title: '7. Intellectual property',
    body: `The Service and its original content (articles, analysis, features, graphics, logos) are the property of Qawla and are protected by international copyright laws.

You may share links to our content freely. You may quote excerpts of up to 100 words with attribution and a link to the original article. You may not republish full articles without written permission.

editorial content on the Service is editorially reviewed and published under the same copyright as human-written content.`,
  },
  {
    id: 'ai-content',
    title: '8. editorial content',
    body: `Qawla uses advanced technology to assist in the creation of editorial content. Every editorial article passes through a five-stage editorial pipeline (scout, fact-checker, analyst, writer, editor) and carries a public confidence score.

We do not represent that editorial content is infallible. We commit to correcting errors promptly and transparently. Readers should treat confidence scores as an indicator of sourcing strength, not as a guarantee of accuracy.

For more on our AI-free editorial process, see our About page.`,
  },
  {
    id: 'donations',
    title: '9. Donations',
    body: `Donations are one-time and voluntary, made directly via PayPal or by sending cryptocurrency to the wallet addresses listed on our Donate page. PayPal donations are subject to PayPal's own Terms of Service and Privacy Policy. Cryptocurrency donations are sent directly to our wallets and cannot be reversed by us — please double-check the network and address before sending.

Donations are non-refundable except where required by law. If you believe you have been charged in error via PayPal, email support@qawla.com within 14 days.`,
  },
  {
    id: 'disclaimer',
    title: '10. Disclaimer of warranties',
    body: `The Service is provided "as is" and "as available", without warranties of any kind, express or implied. We do not warrant that:

• The Service will be uninterrupted or error-free
• Information on the Service is accurate, complete, or reliable
• Defects will be corrected

You use the Service at your own risk. Football reporting involves inherent uncertainty; we do not guarantee the accuracy of any transfer rumour, match prediction, or tactical analysis.`,
  },
  {
    id: 'limitation',
    title: '11. Limitation of liability',
    body: `To the maximum extent permitted by law, Qawla shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation:

• Loss of profits, data, or goodwill
• Damages from inability to use the Service
• Damages from reliance on content published on the Service
• Damages from third-party conduct or content

Our total liability for any claim shall not exceed the amount you have paid us in the preceding 12 months, or $50 USD, whichever is greater.`,
  },
  {
    id: 'governing-law',
    title: '12. Governing law and disputes',
    body: `These Terms are governed by the laws of England and Wales, without regard to conflict of law principles.

Any dispute arising from these Terms or the Service shall be resolved exclusively in the courts of London, England. Before initiating litigation, you agree to attempt good-faith resolution via email to legal@qawla.com.

The United Nations Convention on Contracts for the International Sale of Goods does not apply.`,
  },
  {
    id: 'changes',
    title: '13. Changes to terms',
    body: `We may modify these Terms at any time. We will post the updated Terms on this page and update the "Last updated" date. For material changes, we will also send a notice to newsletter subscribers.

Your continued use of the Service after changes take effect constitutes acceptance of the updated Terms. If you do not agree, you must stop using the Service.

Last updated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}.`,
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Terms of"
        highlight="Service."
        description="The terms and conditions governing your use of Qawla."
        variant="light"
      />
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        {/* TOC */}
        <Reveal className="mb-10">
          <nav aria-label="Table of contents" className="p-5 rounded-2xl bg-cream border border-black/5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-night/50 mb-3">Contents</p>
            <ol className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-sm">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-pitch-dk hover:text-pitch-darker hover:underline">
                    {s.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </Reveal>

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
