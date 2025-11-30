import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight, BookOpen, CheckCircle, Dices, Target, Trophy, DollarSign, AlertCircle, Sparkles, TrendingUp, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  visual?: 'table' | 'dice' | 'chips' | 'passline' | 'field' | 'place' | 'hardway' | 'comeout' | 'point';
  tips?: string[];
  highlight?: string;
  important?: string[];
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: '🎰 Welcome to Rollers Paradise!',
    content: 'Welcome to the most exciting and beginner-friendly craps game online! This comprehensive tutorial will walk you through everything step-by-step. Don\'t worry - we make it super easy to learn!',
    visual: 'dice',
    tips: [
      '🎯 Designed for complete beginners',
      '👴 Perfect for elderly players - large text, clear visuals',
      '💰 All money is FAKE - practice risk-free!',
      '🔄 You can replay this tutorial anytime',
      '⏰ Take your time - no pressure, no rush',
    ],
    highlight: 'This is the easiest way to learn craps - guaranteed!',
  },
  {
    id: 'what-is-craps',
    title: '🎲 What is Craps?',
    content: 'Craps is a fun dice game played with TWO dice. You\'re the "shooter" - the person rolling the dice. The goal is simple: predict what numbers the dice will show!',
    visual: 'dice',
    tips: [
      '🎲 Two dice are rolled each time',
      '🔢 Dice totals range from 2 (snake eyes) to 12 (boxcars)',
      '🎯 You bet on what numbers will be rolled',
      '💡 The number 7 is the MOST IMPORTANT number',
      '✅ You can place multiple different bets',
    ],
    important: [
      'Think of it like predicting coin flips, but with dice!',
      'The casino doesn\'t play against you - the dice decide everything',
    ],
  },
  {
    id: 'table-layout',
    title: '🟢 Understanding the Table',
    content: 'The craps table has different betting areas. Each area represents a different type of bet you can make. Don\'t worry about memorizing everything - we\'ll go through the important ones!',
    visual: 'table',
    tips: [
      '🟢 PASS LINE: The main betting area (bottom of table)',
      '🌾 FIELD: Quick one-roll bets (middle area)',
      '📍 PLACE BETS: Bet on specific numbers (4, 5, 6, 8, 9, 10)',
      '💎 HARDWAYS: Special bets for doubles (risky but fun)',
      '🎯 COME AREA: Advanced betting (learn later)',
    ],
    highlight: 'Focus on PASS LINE first - it\'s the easiest and most popular bet!',
  },
  {
    id: 'come-out-roll',
    title: '🎯 The Come-Out Roll (Starting a Round)',
    content: 'Every round starts with a "Come-Out Roll". This first roll determines what happens next. In Crapless Craps, you can NEVER lose on the come-out roll - that\'s why it\'s called "crapless"!',
    visual: 'comeout',
    tips: [
      '🎲 First roll of each round = Come-Out Roll',
      '🎉 Roll a 7 → INSTANT WIN for Pass Line bets!',
      '🎯 Roll 2, 3, 11, or 12 → That becomes "the point" (you must roll it again)',
      '📍 Roll 4, 5, 6, 8, 9, or 10 → Also becomes "the point"',
      '🔵 A blue puck marks the point number',
      '↩️ The round continues until point is made or 7 is rolled',
    ],
    important: [
      'In regular craps: 7 and 11 win, 2/3/12 lose instantly',
      'In Crapless Craps: ONLY 7 wins instantly. ALL other numbers (2-6, 8-12) become the point!',
      'You can NEVER lose on come-out roll in crapless craps!',
    ],
    highlight: '7 on come-out = INSTANT WIN! Any other number = your new point target',
  },
  {
    id: 'making-point',
    title: '🏆 Making the Point (Winning!)',
    content: 'Once a point is established, your goal is simple: roll that same point number AGAIN before rolling a 7. If you do, YOU WIN! If you roll a 7 first, the round ends (called "sevening out").',
    visual: 'point',
    tips: [
      '🎯 Point number is clearly marked with a blue puck',
      '✅ Roll the point number again = BIG WIN!',
      '❌ Roll a 7 before the point = Seven Out (round ends, bets lost)',
      '😊 All other numbers don\'t matter - keep rolling!',
      '🔄 After win or seven-out, new come-out roll starts',
    ],
    important: [
      'Example: Point is 8. Keep rolling until you get another 8 (win!) or a 7 (lose)',
      'Rolling 2, 3, 4, 5, 6, 9, 10, 11, 12 during point phase = nothing happens, just keep rolling',
    ],
    highlight: 'Point number + 7 are the only numbers that matter during point phase!',
  },
  {
    id: 'pass-line-bet',
    title: '✅ Pass Line Bet (START HERE!)',
    content: 'The Pass Line is the BEST bet for beginners. It\'s the most popular bet in craps because it\'s simple and has great odds. This is where you should start!',
    visual: 'passline',
    tips: [
      '🎯 Place chips on the "PASS LINE" area before come-out roll',
      '🎉 Win if 7 is rolled on come-out',
      '🎯 Win if point is made after come-out',
      '💰 Pays 1:1 (even money) - bet $10, win $10',
      '📊 House edge is only 2.3% (very fair!)',
      '⭐ This is the foundation of craps - master this first!',
    ],
    important: [
      'You\'re betting WITH the shooter (yourself)',
      'Most players at real casinos bet Pass Line',
      'Minimum bet is usually $3',
    ],
    highlight: 'Start EVERY game with a Pass Line bet until you\'re comfortable!',
  },
  {
    id: 'field-bet',
    title: '🌾 Field Bet (Quick & Easy!)',
    content: 'Field bets are one-roll bets - they win or lose on the very next roll! Perfect for adding extra excitement. You win if the next roll is: 2, 3, 4, 9, 10, 11, or 12.',
    visual: 'field',
    tips: [
      '🌾 Place chips in the "FIELD" area',
      '✅ Win on: 2, 3, 4, 9, 10, 11, 12',
      '❌ Lose on: 5, 6, 7, 8',
      '💎 Pays 2:1 on rolls of 2 and 12 (double your money!)',
      '💰 Pays 1:1 on other winning numbers (3, 4, 9, 10, 11)',
      '⚡ Result is instant - no waiting!',
    ],
    important: [
      'Great for adding action between Pass Line bets',
      'Easy to understand - good for beginners',
      'Can place and remove every single roll',
    ],
    highlight: 'Field bets resolve immediately - instant gratification!',
  },
  {
    id: 'place-bets',
    title: '📍 Place Bets (Choose Your Number)',
    content: 'Place bets let you pick a specific number and bet it will be rolled before a 7. Available numbers are: 4, 5, 6, 8, 9, and 10. These bets stay active until they win or you seven-out.',
    visual: 'place',
    tips: [
      '🎯 Click on a number box to place your bet',
      '✅ Win if that number is rolled before a 7',
      '❌ Lose if a 7 is rolled first',
      '💰 Different numbers pay different amounts:',
      '  • 6 and 8 pay the most often (pay 7:6)',
      '  • 5 and 9 pay medium (pay 3:2)',
      '  • 4 and 10 pay the least often but more (pay 2:1)',
    ],
    important: [
      'Numbers closer to 7 are rolled more often, so they pay less',
      '6 and 8 are the best place bets for beginners',
      'You can have multiple place bets at once',
    ],
    highlight: 'Start with 6 and 8 - they\'re rolled the most after 7!',
  },
  {
    id: 'hardway-bets',
    title: '💎 Hardway Bets (High Risk, High Reward)',
    content: 'Hardway bets are exciting prop bets. You win if you roll doubles (like 2+2 for hard 4). You lose if the number comes the "easy way" (3+1) or if a 7 is rolled.',
    visual: 'hardway',
    tips: [
      '💎 Hard 4 = Roll 2+2 (pays 7:1)',
      '💎 Hard 6 = Roll 3+3 (pays 9:1)',
      '💎 Hard 8 = Roll 4+4 (pays 9:1)',
      '💎 Hard 10 = Roll 5+5 (pays 7:1)',
      '⚠️ These are RISKY bets - bet small amounts',
      '🎉 But when they hit, the payout is BIG!',
    ],
    important: [
      'Example Hard 4: WIN on 2+2, LOSE on 1+3 or 7',
      'These are for fun and excitement, not steady wins',
      'Professional players use these sparingly',
    ],
    highlight: 'Hardways are exciting but risky - perfect for adding thrills!',
  },
  {
    id: 'bankroll-management',
    title: '💰 Smart Chip Management',
    content: 'Managing your chips (bankroll) is crucial for having fun longer! Set limits, bet smart, and remember - this is all fake money, so it\'s perfect for learning!',
    visual: 'chips',
    tips: [
      '💵 Start with small bets ($3-$10) while learning',
      '📊 Don\'t bet more than 5% of your chips on risky bets',
      '⏸️ Take breaks when needed - no rush!',
      '🏪 Visit Casino Store to buy more chips',
      '🎁 Claim FREE daily bonuses every day',
      '📈 As you learn, you can increase bet sizes',
    ],
    important: [
      'Set a "loss limit" - decide when to take a break',
      'Celebrate wins but don\'t chase losses',
      'It\'s fake money - use this to practice safely!',
    ],
    highlight: 'Bet small while learning, bet bigger when comfortable!',
  },
  {
    id: 'game-flow',
    title: '🔄 Understanding Game Flow',
    content: 'Let\'s put it all together! Here\'s exactly what happens in a typical round from start to finish.',
    tips: [
      '1️⃣ BEFORE COME-OUT: Place Pass Line bet ($3 minimum)',
      '2️⃣ COME-OUT ROLL: Roll dice - hoping for 7!',
      '3️⃣ IF 7: You win! New come-out roll starts',
      '4️⃣ IF OTHER NUMBER: That\'s the point (marked with puck)',
      '5️⃣ POINT PHASE: Keep rolling until you hit point or 7',
      '6️⃣ MADE POINT: You win! New come-out roll',
      '7️⃣ SEVEN OUT: Round ends, new come-out roll starts',
    ],
    important: [
      'Every round follows this exact pattern',
      'Come-out → Point → Resolution → Repeat',
      'Once you understand this flow, craps becomes easy!',
    ],
    highlight: 'After a few rounds, this flow becomes second nature!',
  },
  {
    id: 'accessibility',
    title: '♿ Accessibility Features',
    content: 'Rollers Paradise is designed for EVERYONE, including elderly players and those with accessibility needs. We have tons of helpful features!',
    tips: [
      '🔍 Large, clear text throughout the game',
      '🗣️ Voice announcements from the dealer',
      '🔊 Adjustable volume controls for every sound',
      '🎨 High contrast mode for better visibility',
      '⏰ No time pressure - bet at your own pace',
      '📚 This tutorial is always available in Help menu',
      '⚙️ Customize everything in Settings',
    ],
    important: [
      'Go to Settings → Accessibility for more options',
      'Enable Screen Reader mode if needed',
      'Adjust text size with Large Text mode',
      'Use Color Blind modes if helpful',
    ],
    highlight: 'We want everyone to enjoy craps - customize it your way!',
  },
  {
    id: 'practice-tips',
    title: '🎯 Practice Tips for Success',
    content: 'Now that you know the basics, here are some pro tips to help you become a great craps player!',
    tips: [
      '🎲 Start in SINGLE PLAYER mode to practice',
      '✅ Focus on Pass Line bets for first 10-20 rounds',
      '📊 Add Field bets once comfortable',
      '🎯 Try Place bets on 6 and 8 next',
      '💎 Save Hardways for when you\'re feeling lucky',
      '👥 Join MULTIPLAYER when you\'re ready',
      '🏆 Complete daily challenges for bonuses',
    ],
    important: [
      'Don\'t try to learn everything at once',
      'Master Pass Line, then add other bets gradually',
      'Watch your chips grow as you get better!',
    ],
    highlight: 'Practice makes perfect - you\'ll be a pro in no time!',
  },
  {
    id: 'ready-to-play',
    title: '🎉 You\'re Ready to Roll!',
    content: 'Congratulations! You now know everything you need to start playing craps with confidence. Remember: start simple with Pass Line bets, take your time, and most importantly - HAVE FUN!',
    tips: [
      '🎯 Start with Pass Line and Field bets',
      '💰 Bet small amounts while learning ($3-$10)',
      '📚 Replay this tutorial anytime (Help → Tutorial)',
      '⚙️ Adjust settings to your preferences',
      '👥 Join our community when ready',
      '🎁 Don\'t forget your daily bonuses!',
      '🎲 Practice is FREE - experiment and learn!',
    ],
    important: [
      'All money is FAKE - use this to practice safely',
      'There\'s no pressure or time limits',
      'Ask for help in chat if you need it',
      'Everyone was a beginner once - you\'ve got this!',
    ],
    highlight: 'Welcome to Rollers Paradise - let\'s roll some dice! 🎲🎲',
  },
];

