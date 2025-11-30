import { motion } from 'motion/react';

interface HomePageDiceProps {
  value?: number;
  size?: number;
}

export function HomePageDice({ value = 5, size = 80 }: HomePageDiceProps) {
  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      animate={{
        rotateX: [0, 5, 0, -5, 0],
        rotateY: [0, 5, 0, -5, 0],
      }}
      transition={{
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {/* Main die container with 3D perspective */}
      <div 
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
          transform: 'rotateX(-20deg) rotateY(-25deg)',
        }}
      >
        {/* Die body with realistic gradient */}
        <div 
          className="absolute inset-0 rounded-xl"
          style={{
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f8f8 40%, #e8e8e8 100%)',
            boxShadow: `
              0 8px 24px rgba(0,0,0,0.3),
              0 2px 8px rgba(0,0,0,0.2),
              inset 0 2px 4px rgba(255,255,255,0.9),
              inset 0 -2px 4px rgba(0,0,0,0.15)
            `,
            border: '2px solid rgba(255,255,255,0.8)',
          }}
        >
          {/* Top shine/highlight */}
          <div 
            className="absolute top-2 left-2 right-8 h-4 rounded-full opacity-60 blur-md"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)',
            }}
          />
          
          {/* Dice dots/pips */}
          <div className="absolute inset-0 flex items-center justify-center p-3">
            <DiceDots number={value} size={size} />
          </div>
          
          {/* Bottom shadow internal */}
          <div 
            className="absolute bottom-0 left-2 right-2 h-3 rounded-full opacity-20 blur-sm"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 100%)',
            }}
          />
        </div>
        
        {/* Right side face (3D depth effect) */}
        <div 
          className="absolute top-0 right-0 rounded-r-xl"
          style={{
            width: '12px',
            height: '100%',
            background: 'linear-gradient(90deg, rgba(200,200,200,0.6) 0%, rgba(160,160,160,0.8) 100%)',
            transform: 'translateX(12px) rotateY(90deg)',
            transformOrigin: 'left center',
            boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.3)',
          }}
        />
        
        {/* Bottom face (3D depth effect) */}
        <div 
          className="absolute bottom-0 left-0 rounded-b-xl"
          style={{
            width: '100%',
            height: '12px',
            background: 'linear-gradient(180deg, rgba(180,180,180,0.7) 0%, rgba(140,140,140,0.9) 100%)',
            transform: 'translateY(12px) rotateX(-90deg)',
            transformOrigin: 'top center',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.4)',
          }}
        />
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

function DiceDots({ number, size }: { number: number; size: number }) {
  const dotPositions = {
    1: ['center'],
    2: ['top-left', 'bottom-right'],
    3: ['top-left', 'center', 'bottom-right'],
    4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
    5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
    6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right'],
  };

  const positions = dotPositions[number as keyof typeof dotPositions] || [];
  
  // Scale dot size based on die size
  const dotSize = Math.max(6, size * 0.12);
  const spacing = size * 0.18;

  const getDotPosition = (position: string) => {
    const half = '50%';
    const near = `${spacing}px`;
    const far = `calc(100% - ${spacing}px)`;
    
    switch (position) {
      case 'top-left':
        return { top: near, left: near };
      case 'top-right':
        return { top: near, right: near };
      case 'middle-left':
        return { top: half, left: near, transform: 'translateY(-50%)' };
      case 'middle-right':
        return { top: half, right: near, transform: 'translateY(-50%)' };
      case 'center':
        return { top: half, left: half, transform: 'translate(-50%, -50%)' };
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
              0 1px 3px rgba(0,0,0,0.4),
              inset 0 1px 1px rgba(255,255,255,0.3),
              inset 0 -1px 1px rgba(0,0,0,0.3)
            `,
            ...getDotPosition(position),
          }}
        />
      ))}
    </>
  );
}
