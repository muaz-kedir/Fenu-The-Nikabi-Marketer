import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, Megaphone, Pencil, Plus, Trash2 } from 'lucide-react';
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
  icon: 'Megaphone',
  image_url: '',
  image_alt: '',
  display_order: 1,
  is_visible: true,
  is_published: true,
};

export function ServicesPage() {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await adminList<ServiceItem>('services'));
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
    void load();
  }, []);

  const reset = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const startEdit = (service: ServiceItem) => {
    setEditingId(service.id);
    setForm({
      title: service.title,
      description: service.description,
      icon: service.icon || 'Megaphone',
      image_url: service.image_url || '',
      image_alt: service.image_alt || '',
      display_order: service.display_order,
      is_visible: service.is_visible,
      is_published: service.is_published !== false,
    });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = { ...form, display_order: Number(form.display_order) || 1 };
      if (editingId) {
        await adminUpdate('services', editingId, payload);
      } else {
        await adminCreate('services', payload);
      }
      await load();
      reset();
      setMessage({ type: 'success', text: `Service ${editingId ? 'updated' : 'created'} successfully.` });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save service.',
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete service "${title}"?`)) return;
    try {
      await adminDelete('services', id);
      await load();
      if (editingId === id) reset();
      setMessage({ type: 'success', text: 'Service deleted.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete service.',
      });
    }
  };

  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= items.length) return;
    const reordered = [...items];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    const ids = reordered.map((item) => item.id);
    try {
      await adminReorder('services', ids);
      await load();
    } catch {
      setMessage({ type: 'error', text: 'Failed to reorder services.' });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Services</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Bespoke Marketing Services</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            reset();
            setForm({ ...emptyForm, display_order: items.length + 1 });
          }}
          className="inline-flex items-center gap-2 rounded-full border border-[#f04796] bg-[#f04796] px-4 py-2 text-xs font-semibold text-[#0d0d0f] hover:bg-[#ff6ab3]"
        >
          <Plus size={14} /> New Service
        </button>
      </div>

      {message && (
        <div
          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-red-500/30 bg-red-500/10 text-red-200'
          }`}
        >
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} className="text-white/60 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Editor Form */}
      <form onSubmit={save} className="rounded-[28px] border border-white/10 bg-[#141416] p-6 space-y-5">
        <h3 className="text-base font-semibold text-white">
          {editingId ? 'Edit Service' : 'Add New Service Offer'}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Service Title</label>
            <input
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
              placeholder="e.g. Social Media Management"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Icon</label>
            <select
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
            >
              <option value="Megaphone">Megaphone</option>
              <option value="Target">Target</option>
              <option value="PenTool">PenTool</option>
              <option value="Rocket">Rocket</option>
              <option value="BarChart3">BarChart3</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-white/70 mb-1.5">Description</label>
            <textarea
              required
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
              placeholder="Outline deliverables and strategy included..."
            />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField
              label="Optional Service Graphic / Image"
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
              altText={form.image_alt}
              onAltTextChange={(alt) => setForm({ ...form, image_alt: alt })}
              folder="services"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_visible}
                onChange={(e) => setForm({ ...form, is_visible: e.target.checked })}
                className="rounded border-white/20 bg-black/40 text-[#f04796] focus:ring-0"
              />
              Visible on Website
            </label>
            <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_published}
                onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                className="rounded border-white/20 bg-black/40 text-[#f04796] focus:ring-0"
              />
              Published
            </label>
          </div>

          <div className="flex gap-2">
            {editingId && (
              <button
                type="button"
                onClick={reset}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 hover:bg-white/10"
              >
                Cancel Edit
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-[#f04796] px-5 py-2.5 text-xs font-semibold text-[#0d0d0f] shadow-[0_0_20px_rgba(240,71,150,0.3)] hover:bg-[#ff6ab3] disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingId ? 'Update Service' : 'Add Service'}
            </button>
          </div>
        </div>
      </form>

      {/* Services List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white/70">Current Services ({items.length})</h3>
        {loading ? (
          <div className="flex h-32 items-center justify-center text-white/50">
            <Loader2 size={20} className="animate-spin mr-2 text-[#f04796]" /> Loading services...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#141416] p-8 text-center text-white/40 text-sm">
            No services configured yet.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((service, idx) => (
              <div
                key={service.id}
                className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-[#141416] p-5 transition hover:border-[#f04796]/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-xl bg-[#f04796]/10 px-2.5 py-1 text-xs font-semibold text-[#f6b7d2]">
                      {service.icon || 'Megaphone'}
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => void handleReorder(idx, idx - 1)}
                        disabled={idx === 0}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20"
                        title="Move Up"
                      >
                        <ArrowUp size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleReorder(idx, idx + 1)}
                        disabled={idx === items.length - 1}
                        className="p-1 text-white/40 hover:text-white disabled:opacity-20"
                        title="Move Down"
                      >
                        <ArrowDown size={13} />
                      </button>
                    </div>
                  </div>
                  <h4 className="mt-3 text-base font-semibold text-white">{service.title}</h4>
                  <p className="mt-1 text-xs text-white/60 line-clamp-3 leading-5">{service.description}</p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await adminUpdate('services', service.id, { is_visible: !service.is_visible });
                        await load();
                      }}
                      className={`text-xs inline-flex items-center gap-1 ${
                        service.is_visible ? 'text-emerald-400' : 'text-white/40'
                      }`}
                    >
                      {service.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                      {service.is_visible ? 'Visible' : 'Hidden'}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (service.is_published) {
                          await adminUnpublish('services', service.id);
                        } else {
                          await adminPublish('services', service.id);
                        }
                        await load();
                      }}
                      className={`text-[11px] ${service.is_published ? 'text-[#f6b7d2]' : 'text-white/40'}`}
                    >
                      {service.is_published ? 'Published' : 'Draft'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(service)}
                      className="text-xs text-white/60 hover:text-white"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(service.id, service.title)}
                      className="text-xs text-red-400/80 hover:text-red-300"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
