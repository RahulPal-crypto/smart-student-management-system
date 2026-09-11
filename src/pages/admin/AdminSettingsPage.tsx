import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { SystemSettings } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { Settings, Save, ShieldCheck, CheckCircle2, School, Code2 } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/admin/settings');
      if (res.success && res.data) {
        setSettings(res.data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setSuccessMsg('');
    try {
      const res: any = await api.put('/admin/settings', settings);
      if (res.success) {
        setSuccessMsg('System configuration saved successfully.');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save settings.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <SkeletonLoader variant="card" count={3} />;
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            System & Institutional Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure institutional parameters, thresholds, and developer governance
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Institutional Identity Card */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <School className="w-4 h-4 text-blue-600" />
            <span>Institutional Identity</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Institution Name"
              value={settings.institutionName}
              onChange={(e) => setSettings({ ...settings, institutionName: e.target.value })}
              required
            />
            <Input
              label="Institution Code"
              value={settings.institutionCode}
              onChange={(e) => setSettings({ ...settings, institutionCode: e.target.value })}
              required
            />
            <Input
              label="Administrative Email"
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              required
            />
            <Input
              label="Official Phone"
              value={settings.contactPhone}
              onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
              required
            />
          </div>
        </Card>

        {/* Academic Rules & Thresholds */}
        <Card className="space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            <span>Academic Rules & Attendance Threshold</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Academic Year"
              value={settings.academicYear}
              onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
              required
            />
            <Input
              label="Active Term / Semester"
              value={settings.currentSemester}
              onChange={(e) => setSettings({ ...settings, currentSemester: e.target.value })}
              required
            />
            <Input
              label="Attendance Risk Threshold (%)"
              type="number"
              value={settings.attendanceThresholdPercent}
              onChange={(e) => setSettings({ ...settings, attendanceThresholdPercent: Number(e.target.value) })}
              min={50}
              max={100}
              helperText="Students below this % are flagged as At Risk"
              required
            />
          </div>
        </Card>

        {/* Developer Credit & Governance */}
        <Card className="space-y-3 bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-slate-900 dark:to-slate-800/40 border-blue-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Code2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Principal Developer & Administrator Credit</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            System engineered by <strong>Sonam Pal</strong> (Admin: <span className="font-mono">sonampachb20p5@gmail.com</span>, Phone: <span className="font-mono">8795280892</span>).
          </p>
        </Card>

        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
};
