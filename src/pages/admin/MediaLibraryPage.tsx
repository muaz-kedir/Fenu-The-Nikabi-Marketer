import { useEffect, useRef, useState } from 'react';
import { deleteMedia, getMedia, updateMediaAlt, uploadMedia } from '../../services/contentService';
import type { MediaItem } from '../../types/database';

export function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try { setItems(await getMedia()); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Failed to load media.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setMessage('');
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          setMessage('Only image files are allowed.');
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          setMessage('Files must be smaller than 10 MB.');
          continue;
        }
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('Failed to read file.'));
          reader.readAsDataURL(file);
        });
        await uploadMedia({ fileName: file.name, contentType: file.type, dataUrl, folder: 'media' });
      }
      await load();
      setMessage('Upload complete.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this image?')) return;
    try { await deleteMedia(id); await load(); setMessage('Image deleted.'); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Failed to delete image.'); }
  };

  const copy = async (url: string) => {
    await navigator.clipboard.writeText(window.location.origin + url);
    setMessage('Image URL copied.');
  };

  const filtered = items.filter((item) => item.file_name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Media Library</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Upload and manage images</h1>
        </div>
        <button type="button" onClick={() => fileInputRef.current?.click()} className="rounded-full border border-[#f04796] bg-[#f04796] px-4 py-2 text-sm font-medium text-[#0d0d0f]">Upload media</button>
      </div>
      {message && <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{message}</div>}
      <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => void handleFiles(event.target.files)} />

      <div
        onDragOver={(event) => { event.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(event) => { event.preventDefault(); setDragActive(false); void handleFiles(event.dataTransfer.files); }}
        className={`rounded-[28px] border-2 border-dashed p-8 text-center text-sm ${dragActive ? 'border-[#f04796] bg-[#f04796]/10' : 'border-white/10 bg-[#141414]'}`}
      >
        {uploading ? 'Uploading...' : 'Drag and drop images here, or use the upload button.'}
      </div>

      <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search media..." className="w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />

      {loading ? <div className="text-white/60">Loading media...</div> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-[28px] border border-white/10 bg-[#141414]">
              <img src={item.file_url} alt={item.alt_text || item.file_name} className="h-56 w-full object-cover" />
              <div className="p-4 text-sm text-white/70">
                <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[#f6b7d2]">{item.file_name}</div>
                <div className="mb-2 text-xs text-white/50">{item.file_type} · {Math.round(item.file_size / 1024)} KB</div>
                <input
                  value={item.alt_text || ''}
                  onChange={(event) => setItems((prev) => prev.map((media) => (media.id === item.id ? { ...media, alt_text: event.target.value } : media)))}
                  onBlur={(event) => void updateMediaAlt(item.id, event.target.value)}
                  placeholder="Alt text"
                  className="mb-3 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2 text-white"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => void copy(item.file_url)} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">Copy URL</button>
                  <button type="button" onClick={() => void remove(item.id)} className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200">Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
