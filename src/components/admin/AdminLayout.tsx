import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, FileImage, LayoutDashboard, LogOut, MessageSquareText, PencilLine, Settings, Sparkles, Users } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="mx-auto flex max-w-[1600px] gap-6 p-4 lg:p-6">
        <aside className="hidden w-72 shrink-0 rounded-[30px] border border-white/10 bg-[#121214] p-5 lg:block">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-[#f04796]/60 bg-[#f04796]/10 text-sm font-semibold text-[#f6b7d2]">
              AZ
            </div>
            <div>
              <div className="text-lg font-semibold">Admin CMS</div>
              <div className="text-xs uppercase tracking-[0.2em] text-white/50">Portfolio</div>
            </div>
          </div>

          <nav className="space-y-2">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm ${isActive ? 'bg-[#f04796]/10 text-[#f6b7d2] ring-1 ring-[#f04796]/30' : 'text-white/70 hover:bg-white/5 hover:text-white'}`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => void signOut()}
            className="mt-8 flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-3 py-2.5 text-sm text-white/70 hover:text-white"
          >
            <LogOut size={16} />
            Logout
          </button>
        </aside>

        <main className="flex-1 rounded-[30px] border border-white/10 bg-[#111214] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
