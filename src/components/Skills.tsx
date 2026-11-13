import { BentoCard } from './ui/BentoCard';
import type { SkillItem } from '../types/database';

type SkillsProps = {
  skills?: SkillItem[];
};

export function Skills({ skills }: SkillsProps) {
  const items = skills ?? [];

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
          <BentoCard
            key={skill.id}
            radius={9999}
            spotlightRadius={160}
            glowColor="#f04796"
            className="group px-6 py-3 bg-[#141416] cursor-default"
          >
            <span className="text-sm font-medium text-white/80 transition duration-300 group-hover:text-[#f6b7d2]">
              {skill.name}
            </span>
          </BentoCard>
        ))}
      </div>
    </section>
  );
}
