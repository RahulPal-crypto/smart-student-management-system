import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatCard } from '../../components/ui/StatCard';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { AcademicHealthScoreCard } from '../../components/smart/AcademicHealthScoreCard';
import { AttendanceRiskCard } from '../../components/smart/AttendanceRiskCard';
import { EarlyWarningBanner } from '../../components/smart/EarlyWarningBanner';
import { QRScannerModal } from '../../components/smart/QRScannerModal';
import { DigitalIdCardModal } from '../../components/smart/DigitalIdCardModal';
import {
  CalendarCheck2,
  Award,
  BookOpen,
  FileText,
  QrCode,
  CreditCard,
  IdCard,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [scannerOpen, setScannerOpen] = useState(false);
  const [idCardOpen, setIdCardOpen] = useState(false);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/student/dashboard');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load student dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleScanSuccess = () => {
    fetchDashboard();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <SkeletonLoader variant="card" count={4} />
        </div>
        <SkeletonLoader variant="card" count={2} />
      </div>
    );
  }

  const {
    studentProfile,
    attendanceRisk,
    academicHealth,
    upcomingExams,
    pendingAssignments,
    badges,
    earlyWarnings,
  } = data || {};

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Profile Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-white/30 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight">
                Welcome back, {user?.name || 'Alex'}!
              </h1>
              <Badge variant="neutral" size="sm" className="bg-white/20 text-white border-0">
                Sem 4
              </Badge>
            </div>
            <p className="text-xs text-blue-100 mt-0.5">
              Roll No: <span className="font-mono font-bold">{studentProfile?.studentIdNumber || 'STU2024041'}</span> • {studentProfile?.courseName || 'Computer Science & Eng.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIdCardOpen(true)}
            leftIcon={<IdCard className="w-4 h-4 text-slate-800" />}
            className="bg-white text-slate-900 hover:bg-slate-100"
          >
            Digital ID Card
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setScannerOpen(true)}
            leftIcon={<QrCode className="w-4 h-4" />}
            className="bg-blue-500 hover:bg-blue-400 text-white border-0 shadow-md"
          >
            Scan Class QR
          </Button>
        </div>
      </div>

      {/* Early Warning Banner */}
      {earlyWarnings && earlyWarnings.length > 0 && (
        <EarlyWarningBanner warnings={earlyWarnings} role="student" />
      )}

      {/* Primary Smart Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Risk Engine Card */}
        <div className="lg:col-span-6">
          <AttendanceRiskCard
            overallPercent={attendanceRisk?.currentPercent || 88}
            status={attendanceRisk?.status || 'SAFE'}
            classesNeeded={attendanceRisk?.classesNeededToReachThreshold || 0}
            maxCanMiss={attendanceRisk?.maxClassesCanMiss || 4}
            subjectBreakdown={attendanceRisk?.subjectBreakdown || []}
            onActionClick={() => navigate('/student/attendance')}
          />
        </div>

        {/* Academic Health Composite Score Card */}
        <div className="lg:col-span-6">
          <AcademicHealthScoreCard
            overallScore={academicHealth?.overallScore || 88}
            tier={academicHealth?.tier || 'Excellent'}
            percentileRank={academicHealth?.percentileRank || 92}
            factorScores={
              academicHealth?.factors || {
                attendanceScore: 88,
                assignmentScore: 89,
                examScore: 92,
                consistencyScore: 85,
              }
            }
            recommendations={academicHealth?.recommendations || []}
          />
        </div>
      </div>

      {/* Action Modules: Assignments, Upcoming Exams & Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pending Assignments */}
        <Card className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Pending Coursework Tasks</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/student/assignments')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              View All
            </Button>
          </div>

          <div className="space-y-3">
            {(pendingAssignments || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                All assignments submitted! You are fully caught up.
              </p>
            ) : (
              (pendingAssignments || []).map((asg: any) => (
                <div
                  key={asg.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white block truncate">
                      {asg.title}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <span>{asg.subjectName}</span>
                      <span>•</span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Due {asg.dueDate}
                      </span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate('/student/assignments')}
                  >
                    Submit
                  </Button>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Examinations */}
        <Card className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>Upcoming Semester Exams</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/student/exams')}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Exam Hall
            </Button>
          </div>

          <div className="space-y-3">
            {(upcomingExams || []).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No active exam schedules published.
              </p>
            ) : (
              (upcomingExams || []).map((ex: any) => (
                <div
                  key={ex.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {ex.title}
                    </span>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{ex.subjectName}</span>
                      <span>•</span>
                      <span>{ex.date} ({ex.startTime})</span>
                    </div>
                  </div>

                  <Badge variant="primary" size="sm">
                    {ex.roomNumber}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />

      {/* Digital ID Card Modal */}
      {studentProfile && (
        <DigitalIdCardModal
          isOpen={idCardOpen}
          onClose={() => setIdCardOpen(false)}
          student={studentProfile}
        />
      )}
    </div>
  );
};
