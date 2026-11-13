import { useState } from 'react';
import { ExternalLink, Laptop, RefreshCw, Smartphone, Tablet, X } from 'lucide-react';

interface LivePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

export function LivePreviewModal({ isOpen, onClose }: LivePreviewModalProps) {
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);

  if (!isOpen) return null;

  const previewUrl = `/?preview=true&v=${refreshKey}`;

  const deviceStyles: Record<DeviceMode, { width: string; label: string }> = {
    desktop: { width: '100%', label: 'Desktop (100%)' },
    tablet: { width: '768px', label: 'Tablet (768px)' },
    mobile: { width: '375px', label: 'Mobile (375px)' },
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#29251F]/80 backdrop-blur-md">
      {/* Top Controller Bar */}
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#E7DCCB]/20 bg-[#29251F] px-6 text-white">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <div>
            <h2 className="text-sm font-semibold tracking-wide text-white">Live Draft Preview</h2>
            <p className="text-xs text-[#E7DCCB]/70">Showing unpublished changes in real time</p>
          </div>
        </div>

        {/* Device Switcher */}
        <div className="flex items-center rounded-xl bg-black/30 p-1 border border-white/10">
          <button
            type="button"
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              device === 'desktop'
                ? 'bg-[#344238] text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Laptop size={14} />
            <span className="hidden sm:inline">Desktop</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('tablet')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              device === 'tablet'
                ? 'bg-[#344238] text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Tablet size={14} />
            <span className="hidden sm:inline">Tablet</span>
          </button>
          <button
            type="button"
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              device === 'mobile'
                ? 'bg-[#344238] text-white shadow-sm'
                : 'text-white/60 hover:text-white'
            }`}
          >
            <Smartphone size={14} />
            <span className="hidden sm:inline">Mobile</span>
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setRefreshKey((k) => k + 1)}
            title="Refresh preview"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <RefreshCw size={15} />
          </button>
          <a
            href={previewUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Open preview in new tab"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <ExternalLink size={15} />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/10 text-white transition hover:bg-white/20"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex flex-1 items-center justify-center overflow-auto p-4 sm:p-6 bg-[#1A1815]">
        <div
          className="relative h-full transition-all duration-300 ease-in-out flex flex-col shadow-2xl rounded-2xl overflow-hidden border border-white/10 bg-black"
          style={{ width: deviceStyles[device].width, maxWidth: '100%' }}
        >
          {/* Simulated Browser Bar */}
          <div className="flex items-center gap-2 border-b border-white/10 bg-[#24201B] px-4 py-2 text-xs text-white/50">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/70" />
            </div>
            <div className="mx-auto flex w-1/2 max-w-sm items-center justify-center rounded-md bg-black/40 px-3 py-1 font-mono text-[11px] text-white/60">
              https://fenu-portfolio.preview/?preview=true
            </div>
            <span className="text-[11px] font-medium text-emerald-400">DRAFT</span>
          </div>

          <iframe
            key={refreshKey}
            src={previewUrl}
            title="Live Draft Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            className="flex-1 w-full h-full border-0 bg-black"
          />
        </div>
      </div>
    </div>
  );
}
