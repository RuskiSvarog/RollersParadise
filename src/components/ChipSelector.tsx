import { RotateCcw } from 'lucide-react';
import { CasinoChip } from './CasinoChip';
import { ElectronicDiceBox } from './ElectronicDiceBox';

interface ChipSelectorProps {
  selectedChip: number;
  onSelectChip: (value: number) => void;
  balance: number;
  onRoll: () => void;
  totalBet: number;
  minBet: number;
  isRolling: boolean;
  buttonsLocked?: boolean;
  onDoubleLastBet?: () => void;
  onRepeatLastBet?: () => void;
  hasLastBet?: boolean;
  dice1?: number;
  dice2?: number;
  lastWin?: number; // NEW: Show last win amount
}

export function ChipSelector({ 
  selectedChip, 
  onSelectChip, 
  balance, 
  onRoll,
  totalBet,
  minBet,
  isRolling,
  buttonsLocked = false,
  onDoubleLastBet,
  onRepeatLastBet,
  hasLastBet = false,
  dice1 = 1,
  dice2 = 1,
  lastWin = 0 // NEW: Default to 0
}: ChipSelectorProps) {
  const chips = [1, 5, 10, 25, 50, 100, 500, 1000];
  const canRoll = totalBet >= minBet;

  return (
    <div className="flex justify-between items-center px-2 py-2 gap-3 w-full">
      {/* Chips - Left side, evenly spaced */}
      <div className="flex justify-start gap-4 flex-1 items-center">
        {chips.map((value) => (
          <CasinoChip
            key={value}
            value={value}
            onClick={() => onSelectChip(value)}
            isDisabled={balance < value}
            isSelected={selectedChip === value}
            size="medium"
          />
        ))}
      </div>

      {hasLastBet && (
        <>
          <button
            onClick={onDoubleLastBet}
            disabled={isRolling || buttonsLocked}
            className="bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-black px-3 py-2 rounded-lg transition-colors border-2 border-yellow-700 shadow-lg flex-shrink-0"
          >
            <div className="text-xs font-bold">DOUBLE</div>
            <div className="text-xs font-bold">CURRENT BET</div>
          </button>

          <button
            onClick={onRepeatLastBet}
            disabled={isRolling || buttonsLocked}
            className="bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-black px-3 py-2 rounded-lg transition-colors border-2 border-yellow-700 shadow-lg flex-shrink-0"
          >
            <div className="text-xs font-bold">REPEAT</div>
            <div className="text-xs font-bold">CURRENT BET</div>
          </button>
        </>
      )}
    </div>
  );
}