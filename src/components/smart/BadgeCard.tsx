import React from 'react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Award, Zap, Target, Flame, Code, Lock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { AchievementItem } from '../../types';

interface BadgeCardProps {
  achievement: AchievementItem;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ achievement }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-6 h-6 text-amber-500" />;
      case 'Target':
        return <Target className="w-6 h-6 text-indigo-500" />;
      case 'Flame':
        return <Flame className="w-6 h-6 text-red-500" />;
      case 'Code':
        return <Code className="w-6 h-6 text-blue-500" />;
      default:
        return <Award className="w-6 h-6 text-emerald-500" />;
    }
  };

  const handleCardClick = () => {
    if (achievement.unlocked) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`p-4 transition-all duration-200 cursor-pointer ${
        achievement.unlocked
          ? 'bg-gradient-to-br from-white to-slate-50/80 dark:from-slate-900 dark:to-slate-800/40 border-slate-200 dark:border-slate-700 hover:scale-[1.02] shadow-xs'
          : 'bg-slate-50/60 dark:bg-slate-900/30 border-dashed border-slate-200 dark:border-slate-800 opacity-60'
      }`}
    >
      <div className="flex items-start gap-3.5">
        <div
          className={`p-3 rounded-2xl shrink-0 ${
            achievement.unlocked
              ? 'bg-amber-50 dark:bg-amber-950/60 shadow-xs border border-amber-200 dark:border-amber-900'
              : 'bg-slate-200 dark:bg-slate-800'
          }`}
        >
          {achievement.unlocked ? (
            getIcon(achievement.icon)
          ) : (
            <Lock className="w-6 h-6 text-slate-400" />
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-1">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {achievement.title}
            </h4>
            <Badge
              variant={achievement.unlocked ? 'success' : 'neutral'}
              size="sm"
            >
              {achievement.unlocked ? 'Unlocked' : 'Locked'}
            </Badge>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {achievement.description}
          </p>

          {achievement.unlocked && achievement.unlockedAt && (
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium block pt-1">
              Earned on {new Date(achievement.unlockedAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};
