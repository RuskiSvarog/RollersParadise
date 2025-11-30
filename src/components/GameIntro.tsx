import { useState, useEffect } from 'react';

interface GameIntroProps {
  onComplete: () => void;
}

const slides = [
  {
    id: 1,
    title: "ROLLERS PARADISE",
    subtitle: "Where Fortune Meets Paradise",
    description: "Experience the thrill of Crapless in a tropical gaming oasis",
    image: "https://images.unsplash.com/photo-1682502922918-fed575428e3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwc3Vuc2V0JTIwcGFyYWRpc2V8ZW58MXx8fHwxNzY0MTEwMDY0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    gradient: "from-orange-500 via-pink-500 to-purple-600",
    icon: '✨'
  },
  {
    id: 2,
    title: "AUTHENTIC CRAPS ACTION",
    subtitle: "Professional Casino Experience",
    description: "Crapless rules • $3 minimum bet • All standard betting areas",
    image: "https://images.unsplash.com/photo-1509478861672-91e9a2f90c04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXNpbm8lMjBkaWNlJTIwbmVvbiUyMGxpZ2h0c3xlbnwxfHx8fDE3NjQxMTAwNjR8MA&ixlib=rb-4.1.0&q=80&w=1080",
    gradient: "from-green-500 via-teal-500 to-blue-600",
    icon: '🎲'
  },
  {
    id: 3,
    title: "TROPICAL VIBES",
    subtitle: "Gaming Paradise Awaits",
    description: "Stunning animated backgrounds • Palm trees • Sunset ambiance",
    image: "https://images.unsplash.com/photo-1702758045689-b6e49df3421e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYWxtJTIwdHJlZXMlMjBnb2xkZW4lMjBob3VyfGVufDF8fHx8MTc2NDExMDA2NXww&ixlib=rb-4.1.0&q=80&w=1080",
    gradient: "from-yellow-400 via-orange-500 to-red-500",
    icon: '🌴'
  },
  {
    id: 4,
    title: "MULTIPLAYER MADNESS",
    subtitle: "Play With Friends Worldwide",
    description: "Up to 8 players per room • Real-time chat • Live synchronization",
    image: "https://images.unsplash.com/photo-1561102385-a6419d8a91c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYXNpbm8lMjBwb2tlciUyMGNoaXBzJTIwbHV4dXJ5fGVufDF8fHx8MTc2NDExMDA2NXww&ixlib=rb-4.1.0&q=80&w=1080",
    gradient: "from-purple-500 via-pink-500 to-red-500",
    icon: '👥'
  },
  {
    id: 5,
    title: "LET'S ROLL!",
    subtitle: "Your Fortune Awaits",
    description: "Start with 1,000 FREE CHIPS • Daily bonuses • No real money required",
    image: "https://images.unsplash.com/photo-1682502922918-fed575428e3c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cm9waWNhbCUyMGJlYWNoJTIwc3Vuc2V0JTIwcGFyYWRpc2V8ZW58MXx8fHwxNzY0MTEwMDY0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    gradient: "from-green-400 via-emerald-500 to-teal-600",
    icon: '🎰'
  }
];

export function GameIntro({ onComplete }: GameIntroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSkipped, setIsSkipped] = useState(false);
  const [fadeIn, setFadeIn] = useState(true);

  useEffect(() => {
    if (isSkipped) return;

    const timer = setTimeout(() => {
      if (currentSlide < slides.length - 1) {
        setFadeIn(false);
        setTimeout(() => {
          setCurrentSlide(currentSlide + 1);
          setFadeIn(true);
        }, 300);
      } else {
        onComplete();
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [currentSlide, onComplete, isSkipped]);

  const handleSkip = () => {
    setIsSkipped(true);
    onComplete();
  };

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setFadeIn(false);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setFadeIn(true);
      }, 300);
    } else {
      onComplete();
    }
  };

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-[100] bg-black">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <div
          className={`absolute inset-0 transition-opacity duration-1000 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}
          style={{ transform: fadeIn ? 'scale(1)' : 'scale(1.05)' }}
        >
          <img
            src={slide.image}
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-60`} />
          <div className="absolute inset-0 bg-black/40" />
        </div>
      </div>

      {/* Animated Gradient Overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-20 animate-pulse`} />

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center p-8">
        <div
          className={`text-center max-w-4xl transition-all duration-600 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
        >
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-8 border-4 border-white/30 animate-bounce-slow">
              <div className="text-8xl">{slide.icon}</div>
            </div>
          </div>

          {/* Title */}
          <h1
            className="text-white mb-4 tracking-wider"
            style={{ fontSize: '4rem', fontWeight: 900, textShadow: '0 0 30px rgba(0,0,0,0.8)' }}
          >
            {slide.title}
          </h1>

          {/* Subtitle */}
          <h2
            className="text-yellow-300 mb-6"
            style={{ fontSize: '2rem', fontWeight: 600, textShadow: '0 0 20px rgba(0,0,0,0.8)' }}
          >
            {slide.subtitle}
          </h2>

          {/* Description */}
          <p
            className="text-white/90 mb-12 max-w-2xl mx-auto"
            style={{ fontSize: '1.5rem', textShadow: '0 0 10px rgba(0,0,0,0.8)' }}
          >
            {slide.description}
          </p>

          {/* Next/Start Button */}
          {currentSlide === slides.length - 1 ? (
            <button
              onClick={handleNext}
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 px-12 py-5 rounded-full shadow-2xl hover:shadow-yellow-500/50 transition-all hover:scale-105"
              style={{ fontSize: '1.75rem', fontWeight: 700 }}
            >
              START PLAYING 🎲
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-full border-2 border-white/30 hover:bg-white/30 transition-all hover:scale-105 flex items-center gap-3 mx-auto"
              style={{ fontSize: '1.25rem', fontWeight: 600 }}
            >
              NEXT →
            </button>
          )}
        </div>

        {/* Progress Dots */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex gap-3">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-12 h-3'
                  : 'bg-white/40 w-3 h-3 cursor-pointer hover:bg-white/60'
              }`}
              onClick={() => {
                setFadeIn(false);
                setTimeout(() => {
                  setCurrentSlide(index);
                  setFadeIn(true);
                }, 300);
              }}
            />
          ))}
        </div>
      </div>

      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-8 right-8 text-white/80 hover:text-white px-6 py-3 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 hover:bg-black/50 transition-all flex items-center gap-2"
        style={{ fontSize: '1.125rem', fontWeight: 600 }}
      >
        SKIP ✕
      </button>

      {/* Sparkle Effects */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${2 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );
}
