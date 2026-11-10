import type { SkillItem } from '../types/database';

type SkillsProps = {
  skills?: SkillItem[];
};

export function Skills({ skills }: SkillsProps) {
  const items = skills ?? [
    { id: '1', name: 'Copywriting', icon: '', display_order: 1, is_visible: true },
    { id: '2', name: 'Canva', icon: '', display_order: 2, is_visible: true },
    { id: '3', name: 'CapCut', icon: '', display_order: 3, is_visible: true },
    { id: '4', name: 'Meta Business Suite', icon: '', display_order: 4, is_visible: true },
    { id: '5', name: 'Analytics', icon: '', display_order: 5, is_visible: true },
    { id: '6', name: 'Community Management', icon: '', display_order: 6, is_visible: true },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#f6b7d2]">
          <span className="h-px w-10 bg-[#f04796]" />
          Skills & Tools
          <span className="h-px w-10 bg-[#f04796]" />
        </div>
        <h2 className="mt-5 font-display text-5xl text-white sm:text-6xl">The toolkit behind the strategy</h2>
      </div>

      <div className="flex flex-wrap justify-center gap-4">
        {items.map((skill) => (
          <span
            key={skill.id}
            className="rounded-full border border-[#f04796]/40 bg-[#f04796]/8 px-5 py-3 text-sm font-medium text-white/80 shadow-[0_0_22px_rgba(240,71,150,0.12)]"
          >
            {skill.name}
          </span>
        ))}
      </div>
    </section>
  );
}
