import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  BarChart3,
  FileImage,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  PanelLeftClose,
  PanelLeftOpen,
  PencilLine,
  Settings,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { label: 'Overview', to: '/admin', icon: LayoutDashboard },
  { label: 'Landing Page', to: '/admin/landing-page', icon: Sparkles },
  { label: 'About Me', to: '/admin/about', icon: Users },
  { label: 'Services', to: '/admin/services', icon: PencilLine },
  { label: 'Projects', to: '/admin/projects', icon: FileImage },
  { label: 'Skills', to: '/admin/skills', icon: Settings },
  { label: 'Process', to: '/admin/process', icon: BarChart3 },
  { label: 'Testimonials', to: '/admin/testimonials', icon: MessageSquareText },
  { label: 'Statistics', to: '/admin/statistics', icon: BarChart3 },
  { label: 'Media Library', to: '/admin/media', icon: FileImage },
  { label: 'Messages', to: '/admin/messages', icon: MessageSquareText },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem('admin-sidebar-collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('admin-sidebar-collapsed', String(collapsed));
    } catch {
      // ignore storage errors
    }
  }, [collapsed]);

  const showLabels = mobileOpen || !collapsed;

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0a0a] text-white">
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar backdrop"
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-[#121214] transition-all duration-300 lg:static ${collapsed ? 'lg:w-20' : 'lg:w-72'} ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className={`flex items-center gap-3 p-5 ${showLabels ? 'justify-between' : 'justify-center'}`}>
          {showLabels ? (
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f04796]/60 bg-[#f04796]/10 text-sm font-semibold text-[#f6b7d2]">
                AZ
              </div>
              <div>
                <div className="text-lg font-semibold">Admin CMS</div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">Portfolio</div>
              </div>
            </div>
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f04796]/60 bg-[#f04796]/10 text-sm font-semibold text-[#f6b7d2]">
              AZ
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:text-white lg:inline-flex"
          >
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
          {navItems.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/admin'}
              onClick={() => setMobileOpen(false)}
              title={!showLabels ? label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm ${showLabels ? '' : 'justify-center px-0'} ${isActive ? 'bg-[#f04796]/10 text-[#f6b7d2] ring-1 ring-[#f04796]/30' : 'text-white/70 hover:bg-white/5 hover:text-white'}`
              }
            >
              <Icon size={16} className="shrink-0" />
              {showLabels && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-3">
          <button
            type="button"
            onClick={() => void signOut()}
            title={!showLabels ? 'Logout' : undefined}
            className={`flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70 transition hover:text-white ${showLabels ? '' : 'justify-center px-0'}`}
          >
            <LogOut size={16} className="shrink-0" />
            {showLabels && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-white/10 bg-[#121214] p-4 lg:hidden">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open sidebar"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:text-white"
          >
            <Menu size={18} />
          </button>
          <div className="text-sm font-semibold">Admin CMS</div>
          <button
            type="button"
            onClick={() => void signOut()}
            aria-label="Logout"
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:text-white"
          >
            <LogOut size={18} />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
