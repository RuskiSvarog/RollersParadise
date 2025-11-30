import { useState, useEffect } from 'react';
import { Zap } from './Icons';

interface BoostTimerProps {
  expiresAt: number;
  multiplier: number;
  name: string;
}

export function BoostTimer({ expiresAt, multiplier, name }: BoostTimerProps) {
  const [timeLeft, setTimeLeft] = useState('');
  const [percentage, setPercentage] = useState(100);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);
      
      if (remaining === 0) {
        setTimeLeft('EXPIRED');
        setPercentage(0);
        return;
      }

      // Calculate hours, minutes, seconds
      const hours = Math.floor(remaining / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
      const seconds = Math.floor((remaining % (60 * 1000)) / 1000);

      // Format time display
      if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else if (minutes > 0) {
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${seconds}s`);
      }

      // Calculate percentage for progress bar (assuming 24h max duration)
      const maxDuration = 24 * 60 * 60 * 1000;
      const elapsed = maxDuration - remaining;
      const pct = Math.max(0, Math.min(100, 100 - (elapsed / maxDuration) * 100));
      setPercentage(pct);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  return (
    <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-lg p-3 border border-purple-500/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-white">{multiplier}x XP</span>
        </div>
        <span className="text-purple-300 text-sm">{timeLeft}</span>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-700/50 rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="text-xs text-gray-400 mt-1">{name}</div>
    </div>
  );
}
