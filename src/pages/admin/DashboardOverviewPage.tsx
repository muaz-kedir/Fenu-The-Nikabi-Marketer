import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Eye,
  FileImage,
  FolderKanban,
  History,
  Home,
  Layers,
  Mail,
  Menu,
  MessageSquareText,
  PhoneCall,
  Search,
  Send,
  Settings,
  Sparkles,
  UploadCloud,
  Users,
} from 'lucide-react';
import { getDashboardOverview, publishAllDrafts } from '../../services/contentService';
import type { PublishingHistoryItem } from '../../types/database';

export function DashboardOverviewPage() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalServices: 0,
    totalTestimonials: 0,
    totalMessages: 0,
    unreadMessages: 0,
    publishedProjects: 0,
    hiddenSections: 0,
    publishedSections: 0,
    totalSkills: 0,
    totalProcessSteps: 0,
    totalMedia: 0,
    draftChanges: 0,
    lastPublishedAt: null as string | null,
    recentActivities: [] as PublishingHistoryItem[],
  });

  const [loading, setLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishFeedback, setPublishFeedback] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const data = await getDashboardOverview();
      setStats({
        totalProjects: data.totalProjects || 0,
        totalServices: data.totalServices || 0,
        totalTestimonials: data.totalTestimonials || 0,
        totalMessages: data.totalMessages || 0,
        unreadMessages: data.unreadMessages || 0,
        publishedProjects: data.publishedProjects || 0,
        hiddenSections: data.hiddenSections || 0,
        publishedSections: data.publishedSections || 0,
        totalSkills: data.totalSkills || 0,
        totalProcessSteps: data.totalProcessSteps || 0,
        totalMedia: data.totalMedia || 0,
        draftChanges: data.draftChanges || 0,
        lastPublishedAt: data.lastPublishedAt || null,
        recentActivities: data.recentActivities || [],
      });
    } catch (err) {
      console.error('Failed to load dashboard overview:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleQuickPublish = async () => {
    setIsPublishing(true);
    setPublishFeedback(null);
    try {
      await publishAllDrafts();
      setPublishFeedback('Published all drafts to the live site!');
      await loadData();
      setTimeout(() => setPublishFeedback(null), 3000);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Publish failed.');
    } finally {
      setIsPublishing(false);
    }
  };

  const metricCards = [
    {
      label: 'Portfolio Projects',
      value: `${stats.publishedProjects} / ${stats.totalProjects}`,
      subtext: 'Published on website',
      icon: FolderKanban,
      link: '/admin/projects',
    },
    {
      label: 'Offered Services',
      value: stats.totalServices,
      subtext: 'Active service offerings',
      icon: Layers,
      link: '/admin/services',
    },
    {
      label: 'Client Testimonials',
      value: stats.totalTestimonials,
      subtext: 'Social proof reviews',
      icon: MessageSquareText,
      link: '/admin/testimonials',
    },
    {
      label: 'Contact Inquiries',
      value: stats.totalMessages,
      subtext: stats.unreadMessages > 0 ? `${stats.unreadMessages} unread message(s)` : 'All messages handled',
      icon: Mail,
      link: '/admin/messages',
      badge: stats.unreadMessages > 0 ? 'Action Needed' : undefined,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-6 text-white">
      {/* Welcome & Draft Status Hero Card */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#131117] p-6 shadow-2xl lg:p-8">
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,rgba(240,71,150,0.18),transparent_65%)] pointer-events-none" />

        <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                PostgreSQL Connected (AletCloud Production)
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Fenu CMS Content Dashboard
            </h1>
            <p className="text-xs text-white/60 sm:text-sm">
              Manage your landing page content, portfolio case studies, and business settings with live preview and draft publishing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/?preview=true"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:border-[#f04796]/50 hover:bg-white/10 hover:text-[#f6b7d2]"
            >
              <Eye size={15} className="text-[#f6b7d2]" />
              Preview Drafts
            </a>
            <button
              type="button"
              disabled={isPublishing || stats.draftChanges === 0}
              onClick={() => void handleQuickPublish()}
              className="inline-flex items-center gap-2 rounded-xl border border-[#f04796] bg-[#f04796] px-5 py-2.5 text-xs font-bold text-[#0d0d0f] shadow-[0_0_20px_rgba(240,71,150,0.35)] transition hover:bg-[#ff6ab3] hover:shadow-[0_0_25px_rgba(240,71,150,0.5)] disabled:opacity-40"
            >
              <Send size={14} />
              {isPublishing ? 'Publishing...' : stats.draftChanges > 0 ? `Publish ${stats.draftChanges} Change(s)` : 'All Changes Published'}
            </button>
          </div>
        </div>

        {publishFeedback && (
          <div className="relative mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-300">
            {publishFeedback}
          </div>
        )}

        {/* Status bar */}
        <div className="relative mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-5 text-xs text-white/60 sm:grid-cols-4">
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-white/40">Draft Status</span>
            <span className="font-semibold text-white">
              {stats.draftChanges > 0 ? `${stats.draftChanges} unpublished draft(s)` : 'Up to date with live'}
            </span>
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-white/40">Last Published</span>
            <span className="font-semibold text-white">
              {stats.lastPublishedAt ? new Date(stats.lastPublishedAt).toLocaleDateString() : 'Never'}
            </span>
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-white/40">Media Assets</span>
            <span className="font-semibold text-white">{stats.totalMedia} files</span>
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-white/40">Active Sections</span>
            <span className="font-semibold text-white">{stats.publishedSections} sections</span>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map(({ label, value, subtext, icon: Icon, link, badge }) => (
          <Link
            key={label}
            to={link}
            className="group flex flex-col justify-between rounded-2xl border border-white/10 bg-[#131117] p-5 shadow-xl transition hover:border-[#f04796]/40 hover:shadow-[0_0_20px_rgba(240,71,150,0.15)]"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#f04796]/30 bg-[#f04796]/10 text-[#f6b7d2] transition group-hover:bg-[#f04796] group-hover:text-[#0d0d0f]">
                  <Icon size={20} />
                </div>
                {badge && (
                  <span className="rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                    {badge}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold tracking-tight text-white">{value}</span>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/50 mt-0.5">{label}</h3>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-[11px] text-white/50">
              <span>{subtext}</span>
              <ArrowRight size={13} className="text-[#f6b7d2] transition group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Two Column Layout: Quick Actions & Publishing Timeline */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Access Grid (2 cols on desktop) */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wide uppercase text-white/50">Core Section Managers</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/admin/hero"
              className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-[#131117] p-4 shadow-xl transition hover:border-[#f04796]/40 hover:bg-[#16141c]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#f04796]/30 bg-[#f04796]/10 text-[#f6b7d2]">
                <Home size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Hero Section</h3>
                <p className="mt-0.5 text-[11px] text-white/60">Greeting, title, profile photo, and CTA buttons</p>
              </div>
            </Link>

            <Link
              to="/admin/about"
              className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-[#131117] p-4 shadow-xl transition hover:border-[#f04796]/40 hover:bg-[#16141c]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#f04796]/30 bg-[#f04796]/10 text-[#f6b7d2]">
                <Users size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">About Me & Bio</h3>
                <p className="mt-0.5 text-[11px] text-white/60">Intro heading, bio description, experience years</p>
              </div>
            </Link>

            <Link
              to="/admin/services"
              className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-[#131117] p-4 shadow-xl transition hover:border-[#f04796]/40 hover:bg-[#16141c]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#f04796]/30 bg-[#f04796]/10 text-[#f6b7d2]">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Services & Pricing</h3>
                <p className="mt-0.5 text-[11px] text-white/60">Categories, prices, descriptions, and icons</p>
              </div>
            </Link>

            <Link
              to="/admin/projects"
              className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-[#131117] p-4 shadow-xl transition hover:border-[#f04796]/40 hover:bg-[#16141c]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#f04796]/30 bg-[#f04796]/10 text-[#f6b7d2]">
                <FolderKanban size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Projects & Case Studies</h3>
                <p className="mt-0.5 text-[11px] text-white/60">Multi-images, verified metrics, objectives & strategy</p>
              </div>
            </Link>

            <Link
              to="/admin/navigation"
              className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-[#131117] p-4 shadow-xl transition hover:border-[#f04796]/40 hover:bg-[#16141c]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#f04796]/30 bg-[#f04796]/10 text-[#f6b7d2]">
                <Menu size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">Navigation Menu</h3>
                <p className="mt-0.5 text-[11px] text-white/60">Reorder header links, CTA button, URLs</p>
              </div>
            </Link>

            <Link
              to="/admin/seo"
              className="flex items-start gap-3.5 rounded-xl border border-white/10 bg-[#131117] p-4 shadow-xl transition hover:border-[#f04796]/40 hover:bg-[#16141c]"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#f04796]/30 bg-[#f04796]/10 text-[#f6b7d2]">
                <Search size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white">SEO & Social Meta</h3>
                <p className="mt-0.5 text-[11px] text-white/60">Google SERP preview, OG tags, keywords, canonical</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Publishing Activity History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wide uppercase text-white/50">Recent Activity</h2>
            <Link to="/admin/history" className="text-xs font-semibold text-[#f6b7d2] hover:underline">
              View All
            </Link>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#131117] p-4 shadow-xl">
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              <div className="divide-y divide-white/10">
                {stats.recentActivities.map((act) => (
                  <div key={act.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-white capitalize">
                        {act.action === 'publish' ? '🚀 Published' : '📝 Draft Saved'}
                      </span>
                      <span className="text-[10px] text-white/40">
                        {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-white/60">
                      {((act.details as any)?.summary) || act.summary || `Updated ${act.section || act.section_name || 'content'} section`}
                    </p>
                    <div className="mt-1 text-[10px] text-white/40">by {act.admin_email || act.user_email || 'admin'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-white/40">
                <History size={24} className="mx-auto mb-2 text-white/30" />
                No publishing activities recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
