import { useEffect, useState } from 'react';
import {
  CheckCheck,
  Clock,
  Eye,
  Mail,
  MailOpen,
  Reply,
  Trash2,
  X,
} from 'lucide-react';
import {
  deleteContactMessage,
  getContactMessages,
  updateContactMessageStatus,
} from '../../services/contentService';
import type { ContactMessage } from '../../types/database';

export function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<'all' | 'new' | 'read' | 'replied'>('all');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getContactMessages();
      setMessages(data);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to load messages.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const markStatus = async (id: string, status: 'new' | 'read' | 'replied') => {
    try {
      await updateContactMessageStatus(id, status);
      await loadData();
      if (activeMessage && activeMessage.id === id) {
        setActiveMessage({ ...activeMessage, status });
      }
    } catch (error) {
      alert('Failed to update status.');
    }
  };

  const removeMessage = async (id: string, name: string) => {
    if (!confirm(`Delete message from "${name}"?`)) return;
    try {
      await deleteContactMessage(id);
      if (activeMessage?.id === id) setActiveMessage(null);
      await loadData();
    } catch (error) {
      alert('Failed to delete message.');
    }
  };

  const filtered = messages.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Client Inquiries & Messages</h1>
          <p className="mt-1 text-xs text-white/60">
            Incoming leads and partnership requests submitted from the public landing page contact form.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#131117] p-1">
          {(['all', 'new', 'read', 'replied'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                filter === tab
                  ? 'bg-[#f04796] text-[#0d0d0f] font-bold shadow-[0_0_20px_rgba(240,71,150,0.35)] text-white shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid: Messages List & Message Reader */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Messages List (3 cols) */}
        <div className="lg:col-span-3 overflow-hidden rounded-2xl border border-white/10 bg-[#131117] shadow-xs">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-white/60">
              Inbox ({filtered.length})
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs text-white/60">Loading inbox...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-white/60">No inquiries found in this view.</div>
          ) : (
            <div className="divide-y divide-white/10">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    setActiveMessage(item);
                    if (item.status === 'new') void markStatus(item.id, 'read');
                  }}
                  className={`p-4 cursor-pointer transition flex items-start gap-3 ${
                    activeMessage?.id === item.id
                      ? 'bg-[#0a0a0a]'
                      : 'hover:bg-[#16141c] bg-white'
                  }`}
                >
                  <div
                    className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                      item.status === 'new' ? 'bg-emerald-500' : 'bg-transparent'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">{item.sender_name}</span>
                      <span className="text-[10px] text-white/60 font-mono">
                        {new Date(item.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-[11px] font-medium text-[#f6b7d2] truncate mt-0.5">
                      {item.subject || 'New Website Inquiry'}
                    </div>
                    <p className="text-[11px] text-white/60 line-clamp-1 mt-0.5">{item.message}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Reader (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#131117] p-6 shadow-xs">
          {activeMessage ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white">{activeMessage.sender_name}</h3>
                  <a
                    href={`mailto:${activeMessage.sender_email}`}
                    className="text-xs text-[#f6b7d2] hover:underline block mt-0.5"
                  >
                    {activeMessage.sender_email}
                  </a>
                  <span className="text-[10px] text-white/60 block mt-1">
                    Received: {new Date(activeMessage.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => void removeMessage(activeMessage.id, activeMessage.sender_name)}
                    title="Delete message"
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div>
                <span className="text-[11px] uppercase tracking-wider text-white/60 block">Subject</span>
                <span className="text-xs font-semibold text-white mt-0.5 block">
                  {activeMessage.subject || 'General Inquiry'}
                </span>
              </div>

              <div className="rounded-xl border border-white/10 bg-[#16141c] p-4 text-xs text-white leading-relaxed whitespace-pre-wrap">
                {activeMessage.message}
              </div>

              {/* Status Actions */}
              <div className="border-t border-white/10 pt-4 space-y-2">
                <span className="text-[11px] text-white/60 block">Update Status:</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void markStatus(activeMessage.id, 'read')}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      activeMessage.status === 'read'
                        ? 'border-[#344238] bg-[#f04796] text-[#0d0d0f] font-bold shadow-[0_0_20px_rgba(240,71,150,0.35)] text-white'
                        : 'border-white/10 bg-[#131117] text-white'
                    }`}
                  >
                    Mark Read
                  </button>
                  <button
                    type="button"
                    onClick={() => void markStatus(activeMessage.id, 'replied')}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                      activeMessage.status === 'replied'
                        ? 'border-emerald-600 bg-emerald-600 text-white'
                        : 'border-white/10 bg-[#131117] text-white'
                    }`}
                  >
                    Mark Replied
                  </button>
                  <a
                    href={`mailto:${activeMessage.sender_email}?subject=Re: ${encodeURIComponent(
                      activeMessage.subject || 'Inquiry'
                    )}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#f04796] text-[#0d0d0f] font-bold shadow-[0_0_20px_rgba(240,71,150,0.35)] px-3 py-1.5 text-xs font-medium text-white shadow-xs"
                  >
                    <Reply size={13} /> Reply via Email
                  </a>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center text-center text-xs text-white/60">
              <Mail size={32} className="mb-2 text-white/60/40" />
              <span>Select an inquiry from the list to view its contents.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
