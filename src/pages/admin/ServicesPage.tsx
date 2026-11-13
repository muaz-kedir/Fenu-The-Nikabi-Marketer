import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  CheckCircle,
  Eye,
  EyeOff,
  Layers,
  Pencil,
  Plus,
  Send,
  Trash2,
  X,
} from 'lucide-react';
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
import type { ServiceItem } from '../../types/database';

const emptyForm = {
  title: '',
  description: '',
  category: 'Social Media Management',
  price_starting_from: '$500/mo',
  icon: 'Layers',
  image_url: '',
  image_alt: '',
  display_order: 1,
  is_visible: true,
  is_published: true,
};

export function ServicesPage() {
  const { refreshOverview } = useOutletContext<{ refreshOverview?: () => void }>() || {};

  const [items, setItems] = useState<ServiceItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminList<ServiceItem>('services');
      setItems(data.sort((a, b) => a.display_order - b.display_order));
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to load services.',
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

  const startEdit = (service: ServiceItem) => {
    setEditingId(service.id);
    setForm({
      title: service.title,
      description: service.description,
      category: service.category || 'Social Media Management',
      price_starting_from: service.price_starting_from || '',
      icon: service.icon || 'Layers',
      image_url: service.image_url || '',
      image_alt: service.image_alt || '',
      display_order: service.display_order,
      is_visible: service.is_visible,
      is_published: service.is_published !== false,
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
        await adminUpdate('services', editingId, payload);
      } else {
        await adminCreate('services', payload);
      }
      await loadData();
      resetForm();
      setMessage({ type: 'success', text: `Service successfully ${editingId ? 'updated' : 'created'}.` });
      if (refreshOverview) refreshOverview();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save service.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete the service "${title}"?`)) return;
    try {
      await adminDelete('services', id);
      await loadData();
      setMessage({ type: 'success', text: 'Service deleted.' });
      if (refreshOverview) refreshOverview();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete service.',
      });
    }
  };

  const toggleVisibility = async (service: ServiceItem) => {
    try {
      await adminUpdate('services', service.id, { is_visible: !service.is_visible });
      await loadData();
    } catch (err) {
      alert('Failed to toggle visibility.');
    }
  };

  const togglePublish = async (service: ServiceItem) => {
    try {
      if (service.is_published) {
        await adminUnpublish('services', service.id);
      } else {
        await adminPublish('services', service.id);
      }
      await loadData();
      if (refreshOverview) refreshOverview();
    } catch (err) {
      alert('Failed to update publish state.');
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
      await adminReorder('services', reordered.map((s) => s.id));
      await loadData();
    } catch (err) {
      await loadData();
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Services & Offerings</h1>
          <p className="mt-1 text-xs text-white/60">
            Manage the client marketing services Azmina provides, along with pricing, categories, and icons.
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
          <Plus size={15} /> Add Service
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

      {/* Editor Modal / Card */}
      {isFormOpen && (
        <div className="rounded-2xl border border-[#344238]/30 bg-[#131117] p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold text-white">
              {editingId ? 'Edit Service' : 'Create New Service'}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="text-white/60 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-white">Service Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Social Media Management"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
                >
                  <option value="Social Media Management">Social Media Management</option>
                  <option value="Content Creation">Content Creation</option>
                  <option value="Paid Advertising">Paid Advertising</option>
                  <option value="Branding & Identity">Branding & Identity</option>
                  <option value="Strategy & Consulting">Strategy & Consulting</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-medium text-white">Starting Price (Optional)</label>
                <input
                  type="text"
                  value={form.price_starting_from}
                  onChange={(e) => setForm({ ...form, price_starting_from: e.target.value })}
                  placeholder="e.g. Starting from $650 / month"
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

            <div>
              <label className="block text-xs font-medium text-white">Service Description</label>
              <textarea
                rows={3}
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe deliverables, scope, and strategic value for the client..."
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] p-3 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ImageUploadField
                label="Service Illustration / Graphic"
                value={form.image_url}
                onChange={(url) => setForm({ ...form, image_url: url })}
                folder="services"
                helperText="Optional visual preview card"
              />

              <div className="flex flex-col justify-end space-y-3 pb-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-white">
                  <input
                    type="checkbox"
                    checked={form.is_visible}
                    onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
                    className="h-4 w-4 rounded-sm border-white/10 text-[#f6b7d2]"
                  />
                  <span>Visible on public site</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-white">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                    className="h-4 w-4 rounded-sm border-white/10 text-[#f6b7d2]"
                  />
                  <span>Published (Live)</span>
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
                {saving ? 'Saving...' : editingId ? 'Update Service' : 'Create Service'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services List Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#131117] shadow-xs">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/60">
            All Services ({items.length})
          </h2>
          <span className="text-[11px] text-white/60">Drag or use arrows to reorder items</span>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-xs text-white/60">
            No services added yet. Click &quot;Add Service&quot; to create one.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {items.map((service, index) => (
              <div
                key={service.id}
                className="flex flex-col gap-4 p-4 transition hover:bg-[#16141c] sm:flex-row sm:items-center sm:justify-between"
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

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0a0a0a] text-[#f6b7d2] border border-white/10">
                    <Layers size={18} />
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white">{service.title}</h3>
                      {service.category && (
                        <span className="rounded-md bg-[#0a0a0a] px-2 py-0.5 text-[10px] font-medium text-[#f6b7d2] border border-white/10">
                          {service.category}
                        </span>
                      )}
                      {service.price_starting_from && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {service.price_starting_from}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-white/60 max-w-md">
                      {service.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => void togglePublish(service)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      service.is_published
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {service.is_published ? 'Published' : 'Draft'}
                  </button>

                  <button
                    type="button"
                    onClick={() => void toggleVisibility(service)}
                    title={service.is_visible ? 'Visible' : 'Hidden'}
                    className={`h-8 w-8 flex items-center justify-center rounded-lg border transition ${
                      service.is_visible
                        ? 'border-white/10 bg-[#131117] text-[#f6b7d2]'
                        : 'border-white/10 bg-[#0a0a0a] text-white/60'
                    }`}
                  >
                    {service.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>

                  <button
                    type="button"
                    onClick={() => startEdit(service)}
                    title="Edit Service"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#131117] text-white transition hover:bg-[#0a0a0a]"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(service.id, service.title)}
                    title="Delete Service"
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
