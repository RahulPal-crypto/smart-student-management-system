import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-[#121212] border border-slate-200/80 dark:border-white/10 rounded-xl p-5 shadow-xs transition-all duration-200 ${
        hoverEffect ? 'hover:border-slate-300 dark:hover:border-white/20 dark:hover:bg-[#151515] hover:shadow-md' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
  accentColor?: 'blue' | 'indigo' | 'cyan' | 'emerald' | 'amber' | 'red';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  change,
  changeType = 'positive',
  subtitle,
  accentColor = 'blue',
  className = '',
}) => {
  const iconBg = {
    blue: 'bg-white/5 text-[#C4A484] border border-white/10 dark:text-[#C4A484]',
    indigo: 'bg-white/5 text-indigo-400 border border-white/10',
    cyan: 'bg-white/5 text-cyan-400 border border-white/10',
    emerald: 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20',
    amber: 'bg-amber-950/40 text-[#C4A484] border border-[#C4A484]/30',
    red: 'bg-red-950/40 text-red-400 border border-red-500/20',
  };

  const changeColors = {
    positive: 'text-emerald-400 bg-emerald-950/50 border border-emerald-500/20',
    negative: 'text-red-400 bg-red-950/50 border border-red-500/20',
    neutral: 'text-zinc-400 bg-white/5 border border-white/10',
  };

  return (
    <Card className={`relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1.5">
          <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em]">
            {title}
          </span>
          <div className="text-2xl lg:text-3xl font-serif text-slate-900 dark:text-white tracking-tight">
            {value}
          </div>
        </div>
        <div className={`p-2.5 rounded-lg ${iconBg[accentColor]} shrink-0`}>
          {icon}
        </div>
      </div>

      {(change || subtitle) && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 text-xs">
          {change && (
            <span className={`font-mono text-[11px] px-2 py-0.5 rounded ${changeColors[changeType]}`}>
              {change}
            </span>
          )}
          {subtitle && (
            <span className="text-zinc-500 dark:text-zinc-400 text-[11px] truncate">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};
