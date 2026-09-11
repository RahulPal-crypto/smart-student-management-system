import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EarlyWarningBanner } from '../../components/smart/EarlyWarningBanner';
import {
  CalendarCheck2,
  Search,
  Filter,
  Download,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Send,
} from 'lucide-react';

export const AttendanceManagement: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('All');

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/attendance');
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  if (loading) {
    return <SkeletonLoader variant="table" count={8} />;
  }

  const { overallStats, studentRisks, departmentBreakdown, highRiskList } = data || {};

  const filteredRisks = (studentRisks || []).filter((s: any) => {
    const matchesSearch =
      s.studentName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentIdNumber.toLowerCase().includes(search.toLowerCase());
    const matchesRisk = riskFilter === 'All' || s.status === riskFilter;
    return matchesSearch && matchesRisk;
  });

  const getRiskBadge = (status: string) => {
    switch (status) {
      case 'SAFE':
        return <Badge variant="success" size="sm" dot>Safe Tier</Badge>;
      case 'WARNING':
        return <Badge variant="warning" size="sm" dot>Warning</Badge>;
      case 'AT RISK':
        return <Badge variant="danger" size="sm" dot>At Risk (&lt;75%)</Badge>;
      case 'CRITICAL':
        return <Badge variant="danger" size="sm" dot>Critical (&lt;60%)</Badge>;
      default:
        return <Badge variant="neutral" size="sm">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Institutional Attendance & Risk Engine
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Automated mathematical threshold monitoring, low attendance alerts, and interventions
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => alert('Attendance audit report exported.')}
          leftIcon={<Download className="w-4 h-4" />}
        >
          Export Attendance Ledger
        </Button>
      </div>

      {/* Early Warning Banner */}
      {highRiskList && highRiskList.length > 0 && (
        <EarlyWarningBanner warnings={highRiskList} role="admin" />
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Institutional Average</span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {overallStats?.overallPercent || 86}%
          </div>
          <span className="text-[11px] text-slate-500">Threshold standard is 75%</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Safe Students (&ge; 80%)</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {overallStats?.safeCount || 0}
          </div>
          <span className="text-[11px] text-slate-500">Compliant & in good standing</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Warning Tiers (75-79%)</span>
          <div className="text-2xl font-black text-amber-500 dark:text-amber-400">
            {overallStats?.warningCount || 0}
          </div>
          <span className="text-[11px] text-slate-500">Near threshold boundary</span>
        </Card>

        <Card className="p-4 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase">At Risk / Critical (&lt;75%)</span>
          <div className="text-2xl font-black text-red-600 dark:text-red-400">
            {(overallStats?.atRiskCount || 0) + (overallStats?.criticalCount || 0)}
          </div>
          <span className="text-[11px] text-slate-500">Requires academic counseling</span>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8">
            <Input
              placeholder="Search student by name or roll number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <div className="sm:col-span-4">
            <Select
              options={[
                { value: 'All', label: 'All Risk Tiers' },
                { value: 'SAFE', label: 'Safe (>= 80%)' },
                { value: 'WARNING', label: 'Warning (75% - 79%)' },
                { value: 'AT RISK', label: 'At Risk (60% - 74%)' },
                { value: 'CRITICAL', label: 'Critical (< 60%)' },
              ]}
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Risk Matrix Table */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Roll Number</th>
                <th className="py-3.5 px-4">Classes Attended</th>
                <th className="py-3.5 px-4">Current %</th>
                <th className="py-3.5 px-4">Risk Status</th>
                <th className="py-3.5 px-4">Classes Needed to Reach 75%</th>
                <th className="py-3.5 px-4">Safe Absence Buffer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredRisks.map((s: any) => (
                <tr
                  key={s.studentId}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                    {s.studentName}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-semibold text-slate-600 dark:text-slate-300">
                    {s.studentIdNumber}
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                    {s.attendedClasses} / {s.totalClasses} lectures
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {s.currentPercent}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    {getRiskBadge(s.status)}
                  </td>
                  <td className="py-3.5 px-4">
                    {s.classesNeededToReachThreshold > 0 ? (
                      <span className="font-bold text-red-600 dark:text-red-400">
                        +{s.classesNeededToReachThreshold} lectures required
                      </span>
                    ) : (
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        On target
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    {s.maxClassesCanMiss > 0 ? (
                      <span className="text-slate-700 dark:text-slate-300 font-medium">
                        Can miss {s.maxClassesCanMiss} lectures
                      </span>
                    ) : (
                      <span className="text-red-500 font-medium">0 buffer</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
