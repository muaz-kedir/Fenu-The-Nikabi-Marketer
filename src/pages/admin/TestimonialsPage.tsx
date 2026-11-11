import { useEffect, useState } from 'react';
import { adminCreate, adminDelete, adminList, adminPublish, adminUnpublish, adminUpdate } from '../../services/contentService';
import type { TestimonialItem } from '../../types/database';

const emptyForm = { client_name: '', client_designation: '', client_image_url: '', testimonial: '', display_order: 1, is_published: true };

export function TestimonialsPage() {
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try { setItems(await adminList<TestimonialItem>('testimonials')); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Failed to load testimonials.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const reset = () => { setForm(emptyForm); setEditingId(null); };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = { ...form, display_order: Number(form.display_order) || 1 };
      if (editingId) await adminUpdate('testimonials', editingId, payload);
      else await adminCreate('testimonials', payload);
      await load();
      reset();
      setMessage('Testimonial saved successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save testimonial.');
    } finally { setSaving(false); }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try { await adminDelete('testimonials', id); await load(); setMessage('Testimonial deleted.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Failed to delete testimonial.'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Testimonials</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Review client feedback</h1>
        </div>
      </div>
      {message && <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{message}</div>}
      <form onSubmit={save} className="rounded-[28px] border border-white/10 bg-[#141414] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-white/70">Client name<input required value={form.client_name} onChange={(event) => setForm({ ...form, client_name: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/70">Designation<input required value={form.client_designation} onChange={(event) => setForm({ ...form, client_designation: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/70 md:col-span-2">Client image URL<input value={form.client_image_url} onChange={(event) => setForm({ ...form, client_image_url: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/70 md:col-span-2">Testimonial<textarea required rows={4} value={form.testimonial} onChange={(event) => setForm({ ...form, testimonial: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="block text-sm text-white/70">Display order<input type="number" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: Number(event.target.value) })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" /></label>
          <label className="flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} /> Published</label>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={reset} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-full border border-[#f04796] bg-[#f04796] px-5 py-2.5 text-sm font-medium text-[#0d0d0f] disabled:opacity-70">{saving ? 'Saving...' : editingId ? 'Update testimonial' : 'Add testimonial'}</button>
        </div>
      </form>

      {loading ? <div className="text-white/60">Loading testimonials...</div> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <div key={item.id} className="rounded-[28px] border border-white/10 bg-[#141414] p-5">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f04796]/20 text-sm font-semibold text-[#f6b7d2]">{item.client_name.charAt(0)}</div>
                <div>
                  <div className="font-semibold text-white">{item.client_name}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-white/55">{item.client_designation}</div>
                </div>
              </div>
              <div className="text-sm text-white/70">“{item.testimonial}”</div>
              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-full border border-[#f04796]/40 bg-[#f04796]/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[#f6b7d2]">{item.is_published ? 'Published' : 'Draft'}</span>
                <button type="button" onClick={() => { setEditingId(item.id); setForm({ client_name: item.client_name, client_designation: item.client_designation, client_image_url: item.client_image_url || '', testimonial: item.testimonial, display_order: item.display_order, is_published: item.is_published ?? true }); }} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-white/70">Edit</button>
                <button type="button" onClick={() => void adminPublish('testimonials', item.id).then(load)} className="rounded-full border border-[#f04796]/40 bg-[#f04796]/10 px-3 py-1 text-[10px] text-[#f6b7d2]">Publish</button>
                <button type="button" onClick={() => void adminUnpublish('testimonials', item.id).then(load)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-white/70">Unpublish</button>
                <button type="button" onClick={() => void remove(item.id)} className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-[10px] text-red-200">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
