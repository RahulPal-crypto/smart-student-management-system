import React, { useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ShieldCheck, Download, Printer, GraduationCap, CheckCircle2 } from 'lucide-react';
import { Student } from '../../types';

interface DigitalIdCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student;
}

export const DigitalIdCardModal: React.FC<DigitalIdCardModalProps> = ({
  isOpen,
  onClose,
  student,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Digital Student Identity Card"
      subtitle="Official Institutional Smart Credential"
      maxWidth="md"
    >
      <div className="space-y-6 flex flex-col items-center">
        {/* The Digital ID Card Frame */}
        <div
          ref={cardRef}
          className="w-full max-w-sm rounded-2xl overflow-hidden border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl relative text-slate-900 dark:text-white"
        >
          {/* Header Band */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 px-5 py-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-xs">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black tracking-tight uppercase">
                  Apex Institute of Technology
                </h4>
                <p className="text-[9px] text-blue-100 font-medium">
                  Official Smart Student Credential
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
              VERIFIED
            </span>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            <div className="flex items-start gap-4">
              <div className="relative shrink-0">
                <img
                  src={student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                  alt={student.name}
                  className="w-20 h-24 rounded-xl object-cover border-2 border-blue-500/40 shadow-sm"
                />
                <div className="absolute -bottom-1.5 -right-1.5 bg-emerald-500 text-white rounded-full p-0.5 shadow-xs">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="min-w-0 space-y-1">
                <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                  {student.name}
                </h3>
                <div className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                  {student.studentIdNumber}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {student.courseName}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sem {student.semester} • Sec {student.classSection}
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <div>
                <span className="text-slate-400 block text-[10px]">Department</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {student.department}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Valid Until</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  July 2028
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Blood Group</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">O+ Positive</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Emergency Contact</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {student.guardianPhone || '+1 (555) 019-2831'}
                </span>
              </div>
            </div>

            {/* Barcode & Security Hologram */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="font-mono text-[10px] tracking-widest text-slate-400">
                  ||||| ||| |||| |||||| ||||
                </div>
                <div className="text-[9px] text-slate-400">
                  UID: {student.id}
                </div>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>NFC / Chip Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full max-w-sm">
          <Button
            variant="outline"
            className="flex-1"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print Card
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={onClose}
          >
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
