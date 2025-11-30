import { motion } from 'motion/react';
import { useEffect, useState } from 'react';

export function NeonLights() {
  const [lights, setLights] = useState<Array<{ id: number; color: string; delay: number }>>([]);

  useEffect(() => {
    const colors = [
      '#FF1493', // Hot pink
      '#00FFFF', // Cyan
      '#FFD700', // Gold
      '#FF69B4', // Hot pink
      '#9370DB', // Medium purple
      '#FF8C00', // Dark orange (less bright)
      '#87CEEB', // Sky blue
      '#DDA0DD', // Plum
    ];

    const newLights = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 2,
    }));

    setLights(newLights);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Top Lights */}
      <div className="absolute top-0 left-0 right-0 h-4 flex">
        {lights.slice(0, 20).map((light) => (
          <motion.div
            key={`top-${light.id}`}
            className="flex-1 h-full"
            style={{ backgroundColor: light.color }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              boxShadow: [
                `0 0 5px ${light.color}`,
                `0 0 15px ${light.color}, 0 0 25px ${light.color}`,
                `0 0 5px ${light.color}`,
              ],
            }}
            transition={{
              duration: 2,
              delay: light.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Bottom Lights */}
      <div className="absolute bottom-0 left-0 right-0 h-4 flex">
        {lights.slice(20, 40).map((light) => (
          <motion.div
            key={`bottom-${light.id}`}
            className="flex-1 h-full"
            style={{ backgroundColor: light.color }}
            animate={{
              opacity: [0.2, 0.5, 0.2],
              boxShadow: [
                `0 0 5px ${light.color}`,
                `0 0 15px ${light.color}, 0 0 25px ${light.color}`,
                `0 0 5px ${light.color}`,
              ],
            }}
            transition={{
              duration: 2,
              delay: light.delay,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Corner Spotlights */}
      <motion.div
        className="absolute top-0 left-0 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(255,215,0,0.15) 0%, transparent 70%)',
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute top-0 right-0 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(236,72,153,0.15) 0%, transparent 70%)',
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          delay: 1,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-0 left-0 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          delay: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      <motion.div
        className="absolute bottom-0 right-0 w-96 h-96 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, transparent 70%)',
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          delay: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  );
}