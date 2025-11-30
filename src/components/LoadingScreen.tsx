import { useEffect, useState, useRef } from 'react';
import { Dice1, Dice6 } from './Icons';

interface LoadingScreenProps {
  message?: string;
  onComplete?: () => void;
  minDuration?: number;
}

export function LoadingScreen({ message = 'Loading...', onComplete, minDuration = 1500 }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [dots, setDots] = useState('');
  const startTimeRef = useRef(Date.now());
  const animationFrameRef = useRef<number>();
  const completedRef = useRef(false);

  useEffect(() => {
    const startTime = startTimeRef.current;
    
    // Update progress based on real elapsed time
    const updateProgress = () => {
      if (completedRef.current) return;
      
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min((elapsed / minDuration) * 100, 100);
      
      setProgress(calculatedProgress);
      
      if (calculatedProgress >= 100) {
        completedRef.current = true;
        if (onComplete) {
          setTimeout(onComplete, 200);
        }
      } else {
        animationFrameRef.current = requestAnimationFrame(updateProgress);
      }
    };

    // Start the animation loop
    animationFrameRef.current = requestAnimationFrame(updateProgress);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [minDuration, onComplete]);

  useEffect(() => {
    // Animate dots
    const dotsInterval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(dotsInterval);
  }, []);

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{
        background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 25%, #0f0f0f 50%, #1a1a1a 75%, #0a0a0a 100%)',
      }}
    >
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-20 animate-float"
            style={{
              background: i % 3 === 0
                ? 'radial-gradient(circle, rgba(251, 191, 36, 0.4) 0%, transparent 70%)'
                : i % 3 === 1
                ? 'radial-gradient(circle, rgba(34, 197, 94, 0.4) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, transparent 70%)',
              width: `${50 + Math.random() * 100}px`,
              height: `${50 + Math.random() * 100}px`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${5 + Math.random() * 10}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Main loading card */}
      <div
        className="relative z-10 rounded-3xl shadow-2xl p-12 max-w-md w-full mx-4"
        style={{
          background: 'linear-gradient(145deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 26, 0.95) 50%, rgba(10, 10, 10, 0.95) 100%)',
          border: '3px solid',
          borderImage: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 25%, #fbbf24 50%, #f59e0b 75%, #fbbf24 100%) 1',
          boxShadow: '0 0 60px rgba(251, 191, 36, 0.4), 0 20px 60px rgba(0, 0, 0, 0.9)',
        }}
      >
        {/* Animated dice */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <div className="animate-spin-slow">
            <Dice1 className="w-16 h-16 text-yellow-400" />
          </div>
          <div className="animate-spin-slow" style={{ animationDelay: '0.5s' }}>
            <Dice6 className="w-16 h-16 text-yellow-400" />
          </div>
        </div>

        {/* Title */}
        <div
          className="text-center mb-6"
          style={{
            fontFamily: 'Impact, sans-serif',
            background: 'linear-gradient(135deg, #fbbf24 0%, #fde047 50%, #fbbf24 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 30px rgba(251, 191, 36, 0.8)',
          }}
        >
          <h2 className="text-4xl font-black mb-2">ROLLERS PARADISE</h2>
          <p className="text-xl text-yellow-400/80">{message}{dots}</p>
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-3 bg-gray-800 rounded-full overflow-hidden mb-4">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 50%, #fbbf24 100%)',
              boxShadow: '0 0 20px rgba(251, 191, 36, 0.6)',
              transition: 'width 50ms linear',
            }}
          />
        </div>

        {/* Progress percentage */}
        <div className="text-center text-yellow-400 font-bold text-lg">
          {Math.round(progress)}%
        </div>

        {/* Loading message */}
        <div className="text-center text-gray-400 text-sm mt-4">
          🎲 Setting up your table...
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.2; }
          50% { transform: translateY(-50px) translateX(20px); opacity: 0.4; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-float {
          animation: float 8s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
