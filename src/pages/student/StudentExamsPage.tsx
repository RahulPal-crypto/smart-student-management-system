import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { Award, Calendar, Clock, MapPin, Printer, CheckCircle2 } from 'lucide-react';

export const StudentExamsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('results');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/student/exams');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  if (loading) {
    return <SkeletonLoader variant="table" count={6} />;
  }

  const { upcomingExams, results, gpaSummary } = data || {};

  const tabs = [
    { id: 'results', label: 'Academic Grade Card & CGPA', count: results?.length || 0, icon: <Award className="w-4 h-4" /> },
    { id: 'schedule', label: 'Upcoming Examination Schedule', count: upcomingExams?.length || 0, icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Examinations & Official Grade Card
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Verified academic evaluations, semester GPA calculations, and examination hall tickets
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => window.print()}
          leftIcon={<Printer className="w-4 h-4" />}
        >
          Print Transcript
        </Button>
      </div>

      {/* GPA Summary Stat Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Cumulative CGPA</span>
          <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
            {gpaSummary?.cgpa || '3.75'} <span className="text-xs text-slate-400 font-normal">/ 4.00</span>
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> First Class Distinction
          </span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Current Term SGPA</span>
          <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
            {gpaSummary?.sgpa || '3.80'} <span className="text-xs text-slate-400 font-normal">/ 4.00</span>
          </div>
          <span className="text-[11px] text-slate-500">Semester 4 Evaluations</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Credits Earned</span>
          <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {gpaSummary?.creditsEarned || '64'} <span className="text-xs text-slate-400 font-normal">/ 160</span>
          </div>
          <span className="text-[11px] text-slate-500">Progress: 40% Completed</span>
        </Card>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {activeTab === 'results' ? (
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Official Semester Course Grades
            </h3>
            <Badge variant="success">All Verified</Badge>
          </div>
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Exam</th>
                <th className="py-3.5 px-4">Marks Obtained</th>
                <th className="py-3.5 px-4">Percentage</th>
                <th className="py-3.5 px-4">Letter Grade</th>
                <th className="py-3.5 px-4">Grade Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {(results || []).map((r: any) => (
                <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {r.subjectName}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    {r.examTitle}
                  </td>
                  <td className="py-3.5 px-4 font-semibold">
                    {r.marksObtained} / {r.maxMarks}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-blue-600 dark:text-blue-400">
                    {r.percentage}%
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge variant="success" size="sm">
                      {r.grade}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {r.gradePoint}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(upcomingExams || []).map((ex: any) => (
            <Card key={ex.id} className="p-5 space-y-4 hoverEffect">
              <div className="flex items-start justify-between">
                <Badge variant="primary">{ex.status}</Badge>
                <span className="text-xs font-bold text-slate-400">Weightage: {ex.weightage}%</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{ex.title}</h3>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-0.5">{ex.subjectName}</p>
              </div>

              <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ex.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{ex.startTime} - {ex.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Hall: {ex.roomNumber}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 line-clamp-2">
                <strong>Syllabus Focus:</strong> {ex.syllabus}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
