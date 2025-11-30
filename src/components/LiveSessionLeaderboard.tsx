import { useState, useEffect } from 'react';
import { Trophy, TrendingUp, TrendingDown, Flame, DollarSign, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PlayerSessionStats {
  name: string;
  avatar: string;
  email: string;
  netProfit: number;
  totalWins: number;
  totalLosses: number;
  biggestWin: number;
  totalWagered: number;
  currentStreak: number; // Positive for win streak, negative for loss streak
  winRate: number; // Percentage
  membershipTier?: 'free' | 'silver' | 'gold' | 'platinum';
  level?: number;
}

interface LiveSessionLeaderboardProps {
  roomId: string;
  playerStats: Map<string, PlayerSessionStats>;
  currentPlayerEmail: string;
  isVisible: boolean;
  onClose?: () => void;
}

export function LiveSessionLeaderboard({ 
  roomId, 
  playerStats, 
  currentPlayerEmail, 
  isVisible,
  onClose 
}: LiveSessionLeaderboardProps) {
  const [sortedPlayers, setSortedPlayers] = useState<PlayerSessionStats[]>([]);
  
  // Sort players by net profit (highest to lowest)
  useEffect(() => {
    const players = Array.from(playerStats.values());
    
    // Deduplicate by email using Map for O(1) lookups
    const uniquePlayersMap = new Map<string, PlayerSessionStats>();
    
    players.forEach(player => {
      const existing = uniquePlayersMap.get(player.email);
      if (!existing) {
        uniquePlayersMap.set(player.email, player);
      } else {
        // Keep the one with more recent data (higher totalWins + totalLosses indicates more activity)
        if ((player.totalWins + player.totalLosses) > (existing.totalWins + existing.totalLosses)) {
          uniquePlayersMap.set(player.email, player);
        }
      }
    });
    
    const uniquePlayers = Array.from(uniquePlayersMap.values());
    const sorted = uniquePlayers.sort((a, b) => b.netProfit - a.netProfit);
    setSortedPlayers(sorted);
  }, [playerStats]);
  
  const getMembershipColor = (tier?: string) => {
    switch (tier) {
      case 'platinum': return 'from-cyan-400 to-blue-600';
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      default: return 'from-gray-600 to-gray-700';
    }
  };
  
  const getMembershipBadge = (tier?: string) => {
    switch (tier) {
      case 'platinum': return '💎';
      case 'gold': return '👑';
      case 'silver': return '⭐';
      default: return '';
    }
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed right-4 top-20 z-40 w-96 max-h-[calc(100vh-6rem)] overflow-hidden"
      >
        <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 rounded-xl shadow-2xl border-2 border-purple-500/30 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-6 h-6 text-yellow-300" />
              <div>
                <h3 className="font-black text-white">Session Leaders</h3>
                <p className="text-xs text-purple-100 opacity-80">Live Rankings</p>
              </div>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Leaderboard Content */}
          <div className="overflow-y-auto max-h-[60vh] custom-scrollbar">
            {sortedPlayers.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Waiting for players...</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {sortedPlayers.map((player, index) => {
                  const isCurrentPlayer = player.email === currentPlayerEmail;
                  const rank = index + 1;
                  const rankEmoji = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`;
                  
                  return (
                    <motion.div
                      key={player.email}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`
                        relative rounded-lg p-3 transition-all
                        ${isCurrentPlayer 
                          ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-2 border-green-400/50 shadow-lg shadow-green-500/20' 
                          : 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800/70'
                        }
                      `}
                    >
                      {/* Rank Badge */}
                      <div className="absolute -left-2 -top-2 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black text-sm shadow-lg">
                        {rankEmoji}
                      </div>

                      {/* Player Info */}
                      <div className="flex items-start gap-3 mb-2">
                        <div className="relative">
                          <span className="text-3xl">{player.avatar}</span>
                          {/* Membership badge */}
                          {player.membershipTier && player.membershipTier !== 'free' && (
                            <span className="absolute -top-1 -right-1 text-sm">
                              {getMembershipBadge(player.membershipTier)}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-black text-white truncate">
                              {player.name}
                              {isCurrentPlayer && (
                                <span className="ml-2 text-xs px-2 py-0.5 bg-green-500/30 text-green-300 rounded-full">
                                  YOU
                                </span>
                              )}
                            </h4>
                            {player.level && player.level > 1 && (
                              <span className="text-xs px-2 py-0.5 bg-purple-500/30 text-purple-300 rounded-full">
                                L{player.level}
                              </span>
                            )}
                          </div>
                          
                          {/* Net Profit - Main Stat */}
                          <div className="flex items-center gap-2 mt-1">
                            {player.netProfit >= 0 ? (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                            <span className={`font-black text-lg ${player.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {formatCurrency(player.netProfit)}
                            </span>
                          </div>
                        </div>

                        {/* Hot Streak Indicator */}
                        {Math.abs(player.currentStreak) >= 3 && (
                          <div className="flex flex-col items-center gap-1">
                            <Flame className={`w-5 h-5 ${player.currentStreak > 0 ? 'text-orange-500' : 'text-blue-400'}`} />
                            <span className={`text-xs font-black ${player.currentStreak > 0 ? 'text-orange-400' : 'text-blue-300'}`}>
                              {Math.abs(player.currentStreak)}x
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Detailed Stats Grid */}
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-gray-700/50">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-green-400 text-xs mb-1">
                            <Trophy className="w-3 h-3" />
                            <span className="font-bold">Wins</span>
                          </div>
                          <div className="text-white font-black">{player.totalWins}</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-red-400 text-xs mb-1">
                            <TrendingDown className="w-3 h-3" />
                            <span className="font-bold">Losses</span>
                          </div>
                          <div className="text-white font-black">{player.totalLosses}</div>
                        </div>
                        
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-yellow-400 text-xs mb-1">
                            <Target className="w-3 h-3" />
                            <span className="font-bold">Win %</span>
                          </div>
                          <div className="text-white font-black">{player.winRate}%</div>
                        </div>
                      </div>

                      {/* Biggest Win */}
                      {player.biggestWin > 0 && (
                        <div className="mt-2 pt-2 border-t border-gray-700/50 flex items-center justify-between">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Biggest Win
                          </span>
                          <span className="text-xs font-black text-yellow-400">
                            {formatCurrency(player.biggestWin)}
                          </span>
                        </div>
                      )}

                      {/* Total Wagered */}
                      {player.totalWagered > 0 && (
                        <div className="mt-1 flex items-center justify-between">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Target className="w-3 h-3" />
                            Total Wagered
                          </span>
                          <span className="text-xs font-black text-purple-400">
                            {formatCurrency(player.totalWagered)}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Stats */}
          <div className="bg-gray-900/80 p-3 border-t border-purple-500/30">
            <div className="flex items-center justify-between text-xs">
              <div className="text-gray-400">
                <span className="font-bold text-white">{sortedPlayers.length}</span> players competing
              </div>
              <div className="text-gray-400">
                Room: <span className="font-bold text-purple-400">{roomId.slice(0, 8)}</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
      `}</style>
    </AnimatePresence>
  );
}