import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { IdCard, Download, Printer, ShieldCheck, Share2, Sparkles } from 'lucide-react';

export const StudentIdCardPage: React.FC = () => {
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/student/dashboard');
      if (res.success && res.data) {
        setStudent(res.data.studentProfile);
      }
    } catch (err) {
      console.error('Failed to load ID card:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading || !student) {
    return <SkeletonLoader variant="card" count={2} />;
  }

  const qrData = JSON.stringify({
    studentId: student.id,
    studentIdNumber: student.studentIdNumber,
    name: student.name,
    validUntil: '2028-06-30',
  });

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    qrData
  )}`;

  return (
    <div className="space-y-6 animate-fadeIn max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <IdCard className="w-6 h-6 text-blue-600" />
            <span>Official Digital Student Identity Card</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographically verifiable student credential with security holographic strip
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print ID Card
          </Button>
        </div>
      </div>

      {/* ID Card Display */}
      <div className="flex justify-center p-4">
        <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900 text-white relative">
          {/* Holographic Header Bar */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-5 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-white text-blue-600 font-black flex items-center justify-center text-sm shadow-md">
                  A
                </div>
                <div>
                  <h3 className="font-black text-xs tracking-wider uppercase">
                    Apex Institute of Tech
                  </h3>
                  <p className="text-[10px] text-blue-200">
                    Official Student Credential
                  </p>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white border border-white/30 uppercase tracking-wider">
                Active 2024-2028
              </span>
            </div>
          </div>

          {/* Student Information Body */}
          <div className="p-6 space-y-6">
            <div className="flex items-start gap-4">
              <img
                src={
                  student.avatar ||
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'
                }
                alt={student.name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-white/20 shadow-md shrink-0"
              />

              <div className="space-y-1 min-w-0">
                <h2 className="text-xl font-black tracking-tight truncate">
                  {student.name}
                </h2>
                <div className="text-xs font-mono font-bold text-cyan-400">
                  {student.studentIdNumber}
                </div>
                <div className="text-xs text-slate-300">
                  {student.courseName}
                </div>
                <div className="text-[11px] text-slate-400">
                  Sem {student.semester} • Section {student.classSection}
                </div>
              </div>
            </div>

            {/* QR Code and Barcode Section */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between gap-4">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Identity</span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Scan for public portal credential verification
                </p>
                <p className="text-[10px] font-mono text-slate-500">
                  Expires: Jun 2028
                </p>
              </div>

              <div className="p-1.5 bg-white rounded-xl shadow-xs shrink-0">
                <img src={qrUrl} alt="Student QR" className="w-20 h-20" />
              </div>
            </div>

            {/* Barcode Strip */}
            <div className="text-center pt-1 border-t border-white/10">
              <div className="font-mono text-xs tracking-widest text-slate-400">
                ||| | |||| | ||||| ||| |||| | || |||||
              </div>
              <span className="text-[9px] text-slate-500 font-mono">
                AUTH-HASH: 8942-STU-APEX-2026
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
