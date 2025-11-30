interface CasinoChipProps {
  value: number;
  onClick?: () => void;
  isDisabled?: boolean;
  isSelected?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function CasinoChip({ value, onClick, isDisabled = false, isSelected = false, size = 'medium' }: CasinoChipProps) {
  const getChipStyle = (value: number) => {
    // Professional casino chip colors matching real casino standards
    if (value >= 1000) {
      return {
        mainColor: '#f59e0b', // Orange/Gold - $1000+
        accentColor: '#000000',
        edgePattern: '#d97706',
        textColor: '#000000',
        patternColor: '#fbbf24',
        shadowColor: 'rgba(245, 158, 11, 0.6)'
      };
    }
    if (value >= 500) {
      return {
        mainColor: '#7c3aed', // Purple - $500
        accentColor: '#fef3c7',
        edgePattern: '#6d28d9',
        textColor: '#ffffff',
        patternColor: '#8b5cf6',
        shadowColor: 'rgba(124, 58, 237, 0.6)'
      };
    }
    if (value >= 100) {
      return {
        mainColor: '#000000', // Black - $100
        accentColor: '#fbbf24',
        edgePattern: '#1f1f1f',
        textColor: '#fbbf24',
        patternColor: '#1f1f1f',
        shadowColor: 'rgba(0, 0, 0, 0.8)'
      };
    }
    if (value >= 50) {
      return {
        mainColor: '#7c3aed', // Purple - $50
        accentColor: '#fef3c7',
        edgePattern: '#6d28d9',
        textColor: '#ffffff',
        patternColor: '#8b5cf6',
        shadowColor: 'rgba(124, 58, 237, 0.6)'
      };
    }
    if (value >= 25) {
      return {
        mainColor: '#15803d', // Green - $25
        accentColor: '#fef3c7',
        edgePattern: '#166534',
        textColor: '#ffffff',
        patternColor: '#22c55e',
        shadowColor: 'rgba(22, 163, 74, 0.6)'
      };
    }
    if (value >= 10) {
      return {
        mainColor: '#1e40af', // Blue - $10
        accentColor: '#fef3c7',
        edgePattern: '#1e3a8a',
        textColor: '#ffffff',
        patternColor: '#3b82f6',
        shadowColor: 'rgba(37, 99, 235, 0.6)'
      };
    }
    if (value >= 5) {
      return {
        mainColor: '#dc2626', // Red - $5
        accentColor: '#fef3c7',
        edgePattern: '#991b1b',
        textColor: '#ffffff',
        patternColor: '#ef4444',
        shadowColor: 'rgba(220, 38, 38, 0.6)'
      };
    }
    // $1 chips - White
    return {
      mainColor: '#f5f5f5',
      accentColor: '#dc2626',
      edgePattern: '#d1d5db',
      textColor: '#1f2937',
      patternColor: '#e5e7eb',
      shadowColor: 'rgba(107, 114, 128, 0.4)'
    };
  };

  const sizes = {
    small: { width: 48, height: 48, fontSize: 11 },
    medium: { width: 64, height: 64, fontSize: 14 },
    large: { width: 80, height: 80, fontSize: 18 }
  };

  const chipSize = sizes[size];
  const style = getChipStyle(value);

  return (
    <button
      onClick={onClick}
      disabled={isDisabled}
      className="relative transition-all transform hover:scale-110 active:scale-95 disabled:cursor-not-allowed focus:outline-none"
      style={{
        width: `${chipSize.width}px`,
        height: `${chipSize.height}px`,
        filter: isDisabled ? 'grayscale(0.8) opacity(0.4)' : `drop-shadow(0 6px 16px ${style.shadowColor})`,
        transform: isSelected ? 'scale(1.15)' : 'scale(1)',
      }}
    >
      {/* Selection glow ring */}
      {isSelected && (
        <div 
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            boxShadow: '0 0 0 3px rgba(250, 204, 21, 0.8), 0 0 20px rgba(250, 204, 21, 0.5)',
            borderRadius: '50%',
            zIndex: 0
          }}
        />
      )}
      
      <svg
        width={chipSize.width}
        height={chipSize.height}
        viewBox="0 0 100 100"
        className="relative"
        style={{ zIndex: 1 }}
      >
        <defs>
          {/* Outer gradient for depth */}
          <radialGradient id={`chipGradient-${value}-${size}`} cx="40%" cy="40%">
            <stop offset="0%" stopColor={style.patternColor} stopOpacity="1" />
            <stop offset="70%" stopColor={style.mainColor} stopOpacity="1" />
            <stop offset="100%" stopColor={style.edgePattern} stopOpacity="1" />
          </radialGradient>
          
          {/* Pattern for edge spots */}
          <pattern id={`edgePattern-${value}-${size}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            <rect width="20" height="20" fill={style.mainColor} />
          </pattern>

          {/* Inner shadow */}
          <radialGradient id={`innerShadow-${value}-${size}`} cx="50%" cy="50%">
            <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
            <stop offset="50%" stopColor="rgba(255, 255, 255, 0.1)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0.2)" />
          </radialGradient>

          {/* Text path for casino name */}
          <path
            id={`textPath-${value}-${size}`}
            d="M 50, 50 m -30, 0 a 30,30 0 1,1 60,0 a 30,30 0 1,1 -60,0"
          />
        </defs>

        {/* Main chip circle with gradient */}
        <circle
          cx="50"
          cy="50"
          r="48"
          fill={`url(#chipGradient-${value}-${size})`}
          stroke={style.edgePattern}
          strokeWidth="1"
        />

        {/* Edge decoration - alternating pattern */}
        {[...Array(16)].map((_, i) => {
          const angle = (i * 22.5) * Math.PI / 180;
          const x1 = 50 + 40 * Math.cos(angle);
          const y1 = 50 + 40 * Math.sin(angle);
          const x2 = 50 + 48 * Math.cos(angle);
          const y2 = 50 + 48 * Math.sin(angle);
          
          return (
            <g key={i}>
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={style.accentColor}
                strokeWidth={i % 2 === 0 ? "3" : "2"}
                strokeLinecap="round"
                opacity={i % 2 === 0 ? "0.9" : "0.7"}
              />
            </g>
          );
        })}

        {/* Outer ring */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke={style.accentColor}
          strokeWidth="1.5"
          opacity="0.8"
        />

        {/* Inner decorative rings */}
        <circle
          cx="50"
          cy="50"
          r="35"
          fill="none"
          stroke={style.accentColor}
          strokeWidth="0.5"
          opacity="0.5"
        />

        {/* Center area */}
        <circle
          cx="50"
          cy="50"
          r="28"
          fill={style.mainColor}
          opacity="0.95"
        />

        {/* Subtle inner shadow overlay */}
        <circle
          cx="50"
          cy="50"
          r="28"
          fill={`url(#innerShadow-${value}-${size})`}
          opacity="0.4"
        />

        {/* Center ring */}
        <circle
          cx="50"
          cy="50"
          r="28"
          fill="none"
          stroke={style.accentColor}
          strokeWidth="1"
          opacity="0.7"
        />

        {/* Casino name on curved path */}
        <text
          fill={style.accentColor}
          fontSize={size === 'small' ? '4' : size === 'medium' ? '4.5' : '5'}
          fontWeight="700"
          letterSpacing="3"
          opacity="0.8"
          fontFamily="Arial, sans-serif"
        >
          <textPath
            href={`#textPath-${value}-${size}`}
            startOffset="50%"
            textAnchor="middle"
          >
            ROLLERS PARADISE
          </textPath>
        </text>

        {/* Value text - dollar sign */}
        <text
          x="50"
          y="45"
          textAnchor="middle"
          fill={style.textColor}
          fontSize={size === 'small' ? '8' : size === 'medium' ? '10' : '12'}
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          opacity="0.9"
        >
          $
        </text>

        {/* Value text - amount */}
        <text
          x="50"
          y="60"
          textAnchor="middle"
          fill={style.textColor}
          fontSize={size === 'small' ? '14' : size === 'medium' ? '18' : '22'}
          fontWeight="900"
          fontFamily="Arial, sans-serif"
          style={{ textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)' }}
        >
          {value >= 1000 ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K` : value}
        </text>

        {/* Glossy highlight effect */}
        <ellipse
          cx="35"
          cy="35"
          rx="15"
          ry="12"
          fill="rgba(255, 255, 255, 0.25)"
          opacity="0.7"
        />

        {/* Subtle bottom shadow for 3D effect */}
        <ellipse
          cx="50"
          cy="65"
          rx="20"
          ry="8"
          fill="rgba(0, 0, 0, 0.2)"
        />
      </svg>

      {/* Selected indicator badge */}
      {isSelected && (
        <div 
          className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white animate-pulse shadow-lg flex items-center justify-center"
          style={{ 
            zIndex: 20,
            boxShadow: '0 0 12px rgba(250, 204, 21, 0.8)'
          }}
        >
          <span className="text-black text-xs" style={{ fontWeight: 900 }}>✓</span>
        </div>
      )}
    </button>
  );
}
