import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import { getAdminSingleton, publishAdminSingleton, saveAdminSingleton } from '../../services/contentService';

const emptyForm = {
  title: '',
  subtitle: 'About Me',
  description: '',
  profile_image_url: '',
  profile_image_alt: '',
  additional_description: '',
};

export function AboutEditorPage() {
  const [form, setForm] = useState(emptyForm);
  const [published, setPublished] = useState<any>(null);
  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const result = await getAdminSingleton('about_content');
      setPublished(result.published);
      setDraft(result.draft);
      const source = result.draft || result.published;
      if (source) {
        setForm({
          title: source.title || '',
          subtitle: source.subtitle || 'About Me',
          description: source.description || '',
          profile_image_url: source.profile_image_url || '',
          profile_image_alt: source.profile_image_alt || '',
          additional_description: source.additional_description || '',
        });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to load about content.',
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
      await saveAdminSingleton('about_content', form, false);
      await load();
      setMessage({ type: 'success', text: 'About draft saved. Not yet live on public site.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save draft.',
      });
    } finally {
      setSaving(false);
    }
  };

  const publish = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveAdminSingleton('about_content', form, false);
      await publishAdminSingleton('about_content');
      await load();
      setMessage({ type: 'success', text: 'About section published! Visible on public site.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to publish.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">About Me</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Edit Profile Story & Biography</h1>
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
        <div className="flex h-64 items-center justify-center text-white/60">
          <Loader2 size={24} className="animate-spin mr-2 text-[#f04796]" />
          Loading about content...
        </div>
      ) : (
        <form onSubmit={saveDraft} className="rounded-[28px] border border-white/10 bg-[#141416] p-6 space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Subtitle / Badge</label>
              <input
                type="text"
                value={form.subtitle}
                onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                placeholder="About Me"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/70 mb-1.5">Section Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                placeholder="A brand storyteller with strategy in her DNA."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-white/70 mb-1.5">Main Biography</label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                placeholder="Introduce yourself and your expertise..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-white/70 mb-1.5">Additional Description</label>
              <textarea
                rows={4}
                value={form.additional_description}
                onChange={(e) => setForm({ ...form, additional_description: e.target.value })}
                className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                placeholder="Supporting background or client methodology..."
              />
            </div>

            <div className="md:col-span-2">
              <ImageUploadField
                label="Portrait Photograph"
                value={form.profile_image_url}
                onChange={(url) => setForm({ ...form, profile_image_url: url })}
                altText={form.profile_image_alt}
                onAltTextChange={(alt) => setForm({ ...form, profile_image_alt: alt })}
                folder="about"
                aspect="square"
                helperText="Displayed in the large photo card on the About section"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
            <button
              type="button"
              onClick={() => {
                const fallback = published || draft;
                if (fallback) {
                  setForm({
                    title: fallback.title || '',
                    subtitle: fallback.subtitle || 'About Me',
                    description: fallback.description || '',
                    profile_image_url: fallback.profile_image_url || '',
                    profile_image_alt: fallback.profile_image_alt || '',
                    additional_description: fallback.additional_description || '',
                  });
                  setMessage({ type: 'success', text: 'Reverted to previous saved version.' });
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
                {saving ? 'Publishing...' : 'Publish About Changes'}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
