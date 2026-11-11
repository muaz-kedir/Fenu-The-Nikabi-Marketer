import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, Eye, EyeOff, Loader2, MessageSquareQuote, Pencil, Plus, Trash2 } from 'lucide-react';
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
import type { TestimonialItem } from '../../types/database';

const emptyForm = {
  client_name: '',
  client_designation: '',
  client_image_url: '',
  testimonial: '',
  display_order: 1,
  is_published: true,
  is_visible: true,
};

export function TestimonialsPage() {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      setItems(await adminList<TestimonialItem>('testimonials'));
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to load testimonials.',
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

  const startEdit = (item: TestimonialItem) => {
    setEditingId(item.id);
    setForm({
      client_name: item.client_name,
      client_designation: item.client_designation,
      client_image_url: item.client_image_url || '',
      testimonial: item.testimonial,
      display_order: item.display_order,
      is_published: item.is_published,
      is_visible: item.is_visible !== false,
    });
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = { ...form, display_order: Number(form.display_order) || 1 };
      if (editingId) {
        await adminUpdate('testimonials', editingId, payload);
      } else {
        await adminCreate('testimonials', payload);
      }
      await load();
      reset();
      setMessage({ type: 'success', text: `Testimonial ${editingId ? 'updated' : 'added'} successfully.` });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save testimonial.',
      });
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete testimonial from "${name}"?`)) return;
    try {
      await adminDelete('testimonials', id);
      await load();
      if (editingId === id) reset();
      setMessage({ type: 'success', text: 'Testimonial deleted.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete testimonial.',
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
      await adminReorder('testimonials', ids);
      await load();
    } catch {
      setMessage({ type: 'error', text: 'Failed to reorder testimonials.' });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Testimonials</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Client Reviews & Testimonials</h1>
        </div>
        <button
          type="button"
          onClick={() => {
            reset();
            setForm({ ...emptyForm, display_order: items.length + 1 });
          }}
          className="inline-flex items-center gap-2 rounded-full border border-[#f04796] bg-[#f04796] px-4 py-2 text-xs font-semibold text-[#0d0d0f] hover:bg-[#ff6ab3]"
        >
          <Plus size={14} /> New Testimonial
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

      {/* Form */}
      <form onSubmit={save} className="rounded-[28px] border border-white/10 bg-[#141416] p-6 space-y-5">
        <h3 className="text-base font-semibold text-white">
          {editingId ? 'Edit Testimonial' : 'Add New Client Review'}
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Client Full Name</label>
            <input
              required
              value={form.client_name}
              onChange={(e) => setForm({ ...form, client_name: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
              placeholder="e.g. Nadia Rahman"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-white/70 mb-1.5">Client Title / Company</label>
            <input
              required
              value={form.client_designation}
              onChange={(e) => setForm({ ...form, client_designation: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
              placeholder="e.g. Founder, Noor Atelier"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-white/70 mb-1.5">Testimonial Quote</label>
            <textarea
              required
              rows={4}
              value={form.testimonial}
              onChange={(e) => setForm({ ...form, testimonial: e.target.value })}
              className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] px-3.5 py-2.5 text-sm text-white focus:border-[#f04796] focus:outline-none"
              placeholder="Client words describing results, strategy, and experience..."
            />
          </div>
          <div className="md:col-span-2">
            <ImageUploadField
              label="Client Photograph (Optional Avatar)"
              value={form.client_image_url}
              onChange={(url) => setForm({ ...form, client_image_url: url })}
              folder="testimonials"
              aspect="circle"
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
              {saving ? 'Saving...' : editingId ? 'Update Testimonial' : 'Add Testimonial'}
            </button>
          </div>
        </div>
      </form>

      {/* Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-white/70">Reviews ({items.length})</h3>
        {loading ? (
          <div className="flex h-32 items-center justify-center text-white/50">
            <Loader2 size={20} className="animate-spin mr-2 text-[#f04796]" /> Loading testimonials...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#141416] p-8 text-center text-white/40 text-sm">
            No testimonials added yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, idx) => (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-[24px] border border-white/10 bg-[#141416] p-5 transition hover:border-[#f04796]/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {item.client_image_url ? (
                        <img src={item.client_image_url} alt={item.client_name} className="h-10 w-10 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f04796]/20 font-bold text-[#f6b7d2]">
                          {item.client_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm font-semibold text-white">{item.client_name}</h4>
                        <p className="text-[11px] text-white/50">{item.client_designation}</p>
                      </div>
                    </div>

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

                  <p className="mt-3 text-xs italic leading-6 text-white/70 line-clamp-4">“{item.testimonial}”</p>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        await adminUpdate('testimonials', item.id, { is_visible: !item.is_visible });
                        await load();
                      }}
                      className={`text-xs inline-flex items-center gap-1 ${
                        item.is_visible ? 'text-emerald-400' : 'text-white/40'
                      }`}
                    >
                      {item.is_visible ? <Eye size={12} /> : <EyeOff size={12} />}
                      {item.is_visible ? 'Visible' : 'Hidden'}
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        if (item.is_published) {
                          await adminUnpublish('testimonials', item.id);
                        } else {
                          await adminPublish('testimonials', item.id);
                        }
                        await load();
                      }}
                      className={`text-[11px] ${item.is_published ? 'text-[#f6b7d2]' : 'text-white/40'}`}
                    >
                      {item.is_published ? 'Published' : 'Draft'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => startEdit(item)}
                      className="text-xs text-white/60 hover:text-white"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(item.id, item.client_name)}
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
