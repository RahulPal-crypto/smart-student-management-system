import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-medium tracking-wider uppercase',
    md: 'text-[11px] px-2.5 py-0.5 font-medium tracking-wide',
  };

  const variantStyles = {
    primary: 'bg-[#C4A484]/15 text-[#C4A484] border-[#C4A484]/30',
    secondary: 'bg-white/5 text-zinc-300 border-white/10',
    success: 'bg-emerald-950/40 text-emerald-300 border-emerald-500/25',
    warning: 'bg-amber-950/40 text-[#C4A484] border-[#C4A484]/30',
    danger: 'bg-red-950/40 text-red-300 border-red-500/25',
    info: 'bg-cyan-950/40 text-cyan-300 border-cyan-500/25',
    neutral: 'bg-white/5 text-zinc-400 border-white/10',
  };

  const dotColors = {
    primary: 'bg-[#C4A484]',
    secondary: 'bg-zinc-400',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-red-400',
    info: 'bg-cyan-400',
    neutral: 'bg-zinc-500',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border whitespace-nowrap ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
      <span>{children}</span>
    </span>
  );
};
