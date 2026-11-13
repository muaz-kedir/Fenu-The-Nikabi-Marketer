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
          <h1 className="text-xl font-bold tracking-tight text-[#29251F]">Navigation Menu Items</h1>
          <p className="mt-1 text-xs text-[#8B806D]">
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
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#344238] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#29251F]"
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
        <div className="rounded-2xl border border-[#344238]/30 bg-white p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#E7DCCB] pb-3">
            <h2 className="text-sm font-bold text-[#29251F]">
              {editingId ? 'Edit Menu Item' : 'New Menu Item'}
            </h2>
            <button type="button" onClick={resetForm} className="text-[#8B806D] hover:text-[#29251F]">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-[#29251F]">Item Label *</label>
                <input
                  type="text"
                  required
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  placeholder="e.g. Services, About, Work"
                  className="mt-1 w-full rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 px-3 py-2 text-xs text-[#29251F] focus:border-[#344238] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#29251F]">Link Destination / URL *</label>
                <input
                  type="text"
                  required
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="e.g. #services or https://..."
                  className="mt-1 w-full rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 px-3 py-2 text-xs text-[#29251F] focus:border-[#344238] focus:bg-white focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-[#29251F]">Display Order</label>
                <input
                  type="number"
                  value={form.display_order}
                  onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 px-3 py-2 text-xs text-[#29251F] focus:border-[#344238] focus:bg-white focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-6 pt-5">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#29251F]">
                  <input
                    type="checkbox"
                    checked={form.is_cta}
                    onChange={(e) => setForm({ ...form, is_cta: e.target.checked })}
                    className="h-4 w-4 rounded-sm border-[#E7DCCB] text-[#344238]"
                  />
                  <span>Highlight as Header Button (CTA)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[#29251F]">
                  <input
                    type="checkbox"
                    checked={form.is_visible}
                    onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
                    className="h-4 w-4 rounded-sm border-[#E7DCCB] text-[#344238]"
                  />
                  <span>Visible</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-[#E7DCCB] pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-[#E7DCCB] bg-[#F8F4ED] px-4 py-2 text-xs font-semibold text-[#29251F] transition hover:bg-[#E7DCCB]/60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#344238] px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#29251F] disabled:opacity-50"
              >
                {saving ? 'Saving...' : editingId ? 'Update Item' : 'Add Item'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-[#E7DCCB] bg-white shadow-xs">
        <div className="p-4 border-b border-[#E7DCCB] flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#8B806D]">
            Navigation Links ({items.length})
          </h2>
          <span className="text-[11px] text-[#8B806D]">Changes apply instantly once saved</span>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#8B806D]">
            No custom navigation items yet. Default links will be used on the site.
          </div>
        ) : (
          <div className="divide-y divide-[#E7DCCB]/60">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 transition hover:bg-[#F8F4ED]/40"
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1 text-[#8B806D]">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => void moveOrder(index, 'up')}
                      className="hover:text-[#29251F] disabled:opacity-20"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={index === items.length - 1}
                      onClick={() => void moveOrder(index, 'down')}
                      className="hover:text-[#29251F] disabled:opacity-20"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#29251F]">{item.label}</span>
                      {item.is_cta && (
                        <span className="rounded-md bg-[#344238] px-2 py-0.5 text-[10px] font-semibold text-white">
                          CTA Button
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] font-mono text-[#8B806D]">{item.url}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    title="Edit"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7DCCB] bg-white text-[#29251F] transition hover:bg-[#F8F4ED]"
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
