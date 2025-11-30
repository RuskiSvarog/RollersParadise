import { motion } from 'motion/react';
import { useSettings } from '../contexts/SettingsContext';

export function TropicalDecorations() {
  const { settings } = useSettings();
  
  // Check if background effects should be displayed
  if (!settings.enableBackgroundEffects) {
    return null;
  }

  const theme = settings.tableTheme;

  // Theme-specific configurations
  const themeConfig = {
    tropical: {
      skyGradient: 'linear-gradient(to bottom, #0c4a6e 0%, #0369a1 10%, #0ea5e9 25%, #38bdf8 40%, #7dd3fc 55%, #fef3c7 80%, #fde68a 90%, #fcd34d 100%)',
      icon: '☀️',
      iconColor: 'rgba(254, 240, 138, 0.9)',
      iconGlow: 'radial-gradient(circle, rgba(254, 240, 138, 0.8) 0%, rgba(253, 224, 71, 0.5) 30%, rgba(252, 211, 77, 0.3) 50%, transparent 70%)',
      clouds: true,
      lowerGradient: 'linear-gradient(to bottom, #0891b2 0%, #0e7490 15%, #155e75 30%, #164e63 50%, #1e3a5f 75%, #1e293b 100%)',
      beachGradient: 'linear-gradient(to top, #78350f 0%, #92400e 5%, #b45309 12%, #d97706 20%, #f59e0b 30%, #fbbf24 45%, #fde68a 65%, rgba(254, 243, 199, 0.6) 85%, transparent 100%)',
      ambiance: 'radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(6, 182, 212, 0.08) 50%, rgba(14, 116, 144, 0.12) 100%)'
    },
    classic: {
      skyGradient: 'linear-gradient(to bottom, #450a0a 0%, #7f1d1d 10%, #991b1b 25%, #b91c1c 40%, #1f2937 60%, #111827 80%, #0f172a 100%)',
      icon: '🎰',
      iconColor: 'rgba(239, 68, 68, 0.9)',
      iconGlow: 'radial-gradient(circle, rgba(239, 68, 68, 0.8) 0%, rgba(220, 38, 38, 0.5) 30%, rgba(185, 28, 28, 0.3) 50%, transparent 70%)',
      clouds: false,
      lowerGradient: 'linear-gradient(to bottom, #1f2937 0%, #111827 20%, #0f172a 40%, #020617 100%)',
      beachGradient: 'linear-gradient(to top, #450a0a 0%, #7f1d1d 20%, #991b1b 40%, rgba(153, 27, 27, 0.5) 70%, transparent 100%)',
      ambiance: 'radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(220, 38, 38, 0.08) 50%, rgba(153, 27, 27, 0.12) 100%)'
    },
    neon: {
      skyGradient: 'linear-gradient(to bottom, #3b0764 0%, #581c87 10%, #7c3aed 25%, #a855f7 40%, #c084fc 55%, #e879f9 70%, #ec4899 85%, #f472b6 100%)',
      icon: '⚡',
      iconColor: 'rgba(236, 72, 153, 0.9)',
      iconGlow: 'radial-gradient(circle, rgba(236, 72, 153, 0.9) 0%, rgba(219, 39, 119, 0.6) 30%, rgba(190, 24, 93, 0.4) 50%, transparent 70%)',
      clouds: false,
      lowerGradient: 'linear-gradient(to bottom, #581c87 0%, #6b21a8 20%, #7c3aed 40%, #8b5cf6 60%, #a855f7 80%, #c084fc 100%)',
      beachGradient: 'linear-gradient(to top, #831843 0%, #be185d 20%, #db2777 40%, #ec4899 60%, rgba(236, 72, 153, 0.5) 80%, transparent 100%)',
      ambiance: 'radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(168, 85, 247, 0.12) 50%, rgba(236, 72, 153, 0.15) 100%)'
    },
    luxury: {
      skyGradient: 'linear-gradient(to bottom, #78350f 0%, #92400e 10%, #b45309 25%, #d97706 40%, #f59e0b 55%, #fbbf24 70%, #fcd34d 85%, #fde68a 100%)',
      icon: '👑',
      iconColor: 'rgba(251, 191, 36, 0.9)',
      iconGlow: 'radial-gradient(circle, rgba(251, 191, 36, 0.9) 0%, rgba(245, 158, 11, 0.7) 30%, rgba(217, 119, 6, 0.5) 50%, transparent 70%)',
      clouds: false,
      lowerGradient: 'linear-gradient(to bottom, #92400e 0%, #78350f 20%, #713f12 40%, #854d0e 60%, #a16207 80%, #ca8a04 100%)',
      beachGradient: 'linear-gradient(to top, #422006 0%, #713f12 20%, #92400e 40%, #b45309 60%, rgba(180, 83, 9, 0.5) 80%, transparent 100%)',
      ambiance: 'radial-gradient(ellipse at 50% 50%, transparent 0%, rgba(251, 191, 36, 0.12) 50%, rgba(245, 158, 11, 0.15) 100%)'
    }
  };

  const config = themeConfig[theme];

  return (
    <>
      {/* Background Container */}
      <div className="fixed inset-0 z-0">
        {/* Sky Gradient */}
        <div 
          className="absolute inset-0"
          style={{
            background: config.skyGradient
          }}
        />
        
        {/* Animated Icon (Sun/Slot/Lightning/Crown) - Gentle pulse */}
        <motion.div
          className="absolute top-16 right-1/4"
          animate={{
            scale: [1, 1.08, 1]
          }}
          transition={{
            duration: theme === 'neon' ? 2 : 10,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="relative">
            {/* Icon glow */}
            <div 
              className="absolute inset-0 rounded-full blur-3xl"
              style={{
                width: '200px',
                height: '200px',
                background: config.iconGlow,
                transform: 'translate(-50%, -50%)',
                left: '50%',
                top: '50%'
              }}
            />
            {/* Icon core */}
            <div 
              className="text-9xl relative z-10"
              style={{
                filter: `drop-shadow(0 0 30px ${config.iconColor})`
              }}
            >
              {config.icon}
            </div>
          </div>
        </motion.div>

        {/* Clouds - Only for Tropical theme */}
        {config.clouds && (
          <>
            <motion.div
              className="absolute top-[10%] text-7xl opacity-95"
              animate={{
                x: [-200, window.innerWidth + 200]
              }}
              transition={{
                duration: 90,
                repeat: Infinity,
                ease: "linear"
              }}
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(255, 255, 255, 0.3))'
              }}
            >
              ☁️
            </motion.div>

            <motion.div
              className="absolute top-[14%] text-6xl opacity-90"
              animate={{
                x: [-250, window.innerWidth + 250]
              }}
              transition={{
                duration: 110,
                repeat: Infinity,
                ease: "linear",
                delay: 25
              }}
              style={{
                filter: 'drop-shadow(0 4px 8px rgba(255, 255, 255, 0.3))'
              }}
            >
              ☁️
            </motion.div>

            <motion.div
              className="absolute top-[20%] text-5xl opacity-85"
              animate={{
                x: [-180, window.innerWidth + 180]
              }}
              transition={{
                duration: 95,
                repeat: Infinity,
                ease: "linear",
                delay: 50
              }}
              style={{
                filter: 'drop-shadow(0 3px 6px rgba(255, 255, 255, 0.3))'
              }}
            >
              ☁️
            </motion.div>
          </>
        )}

        {/* Neon Light Beams - Only for Neon theme */}
        {theme === 'neon' && (
          <>
            <motion.div
              className="absolute top-0 left-1/4 w-32 h-full opacity-20"
              animate={{
                opacity: [0.1, 0.3, 0.1]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                background: 'linear-gradient(to bottom, rgba(168, 85, 247, 0.8) 0%, transparent 100%)',
                filter: 'blur(40px)'
              }}
            />
            <motion.div
              className="absolute top-0 right-1/3 w-40 h-full opacity-20"
              animate={{
                opacity: [0.2, 0.4, 0.2]
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              style={{
                background: 'linear-gradient(to bottom, rgba(236, 72, 153, 0.8) 0%, transparent 100%)',
                filter: 'blur(40px)'
              }}
            />
          </>
        )}

        {/* Horizon Line */}
        <div 
          className="absolute top-[50%] left-0 right-0 h-1"
          style={{
            background: theme === 'tropical' 
              ? 'linear-gradient(to right, transparent 0%, rgba(6, 182, 212, 0.4) 50%, transparent 100%)'
              : 'linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)'
          }}
        />

        {/* Lower Section (Ocean/Dark Floor) */}
        <div 
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '45%',
            background: config.lowerGradient
          }}
        />

        {/* Wave/Texture Effects */}
        {theme === 'tropical' && (
          <>
            <div 
              className="absolute bottom-[35%] left-0 right-0 h-24 opacity-20"
              style={{
                background: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255, 255, 255, 0.15) 40px, rgba(255, 255, 255, 0.15) 80px)',
                transform: 'skewY(-1deg)'
              }}
            />

            <div 
              className="absolute bottom-[28%] left-0 right-0 h-20 opacity-15"
              style={{
                background: 'repeating-linear-gradient(90deg, transparent, transparent 60px, rgba(255, 255, 255, 0.2) 60px, rgba(255, 255, 255, 0.2) 120px)',
                transform: 'skewY(-0.5deg)'
              }}
            />
          </>
        )}

        {/* Floor Section (Beach/Casino Floor) */}
        <div 
          className="absolute bottom-0 left-0 right-0"
          style={{
            height: '22%',
            background: config.beachGradient
          }}
        />

        {/* Classic Casino Floor Pattern */}
        {theme === 'classic' && (
          <div 
            className="absolute bottom-0 left-0 right-0 opacity-20"
            style={{
              height: '22%',
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(220, 38, 38, 0.3) 35px, rgba(220, 38, 38, 0.3) 70px)',
              backgroundSize: '100px 100px'
            }}
          />
        )}

        {/* Neon Grid Floor */}
        {theme === 'neon' && (
          <div 
            className="absolute bottom-0 left-0 right-0 opacity-30"
            style={{
              height: '22%',
              backgroundImage: `
                linear-gradient(rgba(236, 72, 153, 0.5) 2px, transparent 2px),
                linear-gradient(90deg, rgba(168, 85, 247, 0.5) 2px, transparent 2px)
              `,
              backgroundSize: '50px 50px'
            }}
          />
        )}

        {/* Luxury Shine Pattern */}
        {theme === 'luxury' && (
          <div 
            className="absolute bottom-0 left-0 right-0 opacity-40"
            style={{
              height: '22%',
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 30px, rgba(251, 191, 36, 0.3) 30px, rgba(251, 191, 36, 0.3) 31px)',
            }}
          />
        )}

        {/* Beach/Floor Texture */}
        {theme === 'tropical' && (
          <>
            <div 
              className="absolute bottom-0 left-0 right-0 opacity-10"
              style={{
                height: '22%',
                backgroundImage: `
                  radial-gradient(circle at 20% 50%, transparent 0%, rgba(217, 119, 6, 0.3) 1px, transparent 1px),
                  radial-gradient(circle at 80% 30%, transparent 0%, rgba(180, 83, 9, 0.3) 1px, transparent 1px),
                  radial-gradient(circle at 45% 70%, transparent 0%, rgba(146, 64, 14, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px, 50px 50px, 35px 35px',
                backgroundPosition: '0 0, 25px 25px, 10px 15px'
              }}
            />

            {/* Foamy Wave Edge */}
            <div 
              className="absolute bottom-[22%] left-0 right-0 h-8 opacity-40"
              style={{
                background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)',
                filter: 'blur(4px)'
              }}
            />
          </>
        )}

        {/* Ambiance Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: config.ambiance
          }}
        />

        {/* Theme-specific Sparkles/Highlights */}
        {theme === 'tropical' && (
          <>
            {/* Water sparkles */}
            <div className="absolute bottom-[40%] left-[15%] w-3 h-3 bg-white rounded-full opacity-60 blur-sm" />
            <div className="absolute bottom-[43%] left-[35%] w-2 h-2 bg-white rounded-full opacity-70 blur-sm" />
            <div className="absolute bottom-[38%] right-[25%] w-3 h-3 bg-white rounded-full opacity-50 blur-sm" />
            <div className="absolute bottom-[45%] right-[45%] w-2 h-2 bg-white rounded-full opacity-60 blur-sm" />
            <div className="absolute bottom-[41%] left-[60%] w-2 h-2 bg-white rounded-full opacity-55 blur-sm" />
            
            {/* Sand sparkles */}
            <div className="absolute bottom-[15%] left-[20%] w-2 h-2 bg-yellow-300 rounded-full opacity-40 blur-sm" />
            <div className="absolute bottom-[10%] right-[30%] w-2 h-2 bg-yellow-200 rounded-full opacity-35 blur-sm" />
            <div className="absolute bottom-[18%] left-[70%] w-1 h-1 bg-yellow-400 rounded-full opacity-45 blur-sm" />
          </>
        )}

        {theme === 'classic' && (
          <>
            {/* Red glow spots */}
            <div className="absolute bottom-[40%] left-[20%] w-4 h-4 bg-red-500 rounded-full opacity-30 blur-lg" />
            <div className="absolute bottom-[35%] right-[30%] w-5 h-5 bg-red-600 rounded-full opacity-25 blur-lg" />
            <div className="absolute bottom-[15%] left-[50%] w-3 h-3 bg-red-400 rounded-full opacity-35 blur-md" />
          </>
        )}

        {theme === 'neon' && (
          <>
            {/* Neon glows */}
            <motion.div 
              className="absolute bottom-[40%] left-[25%] w-6 h-6 bg-pink-500 rounded-full opacity-40 blur-xl"
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-[35%] right-[35%] w-5 h-5 bg-purple-500 rounded-full opacity-50 blur-xl"
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
            />
            <motion.div 
              className="absolute bottom-[15%] left-[60%] w-4 h-4 bg-fuchsia-400 rounded-full opacity-45 blur-lg"
              animate={{ opacity: [0.25, 0.65, 0.25] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            />
          </>
        )}

        {theme === 'luxury' && (
          <>
            {/* Golden sparkles */}
            <motion.div 
              className="absolute bottom-[40%] left-[30%] w-3 h-3 bg-yellow-300 rounded-full opacity-60 blur-sm"
              animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
            <motion.div 
              className="absolute bottom-[35%] right-[40%] w-4 h-4 bg-yellow-400 rounded-full opacity-70 blur-sm"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
            />
            <motion.div 
              className="absolute bottom-[45%] left-[55%] w-2 h-2 bg-yellow-200 rounded-full opacity-65 blur-sm"
              animate={{ scale: [1, 1.4, 1], opacity: [0.45, 0.85, 0.45] }}
              transition={{ duration: 3.5, repeat: Infinity, delay: 0.5 }}
            />
            <div className="absolute bottom-[15%] left-[25%] w-2 h-2 bg-yellow-300 rounded-full opacity-50 blur-sm" />
            <div className="absolute bottom-[10%] right-[35%] w-3 h-3 bg-yellow-400 rounded-full opacity-55 blur-sm" />
            <div className="absolute bottom-[18%] left-[65%] w-2 h-2 bg-yellow-200 rounded-full opacity-45 blur-sm" />
          </>
        )}
      </div>
    </>
  );
}
