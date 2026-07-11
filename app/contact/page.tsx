'use client';

import { useState } from 'react';
import { PageHero } from '@/components/premium';
import { useToast } from '@/components/Toast';

const FAQ = [
  {
    q: 'How does Qawla verify its stories?',
    a: 'Every story passes through a five-stage editorial pipeline — scout, fact-checker, analyst, writer, editor — and receives a public confidence score from 0-100. The score is a weighted blend of source tier (40%), cross-reference (30%), entity match (20%), and historical accuracy (10%).',
  },
  {
    q: 'Is Qawla independent?',
    a: 'Yes. Qawla is reader-funded through donations. We do not accept club sponsorship, advertising from football-related entities, or paid placement. Our editorial decisions are not influenced by our donors.',
  },
  {
    q: 'How do I report an error?',
    a: 'Use the contact form below with the article URL and the specific error. We correct factual errors within 24 hours and publish a correction notice on the article. Serious corrections are flagged at the top of the piece.',
  },
  {
    q: 'Do you cover women\'s football?',
    a: 'Yes — with the same rigor as the men\'s game. We cover the WSL, NWSL, Frauen-Bundesliga, Division 1 Féminine, and international women\'s football. Coverage depth scales with reader demand.',
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    await new Promise((r) => setTimeout(r, 800));
    setSending(false);
    toast('Message sent — we\'ll reply within 48 hours.', 'success');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="We'd love to"
        highlight="hear from you."
        description="Story tips, corrections, or just feedback — send us a message and we'll get back to you within 48 hours."
        variant="dark"
      />

      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">
        {/* Form */}
        <section aria-labelledby="form-heading" className="mb-14">
          <h2 id="form-heading" className="font-display font-extrabold text-2xl sm:text-3xl text-night mb-6">
            Send us a message
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-night/70 mb-1.5">Name</label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-night placeholder:text-night/40 focus:outline-none focus:ring-2 focus:ring-pitch focus:border-transparent min-h-[48px] text-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-night/70 mb-1.5">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-night placeholder:text-night/40 focus:outline-none focus:ring-2 focus:ring-pitch focus:border-transparent min-h-[48px] text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-bold text-night/70 mb-1.5">Subject</label>
              <select
                id="subject"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-night focus:outline-none focus:ring-2 focus:ring-pitch focus:border-transparent min-h-[48px] text-sm"
              >
                <option value="">Select a topic…</option>
                <option value="tip">Story tip</option>
                <option value="correction">Correction</option>
                <option value="feedback">Feedback</option>
                <option value="partnership">Partnership</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-bold text-night/70 mb-1.5">Message</label>
              <textarea
                id="message"
                required
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="Tell us what's on your mind…"
                className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-night placeholder:text-night/40 focus:outline-none focus:ring-2 focus:ring-pitch focus:border-transparent min-h-[120px] resize-y text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={sending}
              className="btn-primary justify-center min-h-[48px] disabled:opacity-70"
            >
              {sending ? 'Sending…' : 'Send message'}
            </button>
          </form>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="font-display font-extrabold text-2xl sm:text-3xl text-night mb-6">
            Frequently asked questions
          </h2>
          <div className="space-y-3">
            {FAQ.map((item, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full px-5 py-4 flex items-center justify-between gap-3 text-left hover:bg-gray-50 transition-colors min-h-[48px]"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-display font-bold text-night text-sm sm:text-base">{item.q}</span>
                  <svg
                    width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                    className={`text-pitch-dk shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`}
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-night/70 leading-relaxed border-t border-gray-100 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
