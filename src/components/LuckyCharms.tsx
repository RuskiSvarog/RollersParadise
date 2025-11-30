import { motion } from 'motion/react';
import { Clover, Star, Gem, Coins } from 'lucide-react';

export function LuckyCharms() {
  const charms = [
    { Icon: Clover, color: 'text-green-400', top: '20%', left: '10%', duration: 8 },
    { Icon: Star, color: 'text-yellow-400', top: '60%', right: '15%', duration: 10 },
    { Icon: Gem, color: 'text-purple-400', bottom: '25%', left: '8%', duration: 12 },
    { Icon: Coins, color: 'text-yellow-500', top: '40%', right: '12%', duration: 9 },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none z-5">
      {charms.map((charm, index) => (
        <motion.div
          key={index}
          className={`absolute ${charm.color} opacity-20`}
          style={{
            top: charm.top,
            left: charm.left,
            right: charm.right,
            bottom: charm.bottom,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, 15, -15, 0],
            rotate: [0, 360],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: charm.duration,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: index * 2,
          }}
        >
          <charm.Icon className="w-16 h-16" />
        </motion.div>
      ))}
    </div>
  );
}
