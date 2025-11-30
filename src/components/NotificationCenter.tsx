import { useEffect } from 'react';
import { toast } from './ui/sonner';
import { Trophy, Gift, Star, TrendingUp, Users, Crown, Zap, DollarSign, Award, Sparkles } from './Icons';

// Notification types for the casino
type NotificationType = 
  | 'achievement'
  | 'level_up'
  | 'big_win'
  | 'hot_streak'
  | 'daily_bonus'
  | 'vip_benefit'
  | 'player_joined'
  | 'tournament'
  | 'jackpot'
  | 'friend_request';

interface NotificationCenterProps {
  enabled?: boolean;
}

export function NotificationCenter({ enabled = true }: NotificationCenterProps) {
  // Achievement notification
  const showAchievement = (name: string, description: string, xp: number) => {
    if (!enabled) return;
    
    toast.success(
      <div className="flex items-center gap-3">
        <Trophy className="w-8 h-8 text-yellow-400" />
        <div>
          <div className="font-bold text-white">🏆 Achievement Unlocked!</div>
          <div className="text-sm text-gray-300">{name}</div>
          <div className="text-xs text-yellow-400">+{xp} XP</div>
        </div>
      </div>,
      {
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
          border: '2px solid #60a5fa',
          boxShadow: '0 8px 32px rgba(59, 130, 246, 0.5)'
        }
      }
    );
  };

  // Level up notification
  const showLevelUp = (newLevel: number, reward: number) => {
    if (!enabled) return;
    
    toast.success(
      <div className="flex items-center gap-3">
        <Star className="w-8 h-8 text-yellow-400 animate-spin" />
        <div>
          <div className="font-bold text-white">⭐ Level Up!</div>
          <div className="text-sm text-gray-300">You're now Level {newLevel}</div>
          <div className="text-xs text-green-400">+${reward} bonus chips!</div>
        </div>
      </div>,
      {
        duration: 5000,
        style: {
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
          border: '2px solid #c084fc',
          boxShadow: '0 8px 32px rgba(168, 85, 247, 0.5)'
        }
      }
    );
  };

  // Big win notification
  const showBigWin = (amount: number) => {
    if (!enabled) return;
    
    toast.success(
      <div className="flex items-center gap-3">
        <DollarSign className="w-8 h-8 text-green-400" />
        <div>
          <div className="font-bold text-white">💰 BIG WIN!</div>
          <div className="text-xl text-green-400 font-black">+${amount}</div>
        </div>
      </div>,
      {
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, #15803d 0%, #16a34a 100%)',
          border: '2px solid #4ade80',
          boxShadow: '0 8px 32px rgba(34, 197, 94, 0.5)'
        }
      }
    );
  };

  // Hot streak notification
  const showHotStreak = (streakCount: number) => {
    if (!enabled) return;
    
    toast.success(
      <div className="flex items-center gap-3">
        <Zap className="w-8 h-8 text-orange-400" />
        <div>
          <div className="font-bold text-white">🔥 HOT STREAK!</div>
          <div className="text-sm text-orange-300">{streakCount} wins in a row!</div>
          <div className="text-xs text-yellow-400">Keep it going!</div>
        </div>
      </div>,
      {
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
          border: '2px solid #fb923c',
          boxShadow: '0 8px 32px rgba(249, 115, 22, 0.5)'
        }
      }
    );
  };

  // Daily bonus notification
  const showDailyBonus = (amount: number, isVIP: boolean) => {
    if (!enabled) return;
    
    toast.success(
      <div className="flex items-center gap-3">
        <Gift className="w-8 h-8 text-pink-400" />
        <div>
          <div className="font-bold text-white">
            {isVIP ? '👑 VIP Daily Bonus!' : '🎁 Daily Bonus!'}
          </div>
          <div className="text-xl text-green-400 font-black">+${amount}</div>
          {isVIP && <div className="text-xs text-yellow-400">VIP Exclusive</div>}
        </div>
      </div>,
      {
        duration: 5000,
        style: {
          background: isVIP 
            ? 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)'
            : 'linear-gradient(135deg, #be123c 0%, #e11d48 100%)',
          border: isVIP ? '2px solid #fbbf24' : '2px solid #f43f5e',
          boxShadow: isVIP 
            ? '0 8px 32px rgba(234, 179, 8, 0.5)'
            : '0 8px 32px rgba(225, 29, 72, 0.5)'
        }
      }
    );
  };

  // VIP benefit notification
  const showVIPBenefit = (message: string) => {
    if (!enabled) return;
    
    toast.success(
      <div className="flex items-center gap-3">
        <Crown className="w-8 h-8 text-yellow-400" />
        <div>
          <div className="font-bold text-white">👑 VIP Perk!</div>
          <div className="text-sm text-yellow-200">{message}</div>
        </div>
      </div>,
      {
        duration: 4000,
        style: {
          background: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)',
          border: '2px solid #fbbf24',
          boxShadow: '0 8px 32px rgba(234, 179, 8, 0.5)'
        }
      }
    );
  };

  // Player joined notification
  const showPlayerJoined = (playerName: string, isVIP: boolean) => {
    if (!enabled) return;
    
    toast.info(
      <div className="flex items-center gap-3">
        <Users className="w-6 h-6 text-blue-400" />
        <div>
          <div className="text-sm text-white">
            {playerName} {isVIP && '👑'} joined the table
          </div>
        </div>
      </div>,
      {
        duration: 3000,
        style: {
          background: 'rgba(30, 58, 138, 0.9)',
          border: '2px solid #3b82f6',
        }
      }
    );
  };

  // Tournament notification
  const showTournament = (name: string, prize: number) => {
    if (!enabled) return;
    
    toast.info(
      <div className="flex items-center gap-3">
        <Award className="w-8 h-8 text-purple-400" />
        <div>
          <div className="font-bold text-white">🏆 Tournament Alert!</div>
          <div className="text-sm text-gray-300">{name}</div>
          <div className="text-xs text-green-400">Prize Pool: ${prize}</div>
        </div>
      </div>,
      {
        duration: 6000,
        style: {
          background: 'linear-gradient(135deg, #6b21a8 0%, #7c3aed 100%)',
          border: '2px solid #a855f7',
          boxShadow: '0 8px 32px rgba(124, 58, 237, 0.5)'
        }
      }
    );
  };

  // Jackpot notification
  const showJackpot = (amount: number) => {
    if (!enabled) return;
    
    toast.success(
      <div className="flex items-center gap-3">
        <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
        <div>
          <div className="font-bold text-white text-lg">💎 JACKPOT!</div>
          <div className="text-2xl text-yellow-400 font-black">+${amount}</div>
          <div className="text-xs text-green-400">Congratulations!</div>
        </div>
      </div>,
      {
        duration: 8000,
        style: {
          background: 'linear-gradient(135deg, #facc15 0%, #eab308 50%, #ca8a04 100%)',
          border: '3px solid #fbbf24',
          boxShadow: '0 12px 48px rgba(234, 179, 8, 0.8)',
          color: '#000'
        }
      }
    );
  };

  // Expose notification functions globally
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).showNotification = {
        achievement: showAchievement,
        levelUp: showLevelUp,
        bigWin: showBigWin,
        hotStreak: showHotStreak,
        dailyBonus: showDailyBonus,
        vipBenefit: showVIPBenefit,
        playerJoined: showPlayerJoined,
        tournament: showTournament,
        jackpot: showJackpot,
        
        // Generic notifications
        success: (message: string) => toast.success(message),
        error: (message: string) => toast.error(message),
        info: (message: string) => toast.info(message),
        warning: (message: string) => toast.warning(message),
      };
      
      console.log('✅ Notification system ready! Use window.showNotification');
    }
  }, [enabled]);

  return null; // This is a utility component with no UI
}

