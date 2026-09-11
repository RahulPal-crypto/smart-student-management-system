import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Exam, Result } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { Award, Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';

export const ExamManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('exams');
  const [exams, setExams] = useState<Exam[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/teacher/exams');
      if (res.success && res.data) {
        setExams(res.data.exams || []);
        setResults(res.data.results || []);
      }
    } catch (err) {
      console.error('Failed to load exams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const tabs = [
    { id: 'exams', label: 'Examinations Schedule', count: exams.length, icon: <Calendar className="w-4 h-4" /> },
    { id: 'results', label: 'Published Grade Roster', count: results.length, icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Examinations & Academic Grading
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Institutional exam schedules, syllabus coverage, and verified GPA distributions
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {loading ? (
        <SkeletonLoader variant="table" count={5} />
      ) : activeTab === 'exams' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map((e) => (
            <Card key={e.id} className="space-y-4 hoverEffect">
              <div className="flex items-start justify-between">
                <Badge variant={e.status === 'Upcoming' ? 'primary' : 'success'}>
                  {e.status}
                </Badge>
                <span className="text-xs font-bold text-slate-500">
                  Weight: {e.weightage}%
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {e.title}
                </h3>
                <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-0.5">
                  {e.subjectName}
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 p-3 rounded-xl bg-slate-50 dark:bg-slate-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{e.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{e.startTime} - {e.endTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{e.roomNumber}</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                <strong>Syllabus:</strong> {e.syllabus}
              </p>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Roll Number</th>
                <th className="p-4">Exam / Subject</th>
                <th className="p-4">Score</th>
                <th className="p-4">Percentage</th>
                <th className="p-4">Grade</th>
                <th className="p-4">GPA Point</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {results.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{r.studentName}</td>
                  <td className="p-4 font-mono">{r.studentIdNumber}</td>
                  <td className="p-4">
                    <div className="font-semibold">{r.subjectName}</div>
                    <div className="text-[11px] text-slate-400">{r.examTitle}</div>
                  </td>
                  <td className="p-4 font-bold">{r.marksObtained} / {r.maxMarks}</td>
                  <td className="p-4 font-bold text-blue-600 dark:text-blue-400">{r.percentage}%</td>
                  <td className="p-4">
                    <Badge variant="success" size="sm">{r.grade}</Badge>
                  </td>
                  <td className="p-4 font-bold">{r.gradePoint}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
};
