import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BarChart3,
  CheckCircle2,
  Eye,
  FileImage,
  FolderKanban,
  HelpCircle,
  LayoutDashboard,
  MessageSquareText,
  Sparkles,
} from 'lucide-react';
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
    totalSkills: 0,
    totalProcessSteps: 0,
    totalMedia: 0,
  });

  const load = () => {
    void getDashboardOverview().then((res: any) => {
      setStats({
        totalProjects: res.totalProjects ?? 0,
        totalServices: res.totalServices ?? 0,
        totalTestimonials: res.totalTestimonials ?? 0,
        totalMessages: res.totalMessages ?? 0,
        unreadMessages: res.unreadMessages ?? 0,
        publishedProjects: res.publishedProjects ?? 0,
        hiddenSections: res.hiddenSections ?? 0,
        totalSkills: res.totalSkills ?? 0,
        totalProcessSteps: res.totalProcessSteps ?? 0,
        totalMedia: res.totalMedia ?? 0,
      });
    });
  };

  useEffect(() => {
    load();
  }, []);

  const cards = [
    { label: 'Total Projects', value: stats.totalProjects, icon: FolderKanban, link: '/admin/projects' },
    { label: 'Total Services', value: stats.totalServices, icon: Sparkles, link: '/admin/services' },
    { label: 'Client Testimonials', value: stats.totalTestimonials, icon: MessageSquareText, link: '/admin/testimonials' },
    { label: 'Unread Messages', value: stats.unreadMessages, icon: LayoutDashboard, link: '/admin/messages', badge: stats.unreadMessages > 0 ? 'Action Needed' : undefined },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Overview</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">CMS Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10"
          >
            <Eye size={14} /> View Public Website
          </a>
          <Link
            to="/admin/landing-page"
            className="inline-flex items-center gap-2 rounded-full border border-[#f04796] bg-[#f04796] px-5 py-2 text-xs font-semibold text-[#0d0d0f] shadow-[0_0_20px_rgba(240,71,150,0.3)] transition hover:bg-[#ff6ab3]"
          >
            Edit Landing Page
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, link, badge }) => (
          <Link
            key={label}
            to={link}
            className="group block rounded-[28px] border border-white/10 bg-[#141416] p-5 transition hover:border-[#f04796]/50 hover:shadow-[0_0_25px_rgba(240,71,150,0.1)]"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f04796]/10 text-[#f6b7d2] transition group-hover:scale-105">
                <Icon size={22} />
              </div>
              <span className="text-3xl font-bold text-white">{value}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-[0.18em] text-white/50">{label}</span>
              {badge && (
                <span className="rounded-full bg-[#f04796] px-2 py-0.5 text-[10px] font-bold text-[#0d0d0f]">
                  {badge}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Content Inventory */}
        <div className="rounded-[28px] border border-white/10 bg-[#141416] p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="text-[#f6b7d2]" size={18} />
              <h2 className="text-base font-semibold text-white">Database Source of Truth Status</h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Connected
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl border border-white/5 bg-[#0d0d0f] p-4">
              <span className="text-xs text-white/40 block">Published Projects</span>
              <span className="text-xl font-bold text-white mt-1 block">
                {stats.publishedProjects} / {stats.totalProjects}
              </span>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#0d0d0f] p-4">
              <span className="text-xs text-white/40 block">Total Inquiries</span>
              <span className="text-xl font-bold text-white mt-1 block">{stats.totalMessages}</span>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#0d0d0f] p-4">
              <span className="text-xs text-white/40 block">Media Library Assets</span>
              <span className="text-xl font-bold text-white mt-1 block">{stats.totalMedia}</span>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#0d0d0f] p-4">
              <span className="text-xs text-white/40 block">Hidden Sections</span>
              <span className="text-xl font-bold text-white mt-1 block">{stats.hiddenSections}</span>
            </div>
          </div>
        </div>

        {/* Quick Navigation Panel */}
        <div className="rounded-[28px] border border-white/10 bg-[#141416] p-6 space-y-4">
          <h2 className="text-base font-semibold text-white border-b border-white/10 pb-3">
            Quick Section Navigation
          </h2>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <Link
              to="/admin/landing-page"
              className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Sparkles size={14} className="text-[#f6b7d2]" /> Landing Page Editor
            </Link>
            <Link
              to="/admin/about"
              className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <BarChart3 size={14} className="text-[#f6b7d2]" /> About Me Editor
            </Link>
            <Link
              to="/admin/services"
              className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <FolderKanban size={14} className="text-[#f6b7d2]" /> Services Manager
            </Link>
            <Link
              to="/admin/projects"
              className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <Award size={14} className="text-[#f6b7d2]" /> Projects Manager
            </Link>
            <Link
              to="/admin/media"
              className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <FileImage size={14} className="text-[#f6b7d2]" /> Media Library
            </Link>
            <Link
              to="/admin/messages"
              className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3 text-white/80 hover:bg-white/10 hover:text-white"
            >
              <MessageSquareText size={14} className="text-[#f6b7d2]" /> Contact Inbox
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
