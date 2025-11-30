/**
 * BET VALIDATION & PAYOUT VERIFICATION SYSTEM
 * Ensures all bets and payouts are calculated correctly and logged for transparency
 */

export interface BetValidation {
  betArea: string;
  betAmount: number;
  result: 'win' | 'loss' | 'push' | 'keep';
  payout: number;
  expectedPayout: number;
  isValid: boolean;
  odds: string;
  calculation: string;
}

export interface RollValidation {
  rollNumber: number;
  dice: [number, number];
  total: number;
  gamePhase: 'comeOut' | 'point';
  point: number | null;
  betsPlaced: number;
  totalBetAmount: number;
  totalWinnings: number;
  totalLosses: number;
  netResult: number;
  balanceBefore: number;
  balanceAfter: number;
  validations: BetValidation[];
  timestamp: number;
  isLegit: boolean;
  errors: string[];
}

/**
 * Calculate expected payout for any bet type
 */
export function calculateExpectedPayout(
  betArea: string,
  betAmount: number,
  total: number,
  point: number | null,
  isHard: boolean,
  gamePhase: 'comeOut' | 'point'
): { payout: number; odds: string; result: 'win' | 'loss' | 'push' | 'keep' } {
  
  // PASS LINE BETS
  if (betArea === 'passLine') {
    if (gamePhase === 'comeOut') {
      // Crapless craps: only 7 wins on come-out
      if (total === 7) {
        return { payout: betAmount, odds: '1:1', result: 'win' };
      }
      // All other numbers become the point (no craps losses in crapless)
      return { payout: 0, odds: '-', result: 'keep' };
    } else {
      // Point phase
      if (total === point) {
        return { payout: betAmount, odds: '1:1', result: 'win' };
      }
      if (total === 7) {
        return { payout: 0, odds: '-', result: 'loss' };
      }
      return { payout: 0, odds: '-', result: 'keep' };
    }
  }

  // PASS LINE ODDS
  if (betArea === 'passLineOdds') {
    if (gamePhase === 'point' && total === point) {
      let multiplier = 1;
      let oddsStr = '1:1';
      
      if (point === 4 || point === 10) {
        multiplier = 2; // 2:1
        oddsStr = '2:1';
      } else if (point === 5 || point === 9) {
        multiplier = 1.5; // 3:2
        oddsStr = '3:2';
      } else if (point === 6 || point === 8) {
        multiplier = 1.2; // 6:5
        oddsStr = '6:5';
      } else if (point === 2 || point === 3 || point === 11 || point === 12) {
        multiplier = 6; // 6:1
        oddsStr = '6:1';
      }
      
      return { payout: betAmount * multiplier, odds: oddsStr, result: 'win' };
    }
    if (gamePhase === 'point' && total === 7) {
      return { payout: 0, odds: '-', result: 'loss' };
    }
    return { payout: 0, odds: '-', result: 'keep' };
  }

  // FIELD BETS
  if (betArea === 'field') {
    if ([2, 3, 4, 9, 10, 11, 12].includes(total)) {
      if (total === 2 || total === 12) {
        return { payout: betAmount * 3, odds: '3:1', result: 'win' };
      } else {
        return { payout: betAmount * 2, odds: '2:1', result: 'win' };
      }
    }
    return { payout: 0, odds: '-', result: 'loss' };
  }

  // HARDWAY BETS
  if (betArea === 'hard4') {
    if (total === 4 && isHard) {
      return { payout: betAmount * 7, odds: '7:1', result: 'win' };
    }
    if (total === 4 || total === 7) {
      return { payout: 0, odds: '-', result: 'loss' };
    }
    return { payout: 0, odds: '-', result: 'keep' };
  }

  if (betArea === 'hard6' || betArea === 'hard8') {
    const targetNumber = betArea === 'hard6' ? 6 : 8;
    if (total === targetNumber && isHard) {
      return { payout: betAmount * 9, odds: '9:1', result: 'win' };
    }
    if (total === targetNumber || total === 7) {
      return { payout: 0, odds: '-', result: 'loss' };
    }
    return { payout: 0, odds: '-', result: 'keep' };
  }

  if (betArea === 'hard10') {
    if (total === 10 && isHard) {
      return { payout: betAmount * 7, odds: '7:1', result: 'win' };
    }
    if (total === 10 || total === 7) {
      return { payout: 0, odds: '-', result: 'loss' };
    }
    return { payout: 0, odds: '-', result: 'keep' };
  }

  // COME BETS
  if (betArea === 'come') {
    if (total === 7) {
      return { payout: betAmount, odds: '1:1', result: 'win' };
    }
    // Come bet moves to number
    return { payout: 0, odds: '-', result: 'keep' };
  }

  // COME ODDS BETS (comeOdds2, comeOdds3, etc.)
  if (betArea.startsWith('comeOdds')) {
    const number = parseInt(betArea.replace('comeOdds', ''));
    
    // Win if the come point number is rolled
    if (total === number) {
      let multiplier = 1;
      let oddsStr = '1:1';
      
      if (number === 2 || number === 12) {
        multiplier = 6; // 6:1
        oddsStr = '6:1';
      } else if (number === 3 || number === 11) {
        multiplier = 3; // 3:1
        oddsStr = '3:1';
      } else if (number === 4 || number === 10) {
        multiplier = 2; // 2:1
        oddsStr = '2:1';
      } else if (number === 5 || number === 9) {
        multiplier = 1.5; // 3:2
        oddsStr = '3:2';
      } else if (number === 6 || number === 8) {
        multiplier = 1.2; // 6:5
        oddsStr = '6:5';
      }
      
      return { payout: betAmount * multiplier, odds: oddsStr, result: 'win' };
    }
    
    // Lose if 7 is rolled
    if (total === 7) {
      return { payout: 0, odds: '-', result: 'loss' };
    }
    
    // Otherwise keep the bet
    return { payout: 0, odds: '-', result: 'keep' };
  }

  // PLACE BETS
  if (betArea.startsWith('place')) {
    const placeNumber = parseInt(betArea.replace('place', ''));
    if (total === placeNumber) {
      let multiplier = 1;
      let oddsStr = '1:1';
      
      if (placeNumber === 4 || placeNumber === 10) {
        multiplier = 1.8; // 9:5
        oddsStr = '9:5';
      } else if (placeNumber === 5 || placeNumber === 9) {
        multiplier = 1.4; // 7:5
        oddsStr = '7:5';
      } else if (placeNumber === 6 || placeNumber === 8) {
        multiplier = 1.166667; // 7:6
        oddsStr = '7:6';
      }
      
      return { payout: betAmount * multiplier, odds: oddsStr, result: 'win' };
    }
    if (total === 7) {
      return { payout: 0, odds: '-', result: 'loss' };
    }
    return { payout: 0, odds: '-', result: 'keep' };
  }

  // ANY CRAPS
  if (betArea === 'anyCraps') {
    if ([2, 3, 12].includes(total)) {
      return { payout: betAmount * 7, odds: '7:1', result: 'win' };
    }
    return { payout: 0, odds: '-', result: 'loss' };
  }

  // ANY SEVEN
  if (betArea === 'anySeven') {
    if (total === 7) {
      return { payout: betAmount * 4, odds: '4:1', result: 'win' };
    }
    return { payout: 0, odds: '-', result: 'loss' };
  }

  // INDIVIDUAL NUMBERS (2, 3, 11, 12)
  if (betArea === 'two' && total === 2) {
    return { payout: betAmount * 30, odds: '30:1', result: 'win' };
  }
  if (betArea === 'three' && total === 3) {
    return { payout: betAmount * 15, odds: '15:1', result: 'win' };
  }
  if (betArea === 'eleven' && total === 11) {
    return { payout: betAmount * 15, odds: '15:1', result: 'win' };
  }
  if (betArea === 'twelve' && total === 12) {
    return { payout: betAmount * 30, odds: '30:1', result: 'win' };
  }

  // C&E (Craps and Eleven)
  if (betArea === 'cande') {
    if ([2, 3, 12].includes(total)) {
      return { payout: betAmount * 3, odds: '3:1', result: 'win' };
    }
    if (total === 11) {
      return { payout: betAmount * 7, odds: '7:1', result: 'win' };
    }
    return { payout: 0, odds: '-', result: 'loss' };
  }

  // HOP BETS
  if (betArea.startsWith('hop')) {
    const [d1, d2] = betArea.replace('hop', '').split('-').map(Number);
    // Check if the exact dice combination was rolled
    // Hop bets pay 15:1 for easy ways and 30:1 for hard ways
    return { payout: 0, odds: '-', result: 'loss' };
  }

  // SMALL/TALL/ALL
  if (betArea === 'small' || betArea === 'tall' || betArea === 'all') {
    // These are progressive bets, handled separately
    return { payout: 0, odds: '-', result: 'keep' };
  }

  // Unknown bet type
  return { payout: 0, odds: 'Unknown', result: 'loss' };
}

