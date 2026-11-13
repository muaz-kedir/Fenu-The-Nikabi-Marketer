import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Copy,
  ExternalLink,
  Eye,
  Image as ImageIcon,
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

  const loadData = async () => {
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
    void loadData();
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setMessage(null);
    let uploadedCount = 0;
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 10 * 1024 * 1024) continue;

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
          folder: 'library',
        });
        uploadedCount += 1;
      }

      await loadData();
      setMessage({ type: 'success', text: `Uploaded ${uploadedCount} image(s) to library.` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const attemptDelete = async (item: MediaItem) => {
    try {
      const check = await checkMediaReferences(item.id);
      if (check.inUse) {
        setDeleteWarning({ item, references: check.references });
      } else {
        if (!confirm(`Delete image "${item.file_name}"?`)) return;
        await deleteMedia(item.id);
        await loadData();
        setMessage({ type: 'success', text: 'Image deleted.' });
      }
    } catch (err) {
      alert('Failed to check references.');
    }
  };

  const confirmForceDelete = async () => {
    if (!deleteWarning) return;
    try {
      await deleteMedia(deleteWarning.item.id);
      setDeleteWarning(null);
      await loadData();
      setMessage({ type: 'success', text: 'Image deleted.' });
    } catch (err) {
      alert('Delete failed.');
    }
  };

  const filtered = items.filter(
    (item) =>
      item.file_name.toLowerCase().includes(search.toLowerCase()) ||
      (item.alt_text && item.alt_text.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Media Asset Library</h1>
          <p className="mt-1 text-xs text-white/60">
            Manage brand images, portfolio attachments, and icons stored permanently in PostgreSQL and uploads volume.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#f04796] text-[#0d0d0f] font-bold shadow-[0_0_20px_rgba(240,71,150,0.35)] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#ff6ab3]"
        >
          <Upload size={14} /> Upload Media
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
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

      {/* Upload Drag & Drop Zone */}
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
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
          dragActive
            ? 'border-[#344238] bg-[#0a0a0a]'
            : 'border-white/10 bg-white hover:border-[#f04796]/40 hover:bg-[#16141c]'
        }`}
      >
        <Upload size={28} className="mx-auto mb-2 text-[#f6b7d2]" />
        <p className="text-xs font-semibold text-white">
          {uploading ? 'Uploading image assets...' : 'Drag & drop image files here, or click to browse'}
        </p>
        <p className="mt-1 text-[11px] text-white/60">PNG, JPG, WebP, SVG up to 10MB</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/60" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search media files by name or alt text..."
          className="w-full rounded-xl border border-white/10 bg-white pl-10 pr-4 py-2 text-xs text-white focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:outline-hidden"
        />
      </div>

      {/* Media Grid */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#131117] shadow-xs p-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-4">
          All Media Files ({filtered.length})
        </h2>

        {loading ? (
          <div className="p-12 text-center text-xs text-white/60">Loading media library...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-white/60">No images in the library.</div>
        ) : (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filtered.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] transition hover:border-[#f04796]/40 hover:shadow-xs"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
                  <img
                    src={item.file_url}
                    alt={item.alt_text || item.file_name}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-[#29251F]/60 opacity-0 transition group-hover:opacity-100 flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(item.file_url);
                        setMessage({ type: 'success', text: 'Image URL copied to clipboard!' });
                        setTimeout(() => setMessage(null), 2500);
                      }}
                      title="Copy URL"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-white hover:bg-white"
                    >
                      <Copy size={13} />
                    </button>
                    <a
                      href={item.file_url}
                      target="_blank"
                      rel="noreferrer"
                      title="Open full size"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/90 text-white hover:bg-white"
                    >
                      <ExternalLink size={13} />
                    </a>
                    <button
                      type="button"
                      onClick={() => void attemptDelete(item)}
                      title="Delete asset"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white hover:bg-rose-700"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-white">
                  <span className="truncate block text-[11px] font-medium text-white" title={item.file_name}>
                    {item.file_name}
                  </span>
                  <span className="text-[10px] text-white/60 block">
                    {(item.file_size / 1024).toFixed(0)} KB • {new Date(item.uploaded_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete in-use warning modal */}
      {deleteWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#29251F]/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-[#131117] p-6 shadow-xl">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <AlertTriangle size={24} />
              <h3 className="text-sm font-bold text-white">Image is currently in use!</h3>
            </div>
            <p className="text-xs text-white/60 mb-3">
              This image is referenced by the following website content:
            </p>
            <ul className="mb-4 list-disc pl-5 text-xs text-white space-y-1">
              {deleteWarning.references.map((ref, idx) => (
                <li key={idx}>{ref}</li>
              ))}
            </ul>
            <p className="text-xs text-rose-600 font-semibold mb-5">
              Deleting it now will result in broken images on the public site!
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteWarning(null)}
                className="rounded-xl border border-white/10 bg-[#0a0a0a] px-4 py-2 text-xs font-semibold text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void confirmForceDelete()}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700"
              >
                Delete Anyway
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
