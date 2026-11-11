import { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Award,
  BarChart3,
  Check,
  Eye,
  EyeOff,
  FolderKanban,
  HelpCircle,
  Layout,
  Loader2,
  Megaphone,
  MessageSquare,
  MessageSquareQuote,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
} from 'lucide-react';
import { ImageUploadField } from '../../components/admin/ImageUploadField';
import {
  adminCreate,
  adminDelete,
  adminList,
  adminPublish,
  adminReorder,
  adminUnpublish,
  adminUpdate,
  getAdminSingleton,
  publishAdminSingleton,
  saveAdminSingleton,
} from '../../services/contentService';
import type {
  PageSection,
  ProcessStep,
  ProjectItem,
  ServiceItem,
  SkillItem,
  Statistic,
  TestimonialItem,
} from '../../types/database';

type EditorTab =
  | 'hero'
  | 'stats'
  | 'about'
  | 'services'
  | 'work'
  | 'skills'
  | 'process'
  | 'testimonials'
  | 'cta'
  | 'footer'
  | 'layout';

const tabs: { id: EditorTab; label: string; icon: typeof Sparkles }[] = [
  { id: 'hero', label: 'Hero Section', icon: Sparkles },
  { id: 'stats', label: 'Statistics', icon: TrendingUp },
  { id: 'about', label: 'About Me', icon: Users },
  { id: 'services', label: 'Services', icon: Megaphone },
  { id: 'work', label: 'Featured Work', icon: FolderKanban },
  { id: 'skills', label: 'Skills & Tools', icon: Award },
  { id: 'process', label: 'Process', icon: BarChart3 },
  { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
  { id: 'cta', label: 'Final CTA', icon: MessageSquare },
  { id: 'footer', label: 'Footer', icon: HelpCircle },
  { id: 'layout', label: 'Sections & Order', icon: Layout },
];

export function LandingPageEditorPage() {
  const [activeTab, setActiveTab] = useState<EditorTab>('hero');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 1. Hero State
  const [heroForm, setHeroForm] = useState({
    greeting: "Hello, I'm",
    full_name: 'Azmina Zahra',
    professional_title: 'Social Media Marketing Specialist',
    description: '',
    profile_image_url: '',
    profile_image_alt: '',
    background_image_url: '',
    primary_button_text: 'View My Work',
    primary_button_url: '#work',
    secondary_button_text: "Let's Work Together",
    secondary_button_url: '#contact',
  });
  const [heroPublished, setHeroPublished] = useState<any>(null);
  const [heroDraft, setHeroDraft] = useState<any>(null);

  // 2. Statistics State
  const [stats, setStats] = useState<Statistic[]>([]);
  const [editingStat, setEditingStat] = useState<Partial<Statistic> | null>(null);

  // 3. About State
  const [aboutForm, setAboutForm] = useState({
    title: '',
    subtitle: 'About Me',
    description: '',
    profile_image_url: '',
    profile_image_alt: '',
    additional_description: '',
  });
  const [aboutPublished, setAboutPublished] = useState<any>(null);
  const [aboutDraft, setAboutDraft] = useState<any>(null);

  // 4. Services State
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);

  // 5. Projects State
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [editingProject, setEditingProject] = useState<Partial<ProjectItem> | null>(null);

  // 6. Skills State
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [editingSkill, setEditingSkill] = useState<Partial<SkillItem> | null>(null);

  // 7. Process State
  const [processSteps, setProcessSteps] = useState<ProcessStep[]>([]);
  const [editingProcess, setEditingProcess] = useState<Partial<ProcessStep> | null>(null);

  // 8. Testimonials State
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [editingTestimonial, setEditingTestimonial] = useState<Partial<TestimonialItem> | null>(null);

  // 9. CTA State
  const [ctaForm, setCtaForm] = useState({
    script_greeting: 'Thank you for your support!',
    main_heading: 'Ready to grow your brand?',
    supporting_description: '',
    highlighted_words: 'building,growing',
    button_text: 'Contact Me',
    button_url: 'https://wa.me/971521234567',
  });
  const [ctaPublished, setCtaPublished] = useState<any>(null);
  const [ctaDraft, setCtaDraft] = useState<any>(null);

  // 10. Footer State
  const [footerForm, setFooterForm] = useState({
    copyright_text: '',
    email: '',
    phone: '',
    instagram_url: '',
    tiktok_url: '',
    linkedin_url: '',
    whatsapp_url: '',
    footer_description: '',
  });
  const [footerPublished, setFooterPublished] = useState<any>(null);
  const [footerDraft, setFooterDraft] = useState<any>(null);

  // 11. Page Sections Layout State
  const [sections, setSections] = useState<PageSection[]>([]);

  // Load active tab data
  const loadTabData = async () => {
    setLoading(true);
    setMessage(null);
    try {
      if (activeTab === 'hero') {
        const res = await getAdminSingleton('hero_content');
        setHeroPublished(res.published);
        setHeroDraft(res.draft);
        const active = res.draft || res.published;
        if (active) {
          setHeroForm({
            greeting: active.greeting || "Hello, I'm",
            full_name: active.full_name || '',
            professional_title: active.professional_title || '',
            description: active.description || '',
            profile_image_url: active.profile_image_url || '',
            profile_image_alt: active.profile_image_alt || '',
            background_image_url: active.background_image_url || '',
            primary_button_text: active.primary_button_text || 'View My Work',
            primary_button_url: active.primary_button_url || '#work',
            secondary_button_text: active.secondary_button_text || "Let's Work Together",
            secondary_button_url: active.secondary_button_url || '#contact',
          });
        }
      } else if (activeTab === 'stats') {
        const list = await adminList<Statistic>('statistics');
        setStats(list);
      } else if (activeTab === 'about') {
        const res = await getAdminSingleton('about_content');
        setAboutPublished(res.published);
        setAboutDraft(res.draft);
        const active = res.draft || res.published;
        if (active) {
          setAboutForm({
            title: active.title || '',
            subtitle: active.subtitle || 'About Me',
            description: active.description || '',
            profile_image_url: active.profile_image_url || '',
            profile_image_alt: active.profile_image_alt || '',
            additional_description: active.additional_description || '',
          });
        }
      } else if (activeTab === 'services') {
        const list = await adminList<ServiceItem>('services');
        setServices(list);
      } else if (activeTab === 'work') {
        const list = await adminList<ProjectItem>('projects');
        setProjects(list);
      } else if (activeTab === 'skills') {
        const list = await adminList<SkillItem>('skills');
        setSkills(list);
      } else if (activeTab === 'process') {
        const list = await adminList<ProcessStep>('process');
        setProcessSteps(list);
      } else if (activeTab === 'testimonials') {
        const list = await adminList<TestimonialItem>('testimonials');
        setTestimonials(list);
      } else if (activeTab === 'cta') {
        const res = await getAdminSingleton('cta_content');
        setCtaPublished(res.published);
        setCtaDraft(res.draft);
        const active = res.draft || res.published;
        if (active) {
          setCtaForm({
            script_greeting: active.script_greeting || 'Thank you for your support!',
            main_heading: active.main_heading || 'Ready to grow your brand?',
            supporting_description: active.supporting_description || '',
            highlighted_words: active.highlighted_words || 'building,growing',
            button_text: active.button_text || 'Contact Me',
            button_url: active.button_url || 'https://wa.me/971521234567',
          });
        }
      } else if (activeTab === 'footer') {
        const res = await getAdminSingleton('footer_content');
        setFooterPublished(res.published);
        setFooterDraft(res.draft);
        const active = res.draft || res.published;
        if (active) {
          setFooterForm({
            copyright_text: active.copyright_text || '',
            email: active.email || '',
            phone: active.phone || '',
            instagram_url: active.instagram_url || '',
            tiktok_url: active.tiktok_url || '',
            linkedin_url: active.linkedin_url || '',
            whatsapp_url: active.whatsapp_url || '',
            footer_description: active.footer_description || '',
          });
        }
      } else if (activeTab === 'layout') {
        const list = await adminList<PageSection>('sections');
        setSections(list);
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Failed to load section data.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTabData();
  }, [activeTab]);

  // Singletons: Save Draft & Publish
  const saveSingletonDraft = async (table: string, payload: Record<string, unknown>) => {
    setSaving(true);
    setMessage(null);
    try {
      await saveAdminSingleton(table, payload, false);
      await loadTabData();
      setMessage({ type: 'success', text: 'Draft saved. Changes will not be visible publicly until published.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to save draft.' });
    } finally {
      setSaving(false);
    }
  };

  const publishSingleton = async (table: string, payload: Record<string, unknown>) => {
    setSaving(true);
    setMessage(null);
    try {
      await saveAdminSingleton(table, payload, false);
      await publishAdminSingleton(table);
      await loadTabData();
      setMessage({ type: 'success', text: 'Published successfully! Changes are now live on the public website.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to publish changes.' });
    } finally {
      setSaving(false);
    }
  };

  // Generic Reorder
  const handleReorder = async (resource: string, list: { id: string }[], fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= list.length) return;
    const reordered = [...list];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const ids = reordered.map((item) => item.id);
    try {
      await adminReorder(resource, ids);
      await loadTabData();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to reorder items.' });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Landing Page CMS</p>
          <h1 className="mt-1 text-3xl font-bold text-white">Full Landing Page Content Manager</h1>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <Eye size={14} /> View Live Website
          </a>
          <button
            type="button"
            onClick={() => void loadTabData()}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 hover:text-white"
            title="Refresh current tab data"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-white/10">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActiveTab(id)}
            className={`inline-flex shrink-0 items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === id
                ? 'bg-[#f04796] text-[#0d0d0f] shadow-[0_0_20px_rgba(240,71,150,0.35)]'
                : 'border border-white/5 bg-[#141416] text-white/70 hover:border-white/15 hover:text-white'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-2xl border px-5 py-3 text-sm ${
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
          Loading {tabs.find((t) => t.id === activeTab)?.label}...
        </div>
      ) : (
        /* TAB 1: HERO SECTION */
        activeTab === 'hero' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white">Hero Section Content</h2>
                <p className="text-xs text-white/50">Manage greeting, titles, CTAs, and profile photo.</p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {heroDraft && (
                  <span className="rounded-full bg-amber-500/20 px-3 py-1 font-medium text-amber-300">
                    Draft Pending
                  </span>
                )}
                {heroPublished && (
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-medium text-emerald-300">
                    Live Published
                  </span>
                )}
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void saveSingletonDraft('hero_content', heroForm);
              }}
              className="rounded-[28px] border border-white/10 bg-[#141416] p-6 space-y-6"
            >
              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Greeting Badge</label>
                  <input
                    type="text"
                    value={heroForm.greeting}
                    onChange={(e) => setHeroForm({ ...heroForm, greeting: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                    placeholder="Hello, I'm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    value={heroForm.full_name}
                    onChange={(e) => setHeroForm({ ...heroForm, full_name: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                    placeholder="Test Portfolio Owner"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Professional Title</label>
                  <input
                    type="text"
                    value={heroForm.professional_title}
                    onChange={(e) => setHeroForm({ ...heroForm, professional_title: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                    placeholder="Social Media Marketing Specialist"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Hero Description</label>
                  <textarea
                    rows={4}
                    value={heroForm.description}
                    onChange={(e) => setHeroForm({ ...heroForm, description: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                    placeholder="Describe your positioning and marketing impact..."
                    required
                  />
                </div>

                {/* Profile Photo Uploader */}
                <div className="md:col-span-2">
                  <ImageUploadField
                    label="Hero Profile Photograph"
                    value={heroForm.profile_image_url}
                    onChange={(url) => setHeroForm({ ...heroForm, profile_image_url: url })}
                    altText={heroForm.profile_image_alt}
                    onAltTextChange={(alt) => setHeroForm({ ...heroForm, profile_image_alt: alt })}
                    aspect="circle"
                    folder="hero"
                    helperText="Displayed in the glowing circular hero frame"
                  />
                </div>

                {/* Hero Background Image */}
                <div className="md:col-span-2">
                  <ImageUploadField
                    label="Optional Hero Background Banner"
                    value={heroForm.background_image_url}
                    onChange={(url) => setHeroForm({ ...heroForm, background_image_url: url })}
                    aspect="video"
                    folder="hero-bg"
                    helperText="Optional subtle background pattern or texture"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Primary Button Text</label>
                  <input
                    type="text"
                    value={heroForm.primary_button_text}
                    onChange={(e) => setHeroForm({ ...heroForm, primary_button_text: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Primary Button Destination (URL or #anchor)</label>
                  <input
                    type="text"
                    value={heroForm.primary_button_url}
                    onChange={(e) => setHeroForm({ ...heroForm, primary_button_url: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Secondary Button Text</label>
                  <input
                    type="text"
                    value={heroForm.secondary_button_text}
                    onChange={(e) => setHeroForm({ ...heroForm, secondary_button_text: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/70 mb-1.5">Secondary Button Destination</label>
                  <input
                    type="text"
                    value={heroForm.secondary_button_url}
                    onChange={(e) => setHeroForm({ ...heroForm, secondary_button_url: e.target.value })}
                    className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                  />
                </div>
              </div>

              {/* Form Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                <button
                  type="button"
                  onClick={() => {
                    const fallback = heroPublished || heroDraft;
                    if (fallback) {
                      setHeroForm({
                        greeting: fallback.greeting || "Hello, I'm",
                        full_name: fallback.full_name || '',
                        professional_title: fallback.professional_title || '',
                        description: fallback.description || '',
                        profile_image_url: fallback.profile_image_url || '',
                        profile_image_alt: fallback.profile_image_alt || '',
                        background_image_url: fallback.background_image_url || '',
                        primary_button_text: fallback.primary_button_text || 'View My Work',
                        primary_button_url: fallback.primary_button_url || '#work',
                        secondary_button_text: fallback.secondary_button_text || "Let's Work Together",
                        secondary_button_url: fallback.secondary_button_url || '#contact',
                      });
                      setMessage({ type: 'success', text: 'Restored previous saved content.' });
                    }
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white"
                >
                  Cancel / Revert Changes
                </button>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save as Draft'}
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => void publishSingleton('hero_content', heroForm)}
                    className="rounded-full border border-[#f04796] bg-[#f04796] px-6 py-2.5 text-xs font-semibold text-[#0d0d0f] shadow-[0_0_20px_rgba(240,71,150,0.35)] transition hover:bg-[#ff6ab3] disabled:opacity-50"
                  >
                    {saving ? 'Publishing...' : 'Publish Hero Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )
      )}

      {/* TAB 2: STATISTICS */}
      {!loading && activeTab === 'stats' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Statistics Highlights</h2>
              <p className="text-xs text-white/50">Manage numbers, suffixes, labels, order, and visibility.</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingStat({
                  label: '',
                  value: '',
                  suffix: '+',
                  icon: 'TrendingUp',
                  is_visible: true,
                  is_published: true,
                  display_order: stats.length + 1,
                })
              }
              className="inline-flex items-center gap-2 rounded-full border border-[#f04796] bg-[#f04796] px-4 py-2 text-xs font-semibold text-[#0d0d0f] hover:bg-[#ff6ab3]"
            >
              <Plus size={14} /> Add Statistic
            </button>
          </div>

          {/* Edit / Add Modal */}
          {editingStat && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#161619] p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {editingStat.id ? 'Edit Statistic' : 'Add New Statistic'}
                </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      if (editingStat.id) {
                        await adminUpdate('statistics', editingStat.id, editingStat);
                      } else {
                        await adminCreate('statistics', editingStat);
                      }
                      setEditingStat(null);
                      await loadTabData();
                      setMessage({ type: 'success', text: 'Statistic saved.' });
                    } catch (err) {
                      setMessage({ type: 'error', text: 'Failed to save statistic.' });
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Value (Number)</label>
                      <input
                        required
                        value={editingStat.value || ''}
                        onChange={(e) => setEditingStat({ ...editingStat, value: e.target.value })}
                        className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2 text-sm text-white"
                        placeholder="12K"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Suffix (Optional)</label>
                      <input
                        value={editingStat.suffix || ''}
                        onChange={(e) => setEditingStat({ ...editingStat, suffix: e.target.value })}
                        className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2 text-sm text-white"
                        placeholder="+"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Label</label>
                    <input
                      required
                      value={editingStat.label || ''}
                      onChange={(e) => setEditingStat({ ...editingStat, label: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2 text-sm text-white"
                      placeholder="Impressions / Happy Clients"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Icon Name</label>
                    <select
                      value={editingStat.icon || 'TrendingUp'}
                      onChange={(e) => setEditingStat({ ...editingStat, icon: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2 text-sm text-white"
                    >
                      <option value="TrendingUp">TrendingUp</option>
                      <option value="Heart">Heart</option>
                      <option value="MessageSquare">MessageSquare</option>
                      <option value="Users">Users</option>
                      <option value="BarChart3">BarChart3</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-2">
                    <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingStat.is_visible !== false}
                        onChange={(e) => setEditingStat({ ...editingStat, is_visible: e.target.checked })}
                        className="rounded border-white/20 bg-black/40 text-[#f04796] focus:ring-0"
                      />
                      Visible on Public Website
                    </label>
                  </div>
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setEditingStat(null)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-[#f04796] px-5 py-2 text-xs font-semibold text-[#0d0d0f]"
                    >
                      {saving ? 'Saving...' : 'Save Statistic'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Statistics Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, idx) => (
              <div
                key={stat.id}
                className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-[#141416] p-5 transition hover:border-[#f04796]/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-[#f6b7d2]">
                      {stat.value}
                      {stat.suffix}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => void handleReorder('statistics', stats, idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20"
                        title="Move left"
                      >
                        <ArrowUp size={14} className="-rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleReorder('statistics', stats, idx, idx + 1)}
                        disabled={idx === stats.length - 1}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20"
                        title="Move right"
                      >
                        <ArrowDown size={14} className="-rotate-90" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs uppercase tracking-wider text-white/70">{stat.label}</p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3">
                  <button
                    type="button"
                    onClick={async () => {
                      await adminUpdate('statistics', stat.id, { is_visible: !stat.is_visible });
                      await loadTabData();
                    }}
                    className={`inline-flex items-center gap-1 text-xs ${
                      stat.is_visible ? 'text-emerald-400' : 'text-white/40'
                    }`}
                  >
                    {stat.is_visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    {stat.is_visible ? 'Visible' : 'Hidden'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingStat(stat)}
                      className="text-xs text-white/60 hover:text-white"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm(`Delete statistic "${stat.label}"?`)) {
                          await adminDelete('statistics', stat.id);
                          await loadTabData();
                        }
                      }}
                      className="text-xs text-red-400/80 hover:text-red-300"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ABOUT ME */}
      {!loading && activeTab === 'about' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">About Me Section</h2>
              <p className="text-xs text-white/50">Edit title, bio stories, portrait photo, and alt text.</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {aboutDraft && (
                <span className="rounded-full bg-amber-500/20 px-3 py-1 font-medium text-amber-300">
                  Draft Pending
                </span>
              )}
              {aboutPublished && (
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-medium text-emerald-300">
                  Live Published
                </span>
              )}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void saveSingletonDraft('about_content', aboutForm);
            }}
            className="rounded-[28px] border border-white/10 bg-[#141416] p-6 space-y-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Subtitle (Badge)</label>
                <input
                  type="text"
                  value={aboutForm.subtitle}
                  onChange={(e) => setAboutForm({ ...aboutForm, subtitle: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                  placeholder="About Me"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Main Section Heading</label>
                <input
                  type="text"
                  value={aboutForm.title}
                  onChange={(e) => setAboutForm({ ...aboutForm, title: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                  placeholder="A brand storyteller with strategy in her DNA."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-white/70 mb-1.5">Main Biography</label>
                <textarea
                  rows={4}
                  value={aboutForm.description}
                  onChange={(e) => setAboutForm({ ...aboutForm, description: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                  placeholder="Primary introductory paragraph..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-white/70 mb-1.5">Additional Description</label>
                <textarea
                  rows={4}
                  value={aboutForm.additional_description}
                  onChange={(e) => setAboutForm({ ...aboutForm, additional_description: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                  placeholder="Supporting philosophy, background, and approach..."
                />
              </div>

              {/* About Profile Photograph */}
              <div className="md:col-span-2">
                <ImageUploadField
                  label="About Portrait Photograph"
                  value={aboutForm.profile_image_url}
                  onChange={(url) => setAboutForm({ ...aboutForm, profile_image_url: url })}
                  altText={aboutForm.profile_image_alt}
                  onAltTextChange={(alt) => setAboutForm({ ...aboutForm, profile_image_alt: alt })}
                  aspect="square"
                  folder="about"
                  helperText="Displayed in the large rounded portrait card beside the bio"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={() => {
                  const fallback = aboutPublished || aboutDraft;
                  if (fallback) {
                    setAboutForm({
                      title: fallback.title || '',
                      subtitle: fallback.subtitle || 'About Me',
                      description: fallback.description || '',
                      profile_image_url: fallback.profile_image_url || '',
                      profile_image_alt: fallback.profile_image_alt || '',
                      additional_description: fallback.additional_description || '',
                    });
                    setMessage({ type: 'success', text: 'Restored previous about content.' });
                  }
                }}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white"
              >
                Cancel / Revert Changes
              </button>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-white/10 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void publishSingleton('about_content', aboutForm)}
                  className="rounded-full border border-[#f04796] bg-[#f04796] px-6 py-2.5 text-xs font-semibold text-[#0d0d0f] shadow-[0_0_20px_rgba(240,71,150,0.35)] transition hover:bg-[#ff6ab3] disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : 'Publish About Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 4: SERVICES */}
      {!loading && activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Services Offered</h2>
              <p className="text-xs text-white/50">Create, edit, hide, publish, and reorder marketing services.</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingService({
                  title: '',
                  description: '',
                  icon: 'Megaphone',
                  image_url: '',
                  image_alt: '',
                  is_visible: true,
                  is_published: true,
                  display_order: services.length + 1,
                })
              }
              className="inline-flex items-center gap-2 rounded-full border border-[#f04796] bg-[#f04796] px-4 py-2 text-xs font-semibold text-[#0d0d0f] hover:bg-[#ff6ab3]"
            >
              <Plus size={14} /> Add Service
            </button>
          </div>

          {/* Modal */}
          {editingService && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#161619] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {editingService.id ? 'Edit Service' : 'Add New Service'}
                </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      if (editingService.id) {
                        await adminUpdate('services', editingService.id, editingService);
                      } else {
                        await adminCreate('services', editingService);
                      }
                      setEditingService(null);
                      await loadTabData();
                      setMessage({ type: 'success', text: 'Service saved.' });
                    } catch (err) {
                      setMessage({ type: 'error', text: 'Failed to save service.' });
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Service Title</label>
                    <input
                      required
                      value={editingService.title || ''}
                      onChange={(e) => setEditingService({ ...editingService, title: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2 text-sm text-white"
                      placeholder="e.g. Social Media Strategy"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={editingService.description || ''}
                      onChange={(e) => setEditingService({ ...editingService, description: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2 text-sm text-white"
                      placeholder="What is included in this service..."
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Icon</label>
                    <select
                      value={editingService.icon || 'Megaphone'}
                      onChange={(e) => setEditingService({ ...editingService, icon: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2 text-sm text-white"
                    >
                      <option value="Megaphone">Megaphone</option>
                      <option value="Target">Target</option>
                      <option value="PenTool">PenTool</option>
                      <option value="Rocket">Rocket</option>
                      <option value="BarChart3">BarChart3</option>
                    </select>
                  </div>

                  <ImageUploadField
                    label="Optional Service Cover Image"
                    value={editingService.image_url || ''}
                    onChange={(url) => setEditingService({ ...editingService, image_url: url })}
                    altText={editingService.image_alt || ''}
                    onAltTextChange={(alt) => setEditingService({ ...editingService, image_alt: alt })}
                    folder="services"
                  />

                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingService.is_visible !== false}
                        onChange={(e) => setEditingService({ ...editingService, is_visible: e.target.checked })}
                        className="rounded border-white/20 bg-black/40 text-[#f04796] focus:ring-0"
                      />
                      Visible on Website
                    </label>
                    <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingService.is_published !== false}
                        onChange={(e) => setEditingService({ ...editingService, is_published: e.target.checked })}
                        className="rounded border-white/20 bg-black/40 text-[#f04796] focus:ring-0"
                      />
                      Published
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setEditingService(null)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-[#f04796] px-5 py-2 text-xs font-semibold text-[#0d0d0f]"
                    >
                      {saving ? 'Saving...' : 'Save Service'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* List */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, idx) => (
              <div
                key={service.id}
                className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-[#141416] p-5 transition hover:border-[#f04796]/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-xl bg-[#f04796]/10 px-2.5 py-1 text-xs font-semibold text-[#f6b7d2]">
                      {service.icon || 'Megaphone'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => void handleReorder('services', services, idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20"
                        title="Move up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleReorder('services', services, idx, idx + 1)}
                        disabled={idx === services.length - 1}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20"
                        title="Move down"
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">{service.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-white/60 line-clamp-3">{service.description}</p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={async () => {
                        await adminUpdate('services', service.id, { is_visible: !service.is_visible });
                        await loadTabData();
                      }}
                      className={`inline-flex items-center gap-1 text-xs ${
                        service.is_visible ? 'text-emerald-400' : 'text-white/40'
                      }`}
                    >
                      {service.is_visible ? <Eye size={13} /> : <EyeOff size={13} />}
                      {service.is_visible ? 'Visible' : 'Hidden'}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (service.is_published) {
                          await adminUnpublish('services', service.id);
                        } else {
                          await adminPublish('services', service.id);
                        }
                        await loadTabData();
                      }}
                      className={`text-xs ${service.is_published ? 'text-[#f6b7d2]' : 'text-white/40'}`}
                    >
                      {service.is_published ? 'Published' : 'Draft'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingService(service)}
                      className="text-xs text-white/60 hover:text-white"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm(`Delete service "${service.title}"?`)) {
                          await adminDelete('services', service.id);
                          await loadTabData();
                        }
                      }}
                      className="text-xs text-red-400/80 hover:text-red-300"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: FEATURED WORK / PROJECTS */}
      {!loading && activeTab === 'work' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Featured Work & Case Studies</h2>
              <p className="text-xs text-white/50">Manage projects, cover images, metrics, categories, and feature flags.</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingProject({
                  title: '',
                  slug: '',
                  description: '',
                  category: 'Social Campaign',
                  cover_image_url: '',
                  result_metric: '+150% Growth',
                  result_description: 'Organic reach',
                  case_study_url: '#contact',
                  is_featured: true,
                  is_published: true,
                  is_visible: true,
                  display_order: projects.length + 1,
                })
              }
              className="inline-flex items-center gap-2 rounded-full border border-[#f04796] bg-[#f04796] px-4 py-2 text-xs font-semibold text-[#0d0d0f] hover:bg-[#ff6ab3]"
            >
              <Plus size={14} /> Add Project
            </button>
          </div>

          {/* Modal */}
          {editingProject && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
              <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#161619] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {editingProject.id ? 'Edit Project' : 'Add New Project'}
                </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      if (editingProject.id) {
                        await adminUpdate('projects', editingProject.id, editingProject);
                      } else {
                        await adminCreate('projects', editingProject);
                      }
                      setEditingProject(null);
                      await loadTabData();
                      setMessage({ type: 'success', text: 'Project saved.' });
                    } catch (err) {
                      setMessage({ type: 'error', text: 'Failed to save project.' });
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Project Title</label>
                      <input
                        required
                        value={editingProject.title || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                        className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2 text-sm text-white"
                        placeholder="Brand Lift Campaign"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Category</label>
                      <input
                        value={editingProject.category || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                        className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2 text-sm text-white"
                        placeholder="Performance Marketing"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={editingProject.description || ''}
                      onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2 text-sm text-white"
                      placeholder="Story behind the project..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Result Metric (Highlight)</label>
                      <input
                        value={editingProject.result_metric || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, result_metric: e.target.value })}
                        className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2 text-sm text-white"
                        placeholder="+186% engagement"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Case Study Link</label>
                      <input
                        value={editingProject.case_study_url || ''}
                        onChange={(e) => setEditingProject({ ...editingProject, case_study_url: e.target.value })}
                        className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2 text-sm text-white"
                        placeholder="#contact or external link"
                      />
                    </div>
                  </div>

                  <ImageUploadField
                    label="Cover Photograph"
                    value={editingProject.cover_image_url || ''}
                    onChange={(url) => setEditingProject({ ...editingProject, cover_image_url: url })}
                    folder="projects"
                    aspect="video"
                  />

                  <div className="flex flex-wrap gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProject.is_featured !== false}
                        onChange={(e) => setEditingProject({ ...editingProject, is_featured: e.target.checked })}
                        className="rounded border-white/20 bg-black/40 text-[#f04796] focus:ring-0"
                      />
                      Feature on Homepage
                    </label>
                    <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProject.is_published !== false}
                        onChange={(e) => setEditingProject({ ...editingProject, is_published: e.target.checked })}
                        className="rounded border-white/20 bg-black/40 text-[#f04796] focus:ring-0"
                      />
                      Published
                    </label>
                    <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProject.is_visible !== false}
                        onChange={(e) => setEditingProject({ ...editingProject, is_visible: e.target.checked })}
                        className="rounded border-white/20 bg-black/40 text-[#f04796] focus:ring-0"
                      />
                      Visible
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setEditingProject(null)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-[#f04796] px-5 py-2 text-xs font-semibold text-[#0d0d0f]"
                    >
                      {saving ? 'Saving...' : 'Save Project'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, idx) => (
              <div
                key={project.id}
                className="overflow-hidden rounded-[24px] border border-white/10 bg-[#141416] transition hover:border-[#f04796]/40 flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-black/30">
                    {project.cover_image_url ? (
                      <img src={project.cover_image_url} alt={project.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-white/30">No Image</div>
                    )}
                    {project.is_featured && (
                      <span className="absolute top-3 left-3 rounded-full bg-[#f04796] px-2.5 py-1 text-[10px] font-bold text-[#0d0d0f]">
                        FEATURED
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <span className="text-[11px] font-semibold text-[#f6b7d2] uppercase tracking-wider">
                      {project.result_metric}
                    </span>
                    <h3 className="mt-1 text-base font-semibold text-white">{project.title}</h3>
                    <p className="mt-1 text-xs text-white/60 line-clamp-2">{project.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 p-4 pt-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void handleReorder('projects', projects, idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1 text-white/40 hover:text-white disabled:opacity-20"
                      title="Move up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleReorder('projects', projects, idx, idx + 1)}
                      disabled={idx === projects.length - 1}
                      className="p-1 text-white/40 hover:text-white disabled:opacity-20"
                      title="Move down"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingProject(project)}
                      className="text-xs text-white/60 hover:text-white"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm(`Delete project "${project.title}"?`)) {
                          await adminDelete('projects', project.id);
                          await loadTabData();
                        }
                      }}
                      className="text-xs text-red-400/80 hover:text-red-300"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SKILLS & TOOLS */}
      {!loading && activeTab === 'skills' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Skills & Marketing Toolkit</h2>
              <p className="text-xs text-white/50">Manage skills badges displayed on the public page.</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingSkill({
                  name: '',
                  icon: '',
                  is_visible: true,
                  is_published: true,
                  display_order: skills.length + 1,
                })
              }
              className="inline-flex items-center gap-2 rounded-full border border-[#f04796] bg-[#f04796] px-4 py-2 text-xs font-semibold text-[#0d0d0f] hover:bg-[#ff6ab3]"
            >
              <Plus size={14} /> Add Skill
            </button>
          </div>

          {editingSkill && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#161619] p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {editingSkill.id ? 'Edit Skill' : 'Add New Skill'}
                </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      if (editingSkill.id) {
                        await adminUpdate('skills', editingSkill.id, editingSkill);
                      } else {
                        await adminCreate('skills', editingSkill);
                      }
                      setEditingSkill(null);
                      await loadTabData();
                      setMessage({ type: 'success', text: 'Skill saved.' });
                    } catch (err) {
                      setMessage({ type: 'error', text: 'Failed to save skill.' });
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Skill or Tool Name</label>
                    <input
                      required
                      value={editingSkill.name || ''}
                      onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2 text-sm text-white"
                      placeholder="e.g. Copywriting, Canva, Meta Ads"
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={editingSkill.is_visible !== false}
                      onChange={(e) => setEditingSkill({ ...editingSkill, is_visible: e.target.checked })}
                      className="rounded border-white/20 bg-black/40 text-[#f04796] focus:ring-0"
                    />
                    Visible on Website
                  </label>
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setEditingSkill(null)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-[#f04796] px-5 py-2 text-xs font-semibold text-[#0d0d0f]"
                    >
                      {saving ? 'Saving...' : 'Save Skill'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {skills.map((skill, idx) => (
              <div
                key={skill.id}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-[#141416] px-4 py-2 text-xs text-white transition hover:border-[#f04796]"
              >
                <span className={skill.is_visible ? 'text-white' : 'text-white/40 line-through'}>
                  {skill.name}
                </span>
                <div className="flex items-center gap-1 border-l border-white/10 pl-2">
                  <button
                    type="button"
                    onClick={() => void handleReorder('skills', skills, idx, idx - 1)}
                    disabled={idx === 0}
                    className="text-white/40 hover:text-white disabled:opacity-20"
                    title="Move left"
                  >
                    <ArrowUp size={11} className="-rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleReorder('skills', skills, idx, idx + 1)}
                    disabled={idx === skills.length - 1}
                    className="text-white/40 hover:text-white disabled:opacity-20"
                    title="Move right"
                  >
                    <ArrowDown size={11} className="-rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await adminUpdate('skills', skill.id, { is_visible: !skill.is_visible });
                      await loadTabData();
                    }}
                    className="text-white/40 hover:text-[#f6b7d2]"
                    title="Toggle Visibility"
                  >
                    {skill.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingSkill(skill)}
                    className="text-white/40 hover:text-white"
                  >
                    <Pencil size={11} />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`Delete skill "${skill.name}"?`)) {
                        await adminDelete('skills', skill.id);
                        await loadTabData();
                      }
                    }}
                    className="text-red-400/60 hover:text-red-300"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: PROCESS */}
      {!loading && activeTab === 'process' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">4-Step Strategic Engine</h2>
              <p className="text-xs text-white/50">Manage process step numbers, titles, descriptions, and sequence.</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingProcess({
                  step_number: `0${processSteps.length + 1}`,
                  title: '',
                  description: '',
                  is_visible: true,
                  is_published: true,
                  display_order: processSteps.length + 1,
                })
              }
              className="inline-flex items-center gap-2 rounded-full border border-[#f04796] bg-[#f04796] px-4 py-2 text-xs font-semibold text-[#0d0d0f] hover:bg-[#ff6ab3]"
            >
              <Plus size={14} /> Add Process Step
            </button>
          </div>

          {editingProcess && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
              <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#161619] p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {editingProcess.id ? 'Edit Step' : 'Add New Step'}
                </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      if (editingProcess.id) {
                        await adminUpdate('process', editingProcess.id, editingProcess);
                      } else {
                        await adminCreate('process', editingProcess);
                      }
                      setEditingProcess(null);
                      await loadTabData();
                      setMessage({ type: 'success', text: 'Step saved.' });
                    } catch (err) {
                      setMessage({ type: 'error', text: 'Failed to save step.' });
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Step #</label>
                      <input
                        required
                        value={editingProcess.step_number || ''}
                        onChange={(e) => setEditingProcess({ ...editingProcess, step_number: e.target.value })}
                        className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2 text-sm text-white"
                        placeholder="01"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-white/70 mb-1">Step Title</label>
                      <input
                        required
                        value={editingProcess.title || ''}
                        onChange={(e) => setEditingProcess({ ...editingProcess, title: e.target.value })}
                        className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2 text-sm text-white"
                        placeholder="Understand"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-white/70 mb-1">Description</label>
                    <textarea
                      required
                      rows={3}
                      value={editingProcess.description || ''}
                      onChange={(e) => setEditingProcess({ ...editingProcess, description: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2 text-sm text-white"
                      placeholder="Explain this phase..."
                    />
                  </div>
                  <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={editingProcess.is_visible !== false}
                      onChange={(e) => setEditingProcess({ ...editingProcess, is_visible: e.target.checked })}
                      className="rounded border-white/20 bg-black/40 text-[#f04796] focus:ring-0"
                    />
                    Visible on Website
                  </label>
                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setEditingProcess(null)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-[#f04796] px-5 py-2 text-xs font-semibold text-[#0d0d0f]"
                    >
                      {saving ? 'Saving...' : 'Save Step'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((step, idx) => (
              <div
                key={step.id}
                className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-[#141416] p-5 transition hover:border-[#f04796]/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-3xl font-bold text-[#f6b7d2]">{step.step_number}</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => void handleReorder('process', processSteps, idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20"
                        title="Move left"
                      >
                        <ArrowUp size={13} className="-rotate-90" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleReorder('process', processSteps, idx, idx + 1)}
                        disabled={idx === processSteps.length - 1}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20"
                        title="Move right"
                      >
                        <ArrowDown size={13} className="-rotate-90" />
                      </button>
                    </div>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-white/60">{step.description}</p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3">
                  <button
                    type="button"
                    onClick={async () => {
                      await adminUpdate('process', step.id, { is_visible: !step.is_visible });
                      await loadTabData();
                    }}
                    className={`inline-flex items-center gap-1 text-xs ${
                      step.is_visible ? 'text-emerald-400' : 'text-white/40'
                    }`}
                  >
                    {step.is_visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    {step.is_visible ? 'Visible' : 'Hidden'}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingProcess(step)}
                      className="text-xs text-white/60 hover:text-white"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm(`Delete step "${step.title}"?`)) {
                          await adminDelete('process', step.id);
                          await loadTabData();
                        }
                      }}
                      className="text-xs text-red-400/80 hover:text-red-300"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: TESTIMONIALS */}
      {!loading && activeTab === 'testimonials' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-white">Client Testimonials</h2>
              <p className="text-xs text-white/50">Manage client reviews, client photos, designations, and publish state.</p>
            </div>
            <button
              type="button"
              onClick={() =>
                setEditingTestimonial({
                  client_name: '',
                  client_designation: '',
                  client_image_url: '',
                  testimonial: '',
                  is_published: true,
                  is_visible: true,
                  display_order: testimonials.length + 1,
                })
              }
              className="inline-flex items-center gap-2 rounded-full border border-[#f04796] bg-[#f04796] px-4 py-2 text-xs font-semibold text-[#0d0d0f] hover:bg-[#ff6ab3]"
            >
              <Plus size={14} /> Add Testimonial
            </button>
          </div>

          {editingTestimonial && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
              <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#161619] p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold text-white mb-4">
                  {editingTestimonial.id ? 'Edit Testimonial' : 'Add New Testimonial'}
                </h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setSaving(true);
                    try {
                      if (editingTestimonial.id) {
                        await adminUpdate('testimonials', editingTestimonial.id, editingTestimonial);
                      } else {
                        await adminCreate('testimonials', editingTestimonial);
                      }
                      setEditingTestimonial(null);
                      await loadTabData();
                      setMessage({ type: 'success', text: 'Testimonial saved.' });
                    } catch (err) {
                      setMessage({ type: 'error', text: 'Failed to save testimonial.' });
                    } finally {
                      setSaving(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Client Name</label>
                      <input
                        required
                        value={editingTestimonial.client_name || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, client_name: e.target.value })}
                        className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2 text-sm text-white"
                        placeholder="Nadia Rahman"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-white/70 mb-1">Designation / Company</label>
                      <input
                        required
                        value={editingTestimonial.client_designation || ''}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, client_designation: e.target.value })}
                        className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2 text-sm text-white"
                        placeholder="Founder, Noor Atelier"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-white/70 mb-1">Testimonial Quote</label>
                    <textarea
                      required
                      rows={4}
                      value={editingTestimonial.testimonial || ''}
                      onChange={(e) => setEditingTestimonial({ ...editingTestimonial, testimonial: e.target.value })}
                      className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2 text-sm text-white"
                      placeholder="Words from the client..."
                    />
                  </div>

                  <ImageUploadField
                    label="Client Photograph (Optional)"
                    value={editingTestimonial.client_image_url || ''}
                    onChange={(url) => setEditingTestimonial({ ...editingTestimonial, client_image_url: url })}
                    folder="testimonials"
                    aspect="circle"
                  />

                  <div className="flex gap-4 pt-2">
                    <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTestimonial.is_visible !== false}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, is_visible: e.target.checked })}
                        className="rounded border-white/20 bg-black/40 text-[#f04796] focus:ring-0"
                      />
                      Visible on Website
                    </label>
                    <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingTestimonial.is_published !== false}
                        onChange={(e) => setEditingTestimonial({ ...editingTestimonial, is_published: e.target.checked })}
                        className="rounded border-white/20 bg-black/40 text-[#f04796] focus:ring-0"
                      />
                      Published
                    </label>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setEditingTestimonial(null)}
                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="rounded-full bg-[#f04796] px-5 py-2 text-xs font-semibold text-[#0d0d0f]"
                    >
                      {saving ? 'Saving...' : 'Save Testimonial'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {testimonials.map((t, idx) => (
              <div
                key={t.id}
                className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-[#141416] p-5 transition hover:border-[#f04796]/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {t.client_image_url ? (
                        <img src={t.client_image_url} alt={t.client_name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f04796]/20 font-bold text-[#f6b7d2]">
                          {t.client_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-white">{t.client_name}</h4>
                        <p className="text-[11px] text-white/50">{t.client_designation}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => void handleReorder('testimonials', testimonials, idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20"
                        title="Move up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleReorder('testimonials', testimonials, idx, idx + 1)}
                        disabled={idx === testimonials.length - 1}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20"
                        title="Move down"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>
                  </div>

                  <p className="mt-4 text-xs italic leading-6 text-white/70">“{t.testimonial}”</p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={async () => {
                        await adminUpdate('testimonials', t.id, { is_visible: !t.is_visible });
                        await loadTabData();
                      }}
                      className={`inline-flex items-center gap-1 text-xs ${
                        t.is_visible ? 'text-emerald-400' : 'text-white/40'
                      }`}
                    >
                      {t.is_visible ? <Eye size={13} /> : <EyeOff size={13} />}
                      {t.is_visible ? 'Visible' : 'Hidden'}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (t.is_published) {
                          await adminUnpublish('testimonials', t.id);
                        } else {
                          await adminPublish('testimonials', t.id);
                        }
                        await loadTabData();
                      }}
                      className={`text-xs ${t.is_published ? 'text-[#f6b7d2]' : 'text-white/40'}`}
                    >
                      {t.is_published ? 'Published' : 'Draft'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingTestimonial(t)}
                      className="text-xs text-white/60 hover:text-white"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (window.confirm(`Delete testimonial from "${t.client_name}"?`)) {
                          await adminDelete('testimonials', t.id);
                          await loadTabData();
                        }
                      }}
                      className="text-xs text-red-400/80 hover:text-red-300"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 9: FINAL CTA */}
      {!loading && activeTab === 'cta' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Final Call to Action</h2>
              <p className="text-xs text-white/50">Edit script greeting, heading, highlighted words, and contact CTA button.</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {ctaDraft && (
                <span className="rounded-full bg-amber-500/20 px-3 py-1 font-medium text-amber-300">
                  Draft Pending
                </span>
              )}
              {ctaPublished && (
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-medium text-emerald-300">
                  Live Published
                </span>
              )}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void saveSingletonDraft('cta_content', ctaForm);
            }}
            className="rounded-[28px] border border-white/10 bg-[#141416] p-6 space-y-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Script Greeting (Script Font)</label>
                <input
                  type="text"
                  value={ctaForm.script_greeting}
                  onChange={(e) => setCtaForm({ ...ctaForm, script_greeting: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                  placeholder="Thank you for your support!"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Main CTA Heading</label>
                <input
                  type="text"
                  value={ctaForm.main_heading}
                  onChange={(e) => setCtaForm({ ...ctaForm, main_heading: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                  placeholder="Ready to grow your brand?"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-white/70 mb-1.5">Supporting Description</label>
                <textarea
                  rows={3}
                  value={ctaForm.supporting_description}
                  onChange={(e) => setCtaForm({ ...ctaForm, supporting_description: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                  placeholder="Let's focus on building and growing your presence..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">
                  Highlighted Words (comma separated, will be styled in pink)
                </label>
                <input
                  type="text"
                  value={ctaForm.highlighted_words}
                  onChange={(e) => setCtaForm({ ...ctaForm, highlighted_words: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                  placeholder="building,growing"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Button Text</label>
                <input
                  type="text"
                  value={ctaForm.button_text}
                  onChange={(e) => setCtaForm({ ...ctaForm, button_text: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                  placeholder="Contact Me / Send Message"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-white/70 mb-1.5">Button Destination URL</label>
                <input
                  type="text"
                  value={ctaForm.button_url}
                  onChange={(e) => setCtaForm({ ...ctaForm, button_url: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                  placeholder="https://wa.me/... or #contact"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={() => {
                  const fallback = ctaPublished || ctaDraft;
                  if (fallback) {
                    setCtaForm({
                      script_greeting: fallback.script_greeting || 'Thank you for your support!',
                      main_heading: fallback.main_heading || 'Ready to grow your brand?',
                      supporting_description: fallback.supporting_description || '',
                      highlighted_words: fallback.highlighted_words || 'building,growing',
                      button_text: fallback.button_text || 'Contact Me',
                      button_url: fallback.button_url || 'https://wa.me/971521234567',
                    });
                    setMessage({ type: 'success', text: 'Reverted CTA changes.' });
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
                  {saving ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void publishSingleton('cta_content', ctaForm)}
                  className="rounded-full border border-[#f04796] bg-[#f04796] px-6 py-2.5 text-xs font-semibold text-[#0d0d0f] shadow-[0_0_20px_rgba(240,71,150,0.35)] transition hover:bg-[#ff6ab3] disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : 'Publish CTA Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 10: FOOTER */}
      {!loading && activeTab === 'footer' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Footer Content</h2>
              <p className="text-xs text-white/50">Edit copyright text, contact details, description, and social media links.</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              {footerDraft && (
                <span className="rounded-full bg-amber-500/20 px-3 py-1 font-medium text-amber-300">
                  Draft Pending
                </span>
              )}
              {footerPublished && (
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 font-medium text-emerald-300">
                  Live Published
                </span>
              )}
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void saveSingletonDraft('footer_content', footerForm);
            }}
            className="rounded-[28px] border border-white/10 bg-[#141416] p-6 space-y-6"
          >
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Copyright Notice</label>
                <input
                  type="text"
                  value={footerForm.copyright_text}
                  onChange={(e) => setFooterForm({ ...footerForm, copyright_text: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                  placeholder="© 2025 Azmina Zahra. All rights reserved."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Contact Email</label>
                <input
                  type="email"
                  value={footerForm.email}
                  onChange={(e) => setFooterForm({ ...footerForm, email: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                  placeholder="hello@azminazahra.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Phone Number</label>
                <input
                  type="text"
                  value={footerForm.phone}
                  onChange={(e) => setFooterForm({ ...footerForm, phone: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                  placeholder="+971 52 123 4567"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">WhatsApp URL</label>
                <input
                  type="text"
                  value={footerForm.whatsapp_url}
                  onChange={(e) => setFooterForm({ ...footerForm, whatsapp_url: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                  placeholder="https://wa.me/..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Instagram URL</label>
                <input
                  type="text"
                  value={footerForm.instagram_url}
                  onChange={(e) => setFooterForm({ ...footerForm, instagram_url: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">TikTok URL</label>
                <input
                  type="text"
                  value={footerForm.tiktok_url}
                  onChange={(e) => setFooterForm({ ...footerForm, tiktok_url: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">LinkedIn URL</label>
                <input
                  type="text"
                  value={footerForm.linkedin_url}
                  onChange={(e) => setFooterForm({ ...footerForm, linkedin_url: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white/70 mb-1.5">Footer Short Description</label>
                <input
                  type="text"
                  value={footerForm.footer_description}
                  onChange={(e) => setFooterForm({ ...footerForm, footer_description: e.target.value })}
                  className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
              <button
                type="button"
                onClick={() => {
                  const fallback = footerPublished || footerDraft;
                  if (fallback) {
                    setFooterForm({
                      copyright_text: fallback.copyright_text || '',
                      email: fallback.email || '',
                      phone: fallback.phone || '',
                      instagram_url: fallback.instagram_url || '',
                      tiktok_url: fallback.tiktok_url || '',
                      linkedin_url: fallback.linkedin_url || '',
                      whatsapp_url: fallback.whatsapp_url || '',
                      footer_description: fallback.footer_description || '',
                    });
                    setMessage({ type: 'success', text: 'Reverted footer changes.' });
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
                  {saving ? 'Saving...' : 'Save as Draft'}
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void publishSingleton('footer_content', footerForm)}
                  className="rounded-full border border-[#f04796] bg-[#f04796] px-6 py-2.5 text-xs font-semibold text-[#0d0d0f] shadow-[0_0_20px_rgba(240,71,150,0.35)] transition hover:bg-[#ff6ab3] disabled:opacity-50"
                >
                  {saving ? 'Publishing...' : 'Publish Footer Changes'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* TAB 11: SECTIONS LAYOUT & ORDER */}
      {!loading && activeTab === 'layout' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Sections Layout & Display Order</h2>
              <p className="text-xs text-white/50">
                Hide or reveal entire landing page sections and adjust their top-to-bottom sequence.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#141416] p-4 divide-y divide-white/5">
            {sections.map((section, idx) => (
              <div
                key={section.id}
                className="flex items-center justify-between py-4 px-2 transition hover:bg-white/5 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f04796]/10 text-xs font-bold text-[#f6b7d2]">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-white capitalize">{section.title || section.section_key}</h3>
                    <p className="text-xs text-white/40">Section Key: {section.section_key}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Order arrows */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void handleReorder('sections', sections, idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white disabled:opacity-20"
                      title="Move Up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleReorder('sections', sections, idx, idx + 1)}
                      disabled={idx === sections.length - 1}
                      className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-white/60 hover:text-white disabled:opacity-20"
                      title="Move Down"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  {/* Visibility Toggle */}
                  <button
                    type="button"
                    onClick={async () => {
                      await adminUpdate('sections', section.id, { is_visible: !section.is_visible });
                      await loadTabData();
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
                      section.is_visible
                        ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : 'border border-white/10 bg-white/5 text-white/40'
                    }`}
                  >
                    {section.is_visible ? <Eye size={13} /> : <EyeOff size={13} />}
                    {section.is_visible ? 'Visible' : 'Hidden'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
