import { useState } from 'react';
import { ArrowRight, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Work', href: '#work' },
  { label: 'Contact', href: '#contact' },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="#home" className="flex min-w-0 items-center gap-2 sm:gap-3" aria-label="Fenu|The Nikabi Marketer home">
          <img src="/fenu-brand.png" alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
          <span className="whitespace-nowrap text-sm font-semibold tracking-wide text-white sm:text-base">Fenu|The Nikabi Marketer</span>
        </a>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} className="text-sm text-white/75 transition hover:text-[#f6b7d2]">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:flex">
          <a href="#contact" className="inline-flex items-center gap-2 rounded-full border border-[#f04796] bg-[#f04796] px-5 py-2.5 text-sm font-medium text-[#0d0d0f] shadow-[0_0_30px_rgba(240,71,150,0.45)] transition hover:-translate-y-0.5 hover:bg-[#ff6ab3]">
            Hire Me
            <ArrowRight size={16} />
          </a>
        </div>

        <button type="button" className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 md:hidden" aria-label="Toggle navigation menu" onClick={() => setIsOpen((value) => !value)}>
          {isOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {isOpen && (
        <div className="border-t border-white/10 bg-[#0a0a0a] px-4 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} onClick={() => setIsOpen(false)} className="rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/5 hover:text-[#f6b7d2]">
                {link.label}
              </a>
            ))}
            <a href="#contact" onClick={() => setIsOpen(false)} className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-[#f04796] bg-[#f04796] px-5 py-2.5 text-sm font-medium text-[#0d0d0f]">
              Hire Me
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
