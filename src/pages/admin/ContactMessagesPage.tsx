export function ContactMessagesPage() {
  const messages = [
    { sender: 'Emma', subject: 'Brand growth strategy', status: 'Unread' },
    { sender: 'Salma', subject: 'Campaign planning', status: 'Replied' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Inbox</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Contact messages</h1>
      </div>

      <div className="space-y-4">
        {messages.map((message) => (
          <div key={message.sender} className="rounded-[28px] border border-white/10 bg-[#141414] p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="font-semibold text-white">{message.sender}</div>
                <div className="text-sm text-white/60">{message.subject}</div>
              </div>
              <span className="rounded-full border border-[#f04796]/40 bg-[#f04796]/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-[#f6b7d2]">
                {message.status}
              </span>
            </div>
            <div className="mt-4 text-sm leading-7 text-white/65">
              Hello, I would like to discuss a new campaign for my brand and understand your strategy options.
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
