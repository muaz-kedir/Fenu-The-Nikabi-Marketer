import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Globe, HelpCircle, Save, Search, Send, Share2, Sparkles } from 'lucide-react';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import { getAdminSingleton, publishAdminSingleton, saveAdminSingleton } from '../../services/contentService';
import type { SiteSettings } from '../../types/database';

export function SeoSettingsPage() {
  const { refreshOverview } = useOutletContext<{ refreshOverview?: () => void }>() || {};

  const [form, setForm] = useState<Partial<SiteSettings>>({
    site_name: 'Azmina Zahra | The Nikabi Marketer',
    seo_title: 'Azmina Zahra – Social Media Marketing Specialist',
    seo_description: 'Transforming ambitious brands through high-converting paid social campaigns, organic viral strategies, and bespoke digital storytelling.',
    keywords: 'social media marketer, nikabi marketer, modest fashion marketing, meta ads, instagram growth',
    canonical_url: 'https://fenu-the-niqabi-marketer.app.aletcloud.com',
    og_title: 'Azmina Zahra – The Nikabi Marketer',
    og_description: 'Bespoke social media marketing, content creation, and brand scaling strategies.',
    og_image_url: '',
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
      setFeedback({ type: 'error', text: 'Failed to load SEO settings.' });
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
      setFeedback({ type: 'success', text: 'SEO settings saved as draft!' });
      if (refreshOverview) refreshOverview();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to save SEO draft.' });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setFeedback(null);
    try {
      await saveAdminSingleton('site_settings', form, true);
      await publishAdminSingleton('site_settings');
      setFeedback({ type: 'success', text: 'SEO meta tags published live to visitors and search crawlers!' });
      if (refreshOverview) refreshOverview();
    } catch (err) {
      setFeedback({ type: 'error', text: 'Failed to publish SEO settings.' });
    } finally {
      setPublishing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-white/60">
        Loading SEO settings...
      </div>
    );
  }

  const effectiveTitle = form.seo_title || form.site_name || 'Azmina Zahra - Portfolio';
  const effectiveDesc = form.seo_description || 'Social Media Marketing Specialist and Brand Strategist.';
  const effectiveOgTitle = form.og_title || effectiveTitle;
  const effectiveOgDesc = form.og_description || effectiveDesc;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Search Engine Optimization & Social Sharing</h1>
          <p className="mt-1 text-xs text-white/60">
            Manage search engine rankings, Google snippet preview, keywords, and OpenGraph social share cards.
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
            {publishing ? 'Publishing...' : 'Publish SEO'}
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

      {/* Visual Live Previews */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Google SERP Preview */}
        <div className="rounded-2xl border border-white/10 bg-[#131117] p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60 border-b border-white/10 pb-2">
            <Search size={14} className="text-[#f6b7d2]" /> Google Search Result Preview
          </div>

          <div className="rounded-xl border border-slate-200 bg-[#131117] p-4 font-sans text-left shadow-xs">
            <div className="flex items-center gap-2 text-[11px] text-slate-700">
              <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-100 font-bold text-[9px]">F</span>
              <span className="truncate">{form.canonical_url || 'https://fenu-portfolio.com'}</span>
            </div>
            <h3 className="mt-1 text-sm font-medium text-[#1a0dab] line-clamp-1 hover:underline cursor-pointer">
              {effectiveTitle}
            </h3>
            <p className="mt-1 text-xs text-[#4d5156] line-clamp-2 leading-relaxed">
              {effectiveDesc}
            </p>
          </div>
        </div>

        {/* Social Card Preview */}
        <div className="rounded-2xl border border-white/10 bg-[#131117] p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60 border-b border-white/10 pb-2">
            <Share2 size={14} className="text-[#f6b7d2]" /> Social Share Card (OG Preview)
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-xs">
            <div className="h-28 w-full bg-slate-200 flex items-center justify-center overflow-hidden">
              {form.og_image_url ? (
                <img src={form.og_image_url} alt="Social banner" className="h-full w-full object-cover" />
              ) : (
                <span className="text-[11px] text-slate-500">1200 x 630 Social Banner Preview</span>
              )}
            </div>
            <div className="p-3 bg-white">
              <div className="text-[10px] uppercase text-slate-400 font-mono">fenu-the-niqabi-marketer.app.aletcloud.com</div>
              <div className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">{effectiveOgTitle}</div>
              <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{effectiveOgDesc}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Editable Fields Form */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-[#131117] p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 border-b border-white/10 pb-3">
            Primary Meta Tags
          </h2>

          <div>
            <label className="block text-xs font-medium text-white">Page Meta Title (50-60 characters)</label>
            <input
              type="text"
              value={form.seo_title || ''}
              onChange={(e) => handleChange('seo_title', e.target.value)}
              placeholder="Azmina Zahra – Social Media Marketing Specialist"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
            />
            <span className="text-[10px] text-white/60 mt-1 block">
              Character count: {(form.seo_title || '').length} (Optimal: 40 - 60)
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-white">Meta Description (140-160 characters)</label>
            <textarea
              rows={3}
              value={form.seo_description || ''}
              onChange={(e) => handleChange('seo_description', e.target.value)}
              placeholder="Transforming ambitious brands through high-converting paid social campaigns..."
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] p-3 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
            />
            <span className="text-[10px] text-white/60 mt-1 block">
              Character count: {(form.seo_description || '').length} (Optimal: 120 - 160)
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-white">Keywords (Comma-separated)</label>
              <input
                type="text"
                value={form.keywords || ''}
                onChange={(e) => handleChange('keywords', e.target.value)}
                placeholder="social media marketing, viral campaigns, branding"
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white">Canonical URL</label>
              <input
                type="text"
                value={form.canonical_url || ''}
                onChange={(e) => handleChange('canonical_url', e.target.value)}
                placeholder="https://fenu-the-niqabi-marketer.app.aletcloud.com"
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#131117] p-6 shadow-xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 border-b border-white/10 pb-3">
            OpenGraph & Social Sharing Meta
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-white">OG Title</label>
              <input
                type="text"
                value={form.og_title || ''}
                onChange={(e) => handleChange('og_title', e.target.value)}
                placeholder="Azmina Zahra – The Nikabi Marketer"
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-white">OG Description</label>
              <input
                type="text"
                value={form.og_description || ''}
                onChange={(e) => handleChange('og_description', e.target.value)}
                placeholder="Bespoke social media marketing and brand scaling..."
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
              />
            </div>
          </div>

          <ImageUploadField
            label="Social Share Image (OG Image 1200x630)"
            value={form.og_image_url || ''}
            onChange={(url) => handleChange('og_image_url', url)}
            folder="seo"
            helperText="Appears when your website URL is shared on WhatsApp, LinkedIn, X, and Facebook"
          />
        </div>
      </div>
    </div>
  );
}
