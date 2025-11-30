import React, { useState } from 'react';
import { calculateExpectedPayout } from '../utils/betValidator';

/**
 * PAYOUT VERIFIER COMPONENT
 * Allows players to verify that all bet payouts are calculated correctly
 * This promotes transparency and trust in the game
 */

interface TestResult {
  betArea: string;
  betAmount: number;
  diceRoll: [number, number];
  total: number;
  gamePhase: 'comeOut' | 'point';
  point: number | null;
  expectedPayout: number;
  odds: string;
  result: string;
  calculation: string;
}

interface PayoutVerifierProps {
  onClose: () => void;
}

export function PayoutVerifier({ onClose }: PayoutVerifierProps) {
  const [betArea, setBetArea] = useState('passLine');
  const [betAmount, setBetAmount] = useState(10);
  const [die1, setDie1] = useState(3);
  const [die2, setDie2] = useState(4);
  const [gamePhase, setGamePhase] = useState<'comeOut' | 'point'>('comeOut');
  const [point, setPoint] = useState<number | null>(null);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  const betOptions = [
    { value: 'passLine', label: 'Pass Line' },
    { value: 'passLineOdds', label: 'Pass Line Odds' },
    { value: 'field', label: 'Field' },
    { value: 'hard4', label: 'Hard 4' },
    { value: 'hard6', label: 'Hard 6' },
    { value: 'hard8', label: 'Hard 8' },
    { value: 'hard10', label: 'Hard 10' },
    { value: 'place4', label: 'Place 4' },
    { value: 'place5', label: 'Place 5' },
    { value: 'place6', label: 'Place 6' },
    { value: 'place8', label: 'Place 8' },
    { value: 'place9', label: 'Place 9' },
    { value: 'place10', label: 'Place 10' },
    { value: 'anyCraps', label: 'Any Craps' },
    { value: 'anySeven', label: 'Any Seven' },
    { value: 'two', label: '2 (Snake Eyes)' },
    { value: 'three', label: '3 (Ace Deuce)' },
    { value: 'eleven', label: '11 (Yo)' },
    { value: 'twelve', label: '12 (Boxcars)' },
    { value: 'cande', label: 'C & E' },
  ];

  const runTest = () => {
    const total = die1 + die2;
    const isHard = die1 === die2;
    
    const result = calculateExpectedPayout(
      betArea,
      betAmount,
      total,
      point,
      isHard,
      gamePhase
    );

    const testResult: TestResult = {
      betArea,
      betAmount,
      diceRoll: [die1, die2],
      total,
      gamePhase,
      point,
      expectedPayout: result.payout,
      odds: result.odds,
      result: result.result,
      calculation: `$${betAmount} × ${result.odds} = $${result.payout.toFixed(2)}`
    };

    setTestResult(testResult);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-green-900 to-green-950 border-4 border-yellow-600 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 p-4 border-b-4 border-yellow-800 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-red-400 transition-colors text-2xl"
          >
            ×
          </button>
          <h2 className="text-center text-white">🔍 Payout Verifier</h2>
          <p className="text-center text-yellow-100 text-sm mt-1">
            Test any bet to verify payout calculations are fair and accurate
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* Bet Selection */}
          <div>
            <label className="block text-yellow-400 mb-2">Bet Type:</label>
            <select
              value={betArea}
              onChange={(e) => setBetArea(e.target.value)}
              className="w-full bg-green-950 border-2 border-yellow-600 text-white rounded p-2"
            >
              {betOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bet Amount */}
          <div>
            <label className="block text-yellow-400 mb-2">Bet Amount: ${betAmount}</label>
            <input
              type="range"
              min="1"
              max="1000"
              value={betAmount}
              onChange={(e) => setBetAmount(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Dice */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-yellow-400 mb-2">Die 1:</label>
              <select
                value={die1}
                onChange={(e) => setDie1(parseInt(e.target.value))}
                className="w-full bg-green-950 border-2 border-yellow-600 text-white rounded p-2"
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-yellow-400 mb-2">Die 2:</label>
              <select
                value={die2}
                onChange={(e) => setDie2(parseInt(e.target.value))}
                className="w-full bg-green-950 border-2 border-yellow-600 text-white rounded p-2"
              >
                {[1, 2, 3, 4, 5, 6].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Game Phase */}
          <div>
            <label className="block text-yellow-400 mb-2">Game Phase:</label>
            <select
              value={gamePhase}
              onChange={(e) => setGamePhase(e.target.value as 'comeOut' | 'point')}
              className="w-full bg-green-950 border-2 border-yellow-600 text-white rounded p-2"
            >
              <option value="comeOut">Come Out Roll</option>
              <option value="point">Point Phase</option>
            </select>
          </div>

          {/* Point (if in point phase) */}
          {gamePhase === 'point' && (
            <div>
              <label className="block text-yellow-400 mb-2">Point Number:</label>
              <select
                value={point || 4}
                onChange={(e) => setPoint(parseInt(e.target.value))}
                className="w-full bg-green-950 border-2 border-yellow-600 text-white rounded p-2"
              >
                {[2, 3, 4, 5, 6, 8, 9, 10, 11, 12].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          )}

          {/* Test Button */}
          <button
            onClick={runTest}
            className="w-full bg-gradient-to-b from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-bold py-3 rounded-lg border-2 border-yellow-700 shadow-lg transition-all"
          >
            🎲 Calculate Payout
          </button>

          {/* Results */}
          {testResult && (
            <div className="mt-6 bg-green-950/50 border-2 border-yellow-600 rounded-lg p-4 space-y-2">
              <h3 className="text-yellow-400 text-center mb-4">Test Results</h3>
              
              <div className="grid grid-cols-2 gap-2 text-white text-sm">
                <div className="text-yellow-400">Dice Roll:</div>
                <div>[{testResult.diceRoll[0]}, {testResult.diceRoll[1]}] = {testResult.total}</div>
                
                <div className="text-yellow-400">Bet:</div>
                <div>{testResult.betArea} - ${testResult.betAmount}</div>
                
                <div className="text-yellow-400">Odds:</div>
                <div>{testResult.odds}</div>
                
                <div className="text-yellow-400">Result:</div>
                <div className={`font-bold ${
                  testResult.result === 'win' ? 'text-green-400' : 
                  testResult.result === 'loss' ? 'text-red-400' : 
                  'text-yellow-400'
                }`}>
                  {testResult.result.toUpperCase()}
                </div>
                
                <div className="text-yellow-400">Payout:</div>
                <div className="font-bold text-green-400">
                  ${testResult.expectedPayout.toFixed(2)}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-yellow-600">
                <div className="text-yellow-400 text-sm mb-1">Calculation:</div>
                <div className="text-white text-center bg-green-900/50 p-2 rounded">
                  {testResult.calculation}
                </div>
              </div>

              {testResult.result === 'win' && (
                <div className="mt-4 p-3 bg-green-900/50 border border-green-600 rounded text-center">
                  <div className="text-green-400">✅ Winner!</div>
                  <div className="text-white text-sm mt-1">
                    You bet ${testResult.betAmount} and won ${testResult.expectedPayout.toFixed(2)}
                  </div>
                  <div className="text-green-300 text-sm mt-1">
                    Total return: ${(testResult.betAmount + testResult.expectedPayout).toFixed(2)}
                  </div>
                </div>
              )}

              {testResult.result === 'loss' && (
                <div className="mt-4 p-3 bg-red-900/50 border border-red-600 rounded text-center">
                  <div className="text-red-400">❌ Loser</div>
                  <div className="text-white text-sm mt-1">
                    You bet ${testResult.betAmount} and lost
                  </div>
                </div>
              )}

              {testResult.result === 'keep' && (
                <div className="mt-4 p-3 bg-blue-900/50 border border-blue-600 rounded text-center">
                  <div className="text-blue-400">🎲 Bet Stays</div>
                  <div className="text-white text-sm mt-1">
                    This bet remains on the table for the next roll
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-900/30 border border-blue-600 rounded text-sm text-blue-200">
            <h4 className="text-blue-400 font-bold mb-2">ℹ️ How to Use:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Select a bet type and amount</li>
              <li>Set the dice roll you want to test</li>
              <li>Choose game phase (Come Out or Point)</li>
              <li>If Point phase, select the point number</li>
              <li>Click "Calculate Payout" to see the result</li>
            </ul>
            <div className="mt-3 text-blue-300">
              This tool uses the exact same payout calculation logic as the live game.
              All results are transparent and verifiable.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
