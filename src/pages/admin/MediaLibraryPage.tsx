export function MediaLibraryPage() {
  const images = [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Media Library</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Upload and manage images</h1>
        </div>
        <button type="button" className="rounded-full border border-[#f04796] bg-[#f04796] px-4 py-2 text-sm font-medium text-[#0d0d0f]">Upload media</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {images.map((src, index) => (
          <div key={src} className="overflow-hidden rounded-[28px] border border-white/10 bg-[#141414]">
            <img src={src} alt={`Media ${index + 1}`} className="h-56 w-full object-cover" />
            <div className="p-4 text-sm text-white/70">
              <div className="mb-2 text-xs uppercase tracking-[0.2em] text-[#f6b7d2]">profile/hero</div>
              <div className="flex gap-2">
                <button type="button" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">Select</button>
                <button type="button" className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
