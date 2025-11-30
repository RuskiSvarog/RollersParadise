import { useState } from 'react';
import type { Roll, GamePhase } from './CrapsGame';
import { PlacedBet } from './CrapsGame';
import { BettingChip } from './BettingChip';
import { ElectronicDiceBox } from './ElectronicDiceBox';
import { WinningCondition } from './WinningCondition';
import { useSettings } from '../contexts/SettingsContext';
import { useBetHandlers } from '../hooks/useBetHandlers';

interface CrapsTableProps {
  placedBets: PlacedBet[];
  onPlaceBet: (area: string) => void;
  onRemoveBet: (area: string) => void;
  dice1: number;
  dice2: number;
  isRolling: boolean;
  buttonsLocked?: boolean;
  rollHistory: Roll[];
  onRoll: () => void;
  canRoll: boolean;
  gamePhase: GamePhase;
  point: number | null;
  message: string;
  puckPosition?: number | null;
  smallHit?: number[];
  tallHit?: number[];
  allHit?: number[];
  bonusBetsWorking: boolean;
  onToggleBonusBets: () => void;
  showBuyPlaceBets?: boolean;
  onToggleBuyPlaceBets?: () => void;
  winningNumbers?: number[];
  losingNumbers?: number[];
  onBetAcross?: () => void;
}

