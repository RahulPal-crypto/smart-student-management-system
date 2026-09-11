import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.99] select-none cursor-pointer';

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5',
  };

  const variantStyles = {
    primary: 'bg-[#C4A484] hover:bg-[#B39373] text-[#0A0A0A] font-semibold border border-[#C4A484] shadow-[0_0_12px_rgba(196,164,132,0.2)] focus:ring-[#C4A484]',
    secondary: 'bg-[#18181A] hover:bg-[#222226] text-white border border-white/15 focus:ring-zinc-500',
    outline: 'bg-transparent text-zinc-200 border border-white/15 hover:bg-white/5 hover:border-white/30 focus:ring-zinc-400',
    danger: 'bg-red-600/90 hover:bg-red-600 text-white shadow-sm focus:ring-red-500 border border-red-500/40',
    success: 'bg-emerald-600/90 hover:bg-emerald-600 text-white shadow-sm focus:ring-emerald-500 border border-emerald-500/40',
    ghost: 'bg-transparent text-zinc-400 hover:text-white hover:bg-white/5 focus:ring-zinc-400',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  );
};
