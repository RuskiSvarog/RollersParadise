import { useState, useEffect } from 'react';
import { Gift, Star, Flame, Award, Calendar, TrendingUp } from './Icons';
import { useDailyRewards, DAILY_REWARDS } from '../contexts/DailyRewardsContext';
import { useProgression } from '../contexts/ProgressionContext';

interface DailyRewardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed: (chips: number, xp: number) => void;
}

export function DailyRewardModal({ isOpen, onClose, onRewardClaimed }: DailyRewardModalProps) {
  const { currentStreak, canClaimToday, claimDailyReward, totalRewardsClaimed, longestStreak } = useDailyRewards();
  const { addXP, claimAllRewards } = useProgression();
  const [showReward, setShowReward] = useState(false);
  const [claimedReward, setClaimedReward] = useState<{ day: number; chips: number; xp: number; xpMultiplier?: number; bonus?: string } | null>(null);
  const [multiplierGain, setMultiplierGain] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const handleClaim = () => {
    const reward = claimDailyReward();
    if (reward) {
      setClaimedReward(reward);
      setShowReward(true);
      
      // Award XP through progression system
      addXP(reward.xp, 'Daily Login Bonus');
      
      // If there's an XP multiplier bonus, we need to add it via a temporary level reward
      if (reward.xpMultiplier) {
        setMultiplierGain(reward.xpMultiplier);
        // The multiplier from daily rewards needs special handling
        // We'll show it in the UI but it won't be applied through level rewards
        console.log(`🎯 Daily Reward XP Multiplier Bonus: +${reward.xpMultiplier}%`);
      }
      
      // Notify parent to update chips
      onRewardClaimed(reward.chips, reward.xp);
      
      console.log('🎉 Daily reward claimed!', reward);
    }
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsExiting(false);
      setShowReward(false);
    }, 300);
  };

  const nextRewardDay = ((currentStreak) % 7) + 1;
  const nextReward = DAILY_REWARDS[nextRewardDay - 1];

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
        isExiting ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-300'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-4 border-yellow-500 ${
          isExiting
            ? 'animate-out zoom-out-95 slide-out-to-bottom-4 fade-out duration-300'
            : 'animate-in zoom-in-95 slide-in-from-bottom-4 fade-in duration-300'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {!showReward ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 rounded-t-xl relative overflow-hidden">
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
              </div>
              
              <div className="flex justify-between items-center relative z-10">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-3 rounded-xl">
                    <Gift className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-white text-3xl font-bold">Daily Rewards</h2>
                    <p className="text-yellow-100 text-sm">Come back every day for amazing prizes!</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white hover:text-gray-200 transition-colors text-2xl font-bold w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Streak info */}
              <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 border-2 border-orange-500/50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Flame className="w-8 h-8 text-orange-500" />
                    <div>
                      <h3 className="text-white text-xl font-bold">Current Streak</h3>
                      <p className="text-orange-300 text-sm">Keep it going!</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-orange-400">{currentStreak}</div>
                    <div className="text-orange-300 text-sm">days</div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-gray-400 mb-1">Total Claimed</div>
                    <div className="text-white font-bold text-lg">{totalRewardsClaimed}</div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <div className="text-gray-400 mb-1">Longest Streak</div>
                    <div className="text-white font-bold text-lg">{longestStreak} days</div>
                  </div>
                </div>
              </div>

              {/* 7-day reward calendar */}
              <div className="bg-gray-800/50 rounded-xl p-5 border-2 border-purple-500/30">
                <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-400" />
                  7-Day Reward Calendar
                </h3>
                
                <div className="grid grid-cols-7 gap-2">
                  {DAILY_REWARDS.map((reward, index) => {
                    const dayNum = index + 1;
                    const streakDay = ((currentStreak - 1) % 7) + 1;
                    const isToday = canClaimToday && dayNum === nextRewardDay;
                    const isClaimed = !canClaimToday && dayNum <= streakDay;
                    const isUpcoming = dayNum > streakDay && !isToday;
                    
                    return (
                      <div
                        key={dayNum}
                        className={`relative p-3 rounded-lg border-2 transition-all ${
                          isToday
                            ? 'bg-yellow-500/20 border-yellow-500 shadow-lg shadow-yellow-500/50 scale-105'
                            : isClaimed
                            ? 'bg-green-900/20 border-green-500/50'
                            : 'bg-gray-900/30 border-gray-700'
                        }`}
                      >
                        {isClaimed && (
                          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                            <Award className="w-3 h-3 text-white" />
                          </div>
                        )}
                        
                        <div className={`text-center text-xs font-bold mb-1 ${
                          isToday ? 'text-yellow-400' : isClaimed ? 'text-green-400' : 'text-gray-500'
                        }`}>
                          Day {dayNum}
                        </div>
                        
                        <div className="space-y-1">
                          <div className={`text-xs ${
                            isToday ? 'text-white' : isClaimed ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            💰 ${reward.chips}
                          </div>
                          <div className={`text-xs ${
                            isToday ? 'text-white' : isClaimed ? 'text-gray-300' : 'text-gray-600'
                          }`}>
                            ⭐ {reward.xp} XP
                          </div>
                          {reward.bonus && (
                            <div className={`text-xs font-bold ${
                              isToday ? 'text-yellow-300' : isClaimed ? 'text-green-300' : 'text-gray-600'
                            }`}>
                              🎁 Bonus!
                            </div>
                          )}
                        </div>
                        
                        {isToday && (
                          <div className="absolute inset-0 rounded-lg bg-yellow-500/10 animate-pulse" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Next reward preview */}
              {canClaimToday && (
                <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-xl p-5">
                  <h3 className="text-yellow-400 text-xl font-bold mb-3 flex items-center gap-2">
                    <Star className="w-6 h-6 fill-yellow-400" />
                    Today's Reward - Day {nextRewardDay}!
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-3xl mb-2">💰</div>
                      <div className="text-white font-bold text-2xl">${nextReward.chips}</div>
                      <div className="text-gray-400 text-sm">Chips</div>
                    </div>
                    <div className="bg-gray-800/50 rounded-lg p-4 text-center">
                      <div className="text-3xl mb-2">⭐</div>
                      <div className="text-white font-bold text-2xl">{nextReward.xp}</div>
                      <div className="text-gray-400 text-sm">XP</div>
                    </div>
                  </div>
                  
                  {nextReward.bonus && (
                    <div className="bg-purple-900/30 border border-purple-500/50 rounded-lg p-3 mb-4">
                      <div className="text-purple-300 text-sm font-bold text-center">
                        🎁 {nextReward.bonus}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleClaim}
                    className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6 py-4 rounded-lg font-bold text-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-yellow-500/50 hover:scale-105"
                  >
                    <Gift className="w-6 h-6" />
                    CLAIM REWARD!
                  </button>
                </div>
              )}

              {/* Already claimed today */}
              {!canClaimToday && (
                <div className="bg-gray-800/50 border-2 border-gray-700 rounded-xl p-5 text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <h3 className="text-white text-xl font-bold mb-2">Already Claimed Today!</h3>
                  <p className="text-gray-400 mb-4">Come back tomorrow for your next reward</p>
                  
                  <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3">
                    <div className="text-blue-300 text-sm">
                      <strong>Tomorrow's Reward (Day {nextRewardDay}):</strong>
                      <div className="mt-2 flex justify-center gap-4">
                        <span>💰 ${nextReward.chips}</span>
                        <span>⭐ {nextReward.xp} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Reward claimed animation */
          <div className="p-12 text-center">
            <div className="mb-6 animate-in zoom-in-0 spin-in-180 duration-700">
              <div className="text-9xl mb-4">🎉</div>
            </div>
            
            <h2 className="text-white text-4xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '0.3s' }}>
              Reward Claimed!
            </h2>
            
            <div className="space-y-4 mb-6 animate-in fade-in zoom-in-95 duration-500" style={{ animationDelay: '0.5s' }}>
              <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-xl p-6">
                <div className="text-yellow-400 text-lg font-bold mb-3">Day {claimedReward?.day} Rewards</div>
                <div className="flex justify-center gap-8">
                  <div>
                    <div className="text-5xl font-bold text-white mb-1">+${claimedReward?.chips}</div>
                    <div className="text-gray-400">Chips</div>
                  </div>
                  <div>
                    <div className="text-5xl font-bold text-purple-400 mb-1">+{claimedReward?.xp}</div>
                    <div className="text-gray-400">XP</div>
                  </div>
                </div>
                
                {claimedReward?.bonus && (
                  <div className="mt-4 bg-purple-900/30 border border-purple-500/50 rounded-lg p-3">
                    <div className="text-purple-300 font-bold">
                      🎁 {claimedReward.bonus}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-orange-400 text-lg">
                🔥 Current Streak: {currentStreak} days!
              </div>
            </div>
            
            <button
              onClick={handleClose}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg font-bold text-lg transition-all"
            >
              AWESOME! LET'S PLAY! 🎲
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin-in-180 {
          from { transform: scale(0) rotate(-180deg); }
          to { transform: scale(1) rotate(0deg); }
        }
        .spin-in-180 {
          animation: spin-in-180 0.7s ease-out;
        }
      `}</style>
    </div>
  );
}
