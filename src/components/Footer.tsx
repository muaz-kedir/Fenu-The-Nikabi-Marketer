import { BriefcaseBusiness, Camera, MessageCircleMore, Music2, Phone } from 'lucide-react';
import { CmsImage } from './ui/CmsImage';
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
  const brandName = 'Fenu|The Naqabi Marketer';
  const logoUrl = site?.logo_url || '/fenu-brand.png';
  const email = footer?.email || site?.email || 'hello@azminazahra.com';
  const phone = footer?.phone || site?.phone;
  const copyright = footer?.copyright_text || site?.copyright_text || `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`;
  const footerDesc = footer?.footer_description;

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
              <CmsImage
                src={logoUrl}
                fallbackSrc="/fenu-brand.png"
                alt={brandName}
                className="h-10 w-10 shrink-0 rounded-full object-cover border border-[#f04796]/40 shadow-[0_0_15px_rgba(240,71,150,0.3)]"
              />
              <span className="text-lg font-semibold tracking-wide text-white">{brandName}</span>
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
