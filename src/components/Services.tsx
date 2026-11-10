import { BarChart3, Megaphone, PenTool, Rocket, Target } from 'lucide-react';
import { services } from '../data/portfolio';

const iconMap = {
  Megaphone,
  Target,
  PenTool,
  Rocket,
  BarChart3,
};

export function Services() {
  return (
    <section id="services" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#f6b7d2]">
          <span className="h-px w-10 bg-[#f04796]" />
          Services
          <span className="h-px w-10 bg-[#f04796]" />
        </div>
        <h2 className="mt-5 font-display text-5xl text-white sm:text-6xl">Bespoke social media services</h2>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {services.map(({ title, description, icon }) => {
          const Icon = iconMap[icon as keyof typeof iconMap];

          return (
            <article
              key={title}
              className="group rounded-[28px] border border-white/10 bg-[#141414] p-6 transition duration-300 hover:-translate-y-2 hover:border-[#f04796]/40 hover:shadow-[0_0_30px_rgba(240,71,150,0.15)]"
            >
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f04796]/10 text-[#f6b7d2]">
                <Icon size={26} />
              </div>
              <h3 className="text-xl font-semibold text-white">{title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/65">{description}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
