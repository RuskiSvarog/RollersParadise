import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { saveToCloud, loadFromCloud } from '../utils/cloudStorage';

interface DailyReward {
  day: number;
  chips: number;
  xp: number;
  xpMultiplier?: number; // Bonus XP multiplier percentage
  bonus?: string;
}

interface DailyRewardsContextType {
  currentStreak: number;
  lastClaimDate: string | null;
  canClaimToday: boolean;
  claimDailyReward: () => DailyReward | null;
  totalRewardsClaimed: number;
  longestStreak: number;
}

const DailyRewardsContext = createContext<DailyRewardsContextType | undefined>(undefined);

export function useDailyRewards() {
  const context = useContext(DailyRewardsContext);
  if (!context) {
    throw new Error('useDailyRewards must be used within DailyRewardsProvider');
  }
  return context;
}

interface DailyRewardsProviderProps {
  children: ReactNode;
}

// Enhanced daily reward schedule with MUCH better rewards
export const DAILY_REWARDS: DailyReward[] = [
  { day: 1, chips: 100, xp: 50 },
  { day: 2, chips: 200, xp: 100 },
  { day: 3, chips: 350, xp: 175, xpMultiplier: 5, bonus: '🎯 +5% XP Multiplier Bonus!' },
  { day: 4, chips: 500, xp: 250 },
  { day: 5, chips: 750, xp: 375, xpMultiplier: 10, bonus: '🎯 +10% XP Multiplier Bonus!' },
  { day: 6, chips: 1000, xp: 500 },
  { day: 7, chips: 2500, xp: 1250, xpMultiplier: 25, bonus: '🎉 WEEKLY JACKPOT! +25% XP Multiplier!' },
];

export function DailyRewardsProvider({ children }: DailyRewardsProviderProps) {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [lastClaimDate, setLastClaimDate] = useState<string | null>(null);
  const [totalRewardsClaimed, setTotalRewardsClaimed] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);

  // Load from localStorage and cloud
  useEffect(() => {
    const loadDailyRewards = async () => {
      try {
        // Try cloud first
        try {
          const cloudData = await loadFromCloud();
          if (cloudData?.dailyRewards) {
            const data = cloudData.dailyRewards;
            setCurrentStreak(data.currentStreak || 0);
            setLastClaimDate(data.lastClaimDate || null);
            setTotalRewardsClaimed(data.totalRewardsClaimed || 0);
            setLongestStreak(data.longestStreak || 0);
            console.log('✅ Loaded daily rewards data from cloud:', data);
            
            // Check if streak should be reset
            if (data.lastClaimDate) {
              const lastClaim = new Date(data.lastClaimDate);
              const now = new Date();
              
              lastClaim.setHours(0, 0, 0, 0);
              now.setHours(0, 0, 0, 0);
              
              const daysDifference = Math.floor((now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24));
              
              if (daysDifference > 1) {
                console.log('⚠️ Streak broken! Days since last claim:', daysDifference);
                setCurrentStreak(0);
              }
            }
            return;
          }
        } catch (cloudError) {
          console.log('⚠️ Cloud data not available, trying localStorage');
        }
        
        // Fallback to localStorage
        const saved = localStorage.getItem('daily-rewards-data-v2');
        if (saved) {
          const data = JSON.parse(saved);
          setCurrentStreak(data.currentStreak || 0);
          setLastClaimDate(data.lastClaimDate || null);
          setTotalRewardsClaimed(data.totalRewardsClaimed || 0);
          setLongestStreak(data.longestStreak || 0);
          console.log('✅ Loaded daily rewards data from localStorage:', data);
          
          // Check if streak should be reset
          if (data.lastClaimDate) {
            const lastClaim = new Date(data.lastClaimDate);
            const now = new Date();
            
            lastClaim.setHours(0, 0, 0, 0);
            now.setHours(0, 0, 0, 0);
            
            const daysDifference = Math.floor((now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDifference > 1) {
              console.log('⚠️ Streak broken! Days since last claim:', daysDifference);
              setCurrentStreak(0);
            }
          }
        }
      } catch (error) {
        console.error('Error loading daily rewards data:', error);
      }
    };
    
    loadDailyRewards();
  }, []);

  // Auto-save to localStorage AND cloud (SKIP FOR GUEST ACCOUNTS)
  useEffect(() => {
    // Check if current user is a guest before saving
    try {
      const savedProfile = localStorage.getItem('rollers-paradise-profile') || localStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        const isGuest = profile.email?.includes('@temporary.local');
        if (isGuest) {
          console.log('👻 Guest account detected - NOT saving daily rewards');
          return; // Don't save daily rewards for guests
        }
      }
    } catch (e) {
      // If we can't check, don't save to be safe
      return;
    }
    
    const data = {
      currentStreak,
      lastClaimDate,
      totalRewardsClaimed,
      longestStreak,
      lastSaved: Date.now()
    };
    
    // Save to localStorage
    localStorage.setItem('daily-rewards-data-v2', JSON.stringify(data));
    
    // Save to cloud asynchronously
    saveToCloud({ dailyRewards: data } as any).catch(err => {
      console.warn('⚠️ Failed to save daily rewards to cloud:', err);
    });
  }, [currentStreak, lastClaimDate, totalRewardsClaimed, longestStreak]);

  // Check if player can claim today
  const canClaimToday = (() => {
    if (!lastClaimDate) return true; // First time claiming
    
    const lastClaim = new Date(lastClaimDate);
    const now = new Date();
    
    // Check if it's a different day
    const lastClaimDay = lastClaim.toDateString();
    const todayDay = now.toDateString();
    
    return lastClaimDay !== todayDay;
  })();

  const claimDailyReward = (): DailyReward | null => {
    if (!canClaimToday) {
      console.warn('❌ Already claimed today!');
      return null;
    }
    
    // Calculate new streak using proper calendar day comparison
    let newStreak = currentStreak + 1;
    
    // Check if streak was broken (more than 1 day since last claim)
    if (lastClaimDate) {
      const lastClaim = new Date(lastClaimDate);
      const now = new Date();
      
      // Reset time to midnight for accurate day comparison
      lastClaim.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);
      
      const daysDifference = Math.floor((now.getTime() - lastClaim.getTime()) / (1000 * 60 * 60 * 24));
      
      // Streak is broken if more than 1 day has passed (skipped a day)
      if (daysDifference > 1) {
        console.log('⚠️ Streak broken! Starting fresh at day 1. Days since last claim:', daysDifference);
        newStreak = 1;
      } else if (daysDifference === 1) {
        // Consecutive day - continue streak
        console.log('✅ Consecutive day claim! Continuing streak:', newStreak);
      }
    } else {
      // First claim ever
      console.log('🎉 First daily reward claim!');
    }
    
    // Get reward for current streak day (cycles through 7-day schedule)
    const rewardDay = ((newStreak - 1) % 7) + 1;
    const reward = DAILY_REWARDS[rewardDay - 1];
    
    console.log(`🎁 Claiming Day ${rewardDay} reward (Streak: ${newStreak}):`, reward);
    
    // Update state
    setCurrentStreak(newStreak);
    setLastClaimDate(new Date().toISOString());
    setTotalRewardsClaimed(prev => prev + 1);
    setLongestStreak(prev => Math.max(prev, newStreak));
    
    return reward;
  };

  return (
    <DailyRewardsContext.Provider
      value={{
        currentStreak,
        lastClaimDate,
        canClaimToday,
        claimDailyReward,
        totalRewardsClaimed,
        longestStreak,
      }}
    >
      {children}
    </DailyRewardsContext.Provider>
  );
}