import { useState, useEffect } from 'react';

interface ElectronicDiceBoxProps {
  dice1: number;
  dice2: number;
  isRolling: boolean;
  buttonsLocked?: boolean;
  onRoll: () => void;
  canRoll: boolean;
  size?: 'large' | 'compact';
  totalBet?: number;
  minBet?: number;
}

export function ElectronicDiceBox({ dice1, dice2, isRolling, buttonsLocked = false, onRoll, canRoll, size = 'large', totalBet = 0, minBet = 3 }: ElectronicDiceBoxProps) {
  const total = dice1 + dice2;
  const [animDice1, setAnimDice1] = useState(dice1);
  const [animDice2, setAnimDice2] = useState(dice2);
  const [showFinal, setShowFinal] = useState(true);
  const [displayTotal, setDisplayTotal] = useState(total);
  
  // Dimensions based on size - LARGER DICE FOR BETTER VISIBILITY
  const dimensions = size === 'compact' 
    ? { width: 100, height: 90, dieSize: 20 }
    : { width: 280, height: 240, dieSize: 80 };
  
  // Update display total immediately when dice values change
  useEffect(() => {
    if (!isRolling) {
      setDisplayTotal(dice1 + dice2);
    }
  }, [dice1, dice2, isRolling]);
  
  // Animate dice rolling with physics-based bouncing
  useEffect(() => {
    if (isRolling) {
      setShowFinal(false);
      let currentFrame = 0;
      const totalFrames = 67; // 4000ms / 60ms = ~67 frames
      
      const rollInterval = setInterval(() => {
        currentFrame++;
        
        // For the last 10 frames, gradually transition to final values
        if (currentFrame >= totalFrames - 10) {
          // Show final values for the last 10 frames (600ms)
          setAnimDice1(dice1);
          setAnimDice2(dice2);
          setDisplayTotal(dice1 + dice2);
        } else {
          // Random dice values while rolling
          const random1 = Math.floor(Math.random() * 6) + 1;
          const random2 = Math.floor(Math.random() * 6) + 1;
          setAnimDice1(random1);
          setAnimDice2(random2);
          setDisplayTotal(random1 + random2);
        }
      }, 60);
      
      // After 4 seconds, show final result
      const finalTimer = setTimeout(() => {
        clearInterval(rollInterval);
        setAnimDice1(dice1);
        setAnimDice2(dice2);
        setDisplayTotal(dice1 + dice2);
        setShowFinal(true);
      }, 4000);
      
      return () => {
        clearInterval(rollInterval);
        clearTimeout(finalTimer);
      };
    } else {
      setAnimDice1(dice1);
      setAnimDice2(dice2);
      setDisplayTotal(dice1 + dice2);
      setShowFinal(true);
    }
  }, [isRolling, dice1, dice2]);
  
  return (
    <div className={`flex flex-col items-center ${size === 'compact' ? 'gap-1' : 'gap-4'}`}>
      {/* Electronic Dice Box */}
      <button
        onClick={onRoll}
        disabled={!canRoll || isRolling || buttonsLocked}
        className={`relative transition-transform ${canRoll && !isRolling && !buttonsLocked ? 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]' : 'cursor-not-allowed'}`}
        style={{ width: `${dimensions.width}px`, height: `${dimensions.height}px` }}
      >
        {/* Glass Container - Rectangular Box */}
        <div 
          className="absolute inset-0 rounded-xl border-4 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(240, 245, 255, 0.15) 0%, rgba(220, 235, 255, 0.1) 50%, rgba(200, 225, 255, 0.15) 100%)',
            borderColor: 'rgba(255, 255, 255, 0.4)',
            boxShadow: `
              inset 0 -4px 8px rgba(255, 255, 255, 0.3),
              inset 0 4px 8px rgba(0, 0, 0, 0.1),
              0 8px 32px rgba(0, 0, 0, 0.4),
              0 0 40px rgba(100, 150, 255, 0.2)
            `,
            backdropFilter: 'blur(3px)',
          }}
        >
          {/* Glass Reflections */}
          <div 
            className="absolute top-0 left-0 right-1/2 bottom-1/2 opacity-40 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, transparent 60%)',
            }}
          />
          
          {/* Bottom surface - felt texture */}
          <div 
            className="absolute bottom-0 left-0 right-0 h-2"
            style={{
              background: 'linear-gradient(180deg, rgba(34, 139, 34, 0.3) 0%, rgba(34, 139, 34, 0.5) 100%)',
            }}
          />
          
          {/* Corner highlights for glass box effect */}
          {[
            { top: '4px', left: '4px' },
            { top: '4px', right: '4px' },
            { bottom: '4px', left: '4px' },
            { bottom: '4px', right: '4px' },
          ].map((pos, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full"
              style={{
                ...pos,
                background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%)',
              }}
            />
          ))}
        </div>
        
        {/* Dice Inside Box - WITH WALL BOUNCING PHYSICS */}
        <div className={`absolute ${size === 'compact' ? 'inset-2' : 'inset-4'} flex items-center justify-center ${size === 'compact' ? 'gap-1' : 'gap-3'}`}>
          {/* Die 1 - Complex bouncing with wall collisions */}
          <div
            key={`box-die1-${animDice1}-${isRolling ? 'rolling' : 'static'}`}
            className={isRolling ? 'animate-dice-roll-1' : 'transition-transform duration-300'}
            style={{ 
              transformStyle: 'preserve-3d',
              transform: !isRolling ? 'rotateZ(-12deg) translateX(-3px) translateY(10px)' : undefined
            }}
          >
            <ElectronicDie value={animDice1} size={dimensions.dieSize} />
          </div>
          
          {/* Die 2 - Different bounce pattern for variety */}
          <div
            key={`box-die2-${animDice2}-${isRolling ? 'rolling' : 'static'}`}
            className={isRolling ? 'animate-dice-roll-2' : 'transition-transform duration-300'}
            style={{ 
              transformStyle: 'preserve-3d',
              transform: !isRolling ? 'rotateZ(8deg) translateX(3px) translateY(10px)' : undefined
            }}
          >
            <ElectronicDie value={animDice2} size={dimensions.dieSize} />
          </div>
        </div>
        
        {/* Vibration Effect on Container During Roll */}
        {isRolling && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none animate-shake"
            style={{
              boxShadow: '0 0 30px 5px rgba(251, 191, 36, 0.5)',
              border: '2px solid rgba(251, 191, 36, 0.3)',
              borderRadius: '0.75rem',
            }}
          />
        )}
        
        {/* Pulsing Glow When Ready */}
        {canRoll && !isRolling && !buttonsLocked && (
          <div
            className="absolute inset-0 rounded-xl pointer-events-none animate-pulse"
            style={{
              boxShadow: '0 0 30px 5px rgba(34, 197, 94, 0.5)',
              animationDuration: '2s'
            }}
          />
        )}
        
        {/* Status Text Above Box - Only show for large size */}
        {size === 'large' && (
          <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            {canRoll && !isRolling && !buttonsLocked && (
              <div
                className="text-2xl font-bold px-6 py-3 rounded-2xl animate-bounce"
              style={{
                color: '#22c55e',
                textShadow: '0 0 20px rgba(34, 197, 94, 0.9), 0 2px 6px rgba(0, 0, 0, 1)',
                background: 'rgba(0, 0, 0, 0.85)',
                border: '3px solid rgba(34, 197, 94, 0.6)',
                boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)',
                animationDuration: '1.5s'
              }}
            >
              🎲 CLICK TO ROLL 🎲
            </div>
          )}
          
          {isRolling && (
            <div
              className="text-2xl font-bold px-6 py-3 rounded-2xl animate-pulse"
              style={{
                color: '#ef4444',
                textShadow: '0 0 20px rgba(239, 68, 68, 0.9), 0 2px 6px rgba(0, 0, 0, 1)',
                background: 'rgba(0, 0, 0, 0.85)',
                border: '3px solid rgba(239, 68, 68, 0.6)',
                boxShadow: '0 0 30px rgba(239, 68, 68, 0.4)',
                animationDuration: '0.5s'
              }}
            >
              🎲 ROLLING... 🎲
            </div>
          )}
          </div>
        )}
      </button>
      
      {/* Total Display Below Box - Only show for large size */}
      {size === 'large' && showFinal && !isRolling && (
        <div
          key={`box-total-${total}`}
          className="px-8 py-4 rounded-2xl border-4 animate-in zoom-in-110 fade-in slide-in-from-top-5 duration-400"
          style={{
            background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%)',
            borderColor: '#fbbf24',
            boxShadow: '0 0 30px rgba(251, 191, 36, 0.6), 0 8px 20px rgba(0, 0, 0, 0.6), inset 0 2px 10px rgba(251, 191, 36, 0.2)',
          }}
        >
          <div className="text-center">
            <div 
              className="text-sm font-bold mb-3 uppercase tracking-widest"
              style={{
                color: '#fde047',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 0 20px rgba(253, 224, 71, 0.6)',
              }}
            >
              FINAL RESULT
            </div>
            
            {/* Visual Dice Display */}
            <div className="flex justify-center gap-4 mb-3">
              <ResultDieFace value={animDice1} />
              <ResultDieFace value={animDice2} />
            </div>
            
            <div 
              className="text-6xl font-black leading-none mb-2"
              style={{
                color: '#fbbf24',
                textShadow: '0 0 30px rgba(251, 191, 36, 0.9), 0 4px 8px rgba(0, 0, 0, 0.9)',
              }}
            >
              {displayTotal}
            </div>
            <div 
              className="text-sm uppercase tracking-wide"
              style={{
                color: '#34d399',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.8), 0 0 15px rgba(52, 211, 153, 0.5)',
                fontWeight: 'bold',
              }}
            >
              {animDice1} + {animDice2} = {displayTotal}
            </div>
          </div>
        </div>
      )}
      
      {/* Compact Display - Shows dice total and bet info below compact dice box */}
      {size === 'compact' && (
        <div className="flex gap-2 items-center">
          {/* Dice Total */}
          {showFinal && !isRolling && (
            <div
              key={`compact-total-${total}`}
              className="px-3 py-1 rounded-lg border-2 animate-in zoom-in-110 fade-in duration-300"
              style={{
                background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)',
                borderColor: '#fbbf24',
                boxShadow: '0 0 15px rgba(251, 191, 36, 0.4), 0 2px 8px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div className="text-center">
                <div 
                  className="text-xl font-black leading-none"
                  style={{
                    color: '#fbbf24',
                    textShadow: '0 0 15px rgba(251, 191, 36, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)',
                  }}
                >
                  {displayTotal}
                </div>
                <div 
                  className="text-xs uppercase tracking-wide mt-0.5"
                  style={{
                    color: '#34d399',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                    fontWeight: 'bold',
                    fontSize: '0.65rem',
                  }}
                >
                  {animDice1} + {animDice2}
                </div>
              </div>
            </div>
          )}
          
          {/* Current Bet Display */}
          {totalBet !== undefined && totalBet > 0 && (
            <div
              className="px-3 py-1 rounded-lg border-2"
              style={{
                background: canRoll 
                  ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.2) 100%)'
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)',
                borderColor: canRoll ? '#22c55e' : '#ef4444',
                boxShadow: canRoll 
                  ? '0 0 15px rgba(34, 197, 94, 0.4), 0 2px 8px rgba(0, 0, 0, 0.5)'
                  : '0 0 15px rgba(239, 68, 68, 0.4), 0 2px 8px rgba(0, 0, 0, 0.5)',
              }}
            >
              <div className="text-center">
                <div 
                  className="text-xs uppercase tracking-wide font-bold"
                  style={{
                    color: canRoll ? '#4ade80' : '#f87171',
                    textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                    fontSize: '0.6rem',
                  }}
                >
                  BET
                </div>
                <div 
                  className="text-lg font-black leading-none"
                  style={{
                    color: canRoll ? '#22c55e' : '#ef4444',
                    textShadow: canRoll 
                      ? '0 0 15px rgba(34, 197, 94, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)'
                      : '0 0 15px rgba(239, 68, 68, 0.8), 0 2px 4px rgba(0, 0, 0, 0.9)',
                  }}
                >
                  ${totalBet}
                </div>
                {!canRoll && minBet && (
                  <div 
                    className="text-xs font-bold mt-0.5"
                    style={{
                      color: '#f87171',
                      textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
                      fontSize: '0.55rem',
                    }}
                  >
                    MIN ${minBet}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ElectronicDie({ value, size = 60 }: { value: number; size?: number }) {
  const isCompact = size === 20;
  const dotSize = isCompact ? 2 : 3;
  const dotOffset = isCompact ? 1 : 2;
  
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
      return (
        <div
          key={i}
          className={`absolute rounded-full`}
          style={{
            width: `${dotSize * (isCompact ? 2 : 4)}px`,
            height: `${dotSize * (isCompact ? 2 : 4)}px`,
            background: 'radial-gradient(circle at 30% 30%, #1a1a1a 0%, #000000 100%)',
            boxShadow: 'inset 0 -1px 2px rgba(0, 0, 0, 0.9)',
            ...(pos === 'top-left' && { top: `${dotOffset}px`, left: `${dotOffset}px` }),
            ...(pos === 'top-right' && { top: `${dotOffset}px`, right: `${dotOffset}px` }),
            ...(pos === 'middle-left' && { top: '50%', left: `${dotOffset}px`, transform: 'translateY(-50%)' }),
            ...(pos === 'middle-right' && { top: '50%', right: `${dotOffset}px`, transform: 'translateY(-50%)' }),
            ...(pos === 'bottom-left' && { bottom: `${dotOffset}px`, left: `${dotOffset}px` }),
            ...(pos === 'bottom-right' && { bottom: `${dotOffset}px`, right: `${dotOffset}px` }),
            ...(pos === 'center' && { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }),
          }}
        />
      );
    });
  };

  // Rotation to show correct face
  const rotations: Record<number, { x: number; y: number; z: number }> = {
    1: { x: 0, y: 0, z: 0 },
    2: { x: 0, y: -90, z: 0 },
    3: { x: 0, y: 0, z: -90 },
    4: { x: 0, y: 0, z: 90 },
    5: { x: 0, y: 90, z: 0 },
    6: { x: 0, y: 180, z: 0 },
  };

  const rotation = rotations[value];
  const faceSize = size / 2;
  const translateZ = size / 4;

  return (
    <div
      className="relative"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        transformStyle: 'preserve-3d',
        transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
      }}
    >
      {/* Face 1 - FRONT */}
      <div
        className="absolute rounded flex items-center justify-center"
        style={{
          width: `${faceSize}px`,
          height: `${faceSize}px`,
          background: 'linear-gradient(145deg, #ffffff 0%, #f5f5f5 50%, #e8e8e8 100%)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3), inset -1px -1px 2px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(255, 255, 255, 0.9)',
          border: '0.5px solid rgba(0, 0, 0, 0.1)',
          transform: `translateZ(${translateZ}px)`,
        }}
      >
        <div className="relative w-full h-full">{renderDots(1)}</div>
      </div>

      {/* Face 2 - RIGHT */}
      <div
        className="absolute rounded flex items-center justify-center"
        style={{
          width: `${faceSize}px`,
          height: `${faceSize}px`,
          background: 'linear-gradient(145deg, #fafafa 0%, #efefef 50%, #e0e0e0 100%)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3), inset -1px -1px 2px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(255, 255, 255, 0.9)',
          border: '0.5px solid rgba(0, 0, 0, 0.1)',
          transform: `rotateY(90deg) translateZ(${translateZ}px)`,
        }}
      >
        <div className="relative w-full h-full">{renderDots(2)}</div>
      </div>

      {/* Face 3 - TOP */}
      <div
        className="absolute rounded flex items-center justify-center"
        style={{
          width: `${faceSize}px`,
          height: `${faceSize}px`,
          background: 'linear-gradient(145deg, #ffffff 0%, #f3f3f3 50%, #e5e5e5 100%)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3), inset -1px -1px 2px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(255, 255, 255, 0.9)',
          border: '0.5px solid rgba(0, 0, 0, 0.1)',
          transform: `rotateX(90deg) translateZ(${translateZ}px)`,
        }}
      >
        <div className="relative w-full h-full">{renderDots(3)}</div>
      </div>

      {/* Face 4 - BOTTOM */}
      <div
        className="absolute rounded flex items-center justify-center"
        style={{
          width: `${faceSize}px`,
          height: `${faceSize}px`,
          background: 'linear-gradient(145deg, #f5f5f5 0%, #e8e8e8 50%, #d8d8d8 100%)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3), inset -1px -1px 2px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(255, 255, 255, 0.9)',
          border: '0.5px solid rgba(0, 0, 0, 0.1)',
          transform: `rotateX(-90deg) translateZ(${translateZ}px)`,
        }}
      >
        <div className="relative w-full h-full">{renderDots(4)}</div>
      </div>

      {/* Face 5 - LEFT */}
      <div
        className="absolute rounded flex items-center justify-center"
        style={{
          width: `${faceSize}px`,
          height: `${faceSize}px`,
          background: 'linear-gradient(145deg, #fafafa 0%, #efefef 50%, #e0e0e0 100%)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3), inset -1px -1px 2px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(255, 255, 255, 0.9)',
          border: '0.5px solid rgba(0, 0, 0, 0.1)',
          transform: `rotateY(-90deg) translateZ(${translateZ}px)`,
        }}
      >
        <div className="relative w-full h-full">{renderDots(5)}</div>
      </div>

      {/* Face 6 - BACK */}
      <div
        className="absolute rounded flex items-center justify-center"
        style={{
          width: `${faceSize}px`,
          height: `${faceSize}px`,
          background: 'linear-gradient(145deg, #f8f8f8 0%, #ebebeb 50%, #dadada 100%)',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3), inset -1px -1px 2px rgba(0, 0, 0, 0.1), inset 1px 1px 2px rgba(255, 255, 255, 0.9)',
          border: '0.5px solid rgba(0, 0, 0, 0.1)',
          transform: `rotateY(180deg) translateZ(${translateZ}px)`,
        }}
      >
        <div className="relative w-full h-full">{renderDots(6)}</div>
      </div>

      {/* Glossy overlay */}
      <div
        className="absolute inset-0 rounded pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 50%, rgba(0, 0, 0, 0.08) 100%)',
          transform: `translateZ(${translateZ + 0.5}px)`,
        }}
      />
    </div>
  );
}

// Result Die Face - 2D static dice for final result display
function ResultDieFace({ value }: { value: number }) {
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
        'top-left': 'top-2 left-2',
        'top-right': 'top-2 right-2',
        'middle-left': 'top-1/2 left-2 -translate-y-1/2',
        'middle-right': 'top-1/2 right-2 -translate-y-1/2',
        'bottom-left': 'bottom-2 left-2',
        'bottom-right': 'bottom-2 right-2',
        'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
      };

      return (
        <div
          key={i}
          className={`absolute rounded-full ${positionClasses[pos]}`}
          style={{
            width: '8px',
            height: '8px',
            background: 'radial-gradient(circle at 30% 30%, #1a1a1a 0%, #000000 100%)',
            boxShadow: 'inset 0 -1px 2px rgba(0, 0, 0, 0.9)',
          }}
        />
      );
    });
  };

  return (
    <div
      className="relative rounded-lg"
      style={{
        width: '50px',
        height: '50px',
        background: 'linear-gradient(145deg, #ffffff 0%, #f0f0f0 100%)',
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3), inset 0 2px 4px rgba(255, 255, 255, 0.8)',
        border: '2px solid rgba(200, 200, 200, 0.8)',
      }}
    >
      {renderDots(value)}
    </div>
  );
}