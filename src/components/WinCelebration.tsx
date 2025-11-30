import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, TrendingUp } from 'lucide-react';

interface WinCelebrationProps {
  amount: number;
  type: 'small' | 'medium' | 'large' | 'jackpot';
  onComplete: () => void;
}

export function WinCelebration({ amount, type, onComplete }: WinCelebrationProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);

  useEffect(() => {
    // Generate confetti pieces
    const confettiCount = type === 'jackpot' ? 100 : type === 'large' ? 60 : type === 'medium' ? 40 : 20;
    const colors = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
    
    const newConfetti = Array.from({ length: confettiCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 0.5,
    }));

    setConfetti(newConfetti);

    const timer = setTimeout(() => {
      onComplete();
    }, 3000);

    return () => clearTimeout(timer);
  }, [type, onComplete]);

  const getMessage = () => {
    switch (type) {
      case 'jackpot':
        return '🎰 JACKPOT! 🎰';
      case 'large':
        return '💰 BIG WIN! 💰';
      case 'medium':
        return '🎉 NICE WIN! 🎉';
      default:
        return '✨ WINNER! ✨';
    }
  };

  const getTextSize = () => {
    switch (type) {
      case 'jackpot':
        return 'text-6xl';
      case 'large':
        return 'text-5xl';
      case 'medium':
        return 'text-4xl';
      default:
        return 'text-3xl';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
    >
      {/* Confetti */}
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute w-3 h-3 rounded-full"
          style={{
            backgroundColor: piece.color,
            left: `${piece.x}%`,
            top: '-5%',
          }}
          initial={{ y: 0, rotate: 0, opacity: 1 }}
          animate={{
            y: window.innerHeight * 1.2,
            rotate: Math.random() * 720 - 360,
            opacity: 0,
            x: (Math.random() - 0.5) * 200,
          }}
          transition={{
            duration: 2 + Math.random() * 2,
            delay: piece.delay,
            ease: 'easeIn',
          }}
        />
      ))}

      {/* Win Message */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        className="text-center"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: 5,
          }}
          className={`${getTextSize()} font-black text-yellow-400 drop-shadow-[0_0_30px_rgba(255,215,0,0.8)] mb-4`}
          style={{ textShadow: '0 0 20px rgba(0,0,0,0.9), 0 0 40px rgba(255,215,0,0.5)' }}
        >
          {getMessage()}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-black text-white drop-shadow-[0_0_20px_rgba(0,0,0,0.8)] flex items-center justify-center gap-3"
        >
          <TrendingUp className="w-12 h-12 text-green-400" />
          +${amount}
          <Sparkles className="w-12 h-12 text-yellow-400" />
        </motion.div>
      </motion.div>

      {/* Golden Flash */}
      {type === 'jackpot' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 1, repeat: 2 }}
          className="absolute inset-0 bg-gradient-radial from-yellow-400/30 to-transparent"
        />
      )}
    </motion.div>
  );
}
