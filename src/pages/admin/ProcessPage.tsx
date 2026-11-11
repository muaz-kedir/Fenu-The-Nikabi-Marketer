import { useEffect, useState } from 'react';
import { adminCreate, adminDelete, adminList, adminPublish, adminUnpublish, adminUpdate } from '../../services/contentService';
import type { ProcessStep } from '../../types/database';

const emptyForm = { step_number: '', title: '', description: '', display_order: 1, is_visible: true, is_published: true };

export function ProcessPage() {
  const [items, setItems] = useState<ProcessStep[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try { setItems(await adminList<ProcessStep>('process')); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Failed to load process steps.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const reset = () => { setForm(emptyForm); setEditingId(null); };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = { ...form, display_order: Number(form.display_order) || 1 };
      if (editingId) await adminUpdate('process', editingId, payload);
      else await adminCreate('process', payload);
      await load();
      reset();
      setMessage('Process step saved successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save process step.');
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this process step?')) return;
    try { await adminDelete('process', id); await load(); setMessage('Process step deleted.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Failed to delete process step.'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Process</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Edit workflow steps</h1>
      </div>
      {message && <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{message}</div>}
      <form onSubmit={save} className="rounded-[28px] border border-white/10 bg-[#141414] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-white/70">Step number<input required value={form.step_number} onChange={(event) => setForm({ ...form, step_number: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/70">Title<input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/70 md:col-span-2">Description<textarea required rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/70">Display order<input type="number" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: Number(event.target.value) })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={form.is_visible} onChange={(event) => setForm({ ...form, is_visible: event.target.checked })} /> Visible</label>
          <label className="flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} /> Published</label>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={reset} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-full border border-[#f04796] bg-[#f04796] px-5 py-2.5 text-sm font-medium text-[#0d0d0f] disabled:opacity-70">{saving ? 'Saving...' : editingId ? 'Update step' : 'Add step'}</button>
        </div>
      </form>

      {loading ? <div className="text-white/60">Loading process steps...</div> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="rounded-[28px] border border-white/10 bg-[#141414] p-5">
              <div className="mb-4 text-3xl font-semibold text-[#f6b7d2]">{item.step_number}</div>
              <h2 className="text-xl font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/65">{item.description}</p>
              <div className="mt-4 text-xs text-white/50">{item.is_published ? 'Published' : 'Draft'} {item.is_visible ? '' : '(Hidden)'}</div>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => { setEditingId(item.id); setForm({ step_number: item.step_number, title: item.title, description: item.description, display_order: item.display_order, is_visible: item.is_visible, is_published: item.is_published ?? true }); }} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">Edit</button>
                <button type="button" onClick={() => void adminPublish('process', item.id).then(load)} className="rounded-full border border-[#f04796]/40 bg-[#f04796]/10 px-3 py-1.5 text-xs text-[#f6b7d2]">Publish</button>
                <button type="button" onClick={() => void adminUnpublish('process', item.id).then(load)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">Unpublish</button>
                <button type="button" onClick={() => void remove(item.id)} className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
