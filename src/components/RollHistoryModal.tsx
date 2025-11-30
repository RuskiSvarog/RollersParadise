import { X } from './Icons';
import type { Roll } from './CrapsGame';

interface RollHistoryModalProps {
  rolls: Roll[];
  onClose: () => void;
}

export function RollHistoryModal({ rolls, onClose }: RollHistoryModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        />

        {/* Modal */}
        <div className="relative w-full max-w-4xl max-h-[85vh] bg-gradient-to-br from-green-900 via-green-800 to-green-900 rounded-2xl shadow-2xl overflow-hidden border-4 border-yellow-500 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 px-6 py-4 flex items-center justify-between border-b-4 border-yellow-600">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎲</div>
              <div>
                <h2 className="text-white text-2xl font-bold">Roll History</h2>
                <p className="text-yellow-100 text-sm">View all your previous rolls</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-yellow-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(85vh-120px)]">
            {rolls.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-6xl mb-4">🎲</div>
                <div className="text-yellow-400 text-2xl mb-2">No Rolls Yet</div>
                <div className="text-gray-300">Place your bets and roll the dice to start!</div>
              </div>
            ) : (
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {rolls.map((roll, index) => {
                    // Calculate roll number: newest rolls are at index 0, so we reverse the numbering
                    // Total rolls - current index = roll number (e.g., 10 rolls: index 0 = #10, index 9 = #1)
                    const rollNumber = rolls.length - index;
                    
                    return (
                      <div
                        key={roll.timestamp}
                        className="bg-green-800 border-2 border-yellow-500/30 hover:border-yellow-500 rounded-xl p-4 transition-all hover:shadow-lg hover:shadow-yellow-500/20 animate-in fade-in slide-in-from-bottom-4 duration-300"
                        style={{ animationDelay: `${Math.min(index * 20, 500)}ms` }}
                      >
                        {/* Roll Number - Shows which roll came first (#1) to last (#X) */}
                        <div className="text-yellow-400 font-bold text-center mb-3 text-lg">
                          Roll #{rollNumber}
                        </div>

                        {/* Dice Display */}
                        <div className="flex gap-3 justify-center mb-3">
                          <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center text-black text-2xl font-bold shadow-lg">
                            {roll.dice1}
                          </div>
                          <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center text-black text-2xl font-bold shadow-lg">
                            {roll.dice2}
                          </div>
                        </div>

                        {/* Total */}
                        <div className="text-center mb-2">
                          <div className="text-gray-300 text-sm">Total</div>
                          <div className="text-yellow-400 text-2xl font-bold">{roll.total}</div>
                        </div>

                        {/* Timestamp */}
                        <div className="text-gray-400 text-xs text-center border-t border-gray-600 pt-2">
                          {new Date(roll.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Stats */}
          {rolls.length > 0 && (
            <div className="bg-green-900/50 border-t-2 border-yellow-500/30 px-6 py-3">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-300">
                  <span className="text-yellow-400 font-bold">{rolls.length}</span> total rolls
                </div>
                <div className="text-gray-300">
                  Most recent: <span className="text-white">{new Date(rolls[0].timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
    </div>
  );
}