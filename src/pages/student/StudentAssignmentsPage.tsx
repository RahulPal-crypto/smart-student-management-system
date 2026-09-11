import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Assignment } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Tabs } from '../../components/ui/Tabs';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  FileText,
  Calendar,
  CheckCircle2,
  Clock,
  Send,
  Award,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const StudentAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  // Submit Modal
  const [selectedAsg, setSelectedAsg] = useState<any | null>(null);
  const [solutionContent, setSolutionContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/student/assignments');
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

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsg) return;
    setSubmitting(true);
    try {
      await api.post('/student/assignments/submit', {
        assignmentId: selectedAsg.id,
        content: solutionContent,
      });
      setSuccessMsg('Assignment solution submitted successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        setSelectedAsg(null);
        setSolutionContent('');
        fetchAssignments();
      }, 1200);
    } catch (err: any) {
      alert(err.message || 'Submission failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingList = assignments.filter((a) => !a.submission);
  const submittedList = assignments.filter((a) => a.submission);

  const tabs = [
    { id: 'pending', label: 'Pending Coursework', count: pendingList.length, icon: <Clock className="w-4 h-4" /> },
    { id: 'submitted', label: 'Completed & Graded', count: submittedList.length, icon: <CheckCircle2 className="w-4 h-4" /> },
  ];

  const currentList = activeTab === 'pending' ? pendingList : submittedList;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Assignments & Submissions
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Submit coursework solutions, track grading feedback, and earn merit badges
          </p>
        </div>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SkeletonLoader variant="card" count={4} />
        </div>
      ) : currentList.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title={activeTab === 'pending' ? 'No pending tasks!' : 'No submitted assignments'}
          description={
            activeTab === 'pending'
              ? 'You have completed and submitted all assigned coursework.'
              : 'Submit solutions from the pending tab to see them graded here.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentList.map((asg) => (
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
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
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

                {asg.submission && (
                  <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-900/60 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-700 dark:text-emerald-300">
                        {asg.submission.marksObtained !== undefined
                          ? `Grade: ${asg.submission.marksObtained} / ${asg.maxMarks} Points`
                          : 'Awaiting Faculty Evaluation'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Submitted on {new Date(asg.submission.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {asg.submission.feedback && (
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                        Teacher Feedback: "{asg.submission.feedback}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {!asg.submission && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedAsg(asg);
                      setSolutionContent('');
                    }}
                    leftIcon={<Send className="w-3.5 h-3.5" />}
                  >
                    Submit Solution
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Submit Assignment Modal */}
      <Modal
        isOpen={!!selectedAsg}
        onClose={() => setSelectedAsg(null)}
        title={selectedAsg?.title || 'Submit Solution'}
        subtitle={`Subject: ${selectedAsg?.subjectName} • Max Score: ${selectedAsg?.maxMarks} pts`}
        maxWidth="lg"
      >
        <form onSubmit={handleSubmitAssignment} className="space-y-4">
          {successMsg ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 text-xs text-center font-bold flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>{successMsg}</span>
            </div>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
                <span className="text-slate-400 font-bold block">Assignment Brief:</span>
                <p className="text-slate-700 dark:text-slate-300">{selectedAsg?.description}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Solution (Text, Code, or Repository Link)
                </label>
                <textarea
                  rows={6}
                  value={solutionContent}
                  onChange={(e) => setSolutionContent(e.target.value)}
                  placeholder="Paste your source code, answers, or GitHub / Google Drive link here..."
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setSelectedAsg(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" isLoading={submitting}>
                  Submit Solution
                </Button>
              </div>
            </>
          )}
        </form>
      </Modal>
    </div>
  );
};
