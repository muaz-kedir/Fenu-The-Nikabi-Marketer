import { ArrowRight } from 'lucide-react';
import { BentoCard } from './ui/BentoCard';
import type { ProcessStep } from '../types/database';

type ProcessProps = {
  process?: ProcessStep[];
};

export function Process({ process }: ProcessProps) {
  const steps = process ?? [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#f6b7d2]">
          <span className="h-px w-10 bg-[#f04796]" />
          Work Process
          <span className="h-px w-10 bg-[#f04796]" />
        </div>
        <h2 className="mt-5 font-display text-5xl text-white sm:text-6xl">The 4-step strategic engine</h2>
      </div>

      <div className="relative">
        <div className="absolute left-0 right-0 top-1/2 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-[#f04796]/70 to-transparent lg:block" />
        <div className="grid gap-6 lg:grid-cols-4">
          {steps.map(({ step_number, title, description, id }) => (
            <BentoCard
              key={id}
              radius={30}
              glowColor="#f04796"
              className="group p-6 bg-[#141414]"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="text-3xl font-semibold text-[#f6b7d2] transition duration-300 group-hover:scale-110">{step_number}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f04796]/50 bg-[#f04796]/10 text-[#f6b7d2] transition duration-300 group-hover:bg-[#f04796]/25 group-hover:translate-x-1">
                  <ArrowRight size={16} />
                </span>
              </div>
              <h3 className="text-2xl font-semibold text-white transition duration-300 group-hover:text-[#f6b7d2]">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/65">{description}</p>
            </BentoCard>
          ))}
        </div>
      </div>
    </section>
  );
}
