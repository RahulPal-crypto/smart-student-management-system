import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showValueText?: boolean;
  color?: 'blue' | 'indigo' | 'emerald' | 'amber' | 'red' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValueText = true,
  color = 'blue',
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorStyles = {
    blue: 'bg-[#C4A484]',
    indigo: 'bg-[#C4A484]',
    emerald: 'bg-emerald-400',
    amber: 'bg-amber-400',
    red: 'bg-red-400',
    cyan: 'bg-cyan-400',
  };

  return (
    <div className={`w-full space-y-1.5 ${className}`}>
      {(label || showValueText) && (
        <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
          {label && <span>{label}</span>}
          {showValueText && <span className="font-mono text-[11px] text-[#C4A484]">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`w-full bg-white/5 border border-white/5 rounded-full overflow-hidden ${heightStyles[size]}`}>
        <div
          className={`${heightStyles[size]} rounded-full transition-all duration-500 ease-out ${colorStyles[color]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export const SkeletonLoader: React.FC<{
  className?: string;
  variant?: 'text' | 'card' | 'circle' | 'table';
  count?: number;
}> = ({ className = '', variant = 'text', count = 1 }) => {
  const items = Array.from({ length: count });

  if (variant === 'circle') {
    return <div className={`w-10 h-10 rounded-full bg-white/5 animate-pulse ${className}`} />;
  }

  if (variant === 'card') {
    return (
      <div className={`p-5 rounded-xl bg-[#121212] border border-white/10 space-y-4 animate-pulse ${className}`}>
        <div className="w-1/3 h-4 bg-white/5 rounded" />
        <div className="w-2/3 h-8 bg-white/5 rounded" />
        <div className="w-full h-3 bg-white/5 rounded" />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`space-y-3 animate-pulse ${className}`}>
        {items.map((_, i) => (
          <div key={i} className="h-12 bg-white/5 rounded-lg w-full border border-white/5" />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {items.map((_, i) => (
        <div key={i} className="h-4 bg-white/5 rounded animate-pulse" />
      ))}
    </div>
  );
};

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div className={`py-12 px-4 text-center flex flex-col items-center justify-center space-y-3 bg-[#121212]/50 rounded-xl border border-dashed border-white/10 ${className}`}>
      {icon && (
        <div className="p-3.5 bg-white/5 rounded-xl text-[#C4A484] shadow-xs border border-white/10">
          {icon}
        </div>
      )}
      <div className="max-w-xs space-y-1">
        <h4 className="text-sm font-serif text-white">{title}</h4>
        <p className="text-xs text-zinc-400 leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
};

export interface TabsProps {
  tabs: Array<{ id: string; label: string; count?: number; icon?: React.ReactNode }>;
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`flex items-center gap-1 border-b border-white/10 overflow-x-auto no-scrollbar ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors cursor-pointer tracking-wider uppercase ${
              isActive
                ? 'border-[#C4A484] text-[#C4A484]'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`px-1.5 py-0.5 text-[10px] rounded font-mono ${
                  isActive
                    ? 'bg-[#C4A484]/20 text-[#C4A484] border border-[#C4A484]/30'
                    : 'bg-white/5 text-zinc-400'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
