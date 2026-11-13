import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ArrowDown, ArrowUp, Compass, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  adminCreate,
  adminDelete,
  adminList,
  adminUpdate,
} from '../../services/contentService';
import type { ProcessStep } from '../../types/database';

const emptyForm = {
  step_number: '01',
  title: '',
  description: '',
  display_order: 1,
  is_visible: true,
  is_published: true,
};

export function ProcessPage() {
  const { refreshOverview } = useOutletContext<{ refreshOverview?: () => void }>() || {};

  const [items, setItems] = useState<ProcessStep[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminList<ProcessStep>('process');
      setItems(data.sort((a, b) => a.display_order - b.display_order));
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to load process steps.' });
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
      if (editingId) await adminUpdate('process', editingId, payload);
      else await adminCreate('process', payload);
      await loadData();
      resetForm();
      setMessage({ type: 'success', text: `Process step ${editingId ? 'updated' : 'added'} successfully.` });
      if (refreshOverview) refreshOverview();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save process step.' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this workflow step?')) return;
    try {
      await adminDelete('process', id);
      await loadData();
      setMessage({ type: 'success', text: 'Step deleted.' });
      if (refreshOverview) refreshOverview();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to delete process step.' });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Workflow Process Steps</h1>
        <p className="mt-1 text-xs text-white/60">
          Explain your 3-to-4 stage marketing engagement methodology (Audit, Strategy, Execution, Scaling).
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

      {/* Form */}
      <form onSubmit={save} className="rounded-2xl border border-white/10 bg-[#131117] p-6 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 border-b border-white/10 pb-3">
          {editingId ? 'Edit Process Step' : 'Add New Process Step'}
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-white">Step Number (e.g. 01)</label>
            <input
              required
              value={form.step_number}
              onChange={(e) => setForm({ ...form, step_number: e.target.value })}
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-white">Step Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Strategic Brand Discovery & Audit"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-white">Step Description</label>
          <textarea
            rows={3}
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Explain what happens in this stage..."
            className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] p-3 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-4">
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
              <span>Published</span>
            </label>
          </div>

          <div className="flex gap-2">
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
              {saving ? 'Saving...' : editingId ? 'Update Step' : 'Add Step'}
            </button>
          </div>
        </div>
      </form>

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#131117] shadow-xs divide-y divide-white/10">
        {items.map((step) => (
          <div key={step.id} className="p-4 flex items-center justify-between transition hover:bg-[#16141c]">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0a0a0a] font-mono text-xs font-bold text-[#f6b7d2] border border-white/10">
                {step.step_number}
              </span>
              <div>
                <h3 className="text-xs font-bold text-white">{step.title}</h3>
                <p className="mt-0.5 line-clamp-1 text-[11px] text-white/60 max-w-md">{step.description}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingId(step.id);
                  setForm({
                    step_number: step.step_number,
                    title: step.title,
                    description: step.description,
                    display_order: step.display_order,
                    is_visible: step.is_visible,
                    is_published: step.is_published !== false,
                  });
                }}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#131117] text-white hover:bg-[#0a0a0a]"
              >
                <Pencil size={13} />
              </button>
              <button
                type="button"
                onClick={() => void remove(step.id)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
