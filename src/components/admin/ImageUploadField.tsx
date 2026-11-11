import { useRef, useState } from 'react';
import { FileImage, Image as ImageIcon, Trash2, Upload } from 'lucide-react';
import { uploadMedia } from '../../services/contentService';
import { MediaPickerModal } from './MediaPickerModal';

type ImageUploadFieldProps = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  altText?: string;
  onAltTextChange?: (alt: string) => void;
  folder?: string;
  aspect?: 'square' | 'video' | 'circle' | 'auto';
  helperText?: string;
};

export function ImageUploadField({
  label,
  value,
  onChange,
  altText,
  onAltTextChange,
  folder = 'general',
  aspect = 'auto',
  helperText,
}: ImageUploadFieldProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    setError('');

    if (!file.type.startsWith('image/')) {
      setError('Only image files (JPG, PNG, WebP, SVG, GIF) are allowed.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be 10MB or smaller.');
      return;
    }

    setUploading(true);
    try {
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
        altText: altText || undefined,
      });

      onChange(uploaded.file_url);
      if (onAltTextChange && uploaded.alt_text) {
        onAltTextChange(uploaded.alt_text);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const getAspectClass = () => {
    switch (aspect) {
      case 'circle':
        return 'h-32 w-32 rounded-full object-cover';
      case 'square':
        return 'h-40 w-40 rounded-2xl object-cover';
      case 'video':
        return 'h-44 w-full rounded-2xl object-cover';
      default:
        return 'max-h-52 w-auto max-w-full rounded-2xl object-cover';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-white/80">{label}</label>
        {helperText && <span className="text-xs text-white/40">{helperText}</span>}
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs text-red-200">
          {error}
        </div>
      )}

      {/* If an image is currently set */}
      {value ? (
        <div className="space-y-3 rounded-2xl border border-white/10 bg-[#0f0f12] p-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div
              className={`relative overflow-hidden border border-[#f04796]/30 bg-black/40 flex items-center justify-center ${
                aspect === 'circle' ? 'rounded-full' : 'rounded-2xl'
              }`}
            >
              <img src={value} alt={altText || label} className={getAspectClass()} />
            </div>

            <div className="flex-1 space-y-2 text-center sm:text-left">
              <p className="truncate text-xs font-mono text-white/50 max-w-md">{value}</p>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
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
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white disabled:opacity-50"
                >
                  <Upload size={13} />
                  {uploading ? 'Uploading...' : 'Replace Image'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 hover:text-white"
                >
                  <FileImage size={13} />
                  Pick from Media
                </button>
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs text-red-300 hover:bg-red-500/20"
                >
                  <Trash2 size={13} />
                  Remove
                </button>
              </div>
            </div>
          </div>

          {onAltTextChange && (
            <div className="border-t border-white/5 pt-3">
              <label className="text-xs text-white/60 block mb-1">Image Alt Text (for SEO & Accessibility)</label>
              <input
                type="text"
                value={altText || ''}
                onChange={(e) => onAltTextChange(e.target.value)}
                placeholder="Describe this image for screen readers and SEO..."
                className="w-full rounded-xl border border-white/10 bg-[#0a0a0c] px-3 py-1.5 text-xs text-white placeholder-white/30 focus:border-[#f04796] focus:outline-none"
              />
            </div>
          )}
        </div>
      ) : (
        /* Empty state: Drop zone + Select from Library */
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
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
            dragActive
              ? 'border-[#f04796] bg-[#f04796]/10'
              : 'border-white/15 bg-[#0f0f12] hover:border-white/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void handleFiles(e.target.files)}
          />

          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#f04796]/10 text-[#f6b7d2]">
            <ImageIcon size={22} />
          </div>

          <p className="text-sm font-medium text-white/80">
            {uploading ? 'Uploading image...' : 'Drop image here, or upload from computer'}
          </p>
          <p className="text-xs text-white/40 mt-1 mb-4">
            Supports JPG, PNG, WebP, SVG, GIF up to 10MB
          </p>

          <div className="flex flex-wrap gap-2 justify-center">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#f04796] bg-[#f04796] px-4 py-2 text-xs font-semibold text-[#0d0d0f] transition hover:bg-[#ff6ab3] disabled:opacity-50"
            >
              <Upload size={14} />
              {uploading ? 'Uploading...' : 'Browse Computer'}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <FileImage size={14} />
              Media Library
            </button>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        folder={folder}
        onSelect={(url, alt) => {
          onChange(url);
          if (onAltTextChange && alt) {
            onAltTextChange(alt);
          }
        }}
      />
    </div>
  );
}
