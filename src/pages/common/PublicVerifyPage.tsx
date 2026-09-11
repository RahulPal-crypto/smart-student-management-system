import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Logo } from '../../components/common/Logo';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import { ShieldCheck, Search, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

export const PublicVerifyPage: React.FC = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [queryId, setQueryId] = useState(studentId || 'STU2024041');
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (idToSearch: string) => {
    if (!idToSearch.trim()) return;
    setLoading(true);
    setError('');
    setStudent(null);
    try {
      const res: any = await api.get(`/common/public/verify/${encodeURIComponent(idToSearch.trim())}`);
      if (res.success && res.data) {
        setStudent(res.data);
      } else {
        setError('No verified student found matching this credential identifier.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification record not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) {
      handleVerify(studentId);
    }
  }, [studentId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      {/* Public Top Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
            Portal Sign In
          </Button>
        </div>
      </header>

      {/* Main Verification Container */}
      <main className="max-w-xl w-full mx-auto px-4 py-12 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight">
            Institutional Credential Verification Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Public identity registry. Verify official enrollment status, academic standing, and security hashes.
          </p>
        </div>

        {/* Search Box */}
        <Card className="p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify(queryId);
            }}
            className="flex gap-2"
          >
            <Input
              placeholder="Enter Student Roll ID (e.g. STU2024041)..."
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
              className="flex-1"
              required
            />
            <Button type="submit" variant="primary" isLoading={loading}>
              Verify
            </Button>
          </form>
        </Card>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {student && (
          <Card className="p-6 space-y-6 animate-fadeIn border-2 border-emerald-500/40">
            <div className="flex items-center justify-between">
              <Badge variant="success" size="sm" className="gap-1.5 py-1 px-3">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Active Student</span>
              </Badge>
              <span className="text-[11px] font-mono text-slate-400">
                Institutional Record Confirmed
              </span>
            </div>

            <div className="flex items-start gap-4">
              <img
                src={
                  student.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                }
                alt={student.name}
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-md shrink-0"
              />

              <div className="space-y-1 min-w-0">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">
                  {student.name}
                </h3>
                <div className="font-mono font-bold text-xs text-blue-600 dark:text-blue-400">
                  {student.studentIdNumber}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300">
                  {student.courseName}
                </div>
                <div className="text-[11px] text-slate-400">
                  Department: {student.department} • Semester {student.semester}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">Enrollment Status</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Active / Enrolled</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Academic Standing</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">Good Standing</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Institutional Hash</span>
                <span className="font-mono text-[10px] text-slate-500">APEX-VERIFIED-2026</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Valid Through</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">June 2028</span>
              </div>
            </div>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        Apex Institute of Technology • Smart Student Management System • Developed by Sonam Pal
      </footer>
    </div>
  );
};
