import { motion } from 'motion/react';

interface CompactTimerProps {
  timer: number;
  maxDuration: number;
  isActive: boolean;
  isLocked: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function CompactTimer({ 
  timer, 
  maxDuration, 
  isActive, 
  isLocked,
  size = 'medium'
}: CompactTimerProps) {
  // ALWAYS show timer if active OR locked (for debugging and visibility)
  if (!isActive && !isLocked) {
    console.log('⏱️ [CompactTimer] Hidden - isActive:', isActive, 'isLocked:', isLocked);
    return null;
  }

  console.log('⏱️ [CompactTimer] Visible - timer:', timer, 'isActive:', isActive, 'isLocked:', isLocked);

  const percentage = (timer / maxDuration) * 100;
  
  // Color states based on time remaining - BRIGHTER COLORS for visibility
  const getColorClass = () => {
    if (isLocked) return 'from-gray-700 to-gray-900';
    if (timer <= 10) return 'from-red-600 to-red-800';
    if (timer <= 20) return 'from-orange-600 to-yellow-700';
    return 'from-green-600 to-emerald-700';
  };

  const getTextColorClass = () => {
    // ALWAYS USE WHITE for maximum visibility
    return 'text-white';
  };

  const getBorderClass = () => {
    if (isLocked) return 'border-gray-400';
    if (timer <= 10) return 'border-red-300';
    if (timer <= 20) return 'border-orange-300';
    return 'border-green-300';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          container: 'p-2',
          icon: 'text-lg',
          number: 'text-xl',
          label: 'text-xs'
        };
      case 'large':
        return {
          container: 'p-4',
          icon: 'text-4xl',
          number: 'text-5xl',
          label: 'text-base'
        };
      default: // medium
        return {
          container: 'p-3',
          icon: 'text-2xl',
          number: 'text-3xl',
          label: 'text-sm'
        };
    }
  };

  const sizeClasses = getSizeClasses();

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`bg-gradient-to-br ${getColorClass()} backdrop-blur-sm rounded-xl border-4 ${getBorderClass()} shadow-2xl ${sizeClasses.container} ${
        timer <= 10 && !isLocked ? 'animate-pulse shadow-red-500/50' : 'shadow-black/50'
      }`}
    >
      <div className="flex items-center gap-3">
        {/* Icon */}
        <div className={`${sizeClasses.icon} drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
          {isLocked ? '🔒' : timer <= 5 ? '⏰' : '⏱️'}
        </div>

        {/* Timer Display */}
        <div className="flex-1">
          <div className={`${sizeClasses.number} font-black tabular-nums text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]`}>
            {isLocked ? '00' : timer}
          </div>
          <div className={`${sizeClasses.label} text-white font-bold uppercase tracking-wide drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]`}>
            {isLocked ? 'LOCKED' : 'SECONDS'}
          </div>
        </div>

        {/* Mini Progress Circle */}
        {!isLocked && (
          <div className={`relative ${size === 'small' ? 'w-10 h-10' : 'w-12 h-12'}`}>
            <svg className={`transform -rotate-90 ${size === 'small' ? 'w-10 h-10' : 'w-12 h-12'}`}>
              {/* Background circle */}
              <circle
                cx={size === 'small' ? '20' : '24'}
                cy={size === 'small' ? '20' : '24'}
                r={size === 'small' ? '16' : '20'}
                stroke="currentColor"
                strokeWidth={size === 'small' ? '3' : '4'}
                fill="none"
                className="text-white/20"
              />
              {/* Progress circle */}
              <circle
                cx={size === 'small' ? '20' : '24'}
                cy={size === 'small' ? '20' : '24'}
                r={size === 'small' ? '16' : '20'}
                stroke="currentColor"
                strokeWidth={size === 'small' ? '3' : '4'}
                fill="none"
                strokeDasharray={`${2 * Math.PI * (size === 'small' ? 16 : 20)}`}
                strokeDashoffset={`${2 * Math.PI * (size === 'small' ? 16 : 20) * (1 - percentage / 100)}`}
                className="text-white transition-all duration-1000 ease-linear"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`font-bold text-white ${size === 'small' ? 'text-[10px]' : 'text-xs'}`}>{Math.round(percentage)}%</span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
