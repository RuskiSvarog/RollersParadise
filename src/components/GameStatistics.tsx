import { X, Info, TrendingUp, DollarSign, Trophy } from './Icons';
import type { Roll } from './CrapsGame';

interface GameStats {
  totalRolls: number;
  totalWins: number;
  totalLosses: number;
  biggestWin: number;
  totalWagered: number;
  totalWon: number;
  sessionStart: number;
}

interface GameStatisticsProps {
  rolls: Roll[];
  onClose: () => void;
  stats: GameStats;
}

export function GameStatistics({ rolls, onClose, stats }: GameStatisticsProps) {
  // Calculate actual roll statistics from history
  const rollCounts: { [key: number]: number } = {};
  for (let i = 2; i <= 12; i++) {
    rollCounts[i] = 0;
  }
  
  // Safety check: ensure rolls is an array
  const safeRolls = rolls || [];
  
  safeRolls.forEach(roll => {
    rollCounts[roll.total]++;
  });

  const totalRolls = safeRolls.length;

  // Theoretical probabilities for dice combinations
  const theoreticalProbabilities: { [key: number]: { probability: number; combinations: number } } = {
    2: { probability: 2.78, combinations: 1 },
    3: { probability: 5.56, combinations: 2 },
    4: { probability: 8.33, combinations: 3 },
    5: { probability: 11.11, combinations: 4 },
    6: { probability: 13.89, combinations: 5 },
    7: { probability: 16.67, combinations: 6 },
    8: { probability: 13.89, combinations: 5 },
    9: { probability: 11.11, combinations: 4 },
    10: { probability: 8.33, combinations: 3 },
    11: { probability: 5.56, combinations: 2 },
    12: { probability: 2.78, combinations: 1 }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-4 sm:p-6 max-w-5xl w-full border-4 border-yellow-600 my-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Info className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
            <h2 className="text-xl sm:text-2xl text-yellow-400">Game Statistics</h2>
          </div>
          <button 
            onClick={onClose}
            className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Fair Play Statement */}
        <div className="bg-green-800 rounded-lg p-3 sm:p-4 mb-4 border-2 border-yellow-500">
          <h3 className="text-yellow-400 mb-2 flex items-center gap-2">
            🔒 <span className="text-sm sm:text-base">Certified Fair Gaming</span>
          </h3>
          <div className="text-white text-xs sm:text-sm space-y-1">
            <p>✓ Cryptographically Secure Random Number Generator (RNG) ensures fair dice rolls.</p>
            <p>✓ Each roll is independent and unbiased - outcomes cannot be predicted or manipulated.</p>
            <p>✓ All outcomes are provably fair and comply with responsible gaming regulations.</p>
          </div>
        </div>

        {/* Session Performance Stats */}
        <div className="bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg p-3 sm:p-4 mb-4 border-2 border-purple-500">
          <h3 className="text-yellow-400 mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Trophy className="w-5 h-5" />
            Your Session Performance
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-black bg-opacity-30 rounded-lg p-2 sm:p-3 text-center">
              <div className="text-gray-300 text-[10px] sm:text-xs mb-1 flex items-center justify-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Total Rolls
              </div>
              <div className="text-white text-lg sm:text-2xl">{stats.totalRolls}</div>
            </div>
            <div className="bg-black bg-opacity-30 rounded-lg p-2 sm:p-3 text-center">
              <div className="text-gray-300 text-[10px] sm:text-xs mb-1">Winning Rolls</div>
              <div className="text-green-400 text-lg sm:text-2xl">{stats.totalWins}</div>
            </div>
            <div className="bg-black bg-opacity-30 rounded-lg p-2 sm:p-3 text-center">
              <div className="text-gray-300 text-[10px] sm:text-xs mb-1 flex items-center justify-center gap-1">
                <DollarSign className="w-3 h-3" />
                Total Wagered
              </div>
              <div className="text-white text-lg sm:text-2xl">${stats.totalWagered.toFixed(0)}</div>
            </div>
            <div className="bg-black bg-opacity-30 rounded-lg p-2 sm:p-3 text-center">
              <div className="text-gray-300 text-[10px] sm:text-xs mb-1">Total Won</div>
              <div className={`text-lg sm:text-2xl ${stats.totalWon >= stats.totalWagered ? 'text-green-400' : 'text-red-400'}`}>
                ${stats.totalWon.toFixed(0)}
              </div>
            </div>
          </div>
          <div className="mt-2 sm:mt-3 grid grid-cols-2 gap-2 sm:gap-3">
            <div className="bg-black bg-opacity-30 rounded-lg p-2 sm:p-3 text-center">
              <div className="text-gray-300 text-[10px] sm:text-xs mb-1 flex items-center justify-center gap-1">
                <Trophy className="w-3 h-3" />
                Biggest Win
              </div>
              <div className="text-yellow-400 text-lg sm:text-2xl">${stats.biggestWin.toFixed(2)}</div>
            </div>
            <div className="bg-black bg-opacity-30 rounded-lg p-2 sm:p-3 text-center">
              <div className="text-gray-300 text-[10px] sm:text-xs mb-1">Net Profit/Loss</div>
              <div className={`text-lg sm:text-2xl ${stats.totalWon - stats.totalWagered >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {stats.totalWon - stats.totalWagered >= 0 ? '+' : ''}${(stats.totalWon - stats.totalWagered).toFixed(2)}
              </div>
            </div>
          </div>
          <div className="mt-2 text-center text-gray-300 text-[10px] sm:text-xs">
            Session: {new Date(stats.sessionStart).toLocaleString()}
          </div>
        </div>

        {/* Theoretical Probabilities */}
        <div className="bg-gray-900 rounded-lg p-3 sm:p-4 mb-4">
          <h3 className="text-yellow-400 mb-2 text-sm sm:text-base">📊 Theoretical Dice Probabilities</h3>
          <div className="text-white text-xs sm:text-sm mb-2">
            With two six-sided dice, there are 36 possible combinations:
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {Object.entries(theoreticalProbabilities).map(([total, data]) => (
              <div key={total} className="bg-gray-800 rounded p-2 border border-gray-700">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-yellow-400 text-base sm:text-lg">{total}</span>
                  <span className="text-white text-[10px] sm:text-xs">{data.probability}%</span>
                </div>
                <div className="text-gray-400 text-[9px] sm:text-[10px] mb-1">
                  {data.combinations} way{data.combinations > 1 ? 's' : ''}
                </div>
                <div className="bg-gray-700 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-green-500 h-full rounded-full"
                    style={{ width: `${data.probability * 5}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actual Roll Statistics */}
        <div className="bg-gray-900 rounded-lg p-3 sm:p-4 mb-4">
          <h3 className="text-yellow-400 mb-2 text-sm sm:text-base">🎲 Your Session Statistics</h3>
          {totalRolls === 0 ? (
            <div className="text-gray-400 text-center py-6 text-xs sm:text-sm">
              No rolls yet. Start playing to see your statistics!
            </div>
          ) : (
            <>
              <div className="text-white text-xs sm:text-sm mb-2">
                Total Rolls: <span className="text-yellow-400">{totalRolls}</span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                {Object.entries(rollCounts).map(([total, count]) => {
                  const actualPercent = totalRolls > 0 ? ((count / totalRolls) * 100).toFixed(2) : '0.00';
                  const theoretical = theoreticalProbabilities[parseInt(total)].probability;
                  const diff = parseFloat(actualPercent) - theoretical;
                  
                  return (
                    <div key={total} className="bg-gray-800 rounded p-2 border border-gray-700">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-yellow-400 text-base sm:text-lg">{total}</span>
                        <div className="text-right">
                          <div className="text-white text-[10px] sm:text-xs">{actualPercent}%</div>
                          <div className={`text-[9px] ${diff > 0 ? 'text-green-400' : diff < 0 ? 'text-red-400' : 'text-gray-400'}`}>
                            {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-gray-400 text-[9px] sm:text-[10px] mb-1">
                        {count}x
                      </div>
                      <div className="bg-gray-700 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full rounded-full"
                          style={{ width: `${Math.min(parseFloat(actualPercent) * 5, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="text-gray-400 text-[10px] sm:text-xs mt-3 text-center">
                The more you play, the closer your results match theoretical probabilities.
              </div>
            </>
          )}
        </div>

        {/* Bet Payouts Reference */}
        <div className="bg-gray-900 rounded-lg p-3 sm:p-4 mb-4">
          <h3 className="text-yellow-400 mb-2 text-sm sm:text-base">💰 Payout Table - Crapless</h3>
          <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 text-white text-xs sm:text-sm">
            <div>
              <h4 className="text-yellow-300 mb-2 text-xs sm:text-sm">Main Bets</h4>
              <ul className="space-y-1 text-[10px] sm:text-xs">
                <li>• Pass Line: 1 to 1 (Even Money)</li>
                <li>• Field (3,4,9,10,11): 1 to 1</li>
                <li>• Field (2,12): 2 to 1 (Triple)</li>
                <li>• Come Bet: 1 to 1</li>
              </ul>
            </div>
            <div>
              <h4 className="text-yellow-300 mb-2 text-xs sm:text-sm">Proposition Bets</h4>
              <ul className="space-y-1 text-[10px] sm:text-xs">
                <li>• Any Craps (2,3,12): 7 to 1</li>
                <li>• Snake Eyes (2) / Boxcars (12): 30 to 1</li>
                <li>• Ace-Deuce (3) / Yo (11): 15 to 1</li>
                <li>• Hardways 4/10: 7 to 1</li>
                <li>• Hardways 6/8: 9 to 1</li>
              </ul>
            </div>
          </div>
        </div>

        {/* RTP Information */}
        <div className="bg-gray-900 rounded-lg p-3 sm:p-4 border-2 border-blue-600">
          <h3 className="text-blue-400 mb-2 text-sm sm:text-base">📈 Return to Player (RTP)</h3>
          <div className="text-white text-xs sm:text-sm">
            <p className="mb-2">
              RTP represents the percentage of wagered money paid back to players over time:
            </p>
            <ul className="space-y-1 text-[10px] sm:text-xs text-gray-300">
              <li>• Pass Line: ~98.64% RTP (1.36% house edge)</li>
              <li>• Field Bet: ~94.44% RTP (5.56% house edge)</li>
              <li>• Hardways: ~88.89% - 91.67% RTP</li>
              <li>• Proposition Bets: Variable RTP depending on bet type</li>
            </ul>
            <p className="text-[9px] sm:text-[10px] text-gray-400 mt-2">
              These are theoretical long-term percentages. Individual sessions will vary.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}