import type { Roll } from './CrapsGame';

interface RollHistoryInlineProps {
  rolls: Roll[];
}

export function RollHistoryInline({ rolls }: RollHistoryInlineProps) {
  if (rolls.length === 0) {
    return (
      <div className="bg-green-800 border-2 border-white rounded-lg p-4 mb-4">
        <div className="text-yellow-400 text-center mb-2">ROLL HISTORY</div>
        <div className="text-gray-300 text-center text-sm">No rolls yet. Place your bets and roll!</div>
      </div>
    );
  }

  return (
    <div className="bg-green-800 border-2 border-white rounded-lg p-4 mb-4">
      <div className="text-yellow-400 text-center mb-2">ROLL HISTORY</div>
      <div className="overflow-x-auto">
        <div className="flex gap-3 pb-2">
          {rolls.map((roll, index) => (
            <div 
              key={roll.timestamp} 
              className="flex-shrink-0 bg-green-700 border-2 border-white rounded-lg p-3 min-w-[140px]"
            >
              <div className="text-yellow-400 text-xs mb-2 text-center">
                Roll #{rolls.length - index}
              </div>
              <div className="flex gap-2 justify-center mb-2">
                <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-black shadow-lg">
                  {roll.dice1}
                </div>
                <div className="w-10 h-10 bg-white rounded flex items-center justify-center text-black shadow-lg">
                  {roll.dice2}
                </div>
              </div>
              <div className="text-white text-center">
                Total: <span className="text-yellow-400">{roll.total}</span>
              </div>
              <div className="text-gray-300 text-xs text-center mt-1">
                {new Date(roll.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