export function CrapsTable({ placedBets, onPlaceBet, onRemoveBet, dice1, dice2, isRolling, buttonsLocked = false, rollHistory, onRoll, canRoll, gamePhase, point, message, puckPosition, smallHit, tallHit, allHit, bonusBetsWorking, onToggleBonusBets, showBuyPlaceBets = false, onToggleBuyPlaceBets, winningNumbers = [], losingNumbers = [], onBetAcross }: CrapsTableProps) {
  const { settings } = useSettings();
  const [hardwayTab, setHardwayTab] = useState<'hardways' | 'hop'>('hardways');
  const [betType, setBetType] = useState<'place' | 'buy'>('place');
  
  // Hold-down betting handlers for Pass Line
  const passLineHandlers = useBetHandlers({
    onPlace: () => onPlaceBet('passLine'),
    onRemove: () => onRemoveBet('passLine'),
  });
  
  // Hold-down betting handlers for Pass Line Odds
  const passLineOddsHandlers = useBetHandlers({
    onPlace: () => onPlaceBet('passLineOdds'),
    onRemove: () => onRemoveBet('passLineOdds'),
    disabled: !(gamePhase === 'point' && point),
  });
  
  // Hold-down betting handlers for COME
  const comeHandlers = useBetHandlers({
    onPlace: () => onPlaceBet('come'),
    onRemove: () => onRemoveBet('come'),
  });
  
  // Hold-down betting handlers for FIELD
  const fieldHandlers = useBetHandlers({
    onPlace: () => onPlaceBet('field'),
    onRemove: () => onRemoveBet('field'),
  });
  
  // Hold-down betting handlers for HORN
  const hornHandlers = useBetHandlers({
    onPlace: () => onPlaceBet('horn'),
    onRemove: () => onRemoveBet('horn'),
  });
  
  // Hold-down betting handlers for ANY CRAPS
  const anyCrapsHandlers = useBetHandlers({
    onPlace: () => onPlaceBet('anyCraps'),
    onRemove: () => onRemoveBet('anyCraps'),
  });
  
  // Hold-down betting handlers for ANY SEVEN
  const anySevenHandlers = useBetHandlers({
    onPlace: () => onPlaceBet('anySeven'),
    onRemove: () => onRemoveBet('anySeven'),
  });
  
  // Get table felt color based on settings
  const getFeltColor = () => {
    switch (settings.tableFelt) {
      case 'blue':
        return {
          main: '#1e40af', // blue-800
          light: '#2563eb', // blue-600
          lighter: '#3b82f6', // blue-500
        };
      case 'red':
        return {
          main: '#991b1b', // red-800
          light: '#dc2626', // red-600
          lighter: '#ef4444', // red-500
        };
      case 'purple':
        return {
          main: '#6b21a8', // purple-800
          light: '#9333ea', // purple-600
          lighter: '#a855f7', // purple-500
        };
      case 'black':
        return {
          main: '#0a0a0a', // nearly black
          light: '#171717', // neutral-900
          lighter: '#262626', // neutral-800
        };
      case 'green':
      default:
        return {
          main: '#15803d', // green-800
          light: '#16a34a', // green-600
          lighter: '#22c55e', // green-500
        };
    }
  };
  
  const feltColors = getFeltColor();
  
  const getBetAmount = (area: string) => {
    // Special handling for COME bet - only show come bets that haven't traveled yet
    if (area === 'come') {
      const comeBet = placedBets.find(b => b.area === 'come' && !b.comePoint);
      return comeBet ? comeBet.amount : 0;
    }
    
    const bet = placedBets.find(b => b.area === area);
    return bet ? bet.amount : 0;
  };
  
  // Get bet info including stack data for multiplayer
  const getBetInfo = (area: string) => {
    if (area === 'come') {
      const comeBet = placedBets.find(b => b.area === 'come' && !b.comePoint);
      return comeBet || null;
    }
    
    const bet = placedBets.find(b => b.area === area);
    return bet || null;
  };
  
  // Get come bet amount for a specific number
  const getComeBetAmount = (number: number) => {
    const comeBet = placedBets.find(b => b.area === 'come' && b.comePoint === number);
    return comeBet ? comeBet.amount : 0;
  };
  
  // Get come odds amount for a specific number
  const getComeOddsAmount = (number: number) => {
    const comeOddsBet = placedBets.find(b => b.area === `comeOdds${number}`);
    return comeOddsBet ? comeOddsBet.amount : 0;
  };
  
  const totalBet = placedBets.reduce((sum, bet) => sum + bet.amount, 0);
  
  // Determine if a bet should show the OFF indicator
  const isBetOff = (area: string): boolean => {
    // During come-out roll, certain bets are OFF by default (unless player turns them ON)
    if (gamePhase === 'comeOut') {
      // Place/Buy bets are OFF during come-out (unless showBuyPlaceBets is true)
      if (area.startsWith('place') || area.startsWith('buy') || area === 'six') {
        return !showBuyPlaceBets;
      }
      // Bonus bets (hardways, hops, small, tall, all) are OFF during come-out (unless bonusBetsWorking is true)
      if (['hard4', 'hard6', 'hard8', 'hard10', 'small', 'tall', 'all'].includes(area) || area.startsWith('hop')) {
        return !bonusBetsWorking;
      }
    }
    // During point phase, all bets are ON by default
    return false;
  };
  
  // Calculate odds multiplier display
  const getOddsDisplay = (point: number | null) => {
    if (!point) return '';
    switch (point) {
      case 2:
      case 12:
        return '6:1';
      case 3:
      case 11:
        return '3:1';
      case 4:
      case 10:
        return '2:1';
      case 5:
      case 9:
        return '3:2';
      case 6:
      case 8:
        return '6:5';
      default:
        return '';
    }
  };

  // Get buy bet odds display (true odds for buy bets in crapless craps)
  const getBuyOdds = (number: number) => {
    switch (number) {
      case 2:
      case 12:
        return '6 TO 1'; // True odds
      case 3:
      case 11:
        return '3 TO 1'; // True odds
      case 4:
      case 10:
        return '2 TO 1'; // True odds
      case 5:
      case 9:
        return '3 TO 2'; // True odds
      case 6:
      case 8:
        return '6 TO 5'; // True odds
      default:
        return '';
    }
  };

  return (
    <div 
      className="relative rounded-lg shadow-2xl p-4 border-2 w-full"
      style={{
        background: `linear-gradient(135deg, ${feltColors.main} 0%, ${feltColors.light} 25%, ${feltColors.lighter} 50%, ${feltColors.light} 75%, ${feltColors.main} 100%)`,
        borderImage: 'linear-gradient(45deg, #b45309, #d97706, #f59e0b, #d97706, #b45309) 1',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.1), 0 0 40px rgba(251, 191, 36, 0.3)',
      }}
    >
      {/* Felt Texture Overlay */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-30 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.03) 2px,
            rgba(0, 0, 0, 0.03) 4px
          ),
          repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 0, 0, 0.03) 2px,
            rgba(0, 0, 0, 0.03) 4px
          )`,
        }}
      />
      
      {/* Main Table Content */}
      <div className="mt-2">
        
        {/* Main Betting Area */}
        <div className="grid grid-cols-12 gap-2 mb-2">
          {/* LEFT COLUMN - Hardways, Hops, Proposition Bets */}
          <div className="col-span-3 space-y-2">
            {/* Bonus Bets Toggle Button */}
            <div className="flex justify-center mb-2">
              <button
                onClick={onToggleBonusBets}
                className="px-4 py-3 rounded-lg font-bold text-sm border-2 w-full hover:scale-105 active:scale-95 transition-transform"
                style={{
                  background: bonusBetsWorking 
                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  borderColor: bonusBetsWorking ? '#34d399' : '#f87171',
                  color: 'white',
                  boxShadow: bonusBetsWorking 
                    ? '0 0 20px rgba(16, 185, 129, 0.5)' 
                    : '0 0 20px rgba(239, 68, 68, 0.5)',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                }}
                title={bonusBetsWorking 
                  ? 'Bonus bets (Hardways, Hops, etc.) are WORKING - Click to turn OFF' 
                  : 'Bonus bets (Hardways, Hops, etc.) are OFF - Click to turn ON'}
              >
                <div className="flex flex-col items-center gap-1">
                  <span className="text-xs opacity-90">BONUS BETS</span>
                  <span>{bonusBetsWorking ? '✓ WORKING' : '✗ OFF'}</span>
                </div>
              </button>
            </div>

            {/* Toggle between Bonus Bets and Buy/Place Bets */}
            {onToggleBuyPlaceBets && (
              <div className="flex justify-center mb-2">
                <button
                  onClick={onToggleBuyPlaceBets}
                  className="px-4 py-3 rounded-lg font-bold text-sm border-2 w-full hover:scale-105 active:scale-95 transition-transform"
                  style={{
                    background: showBuyPlaceBets 
                      ? 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)' 
                      : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                    borderColor: showBuyPlaceBets ? '#a78bfa' : '#60a5fa',
                    color: 'white',
                    boxShadow: showBuyPlaceBets 
                      ? '0 0 20px rgba(124, 58, 237, 0.5)' 
                      : '0 0 20px rgba(59, 130, 246, 0.5)',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  }}
                  title={showBuyPlaceBets 
                    ? 'Showing BUY/PLACE BETS - Click to show BONUS BETS' 
                    : 'Showing BONUS BETS - Click to show BUY/PLACE BETS'}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs opacity-90">SWITCH TO</span>
                    <span>{showBuyPlaceBets ? 'BONUS BETS' : 'BUY/PLACE'}</span>
                  </div>
                </button>
              </div>
            )}

            {/* Bet Across Button - Bet on ALL place AND buy numbers at once */}
            {onBetAcross && showBuyPlaceBets && (
              <div className="flex justify-center mb-2">
                <button
                  onClick={onBetAcross}
                  disabled={buttonsLocked}
                  className="px-4 py-3 rounded-lg font-bold text-sm border-2 w-full disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-transform"
                  style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderColor: '#fbbf24',
                    color: 'white',
                    boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  }}
                >
                  🎲 BET ACROSS 🎲
                </button>
              </div>
            )}
            
            {showBuyPlaceBets ? (
              <>
              {/* BUY/PLACE BETS MODE */}
              <div className="bg-gray-800 border-2 border-white rounded p-2">
                <div className="text-yellow-400 text-center font-bold mb-2 text-sm">
                  {betType === 'buy' ? '💰 BUY BETS' : '🎲 PLACE BETS'}
                </div>
                
                {/* Place vs Buy Toggle */}
                <div className="flex gap-1 mb-2">
                  <button 
                    onClick={() => setBetType('place')}
                    className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                      betType === 'place' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    PLACE
                  </button>
                  <button 
                    onClick={() => setBetType('buy')}
                    className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                      betType === 'buy' 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    BUY
                  </button>
                </div>

                {/* Number Betting Grid */}
                <div className="space-y-1">
                  {/* 2 - Crapless Craps */}
                  <div 
                    className="bg-red-900 border-2 border-white rounded p-2 cursor-pointer hover:bg-red-800 relative text-center"
                    onClick={() => onPlaceBet(betType === 'buy' ? 'buy2' : 'place2')}
                    onContextMenu={(e) => { e.preventDefault(); onRemoveBet(betType === 'buy' ? 'buy2' : 'place2'); }}
                  >
                    <div className="text-white font-bold text-lg">2</div>
                    <div className="text-yellow-300 text-xs">
                      {betType === 'buy' ? '6:1 (5% vig)' : '11:2'}
                    </div>
                    {(getBetAmount('buy2') > 0 || getBetAmount('place2') > 0) && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <BettingChip 
                          amount={getBetAmount('buy2') || getBetAmount('place2')} 
                          extraSmall 
                          stackCount={getBetInfo('buy2')?.stackCount || getBetInfo('place2')?.stackCount}
                          playerNames={getBetInfo('buy2')?.playerNames || getBetInfo('place2')?.playerNames}
                          isOff={isBetOff(betType === 'buy' ? 'buy2' : 'place2')}
                        />
                      </div>
                    )}
                  </div>

                  {/* 3 - Crapless Craps */}
                  <div 
                    className="bg-red-900 border-2 border-white rounded p-2 cursor-pointer hover:bg-red-800 relative text-center"
                    onClick={() => onPlaceBet(betType === 'buy' ? 'buy3' : 'place3')}
                    onContextMenu={(e) => { e.preventDefault(); onRemoveBet(betType === 'buy' ? 'buy3' : 'place3'); }}
                  >
                    <div className="text-white font-bold text-lg">3</div>
                    <div className="text-yellow-300 text-xs">
                      {betType === 'buy' ? '3:1 (5% vig)' : '11:4'}
                    </div>
                    {(getBetAmount('buy3') > 0 || getBetAmount('place3') > 0) && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <BettingChip 
                          amount={getBetAmount('buy3') || getBetAmount('place3')} 
                          extraSmall 
                          stackCount={getBetInfo('buy3')?.stackCount || getBetInfo('place3')?.stackCount}
                          playerNames={getBetInfo('buy3')?.playerNames || getBetInfo('place3')?.playerNames}
                          isOff={isBetOff(betType === 'buy' ? 'buy3' : 'place3')}
                        />
                      </div>
                    )}
                  </div>

                  {/* 4 */}
                  <div 
                    className="bg-blue-900 border-2 border-white rounded p-2 cursor-pointer hover:bg-blue-800 relative text-center"
                    onClick={() => onPlaceBet(betType === 'buy' ? 'buy4' : 'place4')}
                    onContextMenu={(e) => { e.preventDefault(); onRemoveBet(betType === 'buy' ? 'buy4' : 'place4'); }}
                  >
                    <div className="text-white font-bold text-lg">4</div>
                    <div className="text-yellow-300 text-xs">
                      {betType === 'buy' ? '2:1 (5% vig)' : '9:5'}
                    </div>
                    {(getBetAmount('buy4') > 0 || getBetAmount('place4') > 0) && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <BettingChip 
                          amount={getBetAmount('buy4') || getBetAmount('place4')} 
                          extraSmall 
                          stackCount={getBetInfo('buy4')?.stackCount || getBetInfo('place4')?.stackCount}
                          playerNames={getBetInfo('buy4')?.playerNames || getBetInfo('place4')?.playerNames}
                          isOff={isBetOff(betType === 'buy' ? 'buy4' : 'place4')}
                        />
                      </div>
                    )}
                  </div>

                  {/* 5 */}
                  <div 
                    className="bg-blue-900 border-2 border-white rounded p-2 cursor-pointer hover:bg-blue-800 relative text-center"
                    onClick={() => onPlaceBet(betType === 'buy' ? 'buy5' : 'place5')}
                    onContextMenu={(e) => { e.preventDefault(); onRemoveBet(betType === 'buy' ? 'buy5' : 'place5'); }}
                  >
                    <div className="text-white font-bold text-lg">5</div>
                    <div className="text-yellow-300 text-xs">
                      {betType === 'buy' ? '3:2 (5% vig)' : '7:5'}
                    </div>
                    {(getBetAmount('buy5') > 0 || getBetAmount('place5') > 0) && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <BettingChip 
                          amount={getBetAmount('buy5') || getBetAmount('place5')} 
                          extraSmall 
                          stackCount={getBetInfo('buy5')?.stackCount || getBetInfo('place5')?.stackCount}
                          playerNames={getBetInfo('buy5')?.playerNames || getBetInfo('place5')?.playerNames}
                          isOff={isBetOff(betType === 'buy' ? 'buy5' : 'place5')}
                        />
                      </div>
                    )}
                  </div>

                  {/* 6 */}
                  <div 
                    className="bg-blue-900 border-2 border-white rounded p-2 cursor-pointer hover:bg-blue-800 relative text-center"
                    onClick={() => onPlaceBet(betType === 'buy' ? 'buy6' : 'place6')}
                    onContextMenu={(e) => { e.preventDefault(); onRemoveBet(betType === 'buy' ? 'buy6' : 'place6'); }}
                  >
                    <div className="text-white font-bold text-lg">6</div>
                    <div className="text-yellow-300 text-xs">
                      {betType === 'buy' ? '6:5 (5% vig)' : '7:6'}
                    </div>
                    {(getBetAmount('buy6') > 0 || getBetAmount('place6') > 0) && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <BettingChip 
                          amount={getBetAmount('buy6') || getBetAmount('place6')} 
                          extraSmall 
                          stackCount={getBetInfo('buy6')?.stackCount || getBetInfo('place6')?.stackCount}
                          playerNames={getBetInfo('buy6')?.playerNames || getBetInfo('place6')?.playerNames}
                          isOff={isBetOff(betType === 'buy' ? 'buy6' : 'place6')}
                        />
                      </div>
                    )}
                  </div>

                  {/* 8 */}
                  <div 
                    className="bg-blue-900 border-2 border-white rounded p-2 cursor-pointer hover:bg-blue-800 relative text-center"
                    onClick={() => onPlaceBet(betType === 'buy' ? 'buy8' : 'place8')}
                    onContextMenu={(e) => { e.preventDefault(); onRemoveBet(betType === 'buy' ? 'buy8' : 'place8'); }}
                  >
                    <div className="text-white font-bold text-lg">8</div>
                    <div className="text-yellow-300 text-xs">
                      {betType === 'buy' ? '6:5 (5% vig)' : '7:6'}
                    </div>
                    {(getBetAmount('buy8') > 0 || getBetAmount('place8') > 0) && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <BettingChip 
                          amount={getBetAmount('buy8') || getBetAmount('place8')} 
                          extraSmall 
                          stackCount={getBetInfo('buy8')?.stackCount || getBetInfo('place8')?.stackCount}
                          playerNames={getBetInfo('buy8')?.playerNames || getBetInfo('place8')?.playerNames}
                          isOff={isBetOff(betType === 'buy' ? 'buy8' : 'place8')}
                        />
                      </div>
                    )}
                  </div>

                  {/* 9 */}
                  <div 
                    className="bg-blue-900 border-2 border-white rounded p-2 cursor-pointer hover:bg-blue-800 relative text-center"
                    onClick={() => onPlaceBet(betType === 'buy' ? 'buy9' : 'place9')}
                    onContextMenu={(e) => { e.preventDefault(); onRemoveBet(betType === 'buy' ? 'buy9' : 'place9'); }}
                  >
                    <div className="text-white font-bold text-lg">9</div>
                    <div className="text-yellow-300 text-xs">
                      {betType === 'buy' ? '3:2 (5% vig)' : '7:5'}
                    </div>
                    {(getBetAmount('buy9') > 0 || getBetAmount('place9') > 0) && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <BettingChip 
                          amount={getBetAmount('buy9') || getBetAmount('place9')} 
                          extraSmall 
                          stackCount={getBetInfo('buy9')?.stackCount || getBetInfo('place9')?.stackCount}
                          playerNames={getBetInfo('buy9')?.playerNames || getBetInfo('place9')?.playerNames}
                          isOff={isBetOff(betType === 'buy' ? 'buy9' : 'place9')}
                        />
                      </div>
                    )}
                  </div>

                  {/* 10 */}
                  <div 
                    className="bg-blue-900 border-2 border-white rounded p-2 cursor-pointer hover:bg-blue-800 relative text-center"
                    onClick={() => onPlaceBet(betType === 'buy' ? 'buy10' : 'place10')}
                    onContextMenu={(e) => { e.preventDefault(); onRemoveBet(betType === 'buy' ? 'buy10' : 'place10'); }}
                  >
                    <div className="text-white font-bold text-lg">10</div>
                    <div className="text-yellow-300 text-xs">
                      {betType === 'buy' ? '2:1 (5% vig)' : '9:5'}
                    </div>
                    {(getBetAmount('buy10') > 0 || getBetAmount('place10') > 0) && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <BettingChip 
                          amount={getBetAmount('buy10') || getBetAmount('place10')} 
                          extraSmall 
                          stackCount={getBetInfo('buy10')?.stackCount || getBetInfo('place10')?.stackCount}
                          playerNames={getBetInfo('buy10')?.playerNames || getBetInfo('place10')?.playerNames}
                          isOff={isBetOff(betType === 'buy' ? 'buy10' : 'place10')}
                        />
                      </div>
                    )}
                  </div>

                  {/* 11 - Crapless Craps */}
                  <div 
                    className="bg-red-900 border-2 border-white rounded p-2 cursor-pointer hover:bg-red-800 relative text-center"
                    onClick={() => onPlaceBet(betType === 'buy' ? 'buy11' : 'place11')}
                    onContextMenu={(e) => { e.preventDefault(); onRemoveBet(betType === 'buy' ? 'buy11' : 'place11'); }}
                  >
                    <div className="text-white font-bold text-lg">11</div>
                    <div className="text-yellow-300 text-xs">
                      {betType === 'buy' ? '3:1 (5% vig)' : '11:4'}
                    </div>
                    {(getBetAmount('buy11') > 0 || getBetAmount('place11') > 0) && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <BettingChip 
                          amount={getBetAmount('buy11') || getBetAmount('place11')} 
                          extraSmall 
                          stackCount={getBetInfo('buy11')?.stackCount || getBetInfo('place11')?.stackCount}
                          playerNames={getBetInfo('buy11')?.playerNames || getBetInfo('place11')?.playerNames}
                          isOff={isBetOff(betType === 'buy' ? 'buy11' : 'place11')}
                        />
                      </div>
                    )}
                  </div>

                  {/* 12 - Crapless Craps */}
                  <div 
                    className="bg-red-900 border-2 border-white rounded p-2 cursor-pointer hover:bg-red-800 relative text-center"
                    onClick={() => onPlaceBet(betType === 'buy' ? 'buy12' : 'place12')}
                    onContextMenu={(e) => { e.preventDefault(); onRemoveBet(betType === 'buy' ? 'buy12' : 'place12'); }}
                  >
                    <div className="text-white font-bold text-lg">12</div>
                    <div className="text-yellow-300 text-xs">
                      {betType === 'buy' ? '6:1 (5% vig)' : '11:2'}
                    </div>
                    {(getBetAmount('buy12') > 0 || getBetAmount('place12') > 0) && (
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <BettingChip 
                          amount={getBetAmount('buy12') || getBetAmount('place12')} 
                          extraSmall 
                          stackCount={getBetInfo('buy12')?.stackCount || getBetInfo('place12')?.stackCount}
                          playerNames={getBetInfo('buy12')?.playerNames || getBetInfo('place12')?.playerNames}
                          isOff={isBetOff(betType === 'buy' ? 'buy12' : 'place12')}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="mt-2 p-2 bg-gray-900 rounded border border-gray-700">
                  <div className="text-xs text-yellow-400 font-bold mb-1 text-center">
                    {betType === 'buy' ? '💰 BUY BETS' : '🎲 PLACE BETS'}
                  </div>
                  <div className="text-xs text-gray-300 text-center">
                    {betType === 'buy' 
                      ? 'True odds + 5% vig. Better for 4, 10, 2, 12, 3, 11' 
                      : 'Lower payouts, no commission. Good for 6 & 8'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1 text-center italic">
                    Left-click to bet • Right-click to remove
                  </div>
                </div>
              </div>
              </>
            ) : (
              <>
            {/* Hardways & Hops Tabs */}
            <div className="bg-gray-800 border-2 border-white rounded p-2">
              <div className="flex gap-1 mb-2">
                <button 
                  onClick={() => setHardwayTab('hardways')}
                  className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                    hardwayTab === 'hardways' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  HARDWAYS
                </button>
                <button 
                  onClick={() => setHardwayTab('hop')}
                  className={`flex-1 px-2 py-1 text-xs rounded transition-colors ${
                    hardwayTab === 'hop' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  HOP BETS
                </button>
              </div>

              {hardwayTab === 'hardways' ? (
                <div className="grid grid-cols-2 gap-1">
                  <HardwayBox dice={[2,2]} payout="9:1" onClick={() => onPlaceBet('hard4')} onRightClick={() => onRemoveBet('hard4')} amount={getBetAmount('hard4')} isOff={isBetOff('hard4')} />
                  <HardwayBox dice={[5,5]} payout="9:1" onClick={() => onPlaceBet('hard10')} onRightClick={() => onRemoveBet('hard10')} amount={getBetAmount('hard10')} isOff={isBetOff('hard10')} />
                  <HardwayBox dice={[3,3]} payout="9:1" onClick={() => onPlaceBet('hard6')} onRightClick={() => onRemoveBet('hard6')} amount={getBetAmount('hard6')} isOff={isBetOff('hard6')} />
                  <HardwayBox dice={[4,4]} payout="9:1" onClick={() => onPlaceBet('hard8')} onRightClick={() => onRemoveBet('hard8')} amount={getBetAmount('hard8')} isOff={isBetOff('hard8')} />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  <HopBox dice={[1,4]} payout="15:1" onClick={() => onPlaceBet('hop5a')} onRightClick={() => onRemoveBet('hop5a')} amount={getBetAmount('hop5a')} isOff={isBetOff('hop5a')} />
                  <HopBox dice={[2,3]} payout="15:1" onClick={() => onPlaceBet('hop5b')} onRightClick={() => onRemoveBet('hop5b')} amount={getBetAmount('hop5b')} isOff={isBetOff('hop5b')} />
                  <HopBox dice={[1,5]} payout="15:1" onClick={() => onPlaceBet('hop6a')} onRightClick={() => onRemoveBet('hop6a')} amount={getBetAmount('hop6a')} isOff={isBetOff('hop6a')} />
                  <HopBox dice={[2,4]} payout="15:1" onClick={() => onPlaceBet('hop6b')} onRightClick={() => onRemoveBet('hop6b')} amount={getBetAmount('hop6b')} isOff={isBetOff('hop6b')} />
                </div>
              )}
            </div>

            {/* ONE ROLL BETS - Matching casino image layout exactly */}
            <div className="bg-green-800 border-2 border-white rounded p-2">
              <div className="text-center text-yellow-300 text-xs mb-1 font-bold">ONE ROLL BETS</div>
              
              {/* ANY SEVEN - 4 TO 1 • SEVEN • 4 TO 1 - HORIZONTAL LAYOUT */}
              <div 
                className="bg-red-700 border-2 border-white rounded py-1.5 px-2 text-center cursor-pointer hover:bg-red-600 relative mb-2 flex items-center justify-center gap-2"
                {...anySevenHandlers}
              >
                <span className="text-white text-xs font-bold">4 TO 1</span>
                <span className="text-white text-xs font-bold">•</span>
                <span className="text-white text-sm font-bold">SEVEN</span>
                <span className="text-white text-xs font-bold">•</span>
                <span className="text-white text-xs font-bold">4 TO 1</span>
                {getBetAmount('anySeven') > 0 && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <BettingChip 
                      amount={getBetAmount('anySeven')} 
                      small 
                      stackCount={getBetInfo('anySeven')?.stackCount}
                      playerNames={getBetInfo('anySeven')?.playerNames}
                    />
                  </div>
                )}
              </div>
              
              {/* Snake Eyes, HORN BET (center), Boxcars - ALL IN ONE ROW */}
              <div className="grid grid-cols-3 gap-1 mb-1">
                {/* Snake Eyes - Left */}
                <DiceBox dice={[1,1]} label="" odds="30 TO 1" onClick={() => onPlaceBet('snake')} onRightClick={() => onRemoveBet('snake')} amount={getBetAmount('snake')} />
                
                {/* HORN BET - CENTER SQUARE */}
                <div 
                  className="bg-gray-800 border-2 border-white rounded p-1 text-center cursor-pointer hover:bg-gray-700 relative flex flex-col items-center justify-center"
                  {...hornHandlers}
                >
                  <div className="text-yellow-300 text-xs font-bold leading-tight">HORN</div>
                  <div className="text-yellow-300 text-xs font-bold leading-tight">BET</div>
                  {getBetAmount('horn') > 0 && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                      <BettingChip 
                        amount={getBetAmount('horn')} 
                        extraSmall 
                        stackCount={getBetInfo('horn')?.stackCount}
                        playerNames={getBetInfo('horn')?.playerNames}
                      />
                    </div>
                  )}
                </div>
                
                {/* Boxcars - Right */}
                <DiceBox dice={[6,6]} label="" odds="30 TO 1" onClick={() => onPlaceBet('boxcars')} onRightClick={() => onRemoveBet('boxcars')} amount={getBetAmount('boxcars')} />
              </div>
              
              {/* Ace-Deuce & Yo-Leven - Below Horn Bet */}
              <div className="grid grid-cols-2 gap-1 mb-2">
                <DiceBox dice={[1,2]} label="" odds="15 TO 1" onClick={() => onPlaceBet('ace')} onRightClick={() => onRemoveBet('ace')} amount={getBetAmount('ace')} />
                <DiceBox dice={[5,6]} label="" odds="15 TO 1" onClick={() => onPlaceBet('yo')} onRightClick={() => onRemoveBet('yo')} amount={getBetAmount('yo')} />
              </div>
              
              {/* ANY CRAPS - 7 TO 1 • ANY CRAPS • 7 TO 1 - HORIZONTAL LAYOUT */}
              <div 
                className="bg-red-800 border-2 border-white rounded py-1.5 px-2 text-center cursor-pointer hover:bg-red-700 relative flex items-center justify-center gap-2"
                {...anyCrapsHandlers}
              >
                <span className="text-white text-xs font-bold">7 TO 1</span>
                <span className="text-white text-xs font-bold">•</span>
                <span className="text-white text-sm font-bold">ANY CRAPS</span>
                <span className="text-white text-xs font-bold">•</span>
                <span className="text-white text-xs font-bold">7 TO 1</span>
                {getBetAmount('anyCraps') > 0 && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <BettingChip amount={getBetAmount('anyCraps')} small />
                  </div>
                )}
              </div>

              {/* GAME STATUS DISPLAY - Below Any Craps */}
              <div className="mt-4 bg-gradient-to-br from-red-900/90 to-black/90 backdrop-blur-sm border-3 border-yellow-500/80 rounded-lg p-3 shadow-xl"
                   style={{
                     boxShadow: '0 0 20px rgba(234, 179, 8, 0.3), inset 0 0 15px rgba(0, 0, 0, 0.5)'
                   }}>
                {/* Current Phase */}
                <div className="text-center mb-2">
                  <div className="text-yellow-400 text-xs font-bold uppercase tracking-widest mb-0.5">Game Status</div>
                  <div className={`text-lg font-black uppercase tracking-wide ${
                    gamePhase === 'comeOut' ? 'text-white' : 'text-green-400'
                  }`}>
                    {gamePhase === 'comeOut' ? '🎲 COME OUT' : '🎯 POINT'}
                  </div>
                </div>

                {/* Point Number */}
                {point && (
                  <div className="bg-black/40 border-2 border-yellow-400 rounded-lg p-2 mb-2">
                    <div className="text-yellow-300 text-xs font-bold uppercase text-center mb-0.5">The Point</div>
                    <div className="text-center">
                      <div className="inline-block bg-gradient-to-br from-white to-gray-300 text-black text-3xl font-black w-12 h-12 rounded-lg flex items-center justify-center border-3 border-yellow-500 shadow-lg"
                           style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>
                        {point}
                      </div>
                    </div>
                  </div>
                )}

                {/* Message */}
                {message && (
                  <div className="text-center text-white text-xs font-bold bg-black/30 rounded px-2 py-1.5 border border-yellow-500/50">
                    {message}
                  </div>
                )}
              </div>
            </div>
            </>
            )}
          </div>

          {/* CENTER & RIGHT - Place Numbers, C&E, Come, Field, Pass Line */}
          <div className="col-span-9 grid grid-cols-12 gap-2">
            {/* C, C&E, E - Vertical Stack with improved spacing */}
            <div className="col-span-1 flex flex-col gap-4 justify-center items-center">
              {/* C - Circle */}
              <div className="w-16 h-16 bg-green-700 border-3 border-white rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-green-600 relative shadow-lg transition-all"
                   onClick={() => onPlaceBet('c')}
                   onContextMenu={(e) => { e.preventDefault(); onRemoveBet('c'); }}>
                <div className="text-white text-xl font-bold">C</div>
                {getBetAmount('c') > 0 && <BettingChip amount={getBetAmount('c')} small stackCount={getBetInfo('c')?.stackCount} playerNames={getBetInfo('c')?.playerNames} />}
              </div>
              
              {/* C & E - Larger Circle */}
              <div className="w-24 h-24 bg-yellow-600 border-3 border-white rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-yellow-500 relative shadow-lg transition-all"
                   onClick={() => onPlaceBet('ce')}
                   onContextMenu={(e) => { e.preventDefault(); onRemoveBet('ce'); }}>
                <div className="text-black text-lg font-bold">C&E</div>
                {getBetAmount('ce') > 0 && <BettingChip amount={getBetAmount('ce')} small stackCount={getBetInfo('ce')?.stackCount} playerNames={getBetInfo('ce')?.playerNames} />}
              </div>
              
              {/* E - Circle */}
              <div className="w-16 h-16 bg-green-700 border-3 border-white rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-green-600 relative shadow-lg transition-all"
                   onClick={() => onPlaceBet('e')}
                   onContextMenu={(e) => { e.preventDefault(); onRemoveBet('e'); }}>
                <div className="text-white text-xl font-bold">E</div>
                {getBetAmount('e') > 0 && <BettingChip amount={getBetAmount('e')} small stackCount={getBetInfo('e')?.stackCount} playerNames={getBetInfo('e')?.playerNames} />}
              </div>
            </div>

            {/* Numbers and Main Betting Areas */}
            <div className="col-span-11 space-y-4">
              {/* Bonus Bets Row - Low Rolls, Roll'Em ALL, High Rolls - Always visible, side by side */}
              <div className="flex justify-between gap-4 mb-3">
                <div className="flex-1">
                  <BetArea 
                    label="Low Rolls" 
                    sublabel="2 3 4 5 6" 
                    odds="34 TO 1"
                    onClick={() => onPlaceBet('small')}
                    onRightClick={() => onRemoveBet('small')}
                    amount={getBetAmount('small')}
                    hit={smallHit}
                    disabled={gamePhase === 'point'}
                    working={bonusBetsWorking}
                    isOff={isBetOff('small')}
                  />
                </div>
                
                <div className="flex-1">
                  <BetArea 
                    label="Roll'Em ALL" 
                    sublabel="2-12" 
                    odds="176 TO 1"
                    onClick={() => onPlaceBet('all')}
                    onRightClick={() => onRemoveBet('all')}
                    amount={getBetAmount('all')}
                    hit={allHit}
                    disabled={gamePhase === 'point'}
                    working={bonusBetsWorking}
                    isOff={isBetOff('all')}
                  />
                </div>
                
                <div className="flex-1">
                  <BetArea 
                    label="High Rolls" 
                    sublabel="8 9 10 11 12" 
                    odds="34 TO 1"
                    onClick={() => onPlaceBet('tall')}
                    onRightClick={() => onRemoveBet('tall')}
                    amount={getBetAmount('tall')}
                    hit={tallHit}
                    disabled={gamePhase === 'point'}
                    working={bonusBetsWorking}
                    isOff={isBetOff('tall')}
                  />
                </div>
              </div>
              
              {/* Place Numbers Row - 2, 3, 4, 5, SIX, 8, NINE, 10, 11, 12 */}
              <div className="grid grid-cols-10 gap-1">
                <NumberBox 
                  number="2" 
                  place="11 TO 2"
                  onClick={() => onPlaceBet('place2')} 
                  onRightClick={() => onRemoveBet('place2')}
                  amount={getBetAmount('place2')}
                  betType="place"
                  showPuck={puckPosition === 2}
                  puckOn={gamePhase === 'point'}
                  comeBetAmount={getComeBetAmount(2)}
                  comeOddsAmount={getComeOddsAmount(2)}
                  onPlaceComeBet={() => onPlaceBet('come')}
                  onRemoveComeBet={() => onRemoveBet('come')}
                  onPlaceComeOdds={() => onPlaceBet('comeOdds2')}
                  onRemoveComeOdds={() => onRemoveBet('comeOdds2')}
                  onBuyClick={() => onPlaceBet('buy2')}
                  onBuyRightClick={() => onRemoveBet('buy2')}
                  buyAmount={getBetAmount('buy2')}
                  buyOdds={getBuyOdds(2)}
                  isBuyOff={isBetOff('buy2')}
                  isPlaceOff={isBetOff('place2')}
                />
                <NumberBox 
                  number="3" 
                  place="11 TO 4"
                  onClick={() => onPlaceBet('place3')} 
                  onRightClick={() => onRemoveBet('place3')}
                  amount={getBetAmount('place3')}
                  betType="place"
                  showPuck={puckPosition === 3}
                  puckOn={gamePhase === 'point'}
                  comeBetAmount={getComeBetAmount(3)}
                  comeOddsAmount={getComeOddsAmount(3)}
                  onPlaceComeBet={() => onPlaceBet('come')}
                  onRemoveComeBet={() => onRemoveBet('come')}
                  onPlaceComeOdds={() => onPlaceBet('comeOdds3')}
                  onRemoveComeOdds={() => onRemoveBet('comeOdds3')}
                  onBuyClick={() => onPlaceBet('buy3')}
                  onBuyRightClick={() => onRemoveBet('buy3')}
                  buyAmount={getBetAmount('buy3')}
                  buyOdds={getBuyOdds(3)}
                  isBuyOff={isBetOff('buy3')}
                  isPlaceOff={isBetOff('place3')}
                />
                <NumberBox 
                  number="4" 
                  place="9 TO 5"
                  onClick={() => onPlaceBet('place4')} 
                  onRightClick={() => onRemoveBet('place4')}
                  amount={getBetAmount('place4')}
                  betType="place"
                  showPuck={puckPosition === 4}
                  puckOn={gamePhase === 'point'}
                  comeBetAmount={getComeBetAmount(4)}
                  comeOddsAmount={getComeOddsAmount(4)}
                  onPlaceComeBet={() => onPlaceBet('come')}
                  onRemoveComeBet={() => onRemoveBet('come')}
                  onPlaceComeOdds={() => onPlaceBet('comeOdds4')}
                  onRemoveComeOdds={() => onRemoveBet('comeOdds4')}
                  onBuyClick={() => onPlaceBet('buy4')}
                  onBuyRightClick={() => onRemoveBet('buy4')}
                  buyAmount={getBetAmount('buy4')}
                  buyOdds={getBuyOdds(4)}
                  isBuyOff={isBetOff('buy4')}
                  isPlaceOff={isBetOff('place4')}
                />
                <NumberBox 
                  number="5" 
                  place="7 TO 5"
                  onClick={() => onPlaceBet('place5')} 
                  onRightClick={() => onRemoveBet('place5')}
                  amount={getBetAmount('place5')}
                  betType="place"
                  showPuck={puckPosition === 5}
                  puckOn={gamePhase === 'point'}
                  comeBetAmount={getComeBetAmount(5)}
                  comeOddsAmount={getComeOddsAmount(5)}
                  onPlaceComeBet={() => onPlaceBet('come')}
                  onRemoveComeBet={() => onRemoveBet('come')}
                  onPlaceComeOdds={() => onPlaceBet('comeOdds5')}
                  onRemoveComeOdds={() => onRemoveBet('comeOdds5')}
                  onBuyClick={() => onPlaceBet('buy5')}
                  onBuyRightClick={() => onRemoveBet('buy5')}
                  buyAmount={getBetAmount('buy5')}
                  buyOdds={getBuyOdds(5)}
                  isBuyOff={isBetOff('buy5')}
                  isPlaceOff={isBetOff('place5')}
                />
                <NumberBox 
                  number="6" 
                  place="7 TO 6"
                  onClick={() => onPlaceBet('six')} 
                  onRightClick={() => onRemoveBet('six')}
                  amount={getBetAmount('six')}
                  betType="place"
                  showPuck={puckPosition === 6}
                  puckOn={gamePhase === 'point'}
                  comeBetAmount={getComeBetAmount(6)}
                  comeOddsAmount={getComeOddsAmount(6)}
                  onPlaceComeBet={() => onPlaceBet('come')}
                  onRemoveComeBet={() => onRemoveBet('come')}
                  onPlaceComeOdds={() => onPlaceBet('comeOdds6')}
                  onRemoveComeOdds={() => onRemoveBet('comeOdds6')}
                  onBuyClick={() => onPlaceBet('buy6')}
                  onBuyRightClick={() => onRemoveBet('buy6')}
                  buyAmount={getBetAmount('buy6')}
                  buyOdds={getBuyOdds(6)}
                  isBuyOff={isBetOff('buy6')}
                  isPlaceOff={isBetOff('six')}
                />
                <NumberBox 
                  number="8" 
                  place="7 TO 6"
                  onClick={() => onPlaceBet('place8')} 
                  onRightClick={() => onRemoveBet('place8')}
                  amount={getBetAmount('place8')}
                  betType="place"
                  showPuck={puckPosition === 8}
                  puckOn={gamePhase === 'point'}
                  comeBetAmount={getComeBetAmount(8)}
                  comeOddsAmount={getComeOddsAmount(8)}
                  onPlaceComeBet={() => onPlaceBet('come')}
                  onRemoveComeBet={() => onRemoveBet('come')}
                  onPlaceComeOdds={() => onPlaceBet('comeOdds8')}
                  onRemoveComeOdds={() => onRemoveBet('comeOdds8')}
                  onBuyClick={() => onPlaceBet('buy8')}
                  onBuyRightClick={() => onRemoveBet('buy8')}
                  buyAmount={getBetAmount('buy8')}
                  buyOdds={getBuyOdds(8)}
                  isBuyOff={isBetOff('buy8')}
                  isPlaceOff={isBetOff('place8')}
                />
                <NumberBox 
                  number="9" 
                  place="7 TO 5"
                  onClick={() => onPlaceBet('place9')} 
                  onRightClick={() => onRemoveBet('place9')}
                  amount={getBetAmount('place9')}
                  betType="place"
                  showPuck={puckPosition === 9}
                  puckOn={gamePhase === 'point'}
                  comeBetAmount={getComeBetAmount(9)}
                  comeOddsAmount={getComeOddsAmount(9)}
                  onPlaceComeBet={() => onPlaceBet('come')}
                  onRemoveComeBet={() => onRemoveBet('come')}
                  onPlaceComeOdds={() => onPlaceBet('comeOdds9')}
                  onRemoveComeOdds={() => onRemoveBet('comeOdds9')}
                  onBuyClick={() => onPlaceBet('buy9')}
                  onBuyRightClick={() => onRemoveBet('buy9')}
                  buyAmount={getBetAmount('buy9')}
                  buyOdds={getBuyOdds(9)}
                  isBuyOff={isBetOff('buy9')}
                  isPlaceOff={isBetOff('place9')}
                />
                <NumberBox 
                  number="10" 
                  place="9 TO 5"
                  onClick={() => onPlaceBet('place10')} 
                  onRightClick={() => onRemoveBet('place10')}
                  amount={getBetAmount('place10')}
                  betType="place"
                  showPuck={puckPosition === 10}
                  puckOn={gamePhase === 'point'}
                  comeBetAmount={getComeBetAmount(10)}
                  comeOddsAmount={getComeOddsAmount(10)}
                  onPlaceComeBet={() => onPlaceBet('come')}
                  onRemoveComeBet={() => onRemoveBet('come')}
                  onPlaceComeOdds={() => onPlaceBet('comeOdds10')}
                  onRemoveComeOdds={() => onRemoveBet('comeOdds10')}
                  onBuyClick={() => onPlaceBet('buy10')}
                  onBuyRightClick={() => onRemoveBet('buy10')}
                  buyAmount={getBetAmount('buy10')}
                  buyOdds={getBuyOdds(10)}
                  isBuyOff={isBetOff('buy10')}
                  isPlaceOff={isBetOff('place10')}
                />
                <NumberBox 
                  number="11" 
                  place="11 TO 4"
                  onClick={() => onPlaceBet('place11')} 
                  onRightClick={() => onRemoveBet('place11')}
                  amount={getBetAmount('place11')}
                  betType="place"
                  showPuck={puckPosition === 11}
                  puckOn={gamePhase === 'point'}
                  comeBetAmount={getComeBetAmount(11)}
                  comeOddsAmount={getComeOddsAmount(11)}
                  onPlaceComeBet={() => onPlaceBet('come')}
                  onRemoveComeBet={() => onRemoveBet('come')}
                  onPlaceComeOdds={() => onPlaceBet('comeOdds11')}
                  onRemoveComeOdds={() => onRemoveBet('comeOdds11')}
                  onBuyClick={() => onPlaceBet('buy11')}
                  onBuyRightClick={() => onRemoveBet('buy11')}
                  buyAmount={getBetAmount('buy11')}
                  buyOdds={getBuyOdds(11)}
                  isBuyOff={isBetOff('buy11')}
                  isPlaceOff={isBetOff('place11')}
                />
                <NumberBox 
                  number="12" 
                  place="11 TO 2"
                  onClick={() => onPlaceBet('place12')} 
                  onRightClick={() => onRemoveBet('place12')}
                  amount={getBetAmount('place12')}
                  betType="place"
                  showPuck={puckPosition === 12}
                  puckOn={gamePhase === 'point'}
                  comeBetAmount={getComeBetAmount(12)}
                  comeOddsAmount={getComeOddsAmount(12)}
                  onPlaceComeBet={() => onPlaceBet('come')}
                  onRemoveComeBet={() => onRemoveBet('come')}
                  onPlaceComeOdds={() => onPlaceBet('comeOdds12')}
                  onRemoveComeOdds={() => onRemoveBet('comeOdds12')}
                  onBuyClick={() => onPlaceBet('buy12')}
                  onBuyRightClick={() => onRemoveBet('buy12')}
                  buyAmount={getBetAmount('buy12')}
                  buyOdds={getBuyOdds(12)}
                  isBuyOff={isBetOff('buy12')}
                  isPlaceOff={isBetOff('place12')}
                />
              </div>

              {/* COME Area - Large */}
              <div className="bg-green-800 border-2 border-white rounded-lg p-3 relative cursor-pointer hover:bg-green-700"
                   data-bet-area="come"
                   {...comeHandlers}>
                <div className="text-red-500 text-center text-4xl font-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>COME</div>
                {getBetAmount('come') > 0 && <BettingChip amount={getBetAmount('come')} stackCount={getBetInfo('come')?.stackCount} playerNames={getBetInfo('come')?.playerNames} />}
              </div>

              {/* FIELD Area */}
              <div className="bg-green-800 border-2 border-white rounded-lg p-2 relative cursor-pointer hover:bg-green-700"
                   {...fieldHandlers}>
                <div className="flex justify-between items-center text-white text-lg mb-1">
                  <div className="text-center text-xs font-bold">2<br/>PAYS 2:1</div>
                  <span>•</span>
                  <span className="text-2xl font-bold">3</span>
                  <span>•</span>
                  <span className="text-2xl font-bold">4</span>
                  <span>•</span>
                  <span className="text-2xl font-bold">9</span>
                  <span>•</span>
                  <span className="text-2xl font-bold">10</span>
                  <span>•</span>
                  <span className="text-2xl font-bold">11</span>
                  <span>•</span>
                  <div className="text-center text-xs font-bold">12<br/>PAYS 3:1</div>
                </div>
                <div className="text-white text-center text-3xl font-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>FIELD</div>
                {getBetAmount('field') > 0 && <BettingChip amount={getBetAmount('field')} stackCount={getBetInfo('field')?.stackCount} playerNames={getBetInfo('field')?.playerNames} />}
              </div>

              {/* PASS LINE Area - Large with small ODDS box behind it */}
              <div className="relative">
                {/* Pass Line and Win/Lose section */}
                <div className="space-y-2">
                  {/* Pass Line section */}
                  <div className="relative" style={{ paddingTop: '30px' }}>
                    {/* PASS LINE in front */}
                    <div
                      className="bg-green-800 border-4 border-white rounded-lg p-4 relative cursor-pointer hover:bg-green-700"
                      style={{
                        zIndex: 10,
                      }}
                      {...passLineHandlers}
                    >
                      <div className="text-blue-400 text-center text-5xl font-bold" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>PASS LINE</div>
                      {getBetAmount('passLine') > 0 && <BettingChip amount={getBetAmount('passLine')} stackCount={getBetInfo('passLine')?.stackCount} playerNames={getBetInfo('passLine')?.playerNames} />}
                    </div>
                    
                    {/* ODDS box - More visual with clear label */}
                    <div 
                      className="absolute top-0 left-0 right-0 bg-gradient-to-b from-green-600 to-green-700 border-3 cursor-pointer hover:scale-105 transition-all duration-200 shadow-2xl overflow-hidden"
                      style={{
                        zIndex: 5,
                        height: '45px',
                        borderColor: gamePhase === 'point' && point ? '#22c55e' : '#16a34a',
                        borderStyle: 'solid',
                        borderWidth: '3px',
                        borderRadius: '10px',
                        boxShadow: gamePhase === 'point' && point 
                          ? '0 0 25px rgba(34, 197, 94, 0.8), inset 0 2px 8px rgba(0,0,0,0.3)' 
                          : '0 0 5px rgba(34, 197, 94, 0.2), inset 0 2px 8px rgba(0,0,0,0.3)',
                        opacity: gamePhase === 'point' && point ? 1 : 0.4,
                        animation: gamePhase === 'point' && point && getBetAmount('passLineOdds') === 0 
                          ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' 
                          : 'none',
                      }}
                      {...passLineOddsHandlers}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                        passLineOddsHandlers.onMouseDown(e);
                      }}
                      onContextMenu={(e) => {
                        e.stopPropagation();
                        passLineOddsHandlers.onContextMenu(e);
                      }}
                      title={gamePhase === 'point' && point ? `Click to place ODDS on Point ${point}` : 'ODDS only available when Point is established'}
                    >
                      {/* ODDS Label - Always visible when point is set */}
                      {gamePhase === 'point' && point && (
                        <div 
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          style={{
                            zIndex: 1,
                          }}
                        >
                          <span 
                            className="text-white font-black tracking-wider"
                            style={{
                              fontSize: getBetAmount('passLineOdds') > 0 ? '11px' : '14px',
                              textShadow: '0 2px 6px rgba(0,0,0,0.9), 0 0 10px rgba(34, 197, 94, 0.5)',
                              letterSpacing: '1px',
                              opacity: getBetAmount('passLineOdds') > 0 ? 0.7 : 1,
                            }}
                          >
                            {getBetAmount('passLineOdds') > 0 ? 'ODDS' : '✨ ODDS ✨'}
                          </span>
                        </div>
                      )}
                      
                      {/* Bet Chip - Shows on top of label */}
                      {getBetAmount('passLineOdds') > 0 && (
                        <div style={{ position: 'relative', zIndex: 2 }}>
                          <BettingChip amount={getBetAmount('passLineOdds')} stackCount={getBetInfo('passLineOdds')?.stackCount} playerNames={getBetInfo('passLineOdds')?.playerNames} />
                        </div>
                      )}
                      
                      {/* Visual indicator arrows when no bet placed */}
                      {gamePhase === 'point' && point && getBetAmount('passLineOdds') === 0 && (
                        <>
                          <div 
                            className="absolute left-2 top-1/2 transform -translate-y-1/2 text-white opacity-60 pointer-events-none"
                            style={{
                              fontSize: '20px',
                              animation: 'bounce 1s infinite',
                              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                            }}
                          >
                            ←
                          </div>
                          <div 
                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white opacity-60 pointer-events-none"
                            style={{
                              fontSize: '20px',
                              animation: 'bounce 1s infinite',
                              textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                            }}
                          >
                            →
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* WIN/LOSE Column - Under Pass Line, aligned with Pass Line width */}
                  <div className="w-full">
                    <WinningCondition 
                      winningNumbers={winningNumbers}
                      losingNumbers={losingNumbers}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BetArea({ label, sublabel, odds, onClick, onRightClick, amount, hit, disabled, working, isOff }: any) {
  // Hold-down betting handlers
  const handlers = useBetHandlers({
    onPlace: onClick,
    onRemove: onRightClick,
    disabled,
  });
  
  // Parse which numbers this area tracks
  const getNumbers = () => {
    if (label === 'Low Rolls') return [2, 3, 4, 5, 6];
    if (label === 'High Rolls') return [8, 9, 10, 11, 12];
    if (label === 'Roll\'Em ALL') return [2, 3, 4, 5, 6, 8, 9, 10, 11, 12];
    return [];
  };
  
  const numbers = getNumbers();
  
  return (
    <div 
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-4 rounded-lg p-4 cursor-pointer relative min-w-[200px] overflow-visible hover:scale-102 transition-transform"
      {...handlers}
      style={{ 
        pointerEvents: disabled ? 'none' : 'auto',
        borderColor: '#fbbf24',
        boxShadow: '0 0 35px rgba(251, 191, 36, 0.5), inset 0 0 22px rgba(251, 191, 36, 0.12)',
        paddingTop: amount > 0 ? '2.5rem' : '1rem', // Extra padding when chip is present
      }}
    >
      {/* Animated glow overlay */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.3) 0%, transparent 70%)',
        }}
      />
      
      {/* Chip positioned right under the header area (top border) */}
      {amount > 0 && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          <BettingChip amount={amount} small isOff={isOff} />
        </div>
      )}
      
      {/* Casino-style title */}
      <div 
        className="text-center mb-4"
        style={{
          fontFamily: 'Impact, "Arial Black", sans-serif',
          fontSize: '2rem',
          fontWeight: 900,
          color: '#fbbf24',
          textShadow: '0 0 25px rgba(251, 191, 36, 1), 0 0 35px rgba(251, 146, 60, 0.9), 0 0 45px rgba(251, 146, 60, 0.7), 0 2px 8px rgba(0, 0, 0, 1)',
          letterSpacing: '0.1em',
        }}
      >
        {label}
      </div>
      
      {/* Number tracking grid - positioned below chip with extra spacing */}
      <div className="flex justify-center gap-1 mb-3 flex-wrap mt-2">
        {numbers.map(num => (
          <div 
            key={num}
            className={`w-9 h-9 rounded border-2 flex items-center justify-center font-bold transition-all ${
              hit && hit.includes(num) 
                ? 'bg-yellow-400 border-yellow-600 text-black' 
                : 'bg-gray-700 border-gray-500 text-white'
            }`}
            style={hit && hit.includes(num) ? {
              boxShadow: '0 0 15px rgba(251, 191, 36, 0.8)',
            } : {}}
          >
            {num}
          </div>
        ))}
      </div>
      
      {/* Odds display */}
      <div 
        className="text-center font-bold"
        style={{
          color: '#4ade80',
          fontSize: '1rem',
          textShadow: '0 0 10px rgba(74, 222, 128, 0.8), 0 2px 4px rgba(0, 0, 0, 1)',
          letterSpacing: '0.05em',
        }}
      >
        {odds}
      </div>
    </div>
  );
}

