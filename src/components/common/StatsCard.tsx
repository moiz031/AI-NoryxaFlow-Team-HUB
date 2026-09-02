import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  onClick?: () => void;
  accentGradient?: string;
  badge?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  onClick,
  accentGradient = 'from-indigo-600 to-cyan-500',
  badge,
}) => {
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl p-5 bg-[#0d1322]/85 backdrop-blur-xl border border-white/10 shadow-xl shadow-black/40 transition-all duration-300 group ${
        onClick ? 'cursor-pointer hover:border-indigo-500/50 hover:shadow-indigo-500/15 hover:-translate-y-0.5' : 'hover:border-white/20'
      }`}
    >
      {/* Top subtle gradient highlight line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${accentGradient} opacity-70 group-hover:opacity-100 transition-opacity`} />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 font-display flex items-center gap-1.5">
            {title}
          </p>
          <div className="mt-2.5 flex items-baseline gap-2.5 flex-wrap">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-display">
              {value}
            </h3>
            {badge && (
              <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {badge}
              </span>
            )}
          </div>
          {subtitle && <p className="mt-1 text-xs text-slate-400 font-medium">{subtitle}</p>}
        </div>

        <div className="p-3 rounded-xl bg-[#11182c] border border-white/10 text-indigo-400 flex items-center justify-center shadow-inner group-hover:scale-105 group-hover:text-cyan-300 transition-all">
          {icon}
        </div>
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center text-xs">
          <span
            className={`font-bold flex items-center gap-1 px-1.5 py-0.5 rounded ${
              trend.isPositive ? 'text-emerald-300 bg-emerald-500/10' : 'text-rose-300 bg-rose-500/10'
            }`}
          >
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          {trend.label && <span className="ml-2 text-slate-400 font-medium text-[11px]">{trend.label}</span>}
        </div>
      )}
    </div>
  );
};
