import { useEffect, useState } from 'react';
import { Maximize2, Minimize2 } from './Icons';
import { useSettings } from '../contexts/SettingsContext';

interface AnimatedDiceRollProps {
  dice1: number;
  dice2: number;
  isRolling: boolean;
  onRoll?: () => void;
  totalBet?: number;
  minBet?: number;
}

export function AnimatedDiceRoll({ dice1, dice2, isRolling, onRoll, totalBet = 0, minBet = 5 }: AnimatedDiceRollProps) {
  const { settings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);

  const canRoll = totalBet >= minBet;
  const rollButtonText = 'ROLL DICE';

  return (
    <>
      {/* Small version - top right */}
      {!isExpanded && (
        <div
          className="fixed top-24 right-4 z-40 cursor-pointer animate-in fade-in zoom-in-95 duration-300"
          onClick={() => setIsExpanded(true)}
        >
          <DiceContainer 
            dice1={dice1} 
            dice2={dice2} 
            isRolling={isRolling} 
            size="small"
          />
          <button className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white p-1.5 rounded-full transition-colors z-10">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Expanded version - center screen */}
      {isExpanded && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 z-50 animate-in fade-in duration-200"
            onClick={() => setIsExpanded(false)}
          />
          
          {/* Expanded dice */}
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-in zoom-in-95 fade-in duration-300"
          >
              <DiceContainer 
                dice1={dice1} 
                dice2={dice2} 
                isRolling={isRolling} 
                size="large"
              />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(false);
                }}
                className="absolute top-4 right-4 bg-black/70 hover:bg-black/90 text-white p-2 rounded-full transition-colors z-10"
              >
                <Minimize2 className="w-6 h-6" />
              </button>
              
              {/* Roll button in expanded view */}
              {onRoll && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (canRoll && !isRolling) {
                      onRoll();
                    }
                  }}
                  disabled={!canRoll || isRolling}
                  className="absolute -bottom-20 left-1/2 -translate-x-1/2 px-12 py-4 rounded-lg transition-colors border-2 shadow-lg bg-gradient-to-b from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 border-green-700 text-white disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed font-bold"
                >
                  <div className="text-2xl">{rollButtonText}</div>
                  {totalBet > 0 && <div className="text-sm">TOTAL BET: ${totalBet}</div>}
                  {totalBet < minBet && <div className="text-xs opacity-80">Min ${minBet}</div>}
                </button>
              )}
            </div>
          </>
        )}
    </>
  );
}

interface DiceContainerProps {
  dice1: number;
  dice2: number;
  isRolling: boolean;
  size: 'small' | 'large';
}

function DiceContainer({ dice1, dice2, isRolling, size }: DiceContainerProps) {
  const isSmall = size === 'small';
  const containerSize = isSmall ? 'w-80 h-80' : 'w-[900px] h-[700px]';
  const labelSize = isSmall ? 'text-xs px-3 py-1' : 'text-xl px-10 py-4';
  const diceGap = isSmall ? 'gap-12' : 'gap-32';
  const borderWidth = isSmall ? 'border-4' : 'border-8';

  return (
    <div className={`relative ${containerSize} transition-all duration-300`}>
      {/* Outer Bezel - Casino Machine Frame */}
      <div className={`relative w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl ${borderWidth} border-gray-700 shadow-2xl ${isSmall ? 'p-6' : 'p-12'}`}>
        
        {/* Machine Label */}
        <div className={`absolute -top-5 left-1/2 -translate-x-1/2 bg-yellow-500 ${labelSize} rounded-full border-4 border-yellow-600 shadow-lg z-10 font-bold`}>
          <div className="text-black">ELECTRONIC DICE</div>
        </div>

        {/* Dice Stage */}
        <div 
          className="relative w-full h-full bg-gradient-to-br from-green-700 via-green-600 to-green-800 rounded-3xl shadow-inner overflow-visible"
          style={{
            boxShadow: 'inset 0 10px 20px rgba(0,0,0,0.6), inset 0 -10px 20px rgba(255,255,255,0.1)'
          }}
        >
          {/* Felt texture */}
          <div className="absolute inset-0 opacity-40" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0,0,0,.2) 3px, rgba(0,0,0,.2) 6px)'
          }} />

          {/* DICE AREA */}
          <div className={`absolute inset-0 flex items-center justify-center ${diceGap}`}>
            <MegaDice value={dice1} isRolling={isRolling} size={size} delay={0} />
            <MegaDice value={dice2} isRolling={isRolling} size={size} delay={0.2} />
          </div>
        </div>

        {/* Rolling glow effect */}
        {isRolling && (
          <div
            className="absolute inset-0 rounded-3xl pointer-events-none animate-pulse"
            style={{
              boxShadow: '0 0 60px rgba(59, 130, 246, 0.5)',
            }}
          />
        )}
      </div>
    </div>
  );
}

