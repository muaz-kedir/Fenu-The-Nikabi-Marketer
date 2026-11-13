import { BarChart3, Heart, MessageSquare, TrendingUp, Users } from 'lucide-react';
import { BentoCard } from './ui/BentoCard';
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
  const items = stats ?? [];

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8 lg:pb-20">
      <div className="grid gap-4 rounded-[28px] border border-white/10 bg-[#141414] p-4 sm:grid-cols-2 lg:grid-cols-4 lg:p-6">
        {items.map(({ value, label, icon, suffix }) => {
          const Icon = iconMap[icon as keyof typeof iconMap] ?? TrendingUp;

          return (
            <BentoCard
              key={label}
              radius={24}
              glowColor="#f04796"
              className="group p-6 bg-[#0f0f10]"
            >
              <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#f04796]/10 text-[#f6b7d2] transition duration-300 group-hover:scale-110 group-hover:bg-[#f04796]/20">
                <Icon size={20} />
              </div>
              <div className="text-3xl font-bold text-[#f6b7d2] transition duration-300 group-hover:text-white lg:text-4xl">
                {value}
                {suffix ? <span className="ml-1 text-xl">{suffix}</span> : null}
              </div>
              <div className="mt-2 text-sm uppercase tracking-[0.18em] text-white/60">{label}</div>
            </BentoCard>
          );
        })}
      </div>
    </section>
  );
}
