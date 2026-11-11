import { useEffect, useState } from 'react';
import { getAdminSingleton, publishAdminSingleton, saveAdminSingleton } from '../../services/contentService';

const emptyForm = { title: '', subtitle: '', description: '', profile_image_url: '', additional_description: '' };

export function AboutEditorPage() {
  const [form, setForm] = useState(emptyForm);
  const [published, setPublished] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const result = await getAdminSingleton('about_content');
      const source = result.draft || result.published;
      setPublished(result.published);
      setForm(source ? {
        title: source.title || '',
        subtitle: source.subtitle || '',
        description: source.description || '',
        profile_image_url: source.profile_image_url || '',
        additional_description: source.additional_description || '',
      } : emptyForm);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load about content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const saveDraft = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await saveAdminSingleton('about_content', form, false);
      await load();
      setMessage('About draft saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save draft.');
    } finally { setSaving(false); }
  };

  const publish = async () => {
    setSaving(true);
    setMessage('');
    try {
      await saveAdminSingleton('about_content', form, false);
      await publishAdminSingleton('about_content');
      await load();
      setMessage('About published.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to publish.');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">About Me</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Edit profile story</h1>
      </div>
      {message && <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{message}</div>}
      {loading ? <div className="text-white/60">Loading about content...</div> : (
        <form onSubmit={saveDraft} className="rounded-[28px] border border-white/10 bg-[#141414] p-6 space-y-4">
          <label className="block text-sm text-white/70">Title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/70">Subtitle<input value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/70">Bio<textarea rows={5} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/70">Profile image URL<input value={form.profile_image_url} onChange={(event) => setForm({ ...form, profile_image_url: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/70">Additional description<textarea rows={5} value={form.additional_description} onChange={(event) => setForm({ ...form, additional_description: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <div className="flex justify-end gap-3">
            <button type="submit" disabled={saving} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 disabled:opacity-70">{saving ? 'Saving...' : 'Save draft'}</button>
            <button type="button" onClick={() => void publish()} disabled={saving} className="rounded-full border border-[#f04796] bg-[#f04796] px-5 py-2.5 text-sm font-medium text-[#0d0d0f] disabled:opacity-70">Publish</button>
          </div>
        </form>
      )}
    </div>
  );
}
