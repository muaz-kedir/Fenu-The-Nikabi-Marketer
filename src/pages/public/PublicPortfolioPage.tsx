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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased">
      <Navbar />
      <main>
        <Hero hero={data.hero} site={data.siteSettings} />
        <Stats stats={data.stats.filter((stat) => stat.is_visible)} />
        <About about={data.about} />
        <Services services={data.services.filter((service) => service.is_visible)} />
        <FeaturedWork projects={data.projects.filter((project) => project.is_published)} />
        <Skills skills={data.skills.filter((skill) => skill.is_visible)} />
        <Process process={data.process.filter((step) => step.is_visible)} />
        <Testimonials testimonials={data.testimonials.filter((item) => item.is_published)} />
        <Contact site={data.siteSettings} />
      </main>
      <Footer site={data.siteSettings} />
    </div>
  );
}
