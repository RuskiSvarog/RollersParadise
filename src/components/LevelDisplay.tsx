import { useState } from 'react';
import { useProgression, LEVEL_UNLOCKS, LEVEL_REWARDS } from '../contexts/ProgressionContext';
import { TrendingUp, Award, Star, Crown, Lock, Gift } from './Icons';

export function LevelDisplay() {
  const { level, xp, xpToNextLevel, totalXpEarned, prestige, canPrestige, doPrestige, unclaimedRewards, xpMultiplier } = useProgression();
  const [showDetails, setShowDetails] = useState(false);
  
  const progressPercentage = (xp / xpToNextLevel) * 100;
  
  // Get next unlock
  const nextUnlockLevel = Object.keys(LEVEL_UNLOCKS)
    .map(Number)
    .find(lvl => lvl > level);
  
  return (
    <>
      {/* Compact display in header */}
      <div
        className="flex items-center gap-3 bg-gradient-to-r from-purple-900/50 to-blue-900/50 px-4 py-2 rounded-lg border-2 border-purple-500/50 cursor-pointer hover:border-purple-400/80 transition-all"
        onClick={() => setShowDetails(true)}
      >
        {/* Prestige stars */}
        {prestige > 0 && (
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(prestige, 5) }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            ))}
            {prestige > 5 && (
              <span className="text-yellow-400 text-xs font-bold ml-1">+{prestige - 5}</span>
            )}
          </div>
        )}
        
        {/* Level badge */}
        <div className="flex items-center gap-2 bg-gradient-to-br from-yellow-500 to-orange-600 px-3 py-1 rounded-full shadow-lg">
          <Crown className="w-4 h-4 text-white" />
          <span className="text-white font-bold">{level}</span>
        </div>
        
        {/* XP Progress bar */}
        <div className="flex flex-col gap-1">
          <div className="text-white text-xs font-bold">
            {xp} / {xpToNextLevel} XP
          </div>
          <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
        
        <TrendingUp className="w-4 h-4 text-purple-400" />
      </div>

      {/* Detailed modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowDetails(false)}>
          <div className="animate-in zoom-in-95 fade-in duration-300">
            <div
              className="bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-purple-500"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Award className="w-8 h-8 text-yellow-300" />
                    <div>
                      <h2 className="text-white text-2xl font-bold">Player Progression</h2>
                      <p className="text-purple-200 text-sm">Level {level} • Total XP: {totalXpEarned.toLocaleString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="text-white hover:text-gray-200 transition-colors text-2xl font-bold w-8 h-8 flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Prestige section */}
                {prestige > 0 && (
                  <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-yellow-400 font-bold text-lg">Prestige {prestige}</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      You've reached max level and prestiged {prestige} time{prestige > 1 ? 's' : ''}!
                    </p>
                  </div>
                )}

                {/* Current level progress */}
                <div className="bg-gray-800/50 rounded-xl p-5 border-2 border-purple-500/30">
                  <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-400" />
                    Current Progress
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Current Level</span>
                      <span className="text-white font-bold text-2xl">{level}</span>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">XP Progress</span>
                        <span className="text-purple-400 font-bold">{xp} / {xpToNextLevel}</span>
                      </div>
                      <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <div className="text-center text-gray-400 text-xs mt-1">
                        {progressPercentage.toFixed(1)}% to level {level + 1}
                      </div>
                    </div>

                    <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3">
                      <p className="text-blue-300 text-sm">
                        💡 <strong>Earn XP:</strong> Place bets to gain experience!
                        Higher bets = more XP
                      </p>
                    </div>
                  </div>
                </div>

                {/* Next unlock */}
                {nextUnlockLevel && (
                  <div className="bg-gray-800/50 rounded-xl p-5 border-2 border-yellow-500/30">
                    <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                      <Lock className="w-5 h-5 text-yellow-400" />
                      Next Unlock at Level {nextUnlockLevel}
                    </h3>
                    <div className="space-y-2">
                      {LEVEL_UNLOCKS[nextUnlockLevel].map((unlock, i) => (
                        <div key={i} className="flex items-center gap-2 text-gray-300">
                          <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                          <span>{unlock}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 text-sm text-gray-400">
                      {nextUnlockLevel - level} levels to go!
                    </div>
                  </div>
                )}

                {/* All unlocks */}
                <div className="bg-gray-800/50 rounded-xl p-5 border-2 border-green-500/30">
                  <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-green-400" />
                    All Level Rewards
                  </h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {Object.entries(LEVEL_UNLOCKS).map(([lvl, unlocks]) => {
                      const unlockLevel = Number(lvl);
                      const isUnlocked = level >= unlockLevel;
                      
                      return (
                        <div
                          key={lvl}
                          className={`p-3 rounded-lg border-2 ${
                            isUnlocked
                              ? 'bg-green-900/20 border-green-500/50'
                              : 'bg-gray-900/30 border-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {isUnlocked ? (
                              <Award className="w-4 h-4 text-green-400" />
                            ) : (
                              <Lock className="w-4 h-4 text-gray-500" />
                            )}
                            <span
                              className={`font-bold ${
                                isUnlocked ? 'text-green-400' : 'text-gray-500'
                              }`}
                            >
                              Level {lvl}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {unlocks.map((unlock, i) => (
                              <div
                                key={i}
                                className={`text-sm ${
                                  isUnlocked ? 'text-gray-300' : 'text-gray-600'
                                }`}
                              >
                                • {unlock}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Prestige button */}
                {canPrestige && (
                  <div className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-xl p-5">
                    <h3 className="text-yellow-400 text-xl font-bold mb-3 flex items-center gap-2">
                      <Star className="w-6 h-6 fill-yellow-400" />
                      Prestige Available!
                    </h3>
                    <p className="text-gray-300 text-sm mb-4">
                      Reset to level 1 with a prestigious golden star! Keep all unlocks and earn increased rewards.
                    </p>
                    <button
                      onClick={() => {
                        doPrestige();
                        setShowDetails(false);
                      }}
                      className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Star className="w-5 h-5 fill-white" />
                      PRESTIGE NOW!
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}