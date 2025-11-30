import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface DiceInGlassProps {
  dice1: number;
  dice2: number;
  isRolling: boolean;
  buttonsLocked?: boolean;
  onRoll: () => void;
  canRoll: boolean;
}

export function DiceInGlass({ dice1, dice2, isRolling, buttonsLocked = false, onRoll, canRoll }: DiceInGlassProps) {
  const total = dice1 + dice2;
  const [animDice1, setAnimDice1] = useState(dice1);
  const [animDice2, setAnimDice2] = useState(dice2);
  const [showFinal, setShowFinal] = useState(true);
  
  // Debug: Log roll button state
  useEffect(() => {
    const isDisabled = !canRoll || isRolling || buttonsLocked;
    console.log('🎲 DiceInGlass roll button state:', { 
      canRoll, 
      isRolling, 
      buttonsLocked, 
      isDisabled,
      reason: !canRoll ? 'insufficient bet' : isRolling ? 'currently rolling' : buttonsLocked ? 'buttons locked' : 'ready'
    });
  }, [canRoll, isRolling, buttonsLocked]);
  
  // Animate dice rolling with longer duration and bouncing when isRolling changes
  useEffect(() => {
    if (isRolling) {
      setShowFinal(false);
      const rollInterval = setInterval(() => {
        // Random dice values while rolling
        setAnimDice1(Math.floor(Math.random() * 6) + 1);
        setAnimDice2(Math.floor(Math.random() * 6) + 1);
      }, 100); // Change every 100ms for smoother visual during longer animation
      
      // After 10.6 seconds (synced with double dice sound), show final TRUE result
      const finalTimer = setTimeout(() => {
        clearInterval(rollInterval);
        console.log('🎲 DiceInGlass showing TRUE final values:', { dice1, dice2 });
        setAnimDice1(dice1);
        setAnimDice2(dice2);
        setShowFinal(true);
      }, 4800); // 4.8 seconds - SINGLE DICE SOUND synced with roll!
      
      return () => {
        clearInterval(rollInterval);
        clearTimeout(finalTimer);
      };
    } else {
      // When not rolling, update immediately to match props
      setAnimDice1(dice1);
      setAnimDice2(dice2);
      setShowFinal(true);
    }
  }, [isRolling, dice1, dice2]);
  
  return (
    <div className="flex items-center gap-3">
      {/* Glass Bowl Container */}
      <motion.button
        onClick={onRoll}
        disabled={!canRoll || isRolling || buttonsLocked}
        whileHover={canRoll && !isRolling && !buttonsLocked ? { scale: 1.05 } : {}}
        whileTap={canRoll && !isRolling && !buttonsLocked ? { scale: 0.95 } : {}}
        className={`relative ${canRoll && !isRolling && !buttonsLocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
        style={{ width: '140px', height: '140px' }}
      >
        {/* Glass Bowl - 3D Effect */}
        <div 
          className="absolute inset-0 rounded-full border-4 border-white/30"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.1) 40%, rgba(200, 200, 255, 0.15) 100%)',
            boxShadow: `
              inset 0 -20px 40px rgba(255, 255, 255, 0.2),
              inset 0 20px 40px rgba(0, 0, 0, 0.15),
              0 10px 30px rgba(0, 0, 0, 0.4),
              0 0 20px rgba(255, 255, 255, 0.3)
            `,
            backdropFilter: 'blur(2px)',
          }}
        >
          {/* Glass Rim Highlight */}
          <div 
            className="absolute top-0 left-1/4 right-1/4 h-8 rounded-full opacity-60"
            style={{
              background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, transparent 100%)',
            }}
          />
          
          {/* Glass Shine Effect */}
          <div 
            className="absolute top-2 left-2 w-12 h-12 rounded-full opacity-50"
            style={{
              background: 'radial-gradient(circle at center, rgba(255, 255, 255, 0.8) 0%, transparent 70%)',
            }}
          />
        </div>
        
        {/* Dice Inside Glass - REALISTIC 4-BOUNCE ANIMATION */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 p-4">
          {/* Die 1 - Realistic bouncing with physics */}
          <motion.div
            key={`glass-die1-${animDice1}-${isRolling ? 'rolling' : 'static'}`}
            animate={isRolling ? {
              // Continuous rotation throughout 3 seconds
              rotateX: [0, 360, 720, 1080, 1440],
              rotateY: [0, 180, 360, 540, 720],
              rotateZ: [0, 90, 180, 270, 360],
              // Subtle side-to-side wobble
              x: [0, -8, 6, -4, 3, -2, 1, 0],
              // REALISTIC 4 BOUNCES: up-down-up-down-up-down-up-down-settle
              // Bounce 1 (high), Bounce 2 (medium), Bounce 3 (low), Bounce 4 (lowest), settle
              y: [
                0,      // Start at bottom
                -30,    // Bounce 1 UP (highest)
                0,      // Bounce 1 DOWN
                -22,    // Bounce 2 UP
                0,      // Bounce 2 DOWN
                -14,    // Bounce 3 UP
                0,      // Bounce 3 DOWN
                -6,     // Bounce 4 UP (lowest)
                0,      // Bounce 4 DOWN - final settle
              ],
              // Squash and stretch on impact
              scale: [
                1,      // Start
                1.08,   // Stretch going up
                0.95,   // Squash on impact
                1.06,   // Stretch going up
                0.97,   // Squash on impact
                1.04,   // Stretch going up
                0.98,   // Squash on impact
                1.02,   // Tiny stretch
                1,      // Final
              ],
            } : {
              rotateX: 0,
              rotateY: 0,
              rotateZ: -15,
              x: 0,
              y: 0,
              scale: 1,
            }}
            transition={isRolling ? {
              duration: 3.0, // Exactly 3 seconds
              ease: [0.25, 0.46, 0.45, 0.94], // Realistic bounce easing
              times: [0, 0.11, 0.22, 0.33, 0.44, 0.55, 0.66, 0.77, 0.88, 1.0], // Keyframe timing for 4 bounces
            } : {
              duration: 0.4,
              ease: "easeOut",
            }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <RealisticDie value={animDice1} />
          </motion.div>
          
          {/* Die 2 - Opposite rotation, slightly different bounce pattern */}
          <motion.div
            key={`glass-die2-${animDice2}-${isRolling ? 'rolling' : 'static'}`}
            animate={isRolling ? {
              // Opposite rotation direction
              rotateX: [0, -360, -720, -1080, -1440],
              rotateY: [0, -180, -360, -540, -720],
              rotateZ: [0, -90, -180, -270, -360],
              // Opposite side wobble
              x: [0, 8, -6, 4, -3, 2, -1, 0],
              // REALISTIC 4 BOUNCES (slightly offset timing for natural look)
              y: [
                0,      // Start at bottom
                -28,    // Bounce 1 UP (high but slightly different height)
                0,      // Bounce 1 DOWN
                -20,    // Bounce 2 UP
                0,      // Bounce 2 DOWN
                -12,    // Bounce 3 UP
                0,      // Bounce 3 DOWN
                -5,     // Bounce 4 UP (lowest)
                0,      // Bounce 4 DOWN - final settle
              ],
              // Squash and stretch on impact
              scale: [
                1,      // Start
                1.09,   // Stretch going up
                0.94,   // Squash on impact
                1.07,   // Stretch going up
                0.96,   // Squash on impact
                1.05,   // Stretch going up
                0.98,   // Squash on impact
                1.02,   // Tiny stretch
                1,      // Final
              ],
            } : {
              rotateX: 0,
              rotateY: 0,
              rotateZ: 10,
              x: 0,
              y: 0,
              scale: 1,
            }}
            transition={isRolling ? {
              duration: 3.0, // Exactly 3 seconds
              ease: [0.25, 0.46, 0.45, 0.94], // Realistic bounce easing
              times: [0, 0.11, 0.22, 0.33, 0.44, 0.55, 0.66, 0.77, 0.88, 1.0], // Keyframe timing for 4 bounces
            } : {
              duration: 0.4,
              ease: "easeOut",
            }}
            style={{ transformStyle: 'preserve-3d' }}
          >
            <RealisticDie value={animDice2} />
          </motion.div>
        </div>
        
        {/* Pulsing Glow When Ready */}
        {canRoll && !isRolling && !buttonsLocked && (
          <motion.div
            className="absolute inset-0 rounded-full pointer-events-none"
            animate={{
              boxShadow: [
                '0 0 20px 5px rgba(251, 191, 36, 0.4)',
                '0 0 30px 10px rgba(251, 191, 36, 0.6)',
                '0 0 20px 5px rgba(251, 191, 36, 0.4)',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
        
        {/* Click Indicator */}
        {canRoll && !isRolling && !buttonsLocked && (
          <motion.div
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-bold"
            animate={{
              y: [0, -3, 0],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              color: '#fbbf24',
              textShadow: '0 0 10px rgba(251, 191, 36, 0.8), 0 2px 4px rgba(0, 0, 0, 1)',
            }}
          >
            🎲 CLICK!
          </motion.div>
        )}
        
        {/* Rolling Text */}
        {isRolling && (
          <motion.div
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-bold"
            animate={{
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
            }}
            style={{
              color: '#ef4444',
              textShadow: '0 0 10px rgba(239, 68, 68, 0.8), 0 2px 4px rgba(0, 0, 0, 1)',
            }}
          >
            🎲 ROLLING...
          </motion.div>
        )}
      </motion.button>
      
      {/* Total Display on Right Side - Only when final */}
      {showFinal && !isRolling && (
        <motion.div
          key={`glass-total-${total}`}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="px-4 py-2 rounded-lg border-2"
          style={{
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)',
            borderColor: '#fbbf24',
            boxShadow: '0 0 15px rgba(251, 191, 36, 0.5), 0 4px 10px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div 
            className="text-4xl font-bold text-center"
            style={{
              color: '#fbbf24',
              textShadow: '0 0 15px rgba(251, 191, 36, 0.8), 0 2px 4px rgba(0, 0, 0, 0.8)',
            }}
          >
            {total}
          </div>
        </motion.div>
      )}
    </div>
  );
}

function RealisticDie({ value }: { value: number }) {
  // Create all 6 faces with proper dot patterns
  const renderDots = (faceValue: number) => {
    const positions: Record<number, string[]> = {
      1: ['center'],
      2: ['top-left', 'bottom-right'],
      3: ['top-left', 'center', 'bottom-right'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
    };

    return positions[faceValue]?.map((pos, i) => {
      const positionClasses: Record<string, string> = {
        'top-left': 'top-1.5 left-1.5',
        'top-right': 'top-1.5 right-1.5',
        'middle-left': 'top-1/2 left-1.5 -translate-y-1/2',
        'middle-right': 'top-1/2 right-1.5 -translate-y-1/2',
        'bottom-left': 'bottom-1.5 left-1.5',
        'bottom-right': 'bottom-1.5 right-1.5',
        'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      };

      return (
        <div
          key={i}
          className={`absolute w-2.5 h-2.5 rounded-full ${positionClasses[pos]}`}
          style={{
            background: 'radial-gradient(circle at 35% 35%, #0a0a0a 0%, #000000 100%)',
            boxShadow: 'inset 0 -1px 3px rgba(0, 0, 0, 0.9), 0 0.5px 1px rgba(0, 0, 0, 0.3)',
          }}
        />
      );
    });
  };

  // Rotation angles to show the correct face
  const rotations: Record<number, { x: number; y: number; z: number }> = {
    1: { x: 0, y: 0, z: 0 },      // Front face
    2: { x: 0, y: -90, z: 0 },    // Right face
    3: { x: 0, y: 0, z: -90 },    // Top face (rotated)
    4: { x: 0, y: 0, z: 90 },     // Bottom face (rotated)
    5: { x: 0, y: 90, z: 0 },     // Left face
    6: { x: 0, y: 180, z: 0 },    // Back face
  };

  const rotation = rotations[value];

  return (
    <div
      className="relative"
      style={{
        width: '48px',
        height: '48px',
        transformStyle: 'preserve-3d',
        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
      }}
    >
      {/* Face 1 - FRONT */}
      <div
        className="absolute w-12 h-12 rounded-md flex items-center justify-center"
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 50%, #ececec 100%)',
          boxShadow: `
            0 3px 10px rgba(0, 0, 0, 0.4),
            inset -2px -2px 4px rgba(0, 0, 0, 0.15),
            inset 2px 2px 4px rgba(255, 255, 255, 0.9)
          `,
          border: '1px solid rgba(0, 0, 0, 0.12)',
          transform: 'translateZ(24px)',
        }}
      >
        <div className="relative w-full h-full">
          {renderDots(1)}
        </div>
      </div>

      {/* Face 2 - RIGHT */}
      <div
        className="absolute w-12 h-12 rounded-md flex items-center justify-center"
        style={{
          background: 'linear-gradient(145deg, #fafafa 0%, #f0f0f0 50%, #e5e5e5 100%)',
          boxShadow: `
            0 3px 10px rgba(0, 0, 0, 0.4),
            inset -2px -2px 4px rgba(0, 0, 0, 0.15),
            inset 2px 2px 4px rgba(255, 255, 255, 0.9)
          `,
          border: '1px solid rgba(0, 0, 0, 0.12)',
          transform: 'rotateY(90deg) translateZ(24px)',
        }}
      >
        <div className="relative w-full h-full">
          {renderDots(2)}
        </div>
      </div>

      {/* Face 3 - TOP */}
      <div
        className="absolute w-12 h-12 rounded-md flex items-center justify-center"
        style={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 50%, #e8e8e8 100%)',
          boxShadow: `
            0 3px 10px rgba(0, 0, 0, 0.4),
            inset -2px -2px 4px rgba(0, 0, 0, 0.15),
            inset 2px 2px 4px rgba(255, 255, 255, 0.9)
          `,
          border: '1px solid rgba(0, 0, 0, 0.12)',
          transform: 'rotateX(90deg) translateZ(24px)',
        }}
      >
        <div className="relative w-full h-full">
          {renderDots(3)}
        </div>
      </div>

      {/* Face 4 - BOTTOM */}
      <div
        className="absolute w-12 h-12 rounded-md flex items-center justify-center"
        style={{
          background: 'linear-gradient(145deg, #f5f5f5 0%, #ebebeb 50%, #dddddd 100%)',
          boxShadow: `
            0 3px 10px rgba(0, 0, 0, 0.4),
            inset -2px -2px 4px rgba(0, 0, 0, 0.15),
            inset 2px 2px 4px rgba(255, 255, 255, 0.9)
          `,
          border: '1px solid rgba(0, 0, 0, 0.12)',
          transform: 'rotateX(-90deg) translateZ(24px)',
        }}
      >
        <div className="relative w-full h-full">
          {renderDots(4)}
        </div>
      </div>

      {/* Face 5 - LEFT */}
      <div
        className="absolute w-12 h-12 rounded-md flex items-center justify-center"
        style={{
          background: 'linear-gradient(145deg, #fafafa 0%, #f0f0f0 50%, #e5e5e5 100%)',
          boxShadow: `
            0 3px 10px rgba(0, 0, 0, 0.4),
            inset -2px -2px 4px rgba(0, 0, 0, 0.15),
            inset 2px 2px 4px rgba(255, 255, 255, 0.9)
          `,
          border: '1px solid rgba(0, 0, 0, 0.12)',
          transform: 'rotateY(-90deg) translateZ(24px)',
        }}
      >
        <div className="relative w-full h-full">
          {renderDots(5)}
        </div>
      </div>

      {/* Face 6 - BACK */}
      <div
        className="absolute w-12 h-12 rounded-md flex items-center justify-center"
        style={{
          background: 'linear-gradient(145deg, #f8f8f8 0%, #eeeeee 50%, #e0e0e0 100%)',
          boxShadow: `
            0 3px 10px rgba(0, 0, 0, 0.4),
            inset -2px -2px 4px rgba(0, 0, 0, 0.15),
            inset 2px 2px 4px rgba(255, 255, 255, 0.9)
          `,
          border: '1px solid rgba(0, 0, 0, 0.12)',
          transform: 'rotateY(180deg) translateZ(24px)',
        }}
      >
        <div className="relative w-full h-full">
          {renderDots(6)}
        </div>
      </div>

      {/* Glossy overlay for casino dice shine */}
      <div
        className="absolute inset-0 rounded-md pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, transparent 50%, rgba(0, 0, 0, 0.1) 100%)',
          transform: 'translateZ(24.5px)',
        }}
      />
    </div>
  );
}