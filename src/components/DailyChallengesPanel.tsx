import { createPortal } from 'react-dom';
import { X, Trophy, CheckCircle, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useDailyChallenges } from '../contexts/DailyChallengesContext';

interface DailyChallengesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed?: (chips: number, xpBoost?: { multiplier: number; durationHours: number }) => void;
}

export function DailyChallengesPanel({ isOpen, onClose, onRewardClaimed }: DailyChallengesPanelProps) {
  const { challenges, claimReward } = useDailyChallenges();

  const handleClaimReward = (challengeId: string) => {
    const reward = claimReward(challengeId);
    if (reward && onRewardClaimed) {
      onRewardClaimed(reward.chips, reward.xpBoost);
    }
  };

  if (!isOpen) return null;

  const completedCount = challenges.filter(c => c.completed).length;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.95) 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-4"
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
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.2)',
          }}
        >
          <div className="flex items-center gap-4">
            <Trophy className="w-12 h-12" style={{ color: '#fbbf24' }} />
            <div>
              <h2
                className="text-4xl font-bold uppercase tracking-wider"
                style={{
                  color: '#fef3c7',
                  textShadow: '0 0 20px rgba(251, 191, 36, 0.8), 0 4px 8px rgba(0, 0, 0, 0.8)',
                }}
              >
                🎯 Daily Challenges
              </h2>
              <p
                className="text-lg font-bold mt-1"
                style={{
                  color: '#86efac',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                }}
              >
                Completed: {completedCount}/{challenges.length} | Play & Earn Rewards!
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
        <div className="p-6 space-y-4">
          <AnimatePresence>
            {challenges.map((challenge, index) => (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-xl p-6 border-2 ${
                  challenge.completed
                    ? 'bg-gradient-to-br from-green-900/50 to-green-800/50 border-green-500'
                    : 'bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700'
                }`}
                style={{
                  boxShadow: challenge.completed
                    ? '0 0 20px rgba(34, 197, 94, 0.3)'
                    : '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className="text-4xl w-16 h-16 flex items-center justify-center rounded-full"
                      style={{
                        background: challenge.completed
                          ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                          : 'linear-gradient(135deg, #4b5563, #374151)',
                      }}
                    >
                      {challenge.icon}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white text-xl font-bold">{challenge.title}</h3>
                        {challenge.completed && (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        )}
                        {!challenge.completed && challenge.progress === 0 && (
                          <Lock className="w-5 h-5 text-gray-500" />
                        )}
                      </div>

                      <p className="text-gray-300 mb-3">{challenge.description}</p>

                      {/* Progress Bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">Progress</span>
                          <span className="text-white font-bold">
                            {challenge.progress} / {challenge.target}
                          </span>
                        </div>
                        <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              background: challenge.completed
                                ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                                : 'linear-gradient(90deg, #3b82f6, #2563eb)',
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${(challenge.progress / challenge.target) * 100}%` }}
                            transition={{ duration: 0.5 }}
                          />
                        </div>
                      </div>

                      {/* Rewards */}
                      <div className="flex items-center gap-4 text-sm flex-wrap">
                        <div className="flex items-center gap-1">
                          <span className="text-green-400 font-bold">
                            +${challenge.reward.chips.toLocaleString()}
                          </span>
                          <span className="text-gray-400">chips</span>
                        </div>
                        {challenge.reward.xpBoost && (
                          <div className="flex items-center gap-1">
                            <span className="text-purple-400 font-bold">
                              ⚡ {challenge.reward.xpBoost.multiplier}x XP
                            </span>
                            <span className="text-gray-400">
                              for {challenge.reward.xpBoost.durationHours}h
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Claim Button */}
                  {challenge.completed && !challenge.claimed && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleClaimReward(challenge.id)}
                      className="px-6 py-3 rounded-lg font-bold text-white transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                        boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)',
                      }}
                    >
                      Claim Reward
                    </motion.button>
                  )}

                  {challenge.claimed && (
                    <div className="px-6 py-3 rounded-lg font-bold text-green-400 bg-green-900/30 border-2 border-green-500">
                      ✅ Claimed
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Info Box */}
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-blue-200 text-sm">
            <p className="mb-2">💡 <strong>About Daily Challenges:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Complete challenges to earn bonus chips and XP boosts</li>
              <li>XP boosts are temporary and last 2-24 hours depending on the challenge</li>
              <li>Use your XP boost wisely - keep playing to maximize your gains!</li>
              <li>New challenges are generated every 24 hours</li>
              <li>Challenge progress is tracked automatically as you play</li>
              <li>Claim your rewards before the challenges reset!</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
