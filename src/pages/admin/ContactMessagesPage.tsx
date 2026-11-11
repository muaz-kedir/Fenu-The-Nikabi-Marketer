import { useEffect, useState } from 'react';
import { deleteContactMessage, getContactMessages, updateContactMessageStatus } from '../../services/contentService';
import type { ContactMessage } from '../../types/database';

export function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    try { setMessages(await getContactMessages()); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Failed to load messages.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);

  const mark = async (id: string, status: 'read' | 'replied') => {
    try { await updateContactMessageStatus(id, status); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Failed to update message.'); }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this message?')) return;
    try { await deleteContactMessage(id); await load(); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Failed to delete message.'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Inbox</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Contact messages</h1>
      </div>
      {message && <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">{message}</div>}
      {loading ? <div className="text-white/60">Loading messages...</div> : (
        <div className="space-y-4">
          {messages.length === 0 && <div className="text-white/60">No messages yet.</div>}
          {messages.map((item) => (
            <div key={item.id} className="rounded-[28px] border border-white/10 bg-[#141414] p-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-white">{item.sender_name}</div>
                  <div className="text-sm text-white/60">{item.sender_email} {item.subject ? `· ${item.subject}` : ''}</div>
                </div>
                <span className="rounded-full border border-[#f04796]/40 bg-[#f04796]/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[#f6b7d2]">{item.status}</span>
              </div>
              <div className="mt-4 text-sm leading-7 text-white/65">{item.message}</div>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => void mark(item.id, 'read')} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">Mark read</button>
                <button type="button" onClick={() => void mark(item.id, 'replied')} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/70">Mark replied</button>
                <button type="button" onClick={() => void remove(item.id)} className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs text-red-200">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
