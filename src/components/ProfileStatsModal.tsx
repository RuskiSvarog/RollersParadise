import { useState, useEffect } from 'react';
import { 
  X, Trophy, TrendingUp, DollarSign, Target, Flame, Crown, 
  Star, Award, Zap, BarChart3, TrendingDown, Calendar,
  Medal, Sparkles, Users, Dice1, Filter
} from './Icons';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ALL_ACHIEVEMENTS, Achievement, getCategoryIcon, getCategoryName } from '../utils/achievements';

interface ProfileStatsModalProps {
  onClose: () => void;
  playerName: string;
  playerEmail: string;
  currentBalance: number;
}

interface PlayerStats {
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  biggestWin: number;
  totalWagered: number;
  totalWon: number;
  currentStreak: number;
  longestStreak: number;
  winRate: number;
  favoriteNumber: number;
  level: number;
  experience: number;
  rank: number;
  totalPlayers: number;
  achievements: Achievement[];
  recentGames: RecentGame[];
}

interface RecentGame {
  date: number;
  result: 'win' | 'loss';
  amount: number;
}

export function ProfileStatsModal({ onClose, playerName, playerEmail, currentBalance }: ProfileStatsModalProps) {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'history'>('overview');
  const [achievementFilter, setAchievementFilter] = useState<'all' | Achievement['category']>('all');

  useEffect(() => {
    fetchPlayerStats();
  }, [playerEmail]);

  const fetchPlayerStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/player/stats?email=${encodeURIComponent(playerEmail)}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Real player stats loaded:', data);
        setStats(data);
      } else {
        console.error('❌ Failed to fetch player stats - NO FAKE DATA!');
        // Don't show fake data - let the UI handle null state
        setStats(null);
      }
    } catch (error) {
      console.error('Failed to fetch player stats:', error);
      // Don't show fake data - let the UI handle null state
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'from-gray-500 to-gray-700';
      case 'rare': return 'from-blue-500 to-blue-700';
      case 'epic': return 'from-purple-500 to-purple-700';
      case 'legendary': return 'from-yellow-400 to-orange-600';
    }
  };

  const getRarityGlow = (rarity: Achievement['rarity']) => {
    switch (rarity) {
      case 'common': return 'shadow-gray-500/50';
      case 'rare': return 'shadow-blue-500/50';
      case 'epic': return 'shadow-purple-500/50';
      case 'legendary': return 'shadow-yellow-400/50';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
        <div className="text-yellow-400 text-2xl animate-spin">
          <Sparkles className="w-16 h-16" />
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="relative max-w-6xl w-full animate-in fade-in zoom-in-95 slide-in-from-bottom-12 duration-300">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-3xl opacity-40" style={{ filter: 'blur(48px)' }} />
        
        {/* Main Container */}
        <div className="relative bg-gradient-to-br from-black via-gray-900 to-black border-4 border-yellow-500 rounded-3xl shadow-2xl shadow-yellow-500/50 overflow-hidden">
          
          {/* Animated Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-twinkle"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Header */}
          <div className="relative border-b-4 border-yellow-600 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full blur-lg opacity-75" />
                  <div className="relative w-20 h-20 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center border-4 border-yellow-300 shadow-xl">
                    <Crown className="w-10 h-10 text-white" />
                  </div>
                  {/* Level Badge */}
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center border-2 border-white shadow-lg">
                    <span className="text-sm font-bold">{stats.level}</span>
                  </div>
                </div>

                {/* Player Info */}
                <div>
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                    {playerName}
                  </h2>
                  <p className="text-gray-400 text-sm">{playerEmail}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-300 text-sm">
                      Rank #{stats.rank} of {stats.totalPlayers}
                    </span>
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl transition-all hover:scale-110 shadow-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* XP Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>Level {stats.level}</span>
                <span>{stats.experience} / {stats.level * 1000} XP</span>
              </div>
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden border-2 border-gray-700">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                  style={{ 
                    width: `${(stats.experience / (stats.level * 1000)) * 100}%`,
                    transitionDelay: '0.3s',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="relative border-b-2 border-gray-800 bg-black/50">
            <div className="flex">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'achievements', label: 'Achievements', icon: Trophy },
                { id: 'history', label: 'History', icon: Calendar },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white border-b-4 border-yellow-400'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  <span className="font-bold">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="relative p-6 max-h-[60vh] overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {/* Current Balance */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-600 to-emerald-800 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-black via-green-950 to-black border-2 border-green-600 rounded-xl p-4">
                      <DollarSign className="w-8 h-8 text-green-400 mb-2" />
                      <div className="text-gray-400 text-xs mb-1">Balance</div>
                      <div className="text-2xl font-bold text-green-400">${currentBalance.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Total Games */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-800 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-black via-blue-950 to-black border-2 border-blue-600 rounded-xl p-4">
                      <Dice1 className="w-8 h-8 text-blue-400 mb-2" />
                      <div className="text-gray-400 text-xs mb-1">Games Played</div>
                      <div className="text-2xl font-bold text-blue-400">{stats.totalGamesPlayed}</div>
                    </div>
                  </div>

                  {/* Win Rate */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-800 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-black via-purple-950 to-black border-2 border-purple-600 rounded-xl p-4">
                      <Target className="w-8 h-8 text-purple-400 mb-2" />
                      <div className="text-gray-400 text-xs mb-1">Win Rate</div>
                      <div className="text-2xl font-bold text-purple-400">{stats.winRate.toFixed(1)}%</div>
                    </div>
                  </div>

                  {/* Biggest Win */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-black via-amber-950 to-black border-2 border-yellow-500 rounded-xl p-4">
                      <Crown className="w-8 h-8 text-yellow-400 mb-2" />
                      <div className="text-gray-400 text-xs mb-1">Biggest Win</div>
                      <div className="text-2xl font-bold text-yellow-400">${stats.biggestWin.toFixed(0)}</div>
                    </div>
                  </div>
                </div>

                {/* Detailed Stats */}
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Performance Stats */}
                  <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-700 rounded-xl p-5">
                    <h3 className="text-yellow-400 font-bold mb-4 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Performance
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Wins</span>
                        <span className="text-green-400 font-bold">{stats.totalWins}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Losses</span>
                        <span className="text-red-400 font-bold">{stats.totalLosses}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Current Streak</span>
                        <span className={`font-bold ${stats.currentStreak >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stats.currentStreak >= 0 ? '+' : ''}{stats.currentStreak}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Longest Streak</span>
                        <span className="text-yellow-400 font-bold flex items-center gap-1">
                          <Flame className="w-4 h-4" />
                          {stats.longestStreak}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Money Stats */}
                  <div className="bg-gradient-to-br from-gray-900 to-black border-2 border-gray-700 rounded-xl p-5">
                    <h3 className="text-yellow-400 font-bold mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Financial
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Wagered</span>
                        <span className="text-white font-bold">${stats.totalWagered.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Won</span>
                        <span className="text-green-400 font-bold">${stats.totalWon.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Net Profit/Loss</span>
                        <span className={`font-bold ${stats.totalWon - stats.totalWagered >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stats.totalWon - stats.totalWagered >= 0 ? '+' : ''}${(stats.totalWon - stats.totalWagered).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Favorite Number</span>
                        <span className="text-yellow-400 font-bold text-xl">{stats.favoriteNumber}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'achievements' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                <div className="grid md:grid-cols-2 gap-4">
                  {stats.achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className={`relative group ${achievement.unlocked ? '' : 'opacity-50'}`}
                    >
                      <div className={`absolute inset-0 bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity`} />
                      <div className="relative bg-gradient-to-br from-gray-900 to-black border-2 border-gray-700 rounded-xl p-5">
                        <div className="flex items-start gap-4">
                          <div className={`w-16 h-16 bg-gradient-to-br ${getRarityColor(achievement.rarity)} rounded-xl flex items-center justify-center text-3xl shadow-xl ${getRarityGlow(achievement.rarity)}`}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-bold">{achievement.name}</h4>
                              {achievement.unlocked && <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />}
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{achievement.description}</p>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs px-2 py-1 rounded ${
                                achievement.rarity === 'legendary' ? 'bg-yellow-600 text-white' :
                                achievement.rarity === 'epic' ? 'bg-purple-600 text-white' :
                                achievement.rarity === 'rare' ? 'bg-blue-600 text-white' :
                                'bg-gray-600 text-white'
                              }`}>
                                {achievement.rarity.toUpperCase()}
                              </span>
                              {achievement.unlocked ? (
                                <span className="text-green-400 text-sm font-bold">✓ Unlocked</span>
                              ) : achievement.progress !== undefined && achievement.maxProgress !== undefined ? (
                                <div className="flex-1">
                                  <div className="text-xs text-gray-400 mb-1">{achievement.progress}/{achievement.maxProgress}</div>
                                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                                      style={{ width: `${(achievement.progress / achievement.maxProgress) * 100}%` }}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span className="text-gray-500 text-sm">🔒 Locked</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="animate-in fade-in slide-in-from-left-4 duration-300">
                {stats.recentGames.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No recent games yet. Start playing to build your history!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recentGames.map((game, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-gray-900 to-black border-2 border-gray-700 rounded-xl p-4 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            game.result === 'win' ? 'bg-green-600' : 'bg-red-600'
                          }`}>
                            {game.result === 'win' ? <TrendingUp className="w-6 h-6 text-white" /> : <TrendingDown className="w-6 h-6 text-white" />}
                          </div>
                          <div>
                            <div className="text-white font-bold">{game.result === 'win' ? 'Win' : 'Loss'}</div>
                            <div className="text-gray-400 text-sm">{new Date(game.date).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className={`text-xl font-bold ${game.result === 'win' ? 'text-green-400' : 'text-red-400'}`}>
                          {game.result === 'win' ? '+' : '-'}${Math.abs(game.amount).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="relative border-t-4 border-yellow-600 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 p-4">
            <p className="text-center text-gray-400 text-sm">
              Keep playing to level up and unlock more achievements! 🎰
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0); }
          50% { opacity: 1; transform: scale(1); }
        }
        .animate-twinkle {
          animation: twinkle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}