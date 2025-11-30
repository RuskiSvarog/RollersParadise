import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Gift, Trophy, Crown, Star, TrendingUp, Calendar, 
  Zap, Award, Sparkles, Target, Flame, Clock, CheckCircle
} from 'lucide-react';
import { useDailyRewards } from '../contexts/DailyRewardsContext';
import { useMembership } from '../contexts/MembershipContext';
import { useProgression } from '../contexts/ProgressionContext';

interface RewardsCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimDailyReward?: () => void;
  onClaimMembershipBonus?: () => void;
  onClaimLevelRewards?: () => void;
}

export function RewardsCenter({ 
  isOpen, 
  onClose,
  onClaimDailyReward,
  onClaimMembershipBonus,
  onClaimLevelRewards
}: RewardsCenterProps) {
  const [activeTab, setActiveTab] = useState<'daily' | 'membership' | 'progression' | 'achievements'>('daily');
  
  const { currentStreak, canClaimToday, totalRewardsClaimed } = useDailyRewards();
  const { membershipStatus, canClaimDailyBonus, getMembershipPerks } = useMembership();
  const { level, xp, unclaimedRewards } = useProgression();
  
  const membershipPerks = getMembershipPerks();
  const hasUnclaimedLevelRewards = unclaimedRewards.length > 0;

  const tabs = [
    {
      id: 'daily' as const,
      name: 'Daily Rewards',
      icon: <Calendar className="w-5 h-5" />,
      badge: canClaimToday ? 1 : 0,
      gradient: 'from-blue-600 to-cyan-600'
    },
    {
      id: 'membership' as const,
      name: 'Membership',
      icon: <Crown className="w-5 h-5" />,
      badge: canClaimDailyBonus() ? 1 : 0,
      gradient: 'from-purple-600 to-pink-600'
    },
    {
      id: 'progression' as const,
      name: 'Level Rewards',
      icon: <TrendingUp className="w-5 h-5" />,
      badge: hasUnclaimedLevelRewards ? unclaimedRewards.length : 0,
      gradient: 'from-green-600 to-emerald-600'
    },
    {
      id: 'achievements' as const,
      name: 'Achievements',
      icon: <Trophy className="w-5 h-5" />,
      badge: 0,
      gradient: 'from-yellow-600 to-orange-600'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border-2 border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 p-6 border-b border-gray-700">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-7 h-7" />
              </button>
              
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center"
                >
                  <Gift className="w-8 h-8 text-white" strokeWidth={2.5} />
                </motion.div>
                <div>
                  <h2 className="text-white text-3xl font-black mb-1">Rewards Center</h2>
                  <p className="text-purple-200">Claim your daily bonuses and track your progress</p>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-gray-900/50 border-b border-gray-700 px-6">
              <div className="flex gap-2 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-6 py-4 font-bold transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'text-white'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    <div className={`flex items-center gap-2 ${
                      activeTab === tab.id ? `bg-gradient-to-r ${tab.gradient} bg-clip-text text-transparent` : ''
                    }`}>
                      {tab.icon}
                      <span>{tab.name}</span>
                    </div>
                    
                    {tab.badge > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-black shadow-lg"
                      >
                        {tab.badge}
                      </motion.div>
                    )}
                    
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${tab.gradient} rounded-t`}
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <AnimatePresence mode="wait">
                {/* Daily Rewards Tab */}
                {activeTab === 'daily' && (
                  <motion.div
                    key="daily"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 border-2 border-blue-500/50 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                            <Flame className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <p className="text-blue-300 text-sm font-semibold">Current Streak</p>
                            <p className="text-white text-4xl font-black">{currentStreak}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {[...Array(Math.min(currentStreak, 7))].map((_, i) => (
                            <div key={i} className="flex-1 h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full" />
                          ))}
                          {[...Array(Math.max(0, 7 - currentStreak))].map((_, i) => (
                            <div key={i} className="flex-1 h-2 bg-gray-700 rounded-full" />
                          ))}
                        </div>
                      </div>

                      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-2 border-purple-500/50 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Trophy className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <p className="text-purple-300 text-sm font-semibold">Total Claimed</p>
                            <p className="text-white text-4xl font-black">{totalRewardsClaimed}</p>
                          </div>
                        </div>
                        <p className="text-purple-400 text-sm">Lifetime rewards collected</p>
                      </div>
                    </div>

                    <motion.button
                      whileHover={canClaimToday ? { scale: 1.02 } : {}}
                      whileTap={canClaimToday ? { scale: 0.98 } : {}}
                      onClick={onClaimDailyReward}
                      disabled={!canClaimToday}
                      className={`w-full py-6 rounded-2xl font-black text-xl shadow-lg transition-all ${
                        canClaimToday
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white cursor-pointer'
                          : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {canClaimToday ? (
                        <>
                          <Gift className="inline w-6 h-6 mr-2" />
                          CLAIM DAILY REWARD
                        </>
                      ) : (
                        <>
                          <CheckCircle className="inline w-6 h-6 mr-2" />
                          ALREADY CLAIMED TODAY
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                )}

                {/* Membership Tab */}
                {activeTab === 'membership' && (
                  <motion.div
                    key="membership"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border-2 border-purple-500/50 rounded-2xl p-8 mb-6">
                      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Crown className="w-10 h-10 text-white" />
                          </div>
                          <div>
                            <p className="text-gray-400 text-sm">Current Tier</p>
                            <p className="text-white text-3xl font-black uppercase">{membershipStatus.tier}</p>
                          </div>
                        </div>
                        {membershipStatus.tier !== 'free' && (
                          <div className="text-right">
                            <p className="text-gray-400 text-sm">Daily Bonus</p>
                            <p className="text-yellow-400 text-2xl font-black">${membershipPerks.dailyBonus}</p>
                          </div>
                        )}
                      </div>

                      {membershipStatus.tier === 'free' ? (
                        <div className="text-center py-8">
                          <p className="text-gray-400 mb-4">You're on the free tier</p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-xl"
                          >
                            Upgrade Membership
                          </motion.button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                            <div className="text-yellow-400 text-2xl font-black mb-1">
                              ${membershipPerks.dailyBonus}
                            </div>
                            <div className="text-gray-400 text-xs">Daily Bonus</div>
                          </div>
                          <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                            <div className="text-purple-400 text-2xl font-black mb-1">
                              +{((membershipPerks.xpMultiplier - 1) * 100).toFixed(0)}%
                            </div>
                            <div className="text-gray-400 text-xs">XP Boost</div>
                          </div>
                          <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                            <div className="text-green-400 text-2xl font-black mb-1">
                              ${membershipPerks.maxBet.toLocaleString()}
                            </div>
                            <div className="text-gray-400 text-xs">Max Bet</div>
                          </div>
                          <div className="bg-gray-900/50 rounded-xl p-4 text-center">
                            <div className="text-blue-400 text-2xl font-black mb-1">
                              {membershipPerks.exclusiveThemes === 999 ? 'All' : membershipPerks.exclusiveThemes}
                            </div>
                            <div className="text-gray-400 text-xs">Themes</div>
                          </div>
                        </div>
                      )}
                    </div>

                    {membershipStatus.tier !== 'free' && (
                      <motion.button
                        whileHover={canClaimDailyBonus() ? { scale: 1.02 } : {}}
                        whileTap={canClaimDailyBonus() ? { scale: 0.98 } : {}}
                        onClick={onClaimMembershipBonus}
                        disabled={!canClaimDailyBonus()}
                        className={`w-full py-6 rounded-2xl font-black text-xl shadow-lg transition-all ${
                          canClaimDailyBonus()
                            ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white cursor-pointer'
                            : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        {canClaimDailyBonus() ? (
                          <>
                            <Crown className="inline w-6 h-6 mr-2" />
                            CLAIM MEMBERSHIP BONUS
                          </>
                        ) : (
                          <>
                            <CheckCircle className="inline w-6 h-6 mr-2" />
                            BONUS ALREADY CLAIMED
                          </>
                        )}
                      </motion.button>
                    )}
                  </motion.div>
                )}

                {/* Progression Tab */}
                {activeTab === 'progression' && (
                  <motion.div
                    key="progression"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                            <Star className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <p className="text-green-300 text-sm font-semibold">Your Level</p>
                            <p className="text-white text-4xl font-black">{level}</p>
                          </div>
                        </div>
                        <div className="bg-gray-900/50 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all"
                            style={{ width: `${(xp % 1000) / 10}%` }}
                          />
                        </div>
                        <p className="text-green-400 text-xs mt-2">{xp % 1000} / 1000 XP to next level</p>
                      </div>

                      <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-2xl p-6">
                        <div className="flex items-center gap-4 mb-4">
                          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                            <Award className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <p className="text-yellow-300 text-sm font-semibold">Unclaimed Rewards</p>
                            <p className="text-white text-4xl font-black">{unclaimedRewards.length}</p>
                          </div>
                        </div>
                        <p className="text-yellow-400 text-sm">Level-up rewards waiting for you!</p>
                      </div>
                    </div>

                    {hasUnclaimedLevelRewards && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onClaimLevelRewards}
                        className="w-full py-6 rounded-2xl font-black text-xl shadow-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white"
                      >
                        <Award className="inline w-6 h-6 mr-2" />
                        CLAIM ALL LEVEL REWARDS
                      </motion.button>
                    )}
                  </motion.div>
                )}

                {/* Achievements Tab */}
                {activeTab === 'achievements' && (
                  <motion.div
                    key="achievements"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                  >
                    <div className="text-center py-12">
                      <Trophy className="w-20 h-20 text-gray-600 mx-auto mb-4" />
                      <h3 className="text-white text-2xl font-bold mb-2">Achievements Coming Soon</h3>
                      <p className="text-gray-400">Complete challenges and unlock exclusive rewards!</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
