import { Trophy, Sparkles, TrendingUp, Zap } from './Icons';
import { useSettings } from '../contexts/SettingsContext';

interface WinNotificationProps {
  amount: number;
  show: boolean;
  message?: string; // Optional dealer message
  betDetails?: Array<{ betName: string; winAmount: number }>; // Individual bet breakdowns
  dice1?: number; // First die value
  dice2?: number; // Second die value
  total?: number; // Total roll
}

export function WinNotification({ amount, show, message = '', betDetails, dice1, dice2, total }: WinNotificationProps) {
  const { settings } = useSettings();
  
  if (!show || amount === 0) return null;

  // Determine win level for different animations
  const isBigWin = amount >= 200;
  const isMegaWin = amount >= 500;
  const isHugeWin = amount >= 1000;

  return (
    <>
      {show && (
        <>
          {/* Smooth overlay backdrop */}
          <div className="fixed inset-0 bg-black opacity-40 z-40 pointer-events-none animate-in fade-in duration-300" />

          {/* Confetti/Sparkles Background - only if particles enabled */}
          {settings.enableParticles && settings.showConfetti && (
            <div className="fixed inset-0 z-40 pointer-events-none overflow-hidden animate-in fade-in duration-500">
              {[...Array(isMegaWin ? 40 : isBigWin ? 30 : 20)].map((_, i) => {
                const emojis = isHugeWin 
                  ? ['💎', '👑', '🏆', '⭐', '💰', '✨', '🌟', '🎊']
                  : isBigWin 
                  ? ['🎉', '💰', '⭐', '✨', '🌟', '🎊']
                  : ['🎉', '💰', '⭐', '✨', '🌟'];
                
                const randomX = Math.random() * 100;
                const randomY = Math.random() * 100;
                const randomDelay = Math.random() * 0.6;
                
                return (
                  <div
                    key={i}
                    className="absolute text-4xl animate-confetti"
                    style={{
                      left: `${randomX}%`,
                      top: `${randomY}%`,
                      animationDelay: `${randomDelay}s`,
                    }}
                  >
                    {emojis[Math.floor(Math.random() * emojis.length)]}
                  </div>
                );
              })}
            </div>
          )}

          {/* Main Win Display - Smoother entrance */}
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 animate-in zoom-in slide-in-from-bottom-24 duration-500 delay-200">
            <div 
              className="relative px-16 py-12 rounded-3xl shadow-2xl border-8 flex flex-col items-center gap-4 animate-pulse-glow"
              style={{
                background: isHugeWin 
                  ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f97316 100%)'
                  : isBigWin
                  ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)'
                  : 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                borderImage: 'linear-gradient(45deg, #fff, #fbbf24, #fff) 1',
                boxShadow: isHugeWin
                  ? '0 0 100px rgba(168, 85, 247, 1), 0 20px 80px rgba(0, 0, 0, 0.5)'
                  : isBigWin
                  ? '0 0 80px rgba(251, 191, 36, 1), 0 20px 60px rgba(0, 0, 0, 0.4)'
                  : '0 0 60px rgba(16, 185, 129, 0.8), 0 20px 60px rgba(0, 0, 0, 0.4)',
              }}
            >
              {/* Animated Icon */}
              <div className="animate-in spin-in zoom-in duration-500 delay-300">
                <div className="animate-wiggle">
                  {isHugeWin ? (
                    <div className="text-8xl">💎</div>
                  ) : isBigWin ? (
                    <Trophy className="w-24 h-24 text-yellow-900 drop-shadow-lg" />
                  ) : (
                    <TrendingUp className="w-20 h-20 text-green-900 drop-shadow-lg" />
                  )}
                </div>
              </div>
              
              <div className="text-center">
                {/* Dealer Message */}
                {message && (
                  <div 
                    className="text-2xl text-white tracking-wider mb-2 animate-in fade-in slide-in-from-top-2 duration-300 delay-400"
                    style={{ 
                      textShadow: '2px 2px 4px rgba(0,0,0,0.4)',
                      fontWeight: 'bold'
                    }}
                  >
                    {message}
                  </div>
                )}
                
                <div 
                  className={`${isHugeWin ? 'text-4xl' : isBigWin ? 'text-3xl' : 'text-2xl'} text-white tracking-wider flex items-center justify-center gap-2 mb-2 animate-in zoom-in fade-in duration-300 delay-500`}
                  style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}
                >
                  <Sparkles className="w-6 h-6" />
                  {isHugeWin ? 'MEGA WIN!' : isBigWin ? 'BIG WIN!' : 'YOU WIN!'}
                  <Sparkles className="w-6 h-6" />
                </div>
                
                {/* Individual bet breakdown - if multiple bets won */}
                {betDetails && betDetails.length > 0 && (
                  <div className="mb-4 space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300 delay-600">
                    {betDetails.map((bet, index) => (
                      <div
                        key={bet.betName}
                        className="bg-white/20 rounded-lg px-4 py-2 backdrop-blur-sm animate-in fade-in slide-in-from-left-5 duration-300"
                        style={{ animationDelay: `${700 + index * 150}ms` }}
                      >
                        <div className="flex justify-between items-center gap-6 text-white">
                          <span className="text-xl font-bold">{bet.betName}:</span>
                          <span className="text-2xl font-black" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.4)' }}>
                            +${bet.winAmount.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {/* Divider line */}
                    <div 
                      className="h-1 bg-white/50 rounded-full my-3 animate-in fade-in zoom-in-x duration-300"
                      style={{ animationDelay: `${700 + betDetails.length * 150 + 100}ms` }}
                    />
                  </div>
                )}
                
                {/* Winning Dice Roll Display - Shows the dice combination */}
                {dice1 !== undefined && dice2 !== undefined && total !== undefined && (
                  <div 
                    className="mb-6 mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
                    style={{ animationDelay: betDetails && betDetails.length > 0 ? `${700 + betDetails.length * 150 + 150}ms` : '650ms' }}
                  >
                    <div className="flex items-center justify-center gap-3">
                      {/* Dice 1 - Always highlighted in blue for winning roll */}
                      <div
                        className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl px-6 py-4 shadow-2xl border-4 border-blue-300 animate-in spin-in zoom-in duration-500"
                        style={{
                          boxShadow: '0 0 20px rgba(59, 130, 246, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                          animationDelay: betDetails && betDetails.length > 0 ? `${800 + betDetails.length * 150}ms` : '750ms'
                        }}
                      >
                        <div className="text-5xl font-black text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                          {dice1}
                        </div>
                      </div>

                      {/* Plus Sign */}
                      <div
                        className="text-4xl text-white font-black animate-in zoom-in fade-in duration-300"
                        style={{ 
                          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                          animationDelay: betDetails && betDetails.length > 0 ? `${850 + betDetails.length * 150}ms` : '800ms'
                        }}
                      >
                        +
                      </div>

                      {/* Dice 2 - Always highlighted in blue for winning roll */}
                      <div
                        className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl px-6 py-4 shadow-2xl border-4 border-blue-300 animate-in spin-in zoom-in duration-500"
                        style={{
                          boxShadow: '0 0 20px rgba(59, 130, 246, 0.8), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                          animationDelay: betDetails && betDetails.length > 0 ? `${900 + betDetails.length * 150}ms` : '850ms'
                        }}
                      >
                        <div className="text-5xl font-black text-white" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                          {dice2}
                        </div>
                      </div>

                      {/* Equals Sign */}
                      <div
                        className="text-4xl text-white font-black animate-in zoom-in fade-in duration-300"
                        style={{ 
                          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                          animationDelay: betDetails && betDetails.length > 0 ? `${950 + betDetails.length * 150}ms` : '900ms'
                        }}
                      >
                        =
                      </div>

                      {/* Total - Always highlighted in blue for winning roll */}
                      <div
                        className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl px-8 py-4 shadow-2xl border-4 border-blue-300 animate-in zoom-in duration-500"
                        style={{
                          boxShadow: '0 0 25px rgba(59, 130, 246, 1), inset 0 2px 4px rgba(255, 255, 255, 0.3)',
                          animationDelay: betDetails && betDetails.length > 0 ? `${1000 + betDetails.length * 150}ms` : '950ms'
                        }}
                      >
                        <div className="text-6xl font-black text-white" style={{ textShadow: '3px 3px 6px rgba(0,0,0,0.6)' }}>
                          {total}
                        </div>
                      </div>
                    </div>
                    
                    {/* Winning Roll Label */}
                    <div
                      className="text-center mt-3 animate-in fade-in duration-300"
                      style={{ animationDelay: betDetails && betDetails.length > 0 ? `${1100 + betDetails.length * 150}ms` : '1000ms' }}
                    >
                      <span className="text-lg text-white/90 tracking-widest" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.4)' }}>
                        🎲 WINNING ROLL 🎲
                      </span>
                    </div>
                  </div>
                )}
                
                <div 
                  className={`${isHugeWin ? 'text-8xl' : isBigWin ? 'text-7xl' : 'text-6xl'} text-white animate-in zoom-in duration-500`}
                  style={{ 
                    textShadow: '4px 4px 8px rgba(0,0,0,0.4), 0 0 30px rgba(255,255,255,0.6)',
                    fontWeight: 'black',
                    animationDelay: betDetails && betDetails.length > 0 ? `${700 + betDetails.length * 150 + 200}ms` : '600ms'
                  }}
                >
                  <span className="animate-pulse-bright">
                    +${amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Corner Sparkles */}
              <div
                className="absolute top-4 right-4 text-3xl animate-in spin-in zoom-in duration-500 delay-700"
              >
                <div className="animate-spin-slow">✨</div>
              </div>
              <div
                className="absolute bottom-4 left-4 text-3xl animate-in spin-in zoom-in duration-500 delay-700"
              >
                <div className="animate-spin-slow-reverse">⭐</div>
              </div>
              <div
                className="absolute top-4 left-4 text-3xl animate-in zoom-in duration-500 delay-800"
              >
                <div className="animate-spin-slow">🌟</div>
              </div>
              <div
                className="absolute bottom-4 right-4 text-3xl animate-in zoom-in duration-500 delay-800"
              >
                {isHugeWin ? '👑' : isBigWin ? '🎊' : '💰'}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
