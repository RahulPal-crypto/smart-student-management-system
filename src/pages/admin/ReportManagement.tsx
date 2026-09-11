import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Select } from '../../components/ui/Select';
import { FileText, Download, Printer, CheckCircle2, BarChart3, Users, CalendarCheck2, CreditCard } from 'lucide-react';

export const ReportManagement: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const reports = [
    {
      id: 'rep-att',
      title: 'Institutional Attendance & Risk Report',
      description: 'Comprehensive lecture attendance data, student risk status, and intervention metrics.',
      format: 'CSV / PDF',
      category: 'Attendance',
      icon: CalendarCheck2,
      records: '150+ student log entries',
    },
    {
      id: 'rep-acad',
      title: 'Semester Academic Health Summary',
      description: 'Multi-factor health scores, GPA distribution, and class performance averages.',
      format: 'CSV / Spreadsheet',
      category: 'Academic',
      icon: BarChart3,
      records: '4 Active Departments',
    },
    {
      id: 'rep-stu',
      title: 'Student Enrollment & Demographics Directory',
      description: 'Full student directory with contact details, guardian information, and course enrolments.',
      format: 'CSV / Excel',
      category: 'Registry',
      icon: Users,
      records: 'Verified student records',
    },
    {
      id: 'rep-fee',
      title: 'Fee Collection & Dues Audit Report',
      description: 'Tuition balances, payments, overdue accounts, and institutional revenue totals.',
      format: 'Financial CSV',
      category: 'Finance',
      icon: CreditCard,
      records: 'Financial audit trail',
    },
  ];

  const handleExport = (repId: string, title: string) => {
    setDownloading(repId);
    setTimeout(() => {
      // Create a sample CSV download
      const csvContent = `data:text/csv;charset=utf-8,Report Title: ${title}\nGenerated Date: ${new Date().toISOString()}\nInstitution: Apex Institute of Technology\nLead Developer: Sonam Pal\nStatus: Verified\n`;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `${repId}_export.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloading(null);
    }, 800);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Institutional Reports & Exports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Download institutional compliance data, attendance rosters, and academic audits
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => window.print()}
          leftIcon={<Printer className="w-4 h-4" />}
        >
          Print System Overview
        </Button>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((rep) => {
          const Icon = rep.icon;
          return (
            <Card key={rep.id} className="p-5 space-y-4 hoverEffect flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                    <Icon className="w-6 h-6" />
                  </div>
                  <Badge variant="neutral" size="sm">
                    {rep.category}
                  </Badge>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {rep.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {rep.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">
                  {rep.records}
                </span>

                <Button
                  variant="primary"
                  size="sm"
                  isLoading={downloading === rep.id}
                  onClick={() => handleExport(rep.id, rep.title)}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Export CSV
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
