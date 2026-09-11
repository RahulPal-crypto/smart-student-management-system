import React from 'react';

interface SkeletonLoaderProps {
  variant?: 'card' | 'table' | 'text';
  count?: number;
  className?: string;
}

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'card',
  count = 1,
  className = '',
}) => {
  const items = Array.from({ length: count });

  if (variant === 'table') {
    return (
      <div className={`w-full space-y-3 animate-pulse ${className}`}>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        {items.map((_, i) => (
          <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl" />
        ))}
      </div>
    );
  }

  if (variant === 'text') {
    return (
      <div className={`space-y-2 animate-pulse ${className}`}>
        {items.map((_, i) => (
          <div
            key={i}
            className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md"
            style={{ width: `${Math.max(40, 100 - i * 15)}%` }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((_, i) => (
        <div
          key={i}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="w-24 h-4 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="w-32 h-8 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="w-48 h-3 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
      ))}
    </div>
  );
};
