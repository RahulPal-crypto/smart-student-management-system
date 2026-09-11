import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { FeeItem } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { CreditCard, Search, DollarSign, CheckCircle2, Clock, Printer } from 'lucide-react';

export const FeeManagement: React.FC = () => {
  const [fees, setFees] = useState<FeeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Payment Modal
  const [selectedFee, setSelectedFee] = useState<FeeItem | null>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payLoading, setPayLoading] = useState(false);

  const fetchFees = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/fees');
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

  const handleOpenPay = (fee: FeeItem) => {
    setSelectedFee(fee);
    setPayAmount(fee.dueAmount);
  };

  const handleConfirmPay = async () => {
    if (!selectedFee) return;
    setPayLoading(true);
    try {
      await api.put(`/admin/fees/${selectedFee.id}/pay`, { amount: Number(payAmount) });
      setSelectedFee(null);
      fetchFees();
    } catch (err: any) {
      alert(err.message || 'Payment recording failed.');
    } finally {
      setPayLoading(false);
    }
  };

  const feeList = Array.isArray(fees) ? fees : [];
  const filteredFees = feeList.filter((f) => {
    const sName = f?.studentName || '';
    const sId = f?.studentIdNumber || '';
    return (
      sName.toLowerCase().includes(search.toLowerCase()) ||
      sId.toLowerCase().includes(search.toLowerCase())
    );
  });

  const totalCollected = feeList.reduce((acc, f) => acc + (f?.paidAmount || 0), 0);
  const totalOutstanding = feeList.reduce((acc, f) => acc + (f?.dueAmount || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Tuition & Fee Administration
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Student billing, payment records, and fee receipts
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Total Collected</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            ${totalCollected.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">Verified institutional revenue</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Outstanding Dues</span>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400">
            ${totalOutstanding.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">Pending or partial balances</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Collection Rate</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {Math.round((totalCollected / (totalCollected + totalOutstanding || 1)) * 100)}%
          </div>
          <span className="text-[11px] text-slate-500">Current semester target met</span>
        </Card>
      </div>

      {/* Search */}
      <Card className="p-4">
        <Input
          placeholder="Search fee records by student name or roll number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </Card>

      {/* Fee Table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="p-6">
            <SkeletonLoader variant="table" count={5} />
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Roll Number</th>
                <th className="p-4">Fee Item</th>
                <th className="p-4">Total Fee</th>
                <th className="p-4">Paid</th>
                <th className="p-4">Due</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredFees.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{f.studentName}</td>
                  <td className="p-4 font-mono">{f.studentIdNumber}</td>
                  <td className="p-4">{f.title}</td>
                  <td className="p-4 font-bold">${f.amount}</td>
                  <td className="p-4 text-emerald-600 font-semibold">${f.paidAmount}</td>
                  <td className="p-4 text-red-600 font-semibold">${f.dueAmount}</td>
                  <td className="p-4">
                    <Badge variant={f.status === 'Paid' ? 'success' : 'warning'} size="sm">
                      {f.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    {f.dueAmount > 0 ? (
                      <Button size="sm" variant="outline" onClick={() => handleOpenPay(f)}>
                        Record Payment
                      </Button>
                    ) : (
                      <span className="text-emerald-600 text-[11px] font-bold">Settled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      {/* Payment Modal */}
      <Modal
        isOpen={!!selectedFee}
        onClose={() => setSelectedFee(null)}
        title="Record Fee Payment"
        subtitle={`Student: ${selectedFee?.studentName} • ${selectedFee?.studentIdNumber}`}
      >
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
            <div className="flex justify-between">
              <span>Total Dues:</span>
              <span className="font-bold text-red-600">${selectedFee?.dueAmount}</span>
            </div>
          </div>

          <Input
            label="Payment Amount ($)"
            type="number"
            value={payAmount}
            onChange={(e) => setPayAmount(Number(e.target.value))}
            max={selectedFee?.dueAmount}
            min={1}
            required
          />

          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => setSelectedFee(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmPay} isLoading={payLoading}>
              Confirm Receipt
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
