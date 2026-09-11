import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { QRAttendanceModal } from '../../components/smart/QRAttendanceModal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import {
  CalendarCheck2,
  QrCode,
  CheckCircle2,
  XCircle,
  Clock,
  Save,
  Check,
  RotateCcw,
} from 'lucide-react';

export const TeacherAttendancePage: React.FC = () => {
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('cls-1');
  const [selectedSubjectId, setSelectedSubjectId] = useState('sub-dbms');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  const [students, setStudents] = useState<any[]>([]);
  const [roster, setRoster] = useState<Record<string, 'Present' | 'Absent' | 'Late' | 'Leave'>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch initial classes and students
  const fetchClassesAndStudents = async () => {
    setLoading(true);
    try {
      const clsRes: any = await api.get('/teacher/classes');
      if (clsRes && clsRes.success && clsRes.data) {
        const clsList = Array.isArray(clsRes.data)
          ? clsRes.data
          : Array.isArray(clsRes.data.classes)
          ? clsRes.data.classes
          : [];
        setClasses(clsList);
      }

      const stuRes: any = await api.get(`/teacher/students?classId=${selectedClassId}`);
      if (stuRes && stuRes.success && stuRes.data) {
        const stuList = Array.isArray(stuRes.data)
          ? stuRes.data
          : Array.isArray(stuRes.data.students)
          ? stuRes.data.students
          : [];
        setStudents(stuList);
        const initialRoster: Record<string, 'Present' | 'Absent' | 'Late' | 'Leave'> = {};
        stuList.forEach((s: any) => {
          if (s && s.id) initialRoster[s.id] = 'Present';
        });
        setRoster(initialRoster);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error('Failed to load class roster:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassesAndStudents();
  }, [selectedClassId]);

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Leave') => {
    setRoster((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: 'Present' | 'Absent') => {
    const updated: Record<string, 'Present' | 'Absent' | 'Late' | 'Leave'> = {};
    const stuList = Array.isArray(students) ? students : [];
    stuList.forEach((s) => {
      if (s && s.id) updated[s.id] = status;
    });
    setRoster(updated);
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const records = Object.entries(roster).map(([studentId, status]) => ({
        studentId,
        status,
        method: 'Manual',
      }));

      await api.post('/teacher/attendance', {
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        date: attendanceDate,
        records,
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance roster.');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = Object.values(roster).filter((s) => s === 'Present').length;
  const absentCount = Object.values(roster).filter((s) => s === 'Absent').length;
  const lateCount = Object.values(roster).filter((s) => s === 'Late').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Classroom Attendance & Live QR Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Launch dynamic QR check-ins or mark student roll-call manual rosters
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setQrModalOpen(true)}
          leftIcon={<QrCode className="w-4 h-4" />}
        >
          Launch Live QR Session
        </Button>
      </div>

      {/* Control Filters */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-4">
            <Select
              label="Select Class"
              options={[
                { value: 'cls-1', label: 'B.Tech CSE - 4th Sem (Sec A)' },
                { value: 'cls-2', label: 'B.Tech CSE - 6th Sem (Sec A)' },
              ]}
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
            />
          </div>
          <div className="sm:col-span-4">
            <Select
              label="Subject / Lecture"
              options={[
                { value: 'sub-dbms', label: 'Database Management Systems' },
                { value: 'sub-dsa', label: 'Data Structures & Algorithms' },
              ]}
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
            />
          </div>
          <div className="sm:col-span-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Lecture Date
            </label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </Card>

      {/* Roster Controls & Counters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4 text-xs font-semibold">
          <span className="text-emerald-600 dark:text-emerald-400">
            {presentCount} Present
          </span>
          <span>•</span>
          <span className="text-red-600 dark:text-red-400">
            {absentCount} Absent
          </span>
          <span>•</span>
          <span className="text-amber-600 dark:text-amber-400">
            {lateCount} Late
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMarkAll('Present')}
          >
            Mark All Present
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleMarkAll('Absent')}
          >
            Mark All Absent
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>Attendance records updated and committed to ledger!</span>
        </div>
      )}

      {/* Roster Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader variant="table" count={5} />
          </div>
        ) : (
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Roll Number</th>
                <th className="py-3.5 px-4">Current Attendance %</th>
                <th className="py-3.5 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {students.map((s) => {
                const currentStatus = roster[s.id] || 'Present';
                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <span className="font-bold text-slate-900 dark:text-white">
                          {s.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-600 dark:text-slate-300">
                      {s.studentIdNumber}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">
                      {s.attendancePercent || 85}%
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        {(['Present', 'Absent', 'Late', 'Leave'] as const).map((st) => (
                          <button
                            key={st}
                            type="button"
                            onClick={() => handleStatusChange(s.id, st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              currentStatus === st
                                ? st === 'Present'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : st === 'Absent'
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : st === 'Late'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'bg-indigo-600 text-white shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Card>

      {/* Save Button Bar */}
      <div className="flex justify-end pt-2">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSaveAttendance}
          isLoading={saving}
          leftIcon={<Save className="w-4 h-4" />}
        >
          Save & Submit Roster
        </Button>
      </div>

      {/* QR Modal */}
      <QRAttendanceModal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        classId={selectedClassId}
        className="B.Tech CSE - 4th Sem (Sec A)"
        subjectId={selectedSubjectId}
        subjectName="Database Management Systems"
      />
    </div>
  );
};
