import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CheckCircle, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  adminCreate,
  adminDelete,
  adminList,
  adminUpdate,
} from '../../services/contentService';
import type { SkillItem } from '../../types/database';

const emptyForm = { name: '', icon: '', display_order: 1, is_visible: true, is_published: true };

export function SkillsPage() {
  const { refreshOverview } = useOutletContext<{ refreshOverview?: () => void }>() || {};

  const [items, setItems] = useState<SkillItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminList<SkillItem>('skills');
      setItems(data.sort((a, b) => a.display_order - b.display_order));
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to load skills.' });
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
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = { ...form, display_order: Number(form.display_order) || 1 };
      if (editingId) await adminUpdate('skills', editingId, payload);
      else await adminCreate('skills', payload);
      await loadData();
      resetForm();
      setMessage({ type: 'success', text: `Skill ${editingId ? 'updated' : 'added'} successfully.` });
      if (refreshOverview) refreshOverview();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save skill.' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this skill?')) return;
    try {
      await adminDelete('skills', id);
      await loadData();
      setMessage({ type: 'success', text: 'Skill deleted.' });
      if (refreshOverview) refreshOverview();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to delete skill.' });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Skills & Marketing Tools</h1>
        <p className="mt-1 text-xs text-white/60">
          Manage skill tags, advertising platforms, and strategy competencies.
        </p>
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

      {/* Form Card */}
      <form onSubmit={save} className="rounded-2xl border border-white/10 bg-[#131117] p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 border-b border-white/10 pb-3">
          {editingId ? 'Edit Skill Tag' : 'Add New Skill'}
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-white">Skill Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Meta Ads Manager, TikTok Growth, Adobe Premiere"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white">Display Order</label>
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-2 text-xs font-semibold text-white"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#f04796] text-[#0d0d0f] font-bold shadow-[0_0_20px_rgba(240,71,150,0.35)] px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#ff6ab3] disabled:opacity-50"
          >
            <Plus size={14} />
            {saving ? 'Saving...' : editingId ? 'Update Skill' : 'Add Skill'}
          </button>
        </div>
      </form>

      {/* Skills Grid */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#131117] shadow-xs p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-4">
          Active Skills List ({items.length})
        </h2>

        <div className="flex flex-wrap gap-2.5">
          {items.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#0a0a0a] px-3.5 py-2 text-xs font-medium text-white shadow-2xs"
            >
              <span>{skill.name}</span>
              <button
                type="button"
                onClick={() => {
                  setEditingId(skill.id);
                  setForm({
                    name: skill.name,
                    icon: skill.icon || '',
                    display_order: skill.display_order,
                    is_visible: skill.is_visible,
                    is_published: skill.is_published !== false,
                  });
                }}
                className="text-white/60 hover:text-white"
              >
                <Pencil size={12} />
              </button>
              <button
                type="button"
                onClick={() => void remove(skill.id)}
                className="text-white/60 hover:text-rose-600"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
