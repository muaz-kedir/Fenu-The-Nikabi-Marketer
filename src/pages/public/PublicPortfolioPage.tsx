import { Fragment, useEffect } from 'react';
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
import { Sparkles } from 'lucide-react';

export function PublicPortfolioPage() {
  const { data, loading, error, isPreview } = usePortfolioContent();

  useEffect(() => {
    if (!data?.siteSettings) return;
    const settings = data.siteSettings;

    // Document title
    const pageTitle = settings.seo_title || settings.site_name || 'Azmina Zahra – The Nikabi Marketer';
    document.title = pageTitle;

    // Helper to update meta tag
    const setMeta = (name: string, content?: string, isProperty = false) => {
      if (!content) return;
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.content = content;
    };

    setMeta('description', settings.seo_description);
    setMeta('keywords', settings.keywords || undefined);
    setMeta('og:title', settings.og_title || pageTitle, true);
    setMeta('og:description', settings.og_description || settings.seo_description, true);
    if (settings.og_image_url) {
      setMeta('og:image', settings.og_image_url, true);
    }

    // Canonical link
    if (settings.canonical_url) {
      let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'canonical';
        document.head.appendChild(link);
      }
      link.href = settings.canonical_url;
    }
  }, [data?.siteSettings]);

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
    stats: <Stats stats={(data.stats || []).filter((s) => s.is_visible && (isPreview || s.is_published !== false))} />,
    about: <About about={data.about} />,
    services: <Services services={(data.services || []).filter((s) => s.is_visible && (isPreview || s.is_published !== false))} />,
    work: (
      <FeaturedWork
        projects={(data.projects || []).filter(
          (p) => p.is_visible !== false && (isPreview || p.is_published !== false)
        )}
      />
    ),
    skills: <Skills skills={(data.skills || []).filter((s) => s.is_visible && (isPreview || s.is_published !== false))} />,
    process: <Process process={(data.process || []).filter((s) => s.is_visible && (isPreview || s.is_published !== false))} />,
    testimonials: (
      <Testimonials
        testimonials={(data.testimonials || []).filter(
          (t) => t.is_visible !== false && (isPreview || t.is_published !== false)
        )}
      />
    ),
    contact: <Contact site={data.siteSettings} cta={data.cta} />,
  };

  const hasSectionsConfig = Boolean(data.sections && data.sections.length > 0);
  const visibleSections = hasSectionsConfig
    ? data.sections
        .filter((section) => section.is_visible && (isPreview || section.is_published !== false))
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
    <div className="min-h-screen bg-[#0a0a0a] text-white antialiased selection:bg-[#f04796] selection:text-white">
      {/* Dynamic Announcement Bar */}
      {data.siteSettings?.announcement_active && data.siteSettings?.announcement_text && (
        <aside
          aria-label="Announcement"
          className="bg-linear-to-r from-[#344238] via-[#29251F] to-[#344238] border-b border-[#E7DCCB]/20 py-2.5 px-4 text-center text-xs font-semibold text-[#F8F4ED]"
        >
          <div className="mx-auto max-w-7xl flex items-center justify-center gap-2">
            <Sparkles size={14} className="text-[#E7DCCB]" />
            <span>{data.siteSettings.announcement_text}</span>
          </div>
        </aside>
      )}

      {/* Floating Draft Preview Badge */}
      {isPreview && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full border border-emerald-500/50 bg-[#29251F]/90 px-4 py-2 text-xs font-medium text-white shadow-2xl backdrop-blur-md">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Draft Preview Mode (Unpublished Content)</span>
        </div>
      )}

      <Navbar navigation={data.navigation} site={data.siteSettings} />
      <main>{renderedSections}</main>
      <Footer site={data.siteSettings} footer={data.footer} />
    </div>
  );
}
