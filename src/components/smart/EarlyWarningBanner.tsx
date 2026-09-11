import React from 'react';
import { AlertTriangle, ShieldAlert, ChevronRight, UserCheck } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { useNavigate } from 'react-router-dom';

interface WarningStudent {
  studentId: string;
  name: string;
  studentIdNumber: string;
  issue: string;
  riskPercent: number;
}

interface EarlyWarningBannerProps {
  warnings: WarningStudent[];
  role: 'admin' | 'teacher';
}

export const EarlyWarningBanner: React.FC<EarlyWarningBannerProps> = ({ warnings, role }) => {
  const navigate = useNavigate();

  if (!warnings || warnings.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 via-amber-500/10 to-orange-500/10 border border-red-200 dark:border-red-900/60 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-900 dark:text-red-300 flex items-center gap-1.5">
              <span>Early Warning System Active</span>
              <span className="animate-pulse w-2 h-2 rounded-full bg-red-500" />
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {warnings.length} student{warnings.length === 1 ? '' : 's'} require immediate academic intervention
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate(role === 'admin' ? '/admin/attendance' : '/teacher/insights')}
          className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 flex items-center gap-1 cursor-pointer"
        >
          <span>View All Risks</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
        {warnings.slice(0, 3).map((w) => (
          <div
            key={w.studentId}
            className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-red-100 dark:border-red-950 flex items-center justify-between text-xs"
          >
            <div className="min-w-0 pr-2">
              <span className="font-bold text-slate-900 dark:text-white truncate block">
                {w.name}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                {w.issue}
              </span>
            </div>
            <Badge variant="danger" size="sm">
              {w.riskPercent}%
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
};
