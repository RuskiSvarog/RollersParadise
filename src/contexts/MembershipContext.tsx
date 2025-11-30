import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type MembershipTier = 'free' | 'basic' | 'silver' | 'gold' | 'platinum';

interface MembershipStatus {
  tier: MembershipTier;
  duration: 'monthly' | 'yearly' | null;
  expiresAt: number | null;
  joinedAt: number | null;
  lastDailyBonus: number | null;
  totalMonthsSubscribed: number;
  autoRenew: boolean;
}

interface MembershipContextType {
  membershipStatus: MembershipStatus;
  purchaseMembership: (tier: MembershipTier, duration: 'monthly' | 'yearly', giveBoostCards?: boolean) => void;
  upgradeMembership: (newTier: MembershipTier, duration: 'monthly' | 'yearly', giveBoostCards?: boolean) => void;
  downgradeMembership: (newTier: MembershipTier) => void;
  cancelMembership: () => void;
  claimDailyBonus: () => { claimed: boolean; amount: number };
  canClaimDailyBonus: () => boolean;
  getDaysUntilExpiry: () => number;
  getMembershipPerks: () => MembershipPerks;
  toggleAutoRenew: () => void;
}

interface MembershipPerks {
  dailyBonus: number;
  xpMultiplier: number;
  maxBet: number;
  exclusiveThemes: number;
  exclusiveDice: number;
  prioritySupport: boolean;
  earlyAccess: boolean;
  adFree: boolean;
  tournamentAccess: boolean;
  privateTablesMax: number;
  boostCardsMonthly: number;
  boostCardsYearly: number;
}

const TIER_PERKS: Record<MembershipTier, MembershipPerks> = {
  free: {
    dailyBonus: 100,
    xpMultiplier: 1.0,
    maxBet: 500,
    exclusiveThemes: 0,
    exclusiveDice: 0,
    prioritySupport: false,
    earlyAccess: false,
    adFree: false,
    tournamentAccess: false,
    privateTablesMax: 0,
    boostCardsMonthly: 0,
    boostCardsYearly: 0
  },
  basic: {
    dailyBonus: 250,
    xpMultiplier: 1.10,
    maxBet: 750,
    exclusiveThemes: 2,
    exclusiveDice: 3,
    prioritySupport: false,
    earlyAccess: false,
    adFree: true,
    tournamentAccess: true,
    privateTablesMax: 2,
    boostCardsMonthly: 2,
    boostCardsYearly: 15
  },
  silver: {
    dailyBonus: 500,
    xpMultiplier: 1.25,
    maxBet: 1000,
    exclusiveThemes: 5,
    exclusiveDice: 8,
    prioritySupport: false,
    earlyAccess: true,
    adFree: true,
    tournamentAccess: true,
    privateTablesMax: 5,
    boostCardsMonthly: 4,
    boostCardsYearly: 30
  },
  gold: {
    dailyBonus: 1000,
    xpMultiplier: 1.50,
    maxBet: 2500,
    exclusiveThemes: 10,
    exclusiveDice: 15,
    prioritySupport: true,
    earlyAccess: true,
    adFree: true,
    tournamentAccess: true,
    privateTablesMax: 10,
    boostCardsMonthly: 8,
    boostCardsYearly: 60
  },
  platinum: {
    dailyBonus: 2500,
    xpMultiplier: 2.0,
    maxBet: 10000,
    exclusiveThemes: 999,
    exclusiveDice: 999,
    prioritySupport: true,
    earlyAccess: true,
    adFree: true,
    tournamentAccess: true,
    privateTablesMax: 999,
    boostCardsMonthly: 20,
    boostCardsYearly: 150
  }
};

const MembershipContext = createContext<MembershipContextType | undefined>(undefined);

