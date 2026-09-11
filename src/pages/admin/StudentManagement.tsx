import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Student } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

export const StudentManagement: React.FC = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // View Modal State
  const [selectedStudentForView, setSelectedStudentForView] = useState<Student | null>(null);

  // Delete Confirmation Modal State
  const [studentToDelete, setStudentToDelete] = useState<{ id: string; name: string; roll: string; dept: string } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add / Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    studentIdNumber: '',
    phone: '',
    gender: 'Male',
    dob: '2004-05-15',
    courseId: 'crs-cs',
    courseName: 'B.Tech in Computer Science & Engineering',
    department: 'Computer Science',
    semester: 4,
    classSection: 'A',
    address: 'Campus Dormitory Block B',
    guardianName: 'Parent / Guardian',
    guardianPhone: '+1 (555) 019-2831',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/students');
      if (res && res.success && res.data) {
        const studentList = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.students)
          ? res.data.students
          : [];
        setStudents(studentList);
      } else {
        setStudents([]);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      studentIdNumber: `STU${new Date().getFullYear()}${Math.floor(100 + Math.random() * 900)}`,
      phone: '+1 (555) 000-0000',
      gender: 'Male',
      dob: '2004-05-15',
      courseId: 'crs-cs',
      courseName: 'B.Tech in Computer Science & Engineering',
      department: 'Computer Science',
      semester: 4,
      classSection: 'A',
      address: 'Campus Hostel',
      guardianName: 'Guardian',
      guardianPhone: '+1 (555) 000-1111',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      studentIdNumber: student.studentIdNumber,
      phone: student.phone || '',
      gender: student.gender || 'Male',
      dob: student.dob || '2004-05-15',
      courseId: student.courseId,
      courseName: student.courseName,
      department: student.department,
      semester: student.semester,
      classSection: student.classSection,
      address: student.address || '',
      guardianName: student.guardianName || '',
      guardianPhone: student.guardianPhone || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      if (editingStudent) {
        await api.put(`/admin/students/${editingStudent.id}`, formData);
      } else {
        await api.post('/admin/students', formData);
      }
      setIsModalOpen(false);
      setNotification({
        type: 'success',
        message: editingStudent ? `Student "${formData.name}" updated successfully.` : `Student "${formData.name}" enrolled successfully.`,
      });
      setTimeout(() => setNotification(null), 4000);
      fetchStudents();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save student record.');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePromptDelete = (student: Student) => {
    setStudentToDelete({
      id: student.id,
      name: student.name,
      roll: student.studentIdNumber,
      dept: student.department,
    });
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setDeleteLoading(true);
    try {
      await api.delete(`/admin/students/${studentToDelete.id}`);
      setNotification({
        type: 'success',
        message: `Student "${studentToDelete.name}" (${studentToDelete.roll}) has been deleted.`,
      });
      setTimeout(() => setNotification(null), 4000);
      setStudentToDelete(null);
      fetchStudents();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to delete student record.',
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!students || students.length === 0) return;
    const headers = ['Roll Number', 'Name', 'Email', 'Phone', 'Department', 'Course', 'Semester', 'Section', 'Attendance %', 'Risk Status', 'Health Score'];
    const rows = students.map((s) => [
      s.studentIdNumber,
      `"${s.name}"`,
      s.email,
      s.phone || '',
      `"${s.department}"`,
      `"${s.courseName}"`,
      s.semester,
      s.classSection,
      s.attendancePercent || 85,
      s.attendanceStatus || 'SAFE',
      s.academicHealthScore || 85,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Students_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotification({
      type: 'success',
      message: `Exported ${students.length} student records to CSV.`,
    });
    setTimeout(() => setNotification(null), 3000);
  };

  // Filter students
  const studentList = Array.isArray(students) ? students : [];
  const filteredStudents = studentList.filter((s) => {
    const sName = s?.name || '';
    const sId = s?.studentIdNumber || '';
    const sEmail = s?.email || '';
    const matchesSearch =
      sName.toLowerCase().includes(search.toLowerCase()) ||
      sId.toLowerCase().includes(search.toLowerCase()) ||
      sEmail.toLowerCase().includes(search.toLowerCase());

    const matchesDept = deptFilter === 'All' || s.department === deptFilter;
    const matchesRisk = riskFilter === 'All' || s.attendanceStatus === riskFilter;

    return matchesSearch && matchesDept && matchesRisk;
  });

  const getRiskBadge = (status?: string, pct?: number) => {
    switch (status) {
      case 'SAFE':
        return <Badge variant="success" size="sm" dot>{pct}% Safe</Badge>;
      case 'WARNING':
        return <Badge variant="warning" size="sm" dot>{pct}% Warning</Badge>;
      case 'AT RISK':
        return <Badge variant="danger" size="sm" dot>{pct}% At Risk</Badge>;
      case 'CRITICAL':
        return <Badge variant="danger" size="sm" dot>{pct}% Critical</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{pct || 85}%</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-medium animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Student Directory & Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage student admissions, academic health, and attendance risk indicators
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Export CSV
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleOpenAdd}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Enroll New Student
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-6">
            <Input
              placeholder="Search by student name, roll number, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          <div className="sm:col-span-3">
            <Select
              options={[
                { value: 'All', label: 'All Departments' },
                { value: 'Computer Science', label: 'Computer Science' },
                { value: 'Electrical Engineering', label: 'Electrical Eng.' },
                { value: 'Mechanical Engineering', label: 'Mechanical Eng.' },
                { value: 'Data Science', label: 'Data Science' },
              ]}
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
            />
          </div>

          <div className="sm:col-span-3">
            <Select
              options={[
                { value: 'All', label: 'All Attendance Tiers' },
                { value: 'SAFE', label: 'Safe (>= 80%)' },
                { value: 'WARNING', label: 'Warning (75% - 79%)' },
                { value: 'AT RISK', label: 'At Risk (60% - 74%)' },
                { value: 'CRITICAL', label: 'Critical (< 60%)' },
              ]}
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Students Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader variant="table" count={6} />
          </div>
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            icon={<Users className="w-8 h-8" />}
            title="No students found"
            description="Try adjusting your search criteria or enroll a new student into the system."
            action={
              <Button variant="primary" size="sm" onClick={handleOpenAdd}>
                Enroll Student
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Roll / ID</th>
                  <th className="py-3.5 px-4">Course & Dept</th>
                  <th className="py-3.5 px-4">Semester</th>
                  <th className="py-3.5 px-4">Attendance Risk</th>
                  <th className="py-3.5 px-4">Health Score</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredStudents.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                          alt={s.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-bold text-slate-900 dark:text-white truncate block">
                            {s.name}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {s.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-700 dark:text-slate-300">
                      {s.studentIdNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[180px]">
                        {s.courseName}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {s.department}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      Sem {s.semester} ({s.classSection})
                    </td>
                    <td className="py-3.5 px-4">
                      {getRiskBadge(s.attendanceStatus, s.attendancePercent)}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-white">
                          {s.academicHealthScore || 85}/100
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all cursor-pointer active:scale-95"
                          title="Edit Student Record"
                          aria-label={`Edit ${s.name}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePromptDelete(s)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer active:scale-95 group"
                          title="Delete Student Record"
                          aria-label={`Delete ${s.name}`}
                        >
                          <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-rose-400 transition-colors" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedStudentForView(s)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all cursor-pointer active:scale-95"
                          title="View Student Dossier & Verification"
                          aria-label={`View Dossier for ${s.name}`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student Profile' : 'Enroll New Student'}
        subtitle="Update academic details and institutional record"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <Input
              label="Institutional Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Roll / Student ID Number"
              value={formData.studentIdNumber}
              onChange={(e) => setFormData({ ...formData, studentIdNumber: e.target.value })}
              required
            />
            <Input
              label="Contact Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Select
              label="Department"
              value={formData.department}
              options={[
                { value: 'Computer Science', label: 'Computer Science' },
                { value: 'Electrical Engineering', label: 'Electrical Engineering' },
                { value: 'Mechanical Engineering', label: 'Mechanical Engineering' },
                { value: 'Data Science', label: 'Data Science' },
              ]}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
            <Select
              label="Semester"
              value={formData.semester}
              options={[
                { value: 1, label: 'Semester 1' },
                { value: 2, label: 'Semester 2' },
                { value: 3, label: 'Semester 3' },
                { value: 4, label: 'Semester 4' },
                { value: 5, label: 'Semester 5' },
                { value: 6, label: 'Semester 6' },
                { value: 7, label: 'Semester 7' },
                { value: 8, label: 'Semester 8' },
              ]}
              onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
            />
            <Input
              label="Class Section"
              value={formData.classSection}
              onChange={(e) => setFormData({ ...formData, classSection: e.target.value })}
              required
            />
            <Input
              label="Guardian Contact Name"
              value={formData.guardianName}
              onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={formLoading}
            >
              {editingStudent ? 'Update Student' : 'Complete Enrollment'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      {studentToDelete && (
        <Modal
          isOpen={!!studentToDelete}
          onClose={() => !deleteLoading && setStudentToDelete(null)}
          title="Confirm Student Record Deletion"
          subtitle="Institutional Database Action"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-rose-400">
                  Are you sure you want to delete {studentToDelete.name}?
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Student ID: <span className="font-mono text-white font-semibold">{studentToDelete.roll}</span> • Dept: <span className="text-slate-200">{studentToDelete.dept}</span>.
                  This student record and associated academic records will be permanently removed.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStudentToDelete(null)}
                disabled={deleteLoading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={handleConfirmDelete}
                isLoading={deleteLoading}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Delete Student
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Student Dossier Modal */}
      {selectedStudentForView && (
        <Modal
          isOpen={!!selectedStudentForView}
          onClose={() => setSelectedStudentForView(null)}
          title="Student Dossier & Verification"
          subtitle={`Roll: ${selectedStudentForView.studentIdNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-5">
            {/* Header info */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/50 border border-slate-800">
              <img
                src={selectedStudentForView.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                alt={selectedStudentForView.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-700 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-black text-white truncate">
                    {selectedStudentForView.name}
                  </h3>
                  {getRiskBadge(selectedStudentForView.attendanceStatus, selectedStudentForView.attendancePercent)}
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {selectedStudentForView.studentIdNumber} • {selectedStudentForView.department}
                </p>
                <p className="text-xs text-slate-500 truncate">
                  {selectedStudentForView.courseName}
                </p>
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Attendance</span>
                <p className="text-base font-black text-white mt-0.5">
                  {selectedStudentForView.attendancePercent || 85}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Health Score</span>
                <p className="text-base font-black text-emerald-400 mt-0.5">
                  {selectedStudentForView.academicHealthScore || 85}/100
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Semester</span>
                <p className="text-base font-black text-white mt-0.5">
                  Sem {selectedStudentForView.semester} (Sec {selectedStudentForView.classSection})
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Status</span>
                <p className="text-base font-black text-blue-400 mt-0.5">
                  Active
                </p>
              </div>
            </div>

            {/* Detailed attributes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-900/30 p-4 rounded-xl border border-slate-800/80">
              <div>
                <span className="text-slate-500">Email:</span>{' '}
                <span className="text-slate-200 font-medium">{selectedStudentForView.email}</span>
              </div>
              <div>
                <span className="text-slate-500">Phone:</span>{' '}
                <span className="text-slate-200 font-medium">{selectedStudentForView.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500">Guardian:</span>{' '}
                <span className="text-slate-200 font-medium">{selectedStudentForView.guardianName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500">Guardian Phone:</span>{' '}
                <span className="text-slate-200 font-medium">{selectedStudentForView.guardianPhone || 'N/A'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500">Campus Address:</span>{' '}
                <span className="text-slate-200 font-medium">{selectedStudentForView.address || 'Campus Dormitory Block'}</span>
              </div>
            </div>

            {/* Modal actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <a
                href={`/verify-student/${selectedStudentForView.id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Public QR Verification Card ↗
              </a>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const stu = selectedStudentForView;
                    setSelectedStudentForView(null);
                    handleOpenEdit(stu);
                  }}
                  leftIcon={<Edit2 className="w-3.5 h-3.5" />}
                >
                  Edit Record
                </Button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedStudentForView(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
