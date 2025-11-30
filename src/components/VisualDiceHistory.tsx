interface VisualDiceHistoryProps {
  rollHistory: Array<{ dice1: number; dice2: number; total: number; wasSevenOut?: boolean; phase?: string; point?: number | null }>;
}

export function VisualDiceHistory({ rollHistory }: VisualDiceHistoryProps) {
  // Show last 20 rolls, newest first (left to right)
  const recentRolls = rollHistory.slice(-20).reverse();

  // Helper function to determine roll type and styling
  const getRollStyling = (roll: { dice1: number; dice2: number; total: number; wasSevenOut?: boolean; phase?: string; point?: number | null }) => {
    const isHardway = roll.dice1 === roll.dice2 && [4, 6, 8, 10].includes(roll.total);
    const isSevenOut = roll.wasSevenOut === true;
    const isNatural7 = roll.total === 7 && !isSevenOut;
    // In CRAPLESS CRAPS, 2, 3, 12 are NEVER losses! They establish a point on come-out roll.
    // So we should NEVER show a "LOSS" label for these numbers.

    if (isSevenOut) {
      return {
        containerClass: 'bg-red-900/70 border-2 border-red-400 shadow-red-500/50 shadow-lg',
        totalClass: 'bg-gradient-to-br from-red-600 to-red-700 border border-red-400',
        diceStyle: 'loss' as const,
        label: '7 OUT',
        labelClass: 'bg-red-600 text-white'
      };
    } else if (isHardway) {
      return {
        containerClass: 'bg-blue-900/70 border-2 border-blue-400 shadow-blue-500/50 shadow-lg',
        totalClass: 'bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-400',
        diceStyle: 'hardway' as const,
        label: 'HARD',
        labelClass: 'bg-blue-600 text-white'
      };
    } else if (isNatural7) {
      return {
        containerClass: 'bg-blue-900/70 border-2 border-blue-400 shadow-blue-500/50 shadow-lg',
        totalClass: 'bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-400',
        diceStyle: 'natural7' as const,
        label: '7',
        labelClass: 'bg-blue-600 text-white'
      };
    }

    // Default styling for regular rolls
    return {
      containerClass: 'bg-gray-900/50 border border-gray-700 hover:border-gray-500',
      totalClass: 'bg-gradient-to-br from-yellow-600 to-yellow-700',
      diceStyle: 'normal' as const,
      label: null,
      labelClass: ''
    };
  };

  if (recentRolls.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 border-2 border-gray-600 w-full">
        <div className="text-center text-gray-400 text-sm">
          🎲 Roll History
          <div className="mt-2 text-xs">No rolls yet</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-3 border-2 border-gray-600 shadow-lg w-full">
      <div className="text-left text-white font-bold text-sm mb-2 border-b border-gray-600 pb-2">
        🎲 Roll History (Scroll →)
      </div>
      {/* Horizontal scrolling container - left to right */}
      <div 
        className="flex gap-2 overflow-x-auto pb-2" 
        style={{ 
          scrollbarWidth: 'thin',
          scrollbarColor: '#4b5563 #1f2937'
        }}
      >
        {recentRolls.map((roll, index) => {
          const styling = getRollStyling(roll);
          
          return (
            <div
              key={index}
              className={`flex flex-col items-center gap-1 rounded-lg p-2 flex-shrink-0 ${styling.containerClass}`}
            >
              {/* Label for special rolls */}
              {styling.label && (
                <div className={`${styling.labelClass} rounded px-2 py-0.5 text-[10px] font-bold mb-0.5`}>
                  {styling.label}
                </div>
              )}
              
              {/* Dice stacked vertically in each card */}
              <div className="flex items-center gap-1">
                <DiceFace value={roll.dice1} size="small" style={styling.diceStyle} />
                <DiceFace value={roll.dice2} size="small" style={styling.diceStyle} />
              </div>
              
              {/* Total below dice */}
              <div className={`${styling.totalClass} rounded-md px-2 py-0.5 min-w-[28px] text-center`}>
                <div className="text-white text-xs font-bold">{roll.total}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface DiceFaceProps {
  value: number;
  size?: 'small' | 'medium' | 'large';
  style?: 'normal' | 'hardway' | 'natural7' | 'loss';
}

function DiceFace({ value, size = 'medium', style = 'normal' }: DiceFaceProps) {
  const sizeClasses = {
    small: { container: 'w-8 h-8', dot: 'w-1.5 h-1.5' },
    medium: { container: 'w-12 h-12', dot: 'w-2 h-2' },
    large: { container: 'w-16 h-16', dot: 'w-3 h-3' },
  };

  const { container, dot } = sizeClasses[size];

  // Get styling based on roll type
  const getStyleClasses = () => {
    switch (style) {
      case 'hardway':
        return {
          background: 'bg-gradient-to-br from-blue-100 to-blue-200',
          border: 'border-2 border-blue-400',
          dotColor: 'bg-blue-900'
        };
      case 'natural7':
        return {
          background: 'bg-gradient-to-br from-blue-100 to-blue-200',
          border: 'border-2 border-blue-400',
          dotColor: 'bg-blue-900'
        };
      case 'loss':
        return {
          background: 'bg-gradient-to-br from-red-100 to-red-200',
          border: 'border-2 border-red-400',
          dotColor: 'bg-red-900'
        };
      default:
        return {
          background: 'bg-gradient-to-br from-white to-gray-100',
          border: 'border border-gray-300',
          dotColor: 'bg-black'
        };
    }
  };

  const styleClasses = getStyleClasses();

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
        className={`absolute ${dot} ${styleClasses.dotColor} rounded-full`}
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    ));
  };

  return (
    <div
      className={`${container} relative rounded-lg ${styleClasses.background} ${styleClasses.border} shadow-md flex-shrink-0`}
    >
      {getDots()}
    </div>
  );
}