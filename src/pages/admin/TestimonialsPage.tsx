import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ArrowDown,
  ArrowUp,
  Building,
  CheckCircle,
  Eye,
  EyeOff,
  MessageSquareQuote,
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
import type { TestimonialItem } from '../../types/database';

const emptyForm = {
  client_name: '',
  business_name: '',
  client_designation: 'Founder & CEO',
  client_image_url: '',
  testimonial: '',
  display_order: 1,
  is_published: true,
  is_visible: true,
};

export function TestimonialsPage() {
  const { refreshOverview } = useOutletContext<{ refreshOverview?: () => void }>() || {};

  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await adminList<TestimonialItem>('testimonials');
      setItems(data.sort((a, b) => a.display_order - b.display_order));
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
    void loadData();
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const startEdit = (item: TestimonialItem) => {
    setEditingId(item.id);
    setForm({
      client_name: item.client_name,
      business_name: item.business_name || '',
      client_designation: item.client_designation,
      client_image_url: item.client_image_url || '',
      testimonial: item.testimonial,
      display_order: item.display_order,
      is_published: item.is_published,
      is_visible: item.is_visible !== false,
    });
    setIsFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const payload = { ...form, display_order: Number(form.display_order) || 1 };
      if (editingId) {
        await adminUpdate('testimonials', editingId, payload);
      } else {
        await adminCreate('testimonials', payload);
      }
      await loadData();
      resetForm();
      setMessage({ type: 'success', text: `Testimonial ${editingId ? 'updated' : 'added'} successfully.` });
      if (refreshOverview) refreshOverview();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to save testimonial.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete testimonial from "${name}"?`)) return;
    try {
      await adminDelete('testimonials', id);
      await loadData();
      setMessage({ type: 'success', text: 'Testimonial deleted.' });
      if (refreshOverview) refreshOverview();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete testimonial.',
      });
    }
  };

  const togglePublish = async (item: TestimonialItem) => {
    try {
      if (item.is_published) {
        await adminUnpublish('testimonials', item.id);
      } else {
        await adminPublish('testimonials', item.id);
      }
      await loadData();
      if (refreshOverview) refreshOverview();
    } catch (err) {
      alert('Failed to toggle testimonial state.');
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
      await adminReorder('testimonials', reordered.map((t) => t.id));
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
          <h1 className="text-xl font-bold tracking-tight text-white">Client Testimonials & Reviews</h1>
          <p className="mt-1 text-xs text-white/60">
            Curate social proof, client reviews, designations, and business names shown on the landing page.
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
          <Plus size={15} /> Add Testimonial
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

      {/* Editor Modal / Form */}
      {isFormOpen && (
        <div className="rounded-2xl border border-[#344238]/30 bg-[#131117] p-6 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold text-white">
              {editingId ? 'Edit Testimonial' : 'Create New Testimonial'}
            </h2>
            <button type="button" onClick={resetForm} className="text-white/60 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-white">Client Name *</label>
                <input
                  type="text"
                  required
                  value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  placeholder="e.g. Fatima Al-Zahra"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white">Business / Brand Name</label>
                <input
                  type="text"
                  value={form.business_name}
                  onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                  placeholder="e.g. Modest Silhouette Dubai"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white">Title / Designation</label>
                <input
                  type="text"
                  value={form.client_designation}
                  onChange={(e) => setForm({ ...form, client_designation: e.target.value })}
                  placeholder="e.g. Creative Director"
                  className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] px-3 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white">Client Quote / Review *</label>
              <textarea
                rows={4}
                required
                value={form.testimonial}
                onChange={(e) => setForm({ ...form, testimonial: e.target.value })}
                placeholder="Azmina transformed our marketing completely. We achieved 4.2x ROAS in just 60 days..."
                className="mt-1 w-full rounded-xl border border-white/10 bg-[#16141c] p-3 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:bg-[#16141c] focus:outline-hidden"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ImageUploadField
                label="Client Photo / Avatar"
                value={form.client_image_url}
                onChange={(url) => setForm({ ...form, client_image_url: url })}
                folder="testimonials"
                helperText="Square photo of client or company logo"
              />

              <div className="space-y-3 pt-6">
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
                  <span>Published (Approved for visitors)</span>
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
                {saving ? 'Saving...' : editingId ? 'Update Testimonial' : 'Create Testimonial'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#131117] shadow-xs">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/60">
            All Testimonials ({items.length})
          </h2>
          <span className="text-[11px] text-white/60">Reorder using arrows</span>
        </div>

        {items.length === 0 ? (
          <div className="p-12 text-center text-xs text-white/60">
            No testimonials added yet. Click &quot;Add Testimonial&quot; to create one.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {items.map((item, index) => (
              <div
                key={item.id}
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

                  <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-white/10 bg-[#0a0a0a]">
                    {item.client_image_url ? (
                      <img
                        src={item.client_image_url}
                        alt={item.client_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-xs text-[#f6b7d2]">
                        {item.client_name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-white">{item.client_name}</h3>
                      {item.business_name && (
                        <span className="flex items-center gap-1 rounded-md bg-[#0a0a0a] px-2 py-0.5 text-[10px] font-medium text-[#f6b7d2] border border-white/10">
                          <Building size={10} /> {item.business_name}
                        </span>
                      )}
                      <span className="text-[11px] text-white/60">• {item.client_designation}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-white/60 max-w-lg italic">
                      &quot;{item.testimonial}&quot;
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => void togglePublish(item)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      item.is_published
                        ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-50 text-amber-800 border border-amber-200'
                    }`}
                  >
                    {item.is_published ? 'Published' : 'Draft'}
                  </button>

                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    title="Edit Testimonial"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-[#131117] text-white transition hover:bg-[#0a0a0a]"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    type="button"
                    onClick={() => void handleDelete(item.id, item.client_name)}
                    title="Delete Testimonial"
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
