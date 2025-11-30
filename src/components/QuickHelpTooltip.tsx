import { useState, useEffect } from 'react';
import { X, HelpCircle, Info } from './Icons';

interface TooltipStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  target?: string; // CSS selector for highlighting element
  position?: 'top' | 'bottom' | 'left' | 'right';
}

const GAME_TOOLTIPS: TooltipStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Rollers Paradise! 🎰',
    description: 'This is a professional crapless craps casino where only 7 wins on come-out roll. Let\'s get you started!',
    icon: '👋',
  },
  {
    id: 'chips',
    title: 'Select Your Chips 💰',
    description: 'Click on the chip amounts at the bottom to select your bet size. Minimum bet is $3.',
    icon: '🎲',
  },
  {
    id: 'betting',
    title: 'Place Your Bets 🎯',
    description: 'Click on any betting area on the table to place your chips. You can place multiple bets!',
    icon: '🎯',
  },
  {
    id: 'roll',
    title: 'Roll the Dice 🎲',
    description: 'Once you have at least $3 in bets, click "ROLL DICE" to see the electronic dice in action!',
    icon: '🔥',
  },
  {
    id: 'rules',
    title: 'Crapless Craps Rules 📋',
    description: 'Only 7 wins on come-out. All other numbers (2, 3, 11, 12) become the point. Seven-out clears all bets.',
    icon: '📋',
  },
  {
    id: 'come-bets',
    title: 'Come Bets & Odds 🎯',
    description: 'Place a Come bet in the COME area. After rolling, it travels to that number! If 7 rolls, you win instantly. Once on a number, click the yellow "ADD ODDS" button for true odds: 6:1 on 2/12, 3:1 on 3/11, 2:1 on 4/10, 3:2 on 5/9, 6:5 on 6/8. Max 3x-5x odds!',
    icon: '💎',
  },
  {
    id: 'xp',
    title: 'Earn XP & Level Up! ⭐',
    description: 'Every roll earns XP. Level up to unlock achievements, daily bonuses, and exclusive rewards!',
    icon: '⭐',
  },
  {
    id: 'enjoy',
    title: 'Have Fun & Play Fair! 🎊',
    description: 'Enjoy the game! Everything is fair and random. Good luck at the tables!',
    icon: '🎊',
  },
];

interface QuickHelpTooltipProps {
  onComplete?: () => void;
  autoStart?: boolean;
}

