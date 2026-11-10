import { ArrowRight, Award, Sparkles } from 'lucide-react';
import { portfolio } from '../data/portfolio';

export function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative mx-auto w-full max-w-[420px]">
          <div className="absolute inset-6 rounded-[32px] border border-[#f04796]/40 bg-[#f04796]/10 blur-xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#111214] p-4 shadow-[0_0_40px_rgba(240,71,150,0.1)]">
            <img
              src={portfolio.aboutImage}
              alt="About Azmina Zahra"
              className="h-[520px] w-full rounded-[24px] object-cover"
            />
          </div>
        </div>

        <div>
          <div className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-[#f6b7d2]">
            <Sparkles size={14} />
            About Me
          </div>
          <h2 className="font-display text-5xl text-white sm:text-6xl">A brand storyteller with strategy in her DNA.</h2>
          <div className="mt-4 h-px w-28 bg-[#f04796]" />

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/70">
            {portfolio.bio}
          </p>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/70">
            I partner with founders and growing brands to build modern, people-first digital marketing systems that feel premium and perform in real life. From content planning to campaign optimisation, I turn your goals into visible momentum.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f04796]/10 text-[#f6b7d2]">
                <Award size={20} />
              </div>
              <div className="text-xl font-semibold text-white">Creative direction</div>
              <p className="mt-2 text-sm leading-6 text-white/65">Visual storytelling and positioning that elevate your brand across channels.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#f04796]/10 text-[#f6b7d2]">
                <ArrowRight size={20} />
              </div>
              <div className="text-xl font-semibold text-white">Growth strategy</div>
              <p className="mt-2 text-sm leading-6 text-white/65">Performance marketing that connects content with measurable business results.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
