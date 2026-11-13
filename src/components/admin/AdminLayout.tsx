import { useEffect, useState, useCallback } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  BarChart3,
  CheckCircle,
  Clock,
  Compass,
  ExternalLink,
  Eye,
  FileImage,
  Globe,
  HelpCircle,
  History,
  Home,
  Layers,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  PhoneCall,
  Search,
  Send,
  Settings,
  Sparkles,
  UploadCloud,
  User,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import { getDashboardOverview, publishAllDrafts } from '../../services/contentService';
import { LivePreviewModal } from './LivePreviewModal';

const navGroups = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
    ],
  },
  {
    title: 'CONTENT SECTIONS',
    items: [
      { label: 'Landing Page Editor', to: '/admin/landing-page', icon: Sparkles },
      { label: 'Hero Section', to: '/admin/hero', icon: Home },
      { label: 'About Me', to: '/admin/about', icon: Users },
      { label: 'Services', to: '/admin/services', icon: Layers },
      { label: 'Portfolio Projects', to: '/admin/projects', icon: FileImage },
      { label: 'Skills & Tools', to: '/admin/skills', icon: CheckCircle },
      { label: 'Workflow Process', to: '/admin/process', icon: Compass },
      { label: 'Testimonials', to: '/admin/testimonials', icon: MessageSquareText },
      { label: 'Key Statistics', to: '/admin/statistics', icon: BarChart3 },
    ],
  },
  {
    title: 'MANAGEMENT & COMMS',
    items: [
      { label: 'Navigation Menu', to: '/admin/navigation', icon: Menu },
      { label: 'Contact Settings', to: '/admin/contact', icon: PhoneCall },
      { label: 'Contact Messages', to: '/admin/messages', icon: Mail },
      { label: 'Media Library', to: '/admin/media', icon: UploadCloud },
    ],
  },
  {
    title: 'SITE & SYSTEM',
    items: [
      { label: 'SEO & Meta Tags', to: '/admin/seo', icon: Search },
      { label: 'Website Settings', to: '/admin/settings', icon: Settings },
      { label: 'Publishing History', to: '/admin/history', icon: History },
      { label: 'Admin Account', to: '/admin/profile', icon: User },
    ],
  },
];

