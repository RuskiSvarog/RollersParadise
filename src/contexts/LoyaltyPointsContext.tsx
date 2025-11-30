import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface LoyaltyTier {
  name: string;
  minPoints: number;
  benefits: string[];
  color: string;
  icon: string;
}

export interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  cost: number;
  type: 'chips' | 'xpBoost' | 'cosmetic' | 'special';
  value: number; // For xpBoost: duration in minutes
  multiplier?: number; // For xpBoost: multiplier value
  icon: string;
}

interface LoyaltyPointsContextType {
  points: number;
  lifetimePoints: number;
  currentTier: LoyaltyTier;
  nextTier: LoyaltyTier | null;
  earnPoints: (amount: number, reason: string) => void;
  spendPoints: (amount: number) => boolean;
  redeemReward: (rewardId: string) => boolean;
  getPointsToNextTier: () => number;
  allRewards: LoyaltyReward[];
}

const LoyaltyPointsContext = createContext<LoyaltyPointsContextType | undefined>(undefined);

export function useLoyaltyPoints() {
  const context = useContext(LoyaltyPointsContext);
  if (!context) {
    throw new Error('useLoyaltyPoints must be used within LoyaltyPointsProvider');
  }
  return context;
}

// Loyalty Tiers
export const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    name: 'Bronze',
    minPoints: 0,
    benefits: ['Earn 1 point per $10 wagered', 'Access to basic rewards'],
    color: 'from-orange-700 to-orange-900',
    icon: '🥉',
  },
  {
    name: 'Silver',
    minPoints: 1000,
    benefits: ['Earn 1.25 points per $10 wagered', 'Access to silver rewards', '+5% daily bonus'],
    color: 'from-gray-400 to-gray-600',
    icon: '🥈',
  },
  {
    name: 'Gold',
    minPoints: 5000,
    benefits: ['Earn 1.5 points per $10 wagered', 'Access to gold rewards', '+10% daily bonus', 'Priority support'],
    color: 'from-yellow-500 to-yellow-700',
    icon: '🥇',
  },
  {
    name: 'Platinum',
    minPoints: 15000,
    benefits: ['Earn 2 points per $10 wagered', 'Access to all rewards', '+20% daily bonus', 'Exclusive cosmetics'],
    color: 'from-cyan-400 to-blue-600',
    icon: '💎',
  },
  {
    name: 'Diamond',
    minPoints: 50000,
    benefits: ['Earn 3 points per $10 wagered', 'VIP treatment', '+50% daily bonus', 'Custom table themes'],
    color: 'from-purple-500 to-pink-600',
    icon: '👑',
  },
];

// Loyalty Rewards Catalog
export const LOYALTY_REWARDS: LoyaltyReward[] = [
  {
    id: 'chips-100',
    name: '$100 Bonus Chips',
    description: 'Instant chip bonus',
    cost: 50,
    type: 'chips',
    value: 100,
    icon: '💰',
  },
  {
    id: 'chips-500',
    name: '$500 Bonus Chips',
    description: 'Larger chip bonus',
    cost: 200,
    type: 'chips',
    value: 500,
    icon: '💸',
  },
  {
    id: 'chips-1000',
    name: '$1,000 Bonus Chips',
    description: 'Major chip bonus',
    cost: 350,
    type: 'chips',
    value: 1000,
    icon: '💵',
  },
  {
    id: 'xp-boost-2hr',
    name: '2 Hour XP Boost',
    description: '+50% XP for 2 hours',
    cost: 75,
    type: 'xpBoost',
    value: 120, // minutes
    multiplier: 1.5,
    icon: '⚡',
  },
  {
    id: 'xp-boost-6hr',
    name: '6 Hour XP Boost',
    description: 'Double XP for 6 hours',
    cost: 200,
    type: 'xpBoost',
    value: 360, // minutes
    multiplier: 2.0,
    icon: '🔥',
  },
  {
    id: 'xp-boost-24hr',
    name: '24 Hour XP Boost',
    description: 'Double XP for 24 hours',
    cost: 600,
    type: 'xpBoost',
    value: 1440, // minutes
    multiplier: 2.0,
    icon: '💫',
  },
  {
    id: 'xp-boost-mega',
    name: 'MEGA XP Boost',
    description: 'Triple XP for 12 hours!',
    cost: 1000,
    type: 'xpBoost',
    value: 720, // minutes
    multiplier: 3.0,
    icon: '🌟',
  },
  {
    id: 'dice-gold',
    name: 'Gold Dice Skin',
    description: 'Luxury golden dice',
    cost: 300,
    type: 'cosmetic',
    value: 1,
    icon: '🎲',
  },
  {
    id: 'table-premium',
    name: 'Premium Table Theme',
    description: 'Exclusive table design',
    cost: 500,
    type: 'cosmetic',
    value: 1,
    icon: '🎨',
  },
  {
    id: 'badge-legend',
    name: 'Legend Badge',
    description: 'Show off your loyalty',
    cost: 1000,
    type: 'special',
    value: 1,
    icon: '🏆',
  },
];

