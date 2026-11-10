export function SkillsPage() {
  const skills = ['Copywriting', 'Canva', 'CapCut', 'Meta Business Suite', 'Analytics'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Skills & Tools</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Manage skills</h1>
        </div>
        <button type="button" className="rounded-full border border-[#f04796] bg-[#f04796] px-4 py-2 text-sm font-medium text-[#0d0d0f]">Add skill</button>
      </div>

      <div className="flex flex-wrap gap-3">
        {skills.map((skill) => (
          <div key={skill} className="rounded-full border border-[#f04796]/40 bg-[#f04796]/8 px-4 py-2.5 text-sm font-medium text-white/80">
            {skill}
          </div>
        ))}
      </div>
    </div>
  );
}
