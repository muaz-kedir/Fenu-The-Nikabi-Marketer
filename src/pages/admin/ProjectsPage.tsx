import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Eye,
  EyeOff,
  FolderKanban,
  Image as ImageIcon,
  Pencil,
  Plus,
  Send,
  Star,
  Trash2,
  X,
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
} from '../../services/contentService';
import type { ProjectItem } from '../../types/database';

const categories = [
  'All',
  'Social Media Designs',
  'Branding',
  'Content Creation',
  'Marketing Campaigns',
];

const emptyForm = {
  title: '',
  slug: '',
  client_name: '',
  industry: 'Fashion & E-Commerce',
  category: 'Social Media Designs',
  marketing_objective: '',
  strategy: '',
  description: '',
  cover_image_url: '',
  project_images: [] as string[],
  result_metric: '+140% Engagement',
  result_description: 'Organic impressions',
  verified_results: [] as string[],
  services_provided: [] as string[],
  case_study_url: '#contact',
  is_featured: true,
  is_published: true,
  is_visible: true,
  display_order: 1,
};

export function ProjectsPage() {
  const { refreshOverview } = useOutletContext<{ refreshOverview?: () => void }>() || {};

  const [items, setItems] = useState<ProjectItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Helper inputs for tags/arrays
  const [newResultBullet, setNewResultBullet] = useState('');
  const [newServiceTag, setNewServiceTag] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminList<ProjectItem>('projects');
      setItems(data.sort((a, b) => a.display_order - b.display_order));
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to load projects.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
    setNewResultBullet('');
    setNewServiceTag('');
    setNewImageUrl('');
  };

  const startEdit = (project: ProjectItem) => {
    setEditingId(project.id);
    setForm({
      title: project.title,
      slug: project.slug || '',
      client_name: project.client_name || '',
      industry: project.industry || 'Fashion & E-Commerce',
      category: project.category || 'Social Media Designs',
      marketing_objective: project.marketing_objective || '',
      strategy: project.strategy || '',
      description: project.description,
      cover_image_url: project.cover_image_url || '',
      project_images: Array.isArray(project.project_images) ? project.project_images : [],
      result_metric: project.result_metric || '',
      result_description: project.result_description || '',
      verified_results: Array.isArray(project.verified_results) ? project.verified_results : [],
      services_provided: Array.isArray(project.services_provided) ? project.services_provided : [],
      case_study_url: project.case_study_url || '#contact',
      is_featured: project.is_featured,
      is_published: project.is_published,
      is_visible: project.is_visible !== false,
      display_order: project.display_order,
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        ...form,
        display_order: Number(form.display_order) || 1,
        slug: form.slug.trim() || undefined,
      };
      if (editingId) {
        await adminUpdate('projects', editingId, payload);
      } else {
        await adminCreate('projects', payload);
      }
      await loadData();
      resetForm();
      setMessage({ type: 'success', text: `Project ${editingId ? 'updated' : 'created'} successfully.` });
      if (refreshOverview) refreshOverview();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save project.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await adminDelete('projects', id);
      await loadData();
      setMessage({ type: 'success', text: 'Project deleted.' });
      if (refreshOverview) refreshOverview();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete project.',
      });
    }
  };

  const togglePublish = async (project: ProjectItem) => {
    try {
      if (project.is_published) {
        await adminUnpublish('projects', project.id);
      } else {
        await adminPublish('projects', project.id);
      }
      await loadData();
      if (refreshOverview) refreshOverview();
    } catch (err) {
      alert('Failed to update publish state.');
    }
  };

  const toggleFeatured = async (project: ProjectItem) => {
    try {
      await adminUpdate('projects', project.id, { is_featured: !project.is_featured });
      await loadData();
    } catch (err) {
      alert('Failed to toggle featured status.');
    }
  };

  const moveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const reordered = [...items];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;
    setItems(reordered);

    try {
      await adminReorder('projects', reordered.map((p) => p.id));
      await loadData();
    } catch (err) {
      await loadData();
    }
  };

  const filteredItems = items.filter((p) => {
    if (activeCategory === 'All') return true;
    return p.category === activeCategory;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Portfolio Projects & Case Studies</h1>
          <p className="mt-1 text-xs text-white/60">
            Manage client case studies, verified marketing metrics, imagery, objectives, and strategies.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setForm((prev) => ({ ...prev, display_order: items.length + 1 }));
            setIsFormOpen(true);
          }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#f04796] text-[#0d0d0f] font-bold shadow-[0_0_20px_rgba(240,71,150,0.35)] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#ff6ab3]"
        >
          <Plus size={15} /> Add Case Study
        </button>
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

      {/* Category Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-medium transition ${
              activeCategory === cat
                ? 'bg-[#f04796] text-[#0d0d0f] font-bold shadow-[0_0_20px_rgba(240,71,150,0.35)] text-white shadow-xs'
                : 'border border-white/10 bg-[#131117] text-white hover:bg-[#0a0a0a]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Editor Modal / Form */}
      {isFormOpen && (
        <div className="rounded-2xl border border-[#344238]/30 bg-[#131117] p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold text-white">
              {editingId ? 'Edit Project / Case Study' : 'Create New Project'}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-white/60 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-white">Project Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Modest Elegance Brand Launch"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
                >
                  <option value="Social Media Designs">Social Media Designs</option>
                  <option value="Branding">Branding</option>
                  <option value="Content Creation">Content Creation</option>
                  <option value="Marketing Campaigns">Marketing Campaigns</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-white">Client / Brand Name</label>
                <input
                  type="text"
                  value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  placeholder="e.g. Al-Noor Couture"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white">Industry</label>
                <input
                  type="text"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  placeholder="e.g. Modest Fashion, Halal Skincare"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white">URL Slug (Optional)</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="e.g. al-noor-couture"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-white">Marketing Objective</label>
                <textarea
                  rows={2}
                  value={form.marketing_objective}
                  onChange={(e) => setForm({ ...form, marketing_objective: e.target.value })}
                  placeholder="Goal: Establish dominant brand voice and generate 1,000+ orders in 30 days..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] p-2.5 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white">Strategic Execution</label>
                <textarea
                  rows={2}
                  value={form.strategy}
                  onChange={(e) => setForm({ ...form, strategy: e.target.value })}
                  placeholder="Bespoke Reels storytelling, micro-influencer outreach, and targeted Meta Ads..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] p-2.5 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white">Summary Description</label>
              <textarea
                rows={3}
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="High-level project summary displayed on the card..."
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] p-3 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
              />
            </div>

            {/* Metrics */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-white">Primary Metric Highlight</label>
                <input
                  type="text"
                  value={form.result_metric}
                  onChange={(e) => setForm({ ...form, result_metric: e.target.value })}
                  placeholder="e.g. +310% Revenue Growth"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-white">Metric Subtitle</label>
                <input
                  type="text"
                  value={form.result_description}
                  onChange={(e) => setForm({ ...form, result_description: e.target.value })}
                  placeholder="e.g. over 90 days of organic campaign"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
                />
              </div>
            </div>

            {/* Verified Results Bullets */}
            <div className="space-y-2 rounded-xl border border-white/10 bg-[#16141c] p-3">
              <label className="block text-xs font-bold text-white">
                Verified Deliverables / Results Bullets
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newResultBullet}
                  onChange={(e) => setNewResultBullet(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (newResultBullet.trim()) {
                        setForm({ ...form, verified_results: [...form.verified_results, newResultBullet.trim()] });
                        setNewResultBullet('');
                      }
                    }
                  }}
                  placeholder="Add metric bullet (e.g. 1.2M video views, 4.8x ROAS)..."
                  className="flex-1 rounded-lg border border-white/10 bg-[#16141c] px-3 py-1.5 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newResultBullet.trim()) {
                      setForm({ ...form, verified_results: [...form.verified_results, newResultBullet.trim()] });
                      setNewResultBullet('');
                    }
                  }}
                  className="rounded-lg bg-[#f04796] text-[#0d0d0f] font-bold shadow-[0_0_20px_rgba(240,71,150,0.35)] px-3 py-1.5 text-xs font-medium text-white"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {form.verified_results.map((bullet, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-md bg-[#131117] border border-white/10 px-2.5 py-1 text-xs text-white"
                  >
                    <span>{bullet}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          verified_results: form.verified_results.filter((_, i) => i !== idx),
                        })
                      }
                      className="text-white/60 hover:text-rose-600"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Imagery & Uploads */}
            <div className="grid gap-4 sm:grid-cols-2">
              <ImageUploadField
                label="Cover Image"
                value={form.cover_image_url}
                onChange={(url) => setForm({ ...form, cover_image_url: url })}
                folder="projects"
                helperText="Primary image thumbnail displayed on the card"
              />

              <div className="space-y-2">
                <label className="block text-xs font-medium text-white">Case Study Link</label>
                <input
                  type="text"
                  value={form.case_study_url}
                  onChange={(e) => setForm({ ...form, case_study_url: e.target.value })}
                  placeholder="#contact"
                  className="w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
                />

                <div className="pt-4 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-white">
                    <input
                      type="checkbox"
                      checked={form.is_featured}
                      onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                      className="h-4 w-4 rounded-sm border-white/10 text-[#f6b7d2]"
                    />
                    <span>Feature on homepage</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-white">
                    <input
                      type="checkbox"
                      checked={form.is_visible}
                      onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
                      className="h-4 w-4 rounded-sm border-white/10 text-[#f6b7d2]"
                    />
                    <span>Visible</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-white">
                    <input
                      type="checkbox"
                      checked={form.is_published}
                      onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                      className="h-4 w-4 rounded-sm border-white/10 text-[#f6b7d2]"
                    />
                    <span>Published (Live)</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#f04796] text-[#0d0d0f] font-bold shadow-[0_0_20px_rgba(240,71,150,0.35)] px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#ff6ab3] disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Case Study' : 'Create Case Study'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#131117] shadow-xs">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/60">
            Case Studies ({filteredItems.length})
          </h2>
          <span className="text-[11px] text-white/60">Order controls position on public landing page</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="p-12 text-center text-xs text-white/60">
            No case studies found in this category. Click &quot;Add Case Study&quot; to create one.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {filteredItems.map((project, index) => (
              <div
                key={project.id}
                className="flex flex-col gap-4 p-4 transition hover:bg-[#16141c] sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1 text-white/60">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => void moveOrder(index, 'up')}
                      className="hover:text-white disabled:opacity-20"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={index === filteredItems.length - 1}
                      onClick={() => void moveOrder(index, 'down')}
                      className="hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]">
                    {project.cover_image_url ? (
                      <img
                        src={project.cover_image_url}
                        alt={project.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/60">
                        <ImageIcon size={20} />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white">{project.title}</h3>
                      {project.is_featured && (
                        <span className="flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                          <Star size={10} className="fill-amber-500 text-amber-500" /> Featured
                        </span>
                      )}
                      {project.category && (
                        <span className="rounded-md bg-[#0a0a0a] px-2 py-0.5 text-[10px] font-medium text-[#f6b7d2] border border-white/10">
                          {project.category}
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-[11px] text-white/60">
                      {project.client_name && <span>Client: {project.client_name}</span>}
                      {project.result_metric && (
                        <span className="font-semibold text-emerald-700">
                          {project.result_metric}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => void togglePublish(project)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      project.is_published
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {project.is_published ? 'Published' : 'Draft'}
                  </button>

                  <button
                    type="button"
                    onClick={() => void toggleFeatured(project)}
                    title={project.is_featured ? 'Featured on home' : 'Not featured'}
                    className={`h-8 w-8 flex items-center justify-center rounded-lg border transition ${
                      project.is_featured
                        ? 'border-amber-300 bg-amber-50 text-amber-700'
                        : 'border-white/10 bg-[#0a0a0a] text-white/60'
                    }`}
                  >
                    <Star size={14} className={project.is_featured ? 'fill-amber-500' : ''} />
                  </button>

                  <button
                    type="button"
                    onClick={() => startEdit(project)}
                    title="Edit Case Study"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#131117] text-white transition hover:bg-[#0a0a0a]"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(project.id, project.title)}
                    title="Delete Case Study"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition hover:bg-rose-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
