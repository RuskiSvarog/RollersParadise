import { useState } from 'react';
import { Gift } from './Icons';
import { useDailyRewards } from '../contexts/DailyRewardsContext';

interface DailyRewardsButtonProps {
  onClick: () => void;
}

export function DailyRewardsButton({ onClick }: DailyRewardsButtonProps) {
  const { canClaimToday, currentStreak } = useDailyRewards();

  return (
    <button
      onClick={onClick}
      className="relative px-4 py-3 rounded-lg border-2 shadow-xl transition-all hover:scale-105"
      style={{
        background: canClaimToday 
          ? 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)'
          : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
        borderColor: canClaimToday ? '#fbbf24' : '#9ca3af',
        boxShadow: canClaimToday 
          ? '0 0 25px rgba(251, 191, 36, 0.6), 0 6px 20px rgba(0, 0, 0, 0.5)'
          : '0 4px 12px rgba(0, 0, 0, 0.5)',
      }}
      title={canClaimToday ? 'Claim your daily reward!' : 'Daily rewards (already claimed today)'}
    >
      {/* Notification badge */}
      {canClaimToday && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
          !
        </div>
      )}
      
      {/* Animated pulse effect for available rewards */}
      {canClaimToday && (
        <div 
          className="absolute inset-0 rounded-lg opacity-50 animate-pulse"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, rgba(251, 191, 36, 0.3) 50%, transparent 100%)',
          }}
        />
      )}
      
      <div className="relative flex items-center gap-2">
        <Gift className="w-5 h-5" style={{ color: canClaimToday ? '#fef3c7' : '#d1d5db' }} />
        <div className="text-left">
          <div 
            className="text-sm font-bold uppercase tracking-wide"
            style={{ 
              color: canClaimToday ? '#fef3c7' : '#d1d5db',
              textShadow: canClaimToday ? '0 0 10px rgba(254, 243, 199, 0.8), 0 2px 4px rgba(0, 0, 0, 0.8)' : 'none',
            }}
          >
            Daily
          </div>
          <div className="text-xs" style={{ color: canClaimToday ? '#fde68a' : '#9ca3af' }}>
            {canClaimToday ? 'CLAIM NOW!' : `${currentStreak} day streak`}
          </div>
        </div>
      </div>
    </button>
  );
}