// Visual components for each type
function VisualGuide({ type }: { type: TutorialStep['visual'] }) {
  if (!type) return null;

  const baseBoxStyle = "rounded-xl p-6 border-4 shadow-2xl";
  const glowStyle = "shadow-[0_0_30px_rgba(251,191,36,0.5)]";

  switch (type) {
    case 'dice':
      return (
        <div className={`${baseBoxStyle} ${glowStyle} bg-gradient-to-br from-red-600 to-red-800 border-red-300 mb-8`}>
          <div className="flex justify-center gap-8 items-center">
            {/* Die 1 - showing 5 */}
            <motion.div
              animate={{ rotateY: [0, 360], rotateX: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 bg-white rounded-2xl shadow-2xl flex items-center justify-center relative border-4 border-gray-300"
            >
              {/* 5 dot pattern */}
              <div className="relative w-full h-full p-3">
                {/* Top-left */}
                <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-black"></div>
                {/* Top-right */}
                <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-black"></div>
                {/* Center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black"></div>
                {/* Bottom-left */}
                <div className="absolute bottom-3 left-3 w-4 h-4 rounded-full bg-black"></div>
                {/* Bottom-right */}
                <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-black"></div>
              </div>
            </motion.div>
            {/* Die 2 - showing 6 */}
            <motion.div
              animate={{ rotateY: [360, 0], rotateX: [360, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 bg-white rounded-2xl shadow-2xl flex items-center justify-center relative border-4 border-gray-300"
            >
              {/* 6 dot pattern */}
              <div className="relative w-full h-full p-3">
                {/* Left column */}
                <div className="absolute top-3 left-3 w-4 h-4 rounded-full bg-black"></div>
                <div className="absolute top-1/2 -translate-y-1/2 left-3 w-4 h-4 rounded-full bg-black"></div>
                <div className="absolute bottom-3 left-3 w-4 h-4 rounded-full bg-black"></div>
                {/* Right column */}
                <div className="absolute top-3 right-3 w-4 h-4 rounded-full bg-black"></div>
                <div className="absolute top-1/2 -translate-y-1/2 right-3 w-4 h-4 rounded-full bg-black"></div>
                <div className="absolute bottom-3 right-3 w-4 h-4 rounded-full bg-black"></div>
              </div>
            </motion.div>
          </div>
          <p className="text-center mt-4 text-white text-xl font-bold">Two Dice = Endless Possibilities!</p>
        </div>
      );

    case 'table':
      return (
        <div className={`${baseBoxStyle} bg-gradient-to-br from-green-800 to-green-950 border-yellow-400 mb-8`}>
          <div className="space-y-4">
            {/* Pass Line */}
            <div className="bg-white/10 border-2 border-yellow-400 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center text-2xl">✅</div>
                <div>
                  <p className="text-yellow-400 font-bold text-xl">PASS LINE</p>
                  <p className="text-white text-sm">Main betting area - Start here!</p>
                </div>
              </div>
            </div>
            {/* Field */}
            <div className="bg-white/10 border-2 border-green-400 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-400 flex items-center justify-center text-2xl">🌾</div>
                <div>
                  <p className="text-green-400 font-bold text-xl">FIELD</p>
                  <p className="text-white text-sm">One-roll bets - Quick action!</p>
                </div>
              </div>
            </div>
            {/* Place Bets */}
            <div className="grid grid-cols-6 gap-2">
              {[4, 5, 6, 8, 9, 10].map(num => (
                <div key={num} className="bg-blue-600 rounded-lg p-3 text-center border-2 border-blue-300">
                  <p className="text-white font-bold text-2xl">{num}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-yellow-400 text-sm">Place Bets - Bet on specific numbers</p>
          </div>
        </div>
      );

    case 'comeout':
      return (
        <div className={`${baseBoxStyle} ${glowStyle} bg-gradient-to-br from-purple-600 to-purple-900 border-yellow-400 mb-8`}>
          <div className="text-center space-y-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block"
            >
              <Dices className="w-24 h-24 text-yellow-400 mx-auto" />
            </motion.div>
            <div className="bg-white/20 rounded-xl p-6">
              <p className="text-3xl font-bold text-yellow-400 mb-4">Come-Out Roll</p>
              <div className="grid grid-cols-2 gap-4 text-white">
                <div className="bg-green-600 rounded-lg p-4">
                  <p className="text-4xl mb-2">7️⃣</p>
                  <p className="font-bold">WINNER!</p>
                  <p className="text-sm">Pass Line wins</p>
                </div>
                <div className="bg-blue-600 rounded-lg p-4">
                  <p className="text-4xl mb-2">2-6, 8-12</p>
                  <p className="font-bold">POINT SET</p>
                  <p className="text-sm">Marked with puck</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'point':
      return (
        <div className={`${baseBoxStyle} ${glowStyle} bg-gradient-to-br from-blue-600 to-blue-900 border-yellow-400 mb-8`}>
          <div className="text-center space-y-6">
            <div className="bg-white rounded-full w-32 h-32 mx-auto flex items-center justify-center border-8 border-yellow-400">
              <div>
                <p className="text-sm text-gray-600">POINT</p>
                <p className="text-6xl font-bold text-blue-600">8</p>
              </div>
            </div>
            <p className="text-2xl text-yellow-400 font-bold">Goal: Roll another 8 before rolling a 7!</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-600 rounded-xl p-4">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                <p className="text-white font-bold">Roll 8 = WIN</p>
              </div>
              <div className="bg-red-600 rounded-xl p-4">
                <X className="w-12 h-12 text-white mx-auto mb-2" />
                <p className="text-white font-bold">Roll 7 = Seven Out</p>
              </div>
            </div>
          </div>
        </div>
      );

    case 'passline':
      return (
        <div className={`${baseBoxStyle} bg-gradient-to-br from-green-600 to-green-800 border-yellow-400 mb-8`}>
          <div className="text-center space-y-4">
            <CheckCircle className="w-20 h-20 text-yellow-400 mx-auto" />
            <p className="text-3xl font-bold text-yellow-400">PASS LINE BET</p>
            <div className="bg-white/20 rounded-xl p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white">Minimum Bet:</span>
                <span className="text-yellow-400 font-bold text-xl">$3</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">Payout:</span>
                <span className="text-yellow-400 font-bold text-xl">1:1 (Even Money)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white">House Edge:</span>
                <span className="text-green-400 font-bold text-xl">2.3% (Great!)</span>
              </div>
            </div>
            <div className="bg-yellow-400 text-green-900 rounded-xl p-4 font-bold text-xl">
              🌟 BEST BET FOR BEGINNERS! 🌟
            </div>
          </div>
        </div>
      );

    case 'field':
      return (
        <div className={`${baseBoxStyle} bg-gradient-to-br from-amber-600 to-amber-800 border-yellow-300 mb-8`}>
          <div className="space-y-4">
            <p className="text-3xl font-bold text-yellow-200 text-center">FIELD BET</p>
            <div className="grid grid-cols-7 gap-2">
              {[2, 3, 4, 9, 10, 11, 12].map(num => (
                <div key={num} className="bg-green-500 rounded-lg p-3 text-center border-2 border-green-300">
                  <p className="text-white font-bold text-2xl">{num}</p>
                  <p className="text-xs text-white">{num === 2 || num === 12 ? '2:1' : '1:1'}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-yellow-200 font-bold">WIN on these numbers ☝️</p>
            <div className="grid grid-cols-4 gap-2">
              {[5, 6, 7, 8].map(num => (
                <div key={num} className="bg-red-600 rounded-lg p-3 text-center border-2 border-red-400 opacity-50">
                  <p className="text-white font-bold text-2xl line-through">{num}</p>
                  <p className="text-xs text-white">LOSE</p>
                </div>
              ))}
            </div>
            <p className="text-center text-red-200 font-bold">LOSE on these numbers ☝️</p>
          </div>
        </div>
      );

    case 'place':
      return (
        <div className={`${baseBoxStyle} bg-gradient-to-br from-indigo-600 to-indigo-900 border-yellow-400 mb-8`}>
          <p className="text-3xl font-bold text-yellow-400 text-center mb-6">PLACE BETS</p>
          <div className="space-y-3">
            <div className="bg-green-600 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="text-3xl font-bold text-white">6</span>
                  <span className="text-3xl font-bold text-white">8</span>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold">BEST ODDS</p>
                  <p className="text-white text-sm">Rolled most often</p>
                  <p className="text-green-200 text-sm">Pays 7:6</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-600 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="text-3xl font-bold text-white">5</span>
                  <span className="text-3xl font-bold text-white">9</span>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold">MEDIUM ODDS</p>
                  <p className="text-white text-sm">Rolled often</p>
                  <p className="text-blue-200 text-sm">Pays 3:2</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-600 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <span className="text-3xl font-bold text-white">4</span>
                  <span className="text-3xl font-bold text-white">10</span>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold">RISKY</p>
                  <p className="text-white text-sm">Rolled less often</p>
                  <p className="text-purple-200 text-sm">Pays 2:1</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case 'hardway':
      return (
        <div className={`${baseBoxStyle} bg-gradient-to-br from-pink-600 to-pink-900 border-yellow-400 mb-8`}>
          <div className="text-center space-y-4">
            <Sparkles className="w-20 h-20 text-yellow-400 mx-auto" />
            <p className="text-3xl font-bold text-yellow-400">HARDWAY BETS</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/20 rounded-xl p-4">
                <p className="text-4xl mb-2">🎲🎲</p>
                <p className="text-2xl font-bold text-white">Hard 4</p>
                <p className="text-yellow-400 text-xl">2 + 2</p>
                <p className="text-green-400 font-bold">Pays 7:1</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <p className="text-4xl mb-2">🎲🎲</p>
                <p className="text-2xl font-bold text-white">Hard 6</p>
                <p className="text-yellow-400 text-xl">3 + 3</p>
                <p className="text-green-400 font-bold">Pays 9:1</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <p className="text-4xl mb-2">🎲🎲</p>
                <p className="text-2xl font-bold text-white">Hard 8</p>
                <p className="text-yellow-400 text-xl">4 + 4</p>
                <p className="text-green-400 font-bold">Pays 9:1</p>
              </div>
              <div className="bg-white/20 rounded-xl p-4">
                <p className="text-4xl mb-2">🎲🎲</p>
                <p className="text-2xl font-bold text-white">Hard 10</p>
                <p className="text-yellow-400 text-xl">5 + 5</p>
                <p className="text-green-400 font-bold">Pays 7:1</p>
              </div>
            </div>
            <div className="bg-red-600 rounded-xl p-4">
              <AlertCircle className="w-8 h-8 text-white mx-auto mb-2" />
              <p className="text-white font-bold">HIGH RISK - Bet small amounts!</p>
            </div>
          </div>
        </div>
      );

    case 'chips':
      return (
        <div className={`${baseBoxStyle} bg-gradient-to-br from-teal-600 to-teal-900 border-yellow-400 mb-8`}>
          <div className="text-center space-y-6">
            <DollarSign className="w-20 h-20 text-yellow-400 mx-auto" />
            <p className="text-3xl font-bold text-yellow-400">SMART BANKROLL</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white rounded-full w-24 h-24 mx-auto flex items-center justify-center border-8 border-red-500">
                <p className="text-3xl font-bold text-gray-800">$3</p>
              </div>
              <div className="bg-white rounded-full w-24 h-24 mx-auto flex items-center justify-center border-8 border-blue-500">
                <p className="text-3xl font-bold text-gray-800">$5</p>
              </div>
              <div className="bg-white rounded-full w-24 h-24 mx-auto flex items-center justify-center border-8 border-green-500">
                <p className="text-3xl font-bold text-gray-800">$10</p>
              </div>
            </div>
            <div className="bg-white/20 rounded-xl p-6">
              <TrendingUp className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <p className="text-white font-bold text-xl mb-2">Start Small, Win Big!</p>
              <p className="text-gray-200">Bet $3-$10 while learning</p>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}

export function InteractiveTutorial({ isOpen, onClose, onComplete }: InteractiveTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isOpen) {
      // Load completed steps
      const saved = localStorage.getItem('tutorial-progress');
      if (saved) {
        try {
          const progress = JSON.parse(saved);
          setCompletedSteps(new Set(progress.completedSteps || []));
        } catch (e) {
          console.error('Error loading tutorial progress:', e);
        }
      }
    }
  }, [isOpen]);

  const handleNext = () => {
    // Mark current step as completed
    const newCompleted = new Set(completedSteps);
    newCompleted.add(tutorialSteps[currentStep].id);
    setCompletedSteps(newCompleted);

    // Save progress
    localStorage.setItem('tutorial-progress', JSON.stringify({
      completedSteps: Array.from(newCompleted),
      lastStep: currentStep + 1,
    }));

    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Tutorial completed
      localStorage.setItem('tutorial-completed', 'true');
      if (onComplete) {
        onComplete();
      }
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    // Save progress before closing
    localStorage.setItem('tutorial-progress', JSON.stringify({
      completedSteps: Array.from(completedSteps),
      lastStep: currentStep,
    }));
    
    // Mark as skipped if user closes before finishing
    if (currentStep < tutorialSteps.length - 1) {
      localStorage.setItem('tutorial-skipped', 'true');
      console.log('⏭️ Tutorial skipped by user');
    }
    
    onClose();
  };

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];
  const progress = ((currentStep + 1) / tutorialSteps.length) * 100;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8"
      style={{
        background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.92) 0%, rgba(0, 0, 0, 0.97) 100%)',
        backdropFilter: 'blur(12px)',
      }}
      onClick={(e) => {
        // Close if clicking backdrop
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.3 }}
          className="rounded-3xl shadow-2xl w-full border-4 overflow-hidden"
          style={{
            maxWidth: '1000px',
            maxHeight: '90vh',
            background: 'linear-gradient(135deg, #14532d 0%, #15803d 15%, #16a34a 30%, #15803d 45%, #14532d 60%, #15803d 75%, #16a34a 90%, #15803d 100%)',
            borderColor: '#fbbf24',
            boxShadow: '0 0 80px rgba(251, 191, 36, 0.7), 0 25px 100px rgba(0, 0, 0, 0.9)',
          }}
        >
          {/* HEADER */}
          <div
            className="p-6 flex justify-between items-center border-b-4"
            style={{
              background: 'linear-gradient(135deg, #b45309 0%, #d97706 20%, #f59e0b 40%, #fbbf24 50%, #f59e0b 60%, #d97706 80%, #b45309 100%)',
              borderColor: '#fbbf24',
              boxShadow: '0 6px 25px rgba(0, 0, 0, 0.6)',
            }}
          >
            <div className="flex items-center gap-4">
              <BookOpen className="w-12 h-12" style={{ color: '#fef3c7' }} />
              <div>
                <h2
                  className="text-3xl font-bold"
                  style={{
                    color: '#fef3c7',
                    textShadow: '0 0 20px rgba(251, 191, 36, 0.9), 0 2px 4px rgba(0,0,0,0.8)',
                  }}
                >
                  Craps Tutorial for Beginners
                </h2>
                <p className="text-lg" style={{ color: '#86efac', textShadow: '0 1px 2px rgba(0,0,0,0.8)' }}>
                  Step {currentStep + 1} of {tutorialSteps.length}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="transition-all hover:scale-110 hover:rotate-90 p-2 rounded-full"
              style={{ 
                color: '#fef3c7',
                background: 'rgba(0,0,0,0.3)',
              }}
              aria-label="Close tutorial"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* PROGRESS BAR */}
          <div className="bg-gray-900 h-3">
            <motion.div
              className="h-full"
              style={{
                background: 'linear-gradient(90deg, #22c55e 0%, #fbbf24 50%, #f59e0b 100%)',
                boxShadow: '0 0 15px rgba(251, 191, 36, 0.8)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* SCROLLABLE CONTENT */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
            <div className="p-8 md:p-12">
              <motion.h3
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-4xl md:text-5xl font-bold mb-6"
                style={{
                  color: '#fbbf24',
                  textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)',
                }}
              >
                {step.title}
              </motion.h3>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-2xl mb-8 leading-relaxed"
                style={{ color: '#f3f4f6' }}
              >
                {step.content}
              </motion.p>

              {/* VISUAL GUIDE */}
              {step.visual && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <VisualGuide type={step.visual} />
                </motion.div>
              )}

              {/* HIGHLIGHT BOX */}
              {step.highlight && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mb-8 p-6 rounded-2xl border-4"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                    borderColor: '#60a5fa',
                    boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <Target className="w-10 h-10 text-yellow-400 flex-shrink-0 mt-1" />
                    <p className="text-white font-bold text-2xl leading-relaxed">
                      {step.highlight}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* IMPORTANT NOTES */}
              {step.important && step.important.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 }}
                  className="mb-8 p-6 rounded-2xl border-4"
                  style={{
                    background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
                    borderColor: '#fca5a5',
                    boxShadow: '0 0 30px rgba(220, 38, 38, 0.6)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="w-10 h-10 text-yellow-400" />
                    <p className="text-2xl font-bold text-yellow-400">Important to Know:</p>
                  </div>
                  <ul className="space-y-3">
                    {step.important.map((note, index) => (
                      <li key={index} className="flex items-start gap-3 text-xl text-white">
                        <Shield className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* KEY POINTS */}
              {step.tips && step.tips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mb-6"
                >
                  <h4 className="text-3xl font-bold mb-6 text-green-400 flex items-center gap-3">
                    <CheckCircle className="w-10 h-10" />
                    Key Points to Remember:
                  </h4>
                  <ul className="space-y-4">
                    {step.tips.map((tip, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + (index * 0.08) }}
                        className="flex items-start gap-4 text-xl bg-white/5 p-4 rounded-xl border-2 border-green-500/30"
                        style={{ color: '#e5e7eb' }}
                      >
                        <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0 mt-1" />
                        <span className="leading-relaxed">{tip}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              )}
            </div>
          </div>

          {/* FOOTER */}
          <div
            className="p-6 flex justify-between items-center border-t-4"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%)',
              borderColor: '#fbbf24',
            }}
          >
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-6 py-4 rounded-xl font-bold transition-all disabled:opacity-20 disabled:cursor-not-allowed hover:scale-105 text-lg"
              style={{
                background: currentStep > 0
                  ? 'linear-gradient(135deg, #6b7280, #4b5563)'
                  : 'transparent',
                color: '#fff',
              }}
            >
              <ChevronLeft className="w-6 h-6" />
              Previous
            </button>

            <div className="text-white text-lg font-bold bg-white/10 px-6 py-2 rounded-full">
              {currentStep + 1} / {tutorialSteps.length} completed ✓
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-6 py-4 rounded-xl font-bold transition-all hover:scale-105 text-lg"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)',
                color: '#fff',
                boxShadow: '0 0 25px rgba(34, 197, 94, 0.6)',
              }}
            >
              {currentStep === tutorialSteps.length - 1 ? (
                <>
                  <Trophy className="w-6 h-6" />
                  Finish Tutorial
                  <Trophy className="w-6 h-6" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-6 h-6" />
                </>
              )}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );

  return createPortal(modalContent, document.body);
}