export function QuickHelpTooltip({ onComplete, autoStart = true }: QuickHelpTooltipProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  useEffect(() => {
    // Check if user has seen the tooltip before
    const hasSeenTooltip = localStorage.getItem('hasSeenGameTooltip');
    
    if (!hasSeenTooltip && autoStart) {
      // Show tooltip after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
        setTimeout(() => setContentVisible(true), 10);
      }, 1000);
      
      return () => clearTimeout(timer);
    }

    // Show help button after delay
    const buttonTimer = setTimeout(() => setButtonVisible(true), 2000);
    return () => clearTimeout(buttonTimer);
  }, [autoStart]);

  // Handle animation when isVisible changes
  useEffect(() => {
    if (isVisible) {
      setTimeout(() => setContentVisible(true), 10);
    } else {
      setContentVisible(false);
    }
  }, [isVisible]);

  const handleNext = () => {
    if (currentStep < GAME_TOOLTIPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setIsDismissed(true);
    setContentVisible(false);
    setTimeout(() => setIsVisible(false), 300);
    localStorage.setItem('hasSeenGameTooltip', 'true');
    localStorage.setItem('tooltipDismissedDate', new Date().toISOString());
    if (onComplete) onComplete();
  };

  const handleComplete = () => {
    setContentVisible(false);
    setTimeout(() => setIsVisible(false), 300);
    localStorage.setItem('hasSeenGameTooltip', 'true');
    localStorage.setItem('tooltipCompletedDate', new Date().toISOString());
    if (onComplete) onComplete();
  };

  const currentTooltip = GAME_TOOLTIPS[currentStep];
  const progress = ((currentStep + 1) / GAME_TOOLTIPS.length) * 100;

  if (isDismissed) return null;

  return (
    <>
      {/* Help Button - Always visible in corner */}
      {!isVisible && (
        <button
          onClick={() => {
            setCurrentStep(0);
            setIsVisible(true);
          }}
          className="fixed top-24 right-6 z-[9999] p-3 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            border: '3px solid #60a5fa',
            boxShadow: '0 0 30px rgba(59, 130, 246, 0.6), 0 10px 40px rgba(0, 0, 0, 0.5)',
            opacity: buttonVisible ? 1 : 0,
            transform: buttonVisible ? 'scale(1)' : 'scale(0)',
            transition: 'all 0.3s',
          }}
          title="Quick Help Guide"
        >
          <HelpCircle className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Tooltip Modal */}
      {isVisible && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] transition-opacity duration-300"
            onClick={handleSkip}
            style={{
              opacity: contentVisible ? 1 : 0,
            }}
          />

          {/* Tooltip Content */}
          <div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] max-w-2xl w-full mx-4 transition-all duration-300"
            style={{
              opacity: contentVisible ? 1 : 0,
              transform: contentVisible 
                ? 'translate(-50%, -50%) scale(1)' 
                : 'translate(-50%, -50%) scale(0.8)',
            }}
          >
            <div
              className="rounded-3xl shadow-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(145deg, rgba(10, 10, 10, 0.98), rgba(26, 26, 26, 0.98))',
                border: '3px solid #3b82f6',
                boxShadow: '0 0 80px rgba(59, 130, 246, 0.6)',
              }}
            >
              {/* Progress Bar */}
              <div className="h-2 bg-gray-800">
                <div
                  className="h-full transition-all duration-300"
                  style={{
                    background: 'linear-gradient(90deg, #3b82f6, #60a5fa)',
                    width: `${progress}%`,
                  }}
                />
              </div>

              {/* Close Button */}
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-800 hover:bg-gray-700 transition-colors z-10"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>

              {/* Content */}
              <div className="p-8 pt-6">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div
                    className="text-7xl transition-all duration-300"
                    style={{
                      opacity: contentVisible ? 1 : 0,
                      transform: contentVisible ? 'scale(1) rotate(0deg)' : 'scale(0) rotate(-180deg)',
                    }}
                  >
                    {currentTooltip.icon}
                  </div>
                </div>

                {/* Title */}
                <h2
                  className="text-3xl mb-4 text-center transition-all duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #60a5fa, #3b82f6)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    opacity: contentVisible ? 1 : 0,
                    transform: contentVisible ? 'translateY(0)' : 'translateY(-20px)',
                  }}
                >
                  {currentTooltip.title}
                </h2>

                {/* Description */}
                <p
                  className="text-gray-300 text-center text-lg leading-relaxed mb-8 transition-all duration-300"
                  style={{
                    opacity: contentVisible ? 1 : 0,
                    transform: contentVisible ? 'translateY(0)' : 'translateY(20px)',
                    transitionDelay: '100ms',
                  }}
                >
                  {currentTooltip.description}
                </p>

                {/* Step Indicator */}
                <div className="flex justify-center gap-2 mb-6">
                  {GAME_TOOLTIPS.map((_, index) => (
                    <div
                      key={index}
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        background: index === currentStep 
                          ? 'linear-gradient(135deg, #3b82f6, #60a5fa)'
                          : 'rgba(100, 100, 100, 0.5)',
                        width: index === currentStep ? '24px' : '8px',
                      }}
                    />
                  ))}
                </div>

                {/* Navigation Buttons */}
                <div className="flex gap-4">
                  {currentStep > 0 && (
                    <button
                      onClick={handlePrevious}
                      className="flex-1 px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #4b5563, #374151)',
                        color: 'white',
                      }}
                    >
                      ← Previous
                    </button>
                  )}
                  
                  <button
                    onClick={currentStep === GAME_TOOLTIPS.length - 1 ? handleComplete : handleNext}
                    className="flex-1 px-6 py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                      color: 'white',
                      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                    }}
                  >
                    {currentStep === GAME_TOOLTIPS.length - 1 ? "Let's Play! 🎰" : 'Next →'}
                  </button>
                </div>

                {/* Skip Option */}
                {currentStep < GAME_TOOLTIPS.length - 1 && (
                  <button
                    onClick={handleSkip}
                    className="w-full mt-4 text-gray-500 hover:text-gray-400 transition-colors text-sm"
                  >
                    Skip Tutorial
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

// Quick info tooltip for hovering over elements
interface InfoTooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export function InfoTooltip({ content, children, position = 'top' }: InfoTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => setShouldRender(false), 150);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  const getPositionStyles = () => {
    switch (position) {
      case 'top':
        return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2';
      case 'bottom':
        return 'top-full left-1/2 transform -translate-x-1/2 mt-2';
      case 'left':
        return 'right-full top-1/2 transform -translate-y-1/2 mr-2';
      case 'right':
        return 'left-full top-1/2 transform -translate-y-1/2 ml-2';
    }
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {shouldRender && (
        <div
          className={`absolute z-[10000] pointer-events-none transition-all duration-150 ${getPositionStyles()}`}
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'scale(1)' : 'scale(0.9)',
          }}
        >
          <div
            className="px-3 py-2 rounded-lg text-sm whitespace-nowrap max-w-xs"
            style={{
              background: 'linear-gradient(145deg, rgba(30, 30, 30, 0.98), rgba(50, 50, 50, 0.98))',
              border: '1px solid rgba(59, 130, 246, 0.5)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
              color: '#e5e7eb',
            }}
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>{content}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
