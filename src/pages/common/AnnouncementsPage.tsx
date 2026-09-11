import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Announcement } from '../../types';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import {
  Bell,
  Plus,
  Search,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

export const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetRole: 'All',
    priority: 'Normal',
    expiresAt: '2026-10-01',
  });
  const [createLoading, setCreateLoading] = useState(false);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/common/announcements');
      if (res && res.success && res.data) {
        const list = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.announcements)
          ? res.data.announcements
          : [];
        setAnnouncements(list);
      } else {
        setAnnouncements([]);
      }
    } catch (err) {
      console.error('Failed to load announcements:', err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await api.post('/common/announcements', formData);
      setIsModalOpen(false);
      setFormData({
        title: '',
        content: '',
        targetRole: 'All',
        priority: 'Normal',
        expiresAt: '2026-10-01',
      });
      fetchAnnouncements();
    } catch (err: any) {
      alert(err.message || 'Failed to broadcast announcement.');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/common/announcements/${id}`);
      setDeleteConfirmId(null);
      fetchAnnouncements();
    } catch (err: any) {
      console.error('Failed to delete announcement:', err);
    }
  };

  const filteredAnnouncements = announcements.filter(
    (a) =>
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.content.toLowerCase().includes(search.toLowerCase())
  );

  const canCreate = user?.role === 'admin' || user?.role === 'teacher';

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Urgent':
        return <Badge variant="danger" size="sm">Urgent</Badge>;
      case 'High':
        return <Badge variant="warning" size="sm">High Priority</Badge>;
      default:
        return <Badge variant="neutral" size="sm">General</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-blue-600" />
            <span>Campus Announcements & Broadcasts</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Institutional notices, emergency alerts, and academic deadlines
          </p>
        </div>

        {canCreate && (
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Broadcast Announcement
          </Button>
        )}
      </div>

      {/* Search */}
      <Card className="p-4">
        <Input
          placeholder="Search announcements by keyword..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </Card>

      {/* Announcements List */}
      {loading ? (
        <div className="space-y-4">
          <SkeletonLoader variant="card" count={3} />
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8" />}
          title="No announcements found"
          description="There are currently no active campus broadcast notices matching your search."
        />
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((a) => (
            <Card
              key={a.id}
              className={`p-5 space-y-3 hoverEffect border-l-4 ${
                a.priority === 'Urgent'
                  ? 'border-l-red-500'
                  : a.priority === 'High'
                  ? 'border-l-amber-500'
                  : 'border-l-blue-500'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {a.title}
                    </h3>
                    {getPriorityBadge(a.priority)}
                    <Badge variant="primary" size="sm">
                      Target: {a.targetRole}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Posted by {a.authorName} on {new Date(a.createdAt).toLocaleDateString()}</span>
                  </p>
                </div>

                {user?.role === 'admin' && (
                  deleteConfirmId === a.id ? (
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDelete(a.id)}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-semibold cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setDeleteConfirmId(a.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Delete notice"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )
                )}
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {a.content}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Broadcast Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Broadcast Announcement"
        subtitle="Publish institutional notification to selected roles"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Announcement Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="e.g. Mid-Term Examination Schedule Released"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Audience Target"
              value={formData.targetRole}
              options={[
                { value: 'All', label: 'All Users (Campus-Wide)' },
                { value: 'student', label: 'Students Only' },
                { value: 'teacher', label: 'Faculty / Teachers Only' },
              ]}
              onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
            />

            <Select
              label="Priority Level"
              value={formData.priority}
              options={[
                { value: 'Normal', label: 'Normal / Informational' },
                { value: 'High', label: 'High Priority' },
                { value: 'Urgent', label: 'Urgent Alert' },
              ]}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Notice Content
            </label>
            <textarea
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Write full announcement details..."
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-3 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={createLoading}>
              Broadcast Notice
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
