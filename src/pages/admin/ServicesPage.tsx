export function ServicesPage() {
  const services = [
    { title: 'Social Media Management', description: 'Content calendars and community growth.', visible: true },
    { title: 'Content Strategy', description: 'Audience-focused campaign planning.', visible: true },
    { title: 'Content Creation', description: 'Short-form editorial concepts and creative design.', visible: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Services</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Manage service offers</h1>
        </div>
        <button type="button" className="rounded-full border border-[#f04796] bg-[#f04796] px-4 py-2 text-sm font-medium text-[#0d0d0f]">Add service</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {services.map((service, index) => (
          <div key={service.title} className="rounded-[28px] border border-white/10 bg-[#141414] p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.2em] text-[#f6b7d2]">#{index + 1}</span>
              <label className="flex items-center gap-2 text-xs text-white/60">
                <input type="checkbox" checked={service.visible} readOnly />
                Visible
              </label>
            </div>
            <h2 className="text-xl font-semibold text-white">{service.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/65">{service.description}</p>
            <div className="mt-5 flex gap-2">
              <button type="button" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">Edit</button>
              <button type="button" className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
