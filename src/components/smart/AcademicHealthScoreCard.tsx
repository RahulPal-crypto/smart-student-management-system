import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { AcademicHealthData } from '../../types';
import { Activity, Award, CheckCircle2, AlertCircle, Sparkles, BookCheck } from 'lucide-react';

interface AcademicHealthScoreCardProps {
  healthData: AcademicHealthData;
  className?: string;
}

export const AcademicHealthScoreCard: React.FC<AcademicHealthScoreCardProps> = ({
  healthData,
  className = '',
}) => {
  const statusBadges = {
    Excellent: 'success' as const,
    Good: 'primary' as const,
    'Needs Attention': 'warning' as const,
    Critical: 'danger' as const,
  };

  const scoreColor =
    healthData.score >= 85
      ? 'text-emerald-600 dark:text-emerald-400'
      : healthData.score >= 70
      ? 'text-blue-600 dark:text-blue-400'
      : healthData.score >= 50
      ? 'text-amber-600 dark:text-amber-400'
      : 'text-red-600 dark:text-red-400';

  return (
    <Card className={`space-y-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Academic Health Score</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Multi-Factor Weighted Index
            </p>
          </div>
        </div>
        <Badge variant={statusBadges[healthData.status] || 'primary'} dot={true}>
          {healthData.status}
        </Badge>
      </div>

      {/* Main Score Center */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-cyan-50/60 dark:from-slate-800/80 dark:via-slate-800/40 dark:to-slate-900 border border-blue-100 dark:border-slate-800">
        <div className="flex items-baseline gap-2">
          <span className={`text-4xl lg:text-5xl font-black tracking-tight ${scoreColor}`}>
            {healthData.score}
          </span>
          <span className="text-sm font-bold text-slate-400 dark:text-slate-500">/ 100</span>
        </div>

        <div className="sm:max-w-md">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            {healthData.summary}
          </p>
        </div>
      </div>

      {/* 4 Contributing Factors Breakdown */}
      <div className="space-y-3 pt-1">
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
          Contributing Factors Breakdown
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {/* Factor 1: Attendance */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Attendance (30%)</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {healthData.factors.attendance.score}/100
              </span>
            </div>
            <ProgressBar value={healthData.factors.attendance.score} color="blue" size="sm" showValueText={false} />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {healthData.factors.attendance.comment}
            </p>
          </div>

          {/* Factor 2: Assignments */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Assignments (35%)</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {healthData.factors.assignments.score}/100
              </span>
            </div>
            <ProgressBar value={healthData.factors.assignments.score} color="indigo" size="sm" showValueText={false} />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {healthData.factors.assignments.comment}
            </p>
          </div>

          {/* Factor 3: Exams */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Exam Performance (25%)</span>
              <span className="font-semibold text-purple-600 dark:text-purple-400">
                {healthData.factors.exams.score}/100
              </span>
            </div>
            <ProgressBar value={healthData.factors.exams.score} color="indigo" size="sm" showValueText={false} />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {healthData.factors.exams.comment}
            </p>
          </div>

          {/* Factor 4: Consistency & Streak */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white">Consistency (10%)</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {healthData.factors.consistency.score}/100
              </span>
            </div>
            <ProgressBar value={healthData.factors.consistency.score} color="emerald" size="sm" showValueText={false} />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {healthData.factors.consistency.comment}
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {healthData.recommendations && healthData.recommendations.length > 0 && (
        <div className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900 text-xs space-y-1.5">
          <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
            <BookCheck className="w-3.5 h-3.5" />
            Recommended Actionable Step:
          </span>
          <p className="text-slate-700 dark:text-slate-300">
            {healthData.recommendations[0]}
          </p>
        </div>
      )}
    </Card>
  );
};
