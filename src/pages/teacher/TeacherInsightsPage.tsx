import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EarlyWarningBanner } from '../../components/smart/EarlyWarningBanner';
import { TrendingUp, Activity, Users, AlertTriangle, Sparkles, CheckCircle2 } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const TeacherInsightsPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/teacher/insights');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load class insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) {
    return <SkeletonLoader variant="table" count={6} />;
  }

  const { classRisks, overallAttendanceRate, earlyWarnings } = data || {};

  const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  const distribution = [
    { name: 'Safe (>= 80%)', value: classRisks.filter((r: any) => r.status === 'SAFE').length },
    { name: 'Warning (75-79%)', value: classRisks.filter((r: any) => r.status === 'WARNING').length },
    { name: 'At Risk (< 75%)', value: classRisks.filter((r: any) => r.status === 'AT RISK').length },
    { name: 'Critical (< 60%)', value: classRisks.filter((r: any) => r.status === 'CRITICAL').length },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Classroom Analytics & Smart Insights</span>
            <Sparkles className="w-5 h-5 text-cyan-500" />
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Predictive student risk metrics, attendance trajectories, and intervention alerts
          </p>
        </div>
      </div>

      {/* Early Warning Banner */}
      {earlyWarnings && earlyWarnings.length > 0 && (
        <EarlyWarningBanner warnings={earlyWarnings} role="teacher" />
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Risk Breakdown */}
        <Card className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>Student Attendance Tiers</span>
            </h3>
            <Badge variant="primary">{overallAttendanceRate}% Batch Avg</Badge>
          </div>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  nameKey="name"
                >
                  {distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {distribution.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span className="text-slate-600 dark:text-slate-300">
                  {d.name}: <strong className="text-slate-900 dark:text-white">{d.value}</strong>
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Student Risk Details Table */}
        <Card className="lg:col-span-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Students Requiring Intervention</span>
          </h3>

          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {classRisks.filter((r: any) => r.status !== 'SAFE').length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-75" />
                <span>All enrolled students are above the 75% attendance threshold!</span>
              </div>
            ) : (
              classRisks
                .filter((r: any) => r.status !== 'SAFE')
                .map((r: any) => (
                  <div
                    key={r.studentId}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {r.studentName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {r.studentIdNumber} • Attended {r.attendedClasses}/{r.totalClasses}
                      </span>
                    </div>

                    <div className="text-right space-y-1">
                      <Badge
                        variant={r.status === 'CRITICAL' ? 'danger' : 'warning'}
                        size="sm"
                        dot
                      >
                        {r.currentPercent}%
                      </Badge>
                      <span className="text-[10px] text-red-600 dark:text-red-400 block font-medium">
                        +{r.classesNeededToReachThreshold} lectures needed
                      </span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
