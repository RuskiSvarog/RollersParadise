import { Dice3D } from './Dice3D';

interface DiceRollerProps {
  lastRoll: [number, number] | null;
  onRoll: () => void;
  isRolling: boolean;
  disabled: boolean;
}

export function DiceRoller({ lastRoll, onRoll, isRolling, disabled }: DiceRollerProps) {
  const dice1Value = lastRoll ? lastRoll[0] : 1;
  const dice2Value = lastRoll ? lastRoll[1] : 1;

  return (
    <div className="flex flex-col items-center gap-8">
      {/* 3D Dice Display */}
      <div className="flex gap-24 items-center">
        <Dice3D value={dice1Value} isRolling={isRolling} diceIndex={0} />
        <Dice3D value={dice2Value} isRolling={isRolling} diceIndex={1} />
      </div>
      
      {/* Roll Result Display */}
      {lastRoll && !isRolling && (
        <div className="text-center">
          <div 
            className="text-3xl font-bold mb-1"
            style={{ 
              color: '#fbbf24',
              textShadow: '0 0 20px rgba(251, 191, 36, 0.8), 0 2px 4px rgba(0, 0, 0, 0.8)',
            }}
          >
            {lastRoll[0]} + {lastRoll[1]} = {lastRoll[0] + lastRoll[1]}
          </div>
          <div className="text-sm text-gray-300">
            {lastRoll[0] + lastRoll[1] === 7 ? '🎯 Lucky Seven!' : 
             lastRoll[0] === lastRoll[1] ? '🎲 Hard Way!' : ''}
          </div>
        </div>
      )}

      {/* Roll Button */}
      <button
        onClick={onRoll}
        disabled={isRolling || disabled}
        className="relative group px-8 py-4 rounded-xl font-bold text-xl uppercase tracking-wider transition-all duration-300 border-2 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: isRolling || disabled
            ? 'linear-gradient(135deg, #4b5563 0%, #374151 100%)'
            : 'linear-gradient(135deg, #dc2626 0%, #991b1b 50%, #7f1d1d 100%)',
          borderColor: isRolling || disabled ? '#6b7280' : '#fbbf24',
          color: '#fff',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
          boxShadow: isRolling || disabled
            ? '0 4px 12px rgba(0, 0, 0, 0.3)'
            : '0 0 30px rgba(220, 38, 38, 0.6), 0 6px 20px rgba(0, 0, 0, 0.5)',
        }}
      >
        {isRolling && (
          <div 
            className="absolute inset-0 rounded-xl opacity-50"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(251, 191, 36, 0.3), transparent)',
              animation: 'shine 1.5s infinite',
            }}
          />
        )}
        <span className="relative z-10">
          {isRolling ? '🎲 Rolling...' : '🎲 Roll Dice'}
        </span>
      </button>

      <style>{`
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
