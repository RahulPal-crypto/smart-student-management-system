import React from 'react';
import { Menu, Bell, Search, Sparkles, User, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { ThemeToggle } from './ThemeToggle';
import { Badge } from '../ui/Badge';
import { useNavigate } from 'react-router-dom';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenNotifications: () => void;
  onOpenAbout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  onOpenNotifications,
  onOpenAbout,
}) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  if (!user) return null;

  const profilePath =
    user.role === 'admin'
      ? '/admin/settings'
      : user.role === 'teacher'
      ? '/teacher/classes'
      : '/student/profile';

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-[#0A0A0A]/90 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 lg:px-8 flex items-center justify-between transition-colors">
      {/* Left items */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 lg:hidden cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
          <span className="font-serif text-white tracking-wide">
            Apex Institute of Technology
          </span>
          <span className="text-zinc-600">•</span>
          <span className="capitalize text-zinc-400 tracking-wider text-[11px] uppercase">{user.role} Workspace</span>
        </div>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications Button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#C4A484] text-[10px] font-bold text-[#0A0A0A]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User profile avatar / pill */}
        <button
          onClick={() => navigate(profilePath)}
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:dark:bg-white/10 transition-colors cursor-pointer"
        >
          <img
            src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
            alt={user.name}
            className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-white/15"
          />
          <span className="text-xs font-medium text-slate-800 dark:text-zinc-200 hidden md:inline truncate max-w-[120px]">
            {user.name}
          </span>
        </button>
      </div>
    </header>
  );
};
