import { useEffect, useState } from 'react';
import {
  CheckCheck,
  Clock,
  Eye,
  Loader2,
  Mail,
  MailOpen,
  MessageSquare,
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

  const load = async () => {
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
    void load();
  }, []);

  const mark = async (id: string, status: 'new' | 'read' | 'replied') => {
    try {
      await updateContactMessageStatus(id, status);
      await load();
      if (activeMessage && activeMessage.id === id) {
        setActiveMessage({ ...activeMessage, status });
      }
      setMessage({ type: 'success', text: `Message marked as ${status}.` });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to update message status.',
      });
    }
  };

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete the message from "${name}"?`)) {
      return;
    }
    try {
      await deleteContactMessage(id);
      if (activeMessage && activeMessage.id === id) {
        setActiveMessage(null);
      }
      await load();
      setMessage({ type: 'success', text: 'Message deleted successfully.' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to delete message.',
      });
    }
  };

  const filtered = messages.filter((m) => {
    if (filter === 'all') return true;
    return m.status === filter;
  });

  const unreadCount = messages.filter((m) => m.status === 'new').length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Inbox</p>
          <h1 className="mt-1 text-3xl font-semibold text-white">Contact Submissions</h1>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="rounded-full bg-[#f04796]/20 px-3 py-1 text-xs font-semibold text-[#f6b7d2] border border-[#f04796]/40">
              {unreadCount} unread message{unreadCount === 1 ? '' : 's'}
            </span>
          )}
        </div>
      </div>

      {/* Message Banner */}
      {message && (
        <div
          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-red-500/30 bg-red-500/10 text-red-200'
          }`}
        >
          <span>{message.text}</span>
          <button type="button" onClick={() => setMessage(null)} className="text-white/60 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'new', 'read', 'replied'] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              filter === key
                ? 'bg-[#f04796] text-[#0d0d0f]'
                : 'border border-white/10 bg-[#141416] text-white/70 hover:bg-white/10 hover:text-white'
            }`}
          >
            {key.toUpperCase()} {key === 'new' && unreadCount > 0 ? `(${unreadCount})` : ''}
          </button>
        ))}
      </div>

      {/* Message List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center text-white/50">
          <Loader2 size={24} className="animate-spin mr-2 text-[#f04796]" />
          Loading messages...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-[28px] border border-white/10 bg-[#141416] p-12 text-center text-white/50">
          <MessageSquare size={44} className="mb-3 text-white/30" />
          <h3 className="text-base font-medium text-white">No messages found</h3>
          <p className="mt-1 text-xs text-white/40">
            {filter !== 'all' ? `No messages matching the "${filter}" filter.` : 'Submissions from the public contact form will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const isNew = item.status === 'new';
            const dateStr = item.created_at
              ? new Date(item.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '';

            return (
              <div
                key={item.id}
                className={`rounded-[24px] border p-5 transition ${
                  isNew
                    ? 'border-[#f04796]/40 bg-[#1a1318] shadow-[0_0_25px_rgba(240,71,150,0.08)]'
                    : 'border-white/10 bg-[#141416] hover:border-white/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                        isNew
                          ? 'bg-[#f04796] text-[#0d0d0f]'
                          : 'bg-white/10 text-white/80'
                      }`}
                    >
                      {item.sender_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{item.sender_name}</span>
                        {isNew && (
                          <span className="rounded-full bg-[#f04796] px-2 py-0.5 text-[9px] font-bold text-[#0d0d0f]">
                            NEW
                          </span>
                        )}
                      </div>
                      <a
                        href={`mailto:${item.sender_email}`}
                        className="text-xs text-white/50 hover:text-[#f6b7d2]"
                      >
                        {item.sender_email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {dateStr && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-white/40">
                        <Clock size={12} /> {dateStr}
                      </span>
                    )}
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${
                        item.status === 'replied'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : item.status === 'read'
                            ? 'bg-white/10 text-white/60'
                            : 'bg-[#f04796]/20 text-[#f6b7d2] border border-[#f04796]/40'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>

                {item.subject && (
                  <h4 className="mt-3 text-xs font-semibold text-white/90">
                    Subject: {item.subject}
                  </h4>
                )}

                <p className="mt-2 text-xs leading-6 text-white/70 line-clamp-3 whitespace-pre-line">
                  {item.message}
                </p>

                {/* Controls */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMessage(item);
                        if (item.status === 'new') {
                          void mark(item.id, 'read');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10 hover:text-white"
                    >
                      <Eye size={13} /> Read Full Message
                    </button>
                    <a
                      href={`mailto:${item.sender_email}?subject=Re: ${encodeURIComponent(item.subject || 'Your inquiry')}`}
                      onClick={() => {
                        if (item.status !== 'replied') {
                          void mark(item.id, 'replied');
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#f04796]/30 bg-[#f04796]/10 px-3 py-1.5 text-xs font-medium text-[#f6b7d2] hover:bg-[#f04796]/20"
                    >
                      <Reply size={13} /> Reply via Email
                    </a>
                  </div>

                  <div className="flex items-center gap-2">
                    {item.status !== 'read' && (
                      <button
                        type="button"
                        onClick={() => void mark(item.id, 'read')}
                        className="inline-flex items-center gap-1 text-xs text-white/50 hover:text-white"
                        title="Mark as Read"
                      >
                        <MailOpen size={13} /> Read
                      </button>
                    )}
                    {item.status !== 'replied' && (
                      <button
                        type="button"
                        onClick={() => void mark(item.id, 'replied')}
                        className="inline-flex items-center gap-1 text-xs text-emerald-400/80 hover:text-emerald-300"
                        title="Mark as Replied"
                      >
                        <CheckCheck size={13} /> Replied
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => void remove(item.id, item.sender_name)}
                      className="inline-flex items-center gap-1 text-xs text-red-400/80 hover:text-red-300 ml-2"
                      title="Delete Message"
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Message Reader Modal */}
      {activeMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#161619] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#f04796]/20 text-[#f6b7d2] font-bold">
                  {activeMessage.sender_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">{activeMessage.sender_name}</h3>
                  <a
                    href={`mailto:${activeMessage.sender_email}`}
                    className="text-xs text-[#f6b7d2] hover:underline"
                  >
                    {activeMessage.sender_email}
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveMessage(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/60 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {activeMessage.subject && (
              <div>
                <span className="text-xs text-white/40 block">Subject</span>
                <p className="text-sm font-semibold text-white mt-0.5">{activeMessage.subject}</p>
              </div>
            )}

            <div>
              <span className="text-xs text-white/40 block">Message Body</span>
              <div className="mt-1.5 rounded-2xl border border-white/10 bg-[#0d0d0f] p-4 text-sm leading-7 text-white/90 whitespace-pre-wrap max-h-80 overflow-y-auto">
                {activeMessage.message}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <span className="text-xs text-white/40">Status: {activeMessage.status}</span>
              <div className="flex gap-2">
                <a
                  href={`mailto:${activeMessage.sender_email}?subject=Re: ${encodeURIComponent(activeMessage.subject || 'Your message')}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#f04796] px-4 py-2 text-xs font-semibold text-[#0d0d0f] hover:bg-[#ff6ab3]"
                >
                  <Mail size={13} /> Reply Email
                </a>
                <button
                  type="button"
                  onClick={() => setActiveMessage(null)}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white/70 hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
