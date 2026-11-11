import { useState } from 'react';
import { ArrowRight, CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { submitContactMessage } from '../services/contentService';
import type { CtaContent, SiteSettings } from '../types/database';

type ContactProps = {
  site?: Partial<SiteSettings>;
  cta?: Partial<CtaContent>;
};

export function Contact({ site, cta }: ContactProps) {
  const email = site?.email ?? 'hello@azminazahra.com';
  const phone = site?.phone ?? '+971 52 123 4567';
  const location = site?.location ?? 'Dubai, UAE';

  const scriptGreeting = cta?.script_greeting ?? 'Thank you for your support!';
  const mainHeading = cta?.main_heading ?? 'Ready to grow your brand?';
  const supportingDescription =
    cta?.supporting_description ??
    "Let's focus on building and growing your presence with strategy, creativity, and performance that feels premium from day one.";
  const highlightedWords = (cta?.highlighted_words || 'building,growing')
    .split(',')
    .map((w) => w.trim().toLowerCase())
    .filter(Boolean);

  const [form, setForm] = useState({ sender_name: '', sender_email: '', subject: '', message: '' });
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      await submitContactMessage(form);
      setForm({ sender_name: '', sender_email: '', subject: '', message: '' });
      setStatus({ type: 'success', text: 'Thank you! Your message has been sent successfully.' });
    } catch (error) {
      setStatus({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to send message. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Helper to render description with highlighted words
  const renderHighlightedDescription = (text: string) => {
    if (!highlightedWords.length) return text;
    const regex = new RegExp(`(${highlightedWords.map((w) => `\\b${w}\\b`).join('|')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      highlightedWords.includes(part.toLowerCase()) ? (
        <span key={index} className="text-[#f6b7d2] font-semibold">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <section id="contact" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="rounded-[36px] border border-[#f04796]/40 bg-[radial-gradient(circle_at_top,rgba(240,71,150,0.16),rgba(18,18,18,0.95)_42%)] p-8 text-center shadow-[0_0_60px_rgba(240,71,150,0.1)] sm:p-10 lg:p-14">
        <p className="font-display text-4xl text-[#f6b7d2] sm:text-5xl">{scriptGreeting}</p>
        <h2 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">{mainHeading}</h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
          {renderHighlightedDescription(supportingDescription)}
        </p>

        {cta?.button_text && cta.button_url && (
          <div className="mt-6 flex justify-center">
            <a
              href={cta.button_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-2.5 text-sm font-semibold text-white hover:border-[#f04796] hover:bg-[#f04796]/10 hover:text-[#f6b7d2] transition"
            >
              {cta.button_text}
              <ArrowRight size={16} />
            </a>
          </div>
        )}

        <form onSubmit={submit} className="mx-auto mt-8 grid max-w-2xl gap-3 text-left">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              required
              placeholder="Your Name *"
              value={form.sender_name}
              onChange={(event) => setForm({ ...form, sender_name: event.target.value })}
              className="rounded-2xl border border-white/10 bg-[#101011] px-4 py-3 text-sm text-white focus:border-[#f04796] focus:outline-none"
            />
            <input
              required
              type="email"
              placeholder="Your Email *"
              value={form.sender_email}
              onChange={(event) => setForm({ ...form, sender_email: event.target.value })}
              className="rounded-2xl border border-white/10 bg-[#101011] px-4 py-3 text-sm text-white focus:border-[#f04796] focus:outline-none"
            />
          </div>
          <input
            placeholder="Subject (Optional)"
            value={form.subject}
            onChange={(event) => setForm({ ...form, subject: event.target.value })}
            className="rounded-2xl border border-white/10 bg-[#101011] px-4 py-3 text-sm text-white focus:border-[#f04796] focus:outline-none"
          />
          <textarea
            required
            rows={4}
            placeholder="Your Message *"
            value={form.message}
            onChange={(event) => setForm({ ...form, message: event.target.value })}
            className="rounded-2xl border border-white/10 bg-[#101011] px-4 py-3 text-sm text-white focus:border-[#f04796] focus:outline-none"
          />

          {status && (
            <div
              className={`flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
                status.type === 'success'
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-red-500/30 bg-red-500/10 text-red-200'
              }`}
            >
              {status.type === 'success' && <CheckCircle2 size={16} />}
              <span>{status.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#f04796] bg-[#f04796] px-8 py-3.5 text-base font-semibold text-[#0d0d0f] shadow-[0_0_35px_rgba(240,71,150,0.4)] transition hover:-translate-y-0.5 hover:bg-[#ff6ab3] disabled:opacity-50"
          >
            {submitting ? 'Sending...' : 'Send Message'}
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-[#141414]/70 p-4 text-left">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f04796]/10 text-[#f6b7d2]">
              <Mail size={18} />
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/55">Email</div>
            <a href={`mailto:${email}`} className="mt-2 block text-sm text-white/80 hover:text-[#f6b7d2]">
              {email}
            </a>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#141414]/70 p-4 text-left">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f04796]/10 text-[#f6b7d2]">
              <Phone size={18} />
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/55">Phone</div>
            <a href={`tel:${phone}`} className="mt-2 block text-sm text-white/80 hover:text-[#f6b7d2]">
              {phone}
            </a>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#141414]/70 p-4 text-left">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f04796]/10 text-[#f6b7d2]">
              <MapPin size={18} />
            </div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/55">Location</div>
            <div className="mt-2 text-sm text-white/80">{location}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
