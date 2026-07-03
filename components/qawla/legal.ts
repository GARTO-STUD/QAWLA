/**
 * Legal content — Privacy Policy & Terms of Service
 *
 * Extracted from the original app/privacy/page.tsx and app/terms/page.tsx
 * so the same copy can be rendered inside a modal on the single-page app.
 */

export interface LegalSection {
  id: string;
  title: string;
  body: string;
}

export const PRIVACY_SECTIONS: LegalSection[] = [
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

• Donation information: when you donate, our payment processor (Lemon Squeezy) collects your payment details. We receive only your email address and donation amount — never your card details.`,
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
• Lemon Squeezy (payment processing for donations)
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
• No storage of payment card data (handled by Lemon Squeezy)

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

export const TERMS_SECTIONS: LegalSection[] = [
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

Editorial content on the Service is editorially reviewed and published under the same copyright as human-written content.`,
  },
  {
    id: 'ai-content',
    title: '8. Editorial content',
    body: `Qawla uses advanced technology to assist in the creation of editorial content. Every editorial article passes through a five-stage editorial pipeline (scout, fact-checker, analyst, writer, editor) and carries a public confidence score.

We do not represent that editorial content is infallible. We commit to correcting errors promptly and transparently. Readers should treat confidence scores as an indicator of sourcing strength, not as a guarantee of accuracy.

For more on our editorial process, see our About page.`,
  },
  {
    id: 'donations',
    title: '9. Donations and memberships',
    body: `Donations and memberships are processed by Lemon Squeezy, our payment processor. By making a donation, you agree to Lemon Squeezy's Terms of Service and Privacy Policy.

Donations are non-refundable except where required by law. If you believe you have been charged in error, email support@qawla.com within 14 days.

Membership perks are subject to change. We reserve the right to modify perk offerings with 30 days' notice.`,
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
