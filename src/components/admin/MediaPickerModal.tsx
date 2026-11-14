import { useEffect, useRef, useState } from 'react';
import { Check, Image as ImageIcon, Search, Upload, X } from 'lucide-react';
import { getMedia, uploadMedia } from '../../services/contentService';
import { CmsImage } from '../ui/CmsImage';
import type { MediaItem } from '../../types/database';

type MediaPickerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string, altText?: string) => void;
  folder?: string;
  title?: string;
};

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  folder = 'general',
  title = 'Select an Image from Media Library',
}: MediaPickerModalProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const media = await getMedia();
      setItems(media);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load media.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      void load();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const file = files[0];
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files (JPG, PNG, WebP, SVG, GIF) are allowed.');
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be 10MB or less.');
      }

      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(new Error('Failed to read file.'));
        reader.readAsDataURL(file);
      });

      const uploaded = await uploadMedia({
        fileName: file.name,
        contentType: file.type,
        dataUrl,
        folder,
      });

      await load();
      onSelect(uploaded.file_url, uploaded.alt_text || '');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const filtered = items.filter((item) =>
    item.file_name.toLowerCase().includes(search.toLowerCase()) ||
    (item.alt_text && item.alt_text.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
      <div className="relative flex flex-col w-full max-w-4xl max-h-[85vh] rounded-3xl border border-white/10 bg-[#141416] text-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f04796]/10 text-[#f6b7d2]">
              <ImageIcon size={20} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">{title}</h2>
              <p className="text-xs text-white/50">Pick an existing asset or upload a new one directly</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Upload Bar */}
        <div className="p-6 pb-2 space-y-4">
          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-200">
              {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search media by filename or alt text..."
                className="w-full rounded-2xl border border-white/10 bg-[#0d0d0f] pl-10 pr-4 py-2.5 text-sm text-white placeholder-white/40 focus:border-[#f04796] focus:outline-none"
              />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => void handleFiles(e.target.files)}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#f04796] bg-[#f04796] px-5 py-2.5 text-sm font-medium text-[#0d0d0f] transition hover:bg-[#ff6ab3] disabled:opacity-50"
            >
              <Upload size={16} />
              {uploading ? 'Uploading...' : 'Upload New Image'}
            </button>
          </div>

          {/* Drag & drop banner */}
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
            className={`rounded-2xl border border-dashed py-3 px-4 text-center text-xs transition ${
              dragActive ? 'border-[#f04796] bg-[#f04796]/10 text-white' : 'border-white/10 bg-white/5 text-white/50'
            }`}
          >
            Drag and drop an image here to upload & select immediately
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-6 pt-2">
          {loading ? (
            <div className="flex h-48 items-center justify-center text-sm text-white/50">
              Loading media library...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-center text-white/50">
              <ImageIcon size={36} className="mb-2 text-white/30" />
              <p className="text-sm">No images found.</p>
              <p className="text-xs text-white/40 mt-1">Upload an image to start using it in your content.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelect(item.file_url, item.alt_text || '');
                    onClose();
                  }}
                  className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f12] transition hover:border-[#f04796] hover:shadow-[0_0_20px_rgba(240,71,150,0.25)]"
                >
                  <div className="aspect-square w-full overflow-hidden bg-black/40">
                    <CmsImage
                      src={item.file_url}
                      alt={item.alt_text || item.file_name}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-xs font-medium text-white/90" title={item.file_name}>
                      {item.file_name}
                    </p>
                    <p className="text-[10px] text-white/40 mt-0.5">
                      {Math.round(item.file_size / 1024)} KB
                    </p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition group-hover:opacity-100">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f04796] px-3 py-1.5 text-xs font-semibold text-[#0d0d0f] shadow-lg">
                      <Check size={14} /> Select
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 px-6 py-4 bg-[#0e0e11]">
          <span className="text-xs text-white/50">{filtered.length} image{filtered.length === 1 ? '' : 's'} available</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 px-5 py-2 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
