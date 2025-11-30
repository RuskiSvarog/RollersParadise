import { memo } from 'react';

/**
 * ⏱️ OPTIMIZED MULTIPLAYER TIMER DISPLAY COMPONENT
 * 
 * Separated into its own component for performance optimization:
 * - Uses React.memo to prevent unnecessary re-renders
 * - Only re-renders when timer value or state changes
 * - Reduces main component re-render burden
 */

interface MultiplayerTimerDisplayProps {
  bettingTimer: number;
  bettingTimerActive: boolean;
  bettingLocked: boolean;
  isRolling: boolean;
  timerDuration: number;
}

export const MultiplayerTimerDisplay = memo(function MultiplayerTimerDisplay({
  bettingTimer,
  bettingTimerActive,
  bettingLocked,
  isRolling,
  timerDuration,
}: MultiplayerTimerDisplayProps) {
  // Don't render if timer is not active or dice are rolling
  if (!bettingTimerActive || isRolling) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto mb-4 px-4">
      <div className={`text-center p-8 rounded-3xl shadow-2xl transform transition-all duration-300 ${
        bettingTimer <= 10 
          ? 'bg-gradient-to-br from-red-600 via-red-700 to-red-900 border-4 border-red-300 animate-pulse scale-105 shadow-red-500/50' 
          : bettingTimer <= 20
          ? 'bg-gradient-to-br from-yellow-500 via-orange-600 to-orange-700 border-4 border-yellow-300 shadow-orange-500/40'
          : 'bg-gradient-to-br from-green-600 via-emerald-700 to-green-800 border-4 border-green-300 shadow-green-500/40'
      }`}>
        {/* Timer Icon and Countdown */}
        <div className="flex items-center justify-center gap-6 mb-2">
          <div className={`text-7xl transition-transform ${
            bettingTimer <= 10 
              ? 'animate-bounce' 
              : bettingTimer <= 5
              ? 'animate-pulse'
              : ''
          }`}>
            {bettingTimer <= 5 ? '⏰' : '⏱️'}
          </div>
          <div>
            <div className={`text-8xl font-black tabular-nums tracking-tight ${
              bettingTimer <= 10 
                ? 'text-white drop-shadow-[0_0_20px_rgba(255,255,255,1)] animate-pulse' 
                : 'text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]'
            }`}>
              {bettingTimer}
            </div>
            <div className={`mt-2 uppercase tracking-widest font-bold ${
              bettingTimer <= 10
                ? 'text-2xl text-white animate-pulse'
                : 'text-xl text-white/90'
            }`}>
              {bettingLocked ? '🔒 Betting Closed!' : '💰 Place Your Bets!'}
            </div>
          </div>
        </div>
        
        {/* Enhanced Progress Bar with Glow */}
        <div className="mt-6 w-full bg-black/30 rounded-full h-4 overflow-hidden border-2 border-white/30 shadow-inner">
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${
              bettingTimer <= 10 
                ? 'bg-gradient-to-r from-white via-red-200 to-white shadow-[0_0_15px_rgba(255,255,255,0.8)]' 
                : bettingTimer <= 20
                ? 'bg-gradient-to-r from-orange-300 via-yellow-400 to-orange-300 shadow-[0_0_10px_rgba(255,165,0,0.6)]'
                : 'bg-gradient-to-r from-emerald-400 via-green-300 to-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.6)]'
            }`}
            style={{ 
              width: `${(bettingTimer / timerDuration) * 100}%` 
            }}
          />
        </div>
        
        {/* Warning Messages */}
        {bettingTimer <= 10 && !bettingLocked && (
          <div className="mt-4 text-xl text-white font-black animate-pulse uppercase tracking-wider">
            ⚠️ HURRY! BETTING CLOSES SOON! ⚠️
          </div>
        )}
        {bettingTimer <= 5 && !bettingLocked && (
          <div className="mt-3 text-lg text-white/95 font-bold animate-bounce">
            🎲 AUTO-ROLL IN {bettingTimer} SECONDS! 🎲
          </div>
        )}
        {bettingTimer > 10 && (
          <div className="mt-4 text-base text-white/80 font-medium">
            ⏰ Timer will auto-roll dice when it reaches zero
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  // Only re-render if these specific props change
  return (
    prevProps.bettingTimer === nextProps.bettingTimer &&
    prevProps.bettingTimerActive === nextProps.bettingTimerActive &&
    prevProps.bettingLocked === nextProps.bettingLocked &&
    prevProps.isRolling === nextProps.isRolling
  );
});