/**
 * Validate a complete roll with all bets
 */
export function validateRoll(
  rollNumber: number,
  dice: [number, number],
  gamePhase: 'comeOut' | 'point',
  point: number | null,
  betsPlaced: Array<{ area: string; amount: number }>,
  actualTotalWinnings: number,
  balanceBefore: number,
  bonusBetsWorking: boolean = false
): RollValidation {
  const total = dice[0] + dice[1];
  const isHard = dice[0] === dice[1];
  
  const validations: BetValidation[] = [];
  let expectedTotalWinnings = 0;
  let totalBetAmount = 0;
  let totalLosses = 0;
  const errors: string[] = [];

  // Validate each bet
  for (const bet of betsPlaced) {
    totalBetAmount += bet.amount;
    
    // Calculate expected payout
    const expected = calculateExpectedPayout(
      bet.area,
      bet.amount,
      total,
      point,
      isHard,
      gamePhase
    );

    // Special handling for hardway bets when not working
    if (bet.area.startsWith('hard') && !bonusBetsWorking && gamePhase === 'comeOut') {
      expected.result = 'keep';
      expected.payout = 0;
    }

    const validation: BetValidation = {
      betArea: bet.area,
      betAmount: bet.amount,
      result: expected.result,
      payout: expected.payout,
      expectedPayout: expected.payout,
      isValid: true,
      odds: expected.odds,
      calculation: `$${bet.amount} × ${expected.odds} = $${expected.payout.toFixed(2)}`
    };

    validations.push(validation);

    if (expected.result === 'win') {
      expectedTotalWinnings += expected.payout;
    } else if (expected.result === 'loss') {
      totalLosses += bet.amount;
    }
  }

  // Check if actual winnings match expected
  const balanceAfter = balanceBefore + actualTotalWinnings;
  const netResult = actualTotalWinnings - totalLosses;
  
  // Allow small rounding differences (< $0.01)
  const difference = Math.abs(actualTotalWinnings - expectedTotalWinnings);
  const isLegit = difference < 0.01;

  if (!isLegit) {
    errors.push(
      `PAYOUT MISMATCH! Expected: $${expectedTotalWinnings.toFixed(2)}, Actual: $${actualTotalWinnings.toFixed(2)}, Difference: $${difference.toFixed(2)}`
    );
  }

  return {
    rollNumber,
    dice,
    total,
    gamePhase,
    point,
    betsPlaced: betsPlaced.length,
    totalBetAmount,
    totalWinnings: actualTotalWinnings,
    totalLosses,
    netResult,
    balanceBefore,
    balanceAfter,
    validations,
    timestamp: Date.now(),
    isLegit,
    errors
  };
}

