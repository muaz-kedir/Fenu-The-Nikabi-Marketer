import { useState } from 'react';
import { ArrowRight, Mail, MapPin, Phone } from 'lucide-react';
import { submitContactMessage } from '../services/contentService';
import type { SiteSettings } from '../types/database';

type ContactProps = {
  site?: Partial<SiteSettings>;
};

export function Contact({ site }: ContactProps) {
  const email = site?.email ?? 'hello@azminazahra.com';
  const phone = site?.phone ?? '+971 52 123 4567';
  const location = site?.location ?? 'Dubai, UAE';
  const whatsappLink = site?.whatsapp_url ?? 'https://wa.me/971521234567';

  const [form, setForm] = useState({ sender_name: '', sender_email: '', subject: '', message: '' });
  const [status, setStatus] = useState('');

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus('');
    try {
      await submitContactMessage(form);
      setForm({ sender_name: '', sender_email: '', subject: '', message: '' });
      setStatus('Message sent successfully.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Failed to send message.');
    }
  };

  return (
    <section id="contact" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="rounded-[36px] border border-[#f04796]/40 bg-[radial-gradient(circle_at_top,rgba(240,71,150,0.16),rgba(18,18,18,0.95)_42%)] p-8 text-center shadow-[0_0_60px_rgba(240,71,150,0.1)] sm:p-10 lg:p-14">
        <p className="font-display text-5xl text-[#f6b7d2] sm:text-6xl">Thank you for your support!</p>
        <h2 className="mt-4 text-3xl font-semibold text-white sm:text-5xl">Ready to grow your brand?</h2>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-white/70 sm:text-lg">
          Let&apos;s focus on <span className="text-[#f6b7d2]">building</span> and <span className="text-[#f6b7d2]">growing</span> your presence with strategy, creativity, and performance that feels premium from day one.
        </p>

        <form onSubmit={submit} className="mx-auto mt-8 grid max-w-2xl gap-3 text-left">
          <input required placeholder="Name" value={form.sender_name} onChange={(event) => setForm({ ...form, sender_name: event.target.value })} className="rounded-2xl border border-white/10 bg-[#101011] px-3 py-3 text-white" />
          <input required type="email" placeholder="Email" value={form.sender_email} onChange={(event) => setForm({ ...form, sender_email: event.target.value })} className="rounded-2xl border border-white/10 bg-[#101011] px-3 py-3 text-white" />
          <input placeholder="Subject" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} className="rounded-2xl border border-white/10 bg-[#101011] px-3 py-3 text-white" />
          <textarea required rows={4} placeholder="Message" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} className="rounded-2xl border border-white/10 bg-[#101011] px-3 py-3 text-white" />
          {status && <div className="text-sm text-[#f6b7d2]">{status}</div>}
          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-full border border-[#f04796] bg-[#f04796] px-8 py-3.5 text-base font-semibold text-[#0d0d0f] shadow-[0_0_35px_rgba(240,71,150,0.4)] transition hover:-translate-y-0.5 hover:bg-[#ff6ab3]">
            Send Message
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
