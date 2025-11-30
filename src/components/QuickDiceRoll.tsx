import { useEffect, useState } from 'react';
import { useSounds } from '../contexts/SoundContext';

interface QuickDiceRollProps {
  dice1: number;
  dice2: number;
  isRolling: boolean;
}

export function QuickDiceRoll({ dice1, dice2, isRolling }: QuickDiceRollProps) {
  const [showResult, setShowResult] = useState(false);
  const [displayDice1, setDisplayDice1] = useState(dice1);
  const [displayDice2, setDisplayDice2] = useState(dice2);
  const [randomDice1, setRandomDice1] = useState(1);
  const [randomDice2, setRandomDice2] = useState(2);
  const { playDiceRoll, playDieLock } = useSounds();

  useEffect(() => {
    if (isRolling) {
      setShowResult(false);
      setDisplayDice1(dice1);
      setDisplayDice2(dice2);
      
      // Play dice sound
      playDiceRoll();
      
      // Quick random dice tumble animation
      const interval = setInterval(() => {
        setRandomDice1(Math.floor(Math.random() * 6) + 1);
        setRandomDice2(Math.floor(Math.random() * 6) + 1);
      }, 100);
      
      // Show final result after 1.2 seconds
      setTimeout(() => {
        clearInterval(interval);
        setRandomDice1(dice1);
        setRandomDice2(dice2);
        playDieLock();
        setShowResult(true);
      }, 1200);
      
      return () => clearInterval(interval);
    }
  }, [isRolling, dice1, dice2, playDiceRoll, playDieLock]);

  useEffect(() => {
    if (showResult) {
      const timer = setTimeout(() => setShowResult(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showResult]);

  if (!isRolling && !showResult) {
    return null;
  }

  const total = displayDice1 + displayDice2;
  const currentDice1 = isRolling && !showResult ? randomDice1 : displayDice1;
  const currentDice2 = isRolling && !showResult ? randomDice2 : displayDice2;

  return (
    <>
      {(isRolling || showResult) && (
        <div
          className="fixed top-32 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in slide-in-from-top-12 duration-300"
        >
          {/* Dice Container */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 border-4 border-yellow-500/50 shadow-2xl"
            style={{
              boxShadow: '0 0 50px rgba(234, 179, 8, 0.3), 0 20px 60px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Rolling/Result Label */}
            <div
              className={`text-center mb-4 ${isRolling && !showResult ? 'animate-pulse' : ''}`}
            >
              <div className="text-yellow-400 font-bold tracking-wider"
                style={{
                  textShadow: '0 0 20px rgba(250, 204, 21, 0.8)',
                }}
              >
                {isRolling && !showResult ? 'ROLLING...' : 'RESULT'}
              </div>
            </div>

            {/* Dice Display */}
            <div className="flex gap-6 items-center justify-center">
              {/* Die 1 */}
              <div
                className={isRolling && !showResult ? 'animate-spin' : ''}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Die value={currentDice1} />
              </div>

              {/* Plus sign */}
              <div className="text-white text-5xl font-bold opacity-50">+</div>

              {/* Die 2 */}
              <div
                className={isRolling && !showResult ? 'animate-spin' : ''}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <Die value={currentDice2} />
              </div>

              {/* Equals and Total */}
              {showResult && (
                <div className="flex items-center gap-4 animate-in zoom-in duration-300">
                  <div className="text-white text-5xl font-bold opacity-50">=</div>
                  <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-6 border-4 border-yellow-500 min-w-[100px] flex items-center justify-center"
                    style={{
                      boxShadow: '0 0 30px rgba(250, 204, 21, 0.6)',
                    }}
                  >
                    <div
                      className="text-white text-6xl font-bold animate-in zoom-in duration-200 delay-100"
                      style={{
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
                      }}
                    >
                      {total}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sparkle effects on result */}
          {showResult && (
            <>
              {[...Array(12)].map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const distance = 120;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                
                return (
                  <div
                    key={i}
                    className="absolute w-3 h-3 rounded-full bg-yellow-400 animate-ping"
                    style={{
                      left: '50%',
                      top: '50%',
                      transform: `translate(${x}px, ${y}px)`,
                      boxShadow: '0 0 10px #facc15',
                      animationDelay: `${i * 30}ms`,
                      animationDuration: '1s',
                    }}
                  />
                );
              })}
            </>
          )}
        </div>
      )}
    </>
  );
}

function Die({ value }: { value: number }) {
  const getDots = () => {
    const dotConfigs: { [key: number]: Array<{ x: number; y: number }> } = {
      1: [{ x: 50, y: 50 }],
      2: [{ x: 30, y: 30 }, { x: 70, y: 70 }],
      3: [{ x: 30, y: 30 }, { x: 50, y: 50 }, { x: 70, y: 70 }],
      4: [{ x: 30, y: 30 }, { x: 70, y: 30 }, { x: 30, y: 70 }, { x: 70, y: 70 }],
      5: [{ x: 30, y: 30 }, { x: 70, y: 30 }, { x: 50, y: 50 }, { x: 30, y: 70 }, { x: 70, y: 70 }],
      6: [{ x: 30, y: 25 }, { x: 70, y: 25 }, { x: 30, y: 50 }, { x: 70, y: 50 }, { x: 30, y: 75 }, { x: 70, y: 75 }],
    };

    return dotConfigs[value]?.map((pos, i) => (
      <div
        key={i}
        className="absolute bg-black rounded-full"
        style={{
          width: '18px',
          height: '18px',
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: 'translate(-50%, -50%)',
          boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.5)',
        }}
      />
    ));
  };

  return (
    <div
      className="relative rounded-2xl bg-gradient-to-br from-white to-gray-100 border-3 border-gray-300"
      style={{
        width: '120px',
        height: '120px',
        boxShadow: '0 8px 20px rgba(0, 0, 0, 0.4), inset 0 2px 5px rgba(255, 255, 255, 0.7)',
      }}
    >
      {getDots()}
    </div>
  );
}
