import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useXPBoost } from './XPBoostContext';
import { useVIP } from './VIPContext';

interface LevelReward {
  chips?: number;
  xpMultiplier?: number; // Percentage bonus (e.g., 10 = +10% XP)
  xpBoost?: number; // Instant XP bonus
  unlocks?: string[];
}

interface ProgressionContextType {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXpEarned: number;
  addXP: (amount: number, reason?: string) => void;
  prestige: number;
  canPrestige: boolean;
  doPrestige: () => void;
  xpMultiplier: number; // Current XP multiplier (100 = normal, 110 = +10%)
  unclaimedRewards: LevelReward[];
  claimAllRewards: () => { totalChips: number; totalXP: number; multiplierGain: number };
}

const ProgressionContext = createContext<ProgressionContextType | undefined>(undefined);

export function useProgression() {
  const context = useContext(ProgressionContext);
  if (!context) {
    throw new Error('useProgression must be used within ProgressionProvider');
  }
  return context;
}

interface ProgressionProviderProps {
  children: ReactNode;
}

// NEW: More difficult XP progression (quadratic scaling)
// Level 1: 200 XP, Level 10: ~1,500 XP, Level 50: ~25,000 XP, Level 100: ~100,000 XP
const calculateXPForLevel = (level: number): number => {
  // Quadratic scaling: base * level^1.8
  return Math.floor(100 * Math.pow(level, 1.8));
};

// NEW: Comprehensive reward system with REAL benefits
export const LEVEL_REWARDS: Record<number, LevelReward> = {
  // Early levels - small chip rewards
  2: { chips: 50, unlocks: ['Welcome Bonus'] },
  3: { chips: 75 },
  4: { chips: 100, xpMultiplier: 5, unlocks: ['🎯 +5% XP Bonus (Permanent!)'] },
  5: { chips: 150, unlocks: ['Custom table felt: "Midnight Blue"'] },
  
  // Level 6-10 - Building up
  6: { chips: 200 },
  7: { chips: 250, xpMultiplier: 5, unlocks: ['🎯 +5% XP Bonus'] },
  8: { chips: 300 },
  9: { chips: 400 },
  10: { chips: 500, xpBoost: 500, xpMultiplier: 10, unlocks: ['Chip design: "Gold Rush"', 'Profile badge: "High Roller"', '🎯 +10% XP Bonus'] },
  
  // Level 11-20
  12: { chips: 600, xpMultiplier: 5 },
  15: { chips: 1000, xpBoost: 1000, xpMultiplier: 10, unlocks: ['Dice skin: "Diamond Dice"', '🎯 +10% XP Bonus'] },
  18: { chips: 1500, xpMultiplier: 5 },
  20: { chips: 2000, xpBoost: 2000, xpMultiplier: 15, unlocks: ['VIP betting area access', 'Profile title: "Casino Elite"', '🎯 +15% XP Bonus'] },
  
  // Level 21-30
  22: { chips: 2500, xpMultiplier: 5 },
  25: { chips: 3000, xpBoost: 3000, xpMultiplier: 15, unlocks: ['Table theme: "Las Vegas Luxe"', '🎯 +15% XP Bonus'] },
  28: { chips: 4000, xpMultiplier: 10 },
  30: { chips: 5000, xpBoost: 5000, xpMultiplier: 20, unlocks: ['Chip design: "Platinum Chips"', 'Profile badge: "Legend"', '🎯 +20% XP Bonus'] },
  
  // Level 31-40
  33: { chips: 6000, xpMultiplier: 10 },
  35: { chips: 7500, xpBoost: 7500, xpMultiplier: 20, unlocks: ['Dice skin: "Neon Glow"', '🎯 +20% XP Bonus'] },
  38: { chips: 9000, xpMultiplier: 10 },
  40: { chips: 10000, xpBoost: 10000, xpMultiplier: 25, unlocks: ['Table theme: "Monaco Gold"', '🎯 +25% XP Bonus'] },
  
  // Level 41-50 - Getting serious
  42: { chips: 12000, xpMultiplier: 15 },
  45: { chips: 15000, xpBoost: 15000, xpMultiplier: 25, unlocks: ['Profile badge: "Casino Master"', '🎯 +25% XP Bonus'] },
  48: { chips: 18000, xpMultiplier: 15 },
  50: { chips: 25000, xpBoost: 25000, xpMultiplier: 30, unlocks: ['Dice skin: "Rainbow Prism"', 'VIP Premium access', 'Profile title: "Craps God"', '🎯 +30% XP Bonus'] },
  
  // Level 51-75 - High roller territory
  55: { chips: 30000, xpBoost: 30000, xpMultiplier: 35, unlocks: ['🎯 +35% XP Bonus'] },
  60: { chips: 40000, xpBoost: 40000, xpMultiplier: 40, unlocks: ['Table theme: "Cyberpunk Neon"', '🎯 +40% XP Bonus'] },
  65: { chips: 50000, xpBoost: 50000, xpMultiplier: 45, unlocks: ['🎯 +45% XP Bonus'] },
  70: { chips: 60000, xpBoost: 60000, xpMultiplier: 50, unlocks: ['Chip design: "Black Diamond"', '🎯 +50% XP Bonus'] },
  75: { chips: 75000, xpBoost: 75000, xpMultiplier: 55, unlocks: ['🎯 +55% XP Bonus'] },
  
  // Level 76-100 - Elite players
  80: { chips: 100000, xpBoost: 100000, xpMultiplier: 60, unlocks: ['Dice skin: "Holographic"', '🎯 +60% XP Bonus'] },
  85: { chips: 125000, xpBoost: 125000, xpMultiplier: 70, unlocks: ['🎯 +70% XP Bonus'] },
  90: { chips: 150000, xpBoost: 150000, xpMultiplier: 80, unlocks: ['Table theme: "Space Casino"', '🎯 +80% XP Bonus'] },
  95: { chips: 200000, xpBoost: 200000, xpMultiplier: 90, unlocks: ['🎯 +90% XP Bonus'] },
  100: { chips: 500000, xpBoost: 500000, xpMultiplier: 100, unlocks: ['Profile badge: "Centurion"', 'Chip design: "Supreme Gold"', '🎯 +100% XP Bonus (DOUBLE XP!)', 'PRESTIGE AVAILABLE'] },
};

