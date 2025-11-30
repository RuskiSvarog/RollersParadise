import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface DailyChallenge {
  id: string;
  title: string;
  description: string;
  type: 'rolls' | 'wins' | 'wagered' | 'hardways' | 'points' | 'streak' | 'specific';
  target: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  reward: {
    chips: number;
    xpBoost?: {
      multiplier: number; // 1.25 = 25% bonus, 2.0 = 100% bonus (double XP)
      durationHours: number;
    };
  };
  icon: string;
}

interface DailyChallengesContextType {
  challenges: DailyChallenge[];
  updateChallengeProgress: (type: string, amount: number, data?: any) => void;
  claimReward: (challengeId: string) => { chips: number; xpBoost?: { multiplier: number; durationHours: number } } | null;
  resetDailyChallenges: () => void;
  getCompletedCount: () => number;
  canClaimAny: boolean;
}

const DailyChallengesContext = createContext<DailyChallengesContextType | undefined>(undefined);

export function useDailyChallenges() {
  const context = useContext(DailyChallengesContext);
  if (!context) {
    throw new Error('useDailyChallenges must be used within DailyChallengesProvider');
  }
  return context;
}

interface DailyChallengesProviderProps {
  children: ReactNode;
}

// Generate fresh daily challenges
const generateDailyChallenges = (): DailyChallenge[] => {
  const allChallenges: Omit<DailyChallenge, 'progress' | 'completed' | 'claimed'>[] = [
    {
      id: 'roll-10',
      title: 'Warm Up',
      description: 'Roll the dice 10 times',
      type: 'rolls',
      target: 10,
      reward: { chips: 100, xpBoost: { multiplier: 1.25, durationHours: 2 } },
      icon: '🎲',
    },
    {
      id: 'roll-25',
      title: 'Getting Hot',
      description: 'Roll the dice 25 times',
      type: 'rolls',
      target: 25,
      reward: { chips: 250, xpBoost: { multiplier: 1.5, durationHours: 4 } },
      icon: '🔥',
    },
    {
      id: 'win-5',
      title: 'Lucky Streak',
      description: 'Win 5 bets',
      type: 'wins',
      target: 5,
      reward: { chips: 200, xpBoost: { multiplier: 1.5, durationHours: 3 } },
      icon: '🍀',
    },
    {
      id: 'win-10',
      title: 'Hot Roller',
      description: 'Win 10 bets',
      type: 'wins',
      target: 10,
      reward: { chips: 500, xpBoost: { multiplier: 2.0, durationHours: 6 } },
      icon: '🔥',
    },
    {
      id: 'wager-1000',
      title: 'Big Spender',
      description: 'Wager $1,000 total',
      type: 'wagered',
      target: 1000,
      reward: { chips: 300, xpBoost: { multiplier: 1.5, durationHours: 4 } },
      icon: '💰',
    },
    {
      id: 'wager-5000',
      title: 'High Roller',
      description: 'Wager $5,000 total',
      type: 'wagered',
      target: 5000,
      reward: { chips: 1000, xpBoost: { multiplier: 2.5, durationHours: 12 } },
      icon: '💎',
    },
    {
      id: 'hardway-3',
      title: 'Hard Way Hero',
      description: 'Hit 3 hardway bets',
      type: 'hardways',
      target: 3,
      reward: { chips: 500, xpBoost: { multiplier: 2.0, durationHours: 8 } },
      icon: '🎯',
    },
    {
      id: 'point-5',
      title: 'Point Master',
      description: 'Make the point 5 times',
      type: 'points',
      target: 5,
      reward: { chips: 400, xpBoost: { multiplier: 1.75, durationHours: 6 } },
      icon: '🏆',
    },
    {
      id: 'streak-5',
      title: 'Winning Streak',
      description: 'Win 5 bets in a row',
      type: 'streak',
      target: 5,
      reward: { chips: 750, xpBoost: { multiplier: 3.0, durationHours: 24 } },
      icon: '⚡',
    },
    {
      id: 'seven-10',
      title: 'Lucky Seven',
      description: 'Roll a 7 ten times',
      type: 'specific',
      target: 10,
      reward: { chips: 300, xpBoost: { multiplier: 1.5, durationHours: 4 } },
      icon: '🎰',
    },
  ];

  // Randomly select 5 challenges for today
  const shuffled = allChallenges.sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 5);

  return selected.map(challenge => ({
    ...challenge,
    progress: 0,
    completed: false,
    claimed: false,
  }));
};

