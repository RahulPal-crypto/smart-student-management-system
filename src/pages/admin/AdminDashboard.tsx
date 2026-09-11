import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EarlyWarningBanner } from '../../components/smart/EarlyWarningBanner';
import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck2,
  CreditCard,
  ShieldAlert,
  Plus,
  Bell,
  Download,
  Activity,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
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
  Legend,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/dashboard');
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <SkeletonLoader variant="card" count={4} />
        </div>
        <SkeletonLoader variant="table" count={5} />
      </div>
    );
  }

  const { overview, charts, earlyWarnings, recentAuditLogs } = stats || {};

  const COLORS = ['#2563eb', '#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Institutional Control Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time analytics, risk indicators, and operations monitoring
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/reports')}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export Reports
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/announcements')}
            leftIcon={<Bell className="w-4 h-4" />}
          >
            Broadcast
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin/students')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Student
          </Button>
        </div>
      </div>

      {/* Early Warning Banner */}
      {earlyWarnings && earlyWarnings.length > 0 && (
        <EarlyWarningBanner warnings={earlyWarnings} role="admin" />
      )}

      {/* Key Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Students"
          value={overview?.totalStudents || 0}
          icon={<Users className="w-6 h-6" />}
          accentColor="blue"
          change="+12% this semester"
          changeType="positive"
        />

        <StatCard
          title="Faculty Members"
          value={overview?.totalTeachers || 0}
          icon={<GraduationCap className="w-6 h-6" />}
          accentColor="indigo"
          subtitle="4 Active Departments"
        />

        <StatCard
          title="Overall Attendance"
          value={`${overview?.overallAttendancePercent || 86}%`}
          icon={<CalendarCheck2 className="w-6 h-6" />}
          accentColor={
            (overview?.overallAttendancePercent || 0) < 75 ? 'red' : 'emerald'
          }
          change={
            (overview?.overallAttendancePercent || 0) < 75
              ? 'Below target (75%)'
              : 'Target Met'
          }
          changeType={
            (overview?.overallAttendancePercent || 0) < 75 ? 'negative' : 'positive'
          }
        />

        <StatCard
          title="Fee Collection"
          value={`$${Number(overview?.feeCollectionTotal || 162000).toLocaleString()}`}
          icon={<CreditCard className="w-6 h-6" />}
          accentColor="cyan"
          subtitle="92% Paid Rate"
        />
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Trend Chart */}
        <Card className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span>Attendance Trend & Risk Trajectory</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Monthly institution-wide lecture attendance averages
              </p>
            </div>
            <Badge variant="primary">Target: 75%</Badge>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts?.attendanceTrend || []}>
                <defs>
                  <linearGradient id="attendanceColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <YAxis domain={[50, 100]} tick={{ fontSize: 12 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="rate"
                  name="Attendance %"
                  stroke="#2563eb"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#attendanceColor)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Academic Health Breakdown Chart */}
        <Card className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span>Student Health Tiers</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Multi-factor composite scoring
              </p>
            </div>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={charts?.academicHealthDistribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="tier"
                >
                  {(charts?.academicHealthDistribution || []).map((entry: any, index: number) => (
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

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            {(charts?.academicHealthDistribution || []).map((tier: any, i: number) => (
              <div key={tier.tier} className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-slate-600 dark:text-slate-300 truncate">
                  {tier.tier}: <strong className="text-slate-900 dark:text-white">{tier.count}</strong>
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Second Row: Department Distribution & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Enrollment Bar Chart */}
        <Card className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Department Enrollment
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Active student distribution by discipline
              </p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.departmentEnrollment || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="department" tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '12px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="students" name="Students" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Live Security Audit Log Stream */}
        <Card className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-cyan-600" />
                <span>System Security & Audit Feed</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live immutable audit logs of role activities
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/audit-logs')}
              rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
            >
              View Full Trail
            </Button>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {recentAuditLogs?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No logs recorded yet.</p>
            ) : (
              recentAuditLogs?.slice(0, 5).map((log: any) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start justify-between text-xs"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white truncate">
                        {log.userName}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {log.action}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                      {log.details}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
