import React from 'react';
import { Card } from './Card';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  subtitle?: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  accentColor?: 'blue' | 'indigo' | 'emerald' | 'cyan' | 'amber' | 'red';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  change,
  changeType = 'neutral',
  accentColor = 'blue',
  className = '',
}) => {
  const getAccentBg = () => {
    switch (accentColor) {
      case 'indigo':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400';
      case 'emerald':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400';
      case 'cyan':
        return 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400';
      case 'amber':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400';
      case 'red':
        return 'bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400';
      default:
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <Card className={`p-5 space-y-3 hoverEffect ${className}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className={`p-2.5 rounded-xl ${getAccentBg()}`}>
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>

        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {subtitle}
          </p>
        )}

        {change && (
          <div className="flex items-center gap-1.5 pt-1 text-xs">
            {changeType === 'positive' && (
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
            {changeType === 'negative' && (
              <TrendingDown className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
            )}
            <span
              className={`font-semibold ${
                changeType === 'positive'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : changeType === 'negative'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-slate-500'
              }`}
            >
              {change}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
