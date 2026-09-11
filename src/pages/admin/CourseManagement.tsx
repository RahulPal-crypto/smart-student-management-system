import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Course, ClassItem, Subject } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { BookOpen, Plus, Layers, BookCheck, Clock } from 'lucide-react';

export const CourseManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('courses');
  const [courses, setCourses] = useState<Course[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    department: 'Computer Science',
    duration: '4 Years (8 Semesters)',
    description: '',
    totalSemesters: 8,
    totalCredits: 160,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [crsRes, clsRes, subRes]: any = await Promise.all([
        api.get('/admin/courses'),
        api.get('/admin/classes'),
        api.get('/admin/subjects'),
      ]);
      if (crsRes && crsRes.success && crsRes.data) {
        setCourses(Array.isArray(crsRes.data) ? crsRes.data : (crsRes.data.courses || []));
      }
      if (clsRes && clsRes.success && clsRes.data) {
        setClasses(Array.isArray(clsRes.data) ? clsRes.data : (clsRes.data.classes || []));
      }
      if (subRes && subRes.success && subRes.data) {
        setSubjects(Array.isArray(subRes.data) ? subRes.data : (subRes.data.subjects || []));
      }
    } catch (err) {
      console.error('Failed to load courses data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/courses', courseForm);
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to create course');
    }
  };

  const tabs = [
    { id: 'courses', label: 'Degree Programs & Courses', count: courses.length, icon: <BookOpen className="w-4 h-4" /> },
    { id: 'classes', label: 'Active Class Sections', count: classes.length, icon: <Layers className="w-4 h-4" /> },
    { id: 'subjects', label: 'Curriculum Subjects', count: subjects.length, icon: <BookCheck className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Academic Programs & Courses
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage degree curricula, semester sections, and subject syllabi
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Program
        </Button>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {loading ? (
        <SkeletonLoader variant="table" count={4} />
      ) : activeTab === 'courses' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map((c) => (
            <Card key={c.id} className="space-y-4 hoverEffect">
              <div className="flex items-start justify-between">
                <Badge variant="primary">{c.code}</Badge>
                <Badge variant="success" size="sm">
                  {c.status}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {c.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {c.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Duration</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {c.duration}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Credits</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {c.totalCredits} Credits
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : activeTab === 'classes' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <Card key={cls.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {cls.name}
                </h3>
                <Badge variant="neutral">Sec {cls.section}</Badge>
              </div>

              <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Room:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{cls.roomNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Academic Term:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{cls.academicYear}</span>
                </div>
                <div className="flex justify-between">
                  <span>Enrolled Students:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{cls.totalStudents}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-4">Subject Name</th>
                <th className="p-4">Code</th>
                <th className="p-4">Semester</th>
                <th className="p-4">Credits</th>
                <th className="p-4">Faculty Instructor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {subjects.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{s.name}</td>
                  <td className="p-4 font-mono text-blue-600 dark:text-blue-400 font-semibold">{s.code}</td>
                  <td className="p-4">Sem {s.semester}</td>
                  <td className="p-4">{s.credits} Credits</td>
                  <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">{s.teacherName || 'Prof. Marcus Vance'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create Degree Program"
        subtitle="Define new institutional academic offering"
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <Input
            label="Program Code"
            value={courseForm.code}
            onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })}
            placeholder="e.g. BTECH-CSE"
            required
          />
          <Input
            label="Program Name"
            value={courseForm.name}
            onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
            placeholder="Bachelor of Technology in Computer Science"
            required
          />
          <Select
            label="Department"
            value={courseForm.department}
            options={[
              { value: 'Computer Science', label: 'Computer Science' },
              { value: 'Electrical Engineering', label: 'Electrical Engineering' },
              { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
            ]}
            onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Create Program
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
