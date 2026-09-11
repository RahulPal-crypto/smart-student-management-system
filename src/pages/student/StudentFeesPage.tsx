import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FeeItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { CreditCard, CheckCircle2, Clock, Download, ShieldCheck } from 'lucide-react';

export const StudentFeesPage: React.FC = () => {
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Pay Modal
  const [payingFee, setPayingFee] = useState<FeeItem | null>(null);
  const [payLoading, setPayLoading] = useState(false);
  const [successReceipt, setSuccessReceipt] = useState<string | null>(null);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/student/fees');
      if (res && res.success && res.data) {
        const feeList = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.fees)
          ? res.data.fees
          : [];
        setFees(feeList);
      } else {
        setFees([]);
      }
    } catch (err) {
      console.error('Failed to load fees:', err);
      setFees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const handlePay = async () => {
    if (!payingFee) return;
    setPayLoading(true);
    try {
      await api.put(`/admin/fees/${payingFee.id}/pay`, { amount: payingFee.dueAmount });
      setSuccessReceipt(`REC-${Date.now().toString().slice(-6)}`);
      setTimeout(() => {
        setSuccessReceipt(null);
        setPayingFee(null);
        fetchFees();
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Payment processing failed.');
    } finally {
      setPayLoading(false);
    }
  };

  if (loading) {
    return <SkeletonLoader variant="card" count={3} />;
  }

  const feeList = Array.isArray(fees) ? fees : [];
  const totalFees = feeList.reduce((acc, f) => acc + (f?.amount || 0), 0);
  const totalPaid = feeList.reduce((acc, f) => acc + (f?.paidAmount || 0), 0);
  const totalDue = feeList.reduce((acc, f) => acc + (f?.dueAmount || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Tuition & Academic Invoices
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            View term invoices, payment ledger, and instant official receipts
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Assessed Fees</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            ${totalFees.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">Semester 4 Tuition & Lab</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Amount Cleared</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ${totalPaid.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Paid in Full
          </span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Pending Balance</span>
          <div className="text-2xl font-black text-red-600 dark:text-red-400">
            ${totalDue.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">
            {totalDue === 0 ? 'No outstanding dues' : 'Due by end of month'}
          </span>
        </Card>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {fees.map((f) => (
          <Card key={f.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hoverEffect">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {f.title}
                </h3>
                <Badge variant={f.status === 'Paid' ? 'success' : 'warning'} size="sm">
                  {f.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Invoice Reference: #{f.id} • Due: {f.dueDate}
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total Amount</span>
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  ${f.amount}
                </span>
              </div>

              {f.dueAmount > 0 ? (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setPayingFee(f)}
                  leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                >
                  Pay ${f.dueAmount}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => alert(`Receipt downloaded for invoice #${f.id}`)}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download Receipt
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Pay Modal */}
      <Modal
        isOpen={!!payingFee}
        onClose={() => setPayingFee(null)}
        title="Institutional Tuition Settlement"
        subtitle={`Invoice: ${payingFee?.title}`}
        maxWidth="md"
      >
        <div className="space-y-4">
          {successReceipt ? (
            <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                Payment Completed!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-mono">
                Receipt #{successReceipt} generated.
              </p>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{payingFee?.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Due:</span>
                  <span className="font-bold text-red-600 text-sm">${payingFee?.dueAmount}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-blue-100 dark:border-slate-800 bg-blue-50/50 dark:bg-slate-800/40 text-xs flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Encrypted 256-bit Institutional Gateway simulation.</span>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <Button variant="outline" onClick={() => setPayingFee(null)}>
                  Cancel
                </Button>
                <Button variant="primary" onClick={handlePay} isLoading={payLoading}>
                  Confirm Payment of ${payingFee?.dueAmount}
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
