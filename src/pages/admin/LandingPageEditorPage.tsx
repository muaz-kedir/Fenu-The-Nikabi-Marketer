import { useEffect, useState } from 'react';
import { getAdminSingleton, publishAdminSingleton, saveAdminSingleton } from '../../services/contentService';

type Tab = 'hero' | 'cta' | 'footer';

const heroFields = ['greeting', 'full_name', 'professional_title', 'description', 'profile_image_url', 'background_image_url', 'primary_button_text', 'primary_button_url', 'secondary_button_text', 'secondary_button_url'];
const ctaFields = ['script_greeting', 'main_heading', 'supporting_description', 'highlighted_words', 'button_text', 'button_url'];
const footerFields = ['copyright_text', 'email', 'phone', 'instagram_url', 'tiktok_url', 'linkedin_url', 'whatsapp_url', 'footer_description'];

export function LandingPageEditorPage() {
  const [tab, setTab] = useState<Tab>('hero');
  const [hero, setHero] = useState<Record<string, string>>(Object.fromEntries(heroFields.map((f) => [f, ''])));
  const [cta, setCta] = useState<Record<string, string>>(Object.fromEntries(ctaFields.map((f) => [f, ''])));
  const [footer, setFooter] = useState<Record<string, string>>(Object.fromEntries(footerFields.map((f) => [f, ''])));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const heroResult = await getAdminSingleton('hero_content');
      const ctaResult = await getAdminSingleton('cta_content');
      const footerResult = await getAdminSingleton('footer_content');
      const heroSource = heroResult.draft || heroResult.published;
      const ctaSource = ctaResult.draft || ctaResult.published;
      const footerSource = footerResult.draft || footerResult.published;
      if (heroSource) for (const field of heroFields) setHero((prev) => ({ ...prev, [field]: heroSource[field] ?? '' }));
      if (ctaSource) for (const field of ctaFields) setCta((prev) => ({ ...prev, [field]: ctaSource[field] ?? '' }));
      if (footerSource) for (const field of footerFields) setFooter((prev) => ({ ...prev, [field]: footerSource[field] ?? '' }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load landing content.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const saveDraft = async () => {
    setSaving(true);
    setMessage('');
    try {
      if (tab === 'hero') await saveAdminSingleton('hero_content', hero, false);
      if (tab === 'cta') await saveAdminSingleton('cta_content', cta, false);
      if (tab === 'footer') await saveAdminSingleton('footer_content', footer, false);
      await load();
      setMessage('Draft saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save draft.');
    } finally { setSaving(false); }
  };

  const publish = async () => {
    setSaving(true);
    setMessage('');
    try {
      if (tab === 'hero') { await saveAdminSingleton('hero_content', hero, false); await publishAdminSingleton('hero_content'); }
      if (tab === 'cta') { await saveAdminSingleton('cta_content', cta, false); await publishAdminSingleton('cta_content'); }
      if (tab === 'footer') { await saveAdminSingleton('footer_content', footer, false); await publishAdminSingleton('footer_content'); }
      await load();
      setMessage('Published.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to publish.');
    } finally { setSaving(false); }
  };

  const currentForm = tab === 'hero' ? hero : tab === 'cta' ? cta : footer;
  const setCurrentForm = tab === 'hero' ? setHero : tab === 'cta' ? setCta : setFooter;
  const currentFields = tab === 'hero' ? heroFields : tab === 'cta' ? ctaFields : footerFields;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Landing Page</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Hero & page editing</h1>
      </div>
      <div className="flex gap-2">
        {(['hero', 'cta', 'footer'] as Tab[]).map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-full px-4 py-2 text-sm ${tab === item ? 'bg-[#f04796] text-[#0d0d0f]' : 'border border-white/10 bg-white/5 text-white/70'}`}>
            {item.toUpperCase()}
          </button>
        ))}
      </div>
      {message && <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{message}</div>}
      {loading ? <div className="text-white/60">Loading landing content...</div> : (
        <form onSubmit={(event) => { event.preventDefault(); void saveDraft(); }} className="rounded-[28px] border border-white/10 bg-[#141414] p-6">
          <div className="grid gap-4 md:grid-cols-2">
            {currentFields.map((field) => (
              <label key={field} className={`block text-sm text-white/70 ${field.includes('description') ? 'md:col-span-2' : ''}`}>
                {field.replace(/_/g, ' ')}
                {field.includes('description') ? (
                  <textarea rows={4} value={currentForm[field]} onChange={(event) => setCurrentForm({ ...currentForm, [field]: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
                ) : (
                  <input value={currentForm[field]} onChange={(event) => setCurrentForm({ ...currentForm, [field]: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
                )}
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