// Backward compatibility: Extract unlocks-only map for LevelDisplay
export const LEVEL_UNLOCKS: Record<number, string[]> = Object.entries(LEVEL_REWARDS)
  .filter(([_, reward]) => reward.unlocks && reward.unlocks.length > 0)
  .reduce((acc, [level, reward]) => {
    acc[Number(level)] = reward.unlocks!;
    return acc;
  }, {} as Record<number, string[]>);

export function ProgressionProvider({ children }: ProgressionProviderProps) {
  const { getCurrentMultiplier, hasActiveBoost } = useXPBoost();
  const { getVIPPerks } = useVIP();
  const [level, setLevel] = useState(1);
  const [xp, setXP] = useState(0);
  const [totalXpEarned, setTotalXpEarned] = useState(0);
  const [prestige, setPrestige] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [lastLevelUp, setLastLevelUp] = useState(1);
  const [xpMultiplier, setXpMultiplier] = useState(100); // 100 = 1.0x (normal)
  const [unclaimedRewards, setUnclaimedRewards] = useState<Array<{ level: number; reward: LevelReward }>>([]);

  const xpToNextLevel = calculateXPForLevel(level);
  const canPrestige = level >= 100;

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('player-progression-v2');
      if (saved) {
        const data = JSON.parse(saved);
        setLevel(data.level || 1);
        setXP(data.xp || 0);
        setTotalXpEarned(data.totalXpEarned || 0);
        setPrestige(data.prestige || 0);
        setXpMultiplier(data.xpMultiplier || 100);
        setUnclaimedRewards(data.unclaimedRewards || []);
        console.log('✅ Loaded progression:', data);
      }
    } catch (error) {
      console.error('Error loading progression:', error);
    }
  }, []);

  // Save to localStorage (SKIP FOR GUEST ACCOUNTS)
  useEffect(() => {
    // Check if current user is a guest before saving
    try {
      const savedProfile = localStorage.getItem('rollers-paradise-profile') || localStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        const isGuest = profile.email?.includes('@temporary.local');
        if (isGuest) {
          console.log('👻 Guest account detected - NOT saving progression');
          return; // Don't save progression for guests
        }
      }
    } catch (e) {
      // If we can't check, don't save to be safe
      return;
    }
    
    const data = {
      level,
      xp,
      totalXpEarned,
      prestige,
      xpMultiplier,
      unclaimedRewards,
      lastSaved: Date.now()
    };
    localStorage.setItem('player-progression-v2', JSON.stringify(data));
  }, [level, xp, totalXpEarned, prestige, xpMultiplier, unclaimedRewards]);

  const addXP = (amount: number, reason?: string) => {
    // Apply permanent XP multiplier (from levels/prestige)
    let finalAmount = Math.floor(amount * (xpMultiplier / 100));
    const permanentBonus = finalAmount - amount;
    
    // Apply VIP passive XP multiplier
    const vipPerks = getVIPPerks();
    if (vipPerks.xpMultiplier > 1.0) {
      finalAmount = Math.floor(finalAmount * vipPerks.xpMultiplier);
    }
    
    // Apply temporary XP boost multiplier (from rewards/items)
    const boostMultiplier = getCurrentMultiplier();
    if (boostMultiplier > 1.0) {
      finalAmount = Math.floor(finalAmount * boostMultiplier);
    }
    
    const totalBonus = finalAmount - amount;
    
    if (totalBonus > 0) {
      const vipInfo = vipPerks.xpMultiplier > 1.0 ? ` [VIP ${vipPerks.xpMultiplier}x]` : '';
      const boostInfo = hasActiveBoost ? ` [${boostMultiplier}x boost]` : '';
      console.log(`⭐ +${amount} XP + ${totalBonus} bonus = ${finalAmount} total XP${vipInfo}${boostInfo}${reason ? ` (${reason})` : ''}`);
    } else {
      console.log(`⭐ +${finalAmount} XP${reason ? ` (${reason})` : ''}`);
    }
    
    setXP(prevXP => {
      const newXP = prevXP + finalAmount;
      const required = calculateXPForLevel(level);
      
      // Check for level up
      if (newXP >= required) {
        const overflow = newXP - required;
        setLevel(prevLevel => {
          const newLevel = prevLevel + 1;
          setLastLevelUp(newLevel);
          setShowLevelUp(true);
          
          // Auto-hide level up notification after 5 seconds
          setTimeout(() => setShowLevelUp(false), 5000);
          
          console.log(`🎉 LEVEL UP! Now level ${newLevel}`);
          
          // Check for rewards at this level
          if (LEVEL_REWARDS[newLevel]) {
            const reward = LEVEL_REWARDS[newLevel];
            console.log(`🎁 REWARD AVAILABLE at level ${newLevel}:`, reward);
            
            // Add to unclaimed rewards
            setUnclaimedRewards(prev => [...prev, { level: newLevel, reward }]);
          }
          
          return newLevel;
        });
        return overflow;
      }
      
      return newXP;
    });
    
    setTotalXpEarned(prev => prev + finalAmount);
  };

  const claimAllRewards = () => {
    if (unclaimedRewards.length === 0) {
      return { totalChips: 0, totalXP: 0, multiplierGain: 0 };
    }

    let totalChips = 0;
    let totalXP = 0;
    let multiplierGain = 0;

    unclaimedRewards.forEach(({ reward }) => {
      if (reward.chips) totalChips += reward.chips;
      if (reward.xpBoost) totalXP += reward.xpBoost;
      if (reward.xpMultiplier) multiplierGain += reward.xpMultiplier;
    });

    // Apply XP multiplier increase
    if (multiplierGain > 0) {
      setXpMultiplier(prev => prev + multiplierGain);
    }

    // Apply instant XP boost
    if (totalXP > 0) {
      setXP(prev => prev + totalXP);
      setTotalXpEarned(prev => prev + totalXP);
    }

    console.log(`🎉 CLAIMED REWARDS: +$${totalChips} chips, +${totalXP} XP, +${multiplierGain}% XP multiplier`);
    
    // Clear unclaimed rewards
    setUnclaimedRewards([]);

    return { totalChips, totalXP, multiplierGain };
  };

  const doPrestige = () => {
    if (!canPrestige) {
      console.warn('❌ Cannot prestige - must be level 100');
      return;
    }
    
    console.log('⭐✨ PRESTIGE! Resetting to level 1 with prestige star');
    setPrestige(prev => prev + 1);
    setLevel(1);
    setXP(0);
    // Keep totalXpEarned and xpMultiplier (permanent bonuses!)
    setUnclaimedRewards([]);
    
    // Show notification
    alert(`🌟 PRESTIGE ${prestige + 1}! 🌟\n\nYou've reset to level 1 with a prestigious golden star!\n\nYour XP multiplier (${xpMultiplier}%) is KEPT!\nAll your unlocks are kept!\n\nLevel up again for even MORE rewards!`);
  };

  // Level up notification component
  useEffect(() => {
    if (showLevelUp) {
      const reward = LEVEL_REWARDS[lastLevelUp];
      const levelUpDiv = document.createElement('div');
      levelUpDiv.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 z-[60] pointer-events-none';
      levelUpDiv.innerHTML = `
        <div class="bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 text-white px-8 py-4 rounded-xl shadow-2xl border-4 border-yellow-300 animate-bounce">
          <div class="text-center">
            <div class="text-3xl font-bold mb-1">🎉 LEVEL UP! 🎉</div>
            <div class="text-xl font-bold">Level ${lastLevelUp}</div>
            ${reward ? `
              <div class="text-sm mt-2 space-y-1">
                <div class="font-bold text-yellow-200">🎁 REWARDS AVAILABLE - CHECK YOUR REWARDS!</div>
                ${reward.chips ? `<div class="text-xs">• $${reward.chips.toLocaleString()} Chips</div>` : ''}
                ${reward.xpBoost ? `<div class="text-xs">• +${reward.xpBoost.toLocaleString()} Instant XP</div>` : ''}
                ${reward.xpMultiplier ? `<div class="text-xs">• +${reward.xpMultiplier}% Permanent XP Multiplier</div>` : ''}
              </div>
            ` : ''}
          </div>
        </div>
      `;
      document.body.appendChild(levelUpDiv);
      
      setTimeout(() => {
        levelUpDiv.remove();
      }, 5000);
    }
  }, [showLevelUp, lastLevelUp]);

  return (
    <ProgressionContext.Provider
      value={{
        level,
        xp,
        xpToNextLevel,
        totalXpEarned,
        addXP,
        prestige,
        canPrestige,
        doPrestige,
        xpMultiplier,
        unclaimedRewards,
        claimAllRewards,
      }}
    >
      {children}
    </ProgressionContext.Provider>
  );
}