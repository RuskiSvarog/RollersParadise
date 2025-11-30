import { createPortal } from 'react-dom';
import { X, Award, Star, Gift, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import { useLoyaltyPoints, LOYALTY_TIERS } from '../contexts/LoyaltyPointsContext';

interface LoyaltyPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardRedeemed?: (rewardType: string, value: number, multiplier?: number) => void;
}

export function LoyaltyPanel({ isOpen, onClose, onRewardRedeemed }: LoyaltyPanelProps) {
  const { points, lifetimePoints, currentTier, nextTier, redeemReward, getPointsToNextTier, allRewards } = useLoyaltyPoints();

  const handleRedeem = (rewardId: string) => {
    const reward = allRewards.find(r => r.id === rewardId);
    if (!reward) return;

    if (points < reward.cost) {
      alert('Not enough loyalty points!');
      return;
    }

    if (redeemReward(rewardId)) {
      if (onRewardRedeemed) {
        onRewardRedeemed(reward.type, reward.value, reward.multiplier);
      }
      
      if (reward.type === 'xpBoost') {
        const hours = Math.floor(reward.value / 60);
        alert(`✅ Activated: ${reward.name}\n${reward.multiplier}x XP for ${hours} hours!`);
      } else {
        alert(`✅ Redeemed: ${reward.name}`);
      }
    }
  };

  if (!isOpen) return null;

  const progressToNext = nextTier
    ? ((lifetimePoints - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
    : 100;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.95) 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border-4"
        style={{
          background: 'linear-gradient(135deg, #14532d 0%, #15803d 20%, #16a34a 40%, #15803d 60%, #14532d 100%)',
          borderColor: '#fbbf24',
          boxShadow: '0 0 60px rgba(251, 191, 36, 0.6), 0 20px 80px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* HEADER */}
        <div
          className="sticky top-0 p-6 flex justify-between items-center border-b-4 z-10"
          style={{
            background: 'linear-gradient(135deg, #b45309 0%, #d97706 25%, #f59e0b 50%, #d97706 75%, #b45309 100%)',
            borderColor: '#fbbf24',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="flex items-center gap-4">
            <Award className="w-12 h-12" style={{ color: '#fbbf24' }} />
            <div>
              <h2
                className="text-4xl font-bold uppercase tracking-wider"
                style={{
                  color: '#fef3c7',
                  textShadow: '0 0 20px rgba(251, 191, 36, 0.8), 0 4px 8px rgba(0, 0, 0, 0.8)',
                }}
              >
                💎 Loyalty Program
              </h2>
              <p
                className="text-lg font-bold mt-1"
                style={{
                  color: '#86efac',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                }}
              >
                {points.toLocaleString()} Points | {currentTier.icon} {currentTier.name} Tier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="transition-all hover:scale-110 hover:rotate-90"
            style={{ color: '#fef3c7' }}
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          {/* Current Tier Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-br ${currentTier.color} rounded-xl p-6 border-2 border-yellow-500`}
            style={{ boxShadow: '0 0 30px rgba(251, 191, 36, 0.3)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-6xl">{currentTier.icon}</div>
                <div>
                  <h3 className="text-3xl font-bold text-white">{currentTier.name} Tier</h3>
                  <p className="text-white/80">Lifetime Points: {lifetimePoints.toLocaleString()}</p>
                </div>
              </div>
              <Star className="w-12 h-12 text-yellow-400" />
            </div>

            <div className="space-y-2 mb-4">
              <h4 className="text-white font-bold text-lg">Your Benefits:</h4>
              {currentTier.benefits.map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-white">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>

            {nextTier && (
              <div>
                <div className="flex justify-between text-white mb-2">
                  <span>Progress to {nextTier.icon} {nextTier.name}</span>
                  <span className="font-bold">{getPointsToNextTier().toLocaleString()} points needed</span>
                </div>
                <div className="bg-white/20 rounded-full h-4 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-yellow-400 to-green-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressToNext}%` }}
                    transition={{ duration: 0.8 }}
                  />
                </div>
              </div>
            )}
          </motion.div>

          {/* Tier Overview */}
          <div>
            <h3 className="text-white text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              All Tiers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {LOYALTY_TIERS.map((tier, index) => (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-gradient-to-br ${tier.color} rounded-lg p-4 border-2 ${
                    tier.name === currentTier.name ? 'border-yellow-400' : 'border-gray-700'
                  }`}
                >
                  <div className="text-4xl mb-2">{tier.icon}</div>
                  <h4 className="text-xl font-bold text-white mb-1">{tier.name}</h4>
                  <p className="text-sm text-white/80 mb-2">
                    {tier.minPoints.toLocaleString()}+ points
                  </p>
                  {tier.name === currentTier.name && (
                    <div className="bg-yellow-400 text-gray-900 px-2 py-1 rounded text-xs font-bold inline-block">
                      CURRENT TIER
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Rewards Catalog */}
          <div>
            <h3 className="text-white text-2xl font-bold mb-4 flex items-center gap-2">
              <Gift className="w-6 h-6" />
              Redeem Rewards
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allRewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-5 border-2 border-gray-700"
                >
                  <div className="text-4xl mb-3 text-center">{reward.icon}</div>
                  <h4 className="text-white font-bold text-lg mb-2 text-center">{reward.name}</h4>
                  <p className="text-gray-400 text-sm mb-3 text-center">{reward.description}</p>
                  
                  <div className="text-center mb-3">
                    <div className="text-2xl font-bold text-yellow-400">
                      {reward.cost.toLocaleString()} pts
                    </div>
                  </div>

                  <button
                    onClick={() => handleRedeem(reward.id)}
                    disabled={points < reward.cost}
                    className={`w-full py-2 rounded-lg font-bold transition-all ${
                      points >= reward.cost
                        ? 'bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-500 hover:to-green-600'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {points >= reward.cost ? 'Redeem' : 'Not Enough Points'}
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-blue-200 text-sm">
            <p className="mb-2">💡 <strong>How to Earn Points:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Earn 1 point per $10 wagered (more at higher tiers)</li>
              <li>Complete daily challenges for bonus points</li>
              <li>Participate in tournaments and special events</li>
              <li>Refer friends to earn points</li>
              <li>Points never expire - save up for big rewards!</li>
            </ul>
            <p className="mt-3 text-purple-300 font-bold">⚡ XP Boosts are temporary - use them wisely!</p>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
