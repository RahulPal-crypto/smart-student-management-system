import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className={`flex items-center p-1 bg-white/5 dark:bg-[#141416] rounded-lg border border-slate-200 dark:border-white/10 ${className}`}>
      <button
        onClick={() => setTheme('light')}
        className={`p-1.5 rounded transition-colors cursor-pointer ${
          theme === 'light'
            ? 'bg-[#C4A484] text-[#0A0A0A] shadow-xs'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
        title="Light Mode"
        aria-label="Light mode"
      >
        <Sun className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-1.5 rounded transition-colors cursor-pointer ${
          theme === 'dark'
            ? 'bg-[#C4A484] text-[#0A0A0A] shadow-xs'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
        title="Dark Mode"
        aria-label="Dark mode"
      >
        <Moon className="w-3.5 h-3.5" />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-1.5 rounded transition-colors cursor-pointer ${
          theme === 'system'
            ? 'bg-[#C4A484] text-[#0A0A0A] shadow-xs'
            : 'text-zinc-500 hover:text-zinc-300'
        }`}
        title="System Preference"
        aria-label="System mode"
      >
        <Monitor className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
