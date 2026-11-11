import { Fragment } from 'react';
import { Navbar } from '../../components/Navbar';
import { Hero } from '../../components/Hero';
import { Stats } from '../../components/Stats';
import { About } from '../../components/About';
import { Services } from '../../components/Services';
import { FeaturedWork } from '../../components/FeaturedWork';
import { Skills } from '../../components/Skills';
import { Process } from '../../components/Process';
import { Testimonials } from '../../components/Testimonials';
import { Contact } from '../../components/Contact';
import { Footer } from '../../components/Footer';
import { usePortfolioContent } from '../../hooks/usePortfolioContent';

export function PublicPortfolioPage() {
  const { data, loading, error } = usePortfolioContent();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">
        <span className="animate-pulse text-[#f6b7d2]">Loading portfolio...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 text-center text-white">
        We could not load the portfolio right now. Please try again soon.
      </div>
    );
  }

  const sectionRenderers: Record<string, React.ReactNode> = {
    hero: <Hero hero={data.hero} site={data.siteSettings} />,
    stats: <Stats stats={(data.stats || []).filter((s) => s.is_visible && s.is_published !== false)} />,
    about: <About about={data.about} />,
    services: <Services services={(data.services || []).filter((s) => s.is_visible && s.is_published !== false)} />,
    work: (
      <FeaturedWork
        projects={(data.projects || []).filter(
          (p) => p.is_published !== false && p.is_visible !== false && p.is_featured,
        )}
      />
    ),
    skills: <Skills skills={(data.skills || []).filter((s) => s.is_visible && s.is_published !== false)} />,
    process: <Process process={(data.process || []).filter((s) => s.is_visible && s.is_published !== false)} />,
    testimonials: (
      <Testimonials
        testimonials={(data.testimonials || []).filter(
          (t) => t.is_published !== false && t.is_visible !== false,
        )}
      />
    ),
    contact: <Contact site={data.siteSettings} cta={data.cta} />,
  };

  const hasSectionsConfig = Boolean(data.sections && data.sections.length > 0);
  const visibleSections = hasSectionsConfig
    ? data.sections
        .filter((section) => section.is_visible && section.is_published !== false)
        .sort((a, b) => a.display_order - b.display_order)
    : null;

  const renderedSections = visibleSections
    ? visibleSections.map((section) => (
        <div key={section.section_key}>{sectionRenderers[section.section_key] ?? null}</div>
      ))
    : Object.entries(sectionRenderers).map(([key, section]) => (
        <Fragment key={key}>{section}</Fragment>
      ));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased">
      <Navbar site={data.siteSettings} />
      <main>{renderedSections}</main>
      <Footer site={data.siteSettings} footer={data.footer} />
    </div>
  );
}
