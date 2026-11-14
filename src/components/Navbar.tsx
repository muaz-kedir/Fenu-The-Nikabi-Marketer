import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';
import { CmsImage } from './ui/CmsImage';
import type { NavigationItem, SiteSettings } from '../types/database';

const defaultNavLinks = [
  { label: 'Home', href: '#home', is_cta: false },
  { label: 'About', href: '#about', is_cta: false },
  { label: 'Services', href: '#services', is_cta: false },
  { label: 'Work', href: '#work', is_cta: false },
  { label: 'Contact', href: '#contact', is_cta: false },
];

interface NavbarProps {
  navigation?: NavigationItem[];
  site?: Partial<SiteSettings>;
}

export function Navbar({ navigation, site }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeNavItems = navigation && navigation.length > 0
    ? navigation.filter((item) => item.is_visible && item.is_published !== false)
    : null;

  const normalLinks = activeNavItems
    ? activeNavItems.filter((i) => !i.is_cta).map((i) => ({ label: i.label, href: i.url }))
    : defaultNavLinks;

  const ctaItem = activeNavItems?.find((i) => i.is_cta) || { label: 'Hire Me', url: '#contact' };

  const logoUrl = site?.logo_url || '/fenu-brand.png';
  const siteName = 'Fenu|The Naqabi Marketer';

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#home" className="flex min-w-0 items-center gap-2.5 sm:gap-3" aria-label={`${siteName} home`}>
          <CmsImage
            src={logoUrl}
            fallbackSrc="/fenu-brand.png"
            alt={siteName}
            className="h-10 w-10 shrink-0 rounded-full object-cover border border-[#f04796]/40 shadow-[0_0_15px_rgba(240,71,150,0.3)]"
          />
          <span className="whitespace-nowrap text-sm font-semibold tracking-wide text-white sm:text-base">
            {siteName}
          </span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {normalLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-white/75 transition hover:text-[#f6b7d2]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex">
          <a
            href={ctaItem.url}
            className="inline-flex items-center gap-2 rounded-full border border-[#f04796] bg-[#f04796] px-5 py-2.5 text-sm font-medium text-[#0d0d0f] shadow-[0_0_30px_rgba(240,71,150,0.45)] transition hover:-translate-y-0.5 hover:bg-[#ff6ab3]"
          >
            {ctaItem.label}
            <ArrowRight size={16} />
          </a>
        </div>

        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 md:hidden"
          aria-label="Toggle navigation menu"
          onClick={() => setIsOpen((value) => !value)}
        >
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-white/10 bg-[#0a0a0a] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {normalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/5 hover:text-[#f6b7d2]"
              >
                {link.label}
              </a>
            ))}
            <a
              href={ctaItem.url}
              onClick={() => setIsOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-[#f04796] bg-[#f04796] px-5 py-2.5 text-sm font-medium text-[#0d0d0f]"
            >
              {ctaItem.label}
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
