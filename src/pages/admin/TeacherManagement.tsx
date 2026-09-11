import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Teacher } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import { GraduationCap, Plus, Search, Mail, Phone, BookOpen } from 'lucide-react';

export const TeacherManagement: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    teacherIdNumber: `FAC${new Date().getFullYear()}${Math.floor(10 + Math.random() * 90)}`,
    phone: '+1 (555) 300-1122',
    department: 'Computer Science',
    qualification: 'Ph.D. in Computer Science',
    experienceYears: 6,
    subjects: ['sub-dbms'],
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/teachers');
      if (res && res.success && res.data) {
        const teacherList = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.teachers)
          ? res.data.teachers
          : [];
        setTeachers(teacherList);
      } else {
        setTeachers([]);
      }
    } catch (err) {
      console.error('Failed to load faculty:', err);
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      await api.post('/admin/teachers', formData);
      setIsModalOpen(false);
      fetchTeachers();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save faculty record.');
    } finally {
      setFormLoading(false);
    }
  };

  const teacherList = Array.isArray(teachers) ? teachers : [];
  const filteredTeachers = teacherList.filter((t) => {
    const tName = t?.name || '';
    const tEmail = t?.email || '';
    const tDept = t?.department || '';
    const matchesSearch =
      tName.toLowerCase().includes(search.toLowerCase()) ||
      tEmail.toLowerCase().includes(search.toLowerCase()) ||
      tDept.toLowerCase().includes(search.toLowerCase());
    const matchesDept = deptFilter === 'All' || tDept === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Faculty & Teacher Roster
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage instructors, department assignments, and course allocations
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Add Faculty Member
        </Button>
      </div>

      {/* Filter and Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8">
            <Input
              placeholder="Search faculty by name, email, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="sm:col-span-4">
            <Select
              options={[
                { value: 'All', label: 'All Departments' },
                { value: 'Computer Science', label: 'Computer Science' },
                { value: 'Electrical Engineering', label: 'Electrical Engineering' },
                { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
              ]}
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Faculty Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonLoader variant="card" count={6} />
        </div>
      ) : filteredTeachers.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="w-8 h-8" />}
          title="No faculty members found"
          description="Try modifying search filters or recruit a new teacher."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.map((t) => (
            <Card key={t.id} className="space-y-4 hoverEffect">
              <div className="flex items-start gap-3.5">
                <img
                  src={t.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                  alt={t.name}
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
                <div className="min-w-0 space-y-0.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {t.name}
                  </h3>
                  <div className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-semibold">
                    {t.teacherIdNumber}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {t.department}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Qualification</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{t.qualification}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-[11px]">Experience</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{t.experienceYears} Years</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{t.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.phone}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Teacher Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Faculty Member"
        subtitle="Onboard a new professor or instructor"
        maxWidth="md"
      >
        <form onSubmit={handleSaveTeacher} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 text-xs text-red-600 border border-red-200">
              {formError}
            </div>
          )}
          <Input
            label="Faculty Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Prof. Jane Doe"
            required
          />
          <Input
            label="Institutional Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="jane.doe@smartedu.org"
            required
          />
          <Input
            label="Faculty ID Code"
            value={formData.teacherIdNumber}
            onChange={(e) => setFormData({ ...formData, teacherIdNumber: e.target.value })}
            required
          />
          <Select
            label="Department"
            value={formData.department}
            options={[
              { value: 'Computer Science', label: 'Computer Science' },
              { value: 'Electrical Engineering', label: 'Electrical Engineering' },
              { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
            ]}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
          />
          <Input
            label="Highest Academic Qualification"
            value={formData.qualification}
            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            placeholder="Ph.D. in Computer Science"
            required
          />
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={formLoading}>
              Add Faculty
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
