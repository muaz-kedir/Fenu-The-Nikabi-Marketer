import { Quote } from 'lucide-react';
import type { TestimonialItem } from '../types/database';

type TestimonialsProps = {
  testimonials?: TestimonialItem[];
};

export function Testimonials({ testimonials }: TestimonialsProps) {
  const item = testimonials?.[0] ?? {
    id: '1',
    client_name: 'Nadia Rahman',
    client_designation: 'Founder, Noor Atelier',
    client_image_url: '',
    testimonial:
      'Azmina brought clarity, creativity, and consistent execution to our brand. The content felt elevated, strategic, and genuinely aligned with our audience. We saw stronger engagement and a much more polished online presence within weeks.',
    display_order: 1,
    is_published: true,
    created_at: new Date().toISOString(),
  };

  return (
    <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="rounded-[32px] border border-[#f04796]/40 bg-[linear-gradient(135deg,rgba(240,71,150,0.1),rgba(255,255,255,0.02))] p-6 shadow-[0_0_40px_rgba(240,71,150,0.08)] sm:p-10 lg:p-12">
        <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-[#f04796]/50 bg-[#f04796]/10 text-[#f6b7d2]">
          <Quote size={28} fill="currentColor" />
        </div>

        <p className="max-w-3xl text-lg leading-9 text-white/85 sm:text-2xl">“{item.testimonial}”</p>

        <div className="mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f04796]/20 text-lg font-semibold text-[#f6b7d2]">
            {item.client_name.charAt(0)}
          </div>
          <div>
            <div className="text-xl font-semibold text-white">{item.client_name}</div>
            <div className="text-sm uppercase tracking-[0.18em] text-white/55">{item.client_designation}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
