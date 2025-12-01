import { useState, useEffect } from 'react';
import { X, Trophy, Crown, Medal, TrendingUp, DollarSign, Target, Zap, Sparkles } from './Icons';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LeaderboardModalProps {
  onClose: () => void;
  currentPlayerEmail?: string;
}

interface LeaderboardPlayer {
  rank: number;
  name: string;
  email: string;
  value: number;
  level?: number;
  avatar?: string;
}

type LeaderboardCategory = 'total_wins' | 'biggest_win' | 'level' | 'win_rate';
type LeaderboardTimeframe = 'all_time' | 'monthly' | 'weekly';

export function LeaderboardModal({ onClose, currentPlayerEmail }: LeaderboardModalProps) {
  const [category, setCategory] = useState<LeaderboardCategory>('total_wins');
  const [timeframe, setTimeframe] = useState<LeaderboardTimeframe>('all_time');
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPlayerRank, setCurrentPlayerRank] = useState<number | null>(null);
  const [showRewards, setShowRewards] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
    
    // Auto-refresh every 30 seconds to keep leaderboard fresh
    const refreshInterval = setInterval(() => {
      console.log('🔄 Auto-refreshing leaderboard...');
      fetchLeaderboard();
    }, 30000); // 30 seconds
    
    return () => clearInterval(refreshInterval);
  }, [category, timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const emailParam = currentPlayerEmail ? `&email=${encodeURIComponent(currentPlayerEmail)}` : '';
      // Add timestamp to prevent caching and ensure fresh data
      const timestamp = Date.now();
      
      // Try to fetch with timeout and retry logic
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout (increased from 10)
      
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/leaderboard?category=${category}&timeframe=${timeframe}${emailParam}&_t=${timestamp}`,
          {
            headers: { 
              Authorization: `Bearer ${publicAnonKey}`,
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            },
            signal: controller.signal,
          }
        );
        
        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          console.log('📊 REAL Leaderboard data received (FRESH):', {
            category,
            timeframe,
            playersCount: data.players?.length || 0,
            currentPlayerRank: data.currentPlayerRank,
            cached: data.cached || false,
            timestamp: new Date().toISOString()
          });
          
          // Log top 3 players for debugging
          if (data.players && data.players.length > 0) {
            console.log('🏆 Top 3 Players:', data.players.slice(0, 3).map((p: any) => ({
              rank: p.rank,
              name: p.name,
              value: p.value
            })));
          }
          
          setPlayers(data.players || []);
          setCurrentPlayerRank(data.currentPlayerRank || null);
        } else {
          // Server returned an error
          console.warn('⚠️ Leaderboard returned error status:', response.status);
          try {
            const errorText = await response.text();
            console.warn('Error details:', errorText);
          } catch (e) {
            // Ignore if we can't read error text
          }
          setPlayers([]);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        
        // Check if it's a timeout
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          console.warn('⚠️ Leaderboard fetch timed out (15s) - server is warming up, try again in a moment');
        } else {
          console.warn('⚠️ Leaderboard fetch failed:', fetchError instanceof Error ? fetchError.message : 'Unknown error');
        }
        setPlayers([]);
      }
    } catch (error) {
      // Outer error handler
      console.warn('⚠️ Leaderboard error:', error instanceof Error ? error.message : 'Unknown error');
      setPlayers([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryInfo = () => {
    switch (category) {
      case 'total_wins':
        return { icon: Trophy, label: 'Total Wins', unit: 'wins', color: 'yellow' };
      case 'biggest_win':
        return { icon: DollarSign, label: 'Biggest Win', unit: '$', color: 'green' };
      case 'level':
        return { icon: Zap, label: 'Highest Level', unit: 'lvl', color: 'purple' };
      case 'win_rate':
        return { icon: Target, label: 'Win Rate', unit: '%', color: 'blue' };
    }
  };

  const getRankMedal = (rank: number) => {
    if (rank === 1) return { icon: '🥇', color: 'from-yellow-400 to-yellow-600', glow: 'shadow-yellow-500/50' };
    if (rank === 2) return { icon: '🥈', color: 'from-gray-300 to-gray-500', glow: 'shadow-gray-400/50' };
    if (rank === 3) return { icon: '🥉', color: 'from-orange-400 to-orange-600', glow: 'shadow-orange-500/50' };
    return { icon: `#${rank}`, color: 'from-gray-700 to-gray-900', glow: 'shadow-gray-700/30' };
  };

  const formatValue = (value: number) => {
    const info = getCategoryInfo();
    if (info.unit === '$') return `$${value.toLocaleString()}`;
    if (info.unit === '%') return `${value.toFixed(1)}%`;
    if (info.unit === 'lvl') return `Level ${value}`;
    return value.toLocaleString();
  };

  const categoryInfo = getCategoryInfo();
  const CategoryIcon = categoryInfo.icon;

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="relative max-w-5xl w-full animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-3xl opacity-40" style={{ filter: 'blur(48px)' }} />
        
        {/* Main Container */}
        <div className="relative bg-gradient-to-br from-black via-gray-900 to-black border-4 border-blue-500 rounded-3xl shadow-2xl shadow-blue-500/50 overflow-hidden">
          
          {/* Animated Background Effects */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 bg-blue-400 rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${4 + Math.random() * 2}s`,
                }}
              />
            ))}
          </div>

          {/* Header */}
          <div className="relative border-b-4 border-blue-600 bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full blur-lg opacity-75" />
                  <div className="relative w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center border-4 border-yellow-300 shadow-xl">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
                    Leaderboard
                  </h2>
                  <p className="text-gray-400">Top Players in Rollers Paradise</p>
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
          </div>

          {/* Category Tabs */}
          <div className="relative border-b-2 border-gray-800 bg-black/50">
            <div className="grid grid-cols-4 gap-1 p-1">
              {(['total_wins', 'biggest_win', 'level', 'win_rate'] as LeaderboardCategory[]).map((cat) => {
                const info = category === cat ? getCategoryInfo() : 
                  cat === 'total_wins' ? { icon: Trophy, label: 'Total Wins', color: 'yellow' } :
                  cat === 'biggest_win' ? { icon: DollarSign, label: 'Biggest Win', color: 'green' } :
                  cat === 'level' ? { icon: Zap, label: 'Level', color: 'purple' } :
                  { icon: Target, label: 'Win Rate', color: 'blue' };
                const Icon = info.icon;
                
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`py-3 px-4 rounded-lg flex flex-col items-center gap-1 transition-all ${
                      category === cat
                        ? `bg-gradient-to-r ${
                            info.color === 'yellow' ? 'from-yellow-600 to-orange-600' :
                            info.color === 'green' ? 'from-green-600 to-emerald-600' :
                            info.color === 'purple' ? 'from-purple-600 to-pink-600' :
                            'from-blue-600 to-cyan-600'
                          } text-white shadow-lg scale-105`
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-bold">{info.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timeframe Tabs + Rewards Button */}
          <div className="relative border-b-2 border-gray-800 bg-black/30 p-2">
            <div className="flex gap-2 justify-center items-center">
              {(['all_time', 'monthly', 'weekly'] as LeaderboardTimeframe[]).map((tf) => (
                <button
                  key={tf}
                  onClick={() => {
                    setTimeframe(tf);
                    setShowRewards(false);
                  }}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                    !showRewards && timeframe === tf
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {tf === 'all_time' ? 'All Time' : tf === 'monthly' ? 'This Month' : 'This Week'}
                </button>
              ))}
              
              {/* Rewards Button */}
              <button
                onClick={() => setShowRewards(!showRewards)}
                className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${
                  showRewards
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Rewards</span>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="relative p-6 max-h-[60vh] overflow-y-auto">
            {showRewards ? (
              /* REWARDS SECTION - Shows what each place wins */
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-2">
                    🏆 Global Leaderboard Rewards 🏆
                  </h3>
                  <p className="text-gray-400 text-sm">
                    Top performers receive exclusive rewards based on their leaderboard position!
                  </p>
                </div>

                {/* 1st Place */}
                <div className="relative group animate-in fade-in slide-in-from-top-5 duration-300">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-xl blur-xl opacity-50" />
                  <div className="relative bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-4 border-yellow-500 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-xl shadow-yellow-500/50">
                        <span className="text-4xl">🥇</span>
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-yellow-300">1st Place</h4>
                        <p className="text-yellow-400 text-sm">Champion</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-white">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <span className="font-bold">$50,000 Bonus Chips</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-400" />
                        <span className="font-bold">3x XP Boost (7 Days)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-yellow-400" />
                        <span className="font-bold">Exclusive Gold Crown Badge</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        <span className="font-bold">Custom Profile Banner</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2nd Place */}
                <div className="relative group animate-in fade-in slide-in-from-top-5 duration-300" style={{ animationDelay: '100ms' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-500 rounded-xl blur-xl opacity-40" />
                  <div className="relative bg-gradient-to-r from-gray-800/50 to-gray-700/50 border-4 border-gray-400 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-500 rounded-xl flex items-center justify-center shadow-xl shadow-gray-400/50">
                        <span className="text-4xl">🥈</span>
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-gray-300">2nd Place</h4>
                        <p className="text-gray-400 text-sm">Runner Up</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-white">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <span className="font-bold">$25,000 Bonus Chips</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-400" />
                        <span className="font-bold">2.5x XP Boost (5 Days)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Medal className="w-5 h-5 text-gray-400" />
                        <span className="font-bold">Exclusive Silver Crown Badge</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className="relative group animate-in fade-in slide-in-from-top-5 duration-300" style={{ animationDelay: '200ms' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-orange-600 rounded-xl blur-xl opacity-40" />
                  <div className="relative bg-gradient-to-r from-orange-900/50 to-red-900/50 border-4 border-orange-500 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-xl shadow-orange-500/50">
                        <span className="text-4xl">🥉</span>
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-orange-300">3rd Place</h4>
                        <p className="text-orange-400 text-sm">Bronze Medal</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-white">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <span className="font-bold">$15,000 Bonus Chips</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-400" />
                        <span className="font-bold">2x XP Boost (3 Days)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Medal className="w-5 h-5 text-orange-400" />
                        <span className="font-bold">Exclusive Bronze Crown Badge</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4th-10th Place */}
                <div className="relative group animate-in fade-in slide-in-from-top-5 duration-300" style={{ animationDelay: '300ms' }}>
                  <div className="relative bg-gradient-to-r from-gray-900/50 to-black/50 border-2 border-gray-600 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl flex items-center justify-center shadow-xl">
                        <span className="text-2xl font-bold text-white">4-10</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-gray-300">4th - 10th Place</h4>
                        <p className="text-gray-500 text-sm">Top 10</p>
                      </div>
                    </div>
                    <div className="space-y-2 text-white">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <span className="font-bold">$5,000 - $10,000 Bonus Chips</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-purple-400" />
                        <span className="font-bold">1.5x XP Boost (24 Hours)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-blue-400" />
                        <span className="font-bold">Top 10 Badge</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="mt-6 p-4 bg-blue-900/30 border border-blue-500/50 rounded-xl">
                  <h5 className="text-blue-300 font-bold mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    Reward Notes
                  </h5>
                  <ul className="text-gray-300 text-sm space-y-1">
                    <li>• Rewards are distributed automatically at the end of each timeframe</li>
                    <li>• XP Boosts are temporary and stack with other active boosts</li>
                    <li>• Badges are permanent and displayed on your profile</li>
                    <li>• Bonus chips are added to your account balance immediately</li>
                    <li>• All rewards reset for each new timeframe (Weekly/Monthly/All-Time)</li>
                  </ul>
                </div>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin">
                  <Sparkles className="w-12 h-12 text-blue-400" />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {players.map((player, index) => {
                  const rankInfo = getRankMedal(player.rank);
                  const isCurrentPlayer = player.email === currentPlayerEmail;
                  
                  return (
                    <div
                      key={`${player.email}-${index}`}
                      className={`relative group ${isCurrentPlayer ? 'scale-105' : ''} animate-in fade-in slide-in-from-left-5 duration-300`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Glow for current player */}
                      {isCurrentPlayer && (
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-xl blur-xl opacity-50" />
                      )}
                      
                      {/* Player Row */}
                      <div className={`relative bg-gradient-to-r ${
                        player.rank === 1 ? 'from-yellow-900/30 to-orange-900/30 border-yellow-500' :
                        player.rank === 2 ? 'from-gray-800/30 to-gray-700/30 border-gray-400' :
                        player.rank === 3 ? 'from-orange-900/30 to-red-900/30 border-orange-500' :
                        isCurrentPlayer ? 'from-yellow-900/20 to-orange-900/20 border-yellow-600' :
                        'from-gray-900/50 to-black/50 border-gray-700'
                      } border-2 rounded-xl p-4 flex items-center gap-4 transition-all group-hover:scale-102`}>
                        
                        {/* Rank Badge */}
                        <div className={`relative w-16 h-16 bg-gradient-to-br ${rankInfo.color} rounded-xl flex items-center justify-center shadow-xl ${rankInfo.glow}`}>
                          <span className="text-2xl font-bold text-white">{rankInfo.icon}</span>
                        </div>

                        {/* Player Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-bold text-lg ${
                              isCurrentPlayer ? 'text-yellow-400' : 'text-white'
                            }`}>
                              {player.name}
                              {isCurrentPlayer && <span className="ml-2 text-sm">(You)</span>}
                            </h3>
                            {player.rank <= 3 && (
                              <Crown className={`w-5 h-5 ${
                                player.rank === 1 ? 'text-yellow-400' :
                                player.rank === 2 ? 'text-gray-400' :
                                'text-orange-400'
                              }`} />
                            )}
                          </div>
                          {player.level && (
                            <div className="flex items-center gap-2 text-sm text-gray-400">
                              <Zap className="w-4 h-4" />
                              <span>Level {player.level}</span>
                            </div>
                          )}
                        </div>

                        {/* Value */}
                        <div className="text-right">
                          <div className={`text-2xl font-bold ${
                            player.rank === 1 ? 'text-yellow-400' :
                            player.rank === 2 ? 'text-gray-300' :
                            player.rank === 3 ? 'text-orange-400' :
                            isCurrentPlayer ? 'text-yellow-400' :
                            'text-white'
                          }`}>
                            {formatValue(player.value)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {categoryInfo.unit === '$' ? 'won' :
                             categoryInfo.unit === '%' ? 'win rate' :
                             categoryInfo.unit === 'lvl' ? 'level' :
                             'total wins'}
                          </div>
                        </div>

                        {/* Trophy animation for top 3 */}
                        {player.rank <= 3 && (
                          <div className="absolute -top-2 -right-2 animate-pulse">
                            {player.rank === 1 ? <Trophy className="w-6 h-6 text-yellow-400" /> :
                             player.rank === 2 ? <Medal className="w-6 h-6 text-gray-400" /> :
                             <Medal className="w-6 h-6 text-orange-400" />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {players.length === 0 && (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No players yet. Be the first to play!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Your Rank Footer */}
          {currentPlayerRank && currentPlayerRank > 10 && (
            <div className="relative border-t-4 border-blue-600 bg-gradient-to-r from-yellow-900/50 to-orange-900/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">#{currentPlayerRank}</span>
                  </div>
                  <div>
                    <div className="text-white font-bold">Your Rank</div>
                    <div className="text-gray-400 text-sm">Keep playing to climb higher!</div>
                  </div>
                </div>
                <TrendingUp className="w-8 h-8 text-green-400" />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="relative border-t-4 border-blue-600 bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-4">
            <p className="text-center text-gray-400 text-sm">
              Leaderboards update in real-time! Keep playing to reach the top! 🏆
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardModal;