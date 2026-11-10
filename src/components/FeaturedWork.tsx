import { ArrowUpRight } from 'lucide-react';
import type { ProjectItem } from '../types/database';

type FeaturedWorkProps = {
  projects?: ProjectItem[];
};

export function FeaturedWork({ projects }: FeaturedWorkProps) {
  const items = projects ?? [
    { id: '1', title: 'Brand Lift Campaign', description: 'A lifestyle beauty launch strategy that grew organic reach and strengthened community trust.', result_metric: '+186% engagement', cover_image_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80', case_study_url: '#contact', is_featured: true, is_published: true, slug: 'brand-lift-campaign', category: 'social', display_order: 1, created_at: '', updated_at: '', result_description: 'Organic growth' },
    { id: '2', title: 'E-commerce Growth', description: 'Creative ads and retention messaging for a boutique retail brand with a sharper conversion funnel.', result_metric: '3.4x ROAS', cover_image_url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80', case_study_url: '#contact', is_featured: true, is_published: true, slug: 'ecommerce-growth', category: 'performance', display_order: 2, created_at: '', updated_at: '', result_description: 'Ad performance' },
    { id: '3', title: 'Creator Brand Story', description: 'A cohesive content system that translated expertise into visibility, authority, and sales.', result_metric: '+72% leads', cover_image_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80', case_study_url: '#contact', is_featured: true, is_published: true, slug: 'creator-brand-story', category: 'storytelling', display_order: 3, created_at: '', updated_at: '', result_description: 'Qualified leads' },
  ];

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
        {items.map((project) => (
          <article
            key={project.title}
            className="group overflow-hidden rounded-[28px] border border-white/10 bg-[#141414] transition duration-300 hover:-translate-y-2 hover:border-[#f04796]/40 hover:shadow-[0_0_30px_rgba(240,71,150,0.12)]"
          >
            <div className="overflow-hidden">
              <img
                src={project.cover_image_url ?? 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80'}
                alt={project.title}
                className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
              />
            </div>

            <div className="p-6">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f6b7d2]">{project.result_metric}</div>
              <h3 className="text-2xl font-semibold text-white">{project.title}</h3>
              <p className="mt-4 text-sm leading-7 text-white/65">{project.description}</p>
              <a
                href={project.case_study_url ?? '#contact'}
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
