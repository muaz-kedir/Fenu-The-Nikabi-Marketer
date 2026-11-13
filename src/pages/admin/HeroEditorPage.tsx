import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Eye, HelpCircle, RotateCcw, Save, Send, Sparkles } from 'lucide-react';
import { getAdminSingleton, publishAdminSingleton, saveAdminSingleton } from '../../services/contentService';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import type { HeroContent } from '../../types/database';

export function HeroEditorPage() {
  const { refreshOverview } = useOutletContext<{ refreshOverview?: () => void }>() || {};

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [form, setForm] = useState<Partial<HeroContent>>({
    greeting: 'Hello, I am',
    full_name: 'Azmina Zahra',
    professional_title: 'Social Media Marketing Specialist',
    subtitle: 'Helping ambitious brands scale with bespoke digital strategies',
    availability_status: 'Available for Q2 Projects',
    description: 'Transforming businesses into industry leaders through organic social dominance, high-converting paid campaigns, and elite digital storytelling.',
    profile_image_url: '',
    profile_image_alt: 'Azmina Zahra - The Nikabi Marketer',
    background_image_url: '',
    primary_button_text: 'Book a Strategy Call',
    primary_button_url: '#contact',
    secondary_button_text: 'View Featured Work',
    secondary_button_url: '#work',
    is_visible: true,
  });

  const [hasDraftChanges, setHasDraftChanges] = useState(false);

  const loadHeroData = async () => {
    try {
      setLoading(true);
      const res = await getAdminSingleton('hero_content');
      const draft = res.draft;
      const published = res.published;
      const activeData = draft || published || {};

      setForm((prev) => ({
        ...prev,
        ...activeData,
      }));

      // Check if draft exists and differs from published
      if (draft && published) {
        setHasDraftChanges(true);
      } else if (draft && !published) {
        setHasDraftChanges(true);
      } else {
        setHasDraftChanges(false);
      }
    } catch (err) {
      setFeedback({ type: 'error', text: err instanceof Error ? err.message : 'Failed to load Hero content.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHeroData();
  }, []);

  const handleChange = (field: keyof HeroContent, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await saveAdminSingleton('hero_content', form, false);
      setFeedback({ type: 'success', text: 'Hero changes saved as draft! Click "Live Preview" to test or "Publish Hero" to make live.' });
      setHasDraftChanges(true);
      if (refreshOverview) refreshOverview();
    } catch (err) {
      setFeedback({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save draft.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublishNow = async () => {
    setPublishing(true);
    setFeedback(null);
    try {
      // First save current form as published
      await saveAdminSingleton('hero_content', form, true);
      await publishAdminSingleton('hero_content');
      setFeedback({ type: 'success', text: 'Hero section published live to visitors!' });
      setHasDraftChanges(false);
      if (refreshOverview) refreshOverview();
    } catch (err) {
      setFeedback({ type: 'error', text: err instanceof Error ? err.message : 'Failed to publish hero.' });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-[#8B806D]">
        Loading Hero settings...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#29251F]">Hero Section Editor</h1>
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
            The main visual hero area introducing Azmina Zahra on the landing page.
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
            onClick={() => void handlePublishNow()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#344238] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#29251F]"
          >
            <Send size={14} />
            {publishing ? 'Publishing...' : 'Publish Hero'}
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

      {/* Main Form Cards */}
      <div className="space-y-6">
        {/* Core Identity */}
        <div className="rounded-2xl border border-[#E7DCCB] bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B806D] border-b border-[#E7DCCB]/60 pb-3">
            Core Introduction & Headings
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#29251F]">Greeting Prefix</label>
              <input
                type="text"
                value={form.greeting || ''}
                onChange={(e) => handleChange('greeting', e.target.value)}
                placeholder="Hello, I am"
                className="mt-1 w-full rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 px-3 py-2 text-xs text-[#29251F] focus:border-[#344238] focus:bg-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#29251F]">Full Name</label>
              <input
                type="text"
                value={form.full_name || ''}
                onChange={(e) => handleChange('full_name', e.target.value)}
                placeholder="Azmina Zahra"
                className="mt-1 w-full rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 px-3 py-2 text-xs text-[#29251F] focus:border-[#344238] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-[#29251F]">Professional Title</label>
              <input
                type="text"
                value={form.professional_title || ''}
                onChange={(e) => handleChange('professional_title', e.target.value)}
                placeholder="Social Media Marketing Specialist"
                className="mt-1 w-full rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 px-3 py-2 text-xs text-[#29251F] focus:border-[#344238] focus:bg-white focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#29251F]">Availability Status Badge</label>
              <input
                type="text"
                value={form.availability_status || ''}
                onChange={(e) => handleChange('availability_status', e.target.value)}
                placeholder="Available for Q2 Projects"
                className="mt-1 w-full rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 px-3 py-2 text-xs text-[#29251F] focus:border-[#344238] focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#29251F]">Catchy Subtitle</label>
            <input
              type="text"
              value={form.subtitle || ''}
              onChange={(e) => handleChange('subtitle', e.target.value)}
              placeholder="Helping ambitious brands scale with bespoke digital strategies"
              className="mt-1 w-full rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 px-3 py-2 text-xs text-[#29251F] focus:border-[#344238] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#29251F]">Hero Bio & Mission Statement</label>
            <textarea
              rows={4}
              value={form.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Transforming businesses into industry leaders..."
              className="mt-1 w-full rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 p-3 text-xs text-[#29251F] focus:border-[#344238] focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Media & Profile Image */}
        <div className="rounded-2xl border border-[#E7DCCB] bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B806D] border-b border-[#E7DCCB]/60 pb-3">
            Hero Imagery
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <ImageUploadField
                label="Profile Picture / Mascot"
                value={form.profile_image_url || ''}
                onChange={(url) => handleChange('profile_image_url', url)}
                altText={form.profile_image_alt || undefined}
                onAltTextChange={(alt) => handleChange('profile_image_alt', alt)}
                folder="hero"
                helperText="Square or portrait photo of Azmina (PNG or JPG recommended)"
              />
            </div>
            <div>
              <ImageUploadField
                label="Hero Background Banner"
                value={form.background_image_url || ''}
                onChange={(url) => handleChange('background_image_url', url)}
                folder="hero"
                helperText="Optional subtle background texture or graphic"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="rounded-2xl border border-[#E7DCCB] bg-white p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B806D] border-b border-[#E7DCCB]/60 pb-3">
            Call to Action Buttons
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3 rounded-xl border border-[#E7DCCB]/50 bg-[#F8F4ED]/30 p-4">
              <span className="text-[11px] font-bold text-[#344238] uppercase">Primary CTA</span>
              <div>
                <label className="block text-[11px] font-medium text-[#29251F]">Button Text</label>
                <input
                  type="text"
                  value={form.primary_button_text || ''}
                  onChange={(e) => handleChange('primary_button_text', e.target.value)}
                  placeholder="Book a Strategy Call"
                  className="mt-1 w-full rounded-lg border border-[#E7DCCB] bg-white px-3 py-1.5 text-xs text-[#29251F]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#29251F]">Button URL / Anchor</label>
                <input
                  type="text"
                  value={form.primary_button_url || ''}
                  onChange={(e) => handleChange('primary_button_url', e.target.value)}
                  placeholder="#contact"
                  className="mt-1 w-full rounded-lg border border-[#E7DCCB] bg-white px-3 py-1.5 text-xs text-[#29251F]"
                />
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-[#E7DCCB]/50 bg-[#F8F4ED]/30 p-4">
              <span className="text-[11px] font-bold text-[#8B806D] uppercase">Secondary CTA</span>
              <div>
                <label className="block text-[11px] font-medium text-[#29251F]">Button Text</label>
                <input
                  type="text"
                  value={form.secondary_button_text || ''}
                  onChange={(e) => handleChange('secondary_button_text', e.target.value)}
                  placeholder="View Featured Work"
                  className="mt-1 w-full rounded-lg border border-[#E7DCCB] bg-white px-3 py-1.5 text-xs text-[#29251F]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-[#29251F]">Button URL / Anchor</label>
                <input
                  type="text"
                  value={form.secondary_button_url || ''}
                  onChange={(e) => handleChange('secondary_button_url', e.target.value)}
                  placeholder="#work"
                  className="mt-1 w-full rounded-lg border border-[#E7DCCB] bg-white px-3 py-1.5 text-xs text-[#29251F]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
