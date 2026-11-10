import { useEffect, useState } from 'react';
import { ArrowRight, BarChart3, FolderKanban, LayoutDashboard, MessageSquareText, Sparkles } from 'lucide-react';
import { getDashboardOverview } from '../../services/contentService';

export function DashboardOverviewPage() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalServices: 0,
    totalTestimonials: 0,
    totalMessages: 0,
    unreadMessages: 0,
    publishedProjects: 0,
    hiddenSections: 0,
  });

  useEffect(() => {
    void getDashboardOverview().then(setStats);
  }, []);

  const cards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: FolderKanban },
    { label: 'Total Services', value: stats.totalServices, icon: Sparkles },
    { label: 'Total Testimonials', value: stats.totalTestimonials, icon: MessageSquareText },
    { label: 'Unread Messages', value: stats.unreadMessages, icon: LayoutDashboard },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Overview</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Dashboard</h1>
        </div>
        <button type="button" className="inline-flex items-center gap-2 rounded-full border border-[#f04796] bg-[#f04796] px-4 py-2 text-sm font-medium text-[#0d0d0f]">
          Quick Actions
          <ArrowRight size={15} />
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-[28px] border border-white/10 bg-[#141414] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f04796]/10 text-[#f6b7d2]">
                <Icon size={20} />
              </div>
              <span className="text-3xl font-bold text-white">{value}</span>
            </div>
            <div className="text-sm uppercase tracking-[0.2em] text-white/55">{label}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-white/10 bg-[#141414] p-6">
          <div className="mb-5 flex items-center gap-3">
            <BarChart3 className="text-[#f6b7d2]" size={18} />
            <h2 className="text-xl font-semibold text-white">Website health</h2>
          </div>
          <div className="space-y-5">
            <div>
              <div className="flex justify-between text-sm text-white/70">
                <span>Published projects</span>
                <span>{stats.publishedProjects}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/5">
                <div className="h-full w-[70%] rounded-full bg-[#f04796]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-white/70">
                <span>Messages</span>
                <span>{stats.totalMessages}</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/5">
                <div className="h-full w-[40%] rounded-full bg-[#f6b7d2]" />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-[#141414] p-6">
          <h2 className="text-xl font-semibold text-white">Status snapshot</h2>
          <ul className="mt-5 space-y-3 text-sm text-white/70">
            <li>Hidden sections: {stats.hiddenSections}</li>
            <li>Published projects: {stats.publishedProjects}</li>
            <li>Unread contact messages: {stats.unreadMessages}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
