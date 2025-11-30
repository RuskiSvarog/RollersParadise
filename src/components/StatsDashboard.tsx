import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, TrendingUp, TrendingDown, DollarSign, Dices, Target, Trophy, Calendar, Clock, Percent, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

interface StatsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

interface GameStats {
  totalRolls: number;
  totalWagered: number;
  totalWon: number;
  totalLost: number;
  biggestWin: number;
  biggestLoss: number;
  favoriteNumber: number;
  passLineWins: number;
  passLineLosses: number;
  dontPassWins: number;
  dontPassLosses: number;
  fieldWins: number;
  fieldLosses: number;
  placeWins: number;
  placeLosses: number;
  hardwayHits: number;
  sevenOutCount: number;
  pointsMade: number;
  pointsMissed: number;
  longestWinStreak: number;
  longestLossStreak: number;
  currentWinStreak: number;
  totalPlayTime: number; // in minutes
  sessionsPlayed: number;
  averageBetSize: number;
  profitLoss: number;
  winRate: number;
  numberRolls: { [key: number]: number }; // Frequency of each dice total
}

const defaultStats: GameStats = {
  totalRolls: 0,
  totalWagered: 0,
  totalWon: 0,
  totalLost: 0,
  biggestWin: 0,
  biggestLoss: 0,
  favoriteNumber: 7,
  passLineWins: 0,
  passLineLosses: 0,
  dontPassWins: 0,
  dontPassLosses: 0,
  fieldWins: 0,
  fieldLosses: 0,
  placeWins: 0,
  placeLosses: 0,
  hardwayHits: 0,
  sevenOutCount: 0,
  pointsMade: 0,
  pointsMissed: 0,
  longestWinStreak: 0,
  longestLossStreak: 0,
  currentWinStreak: 0,
  totalPlayTime: 0,
  sessionsPlayed: 0,
  averageBetSize: 0,
  profitLoss: 0,
  winRate: 0,
  numberRolls: { 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
};

export function StatsDashboard({ isOpen, onClose, userEmail }: StatsDashboardProps) {
  const [stats, setStats] = useState<GameStats>(defaultStats);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'bets' | 'numbers' | 'streaks'>('overview');

  useEffect(() => {
    if (isOpen) {
      loadStats();
    }
  }, [isOpen, userEmail]);

  const loadStats = () => {
    setIsLoading(true);
    try {
      // Load stats from localStorage
      const savedStats = localStorage.getItem(`game-stats-${userEmail}`);
      if (savedStats) {
        const parsedStats = JSON.parse(savedStats);
        setStats(parsedStats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const profitLoss = stats.totalWon - stats.totalLost;
  const isProfitable = profitLoss >= 0;
  const winRate = stats.totalRolls > 0 ? ((stats.totalWon / stats.totalWagered) * 100).toFixed(1) : '0.0';
  const roi = stats.totalWagered > 0 ? (((profitLoss / stats.totalWagered) * 100).toFixed(1)) : '0.0';

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.95) 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border-4"
        style={{
          background: 'linear-gradient(135deg, #14532d 0%, #15803d 20%, #16a34a 40%, #15803d 60%, #14532d 100%)',
          borderColor: '#fbbf24',
          boxShadow: '0 0 60px rgba(251, 191, 36, 0.6), 0 20px 80px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* HEADER */}
        <div
          className="sticky top-0 p-6 flex justify-between items-center border-b-4 z-10"
          style={{
            background: 'linear-gradient(135deg, #b45309 0%, #d97706 25%, #f59e0b 50%, #d97706 75%, #b45309 100%)',
            borderColor: '#fbbf24',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.2)',
          }}
        >
          <div className="flex items-center gap-4">
            <BarChart3 className="w-12 h-12" style={{ color: '#fbbf24' }} />
            <div>
              <h2
                className="text-4xl font-bold uppercase tracking-wider"
                style={{
                  color: '#fef3c7',
                  textShadow: '0 0 20px rgba(251, 191, 36, 0.8), 0 4px 8px rgba(0, 0, 0, 0.8)',
                }}
              >
                📊 Statistics Dashboard
              </h2>
              <p
                className="text-lg font-bold mt-1"
                style={{
                  color: '#86efac',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                }}
              >
                Your Complete Gaming Analytics
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="transition-all hover:scale-110 hover:rotate-90"
            style={{ color: '#fef3c7' }}
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* TABS */}
        <div className="bg-black/30 border-b-2 border-yellow-400/50 flex">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-4 px-6 font-bold text-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-green-600 text-white border-b-4 border-yellow-400'
                : 'text-gray-300 hover:bg-green-700/30'
            }`}
          >
            <Trophy className="w-6 h-6 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('bets')}
            className={`flex-1 py-4 px-6 font-bold text-lg transition-all ${
              activeTab === 'bets'
                ? 'bg-green-600 text-white border-b-4 border-yellow-400'
                : 'text-gray-300 hover:bg-green-700/30'
            }`}
          >
            <DollarSign className="w-6 h-6 inline mr-2" />
            Bet Analysis
          </button>
          <button
            onClick={() => setActiveTab('numbers')}
            className={`flex-1 py-4 px-6 font-bold text-lg transition-all ${
              activeTab === 'numbers'
                ? 'bg-green-600 text-white border-b-4 border-yellow-400'
                : 'text-gray-300 hover:bg-green-700/30'
            }`}
          >
            <Dices className="w-6 h-6 inline mr-2" />
            Numbers
          </button>
          <button
            onClick={() => setActiveTab('streaks')}
            className={`flex-1 py-4 px-6 font-bold text-lg transition-all ${
              activeTab === 'streaks'
                ? 'bg-green-600 text-white border-b-4 border-yellow-400'
                : 'text-gray-300 hover:bg-green-700/30'
            }`}
          >
            <Target className="w-6 h-6 inline mr-2" />
            Streaks
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center text-white text-xl py-12">Loading stats...</div>
          ) : (
            <>
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                      icon={DollarSign}
                      label="Profit/Loss"
                      value={`$${profitLoss.toLocaleString()}`}
                      color={isProfitable ? 'from-green-500 to-green-700' : 'from-red-500 to-red-700'}
                      trend={isProfitable ? 'up' : 'down'}
                    />
                    <StatCard
                      icon={Percent}
                      label="Win Rate"
                      value={`${winRate}%`}
                      color="from-blue-500 to-blue-700"
                    />
                    <StatCard
                      icon={Dices}
                      label="Total Rolls"
                      value={stats.totalRolls.toLocaleString()}
                      color="from-purple-500 to-purple-700"
                    />
                    <StatCard
                      icon={Trophy}
                      label="ROI"
                      value={`${roi}%`}
                      color={parseFloat(roi) >= 0 ? 'from-green-500 to-green-700' : 'from-red-500 to-red-700'}
                      trend={parseFloat(roi) >= 0 ? 'up' : 'down'}
                    />
                  </div>

                  {/* Additional Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricBox
                      label="Total Wagered"
                      value={`$${stats.totalWagered.toLocaleString()}`}
                      icon={DollarSign}
                    />
                    <MetricBox
                      label="Total Won"
                      value={`$${stats.totalWon.toLocaleString()}`}
                      icon={TrendingUp}
                    />
                    <MetricBox
                      label="Total Lost"
                      value={`$${stats.totalLost.toLocaleString()}`}
                      icon={TrendingDown}
                    />
                    <MetricBox
                      label="Biggest Win"
                      value={`$${stats.biggestWin.toLocaleString()}`}
                      icon={Trophy}
                    />
                    <MetricBox
                      label="Biggest Loss"
                      value={`$${stats.biggestLoss.toLocaleString()}`}
                      icon={TrendingDown}
                    />
                    <MetricBox
                      label="Avg Bet Size"
                      value={`$${stats.averageBetSize.toFixed(2)}`}
                      icon={DollarSign}
                    />
                    <MetricBox
                      label="Sessions Played"
                      value={stats.sessionsPlayed.toLocaleString()}
                      icon={Calendar}
                    />
                    <MetricBox
                      label="Play Time"
                      value={`${Math.floor(stats.totalPlayTime / 60)}h ${stats.totalPlayTime % 60}m`}
                      icon={Clock}
                    />
                    <MetricBox
                      label="Points Made"
                      value={`${stats.pointsMade}/${stats.pointsMade + stats.pointsMissed}`}
                      icon={Target}
                    />
                  </div>
                </div>
              )}

              {activeTab === 'bets' && (
                <div className="space-y-6">
                  <h3 className="text-white text-2xl font-bold mb-4">Bet Type Performance</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <BetTypeCard
                      title="Pass Line"
                      wins={stats.passLineWins}
                      losses={stats.passLineLosses}
                    />
                    <BetTypeCard
                      title="Don't Pass"
                      wins={stats.dontPassWins}
                      losses={stats.dontPassLosses}
                    />
                    <BetTypeCard
                      title="Field"
                      wins={stats.fieldWins}
                      losses={stats.fieldLosses}
                    />
                    <BetTypeCard
                      title="Place Bets"
                      wins={stats.placeWins}
                      losses={stats.placeLosses}
                    />
                  </div>

                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-yellow-500/50">
                    <h4 className="text-white text-xl font-bold mb-4">Special Events</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-yellow-400">{stats.hardwayHits}</div>
                        <div className="text-sm text-gray-300">Hardway Hits</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-red-400">{stats.sevenOutCount}</div>
                        <div className="text-sm text-gray-300">Seven Outs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-green-400">{stats.pointsMade}</div>
                        <div className="text-sm text-gray-300">Points Made</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-400">{stats.pointsMissed}</div>
                        <div className="text-sm text-gray-300">Points Missed</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'numbers' && (
                <div className="space-y-6">
                  <h3 className="text-white text-2xl font-bold mb-4">Dice Roll Distribution</h3>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-yellow-500/50">
                    <div className="space-y-3">
                      {Object.entries(stats.numberRolls).map(([num, count]) => {
                        const total = Object.values(stats.numberRolls).reduce((a, b) => a + b, 0);
                        const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
                        const expectedProbability = getExpectedProbability(parseInt(num));
                        
                        return (
                          <div key={num} className="space-y-1">
                            <div className="flex justify-between text-white">
                              <span className="font-bold">
                                {num === '7' ? '🎯 ' : ''}{num}
                              </span>
                              <span>
                                {count} rolls ({percentage}%) - Expected: {expectedProbability}%
                              </span>
                            </div>
                            <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                              <motion.div
                                className="h-full rounded-full"
                                style={{
                                  background: num === '7'
                                    ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                                    : 'linear-gradient(90deg, #3b82f6, #2563eb)',
                                }}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, delay: parseInt(num) * 0.05 }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-blue-200 text-sm">
                    <p className="mb-2">💡 <strong>About Dice Probabilities:</strong></p>
                    <p className="text-xs">
                      In craps, the number 7 has the highest probability (16.67%) because it can be rolled 6 ways.
                      Your actual results may vary from expected probabilities due to sample size and natural variance.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'streaks' && (
                <div className="space-y-6">
                  <h3 className="text-white text-2xl font-bold mb-4">Winning & Losing Streaks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                      icon={Trophy}
                      label="Longest Win Streak"
                      value={stats.longestWinStreak.toString()}
                      color="from-green-500 to-green-700"
                    />
                    <StatCard
                      icon={Target}
                      label="Current Streak"
                      value={stats.currentWinStreak.toString()}
                      color="from-blue-500 to-blue-700"
                    />
                    <StatCard
                      icon={TrendingDown}
                      label="Longest Loss Streak"
                      value={stats.longestLossStreak.toString()}
                      color="from-red-500 to-red-700"
                    />
                  </div>

                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-yellow-500/50">
                    <h4 className="text-white text-xl font-bold mb-4">Streak Analysis</h4>
                    <p className="text-gray-300 mb-4">
                      Track your hot and cold streaks to understand your gameplay patterns. Use this data to adjust your betting strategy.
                    </p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-white">
                        <span>Average Win Streak:</span>
                        <span className="font-bold text-green-400">
                          {stats.passLineWins > 0 ? (stats.passLineWins / (stats.longestWinStreak || 1)).toFixed(1) : '0.0'}
                        </span>
                      </div>
                      <div className="flex justify-between text-white">
                        <span>Win/Loss Ratio:</span>
                        <span className="font-bold text-blue-400">
                          {stats.totalLost > 0 ? (stats.totalWon / stats.totalLost).toFixed(2) : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Helper Components
function StatCard({ icon: Icon, label, value, color, trend }: { icon: any; label: string; value: string; color: string; trend?: 'up' | 'down' }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      className={`bg-gradient-to-br ${color} rounded-xl p-6 text-white shadow-lg`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon className="w-8 h-8" />
        {trend && (
          trend === 'up' ? <TrendingUp className="w-6 h-6" /> : <TrendingDown className="w-6 h-6" />
        )}
      </div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </motion.div>
  );
}

function MetricBox({ label, value, icon: Icon }: { label: string; value: string; icon: any }) {
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border-2 border-gray-700">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-5 h-5 text-yellow-400" />
        <div className="text-sm text-gray-400">{label}</div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
    </div>
  );
}

function BetTypeCard({ title, wins, losses }: { title: string; wins: number; losses: number }) {
  const total = wins + losses;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : '0.0';
  
  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 border-2 border-gray-700">
      <h4 className="text-white text-xl font-bold mb-4">{title}</h4>
      <div className="space-y-2">
        <div className="flex justify-between text-white">
          <span>Wins:</span>
          <span className="font-bold text-green-400">{wins}</span>
        </div>
        <div className="flex justify-between text-white">
          <span>Losses:</span>
          <span className="font-bold text-red-400">{losses}</span>
        </div>
        <div className="flex justify-between text-white border-t border-gray-600 pt-2">
          <span>Win Rate:</span>
          <span className="font-bold text-yellow-400">{winRate}%</span>
        </div>
      </div>
      <div className="mt-4 bg-gray-700 rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-600"
          initial={{ width: 0 }}
          animate={{ width: `${winRate}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
}

function getExpectedProbability(num: number): string {
  const probabilities: { [key: number]: number } = {
    2: 2.78,
    3: 5.56,
    4: 8.33,
    5: 11.11,
    6: 13.89,
    7: 16.67,
    8: 13.89,
    9: 11.11,
    10: 8.33,
    11: 5.56,
    12: 2.78,
  };
  return probabilities[num]?.toFixed(2) || '0.00';
}