export function MembershipProvider({ children }: { children: ReactNode }) {
  const [membershipStatus, setMembershipStatus] = useState<MembershipStatus>(() => {
    // Load from localStorage
    const saved = localStorage.getItem('rollers-paradise-membership-v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse membership data:', e);
      }
    }
    return {
      tier: 'free',
      duration: null,
      expiresAt: null,
      joinedAt: null,
      lastDailyBonus: null,
      totalMonthsSubscribed: 0,
      autoRenew: true
    };
  });

  // Save to localStorage whenever status changes
  useEffect(() => {
    localStorage.setItem('rollers-paradise-membership-v2', JSON.stringify(membershipStatus));
  }, [membershipStatus]);

  // Check if membership has expired
  useEffect(() => {
    if (membershipStatus.tier !== 'free' && membershipStatus.expiresAt && membershipStatus.expiresAt < Date.now()) {
      console.log('⚠️ Membership has expired');
      setMembershipStatus(prev => ({
        ...prev,
        tier: 'free',
        duration: null
      }));
    }
  }, [membershipStatus.tier, membershipStatus.expiresAt]);

  // Listen for membership updates from payment confirmation
  useEffect(() => {
    const handleMembershipUpdate = (event: any) => {
      const membership = event.detail;
      if (membership) {
        console.log('🔄 Updating membership from server:', membership);
        setMembershipStatus(membership);
      }
    };

    window.addEventListener('membership-updated', handleMembershipUpdate);
    return () => {
      window.removeEventListener('membership-updated', handleMembershipUpdate);
    };
  }, []);

  const awardBoostCards = (tier: MembershipTier, duration: 'monthly' | 'yearly') => {
    if (typeof window === 'undefined') return;
    
    const perks = TIER_PERKS[tier];
    const boostCount = duration === 'monthly' ? perks.boostCardsMonthly : perks.boostCardsYearly;
    
    if (boostCount === 0) return;

    // Create boost rewards based on tier
    const boostRewards = [];
    
    if (tier === 'basic') {
      boostRewards.push(
        { type: 'xp-boost-1h', quantity: boostCount }
      );
    } else if (tier === 'silver') {
      boostRewards.push(
        { type: 'xp-boost-24h', quantity: Math.floor(boostCount / 2) },
        { type: 'xp-boost-1h', quantity: Math.ceil(boostCount / 2) }
      );
    } else if (tier === 'gold') {
      boostRewards.push(
        { type: 'xp-boost-24h', quantity: Math.floor(boostCount * 0.5) },
        { type: 'xp-boost-1h', quantity: Math.floor(boostCount * 0.3) },
        { type: 'xp-boost-mega', quantity: Math.floor(boostCount * 0.2) }
      );
    } else if (tier === 'platinum') {
      boostRewards.push(
        { type: 'xp-boost-24h', quantity: Math.floor(boostCount * 0.4) },
        { type: 'xp-boost-mega', quantity: Math.floor(boostCount * 0.3) },
        { type: 'xp-boost-weekend', quantity: Math.floor(boostCount * 0.2) },
        { type: 'xp-boost-1h', quantity: Math.floor(boostCount * 0.1) }
      );
    }
    
    window.dispatchEvent(new CustomEvent('membership-boost-rewards', { 
      detail: { rewards: boostRewards, tier, duration } 
    }));
    
    console.log(`🎁 Awarded ${tier} ${duration} boost cards!`, boostRewards);
  };

  const purchaseMembership = (tier: MembershipTier, duration: 'monthly' | 'yearly', giveBoostCards: boolean = true) => {
    if (tier === 'free') return;

    const now = Date.now();
    const durationMs = duration === 'monthly' ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;
    
    setMembershipStatus(prev => ({
      ...prev,
      tier,
      duration,
      expiresAt: now + durationMs,
      joinedAt: prev.joinedAt || now,
      totalMonthsSubscribed: prev.totalMonthsSubscribed + (duration === 'monthly' ? 1 : 12),
      autoRenew: true
    }));

    if (giveBoostCards) {
      awardBoostCards(tier, duration);
    }

    console.log(`✅ ${tier.toUpperCase()} ${duration} membership activated!`);
  };

  const upgradeMembership = (newTier: MembershipTier, duration: 'monthly' | 'yearly', giveBoostCards: boolean = true) => {
    if (newTier === 'free') return;

    const now = Date.now();
    const durationMs = duration === 'monthly' ? 30 * 24 * 60 * 60 * 1000 : 365 * 24 * 60 * 60 * 1000;
    
    setMembershipStatus(prev => ({
      ...prev,
      tier: newTier,
      duration,
      expiresAt: now + durationMs,
      joinedAt: prev.joinedAt || now,
      totalMonthsSubscribed: prev.totalMonthsSubscribed + (duration === 'monthly' ? 1 : 12),
      autoRenew: true
    }));

    if (giveBoostCards) {
      awardBoostCards(newTier, duration);
    }

    console.log(`⬆️ Upgraded to ${newTier.toUpperCase()} ${duration}!`);
  };

  const downgradeMembership = (newTier: MembershipTier) => {
    // Downgrade takes effect at end of current billing period
    // For now, we'll just log it and keep current benefits until expiry
    console.log(`⬇️ Downgrade to ${newTier.toUpperCase()} scheduled for end of billing period`);
    
    // Store the pending downgrade
    localStorage.setItem('rollers-paradise-pending-downgrade', JSON.stringify({
      newTier,
      scheduledFor: membershipStatus.expiresAt
    }));

    // You could set autoRenew to false here
    setMembershipStatus(prev => ({
      ...prev,
      autoRenew: false
    }));
  };

  const cancelMembership = () => {
    setMembershipStatus(prev => ({
      ...prev,
      tier: 'free',
      duration: null,
      autoRenew: false
    }));
    localStorage.removeItem('rollers-paradise-pending-downgrade');
    console.log('❌ Membership cancelled');
  };

  const canClaimDailyBonus = (): boolean => {
    if (membershipStatus.tier === 'free') return false;
    if (!membershipStatus.lastDailyBonus) return true;
    
    const now = Date.now();
    const dayInMs = 24 * 60 * 60 * 1000;
    return now - membershipStatus.lastDailyBonus >= dayInMs;
  };

  const claimDailyBonus = (): { claimed: boolean; amount: number } => {
    if (!canClaimDailyBonus()) {
      return { claimed: false, amount: 0 };
    }

    const bonusAmount = TIER_PERKS[membershipStatus.tier].dailyBonus;
    
    setMembershipStatus(prev => ({
      ...prev,
      lastDailyBonus: Date.now()
    }));

    console.log(`🎁 ${membershipStatus.tier.toUpperCase()} Daily Bonus claimed: $${bonusAmount}`);
    return { claimed: true, amount: bonusAmount };
  };

  const getDaysUntilExpiry = (): number => {
    if (membershipStatus.tier === 'free' || !membershipStatus.expiresAt) return 0;
    const daysLeft = Math.ceil((membershipStatus.expiresAt - Date.now()) / (24 * 60 * 60 * 1000));
    return Math.max(0, daysLeft);
  };

  const getMembershipPerks = (): MembershipPerks => {
    return TIER_PERKS[membershipStatus.tier];
  };

  const toggleAutoRenew = () => {
    setMembershipStatus(prev => ({
      ...prev,
      autoRenew: !prev.autoRenew
    }));
    console.log(`🔄 Auto-renew ${!membershipStatus.autoRenew ? 'enabled' : 'disabled'}`);
  };

  return (
    <MembershipContext.Provider
      value={{
        membershipStatus,
        purchaseMembership,
        upgradeMembership,
        downgradeMembership,
        cancelMembership,
        claimDailyBonus,
        canClaimDailyBonus,
        getDaysUntilExpiry,
        getMembershipPerks,
        toggleAutoRenew
      }}
    >
      {children}
    </MembershipContext.Provider>
  );
}

export function useMembership() {
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error('useMembership must be used within MembershipProvider');
  }
  return context;
}