// Export for use in other components
export const notify = {
  achievement: (name: string, description: string, xp: number) => {
    (window as any).showNotification?.achievement(name, description, xp);
  },
  levelUp: (newLevel: number, reward: number) => {
    (window as any).showNotification?.levelUp(newLevel, reward);
  },
  bigWin: (amount: number) => {
    (window as any).showNotification?.bigWin(amount);
  },
  hotStreak: (streakCount: number) => {
    (window as any).showNotification?.hotStreak(streakCount);
  },
  dailyBonus: (amount: number, isVIP: boolean) => {
    (window as any).showNotification?.dailyBonus(amount, isVIP);
  },
  vipBenefit: (message: string) => {
    (window as any).showNotification?.vipBenefit(message);
  },
  playerJoined: (playerName: string, isVIP: boolean) => {
    (window as any).showNotification?.playerJoined(playerName, isVIP);
  },
  tournament: (name: string, prize: number) => {
    (window as any).showNotification?.tournament(name, prize);
  },
  jackpot: (amount: number) => {
    (window as any).showNotification?.jackpot(amount);
  },
  success: (message: string) => {
    (window as any).showNotification?.success(message);
  },
  error: (message: string) => {
    (window as any).showNotification?.error(message);
  },
  info: (message: string) => {
    (window as any).showNotification?.info(message);
  },
  warning: (message: string) => {
    (window as any).showNotification?.warning(message);
  },
};

export default NotificationCenter;
