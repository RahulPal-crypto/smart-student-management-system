import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Assignment, Submission } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  FileText,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Award,
  AlertCircle,
} from 'lucide-react';

export const TeacherAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subjectId: 'sub-dbms',
    classId: 'cls-1',
    description: '',
    dueDate: '2026-09-15',
    difficulty: 'Medium',
    maxMarks: 30,
  });
  const [createLoading, setCreateLoading] = useState(false);

  // Grading Modal
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [marksInput, setMarksInput] = useState<number>(25);
  const [feedbackInput, setFeedbackInput] = useState<string>('Well structured submission.');
  const [gradeLoading, setGradeLoading] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/teacher/assignments');
      if (res.success && res.data) {
        setAssignments(res.data);
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await api.post('/teacher/assignments', formData);
      setIsCreateOpen(false);
      setFormData({
        title: '',
        subjectId: 'sub-dbms',
        classId: 'cls-1',
        description: '',
        dueDate: '2026-09-15',
        difficulty: 'Medium',
        maxMarks: 30,
      });
      fetchAssignments();
    } catch (err: any) {
      alert(err.message || 'Failed to create assignment.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;
    setGradeLoading(true);
    try {
      await api.post('/teacher/submissions/grade', {
        submissionId: gradingSubmission.id,
        marksObtained: Number(marksInput),
        feedback: feedbackInput,
      });
      setGradingSubmission(null);
      fetchAssignments();
    } catch (err: any) {
      alert(err.message || 'Failed to grade submission.');
    } finally {
      setGradeLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Assignments & Coursework Evaluation
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create tasks, set deadlines, and grade student submissions with actionable feedback
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create Assignment
        </Button>
      </div>

      {/* Assignment Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonLoader variant="card" count={4} />
        </div>
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No assignments created yet"
          description="Create your first coursework assignment for your enrolled classes."
          action={
            <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
              Create Assignment
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((asg) => (
            <Card key={asg.id} className="p-5 space-y-4 hoverEffect flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <Badge variant="primary">{asg.subjectName}</Badge>
                  <Badge
                    variant={
                      asg.difficulty === 'Hard'
                        ? 'danger'
                        : asg.difficulty === 'Medium'
                        ? 'warning'
                        : 'success'
                    }
                    size="sm"
                  >
                    {asg.difficulty}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {asg.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {asg.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] block">Due Date</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {asg.dueDate}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] block">Max Marks</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {asg.maxMarks} Points
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="text-xs">
                  <span className="font-bold text-slate-900 dark:text-white">
                    {asg.totalSubmissions || (asg.submissions?.length || 0)}
                  </span>{' '}
                  <span className="text-slate-500">Submissions</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedAssignment(asg)}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  Review & Grade
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Class Assignment"
        subtitle="Assign new coursework with grading rubric"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <Input
            label="Assignment Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Relational Calculus & Query Optimization"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Subject"
              value={formData.subjectId}
              options={[
                { value: 'sub-dbms', label: 'Database Management Systems' },
                { value: 'sub-dsa', label: 'Data Structures & Algorithms' },
              ]}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
            />
            <Select
              label="Target Class"
              value={formData.classId}
              options={[
                { value: 'cls-1', label: 'B.Tech CSE - 4th Sem (Sec A)' },
                { value: 'cls-2', label: 'B.Tech CSE - 6th Sem (Sec A)' },
              ]}
              onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Submission Deadline"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
            <Select
              label="Difficulty Level"
              value={formData.difficulty}
              options={[
                { value: 'Easy', label: 'Easy' },
                { value: 'Medium', label: 'Medium' },
                { value: 'Hard', label: 'Hard' },
              ]}
              onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
            />
            <Input
              label="Max Score Points"
              type="number"
              value={formData.maxMarks}
              onChange={(e) => setFormData({ ...formData, maxMarks: Number(e.target.value) })}
              min={5}
              max={100}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Task Instructions & Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide detailed problem statement and expectations..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createLoading}>
              Publish Assignment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Submissions Review Modal */}
      <Modal
        isOpen={!!selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        title={selectedAssignment?.title || 'Submissions Roster'}
        subtitle={`Total Submissions: ${selectedAssignment?.submissions?.length || 0}`}
        maxWidth="lg"
      >
        <div className="space-y-4">
          {(selectedAssignment?.submissions || []).length === 0 ? (
            <p className="text-xs text-slate-400 py-8 text-center">
              No students have submitted solutions for this task yet.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {selectedAssignment?.submissions?.map((sub) => (
                <div key={sub.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {sub.studentName}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      {sub.studentIdNumber} • Submitted: {new Date(sub.submittedAt).toLocaleDateString()}
                    </span>
                    {sub.feedback && (
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 italic">
                        "{sub.feedback}"
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {sub.marksObtained !== undefined ? (
                      <Badge variant="success" size="sm">
                        {sub.marksObtained} / {selectedAssignment.maxMarks}
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm">
                        Needs Grading
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setGradingSubmission(sub);
                        setMarksInput(sub.marksObtained || 25);
                        setFeedbackInput(sub.feedback || 'Well structured submission.');
                      }}
                    >
                      Grade
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Grade Individual Submission Modal */}
      <Modal
        isOpen={!!gradingSubmission}
        onClose={() => setGradingSubmission(null)}
        title="Grade Student Work"
        subtitle={`Student: ${gradingSubmission?.studentName}`}
        maxWidth="md"
      >
        <form onSubmit={handleGradeSubmission} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
            <span className="text-slate-400 font-bold block">Submitted Content:</span>
            <p className="text-slate-700 dark:text-slate-300">
              {gradingSubmission?.content}
            </p>
          </div>

          <Input
            label="Score Obtained"
            type="number"
            value={marksInput}
            onChange={(e) => setMarksInput(Number(e.target.value))}
            max={selectedAssignment?.maxMarks || 100}
            min={0}
            required
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Teacher Feedback & Rubric Notes
            </label>
            <textarea
              rows={3}
              value={feedbackInput}
              onChange={(e) => setFeedbackInput(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setGradingSubmission(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={gradeLoading}>
              Submit Evaluation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
