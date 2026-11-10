export function ProjectsPage() {
  const projects = [
    { title: 'Brand Lift Campaign', published: true, featured: true },
    { title: 'E-commerce Growth', published: true, featured: true },
    { title: 'Creator Brand Story', published: true, featured: false },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Projects</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Manage portfolio projects</h1>
        </div>
        <button type="button" className="rounded-full border border-[#f04796] bg-[#f04796] px-4 py-2 text-sm font-medium text-[#0d0d0f]">New project</button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {projects.map((project) => (
          <div key={project.title} className="overflow-hidden rounded-[28px] border border-white/10 bg-[#141414]">
            <img
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80"
              alt={project.title}
              className="h-52 w-full object-cover"
            />
            <div className="p-5">
              <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#f6b7d2]">
                {project.published ? 'Published' : 'Draft'}
                {project.featured && <span className="rounded-full border border-[#f04796]/40 bg-[#f04796]/10 px-2 py-1 text-[10px]">Featured</span>}
              </div>
              <h2 className="text-xl font-semibold text-white">{project.title}</h2>
              <div className="mt-5 flex gap-2">
                <button type="button" className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">Edit</button>
                <button type="button" className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
