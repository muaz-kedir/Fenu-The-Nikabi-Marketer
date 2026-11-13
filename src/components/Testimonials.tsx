import { Quote } from 'lucide-react';
import { BentoCard } from './ui/BentoCard';
import type { TestimonialItem } from '../types/database';

type TestimonialsProps = {
  testimonials?: TestimonialItem[];
};

export function Testimonials({ testimonials }: TestimonialsProps) {
  const items = testimonials ?? [];
  if (items.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#f6b7d2]">
          <span className="h-px w-10 bg-[#f04796]" />
          Client Feedback
          <span className="h-px w-10 bg-[#f04796]" />
        </div>
        <h2 className="mt-5 font-display text-5xl text-white sm:text-6xl">Words from partners & clients</h2>
      </div>

      {items.length === 1 ? (
        <BentoCard
          radius={32}
          glowColor="#f04796"
          className="mx-auto max-w-4xl bg-[linear-gradient(135deg,rgba(240,71,150,0.1),rgba(20,20,20,0.95))] p-6 sm:p-10 lg:p-12"
        >
          <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full border border-[#f04796]/50 bg-[#f04796]/10 text-[#f6b7d2]">
            <Quote size={28} fill="currentColor" />
          </div>

          <p className="max-w-3xl text-lg leading-9 text-white/85 sm:text-2xl">“{items[0].testimonial}”</p>

          <div className="mt-8 flex items-center gap-4 border-t border-white/10 pt-6">
            {items[0].client_image_url ? (
              <img
                src={items[0].client_image_url}
                alt={items[0].client_name}
                className="h-14 w-14 rounded-full object-cover border border-[#f04796]/40"
              />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f04796]/20 text-lg font-semibold text-[#f6b7d2]">
                {items[0].client_name.charAt(0)}
              </div>
            )}
            <div>
              <div className="text-xl font-semibold text-white">{items[0].client_name}</div>
              <div className="text-sm uppercase tracking-[0.18em] text-white/55">{items[0].client_designation}</div>
            </div>
          </div>
        </BentoCard>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <BentoCard
              key={item.id}
              radius={28}
              glowColor="#f04796"
              className="group flex flex-col justify-between bg-[#141416] p-6"
            >
              <div>
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f04796]/10 text-[#f6b7d2] transition duration-300 group-hover:scale-110 group-hover:bg-[#f04796]/20">
                  <Quote size={18} fill="currentColor" />
                </div>
                <p className="text-sm leading-7 text-white/80 italic">“{item.testimonial}”</p>
              </div>

              <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                {item.client_image_url ? (
                  <img
                    src={item.client_image_url}
                    alt={item.client_name}
                    className="h-11 w-11 rounded-full object-cover border border-[#f04796]/30"
                  />
                ) : (
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f04796]/20 text-sm font-semibold text-[#f6b7d2]">
                    {item.client_name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="text-base font-semibold text-white transition duration-300 group-hover:text-[#f6b7d2]">{item.client_name}</div>
                  <div className="text-xs uppercase tracking-[0.16em] text-white/50">{item.client_designation}</div>
                </div>
              </div>
            </BentoCard>
          ))}
        </div>
      )}
    </section>
  );
}
