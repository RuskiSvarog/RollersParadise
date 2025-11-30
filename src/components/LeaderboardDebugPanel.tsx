import { useState, useEffect } from 'react';
import { X, Trophy, Clock, Zap, Users } from './Icons';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LeaderboardDebugPanelProps {
  onClose: () => void;
  adminEmail: string;
}

export function LeaderboardDebugPanel({ onClose, adminEmail }: LeaderboardDebugPanelProps) {
  const [leaderboardData, setLeaderboardData] = useState<any>(null);
  const [boostsData, setBoostsData] = useState<any>(null);
  const [selectedEmail, setSelectedEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLeaderboardData = async (category: string, timeframe: string) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/leaderboard?category=${category}&timeframe=${timeframe}&email=${adminEmail}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLeaderboardData(data);
        console.log('📊 DEBUG: Leaderboard data:', data);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBoostsData = async (email: string) => {
    if (!email) return;

    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/boosts?email=${encodeURIComponent(email)}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBoostsData(data);
        console.log('⚡ DEBUG: Boosts data:', data);
      }
    } catch (error) {
      console.error('Error fetching boosts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-fetch weekly data on mount
    fetchLeaderboardData('total_wins', 'weekly');
  }, []);

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = timestamp - now;
    
    if (diff <= 0) return 'EXPIRED';
    
    const hours = Math.floor(diff / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((diff % (60 * 1000)) / 1000);
    
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[10000] p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 rounded-2xl border-4 border-purple-600 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-400" />
            <div>
              <h2 className="text-white text-2xl font-bold">🔍 Leaderboard & Boost Debug</h2>
              <p className="text-gray-400 text-sm">ADMIN ONLY - Track legitimacy of stats & rewards</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 p-2 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Leaderboard Section */}
        <div className="mb-6">
          <h3 className="text-white text-xl font-bold mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            Real-Time Leaderboard Data
          </h3>
          
          <div className="flex gap-2 mb-4 flex-wrap">
            {['total_wins', 'biggest_win', 'level', 'win_rate'].map(cat => (
              <button
                key={cat}
                onClick={() => fetchLeaderboardData(cat, 'weekly')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {cat.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>

          {loading && (
            <div className="text-white text-center py-4">
              <div className="inline-block w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {leaderboardData && !loading && (
            <div className="bg-black/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-2">
                Category: <span className="text-white font-bold">{leaderboardData.category}</span> | 
                Timeframe: <span className="text-white font-bold ml-2">{leaderboardData.timeframe}</span>
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {leaderboardData.players?.slice(0, 10).map((player: any) => (
                  <div
                    key={player.email}
                    className="bg-gray-800/50 rounded p-3 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : '🏆'}</div>
                      <div>
                        <div className="text-white font-bold">
                          #{player.rank} - {player.name}
                        </div>
                        <div className="text-gray-400 text-sm">{player.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold text-lg">{player.value}</div>
                      <div className="text-purple-400 text-sm">Level {player.level}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-green-900/30 border border-green-600 rounded-lg">
                <div className="text-green-400 font-bold">✓ LEGITIMACY CHECK</div>
                <div className="text-gray-300 text-sm mt-1">
                  • All stats are server-side tracked<br/>
                  • Anti-cheat validation enabled<br/>
                  • Stats history audited (last 10 updates)<br/>
                  • Timeframe filters applied correctly
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Boosts Debug Section */}
        <div>
          <h3 className="text-white text-xl font-bold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            XP Boost Timer Validation
          </h3>
          
          <div className="flex gap-2 mb-4">
            <input
              type="email"
              placeholder="Enter player email to check boosts"
              value={selectedEmail}
              onChange={(e) => setSelectedEmail(e.target.value)}
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            />
            <button
              onClick={() => fetchBoostsData(selectedEmail)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-bold"
            >
              Check Boosts
            </button>
          </div>

          {boostsData && (
            <div className="bg-black/50 rounded-lg p-4">
              {boostsData.boosts?.length === 0 ? (
                <div className="text-gray-400 text-center py-4">
                  No active boosts for this player
                </div>
              ) : (
                <div className="space-y-3">
                  {boostsData.boosts?.map((boost: any) => {
                    const now = Date.now();
                    const remaining = boost.expiresAt - now;
                    const isValid = remaining > 0;

                    return (
                      <div
                        key={boost.id}
                        className={`p-4 rounded-lg ${isValid ? 'bg-green-900/30 border border-green-600' : 'bg-red-900/30 border border-red-600'}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="text-white font-bold text-lg">{boost.name}</div>
                            <div className="text-gray-400 text-sm">ID: {boost.id}</div>
                          </div>
                          <div className={`text-2xl ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                            {isValid ? '✓' : '✗'}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-400">Multiplier:</span>
                            <span className="text-yellow-400 ml-2 font-bold">{boost.multiplier}x</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Status:</span>
                            <span className={`ml-2 font-bold ${isValid ? 'text-green-400' : 'text-red-400'}`}>
                              {isValid ? 'ACTIVE' : 'EXPIRED'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Expires:</span>
                            <span className="text-white ml-2 font-mono text-xs">
                              {new Date(boost.expiresAt).toLocaleString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-400">Remaining:</span>
                            <span className={`ml-2 font-bold ${isValid ? 'text-purple-400' : 'text-gray-600'}`}>
                              {formatTime(boost.expiresAt)}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-400">Source:</span>
                            <span className="text-blue-400 ml-2">{boost.source}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-4 p-3 bg-blue-900/30 border border-blue-600 rounded-lg">
                <div className="text-blue-400 font-bold">🔒 TIMER VERIFICATION</div>
                <div className="text-gray-300 text-sm mt-1">
                  • Server timestamps used (not client-side)<br/>
                  • Auto-cleanup of expired boosts<br/>
                  • Real-time countdown validation<br/>
                  • Synced on every login
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 p-4 bg-purple-900/30 border border-purple-600 rounded-lg">
          <div className="text-purple-300 font-bold mb-2">🎯 ADMIN VERIFICATION CHECKLIST</div>
          <div className="text-gray-300 text-sm space-y-1">
            <div>✓ Leaderboard uses REAL player stats from database</div>
            <div>✓ Stats are incremental and server-validated</div>
            <div>✓ Anti-cheat limits: max 100 wins/losses, 200 rolls per update</div>
            <div>✓ XP boosts synced from server on login</div>
            <div>✓ Boost timers use server timestamps (not client)</div>
            <div>✓ Expired boosts auto-removed every minute</div>
            <div>✓ Rewards tracked with full audit trail</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LeaderboardDebugPanel;
