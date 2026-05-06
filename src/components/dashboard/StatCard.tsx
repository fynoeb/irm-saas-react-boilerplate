import React from 'react';
import * as Icons from 'lucide-react';
import { Metric } from '../../types';
import { GlassCard } from '../ui/GlassCard';

interface StatCardProps {
  metric: Metric;
  onClick?: () => void;
}

/**
 * StatCard Component
 * 
 * A high-density visual summary component for metric data.
 * Features dynamic iconography and trend indicators with glassmorphism styling.
 * 
 * @param metric - The metric data object containing value, label, and trend information.
 * @param onClick - Optional transition event for drill-down navigation.
 */
export const StatCard: React.FC<StatCardProps> = ({ metric, onClick }) => {
  // @ts-ignore - Dynamic icon resolution
  const Icon = Icons[metric.iconName];

  return (
    <GlassCard 
      onClick={onClick}
      className="flex flex-col gap-4 group hover:border-accent/40 cursor-pointer overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-accent/10 transition-colors" />
      <div className="flex items-center justify-between relative z-10">
        <div className="p-2.5 bg-slate-50 text-slate-400 group-hover:bg-accent/10 group-hover:text-accent transition-colors rounded-xl">
          <Icon size={20} />
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider ${
          metric.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
        }`}>
          {metric.change}
        </span>
      </div>
      <div className="relative z-10">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{metric.label}</p>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight group-hover:text-accent transition-colors duration-300">{metric.value}</h3>
      </div>
    </GlassCard>
  );
};
