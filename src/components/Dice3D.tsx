import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface Dice3DProps {
  value: number;
  isRolling: boolean;
  diceIndex: number; // 0 or 1 for different animation patterns
}

export function Dice3D({ value, isRolling, diceIndex }: Dice3DProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  // Rotation values for each dice face to show the correct number on top
  const faceRotations: Record<number, { x: number; y: number; z: number }> = {
    1: { x: 0, y: 0, z: 0 },           // Front face
    2: { x: 0, y: 90, z: 0 },          // Right face
    3: { x: 0, y: 0, z: -90 },         // Top face
    4: { x: 0, y: 0, z: 90 },          // Bottom face
    5: { x: 0, y: -90, z: 0 },         // Left face
    6: { x: 0, y: 180, z: 0 },         // Back face
  };

  useEffect(() => {
    if (!isRolling) {
      // Show the final value
      setRotation(faceRotations[value]);
    }
  }, [value, isRolling]);

  // Render pip (dot) on dice face
  const renderPips = (num: number) => {
    const pipPositions: Record<number, Array<{ row: number; col: number }>> = {
      1: [{ row: 1, col: 1 }],
      2: [{ row: 0, col: 0 }, { row: 2, col: 2 }],
      3: [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }],
      4: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 2 }],
      5: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 1 }, { row: 2, col: 0 }, { row: 2, col: 2 }],
      6: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 0 }, { row: 1, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 2 }],
    };

    const pips = pipPositions[num] || [];
    
    return (
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-2 p-5">
        {Array.from({ length: 9 }).map((_, idx) => {
          const row = Math.floor(idx / 3);
          const col = idx % 3;
          const hasPip = pips.some(p => p.row === row && p.col === col);
          
          return (
            <div key={idx} className="flex items-center justify-center">
              {hasPip && (
                <div 
                  className="rounded-full bg-gray-900"
                  style={{
                    width: '28%',
                    paddingBottom: '28%',
                    boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.4)',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const rollingAnimation = isRolling
    ? {
        rotateX: diceIndex === 0 ? [0, 360, 720, 1080] : [0, -360, -720, -1080],
        rotateY: diceIndex === 0 ? [0, 360, 720, 1080] : [0, 360, 720, 1080],
        rotateZ: diceIndex === 0 ? [0, 180, 360, 540] : [0, -180, -360, -540],
      }
    : {
        rotateX: rotation.x,
        rotateY: rotation.y,
        rotateZ: rotation.z,
      };

  return (
    <div className="relative" style={{ perspective: '1500px' }}>
      <motion.div
        className="relative"
        style={{
          width: '150px',
          height: '150px',
          transformStyle: 'preserve-3d',
        }}
        animate={rollingAnimation}
        transition={{
          duration: isRolling ? 1.5 : 0.6,
          ease: isRolling ? 'linear' : 'easeOut',
        }}
      >
        {/* Front Face - 1 */}
        <div
          className="absolute w-full h-full rounded-lg border-3 border-white/30"
          style={{
            transform: 'translateZ(75px)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1), 0 6px 12px rgba(0,0,0,0.3)',
          }}
        >
          {renderPips(1)}
        </div>

        {/* Back Face - 6 */}
        <div
          className="absolute w-full h-full rounded-lg border-3 border-white/30"
          style={{
            transform: 'translateZ(-75px) rotateY(180deg)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1), 0 6px 12px rgba(0,0,0,0.3)',
          }}
        >
          {renderPips(6)}
        </div>

        {/* Right Face - 2 */}
        <div
          className="absolute w-full h-full rounded-lg border-3 border-white/30"
          style={{
            transform: 'rotateY(90deg) translateZ(75px)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1), 0 6px 12px rgba(0,0,0,0.3)',
          }}
        >
          {renderPips(2)}
        </div>

        {/* Left Face - 5 */}
        <div
          className="absolute w-full h-full rounded-lg border-3 border-white/30"
          style={{
            transform: 'rotateY(-90deg) translateZ(75px)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1), 0 6px 12px rgba(0,0,0,0.3)',
          }}
        >
          {renderPips(5)}
        </div>

        {/* Top Face - 3 */}
        <div
          className="absolute w-full h-full rounded-lg border-3 border-white/30"
          style={{
            transform: 'rotateX(90deg) translateZ(75px)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1), 0 6px 12px rgba(0,0,0,0.3)',
          }}
        >
          {renderPips(3)}
        </div>

        {/* Bottom Face - 4 */}
        <div
          className="absolute w-full h-full rounded-lg border-3 border-white/30"
          style={{
            transform: 'rotateX(-90deg) translateZ(75px)',
            background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.1), 0 6px 12px rgba(0,0,0,0.3)',
          }}
        >
          {renderPips(4)}
        </div>
      </motion.div>

      {/* Shadow underneath dice */}
      <motion.div
        className="absolute top-full left-1/2 -translate-x-1/2 rounded-full"
        style={{
          width: '100px',
          height: '30px',
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
          filter: 'blur(12px)',
          marginTop: '15px',
        }}
        animate={{
          scale: isRolling ? [1, 1.2, 1] : 1,
          opacity: isRolling ? [0.5, 0.7, 0.5] : 0.5,
        }}
        transition={{
          duration: isRolling ? 1.5 : 0.3,
          repeat: isRolling ? Infinity : 0,
        }}
      />
    </div>
  );
}
