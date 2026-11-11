import { useEffect, useState } from 'react';
import { adminCreate, adminDelete, adminList, adminPublish, adminUnpublish, adminUpdate } from '../../services/contentService';
import type { SkillItem } from '../../types/database';

const emptyForm = { name: '', icon: '', display_order: 1, is_visible: true, is_published: true };

export function SkillsPage() {
  const [items, setItems] = useState<SkillItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setItems(await adminList<SkillItem>('skills'));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load skills.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const reset = () => { setForm(emptyForm); setEditingId(null); };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = { ...form, display_order: Number(form.display_order) || 1 };
      if (editingId) await adminUpdate('skills', editingId, payload);
      else await adminCreate('skills', payload);
      await load();
      reset();
      setMessage('Skill saved successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save skill.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await adminDelete('skills', id);
      await load();
      setMessage('Skill deleted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete skill.');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Skills & Tools</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Manage skills</h1>
      </div>
      {message && <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{message}</div>}
      <form onSubmit={save} className="rounded-[28px] border border-white/10 bg-[#141414] p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="block text-sm text-white/70">
            Name
            <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
          </label>
          <label className="block text-sm text-white/70">
            Icon
            <input value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
          </label>
          <label className="block text-sm text-white/70">
            Display order
            <input type="number" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: Number(event.target.value) })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
          </label>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={form.is_visible} onChange={(event) => setForm({ ...form, is_visible: event.target.checked })} /> Visible
          </label>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} /> Published
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={reset} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-full border border-[#f04796] bg-[#f04796] px-5 py-2.5 text-sm font-medium text-[#0d0d0f] disabled:opacity-70">{saving ? 'Saving...' : editingId ? 'Update skill' : 'Add skill'}</button>
        </div>
      </form>

      {loading ? <div className="text-white/60">Loading skills...</div> : (
        <div className="flex flex-wrap gap-3">
          {items.map((skill) => (
            <div key={skill.id} className="rounded-full border border-[#f04796]/40 bg-[#f04796]/8 px-4 py-2.5 text-sm font-medium text-white/80">
              {skill.name}
              <span className="ml-2 text-xs text-white/40">{skill.is_published ? 'Published' : 'Draft'}</span>
              <button type="button" onClick={() => { setEditingId(skill.id); setForm({ name: skill.name, icon: skill.icon || '', display_order: skill.display_order, is_visible: skill.is_visible, is_published: skill.is_published ?? true }); }} className="ml-3 text-xs text-[#f6b7d2]">Edit</button>
              <button type="button" onClick={() => void adminPublish('skills', skill.id).then(load)} className="ml-2 text-xs text-[#f6b7d2]">Publish</button>
              <button type="button" onClick={() => void adminDelete('skills', skill.id).then(load)} className="ml-2 text-xs text-red-200">Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
