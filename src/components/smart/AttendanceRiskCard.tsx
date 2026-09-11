import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { AttendanceRiskData } from '../../types';
import { AlertTriangle, CheckCircle2, ShieldAlert, Info, TrendingUp } from 'lucide-react';

interface AttendanceRiskCardProps {
  riskData: AttendanceRiskData;
  className?: string;
}

export const AttendanceRiskCard: React.FC<AttendanceRiskCardProps> = ({
  riskData,
  className = '',
}) => {
  const statusConfig = {
    SAFE: {
      badgeVariant: 'success' as const,
      color: 'emerald' as const,
      icon: CheckCircle2,
      label: 'Safe Tier',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900',
    },
    WARNING: {
      badgeVariant: 'warning' as const,
      color: 'amber' as const,
      icon: AlertTriangle,
      label: 'Borderline Warning',
      bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900',
    },
    'AT RISK': {
      badgeVariant: 'danger' as const,
      color: 'red' as const,
      icon: ShieldAlert,
      label: 'At Risk (< 75%)',
      bgColor: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900',
    },
    CRITICAL: {
      badgeVariant: 'danger' as const,
      color: 'red' as const,
      icon: ShieldAlert,
      label: 'Critical (< 60%)',
      bgColor: 'bg-red-100 dark:bg-red-950/70 border-red-300 dark:border-red-800',
    },
  };

  const currentConfig = statusConfig[riskData.status] || statusConfig.SAFE;
  const StatusIcon = currentConfig.icon;

  return (
    <Card className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Smart Attendance Risk
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Required Threshold: {riskData.requiredPercent}%
            </p>
          </div>
        </div>
        <Badge variant={currentConfig.badgeVariant} dot={true}>
          {riskData.status}
        </Badge>
      </div>

      {/* Main Stats Row */}
      <div className={`p-4 rounded-xl border ${currentConfig.bgColor} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-full bg-white dark:bg-slate-900 shadow-xs">
            <StatusIcon className={`w-6 h-6 text-${currentConfig.color}-600 dark:text-${currentConfig.color}-400`} />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {riskData.currentPercent}%
            </div>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
              {riskData.statusExplanation}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 sm:border-l sm:border-slate-200 dark:sm:border-slate-700/60 sm:pl-6 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Attended</span>
            <span className="font-bold text-slate-900 dark:text-white text-base">
              {riskData.attendedClasses}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Missed</span>
            <span className="font-bold text-slate-900 dark:text-white text-base">
              {riskData.missedClasses}
            </span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block">Total</span>
            <span className="font-bold text-slate-900 dark:text-white text-base">
              {riskData.totalClasses}
            </span>
          </div>
        </div>
      </div>

      {/* Dynamic Calculations */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
            Classes Needed to Reach {riskData.requiredPercent}%
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {riskData.classesNeededToReachThreshold > 0 ? (
              <span className="text-red-600 dark:text-red-400">
                +{riskData.classesNeededToReachThreshold} classes
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400">
                0 (Already on target)
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Calculated consecutively based on mathematical attendance ratio.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
            Safe Absence Buffer
          </span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {riskData.maxClassesCanMiss > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400">
                {riskData.maxClassesCanMiss} classes
              </span>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">
                0 classes remaining
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Maximum lectures you can miss while maintaining &ge; {riskData.requiredPercent}%.
          </p>
        </div>
      </div>
    </Card>
  );
};
