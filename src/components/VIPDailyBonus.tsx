import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Crown, X, Sparkles, Star } from 'lucide-react';
import { useVIP } from '../contexts/VIPContext';

interface VIPDailyBonusProps {
  onClaim: (amount: number) => void;
}

export function VIPDailyBonus({ onClaim }: VIPDailyBonusProps) {
  const { vipStatus, claimDailyBonus, canClaimDailyBonus } = useVIP();
  const [showModal, setShowModal] = useState(false);
  const [claimed, setClaimed] = useState(false);

  if (!vipStatus.isVIP) return null;

  const canClaim = canClaimDailyBonus();

  const handleClaim = () => {
    const result = claimDailyBonus();
    if (result.claimed) {
      setClaimed(true);
      onClaim(result.amount);
      
      // Show celebration then close
      setTimeout(() => {
        setShowModal(false);
        setClaimed(false);
      }, 3000);
    }
  };

  const getTimeUntilNextBonus = (): string => {
    if (canClaim) return 'Available Now!';
    if (!vipStatus.lastDailyBonus) return 'Available Now!';
    
    const nextBonus = vipStatus.lastDailyBonus + (24 * 60 * 60 * 1000);
    const timeLeft = nextBonus - Date.now();
    const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
    const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));
    
    return `${hoursLeft}h ${minutesLeft}m`;
  };

  return (
    <>
      {/* Floating VIP Daily Bonus Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowModal(true)}
        className={`fixed top-24 right-4 z-20 ${
          canClaim
            ? 'bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500'
            : 'bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600'
        } text-black px-4 py-3 rounded-xl font-bold shadow-2xl border-3 border-yellow-300`}
        style={{
          boxShadow: canClaim
            ? '0 8px 25px rgba(234, 179, 8, 0.6), 0 0 30px rgba(234, 179, 8, 0.3)'
            : '0 4px 12px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5" />
          <div className="text-left">
            <div className="text-xs font-bold">VIP Daily Bonus</div>
            <div className="text-xs opacity-90">
              {canClaim ? '✨ Claim $500!' : getTimeUntilNextBonus()}
            </div>
          </div>
        </div>
        
        {canClaim && (
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="absolute -top-2 -right-2"
          >
            <div className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shadow-lg">
              !
            </div>
          </motion.div>
        )}
      </motion.button>

      {/* Claim Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              transition={{ type: 'spring', duration: 0.6 }}
              className="bg-gradient-to-br from-yellow-600 via-yellow-500 to-orange-500 rounded-3xl shadow-2xl max-w-md w-full p-8 border-4 border-yellow-300 relative overflow-hidden"
              style={{
                boxShadow: '0 20px 60px rgba(234, 179, 8, 0.5), inset 0 0 60px rgba(255, 255, 255, 0.2)'
              }}
            >
              {/* Background Sparkles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{
                      opacity: [0, 1, 0],
                      y: [-50, -200],
                      x: [0, Math.random() * 200 - 100]
                    }}
                    transition={{
                      duration: 2,
                      delay: claimed ? i * 0.1 : 999,
                      repeat: claimed ? Infinity : 0
                    }}
                    className="absolute"
                    style={{ left: `${Math.random() * 100}%`, bottom: 0 }}
                  >
                    <Star className="w-4 h-4 text-white" fill="white" />
                  </motion.div>
                ))}
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-white hover:text-yellow-200 transition-colors z-10"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="text-center relative z-10">
                {!claimed ? (
                  <>
                    <motion.div
                      animate={{
                        rotate: [0, -10, 10, -10, 10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 0.5,
                        ease: 'easeInOut'
                      }}
                    >
                      <Gift className="w-24 h-24 text-white mx-auto mb-4" strokeWidth={2} />
                    </motion.div>

                    <h2 className="text-4xl font-black text-white mb-2" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
                      VIP DAILY BONUS
                    </h2>

                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Crown className="w-5 h-5 text-yellow-200" />
                      <p className="text-yellow-100 font-bold">
                        Exclusive Member Reward
                      </p>
                      <Crown className="w-5 h-5 text-yellow-200" />
                    </div>

                    <motion.div
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6 border-2 border-white/50"
                    >
                      <div className="text-6xl font-black text-white mb-2">
                        $500
                      </div>
                      <div className="text-yellow-100 font-bold">
                        FREE CHIPS DAILY!
                      </div>
                    </motion.div>

                    {canClaim ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleClaim}
                        className="w-full py-4 bg-white text-yellow-600 font-black text-2xl rounded-xl shadow-2xl hover:bg-yellow-50 transition-all border-4 border-yellow-200"
                      >
                        <Sparkles className="inline w-6 h-6 mr-2" />
                        CLAIM NOW!
                        <Sparkles className="inline w-6 h-6 ml-2" />
                      </motion.button>
                    ) : (
                      <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 border-2 border-white/50">
                        <p className="text-white font-bold mb-1">
                          Next bonus available in:
                        </p>
                        <p className="text-2xl font-black text-yellow-200">
                          {getTimeUntilNextBonus()}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', duration: 0.6 }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, ease: 'easeInOut' }}
                    >
                      <Sparkles className="w-32 h-32 text-white mx-auto mb-4" />
                    </motion.div>

                    <h2 className="text-5xl font-black text-white mb-4" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
                      CLAIMED!
                    </h2>

                    <div className="text-7xl font-black text-white mb-4">
                      +$500
                    </div>

                    <p className="text-yellow-100 text-xl font-bold">
                      Come back tomorrow for more!
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
