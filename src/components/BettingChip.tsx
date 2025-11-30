interface BettingChipProps {
  amount: number;
  small?: boolean;
  extraSmall?: boolean;
  stackCount?: number; // For multiplayer - shows how many players bet on this spot
  playerNames?: string[]; // For multiplayer - names of players who bet
  isOff?: boolean; // Shows "OFF" indicator when bets are not working
}

export function BettingChip({ amount, small = false, extraSmall = false, stackCount, playerNames, isOff = false }: BettingChipProps) {
  const getChipStyle = () => {
    if (amount >= 1000) {
      return {
        mainColor: '#f59e0b', // Orange/Gold - $1000+
        accentColor: '#000000', // Black
        edgeColor: '#d97706',
        textColor: '#000000', // Black text
        pattern: 'gold'
      };
    }
    if (amount >= 500) {
      return {
        mainColor: '#6d28d9', // Deep Purple - $500
        accentColor: '#fef3c7', // Cream
        edgeColor: '#5b21b6',
        textColor: '#ffffff',
        pattern: 'purple-dark'
      };
    }
    if (amount >= 100) {
      return {
        mainColor: '#000000', // Black - $100
        accentColor: '#fbbf24', // Gold
        edgeColor: '#1f1f1f',
        textColor: '#fbbf24', // Gold text
        pattern: 'black'
      };
    }
    if (amount >= 50) {
      return {
        mainColor: '#7c3aed', // Purple - $50
        accentColor: '#fef3c7', // Cream
        edgeColor: '#6d28d9',
        textColor: '#ffffff',
        pattern: 'purple'
      };
    }
    if (amount >= 25) {
      return {
        mainColor: '#15803d', // Green - $25
        accentColor: '#fef3c7', // Cream
        edgeColor: '#166534',
        textColor: '#ffffff',
        pattern: 'green'
      };
    }
    if (amount >= 10) {
      return {
        mainColor: '#1e40af', // Blue - $10
        accentColor: '#fef3c7', // Cream
        edgeColor: '#1e3a8a',
        textColor: '#ffffff',
        pattern: 'blue'
      };
    }
    if (amount >= 5) {
      return {
        mainColor: '#dc2626', // Red - $5
        accentColor: '#fef3c7', // Cream
        edgeColor: '#991b1b',
        textColor: '#ffffff',
        pattern: 'red'
      };
    }
    return {
      mainColor: '#f5f5f5', // White - $1
      accentColor: '#dc2626', // Red accents
      edgeColor: '#9ca3af',
      textColor: '#1f2937', // Dark text
      pattern: 'white'
    };
  };

  const style = getChipStyle();
  const size = extraSmall ? 40 : small ? 50 : 60;
  const fontSize = extraSmall ? 10 : small ? 13 : 15;

  return (
    <div 
      className="absolute pointer-events-none z-20"
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Stacked chip effect - bottom chips */}
      <div
        style={{
          width: `${size}px`,
          height: `${size * 0.15}px`,
          borderRadius: '50%',
          position: 'absolute',
          top: `${size * 0.92}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          background: `linear-gradient(180deg, ${style.edgeColor}, ${style.mainColor})`,
          boxShadow: '0 3px 8px rgba(0, 0, 0, 0.6)',
          zIndex: -2,
        }}
      />
      <div
        style={{
          width: `${size * 0.98}px`,
          height: `${size * 0.15}px`,
          borderRadius: '50%',
          position: 'absolute',
          top: `${size * 0.88}px`,
          left: '50%',
          transform: 'translateX(-50%)',
          background: `linear-gradient(180deg, ${style.edgeColor}, ${style.mainColor})`,
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.5)',
          zIndex: -1,
        }}
      />

      {/* Main chip body */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          position: 'relative',
          background: `radial-gradient(circle at 30% 30%, ${style.accentColor}, ${style.mainColor} 40%, ${style.edgeColor})`,
          boxShadow: `
            0 8px 16px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.3),
            inset 0 -2px 0 rgba(0, 0, 0, 0.4)
          `,
        }}
      >
        {/* 3D edge rim - creates depth */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: `conic-gradient(
              from 45deg,
              ${style.edgeColor} 0deg,
              ${style.mainColor} 90deg,
              ${style.edgeColor} 180deg,
              ${style.mainColor} 270deg,
              ${style.edgeColor} 360deg
            )`,
            opacity: 0.4,
          }}
        />

        {/* Edge spots pattern (casino style) */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45) * Math.PI / 180;
          const radius = size / 2 - 6;
          const x = radius * Math.cos(angle) + size / 2;
          const y = radius * Math.sin(angle) + size / 2;
          
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: small ? '10px' : '14px',
                height: small ? '10px' : '14px',
                borderRadius: '50%',
                background: style.accentColor,
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
                boxShadow: `inset 0 2px 4px rgba(0, 0, 0, 0.3)`
              }}
            />
          );
        })}

        {/* Outer ring */}
        <div
          style={{
            position: 'absolute',
            inset: '3px',
            borderRadius: '50%',
            border: `2px solid ${style.accentColor}`,
            opacity: 0.8
          }}
        />

        {/* Inner decorative circle */}
        <div
          style={{
            position: 'absolute',
            inset: small ? '14px' : '18px',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${style.mainColor} 0%, ${style.edgeColor} 100%)`,
            boxShadow: `inset 0 2px 6px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(255, 255, 255, 0.2)`
          }}
        />

        {/* Center highlight (glossy effect) */}
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '20%',
            width: '30%',
            height: '30%',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.3), transparent)',
            pointerEvents: 'none'
          }}
        />

        {/* Value display */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: style.textColor,
            fontWeight: 'bold',
            textShadow: style.pattern === 'white' || style.pattern === 'gold'
              ? `
                0 0 4px rgba(255, 255, 255, 0.9),
                0 0 8px rgba(255, 255, 255, 0.8),
                0 2px 6px rgba(255, 255, 255, 0.7),
                1px 1px 0 rgba(255, 255, 255, 0.9),
                -1px -1px 0 rgba(255, 255, 255, 0.9),
                1px -1px 0 rgba(255, 255, 255, 0.9),
                -1px 1px 0 rgba(255, 255, 255, 0.9)
              `
              : `
                0 0 4px rgba(0, 0, 0, 0.9),
                0 0 8px rgba(0, 0, 0, 0.8),
                0 2px 6px rgba(0, 0, 0, 0.7),
                1px 1px 0 rgba(0, 0, 0, 0.9),
                -1px -1px 0 rgba(0, 0, 0, 0.9),
                1px -1px 0 rgba(0, 0, 0, 0.9),
                -1px 1px 0 rgba(0, 0, 0, 0.9)
              `,
            zIndex: 10
          }}
        >
          <div style={{ fontSize: `${fontSize - 2}px`, lineHeight: 1 }}>$</div>
          <div style={{ fontSize: `${fontSize + 2}px`, lineHeight: 1, fontWeight: 900 }}>{amount.toFixed(2)}</div>
        </div>

        {/* Bottom edge shadow for 3D effect */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: '10%',
            right: '10%',
            height: '30%',
            background: `linear-gradient(to top, rgba(0, 0, 0, 0.3), transparent)`,
            borderRadius: '0 0 50% 50%',
            pointerEvents: 'none'
          }}
        />

        {/* Top edge highlight for 3D effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '10%',
            right: '10%',
            height: '30%',
            background: `linear-gradient(to bottom, rgba(255, 255, 255, 0.15), transparent)`,
            borderRadius: '50% 50% 0 0',
            pointerEvents: 'none'
          }}
        />

        {/* Casino name text on edge */}
        <div
          style={{
            position: 'absolute',
            inset: small ? '20px' : '24px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <svg
            viewBox="0 0 100 100"
            style={{
              width: '100%',
              height: '100%',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          >
            <defs>
              <path
                id={`chipPath-${amount}-${small}`}
                d="M 50, 50 m -35, 0 a 35,35 0 1,1 70,0 a 35,35 0 1,1 -70,0"
              />
            </defs>
            <text
              fill={style.accentColor}
              fontSize={small ? "6" : "7"}
              fontWeight="bold"
              letterSpacing="2"
              opacity="0.6"
            >
              <textPath
                href={`#chipPath-${amount}-${small}`}
                startOffset="50%"
                textAnchor="middle"
              >
                ROLLERS PARADISE
              </textPath>
            </text>
          </svg>
        </div>
      </div>
      
      {/* Stack Count Badge - Shows when multiple players bet on same spot */}
      {stackCount && stackCount > 1 && (
        <div
          className="absolute -top-2 -right-2 bg-purple-600 border-3 border-white rounded-full flex items-center justify-center shadow-lg animate-pulse"
          style={{
            width: extraSmall ? '22px' : small ? '26px' : '32px',
            height: extraSmall ? '22px' : small ? '26px' : '32px',
            fontSize: extraSmall ? '0.7rem' : small ? '0.8rem' : '0.95rem',
            fontWeight: 900,
            color: 'white',
            zIndex: 10,
            boxShadow: '0 3px 8px rgba(0, 0, 0, 0.5), 0 0 20px rgba(168, 85, 247, 0.8), 0 0 30px rgba(168, 85, 247, 0.6)',
            textShadow: '0 0 4px rgba(0, 0, 0, 0.9), 1px 1px 0 rgba(0, 0, 0, 0.9), -1px -1px 0 rgba(0, 0, 0, 0.9)'
          }}
          title={playerNames ? `${stackCount} players: ${playerNames.join(', ')}` : `${stackCount} bets stacked`}
        >
          {stackCount}
        </div>
      )}
      
      {/* OFF Puck Indicator - Shows when bets are not working */}
      {isOff && (
        <div
          className="absolute flex items-center justify-center"
          style={{
            top: '-36px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 30,
          }}
        >
          {/* OFF Puck (Casino-style) */}
          <div
            className="relative flex items-center justify-center"
            style={{
              width: extraSmall ? '32px' : small ? '38px' : '44px',
              height: extraSmall ? '32px' : small ? '38px' : '44px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
              border: '3px solid #ffffff',
              boxShadow: `
                0 0 0 2px #000000,
                0 4px 8px rgba(0, 0, 0, 0.8),
                0 0 20px rgba(255, 255, 255, 0.3),
                inset 0 2px 4px rgba(255, 255, 255, 0.2),
                inset 0 -2px 4px rgba(0, 0, 0, 0.5)
              `,
            }}
          >
            {/* OFF Text */}
            <div
              style={{
                fontSize: extraSmall ? '11px' : small ? '13px' : '15px',
                fontWeight: 900,
                color: '#ffffff',
                textShadow: `
                  0 0 8px rgba(255, 255, 255, 0.8),
                  0 2px 4px rgba(0, 0, 0, 0.9),
                  1px 1px 0 rgba(0, 0, 0, 0.9),
                  -1px -1px 0 rgba(0, 0, 0, 0.9)
                `,
                letterSpacing: '0.5px',
              }}
            >
              OFF
            </div>
          </div>
          
          {/* Connection line from puck to chip */}
          <div
            className="absolute"
            style={{
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '2px',
              height: '8px',
              background: 'linear-gradient(to bottom, rgba(255, 255, 255, 0.8), transparent)',
            }}
          />
        </div>
      )}
    </div>
  );
}