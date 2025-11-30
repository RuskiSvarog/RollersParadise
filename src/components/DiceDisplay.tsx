import { motion } from 'motion/react';
import { useState, useEffect } from 'react';

interface DiceDisplayProps {
  value1: number;
  value2: number;
  isRolling: boolean;
}

export function DiceDisplay({ value1, value2, isRolling }: DiceDisplayProps) {
  const [displayValue1, setDisplayValue1] = useState(value1);
  const [displayValue2, setDisplayValue2] = useState(value2);

  useEffect(() => {
    if (!isRolling) {
      // Show final result immediately
      setDisplayValue1(value1);
      setDisplayValue2(value2);
    }
  }, [isRolling, value1, value2]);

  return (
    <div className="relative flex gap-4">
      {/* Dice with instant reveal + quick flash */}
      <motion.div
        key={`die1-${displayValue1}-${isRolling}`}
        initial={isRolling ? { scale: 1 } : { scale: 1.2, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
        className="relative"
      >
        <Die value={displayValue1} />
      </motion.div>
      
      <motion.div
        key={`die2-${displayValue2}-${isRolling}`}
        initial={isRolling ? { scale: 1 } : { scale: 1.2, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.1, ease: "easeOut" }}
        className="relative"
      >
        <Die value={displayValue2} />
      </motion.div>
    </div>
  );
}

function Die({ value }: { value: number }) {
  // Force re-render with unique key based on value
  const dotPattern = getDotPattern(value);
  
  return (
    <div className="w-16 h-16 bg-white rounded-lg shadow-xl flex items-center justify-center relative border-2 border-gray-300">
      <div className="grid grid-cols-3 gap-1 p-2 w-full h-full">
        {dotPattern.map((dot, i) => (
          <div key={`dot-${i}-${dot}`} className="flex items-center justify-center">
            {dot && <div className="w-2.5 h-2.5 bg-black rounded-full" />}
          </div>
        ))}
      </div>
    </div>
  );
}

function getDotPattern(value: number): boolean[] {
  const patterns: { [key: number]: boolean[] } = {
    1: [false, false, false, false, true, false, false, false, false],
    2: [true, false, false, false, false, false, false, false, true],
    3: [true, false, false, false, true, false, false, false, true],
    4: [true, false, true, false, false, false, true, false, true],
    5: [true, false, true, false, true, false, true, false, true],
    6: [true, false, true, true, false, true, true, false, true],
  };
  return patterns[value] || patterns[1];
}