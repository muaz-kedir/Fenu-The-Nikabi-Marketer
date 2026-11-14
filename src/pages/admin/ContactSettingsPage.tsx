import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, HelpCircle, Mail, MapPin, MessageCircle, Phone, PhoneCall, Save, Send } from 'lucide-react';
import { getAdminSingleton, publishAdminSingleton, saveAdminSingleton } from '../../services/contentService';
import type { SiteSettings } from '../../types/database';

export function ContactSettingsPage() {
  const { refreshOverview } = useOutletContext<{ refreshOverview?: () => void }>() || {};

  const [form, setForm] = useState<Partial<SiteSettings>>({
    email: 'hello@azminazahra.com',
    phone: '+971 52 123 4567',
    location: 'Dubai, UAE',
    whatsapp_url: 'https://wa.me/971521234567',
    booking_url: 'https://calendly.com',
    facebook_url: '',
    instagram_url: 'https://instagram.com',
    tiktok_url: 'https://tiktok.com',
    linkedin_url: 'https://linkedin.com',
    contact_heading: 'Ready to scale your brand?',
    contact_description: 'Book a strategy session or leave an inquiry. I review and respond to serious project inquiries within 24 hours.',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getAdminSingleton('site_settings');
      const active = res.draft || res.published;
      if (active) {
        setForm((prev) => ({
          ...prev,
          ...active,
        }));
      }
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to load contact settings.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleChange = (field: keyof SiteSettings, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await saveAdminSingleton('site_settings', form, false);
      setFeedback({ type: 'success', text: 'Contact details saved as draft!' });
      if (refreshOverview) refreshOverview();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to save draft.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setFeedback(null);
    try {
      await saveAdminSingleton('site_settings', form, true);
      await publishAdminSingleton('site_settings', form);
      setFeedback({ type: 'success', text: 'Contact settings published live!' });
      if (refreshOverview) refreshOverview();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to publish settings.' });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-white/60">
        Loading contact settings...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Contact Information & Channels</h1>
          <p className="mt-1 text-xs text-white/60">
            Manage client inquiry channels, WhatsApp direct link, booking calendar, and social handles.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={saving || publishing}
            onClick={() => void handleSaveDraft()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#16141c] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0a0a0a]"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="button"
            disabled={saving || publishing}
            onClick={() => void handlePublish()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#f04796] text-[#0d0d0f] font-bold shadow-[0_0_20px_rgba(240,71,150,0.35)] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#ff6ab3]"
          >
            <Send size={14} />
            {publishing ? 'Publishing...' : 'Publish Live'}
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`rounded-xl p-3 text-xs font-medium border ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {/* Form sections */}
      <div className="space-y-6">
        {/* Contact Page Headings */}
        <div className="rounded-2xl border border-white/10 bg-[#131117] p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 border-b border-white/10 pb-3">
            Contact Section Presentation
          </h2>

          <div>
            <label className="block text-xs font-medium text-white">Section Heading</label>
            <input
              type="text"
              value={form.contact_heading || ''}
              onChange={(e) => handleChange('contact_heading', e.target.value)}
              placeholder="Ready to scale your brand?"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white">Section Description / Instructions</label>
            <textarea
              rows={3}
              value={form.contact_description || ''}
              onChange={(e) => handleChange('contact_description', e.target.value)}
              placeholder="Book a strategy session or leave an inquiry..."
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] p-3 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Channels */}
        <div className="rounded-2xl border border-white/10 bg-[#131117] p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 border-b border-white/10 pb-3">
            Direct Reach & Booking
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-white">Primary Email</label>
              <input
                type="email"
                value={form.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="hello@azminazahra.com"
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white">Phone Number / WhatsApp Contact</label>
              <input
                type="text"
                value={form.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+971 52 123 4567"
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-white">Direct WhatsApp Chat Link</label>
              <input
                type="text"
                value={form.whatsapp_url || ''}
                onChange={(e) => handleChange('whatsapp_url', e.target.value)}
                placeholder="https://wa.me/971521234567"
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white">Direct Calendar Booking URL (Calendly, etc.)</label>
              <input
                type="text"
                value={form.booking_url || ''}
                onChange={(e) => handleChange('booking_url', e.target.value)}
                placeholder="https://calendly.com/your-username/30min"
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white">Location / Office Base</label>
            <input
              type="text"
              value={form.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
              placeholder="Dubai, UAE (Available Worldwide)"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Social Links */}
        <div className="rounded-2xl border border-white/10 bg-[#131117] p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 border-b border-white/10 pb-3">
            Social Media Profiles
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-white">Instagram Profile URL</label>
              <input
                type="text"
                value={form.instagram_url || ''}
                onChange={(e) => handleChange('instagram_url', e.target.value)}
                placeholder="https://instagram.com/..."
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white">TikTok Profile URL</label>
              <input
                type="text"
                value={form.tiktok_url || ''}
                onChange={(e) => handleChange('tiktok_url', e.target.value)}
                placeholder="https://tiktok.com/@..."
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white">LinkedIn Profile URL</label>
              <input
                type="text"
                value={form.linkedin_url || ''}
                onChange={(e) => handleChange('linkedin_url', e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white">Facebook Profile / Page URL</label>
              <input
                type="text"
                value={form.facebook_url || ''}
                onChange={(e) => handleChange('facebook_url', e.target.value)}
                placeholder="https://facebook.com/..."
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
