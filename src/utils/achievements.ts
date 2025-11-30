export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'rolling' | 'betting' | 'money' | 'streak' | 'time' | 'social' | 'special';
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
  reward?: {
    chips?: number;
    xp?: number;
  };
}

export const ALL_ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'progress'>[] = [
  // ROLLING ACHIEVEMENTS
  {
    id: 'first_roll',
    name: 'First Roll',
    description: 'Roll the dice for the first time',
    icon: '🎲',
    rarity: 'common',
    category: 'rolling',
    maxProgress: 1,
    reward: { chips: 100, xp: 50 },
  },
  {
    id: 'lucky_seven',
    name: 'Lucky Seven',
    description: 'Roll a 7 fifty times',
    icon: '🍀',
    rarity: 'rare',
    category: 'rolling',
    maxProgress: 50,
    reward: { chips: 1000, xp: 500 },
  },
  {
    id: 'snake_eyes',
    name: 'Snake Eyes',
    description: 'Roll snake eyes (2) ten times',
    icon: '🐍',
    rarity: 'epic',
    category: 'rolling',
    maxProgress: 10,
    reward: { chips: 2000, xp: 1000 },
  },
  {
    id: 'boxcars',
    name: 'Boxcars',
    description: 'Roll boxcars (12) ten times',
    icon: '🚂',
    rarity: 'epic',
    category: 'rolling',
    maxProgress: 10,
    reward: { chips: 2000, xp: 1000 },
  },
  {
    id: 'yo_eleven',
    name: 'Yo Eleven',
    description: 'Roll an 11 twenty times',
    icon: '🎯',
    rarity: 'rare',
    category: 'rolling',
    maxProgress: 20,
    reward: { chips: 1500, xp: 750 },
  },
  {
    id: 'hard_way_master',
    name: 'Hard Way Master',
    description: 'Win 25 hardway bets',
    icon: '💎',
    rarity: 'epic',
    category: 'rolling',
    maxProgress: 25,
    reward: { chips: 5000, xp: 2000 },
  },
  {
    id: 'century_roller',
    name: 'Century Roller',
    description: 'Roll the dice 100 times',
    icon: '💯',
    rarity: 'rare',
    category: 'rolling',
    maxProgress: 100,
    reward: { chips: 500, xp: 250 },
  },
  {
    id: 'thousand_rolls',
    name: 'Thousand Rolls',
    description: 'Roll the dice 1,000 times',
    icon: '🎰',
    rarity: 'legendary',
    category: 'rolling',
    maxProgress: 1000,
    reward: { chips: 10000, xp: 5000 },
  },

  // BETTING ACHIEVEMENTS
  {
    id: 'pass_line_pro',
    name: 'Pass Line Pro',
    description: 'Win 50 Pass Line bets',
    icon: '✅',
    rarity: 'rare',
    category: 'betting',
    maxProgress: 50,
    reward: { chips: 1000, xp: 500 },
  },
  {
    id: 'field_master',
    name: 'Field Master',
    description: 'Win 30 Field bets',
    icon: '🌾',
    rarity: 'rare',
    category: 'betting',
    maxProgress: 30,
    reward: { chips: 800, xp: 400 },
  },
  {
    id: 'prop_bet_king',
    name: 'Prop Bet King',
    description: 'Win 20 proposition bets',
    icon: '👑',
    rarity: 'epic',
    category: 'betting',
    maxProgress: 20,
    reward: { chips: 3000, xp: 1500 },
  },
  {
    id: 'odds_expert',
    name: 'Odds Expert',
    description: 'Win 25 odds bets',
    icon: '📊',
    rarity: 'epic',
    category: 'betting',
    maxProgress: 25,
    reward: { chips: 2500, xp: 1250 },
  },

  // MONEY ACHIEVEMENTS
  {
    id: 'big_winner',
    name: 'Big Winner',
    description: 'Win $1,000 in a single bet',
    icon: '💰',
    rarity: 'rare',
    category: 'money',
    maxProgress: 1,
    reward: { chips: 500, xp: 250 },
  },
  {
    id: 'huge_winner',
    name: 'Huge Winner',
    description: 'Win $5,000 in a single bet',
    icon: '💵',
    rarity: 'epic',
    category: 'money',
    maxProgress: 1,
    reward: { chips: 2000, xp: 1000 },
  },
  {
    id: 'mega_winner',
    name: 'Mega Winner',
    description: 'Win $10,000 in a single bet',
    icon: '💸',
    rarity: 'legendary',
    category: 'money',
    maxProgress: 1,
    reward: { chips: 5000, xp: 2500 },
  },
  {
    id: 'high_roller',
    name: 'High Roller',
    description: 'Wager over $10,000 total',
    icon: '🎩',
    rarity: 'epic',
    category: 'money',
    maxProgress: 10000,
    reward: { chips: 3000, xp: 1500 },
  },
  {
    id: 'whale',
    name: 'Whale',
    description: 'Wager over $100,000 total',
    icon: '🐋',
    rarity: 'legendary',
    category: 'money',
    maxProgress: 100000,
    reward: { chips: 20000, xp: 10000 },
  },
  {
    id: 'profitable_gambler',
    name: 'Profitable Gambler',
    description: 'Reach $5,000 net profit',
    icon: '📈',
    rarity: 'epic',
    category: 'money',
    maxProgress: 5000,
    reward: { chips: 2500, xp: 1250 },
  },
  {
    id: 'millionaire',
    name: 'Millionaire',
    description: 'Accumulate $1,000,000 in total winnings',
    icon: '🏆',
    rarity: 'legendary',
    category: 'money',
    maxProgress: 1000000,
    reward: { chips: 50000, xp: 25000 },
  },

  // STREAK ACHIEVEMENTS
  {
    id: 'hot_streak',
    name: 'Hot Streak',
    description: 'Win 5 times in a row',
    icon: '🔥',
    rarity: 'epic',
    category: 'streak',
    maxProgress: 5,
    reward: { chips: 1500, xp: 750 },
  },
  {
    id: 'legendary_roller',
    name: 'Legendary Roller',
    description: 'Win 10 times in a row',
    icon: '⚡',
    rarity: 'legendary',
    category: 'streak',
    maxProgress: 10,
    reward: { chips: 5000, xp: 2500 },
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: 'Win 15 times in a row',
    icon: '🌟',
    rarity: 'legendary',
    category: 'streak',
    maxProgress: 15,
    reward: { chips: 10000, xp: 5000 },
  },
  {
    id: 'comeback_kid',
    name: 'Comeback Kid',
    description: 'Win after losing 5 times in a row',
    icon: '🎭',
    rarity: 'rare',
    category: 'streak',
    maxProgress: 1,
    reward: { chips: 1000, xp: 500 },
  },

  // TIME-BASED ACHIEVEMENTS
  {
    id: 'daily_player',
    name: 'Daily Player',
    description: 'Play for 7 days in a row',
    icon: '📅',
    rarity: 'rare',
    category: 'time',
    maxProgress: 7,
    reward: { chips: 2000, xp: 1000 },
  },
  {
    id: 'dedicated_player',
    name: 'Dedicated Player',
    description: 'Play for 30 days in a row',
    icon: '🗓️',
    rarity: 'epic',
    category: 'time',
    maxProgress: 30,
    reward: { chips: 10000, xp: 5000 },
  },
  {
    id: 'veteran',
    name: 'Veteran',
    description: 'Play for 100 days in a row',
    icon: '🎖️',
    rarity: 'legendary',
    category: 'time',
    maxProgress: 100,
    reward: { chips: 50000, xp: 25000 },
  },
  {
    id: 'marathon_session',
    name: 'Marathon Session',
    description: 'Play for 2 hours straight',
    icon: '⏰',
    rarity: 'rare',
    category: 'time',
    maxProgress: 120,
    reward: { chips: 1500, xp: 750 },
  },

  // SOCIAL ACHIEVEMENTS
  {
    id: 'social_butterfly',
    name: 'Social Butterfly',
    description: 'Play 10 multiplayer games',
    icon: '🦋',
    rarity: 'rare',
    category: 'social',
    maxProgress: 10,
    reward: { chips: 1000, xp: 500 },
  },
  {
    id: 'team_player',
    name: 'Team Player',
    description: 'Play 50 multiplayer games',
    icon: '👥',
    rarity: 'epic',
    category: 'social',
    maxProgress: 50,
    reward: { chips: 5000, xp: 2500 },
  },
  {
    id: 'multiplayer_master',
    name: 'Multiplayer Master',
    description: 'Win 25 multiplayer games',
    icon: '🎮',
    rarity: 'epic',
    category: 'social',
    maxProgress: 25,
    reward: { chips: 4000, xp: 2000 },
  },

  // SPECIAL ACHIEVEMENTS
  {
    id: 'perfect_game',
    name: 'Perfect Game',
    description: 'Win every bet in a single session with 10+ rolls',
    icon: '💫',
    rarity: 'legendary',
    category: 'special',
    maxProgress: 1,
    reward: { chips: 15000, xp: 7500 },
  },
  {
    id: 'rags_to_riches',
    name: 'Rags to Riches',
    description: 'Win $10,000 after being down to less than $100',
    icon: '👑',
    rarity: 'legendary',
    category: 'special',
    maxProgress: 1,
    reward: { chips: 10000, xp: 5000 },
  },
  {
    id: 'risk_taker',
    name: 'Risk Taker',
    description: 'Place a bet worth 50% or more of your balance and win',
    icon: '🎲',
    rarity: 'epic',
    category: 'special',
    maxProgress: 1,
    reward: { chips: 3000, xp: 1500 },
  },
];

export function checkAchievementProgress(
  achievementId: string,
  currentProgress: number,
  maxProgress: number
): boolean {
  return currentProgress >= maxProgress;
}

export function getCategoryIcon(category: Achievement['category']): string {
  switch (category) {
    case 'rolling': return '🎲';
    case 'betting': return '💰';
    case 'money': return '💵';
    case 'streak': return '🔥';
    case 'time': return '⏰';
    case 'social': return '👥';
    case 'special': return '⭐';
    default: return '🏆';
  }
}

export function getCategoryName(category: Achievement['category']): string {
  switch (category) {
    case 'rolling': return 'Rolling';
    case 'betting': return 'Betting';
    case 'money': return 'Money';
    case 'streak': return 'Streak';
    case 'time': return 'Time';
    case 'social': return 'Social';
    case 'special': return 'Special';
    default: return 'Other';
  }
}
