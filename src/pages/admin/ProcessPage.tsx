export function ProcessPage() {
  const steps = [
    { step: '01', title: 'Understand', description: 'Learn audience, goals, and positioning.' },
    { step: '02', title: 'Plan', description: 'Map strategic content and campaigns.' },
    { step: '03', title: 'Create', description: 'Develop content systems and creative assets.' },
    { step: '04', title: 'Improve', description: 'Optimise performance with data and feedback.' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[#f6b7d2]">Process</p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Edit workflow steps</h1>
        </div>
        <button type="button" className="rounded-full border border-[#f04796] bg-[#f04796] px-4 py-2 text-sm font-medium text-[#0d0d0f]">Add step</button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((item) => (
          <div key={item.step} className="rounded-[28px] border border-white/10 bg-[#141414] p-5">
            <div className="mb-4 text-3xl font-semibold text-[#f6b7d2]">{item.step}</div>
            <h2 className="text-xl font-semibold text-white">{item.title}</h2>
            <p className="mt-3 text-sm leading-7 text-white/65">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
