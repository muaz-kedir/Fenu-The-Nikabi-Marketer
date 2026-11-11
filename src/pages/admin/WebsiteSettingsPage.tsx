import { useEffect, useState } from 'react';
import { Globe, Loader2, Sparkles } from 'lucide-react';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import {
  getAdminSingleton,
  publishAdminSingleton,
  saveAdminSingleton,
} from '../../services/contentService';

const defaultForm = {
  site_name: 'Azmina Zahra',
  owner_name: 'Azmina Zahra',
  professional_title: 'Social Media Marketing Specialist',
  email: 'hello@azminazahra.com',
  phone: '+971 52 123 4567',
  location: 'Dubai, UAE',
  logo_url: '',
  favicon_url: '',
  profile_image_url: '',
  profile_image_alt: '',
  resume_url: '',
  instagram_url: 'https://instagram.com',
  tiktok_url: 'https://tiktok.com',
  linkedin_url: 'https://linkedin.com',
  whatsapp_url: 'https://wa.me/971521234567',
  seo_title: 'Azmina Zahra | Social Media Marketing Specialist',
  seo_description: 'Premium social media marketing strategy and creative services for brands ready to grow.',
  copyright_text: '© 2025 Azmina Zahra. All rights reserved.',
};

export function WebsiteSettingsPage() {
  const [form, setForm] = useState(defaultForm);
  const [published, setPublished] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const result = await getAdminSingleton('site_settings');
      setPublished(result.published);
      setDraft(result.draft);
      const source = result.draft || result.published;
      if (source) {
        setForm((prev) => ({
          ...prev,
          ...source,
          logo_url: source.logo_url || '',
          favicon_url: source.favicon_url || '',
          profile_image_url: source.profile_image_url || '',
          resume_url: source.resume_url || '',
        }));
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to load website settings.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await saveAdminSingleton('site_settings', form, false);
      await load();
      setMessage({ type: 'success', text: 'Settings draft saved. Changes remain unreleased until published.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save settings draft.',
      });
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveAdminSingleton('site_settings', form, false);
      await publishAdminSingleton('site_settings');
      await load();
      setMessage({ type: 'success', text: 'Settings published! Public website has been updated.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to publish settings.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Configuration</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Website & Brand Settings</h1>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {draft && (
            <span className="rounded-full bg-amber-500/20 px-3 py-1 font-medium text-amber-300">
              Draft Pending
            </span>
          )}
          {published && (
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-medium text-emerald-300">
              Live Published
            </span>
          )}
        </div>
      </div>

      {message && (
        <div
          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-red-500/30 bg-red-500/10 text-red-200'
          }`}
        >
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} className="text-white/60 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 items-center justify-center text-white/50">
          <Loader2 size={24} className="animate-spin mr-2 text-[#f04796]" />
          Loading settings...
        </div>
      ) : (
        <form onSubmit={saveDraft} className="space-y-8">
          {/* Section 1: Brand Identity */}
          <div className="rounded-[28px] border border-white/10 bg-[#141416] p-6 space-y-5">
            <div className="flex items-center gap-2 text-base font-semibold text-white border-b border-white/10 pb-3">
              <Sparkles size={18} className="text-[#f6b7d2]" />
              Brand & Owner Identity
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Site Name</label>
                <input
                  type="text"
                  required
                  value={form.site_name}
                  onChange={(e) => setForm({ ...form, site_name: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Owner Full Name</label>
                <input
                  type="text"
                  required
                  value={form.owner_name}
                  onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-white/70 mb-1.5">Professional Title</label>
                <input
                  type="text"
                  required
                  value={form.professional_title}
                  onChange={(e) => setForm({ ...form, professional_title: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <ImageUploadField
                  label="Brand Avatar / Profile Picture"
                  value={form.profile_image_url}
                  onChange={(url) => setForm({ ...form, profile_image_url: url })}
                  altText={form.profile_image_alt}
                  onAltTextChange={(alt) => setForm({ ...form, profile_image_alt: alt })}
                  folder="branding"
                  aspect="circle"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Contact Details */}
          <div className="rounded-[28px] border border-white/10 bg-[#141416] p-6 space-y-5">
            <div className="flex items-center gap-2 text-base font-semibold text-white border-b border-white/10 pb-3">
              <Globe size={18} className="text-[#f6b7d2]" />
              Contact Information
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Location</label>
                <input
                  type="text"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Social & WhatsApp */}
          <div className="rounded-[28px] border border-white/10 bg-[#141416] p-6 space-y-5">
            <div className="text-base font-semibold text-white border-b border-white/10 pb-3">
              Social Media Links
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">WhatsApp Link</label>
                <input
                  type="text"
                  value={form.whatsapp_url}
                  onChange={(e) => setForm({ ...form, whatsapp_url: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                  placeholder="https://wa.me/..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Instagram URL</label>
                <input
                  type="text"
                  value={form.instagram_url}
                  onChange={(e) => setForm({ ...form, instagram_url: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">TikTok URL</label>
                <input
                  type="text"
                  value={form.tiktok_url}
                  onChange={(e) => setForm({ ...form, tiktok_url: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">LinkedIn URL</label>
                <input
                  type="text"
                  value={form.linkedin_url}
                  onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 4: SEO Metadata */}
          <div className="rounded-[28px] border border-white/10 bg-[#141416] p-6 space-y-5">
            <div className="text-base font-semibold text-white border-b border-white/10 pb-3">
              SEO & Footer Defaults
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-white/70 mb-1.5">SEO Title Tag</label>
                <input
                  type="text"
                  value={form.seo_title}
                  onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-white/70 mb-1.5">SEO Meta Description</label>
                <textarea
                  rows={2}
                  value={form.seo_description}
                  onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-white/70 mb-1.5">Default Copyright Text</label>
                <input
                  type="text"
                  value={form.copyright_text}
                  onChange={(e) => setForm({ ...form, copyright_text: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={() => {
                const fallback = published || draft;
                if (fallback) {
                  setForm((prev) => ({ ...prev, ...fallback }));
                  setMessage({ type: 'success', text: 'Reverted settings to previous saved state.' });
                }
              }}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 hover:bg-white/10"
            >
              Cancel / Revert Changes
            </button>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => void publish()}
                className="rounded-full border border-[#f04796] bg-[#f04796] px-6 py-2.5 text-xs font-semibold text-[#0d0d0f] shadow-[0_0_20px_rgba(240,71,150,0.35)] transition hover:bg-[#ff6ab3] disabled:opacity-50"
              >
                {saving ? 'Publishing...' : 'Publish Settings'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
