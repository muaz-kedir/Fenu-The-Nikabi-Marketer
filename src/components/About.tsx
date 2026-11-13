import { ArrowRight, Award, Sparkles } from 'lucide-react';
import { BentoCard } from './ui/BentoCard';
import type { AboutContent } from '../types/database';

type AboutProps = {
  about?: Partial<AboutContent>;
};

export function About({ about }: AboutProps) {
  const title = about?.title ?? 'A brand storyteller with strategy in her DNA.';
  const subtitle = about?.subtitle ?? 'About Me';
  const description = about?.description ?? 'I design thoughtful marketing experiences that connect with people, elevate brands, and turn engagement into measurable results.';
  const additionalDescription = about?.additional_description ?? 'I partner with founders and growing brands to build modern, people-first digital marketing systems that feel premium and perform in real life. From content planning to campaign optimisation, I turn your goals into visible momentum.';
  const image = about?.profile_image_url ?? 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80';
  const altText = about?.profile_image_alt || subtitle;

  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative mx-auto w-full max-w-[420px]">
          <div className="absolute inset-6 rounded-[32px] border border-[#f04796]/40 bg-[#f04796]/10 blur-xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#111214] p-4 shadow-[0_0_40px_rgba(240,71,150,0.1)]">
            <img src={image} alt={altText} className="h-[520px] w-full rounded-[24px] object-cover" />
          </div>
        </div>

        <div>
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#f6b7d2]">
            <Sparkles size={14} />
            {about?.intro_heading || subtitle}
          </div>
          <h2 className="font-display text-5xl text-white sm:text-6xl">{title}</h2>
          <div className="mt-4 h-px w-28 bg-[#f04796]" />

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/70">{description}</p>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">{additionalDescription}</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <BentoCard radius={16} glowColor="#f04796" className="group p-5 bg-[#141414]">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f04796]/10 text-[#f6b7d2] transition duration-300 group-hover:scale-110 group-hover:bg-[#f04796]/20">
                <Award size={20} />
              </div>
              <div className="text-xl font-semibold text-white transition duration-300 group-hover:text-[#f6b7d2]">Creative direction</div>
              <p className="mt-2 text-sm leading-6 text-white/65">Visual storytelling and positioning that elevate your brand across channels.</p>
            </BentoCard>
            <BentoCard radius={16} glowColor="#f04796" className="group p-5 bg-[#141414]">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f04796]/10 text-[#f6b7d2] transition duration-300 group-hover:scale-110 group-hover:bg-[#f04796]/20">
                <ArrowRight size={20} />
              </div>
              <div className="text-xl font-semibold text-white transition duration-300 group-hover:text-[#f6b7d2]">Growth strategy</div>
              <p className="mt-2 text-sm leading-6 text-white/65">Performance marketing that connects content with measurable business results.</p>
            </BentoCard>
          </div>
        </div>
      </div>
    </section>
  );
}
