import React from 'react';
import { Shield, CheckCircle, AlertTriangle, Lock, Eye, Code } from 'lucide-react';

interface FairnessModalProps {
  onClose: () => void;
}

export function FairnessModal({ onClose }: FairnessModalProps) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-green-900 to-green-950 border-4 border-yellow-600 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-emerald-700 p-6 border-b-4 border-yellow-800 sticky top-0 z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors text-3xl"
          >
            ×
          </button>
          <div className="flex items-center justify-center gap-3 mb-2">
            <Shield className="w-10 h-10 text-yellow-400" />
            <h2 className="text-white">Fairness & Transparency</h2>
          </div>
          <p className="text-center text-yellow-100 text-sm">
            Complete documentation of our anti-cheat and fairness systems
          </p>
        </div>

        <div className="p-6 space-y-6">
          {/* Our Commitment */}
          <section className="bg-green-950/50 border-2 border-emerald-600 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <h3 className="text-yellow-400">Our Commitment to Fair Play</h3>
            </div>
            <p className="text-white text-sm leading-relaxed">
              Rollers Paradise is committed to providing a completely fair and transparent gaming experience. 
              Every roll is validated, every payout is verified, and all calculations are logged for your review.
            </p>
          </section>

          {/* Validation System */}
          <section className="bg-green-950/50 border-2 border-yellow-600 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-6 h-6 text-yellow-400" />
              <h3 className="text-yellow-400">Real-Time Bet Validation</h3>
            </div>
            <div className="space-y-3 text-sm text-white">
              <p>Every single roll is validated using our comprehensive validation system:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-green-200">
                <li>Calculates expected payouts based on authentic casino odds</li>
                <li>Compares expected vs actual payouts for every bet</li>
                <li>Logs all discrepancies to browser console</li>
                <li>Maintains history of last 100 rolls with full validation data</li>
              </ul>
              <div className="bg-green-900/50 p-3 rounded border border-green-600 mt-3">
                <div className="text-green-300 text-xs font-mono">
                  <div>✅ VALIDATION PASSED - Roll #42</div>
                  <div>🎲 Dice: [3, 4] = 7</div>
                  <div>💰 Pass Line ($10): Expected $0 | Actual $0 | ✅ MATCH</div>
                  <div>💰 Any Seven ($5): Expected $25 | Actual $25 | ✅ MATCH</div>
                </div>
              </div>
            </div>
          </section>

          {/* Verification Tools */}
          <section className="bg-green-950/50 border-2 border-blue-600 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-6 h-6 text-blue-400" />
              <h3 className="text-yellow-400">Player Verification Tools</h3>
            </div>
            <div className="space-y-3 text-sm">
              <div className="bg-blue-950/30 border border-blue-600 rounded p-3">
                <div className="font-bold text-blue-300 mb-1">🔍 Payout Verifier Tool</div>
                <p className="text-white">
                  Click the 🔍 button in the header to access our payout verification tool. 
                  Test any bet with any dice roll to verify calculations are correct.
                </p>
              </div>
              
              <div className="bg-blue-950/30 border border-blue-600 rounded p-3">
                <div className="font-bold text-blue-300 mb-1">💻 Console Debug Commands</div>
                <p className="text-white mb-2">Open browser console (F12) and use:</p>
                <div className="font-mono text-xs text-green-300 space-y-1 bg-gray-900 p-2 rounded">
                  <div>window.exportValidationHistory() - View all validations</div>
                  <div>window.showLastRoll() - Detailed last roll analysis</div>
                  <div>window.auditBalance() - Complete balance audit</div>
                </div>
              </div>
            </div>
          </section>

          {/* Balance Transparency */}
          <section className="bg-green-950/50 border-2 border-purple-600 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Code className="w-6 h-6 text-purple-400" />
              <h3 className="text-yellow-400">Complete Balance Transparency</h3>
            </div>
            <div className="text-sm text-white space-y-2">
              <p>Every balance change is logged to the console:</p>
              <div className="bg-gray-900 p-3 rounded border border-purple-600 font-mono text-xs space-y-1">
                <div className="text-blue-300">💰 BET PLACED: passLine - $10</div>
                <div className="text-green-300">   Balance: $1000.00 → $990.00</div>
                <div className="text-yellow-300 mt-2">💰 ROLL RESULT: WIN - +$20.00</div>
                <div className="text-green-300">   Balance: $990.00 → $1010.00</div>
              </div>
            </div>
          </section>

          {/* Random Number Generation */}
          <section className="bg-green-950/50 border-2 border-red-600 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <h3 className="text-yellow-400">Cryptographically Secure Dice Rolls</h3>
            </div>
            <div className="text-sm text-white space-y-2">
              <p>All dice rolls use <code className="text-yellow-300 bg-gray-900 px-1 rounded">crypto.getRandomValues()</code>:</p>
              <ul className="list-disc list-inside space-y-1 ml-4 text-red-200">
                <li>Cryptographically secure random number generation</li>
                <li>Impossible to predict or manipulate</li>
                <li>Browser-native, industry-standard security</li>
                <li>Same RNG for single-player and multiplayer</li>
              </ul>
            </div>
          </section>

          {/* Quick Verification Guide */}
          <section className="bg-gradient-to-r from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500 rounded-lg p-4">
            <h3 className="text-yellow-400 mb-3">🎯 Quick Verification Guide</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-white ml-4">
              <li>Open browser console (Press <kbd className="bg-gray-800 px-2 py-1 rounded text-xs">F12</kbd>)</li>
              <li>Place bets and roll the dice</li>
              <li>Watch the validation logs appear in real-time</li>
              <li>Run <code className="text-green-300 bg-gray-900 px-1 rounded">window.auditBalance()</code> for complete audit</li>
              <li>Use the 🔍 Payout Verifier to test specific scenarios</li>
            </ol>
          </section>

          {/* Guarantees */}
          <section className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-500 rounded-lg p-4">
            <h3 className="text-green-400 mb-3">✅ Our Guarantees</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-start gap-2 text-white">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Truly random dice rolls (cryptographic RNG)</span>
              </div>
              <div className="flex items-start gap-2 text-white">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Authentic casino odds on all bets</span>
              </div>
              <div className="flex items-start gap-2 text-white">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Every roll validated and logged</span>
              </div>
              <div className="flex items-start gap-2 text-white">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Complete transparency via console</span>
              </div>
              <div className="flex items-start gap-2 text-white">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Player-accessible verification tools</span>
              </div>
              <div className="flex items-start gap-2 text-white">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <span>Zero tolerance for cheating</span>
              </div>
            </div>
          </section>

          {/* Report Issues */}
          <section className="bg-red-950/30 border-2 border-red-600 rounded-lg p-4">
            <h3 className="text-red-400 mb-2">🛡️ Report Suspicious Activity</h3>
            <p className="text-white text-sm mb-2">
              If you notice any incorrect payouts, balance discrepancies, or validation failures:
            </p>
            <div className="bg-red-900/50 p-3 rounded border border-red-600 text-sm">
              <div className="text-red-200">
                <div><strong>Email:</strong> avgelatt@gmail.com</div>
                <div><strong>Subject:</strong> "Fairness Issue - Rollers Paradise"</div>
                <div className="mt-2 text-xs">Include console logs, screenshots, and validation history export</div>
              </div>
            </div>
          </section>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-b from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold py-3 rounded-lg border-2 border-yellow-700 shadow-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
