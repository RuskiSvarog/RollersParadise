import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface VIPStatus {
  isVIP: boolean;
  tier: 'free' | 'monthly' | 'yearly';
  expiresAt: number | null;
  joinedAt: number | null;
  lastDailyBonus: number | null;
  totalMonthsSubscribed: number;
}

interface VIPContextType {
  vipStatus: VIPStatus;
  activateVIP: (plan: 'monthly' | 'yearly', giveBoostCards?: boolean) => void;
  cancelVIP: () => void;
  claimDailyBonus: () => { claimed: boolean; amount: number };
  canClaimDailyBonus: () => boolean;
  getDaysUntilExpiry: () => number;
  getVIPPerks: () => VIPPerks;
}

interface VIPPerks {
  dailyBonus: number;
  xpMultiplier: number;
  maxBet: number;
  exclusiveThemes: string[];
  exclusiveDice: string[];
  prioritySupport: boolean;
  earlyAccess: boolean;
  adFree: boolean;
}

const VIPContext = createContext<VIPContextType | undefined>(undefined);

export function VIPProvider({ children }: { children: ReactNode }) {
  const [vipStatus, setVIPStatus] = useState<VIPStatus>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('rollers-paradise-vip-status');
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      isVIP: false,
      tier: 'free' as const,
      expiresAt: null,
      joinedAt: null,
      lastDailyBonus: null,
      totalMonthsSubscribed: 0
    };
  });

  // Save to localStorage whenever status changes
  useEffect(() => {
    localStorage.setItem('rollers-paradise-vip-status', JSON.stringify(vipStatus));
  }, [vipStatus]);

  // Check if VIP has expired
  useEffect(() => {
    if (vipStatus.isVIP && vipStatus.expiresAt && vipStatus.expiresAt < Date.now()) {
      console.log('⚠️ VIP membership has expired');
      setVIPStatus(prev => ({
        ...prev,
        isVIP: false,
        tier: 'free'
      }));
    }
  }, [vipStatus.isVIP, vipStatus.expiresAt]);

  const activateVIP = (plan: 'monthly' | 'yearly', giveBoostCards: boolean = true) => {
    const now = Date.now();
    const duration = plan === 'monthly' ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;
    
    setVIPStatus(prev => ({
      ...prev,
      isVIP: true,
      tier: plan,
      expiresAt: now + duration,
      joinedAt: prev.joinedAt || now,
      totalMonthsSubscribed: prev.totalMonthsSubscribed + (plan === 'monthly' ? 1 : 12)
    }));

    // Award boost cards based on plan
    if (giveBoostCards && typeof window !== 'undefined') {
      // Dispatch custom event to add boost cards
      const boostRewards = plan === 'monthly' 
        ? [
            { type: 'xp-boost-24h', quantity: 3 },  // 3x 24-hour boosts
            { type: 'xp-boost-1h', quantity: 5 },   // 5x 1-hour boosts
          ]
        : [
            { type: 'xp-boost-24h', quantity: 10 }, // 10x 24-hour boosts
            { type: 'xp-boost-1h', quantity: 15 },  // 15x 1-hour boosts
            { type: 'xp-boost-mega', quantity: 5 }, // 5x mega boosts
            { type: 'xp-boost-weekend', quantity: 2 }, // 2x weekend boosts
          ];
      
      window.dispatchEvent(new CustomEvent('vip-boost-rewards', { 
        detail: { rewards: boostRewards, plan } 
      }));
      
      console.log(`🎁 Awarded ${plan === 'monthly' ? 'Monthly' : 'Yearly'} VIP boost cards!`);
    }

    console.log(`✅ VIP ${plan} plan activated!`);
  };

  const cancelVIP = () => {
    setVIPStatus(prev => ({
      ...prev,
      isVIP: false,
      tier: 'free'
    }));
    console.log('❌ VIP membership cancelled');
  };

  const canClaimDailyBonus = (): boolean => {
    if (!vipStatus.isVIP) return false;
    if (!vipStatus.lastDailyBonus) return true;
    
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    return now - vipStatus.lastDailyBonus >= dayInMs;
  };

  const claimDailyBonus = (): { claimed: boolean; amount: number } => {
    if (!canClaimDailyBonus()) {
      return { claimed: false, amount: 0 };
    }

    const bonusAmount = 500; // $500 daily bonus for VIP
    
    setVIPStatus(prev => ({
      ...prev,
      lastDailyBonus: Date.now()
    }));

    console.log(`🎁 VIP Daily Bonus claimed: $${bonusAmount}`);
    return { claimed: true, amount: bonusAmount };
  };

  const getDaysUntilExpiry = (): number => {
    if (!vipStatus.isVIP || !vipStatus.expiresAt) return 0;
    const daysLeft = Math.ceil((vipStatus.expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysLeft);
  };

  const getVIPPerks = (): VIPPerks => {
    if (!vipStatus.isVIP) {
      return {
        dailyBonus: 100,
        xpMultiplier: 1.0,
        maxBet: 500,
        exclusiveThemes: [],
        exclusiveDice: [],
        prioritySupport: false,
        earlyAccess: false,
        adFree: false
      };
    }

    return {
      dailyBonus: 500,
      xpMultiplier: 1.25,
      maxBet: 1000,
      exclusiveThemes: ['gold-rush', 'neon-city', 'royal-palace', 'ocean-blue', 'crimson-luxury'],
      exclusiveDice: ['gold', 'diamond', 'rainbow', 'fire', 'ice', 'galaxy', 'emerald', 'ruby', 'sapphire', 'obsidian'],
      prioritySupport: true,
      earlyAccess: true,
      adFree: true
    };
  };

  return (
    <VIPContext.Provider
      value={{
        vipStatus,
        activateVIP,
        cancelVIP,
        claimDailyBonus,
        canClaimDailyBonus,
        getDaysUntilExpiry,
        getVIPPerks
      }}
    >
      {children}
    </VIPContext.Provider>
  );
}

export function useVIP() {
  const context = useContext(VIPContext);
  if (!context) {
    throw new Error('useVIP must be used within VIPProvider');
  }
  return context;
}
