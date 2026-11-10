export function StatisticsPage() {
  const stats = [
    { label: 'Impressions', value: '12K', suffix: '+', visible: true },
    { label: 'Likes', value: '502', suffix: '+', visible: true },
    { label: 'Comments', value: '73', suffix: '+', visible: true },
    { label: 'Happy Clients', value: '20', suffix: '+', visible: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Statistics</p>
        <h1 className="mt-2 text-3xl font-semibold text-white">Edit performance metrics</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {stats.map((item) => (
          <div key={item.label} className="rounded-[28px] border border-white/10 bg-[#141414] p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm uppercase tracking-[0.2em] text-white/60">{item.label}</span>
              <label className="flex items-center gap-2 text-xs text-white/60">
                <input type="checkbox" checked={item.visible} readOnly />
                Visible
              </label>
            </div>
            <div className="flex items-center gap-2 text-3xl font-bold text-[#f6b7d2]">
              <span>{item.value}</span>
              <span className="text-lg">{item.suffix}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
