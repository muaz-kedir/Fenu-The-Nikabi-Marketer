import { useState } from 'react';

export function WebsiteSettingsPage() {
  const [settings, setSettings] = useState({
    site_name: 'Azmina Zahra',
    owner_name: 'Azmina Zahra',
    email: 'hello@azminazahra.com',
    phone: '+971 52 123 4567',
    location: 'Dubai, UAE',
    instagram_url: 'https://instagram.com',
    tiktok_url: 'https://tiktok.com',
    linkedin_url: 'https://linkedin.com',
    whatsapp_url: 'https://wa.me/971521234567',
    seo_title: 'Azmina Zahra | Social Media Marketing Specialist',
    seo_description: 'Premium social media marketing strategy and creative services for brands ready to grow.',
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Website Settings</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Update brand and site configuration</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {Object.entries(settings).map(([key, value]) => (
          <label key={key} className="block text-sm text-white/70">
            {key.replace(/_/g, ' ')}
            <input
              value={value}
              onChange={(event) => setSettings({ ...settings, [key]: event.target.value })}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white"
            />
          </label>
        ))}
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">Cancel</button>
        <button type="button" className="rounded-full border border-[#f04796] bg-[#f04796] px-5 py-2.5 text-sm font-medium text-[#0d0d0f]">Save settings</button>
      </div>
    </div>
  );
}
