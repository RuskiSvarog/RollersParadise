import { motion } from 'motion/react';

// Realistic 3D Casino Chip
export function RealisticChip({ value, color, index }: { value: string; color: string; index: number }) {
  const chipColors = {
    red: { main: '#DC2626', light: '#EF4444', dark: '#991B1B', edge: '#7F1D1D' },
    blue: { main: '#2563EB', light: '#3B82F6', dark: '#1E40AF', edge: '#1E3A8A' },
    green: { main: '#16A34A', light: '#22C55E', dark: '#15803D', edge: '#166534' },
    black: { main: '#1F2937', light: '#374151', dark: '#111827', edge: '#030712' },
    purple: { main: '#9333EA', light: '#A855F7', dark: '#7E22CE', edge: '#6B21A8' },
  };

  const chipColor = chipColors[color as keyof typeof chipColors] || chipColors.red;

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${5 + index * 10}%`,
        top: `${20 + (index % 3) * 25}%`,
      }}
      animate={{
        y: [0, -40, 0],
        rotate: [0, 360],
        opacity: [0.15, 0.25, 0.15],
      }}
      transition={{
        duration: 10,
        delay: index * 0.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className="relative w-16 h-16">
        {/* Chip base with 3D effect */}
        <div 
          className="absolute inset-0 rounded-full shadow-2xl"
          style={{
            background: `linear-gradient(135deg, ${chipColor.light} 0%, ${chipColor.main} 50%, ${chipColor.dark} 100%)`,
            boxShadow: `0 8px 16px rgba(0,0,0,0.4), inset 0 2px 4px ${chipColor.light}, inset 0 -2px 4px ${chipColor.dark}`,
          }}
        >
          {/* Outer ring pattern */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            {/* Edge segments for casino chip pattern */}
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-full h-full"
                style={{
                  transform: `rotate(${i * 22.5}deg)`,
                }}
              >
                <div 
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-3 rounded-b"
                  style={{ background: i % 2 === 0 ? '#FFFFFF' : chipColor.edge }}
                />
              </div>
            ))}
          </div>

          {/* Inner circle */}
          <div 
            className="absolute inset-3 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, ${chipColor.light} 0%, ${chipColor.main} 100%)`,
              boxShadow: `0 2px 8px rgba(0,0,0,0.3), inset 0 1px 2px ${chipColor.light}`,
            }}
          >
            {/* Center decoration - concentric circles */}
            <div 
              className="absolute inset-1 rounded-full border-2"
              style={{ borderColor: '#FFFFFF40' }}
            />
            <div 
              className="absolute inset-2 rounded-full border"
              style={{ borderColor: '#FFFFFF60' }}
            />
            
            {/* Value text */}
            <div className="relative z-10 text-white font-black text-sm drop-shadow-lg">
              {value}
            </div>
          </div>

          {/* Shine/gloss effect */}
          <div 
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
            }}
          />
        </div>

        {/* Shadow beneath chip */}
        <div 
          className="absolute top-full left-1/2 -translate-x-1/2 w-12 h-2 rounded-full blur-sm opacity-40"
          style={{ background: chipColor.dark }}
        />
      </div>
    </motion.div>
  );
}

