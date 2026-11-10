import { BarChart3, Megaphone, PenTool, Rocket, Target } from 'lucide-react';
import type { ServiceItem } from '../types/database';

const iconMap = {
  Megaphone,
  Target,
  PenTool,
  Rocket,
  BarChart3,
};

type ServicesProps = {
  services?: ServiceItem[];
};

export function Services({ services }: ServicesProps) {
  const items = services ?? [
    { id: '1', title: 'Social Media Management', description: 'Content calendars, daily engagement, and community growth strategies built around your brand voice.', icon: 'Megaphone', image_url: '', display_order: 1, is_visible: true, created_at: '', updated_at: '' },
    { id: '2', title: 'Content Strategy', description: 'Audience-focused plans that align your content with marketing goals, campaigns, and conversion funnels.', icon: 'Target', image_url: '', display_order: 2, is_visible: true, created_at: '', updated_at: '' },
    { id: '3', title: 'Content Creation', description: 'Scroll-stopping visuals, short-form videos, and branded storytelling designed for consistent engagement.', icon: 'PenTool', image_url: '', display_order: 3, is_visible: true, created_at: '', updated_at: '' },
    { id: '4', title: 'Paid Advertising', description: 'Performance-led campaigns across Meta and social channels to drive awareness, leads, and ROI.', icon: 'Rocket', image_url: '', display_order: 4, is_visible: true, created_at: '', updated_at: '' },
    { id: '5', title: 'Analytics & Reports', description: 'Clear reporting dashboards and insights that show what is working and what to optimise next.', icon: 'BarChart3', image_url: '', display_order: 5, is_visible: true, created_at: '', updated_at: '' },
  ];

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
        {items.map(({ title, description, icon }) => {
          const Icon = iconMap[icon as keyof typeof iconMap] ?? Megaphone;

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
