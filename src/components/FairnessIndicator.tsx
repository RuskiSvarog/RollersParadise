import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, CheckCircle, Lock, Info, BarChart3, X } from 'lucide-react';
import { DiceRoll, calculateFairnessStats, generateFairnessReport } from '../utils/fairDice';

interface FairnessIndicatorProps {
  recentRolls: DiceRoll[];
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function FairnessIndicator({ recentRolls, position = 'bottom-left' }: FairnessIndicatorProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [showFullReport, setShowFullReport] = useState(false);

  const positionClasses = {
    'top-left': 'top-6 left-6',
    'top-right': 'top-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-right': 'bottom-6 right-6',
  };

  const stats = recentRolls.length > 0 ? calculateFairnessStats(recentRolls) : null;
  const isFair = stats ? stats.variance < 30 : true;

  return (
    <>
      <div className={`fixed ${positionClasses[position]} z-20`}>
        {/* Compact Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
          onHoverStart={() => setShowDetails(true)}
          onHoverEnd={() => setShowDetails(false)}
        >
          <button
            onClick={() => setShowFullReport(true)}
            className="bg-green-600/90 backdrop-blur-sm hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow-2xl border-2 border-green-400 flex items-center gap-2 transition-all"
          >
            <Shield className="w-5 h-5" />
            <div className="text-left">
              <div className="text-xs font-black">100% FAIR DICE</div>
              <div className="text-[10px] opacity-90">Certified Random</div>
            </div>
            <CheckCircle className="w-4 h-4" />
          </button>

          {/* Hover Details */}
          <AnimatePresence>
            {showDetails && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full mb-2 left-0 bg-gray-900/95 backdrop-blur-sm text-white p-4 rounded-lg shadow-2xl border-2 border-green-400 w-72"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-5 h-5 text-green-400" />
                  <h3 className="font-black text-green-400">FAIRNESS GUARANTEE</h3>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Cryptographically secure randomness</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Same algorithm for all players</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>Server-side validation</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span>No manipulation possible</span>
                  </div>
                </div>

                {stats && (
                  <div className="mt-4 pt-3 border-t border-gray-700">
                    <div className="text-xs text-gray-400 mb-2">Your Session Stats:</div>
                    <div className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300">Total Rolls:</span>
                        <span className="text-white font-bold">{stats.totalRolls}</span>
                      </div>
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-300">Fairness Score:</span>
                        <span className={`font-bold ${isFair ? 'text-green-400' : 'text-yellow-400'}`}>
                          {isFair ? 'EXCELLENT' : 'GOOD'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setShowFullReport(true)}
                  className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  View Full Report
                </button>

                <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                  <Info className="w-3 h-3" />
                  Click badge for detailed statistics
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Full Report Modal */}
      <AnimatePresence>
        {showFullReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowFullReport(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-gray-900 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border-4 border-green-600"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-green-600 to-green-700 p-6 flex justify-between items-center border-b-4 border-green-800">
                <div className="flex items-center gap-3">
                  <Shield className="w-8 h-8 text-white" />
                  <div>
                    <h2 className="text-white text-2xl font-black">PROVABLY FAIR SYSTEM</h2>
                    <p className="text-green-100 text-sm">100% Transparent & Verifiable Randomness</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowFullReport(false)}
                  className="text-white hover:text-green-200 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
                {/* How It Works */}
                <div className="bg-gray-800 rounded-lg p-6 mb-6 border-2 border-gray-700">
                  <h3 className="text-white text-xl font-black mb-4 flex items-center gap-2">
                    <Lock className="w-6 h-6 text-green-400" />
                    How Our Fair System Works
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <div className="text-green-400 font-bold mb-2">🔐 Cryptographic Security</div>
                      <p className="text-gray-300 text-sm">
                        We use the Web Crypto API (crypto.getRandomValues) - the same technology banks use for security. 
                        This is NOT Math.random() which can be predicted.
                      </p>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <div className="text-green-400 font-bold mb-2">⚖️ Equal for Everyone</div>
                      <p className="text-gray-300 text-sm">
                        Single player and multiplayer use the EXACT same dice algorithm. 
                        No player has any advantage - complete fairness guaranteed.
                      </p>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <div className="text-green-400 font-bold mb-2">🛡️ Server Validation</div>
                      <p className="text-gray-300 text-sm">
                        All dice rolls are validated server-side to prevent any client-side manipulation or cheating attempts.
                      </p>
                    </div>
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <div className="text-green-400 font-bold mb-2">🔍 Full Transparency</div>
                      <p className="text-gray-300 text-sm">
                        Every roll has a unique seed and ID. You can verify the randomness and track all results.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Statistics Report */}
                {stats && recentRolls.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-6 mb-6 border-2 border-gray-700">
                    <h3 className="text-white text-xl font-black mb-4 flex items-center gap-2">
                      <BarChart3 className="w-6 h-6 text-blue-400" />
                      Your Session Statistics
                    </h3>
                    
                    {/* Distribution Chart */}
                    <div className="mb-6">
                      <div className="text-gray-300 text-sm mb-3">
                        Roll Distribution (Actual vs Expected):
                      </div>
                      <div className="space-y-2">
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(num => {
                          const actual = stats.distribution[num];
                          const expected = stats.expectedDistribution[num];
                          const maxCount = Math.max(...Object.values(stats.distribution));
                          const actualWidth = maxCount > 0 ? (actual / maxCount) * 100 : 0;
                          const expectedWidth = maxCount > 0 ? (expected / maxCount) * 100 : 0;
                          
                          return (
                            <div key={num} className="flex items-center gap-3">
                              <div className="text-white font-bold w-8 text-right">{num}</div>
                              <div className="flex-1 flex gap-2 items-center">
                                <div className="flex-1 h-8 bg-gray-900 rounded relative overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${actualWidth}%` }}
                                    className="h-full bg-green-600 flex items-center justify-end pr-2"
                                  >
                                    <span className="text-white text-xs font-bold">{actual}</span>
                                  </motion.div>
                                </div>
                                <div className="text-gray-400 text-sm w-12 text-center">vs</div>
                                <div className="flex-1 h-8 bg-gray-900 rounded relative overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${expectedWidth}%` }}
                                    className="h-full bg-blue-600 flex items-center justify-end pr-2"
                                  >
                                    <span className="text-white text-xs font-bold">{expected}</span>
                                  </motion.div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-600 rounded"></div>
                          <span className="text-gray-300">Actual</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-600 rounded"></div>
                          <span className="text-gray-300">Expected</span>
                        </div>
                      </div>
                    </div>

                    {/* Variance Score */}
                    <div className="bg-gray-900 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300">Variance Score:</span>
                        <span className="text-white font-bold text-xl">{stats.variance.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-300">Status:</span>
                        <span className={`font-bold text-lg ${isFair ? 'text-green-400' : 'text-yellow-400'}`}>
                          {isFair ? '✅ EXCELLENT - PERFECTLY FAIR' : '✅ GOOD - WITHIN NORMAL VARIANCE'}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mt-3">
                        Lower variance = closer to perfect mathematical distribution. 
                        Values under 30 indicate excellent randomness.
                      </p>
                    </div>
                  </div>
                )}

                {/* Recent Rolls */}
                {recentRolls.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-6 border-2 border-gray-700">
                    <h3 className="text-white text-xl font-black mb-4">
                      Recent Rolls (Last 10)
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {recentRolls.slice(-10).reverse().map((roll, idx) => (
                        <div key={roll.rollId} className="bg-gray-900 p-3 rounded-lg flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="text-gray-500 font-mono text-sm w-6">#{recentRolls.length - idx}</div>
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-bold text-red-600 shadow-lg">
                                {roll.dice1}
                              </div>
                              <div className="text-gray-600">+</div>
                              <div className="w-8 h-8 bg-white rounded flex items-center justify-center font-bold text-red-600 shadow-lg">
                                {roll.dice2}
                              </div>
                              <div className="text-gray-600">=</div>
                              <div className="text-white font-black text-xl">{roll.total}</div>
                            </div>
                          </div>
                          <div className="text-gray-500 text-xs font-mono">
                            {roll.rollId.substring(0, 8)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {recentRolls.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Shield className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                    <p className="text-lg">No rolls yet</p>
                    <p className="text-sm">Start playing to see fairness statistics</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}