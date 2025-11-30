import { Trophy, TrendingUp, Zap, Sparkles, DollarSign } from './Icons';
import { useEffect, useState } from 'react';

interface WinDetail {
  betType: string;
  betAmount: number;
  payout: number;
  odds: string;
  position?: number;
}

interface WinDisplayProps {
  totalWinnings: number;
  winDetails: WinDetail[];
  onClose: () => void;
}

export function WinDisplay({ totalWinnings, winDetails, onClose }: WinDisplayProps) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    // Generate confetti particles
    const newParticles = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: -20,
      delay: Math.random() * 0.5,
    }));
    setParticles(newParticles);

    // Auto close after 8 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 8000);

    return () => clearTimeout(timer);
  }, [onClose]);

  // Determine celebration level based on winnings
  const getCelebrationLevel = () => {
    if (totalWinnings >= 1000) return 'legendary';
    if (totalWinnings >= 500) return 'epic';
    if (totalWinnings >= 100) return 'rare';
    return 'common';
  };

  const celebrationLevel = getCelebrationLevel();

  const celebrationColors = {
    legendary: {
      bg: 'from-yellow-500 via-orange-500 to-red-500',
      border: 'border-yellow-400',
      glow: 'rgba(251, 191, 36, 0.8)',
      text: 'text-yellow-300',
    },
    epic: {
      bg: 'from-purple-500 via-pink-500 to-purple-600',
      border: 'border-purple-400',
      glow: 'rgba(168, 85, 247, 0.6)',
      text: 'text-purple-300',
    },
    rare: {
      bg: 'from-blue-500 via-cyan-500 to-blue-600',
      border: 'border-blue-400',
      glow: 'rgba(59, 130, 246, 0.6)',
      text: 'text-blue-300',
    },
    common: {
      bg: 'from-green-500 via-emerald-500 to-green-600',
      border: 'border-green-400',
      glow: 'rgba(34, 197, 94, 0.6)',
      text: 'text-green-300',
    },
  };

  const colors = celebrationColors[celebrationLevel];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={onClose}
    >
      {/* Confetti Particles */}
      {showConfetti && particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-3 h-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full animate-fall"
          style={{
            left: `${particle.x}vw`,
            top: '-20px',
            boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)',
            animationDuration: `${3 + Math.random() * 2}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Win Display Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        className={`relative bg-gradient-to-br ${colors.bg} border-4 ${colors.border} rounded-3xl shadow-2xl p-8 max-w-2xl w-full mx-4 animate-in zoom-in-50 fade-in slide-in-from-bottom-24 duration-500`}
        style={{
          boxShadow: `0 0 60px ${colors.glow}, 0 20px 60px rgba(0, 0, 0, 0.8)`,
        }}
      >
        {/* Pulsing Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-3xl pointer-events-none animate-pulse" />

        {/* Header */}
        <div className="text-center mb-6 relative z-10">
          <div className="inline-block mb-4 animate-in spin-in-180 zoom-in-0 duration-500" style={{ animationDelay: '0.2s' }}>
            <Trophy className="w-20 h-20 text-yellow-300 drop-shadow-2xl" />
          </div>

          <h1
            className="uppercase tracking-wider mb-2 animate-in fade-in slide-in-from-top-4 duration-500"
            style={{
              fontSize: '3.5rem',
              fontFamily: 'Impact, sans-serif',
              color: '#fff',
              textShadow: '0 0 30px rgba(255, 255, 255, 0.8), 0 0 60px rgba(251, 191, 36, 0.6), 0 4px 12px rgba(0, 0, 0, 1)',
              WebkitTextStroke: '2px rgba(0, 0, 0, 0.5)',
              animationDelay: '0.3s',
            }}
          >
            BIG WIN!
          </h1>

          <div
            className="text-white mb-4 animate-in zoom-in-50 fade-in duration-500"
            style={{
              fontSize: '4rem',
              fontFamily: 'Impact, sans-serif',
              textShadow: '0 0 40px rgba(255, 255, 255, 1), 0 0 80px rgba(251, 191, 36, 0.8), 0 6px 16px rgba(0, 0, 0, 1)',
              WebkitTextStroke: '3px rgba(0, 0, 0, 0.6)',
              animationDelay: '0.4s',
            }}
          >
            ${totalWinnings.toLocaleString()}
          </div>

          {celebrationLevel === 'legendary' && (
            <p
              className="text-yellow-200 text-xl tracking-widest uppercase animate-in fade-in duration-500"
              style={{
                fontFamily: 'Impact, sans-serif',
                textShadow: '0 2px 8px rgba(0, 0, 0, 0.8)',
                animationDelay: '0.5s',
              }}
            >
              🔥 LEGENDARY WIN! 🔥
            </p>
          )}
        </div>

        {/* Win Breakdown */}
        <div
          className="bg-black/40 rounded-2xl p-6 backdrop-blur-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: '0.6s' }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-yellow-300" />
            <h3 className="text-white uppercase tracking-wider" style={{ fontFamily: 'Impact, sans-serif' }}>
              Winning Bets Breakdown
            </h3>
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {winDetails.map((detail, index) => (
              <div
                key={index}
                className="bg-white/10 rounded-lg p-4 border-2 border-white/20 animate-in fade-in slide-in-from-left-4 duration-300"
                style={{ animationDelay: `${0.7 + index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full w-8 h-8 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-white font-bold">
                        {detail.betType}
                        {detail.position && ` on ${detail.position}`}
                      </div>
                      <div className="text-gray-300 text-sm">
                        Bet: ${detail.betAmount} • Odds: {detail.odds}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-green-300 font-bold text-xl">
                      +${detail.payout}
                    </div>
                  </div>
                </div>
                <div className="bg-green-500/20 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-emerald-500 h-full animate-progress"
                    style={{ animationDelay: `${0.8 + index * 0.1}s` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Message */}
        <div
          className="text-center animate-in fade-in duration-500"
          style={{ animationDelay: '1s' }}
        >
          <p className="text-white/80 text-sm">
            Click anywhere to continue • Auto-close in 8s
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(120vh) rotate(360deg); opacity: 0; }
        }
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-fall {
          animation: fall 3s ease-in forwards;
        }
        .animate-progress {
          animation: progress 0.5s ease-out forwards;
          width: 0%;
        }
      `}</style>
    </div>
  );
}
