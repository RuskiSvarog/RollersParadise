// Removed motion import - using CSS animations instead

interface WinningConditionProps {
  winningNumbers: number[]; // Numbers that make you WIN (green)
  losingNumbers: number[]; // Numbers that make you LOSE (red)
}

export function WinningCondition({ winningNumbers, losingNumbers }: WinningConditionProps) {
  const numbers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  return (
    <div className="z-10 w-full">
      <div 
        className="backdrop-blur-sm border rounded-lg shadow-xl overflow-hidden"
        style={{
          background: 'rgba(0, 0, 0, 0.75)',
          borderColor: 'rgba(251, 191, 36, 0.6)',
          boxShadow: '0 0 15px rgba(251, 191, 36, 0.15), 0 4px 12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header - SMALLER */}
        <div 
          className="px-2 py-1 border-b"
          style={{
            background: 'linear-gradient(180deg, rgba(31, 41, 55, 0.8) 0%, rgba(17, 24, 39, 0.85) 100%)',
            borderColor: 'rgba(251, 191, 36, 0.6)',
          }}
        >
          <div 
            className="text-center uppercase tracking-wide font-black text-lg"
            style={{
              fontFamily: 'Impact, sans-serif',
              textShadow: '0 2px 4px rgba(0, 0, 0, 1)',
              letterSpacing: '0.1em',
            }}
          >
            <span style={{ color: '#4ade80', textShadow: '0 0 15px rgba(74, 222, 128, 0.8), 0 2px 4px rgba(0, 0, 0, 1)' }}>WIN</span>
            <span style={{ color: '#fbbf24' }}>/</span>
            <span style={{ color: '#f87171', textShadow: '0 0 15px rgba(248, 113, 113, 0.8), 0 2px 4px rgba(0, 0, 0, 1)' }}>LOSE</span>
          </div>
        </div>

        {/* Numbers Row - HORIZONTAL, FULL WIDTH */}
        <div className="p-1 flex gap-0.5 justify-between">
          {numbers.map((num) => {
            const isWinning = winningNumbers.includes(num);
            const isLosing = losingNumbers.includes(num);
            const isActive = isWinning || isLosing;
            
            return (
              <div
                key={num}
                className="flex-1 flex items-center justify-center rounded border shadow-sm relative overflow-hidden transition-all duration-300"
                style={{
                  height: '26px',
                  backgroundColor: isWinning
                    ? 'rgba(34, 197, 94, 0.9)' // Green for winning
                    : isLosing
                    ? 'rgba(239, 68, 68, 0.9)' // Red for losing
                    : 'rgba(107, 114, 128, 0.25)', // Grey for inactive
                  borderColor: isWinning
                    ? '#4ade80'
                    : isLosing
                    ? '#f87171'
                    : '#4b5563',
                  transform: isActive ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isWinning
                    ? '0 0 12px rgba(34, 197, 94, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.15)'
                    : isLosing
                    ? '0 0 12px rgba(239, 68, 68, 0.4), inset 0 1px 2px rgba(255, 255, 255, 0.15)'
                    : '0 1px 4px rgba(0, 0, 0, 0.3)',
                }}
              >
                {/* Glow effect for active numbers */}
                {isActive && (
                  <div
                    className="absolute inset-0 animate-pulse"
                    style={{
                      background: isWinning
                        ? 'radial-gradient(circle, rgba(74, 222, 128, 0.3) 0%, transparent 70%)'
                        : 'radial-gradient(circle, rgba(248, 113, 113, 0.3) 0%, transparent 70%)',
                      animationDuration: '2s',
                    }}
                  />
                )}

                {/* Number - SMALLER */}
                <span 
                  className="text-sm font-black relative z-10"
                  style={{
                    fontFamily: 'Impact, sans-serif',
                    color: isActive ? '#ffffff' : '#9ca3af',
                    textShadow: isActive
                      ? isWinning
                        ? '0 0 10px rgba(74, 222, 128, 0.6), 0 1px 3px rgba(0, 0, 0, 0.8)'
                        : '0 0 10px rgba(248, 113, 113, 0.6), 0 1px 3px rgba(0, 0, 0, 0.8)'
                      : '0 1px 2px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  {num}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}