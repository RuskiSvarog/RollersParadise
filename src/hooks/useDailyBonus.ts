// React hook for daily bonus system
import { useState, useEffect, useCallback } from 'react';
import { dailyBonusManager, DailyBonusStatus } from '../utils/dailyBonusSystem';

export function useDailyBonus(userEmail: string | null) {
  const [status, setStatus] = useState<DailyBonusStatus>({
    canClaim: false,
    lastClaimTime: null,
    nextClaimTime: null,
    timeRemaining: 0,
    bonusAmount: 500,
  });
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  // Fetch status
  const fetchStatus = useCallback(async () => {
    if (!userEmail) {
      setLoading(false);
      return;
    }

    try {
      const newStatus = await dailyBonusManager.getStatus(userEmail);
      setStatus(newStatus);
    } catch (error) {
      console.error('Error fetching daily bonus status:', error);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  // Initial fetch
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Subscribe to countdown updates
  useEffect(() => {
    if (!userEmail) return;

    const unsubscribe = dailyBonusManager.subscribe(() => {
      // Re-fetch status on update
      fetchStatus();
    });

    return unsubscribe;
  }, [userEmail, fetchStatus]);

  // Claim bonus
  const claimBonus = useCallback(async () => {
    if (!userEmail || claiming || !status.canClaim) return null;

    setClaiming(true);
    try {
      const result = await dailyBonusManager.claim(userEmail);
      
      if (result.success) {
        // Refresh status after successful claim
        await fetchStatus();
      }
      
      return result;
    } catch (error) {
      console.error('Error claiming daily bonus:', error);
      return null;
    } finally {
      setClaiming(false);
    }
  }, [userEmail, claiming, status.canClaim, fetchStatus]);

  // Format countdown
  const formatCountdown = useCallback(() => {
    return dailyBonusManager.formatTimeRemaining(status.timeRemaining);
  }, [status.timeRemaining]);

  return {
    status,
    loading,
    claiming,
    claimBonus,
    formatCountdown,
    refreshStatus: fetchStatus,
  };
}
