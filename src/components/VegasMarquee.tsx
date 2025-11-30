import { motion } from 'motion/react';

export function VegasMarquee() {
  const messages = [
    "🎰 WELCOME TO ROLLERS PARADISE 🌴",
    "🎲 100% PROVABLY FAIR GAMING 🔐",
    "💰 FREE $1000 DAILY BONUS 🎁",
    "🏆 AUTHENTIC CRAPS ACTION ⚡",
    "👥 PLAY WITH FRIENDS ONLINE 🌐",
    "✨ TROPICAL CASINO VIBES 🏝️",
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none overflow-hidden bg-gradient-to-r from-yellow-500 via-red-500 to-purple-500 border-b-4 border-yellow-300">
      <div className="relative h-12 flex items-center">
        {/* First scrolling text */}
        <motion.div
          className="absolute whitespace-nowrap flex items-center gap-8"
          animate={{
            x: ['100%', '-100%'],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {messages.map((msg, idx) => (
            <span
              key={`first-${idx}`}
              className="text-white font-black text-xl tracking-wider px-8"
              style={{
                textShadow: '0 0 10px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.5)',
              }}
            >
              {msg}
            </span>
          ))}
        </motion.div>

        {/* Second scrolling text (for seamless loop) */}
        <motion.div
          className="absolute whitespace-nowrap flex items-center gap-8"
          animate={{
            x: ['200%', '0%'],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {messages.map((msg, idx) => (
            <span
              key={`second-${idx}`}
              className="text-white font-black text-xl tracking-wider px-8"
              style={{
                textShadow: '0 0 10px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.5)',
              }}
            >
              {msg}
            </span>
          ))}
        </motion.div>
      </div>

      {/* Pulsing lights effect */}
      <div className="absolute inset-0 flex">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="flex-1 h-full"
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 0.5,
              delay: i * 0.05,
              repeat: Infinity,
            }}
            style={{
              background: i % 2 === 0 ? 'rgba(255,215,0,0.3)' : 'rgba(255,255,255,0.3)',
            }}
          />
        ))}
      </div>
    </div>
  );
}
