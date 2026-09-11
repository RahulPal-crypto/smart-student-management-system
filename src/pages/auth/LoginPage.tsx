import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { Logo } from '../../components/common/Logo';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { ThemeToggle } from '../../components/common/ThemeToggle';
import {
  ShieldCheck,
  GraduationCap,
  Sparkles,
  Lock,
  Mail,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  School,
  AlertCircle,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, loginAsDemo, isLoading } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>('admin');
  const [email, setEmail] = useState('sonampachb20p5@gmail.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setError('');
    if (newRole === 'admin') {
      setEmail('sonampachb20p5@gmail.com');
      setPassword('Admin@123');
    } else if (newRole === 'teacher') {
      setEmail('teacher@smartedu.org');
      setPassword('Teacher@123');
    } else {
      setEmail('student@smartedu.org');
      setPassword('Student@123');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password, role);
      if (role === 'admin') navigate('/admin/dashboard');
      else if (role === 'teacher') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please verify your email, password, and role.');
    }
  };

  const handleQuickDemo = async (demoRole: UserRole) => {
    setError('');
    try {
      await loginAsDemo(demoRole);
      if (demoRole === 'admin') navigate('/admin/dashboard');
      else if (demoRole === 'teacher') navigate('/teacher/dashboard');
      else navigate('/student/dashboard');
    } catch (err: any) {
      setError(err.message || 'Demo login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#D4D4D8] flex flex-col justify-between transition-colors">
      {/* Top Bar */}
      <header className="px-6 py-5 flex items-center justify-between max-w-7xl w-full mx-auto border-b border-white/5">
        <Logo size="md" showTagline={true} />
        <ThemeToggle />
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          {/* Left Hero Pitch */}
          <div className="lg:col-span-6 space-y-6 hidden lg:block pr-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#C4A484] text-[11px] font-medium tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#C4A484]" />
              <span>Smart Education Platform v2.4</span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-serif text-white tracking-tight leading-[1.15]">
              Intelligent Management. <br />
              <span className="italic text-[#C4A484]">
                Elevated Student Success.
              </span>
            </h1>

            <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
              A comprehensive institutional portal featuring live QR attendance tracking, mathematical risk projections, multi-factor academic health scoring, and role-based portals.
            </p>

            {/* Feature bullets */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <div className="p-1 rounded bg-[#C4A484]/15 text-[#C4A484] border border-[#C4A484]/25">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Automated 75% Attendance Risk & Intervention Warning</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <div className="p-1 rounded bg-[#C4A484]/15 text-[#C4A484] border border-[#C4A484]/25">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Expiring Time-Locked QR Attendance Sessions</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-300">
                <div className="p-1 rounded bg-[#C4A484]/15 text-[#C4A484] border border-[#C4A484]/25">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Zero-Trust Role-Based Access Control (Admin, Faculty, Student)</span>
              </div>
            </div>

            {/* Developer Card */}
            <div className="p-4 rounded-xl bg-[#121214] border border-white/10 shadow-xs max-w-md">
              <div className="text-[10px] font-medium text-zinc-500 uppercase tracking-[0.2em]">
                System Engineering
              </div>
              <div className="text-xs font-serif text-[#C4A484] mt-0.5">
                Built by Sonam Pal
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Apex Institute Administrator & Principal Developer.
              </p>
            </div>
          </div>

          {/* Right Login Card */}
          <div className="lg:col-span-6">
            <div className="bg-[#121214] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif text-white tracking-wide">
                  Welcome to Smart SMS
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Sign in to access your institutional portal
                </p>
              </div>

              {/* Role Picker Segmented Control */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                  Select Your Portal Role
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-[#18181A] border border-white/10">
                  <button
                    type="button"
                    onClick={() => handleRoleChange('admin')}
                    className={`py-2 px-2 rounded text-xs font-medium transition-all cursor-pointer ${
                      role === 'admin'
                        ? 'bg-[#C4A484] text-[#0A0A0A] font-semibold shadow-xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('teacher')}
                    className={`py-2 px-2 rounded text-xs font-medium transition-all cursor-pointer ${
                      role === 'teacher'
                        ? 'bg-[#C4A484] text-[#0A0A0A] font-semibold shadow-xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Teacher
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleChange('student')}
                    className={`py-2 px-2 rounded text-xs font-medium transition-all cursor-pointer ${
                      role === 'student'
                        ? 'bg-[#C4A484] text-[#0A0A0A] font-semibold shadow-xs'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Student
                  </button>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <Input
                  label="Institutional Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@smartedu.org"
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  required
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-white/20 bg-white/5 text-[#C4A484] focus:ring-[#C4A484]"
                    />
                    <span>Remember my device</span>
                  </label>
                  <span className="text-zinc-500 hover:text-zinc-300 hover:underline cursor-pointer">
                    Forgot password?
                  </span>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  size="lg"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In to {role.toUpperCase()} Portal
                </Button>
              </form>

              {/* One-Click Demo Logins */}
              <div className="space-y-2 pt-2 border-t border-white/10">
                <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-[0.2em] block text-center">
                  Instant Demo Access
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemo('admin')}
                    className="p-2.5 rounded-lg border border-white/10 bg-[#161618] hover:border-[#C4A484]/40 hover:bg-[#1C1C20] text-left transition-all cursor-pointer"
                  >
                    <span className="text-[10px] font-mono text-red-400 block uppercase">
                      Admin Demo
                    </span>
                    <span className="text-[11px] font-medium text-zinc-200 truncate block mt-0.5">
                      Sonam Pal
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('teacher')}
                    className="p-2.5 rounded-lg border border-white/10 bg-[#161618] hover:border-[#C4A484]/40 hover:bg-[#1C1C20] text-left transition-all cursor-pointer"
                  >
                    <span className="text-[10px] font-mono text-[#C4A484] block uppercase">
                      Faculty Demo
                    </span>
                    <span className="text-[11px] font-medium text-zinc-200 truncate block mt-0.5">
                      Prof. Vance
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo('student')}
                    className="p-2.5 rounded-lg border border-white/10 bg-[#161618] hover:border-[#C4A484]/40 hover:bg-[#1C1C20] text-left transition-all cursor-pointer"
                  >
                    <span className="text-[10px] font-mono text-emerald-400 block uppercase">
                      Student Demo
                    </span>
                    <span className="text-[11px] font-medium text-zinc-200 truncate block mt-0.5">
                      Alex Rivers
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-6 text-center text-xs text-zinc-600 border-t border-white/5">
        Smart Student Management System • Developed by <span className="font-serif text-[#C4A484]">Sonam Pal</span>
      </footer>
    </div>
  );
};
