import { useState } from 'react';
import { Gift, X, TrendingUp, Zap, DollarSign, Star } from './Icons';
import { useProgression, LEVEL_REWARDS } from '../contexts/ProgressionContext';

interface RewardsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onChipsAwarded: (amount: number) => void;
}

export function RewardsPanel({ isOpen, onClose, onChipsAwarded }: RewardsPanelProps) {
  const { unclaimedRewards, claimAllRewards, xpMultiplier, level } = useProgression();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimedResults, setClaimedResults] = useState<{ totalChips: number; totalXP: number; multiplierGain: number } | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  const handleClaimAll = () => {
    if (unclaimedRewards.length === 0) return;

    setIsClaiming(true);
    
    // Claim all rewards
    const results = claimAllRewards();
    setClaimedResults(results);
    
    // Award chips to player
    if (results.totalChips > 0) {
      onChipsAwarded(results.totalChips);
    }
    
    // Show celebration animation
    setTimeout(() => {
      setIsClaiming(false);
      // Auto-close after showing results for 3 seconds
      setTimeout(() => {
        handleClose();
      }, 3000);
    }, 1500);
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setClaimedResults(null);
      setIsExiting(false);
    }, 300);
  };

  // Calculate total rewards available
  const totalChipsAvailable = unclaimedRewards.reduce((sum, r) => sum + (r.reward.chips || 0), 0);
  const totalXPBoostAvailable = unclaimedRewards.reduce((sum, r) => sum + (r.reward.xpBoost || 0), 0);
  const totalMultiplierAvailable = unclaimedRewards.reduce((sum, r) => sum + (r.reward.xpMultiplier || 0), 0);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 ${
        isExiting ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-300'
      }`}
      onClick={handleClose}
    >
      <div
        className={`bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-4 border-yellow-500 ${
          isExiting
            ? 'animate-out zoom-out-95 slide-out-to-bottom-4 fade-out duration-300'
            : 'animate-in zoom-in-95 slide-in-from-bottom-4 fade-in duration-300'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {!claimedResults ? (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-6 rounded-t-xl relative overflow-hidden">
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
                    <h2 className="text-white text-3xl font-bold">Level Rewards</h2>
                    <p className="text-yellow-100 text-sm">Claim your earned rewards!</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="text-white hover:text-gray-200 transition-colors text-2xl font-bold w-8 h-8 flex items-center justify-center"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* XP Multiplier Display */}
              <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border-2 border-purple-500/50 rounded-xl p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-8 h-8 text-purple-400" />
                    <div>
                      <h3 className="text-white text-xl font-bold">Current XP Multiplier</h3>
                      <p className="text-purple-300 text-sm">Earn more XP with every bet!</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold text-purple-400">{xpMultiplier}%</div>
                    <div className="text-purple-300 text-sm">{((xpMultiplier / 100) * 10).toFixed(1)}x XP gain</div>
                  </div>
                </div>
                
                <div className="mt-4 bg-gray-800/50 rounded-lg p-3">
                  <div className="text-white text-sm">
                    <strong className="text-purple-400">How it works:</strong> Bet $10 = {Math.floor(10 * (xpMultiplier / 100))} XP (Base: 10 XP + {Math.floor(10 * (xpMultiplier / 100)) - 10} bonus)
                  </div>
                </div>
              </div>

              {/* Unclaimed Rewards */}
              {unclaimedRewards.length > 0 ? (
                <>
                  <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-xl p-5">
                    <h3 className="text-yellow-400 text-2xl font-bold mb-4 flex items-center gap-2">
                      <Star className="w-6 h-6 fill-yellow-400" />
                      Unclaimed Rewards ({unclaimedRewards.length})
                    </h3>
                    
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {totalChipsAvailable > 0 && (
                        <div className="bg-gray-800/50 rounded-lg p-4 text-center border-2 border-green-500/30">
                          <DollarSign className="w-8 h-8 text-green-400 mx-auto mb-2" />
                          <div className="text-3xl font-bold text-white mb-1">${totalChipsAvailable.toLocaleString()}</div>
                          <div className="text-gray-400 text-sm">Total Chips</div>
                        </div>
                      )}
                      
                      {totalXPBoostAvailable > 0 && (
                        <div className="bg-gray-800/50 rounded-lg p-4 text-center border-2 border-purple-500/30">
                          <Star className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                          <div className="text-3xl font-bold text-white mb-1">+{totalXPBoostAvailable.toLocaleString()}</div>
                          <div className="text-gray-400 text-sm">Instant XP</div>
                        </div>
                      )}
                      
                      {totalMultiplierAvailable > 0 && (
                        <div className="bg-gray-800/50 rounded-lg p-4 text-center border-2 border-yellow-500/30">
                          <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                          <div className="text-3xl font-bold text-white mb-1">+{totalMultiplierAvailable}%</div>
                          <div className="text-gray-400 text-sm">XP Multiplier</div>
                        </div>
                      )}
                    </div>
                    
                    {/* Detailed reward list */}
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {unclaimedRewards.map(({ level: rewardLevel, reward }) => (
                        <div key={rewardLevel} className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-yellow-400 font-bold">Level {rewardLevel} Reward</div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            {reward.chips && (
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-400" />
                                <span className="text-white">${reward.chips.toLocaleString()} chips</span>
                              </div>
                            )}
                            
                            {reward.xpBoost && (
                              <div className="flex items-center gap-2">
                                <Star className="w-4 h-4 text-purple-400" />
                                <span className="text-white">+{reward.xpBoost.toLocaleString()} XP</span>
                              </div>
                            )}
                            
                            {reward.xpMultiplier && (
                              <div className="flex items-center gap-2 col-span-2">
                                <Zap className="w-4 h-4 text-yellow-400" />
                                <span className="text-white">+{reward.xpMultiplier}% XP Multiplier (Permanent!)</span>
                              </div>
                            )}
                          </div>
                          
                          {reward.unlocks && reward.unlocks.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-700">
                              <div className="text-xs text-gray-400 mb-1">Unlocks:</div>
                              {reward.unlocks.map((unlock, idx) => (
                                <div key={idx} className="text-xs text-gray-300">• {unlock}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    <button
                      onClick={handleClaimAll}
                      disabled={isClaiming}
                      className="w-full mt-6 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6 py-4 rounded-lg font-bold text-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-yellow-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isClaiming ? (
                        <>
                          <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                          CLAIMING...
                        </>
                      ) : (
                        <>
                          <Gift className="w-6 h-6" />
                          CLAIM ALL REWARDS!
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="bg-gray-800/50 border-2 border-gray-700 rounded-xl p-8 text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-white text-2xl font-bold mb-2">All Caught Up!</h3>
                  <p className="text-gray-400">No unclaimed rewards. Keep leveling up to earn more!</p>
                  
                  <div className="mt-6 bg-blue-900/30 border border-blue-500/50 rounded-lg p-4">
                    <div className="text-blue-300">
                      <strong>Current Level:</strong> {level}
                      <div className="mt-2 text-sm text-gray-400">
                        Level up to earn chips, XP boosts, and permanent XP multipliers!
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* XP Rate Transparency */}
              <div className="bg-blue-900/30 border-2 border-blue-500/50 rounded-xl p-5">
                <h3 className="text-blue-400 text-lg font-bold mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  XP Rate (100% Transparent)
                </h3>
                
                <div className="space-y-2 text-sm text-white">
                  <div className="flex justify-between p-2 bg-gray-800/50 rounded">
                    <span className="text-gray-300">Base Rate:</span>
                    <span className="font-bold">$1 bet = 1 XP</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-800/50 rounded">
                    <span className="text-gray-300">Your Multiplier:</span>
                    <span className="font-bold text-purple-400">{xpMultiplier}% ({(xpMultiplier / 100).toFixed(2)}x)</span>
                  </div>
                  <div className="flex justify-between p-2 bg-purple-900/30 rounded border border-purple-500/30">
                    <span className="text-gray-300">Actual Rate:</span>
                    <span className="font-bold text-yellow-400">$1 bet = {(xpMultiplier / 100).toFixed(2)} XP</span>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                  <div className="text-xs text-gray-400 mb-2">Examples with your current {xpMultiplier}% multiplier:</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-gray-300">$3 bet → {Math.floor(3 * (xpMultiplier / 100))} XP</div>
                    <div className="text-gray-300">$10 bet → {Math.floor(10 * (xpMultiplier / 100))} XP</div>
                    <div className="text-gray-300">$50 bet → {Math.floor(50 * (xpMultiplier / 100))} XP</div>
                    <div className="text-gray-300">$100 bet → {Math.floor(100 * (xpMultiplier / 100))} XP</div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Claimed rewards animation */
          <div className="p-12 text-center">
            <div className="mb-6 animate-in zoom-in-0 spin-in-180 duration-700">
              <div className="text-9xl mb-4">🎉</div>
            </div>
            
            <h2 className="text-white text-4xl font-bold mb-4 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '0.3s' }}>
              Rewards Claimed!
            </h2>
            
            <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500" style={{ animationDelay: '0.5s' }}>
              <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-xl p-6">
                <div className="text-yellow-400 text-lg font-bold mb-4">Total Rewards Claimed</div>
                <div className="grid grid-cols-3 gap-4">
                  {claimedResults.totalChips > 0 && (
                    <div>
                      <div className="text-4xl font-bold text-green-400 mb-1">+${claimedResults.totalChips.toLocaleString()}</div>
                      <div className="text-gray-400">Chips</div>
                    </div>
                  )}
                  {claimedResults.totalXP > 0 && (
                    <div>
                      <div className="text-4xl font-bold text-purple-400 mb-1">+{claimedResults.totalXP.toLocaleString()}</div>
                      <div className="text-gray-400">XP</div>
                    </div>
                  )}
                  {claimedResults.multiplierGain > 0 && (
                    <div>
                      <div className="text-4xl font-bold text-yellow-400 mb-1">+{claimedResults.multiplierGain}%</div>
                      <div className="text-gray-400">XP Mult.</div>
                    </div>
                  )}
                </div>
                
                {claimedResults.multiplierGain > 0 && (
                  <div className="mt-4 bg-purple-900/30 border border-purple-500/50 rounded-lg p-3">
                    <div className="text-purple-300 font-bold">
                      🎯 New XP Multiplier: {xpMultiplier}%
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      This is PERMANENT! Earn {((xpMultiplier / 100).toFixed(2))}x XP on all future bets!
                    </div>
                  </div>
                )}
              </div>
            </div>
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
