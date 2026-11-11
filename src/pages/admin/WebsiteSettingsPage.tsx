import { useEffect, useState } from 'react';
import { getAdminSingleton, publishAdminSingleton, saveAdminSingleton } from '../../services/contentService';

const fields = ['site_name', 'owner_name', 'professional_title', 'email', 'phone', 'location', 'logo_url', 'favicon_url', 'profile_image_url', 'resume_url', 'instagram_url', 'tiktok_url', 'linkedin_url', 'whatsapp_url', 'seo_title', 'seo_description', 'copyright_text'];

const emptyForm = Object.fromEntries(fields.map((field) => [field, '']));

export function WebsiteSettingsPage() {
  const [form, setForm] = useState<Record<string, string>>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const result = await getAdminSingleton('site_settings');
      const source = result.draft || result.published;
      const next = { ...emptyForm };
      if (source) {
        for (const field of fields) next[field] = source[field] ?? '';
      }
      setForm(next);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load settings.');
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
      await saveAdminSingleton('site_settings', form, false);
      await load();
      setMessage('Settings draft saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save settings.');
    } finally { setSaving(false); }
  };

  const publish = async () => {
    setSaving(true);
    setMessage('');
    try {
      await saveAdminSingleton('site_settings', form, false);
      await publishAdminSingleton('site_settings');
      await load();
      setMessage('Settings published.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to publish settings.');
    } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Website Settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Update brand and site configuration</h1>
      </div>
      {message && <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{message}</div>}
      {loading ? <div className="text-white/60">Loading settings...</div> : (
        <form onSubmit={saveDraft} className="rounded-[28px] border border-white/10 bg-[#141414] p-6">
          <div className="grid gap-6 md:grid-cols-2">
            {fields.map((field) => (
              <label key={field} className="block text-sm text-white/70">
                {field.replace(/_/g, ' ')}
                <input value={form[field]} onChange={(event) => setForm({ ...form, [field]: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
              </label>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button type="submit" disabled={saving} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 disabled:opacity-70">{saving ? 'Saving...' : 'Save draft'}</button>
            <button type="button" onClick={() => void publish()} disabled={saving} className="rounded-full border border-[#f04796] bg-[#f04796] px-5 py-2.5 text-sm font-medium text-[#0d0d0f] disabled:opacity-70">Publish</button>
          </div>
        </form>
      )}
    </div>
  );
}
