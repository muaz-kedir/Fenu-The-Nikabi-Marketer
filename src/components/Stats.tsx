import { BarChart3, Heart, MessageSquare, TrendingUp, Users } from 'lucide-react';
import type { Statistic } from '../types/database';

const iconMap = {
  TrendingUp,
  Heart,
  MessageSquare,
  Users,
  BarChart3,
};

type StatsProps = {
  stats?: Statistic[];
};

export function Stats({ stats }: StatsProps) {
  const items = stats ?? [
    { id: '1', label: 'Impressions', value: '12K', suffix: '+', icon: 'TrendingUp', display_order: 1, is_visible: true, updated_at: new Date().toISOString() },
    { id: '2', label: 'Likes', value: '502', suffix: '+', icon: 'Heart', display_order: 2, is_visible: true, updated_at: new Date().toISOString() },
    { id: '3', label: 'Comments', value: '73', suffix: '+', icon: 'MessageSquare', display_order: 3, is_visible: true, updated_at: new Date().toISOString() },
    { id: '4', label: 'Happy Clients', value: '20', suffix: '+', icon: 'Users', display_order: 4, is_visible: true, updated_at: new Date().toISOString() },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8 lg:pb-20">
      <div className="grid gap-4 rounded-[28px] border border-white/10 bg-[#141414] p-4 sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
        {items.map(({ value, label, icon, suffix }) => {
          const Icon = iconMap[icon as keyof typeof iconMap] ?? TrendingUp;

          return (
            <div key={label} className="group rounded-3xl border border-white/10 bg-[#0f0f10] p-6 transition hover:-translate-y-1 hover:border-[#f04796]/40 hover:shadow-[0_0_25px_rgba(240,71,150,0.12)]">
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f04796]/10 text-[#f6b7d2]">
                <Icon size={20} />
              </div>
              <div className="text-3xl font-bold text-[#f6b7d2] lg:text-4xl">
                {value}
                {suffix ? <span className="ml-1 text-xl">{suffix}</span> : null}
              </div>
              <div className="mt-2 text-sm uppercase tracking-[0.18em] text-white/60">{label}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
