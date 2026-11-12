import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    : 'Direct Application Server (/api)';

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
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
      <div className="w-full max-w-md rounded-[30px] border border-white/10 bg-[#141414] p-8 shadow-[0_0_40px_rgba(240,71,150,0.12)]">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-[#f04796]/50 bg-[#f04796]/10 text-xl font-semibold text-[#f6b7d2]">
            AZ
          </div>
          <h1 className="text-3xl font-semibold text-white">Admin Login</h1>
          <p className="mt-2 text-sm text-white/60">Secure content management portal</p>
          <div className="mt-3 inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-[#f04796]"></span>
            {authModeLabel}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm text-white/70">Email</label>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#101011] px-3 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#f04796]/60"
              placeholder="hello@example.com"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">Password</label>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-[#101011] px-3 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#f04796]/60"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200 leading-relaxed">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full border border-[#f04796] bg-[#f04796] px-4 py-3 font-medium text-[#0d0d0f] transition hover:bg-[#ff6ab3] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
