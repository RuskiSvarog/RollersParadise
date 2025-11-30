import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface WinAmountPopupProps {
  amount: number;
  x: number;
  y: number;
  onComplete?: () => void;
  isLoss?: boolean;
  playerName?: string;
  playerAvatar?: string;
}

export function WinAmountPopup({ amount, x, y, onComplete, isLoss = false, playerName, playerAvatar }: WinAmountPopupProps) {
  const [isVisible, setIsVisible] = useState(true);
  
  // Determine colors based on win/loss
  const colors = isLoss ? {
    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.6), 0 0 20px rgba(239, 68, 68, 0.8)',
    boxShadow: '0 4px 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.4)',
    borderColor: 'rgba(239, 68, 68, 0.8)',
  } : {
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    textShadow: '0 2px 8px rgba(0, 0, 0, 0.6), 0 0 20px rgba(16, 185, 129, 0.8)',
    boxShadow: '0 4px 20px rgba(16, 185, 129, 0.6), 0 0 40px rgba(16, 185, 129, 0.4)',
    borderColor: 'rgba(16, 185, 129, 0.8)',
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onComplete) {
        setTimeout(onComplete, 300); // Wait for animation to complete
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ 
            opacity: 0, 
            y: 0, 
            scale: 0.5,
            x: x,
          }}
          animate={{ 
            opacity: [0, 1, 1, 0], 
            y: -60, 
            scale: [0.5, 1.2, 1, 1],
            x: x,
          }}
          exit={{ 
            opacity: 0,
            scale: 0.8,
          }}
          transition={{ 
            duration: 2,
            ease: "easeOut",
          }}
          className="fixed pointer-events-none"
          style={{
            top: y,
            left: 0,
            zIndex: 9999,
          }}
        >
          <div
            className="px-4 py-2 rounded-lg shadow-2xl"
            style={{
              background: colors.background,
              color: '#ffffff',
              boxShadow: colors.boxShadow,
              border: `3px solid ${colors.borderColor}`,
            }}
          >
            {/* Player info (if provided) */}
            {(playerName || playerAvatar) && (
              <div className="flex items-center gap-2 mb-1">
                {playerAvatar && (
                  <span className="text-2xl" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>
                    {playerAvatar}
                  </span>
                )}
                {playerName && (
                  <span 
                    className="text-xs font-semibold opacity-90"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
                  >
                    {playerName}
                  </span>
                )}
              </div>
            )}
            
            {/* Win/Loss amount */}
            <div
              className="font-black"
              style={{
                fontSize: playerName || playerAvatar ? '1.25rem' : '1.5rem',
                textShadow: colors.textShadow,
              }}
            >
              {isLoss ? '-' : '+'}${Math.abs(amount).toFixed(2)}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
