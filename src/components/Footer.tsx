import { BriefcaseBusiness, Camera, MessageCircleMore, Music2, Phone } from 'lucide-react';
import type { FooterContent, SiteSettings } from '../types/database';

const socialDisplay = [
  { label: 'Instagram', key: 'instagram_url', Icon: Camera },
  { label: 'TikTok', key: 'tiktok_url', Icon: Music2 },
  { label: 'LinkedIn', key: 'linkedin_url', Icon: BriefcaseBusiness },
  { label: 'WhatsApp', key: 'whatsapp_url', Icon: MessageCircleMore },
];

type FooterProps = {
  site?: Partial<SiteSettings>;
  footer?: Partial<FooterContent>;
};

export function Footer({ site, footer }: FooterProps) {
  const name = site?.owner_name ?? 'Azmina Zahra';
  const email = footer?.email || site?.email || 'hello@azminazahra.com';
  const phone = footer?.phone || site?.phone;
  const copyright = footer?.copyright_text || site?.copyright_text || `© ${new Date().getFullYear()} ${name}. All rights reserved.`;
  const footerDesc = footer?.footer_description;
  const brandInitials = (name || 'AZ')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const getSocialLink = (key: string) => {
    return (
      (footer?.[key as keyof FooterContent] as string) ||
      (site?.[key as keyof SiteSettings] as string) ||
      '#'
    );
  };

  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 border-b border-white/10 pb-8 md:flex-row">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#f04796]/60 bg-[#f04796]/10 text-sm font-semibold text-[#f6b7d2]">
                {brandInitials}
              </span>
              <span className="text-lg font-semibold text-white">{name}</span>
            </div>
            {footerDesc && (
              <p className="mt-2 text-xs text-white/50 max-w-md">{footerDesc}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {socialDisplay.map(({ label, key, Icon }) => {
              const href = getSocialLink(key);
              if (!href || href === '#') return null;
              return (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#f6b7d2] transition hover:border-[#f04796]/50 hover:bg-[#f04796]/10"
                >
                  <Icon size={18} />
                </a>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 text-sm text-white/60 md:flex-row">
          <div className="flex items-center gap-4">
            <span>{email}</span>
            {phone && (
              <span className="inline-flex items-center gap-1 text-xs text-white/50">
                <Phone size={12} /> {phone}
              </span>
            )}
          </div>
          <span>{copyright}</span>
        </div>
      </div>
    </footer>
  );
}
