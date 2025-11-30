import { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, X, Lock, Eye, Trash2 } from './Icons';
import { Security } from '../utils/security';

interface SecurityDashboardProps {
  onClose: () => void;
}

export function SecurityDashboard({ onClose }: SecurityDashboardProps) {
  const [securityLog, setSecurityLog] = useState(Security.getSecurityLog());
  const [filter, setFilter] = useState<string>('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  
  // 🔒 ADMIN PIN - Change this to your secure PIN
  const ADMIN_PIN = '2025'; // IMPORTANT: Change this to your own secure PIN!

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAuthenticated(true);
      setPinError(false);
      console.log('✅ Admin authenticated - Security Dashboard access granted');
    } else {
      setPinError(true);
      setPinInput('');
      console.warn('❌ Invalid PIN attempt');
      setTimeout(() => setPinError(false), 2000);
    }
  };

  useEffect(() => {
    // Refresh log every 5 seconds (only if authenticated)
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      setSecurityLog(Security.getSecurityLog());
    }, 5000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const eventTypes = [
    'all',
    'TAMPERING_DETECTED',
    'BALANCE_MISMATCH',
    'ANTI_CHEAT_TRIGGERED',
    'RATE_LIMIT_EXCEEDED',
    'INVALID_DICE_ROLL',
    'INVALID_GAME_STATE',
    'INSUFFICIENT_BALANCE_ATTEMPT'
  ];

  const filteredLog = filter === 'all' 
    ? securityLog 
    : securityLog.filter(event => event.type === filter);

  const getEventColor = (type: string) => {
    if (type.includes('TAMPERING') || type.includes('ANTI_CHEAT')) return 'text-red-500';
    if (type.includes('MISMATCH') || type.includes('INVALID')) return 'text-orange-500';
    if (type.includes('RATE_LIMIT')) return 'text-yellow-500';
    return 'text-blue-500';
  };

  const getEventIcon = (type: string) => {
    if (type.includes('TAMPERING') || type.includes('ANTI_CHEAT')) return <AlertTriangle className="w-5 h-5" />;
    if (type.includes('MISMATCH') || type.includes('INVALID')) return <Shield className="w-5 h-5" />;
    return <Eye className="w-5 h-5" />;
  };

  const handleClearLog = () => {
    if (confirm('⚠️ Are you sure you want to clear the security log? This cannot be undone.')) {
      Security.clearSecurityLog();
      setSecurityLog([]);
    }
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsExiting(false);
    }, 300);
  };

  // If not authenticated, show PIN entry screen
  if (!isAuthenticated) {
    return (
      <div
        className={`fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 ${
          isExiting ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-300'
        }`}
        onClick={handleClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border-4 border-red-500 shadow-2xl max-w-md w-full overflow-hidden ${
            isExiting
              ? 'animate-out zoom-out-95 fade-out duration-300'
              : 'animate-in zoom-in-95 fade-in duration-300'
          }`}
        >
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 border-b-4 border-red-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-8 h-8 text-yellow-400" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Admin Access Required</h2>
                  <p className="text-red-200 text-sm">Enter PIN to continue</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-red-800 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>
          </div>
          
          <div className="p-8">
            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div>
                <label className="text-gray-300 text-sm mb-2 block">
                  🔒 Security PIN
                </label>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  maxLength={4}
                  className={`w-full px-4 py-3 bg-gray-800 text-white rounded-lg border-2 ${
                    pinError ? 'border-red-500 animate-shake' : 'border-gray-600'
                  } focus:border-yellow-500 focus:outline-none text-center text-2xl tracking-widest font-mono`}
                  autoFocus
                />
                {pinError && (
                  <p className="text-red-500 text-sm mt-2 text-center animate-in fade-in duration-300">
                    ❌ Invalid PIN. Access denied.
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={pinInput.length !== 4}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 disabled:from-gray-600 disabled:to-gray-700 text-black disabled:text-gray-400 font-bold py-3 rounded-lg transition-all disabled:cursor-not-allowed"
              >
                🔓 Unlock Dashboard
              </button>
            </form>
            
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <p className="text-gray-400 text-xs text-center">
                ⚠️ This dashboard is for administrators only. Unauthorized access is prohibited and logged.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 ${
        isExiting ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-300'
      }`}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl border-4 border-yellow-500 shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-hidden ${
          isExiting
            ? 'animate-out zoom-out-95 fade-out duration-300'
            : 'animate-in zoom-in-95 fade-in duration-300'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 border-b-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-yellow-400" />
              <div>
                <h2 className="text-3xl font-bold text-white">Security Dashboard</h2>
                <p className="text-red-200 text-sm">Anti-Cheat & Audit Log - Admin Authenticated ✓</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-red-800 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 bg-gray-800/50 border-b border-gray-700">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <label className="text-gray-300 text-sm">Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1 rounded border border-gray-600 focus:border-yellow-500 focus:outline-none"
              >
                {eventTypes.map(type => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'All Events' : type.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-300 text-sm">
                Total Events: <span className="text-yellow-400 font-bold">{filteredLog.length}</span>
              </span>
              <button
                onClick={handleClearLog}
                className="flex items-center gap-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Clear Log
              </button>
            </div>
          </div>
        </div>

        {/* Security Events Log */}
        <div className="overflow-y-auto max-h-96 p-4 space-y-2">
          {filteredLog.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-400">No security events detected</p>
              <p className="text-gray-500 text-sm">All systems secure!</p>
            </div>
          ) : (
            filteredLog.slice().reverse().map((event, index) => (
              <div
                key={index}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-4 hover:border-yellow-500/50 transition-colors animate-in fade-in slide-in-from-left-4 duration-300"
                style={{ animationDelay: `${index * 20}ms` }}
              >
                <div className="flex items-start gap-3">
                  <div className={getEventColor(event.type)}>
                    {getEventIcon(event.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className={`font-bold ${getEventColor(event.type)}`}>
                        {event.type.replace(/_/g, ' ')}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mb-2">
                      <p>Session ID: <span className="text-gray-300 font-mono">{event.sessionId}</span></p>
                    </div>
                    <div className="bg-gray-900/50 rounded p-2 text-xs text-gray-300 font-mono overflow-x-auto">
                      <pre>{JSON.stringify(event.data, null, 2)}</pre>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Stats */}
        <div className="bg-gray-800/50 border-t border-gray-700 p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-red-500">
                {securityLog.filter(e => e.type.includes('TAMPERING') || e.type.includes('ANTI_CHEAT')).length}
              </div>
              <div className="text-xs text-gray-400">Critical Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {securityLog.filter(e => e.type.includes('MISMATCH') || e.type.includes('INVALID')).length}
              </div>
              <div className="text-xs text-gray-400">Warnings</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {securityLog.filter(e => e.type.includes('RATE_LIMIT')).length}
              </div>
              <div className="text-xs text-gray-400">Rate Limits</div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
