import { useState } from 'react';
import { CheckCircle2, Database, KeyRound, LogOut, Server, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '../../contexts/useAuth';

export function AdminProfilePage() {
  const { user, signOut } = useAuth();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Admin Profile & System Account</h1>
        <p className="mt-1 text-xs text-white/60">
          Manage your administrator session and view deployment environment details.
        </p>
      </div>

      {/* Account Card */}
      <div className="rounded-2xl border border-white/10 bg-[#131117] p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4 border-b border-white/10 pb-5">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f04796] text-[#0d0d0f] font-bold shadow-[0_0_20px_rgba(240,71,150,0.35)] text-xl font-bold text-white shadow-sm">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{user?.email || 'admin@example.com'}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                Authorized Administrator
              </span>
              <span className="text-xs text-white/60">ID: {user?.id || 'admin-primary'}</span>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid gap-4 sm:grid-cols-2 text-xs">
          <div className="rounded-xl border border-white/10 bg-[#16141c] p-4">
            <span className="text-[11px] text-white/60 uppercase tracking-wider block">Access Role</span>
            <span className="text-sm font-semibold text-white mt-1 block">Full SuperAdmin (Read / Write / Publish)</span>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#16141c] p-4">
            <span className="text-[11px] text-white/60 uppercase tracking-wider block">Authentication Provider</span>
            <span className="text-sm font-semibold text-white mt-1 block">AletCloud Express Auth (HMAC Token)</span>
          </div>
        </div>

        {/* System Diagnostics */}
        <div className="space-y-3 rounded-xl border border-white/10 bg-[#16141c] p-4 text-xs">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Server size={14} className="text-[#f6b7d2]" /> Deployment Diagnostics
          </h3>
          <div className="grid gap-2 sm:grid-cols-2 text-[11px] text-white/60">
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span>Hosting Platform:</span>
              <span className="font-medium text-white">AletCloud Cloud Run</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span>Database Provider:</span>
              <span className="font-medium text-white">PostgreSQL</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span>Schema Self-Healing:</span>
              <span className="font-medium text-emerald-700">Active (Auto-Migrating)</span>
            </div>
            <div className="flex justify-between border-b border-white/10 pb-1">
              <span>Uploads Storage:</span>
              <span className="font-medium text-white">Local Persistent Volume (/uploads)</span>
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <p className="text-xs text-white/60">Sign out of this session on this browser.</p>
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
