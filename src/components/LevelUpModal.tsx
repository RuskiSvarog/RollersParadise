import { Trophy, Star, Sparkles, Gift, Zap, Crown, DollarSign } from './Icons';
import { useEffect, useState } from 'react';

interface LevelUpModalProps {
  newLevel: number;
  rewards: {
    chips?: number;
    xp?: number;
    achievementsUnlocked?: string[];
    perksUnlocked?: string[];
  };
  onClose: () => void;
}

export function LevelUpModal({ newLevel, rewards, onClose }: LevelUpModalProps) {
  const [showRewards, setShowRewards] = useState(false);

  useEffect(() => {
    // Show rewards after animation
    const timer = setTimeout(() => setShowRewards(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const levelPerks = getLevelPerks(newLevel);

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center z-[60] p-4 animate-in fade-in duration-300">
      {/* Background Celebration Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-[confetti_2s_ease-out_forwards] opacity-0"
            style={{
              left: '50%',
              top: '50%',
              animationDelay: `${Math.random() * 0.5}s`,
              '--tx': `${(Math.random() - 0.5) * 1000}px`,
              '--ty': `${(Math.random() - 0.5) * 1000}px`,
            } as React.CSSProperties}
          >
            {i % 5 === 0 ? '⭐' : i % 4 === 0 ? '✨' : i % 3 === 0 ? '💫' : i % 2 === 0 ? '🎊' : '🎉'}
          </div>
        ))}
      </div>

      <div className="relative max-w-2xl w-full animate-in zoom-in-0 spin-in-180 duration-800">
        {/* Massive Outer Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 rounded-3xl opacity-60 animate-pulse" style={{ filter: 'blur(48px)' }} />
        
        {/* Main Container */}
        <div className="relative bg-gradient-to-br from-black via-purple-900 to-black border-4 border-yellow-500 rounded-3xl shadow-2xl shadow-yellow-500/50 overflow-hidden">
          
          {/* Animated Border Lights */}
          <div 
            className="absolute inset-0 border-4 border-transparent rounded-3xl animate-[gradient-shift_3s_linear_infinite]"
            style={{
              background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #ef4444, #ec4899, #8b5cf6, #3b82f6, #fbbf24)',
              backgroundSize: '400% 400%',
            }}
          />

          <div className="relative bg-gradient-to-br from-black/90 via-purple-900/90 to-black/90 rounded-3xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              {/* Level Badge */}
              <div className="relative inline-block mb-4 animate-[wiggle_2s_ease-in-out_infinite]">
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-600 rounded-full blur-2xl opacity-75" />
                <div className="relative w-32 h-32 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-600 rounded-full flex items-center justify-center border-4 border-yellow-300 shadow-2xl">
                  <div className="text-center">
                    <Crown className="w-12 h-12 text-white mx-auto mb-1" />
                    <div className="text-4xl font-bold text-white">{newLevel}</div>
                  </div>
                </div>
                
                {/* Rotating Stars */}
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute animate-spin"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -50%) rotate(${i * 45}deg) translateX(80px)`,
                      animationDuration: '4s',
                    }}
                  >
                    <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                  </div>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-5xl font-bold mb-2 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '0.5s' }}>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500">
                  LEVEL UP!
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 animate-in fade-in duration-500" style={{ animationDelay: '0.7s' }}>
                You reached Level {newLevel}!
              </p>
            </div>

            {/* Rewards Section */}
            {showRewards && (
              <div className="space-y-4 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {/* Chips Reward */}
                {rewards.chips && (
                  <div className="relative animate-in zoom-in-0 duration-500" style={{ animationDelay: '0.2s' }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur-lg opacity-50" />
                    <div className="relative bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-2 border-green-500 rounded-xl p-4 flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-gray-400 text-sm">Bonus Chips</div>
                        <div className="text-2xl font-bold text-green-400">+${rewards.chips.toLocaleString()}</div>
                      </div>
                      <Sparkles className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                )}

                {/* Perks Unlocked */}
                {levelPerks.length > 0 && (
                  <div className="relative animate-in zoom-in-0 duration-500" style={{ animationDelay: '0.4s' }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50" />
                    <div className="relative bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-2 border-purple-500 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Gift className="w-5 h-5 text-purple-400" />
                        <span className="text-purple-400 font-bold">New Perks Unlocked!</span>
                      </div>
                      <div className="space-y-2">
                        {levelPerks.map((perk, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-gray-300 animate-in fade-in slide-in-from-left-4 duration-300"
                            style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                          >
                            <Zap className="w-4 h-4 text-yellow-400" />
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Achievements Unlocked */}
                {rewards.achievementsUnlocked && rewards.achievementsUnlocked.length > 0 && (
                  <div className="relative animate-in zoom-in-0 duration-500" style={{ animationDelay: '0.6s' }}>
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl blur-lg opacity-50" />
                    <div className="relative bg-gradient-to-r from-yellow-900/50 to-orange-900/50 border-2 border-yellow-500 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <span className="text-yellow-400 font-bold">Achievements Unlocked!</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {rewards.achievementsUnlocked.map((achievement, index) => (
                          <div
                            key={index}
                            className="bg-black/50 border border-yellow-600 rounded-lg px-3 py-1 text-sm text-yellow-300 animate-in zoom-in-0 duration-300"
                            style={{ animationDelay: `${0.7 + index * 0.1}s` }}
                          >
                            {achievement}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Continue Button */}
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-4 rounded-xl transition-all hover:scale-105 active:scale-95 shadow-xl animate-in fade-in duration-500"
              style={{ animationDelay: '1.5s' }}
            >
              Continue Playing! 🎰
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes confetti {
          0% { transform: translate(0, 0) scale(0); opacity: 1; }
          50% { opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0.5); opacity: 0; }
        }
        @keyframes wiggle {
          0%, 100% { transform: scale(1) rotate(0deg); }
          25% { transform: scale(1.1) rotate(5deg); }
          75% { transform: scale(1.1) rotate(-5deg); }
        }
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
}

function getLevelPerks(level: number): string[] {
  const perks: string[] = [];
  
  if (level === 5) perks.push('Unlocked: Custom Avatar Colors');
  if (level === 10) perks.push('Unlocked: VIP Chat Badge', '+10% Daily Reward Bonus');
  if (level === 15) perks.push('Unlocked: Exclusive Dice Skins');
  if (level === 20) perks.push('Unlocked: High Roller Table Access', '+5% Win Bonus');
  if (level === 25) perks.push('Unlocked: Custom Table Themes');
  if (level === 30) perks.push('Unlocked: Premium Animations', '+15% Daily Reward Bonus');
  if (level === 40) perks.push('Unlocked: Legendary Player Badge', '+10% Win Bonus');
  if (level === 50) perks.push('🏆 Unlocked: Master Roller Title', '💎 +25% All Bonuses');
  if (level === 75) perks.push('👑 Unlocked: Royal VIP Status', '⚡ +50% All Bonuses');
  if (level === 100) perks.push('🌟 Unlocked: LEGENDARY STATUS', '💫 +100% All Bonuses', '🎰 Custom Casino Room');
  
  // Every 10 levels after 10
  if (level % 10 === 0 && level > 10 && level < 100) {
    perks.push(`+${Math.floor(level / 10) * 5}% XP Boost`);
  }
  
  return perks;
}