export function DailyChallengesProvider({ children }: DailyChallengesProviderProps) {
  const [challenges, setChallenges] = useState<DailyChallenge[]>([]);
  const [lastResetDate, setLastResetDate] = useState<string | null>(null);

  // Load challenges from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('daily-challenges-v1');
      if (saved) {
        const data = JSON.parse(saved);
        setChallenges(data.challenges || []);
        setLastResetDate(data.lastResetDate || null);

        // Check if we need to reset (new day)
        if (data.lastResetDate) {
          const lastReset = new Date(data.lastResetDate);
          const now = new Date();
          lastReset.setHours(0, 0, 0, 0);
          now.setHours(0, 0, 0, 0);

          const daysDifference = Math.floor((now.getTime() - lastReset.getTime()) / (1000 * 60 * 60 * 24));

          if (daysDifference >= 1) {
            console.log('🔄 New day detected - Resetting daily challenges');
            const newChallenges = generateDailyChallenges();
            setChallenges(newChallenges);
            setLastResetDate(new Date().toISOString());
          }
        }
      } else {
        // First time - generate challenges
        const newChallenges = generateDailyChallenges();
        setChallenges(newChallenges);
        setLastResetDate(new Date().toISOString());
      }
    } catch (error) {
      console.error('Error loading daily challenges:', error);
      const newChallenges = generateDailyChallenges();
      setChallenges(newChallenges);
      setLastResetDate(new Date().toISOString());
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (challenges.length > 0) {
      const data = {
        challenges,
        lastResetDate,
        lastSaved: Date.now(),
      };
      localStorage.setItem('daily-challenges-v1', JSON.stringify(data));
    }
  }, [challenges, lastResetDate]);

  const updateChallengeProgress = (type: string, amount: number, data?: any) => {
    setChallenges(prev =>
      prev.map(challenge => {
        if (challenge.completed || challenge.type !== type) return challenge;

        let newProgress = challenge.progress;

        // Update progress based on type
        if (type === 'specific' && data?.number === 7) {
          newProgress += amount;
        } else if (type !== 'specific') {
          newProgress += amount;
        } else {
          return challenge;
        }

        const completed = newProgress >= challenge.target;

        if (completed && !challenge.completed) {
          console.log(`✅ Challenge completed: ${challenge.title}`);
        }

        return {
          ...challenge,
          progress: Math.min(newProgress, challenge.target),
          completed,
        };
      })
    );
  };

  const claimReward = (challengeId: string): { chips: number; xpBoost?: { multiplier: number; durationHours: number } } | null => {
    const challenge = challenges.find(c => c.id === challengeId);

    if (!challenge || !challenge.completed || challenge.claimed) {
      return null;
    }

    setChallenges(prev =>
      prev.map(c => (c.id === challengeId ? { ...c, claimed: true } : c))
    );

    const boostInfo = challenge.reward.xpBoost 
      ? `${challenge.reward.xpBoost.multiplier}x XP for ${challenge.reward.xpBoost.durationHours}h`
      : 'no XP boost';
    console.log(`🎁 Claimed reward: ${challenge.reward.chips} chips, ${boostInfo}`);
    return challenge.reward;
  };

  const resetDailyChallenges = () => {
    const newChallenges = generateDailyChallenges();
    setChallenges(newChallenges);
    setLastResetDate(new Date().toISOString());
    console.log('🔄 Daily challenges reset');
  };

  const getCompletedCount = (): number => {
    return challenges.filter(c => c.completed).length;
  };

  const canClaimAny = challenges.some(c => c.completed && !c.claimed);

  return (
    <DailyChallengesContext.Provider
      value={{
        challenges,
        updateChallengeProgress,
        claimReward,
        resetDailyChallenges,
        getCompletedCount,
        canClaimAny,
      }}
    >
      {children}
    </DailyChallengesContext.Provider>
  );
}
