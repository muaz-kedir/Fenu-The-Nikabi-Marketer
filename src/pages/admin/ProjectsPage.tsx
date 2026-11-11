import { useEffect, useState } from 'react';
import { adminCreate, adminDelete, adminList, adminPublish, adminUnpublish, adminUpdate } from '../../services/contentService';
import type { ProjectItem } from '../../types/database';

const emptyForm = {
  title: '',
  slug: '',
  description: '',
  category: '',
  cover_image_url: '',
  result_metric: '',
  result_description: '',
  case_study_url: '',
  is_featured: false,
  is_published: true,
  display_order: 1,
};

export function ProjectsPage() {
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try { setItems(await adminList<ProjectItem>('projects')); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Failed to load projects.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const reset = () => { setForm(emptyForm); setEditingId(null); };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = { ...form, display_order: Number(form.display_order) || 1, slug: form.slug || undefined };
      if (editingId) await adminUpdate('projects', editingId, payload);
      else await adminCreate('projects', payload);
      await load();
      reset();
      setMessage('Project saved successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save project.');
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this project?')) return;
    try { await adminDelete('projects', id); await load(); setMessage('Project deleted.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Failed to delete project.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Projects</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Manage portfolio projects</h1>
        </div>
      </div>
      {message && <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{message}</div>}
      <form onSubmit={save} className="rounded-[28px] border border-white/10 bg-[#141414] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-white/70">Title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/70">Slug<input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/70 md:col-span-2">Description<textarea required rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/70">Category<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/70">Cover image URL<input value={form.cover_image_url} onChange={(event) => setForm({ ...form, cover_image_url: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/70">Result metric<input value={form.result_metric} onChange={(event) => setForm({ ...form, result_metric: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/70">Result description<input value={form.result_description} onChange={(event) => setForm({ ...form, result_description: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/70">Case study URL<input value={form.case_study_url} onChange={(event) => setForm({ ...form, case_study_url: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/70">Display order<input type="number" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: Number(event.target.value) })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={form.is_featured} onChange={(event) => setForm({ ...form, is_featured: event.target.checked })} /> Featured</label>
          <label className="flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} /> Published</label>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={reset} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-full border border-[#f04796] bg-[#f04796] px-5 py-2.5 text-sm font-medium text-[#0d0d0f] disabled:opacity-70">{saving ? 'Saving...' : editingId ? 'Update project' : 'New project'}</button>
        </div>
      </form>

      {loading ? <div className="text-white/60">Loading projects...</div> : (
        <div className="grid gap-4 lg:grid-cols-3">
          {items.map((project) => (
            <div key={project.id} className="overflow-hidden rounded-[28px] border border-white/10 bg-[#141414]">
              <img src={project.cover_image_url || 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'} alt={project.title} className="h-52 w-full object-cover" />
              <div className="p-5">
                <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#f6b7d2]">
                  {project.is_published ? 'Published' : 'Draft'}
                  {project.is_featured && <span className="rounded-full border border-[#f04796]/40 bg-[#f04796]/10 px-2 py-1 text-[10px]">Featured</span>}
                </div>
                <h2 className="text-xl font-semibold text-white">{project.title}</h2>
                <p className="mt-2 text-sm text-white/60">{project.description}</p>
                <div className="mt-5 flex gap-2">
                  <button type="button" onClick={() => { setEditingId(project.id); setForm({ title: project.title, slug: project.slug, description: project.description, category: project.category || '', cover_image_url: project.cover_image_url || '', result_metric: project.result_metric || '', result_description: project.result_description || '', case_study_url: project.case_study_url || '', is_featured: project.is_featured, is_published: project.is_published ?? true, display_order: project.display_order }); }} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">Edit</button>
                  <button type="button" onClick={() => void adminPublish('projects', project.id).then(load)} className="rounded-full border border-[#f04796]/40 bg-[#f04796]/10 px-3 py-1.5 text-xs text-[#f6b7d2]">Publish</button>
                  <button type="button" onClick={() => void adminUnpublish('projects', project.id).then(load)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">Unpublish</button>
                  <button type="button" onClick={() => void remove(project.id)} className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
