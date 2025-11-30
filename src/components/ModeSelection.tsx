import { LogOut, Users, Target, Sparkles, Trophy, Zap } from './Icons';
import { GameSettingsType } from './GameSettings';
import { MusicVolumeSlider } from './MusicVolumeSlider';

interface ModeSelectionProps {
  profile: { name: string; email: string; avatar?: string };
  onSelectSinglePlayer: () => void;
  onSelectMultiplayer: () => void;
  onLogout: () => void;
  onSettingsChange?: (settings: GameSettingsType) => void;
  currentSettings?: GameSettingsType;
}

export function ModeSelection({
  profile,
  onSelectSinglePlayer,
  onSelectMultiplayer,
  onLogout,
}: ModeSelectionProps) {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: 'radial-gradient(circle at 50% 50%, #1a0f0f 0%, #0a0505 50%, #000000 100%)',
        minHeight: '100vh',
        paddingTop: '2rem',
        paddingBottom: '2rem',
      }}
    >
      {/* Animated Casino Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Rich velvet texture overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(139, 0, 0, 0.03) 2px,
              rgba(139, 0, 0, 0.03) 4px
            ),
            repeating-linear-gradient(
              90deg,
              transparent,
              transparent 2px,
              rgba(139, 0, 0, 0.03) 2px,
              rgba(139, 0, 0, 0.03) 4px
            )`,
          }}
        />

        {/* Premium gold orbs */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-10 animate-pulse"
            style={{
              background: i % 2 === 0 
                ? 'radial-gradient(circle, rgba(212, 175, 55, 0.6) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(184, 134, 11, 0.5) 0%, transparent 70%)',
              width: `${250 + i * 60}px`,
              height: `${250 + i * 60}px`,
              left: `${i * 15}%`,
              top: `${i * 12}%`,
              animationDuration: `${10 + i * 3}s`,
              animationDelay: `${i * 0.7}s`,
              filter: 'blur(60px)',
            }}
          />
        ))}

        {/* Floating poker chips */}
        {[...Array(12)].map((_, i) => (
          <div
            key={`chip-${i}`}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
              fontSize: '32px',
              opacity: 0.15,
            }}
          >
            🎰
          </div>
        ))}

        {/* Casino floor pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(45deg, transparent 48%, rgba(212, 175, 55, 0.1) 48%, rgba(212, 175, 55, 0.1) 52%, transparent 52%),
              linear-gradient(-45deg, transparent 48%, rgba(212, 175, 55, 0.1) 48%, rgba(212, 175, 55, 0.1) 52%, transparent 52%)
            `,
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      {/* Main Content Card */}
      <div 
        className="relative z-10 rounded-3xl shadow-2xl max-w-6xl w-full overflow-hidden animate-in zoom-in-95 fade-in duration-700"
        style={{
          background: 'linear-gradient(155deg, rgba(26, 15, 15, 0.98) 0%, rgba(20, 10, 10, 0.98) 30%, rgba(15, 8, 8, 0.98) 70%, rgba(26, 15, 15, 0.98) 100%)',
          border: '4px solid',
          borderImage: 'linear-gradient(135deg, #d4af37 0%, #f4e5c3 25%, #d4af37 50%, #b8860b 75%, #d4af37 100%) 1',
          boxShadow: `
            0 0 100px rgba(212, 175, 55, 0.4),
            0 0 200px rgba(212, 175, 55, 0.2),
            0 30px 90px rgba(0, 0, 0, 0.95),
            inset 0 0 100px rgba(212, 175, 55, 0.05)
          `,
        }}
      >
        {/* Premium border animation */}
        <div
          className="absolute inset-0 pointer-events-none animate-pulse"
          style={{
            background: 'linear-gradient(135deg, transparent 0%, rgba(212, 175, 55, 0.08) 50%, transparent 100%)',
            animationDuration: '3s',
          }}
        />

        {/* Luxury corner accents */}
        {[...Array(4)].map((_, i) => (
          <div
            key={`corner-${i}`}
            className="absolute w-16 h-16 z-20"
            style={{
              top: i < 2 ? '0' : 'auto',
              bottom: i >= 2 ? '0' : 'auto',
              left: i % 2 === 0 ? '0' : 'auto',
              right: i % 2 === 1 ? '0' : 'auto',
              borderTop: i < 2 ? '4px solid #d4af37' : 'none',
              borderBottom: i >= 2 ? '4px solid #d4af37' : 'none',
              borderLeft: i % 2 === 0 ? '4px solid #d4af37' : 'none',
              borderRight: i % 2 === 1 ? '4px solid #d4af37' : 'none',
              boxShadow: '0 0 30px rgba(212, 175, 55, 0.8)',
            }}
          >
            <div 
              className="absolute w-2 h-2 rounded-full bg-amber-400 animate-pulse"
              style={{
                top: i < 2 ? '-4px' : 'auto',
                bottom: i >= 2 ? '-4px' : 'auto',
                left: i % 2 === 0 ? '-4px' : 'auto',
                right: i % 2 === 1 ? '-4px' : 'auto',
                boxShadow: '0 0 15px rgba(251, 191, 36, 1)',
              }}
            />
          </div>
        ))}

        {/* Premium Casino Logo Header */}
        <div className="relative px-8 pt-8 pb-6">
          <div className="flex justify-center items-center">
            <div 
              className="relative px-16 py-8 rounded-2xl"
              style={{
                background: 'linear-gradient(155deg, #1e1b4b 0%, #312e81 20%, #4c1d95 40%, #312e81 60%, #1e1b4b 80%, #0f0a1e 100%)',
                border: '6px solid transparent',
                backgroundClip: 'padding-box',
                boxShadow: `
                  0 0 0 2px #d4af37,
                  0 0 0 6px rgba(0, 0, 0, 0.5),
                  0 0 0 8px #d4af37,
                  0 0 0 10px rgba(0, 0, 0, 0.5),
                  0 0 0 12px #b8860b,
                  0 0 80px rgba(212, 175, 55, 0.9),
                  0 0 120px rgba(212, 175, 55, 0.6),
                  0 15px 60px rgba(0, 0, 0, 1),
                  inset 0 0 60px rgba(212, 175, 55, 0.15),
                  inset 0 -8px 40px rgba(0, 0, 0, 0.7)
                `,
              }}
            >
              {/* Ornate corner flourishes */}
              {[...Array(4)].map((_, i) => (
                <div
                  key={`flourish-${i}`}
                  className="absolute text-4xl"
                  style={{
                    top: i < 2 ? '-20px' : 'auto',
                    bottom: i >= 2 ? '-20px' : 'auto',
                    left: i % 2 === 0 ? '-20px' : 'auto',
                    right: i % 2 === 1 ? '-20px' : 'auto',
                    color: '#d4af37',
                    textShadow: '0 0 20px rgba(212, 175, 55, 1)',
                    filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.8))',
                  }}
                >
                  ◆
                </div>
              ))}
              
              {/* Casino icons */}
              <div className="absolute -top-6 -left-6 text-4xl animate-bounce">🎲</div>
              <div className="absolute -top-6 -right-6 text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎰</div>
              <div className="absolute -bottom-6 -left-6 text-4xl animate-bounce" style={{ animationDelay: '1s' }}>💎</div>
              <div className="absolute -bottom-6 -right-6 text-4xl animate-bounce" style={{ animationDelay: '1.5s' }}>🃏</div>
              
              {/* Premium sparkles */}
              <div className="absolute top-1/2 -left-8 text-2xl animate-pulse" style={{ color: '#d4af37' }}>✦</div>
              <div className="absolute top-1/2 -right-8 text-2xl animate-pulse" style={{ animationDelay: '0.75s', color: '#d4af37' }}>✦</div>
              
              {/* Main casino title */}
              <div 
                className="text-6xl tracking-widest font-black text-center animate-gradient mb-2"
                style={{
                  fontFamily: 'Georgia, serif',
                  background: 'linear-gradient(135deg, #d4af37 0%, #f4e5c3 10%, #fff 20%, #f4e5c3 30%, #d4af37 40%, #b8860b 50%, #d4af37 60%, #f4e5c3 70%, #fff 80%, #f4e5c3 90%, #d4af37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundSize: '300% 300%',
                  filter: 'drop-shadow(0 0 25px rgba(212, 175, 55, 1)) drop-shadow(0 0 50px rgba(212, 175, 55, 0.8)) drop-shadow(0 4px 8px rgba(0, 0, 0, 1))',
                  letterSpacing: '0.15em',
                }}
              >
                ROLLERS PARADISE
              </div>
              
              {/* Elegant separator */}
              <div className="flex items-center justify-center gap-4 mb-2">
                <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                <div className="text-amber-400 text-2xl">◆</div>
                <div className="h-0.5 w-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              </div>
              
              {/* Casino subtitle */}
              <div 
                className="text-lg text-center font-bold tracking-[0.3em] animate-pulse"
                style={{
                  fontFamily: 'Georgia, serif',
                  background: 'linear-gradient(90deg, #d4af37 0%, #f4e5c3 50%, #d4af37 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 0 15px rgba(212, 175, 55, 0.9))',
                  animationDuration: '2.5s',
                }}
              >
                CRAPLESS CRAPS • BUBBLE CRAPS
              </div>
              
              {/* Premium badge */}
              <div 
                className="mt-3 text-center text-xs tracking-widest font-bold"
                style={{
                  color: '#d4af37',
                  textShadow: '0 0 10px rgba(212, 175, 55, 0.8)',
                }}
              >
                EST. 2025 • CERTIFIED FAIR GAMING
              </div>
            </div>
          </div>
          
          {/* Logout button - premium styling */}
          <button
            onClick={onLogout}
            className="absolute top-8 right-8 group bg-gradient-to-br from-green-700 to-green-900 hover:from-green-600 hover:to-green-800 text-white px-6 py-3 rounded-xl shadow-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2 border-2 border-green-400"
            style={{
              boxShadow: '0 0 30px rgba(34, 197, 94, 0.6), inset 0 -4px 8px rgba(0, 0, 0, 0.4)',
            }}
          >
            <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            <span className="font-black tracking-wide">HOME</span>
          </button>
        </div>

        {/* Welcome Section */}
        <div className="relative px-8 py-6">
          <div className="animate-in slide-in-from-top-4 fade-in duration-500" style={{ animationDelay: '0.2s' }}>
            <div className="text-center mb-4">
              <div 
                className="inline-block px-6 py-2 rounded-lg mb-3"
                style={{
                  background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(20, 10, 10, 0.8) 100%)',
                  border: '2px solid rgba(212, 175, 55, 0.5)',
                  boxShadow: '0 0 20px rgba(212, 175, 55, 0.3)',
                }}
              >
                <div className="text-sm text-amber-400 font-bold uppercase tracking-widest">Welcome Back</div>
              </div>
              <div 
                className="text-5xl font-black mb-4"
                style={{
                  fontFamily: 'Georgia, serif',
                  background: 'linear-gradient(135deg, #ffffff 0%, #d4af37 50%, #ffffff 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  filter: 'drop-shadow(0 2px 15px rgba(212, 175, 55, 0.6))',
                  letterSpacing: '0.05em',
                }}
              >
                {profile.name}
              </div>
            </div>

            {/* CENTER the "SELECT YOUR GAMING EXPERIENCE" text */}
            <div className="text-center">
              <div
                className="inline-block px-8 py-3 rounded-full font-bold tracking-widest animate-glow"
                style={{
                  background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(184, 134, 11, 0.15) 100%)',
                  border: '3px solid rgba(212, 175, 55, 0.6)',
                  color: '#d4af37',
                  boxShadow: '0 0 30px rgba(212, 175, 55, 0.4), inset 0 0 20px rgba(212, 175, 55, 0.1)',
                  fontFamily: 'Georgia, serif',
                  fontSize: '0.95rem',
                }}
              >
                ◆ SELECT YOUR GAMING EXPERIENCE ◆
              </div>
            </div>
          </div>
        </div>

        {/* Mode Selection Cards */}
        <div className="relative p-8 pt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Single Player Card */}
            <button
              onClick={onSelectSinglePlayer}
              className="group relative overflow-hidden rounded-2xl p-8 border-4 transition-all hover:scale-[1.03] active:scale-98 animate-in slide-in-from-left-12 fade-in duration-500"
              style={{
                background: 'linear-gradient(145deg, rgba(22, 163, 74, 0.95) 0%, rgba(21, 128, 61, 0.95) 50%, rgba(22, 163, 74, 0.95) 100%)',
                borderColor: '#4ade80',
                boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)',
                animationDelay: '0.3s',
              }}
            >
              {/* Animated shine effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity animate-shine"
                style={{
                  background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
                }}
              />

              {/* Icon with glow */}
              <div className="relative mb-6 group-hover:animate-spin-slow">
                <div 
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-white"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                    boxShadow: '0 0 40px rgba(74, 222, 128, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Target className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Title */}
              <div 
                className="text-5xl font-black mb-4 tracking-wider"
                style={{
                  fontFamily: 'Impact, sans-serif',
                  color: '#ffffff',
                  textShadow: '0 0 30px rgba(255, 255, 255, 1), 0 0 50px rgba(74, 222, 128, 1), 0 4px 10px rgba(0, 0, 0, 1)',
                }}
              >
                SINGLE PLAYER
              </div>

              {/* Description */}
              <div className="font-black text-xl mb-6 leading-relaxed"
                style={{
                  color: '#ffffff',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 0 15px rgba(255, 255, 255, 0.5)',
                }}
              >
                Practice your skills, master the game, and play at your own pace
              </div>

              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg px-4 py-3"
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 0 15px rgba(74, 222, 128, 0.4)',
                  }}
                >
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-black text-lg" style={{ textShadow: '0 2px 6px rgba(0, 0, 0, 1)' }}>Instant Play - No Waiting</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3"
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 0 15px rgba(74, 222, 128, 0.4)',
                  }}
                >
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-black text-lg" style={{ textShadow: '0 2px 6px rgba(0, 0, 0, 1)' }}>Build Your Strategy</span>
                </div>
              </div>

              {/* Play Now Button */}
              <div
                className="mt-6 bg-white text-green-700 font-black text-xl py-4 rounded-xl animate-glow"
                style={{
                  boxShadow: '0 0 30px rgba(255, 255, 255, 0.4)',
                }}
              >
                🎯 PLAY NOW
              </div>
            </button>

            {/* Multiplayer Card */}
            <button
              onClick={onSelectMultiplayer}
              className="group relative overflow-hidden rounded-2xl p-8 border-4 transition-all hover:scale-[1.03] active:scale-98 animate-in slide-in-from-right-12 fade-in duration-500"
              style={{
                background: 'linear-gradient(145deg, rgba(37, 99, 235, 0.95) 0%, rgba(29, 78, 216, 0.95) 50%, rgba(37, 99, 235, 0.95) 100%)',
                borderColor: '#60a5fa',
                boxShadow: '0 0 30px rgba(59, 130, 246, 0.4)',
                animationDelay: '0.4s',
              }}
            >
              {/* Animated shine effect */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity animate-shine"
                style={{
                  background: 'linear-gradient(135deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
                }}
              />

              {/* Icon with glow */}
              <div className="relative mb-6 group-hover:animate-spin-slow">
                <div 
                  className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-white"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.1) 100%)',
                    boxShadow: '0 0 40px rgba(96, 165, 250, 0.6), inset 0 0 20px rgba(255, 255, 255, 0.2)',
                  }}
                >
                  <Users className="w-12 h-12 text-white" />
                </div>
              </div>

              {/* Title */}
              <div 
                className="text-5xl font-black mb-4 tracking-wider"
                style={{
                  fontFamily: 'Impact, sans-serif',
                  color: '#ffffff',
                  textShadow: '0 0 30px rgba(255, 255, 255, 1), 0 0 50px rgba(96, 165, 250, 1), 0 4px 10px rgba(0, 0, 0, 1)',
                }}
              >
                MULTIPLAYER
              </div>

              {/* Description */}
              <div className="font-black text-xl mb-6 leading-relaxed"
                style={{
                  color: '#ffffff',
                  textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 0 15px rgba(255, 255, 255, 0.5)',
                }}
              >
                Join rooms, compete with players, and experience real casino action
              </div>

              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg px-4 py-3"
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 0 15px rgba(96, 165, 250, 0.4)',
                  }}
                >
                  <Users className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-black text-lg" style={{ textShadow: '0 2px 6px rgba(0, 0, 0, 1)' }}>Play With Friends Online</span>
                </div>
                <div className="flex items-center gap-3 rounded-lg px-4 py-3"
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 0 15px rgba(96, 165, 250, 0.4)',
                  }}
                >
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  <span className="text-white font-black text-lg" style={{ textShadow: '0 2px 6px rgba(0, 0, 0, 1)' }}>Live Chat & Competition</span>
                </div>
              </div>

              {/* Join Now Button */}
              <div
                className="mt-6 bg-white text-blue-700 font-black text-xl py-4 rounded-xl animate-glow"
                style={{
                  boxShadow: '0 0 30px rgba(255, 255, 255, 0.4)',
                }}
              >
                🌐 JOIN NOW
              </div>
            </button>
          </div>
        </div>

        {/* Footer Info */}
        <div 
          className="relative p-6 border-t-2 text-center animate-in slide-in-from-bottom-4 fade-in duration-500"
          style={{ 
            borderColor: 'rgba(251, 191, 36, 0.3)',
            animationDelay: '0.5s',
          }}
        >
          <div className="flex items-center justify-center gap-6 text-gray-400 text-sm mb-3">
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Professional Crapless Craps</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Real Casino Rules</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>Certified Fair Dice</span>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            🔒 Your progress is automatically saved and secured
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); opacity: 0; }
          50% { transform: translateY(-40px); opacity: 1; }
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.3); }
          50% { box-shadow: 0 0 40px rgba(251, 191, 36, 0.6); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float {
          animation: float 3s ease-out infinite;
        }
        .animate-gradient {
          animation: gradient 5s linear infinite;
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .animate-shine {
          animation: shine 1.5s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-spin-slow {
          animation: spin-slow 0.6s ease-in-out;
        }
      `}</style>
    </div>
  );
}