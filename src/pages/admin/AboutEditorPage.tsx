import { useState } from 'react';

export function AboutEditorPage() {
  const [about, setAbout] = useState({
    title: 'A brand storyteller with strategy in her DNA.',
    subtitle: 'About Me',
    description: 'I design thoughtful marketing experiences that connect with people, elevate brands, and turn engagement into measurable results.',
    additional_description:
      'I partner with founders and growing brands to build modern, people-first digital marketing systems that feel premium and perform in real life.',
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">About Me</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Edit profile story</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[28px] border border-white/10 bg-[#141414] p-6">
          <div className="space-y-4">
            <label className="block text-sm text-white/70">
              Title
              <input value={about.title} onChange={(event) => setAbout({ ...about, title: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
            </label>
            <label className="block text-sm text-white/70">
              Subtitle
              <input value={about.subtitle} onChange={(event) => setAbout({ ...about, subtitle: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
            </label>
            <label className="block text-sm text-white/70">
              Bio
              <textarea rows={5} value={about.description} onChange={(event) => setAbout({ ...about, description: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
            </label>
            <label className="block text-sm text-white/70">
              Additional description
              <textarea rows={5} value={about.additional_description} onChange={(event) => setAbout({ ...about, additional_description: event.target.value })} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0f1011] px-3 py-2.5 text-white" />
            </label>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#141414] p-6">
          <h2 className="text-xl font-semibold text-white">Preview</h2>
          <div className="mt-5 overflow-hidden rounded-[22px] border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80"
              alt="About preview"
              className="h-72 w-full object-cover"
            />
          </div>
          <div className="mt-4 text-sm text-white/70">
            Upload and manage media assets from the Media Library, or replace the current image directly.
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
