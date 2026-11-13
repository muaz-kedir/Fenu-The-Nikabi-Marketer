import { useState } from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import type { ProjectItem } from '../types/database';

const categories = [
  'All',
  'Social Media Designs',
  'Branding',
  'Content Creation',
  'Marketing Campaigns',
];

type FeaturedWorkProps = {
  projects?: ProjectItem[];
};

export function FeaturedWork({ projects }: FeaturedWorkProps) {
  const items = projects ?? [];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filtered = items.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  return (
    <section id="work" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#f6b7d2]">
            <span className="h-px w-10 bg-[#f04796]" />
            Featured Work
          </div>
          <h2 className="mt-5 font-display text-4xl text-white sm:text-5xl lg:text-6xl">
            Case studies that moved the needle
          </h2>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-[#f04796] text-[#0d0d0f] shadow-[0_0_20px_rgba(240,71,150,0.35)]'
                  : 'border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[28px] border border-white/10 bg-[#141414] p-12 text-center text-white/60">
          No case studies in this category yet.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <article
              key={project.id || project.title}
              className="group flex flex-col justify-between overflow-hidden rounded-[28px] border border-white/10 bg-[#141414] transition duration-300 hover:-translate-y-2 hover:border-[#f04796]/40 hover:shadow-[0_0_30px_rgba(240,71,150,0.12)]"
            >
              <div>
                <div className="relative overflow-hidden aspect-video bg-[#0d0d0f]">
                  <img
                    src={
                      project.cover_image_url ||
                      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'
                    }
                    alt={project.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  {project.category && (
                    <span className="absolute top-3 left-3 rounded-full bg-black/60 backdrop-blur-md border border-white/15 px-3 py-1 text-[11px] font-medium text-white">
                      {project.category}
                    </span>
                  )}
                </div>

                <div className="p-6">
                  {project.result_metric && (
                    <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#f6b7d2]">
                      {project.result_metric}
                    </div>
                  )}

                  <h3 className="text-xl font-bold text-white group-hover:text-[#f6b7d2] transition">
                    {project.title}
                  </h3>

                  {project.client_name && (
                    <div className="mt-1 text-xs text-white/50">
                      Client: <span className="text-white/80 font-medium">{project.client_name}</span>
                      {project.industry ? ` • ${project.industry}` : ''}
                    </div>
                  )}

                  <p className="mt-3 text-sm leading-6 text-white/70 line-clamp-3">
                    {project.description}
                  </p>

                  {/* Verified deliverables tags */}
                  {Array.isArray(project.verified_results) && project.verified_results.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.verified_results.map((bullet, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[10px] text-white/80"
                        >
                          <CheckCircle2 size={10} className="text-emerald-400" />
                          {bullet}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 pt-0">
                <a
                  href={project.case_study_url || '#contact'}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#f6b7d2] transition hover:text-white"
                >
                  View Case Study
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
