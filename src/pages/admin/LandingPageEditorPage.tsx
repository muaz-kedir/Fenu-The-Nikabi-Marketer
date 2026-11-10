import { useState } from 'react';

export function LandingPageEditorPage() {
  const [hero, setHero] = useState({
    greeting: 'Hello, I\'m',
    full_name: 'Azmina Zahra',
    professional_title: 'Social Media Marketing Specialist',
    description: 'I help brands turn attention into action with strategic content, story-led campaigns, and performance-driven growth systems.',
    primary_button_text: 'View My Work',
    secondary_button_text: 'Let\'s Work Together',
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Landing Page</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Hero & page editing</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-[#141414] p-6">
          <h2 className="mb-5 text-xl font-semibold text-white">Hero content</h2>
          <div className="space-y-4">
            <label className="block text-sm text-white/70">
              Greeting
              <input value={hero.greeting} onChange={(event) => setHero({ ...hero, greeting: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
            </label>
            <label className="block text-sm text-white/70">
              Full name
              <input value={hero.full_name} onChange={(event) => setHero({ ...hero, full_name: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
            </label>
            <label className="block text-sm text-white/70">
              Professional title
              <input value={hero.professional_title} onChange={(event) => setHero({ ...hero, professional_title: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
            </label>
            <label className="block text-sm text-white/70">
              Description
              <textarea value={hero.description} onChange={(event) => setHero({ ...hero, description: event.target.value })} rows={4} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
            </label>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#141414] p-6">
          <h2 className="mb-5 text-xl font-semibold text-white">Media & buttons</h2>
          <div className="space-y-4">
            <label className="block text-sm text-white/70">
              Primary button text
              <input value={hero.primary_button_text} onChange={(event) => setHero({ ...hero, primary_button_text: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
            </label>
            <label className="block text-sm text-white/70">
              Secondary button text
              <input value={hero.secondary_button_text} onChange={(event) => setHero({ ...hero, secondary_button_text: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
            </label>
            <div className="rounded-2xl border border-dashed border-[#f04796]/40 bg-[#f04796]/5 p-4 text-sm text-white/70">
              Upload profile image and background image with media library selection.
            </div>
            <div className="rounded-2xl border border-dashed border-[#f04796]/40 bg-[#f04796]/5 p-4 text-sm text-white/70">
              Section visibility and ordering settings can be managed from the dashboard controls.
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">Cancel</button>
        <button type="button" className="rounded-full border border-[#f04796] bg-[#f04796] px-5 py-2.5 text-sm font-medium text-[#0d0d0f]">Save changes</button>
      </div>
    </div>
  );
}