// Realistic 3D Die
export function RealisticDie({ value, index }: { value: number; index: number }) {
  // Dot positions for each die face
  const dotPatterns: Record<number, Array<{ row: number; col: number }>> = {
    1: [{ row: 1, col: 1 }],
    2: [{ row: 0, col: 0 }, { row: 2, col: 2 }],
    3: [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 2 }],
    4: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 2 }],
    5: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 1 }, { row: 2, col: 0 }, { row: 2, col: 2 }],
    6: [{ row: 0, col: 0 }, { row: 0, col: 2 }, { row: 1, col: 0 }, { row: 1, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 2 }],
  };

  // Render a die face with dots
  const DiceFace = ({ faceValue }: { faceValue: number }) => {
    const dots = dotPatterns[faceValue] || dotPatterns[1];
    
    return (
      <div 
        className="absolute inset-0 rounded-lg"
        style={{
          background: 'linear-gradient(145deg, #FFFFFF 0%, #F3F4F6 50%, #E5E7EB 100%)',
          boxShadow: `
            inset 0 2px 4px rgba(255,255,255,0.8),
            inset 0 -2px 4px rgba(0,0,0,0.1)
          `,
        }}
      >
        {/* Die face with dots */}
        <div className="absolute inset-2 grid grid-cols-3 grid-rows-3 gap-1 p-2">
          {Array.from({ length: 9 }).map((_, i) => {
            const row = Math.floor(i / 3);
            const col = i % 3;
            const hasDot = dots.some(d => d.row === row && d.col === col);
            
            return (
              <div key={i} className="flex items-center justify-center">
                {hasDot && (
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, #DC2626, #991B1B)',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Shine effect */}
        <div 
          className="absolute inset-0 rounded-lg pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 40%, rgba(0,0,0,0.1) 100%)',
          }}
        />

        {/* Edge highlights for 3D effect */}
        <div className="absolute inset-0 rounded-lg border border-gray-300" />
      </div>
    );
  };

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${15 + index * 18}%`,
        top: `${15 + (index % 4) * 20}%`,
      }}
      animate={{
        y: [0, -60, 0],
        opacity: [0.1, 0.2, 0.1],
      }}
      transition={{
        duration: 8 + index,
        delay: index * 0.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <div className="relative w-20 h-20" style={{ perspective: '1000px' }}>
        {/* 3D Cube Container */}
        <motion.div
          className="relative w-full h-full"
          style={{
            transformStyle: 'preserve-3d',
          }}
          animate={{
            rotateX: [0, 360],
            rotateY: [0, 360],
            rotateZ: [0, 360],
          }}
          transition={{
            duration: 8 + index * 2,
            delay: index * 0.3,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {/* Front face - 1 */}
          <div
            className="absolute w-20 h-20"
            style={{
              transform: 'rotateY(0deg) translateZ(40px)',
              transformStyle: 'preserve-3d',
            }}
          >
            <DiceFace faceValue={1} />
          </div>

          {/* Back face - 6 */}
          <div
            className="absolute w-20 h-20"
            style={{
              transform: 'rotateY(180deg) translateZ(40px)',
              transformStyle: 'preserve-3d',
            }}
          >
            <DiceFace faceValue={6} />
          </div>

          {/* Right face - 2 */}
          <div
            className="absolute w-20 h-20"
            style={{
              transform: 'rotateY(90deg) translateZ(40px)',
              transformStyle: 'preserve-3d',
            }}
          >
            <DiceFace faceValue={2} />
          </div>

          {/* Left face - 5 */}
          <div
            className="absolute w-20 h-20"
            style={{
              transform: 'rotateY(-90deg) translateZ(40px)',
              transformStyle: 'preserve-3d',
            }}
          >
            <DiceFace faceValue={5} />
          </div>

          {/* Top face - 3 */}
          <div
            className="absolute w-20 h-20"
            style={{
              transform: 'rotateX(90deg) translateZ(40px)',
              transformStyle: 'preserve-3d',
            }}
          >
            <DiceFace faceValue={3} />
          </div>

          {/* Bottom face - 4 */}
          <div
            className="absolute w-20 h-20"
            style={{
              transform: 'rotateX(-90deg) translateZ(40px)',
              transformStyle: 'preserve-3d',
            }}
          >
            <DiceFace faceValue={4} />
          </div>
        </motion.div>

        {/* Shadow beneath die */}
        <div 
          className="absolute top-full left-1/2 -translate-x-1/2 w-16 h-3 rounded-full blur-md"
          style={{
            background: 'radial-gradient(ellipse, rgba(0,0,0,0.4) 0%, transparent 70%)',
          }}
        />
      </div>
    </motion.div>
  );
}

// Floating Chips Component (replaces old chips)
export function FloatingChips() {
  const chips = [
    { value: '$100', color: 'black' },
    { value: '$50', color: 'purple' },
    { value: '$10', color: 'blue' },
    { value: '$5', color: 'red' },
    { value: '$100', color: 'black' },
    { value: '$50', color: 'purple' },
    { value: '$10', color: 'blue' },
    { value: '$5', color: 'red' },
    { value: '$100', color: 'black' },
    { value: '$50', color: 'purple' },
    { value: '$10', color: 'blue' },
    { value: '$5', color: 'red' },
    { value: '$100', color: 'black' },
    { value: '$50', color: 'purple' },
    { value: '$10', color: 'blue' },
  ];

  return (
    <>
      {chips.map((chip, i) => (
        <RealisticChip key={`chip-${i}`} value={chip.value} color={chip.color} index={i} />
      ))}
    </>
  );
}

// Floating Dice Component (replaces old dice)
export function FloatingDice() {
  return (
    <>
      {[1, 2, 3, 4, 5, 6, 1, 2].map((value, i) => (
        <RealisticDie key={`die-${i}`} value={value} index={i} />
      ))}
    </>
  );
}