import { useRef, useCallback } from 'react';

interface UseHoldToBetOptions {
  onBet: () => void;
  interval?: number; // milliseconds between each bet when holding
  initialDelay?: number; // milliseconds before hold starts repeating
}

export function useHoldToBet({ onBet, interval = 150, initialDelay = 300 }: UseHoldToBetOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startHold = useCallback(() => {
    // Clear any existing timers
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // First bet happens immediately
    onBet();

    // After initial delay, start repeating
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        onBet();
      }, interval);
    }, initialDelay);
  }, [onBet, interval, initialDelay]);

  const stopHold = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  return { startHold, stopHold };
}
