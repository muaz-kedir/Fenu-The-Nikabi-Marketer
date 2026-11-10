import { ArrowUpRight } from 'lucide-react';
import { projects } from '../data/portfolio';

export function FeaturedWork() {
  return (
    <section id="work" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#f6b7d2]">
            <span className="h-px w-10 bg-[#f04796]" />
            Featured Work
          </div>
          <h2 className="mt-5 font-display text-5xl text-white sm:text-6xl">Case studies that moved the needle</h2>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {projects.map((project) => (
          <article
            key={project.title}
            className="group overflow-hidden rounded-[28px] border border-white/10 bg-[#141414] transition duration-300 hover:-translate-y-2 hover:border-[#f04796]/40 hover:shadow-[0_0_30px_rgba(240,71,150,0.12)]"
          >
            <div className="overflow-hidden">
              <img
                src={project.image}
                alt={project.title}
                className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>

            <div className="p-6">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f6b7d2]">{project.result}</div>
              <h3 className="text-2xl font-semibold text-white">{project.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/65">{project.description}</p>
              <a
                href="#contact"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#f6b7d2] transition hover:text-white"
              >
                View Case Study
                <ArrowUpRight size={16} />
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
