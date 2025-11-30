import { useState, useEffect } from 'react';
import { Zap, Clock } from './Icons';
import { useXPBoost } from '../contexts/XPBoostContext';

export function ActiveBoostsDisplay() {
  const { activeBoosts, getTimeRemaining, getCurrentMultiplier } = useXPBoost();
  const [, forceUpdate] = useState(0);

  // Force re-render every SECOND for accurate countdown (not minute)
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(prev => prev + 1);
    }, 1000); // Update every SECOND for real-time accuracy

    return () => clearInterval(interval);
  }, []);

  const formatTime = (boost: any): string => {
    const now = Date.now();
    const remaining = Math.max(0, boost.expiresAt - now);
    
    if (remaining === 0) return 'EXPIRED';
    
    const hours = Math.floor(remaining / (60 * 60 * 1000));
    const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((remaining % (60 * 1000)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  if (activeBoosts.length === 0) return null;

  const totalMultiplier = getCurrentMultiplier();

  return (
    <div className="fixed top-20 right-4 z-[9000]">
      <div
        className="rounded-xl shadow-2xl border-2 p-4 min-w-[250px] animate-in fade-in slide-in-from-right-8 zoom-in-95 duration-300"
        style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #c084fc 100%)',
          borderColor: '#fbbf24',
          boxShadow: '0 0 30px rgba(168, 85, 247, 0.6), 0 10px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
          {/* Header */}
          <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-white/30">
            <Zap className="w-6 h-6 text-yellow-300" />
            <div>
              <div className="text-white font-bold text-lg">Active XP Boosts</div>
              <div className="text-yellow-300 text-sm font-bold">
                {totalMultiplier}x XP Multiplier
              </div>
            </div>
          </div>

          {/* Boost List */}
          <div className="space-y-2">
            {activeBoosts.map(boost => {
              const now = Date.now();
              const remaining = Math.max(0, boost.expiresAt - now);
              const isExpiringSoon = remaining <= 60000; // Less than 1 minute

              return (
                <div
                  key={boost.id}
                  className={`bg-white/20 rounded-lg p-2 ${isExpiringSoon ? 'animate-pulse' : ''} animate-in fade-in slide-in-from-top-2 duration-300`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-bold text-sm">{boost.name}</span>
                    <span className="text-yellow-300 font-bold text-sm">
                      {boost.multiplier}x
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Clock className="w-3 h-3 text-white/70" />
                    <span className={`${isExpiringSoon ? 'text-red-300 font-bold' : 'text-white/70'}`}>
                      {formatTime(boost)} remaining
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tip */}
          <div className="mt-3 pt-2 border-t-2 border-white/30">
            <p className="text-xs text-yellow-200 text-center">
              🎯 Earn XP faster while boosts are active!
            </p>
          </div>
        </div>
    </div>
  );
}

export default ActiveBoostsDisplay;
