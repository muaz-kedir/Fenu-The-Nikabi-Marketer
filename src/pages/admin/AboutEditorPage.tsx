import { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Eye, Loader2, Plus, RotateCcw, Save, Send, Trash2, Users } from 'lucide-react';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import {
  adminCreate,
  adminDelete,
  adminList,
  getAdminSingleton,
  publishAdminSingleton,
  saveAdminSingleton,
} from '../../services/contentService';
import type { AboutContent, SkillItem } from '../../types/database';

export function AboutEditorPage() {
  const { refreshOverview } = useOutletContext<{ refreshOverview?: () => void }>() || {};

  const [form, setForm] = useState<Partial<AboutContent>>({
    title: 'Transforming Brands Through Strategic Digital Marketing',
    subtitle: 'About Me',
    intro_heading: 'Meet Azmina Zahra – The Nikabi Marketer',
    description: '',
    profile_image_url: '',
    profile_image_alt: 'Azmina Zahra',
    experience_years: 5,
    additional_description: '',
    is_visible: true,
  });

  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [hasDraftChanges, setHasDraftChanges] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [res, skillsList] = await Promise.all([
        getAdminSingleton('about_content'),
        adminList<SkillItem>('skills').catch(() => []),
      ]);

      const draft = res.draft;
      const published = res.published;
      const source = draft || published;
      if (source) {
        setForm({
          title: source.title || '',
          subtitle: source.subtitle || 'About Me',
          intro_heading: source.intro_heading || 'Meet Azmina Zahra – The Nikabi Marketer',
          description: source.description || '',
          profile_image_url: source.profile_image_url || '',
          profile_image_alt: source.profile_image_alt || 'Azmina Zahra',
          experience_years: source.experience_years ?? 5,
          additional_description: source.additional_description || '',
          is_visible: source.is_visible !== false,
        });
      }

      setSkills(skillsList);
      setHasDraftChanges(Boolean(draft));
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
    void loadData();
  }, []);

  const handleChange = (field: keyof AboutContent, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await saveAdminSingleton('about_content', form, false);
      setMessage({ type: 'success', text: 'About draft saved! Preview changes or publish to make live.' });
      setHasDraftChanges(true);
      if (refreshOverview) refreshOverview();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save draft.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    setPublishing(true);
    setMessage(null);
    try {
      await saveAdminSingleton('about_content', form, true);
      await publishAdminSingleton('about_content');
      setMessage({ type: 'success', text: 'About Me section published to the live website!' });
      setHasDraftChanges(false);
      if (refreshOverview) refreshOverview();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to publish.',
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleAddSkill = async () => {
    if (!newSkillName.trim()) return;
    try {
      const created = await adminCreate<SkillItem>('skills', {
        name: newSkillName.trim(),
        display_order: skills.length + 1,
        is_published: true,
        is_visible: true,
      });
      setSkills((prev) => [...prev, created]);
      setNewSkillName('');
    } catch (err) {
      alert('Failed to add skill.');
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      await adminDelete('skills', id);
      setSkills((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert('Failed to delete skill.');
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-xs text-white/50">
        Loading About Me editor...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-white">About Me Editor</h1>
            {hasDraftChanges ? (
              <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                Unpublished Draft
              </span>
            ) : (
              <span className="rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300">
                Published Live
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-white/60">
            Craft your biography, professional background story, and key marketing skill tags.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={saving || publishing}
            onClick={() => void handleSaveDraft()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:border-[#f04796]/50 hover:bg-white/10 hover:text-[#f6b7d2]"
          >
            <Save size={14} />
            {saving ? 'Saving...' : 'Save Draft'}
          </button>
          <button
            type="button"
            disabled={saving || publishing}
            onClick={() => void handlePublish()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#f04796] bg-[#f04796] px-4 py-2 text-xs font-bold text-[#0d0d0f] shadow-[0_0_20px_rgba(240,71,150,0.35)] transition hover:bg-[#ff6ab3] hover:shadow-[0_0_25px_rgba(240,71,150,0.5)]"
          >
            <Send size={14} />
            {publishing ? 'Publishing...' : 'Publish About'}
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`rounded-xl p-3 text-xs font-medium border ${
            message.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Main Content Form */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-white/10 bg-[#131117] p-6 shadow-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/50 border-b border-white/10 pb-3">
            Biography Headings
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-white/80">Subtitle Tag</label>
              <input
                type="text"
                value={form.subtitle || ''}
                onChange={(e) => handleChange('subtitle', e.target.value)}
                placeholder="About Me"
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-white/80">Years of Experience</label>
              <input
                type="number"
                value={form.experience_years ?? 5}
                onChange={(e) => handleChange('experience_years', Number(e.target.value))}
                placeholder="5"
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80">Introductory Heading</label>
            <input
              type="text"
              value={form.intro_heading || ''}
              onChange={(e) => handleChange('intro_heading', e.target.value)}
              placeholder="Meet Fenu – The Naqabi Marketer"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80">Main Title</label>
            <input
              type="text"
              value={form.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Transforming Brands Through Strategic Digital Marketing"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80">Primary Biography</label>
            <textarea
              rows={5}
              value={form.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Write your background, journey, and market specialization..."
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] p-3 text-xs text-white placeholder:text-white/30 focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white/80">Additional Story / Philosophy</label>
            <textarea
              rows={3}
              value={form.additional_description || ''}
              onChange={(e) => handleChange('additional_description', e.target.value)}
              placeholder="Additional paragraph explaining your core values, work ethic, or vision..."
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] p-3 text-xs text-white placeholder:text-white/30 focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:outline-hidden"
            />
          </div>
        </div>

        {/* Profile Image Upload */}
        <div className="rounded-2xl border border-white/10 bg-[#131117] p-6 shadow-xl space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/50 border-b border-white/10 pb-3">
            About Section Portrait Photo
          </h2>

          <ImageUploadField
            label="About Section Portrait"
            value={form.profile_image_url || ''}
            onChange={(url) => handleChange('profile_image_url', url)}
            altText={form.profile_image_alt || undefined}
            onAltTextChange={(alt) => handleChange('profile_image_alt', alt)}
            folder="about"
            helperText="High-quality photo for the About Me section"
          />
        </div>

        {/* Skills & Competencies List */}
        <div className="rounded-2xl border border-white/10 bg-[#131117] p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-white/50">
                Core Skills & Competencies
              </h2>
              <p className="text-[11px] text-white/60">Displayed as interactive badges on the landing page</p>
            </div>
            <Link to="/admin/skills" className="text-xs font-semibold text-[#f6b7d2] hover:underline flex items-center gap-1">
              Full Manager <ArrowRight size={12} />
            </Link>
          </div>

          {/* Add skill inline */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  void handleAddSkill();
                }
              }}
              placeholder="Add skill (e.g. Meta Ads, Growth Hacking, Video Editing)..."
              className="flex-1 rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white placeholder:text-white/30 focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:outline-hidden"
            />
            <button
              type="button"
              onClick={() => void handleAddSkill()}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#f04796] bg-[#f04796] px-4 py-2 text-xs font-bold text-[#0d0d0f] shadow-[0_0_15px_rgba(240,71,150,0.3)] transition hover:bg-[#ff6ab3]"
            >
              <Plus size={14} /> Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#f04796]/30 bg-[#f04796]/10 px-3 py-1.5 text-xs font-medium text-[#f6b7d2]"
              >
                <span>{skill.name}</span>
                <button
                  type="button"
                  onClick={() => void handleDeleteSkill(skill.id)}
                  title="Remove skill"
                  className="text-[#f6b7d2]/60 hover:text-rose-400 transition"
                >
                  <Trash2 size={12} />
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
