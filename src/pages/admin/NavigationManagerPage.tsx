import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Eye,
  EyeOff,
  Menu,
  Pencil,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import {
  adminCreate,
  adminDelete,
  adminList,
  adminPublish,
  adminReorder,
  adminUnpublish,
  adminUpdate,
} from '../../services/contentService';
import type { NavigationItem } from '../../types/database';

const emptyForm = {
  label: '',
  url: '',
  is_cta: false,
  is_visible: true,
  is_published: true,
  display_order: 1,
};

export function NavigationManagerPage() {
  const { refreshOverview } = useOutletContext<{ refreshOverview?: () => void }>() || {};

  const [items, setItems] = useState<NavigationItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminList<NavigationItem>('navigation');
      setItems(data.sort((a, b) => a.display_order - b.display_order));
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to load navigation items.',
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
  };

  const startEdit = (item: NavigationItem) => {
    setEditingId(item.id);
    setForm({
      label: item.label,
      url: item.url,
      is_cta: item.is_cta,
      is_visible: item.is_visible,
      is_published: item.is_published !== false,
      display_order: item.display_order,
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
      };
      if (editingId) {
        await adminUpdate('navigation', editingId, payload);
      } else {
        await adminCreate('navigation', payload);
      }
      await loadData();
      resetForm();
      setMessage({ type: 'success', text: `Navigation item ${editingId ? 'updated' : 'created'}.` });
      if (refreshOverview) refreshOverview();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save navigation item.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, label: string) => {
    if (!confirm(`Delete navigation item "${label}"?`)) return;
    try {
      await adminDelete('navigation', id);
      await loadData();
      setMessage({ type: 'success', text: 'Navigation item deleted.' });
      if (refreshOverview) refreshOverview();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete item.',
      });
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
      await adminReorder('navigation', reordered.map((i) => i.id));
      await loadData();
    } catch (err) {
      await loadData();
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Navigation Menu Items</h1>
          <p className="mt-1 text-xs text-white/60">
            Customize header menu links, anchor targets, and call-to-action buttons.
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
          <Plus size={15} /> Add Menu Item
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

      {isFormOpen && (
        <div className="rounded-2xl border border-[#344238]/30 bg-[#131117] p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold text-white">
              {editingId ? 'Edit Menu Item' : 'New Menu Item'}
            </h2>
            <button type="button" onClick={resetForm} className="text-white/60 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-white">Item Label *</label>
                <input
                  type="text"
                  required
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g. Services, About, Work"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white">Link Destination / URL *</label>
                <input
                  type="text"
                  required
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="e.g. #services or https://..."
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-white">Display Order</label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-6 pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-white">
                  <input
                    type="checkbox"
                    checked={form.is_cta}
                    onChange={(e) => setForm({ ...form, is_cta: e.target.checked })}
                    className="h-4 w-4 rounded-sm border-white/10 text-[#f6b7d2]"
                  />
                  <span>Highlight as Header Button (CTA)</span>
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
                {saving ? 'Saving...' : editingId ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#131117] shadow-xs">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/60">
            Navigation Links ({items.length})
          </h2>
          <span className="text-[11px] text-white/60">Changes apply instantly once saved</span>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-xs text-white/60">
            No custom navigation items yet. Default links will be used on the site.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 transition hover:bg-[#16141c]"
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
                      disabled={index === items.length - 1}
                      onClick={() => void moveOrder(index, 'down')}
                      className="hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{item.label}</span>
                      {item.is_cta && (
                        <span className="rounded-md bg-[#f04796] text-[#0d0d0f] font-bold shadow-[0_0_20px_rgba(240,71,150,0.35)] px-2 py-0.5 text-[10px] font-semibold text-white">
                          CTA Button
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-white/60">{item.url}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    title="Edit"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#131117] text-white transition hover:bg-[#0a0a0a]"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(item.id, item.label)}
                    title="Delete"
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
