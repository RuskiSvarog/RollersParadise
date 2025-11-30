import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

export interface XPBoost {
  id: string;
  name: string;
  multiplier: number; // 1.5 = 50% bonus, 2.0 = 100% bonus (double XP)
  expiresAt: number; // timestamp
  source: string; // 'daily-challenge', 'loyalty-reward', 'vip', etc.
}

interface XPBoostContextType {
  activeBoosts: XPBoost[];
  addBoost: (name: string, multiplier: number, durationMinutes: number, source: string) => void;
  removeBoost: (id: string) => void;
  getCurrentMultiplier: () => number;
  getTimeRemaining: (boostId: string) => number; // returns minutes remaining
  hasActiveBoost: boolean;
  syncBoostsWithServer: (email: string) => Promise<void>;
}

const XPBoostContext = createContext<XPBoostContextType | undefined>(undefined);

export function useXPBoost() {
  const context = useContext(XPBoostContext);
  if (!context) {
    throw new Error('useXPBoost must be used within XPBoostProvider');
  }
  return context;
}

interface XPBoostProviderProps {
  children: ReactNode;
}

export function XPBoostProvider({ children }: XPBoostProviderProps) {
  const [activeBoosts, setActiveBoosts] = useState<XPBoost[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('xp-boosts-v1');
      if (saved) {
        const data = JSON.parse(saved);
        // Filter out expired boosts
        const now = Date.now();
        const validBoosts = (data.boosts || []).filter((boost: XPBoost) => boost.expiresAt > now);
        setActiveBoosts(validBoosts);
        console.log('✅ Loaded XP boosts:', validBoosts.length, 'active');
      }
    } catch (error) {
      console.error('Error loading XP boosts:', error);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (activeBoosts.length >= 0) {
      const data = {
        boosts: activeBoosts,
        lastSaved: Date.now(),
      };
      localStorage.setItem('xp-boosts-v1', JSON.stringify(data));
    }
  }, [activeBoosts]);

  // Auto-cleanup expired boosts every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setActiveBoosts(prev => {
        const stillActive = prev.filter(boost => boost.expiresAt > now);
        if (stillActive.length !== prev.length) {
          console.log('🔄 Removed expired XP boosts');
        }
        return stillActive;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const addBoost = (name: string, multiplier: number, durationMinutes: number, source: string) => {
    const now = Date.now();
    const expiresAt = now + (durationMinutes * 60 * 1000);

    const newBoost: XPBoost = {
      id: `boost-${Date.now()}-${Math.random()}`,
      name,
      multiplier,
      expiresAt,
      source,
    };

    setActiveBoosts(prev => [...prev, newBoost]);
    console.log(`⚡ Added XP boost: ${name} (${multiplier}x for ${durationMinutes} minutes)`);
  };

  const removeBoost = (id: string) => {
    setActiveBoosts(prev => prev.filter(boost => boost.id !== id));
    console.log('🗑️ Removed XP boost:', id);
  };

  // Calculate total multiplier (boosts stack additively)
  const getCurrentMultiplier = (): number => {
    const now = Date.now();
    const validBoosts = activeBoosts.filter(boost => boost.expiresAt > now);
    
    if (validBoosts.length === 0) return 1.0;

    // Stack boosts: 1.0 base + (sum of all bonus multipliers - 1.0 for each)
    const totalBonus = validBoosts.reduce((sum, boost) => sum + (boost.multiplier - 1.0), 0);
    return 1.0 + totalBonus;
  };

  const getTimeRemaining = (boostId: string): number => {
    const boost = activeBoosts.find(b => b.id === boostId);
    if (!boost) return 0;

    const now = Date.now();
    const remainingMs = boost.expiresAt - now;
    return Math.max(0, Math.floor(remainingMs / 60000)); // Return minutes
  };

  // Sync boosts with server to ensure they're legitimate
  const syncBoostsWithServer = async (email: string) => {
    if (!email) return;

    try {
      console.log('🔄 Syncing XP boosts with server for validation...');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/boosts?email=${encodeURIComponent(email)}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const serverBoosts = data.boosts || [];
        
        // Filter out expired boosts server-side
        const now = Date.now();
        const validBoosts = serverBoosts.filter((boost: XPBoost) => boost.expiresAt > now);
        
        setActiveBoosts(validBoosts);
        console.log(`✅ Synced ${validBoosts.length} legitimate XP boosts from server`);
        
        // Update localStorage with validated boosts
        localStorage.setItem('xp-boosts-v1', JSON.stringify({
          boosts: validBoosts,
          lastSaved: Date.now(),
        }));
      }
    } catch (error) {
      // Silently fail - server may not be running in development
      // Just use localStorage boosts as fallback
      console.log('⚠️ Could not sync boosts with server (using local cache)');
    }
  };

  const hasActiveBoost = activeBoosts.some(boost => boost.expiresAt > Date.now());

  return (
    <XPBoostContext.Provider
      value={{
        activeBoosts,
        addBoost,
        removeBoost,
        getCurrentMultiplier,
        getTimeRemaining,
        hasActiveBoost,
        syncBoostsWithServer,
      }}
    >
      {children}
    </XPBoostContext.Provider>
  );
}
