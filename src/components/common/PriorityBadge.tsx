import React from 'react';
import { TaskPriority } from '../../types';

interface PriorityBadgeProps {
  priority: TaskPriority;
  showIcon?: boolean;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const getBadgeConfig = () => {
    switch (priority) {
      case 'urgent':
        return {
          dot: 'bg-rose-400 animate-pulse',
          bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          label: 'Urgent',
        };
      case 'high':
        return {
          dot: 'bg-amber-400',
          bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          label: 'High Priority',
        };
      case 'medium':
        return {
          dot: 'bg-indigo-400',
          bg: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
          label: 'Medium',
        };
      case 'low':
      default:
        return {
          dot: 'bg-slate-400',
          bg: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
          label: 'Low',
        };
    }
  };

  const config = getBadgeConfig();

  return (
    <span
      id={`priority-badge-${priority}`}
      className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${config.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
};
