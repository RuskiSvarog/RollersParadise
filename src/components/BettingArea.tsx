import { Bet } from './CrapsTable';

interface BettingAreaProps {
  bets: Bet[];
  onPlaceBet: (type: string, amount: number) => void;
  onClearBets: () => void;
  balance: number;
  isRolling: boolean;
}

export function BettingArea({ bets, onPlaceBet, onClearBets, balance, isRolling }: BettingAreaProps) {
  const chipValues = [5, 10, 25, 50, 100, 500, 1000];
  
  const getBetAmount = (type: string) => {
    const bet = bets.find(b => b.type === type);
    return bet ? bet.amount : 0;
  };

  return (
    <div>
      <div className="mb-6">
        <div className="text-yellow-400 text-center mb-3">Select Chip Value:</div>
        <div className="flex justify-center gap-3 flex-wrap">
          {chipValues.map(value => (
            <button
              key={value}
              disabled={balance < value || isRolling}
              className="w-16 h-16 rounded-full border-4 border-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-110 active:scale-95"
              style={{
                background: value === 5 ? '#dc2626' : 
                           value === 10 ? '#1e40af' : 
                           value === 25 ? '#15803d' : 
                           value === 50 ? '#7c3aed' : 
                           value === 100 ? '#000000' :
                           value === 500 ? '#7c3aed' :
                           value === 1000 ? '#f59e0b' : '#f5f5f5'
              }}
              onClick={() => {}}
              data-chip-value={value}
            >
              <div className="text-white">${value}</div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <BettingSpot
          label="PASS LINE"
          type="pass"
          amount={getBetAmount('pass')}
          onPlaceBet={onPlaceBet}
          chipValues={chipValues}
          isRolling={isRolling}
          balance={balance}
        />
        <BettingSpot
          label="DON'T PASS"
          type="dontPass"
          amount={getBetAmount('dontPass')}
          onPlaceBet={onPlaceBet}
          chipValues={chipValues}
          isRolling={isRolling}
          balance={balance}
        />
      </div>

      <div className="text-center">
        <button
          onClick={onClearBets}
          disabled={bets.length === 0 || isRolling}
          className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
        >
          Clear All Bets
        </button>
      </div>
    </div>
  );
}

interface BettingSpotProps {
  label: string;
  type: string;
  amount: number;
  onPlaceBet: (type: string, amount: number) => void;
  chipValues: number[];
  isRolling: boolean;
  balance: number;
}

function BettingSpot({ label, type, amount, onPlaceBet, chipValues, isRolling, balance }: BettingSpotProps) {
  return (
    <div className="bg-green-900 border-4 border-white rounded-lg p-6 text-center">
      <div className="text-yellow-400 mb-3">{label}</div>
      {amount > 0 && (
        <div className="text-white mb-3">
          Bet: ${amount}
        </div>
      )}
      <div className="flex justify-center gap-2 flex-wrap">
        {chipValues.map(value => (
          <button
            key={value}
            onClick={() => onPlaceBet(type, value)}
            disabled={balance < value || isRolling}
            className="w-12 h-12 rounded-full border-2 border-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:scale-110 active:scale-95 text-white text-sm"
            style={{
              background: value === 5 ? '#dc2626' : 
                         value === 10 ? '#1e40af' : 
                         value === 25 ? '#15803d' : 
                         value === 50 ? '#7c3aed' : 
                         value === 100 ? '#000000' :
                         value === 500 ? '#7c3aed' :
                         value === 1000 ? '#f59e0b' : '#f5f5f5'
            }}
          >
            ${value}
          </button>
        ))}
      </div>
    </div>
  );
}
