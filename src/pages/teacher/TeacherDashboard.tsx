import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { QRAttendanceModal } from '../../components/smart/QRAttendanceModal';
import { EarlyWarningBanner } from '../../components/smart/EarlyWarningBanner';
import {
  Users,
  Layers,
  CalendarCheck2,
  FileText,
  QrCode,
  Plus,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Clock,
} from 'lucide-react';

export const TeacherDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // QR Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedClassForQr, setSelectedClassForQr] = useState<any>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/teacher/dashboard');
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load teacher dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleLaunchQR = (cls: any) => {
    setSelectedClassForQr(cls);
    setQrModalOpen(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <SkeletonLoader variant="card" count={4} />
        </div>
        <SkeletonLoader variant="table" count={5} />
      </div>
    );
  }

  const { overview, todayClasses, pendingGrading, earlyWarnings } = stats || {};

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Faculty Workspace & Dashboard
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your classroom sessions, live QR attendance, and student evaluations
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/teacher/assignments')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Assignment
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/teacher/attendance')}
            leftIcon={<QrCode className="w-4 h-4" />}
          >
            Take Attendance
          </Button>
        </div>
      </div>

      {/* Early Warning Banner */}
      {earlyWarnings && earlyWarnings.length > 0 && (
        <EarlyWarningBanner warnings={earlyWarnings} role="teacher" />
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Classes"
          value={overview?.totalClasses || 2}
          icon={<Layers className="w-6 h-6" />}
          accentColor="indigo"
          subtitle="CSE Batch 2024-2028"
        />

        <StatCard
          title="Total Students"
          value={overview?.totalStudents || 80}
          icon={<Users className="w-6 h-6" />}
          accentColor="blue"
          subtitle="Across 2 sections"
        />

        <StatCard
          title="Pending Submissions"
          value={overview?.pendingSubmissionsToGrade || 0}
          icon={<FileText className="w-6 h-6" />}
          accentColor="amber"
          subtitle="Awaiting grade evaluation"
        />

        <StatCard
          title="Average Attendance"
          value={`${overview?.averageAttendanceRate || 85}%`}
          icon={<CalendarCheck2 className="w-6 h-6" />}
          accentColor="emerald"
          change="Healthy rate (&ge; 75%)"
          changeType="positive"
        />
      </div>

      {/* Today's Schedule and Live QR Launch */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today's Classes */}
        <Card className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Today's Lecture Schedule</span>
            </h3>
            <Badge variant="primary">2 Lectures Today</Badge>
          </div>

          <div className="space-y-3">
            {(todayClasses || []).map((cls: any) => (
              <div
                key={cls.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      {cls.subjectName}
                    </span>
                    <Badge variant="neutral" size="sm">
                      {cls.className}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                    <span>{cls.time}</span>
                    <span>•</span>
                    <span>{cls.room}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleLaunchQR(cls)}
                    leftIcon={<QrCode className="w-3.5 h-3.5 text-blue-600" />}
                  >
                    Start QR Session
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/teacher/attendance')}
                  >
                    Manual Roster
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Pending Submissions Grading Queue */}
        <Card className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Submissions To Grade</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/teacher/assignments')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              All Assignments
            </Button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto">
            {(pendingGrading || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                All submitted coursework has been evaluated!
              </p>
            ) : (
              (pendingGrading || []).map((sub: any) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2 space-y-0.5">
                    <span className="font-bold text-slate-900 dark:text-white block truncate">
                      {sub.studentName}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                      {sub.assignmentTitle}
                    </span>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/teacher/assignments')}
                  >
                    Grade
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* QR Modal */}
      {selectedClassForQr && (
        <QRAttendanceModal
          isOpen={qrModalOpen}
          onClose={() => setQrModalOpen(false)}
          classId={selectedClassForQr.classId}
          className={selectedClassForQr.className}
          subjectId={selectedClassForQr.subjectId}
          subjectName={selectedClassForQr.subjectName}
        />
      )}
    </div>
  );
};