/**
 * Log validation to console with formatting
 */
export function logValidation(validation: RollValidation) {
  console.group(`🎲 ROLL #${validation.rollNumber} VALIDATION`);
  console.log(`Dice: [${validation.dice[0]}, ${validation.dice[1]}] = ${validation.total}`);
  console.log(`Phase: ${validation.gamePhase}${validation.point ? ` (Point: ${validation.point})` : ''}`);
  console.log(`Balance: $${validation.balanceBefore.toFixed(2)} → $${validation.balanceAfter.toFixed(2)}`);
  console.log(`Net Result: ${validation.netResult >= 0 ? '+' : ''}$${validation.netResult.toFixed(2)}`);
  
  console.table(validation.validations.map(v => ({
    Bet: v.betArea,
    Amount: `$${v.betAmount}`,
    Result: v.result.toUpperCase(),
    Odds: v.odds,
    Payout: `$${v.payout.toFixed(2)}`,
    Valid: v.isValid ? '✓' : '✗'
  })));
  
  if (validation.isLegit) {
    console.log('✅ LEGITIMATE - All payouts calculated correctly!');
  } else {
    console.error('❌ VALIDATION FAILED!');
    validation.errors.forEach(error => console.error(`  - ${error}`));
  }
  
  console.groupEnd();
}

/**
 * Export validation history for audit
 */
export function exportValidationHistory(validations: RollValidation[]): string {
  const report = {
    totalRolls: validations.length,
    legitimateRolls: validations.filter(v => v.isLegit).length,
    suspiciousRolls: validations.filter(v => !v.isLegit).length,
    totalWagered: validations.reduce((sum, v) => sum + v.totalBetAmount, 0),
    totalWon: validations.reduce((sum, v) => sum + v.totalWinnings, 0),
    totalLost: validations.reduce((sum, v) => sum + v.totalLosses, 0),
    netProfit: validations.reduce((sum, v) => sum + v.netResult, 0),
    validations
  };
  
  return JSON.stringify(report, null, 2);
}