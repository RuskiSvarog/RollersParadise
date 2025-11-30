import { motion } from 'motion/react';

interface CornerDiceProps {
  number: number;
  isShaking?: boolean;
  animationKey?: number;
  size?: number;
}

export function CornerDice({ number, isShaking, animationKey, size = 80 }: CornerDiceProps) {
  const depth = size * 0.5; // Cube depth for proper 3D

  return (
    <motion.div
      key={`corner-dice-${animationKey}`}
      className="relative"
      style={{ 
        width: size, 
        height: size,
        perspective: '1000px'
      }}
      animate={isShaking ? { 
        rotate: [0, -10, 10, -10, 10, -5, 5, 0], 
        scale: [1, 1.15, 1.15, 1.15, 1.15, 1.1, 1.1, 1],
        x: [0, -2, 2, -2, 2, -1, 1, 0]
      } : {}}
      transition={{ duration: 0.4 }}
    >
      {/* Main 3D cube container */}
      <div 
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(-20deg) rotateY(-25deg)',
        }}
      >
        {/* FRONT FACE */}
        <div 
          className="absolute rounded-xl"
          style={{
            width: size,
            height: size,
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 40%, #e8e8e8 100%)',
            transform: `translateZ(${depth / 2}px)`,
            transformStyle: 'preserve-3d',
            boxShadow: `
              0 8px 24px rgba(0,0,0,0.3),
              0 2px 8px rgba(0,0,0,0.2),
              inset 0 2px 4px rgba(255,255,255,0.9),
              inset 0 -2px 4px rgba(0,0,0,0.15)
            `,
            border: '2px solid rgba(255,255,255,0.8)',
          }}
        >
          {/* Top shine */}
          <div 
            className="absolute top-2 left-2 right-8 h-4 rounded-full opacity-60 blur-md"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)',
            }}
          />
          
          {/* Dice dots */}
          <div className="absolute inset-0 flex items-center justify-center p-3">
            <DiceDots number={number} size={size} />
          </div>
          
          {/* Big center number */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <span 
              className="text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" 
              style={{ 
                fontSize: `${size * 0.5}px`, 
                fontWeight: 900, 
                textShadow: '0 0 20px rgba(255,215,0,0.6), 0 2px 4px rgba(0,0,0,0.9)' 
              }}
            >
              {number}
            </span>
          </div>
        </div>

        {/* BACK FACE */}
        <div 
          className="absolute rounded-xl"
          style={{
            width: size,
            height: size,
            background: 'linear-gradient(145deg, #e0e0e0 0%, #d0d0d0 50%, #c0c0c0 100%)',
            transform: `translateZ(-${depth / 2}px) rotateY(180deg)`,
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
            border: '1px solid rgba(180,180,180,0.6)',
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center p-3">
            <DiceDots number={getOppositeNumber(number)} size={size} />
          </div>
        </div>

        {/* RIGHT FACE */}
        <div 
          className="absolute rounded-r-xl flex items-center justify-center overflow-hidden"
          style={{
            width: depth,
            height: size,
            background: 'linear-gradient(90deg, #e8e8e8 0%, #d0d0d0 50%, #b8b8b8 100%)',
            transform: `rotateY(90deg) translateZ(${size - depth / 2}px)`,
            transformOrigin: 'left center',
            boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.3)',
            border: '1px solid rgba(180,180,180,0.6)',
          }}
        >
          {/* Side face number */}
          <span 
            className="text-gray-400 opacity-50"
            style={{ 
              fontSize: `${depth * 0.4}px`, 
              fontWeight: 800,
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            {number === 4 ? '10' : number === 6 ? '4' : number === 8 ? '6' : '8'}
          </span>
        </div>

        {/* LEFT FACE */}
        <div 
          className="absolute rounded-l-xl flex items-center justify-center overflow-hidden"
          style={{
            width: depth,
            height: size,
            background: 'linear-gradient(90deg, #c0c0c0 0%, #d0d0d0 50%, #e0e0e0 100%)',
            transform: `rotateY(-90deg) translateZ(${depth / 2}px)`,
            transformOrigin: 'right center',
            boxShadow: 'inset 2px 0 4px rgba(0,0,0,0.3)',
            border: '1px solid rgba(180,180,180,0.6)',
          }}
        >
          <span 
            className="text-gray-400 opacity-50"
            style={{ 
              fontSize: `${depth * 0.4}px`, 
              fontWeight: 800,
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            {number === 4 ? '8' : number === 6 ? '10' : number === 8 ? '4' : '6'}
          </span>
        </div>

        {/* TOP FACE */}
        <div 
          className="absolute rounded-t-xl flex items-center justify-center overflow-hidden"
          style={{
            width: size,
            height: depth,
            background: 'linear-gradient(180deg, #f5f5f5 0%, #e8e8e8 50%, #d8d8d8 100%)',
            transform: `rotateX(90deg) translateZ(${depth / 2}px)`,
            transformOrigin: 'bottom center',
            boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.25)',
            border: '1px solid rgba(200,200,200,0.6)',
          }}
        >
          <span 
            className="text-gray-400 opacity-50"
            style={{ 
              fontSize: `${depth * 0.4}px`, 
              fontWeight: 800,
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            {number === 4 ? '6' : number === 6 ? '8' : number === 8 ? '10' : '4'}
          </span>
        </div>

        {/* BOTTOM FACE */}
        <div 
          className="absolute rounded-b-xl flex items-center justify-center overflow-hidden"
          style={{
            width: size,
            height: depth,
            background: 'linear-gradient(180deg, #b8b8b8 0%, #c8c8c8 50%, #d0d0d0 100%)',
            transform: `rotateX(-90deg) translateZ(${size - depth / 2}px)`,
            transformOrigin: 'top center',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
            border: '1px solid rgba(160,160,160,0.6)',
          }}
        >
          <span 
            className="text-gray-400 opacity-50"
            style={{ 
              fontSize: `${depth * 0.4}px`, 
              fontWeight: 800,
              textShadow: '0 1px 2px rgba(0,0,0,0.5)',
            }}
          >
            {getOppositeNumber(number === 4 ? 6 : number === 6 ? 8 : number === 8 ? 10 : 4)}
          </span>
        </div>
      </div>
      
      {/* Drop shadow beneath die */}
      <div 
        className="absolute left-1/2 -translate-x-1/2 rounded-full blur-xl opacity-60"
        style={{
          width: size * 0.7,
          height: size * 0.2,
          bottom: -size * 0.15,
          background: 'radial-gradient(ellipse, rgba(0,0,0,0.6) 0%, transparent 70%)',
        }}
      />
    </motion.div>
  );
}

// Helper to get opposite face number for hardways
function getOppositeNumber(num: number): number {
  const opposites: Record<number, number> = {
    4: 10,
    6: 8,
    8: 6,
    10: 4
  };
  return opposites[num] || num;
}

function DiceDots({ number, size }: { number: number; size: number }) {
  const dotPositions = {
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
    8: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
    10: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
  };

  const positions = dotPositions[number as keyof typeof dotPositions] || [];
  
  const dotSize = Math.max(4, size * 0.08);
  const spacing = size * 0.18;

  const getDotPosition = (position: string) => {
    const half = '50%';
    const near = `${spacing}px`;
    
    switch (position) {
      case 'top-left':
        return { top: near, left: near };
      case 'top-right':
        return { top: near, right: near };
      case 'middle-left':
        return { top: half, left: near, transform: 'translateY(-50%)' };
      case 'middle-right':
        return { top: half, right: near, transform: 'translateY(-50%)' };
      case 'bottom-left':
        return { bottom: near, left: near };
      case 'bottom-right':
        return { bottom: near, right: near };
      default:
        return {};
    }
  };

  return (
    <>
      {positions.map((position, index) => (
        <div
          key={`${position}-${index}`}
          className="absolute rounded-full"
          style={{
            width: dotSize,
            height: dotSize,
            background: 'radial-gradient(circle at 30% 30%, #dc2626 0%, #991b1b 100%)',
            boxShadow: `
              0 1px 2px rgba(0,0,0,0.4),
              inset 0 0.5px 1px rgba(255,255,255,0.3),
              inset 0 -0.5px 1px rgba(0,0,0,0.3)
            `,
            ...getDotPosition(position),
          }}
        />
      ))}
    </>
  );
}
