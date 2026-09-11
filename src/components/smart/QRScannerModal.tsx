import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { QrCode, Camera, CheckCircle2, AlertCircle, Sparkles, Scan } from 'lucide-react';
import { api } from '../../services/api';
import confetti from 'canvas-confetti';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [tokenInput, setTokenInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState<any>(null);

  const handleScanOrSubmit = async (tokenToUse?: string) => {
    const code = tokenToUse || tokenInput;
    if (!code) {
      setError('Please provide or scan a QR session token.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res: any = await api.post('/student/attendance/scan', { qrToken: code });
      if (res.success) {
        setSuccessResult(res.data);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        if (onSuccess) onSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify QR attendance. Token may have expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateQuickScan = () => {
    // Uses the sample active session
    handleScanOrSubmit('sample_qr_token_session');
  };

  const handleClose = () => {
    setTokenInput('');
    setError('');
    setSuccessResult(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Scan QR Attendance"
      subtitle="Verify your classroom attendance in real-time"
      maxWidth="md"
    >
      {successResult ? (
        <div className="py-6 flex flex-col items-center text-center space-y-4">
          <div className="p-4 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white">
              Attendance Verified!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Marked Present for {successResult.subjectName || 'Current Lecture'}.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs w-full">
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Method:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Smart QR Scan</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Timestamp:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>
          <Button variant="primary" className="w-full" onClick={handleClose}>
            Done
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Mock Camera Viewfinder */}
          <div className="relative h-48 rounded-2xl bg-slate-900 border-2 border-dashed border-blue-500/50 flex flex-col items-center justify-center text-white overflow-hidden group">
            <div className="absolute inset-0 bg-radial from-blue-500/10 to-transparent pointer-events-none" />
            <Scan className="w-16 h-16 text-blue-400 animate-pulse mb-2" />
            <span className="text-xs font-semibold text-slate-300">
              Point camera at teacher's board QR
            </span>
            <span className="text-[10px] text-slate-500 mt-1">
              Live Optical Camera Scan Enabled
            </span>

            {/* Quick Simulate Button */}
            <button
              onClick={handleSimulateQuickScan}
              className="mt-3 px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white text-xs font-semibold backdrop-blur-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Instant Scan</span>
            </button>
          </div>

          {/* Manual Token Form */}
          <div className="space-y-3">
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
              <span className="px-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase">
                Or enter session code
              </span>
              <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            </div>

            <Input
              placeholder="Paste token or session passcode..."
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              error={error}
              leftIcon={<QrCode className="w-4 h-4" />}
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => handleScanOrSubmit()}
              isLoading={loading}
            >
              Verify Attendance
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};
