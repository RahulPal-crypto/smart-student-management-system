import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { AttendanceRiskCard } from '../../components/smart/AttendanceRiskCard';
import { QRScannerModal } from '../../components/smart/QRScannerModal';
import {
  CalendarCheck2,
  QrCode,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

export const StudentAttendancePage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scannerOpen, setScannerOpen] = useState(false);

  // Absence simulator state
  const [hypotheticalMiss, setHypotheticalMiss] = useState<number>(1);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/student/attendance');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  if (loading) {
    return <SkeletonLoader variant="table" count={8} />;
  }

  const { overallStats, subjectBreakdown, recentLogs } = data || {};
  const currentPercent = overallStats?.overallPercent || 88;
  const totalClasses = overallStats?.totalLectures || 40;
  const attendedClasses = overallStats?.attendedLectures || 35;

  // Simulator calculation
  const simulatedTotal = totalClasses + hypotheticalMiss;
  const simulatedPercent = Math.round((attendedClasses / simulatedTotal) * 100);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Attendance Ledger & Risk Analyzer
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Subject-wise attendance tracking, compliance projections, and dynamic QR scanner
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setScannerOpen(true)}
          leftIcon={<QrCode className="w-4 h-4" />}
        >
          Scan Classroom QR
        </Button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Risk Engine Card */}
        <div className="lg:col-span-7">
          <AttendanceRiskCard
            overallPercent={currentPercent}
            status={overallStats?.status || 'SAFE'}
            classesNeeded={overallStats?.classesNeeded || 0}
            maxCanMiss={overallStats?.safeAbsencesRemaining || 4}
            subjectBreakdown={subjectBreakdown || []}
          />
        </div>

        {/* Predictive Absence Simulator */}
        <Card className="lg:col-span-5 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Absence Impact Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Calculate the exact effect of missing upcoming lectures on your compliance standing.
          </p>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                If I miss upcoming lectures:
              </span>
              <span className="font-bold font-mono text-blue-600 dark:text-blue-400 text-sm">
                {hypotheticalMiss} lecture{hypotheticalMiss > 1 ? 's' : ''}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="10"
              value={hypotheticalMiss}
              onChange={(e) => setHypotheticalMiss(Number(e.target.value))}
              className="w-full accent-blue-600 cursor-pointer"
            />

            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs text-slate-500">Projected Attendance:</span>
              <span
                className={`text-base font-black ${
                  simulatedPercent >= 75
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`}
              >
                {simulatedPercent}%{' '}
                <span className="text-[11px] font-normal">
                  ({simulatedPercent >= 75 ? 'Safe' : 'At Risk'})
                </span>
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Subject Wise Breakdown Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Subject-Wise Attendance Matrix
          </h3>
        </div>
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Subject</th>
              <th className="py-3.5 px-4">Instructor</th>
              <th className="py-3.5 px-4">Classes Held</th>
              <th className="py-3.5 px-4">Attended</th>
              <th className="py-3.5 px-4">Percentage</th>
              <th className="py-3.5 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {(subjectBreakdown || []).map((sub: any) => (
              <tr key={sub.subjectId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                  {sub.subjectName}
                </td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-medium">
                  {sub.teacherName || 'Faculty'}
                </td>
                <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                  {sub.totalClasses}
                </td>
                <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                  {sub.attendedClasses}
                </td>
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-2 max-w-[140px]">
                    <ProgressBar
                      value={sub.percentage}
                      color={sub.percentage >= 75 ? 'emerald' : 'red'}
                      size="sm"
                    />
                    <span className="font-bold shrink-0">{sub.percentage}%</span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <Badge
                    variant={sub.percentage >= 80 ? 'success' : sub.percentage >= 75 ? 'warning' : 'danger'}
                    size="sm"
                    dot
                  >
                    {sub.percentage >= 75 ? 'Compliant' : 'Risk'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Recent Attendance Session Logs */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Recent Attendance Session Logs
          </h3>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {(recentLogs || []).map((log: any) => (
            <div
              key={log.id}
              className="p-3.5 flex items-center justify-between text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    log.status === 'Present'
                      ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400'
                  }`}
                >
                  {log.status === 'Present' ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    {log.subjectName}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {log.date} • Method: {log.method}
                  </span>
                </div>
              </div>

              <Badge
                variant={log.status === 'Present' ? 'success' : 'danger'}
                size="sm"
              >
                {log.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={fetchAttendance}
      />
    </div>
  );
};
