import { useRef, useCallback } from 'react';

interface UseBetHandlersOptions {
  onPlace: () => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function useBetHandlers({ onPlace, onRemove, disabled = false }: UseBetHandlersOptions) {
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const holdIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isHoldingRef = useRef(false);

  const clearHoldTimers = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
    if (holdIntervalRef.current) {
      clearInterval(holdIntervalRef.current);
      holdIntervalRef.current = null;
    }
    isHoldingRef.current = false;
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    if (e.button !== 0) return; // Only left mouse button
    
    e.preventDefault();
    clearHoldTimers();
    
    // First bet happens immediately
    onPlace();
    isHoldingRef.current = true;
    
    // After 300ms, start repeating every 150ms
    holdTimeoutRef.current = setTimeout(() => {
      holdIntervalRef.current = setInterval(() => {
        if (isHoldingRef.current) {
          onPlace();
        }
      }, 150);
    }, 300);
  }, [onPlace, disabled, clearHoldTimers]);

  const handleMouseUp = useCallback(() => {
    clearHoldTimers();
  }, [clearHoldTimers]);

  const handleMouseLeave = useCallback(() => {
    clearHoldTimers();
  }, [clearHoldTimers]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    
    clearHoldTimers();
    
    // Right-click removes by chip amount
    onRemove();
  }, [onRemove, disabled, clearHoldTimers]);

  // Return handlers that can be spread onto any element
  return {
    onMouseDown: handleMouseDown,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave,
    onContextMenu: handleContextMenu,
    // Also provide cleanup function
    cleanup: clearHoldTimers
  };
}
