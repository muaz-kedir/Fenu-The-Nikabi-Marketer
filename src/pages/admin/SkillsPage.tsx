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
        <h1 className="text-xl font-bold tracking-tight text-[#29251F]">Skills & Marketing Tools</h1>
        <p className="mt-1 text-xs text-[#8B806D]">
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
      <form onSubmit={save} className="rounded-2xl border border-[#E7DCCB] bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B806D] border-b border-[#E7DCCB]/60 pb-3">
          {editingId ? 'Edit Skill Tag' : 'Add New Skill'}
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-[#29251F]">Skill Name *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. Meta Ads Manager, TikTok Growth, Adobe Premiere"
              className="mt-1 w-full rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 px-3 py-2 text-xs text-[#29251F] focus:border-[#344238] focus:bg-white focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#29251F]">Display Order</label>
            <input
              type="number"
              value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
              className="mt-1 w-full rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 px-3 py-2 text-xs text-[#29251F] focus:border-[#344238] focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-[#E7DCCB] bg-[#F8F4ED] px-4 py-2 text-xs font-semibold text-[#29251F]"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#344238] px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#29251F] disabled:opacity-50"
          >
            <Plus size={14} />
            {saving ? 'Saving...' : editingId ? 'Update Skill' : 'Add Skill'}
          </button>
        </div>
      </form>

      {/* Skills Grid */}
      <div className="overflow-hidden rounded-2xl border border-[#E7DCCB] bg-white shadow-xs p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B806D] mb-4">
          Active Skills List ({items.length})
        </h2>

        <div className="flex flex-wrap gap-2.5">
          {items.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center gap-2 rounded-xl border border-[#E7DCCB] bg-[#F8F4ED] px-3.5 py-2 text-xs font-medium text-[#29251F] shadow-2xs"
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
                className="text-[#8B806D] hover:text-[#29251F]"
              >
                <Pencil size={12} />
              </button>
              <button
                type="button"
                onClick={() => void remove(skill.id)}
                className="text-[#8B806D] hover:text-rose-600"
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
