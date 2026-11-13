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
    <div className="flex min-h-screen items-center justify-center bg-[#F8F4ED] px-4 font-sans text-[#29251F]">
      <div className="w-full max-w-md rounded-3xl border border-[#E7DCCB] bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#344238] border border-[#E7DCCB] text-2xl font-bold text-[#F8F4ED] shadow-sm">
            F
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#29251F]">Fenu Admin CMS</h1>
          <p className="mt-1 text-xs text-[#8B806D]">The Nikabi Marketer • Content Management System</p>
          <div className="mt-3 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-800">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {authModeLabel}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#29251F]">Admin Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B806D]" />
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 pl-10 pr-3 py-2.5 text-xs text-[#29251F] focus:border-[#344238] focus:bg-white focus:outline-hidden"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[#29251F]">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8B806D]" />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-[#E7DCCB] bg-[#F8F4ED]/50 pl-10 pr-3 py-2.5 text-xs text-[#29251F] focus:border-[#344238] focus:bg-white focus:outline-hidden"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-medium text-rose-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#344238] px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:bg-[#29251F] disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
            <ArrowRight size={14} />
          </button>
        </form>

        <div className="mt-6 border-t border-[#E7DCCB]/60 pt-4 text-center text-[11px] text-[#8B806D]">
          Protected administration portal • AletCloud Production
        </div>
      </div>
    </div>
  );
}
