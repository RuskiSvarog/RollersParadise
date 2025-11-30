import { motion } from 'motion/react';
import { Flame, Snowflake, TrendingUp, TrendingDown, Zap } from 'lucide-react';

interface StreakTrackerProps {
  hotStreak: number; // Consecutive wins
  coldStreak: number; // Consecutive losses
  biggestWin: number;
  longestHotStreak: number;
  longestColdStreak: number;
}

export function StreakTracker({
  hotStreak,
  coldStreak,
  biggestWin,
  longestHotStreak,
  longestColdStreak,
}: StreakTrackerProps) {
  const isOnFire = hotStreak >= 3;
  const isCold = coldStreak >= 3;

  return (
    <div className="fixed top-24 right-4 z-20">
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 border-purple-500 rounded-2xl shadow-2xl overflow-hidden"
        style={{
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(168, 85, 247, 0.3)',
        }}
      >
        <div className="p-4 space-y-3">
          {/* Hot Streak */}
          {hotStreak > 0 && (
            <motion.div
              animate={isOnFire ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.5, repeat: Infinity }}
              className={`bg-gradient-to-r ${
                isOnFire ? 'from-orange-600 to-red-600' : 'from-green-600 to-emerald-600'
              } rounded-xl p-3 border-2 ${isOnFire ? 'border-orange-400' : 'border-green-400'}`}
              style={{
                boxShadow: isOnFire ? '0 0 20px rgba(251, 146, 60, 0.6)' : '0 0 20px rgba(34, 197, 94, 0.4)',
              }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={isOnFire ? { rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.5, repeat: Infinity }}
                >
                  <Flame className={`w-8 h-8 ${isOnFire ? 'text-yellow-300' : 'text-green-300'}`} />
                </motion.div>
                <div>
                  <div className="text-white font-bold text-sm uppercase tracking-wider">
                    {isOnFire ? '🔥 ON FIRE! 🔥' : '✨ Hot Streak'}
                  </div>
                  <div className="text-white text-2xl font-bold">{hotStreak} Wins</div>
                  <div className="text-white/70 text-xs">Best: {longestHotStreak} wins</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Cold Streak */}
          {coldStreak > 0 && (
            <motion.div
              animate={isCold ? { scale: [1, 0.98, 1] } : {}}
              transition={{ duration: 1, repeat: Infinity }}
              className={`bg-gradient-to-r ${
                isCold ? 'from-blue-700 to-indigo-800' : 'from-gray-600 to-gray-700'
              } rounded-xl p-3 border-2 ${isCold ? 'border-blue-400' : 'border-gray-500'}`}
              style={{
                boxShadow: isCold ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none',
              }}
            >
              <div className="flex items-center gap-3">
                <Snowflake className={`w-8 h-8 ${isCold ? 'text-blue-300' : 'text-gray-400'}`} />
                <div>
                  <div className="text-white font-bold text-sm uppercase tracking-wider">
                    {isCold ? '❄️ Cold Streak' : '⚠️ Losing'}
                  </div>
                  <div className="text-white text-2xl font-bold">{coldStreak} Losses</div>
                  <div className="text-white/70 text-xs">Worst: {longestColdStreak} losses</div>
                </div>
              </div>
              {isCold && (
                <div className="mt-2 bg-blue-600/30 rounded-lg p-2">
                  <p className="text-blue-200 text-xs text-center">💪 Stay strong! Luck will turn!</p>
                </div>
              )}
            </motion.div>
          )}

          {/* Biggest Win */}
          {biggestWin > 0 && (
            <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-3 border-2 border-yellow-400">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-yellow-300" />
                <div>
                  <div className="text-white font-bold text-sm uppercase tracking-wider">Biggest Win</div>
                  <div className="text-white text-2xl font-bold">${biggestWin.toLocaleString()}</div>
                </div>
              </div>
            </div>
          )}

          {/* Streak Multiplier Info */}
          {hotStreak >= 3 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-purple-600/30 rounded-lg p-3 border-2 border-purple-400"
            >
              <div className="text-center">
                <div className="text-purple-300 font-bold text-sm mb-1">🎁 STREAK BONUS ACTIVE!</div>
                <div className="text-white text-xs">Win more to keep your streak going!</div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
