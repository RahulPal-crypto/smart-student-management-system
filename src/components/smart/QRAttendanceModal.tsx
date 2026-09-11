import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { QrCode, Clock, RefreshCw, CheckCircle2, Copy, Check } from 'lucide-react';
import { api } from '../../services/api';

interface QRAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  classId: string;
  className: string;
  subjectId: string;
  subjectName: string;
}

export const QRAttendanceModal: React.FC<QRAttendanceModalProps> = ({
  isOpen,
  onClose,
  classId,
  className: classTitle,
  subjectId,
  subjectName,
}) => {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<{
    qrCodeDataUrl: string;
    token: string;
    expiresAt: string;
    expiresInSeconds: number;
    sessionId: string;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const fetchQRCode = async () => {
    if (!classId || !subjectId) return;
    setLoading(true);
    try {
      const res: any = await api.post('/teacher/attendance/qr', {
        classId,
        subjectId,
        validityMinutes: 10,
      });
      if (res.success && res.data) {
        setQrData(res.data);
        setTimeLeft(res.data.expiresInSeconds);
      }
    } catch (err) {
      console.error('Failed to generate QR:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchQRCode();
    } else {
      setQrData(null);
      setTimeLeft(0);
    }
  }, [isOpen, classId, subjectId]);

  // Countdown timer
  useEffect(() => {
    if (!timeLeft || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleCopyCode = () => {
    if (!qrData?.token) return;
    navigator.clipboard.writeText(qrData.token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Live Smart QR Attendance"
      subtitle={`${subjectName} • ${classTitle}`}
      maxWidth="md"
    >
      <div className="flex flex-col items-center text-center space-y-5">
        {/* Timer Banner */}
        <div className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Time Remaining:</span>
          </div>
          <span className="font-mono text-sm font-black text-blue-700 dark:text-blue-300">
            {formatTime(timeLeft)}
          </span>
        </div>

        {/* QR Code Canvas Frame */}
        <div className="relative p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center min-h-[260px] min-w-[260px]">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <span className="text-xs">Generating secure token...</span>
            </div>
          ) : qrData ? (
            <div className="space-y-2">
              <img
                src={qrData.qrCodeDataUrl}
                alt="Attendance QR Code"
                className="w-56 h-56 rounded-xl object-contain mx-auto"
              />
              <div className="text-[10px] text-slate-400 font-mono">
                Session: {qrData.sessionId}
              </div>
            </div>
          ) : (
            <div className="text-xs text-red-500">Failed to load QR code</div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 max-w-sm">
          <p className="font-semibold text-slate-800 dark:text-slate-200">
            Instruct students to open their Student Portal &gt; Scan QR Attendance.
          </p>
          <p className="text-[11px] text-slate-500">
            Encrypted with 10-minute dynamic nonce to prevent attendance fraud or proxy marking.
          </p>
        </div>

        {/* Backup Manual Token */}
        {qrData?.token && (
          <div className="w-full pt-2">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Backup Session Token
                </span>
                <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                  {qrData.token.slice(0, 18)}...
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCode}
                leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3 w-full pt-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={fetchQRCode}
            isLoading={loading}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh Token
          </Button>
          <Button variant="primary" className="flex-1" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
