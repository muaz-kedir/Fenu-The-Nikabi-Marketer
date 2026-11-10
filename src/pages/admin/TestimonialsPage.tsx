export function TestimonialsPage() {
  const items = [
    { name: 'Nadia Rahman', role: 'Founder, Noor Atelier', published: true },
    { name: 'Hana Ali', role: 'Marketing Lead, Atelier Luxe', published: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Testimonials</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Review client feedback</h1>
        </div>
        <button type="button" className="rounded-full border border-[#f04796] bg-[#f04796] px-4 py-2 text-sm font-medium text-[#0d0d0f]">Add testimonial</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((item) => (
          <div key={item.name} className="rounded-[28px] border border-white/10 bg-[#141414] p-5">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f04796]/20 text-sm font-semibold text-[#f6b7d2]">
                {item.name.charAt(0)}
              </div>
              <div>
                <div className="font-semibold text-white">{item.name}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/55">{item.role}</div>
              </div>
            </div>
            <div className="text-sm text-white/70">
              “Azmina brought clarity, creativity, and consistent execution to our brand...”
            </div>
            <div className="mt-4 flex gap-2">
              <span className="rounded-full border border-[#f04796]/40 bg-[#f04796]/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[#f6b7d2]">
                {item.published ? 'Published' : 'Hidden'}
              </span>
              <button type="button" className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] text-white/70">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
