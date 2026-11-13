import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';
import { apiBaseUrl } from '../../services/localApi';
import { isSupabaseConfigured } from '../../services/supabase';

export function LoginPage() {
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const authModeLabel = isSupabaseConfigured && !apiBaseUrl
    ? 'Supabase Auth'
    : apiBaseUrl
    ? `Backend API (${apiBaseUrl})`
    : 'AletCloud Application Server (/api)';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn(email, password);

    if (result.error) {
      setError(result.error.message);
      setLoading(false);
      return;
    }

    navigate('/admin');
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4 font-sans text-white overflow-hidden">
      {/* Background glow matching landing page */}
      <div className="absolute inset-x-0 top-0 h-[500px] bg-[radial-gradient(circle_at_50%_20%,rgba(240,71,150,0.25),transparent_55%)] pointer-events-none" />
      <div className="absolute left-1/2 top-20 h-72 w-72 -translate-x-1/2 rounded-full bg-[#f04796]/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#131117]/90 p-8 shadow-2xl backdrop-blur-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#f04796]/40 bg-[#f04796]/10 shadow-[0_0_20px_rgba(240,71,150,0.25)]">
            <img src="/fenu-brand.png" alt="Fenu" className="h-12 w-12 rounded-xl object-cover" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Fenu Admin CMS</h1>
          <p className="mt-1 text-xs text-[#f6b7d2]/80">Fenu|The Naqabi Marketer • Content Management Portal</p>
          <div className="mt-3 inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {authModeLabel}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-white/80">Admin Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#16141c] pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:outline-hidden transition"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-white/80">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#16141c] pl-10 pr-3 py-2.5 text-xs text-white placeholder:text-white/30 focus:border-[#f04796] focus:ring-1 focus:ring-[#f04796] focus:outline-hidden transition"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-300">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#f04796] bg-[#f04796] px-4 py-3 text-xs font-bold text-[#0d0d0f] shadow-[0_0_25px_rgba(240,71,150,0.35)] transition hover:bg-[#ff6ab3] hover:shadow-[0_0_30px_rgba(240,71,150,0.5)] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-6 border-t border-white/10 pt-4 text-center text-[11px] text-white/40">
          Protected administration portal • AletCloud Production
        </div>
      </div>
    </div>
  );
}
