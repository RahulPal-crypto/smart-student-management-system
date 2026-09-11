import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { AchievementItem } from '../../types';
import { BadgeCard } from '../../components/smart/BadgeCard';
import { SkeletonLoader } from '../../components/ui/SkeletonLoader';
import { Award, Sparkles } from 'lucide-react';

export const StudentBadgesPage: React.FC = () => {
  const [badges, setBadges] = useState<AchievementItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBadges = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/student/badges');
      if (res.success && res.data) {
        setBadges(res.data);
      }
    } catch (err) {
      console.error('Failed to load badges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SkeletonLoader variant="card" count={6} />
      </div>
    );
  }

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            <span>Academic Achievements & Badges</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Earn merit milestones for perfect attendance streaks, top exam scores, and fast submissions
          </p>
        </div>

        <div className="px-3.5 py-1.5 rounded-full bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>{unlockedCount} of {badges.length} Badges Unlocked</span>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {badges.map((b) => (
          <BadgeCard key={b.badgeId} achievement={b} />
        ))}
      </div>
    </div>
  );
};
