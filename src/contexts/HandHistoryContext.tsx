import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface HandHistoryEntry {
  id: string;
  timestamp: number;
  sessionName: string;
  rolls: Array<{
    dice1: number;
    dice2: number;
    total: number;
    phase: 'come-out' | 'point';
    point?: number;
  }>;
  bets: Array<{
    type: string;
    amount: number;
    result: 'win' | 'loss' | 'push';
    payout: number;
  }>;
  startingBalance: number;
  endingBalance: number;
  profitLoss: number;
  duration: number; // in seconds
  totalRolls: number;
  pointsMade: number;
  pointsMissed: number;
}

interface HandHistoryContextType {
  history: HandHistoryEntry[];
  currentSession: Partial<HandHistoryEntry> | null;
  startSession: (startingBalance: number) => void;
  endSession: (endingBalance: number) => void;
  addRoll: (dice1: number, dice2: number, phase: 'come-out' | 'point', point?: number) => void;
  addBet: (type: string, amount: number, result: 'win' | 'loss' | 'push', payout: number) => void;
  getSession: (id: string) => HandHistoryEntry | undefined;
  deleteSession: (id: string) => void;
  getTotalStats: () => {
    totalSessions: number;
    totalProfit: number;
    totalRolls: number;
    winRate: number;
  };
}

const HandHistoryContext = createContext<HandHistoryContextType | undefined>(undefined);

export function useHandHistory() {
  const context = useContext(HandHistoryContext);
  if (!context) {
    throw new Error('useHandHistory must be used within HandHistoryProvider');
  }
  return context;
}

interface HandHistoryProviderProps {
  children: ReactNode;
}

export function HandHistoryProvider({ children }: HandHistoryProviderProps) {
  const [history, setHistory] = useState<HandHistoryEntry[]>([]);
  const [currentSession, setCurrentSession] = useState<Partial<HandHistoryEntry> | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('hand-history-v1');
      if (saved) {
        const data = JSON.parse(saved);
        setHistory(data.history || []);
        console.log('✅ Loaded hand history:', data.history?.length || 0, 'sessions');
      }
    } catch (error) {
      console.error('Error loading hand history:', error);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (history.length > 0) {
      const data = {
        history: history.slice(-50), // Keep last 50 sessions
        lastSaved: Date.now(),
      };
      localStorage.setItem('hand-history-v1', JSON.stringify(data));
    }
  }, [history]);

  const startSession = (startingBalance: number) => {
    const session: Partial<HandHistoryEntry> = {
      id: `session-${Date.now()}`,
      timestamp: Date.now(),
      sessionName: `Session ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
      rolls: [],
      bets: [],
      startingBalance,
      totalRolls: 0,
      pointsMade: 0,
      pointsMissed: 0,
    };

    setCurrentSession(session);
    console.log('🎬 Started new session');
  };

  const endSession = (endingBalance: number) => {
    if (!currentSession || !currentSession.id) return;

    const duration = Math.floor((Date.now() - (currentSession.timestamp || 0)) / 1000);
    const profitLoss = endingBalance - (currentSession.startingBalance || 0);

    const completedSession: HandHistoryEntry = {
      id: currentSession.id,
      timestamp: currentSession.timestamp || Date.now(),
      sessionName: currentSession.sessionName || 'Unnamed Session',
      rolls: currentSession.rolls || [],
      bets: currentSession.bets || [],
      startingBalance: currentSession.startingBalance || 0,
      endingBalance,
      profitLoss,
      duration,
      totalRolls: currentSession.totalRolls || 0,
      pointsMade: currentSession.pointsMade || 0,
      pointsMissed: currentSession.pointsMissed || 0,
    };

    setHistory(prev => [completedSession, ...prev]);
    setCurrentSession(null);
    console.log('🏁 Ended session. P/L:', profitLoss);
  };

  const addRoll = (dice1: number, dice2: number, phase: 'come-out' | 'point', point?: number) => {
    if (!currentSession) return;

    setCurrentSession(prev => ({
      ...prev,
      rolls: [
        ...(prev?.rolls || []),
        {
          dice1,
          dice2,
          total: dice1 + dice2,
          phase,
          point,
        },
      ],
      totalRolls: (prev?.totalRolls || 0) + 1,
    }));
  };

  const addBet = (type: string, amount: number, result: 'win' | 'loss' | 'push', payout: number) => {
    if (!currentSession) return;

    setCurrentSession(prev => ({
      ...prev,
      bets: [
        ...(prev?.bets || []),
        {
          type,
          amount,
          result,
          payout,
        },
      ],
    }));
  };

  const getSession = (id: string): HandHistoryEntry | undefined => {
    return history.find(session => session.id === id);
  };

  const deleteSession = (id: string) => {
    setHistory(prev => prev.filter(session => session.id !== id));
    console.log('🗑️ Deleted session:', id);
  };

  const getTotalStats = () => {
    const totalSessions = history.length;
    const totalProfit = history.reduce((sum, session) => sum + session.profitLoss, 0);
    const totalRolls = history.reduce((sum, session) => sum + session.totalRolls, 0);
    const totalWins = history.reduce((sum, session) => {
      return sum + session.bets.filter(bet => bet.result === 'win').length;
    }, 0);
    const totalBets = history.reduce((sum, session) => sum + session.bets.length, 0);
    const winRate = totalBets > 0 ? (totalWins / totalBets) * 100 : 0;

    return {
      totalSessions,
      totalProfit,
      totalRolls,
      winRate,
    };
  };

  return (
    <HandHistoryContext.Provider
      value={{
        history,
        currentSession,
        startSession,
        endSession,
        addRoll,
        addBet,
        getSession,
        deleteSession,
        getTotalStats,
      }}
    >
      {children}
    </HandHistoryContext.Provider>
  );
}
