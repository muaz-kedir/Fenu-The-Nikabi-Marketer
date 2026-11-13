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
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Welcome & Draft Status Hero Card */}
      <div className="rounded-2xl border border-[#E7DCCB] bg-white p-6 shadow-xs lg:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                PostgreSQL Connected (AletCloud)
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#29251F] sm:text-3xl">
              Fenu CMS Content Dashboard
            </h1>
            <p className="text-xs text-[#8B806D] sm:text-sm">
              Manage your landing page content, portfolio case studies, and business settings with live preview and draft publishing.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/?preview=true"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-[#E7DCCB] bg-[#F8F4ED] px-4 py-2.5 text-xs font-semibold text-[#29251F] shadow-xs transition hover:bg-[#E7DCCB]/60"
            >
              <Eye size={15} className="text-[#344238]" />
              Preview Drafts
            </a>
            <button
              type="button"
              disabled={isPublishing || stats.draftChanges === 0}
              onClick={() => void handleQuickPublish()}
              className="inline-flex items-center gap-2 rounded-xl bg-[#344238] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#29251F] disabled:opacity-40"
            >
              <Send size={14} />
              {isPublishing ? 'Publishing...' : stats.draftChanges > 0 ? `Publish ${stats.draftChanges} Change(s)` : 'Published'}
            </button>
          </div>
        </div>

        {publishFeedback && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
            {publishFeedback}
          </div>
        )}

        {/* Status bar */}
        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-[#E7DCCB]/70 pt-5 text-xs text-[#8B806D] sm:grid-cols-4">
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-[#8B806D]">Draft Status</span>
            <span className="font-semibold text-[#29251F]">
              {stats.draftChanges > 0 ? `${stats.draftChanges} unpublished draft(s)` : 'Up to date with live'}
            </span>
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-[#8B806D]">Last Published</span>
            <span className="font-semibold text-[#29251F]">
              {stats.lastPublishedAt ? new Date(stats.lastPublishedAt).toLocaleDateString() : 'Never'}
            </span>
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-[#8B806D]">Media Assets</span>
            <span className="font-semibold text-[#29251F]">{stats.totalMedia} files</span>
          </div>
          <div>
            <span className="block text-[11px] uppercase tracking-wider text-[#8B806D]">Active Sections</span>
            <span className="font-semibold text-[#29251F]">{stats.publishedSections} sections</span>
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metricCards.map(({ label, value, subtext, icon: Icon, link, badge }) => (
          <Link
            key={label}
            to={link}
            className="group flex flex-col justify-between rounded-2xl border border-[#E7DCCB] bg-white p-5 shadow-xs transition hover:border-[#344238] hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F8F4ED] text-[#344238] transition group-hover:bg-[#344238] group-hover:text-white">
                  <Icon size={20} />
                </div>
                {badge && (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">
                    {badge}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold tracking-tight text-[#29251F]">{value}</span>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8B806D] mt-0.5">{label}</h3>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-[#E7DCCB]/50 pt-3 text-[11px] text-[#8B806D]">
              <span>{subtext}</span>
              <ArrowRight size={13} className="text-[#344238] transition group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>

      {/* Two Column Layout: Quick Actions & Publishing Timeline */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Access Grid (2 cols on desktop) */}
        <div className="space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wide uppercase text-[#8B806D]">Core Section Managers</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/admin/hero"
              className="flex items-start gap-3.5 rounded-xl border border-[#E7DCCB] bg-white p-4 shadow-xs transition hover:border-[#344238] hover:bg-[#F8F4ED]/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8F4ED] text-[#344238]">
                <Home size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#29251F]">Hero Section</h3>
                <p className="mt-0.5 text-[11px] text-[#8B806D]">Greeting, title, profile photo, and CTA buttons</p>
              </div>
            </Link>

            <Link
              to="/admin/about"
              className="flex items-start gap-3.5 rounded-xl border border-[#E7DCCB] bg-white p-4 shadow-xs transition hover:border-[#344238] hover:bg-[#F8F4ED]/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8F4ED] text-[#344238]">
                <Users size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#29251F]">About Me & Bio</h3>
                <p className="mt-0.5 text-[11px] text-[#8B806D]">Intro heading, bio description, experience years</p>
              </div>
            </Link>

            <Link
              to="/admin/services"
              className="flex items-start gap-3.5 rounded-xl border border-[#E7DCCB] bg-white p-4 shadow-xs transition hover:border-[#344238] hover:bg-[#F8F4ED]/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8F4ED] text-[#344238]">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#29251F]">Services & Pricing</h3>
                <p className="mt-0.5 text-[11px] text-[#8B806D]">Categories, prices, descriptions, and icons</p>
              </div>
            </Link>

            <Link
              to="/admin/projects"
              className="flex items-start gap-3.5 rounded-xl border border-[#E7DCCB] bg-white p-4 shadow-xs transition hover:border-[#344238] hover:bg-[#F8F4ED]/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8F4ED] text-[#344238]">
                <FolderKanban size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#29251F]">Projects & Case Studies</h3>
                <p className="mt-0.5 text-[11px] text-[#8B806D]">Multi-images, verified metrics, objectives & strategy</p>
              </div>
            </Link>

            <Link
              to="/admin/navigation"
              className="flex items-start gap-3.5 rounded-xl border border-[#E7DCCB] bg-white p-4 shadow-xs transition hover:border-[#344238] hover:bg-[#F8F4ED]/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8F4ED] text-[#344238]">
                <Menu size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#29251F]">Navigation Menu</h3>
                <p className="mt-0.5 text-[11px] text-[#8B806D]">Reorder header links, CTA button, URLs</p>
              </div>
            </Link>

            <Link
              to="/admin/seo"
              className="flex items-start gap-3.5 rounded-xl border border-[#E7DCCB] bg-white p-4 shadow-xs transition hover:border-[#344238] hover:bg-[#F8F4ED]/40"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#F8F4ED] text-[#344238]">
                <Search size={18} />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[#29251F]">SEO & Social Meta</h3>
                <p className="mt-0.5 text-[11px] text-[#8B806D]">Google SERP preview, OG tags, keywords, canonical</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Publishing Activity History */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-wide uppercase text-[#8B806D]">Recent Activity</h2>
            <Link to="/admin/history" className="text-xs font-semibold text-[#344238] hover:underline">
              View All
            </Link>
          </div>

          <div className="rounded-2xl border border-[#E7DCCB] bg-white p-4 shadow-xs">
            {stats.recentActivities && stats.recentActivities.length > 0 ? (
              <div className="divide-y divide-[#E7DCCB]/60">
                {stats.recentActivities.map((act) => (
                  <div key={act.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#29251F] capitalize">
                        {act.action === 'publish' ? '🚀 Published' : '📝 Draft Saved'}
                      </span>
                      <span className="text-[10px] text-[#8B806D]">
                        {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-[#8B806D]">
                      {((act.details as any)?.summary) || act.summary || `Updated ${act.section || act.section_name || 'content'} section`}
                    </p>
                    <div className="mt-1 text-[10px] text-[#8B806D]/80">by {act.admin_email || act.user_email || 'admin'}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#8B806D]">
                <History size={24} className="mx-auto mb-2 text-[#8B806D]/50" />
                No publishing activities recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
