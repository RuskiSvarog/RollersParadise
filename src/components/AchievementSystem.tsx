import { Trophy, Target, Zap, Crown, Star, Flame, TrendingUp, X, Award } from './Icons';
import { useEffect, useState } from 'react';
import { AchievementTitleSelector } from './AchievementTitleSelector';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'target' | 'zap' | 'crown' | 'star' | 'flame' | 'trending';
  progress: number;
  maxProgress: number;
  reward: number;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementSystemProps {
  achievements: Achievement[];
  onClaim: (achievementId: string) => void;
  profile?: { name: string; email: string; avatar?: string } | null;
}

const iconMap = {
  trophy: Trophy,
  target: Target,
  zap: Zap,
  crown: Crown,
  star: Star,
  flame: Flame,
  trending: TrendingUp,
};

const rarityColors = {
  common: {
    bg: 'from-gray-600 to-gray-800',
    border: 'border-gray-500',
    glow: 'rgba(156, 163, 175, 0.3)',
    text: 'text-gray-300',
  },
  rare: {
    bg: 'from-blue-600 to-blue-800',
    border: 'border-blue-500',
    glow: 'rgba(59, 130, 246, 0.5)',
    text: 'text-blue-300',
  },
  epic: {
    bg: 'from-purple-600 to-purple-800',
    border: 'border-purple-500',
    glow: 'rgba(168, 85, 247, 0.5)',
    text: 'text-purple-300',
  },
  legendary: {
    bg: 'from-yellow-500 to-orange-600',
    border: 'border-yellow-400',
    glow: 'rgba(251, 191, 36, 0.6)',
    text: 'text-yellow-300',
  },
};

