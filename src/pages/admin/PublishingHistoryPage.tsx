import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, CheckCircle2, Clock, History, RefreshCw, Send, User } from 'lucide-react';
import { getPublishingHistory, publishAllDrafts } from '../../services/contentService';
import type { PublishingHistoryItem } from '../../types/database';

export function PublishingHistoryPage() {
  const { refreshOverview } = useOutletContext<{ refreshOverview?: () => void }>() || {};

  const [history, setHistory] = useState<PublishingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const items = await getPublishingHistory();
      setHistory(items);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const handlePublishAll = async () => {
    setPublishing(true);
    setMessage(null);
    try {
      await publishAllDrafts();
      setMessage('All drafts published successfully to live visitors!');
      await loadHistory();
      if (refreshOverview) refreshOverview();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Publishing & Version History</h1>
          <p className="mt-1 text-xs text-white/60">
            Audit trail of all published deployments and saved draft modifications across the website.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadHistory()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#16141c] px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#0a0a0a]"
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            type="button"
            disabled={publishing}
            onClick={() => void handlePublishAll()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#f04796] text-[#0d0d0f] font-bold shadow-[0_0_20px_rgba(240,71,150,0.35)] px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#ff6ab3] disabled:opacity-50"
          >
            <Send size={14} />
            {publishing ? 'Publishing...' : 'Publish All Drafts'}
          </button>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-medium text-emerald-800">
          {message}
        </div>
      )}

      {/* Audit Timeline */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#131117] shadow-xs">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-white/60">
            Audit Trail ({history.length} events)
          </h2>
          <span className="text-[11px] text-white/60">Persistent in PostgreSQL</span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-white/60">Loading publishing history...</div>
        ) : history.length === 0 ? (
          <div className="p-12 text-center text-xs text-white/60">
            <History size={28} className="mx-auto mb-2 text-white/60/40" />
            No publishing activity recorded yet.
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {history.map((item) => (
              <div key={item.id} className="p-4 transition hover:bg-[#16141c] flex items-start gap-3.5">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg mt-0.5 ${
                    item.action === 'publish'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {item.action === 'publish' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white capitalize">
                      {item.action === 'publish' ? 'Live Deployment / Publish' : 'Draft Saved'}
                    </span>
                    <span className="text-[11px] text-white/60 font-mono">
                      {new Date(item.created_at).toLocaleString()}
                    </span>
                  </div>

                  <p className="mt-0.5 text-xs text-white">
                    {((item.details as any)?.summary) || item.summary || `Updated section: ${item.section || item.section_name || 'all'}`}
                  </p>

                  <div className="mt-1 flex items-center gap-3 text-[11px] text-white/60">
                    <span className="flex items-center gap-1">
                      <User size={12} /> {item.admin_email || item.user_email || 'Administrator'}
                    </span>
                    <span>•</span>
                    <span className="capitalize">Target: {item.section || item.section_name || 'all'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
