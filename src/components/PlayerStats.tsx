import { Wallet, TrendingUp } from './Icons';

interface PlayerStatsProps {
  balance: number;
  totalBet: number;
}

export function PlayerStats({ balance, totalBet }: PlayerStatsProps) {
  return (
    <div className="bg-green-800 rounded-lg p-6 mb-6 shadow-lg border-2 border-yellow-600">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="flex items-center gap-3">
          <Wallet className="w-8 h-8 text-yellow-400" />
          <div>
            <div className="text-green-200 text-sm">Your Balance</div>
            <div className="text-yellow-400 text-2xl">${balance}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-yellow-400" />
          <div>
            <div className="text-green-200 font-bold">CURRENT BET</div>
            <div className="text-yellow-400 text-2xl font-bold">${totalBet}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
