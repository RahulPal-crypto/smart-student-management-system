import React from 'react';
import { GraduationCap, Sparkles } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const titleSizes = {
    sm: 'text-sm font-serif',
    md: 'text-base font-serif',
    lg: 'text-xl font-serif',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div className={`relative flex items-center justify-center rounded-lg bg-[#18181A] border border-[#C4A484]/40 text-[#C4A484] shadow-[0_0_12px_rgba(196,164,132,0.15)] shrink-0 ${iconSizes[size]}`}>
        <GraduationCap className={size === 'lg' ? 'w-5 h-5' : size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
        <span className="absolute -top-1 -right-1 flex h-2 w-2">
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C4A484]"></span>
        </span>
      </div>
      <div>
        <div className={`tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 ${titleSizes[size]}`}>
          <span className="font-semibold tracking-widest text-zinc-100">SMART</span>
          <span className="text-[#C4A484] font-serif italic font-bold">SMS</span>
        </div>
        {showTagline && (
          <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-[0.18em]">
            Institutional Portal
          </p>
        )}
      </div>
    </div>
  );
};
