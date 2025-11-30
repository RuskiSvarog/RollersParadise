import { useState } from 'react';
import { X, DollarSign, RefreshCw, Settings, Zap, TrendingUp, Award, Users, Shield, BookOpen, AlertTriangle, BarChart3 } from './Icons';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { TierCapacityMonitor } from './TierCapacityMonitor';
import { CapacityOptimizationPanel } from './CapacityOptimizationPanel';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onSetBalance: (newBalance: number) => Promise<void> | void;
  userEmail: string;
  onResetStats?: () => void;
  onResetGame?: () => void;
}

export function AdminPanel({
  isOpen,
  onClose,
  currentBalance,
  onSetBalance,
  userEmail,
  onResetStats,
  onResetGame
}: AdminPanelProps) {
  const [customAmount, setCustomAmount] = useState('1000000');
  const [activeTab, setActiveTab] = useState('balance');

  if (!isOpen) return null;

  const handleSetBalance = () => {
    const amount = parseFloat(customAmount);
    if (!isNaN(amount) && amount >= 0) {
      onSetBalance(amount);
    }
  };

  const quickSetBalance = (amount: number) => {
    onSetBalance(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div 
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl border-4 border-red-600 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        style={{
          boxShadow: '0 0 50px rgba(220, 38, 38, 0.5), inset 0 0 30px rgba(220, 38, 38, 0.1)'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 rounded-t-xl relative border-b-4 border-red-700 sticky top-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-800 opacity-50" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-white" />
              <div>
                <h2 className="text-white text-3xl font-black uppercase tracking-wider">
                  🔧 Admin Dashboard
                </h2>
                <p className="text-red-200 text-sm mt-1">
                  Owner Access: {userEmail}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-200 transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabbed Content */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="balance" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Balance
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="metrics" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Tier Metrics
              </TabsTrigger>
              <TabsTrigger value="optimization" className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Optimization
              </TabsTrigger>
            </TabsList>

            <TabsContent value="balance" className="space-y-6">
              {/* Current Balance Display */}
              <div className="bg-gradient-to-br from-green-600 to-green-800 p-6 rounded-xl border-2 border-green-400 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-green-200 text-sm font-bold uppercase tracking-wide mb-1">
                      Current Balance
                    </div>
                    <div className="text-white text-4xl font-black">
                      ${currentBalance.toLocaleString()}
                    </div>
                  </div>
                  <DollarSign className="w-16 h-16 text-green-200 opacity-50" />
                </div>
              </div>

              {/* Quick Balance Buttons */}
              <div>
                <h3 className="text-white font-bold text-xl mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Quick Set Balance
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => quickSetBalance(10000)}
                    className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-4 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    $10,000
                  </button>
                  <button
                    onClick={() => quickSetBalance(100000)}
                    className="bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-4 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    $100,000
                  </button>
                  <button
                    onClick={() => quickSetBalance(1000000)}
                    className="bg-gradient-to-br from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 text-white px-4 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    $1 Million
                  </button>
                  <button
                    onClick={() => quickSetBalance(10000000)}
                    className="bg-gradient-to-br from-pink-600 to-red-600 hover:from-pink-500 hover:to-red-500 text-white px-4 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    $10 Million
                  </button>
                </div>
              </div>

              {/* Custom Balance Input */}
              <div>
                <h3 className="text-white font-bold text-xl mb-3 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-blue-400" />
                  Custom Balance
                </h3>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Enter custom amount"
                    className="flex-1 bg-gray-800 border-2 border-gray-700 rounded-lg px-4 py-3 text-white text-lg font-bold focus:border-blue-500 focus:outline-none transition-colors"
                    min="0"
                    step="1000"
                  />
                  <button
                    onClick={handleSetBalance}
                    className="bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center gap-2"
                  >
                    <DollarSign className="w-5 h-5" />
                    Set
                  </button>
                </div>
              </div>

              {/* Add/Remove Chips */}
              <div>
                <h3 className="text-white font-bold text-xl mb-3 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  Add/Remove Chips
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onSetBalance(currentBalance + 10000)}
                    className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-4 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    + $10,000
                  </button>
                  <button
                    onClick={() => onSetBalance(Math.max(0, currentBalance - 10000))}
                    className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    - $10,000
                  </button>
                  <button
                    onClick={() => onSetBalance(currentBalance + 100000)}
                    className="bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-4 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    + $100,000
                  </button>
                  <button
                    onClick={() => onSetBalance(Math.max(0, currentBalance - 100000))}
                    className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    - $100,000
                  </button>
                </div>
              </div>

              {/* Admin Actions */}
              <div>
                <h3 className="text-white font-bold text-xl mb-3 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-orange-400" />
                  Admin Actions
                </h3>
                <div className="space-y-3">
                  {onResetStats && (
                    <button
                      onClick={onResetStats}
                      className="w-full bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white px-4 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Award className="w-5 h-5" />
                      Reset Stats
                    </button>
                  )}
                  {onResetGame && (
                    <button
                      onClick={onResetGame}
                      className="w-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-4 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <RefreshCw className="w-5 h-5" />
                      Reset Entire Game
                    </button>
                  )}
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-900/30 border-2 border-yellow-600 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <div className="text-yellow-400 font-bold text-sm uppercase tracking-wide mb-1">
                      Admin Warning
                    </div>
                    <div className="text-yellow-200 text-sm">
                      These tools are for testing purposes only. Balance changes will sync to the server and affect your saved game state.
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              {/* Admin Reports & Information */}
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-6 rounded-xl border-2 border-purple-400 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <BookOpen className="w-8 h-8 text-white" />
                    <div>
                      <h3 className="text-white text-2xl font-black">Admin Reports Dashboard</h3>
                      <p className="text-purple-200 text-sm">View error reports, player stats, and system information</p>
                    </div>
                  </div>
                  
                  <a
                    href="/?admin-reports=true"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white px-6 py-4 rounded-lg font-bold transition-all shadow-lg hover:shadow-xl hover:scale-105 text-center"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      <span>Open Error Reports Dashboard</span>
                    </div>
                  </a>
                </div>

                {/* Quick Admin Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="w-5 h-5 text-blue-400" />
                      <h4 className="text-white font-bold">Owner Info</h4>
                    </div>
                    <div className="text-gray-300 text-sm space-y-1">
                      <div><strong>Name:</strong> Ruski</div>
                      <div><strong>Email:</strong> {userEmail}</div>
                      <div><strong>Phone:</strong> 913-213-8666</div>
                    </div>
                  </div>

                  <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BarChart3 className="w-5 h-5 text-green-400" />
                      <h4 className="text-white font-bold">Quick Actions</h4>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={() => window.open('/?check-errors', '_blank')}
                        className="w-full bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white px-3 py-2 rounded text-sm font-bold transition-all"
                      >
                        Quick Error Check
                      </button>
                      <button
                        onClick={() => {
                          localStorage.clear();
                          sessionStorage.clear();
                          alert('All local storage cleared!');
                        }}
                        className="w-full bg-gradient-to-br from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white px-3 py-2 rounded text-sm font-bold transition-all"
                      >
                        Clear Local Storage
                      </button>
                    </div>
                  </div>
                </div>

                {/* System Status */}
                <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="w-5 h-5 text-yellow-400" />
                    <h4 className="text-white font-bold">System Status</h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div className="bg-green-900/30 border border-green-600 rounded p-2 text-center">
                      <div className="text-green-400 font-bold">✓ Database</div>
                      <div className="text-green-300 text-xs">Online</div>
                    </div>
                    <div className="bg-green-900/30 border border-green-600 rounded p-2 text-center">
                      <div className="text-green-400 font-bold">✓ Server</div>
                      <div className="text-green-300 text-xs">Online</div>
                    </div>
                    <div className="bg-green-900/30 border border-green-600 rounded p-2 text-center">
                      <div className="text-green-400 font-bold">✓ Realtime</div>
                      <div className="text-green-300 text-xs">Active</div>
                    </div>
                    <div className="bg-green-900/30 border border-green-600 rounded p-2 text-center">
                      <div className="text-green-400 font-bold">✓ Cache</div>
                      <div className="text-green-300 text-xs">Active</div>
                    </div>
                  </div>
                </div>

                {/* Important Links */}
                <div className="bg-gray-800 border-2 border-gray-700 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="w-5 h-5 text-purple-400" />
                    <h4 className="text-white font-bold">Important Links</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <a 
                      href="/ADMIN_ACCESS_TROUBLESHOOTING.md" 
                      target="_blank" 
                      className="block text-blue-400 hover:text-blue-300 underline"
                    >
                      📄 Admin Access Troubleshooting Guide
                    </a>
                    <a 
                      href="/LOAD_TESTING_GUIDE.md" 
                      target="_blank" 
                      className="block text-blue-400 hover:text-blue-300 underline"
                    >
                      📊 Load Testing Documentation
                    </a>
                    <a 
                      href="/PERFORMANCE_OPTIMIZATION.md" 
                      target="_blank" 
                      className="block text-blue-400 hover:text-blue-300 underline"
                    >
                      ⚡ Performance Optimization Guide
                    </a>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              <TierCapacityMonitor />
            </TabsContent>

            <TabsContent value="optimization" className="space-y-6">
              <CapacityOptimizationPanel />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}