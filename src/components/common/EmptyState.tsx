import React from 'react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  actionIcon,
}) => {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1322]/80 backdrop-blur-xl p-8 sm:p-12 text-center shadow-xl shadow-black/40">
      <div className="w-14 h-14 rounded-2xl bg-[#11182c] border border-white/10 flex items-center justify-center mx-auto mb-4 text-indigo-400 shadow-inner">
        {icon}
      </div>
      <h4 className="text-sm font-extrabold uppercase tracking-wider text-white font-display">
        {title}
      </h4>
      <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
        >
          {actionIcon}
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