export function AdminLayout() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('admin-sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [draftChangesCount, setDraftChangesCount] = useState<number>(0);
  const [lastPublishedAt, setLastPublishedAt] = useState<string | null>(null);
  const [publishSuccessMsg, setPublishSuccessMsg] = useState<string | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      const data = await getDashboardOverview();
      setDraftChangesCount(data.draftChanges || 0);
      setLastPublishedAt(data.lastPublishedAt || null);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    void fetchOverview();
    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && document.hidden) return;
      void fetchOverview();
    }, 60000);

    const onFocus = () => {
      void fetchOverview();
    };
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [fetchOverview]);

  useEffect(() => {
    try {
      localStorage.setItem('admin-sidebar-collapsed', String(collapsed));
    } catch {
      // ignore
    }
  }, [collapsed]);

  const handlePublishAll = async () => {
    setIsPublishing(true);
    setPublishSuccessMsg(null);
    try {
      await publishAllDrafts();
      setPublishSuccessMsg('All drafts have been successfully published to the live site!');
      await fetchOverview();
      setTimeout(() => {
        setIsPublishModalOpen(false);
        setPublishSuccessMsg(null);
      }, 1500);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to publish changes.');
    } finally {
      setIsPublishing(false);
    }
  };

  const showLabels = mobileOpen || !collapsed;

  // Breadcrumbs title
  const currentPath = location.pathname;
  let pageTitle = 'Dashboard';
  for (const group of navGroups) {
    const item = group.items.find((i) => i.to === currentPath);
    if (item) {
      pageTitle = item.label;
      break;
    }
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F4ED] text-[#1C1917] font-sans antialiased">
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar backdrop"
          className="fixed inset-0 z-40 bg-[#29251F]/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 shrink-0 flex-col border-r border-[#E7DCCB]/20 bg-[#29251F] text-white transition-all duration-300 lg:static ${
          collapsed ? 'lg:w-20' : 'lg:w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header / Brand */}
        <div className={`flex items-center gap-3 border-b border-[#E7DCCB]/15 p-5 ${showLabels ? 'justify-between' : 'justify-center'}`}>
          {showLabels ? (
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#344238] border border-[#E7DCCB]/30 text-base font-bold text-[#F8F4ED] shadow-sm">
                F
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold tracking-wide text-white">Fenu Admin CMS</div>
                <div className="truncate text-[11px] font-medium tracking-wider text-[#8B806D] uppercase">The Nikabi Marketer</div>
              </div>
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#344238] border border-[#E7DCCB]/30 text-base font-bold text-[#F8F4ED]">
              F
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden h-8 w-8 items-center justify-center rounded-lg border border-[#E7DCCB]/10 bg-white/5 text-[#E7DCCB]/70 transition hover:bg-white/10 hover:text-white lg:inline-flex"
          >
            {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[#E7DCCB]/10 bg-white/5 text-[#E7DCCB]/70 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation items */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4 text-xs">
          {navGroups.map((group) => (
            <div key={group.title} className="space-y-1">
              {showLabels && (
                <div className="px-3 pb-1 font-mono text-[10px] font-semibold tracking-widest text-[#8B806D]">
                  {group.title}
                </div>
              )}
              {group.items.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/admin'}
                  onClick={() => setMobileOpen(false)}
                  title={!showLabels ? label : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-medium transition duration-150 ${
                      showLabels ? '' : 'justify-center px-0'
                    } ${
                      isActive
                        ? 'bg-[#344238] text-white shadow-sm ring-1 ring-[#E7DCCB]/20'
                        : 'text-[#E7DCCB]/80 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <Icon size={16} className="shrink-0" />
                  {showLabels && <span className="truncate">{label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User & Logout Footer */}
        <div className="border-t border-[#E7DCCB]/15 p-3">
          {showLabels ? (
            <div className="mb-2 flex items-center justify-between rounded-xl bg-white/5 px-3 py-2 border border-[#E7DCCB]/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#344238] text-xs font-semibold text-white">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-xs font-medium text-white">{user?.email || 'admin@example.com'}</div>
                  <div className="text-[10px] text-[#8B806D]">Administrator</div>
                </div>
              </div>
            </div>
          ) : null}

          <button
            type="button"
            onClick={() => void signOut()}
            title={!showLabels ? 'Logout' : undefined}
            className={`flex w-full items-center gap-2.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-medium text-rose-300 transition hover:bg-rose-500/20 hover:text-rose-200 ${
              showLabels ? '' : 'justify-center px-0'
            }`}
          >
            <LogOut size={15} className="shrink-0" />
            {showLabels && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-[#E7DCCB] bg-[#FFFFFF] px-4 sm:px-6 shadow-sm">
          {/* Left: Mobile Toggle + Breadcrumbs */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open sidebar"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E7DCCB] bg-[#F8F4ED] text-[#29251F] transition hover:bg-[#E7DCCB]/60 lg:hidden"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-[#8B806D]">CMS</span>
              <span className="text-[#8B806D]">/</span>
              <h1 className="text-sm font-bold text-[#29251F] tracking-tight">{pageTitle}</h1>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Draft Status Pill */}
            {draftChangesCount > 0 ? (
              <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 shadow-xs">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{draftChangesCount} unpublished {draftChangesCount === 1 ? 'change' : 'changes'}</span>
              </div>
            ) : (
              <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#E7DCCB] bg-[#F8F4ED] px-3 py-1 text-xs font-medium text-[#344238] shadow-xs">
                <CheckCircle size={13} className="text-[#344238]" />
                <span>All changes published</span>
              </div>
            )}

            {/* Live Preview Button */}
            <button
              type="button"
              onClick={() => setIsPreviewOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E7DCCB] bg-[#F8F4ED] px-3.5 py-2 text-xs font-semibold text-[#29251F] shadow-xs transition hover:bg-[#E7DCCB]/50"
            >
              <Eye size={15} className="text-[#344238]" />
              <span className="hidden md:inline">Live Preview</span>
            </button>

            {/* Publish Changes Button */}
            <button
              type="button"
              onClick={() => setIsPublishModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#344238] bg-[#344238] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#29251F]"
            >
              <Send size={14} />
              <span>Publish Changes</span>
            </button>

            {/* View Live Public Site */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              title="View live website"
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-[#E7DCCB] bg-[#F8F4ED] text-[#29251F] transition hover:bg-[#E7DCCB]/60"
            >
              <ExternalLink size={16} />
            </a>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto bg-[#F8F4ED] p-4 sm:p-6 lg:p-8">
          <Outlet context={{ refreshOverview: fetchOverview }} />
        </main>
      </div>

      {/* Live Preview Modal */}
      <LivePreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} />

      {/* Publish Changes Confirmation Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#29251F]/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#E7DCCB] bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#344238]/10 text-[#344238]">
                <Send size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#29251F]">Publish Changes to Live Site?</h3>
                <p className="text-xs text-[#8B806D]">This will update the live public website immediately.</p>
              </div>
            </div>

            {publishSuccessMsg ? (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-medium text-emerald-800">
                {publishSuccessMsg}
              </div>
            ) : (
              <div className="mb-6 space-y-3 rounded-xl border border-[#E7DCCB]/60 bg-[#F8F4ED] p-4 text-xs text-[#29251F]">
                <div className="flex justify-between">
                  <span className="text-[#8B806D]">Pending Draft Changes:</span>
                  <span className="font-bold text-[#29251F]">{draftChangesCount}</span>
                </div>
                {lastPublishedAt && (
                  <div className="flex justify-between">
                    <span className="text-[#8B806D]">Last Published:</span>
                    <span className="font-medium text-[#29251F]">{new Date(lastPublishedAt).toLocaleString()}</span>
                  </div>
                )}
                <p className="border-t border-[#E7DCCB] pt-2 text-[11px] text-[#8B806D]">
                  All drafted edits across Hero, About Me, Services, Projects, Testimonials, Navigation, and Settings will be published simultaneously to visitors.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isPublishing}
                onClick={() => setIsPublishModalOpen(false)}
                className="rounded-xl border border-[#E7DCCB] bg-[#F8F4ED] px-4 py-2 text-xs font-semibold text-[#29251F] transition hover:bg-[#E7DCCB]/50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPublishing}
                onClick={() => void handlePublishAll()}
                className="inline-flex items-center gap-2 rounded-xl bg-[#344238] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#29251F] disabled:opacity-50"
              >
                {isPublishing ? 'Publishing...' : 'Confirm & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