export function AchievementSystem({ achievements, onClaim, profile }: AchievementSystemProps) {
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement | null>(null);
  const [isExiting, setIsExiting] = useState(false);
  const [showTitleSelector, setShowTitleSelector] = useState(false);
  const [currentTitle, setCurrentTitle] = useState<string>(localStorage.getItem('selected-achievement-title') || '');

  useEffect(() => {
    // Check for newly unlocked achievements
    const unlockedAchievement = achievements.find(
      (a) => a.unlocked && a.progress >= a.maxProgress && !localStorage.getItem(`achievement-seen-${a.id}`)
    );

    if (unlockedAchievement) {
      setNewlyUnlocked(unlockedAchievement);
      setIsExiting(false);
      // Only save if not a guest
      const isGuest = profile?.email.includes('@temporary.local');
      if (!isGuest) {
        localStorage.setItem(`achievement-seen-${unlockedAchievement.id}`, 'true');
      }

      // Auto dismiss after 5 seconds
      setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          setNewlyUnlocked(null);
        }, 300);
      }, 5000);
    }
  }, [achievements, profile]);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;

  return (
    <>
      {/* Achievement Unlock Popup */}
      {newlyUnlocked && (
        <div
          className={`fixed top-24 left-1/2 -translate-x-1/2 z-50 ${
            isExiting
              ? 'animate-out fade-out slide-out-to-top-24 zoom-out-95 duration-300'
              : 'animate-in fade-in slide-in-from-top-24 zoom-in-95 duration-300'
          }`}
        >
          <div
            className={`bg-gradient-to-br ${rarityColors[newlyUnlocked.rarity].bg} border-4 ${rarityColors[newlyUnlocked.rarity].border} rounded-2xl p-6 shadow-2xl`}
            style={{
              boxShadow: `0 0 40px ${rarityColors[newlyUnlocked.rarity].glow}, 0 10px 40px rgba(0, 0, 0, 0.7)`,
            }}
          >
            <div className="text-center">
              <div className="inline-block mb-3 animate-spin-once">
                {(() => {
                  const Icon = iconMap[newlyUnlocked.icon];
                  return <Icon className={`w-16 h-16 ${rarityColors[newlyUnlocked.rarity].text} drop-shadow-xl`} />;
                })()}
              </div>
              <h3 className="text-white text-2xl font-bold mb-2" style={{ fontFamily: 'Impact, sans-serif' }}>
                ACHIEVEMENT UNLOCKED!
              </h3>
              <p className={`${rarityColors[newlyUnlocked.rarity].text} text-xl font-bold mb-1`}>
                {newlyUnlocked.title}
              </p>
              <p className="text-white/80 text-sm mb-3">{newlyUnlocked.description}</p>
              <div className="bg-black/30 rounded-lg p-3">
                <p className="text-green-300 text-lg font-bold">+${newlyUnlocked.reward} Reward!</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Achievement Panel */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 border-purple-500 rounded-2xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <h2 className="text-white text-2xl font-bold" style={{ fontFamily: 'Impact, sans-serif' }}>
                ACHIEVEMENTS
              </h2>
              <p className="text-gray-400 text-sm">
                {unlockedCount} / {totalCount} Unlocked
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Current Title Display */}
            {currentTitle && (
              <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg px-4 py-2">
                <div className="text-yellow-400 text-xs">Current Title:</div>
                <div className="text-white font-bold italic text-sm">"{currentTitle}"</div>
              </div>
            )}
            
            {/* Select Title Button */}
            <button
              onClick={() => setShowTitleSelector(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-lg flex items-center gap-2"
            >
              <Award className="w-4 h-4" />
              Select Title
            </button>
            
            <div className="bg-purple-600/30 rounded-full px-4 py-2">
              <p className="text-purple-300 font-bold">
                {Math.round((unlockedCount / totalCount) * 100)}% Complete
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-700 rounded-full h-3 overflow-hidden mb-6">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-1000 ease-out"
            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
          />
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
          {achievements.map((achievement) => {
            const Icon = iconMap[achievement.icon];
            const colors = rarityColors[achievement.rarity];
            const isComplete = achievement.progress >= achievement.maxProgress;
            const canClaim = isComplete && !achievement.unlocked;

            return (
              <div
                key={achievement.id}
                className={`bg-gradient-to-br ${colors.bg} border-2 ${colors.border} rounded-xl p-4 transition-all hover:scale-[1.02] ${
                  achievement.unlocked ? 'opacity-60' : ''
                }`}
                style={{
                  boxShadow: achievement.unlocked ? 'none' : `0 0 20px ${colors.glow}`,
                }}
              >
                <div className="flex items-start gap-4">
                  <div className={`${achievement.unlocked ? 'opacity-50' : ''}`}>
                    <Icon className={`w-12 h-12 ${colors.text}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="text-white font-bold">{achievement.title}</h4>
                        <p className="text-gray-300 text-xs uppercase tracking-wider">{achievement.rarity}</p>
                      </div>
                      {achievement.unlocked && (
                        <div className="bg-green-500/20 rounded-full px-3 py-1">
                          <span className="text-green-300 text-xs font-bold">✓ CLAIMED</span>
                        </div>
                      )}
                    </div>
                    <p className="text-white/70 text-sm mb-3">{achievement.description}</p>

                    {/* Progress Bar */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs text-white/60 mb-1">
                        <span>Progress</span>
                        <span>
                          {achievement.progress} / {achievement.maxProgress}
                        </span>
                      </div>
                      <div className="bg-black/30 rounded-full h-2 overflow-hidden">
                        <div
                          className={`bg-gradient-to-r ${
                            isComplete ? 'from-green-400 to-emerald-500' : 'from-blue-400 to-blue-600'
                          } h-full transition-all duration-500`}
                          style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Reward & Claim Button */}
                    <div className="flex items-center justify-between">
                      <div className="text-yellow-300 text-sm font-bold">💰 ${achievement.reward}</div>
                      {canClaim && (
                        <button
                          onClick={() => onClaim(achievement.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-lg font-bold text-sm transition-all hover:scale-105"
                        >
                          CLAIM
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes spin-once {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-once {
          animation: spin-once 1s ease-in-out;
        }
      `}</style>
      
      {/* Achievement Title Selector Modal */}
      {showTitleSelector && (
        <AchievementTitleSelector
          achievements={achievements}
          currentTitle={currentTitle}
          onClose={() => {
            setShowTitleSelector(false);
            setCurrentTitle(localStorage.getItem('selected-achievement-title') || '');
          }}
        />
      )}
    </>
  );
}
