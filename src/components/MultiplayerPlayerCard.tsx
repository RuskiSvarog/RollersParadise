import { useState } from 'react';
import { Crown, Star, Trophy, Shield, Eye } from 'lucide-react';

interface PlayerCardProps {
  name: string;
  avatar: string;
  balance: number;
  betsCount: number;
  online: boolean;
  level?: number;
  membershipTier?: 'free' | 'silver' | 'gold' | 'platinum';
  achievementTitle?: string;
  isCurrentPlayer?: boolean;
  isHost?: boolean;
  onViewProfile?: () => void;
}

const MEMBERSHIP_STYLES = {
  free: {
    gradient: 'from-gray-400 to-gray-500',
    icon: null,
    label: '',
    badgeColor: 'bg-gray-500'
  },
  silver: {
    gradient: 'from-gray-300 via-gray-400 to-gray-500',
    icon: Shield,
    label: 'SILVER',
    badgeColor: 'bg-gradient-to-r from-gray-300 to-gray-400'
  },
  gold: {
    gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
    icon: Crown,
    label: 'GOLD',
    badgeColor: 'bg-gradient-to-r from-yellow-400 to-yellow-500'
  },
  platinum: {
    gradient: 'from-purple-400 via-pink-500 to-purple-600',
    icon: Star,
    label: 'PLATINUM',
    badgeColor: 'bg-gradient-to-r from-purple-400 to-pink-500'
  }
};

export function MultiplayerPlayerCard({
  name,
  avatar,
  balance,
  betsCount,
  online,
  level = 1,
  membershipTier = 'free',
  achievementTitle,
  isCurrentPlayer = false,
  isHost = false,
  onViewProfile
}: PlayerCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const membershipStyle = MEMBERSHIP_STYLES[membershipTier];
  const MembershipIcon = membershipStyle.icon;

  return (
    <div
      className={`relative rounded-xl p-4 transition-all duration-300 transform ${
        isCurrentPlayer
          ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-2 border-green-500 shadow-lg shadow-green-500/30'
          : 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-2 border-gray-600 hover:border-purple-500'
      } ${isHovered ? 'scale-105 shadow-2xl' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Membership badge - top right */}
      {membershipTier !== 'free' && MembershipIcon && (
        <div className={`absolute -top-2 -right-2 ${membershipStyle.badgeColor} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse`}>
          <MembershipIcon className="w-3 h-3" />
          {membershipStyle.label}
        </div>
      )}

      {/* Host badge - top left */}
      {isHost && (
        <div className="absolute -top-2 -left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
          <Crown className="w-3 h-3" />
          HOST
        </div>
      )}

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl border-3 shadow-lg ${
              isCurrentPlayer
                ? 'border-green-500 bg-gradient-to-br from-green-400 to-green-600'
                : `border-gray-700 bg-gradient-to-br ${membershipStyle.gradient}`
            }`}
            style={{ fontSize: '2rem' }}
          >
            {avatar || '👤'}
          </div>
          
          {/* Online status indicator */}
          <div
            className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-gray-900 ${
              online ? 'bg-green-500' : 'bg-gray-500'
            }`}
          />

          {/* Level badge */}
          <div className="absolute -top-1 -left-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-lg border-2 border-gray-900">
            {level}
          </div>
        </div>

        {/* Player info */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-white font-bold truncate" style={{ fontSize: '1rem' }}>
              {name}
              {isCurrentPlayer && <span className="text-green-400 ml-1">(You)</span>}
            </h3>
          </div>

          {/* Achievement title */}
          {achievementTitle && (
            <div className="flex items-center gap-1 mb-2">
              <Trophy className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400 text-xs font-semibold italic truncate">
                "{achievementTitle}"
              </span>
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-4 text-xs">
            <div>
              <span className="text-gray-400">Balance:</span>
              <span className="text-green-400 font-bold ml-1">${balance.toFixed(2)}</span>
            </div>
            <div>
              <span className="text-gray-400">Bets:</span>
              <span className="text-blue-400 font-bold ml-1">{betsCount}</span>
            </div>
          </div>
        </div>

        {/* View Profile Button */}
        {onViewProfile && (
          <button
            onClick={onViewProfile}
            className={`flex-shrink-0 px-3 py-2 rounded-lg font-semibold text-xs transition-all ${
              isHovered
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Hover glow effect */}
      {isHovered && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl pointer-events-none" />
      )}
    </div>
  );
}