function NumberBox({ number, place, onClick, onRightClick, amount, betType, showPuck, puckOn, comeBetAmount, comeOddsAmount, onPlaceComeBet, onRemoveComeBet, onPlaceComeOdds, onRemoveComeOdds, onBuyClick, onBuyRightClick, buyAmount, buyOdds, isBuyOff, isPlaceOff }: any) {
  // Hold-down handlers for Buy section
  const buyHandlers = useBetHandlers({
    onPlace: onBuyClick,
    onRemove: onBuyRightClick,
  });
  
  // Hold-down handlers for Place section
  const placeHandlers = useBetHandlers({
    onPlace: onClick,
    onRemove: onRightClick,
  });
  
  return (
    <div className="relative w-full">
      {/* Container for the three-section layout */}
      <div className="flex flex-col border-2 border-black w-full h-full">
        
        {/* TOP SECTION: Buy Bet Area - Same size as Place area */}
        <div 
          className="bg-green-600 border-b-2 border-black px-3 py-2 text-center cursor-pointer hover:bg-green-500 transition-all relative h-16 flex flex-col items-center justify-center"
          {...buyHandlers}
        >
          <div className="text-white text-xs font-bold leading-tight">
            Buy
          </div>
          <div className="text-white text-xs font-bold leading-tight">
            {buyOdds}
          </div>
          
          {/* Buy bet chip - shown when buy bet is placed */}
          {buyAmount > 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <BettingChip amount={buyAmount} small isOff={isBuyOff} />
            </div>
          )}
        </div>
        
        {/* MIDDLE SECTION: Number Display - NO BETTING HERE, DISPLAY ONLY */}
        <div 
          className="bg-green-600 border-b-2 border-black px-4 py-8 text-center relative h-32 flex items-center justify-center"
        >
          {showPuck && (
            <div 
              className={`absolute -top-3 -right-3 w-10 h-10 border-3 rounded-full flex items-center justify-center text-xs z-10 shadow-xl ${
                puckOn ? 'bg-white border-yellow-400 text-black animate-pulse' : 'bg-black border-gray-600 text-white'
              }`}
              style={{
                boxShadow: puckOn ? '0 0 20px rgba(251, 191, 36, 0.8)' : '0 0 10px rgba(0, 0, 0, 0.5)',
              }}
            >
              {puckOn ? 'ON' : 'OFF'}
            </div>
          )}
          
          {/* Come Bet Area - Box cornered in with white border like real casino */}
          {comeBetAmount > 0 && (
            <div 
              className="absolute top-2 left-2 right-2 border-4 border-white rounded-sm px-2 py-2 text-xs font-bold shadow-lg"
              data-bet-area={`come-number-${number}`}
              style={{ 
                zIndex: 20,
                height: '35%',
                background: 'rgba(20, 184, 166, 0.95)', // Brighter teal/cyan for better chip visibility
                backdropFilter: 'blur(4px)',
                boxShadow: '0 0 0 3px rgba(255, 255, 255, 1), 0 0 20px rgba(20, 184, 166, 0.5), 0 4px 8px rgba(0, 0, 0, 0.4)'
              }}
              title="Come bet on this number - Add odds below!"
              onClick={(e) => {
                e.stopPropagation();
                // Cannot place more chips on a come bet that has already traveled
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // STRICT RULE: Cannot remove come bets that have traveled to a number
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-extrabold tracking-wide" style={{ textShadow: '0 0 6px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.7), 2px 2px 0 rgba(0,0,0,0.8), -2px -2px 0 rgba(0,0,0,0.8)' }}>COME</span>
                <BettingChip amount={comeBetAmount} extraSmall />
              </div>
            </div>
          )}
          
          {/* Come Odds Area - Fill remaining space below come bet */}
          {comeOddsAmount > 0 ? (
            <div 
              className="absolute left-2 right-2 bottom-2 border-4 border-white rounded-sm px-2 py-1 text-xs text-black font-bold shadow-lg"
              data-bet-area={`comeOdds${number}`}
              style={{ 
                zIndex: 19,
                top: comeBetAmount > 0 ? 'calc(35% + 16px)' : '2px',
                background: 'rgba(251, 191, 36, 0.95)', // Brighter amber/yellow for better chip visibility
                boxShadow: '0 0 0 3px rgba(255, 255, 255, 1), 0 0 20px rgba(251, 191, 36, 0.5), 0 4px 8px rgba(0, 0, 0, 0.4)'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (onPlaceComeOdds) onPlaceComeOdds();
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onRemoveComeOdds) onRemoveComeOdds();
              }}
            >
              <div className="flex items-center justify-center h-full">
                <BettingChip amount={comeOddsAmount} extraSmall />
              </div>
            </div>
          ) : comeBetAmount > 0 && (
            // Show "ADD ODDS" button when come bet exists but no odds placed yet - FILLS REMAINING SPACE
            <button
              className="absolute left-2 right-2 bottom-2 bg-yellow-500 hover:bg-yellow-400 border-4 border-white rounded-sm px-2 py-1 text-xs text-black font-extrabold shadow-lg transition-all hover:scale-105 active:scale-95"
              style={{ 
                zIndex: 19,
                top: 'calc(35% + 16px)',
                boxShadow: '0 0 0 2px rgba(255, 255, 255, 0.9), 0 2px 4px rgba(0, 0, 0, 0.3)',
                textShadow: '0 1px 2px rgba(255, 255, 255, 0.5)'
              }}
              onClick={(e) => {
                e.stopPropagation();
                if (onPlaceComeOdds) onPlaceComeOdds();
              }}
              title="Click to place odds behind your Come bet for true odds payouts!"
            >
              ➕ ADD ODDS
            </button>
          )}
          
          {/* Main Number - Large and centered */}
          <div className="text-black text-4xl font-bold whitespace-nowrap" style={{ textShadow: '0 2px 4px rgba(255,255,255,0.3)' }}>
            {number}
          </div>
        </div>
        
        {/* BOTTOM SECTION: Place Bet with Odds */}
        <div 
          className="bg-green-600 px-3 py-2 text-center cursor-pointer hover:bg-green-500 transition-all relative h-16 flex flex-col items-center justify-center"
          {...placeHandlers}
        >
          <div className="text-white text-xs font-bold leading-tight">
            Place
          </div>
          <div className="text-white text-xs font-bold leading-tight">
            {place}
          </div>
          
          {/* Place bet chip - shown when bet is placed */}
          {amount > 0 && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <BettingChip amount={amount} small isOff={isPlaceOff} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function HardwayBox({ dice, payout, onClick, onRightClick, amount, isOff }: any) {
  const handlers = useBetHandlers({
    onPlace: onClick,
    onRemove: onRightClick,
  });
  
  return (
    <div className="bg-gray-100 border border-white rounded p-1 text-center cursor-pointer hover:bg-gray-200 relative"
         {...handlers}>
      {/* Chip positioned right under the title area (top) */}
      {amount > 0 && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <BettingChip amount={amount} small isOff={isOff} />
        </div>
      )}
      
      {/* Dice moved down with extra margin */}
      <div className="flex gap-0.5 justify-center mb-1 mt-2">
        <div className="w-4 h-4 bg-white border border-black rounded text-xs flex items-center justify-center">
          {dice[0]}
        </div>
        <div className="w-4 h-4 bg-white border border-black rounded text-xs flex items-center justify-center">
          {dice[1]}
        </div>
      </div>
      <div className="text-black text-xs">{payout}</div>
    </div>
  );
}

function HopBox({ dice, payout, onClick, onRightClick, amount, isOff }: any) {
  const handlers = useBetHandlers({
    onPlace: onClick,
    onRemove: onRightClick,
  });
  
  return (
    <div className="bg-gray-100 border border-white rounded p-1 text-center cursor-pointer hover:bg-gray-200 relative"
         {...handlers}>
      {/* Chip positioned right under the title area (top) */}
      {amount > 0 && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <BettingChip amount={amount} small isOff={isOff} />
        </div>
      )}
      
      {/* Dice moved down with extra margin */}
      <div className="flex gap-0.5 justify-center mb-1 mt-2">
        <div className="w-4 h-4 bg-white border border-black rounded text-xs flex items-center justify-center">
          {dice[0]}
        </div>
        <div className="w-4 h-4 bg-white border border-black rounded text-xs flex items-center justify-center">
          {dice[1]}
        </div>
      </div>
      <div className="text-black text-xs">{payout}</div>
    </div>
  );
}

function DiceBox({ dice, label, odds, onClick, onRightClick, amount }: any) {
  const handlers = useBetHandlers({
    onPlace: onClick,
    onRemove: onRightClick,
  });
  
  return (
    <div className="bg-gray-100 border border-white rounded p-1 text-center cursor-pointer hover:bg-gray-200 relative"
         {...handlers}>
      <div className="flex gap-0.5 justify-center mb-1">
        <div className="w-5 h-5 bg-white border border-black rounded text-xs flex items-center justify-center">
          {dice[0]}
        </div>
        <div className="w-5 h-5 bg-white border border-black rounded text-xs flex items-center justify-center">
          {dice[1]}
        </div>
      </div>
      <div className="text-black text-xs">{label}</div>
      <div className="text-black text-xs">{odds}</div>
      {amount > 0 && <BettingChip amount={amount} small />}
    </div>
  );
}