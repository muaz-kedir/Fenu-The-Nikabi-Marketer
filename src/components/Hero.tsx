import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Star } from 'lucide-react';
import type { HeroContent, SiteSettings } from '../types/database';

type HeroProps = {
  hero?: Partial<HeroContent>;
  site?: Partial<SiteSettings>;
};

export function Hero({ hero, site }: HeroProps) {
  const greeting = hero?.greeting ?? "Hello, I'm";
  const name = hero?.full_name ?? site?.owner_name ?? 'Azmina Zahra';
  const title = hero?.professional_title ?? site?.professional_title ?? 'Social Media Marketing Specialist';
  const description = hero?.description ?? 'I help brands turn attention into action with strategic content, story-led campaigns, and performance-driven growth systems.';
  const image = hero?.profile_image_url ?? site?.profile_image_url ?? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=80';
  return (
    <section id="home" className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(circle_at_50%_20%,rgba(240,71,150,0.38),transparent_45%)]" />
      <div className="absolute left-1/2 top-16 h-64 w-64 -translate-x-1/2 rounded-full bg-[#f04796]/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-24 lg:pt-20">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col justify-center"
        >
          <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-[#f04796]/40 bg-[#f04796]/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[#f6b7d2]">
            <Sparkles size={14} />
            {greeting}
          </div>

          <h1 className="font-display text-5xl leading-none text-white sm:text-6xl lg:text-[5rem]">
            {name}
          </h1>

          <p className="mt-4 max-w-xl text-lg font-medium text-[#f6b7d2] sm:text-xl">
            {title}
          </p>

          <p className="mt-5 max-w-xl text-base leading-7 text-white/70 sm:text-lg">
            {description}
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row">
            <a
              href={hero?.primary_button_url ?? '#work'}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[#f04796] bg-[#f04796] px-6 py-3.5 text-sm font-semibold text-[#0d0d0f] shadow-[0_0_30px_rgba(240,71,150,0.45)] transition hover:-translate-y-0.5 hover:bg-[#ff6ab3]"
            >
              {hero?.primary_button_text ?? 'View My Work'}
              <ArrowRight size={18} />
            </a>
            <a
              href={hero?.secondary_button_url ?? '#contact'}
              className="inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:border-[#f6b7d2] hover:text-[#f6b7d2]"
            >
              {hero?.secondary_button_text ?? "Let's Work Together"}
            </a>
          </div>

        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative flex items-center justify-center"
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-[480px] w-[480px] rounded-full border border-[#f04796]/60 bg-[radial-gradient(circle,rgba(240,71,150,0.22),transparent_62%)] blur-sm" />
          </div>

          <div className="absolute right-8 top-8 flex h-12 w-12 items-center justify-center rounded-full border border-[#f04796]/60 bg-[#1b1219] text-[#f6b7d2] shadow-[0_0_24px_rgba(240,71,150,0.4)]">
            <Star size={18} fill="currentColor" />
          </div>
          <div className="absolute left-8 bottom-10 flex h-10 w-10 items-center justify-center rounded-full border border-[#f04796]/60 bg-[#1b1219] text-[#f6b7d2] shadow-[0_0_24px_rgba(240,71,150,0.4)]">
            <Sparkles size={16} />
          </div>

          <div className="relative flex h-[430px] w-[430px] items-center justify-center rounded-full border border-[#f04796]/60 bg-[linear-gradient(135deg,rgba(240,71,150,0.15),rgba(255,255,255,0.02),rgba(240,71,150,0.05))] p-6 shadow-[0_0_60px_rgba(240,71,150,0.15)]">
            <div className="absolute inset-3 rounded-full border border-[#f6b7d2]/35" />
            <img src={image} alt={name} className="h-full w-full rounded-full object-cover object-center" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
