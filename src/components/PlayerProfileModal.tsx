import { X, Crown, Star, Trophy, Shield, TrendingUp, Award, Flame } from 'lucide-react';

interface PlayerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerName: string;
  playerAvatar: string;
  playerLevel: number;
  playerBalance: number;
  membershipTier: 'free' | 'silver' | 'gold' | 'platinum';
  achievementTitle?: string;
  totalWins?: number;
  totalGamesPlayed?: number;
  winRate?: number;
  biggestWin?: number;
  achievements?: Array<{ id: string; title: string; icon: string }>;
}

const MEMBERSHIP_INFO = {
  free: {
    name: 'Free Player',
    icon: null,
    color: 'text-gray-400',
    bgGradient: 'from-gray-700 to-gray-800'
  },
  silver: {
    name: 'Silver Member',
    icon: Shield,
    color: 'text-gray-300',
    bgGradient: 'from-gray-400 to-gray-600'
  },
  gold: {
    name: 'Gold Member',
    icon: Crown,
    color: 'text-yellow-400',
    bgGradient: 'from-yellow-400 to-yellow-600'
  },
  platinum: {
    name: 'Platinum Member',
    icon: Star,
    color: 'text-purple-400',
    bgGradient: 'from-purple-400 to-pink-600'
  }
};

export function PlayerProfileModal({
  isOpen,
  onClose,
  playerName,
  playerAvatar,
  playerLevel,
  playerBalance,
  membershipTier,
  achievementTitle,
  totalWins = 0,
  totalGamesPlayed = 0,
  winRate = 0,
  biggestWin = 0,
  achievements = []
}: PlayerProfileModalProps) {
  if (!isOpen) return null;

  const membershipInfo = MEMBERSHIP_INFO[membershipTier];
  const MembershipIcon = membershipInfo.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white bg-gray-800/50 hover:bg-gray-700 rounded-full p-2 transition-all z-10"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header with avatar */}
        <div className="relative">
          {/* Background gradient */}
          <div className={`h-32 bg-gradient-to-r ${membershipInfo.bgGradient} rounded-t-2xl`} />
          
          {/* Avatar */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
            <div className="relative">
              <div
                className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl border-4 border-gray-900 shadow-2xl bg-gradient-to-br ${membershipInfo.bgGradient}`}
              >
                {playerAvatar || '👤'}
              </div>
              
              {/* Level badge */}
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg border-2 border-gray-900">
                Level {playerLevel}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="pt-20 px-6 pb-6">
          {/* Name and membership */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">{playerName}</h2>
            
            {/* Membership badge */}
            <div className="flex items-center justify-center gap-2 mb-3">
              {MembershipIcon && <MembershipIcon className={`w-5 h-5 ${membershipInfo.color}`} />}
              <span className={`${membershipInfo.color} font-semibold text-lg`}>
                {membershipInfo.name}
              </span>
            </div>

            {/* Achievement title */}
            {achievementTitle && (
              <div className="flex items-center justify-center gap-2 bg-yellow-500/20 border border-yellow-500 rounded-lg px-4 py-2 inline-flex mx-auto">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <span className="text-yellow-400 font-semibold italic">
                  "{achievementTitle}"
                </span>
              </div>
            )}
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Balance */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500 rounded-xl p-4 text-center">
              <div className="text-green-400 text-sm mb-1">Balance</div>
              <div className="text-white text-2xl font-bold">${playerBalance.toFixed(2)}</div>
            </div>

            {/* Total Wins */}
            <div className="bg-gradient-to-br from-blue-500/20 to-purple-600/20 border border-blue-500 rounded-xl p-4 text-center">
              <div className="text-blue-400 text-sm mb-1">Total Wins</div>
              <div className="text-white text-2xl font-bold">{totalWins}</div>
            </div>

            {/* Games Played */}
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 border border-purple-500 rounded-xl p-4 text-center">
              <div className="text-purple-400 text-sm mb-1">Games Played</div>
              <div className="text-white text-2xl font-bold">{totalGamesPlayed}</div>
            </div>

            {/* Win Rate */}
            <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 border border-orange-500 rounded-xl p-4 text-center">
              <div className="text-orange-400 text-sm mb-1">Win Rate</div>
              <div className="text-white text-2xl font-bold">{winRate.toFixed(1)}%</div>
            </div>
          </div>

          {/* Biggest Win */}
          {biggestWin > 0 && (
            <div className="bg-gradient-to-r from-yellow-500/20 to-orange-600/20 border border-yellow-500 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-center gap-3">
                <Flame className="w-6 h-6 text-orange-400" />
                <div className="text-center">
                  <div className="text-yellow-400 text-sm">Biggest Win</div>
                  <div className="text-white text-3xl font-bold">${biggestWin.toFixed(2)}</div>
                </div>
                <Flame className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          )}

          {/* Recent Achievements */}
          {achievements.length > 0 && (
            <div>
              <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                Recent Achievements
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {achievements.slice(0, 3).map((achievement) => (
                  <div
                    key={achievement.id}
                    className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex items-center gap-3"
                  >
                    <div className="text-2xl">{achievement.icon}</div>
                    <div className="text-white text-sm font-semibold">
                      {achievement.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}