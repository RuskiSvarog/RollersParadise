import { useState } from 'react';
import { Gift, Calendar, Trophy, Zap } from './Icons';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AdminRewardsPanelProps {
  onClose: () => void;
}

export function AdminRewardsPanel({ onClose }: AdminRewardsPanelProps) {
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [adminKey, setAdminKey] = useState('');

  const triggerRewards = async (timeframe: 'weekly' | 'monthly') => {
    if (!adminKey) {
      alert('Please enter admin key');
      return;
    }

    try {
      setProcessing(true);
      setResult(null);

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/process-leaderboard-rewards`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            timeframe,
            adminKey,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          ...data,
        });
      } else {
        setResult({
          success: false,
          error: data.error || 'Failed to process rewards',
        });
      }
    } catch (error) {
      console.error('Error triggering rewards:', error);
      setResult({
        success: false,
        error: 'Network error',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4">
      <div className="relative max-w-2xl w-full">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-3xl blur-2xl opacity-50" />
        
        <div className="relative bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 rounded-3xl border-4 border-purple-600 shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-white" style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                  Admin: Leaderboard Rewards
                </h2>
                <p className="text-purple-300 text-sm">
                  Manually trigger reward distribution
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-bold transition-colors"
            >
              Close
            </button>
          </div>

          {/* Admin Key Input */}
          <div className="mb-6">
            <label className="text-white font-bold mb-2 block">
              Admin Key:
            </label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="Enter admin key"
              className="w-full bg-black/50 border-2 border-purple-600 rounded-lg px-4 py-3 text-white"
            />
            <p className="text-gray-400 text-xs mt-1">
              Default: rollers-paradise-admin-2024
            </p>
          </div>

          {/* Trigger Buttons */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <button
              onClick={() => triggerRewards('weekly')}
              disabled={processing}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 p-6 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Calendar className="w-8 h-8 text-white mb-2 mx-auto" />
              <div className="text-white font-bold">Process Weekly Rewards</div>
              <div className="text-blue-200 text-sm mt-1">
                Awards top 10 in each category
              </div>
            </button>

            <button
              onClick={() => triggerRewards('monthly')}
              disabled={processing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 p-6 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-8 h-8 text-white mb-2 mx-auto" />
              <div className="text-white font-bold">Process Monthly Rewards</div>
              <div className="text-purple-200 text-sm mt-1">
                Awards top 10 in each category
              </div>
            </button>
          </div>

          {/* Processing Indicator */}
          {processing && (
            <div className="bg-blue-900/30 border-2 border-blue-600 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span className="text-white font-bold">Processing rewards...</span>
              </div>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className={`border-2 rounded-lg p-4 ${
              result.success 
                ? 'bg-green-900/30 border-green-600' 
                : 'bg-red-900/30 border-red-600'
            }`}>
              <h3 className="text-white font-bold mb-2">
                {result.success ? '✅ Success!' : '❌ Error'}
              </h3>
              {result.success ? (
                <div className="space-y-2">
                  <p className="text-green-300">
                    Processed {result.rewardsProcessed} rewards for {result.timeframe} leaderboard
                  </p>
                  {result.rewards && result.rewards.length > 0 && (
                    <div className="bg-black/50 rounded p-3 mt-3 max-h-60 overflow-y-auto">
                      <h4 className="text-white font-bold mb-2">Rewards Distributed:</h4>
                      <div className="space-y-1 text-xs">
                        {result.rewards.map((r: any, i: number) => (
                          <div key={i} className="text-gray-300">
                            #{r.rank} - {r.name} ({r.email}) - {r.category} - 
                            ${r.reward.chips?.toLocaleString()} + {r.reward.xpBoost?.multiplier}x XP
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-red-300">{result.error}</p>
              )}
            </div>
          )}

          {/* Info */}
          <div className="mt-6 bg-black/30 rounded-lg p-4 border border-gray-700">
            <h4 className="text-white font-bold mb-2">ℹ️ How It Works:</h4>
            <ul className="text-gray-300 text-sm space-y-1 list-disc list-inside">
              <li>Automatically runs every Monday (weekly) and 1st of month (monthly)</li>
              <li>Awards top 10 players in each category (total wins, biggest win, level, win rate)</li>
              <li>Sends notifications to players even when offline</li>
              <li>Players claim rewards when they log in</li>
              <li>Rewards: Chips + XP Boosts + Badges (for top 3)</li>
            </ul>
          </div>

          <div className="mt-4 bg-yellow-900/30 rounded-lg p-4 border border-yellow-600">
            <h4 className="text-yellow-300 font-bold mb-2">⚠️ Reward Tiers:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-yellow-200">
              <div>🥇 #1: $100k + 3x XP (24h) + Badge</div>
              <div>🥈 #2: $50k + 2.5x XP (24h) + Badge</div>
              <div>🥉 #3: $25k + 2x XP (24h) + Badge</div>
              <div>#4-5: $10k + 1.5x XP (12h)</div>
              <div>#6-10: $5k + 1.3x XP (12h)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
