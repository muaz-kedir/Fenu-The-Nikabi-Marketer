import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, FolderKanban, Loader2, Pencil, Plus, Trash2 } from 'lucide-react';
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

const emptyForm = {
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
  display_order: 1,
};

export function ProjectsPage() {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await adminList<ProjectItem>('projects'));
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
    void load();
  }, []);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (project: ProjectItem) => {
    setEditingId(project.id);
    setForm({
      title: project.title,
      slug: project.slug,
      description: project.description,
      category: project.category || '',
      cover_image_url: project.cover_image_url || '',
      result_metric: project.result_metric || '',
      result_description: project.result_description || '',
      case_study_url: project.case_study_url || '',
      is_featured: project.is_featured,
      is_published: project.is_published,
      is_visible: project.is_visible !== false,
      display_order: project.display_order,
    });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
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
      await load();
      reset();
      setMessage({ type: 'success', text: `Project ${editingId ? 'updated' : 'created'} successfully.` });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save project.',
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete project "${title}"?`)) return;
    try {
      await adminDelete('projects', id);
      await load();
      if (editingId === id) reset();
      setMessage({ type: 'success', text: 'Project deleted.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete project.',
      });
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    const reordered = [...items];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const ids = reordered.map((item) => item.id);
    try {
      await adminReorder('projects', ids);
      await load();
    } catch {
      setMessage({ type: 'error', text: 'Failed to reorder projects.' });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Projects</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Portfolio Case Studies</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            reset();
            setForm({ ...emptyForm, display_order: items.length + 1 });
          }}
          className="inline-flex items-center gap-2 rounded-full border border-[#f04796] bg-[#f04796] px-4 py-2 text-xs font-semibold text-[#0d0d0f] hover:bg-[#ff6ab3]"
        >
          <Plus size={14} /> New Project
        </button>
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

      {/* Form */}
      <form onSubmit={save} className="rounded-[28px] border border-white/10 bg-[#141416] p-6 space-y-5">
        <h3 className="text-base font-semibold text-white">
          {editingId ? 'Edit Project' : 'Add New Case Study'}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Project Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
              placeholder="e.g. Brand Lift Campaign"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Category</label>
            <input
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
              placeholder="e.g. Social Campaign, Performance"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-white/70 mb-1.5">Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
              placeholder="Campaign objective, execution, and outcomes..."
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Result Metric (Highlight)</label>
            <input
              value={form.result_metric}
              onChange={(e) => setForm({ ...form, result_metric: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
              placeholder="+186% engagement"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Case Study URL</label>
            <input
              value={form.case_study_url}
              onChange={(e) => setForm({ ...form, case_study_url: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
              placeholder="#contact or external link"
            />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField
              label="Cover Photograph"
              value={form.cover_image_url}
              onChange={(url) => setForm({ ...form, cover_image_url: url })}
              folder="projects"
              aspect="video"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="rounded border-white/20 bg-black/40 text-[#f04796] focus:ring-0"
              />
              Feature on Homepage
            </label>
            <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="rounded border-white/20 bg-black/40 text-[#f04796] focus:ring-0"
              />
              Published
            </label>
            <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_visible}
                onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
                className="rounded border-white/20 bg-black/40 text-[#f04796] focus:ring-0"
              />
              Visible
            </label>
          </div>

          <div className="flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 hover:bg-white/10"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#f04796] px-5 py-2.5 text-xs font-semibold text-[#0d0d0f] shadow-[0_0_20px_rgba(240,71,150,0.3)] hover:bg-[#ff6ab3] disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update Project' : 'Add Project'}
            </button>
          </div>
        </div>
      </form>

      {/* Projects Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white/70">Projects ({items.length})</h3>
        {loading ? (
          <div className="flex h-32 items-center justify-center text-white/50">
            <Loader2 size={20} className="animate-spin mr-2 text-[#f04796]" /> Loading projects...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#141416] p-8 text-center text-white/40 text-sm">
            No projects added yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((project, idx) => (
              <div
                key={project.id}
                className="flex flex-col justify-between overflow-hidden rounded-[24px] border border-white/10 bg-[#141416] transition hover:border-[#f04796]/40"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                    {project.cover_image_url ? (
                      <img src={project.cover_image_url} alt={project.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-white/30">No Image</div>
                    )}
                    {project.is_featured && (
                      <span className="absolute top-2.5 left-2.5 rounded-full bg-[#f04796] px-2.5 py-0.5 text-[9px] font-bold text-[#0d0d0f]">
                        FEATURED
                      </span>
                    )}
                  </div>

                  <div className="p-4">
                    <span className="text-[10px] font-bold text-[#f6b7d2] uppercase tracking-wider">
                      {project.result_metric}
                    </span>
                    <h4 className="mt-1 text-sm font-semibold text-white">{project.title}</h4>
                    <p className="mt-1 text-xs text-white/60 line-clamp-2 leading-5">{project.description}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/5 p-4 pt-3">
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => void handleReorder(idx, idx - 1)}
                      disabled={idx === 0}
                      className="p-1 text-white/40 hover:text-white disabled:opacity-20"
                      title="Move Up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleReorder(idx, idx + 1)}
                      disabled={idx === items.length - 1}
                      className="p-1 text-white/40 hover:text-white disabled:opacity-20"
                      title="Move Down"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(project)}
                      className="text-xs text-white/60 hover:text-white"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(project.id, project.title)}
                      className="text-xs text-red-400/80 hover:text-red-300"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
