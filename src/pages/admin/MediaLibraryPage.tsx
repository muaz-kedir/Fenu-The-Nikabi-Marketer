import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Copy,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Loader2,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import {
  checkMediaReferences,
  deleteMedia,
  getMedia,
  updateMediaAlt,
  uploadMedia,
} from '../../services/contentService';
import type { MediaItem } from '../../types/database';

export function MediaLibraryPage() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewItem, setPreviewItem] = useState<MediaItem | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<{
    item: MediaItem;
    references: string[];
  } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getMedia();
      setItems(data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to load media items.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setMessage(null);
    let uploadedCount = 0;
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) {
          setMessage({ type: 'error', text: `${file.name} is not an image file.` });
          continue;
        }
        if (file.size > 10 * 1024 * 1024) {
          setMessage({ type: 'error', text: `${file.name} is larger than the 10MB limit.` });
          continue;
        }
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('Failed to read file.'));
          reader.readAsDataURL(file);
        });
        await uploadMedia({
          fileName: file.name,
          contentType: file.type,
          dataUrl,
          folder: 'general',
        });
        uploadedCount += 1;
      }
      await load();
      if (uploadedCount > 0) {
        setMessage({ type: 'success', text: `Uploaded ${uploadedCount} image(s) successfully.` });
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Upload failed.',
      });
    } finally {
      setUploading(false);
    }
  };

  const initiateDelete = async (item: MediaItem) => {
    try {
      setDeletingId(item.id);
      const refCheck = await checkMediaReferences(item.id);
      if (refCheck.inUse) {
        setDeleteWarning({ item, references: refCheck.references });
      } else {
        if (window.confirm(`Are you sure you want to delete "${item.file_name}"?`)) {
          await confirmDelete(item.id);
        }
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to check media usage.',
      });
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = async (id: string) => {
    try {
      await deleteMedia(id);
      setDeleteWarning(null);
      await load();
      setMessage({ type: 'success', text: 'Media item deleted.' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete media item.',
      });
    }
  };

  const copyUrl = async (url: string) => {
    const fullUrl = url.startsWith('http') ? url : window.location.origin + url;
    await navigator.clipboard.writeText(fullUrl);
    setMessage({ type: 'success', text: 'Image URL copied to clipboard.' });
    setTimeout(() => setMessage(null), 3000);
  };

  const filtered = items.filter(
    (item) =>
      item.file_name.toLowerCase().includes(search.toLowerCase()) ||
      (item.alt_text && item.alt_text.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Media Library</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Assets & Image Management</h1>
        </div>
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full border border-[#f04796] bg-[#f04796] px-5 py-2.5 text-sm font-semibold text-[#0d0d0f] shadow-[0_0_20px_rgba(240,71,150,0.3)] transition hover:bg-[#ff6ab3] disabled:opacity-50"
          >
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? 'Uploading...' : 'Upload Images'}
          </button>
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-red-500/30 bg-red-500/10 text-red-200'
          }`}
        >
          <span>{message.text}</span>
          <button
            type="button"
            onClick={() => setMessage(null)}
            className="text-white/60 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Drag & Drop Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          void handleFiles(e.dataTransfer.files);
        }}
        className={`flex flex-col items-center justify-center rounded-[28px] border-2 border-dashed p-8 text-center transition ${
          dragActive
            ? 'border-[#f04796] bg-[#f04796]/10 text-white'
            : 'border-white/10 bg-[#141416] text-white/60 hover:border-white/20'
        }`}
      >
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f04796]/10 text-[#f6b7d2]">
          <Upload size={22} />
        </div>
        <p className="text-sm font-medium text-white/80">
          {uploading ? 'Uploading files, please wait...' : 'Drag and drop image files directly here'}
        </p>
        <p className="mt-1 text-xs text-white/40">
          Files will be organized and saved in Supabase storage and media library. Max file size: 10MB.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search media by filename or description..."
          className="w-full rounded-2xl border border-white/10 bg-[#141416] pl-11 pr-4 py-3 text-sm text-white placeholder-white/40 focus:border-[#f04796] focus:outline-none"
        />
      </div>

      {/* Media Gallery */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-white/60">
          <Loader2 size={24} className="animate-spin mr-2 text-[#f04796]" />
          Loading media library...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[28px] border border-white/10 bg-[#141416] p-12 text-center text-white/50">
          <ImageIcon size={44} className="mb-3 text-white/30" />
          <h3 className="text-base font-medium text-white">No images found</h3>
          <p className="mt-1 text-sm text-white/40">
            {search ? 'Try adjusting your search query' : 'Upload your first image to populate the media library'}
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group flex flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#141416] transition hover:border-[#f04796]/50"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                <img
                  src={item.file_url}
                  alt={item.alt_text || item.file_name}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/60 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setPreviewItem(item)}
                    title="Preview Image"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-[#f04796] hover:text-[#0d0d0f]"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => void copyUrl(item.file_url)}
                    title="Copy URL"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-[#f04796] hover:text-[#0d0d0f]"
                  >
                    <Copy size={16} />
                  </button>
                  <a
                    href={item.file_url}
                    target="_blank"
                    rel="noreferrer"
                    title="Open Full Image"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition hover:bg-[#f04796] hover:text-[#0d0d0f]"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>

              {/* Meta & Actions */}
              <div className="flex flex-1 flex-col justify-between p-4">
                <div>
                  <h4 className="truncate text-xs font-semibold text-white/90" title={item.file_name}>
                    {item.file_name}
                  </h4>
                  <div className="mt-1 flex items-center justify-between text-[11px] text-white/40">
                    <span>{item.file_type || 'image'}</span>
                    <span>{Math.round(item.file_size / 1024)} KB</span>
                  </div>

                  <div className="mt-3">
                    <input
                      type="text"
                      value={item.alt_text || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setItems((prev) =>
                          prev.map((m) => (m.id === item.id ? { ...m, alt_text: val } : m)),
                        );
                      }}
                      onBlur={(e) => void updateMediaAlt(item.id, e.target.value)}
                      placeholder="Alt text / description..."
                      className="w-full rounded-xl border border-white/10 bg-[#0d0d0f] px-3 py-1.5 text-xs text-white placeholder-white/30 focus:border-[#f04796] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
                  <button
                    type="button"
                    onClick={() => void copyUrl(item.file_url)}
                    className="inline-flex items-center gap-1 text-xs text-white/60 transition hover:text-[#f6b7d2]"
                  >
                    <Copy size={13} /> Copy URL
                  </button>
                  <button
                    type="button"
                    disabled={deletingId === item.id}
                    onClick={() => void initiateDelete(item)}
                    className="inline-flex items-center gap-1 text-xs text-red-400/80 transition hover:text-red-300 disabled:opacity-50"
                  >
                    {deletingId === item.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <Trash2 size={13} />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-[#141416]">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <span className="truncate text-sm font-semibold text-white">
                {previewItem.file_name}
              </span>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center max-h-[70vh] overflow-hidden">
              <img
                src={previewItem.file_url}
                alt={previewItem.alt_text || previewItem.file_name}
                className="max-h-[65vh] w-auto rounded-xl object-contain"
              />
            </div>
            <div className="flex items-center justify-between border-t border-white/10 px-6 py-3 text-xs text-white/50">
              <span>Size: {Math.round(previewItem.file_size / 1024)} KB</span>
              <button
                type="button"
                onClick={() => void copyUrl(previewItem.file_url)}
                className="rounded-full bg-[#f04796] px-4 py-1.5 font-semibold text-[#0d0d0f] hover:bg-[#ff6ab3]"
              >
                Copy URL
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Reference Warning Dialog */}
      {deleteWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-amber-500/40 bg-[#161412] p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400/10">
                <AlertTriangle size={20} />
              </div>
              <h3 className="text-lg font-semibold text-white">Image is in active use!</h3>
            </div>
            <p className="mt-3 text-sm text-white/70">
              <span className="font-semibold text-white">&quot;{deleteWarning.item.file_name}&quot;</span> is
              currently referenced in your published website content:
            </p>
            <ul className="mt-3 max-h-36 overflow-y-auto rounded-xl border border-amber-500/20 bg-black/30 p-3 text-xs text-amber-200/90 space-y-1">
              {deleteWarning.references.map((ref) => (
                <li key={ref}>• {ref}</li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-red-300">
              Deleting this file may cause broken images on the public website. Are you sure you want to proceed?
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteWarning(null)}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmDelete(deleteWarning.item.id)}
                className="rounded-full border border-red-500 bg-red-500/80 px-4 py-2 text-xs font-semibold text-white hover:bg-red-500"
              >
                Yes, Delete Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