interface LoyaltyPointsProviderProps {
  children: ReactNode;
}

export function LoyaltyPointsProvider({ children }: LoyaltyPointsProviderProps) {
  const [points, setPoints] = useState(0);
  const [lifetimePoints, setLifetimePoints] = useState(0);
  const [redeemedRewards, setRedeemedRewards] = useState<string[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('loyalty-points-v1');
      if (saved) {
        const data = JSON.parse(saved);
        setPoints(data.points || 0);
        setLifetimePoints(data.lifetimePoints || 0);
        setRedeemedRewards(data.redeemedRewards || []);
        console.log('✅ Loaded loyalty points:', data);
      }
    } catch (error) {
      console.error('Error loading loyalty points:', error);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const data = {
      points,
      lifetimePoints,
      redeemedRewards,
      lastSaved: Date.now(),
    };
    localStorage.setItem('loyalty-points-v1', JSON.stringify(data));
  }, [points, lifetimePoints, redeemedRewards]);

  // Determine current tier
  const currentTier = LOYALTY_TIERS.reduce((prev, curr) => {
    return lifetimePoints >= curr.minPoints ? curr : prev;
  }, LOYALTY_TIERS[0]);

  // Determine next tier
  const currentTierIndex = LOYALTY_TIERS.findIndex(t => t.name === currentTier.name);
  const nextTier = currentTierIndex < LOYALTY_TIERS.length - 1 
    ? LOYALTY_TIERS[currentTierIndex + 1] 
    : null;

  const earnPoints = (amount: number, reason: string) => {
    setPoints(prev => prev + amount);
    setLifetimePoints(prev => prev + amount);
    console.log(`💎 Earned ${amount} loyalty points: ${reason}`);
  };

  const spendPoints = (amount: number): boolean => {
    if (points >= amount) {
      setPoints(prev => prev - amount);
      return true;
    }
    return false;
  };

  const redeemReward = (rewardId: string): boolean => {
    const reward = LOYALTY_REWARDS.find(r => r.id === rewardId);
    if (!reward) return false;

    if (spendPoints(reward.cost)) {
      setRedeemedRewards(prev => [...prev, rewardId]);
      console.log(`🎁 Redeemed reward: ${reward.name}`);
      return true;
    }

    return false;
  };

  const getPointsToNextTier = (): number => {
    if (!nextTier) return 0;
    return nextTier.minPoints - lifetimePoints;
  };

  return (
    <LoyaltyPointsContext.Provider
      value={{
        points,
        lifetimePoints,
        currentTier,
        nextTier,
        earnPoints,
        spendPoints,
        redeemReward,
        getPointsToNextTier,
        allRewards: LOYALTY_REWARDS,
      }}
    >
      {children}
    </LoyaltyPointsContext.Provider>
  );
}
