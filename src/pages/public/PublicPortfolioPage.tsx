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
    return <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] text-white">Loading portfolio...</div>;
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-6 text-center text-white">
        We could not load the portfolio right now. Please try again soon.
      </div>
    );
  }

  const sections = (data.sections || []).filter((section) => section.is_visible && section.is_published !== false).sort((a, b) => a.display_order - b.display_order);
  const sectionRenderers: Record<string, React.ReactNode> = {
    hero: <Hero hero={data.hero} site={data.siteSettings} />,
    stats: <Stats stats={data.stats.filter((stat) => stat.is_visible)} />,
    about: <About about={data.about} />,
    services: <Services services={data.services.filter((service) => service.is_visible)} />,
    work: <FeaturedWork projects={data.projects.filter((project) => project.is_published !== false && project.is_featured)} />,
    skills: <Skills skills={data.skills.filter((skill) => skill.is_visible)} />,
    process: <Process process={data.process.filter((step) => step.is_visible)} />,
    testimonials: <Testimonials testimonials={data.testimonials.filter((item) => item.is_published !== false)} />,
    contact: <Contact site={data.siteSettings} />,
  };

  const renderedSections = sections.length
    ? sections.map((section) => <div key={section.section_key}>{sectionRenderers[section.section_key] ?? null}</div>)
    : Object.entries(sectionRenderers).map(([key, section]) => <Fragment key={key}>{section}</Fragment>);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased">
      <Navbar site={data.siteSettings} />
      <main>{renderedSections}</main>
      <Footer site={data.siteSettings} />
    </div>
  );
}
