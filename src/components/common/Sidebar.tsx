import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck2,
  FileText,
  Award,
  Bell,
  CreditCard,
  BarChart3,
  ShieldAlert,
  Settings,
  UserCheck,
  QrCode,
  Sparkles,
  Contact,
  LogOut,
  ChevronRight,
  TrendingUp,
  Layers,
  Clock,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Logo } from './Logo';
import { Badge } from '../ui/Badge';

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  onOpenAbout?: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: any;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onOpenAbout }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const adminNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Students', path: '/admin/students', icon: Users },
    { label: 'Teachers', path: '/admin/teachers', icon: GraduationCap },
    { label: 'Courses & Classes', path: '/admin/courses', icon: BookOpen },
    { label: 'Attendance', path: '/admin/attendance', icon: CalendarCheck2 },
    { label: 'Exams & Results', path: '/admin/exams', icon: Award },
    { label: 'Announcements', path: '/announcements', icon: Bell },
    { label: 'Fee Management', path: '/admin/fees', icon: CreditCard },
    { label: 'Reports & Analytics', path: '/admin/reports', icon: BarChart3 },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: ShieldAlert },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const teacherNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'My Students', path: '/teacher/students', icon: Users },
    { label: 'Attendance & QR', path: '/teacher/attendance', icon: CalendarCheck2 },
    { label: 'Assignments', path: '/teacher/assignments', icon: FileText },
    { label: 'Exams & Results', path: '/teacher/exams', icon: Award },
    { label: 'Class Insights', path: '/teacher/insights', icon: TrendingUp, badge: 'Smart' },
    { label: 'Announcements', path: '/announcements', icon: Bell },
  ];

  const studentNavItems: NavItem[] = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Attendance Risk', path: '/student/attendance', icon: CalendarCheck2, badge: 'Risk' },
    { label: 'Assignments', path: '/student/assignments', icon: FileText },
    { label: 'Exams & Results', path: '/student/exams', icon: Award },
    { label: 'Fee Invoices', path: '/student/fees', icon: CreditCard },
    { label: 'Digital Student ID', path: '/student/id-card', icon: Contact },
    { label: 'Badges & Merit', path: '/student/badges', icon: Sparkles, badge: 'XP' },
    { label: 'Announcements', path: '/announcements', icon: Bell },
  ];

  const navItems =
    user.role === 'admin'
      ? adminNavItems
      : user.role === 'teacher'
      ? teacherNavItems
      : studentNavItems;

  const roleLabel = {
    admin: 'Administrator',
    teacher: 'Faculty / Teacher',
    student: 'Student Portal',
  };

  const roleBadgeVariant = {
    admin: 'danger' as const,
    teacher: 'secondary' as const,
    student: 'primary' as const,
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-[#0D0D0F] border-r border-slate-200 dark:border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <Logo size="md" showTagline={true} />
        </div>

        {/* User Role Banner */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-[#121214] border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-white/15 shrink-0"
            />
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-zinc-100 truncate">
                {user.name}
              </div>
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider">
                {roleLabel[user.role]}
              </div>
            </div>
          </div>
          <Badge variant={roleBadgeVariant[user.role]} size="sm">
            {user.role}
          </Badge>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto no-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-medium tracking-[0.2em] text-zinc-500 uppercase">
            Platform Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs transition-all duration-150 group ${
                    isActive
                      ? 'bg-[#18181B] text-[#C4A484] border-l-2 border-[#C4A484] font-semibold'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive
                            ? 'text-[#C4A484]'
                            : 'text-zinc-500 group-hover:text-zinc-300'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded uppercase ${
                          isActive
                            ? 'bg-[#C4A484]/20 text-[#C4A484] border border-[#C4A484]/30'
                            : 'bg-white/5 text-zinc-400 border border-white/5'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer & Actions */}
        <div className="p-3 border-t border-slate-100 dark:border-white/10 space-y-1.5">
          {onOpenAbout && (
            <button
              onClick={onOpenAbout}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <HelpCircle className="w-4 h-4 text-zinc-500" />
                <span>System Specifications</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <div className="pt-2 text-center">
            <p className="text-[10px] text-zinc-500">
              Developed by <span className="font-serif text-[#C4A484]">Sonam Pal</span>
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
