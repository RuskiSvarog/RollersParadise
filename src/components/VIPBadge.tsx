import { motion } from 'motion/react';
import { Crown, Sparkles } from 'lucide-react';

interface VIPBadgeProps {
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
  animated?: boolean;
}

export function VIPBadge({ size = 'medium', showLabel = true, animated = true }: VIPBadgeProps) {
  const sizes = {
    small: { icon: 'w-4 h-4', text: 'text-xs', padding: 'px-2 py-1' },
    medium: { icon: 'w-5 h-5', text: 'text-sm', padding: 'px-3 py-1.5' },
    large: { icon: 'w-6 h-6', text: 'text-base', padding: 'px-4 py-2' }
  };

  const BadgeContent = (
    <div
      className={`inline-flex items-center gap-1.5 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 text-black font-black rounded-full ${sizes[size].padding} border-2 border-yellow-300 shadow-lg`}
      style={{
        boxShadow: '0 4px 12px rgba(234, 179, 8, 0.5), inset 0 1px 3px rgba(255, 255, 255, 0.5)'
      }}
    >
      <Crown className={sizes[size].icon} strokeWidth={3} />
      {showLabel && (
        <span className={sizes[size].text}>VIP</span>
      )}
    </div>
  );

  if (animated) {
    return (
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="inline-block"
      >
        <motion.div
          animate={{
            y: [0, -3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          {BadgeContent}
        </motion.div>
        
        {/* Sparkle Effects */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            opacity: [0, 1, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        >
          <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1" />
        </motion.div>
      </motion.div>
    );
  }

  return BadgeContent;
}
