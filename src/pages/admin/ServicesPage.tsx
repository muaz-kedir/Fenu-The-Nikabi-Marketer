import { useEffect, useState } from 'react';
import { adminCreate, adminDelete, adminList, adminPublish, adminUnpublish, adminUpdate } from '../../services/contentService';
import type { ServiceItem } from '../../types/database';

const emptyForm = {
  title: '',
  description: '',
  icon: 'Megaphone',
  image_url: '',
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
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      setItems(await adminList<ServiceItem>('services'));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to load services.');
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

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const payload = { ...form, display_order: Number(form.display_order) || 1 };
      if (editingId) {
        await adminUpdate('services', editingId, payload);
      } else {
        await adminCreate('services', payload);
      }
      await load();
      reset();
      setMessage('Service saved successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to save service.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await adminDelete('services', id);
      await load();
      setMessage('Service deleted.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to delete service.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Services</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Manage service offers</h1>
        </div>
      </div>

      {message && <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{message}</div>}

      <form onSubmit={save} className="rounded-[28px] border border-white/10 bg-[#141414] p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block text-sm text-white/70">
            Title
            <input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
          </label>
          <label className="block text-sm text-white/70">
            Icon
            <input value={form.icon} onChange={(event) => setForm({ ...form, icon: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
          </label>
          <label className="block text-sm text-white/70 md:col-span-2">
            Description
            <textarea required rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
          </label>
          <label className="block text-sm text-white/70">
            Image URL
            <input value={form.image_url} onChange={(event) => setForm({ ...form, image_url: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
          </label>
          <label className="block text-sm text-white/70">
            Display order
            <input type="number" value={form.display_order} onChange={(event) => setForm({ ...form, display_order: Number(event.target.value) })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
          </label>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={form.is_visible} onChange={(event) => setForm({ ...form, is_visible: event.target.checked })} />
            Visible
          </label>
          <label className="flex items-center gap-2 text-sm text-white/70">
            <input type="checkbox" checked={form.is_published} onChange={(event) => setForm({ ...form, is_published: event.target.checked })} />
            Published
          </label>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" onClick={reset} className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">Cancel</button>
          <button type="submit" disabled={saving} className="rounded-full border border-[#f04796] bg-[#f04796] px-5 py-2.5 text-sm font-medium text-[#0d0d0f] disabled:opacity-70">
            {saving ? 'Saving...' : editingId ? 'Update service' : 'Add service'}
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-white/60">Loading services...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {items.map((service) => (
            <div key={service.id} className="rounded-[28px] border border-white/10 bg-[#141414] p-5">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs uppercase tracking-[0.2em] text-[#f6b7d2]">#{service.display_order}</span>
                <span className="text-xs text-white/50">{service.is_published ? 'Published' : 'Draft'} {service.is_visible ? '' : '(Hidden)'}</span>
              </div>
              <h2 className="text-xl font-semibold text-white">{service.title}</h2>
              <p className="mt-3 text-sm leading-7 text-white/65">{service.description}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button type="button" onClick={() => { setEditingId(service.id); setForm({ title: service.title, description: service.description, icon: service.icon || 'Megaphone', image_url: service.image_url || '', display_order: service.display_order, is_visible: service.is_visible, is_published: service.is_published ?? true }); }} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">Edit</button>
                <button type="button" onClick={() => void adminPublish('services', service.id).then(load)} className="rounded-full border border-[#f04796]/40 bg-[#f04796]/10 px-3 py-1.5 text-xs text-[#f6b7d2]">Publish</button>
                <button type="button" onClick={() => void adminUnpublish('services', service.id).then(load)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">Unpublish</button>
                <button type="button" onClick={() => void remove(service.id)} className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