interface MegaDiceProps {
  value: number;
  isRolling: boolean;
  size: 'small' | 'large';
  delay: number;
}

function MegaDice({ value, isRolling, size, delay }: MegaDiceProps) {
  const [rotX, setRotX] = useState(-20);
  const [rotY, setRotY] = useState(-25);
  const [rotZ, setRotZ] = useState(0);
  
  const diceSize = size === 'small' ? 100 : 200;

  useEffect(() => {
    if (isRolling) {
      // SLOW continuous spinning - you can SEE each face!
      const interval = setInterval(() => {
        setRotX(prev => prev + 30);
        setRotY(prev => prev + 40);
        setRotZ(prev => prev + 20);
      }, 150); // SLOW - 150ms between updates
      
      return () => clearInterval(interval);
    } else {
      // Final position
      const final = getFinalRotation(value);
      setRotX(final.x);
      setRotY(final.y);
      setRotZ(final.z);
    }
  }, [isRolling, value]);

  return (
    <div
      style={{
        perspective: '1000px',
        width: diceSize,
        height: diceSize,
      }}
    >
      <div
        className={isRolling ? 'animate-bounce' : ''}
        style={{
          transform: `translateY(0px) scale(1)`,
          transition: isRolling ? 'none' : 'all 0.6s ease-out',
          transitionDelay: `${delay}s`,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            transformStyle: 'preserve-3d',
            position: 'relative',
            transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`,
            transition: isRolling ? 'transform 0.15s linear' : 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* All 6 faces with GIANT NUMBERS during rolling! */}
          <Face num={1} position="front" size={diceSize} isRolling={isRolling} />
          <Face num={6} position="back" size={diceSize} isRolling={isRolling} />
          <Face num={3} position="right" size={diceSize} isRolling={isRolling} />
          <Face num={4} position="left" size={diceSize} isRolling={isRolling} />
          <Face num={5} position="top" size={diceSize} isRolling={isRolling} />
          <Face num={2} position="bottom" size={diceSize} isRolling={isRolling} />
        </div>
      </div>
    </div>
  );
}

function Face({ num, position, size, isRolling }: { num: number; position: string; size: number; isRolling: boolean }) {
  const offset = size / 2;
  
  const transforms: { [key: string]: string } = {
    front: `rotateY(0deg) translateZ(${offset}px)`,
    back: `rotateY(180deg) translateZ(${offset}px)`,
    right: `rotateY(90deg) translateZ(${offset}px)`,
    left: `rotateY(-90deg) translateZ(${offset}px)`,
    top: `rotateX(90deg) translateZ(${offset}px)`,
    bottom: `rotateX(-90deg) translateZ(${offset}px)`,
  };

  return (
    <div
      style={{
        position: 'absolute',
        width: size,
        height: size,
        transform: transforms[position],
        background: 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
        border: '4px solid #222',
        borderRadius: size * 0.1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 0 30px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.4)',
        backfaceVisibility: 'visible',
      }}
    >
      {/* SHOW GIANT NUMBER when rolling, dots when stopped */}
      {isRolling ? (
        <div style={{
          fontSize: size * 0.6,
          fontWeight: 'bold',
          color: '#000',
          textShadow: '0 4px 8px rgba(0,0,0,0.3)',
        }}>
          {num}
        </div>
      ) : (
        <DiceDots count={num} size={size} />
      )}
    </div>
  );
}

function DiceDots({ count, size }: { count: number; size: number }) {
  const dotSize = size * 0.18;
  
  const positions: { [key: number]: Array<[number, number]> } = {
    1: [[50, 50]],
    2: [[30, 30], [70, 70]],
    3: [[30, 30], [50, 50], [70, 70]],
    4: [[30, 30], [70, 30], [30, 70], [70, 70]],
    5: [[30, 30], [70, 30], [50, 50], [30, 70], [70, 70]],
    6: [[30, 30], [70, 30], [30, 50], [70, 50], [30, 70], [70, 70]],
  };

  return (
    <>
      {positions[count]?.map(([x, y], i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            width: dotSize,
            height: dotSize,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #2a2a2a, #000000)',
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 3px 6px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(255,255,255,0.2)',
          }}
        />
      ))}
    </>
  );
}

function getFinalRotation(value: number) {
  const rotations: { [key: number]: { x: number; y: number; z: number } } = {
    1: { x: -20, y: -25, z: 0 },
    2: { x: -110, y: -25, z: 0 },
    3: { x: -20, y: 65, z: 0 },
    4: { x: -20, y: -115, z: 0 },
    5: { x: 70, y: -25, z: 0 },
    6: { x: 160, y: -25, z: 0 },
  };
  return rotations[value] || { x: -20, y: -25, z: 0 };
}
