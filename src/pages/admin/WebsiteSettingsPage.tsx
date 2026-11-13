import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertCircle, Bell, CheckCircle2, Globe, Palette, Save, Send, Sparkles } from 'lucide-react';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import {
  getAdminSingleton,
  publishAdminSingleton,
  saveAdminSingleton,
} from '../../services/contentService';
import type { SiteSettings } from '../../types/database';

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
  announcement_active: false,
  announcement_text: '✨ Currently taking on ambitious brand campaigns for Q2 – Inquire now!',
  brand_primary_color: '#344238',
  brand_accent_color: '#E7DCCB',
  copyright_text: '© 2026 Azmina Zahra – The Nikabi Marketer. All rights reserved.',
};

export function WebsiteSettingsPage() {
  const { refreshOverview } = useOutletContext<{ refreshOverview?: () => void }>() || {};

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await getAdminSingleton('site_settings');
      const draft = res.draft;
      const published = res.published;
      const source = draft || published;
      if (source) {
        setForm((prev) => ({
          ...prev,
          ...source,
          logo_url: source.logo_url || '',
          favicon_url: source.favicon_url || '',
          profile_image_url: source.profile_image_url || '',
        }));
      }
      setHasDraftChanges(Boolean(draft));
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
    void loadData();
  }, []);

  const handleChange = (field: string, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveAdminSingleton('site_settings', form, false);
      setMessage({ type: 'success', text: 'Settings draft saved! Preview or publish when ready.' });
      setHasDraftChanges(true);
      if (refreshOverview) refreshOverview();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save settings draft.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setMessage(null);
    try {
      await saveAdminSingleton('site_settings', form, true);
      await publishAdminSingleton('site_settings');
      setMessage({ type: 'success', text: 'Website settings published live!' });
      setHasDraftChanges(false);
      if (refreshOverview) refreshOverview();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to publish settings.',
      });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-[#8B806D]">
        Loading website settings...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#29251F]">Website Global Settings</h1>
            {hasDraftChanges ? (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                Unpublished Draft
              </span>
            ) : (
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                Published Live
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#8B806D]">
            Manage top announcement bar, brand logo, brand colors, and copyright footer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={saving || publishing}
            onClick={() => void handleSaveDraft()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7DCCB] bg-white px-4 py-2 text-xs font-semibold text-[#29251F] shadow-xs transition hover:bg-[#F8F4ED]"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="button"
            disabled={saving || publishing}
            onClick={() => void handlePublish()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#344238] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#29251F]"
          >
            <Send size={14} />
            {publishing ? 'Publishing...' : 'Publish Live'}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-xl p-3 text-xs font-medium border ${
            message.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Announcement Bar */}
        <div className="rounded-2xl border border-[#E7DCCB] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E7DCCB]/60 pb-3">
            <div className="flex items-center gap-2">
              <Bell size={16} className="text-[#344238]" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B806D]">
                Top Announcement Bar
              </h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#29251F]">
              <input
                type="checkbox"
                checked={form.announcement_active}
                onChange={(e) => handleChange('announcement_active', e.target.checked)}
                className="h-4 w-4 rounded-sm border-[#E7DCCB] text-[#344238]"
              />
              <span>Enable Announcement Bar</span>
            </label>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#29251F]">Announcement Message Text</label>
            <input
              type="text"
              value={form.announcement_text || ''}
              onChange={(e) => handleChange('announcement_text', e.target.value)}
              placeholder="e.g. ✨ Now booking Q2 marketing campaigns – Inquire today!"
              className="mt-1 w-full rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 px-3 py-2 text-xs text-[#29251F] focus:border-[#344238] focus:bg-white focus:outline-hidden"
            />
          </div>

          {form.announcement_active && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-600 shrink-0" />
              <span>Preview: {form.announcement_text || 'Announcement text preview'}</span>
            </div>
          )}
        </div>

        {/* Brand Identity */}
        <div className="rounded-2xl border border-[#E7DCCB] bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B806D] border-b border-[#E7DCCB]/60 pb-3">
            Brand Identity
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#29251F]">Site / Brand Name</label>
              <input
                type="text"
                value={form.site_name}
                onChange={(e) => handleChange('site_name', e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 px-3 py-2 text-xs text-[#29251F] focus:border-[#344238] focus:bg-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#29251F]">Owner Name</label>
              <input
                type="text"
                value={form.owner_name}
                onChange={(e) => handleChange('owner_name', e.target.value)}
                className="mt-1 w-full rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 px-3 py-2 text-xs text-[#29251F] focus:border-[#344238] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#29251F]">Professional Title / Role</label>
            <input
              type="text"
              value={form.professional_title}
              onChange={(e) => handleChange('professional_title', e.target.value)}
              className="mt-1 w-full rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 px-3 py-2 text-xs text-[#29251F] focus:border-[#344238] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <ImageUploadField
              label="Site Logo (Header)"
              value={form.logo_url}
              onChange={(url) => handleChange('logo_url', url)}
              folder="branding"
              helperText="Small brand mark or avatar for navigation bar"
            />

            <ImageUploadField
              label="Favicon (Browser Tab)"
              value={form.favicon_url}
              onChange={(url) => handleChange('favicon_url', url)}
              folder="branding"
              helperText="Small square icon (32x32 or 64x64 PNG)"
            />
          </div>
        </div>

        {/* Brand Theme Colors */}
        <div className="rounded-2xl border border-[#E7DCCB] bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#E7DCCB]/60 pb-3">
            <Palette size={16} className="text-[#344238]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B806D]">
              Brand Color Palette
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#29251F]">Primary Olive Accent Color</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={form.brand_primary_color || '#344238'}
                  onChange={(e) => handleChange('brand_primary_color', e.target.value)}
                  className="h-9 w-9 rounded-lg border border-[#E7DCCB] p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.brand_primary_color || '#344238'}
                  onChange={(e) => handleChange('brand_primary_color', e.target.value)}
                  className="flex-1 rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 px-3 py-2 text-xs text-[#29251F] font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#29251F]">Secondary Beige / Accent Color</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="color"
                  value={form.brand_accent_color || '#E7DCCB'}
                  onChange={(e) => handleChange('brand_accent_color', e.target.value)}
                  className="h-9 w-9 rounded-lg border border-[#E7DCCB] p-0.5 cursor-pointer"
                />
                <input
                  type="text"
                  value={form.brand_accent_color || '#E7DCCB'}
                  onChange={(e) => handleChange('brand_accent_color', e.target.value)}
                  className="flex-1 rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 px-3 py-2 text-xs text-[#29251F] font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer & Copyright */}
        <div className="rounded-2xl border border-[#E7DCCB] bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B806D] border-b border-[#E7DCCB]/60 pb-3">
            Footer Copyright Text
          </h2>

          <div>
            <label className="block text-xs font-medium text-[#29251F]">Copyright Notice</label>
            <input
              type="text"
              value={form.copyright_text}
              onChange={(e) => handleChange('copyright_text', e.target.value)}
              placeholder="© 2026 Azmina Zahra. All rights reserved."
              className="mt-1 w-full rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 px-3 py-2 text-xs text-[#29251F] focus:border-[#344238] focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
