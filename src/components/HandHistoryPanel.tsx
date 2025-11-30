import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, History, TrendingUp, TrendingDown, Clock, Dices, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useHandHistory, type HandHistoryEntry } from '../contexts/HandHistoryContext';

interface HandHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HandHistoryPanel({ isOpen, onClose }: HandHistoryPanelProps) {
  const { history, getSession, deleteSession, getTotalStats } = useHandHistory();
  const [selectedSession, setSelectedSession] = useState<HandHistoryEntry | null>(null);

  if (!isOpen) return null;

  const stats = getTotalStats();

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this session?')) {
      deleteSession(id);
      if (selectedSession?.id === id) {
        setSelectedSession(null);
      }
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.95) 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border-4"
        style={{
          background: 'linear-gradient(135deg, #14532d 0%, #15803d 20%, #16a34a 40%, #15803d 60%, #14532d 100%)',
          borderColor: '#fbbf24',
          boxShadow: '0 0 60px rgba(251, 191, 36, 0.6), 0 20px 80px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* HEADER */}
        <div
          className="sticky top-0 p-6 flex justify-between items-center border-b-4 z-10"
          style={{
            background: 'linear-gradient(135deg, #b45309 0%, #d97706 25%, #f59e0b 50%, #d97706 75%, #b45309 100%)',
            borderColor: '#fbbf24',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="flex items-center gap-4">
            <History className="w-12 h-12" style={{ color: '#fbbf24' }} />
            <div>
              <h2
                className="text-4xl font-bold uppercase tracking-wider"
                style={{
                  color: '#fef3c7',
                  textShadow: '0 0 20px rgba(251, 191, 36, 0.8), 0 4px 8px rgba(0, 0, 0, 0.8)',
                }}
              >
                📜 Hand History
              </h2>
              <p
                className="text-lg font-bold mt-1"
                style={{
                  color: '#86efac',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                }}
              >
                {history.length} Sessions Recorded
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="transition-all hover:scale-110 hover:rotate-90"
            style={{ color: '#fef3c7' }}
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          {!selectedSession ? (
            <>
              {/* Overall Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-4 text-white">
                  <History className="w-8 h-8 mb-2" />
                  <div className="text-3xl font-bold">{stats.totalSessions}</div>
                  <div className="text-sm opacity-90">Total Sessions</div>
                </div>

                <div className={`bg-gradient-to-br ${stats.totalProfit >= 0 ? 'from-green-600 to-green-800' : 'from-red-600 to-red-800'} rounded-xl p-4 text-white`}>
                  {stats.totalProfit >= 0 ? <TrendingUp className="w-8 h-8 mb-2" /> : <TrendingDown className="w-8 h-8 mb-2" />}
                  <div className="text-3xl font-bold">${stats.totalProfit.toLocaleString()}</div>
                  <div className="text-sm opacity-90">Total P/L</div>
                </div>

                <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-4 text-white">
                  <Dices className="w-8 h-8 mb-2" />
                  <div className="text-3xl font-bold">{stats.totalRolls}</div>
                  <div className="text-sm opacity-90">Total Rolls</div>
                </div>

                <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-xl p-4 text-white">
                  <TrendingUp className="w-8 h-8 mb-2" />
                  <div className="text-3xl font-bold">{stats.winRate.toFixed(1)}%</div>
                  <div className="text-sm opacity-90">Win Rate</div>
                </div>
              </div>

              {/* Session List */}
              <h3 className="text-white text-2xl font-bold mb-4">Session History</h3>
              
              {history.length === 0 ? (
                <div className="text-center py-12">
                  <History className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg">No sessions recorded yet</p>
                  <p className="text-gray-500 text-sm">Your game sessions will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {history.map((session, index) => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border-2 border-gray-700 hover:border-yellow-500 transition-all cursor-pointer"
                        onClick={() => setSelectedSession(session)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="text-white font-bold text-lg">{session.sessionName}</h4>
                              <div className="flex items-center gap-1 text-gray-400 text-sm">
                                <Clock className="w-4 h-4" />
                                {formatDuration(session.duration)}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <span className="text-gray-400">P/L: </span>
                                <span className={`font-bold ${session.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  ${session.profitLoss.toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-400">Rolls: </span>
                                <span className="text-white font-bold">{session.totalRolls}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Points: </span>
                                <span className="text-white font-bold">{session.pointsMade}/{session.pointsMade + session.pointsMissed}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Bets: </span>
                                <span className="text-white font-bold">{session.bets.length}</span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(session.id);
                            }}
                            className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/30 rounded-lg transition-all"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Session Detail View */}
              <button
                onClick={() => setSelectedSession(null)}
                className="text-white hover:text-yellow-400 transition-colors mb-4 flex items-center gap-2"
              >
                ← Back to List
              </button>

              <div className="space-y-6">
                {/* Session Overview */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 border-2 border-yellow-500">
                  <h3 className="text-white text-2xl font-bold mb-4">{selectedSession.sessionName}</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-gray-400 text-sm">Starting Balance</div>
                      <div className="text-white text-xl font-bold">${selectedSession.startingBalance.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Ending Balance</div>
                      <div className="text-white text-xl font-bold">${selectedSession.endingBalance.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Profit/Loss</div>
                      <div className={`text-xl font-bold ${selectedSession.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${selectedSession.profitLoss.toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 text-sm">Duration</div>
                      <div className="text-white text-xl font-bold">{formatDuration(selectedSession.duration)}</div>
                    </div>
                  </div>
                </div>

                {/* Rolls History */}
                <div>
                  <h4 className="text-white text-xl font-bold mb-3">Rolls ({selectedSession.rolls.length})</h4>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border-2 border-gray-700 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {selectedSession.rolls.map((roll, index) => (
                        <div key={index} className="flex items-center justify-between text-white bg-gray-900/50 p-2 rounded">
                          <span className="text-sm text-gray-400">Roll {index + 1}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{roll.dice1} + {roll.dice2} = {roll.total}</span>
                            <span className="text-xs text-gray-500">
                              ({roll.phase === 'come-out' ? 'Come-Out' : `Point: ${roll.point}`})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bets History */}
                <div>
                  <h4 className="text-white text-xl font-bold mb-3">Bets ({selectedSession.bets.length})</h4>
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-4 border-2 border-gray-700 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {selectedSession.bets.map((bet, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-900/50 p-2 rounded">
                          <div className="text-white">
                            <span className="font-bold">{bet.type}</span>
                            <span className="text-sm text-gray-400 ml-2">${bet.amount}</span>
                          </div>
                          <div className="text-right">
                            <div className={`font-bold ${
                              bet.result === 'win' ? 'text-green-400' : 
                              bet.result === 'loss' ? 'text-red-400' : 
                              'text-gray-400'
                            }`}>
                              {bet.result === 'win' ? `+$${bet.payout}` : 
                               bet.result === 'loss' ? `-$${bet.amount}` : 
                               'Push'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
