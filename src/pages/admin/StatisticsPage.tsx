import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart3, Pencil, Plus, Trash2 } from 'lucide-react';
import {
  adminCreate,
  adminDelete,
  adminList,
  adminUpdate,
} from '../../services/contentService';
import type { Statistic } from '../../types/database';

const emptyForm = { label: '', value: '', suffix: '', icon: 'TrendingUp', display_order: 1, is_visible: true, is_published: true };

export function StatisticsPage() {
  const { refreshOverview } = useOutletContext<{ refreshOverview?: () => void }>() || {};

  const [items, setItems] = useState<Statistic[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminList<Statistic>('statistics');
      setItems(data.sort((a, b) => a.display_order - b.display_order));
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to load statistics.' });
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
      if (editingId) await adminUpdate('statistics', editingId, payload);
      else await adminCreate('statistics', payload);
      await loadData();
      resetForm();
      setMessage({ type: 'success', text: `Statistic ${editingId ? 'updated' : 'added'} successfully.` });
      if (refreshOverview) refreshOverview();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save statistic.' });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this statistic?')) return;
    try {
      await adminDelete('statistics', id);
      await loadData();
      setMessage({ type: 'success', text: 'Statistic deleted.' });
      if (refreshOverview) refreshOverview();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to delete statistic.' });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Performance Metrics & Numbers</h1>
        <p className="mt-1 text-xs text-white/60">
          Highlight key achievement numbers (e.g. 100+ Projects Scaled, 5+ Years Experience, $1.8M Generated).
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
          {editingId ? 'Edit Performance Metric' : 'Add Metric'}
        </h2>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-medium text-white">Metric Label *</label>
            <input
              required
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              placeholder="e.g. Brands Scaled"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white">Value *</label>
            <input
              required
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="e.g. 120"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-white">Suffix (e.g. +, %, M)</label>
            <input
              value={form.suffix}
              onChange={(e) => setForm({ ...form, suffix: e.target.value })}
              placeholder="e.g. +"
              className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
            />
          </div>
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
              {saving ? 'Saving...' : editingId ? 'Update Metric' : 'Add Metric'}
            </button>
          </div>
        </div>
      </form>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {items.map((stat) => (
          <div
            key={stat.id}
            className="flex flex-col justify-between rounded-2xl border border-white/10 bg-[#131117] p-5 shadow-xs"
          >
            <div>
              <div className="text-3xl font-bold tracking-tight text-white">
                {stat.value}
                <span className="text-[#f6b7d2]">{stat.suffix}</span>
              </div>
              <h3 className="mt-1 text-xs font-semibold uppercase tracking-wider text-white/60">
                {stat.label}
              </h3>
            </div>

            <div className="mt-4 flex items-center justify-end gap-1.5 border-t border-white/10 pt-3">
              <button
                type="button"
                onClick={() => {
                  setEditingId(stat.id);
                  setForm({
                    label: stat.label,
                    value: stat.value,
                    suffix: stat.suffix || '',
                    icon: stat.icon || 'TrendingUp',
                    display_order: stat.display_order,
                    is_visible: stat.is_visible,
                    is_published: stat.is_published !== false,
                  });
                }}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-white hover:bg-[#0a0a0a]"
              >
                <Pencil size={12} />
              </button>
              <button
                type="button"
                onClick={() => void remove(stat.id)}
                className="flex h-7 w-7 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
