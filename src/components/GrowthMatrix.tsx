import MagicBento from './ui/MagicBento';

export function GrowthMatrix() {
  return (
    <section id="matrix" className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      {/* Background ambient glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[800px] rounded-full bg-[#f04796]/10 blur-[140px]"
        aria-hidden="true"
      />

      <div className="mb-12 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#f04796]/30 bg-[#f04796]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#f6b7d2]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#f04796] animate-ping" />
          Interactive Capabilities
        </div>
        <h2 className="mt-5 font-display text-4xl text-white sm:text-5xl lg:text-6xl">
          The Strategic <span className="text-[#f04796]">Growth Matrix</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/60 sm:text-lg">
          Live real-time marketing architecture. Click and hover to explore our live campaign telemetry, viral storytelling systems, and automated conversion pipelines.
        </p>
      </div>

      <MagicBento
        columns={4}
        rowHeight={200}
        gap={12}
        radius={20}
        enableBorderGlow={true}
        enableSpotlight={true}
        spotlightRadius={300}
        clickEffect={true}
        enableStars={true}
        glowColor="#f04796"
        theme="dark"
      />
    </section>
  );
}

export default GrowthMatrix;
