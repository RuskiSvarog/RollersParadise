import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Snowflake, TrendingUp, TrendingDown, Award, Target } from 'lucide-react';

interface DiceStatsProps {
  lastRolls: number[];
  currentStreak: { type: 'win' | 'loss', count: number };
  totalWins: number;
  totalLosses: number;
}

export function DiceStats({ lastRolls, currentStreak, totalWins, totalLosses }: DiceStatsProps) {
  const [isHot, setIsHot] = useState(false);
  const [isCold, setIsCold] = useState(false);
  const [achievement, setAchievement] = useState<string | null>(null);

  useEffect(() => {
    // Hot dice: 3+ wins in last 5 rolls
    const recentWins = lastRolls.slice(-5).filter(r => r === 7 || r === 11).length;
    setIsHot(recentWins >= 3);

    // Cold dice: 3+ losses in last 5 rolls
    const recentLosses = lastRolls.slice(-5).filter(r => r === 2 || r === 3 || r === 12).length;
    setIsCold(recentLosses >= 3);

    // Check for achievements
    if (currentStreak.type === 'win' && currentStreak.count === 5) {
      showAchievement('🔥 HOT STREAK! 5 Wins in a Row!');
    } else if (currentStreak.type === 'win' && currentStreak.count === 10) {
      showAchievement('🌟 LEGENDARY! 10 Wins in a Row!');
    } else if (totalWins === 50) {
      showAchievement('🎯 MILESTONE! 50 Total Wins!');
    } else if (totalWins === 100) {
      showAchievement('👑 CENTURY! 100 Total Wins!');
    }
  }, [lastRolls, currentStreak, totalWins]);

  const showAchievement = (message: string) => {
    setAchievement(message);
    setTimeout(() => setAchievement(null), 4000);
  };

  const getDiceTemperature = () => {
    if (isHot) return { label: 'HOT', icon: Flame, color: 'text-red-500', bgColor: 'bg-red-500/20', borderColor: 'border-red-500' };
    if (isCold) return { label: 'COLD', icon: Snowflake, color: 'text-blue-400', bgColor: 'bg-blue-500/20', borderColor: 'border-blue-400' };
    return null;
  };

  const temperature = getDiceTemperature();
  const winRate = totalWins + totalLosses > 0 ? ((totalWins / (totalWins + totalLosses)) * 100).toFixed(1) : '0.0';

  return (
    <div className="fixed top-24 left-6 z-30 space-y-3">
      {/* Dice Temperature */}
      <AnimatePresence>
        {temperature && (
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className={`${temperature.bgColor} ${temperature.borderColor} border-2 rounded-lg px-4 py-3 backdrop-blur-sm`}
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: temperature.label === 'HOT' ? [0, 10, -10, 0] : [0, -5, 5, 0],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
              >
                <temperature.icon className={`w-6 h-6 ${temperature.color}`} />
              </motion.div>
              <div>
                <div className={`${temperature.color} font-black text-sm`}>
                  DICE {temperature.label}
                </div>
                <div className="text-white/80 text-xs">
                  {temperature.label === 'HOT' ? 'Keep rolling!' : 'Streak ending soon'}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Streak */}
      {currentStreak.count > 2 && (
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          className={`${currentStreak.type === 'win' ? 'bg-green-500/20 border-green-500' : 'bg-red-500/20 border-red-500'} border-2 rounded-lg px-4 py-3 backdrop-blur-sm`}
        >
          <div className="flex items-center gap-3">
            {currentStreak.type === 'win' ? (
              <TrendingUp className="w-6 h-6 text-green-400" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-400" />
            )}
            <div>
              <div className={`${currentStreak.type === 'win' ? 'text-green-400' : 'text-red-400'} font-black text-sm`}>
                {currentStreak.count} {currentStreak.type === 'win' ? 'WIN' : 'LOSS'} STREAK
              </div>
              <div className="text-white/80 text-xs">
                Current run
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-black/40 border-2 border-white/20 rounded-lg px-4 py-3 backdrop-blur-sm"
      >
        <div className="flex items-center gap-3 mb-2">
          <Target className="w-5 h-5 text-yellow-400" />
          <div className="text-white font-black text-xs">STATS</div>
        </div>
        <div className="space-y-1 text-xs">
          <div className="flex justify-between text-white/90">
            <span>Win Rate:</span>
            <span className="font-black text-green-400">{winRate}%</span>
          </div>
          <div className="flex justify-between text-white/90">
            <span>Wins:</span>
            <span className="font-black text-green-400">{totalWins}</span>
          </div>
          <div className="flex justify-between text-white/90">
            <span>Losses:</span>
            <span className="font-black text-red-400">{totalLosses}</span>
          </div>
        </div>
      </motion.div>

      {/* Achievement Toast */}
      <AnimatePresence>
        {achievement && (
          <motion.div
            initial={{ opacity: 0, x: -50, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.8 }}
            className="bg-gradient-to-r from-yellow-500 to-orange-500 border-4 border-yellow-300 rounded-lg px-6 py-4 backdrop-blur-sm shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <motion.div
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Award className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <div className="text-white font-black text-sm">ACHIEVEMENT!</div>
                <div className="text-white/90 text-xs">{achievement}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
