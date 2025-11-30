import { useState, useEffect } from 'react';
import { Trash2, RotateCcw } from 'lucide-react';
import { CrapsTable } from './CrapsTable';
import { ChipSelector } from './ChipSelector';
import { CrapsHeader } from './CrapsHeader';
import { LoadingScreen } from './LoadingScreen';
import { ProfileStatsModal } from './ProfileStatsModal';
import { RollHistoryModal } from './RollHistoryModal';
import { LevelUpModal } from './LevelUpModal';
import { LeaderboardModal } from './LeaderboardModal';
import { VisualDiceHistory } from './VisualDiceHistory';
import { CompactTimer } from './CompactTimer';
import { rollDice } from '../utils/fairDice';
import { dealerVoice } from '../utils/dealerVoice';
import { ProfileLogin } from './ProfileLogin';
import { ModeSelection } from './ModeSelection';
import { MultiplayerLobby } from './MultiplayerLobby';
import { MultiplayerCrapsGame } from './MultiplayerCrapsGame';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ProfileSettings } from './ProfileSettings';
import { MusicPlayer } from './MusicPlayer';
import { PlaylistSettings } from './PlaylistSettings';
import { useSettings } from '../contexts/SettingsContext';
import { useProgression } from '../contexts/ProgressionContext';
import { useDailyRewards } from '../contexts/DailyRewardsContext';
import { useXPBoost } from '../contexts/XPBoostContext';
import { DailyRewardModal } from './DailyRewardModal';
import { RewardsPanel } from './RewardsPanel';
import { WinDisplay } from './WinDisplay';
import { WinAmountPopup } from './WinAmountPopup';
import { AchievementSystem, type Achievement } from './AchievementSystem';
import { logAudioSetupGuide } from '../utils/audioSetupGuide';
import { Security } from '../utils/security';
import { SecurityDashboard } from './SecurityDashboard';
import { saveToCloud, loadFromCloud, autoSaveToCloud, syncWithCloud, type GameData } from '../utils/cloudStorage';
import { useNotification } from './NotificationSystem';
import { validateRoll, logValidation, type RollValidation } from '../utils/betValidator';
import { PayoutVerifier } from './PayoutVerifier';
import { FairnessModal } from './FairnessModal';
import { ErrorBoundary } from './ErrorBoundary';
import { QuickHelpTooltip } from './QuickHelpTooltip';
import { FriendsPanel } from './FriendsPanel';

export interface PlacedBet {
  area: string;
  amount: number;
  x?: number;
  y?: number;
  comePoint?: number; // Tracks which number a come bet is on
  playerName?: string; // For multiplayer - tracks who placed the bet
  playerAvatar?: string; // For multiplayer - player's avatar
  isStacked?: boolean; // For multiplayer - indicates multiple players bet on same spot
  stackCount?: number; // For multiplayer - how many bets are stacked
  playerNames?: string[]; // For multiplayer - names of all players who bet on this spot
}

export interface Roll {
  dice1: number;
  dice2: number;
  total: number;
  timestamp: number;
  rollNumber: number; // The sequential roll number (1, 2, 3, ...)
  phase?: GamePhase;
  point?: number | null;
  wasSevenOut?: boolean;
}

export type GamePhase = 'comeOut' | 'point';

// Game statistics interface
interface GameStats {
  totalRolls: number;
  totalWins: number;
  totalLosses: number;
  biggestWin: number;
  totalWagered: number;
  totalWon: number;
  sessionStart: number;
}

// Save state interface
interface SavedGameState {
  balance: number;
  rollHistory: Roll[];
  stats: GameStats;
  lastSaved: number;
}

export function CrapsGame() {
  // Use settings context
  const { settings, updateSettings } = useSettings();
  const { addXP, level, xp, totalXpEarned, unclaimedRewards } = useProgression();
  const { canClaimToday } = useDailyRewards();
  const { syncBoostsWithServer } = useXPBoost();
  const notification = useNotification();
  
  // Game mode state - changed to include 'modeSelect' as initial
  const [gameMode, setGameMode] = useState<'modeSelect' | 'lobby' | 'single' | 'multiplayer' | 'loading'>('modeSelect');
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading');

  // Profile state
  const [profile, setProfile] = useState<{ name: string; email: string; avatar?: string; phone?: string; securityPin?: string } | null>(null);
  const [showProfileSettings, setShowProfileSettings] = useState(false);

  // Music player state
  const [musicVolume, setMusicVolume] = useState(0.5); // DEFAULT TO 50% VOLUME
  const [musicEnabled, setMusicEnabled] = useState(true);
  const [customPlaylists, setCustomPlaylists] = useState<string[]>([]);
  const [showPlaylistSettings, setShowPlaylistSettings] = useState(false);
  
  // Daily rewards state
  const [showDailyRewards, setShowDailyRewards] = useState(false);
  
  // Rewards panel state
  const [showRewardsPanel, setShowRewardsPanel] = useState(false);
  
  // Button locking state - locks all betting during roll + 1.5s after
  const [buttonsLocked, setButtonsLocked] = useState(false);
  
  // Quick roll flash effect
  const [showQuickRollFlash, setShowQuickRollFlash] = useState(false);

  // Sync music volume with settings context
  useEffect(() => {
    if (settings.musicVolume !== undefined) {
      const normalizedVolume = settings.musicVolume / 100; // Convert from 0-100 to 0-1
      setMusicVolume(normalizedVolume);
    }
    if (settings.musicEnabled !== undefined) {
      setMusicEnabled(settings.musicEnabled);
    }
  }, [settings.musicVolume, settings.musicEnabled]);

  // Sync dealer voice with settings context
  useEffect(() => {
    if (settings.dealerVoice !== undefined) {
      dealerVoice.setEnabled(settings.dealerVoice);
    }
    if (settings.dealerVolume !== undefined) {
      dealerVoice.setVolume(settings.dealerVolume / 100); // Convert from 0-100 to 0-1
    }
  }, [settings.dealerVoice, settings.dealerVolume]);

  // Update settings when local music volume changes (from MusicPlayer)
  const handleMusicVolumeChange = (newVolume: number) => {
    setMusicVolume(newVolume);
    // Update settings context with the new volume (convert from 0-1 to 0-100)
    updateSettings({
      ...settings,
      musicVolume: Math.round(newVolume * 100)
    });
  };

  const handleMusicEnabledChange = (enabled: boolean) => {
    setMusicEnabled(enabled);
    // Update settings context
    updateSettings({
      ...settings,
      musicEnabled: enabled
    });
  };
  
  // Load profile on mount
  useEffect(() => {
    // Show audio setup guide in console
    logAudioSetupGuide();
    
    const savedProfile = localStorage.getItem('rollers-paradise-profile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        setProfile(parsed);
        console.log('✅ Restored user session:', parsed.name);
      } catch (e) {
        console.error('Failed to load profile:', e);
      }
    }
    
    // Load music playlists
    const savedPlaylists = localStorage.getItem('rollers-paradise-playlists');
    if (savedPlaylists) {
      try {
        const parsed = JSON.parse(savedPlaylists);
        setCustomPlaylists(parsed);
      } catch (e) {
        console.error('Failed to load playlists:', e);
      }
    }
    
  }, []);

  // Online presence tracking
  useEffect(() => {
    if (!profile?.email) return;

    // Update presence immediately
    const updatePresence = () => {
      fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/presence/update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email: profile.email }),
        }
      ).catch(err => console.error('Failed to update presence:', err));
    };

    // Update presence on mount
    updatePresence();

    // Update presence every 2 minutes
    const presenceInterval = setInterval(updatePresence, 2 * 60 * 1000);

    return () => clearInterval(presenceInterval);
  }, [profile?.email]);
  
  // Show daily rewards if available
  useEffect(() => {
    if (profile && gameMode === 'modeSelect' && canClaimToday) {
      // Small delay before showing daily rewards
      const timer = setTimeout(() => {
        setShowDailyRewards(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [profile, gameMode, canClaimToday]);

  // Watch for level-ups from ProgressionContext
  const [previousLevel, setPreviousLevel] = useState(level);
  useEffect(() => {
    if (level > previousLevel && unclaimedRewards.length > 0) {
      // Level up detected! Store the data but DON'T auto-show modal
      // Player can open it when ready from the header notification
      const latestReward = unclaimedRewards[unclaimedRewards.length - 1];
      setLevelUpData({
        newLevel: level,
        rewards: latestReward.reward
      });
      // DON'T auto-popup - let player open it themselves
      // setShowLevelUp(true); // REMOVED - No more blocking popups!
      console.log(`🎉 Level up detected: ${previousLevel} → ${level} - Notification available in header`);
    }
    setPreviousLevel(level);
  }, [level, unclaimedRewards]);

  // 🔒 SECURE Load saved state from localStorage based on profile
  const loadSavedState = (): SavedGameState | null => {
    try {
      if (profile?.email) {
        // Use secure load with encryption and tampering detection
        const saved = Security.secureLoad<SavedGameState | null>(
          `rollers-paradise-save-${profile.email}`,
          null
        );
        
        if (saved) {
          // Validate game state integrity
          const validation = Security.validateGameState({
            balance: saved.balance,
            xp: 0, // XP is in progression context
            level: 0, // Level is in progression context
            stats: saved.stats,
            achievements: []
          });
          
          if (!validation.valid) {
            console.error('🚨 Game state validation failed:', validation.errors);
            Security.logSecurityEvent('INVALID_SAVE_DATA', { 
              email: profile.email, 
              errors: validation.errors 
            });
            return null; // Use default values instead of corrupted data
          }
          
          // Anti-cheat detection
          const antiCheat = Security.detectAntiCheat({
            balance: saved.balance,
            totalWagered: saved.stats.totalWagered,
            biggestWin: saved.stats.biggestWin,
            level: 0,
            xp: 0
          });
          
          if (antiCheat.suspicious) {
            console.error('🚨 Anti-cheat triggered on load!');
            // Reset to safe defaults
            return null;
          }
          
          console.log('✅ Secure game state loaded and validated');
          return saved;
        }
      }
    } catch (error) {
      console.error('Failed to load saved game:', error);
    }
    return null;
  };

  const savedState = loadSavedState();
  
  const [balance, setBalanceInternal] = useState(savedState?.balance ?? 5000); // Load from saved state if available! Increased starting balance
  
  // 📊 Balance Loading Status - Log on initial load
  useEffect(() => {
    console.log('%c💰 BALANCE PERSISTENCE STATUS', 'color: #10b981; font-size: 16px; font-weight: bold;');
    console.log('════════════════════════════════════════════════');
    if (savedState) {
      console.log('✅ Loaded from saved state (localStorage)');
      console.log(`   Balance: $${savedState.balance.toFixed(2)}`);
      console.log(`   Last saved: ${new Date(savedState.lastSaved).toLocaleString()}`);
    } else {
      console.log('🆕 New session - using default balance');
      console.log(`   Starting balance: $${balance.toFixed(2)}`);
    }
    console.log('ℹ️  Balance will sync with server automatically');
    console.log('ℹ️  Works identically in preview and live mode');
    console.log('════════════════════════════════════════════════');
  }, []); // Only run once on mount
  
  // Safe balance setter that prevents negative balance
  const setBalance = (value: number | ((prev: number) => number)) => {
    setBalanceInternal(prev => {
      const newBalance = typeof value === 'function' ? value(prev) : value;
      // CRITICAL: Never allow negative balance
      if (newBalance < 0) {
        console.error('⚠️ Attempted to set negative balance! Clamping to 0.');
        return 0;
      }
      return newBalance;
    });
  };
  
  const [placedBets, setPlacedBets] = useState<PlacedBet[]>([]);
  // Track bet history for undo functionality - each entry is a bet action
  const [betHistory, setBetHistory] = useState<Array<{ area: string; amount: number; x?: number; y?: number; comePoint?: number }>>([]);
  // Store bets from before point was established for optional repeat
  const [lastComeOutBets, setLastComeOutBets] = useState<PlacedBet[]>([]);
  const [showRepeatButton, setShowRepeatButton] = useState(false);
  const [dice1, setDice1] = useState(1);
  const [dice2, setDice2] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [message, setMessage] = useState('Place your bets!');
  const [showStats, setShowStats] = useState(false);
  const [showRollHistory, setShowRollHistory] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: number; rewards: any } | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showSecurityDashboard, setShowSecurityDashboard] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [showPayoutVerifier, setShowPayoutVerifier] = useState(false);
  const [showFairnessInfo, setShowFairnessInfo] = useState(false);
  const [puckPosition, setPuckPosition] = useState<number | null>(null);
  const [point, setPoint] = useState<number | null>(null);
  const [gamePhase, setGamePhase] = useState<GamePhase>('comeOut');
  const [rollHistory, setRollHistory] = useState<Roll[]>(savedState?.rollHistory ?? []);
  const [lastBet, setLastBet] = useState(0);
  const [lastWin, setLastWin] = useState(0);
  const [lastWinDetails, setLastWinDetails] = useState<Array<{ betName: string; winAmount: number; betArea?: string }>>([]);
  const [selectedChip, setSelectedChip] = useState(5);
  
  // Win amount popups - track active win animations
  const [winPopups, setWinPopups] = useState<Array<{ id: string; amount: number; x: number; y: number; isLoss?: boolean; betArea?: string }>>([]);
  
  // Track last bet configuration for DOUBLE/REPEAT functionality
  const [lastBetConfiguration, setLastBetConfiguration] = useState<PlacedBet[]>([]);
  
  // Game statistics
  const [stats, setStats] = useState<GameStats>(savedState?.stats ?? {
    totalRolls: 0,
    totalWins: 0,
    totalLosses: 0,
    biggestWin: 0,
    totalWagered: 0,
    totalWon: 0,
    sessionStart: Date.now()
  });
  
  // Track Small, Tall, All numbers hit (persistent across rolls until win or 7)
  const [smallHit, setSmallHit] = useState<number[]>([]);
  const [tallHit, setTallHit] = useState<number[]>([]);
  const [allHit, setAllHit] = useState<number[]>([]);
  
  // Betting timer (single player - same as multiplayer)
  const [bettingTimer, setBettingTimer] = useState(30);
  const [bettingTimerActive, setBettingTimerActive] = useState(false);
  const [bettingLocked, setBettingLocked] = useState(false);
  const BETTING_TIMER_DURATION = 30;
  
  // Track if Small/Tall/All bets are active
  const [smallActive, setSmallActive] = useState(false);
  const [tallActive, setTallActive] = useState(false);
  const [allActive, setAllActive] = useState(false);
  
  // 🔒 BET VALIDATION SYSTEM - Track all payouts for legitimacy
  const [validationHistory, setValidationHistory] = useState<RollValidation[]>([]);
  
  // 🔍 EXPOSE VALIDATION HISTORY FOR TRANSPARENCY - Debugging & Verification
  useEffect(() => {
    // Allow players to export validation history via console
    (window as any).exportValidationHistory = () => {
      console.log('📊 VALIDATION HISTORY - Last 100 Rolls');
      console.log('=====================================');
      console.table(validationHistory.map(v => ({
        Roll: v.rollNumber,
        Dice: `[${v.diceRoll.join(', ')}]`,
        Total: v.diceRoll[0] + v.diceRoll[1],
        Phase: v.gamePhase,
        Point: v.point || 'N/A',
        Bets: v.betsPlaced.length,
        TotalBet: `$${v.betsPlaced.reduce((sum, b) => sum + b.amount, 0).toFixed(2)}`,
        Won: `$${v.totalWinnings.toFixed(2)}`,
        Valid: v.isLegit ? '✅' : '❌',
        Timestamp: new Date(v.timestamp).toLocaleTimeString()
      })));
      console.log(`\nTotal Rolls Validated: ${validationHistory.length}`);
      console.log(`All Valid: ${validationHistory.every(v => v.isLegit) ? '✅ YES' : '❌ NO'}`);
      return validationHistory;
    };
    
    (window as any).showLastRoll = () => {
      const lastRoll = validationHistory[validationHistory.length - 1];
      if (!lastRoll) {
        console.log('No rolls yet');
        return;
      }
      console.log('🎲 LAST ROLL DETAILS');
      console.log('===================');
      logValidation(lastRoll);
      return lastRoll;
    };
    
    (window as any).auditBalance = () => {
      console.log('💰 BALANCE AUDIT');
      console.log('===============');
      console.log(`Current Balance: $${balance.toFixed(2)}`);
      console.log(`Bets on Table: $${placedBets.reduce((sum, bet) => sum + bet.amount, 0).toFixed(2)}`);
      console.log('\nActive Bets:');
      placedBets.forEach(bet => {
        console.log(`  - ${bet.area}: $${bet.amount.toFixed(2)}${bet.comePoint ? ` (on ${bet.comePoint})` : ''}`);
      });
      console.log('\nValidation Summary:');
      const totalWins = validationHistory.reduce((sum, v) => sum + v.totalWinnings, 0);
      const totalRolls = validationHistory.length;
      console.log(`  Total Rolls: ${totalRolls}`);
      console.log(`  Total Winnings: $${totalWins.toFixed(2)}`);
      console.log(`  All Validations Passed: ${validationHistory.every(v => v.isLegit) ? '✅ YES' : '❌ NO'}`);
      if (!validationHistory.every(v => v.isLegit)) {
        const failedRolls = validationHistory.filter(v => !v.isLegit);
        console.error(`  Failed Validations: ${failedRolls.length}`);
        console.error('  Failed Roll Numbers:', failedRolls.map(v => v.rollNumber));
      }
      return {
        balance,
        betsOnTable: placedBets.reduce((sum, bet) => sum + bet.amount, 0),
        placedBets,
        totalWinnings: totalWins,
        totalRolls,
        allValid: validationHistory.every(v => v.isLegit)
      };
    };
    
    console.log('🔍 Debug commands available:');
    console.log('  window.exportValidationHistory() - View all roll validations');
    console.log('  window.showLastRoll() - See detailed info for last roll');
    console.log('  window.auditBalance() - Comprehensive balance & bet audit');
    console.log('');
    console.log('💡 Come Bet Testing:');
    console.log('  1. Click COME area to place a bet');
    console.log('  2. Roll dice - if 7 rolls, you win instantly!');
    console.log('  3. If other number rolls, bet travels to that number');
    console.log('  4. Click yellow "ADD ODDS" button to place odds behind it');
    console.log('  5. Watch console for detailed come bet tracking logs');
  }, [validationHistory, balance, placedBets]);
  
  // Track if bonus bets are working (toggle) - Defaults to FALSE during come out roll
  const [bonusBetsWorking, setBonusBetsWorking] = useState(false);
  
  // Toggle between Buy/Place bets mode and Bonus bets mode
  const [showBuyPlaceBets, setShowBuyPlaceBets] = useState(false);

  // NEW FEATURES - Win Display, Streaks, Achievements
  const [showWinDisplay, setShowWinDisplay] = useState(false);
  const [currentWinDetails, setCurrentWinDetails] = useState<Array<{ betType: string; betAmount: number; payout: number; odds: string; position?: number }>>([]);
  const [hotStreak, setHotStreak] = useState(0);
  const [coldStreak, setColdStreak] = useState(0);
  const [longestHotStreak, setLongestHotStreak] = useState(0);
  const [longestColdStreak, setLongestColdStreak] = useState(0);
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievements, setAchievements] = useState<Achievement[]>([
    {
      id: 'first_win',
      title: 'First Winner',
      description: 'Win your first bet',
      icon: 'trophy',
      progress: 0,
      maxProgress: 1,
      reward: 50,
      unlocked: false,
      rarity: 'common',
    },
    {
      id: 'high_roller',
      title: 'High Roller',
      description: 'Place a single bet of $100 or more',
      icon: 'crown',
      progress: 0,
      maxProgress: 1,
      reward: 100,
      unlocked: false,
      rarity: 'rare',
    },
    {
      id: 'hot_streak_3',
      title: 'On Fire',
      description: 'Win 3 rolls in a row',
      icon: 'flame',
      progress: 0,
      maxProgress: 3,
      reward: 150,
      unlocked: false,
      rarity: 'rare',
    },
    {
      id: 'hot_streak_5',
      title: 'Unstoppable',
      description: 'Win 5 rolls in a row',
      icon: 'zap',
      progress: 0,
      maxProgress: 5,
      reward: 500,
      unlocked: false,
      rarity: 'epic',
    },
    {
      id: 'big_winner',
      title: 'Big Winner',
      description: 'Win $1,000 in a single roll',
      icon: 'star',
      progress: 0,
      maxProgress: 1,
      reward: 250,
      unlocked: false,
      rarity: 'epic',
    },
    {
      id: 'millionaire',
      title: 'Millionaire',
      description: 'Reach a balance of $10,000',
      icon: 'crown',
      progress: 0,
      maxProgress: 10000,
      reward: 1000,
      unlocked: false,
      rarity: 'legendary',
    },
    {
      id: 'roll_100',
      title: 'Seasoned Player',
      description: 'Roll the dice 100 times',
      icon: 'target',
      progress: 0,
      maxProgress: 100,
      reward: 200,
      unlocked: false,
      rarity: 'rare',
    },
    {
      id: 'roll_500',
      title: 'Craps Master',
      description: 'Roll the dice 500 times',
      icon: 'trophy',
      progress: 0,
      maxProgress: 500,
      reward: 1000,
      unlocked: false,
      rarity: 'legendary',
    },
  ]);

  // Fetch balance from server on initial load if user is logged in
  // ⚠️ SMART SYNC: Only update if server balance is different from local
  useEffect(() => {
    if (profile?.email) {
      const smartFetchBalance = async () => {
        const localBalance = balance; // Current balance from localStorage
        console.log('💰 Smart Balance Sync: Checking server balance...');
        console.log('   Local balance:', localBalance);
        
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/chips/balance/${encodeURIComponent(profile.email)}`,
            {
              headers: { Authorization: `Bearer ${publicAnonKey}` },
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log('   Server balance:', data.balance);
            console.log('   Last sync:', data.lastSync ? new Date(data.lastSync).toLocaleString() : 'Never');
            
            // ⚡ SMART DECISION: Use the HIGHER balance to prevent loss
            // This ensures we never lose progress due to sync issues
            if (data.balance !== localBalance) {
              const maxBalance = Math.max(data.balance, localBalance);
              console.log(`   📊 Balances differ! Using higher: $${maxBalance}`);
              
              if (maxBalance !== localBalance) {
                // Check if we have bets placed that would exceed the new balance
                const totalBet = placedBets.reduce((sum, bet) => sum + bet.amount, 0);
                if (totalBet > maxBalance) {
                  console.log(`   ⚠️ Balance change would make current bets invalid ($${totalBet} > $${maxBalance})`);
                  console.log(`   🧹 Clearing ${placedBets.length} bets to prevent errors`);
                  setPlacedBets([]);
                  setBetHistory([]);
                  setMessage('⚠️ Your balance was synced and current bets were cleared');
                }
                
                setBalance(maxBalance);
                console.log(`   ✅ Updated local balance: $${localBalance} → $${maxBalance}`);
              }
              
              // Sync the higher balance back to server if needed
              if (maxBalance !== data.balance) {
                console.log(`   ⬆️ Syncing higher balance to server...`);
                await fetch(
                  `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/chips/update-balance`,
                  {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${publicAnonKey}`,
                    },
                    body: JSON.stringify({ 
                      email: profile.email, 
                      balance: maxBalance,
                      source: 'smart-sync'
                    }),
                  }
                );
                console.log(`   ✅ Server updated with higher balance`);
              }
            } else {
              console.log('   ✅ Balances match - no sync needed');
            }
          }
        } catch (error) {
          console.error('❌ Failed to fetch balance from server:', error);
          console.log('   ℹ️ Using local balance:', localBalance);
        }
      };
      
      smartFetchBalance();
    }
  }, [profile?.email]);

  // Handle payment success/failure from URL parameters
  useEffect(() => {
    const handlePaymentReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const paymentStatus = urlParams.get('payment');
      const email = urlParams.get('email');
      const amount = urlParams.get('amount');

      if (paymentStatus === 'success' && email && amount) {
        try {
          // Confirm payment with server
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/chips/confirm-payment`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${publicAnonKey}`,
              },
              body: JSON.stringify({ 
                email: decodeURIComponent(email), 
                amount: parseInt(amount) 
              }),
            }
          );

          const data = await response.json();

          if (response.ok) {
            setBalance(data.balance);
            setMessage(`🎉 Payment successful! Added $${amount} to your balance!`);
          } else {
            setMessage('⚠️ Payment processed but chips not added. Please contact support.');
          }
        } catch (error) {
          console.error('Error confirming payment:', error);
          setMessage('⚠️ Payment may have succeeded. Please check your balance or contact support.');
        }

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (paymentStatus === 'cancelled') {
        setMessage('Payment cancelled. No charges were made.');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handlePaymentReturn();
  }, []);

  // Handle membership payment return
  useEffect(() => {
    const handleMembershipReturn = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const membershipSuccess = urlParams.get('membership_success');
      const email = urlParams.get('email');
      const tier = urlParams.get('tier');
      const duration = urlParams.get('duration');

      if (membershipSuccess === 'true' && email && tier && duration) {
        try {
          // Confirm membership with server
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/membership/confirm`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${publicAnonKey}`,
              },
              body: JSON.stringify({ 
                email: decodeURIComponent(email), 
                tier,
                duration
              }),
            }
          );

          const data = await response.json();

          if (response.ok) {
            setMessage(`🎉 ${tier.toUpperCase()} ${duration} membership activated! Enjoy your benefits!`);
            // Trigger membership context update via localStorage event
            window.dispatchEvent(new CustomEvent('membership-updated', { detail: data.membership }));
          } else {
            setMessage('⚠️ Membership payment processed but not activated. Please contact support.');
          }
        } catch (error) {
          console.error('Error confirming membership:', error);
          setMessage('⚠️ Membership payment may have succeeded. Please check your status or contact support.');
        }

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (urlParams.get('membership_cancelled') === 'true') {
        setMessage('Membership purchase cancelled. No charges were made.');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleMembershipReturn();
  }, []);

  // 🔒 Sync balance to server for validation (MUST be defined before useEffect that calls it!)
  const syncBalanceToServer = async (email: string, currentBalance: number) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/chips/update-balance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email, balance: currentBalance, source: 'auto-sync' }),
        }
      );
      
      if (response.ok) {
        console.log('✅ Balance synced to server');
      }
    } catch (error) {
      console.error('Failed to sync balance:', error);
    }
  };

  // 🔒 SECURE Auto-save game state to localStorage (SKIP FOR GUEST ACCOUNTS)
  useEffect(() => {
    const saveState: SavedGameState = {
      balance,
      rollHistory,
      stats,
      lastSaved: Date.now()
    };
    
    try {
      if (profile?.email) {
        // Validate before saving
        const validation = Security.validateGameState({
          balance: saveState.balance,
          xp: 0,
          level: 0,
          stats: saveState.stats,
          achievements: []
        });
        
        if (!validation.valid) {
          console.error('🚨 Cannot save invalid game state:', validation.errors);
          return;
        }
        
        // Check rate limit (prevent spam saves)
        if (!Security.checkRateLimit('game-save', 120)) {
          console.warn('⚠️ Save rate limit exceeded');
          return;
        }
        
        // Use secure save with encryption
        Security.secureSave(`rollers-paradise-save-${profile.email}`, saveState);
        
        // Also sync to cloud every 5 saves
        const saveCount = parseInt(localStorage.getItem('save-count') || '0') + 1;
        localStorage.setItem('save-count', saveCount.toString());
        
        if (saveCount % 5 === 0) {
          // ⚡ REMOVED: syncBalanceToServer call - now handled by debounced useEffect
          // This prevents duplicate balance syncs (was causing 2x server calls)
          
          // Save to cloud
          const cloudData: GameData = {
            balance,
            xp: 0, // XP is managed by ProgressionContext
            level: 0, // Level is managed by ProgressionContext
            boosts: [],
            achievements: [],
            stats: saveState.stats,
            rollHistory: saveState.rollHistory,
            gamePhase: gamePhase,
            point: point,
            lastSaved: Date.now()
          };
          
          autoSaveToCloud(profile.email, cloudData).catch(err => {
            console.error('Cloud auto-save failed:', err);
          });
        }
      }
    } catch (error) {
      console.error('Failed to save game:', error);
    }
  }, [balance, rollHistory, stats, profile]);
  
  // ☁️ OPTIMIZED: Auto-save to cloud every 2 minutes (reduced from 60 seconds)
  // Cloud saves are also triggered every 5 local saves, so this is just a backup
  useEffect(() => {
    if (!profile?.email) return;
    
    const cloudSaveInterval = setInterval(() => {
      const cloudData: GameData = {
        balance,
        xp: 0, // Managed by ProgressionContext
        level: 0, // Managed by ProgressionContext
        boosts: [],
        achievements: [],
        stats,
        rollHistory: rollHistory.slice(0, 50), // Only save recent history
        gamePhase: gamePhase,
        point: point,
        lastSaved: Date.now()
      };
      
      autoSaveToCloud(profile.email, cloudData).then(success => {
        if (success) {
          console.log('☁️ Auto-saved to cloud');
        }
      }).catch(err => {
        console.error('Cloud auto-save error:', err);
      });
    }, 120000); // Every 2 minutes (reduced server load)
    
    return () => clearInterval(cloudSaveInterval);
  }, [balance, rollHistory, stats, gamePhase, point, profile]);
  
  // ⏱️ Betting Timer - Single Player
  useEffect(() => {
    if (!bettingTimerActive) return;
    
    if (bettingTimer <= 0) {
      // Check if there are any bets placed
      const currentTotalBet = placedBets.reduce((sum, bet) => sum + bet.amount, 0);
      
      if (currentTotalBet === 0) {
        // No bets placed - reset timer and keep it running (don't lock)
        setBettingTimer(BETTING_TIMER_DURATION);
        // Timer stays active - bettingTimerActive remains true
        setMessage('⏱️ No bets placed. Timer continues...');
        return;
      }
      
      // Bets placed - lock betting and wait for roll
      setBettingLocked(true);
      setBettingTimerActive(false);
      setMessage('⏱️ Time expired! Roll the dice or place new bets.');
      return;
    }
    
    const interval = setInterval(() => {
      setBettingTimer(prev => {
        if (prev <= 1) {
          // Check if there are any bets placed
          const currentTotalBet = placedBets.reduce((sum, bet) => sum + bet.amount, 0);
          
          if (currentTotalBet === 0) {
            // No bets placed - reset timer and keep running
            setMessage('⏱️ No bets placed. Timer continues...');
            return BETTING_TIMER_DURATION; // Reset to 30
          }
          
          // Bets placed - lock betting
          setBettingLocked(true);
          setBettingTimerActive(false);
          setMessage('⏱️ Time expired! Roll the dice or place new bets.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [bettingTimer, bettingTimerActive, placedBets, BETTING_TIMER_DURATION]);
  
  // 🔒 Keyboard shortcut to open Security Dashboard (Ctrl+Shift+S)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        setShowSecurityDashboard(true);
        console.log('🔒 Security Dashboard opened via keyboard shortcut');
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleLogin = async (newProfile: { name: string; email: string; avatar?: string }) => {
    console.log('🔐 handleLogin called with profile:', newProfile);
    
    // Set profile immediately
    setProfile(newProfile);
    localStorage.setItem('rollers-paradise-profile', JSON.stringify(newProfile));
    console.log('✅ User profile saved - will persist across sessions');
    console.log('📍 Current gameMode:', gameMode);
    
    // Always transition to mode select after login
    console.log('⚠️ Transitioning to mode select screen');
    setGameMode('modeSelect');
    
    // 🔄 Sync XP boosts from server to ensure legitimacy
    console.log('⚡ Syncing XP boosts from server...');
    await syncBoostsWithServer(newProfile.email);
    
    // Load user data from cloud
    try {
      console.log('☁️ Loading user data from cloud...');
      const cloudData = await loadFromCloud(newProfile.email);
      
      if (cloudData) {
        console.log('✅ Cloud data loaded successfully!');
        // Restore game state from cloud
        if (cloudData.balance !== undefined) setBalance(cloudData.balance);
        if (cloudData.rollHistory) setRollHistory(cloudData.rollHistory);
        if (cloudData.gamePhase) setGamePhase(cloudData.gamePhase as GamePhase);
        if (cloudData.point !== undefined) setPoint(cloudData.point);
        if (cloudData.placedBets) setPlacedBets(cloudData.placedBets);
        
        // Show success message
        setMessage(`✅ Welcome back! Your progress has been restored from the cloud.`);
      } else {
        console.log('📂 No cloud data found - starting fresh');
        setMessage(`Place your bets to get started.`);
      }
    } catch (error) {
      console.error('❌ Error loading cloud data:', error);
      setMessage(`⚠️ Could not load cloud data. Using local progress.`);
    }
  };

  // Fetch balance from server
  const fetchBalanceFromServer = async (email: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/chips/balance/${encodeURIComponent(email)}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
      }
    } catch (error) {
      console.error('Failed to fetch balance from server:', error);
    }
  };

  // ⚡ OPTIMIZED: Debounced balance sync to prevent duplicate server calls
  // Only syncs after 2 seconds of no balance changes (prevents spam during rapid betting/winning)
  useEffect(() => {
    if (!profile?.email) return;
    
    // Debounce: Wait for balance changes to settle before syncing
    const syncTimer = setTimeout(async () => {
      console.log(`🔄 Debounced balance sync: $${balance} for ${profile.email}`);
      
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/chips/update-balance`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ 
              email: profile.email, 
              balance,
              timestamp: Date.now(),
              source: 'auto-sync'
            }),
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Balance synced successfully');
        }
      } catch (error) {
        console.error('❌ Balance sync failed:', error);
      }
    }, 2000); // Wait 2 seconds after last balance change
    
    return () => clearTimeout(syncTimer); // Cancel pending sync if balance changes again
  }, [balance, profile]);

  const handleBalanceUpdate = (newBalance: number) => {
    setBalance(newBalance);
  };

  // 🔒 ADMIN-ONLY: Special balance update for admin panel with server validation
  const handleAdminBalanceUpdate = async (newBalance: number) => {
    if (!profile || profile.email !== 'avgelatt@gmail.com') {
      console.error('🚨 UNAUTHORIZED: Only owner can use admin balance update!');
      setMessage('❌ Unauthorized: Admin access required');
      return;
    }

    setBalance(newBalance);
    
    // Sync to server with admin-panel source for validation
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/chips/update-balance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: profile.email,
            balance: newBalance,
            timestamp: Date.now(),
            source: 'admin-panel' // 🔒 CRITICAL: Server validates this is only from owner
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Admin balance update successful:', data);
        setMessage(`✅ Balance updated to $${newBalance.toLocaleString()}`);
      } else {
        const error = await response.json();
        console.error('❌ Admin balance update rejected:', error);
        setMessage('❌ Admin balance update failed - unauthorized');
      }
    } catch (error) {
      console.error('❌ Failed to sync admin balance update:', error);
    }
  };

  const handleLogout = async () => {
    const confirmed = await notification.showConfirm({
      title: 'Logout Confirmation',
      message: 'Are you sure you want to logout? Your progress is saved.',
      confirmText: 'Logout',
      cancelText: 'Stay',
      type: 'warning'
    });
    
    if (confirmed) {
      setProfile(null);
      localStorage.removeItem('rollers-paradise-profile');
      setMessage('Logged out successfully. Login to save your progress! 🌴');
    }
  };

  const totalBet = placedBets.reduce((sum, bet) => sum + bet.amount, 0);
  const minBet = 3;
  
  // Track totalBet changes for roll button state
  useEffect(() => {
    const canRoll = totalBet >= minBet;
    // Only log if there's an issue with the roll button
    if (totalBet > 0 && !canRoll) {
      console.log('⚠️ Insufficient bet:', { totalBet, minBet });
    }
  }, [totalBet, minBet]);
  
  // ⏱️ Betting timer countdown
  useEffect(() => {
    if (!bettingTimerActive) return;
    
    const interval = setInterval(() => {
      setBettingTimer((prev) => {
        if (prev <= 1) {
          // Timer expired - lock betting
          setBettingTimerActive(false);
          setBettingLocked(true);
          setMessage('⏰ Time expired! Roll the dice or clear your bets.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [bettingTimerActive]);
  
  // 🔒 EXPOSE VALIDATION HISTORY FOR DEBUGGING (Admin/Developer use)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).getValidationHistory = () => validationHistory;
      (window as any).exportValidations = () => {
        const { exportValidationHistory } = require('../utils/betValidator');
        const report = exportValidationHistory(validationHistory);
        console.log('📊 VALIDATION REPORT EXPORTED');
        console.log(report);
        return report;
      };
      (window as any).checkLastRoll = () => {
        if (validationHistory.length > 0) {
          const lastRoll = validationHistory[validationHistory.length - 1];
          logValidation(lastRoll);
          return lastRoll;
        }
        console.log('No rolls yet');
        return null;
      };
      
      console.log('✅ Debug commands available:');
      console.log('  - window.getValidationHistory() - Get all roll validations');
      console.log('  - window.exportValidations() - Export full validation report');
      console.log('  - window.checkLastRoll() - Verify last roll payouts');
    }
  }, [validationHistory]);

  const handlePlaceBet = (area: string) => {
    
    if (!isRolling && !buttonsLocked && !bettingLocked) {
      // SMART CHIP PLACEMENT - Use remaining balance if less than selected chip
      const actualChipAmount = Math.min(selectedChip, balance);
      
      if (balance < 1) {
        setMessage('❌ Insufficient balance! Visit the Casino Store to add more chips.');
        return;
      }

      // Calculate bet cost early (before any balance checks)
      // BUY BETS: Charge 5% commission upfront
      let betCost = actualChipAmount;
      if (area.startsWith('buy')) {
        const commission = Math.ceil(actualChipAmount * 0.05); // 5% vig, rounded up
        betCost = actualChipAmount + commission;
      }

      // STRICT: Prevent negative balance
      if (balance < betCost) {
        if (area.startsWith('buy')) {
          const commission = Math.ceil(actualChipAmount * 0.05);
          setMessage(`❌ Buy bet requires $${actualChipAmount} + $${commission} commission = $${betCost} total!`);
        } else {
          setMessage(`❌ Insufficient balance! You need $${betCost.toFixed(2)} but only have $${balance.toFixed(2)}`);
        }
        return;
      }
      
      // BONUS BETS: Hardways and one-roll bets CAN be placed anytime!
      // They are working bets regardless of game phase (unlike traditional craps)
      // No restrictions needed here
      
      // STRICT RULE: Small, Tall, All only on come-out roll
      if ((area === 'small' || area === 'tall' || area === 'all') && gamePhase !== 'comeOut') {
        setMessage('❌ Small/Tall/All bets can only be placed on COME OUT ROLL!');
        return;
      }
      
      // STRICT RULE: Pass Line only on come-out roll
      if (area === 'passLine' && gamePhase !== 'comeOut') {
        setMessage('❌ Pass Line bets can only be placed on COME OUT ROLL!');
        return;
      }
      
      // STRICT RULE: Odds only during point phase
      if (area === 'passLineOdds' && gamePhase !== 'point') {
        setMessage('❌ Odds can only be placed when there is a POINT!');
        return;
      }
      
      // STRICT RULE: Check odds limits
      if (area === 'passLineOdds' && point) {
        const passLineBet = placedBets.find(b => b.area === 'passLine');
        if (!passLineBet) {
          setMessage('❌ You must have a Pass Line bet to place Odds!');
          return;
        }
        
        const currentOdds = placedBets.find(b => b.area === 'passLineOdds');
        const currentOddsAmount = currentOdds ? currentOdds.amount : 0;
        const maxOdds = getMaxOdds(point, passLineBet.amount);
        
        if (currentOddsAmount + actualChipAmount > maxOdds) {
          setMessage(`❌ Maximum odds for point ${point} is ${maxOdds}x = $${maxOdds}!`);
          return;
        }
      }
      
      // STRICT RULE: Come Odds can only be placed if there's a Come bet on that number
      if (area.startsWith('comeOdds')) {
        const comeNumber = parseInt(area.replace('comeOdds', ''));
        const comeBetOnNumber = placedBets.find(b => b.area === 'come' && b.comePoint === comeNumber);
        
        console.log(`🎲 COME ODDS: Attempting to place $${actualChipAmount} odds on number ${comeNumber}`);
        console.log(`   Come bet on ${comeNumber}: ${comeBetOnNumber ? `$${comeBetOnNumber.amount}` : 'NOT FOUND'}`);
        
        if (!comeBetOnNumber) {
          setMessage(`❌ You must have a Come bet on ${comeNumber} to place Come Odds!`);
          console.log(`   ❌ No come bet found on ${comeNumber} - odds placement blocked`);
          return;
        }
        
        // Check come odds limits (typically 3x, 4x, 5x based on number)
        const currentComeOdds = placedBets.find(b => b.area === area);
        const currentComeOddsAmount = currentComeOdds ? currentComeOdds.amount : 0;
        const maxComeOdds = getMaxOdds(comeNumber, comeBetOnNumber.amount);
        
        console.log(`   Current odds: $${currentComeOddsAmount}, Max allowed: $${maxComeOdds}`);
        
        if (currentComeOddsAmount + actualChipAmount > maxComeOdds) {
          setMessage(`❌ Maximum Come Odds for ${comeNumber} is ${maxComeOdds / comeBetOnNumber.amount}x = $${maxComeOdds}!`);
          console.log(`   ❌ Odds limit exceeded - max is ${maxComeOdds / comeBetOnNumber.amount}x`);
          return;
        }
        
        console.log(`   ✅ Come odds placement allowed`);
      }
      
      // 💰 DEDUCT BET COST FROM BALANCE - LOGGED FOR TRANSPARENCY
      const balanceBeforeBet = balance;
      setBalance(prev => prev - betCost);
      console.log(`💰 BET PLACED: ${area} - $${actualChipAmount}${betCost > actualChipAmount ? ` (+$${betCost - actualChipAmount} commission)` : ''}`);
      console.log(`   Balance: $${balanceBeforeBet.toFixed(2)} → $${(balanceBeforeBet - betCost).toFixed(2)}`);
      
      // SPECIAL HANDLING FOR COME BETS - Allow multiple come bets
      if (area === 'come') {
        // Check if there's a come bet that hasn't traveled yet (no comePoint)
        const unplacedComeBet = placedBets.find(b => b.area === 'come' && !b.comePoint);
        
        if (unplacedComeBet) {
          // Add to the existing unplaced come bet
          console.log(`🎲 COME BET: Adding $${actualChipAmount} to existing come bet (now $${unplacedComeBet.amount + actualChipAmount})`);
          setPlacedBets(placedBets.map(b => 
            (b.area === 'come' && !b.comePoint) ? { ...b, amount: b.amount + actualChipAmount } : b
          ));
          // Track this addition in bet history
          setBetHistory(prev => [...prev, { area, amount: actualChipAmount }]);
        } else {
          // Create a new come bet (all previous ones have traveled)
          console.log(`🎲 COME BET: New come bet placed for $${actualChipAmount} in COME area`);
          setPlacedBets([...placedBets, { area, amount: actualChipAmount }]);
          // Track in bet history
          setBetHistory(prev => [...prev, { area, amount: actualChipAmount }]);
        }
      } else {
        // Normal bet handling for all other bet types
        const existingBet = placedBets.find(b => b.area === area);
        if (existingBet) {
          const newBets = placedBets.map(b => 
            b.area === area ? { ...b, amount: b.amount + actualChipAmount } : b
          );
          setPlacedBets(newBets);
          
          // 💰 LOG BET ADDITION FOR TRANSPARENCY
          console.log(`💰 BET ADDED: ${area} +$${actualChipAmount} (Total: $${existingBet.amount + actualChipAmount})`);
          
          // Track this addition in bet history
          setBetHistory(prev => [...prev, { area, amount: actualChipAmount }]);
        } else {
          const newBets = [...placedBets, { area, amount: actualChipAmount }];
          setPlacedBets(newBets);
          
          // 💰 LOG NEW BET FOR TRANSPARENCY
          console.log(`💰 NEW BET PLACED: ${area} - $${actualChipAmount}`);
          
          // Track in bet history
          setBetHistory(prev => [...prev, { area, amount: actualChipAmount }]);
          
          // Activate Small/Tall/All tracking
          if (area === 'small') setSmallActive(true);
          if (area === 'tall') setTallActive(true);
          if (area === 'all') setAllActive(true);
        }
      }
      
      // Track high roller achievement
      if (actualChipAmount >= 100) {
        setAchievements(prev => prev.map(ach => 
          ach.id === 'high_roller' ? { ...ach, progress: 1, unlocked: true } : ach
        ));
      }
      
      // ⏱️ Start betting timer on first bet
      if (placedBets.length === 0 && !bettingTimerActive) {
        setBettingTimer(BETTING_TIMER_DURATION);
        setBettingTimerActive(true);
        setBettingLocked(false);
      }
      
      // XP IS NOW AWARDED WHEN DICE ARE ROLLED (BETS LOCKED IN), NOT WHEN PLACING CHIPS
    }
  };

  const handleRemoveBet = (area: string) => {
    if (isRolling || buttonsLocked) return;
    
    // STRICT RULE: Cannot remove pass line bet after point is established
    if (area === 'passLine' && gamePhase === 'point') {
      setMessage('❌ Cannot remove Pass Line bet after point is established!');
      return;
    }
    
    // STRICT RULE: Cannot remove Small/Tall/All once placed
    if ((area === 'small' || area === 'tall' || area === 'all') && gamePhase === 'point') {
      setMessage('❌ Cannot remove Small/Tall/All bets once play has started!');
      return;
    }
    
    // STRICT RULE: Cannot remove COME bets that have traveled to a number (have comePoint)
    if (area === 'come') {
      // Only try to remove come bets that are still in the COME area (no comePoint)
      const unplacedComeBet = placedBets.find(b => b.area === 'come' && !b.comePoint);
      if (!unplacedComeBet) {
        setMessage('❌ No Come bet in the COME area to remove!');
        return;
      }
      // We'll remove from the unplaced come bet specifically below
    }
    
    const existingBet = placedBets.find(b => {
      if (area === 'come') {
        // For come bets, only find the one without a comePoint
        return b.area === area && !b.comePoint;
      }
      return b.area === area;
    });
    if (existingBet) {
      // PARTIAL CHIP REMOVAL - Remove only selected chip amount, not entire bet
      const removeAmount = Math.min(selectedChip, existingBet.amount);
      const newBetAmount = existingBet.amount - removeAmount;
      
      // 💰 RETURN BET TO BALANCE - LOGGED FOR TRANSPARENCY
      const balanceBeforeRefund = balance;
      setBalance(prev => prev + removeAmount);
      console.log(`💰 BET REMOVED: ${area} - Refund $${removeAmount}`);
      console.log(`   Balance: $${balanceBeforeRefund.toFixed(2)} → $${(balanceBeforeRefund + removeAmount).toFixed(2)}`);
      
      if (newBetAmount <= 0) {
        // Remove bet completely if nothing left
        setPlacedBets(placedBets.filter(b => b.area !== area));
        
        if (gamePhase === 'comeOut') {
          if (area === 'small') {
            setSmallActive(false);
            setSmallHit([]);
          }
          if (area === 'tall') {
            setTallActive(false);
            setTallHit([]);
          }
          if (area === 'all') {
            setAllActive(false);
            setAllHit([]);
          }
        }
      } else {
        // Keep bet with reduced amount
        setPlacedBets(placedBets.map(b => 
          b.area === area ? { ...b, amount: newBetAmount } : b
        ));
      }
    }
  };

  // BET ACROSS: Place bets on all place/buy numbers
  const handleBetAcross = () => {
    if (isRolling || buttonsLocked) return;
    
    // Numbers to bet on: 4, 5, 6, 8, 9, 10
    // Use buy for 4, 10 and place for 5, 6, 8, 9
    const acrossNumbers = ['buy4', 'place5', 'place6', 'place8', 'place9', 'buy10'];
    
    // Use smart chip amount (remaining balance if less than selected chip)
    const actualChipAmount = Math.min(selectedChip, balance);
    
    // Calculate total cost
    let totalCost = 0;
    for (const area of acrossNumbers) {
      let betCost = actualChipAmount;
      if (area.startsWith('buy')) {
        const commission = Math.ceil(actualChipAmount * 0.05);
        betCost = actualChipAmount + commission;
      }
      totalCost += betCost;
    }
    
    // Check if player has enough balance
    if (balance < totalCost) {
      setMessage(`❌ Not enough balance to bet across!\n\nNeed: $${totalCost.toFixed(2)}\nHave: $${balance.toFixed(2)}\nShort: $${(totalCost - balance).toFixed(2)}`);
      return;
    }
    
    // Place all bets
    let updatedBalance = balance;
    const updatedBets = [...placedBets];
    
    for (const area of acrossNumbers) {
      let betCost = actualChipAmount;
      if (area.startsWith('buy')) {
        const commission = Math.ceil(actualChipAmount * 0.05);
        betCost = actualChipAmount + commission;
      }
      
      updatedBalance -= betCost;
      
      const existingBet = updatedBets.find(b => b.area === area);
      if (existingBet) {
        existingBet.amount += actualChipAmount;
      } else {
        updatedBets.push({ area, amount: actualChipAmount });
      }
    }
    
    // 💰 UPDATE BALANCE AND BETS
    console.log(`💰 BET ACROSS: $${actualChipAmount} on each number (Total cost: $${totalCost})`);
    console.log(`   Balance: $${balance.toFixed(2)} → $${updatedBalance.toFixed(2)}`);
    
    setBalance(updatedBalance);
    setPlacedBets(updatedBets);
    setMessage(`✅ Bet $${actualChipAmount} across all numbers! Total: $${totalCost}`);
  };

  const handleClearBets = () => {
    if (!isRolling && !buttonsLocked) {
      // Can only clear certain bets during point phase
      if (gamePhase === 'point') {
        // Return money for bets that CAN be removed
        let returnAmount = 0;
        const betsToKeep: PlacedBet[] = [];
        
        placedBets.forEach(bet => {
          if (bet.area === 'passLine' || bet.area === 'small' || bet.area === 'tall' || bet.area === 'all') {
            // Keep these bets
            betsToKeep.push(bet);
          } else {
            // Return these bets
            returnAmount += bet.amount;
          }
        });
        
        // 💰 RETURN CLEARED BETS - LOGGED FOR TRANSPARENCY
        const balanceBeforeClear = balance;
        setBalance(prev => prev + returnAmount);
        setPlacedBets(betsToKeep);
        console.log(`💰 BETS CLEARED: Refund $${returnAmount}`);
        console.log(`   Balance: $${balanceBeforeClear.toFixed(2)} → $${(balanceBeforeClear + returnAmount).toFixed(2)}`);
        setMessage('Cleared removable bets. Pass Line and Small/Tall/All stay in play.');
        
        // 🔄 Clear bet history since we cleared removable bets
        // Note: Locked bets (passLine, small, tall, all) cannot be undone anyway
        setBetHistory([]);
      } else {
        // Come-out roll - can clear everything
        const balanceBeforeClear = balance;
        setBalance(prev => prev + totalBet);
        console.log(`💰 ALL BETS CLEARED: Refund $${totalBet}`);
        console.log(`   Balance: $${balanceBeforeClear.toFixed(2)} → $${(balanceBeforeClear + totalBet).toFixed(2)}`);
        setPlacedBets([]);
        setSmallActive(false);
        setTallActive(false);
        setAllActive(false);
        setSmallHit([]);
        setTallHit([]);
        setAllHit([]);
        
        // ⏱️ Stop timer if all bets cleared
        setBettingTimer(BETTING_TIMER_DURATION);
        setBettingTimerActive(false);
        setBettingLocked(false);
        
        // 🔄 Clear bet history when all bets are cleared
        setBetHistory([]);
      }
    }
  };

  // 🔄 UNDO LAST BET - Removes most recent bet addition and returns money
  const handleUndoLastBet = () => {
    if (betHistory.length === 0 || isRolling || buttonsLocked || bettingLocked) {
      return;
    }

    // Get the most recent bet action from history
    const lastBetAction = betHistory[betHistory.length - 1];
    
    // Check if this bet can be undone (not locked)
    // During point phase, some bets are locked (passLine, small, tall, all)
    if (gamePhase === 'point') {
      if (lastBetAction.area === 'passLine' || 
          lastBetAction.area === 'small' || 
          lastBetAction.area === 'tall' || 
          lastBetAction.area === 'all') {
        setMessage('❌ Cannot undo locked bets (Pass Line, Small/Tall/All)');
        return;
      }
    }

    // Find the bet in placedBets
    const existingBet = placedBets.find(bet => bet.area === lastBetAction.area);
    
    if (!existingBet) {
      console.warn('⚠️ Could not find bet to undo:', lastBetAction);
      // Still remove from history even if bet not found
      setBetHistory(prev => prev.slice(0, -1));
      return;
    }

    // Remove the last bet action amount
    const balanceBeforeUndo = balance;
    const undoAmount = lastBetAction.amount;
    
    if (existingBet.amount === undoAmount) {
      // Remove the entire bet if it equals the undo amount
      const newPlacedBets = placedBets.filter(bet => bet.area !== lastBetAction.area);
      setPlacedBets(newPlacedBets);
      
      // Deactivate Small/Tall/All tracking if needed
      if (lastBetAction.area === 'small') setSmallActive(false);
      if (lastBetAction.area === 'tall') setTallActive(false);
      if (lastBetAction.area === 'all') setAllActive(false);
    } else {
      // Reduce the bet amount
      const newPlacedBets = placedBets.map(bet => 
        bet.area === lastBetAction.area 
          ? { ...bet, amount: bet.amount - undoAmount }
          : bet
      );
      setPlacedBets(newPlacedBets);
    }
    
    // Return money to balance
    setBalance(prev => prev + undoAmount);
    
    // Remove from bet history
    setBetHistory(prev => prev.slice(0, -1));
    
    console.log(`🔄 UNDO BET: $${undoAmount} on ${lastBetAction.area}`);
    console.log(`   Balance: $${balanceBeforeUndo.toFixed(2)} → $${(balanceBeforeUndo + undoAmount).toFixed(2)}`);
    setMessage(`↩️ Undone: $${undoAmount} on ${lastBetAction.area}`);
    
    // ⏱️ Stop timer if all bets are now cleared
    if (placedBets.length === 1 && existingBet.amount === undoAmount) {
      setBettingTimer(BETTING_TIMER_DURATION);
      setBettingTimerActive(false);
      setBettingLocked(false);
    }
  };

  // 🔄 REPEAT BETS - Restore bets from before point was established
  const handleRepeatBets = () => {
    if (lastComeOutBets.length === 0 || isRolling || buttonsLocked || bettingLocked) {
      return;
    }

    // Calculate total cost of repeating bets
    const totalCost = lastComeOutBets.reduce((sum, bet) => sum + bet.amount, 0);

    // Check if player has enough balance
    if (balance < totalCost) {
      setMessage(`❌ Insufficient balance! Need $${totalCost}, have $${balance}`);
      return;
    }

    // Restore the bets
    setPlacedBets([...lastComeOutBets]);
    setBalance(prev => prev - totalCost);
    
    // Restore bet history
    const newHistory = lastComeOutBets.map(bet => ({
      area: bet.area,
      amount: bet.amount,
      x: bet.x,
      y: bet.y,
      comePoint: bet.comePoint,
    }));
    setBetHistory(newHistory);
    
    // Re-activate Small/Tall/All if they were in the repeated bets
    lastComeOutBets.forEach(bet => {
      if (bet.area === 'small') setSmallActive(true);
      if (bet.area === 'tall') setTallActive(true);
      if (bet.area === 'all') setAllActive(true);
    });
    
    // Hide the repeat button
    setShowRepeatButton(false);
    
    console.log(`🔄 REPEAT BETS: Restored ${lastComeOutBets.length} bets totaling $${totalCost}`);
    setMessage(`🔄 Repeated ${lastComeOutBets.length} bets! Total: $${totalCost}`);
  };

  const handleRepeatLastBet = () => {
    if (!isRolling && !buttonsLocked && lastBetConfiguration.length > 0) {
      // Calculate total cost of repeating bets
      let totalCost = 0;
      const validBets: PlacedBet[] = [];
      
      lastBetConfiguration.forEach(bet => {
        let betCost = bet.amount;
        
        // Add commission for buy bets
        if (bet.area.startsWith('buy')) {
          const commission = Math.ceil(bet.amount * 0.05);
          betCost = bet.amount + commission;
        }
        
        totalCost += betCost;
        validBets.push({ ...bet });
      });
      
      // Check if we have enough balance
      if (balance < totalCost) {
        setMessage(`❌ Insufficient balance! Need $${totalCost.toFixed(2)} to repeat last bet.`);
        return;
      }
      
      // Place all the bets
      setBalance(prev => prev - totalCost);
      setPlacedBets(prev => [...prev, ...validBets]);
      setMessage(`✅ Repeated last bet! Total: $${totalCost.toFixed(2)}`);
    }
  };

  const handleDoubleLastBet = () => {
    if (!isRolling && !buttonsLocked && lastBetConfiguration.length > 0) {
      // Calculate total cost of doubling bets
      let totalCost = 0;
      const validBets: PlacedBet[] = [];
      
      lastBetConfiguration.forEach(bet => {
        const doubledAmount = bet.amount * 2;
        let betCost = doubledAmount;
        
        // Add commission for buy bets
        if (bet.area.startsWith('buy')) {
          const commission = Math.ceil(doubledAmount * 0.05);
          betCost = doubledAmount + commission;
        }
        
        totalCost += betCost;
        validBets.push({ ...bet, amount: doubledAmount });
      });
      
      // Check if we have enough balance
      if (balance < totalCost) {
        setMessage(`❌ Insufficient balance! Need $${totalCost.toFixed(2)} to double last bet.`);
        return;
      }
      
      // Place all the doubled bets
      setBalance(prev => prev - totalCost);
      setPlacedBets(prev => [...prev, ...validBets]);
      setMessage(`✅ Doubled last bet! Total: $${totalCost.toFixed(2)}`);
    }
  };

  const getMaxOdds = (point: number, passLineAmount: number) => {
    // Crapless craps odds limits
    // Extreme points (2, 3, 11, 12) - 2x odds
    // Hard points (4, 10) - 3x odds
    // Easy points (5, 9) - 4x odds
    // Six/Eight (6, 8) - 5x odds
    switch (point) {
      case 2:
      case 3:
      case 11:
      case 12:
        return passLineAmount * 2; // 2x
      case 4:
      case 10:
        return passLineAmount * 3; // 3x
      case 5:
      case 9:
        return passLineAmount * 4; // 4x
      case 6:
      case 8:
        return passLineAmount * 5; // 5x
      default:
        return passLineAmount * 3;
    }
  };

  // Calculate which numbers are active (can win) based on current bets
  const calculateActiveNumbers = (): number[] => {
    const activeNumbers = new Set<number>();

    placedBets.forEach(bet => {
      // Handle come bets with comePoint first
      if (bet.area === 'come' && bet.comePoint) {
        activeNumbers.add(bet.comePoint);
        return; // Skip the switch for this bet
      }

      switch (bet.area) {
        // Pass Line
        case 'passLine':
        case 'passLineOdds':
          if (gamePhase === 'comeOut') {
            activeNumbers.add(7); // Only 7 wins on come-out in crapless craps
          } else if (point) {
            activeNumbers.add(point); // Point number wins
          }
          break;

        // Come bets
        case 'come':
          activeNumbers.add(7); // Come bets in COME area - only 7 wins
          break;
        
        // Come bets on numbers - these are handled via comePoint property, not separate areas
        // So we don't need individual cases here

        // Come odds
        case 'comeOdds2': activeNumbers.add(2); break;
        case 'comeOdds3': activeNumbers.add(3); break;
        case 'comeOdds4': activeNumbers.add(4); break;
        case 'comeOdds5': activeNumbers.add(5); break;
        case 'comeOdds6': activeNumbers.add(6); break;
        case 'comeOdds8': activeNumbers.add(8); break;
        case 'comeOdds9': activeNumbers.add(9); break;
        case 'comeOdds10': activeNumbers.add(10); break;
        case 'comeOdds11': activeNumbers.add(11); break;
        case 'comeOdds12': activeNumbers.add(12); break;

        // Field
        case 'field':
          [2, 3, 4, 9, 10, 11, 12].forEach(n => activeNumbers.add(n));
          break;

        // Place/Buy bets (matching actual bet area names from CrapsTable)
        case 'place2':
        case 'buy2':
        case 'place-2':
        case 'buy-2':
          activeNumbers.add(2);
          break;
        case 'place3':
        case 'buy3':
        case 'place-3':
        case 'buy-3':
          activeNumbers.add(3);
          break;
        case 'place4':
        case 'buy4':
        case 'place-4':
        case 'buy-4':
          activeNumbers.add(4);
          break;
        case 'place5':
        case 'buy5':
        case 'place-5':
        case 'buy-5':
          activeNumbers.add(5);
          break;
        case 'six': // Special case - SIX
        case 'place6':
        case 'buy6':
        case 'place-6':
        case 'buy-6':
          activeNumbers.add(6);
          break;
        case 'eight': // Special case - EIGHT
        case 'place8':
        case 'buy8':
        case 'place-8':
        case 'buy-8':
          activeNumbers.add(8);
          break;
        case 'nine': // Special case - NINE
        case 'place9':
        case 'buy9':
        case 'place-9':
        case 'buy-9':
          activeNumbers.add(9);
          break;
        case 'place10':
        case 'buy10':
        case 'place-10':
        case 'buy-10':
          activeNumbers.add(10);
          break;
        case 'place11':
        case 'buy11':
        case 'place-11':
        case 'buy-11':
          activeNumbers.add(11);
          break;
        case 'place12':
        case 'buy12':
        case 'place-12':
        case 'buy-12':
          activeNumbers.add(12);
          break;

        // Hardways
        case 'hardway-4':
          activeNumbers.add(4);
          break;
        case 'hardway-6':
          activeNumbers.add(6);
          break;
        case 'hardway-8':
          activeNumbers.add(8);
          break;
        case 'hardway-10':
          activeNumbers.add(10);
          break;

        // Proposition bets
        case 'prop-2':
        case 'anyCraps': // 2, 3, 12
          activeNumbers.add(2);
          activeNumbers.add(3);
          activeNumbers.add(12);
          break;
        case 'prop-3':
          activeNumbers.add(3);
          break;
        case 'prop-11':
          activeNumbers.add(11);
          break;
        case 'prop-12':
          activeNumbers.add(12);
          break;
        case 'any7':
          activeNumbers.add(7);
          break;

        // C&E
        case 'c':
          activeNumbers.add(2);
          activeNumbers.add(3);
          activeNumbers.add(12);
          break;
        case 'e':
          activeNumbers.add(11);
          break;

        // Hop bets (any two-dice combination)
        case 'hop-1-1': activeNumbers.add(2); break;
        case 'hop-1-2': activeNumbers.add(3); break;
        case 'hop-2-2': activeNumbers.add(4); break;
        case 'hop-1-3': activeNumbers.add(4); break;
        case 'hop-2-3': activeNumbers.add(5); break;
        case 'hop-1-4': activeNumbers.add(5); break;
        case 'hop-3-3': activeNumbers.add(6); break;
        case 'hop-2-4': activeNumbers.add(6); break;
        case 'hop-1-5': activeNumbers.add(6); break;
        case 'hop-3-4': activeNumbers.add(7); break;
        case 'hop-2-5': activeNumbers.add(7); break;
        case 'hop-1-6': activeNumbers.add(7); break;
        case 'hop-4-4': activeNumbers.add(8); break;
        case 'hop-3-5': activeNumbers.add(8); break;
        case 'hop-2-6': activeNumbers.add(8); break;
        case 'hop-4-5': activeNumbers.add(9); break;
        case 'hop-3-6': activeNumbers.add(9); break;
        case 'hop-5-5': activeNumbers.add(10); break;
        case 'hop-4-6': activeNumbers.add(10); break;
        case 'hop-5-6': activeNumbers.add(11); break;
        case 'hop-6-6': activeNumbers.add(12); break;

        // Small/Tall/All bets - EXCLUDED from Win/Lose indicator (user preference)
        // These are long-term accumulation bets, not instant win/lose numbers
        case 'small': // 2, 3, 4, 5, 6
        case 'tall': // 8, 9, 10, 11, 12
        case 'all': // 2-6 and 8-12
          // Intentionally not adding numbers - excluded from Win/Lose tool
          break;
      }
    });

    return Array.from(activeNumbers).sort((a, b) => a - b);
  };

  // Calculate which numbers would make you WIN (GREEN)
  const calculateWinningNumbers = (): number[] => {
    return calculateActiveNumbers(); // Same as active numbers for now
  };

  // Calculate which numbers would make you LOSE (RED)
  const calculateLosingNumbers = (): number[] => {
    const losingNumbers = new Set<number>();

    placedBets.forEach(bet => {
      // Handle come bets with comePoint
      if (bet.area === 'come' && bet.comePoint) {
        losingNumbers.add(7); // Seven-out loses come bets on numbers
        return;
      }

      switch (bet.area) {
        // Pass Line with point established
        case 'passLine':
        case 'passLineOdds':
          if (gamePhase === 'point' && point) {
            losingNumbers.add(7); // Seven-out loses
          }
          break;

        // Come odds (seven-out loses)
        case 'comeOdds2':
        case 'comeOdds3':
        case 'comeOdds4':
        case 'comeOdds5':
        case 'comeOdds6':
        case 'comeOdds8':
        case 'comeOdds9':
        case 'comeOdds10':
        case 'comeOdds11':
        case 'comeOdds12':
          losingNumbers.add(7);
          break;

        // Field loses on 5, 6, 7, 8
        case 'field':
          [5, 6, 7, 8].forEach(n => losingNumbers.add(n));
          break;

        // Place/Buy bets lose on 7
        case 'place2':
        case 'buy2':
        case 'place-2':
        case 'buy-2':
        case 'place3':
        case 'buy3':
        case 'place-3':
        case 'buy-3':
        case 'place4':
        case 'buy4':
        case 'place-4':
        case 'buy-4':
        case 'place5':
        case 'buy5':
        case 'place-5':
        case 'buy-5':
        case 'six':
        case 'place6':
        case 'buy6':
        case 'place-6':
        case 'buy-6':
        case 'eight':
        case 'place8':
        case 'buy8':
        case 'place-8':
        case 'buy-8':
        case 'nine':
        case 'place9':
        case 'buy9':
        case 'place-9':
        case 'buy-9':
        case 'place10':
        case 'buy10':
        case 'place-10':
        case 'buy-10':
        case 'place11':
        case 'buy11':
        case 'place-11':
        case 'buy-11':
        case 'place12':
        case 'buy12':
        case 'place-12':
        case 'buy-12':
          losingNumbers.add(7);
          break;

        // Hardways lose on 7
        case 'hardway-4':
        case 'hardway-6':
        case 'hardway-8':
        case 'hardway-10':
          losingNumbers.add(7);
          break;
      }
    });

    return Array.from(losingNumbers).sort((a, b) => a - b);
  };

  // Show win/loss amount popup animation
  const showWinPopup = (amount: number, isLoss = false, betArea?: string) => {
    if (amount === 0) return;
    
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    
    // Try to find the chip element for this bet area and position popup on it
    if (betArea) {
      const chipElement = document.querySelector(`[data-bet-area="${betArea}"]`);
      if (chipElement) {
        const rect = chipElement.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      }
    }
    
    // Add small random offset to avoid exact overlap for multiple wins
    x += (Math.random() - 0.5) * 40;
    y += (Math.random() - 0.5) * 40;
    
    const id = `${Date.now()}-${Math.random()}`;
    setWinPopups(prev => [...prev, { id, amount, x, y, isLoss, betArea }]);
  };
  
  const removeWinPopup = (id: string) => {
    setWinPopups(prev => prev.filter(popup => popup.id !== id));
  };

  const handleRoll = () => {
    console.log('🎲 handleRoll called', {
      totalBet,
      minBet,
      isRolling,
      buttonsLocked,
      bettingLocked,
      balance,
      placedBetsCount: placedBets.length
    });
    
    // 🔒 SECURITY: Rate limit rolls (prevent spam/bots)
    if (!Security.checkRateLimit('dice-roll', 120)) {
      console.log('❌ Roll blocked: Rate limit');
      setMessage('⚠️ Please slow down! Maximum 120 rolls per minute.');
      return;
    }
    
    // 🔒 SECURITY: Validate minimum bet
    if (totalBet < minBet) {
      console.log('❌ Roll blocked: Insufficient bet', { totalBet, minBet });
      setMessage(`⚠️ Minimum bet is $${minBet.toFixed(2)}`);
      return;
    }
    
    // NOTE: Balance validation removed - balance is deducted when bets are placed,
    // so checking balance >= totalBet would fail when bets remain on table from previous rolls
    
    if (totalBet >= minBet && !isRolling) {
      console.log('✅ Roll validation passed - executing roll');
      // GET THE FINAL SECURE ROLL FIRST
      const secureRoll = rollDice();
      
      // 🔒 SECURITY: Validate dice roll
      if (!Security.validateDiceRoll(secureRoll.dice1, secureRoll.dice2, Date.now())) {
        console.error('🚨 Invalid dice roll detected!');
        Security.logSecurityEvent('INVALID_DICE_ROLL', secureRoll);
        setMessage('⚠️ Error processing roll. Please try again.');
        return;
      }
      
      // LOCK ALL BUTTONS - No betting during roll
      setButtonsLocked(true);
      
      // 🔄 Clear bet history once dice are rolled (bets are now locked in)
      setBetHistory([]);
      
      // 🎙️ DEALER VOICE: Announce coming out roll
      if (gamePhase === 'comeOut') {
        dealerVoice.announceComingOut();
      }
      
      // Set isRolling to true for animation
      setIsRolling(true);
      
      // Set the dice values immediately so DiceInGlass can use them
      setDice1(secureRoll.dice1);
      setDice2(secureRoll.dice2);
      
      // Track bet amounts
      setLastBet(totalBet);
      setLastWin(0);
      // Save bet configuration for DOUBLE/REPEAT functionality
      setLastBetConfiguration([...placedBets]);
      
      // AWARD XP FOR LOCKED-IN BETS (1:1 TRANSPARENT RATE - $1 bet = 1 XP)
      const xpEarned = Math.floor(totalBet);
      addXP(xpEarned, `Locked in $${totalBet.toFixed(2)} bet`);
      console.log(`💎 XP Awarded: ${xpEarned} XP for $${totalBet} locked-in bet (1:1 rate)`);

      // ⚡ QUICK ROLL MODE: Instant results with sound only (no animation delay)
      const animationDelay = settings.quickRollMode ? 100 : 1200;
      console.log(`🎲 Roll mode: ${settings.quickRollMode ? '⚡ QUICK (instant)' : '🎬 ANIMATED'}, delay: ${animationDelay}ms`);

      // Trigger flash effect for quick roll mode
      if (settings.quickRollMode) {
        setShowQuickRollFlash(true);
        setTimeout(() => setShowQuickRollFlash(false), 200);
        
        // Play quick "whoosh" sound effect
        if (settings.soundEffects) {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.15);
          
          gainNode.gain.setValueAtTime(0.3 * (settings.soundEffectsVolume / 100), audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.15);
        }
      }

      // Wait for animation to complete (or instant if quick mode)
      setTimeout(() => {
        // Add to history
        const isSevenOut = gamePhase === 'point' && secureRoll.total === 7;
        const newRoll: Roll = {
          dice1: secureRoll.dice1,
          dice2: secureRoll.dice2,
          total: secureRoll.total,
          timestamp: Date.now(),
          rollNumber: stats.totalRolls + 1, // Sequential roll number
          phase: gamePhase,
          point: point,
          wasSevenOut: isSevenOut
        };
        setRollHistory(prev => [newRoll, ...prev].slice(0, 100));
        
        console.log('🎯 PROCESSING TRUE ROLL RESULT:', secureRoll);
        
        // 🎙️ DEALER VOICE: Announce the number rolled (synced perfectly after dice stop)
        dealerVoice.announceNumber(secureRoll.total, secureRoll.dice1, secureRoll.dice2, gamePhase);
        
        // Process roll logic with error handling
        try {
          processRoll(secureRoll.dice1, secureRoll.dice2, secureRoll.total);
        } catch (error) {
          console.error('🚨 Error in processRoll:', error);
        }
        
        // ALWAYS unlock after roll, even if there was an error
        setIsRolling(false);
        setButtonsLocked(false);
        setBettingLocked(false);
        
        // ⏱️ Reset betting timer for next round
        setBettingTimer(BETTING_TIMER_DURATION);
        setBettingTimerActive(false);
        
        console.log('🔓 Roll complete - ready for next roll!', {
          isRolling: false,
          buttonsLocked: false,
          bettingLocked: false
        });
      }, animationDelay);
    }
  };

  const processRoll = (die1: number, die2: number, total: number) => {
    let totalWinnings = 0;
    const winningBets: Array<{ betName: string; winAmount: number; betArea?: string }> = []; // Track individual wins
    let newMessage = '';
    let dealerCallout = ''; // For voice announcements
    const betsToKeep: PlacedBet[] = [];
    const isHard = die1 === die2;

    // Determine dice combination names for callouts
    const getDiceCallout = (d1: number, d2: number, tot: number) => {
      if (isHard) {
        switch(tot) {
          case 2: return 'Snake Eyes!';
          case 4: return 'Hard Four!';
          case 6: return 'Hard Six!';
          case 8: return 'Hard Eight!';
          case 10: return 'Hard Ten!';
          case 12: return 'Boxcars!';
        }
      }
      // Easy way combinations
      switch(tot) {
        case 2: return 'Aces!';
        case 3: return 'Ace Deuce!';
        case 4: return 'Easy Four!';
        case 5: return d1 === 1 || d2 === 1 ? 'Fever!' : 'Five!';
        case 6: return 'Six!';
        case 7: return 'Seven!';
        case 8: return 'Eight!';
        case 9: return d1 === 6 || d2 === 6 ? 'Nina!' : 'Nine!';
        case 10: return 'Easy Ten!';
        case 11: return 'Yo-leven!';
        case 12: return 'Midnight!';
        default: return `${tot}!`;
      }
    };

    const baseDiceCall = getDiceCallout(die1, die2, total);

    // Track Small, Tall, All numbers (ALWAYS track if bets are active, regardless of game phase)
    // These bets work on every roll including come-out, but lose on 7 during point phase
    if (smallActive && [2, 3, 4, 5, 6].includes(total)) {
      setSmallHit(prev => {
        const newHits = [...new Set([...prev, total])];
        console.log(`📊 SMALL tracking: ${total} hit! Progress: [${newHits.join(', ')}] (need all of 2,3,4,5,6)`);
        // Check if all numbers hit
        if (newHits.length === 5 && [2, 3, 4, 5, 6].every(n => newHits.includes(n))) {
          const bet = placedBets.find(b => b.area === 'small');
          if (bet) {
            totalWinnings += bet.amount * 35; // 34:1 payout (return bet + 34x winnings)
            const winAmount = bet.amount * 34;
            newMessage += `🎉 SMALL COMPLETE! Won $${winAmount}! `;
            winningBets.push({ betName: 'Small', winAmount, betArea: 'small' });
            dealerCallout = 'Small winner! Pay the table!';
            setSmallActive(false);
            return [];
          }
        }
        return newHits;
      });
    }
    
    if (tallActive && [8, 9, 10, 11, 12].includes(total)) {
      setTallHit(prev => {
        const newHits = [...new Set([...prev, total])];
        console.log(`📊 TALL tracking: ${total} hit! Progress: [${newHits.join(', ')}] (need all of 8,9,10,11,12)`);
        // Check if all numbers hit
        if (newHits.length === 5 && [8, 9, 10, 11, 12].every(n => newHits.includes(n))) {
          const bet = placedBets.find(b => b.area === 'tall');
          if (bet) {
            totalWinnings += bet.amount * 35; // 34:1 payout
            const winAmount = bet.amount * 34;
            newMessage += `🎉 TALL COMPLETE! Won $${winAmount}! `;
            winningBets.push({ betName: 'Tall', winAmount, betArea: 'tall' });
            dealerCallout = 'Tall winner! Big money!';
            setTallActive(false);
            return [];
          }
        }
        return newHits;
      });
    }
    
    if (allActive && [2, 3, 4, 5, 6, 8, 9, 10, 11, 12].includes(total)) {
      setAllHit(prev => {
        const newHits = [...new Set([...prev, total])];
        console.log(`📊 ALL tracking: ${total} hit! Progress: [${newHits.join(', ')}] (need all 10 numbers)`);
        // Check if all numbers hit
        if (newHits.length === 10 && [2, 3, 4, 5, 6, 8, 9, 10, 11, 12].every(n => newHits.includes(n))) {
          const bet = placedBets.find(b => b.area === 'all');
          if (bet) {
            totalWinnings += bet.amount * 177; // 176:1 payout
            const winAmount = bet.amount * 176;
            newMessage += `🎉🎉 ALL COMPLETE! Won $${winAmount}! 🎉🎉 `;
            winningBets.push({ betName: 'All', winAmount, betArea: 'all' });
            dealerCallout = 'All winner! Jackpot! Pay the table!';
            setAllActive(false);
            return [];
          }
        }
        return newHits;
      });
    }

    // CRAPLESS CRAPS RULES
    if (gamePhase === 'comeOut') {
      // COME OUT ROLL
      if (total === 7) {
        // 7 wins on come out (natural winner)
        newMessage += `🎉 SEVEN WINNER! `;
        dealerCallout = `${baseDiceCall} Winner! Seven! Front line winner!`;
        
        // 🎙️ DEALER VOICE: Natural winner
        dealerVoice.announceNaturalWinner();
        
        placedBets.forEach(bet => {
          if (bet.area === 'passLine') {
            // Pass line wins 1:1 - return original bet + winnings
            totalWinnings += bet.amount * 2; // Return bet ($X) + winnings ($X) = $2X
            const winAmount = bet.amount;
            newMessage += `Pass Line wins $${winAmount}! `;
            winningBets.push({ betName: 'Pass Line', winAmount, betArea: 'passLine' });
            // Bet is cleared after win (user can place new bet)
          }
          // Small/Tall/All lose on 7
          if (bet.area === 'small') {
            newMessage += `Small loses. `;
            setSmallActive(false);
            setSmallHit([]);
          }
          if (bet.area === 'tall') {
            newMessage += `Tall loses. `;
            setTallActive(false);
            setTallHit([]);
          }
          if (bet.area === 'all') {
            newMessage += `All loses. `;
            setAllActive(false);
            setAllHit([]);
          }
        });
        // Stay on come out roll
      } else {
        // Any other number becomes the point (2,3,4,5,6,8,9,10,11,12)
        setPoint(total);
        setPuckPosition(total);
        setGamePhase('point');
        
        // 💾 Save current bets for optional repeat after 7-out
        setLastComeOutBets([...placedBets]);
        setShowRepeatButton(false);
        
        // 🎙️ DEALER VOICE: Point established
        dealerVoice.announcePointEstablished(total);
        
        // Automatically activate bonus bets when point is established
        setBonusBetsWorking(true);
        
        // Authentic point establishment callouts
        switch(total) {
          case 2:
          case 12:
            dealerCallout = `${baseDiceCall} Point is ${total}! Hard way to make it!`;
            break;
          case 3:
          case 11:
            dealerCallout = `${baseDiceCall} Point is ${total}! Mark the ${total}!`;
            break;
          case 4:
            dealerCallout = isHard ? 'Hard Four! Point is four!' : 'Easy Four! Point is four!';
            break;
          case 5:
            dealerCallout = 'Fever Five! Point is five! No field five!';
            break;
          case 6:
            dealerCallout = 'Six! Point is six! Six came easy!';
            break;
          case 8:
            dealerCallout = isHard ? 'Hard Eight! Point is eight!' : 'Easy Eight! Point is eight!';
            break;
          case 9:
            dealerCallout = 'Nina! Point is nine! Center field nine!';
            break;
          case 10:
            dealerCallout = isHard ? 'Hard Ten! Point is ten!' : 'Easy Ten! Point is ten!';
            break;
          default:
            dealerCallout = `Point is ${total}!`;
        }
        
        newMessage += `Point is ${total}. Roll ${total} again to win! You can now place ODDS.`;
        
        // Keep pass line bets (they stay in action)
        placedBets.forEach(bet => {
          if (bet.area === 'passLine' || bet.area === 'small' || bet.area === 'tall' || bet.area === 'all') {
            betsToKeep.push(bet);
          }
        });
      }
    } else {
      // POINT PHASE
      if (total === point) {
        // Point made - WIN!
        newMessage += `🎉 POINT ${total} WINNER! `;
        dealerCallout = `${baseDiceCall} ${total} came! Winner! Front line winner! Pay the line!`;
        
        // 🎙️ DEALER VOICE: Point made!
        dealerVoice.announcePointMade(point);
        
        placedBets.forEach(bet => {
          if (bet.area === 'passLine') {
            // Pass line wins 1:1 - return original bet + winnings
            totalWinnings += bet.amount * 2; // Return bet ($X) + winnings ($X) = $2X
            const winAmount = bet.amount;
            newMessage += `Pass Line wins $${winAmount}! `;
            winningBets.push({ betName: 'Pass Line', winAmount, betArea: 'passLine' });
            // Bet is cleared after win
          }
          if (bet.area === 'passLineOdds') {
            // Calculate odds payout based on point
            const oddsMultiplier = getOddsMultiplier(point!);
            const oddsWin = bet.amount * oddsMultiplier;
            totalWinnings += bet.amount + oddsWin; // Return bet + winnings
            newMessage += `Odds win $${oddsWin.toFixed(2)}! `;
            winningBets.push({ betName: 'Pass Line Odds', winAmount: oddsWin, betArea: 'passLineOdds' });
            // Odds bet is cleared after win
          }
          // Keep Small/Tall/All bets active (they continue across multiple rolls)
          if (bet.area === 'small' || bet.area === 'tall' || bet.area === 'all') {
            betsToKeep.push(bet);
          }
        });
        
        // Reset to come out
        setPoint(null);
        setPuckPosition(null);
        setGamePhase('comeOut');
        
        // Reset bonus bets to OFF when returning to come out roll
        setBonusBetsWorking(false);
        
        // After a short delay, prompt user for next roll
        setTimeout(() => {
          if (betsToKeep.length > 0) {
            setMessage('Roll for the come out! Pass Line is still in action.');
          } else {
            setMessage('Place your bets for the come out roll!');
          }
        }, 3000);
      } else if (total === 7) {
        // Seven out - ALL BETS LOSE (including Small/Tall/All)
        newMessage += `❌ SEVEN OUT! Point was ${point}. All bets lose.`;
        dealerCallout = `Seven out! Line away! Pay the don'ts!`;
        
        // 🎙️ DEALER VOICE: Seven out!
        dealerVoice.announceSevenOut();
        
        // Clear Small/Tall/All tracking
        setSmallActive(false);
        setTallActive(false);
        setAllActive(false);
        setSmallHit([]);
        setTallHit([]);
        setAllHit([]);
        
        // 🗑️ ALL bets cleared on 7-out (already deducted)
        setPoint(null);
        setPuckPosition(null);
        setGamePhase('comeOut');
        setPlacedBets([]);
        setLastWin(0);
        setMessage(newMessage);
        setBalance(prev => prev + totalWinnings);
        
        // Reset bonus bets to OFF when returning to come out roll
        setBonusBetsWorking(false);
        
        // 🔄 Show repeat button if there were bets to repeat
        if (lastComeOutBets.length > 0) {
          setTimeout(() => setShowRepeatButton(true), 1000);
        }
        
        // After a short delay, prompt user to place new bets
        setTimeout(() => {
          setMessage('Place your bets for the come out roll!');
        }, 3000);
        
        return;
      } else {
        // Different number - keep rolling
        // Authentic mid-roll callouts
        switch(total) {
          case 2:
            dealerCallout = isHard ? 'Snake Eyes! Aces!' : 'Two!';
            break;
          case 3:
            dealerCallout = 'Ace Deuce! Three!';
            break;
          case 4:
            dealerCallout = isHard ? 'Hard Four! Little Joe!' : 'Easy Four!';
            break;
          case 5:
            dealerCallout = 'Five! No field five!';
            break;
          case 6:
            dealerCallout = isHard ? 'Hard Six!' : 'Six came easy!';
            break;
          case 8:
            dealerCallout = isHard ? 'Hard Eight!' : 'Easy Eight!';
            break;
          case 9:
            dealerCallout = 'Nina! Center field!';
            break;
          case 10:
            dealerCallout = isHard ? 'Hard Ten!' : 'Easy Ten!';
            break;
          case 11:
            dealerCallout = 'Yo-leven! Yo!';
            break;
          case 12:
            dealerCallout = 'Boxcars! Midnight!';
            break;
          default:
            dealerCallout = `${total}!`;
        }
        
        newMessage += `Rolled ${total}. Point is ${point}. Keep rolling!`;
        
        // Keep pass line bets, odds, and Small/Tall/All (only if still active)
        placedBets.forEach(bet => {
          if (bet.area === 'passLine' || bet.area === 'passLineOdds') {
            betsToKeep.push(bet);
          }
          // Only keep Small/Tall/All if they're still active (not completed)
          if (bet.area === 'small' && smallActive) {
            betsToKeep.push(bet);
          }
          if (bet.area === 'tall' && tallActive) {
            betsToKeep.push(bet);
          }
          if (bet.area === 'all' && allActive) {
            betsToKeep.push(bet);
          }
        });
      }
    }

    // Process ALL other bets regardless of phase
    placedBets.forEach(bet => {
      // Skip if already processed
      if (bet.area === 'passLine' || bet.area === 'passLineOdds' || 
          bet.area === 'small' || bet.area === 'tall' || bet.area === 'all') {
        return;
      }

      // FIELD BET (one roll)
      if (bet.area === 'field') {
        if ([2,3,4,9,10,11,12].includes(total)) {
          if (total === 2 || total === 12) {
            totalWinnings += bet.amount * 3; // 3:1 payout (return $1 bet + $2 winnings = $3)
            const winAmount = bet.amount * 2;
            newMessage += ` Field 3x! `;
            winningBets.push({ betName: 'Field (3x)', winAmount, betArea: 'field' });
            // 🎙️ DEALER VOICE: Field win with multiplier
            dealerVoice.announceFieldWin(total);
          } else {
            totalWinnings += bet.amount * 2; // 2:1 payout (return $1 bet + $1 winnings = $2)
            const winAmount = bet.amount;
            newMessage += ` Field wins! `;
            winningBets.push({ betName: 'Field', winAmount, betArea: 'field' });
            // 🎙️ DEALER VOICE: Regular field win
            dealerVoice.announceFieldWin(total);
          }
        }
        // Field bet is cleared after every roll (one-roll bet, win or lose)
        return;
      }

      // HARDWAY BETS - Only work if bonusBetsWorking is true
      if (bet.area === 'hard4') {
        if (bonusBetsWorking && total === 4 && isHard) {
          const winAmount = bet.amount * 7; // 7:1
          totalWinnings += winAmount; // Only add winnings, bet stays on table
          newMessage += ` Hard 4! `;
          winningBets.push({ betName: 'Hard 4', winAmount, betArea: 'hard4' });
          betsToKeep.push(bet); // Keep the bet on the table
          // 🎙️ DEALER VOICE: Hardway win
          dealerVoice.announceHardwayWin(4);
        } else if (bonusBetsWorking && ((total === 4 && !isHard) || (gamePhase === 'point' && total === 7))) {
          // Loses if: Easy 4 OR seven-out during point phase
          if (total === 4 && !isHard) {
            console.log(`❌ Hard 4 LOSES (easy 4) - removing $${bet.amount} from table`);
            // 🎙️ DEALER VOICE: Easy way loss
            dealerVoice.announceHardwayLoss(4);
          } else {
            console.log(`❌ Hard 4 LOSES (seven-out) - removing $${bet.amount} from table`);
          }
          // Do NOT push to betsToKeep - bet is lost
        } else {
          betsToKeep.push(bet); // Keep the bet if not working or different number rolled
        }
      }
      if (bet.area === 'hard6') {
        if (bonusBetsWorking && total === 6 && isHard) {
          const winAmount = bet.amount * 9; // 9:1
          totalWinnings += winAmount; // Only add winnings, bet stays on table
          newMessage += ` Hard 6! `;
          winningBets.push({ betName: 'Hard 6', winAmount, betArea: 'hard6' });
          betsToKeep.push(bet); // Keep the bet on the table
          // 🎙️ DEALER VOICE: Hardway win
          dealerVoice.announceHardwayWin(6);
        } else if (bonusBetsWorking && ((total === 6 && !isHard) || (gamePhase === 'point' && total === 7))) {
          // Loses if: Easy 6 OR seven-out during point phase
          if (total === 6 && !isHard) {
            console.log(`❌ Hard 6 LOSES (easy 6) - removing $${bet.amount} from table`);
            // 🎙️ DEALER VOICE: Easy way loss
            dealerVoice.announceHardwayLoss(6);
          } else {
            console.log(`❌ Hard 6 LOSES (seven-out) - removing $${bet.amount} from table`);
          }
          // Do NOT push to betsToKeep - bet is lost
        } else {
          betsToKeep.push(bet); // Keep the bet if not working or different number rolled
        }
      }
      if (bet.area === 'hard8') {
        if (bonusBetsWorking && total === 8 && isHard) {
          const winAmount = bet.amount * 9; // 9:1
          totalWinnings += winAmount; // Only add winnings, bet stays on table
          newMessage += ` Hard 8! `;
          winningBets.push({ betName: 'Hard 8', winAmount, betArea: 'hard8' });
          betsToKeep.push(bet); // Keep the bet on the table
          // 🎙️ DEALER VOICE: Hardway win
          dealerVoice.announceHardwayWin(8);
        } else if (bonusBetsWorking && ((total === 8 && !isHard) || (gamePhase === 'point' && total === 7))) {
          // Loses if: Easy 8 OR seven-out during point phase
          if (total === 8 && !isHard) {
            console.log(`❌ Hard 8 LOSES (easy 8) - removing $${bet.amount} from table`);
            // 🎙️ DEALER VOICE: Easy way loss
            dealerVoice.announceHardwayLoss(8);
          } else {
            console.log(`❌ Hard 8 LOSES (seven-out) - removing $${bet.amount} from table`);
          }
          // Do NOT push to betsToKeep - bet is lost
        } else {
          betsToKeep.push(bet); // Keep the bet if not working or different number rolled
        }
      }
      if (bet.area === 'hard10') {
        if (bonusBetsWorking && total === 10 && isHard) {
          const winAmount = bet.amount * 7; // 7:1
          totalWinnings += winAmount; // Only add winnings, bet stays on table
          newMessage += ` Hard 10! `;
          winningBets.push({ betName: 'Hard 10', winAmount, betArea: 'hard10' });
          betsToKeep.push(bet); // Keep the bet on the table
          // 🎙️ DEALER VOICE: Hardway win
          dealerVoice.announceHardwayWin(10);
        } else if (bonusBetsWorking && ((total === 10 && !isHard) || (gamePhase === 'point' && total === 7))) {
          // Loses if: Easy 10 OR seven-out during point phase
          if (total === 10 && !isHard) {
            console.log(`❌ Hard 10 LOSES (easy 10) - removing $${bet.amount} from table`);
            // 🎙️ DEALER VOICE: Easy way loss
            dealerVoice.announceHardwayLoss(10);
          } else {
            console.log(`❌ Hard 10 LOSES (seven-out) - removing $${bet.amount} from table`);
          }
          // Do NOT push to betsToKeep - bet is lost
        } else {
          betsToKeep.push(bet); // Keep the bet if not working or different number rolled
        }
      }

      // ONE ROLL PROPOSITION BETS - ALWAYS WORK regardless of bonusBetsWorking toggle
      // These bets are cleared after EVERY roll (win or lose) - they are NOT added to betsToKeep
      if (bet.area === 'snake') {
        if (total === 2) {
          totalWinnings += bet.amount * 31; // 30:1 payout (return bet + 30x winnings = 31x total)
          const winAmount = bet.amount * 30;
          winningBets.push({ betName: 'Snake Eyes', winAmount, betArea: 'snake' });
          newMessage += ` Snake Eyes! `;
        }
        // One-roll bet - always removed after roll
        return;
      }
      if (bet.area === 'boxcars') {
        if (total === 12) {
          totalWinnings += bet.amount * 31; // 30:1 payout
          const winAmount = bet.amount * 30;
          winningBets.push({ betName: 'Boxcars', winAmount, betArea: 'boxcars' });
          newMessage += ` Boxcars! `;
        }
        // One-roll bet - always removed after roll
        return;
      }
      if (bet.area === 'ace') {
        if (total === 3) {
          totalWinnings += bet.amount * 16; // 15:1 payout
          const winAmount = bet.amount * 15;
          winningBets.push({ betName: 'Ace-Deuce', winAmount, betArea: 'ace' });
          newMessage += ` Ace-Deuce! `;
        }
        // One-roll bet - always removed after roll
        return;
      }
      if (bet.area === 'yo') {
        if (total === 11) {
          totalWinnings += bet.amount * 16; // 15:1 payout
          const winAmount = bet.amount * 15;
          winningBets.push({ betName: 'Yo-leven', winAmount, betArea: 'yo' });
          newMessage += ` Yo! `;
        }
        // One-roll bet - always removed after roll
        return;
      }
      if (bet.area === 'anyCraps') {
        if ([2, 3, 12].includes(total)) {
          totalWinnings += bet.amount * 8; // 7:1 payout
          const winAmount = bet.amount * 7;
          winningBets.push({ betName: 'Any Craps', winAmount, betArea: 'anyCraps' });
          newMessage += ` Any Craps! `;
        }
        // One-roll bet - always removed after roll
        return;
      }
      if (bet.area === 'anySeven') {
        if (total === 7) {
          totalWinnings += bet.amount * 5; // 4:1 payout
          const winAmount = bet.amount * 4;
          winningBets.push({ betName: 'Any Seven', winAmount, betArea: 'anySeven' });
          newMessage += ` Any Seven! `;
        }
        // One-roll bet - always removed after roll
        return;
      }
      
      // HORN BET - Combination bet on 2, 3, 11, 12 (one-roll bet)
      if (bet.area === 'horn') {
        if (total === 2 || total === 12) {
          // 2 or 12 pays 30:1 but it's split 4 ways, so net is 27:4 (6.75x bet amount as winnings)
          totalWinnings += bet.amount * 7.75; // Net payout after losing 3/4
          const winAmount = bet.amount * 6.75;
          winningBets.push({ betName: `Horn (${total})`, winAmount, betArea: 'horn' });
          newMessage += ` Horn (${total})! `;
        } else if (total === 3 || total === 11) {
          // 3 or 11 pays 15:1 but it's split 4 ways, so net is 12:4 (3x bet amount as winnings)
          totalWinnings += bet.amount * 4; // Net payout after losing 3/4
          const winAmount = bet.amount * 3;
          winningBets.push({ betName: `Horn (${total})`, winAmount, betArea: 'horn' });
          newMessage += ` Horn (${total})! `;
        }
        // Horn bet is cleared after every roll (one-roll bet)
        return;
      }

      // C & E BETS - ALWAYS WORK (one-roll bets, cleared after every roll)
      if (bet.area === 'c') {
        if ([2, 3, 12].includes(total)) {
          totalWinnings += bet.amount * 8; // 7:1 payout
          const winAmount = bet.amount * 7;
          winningBets.push({ betName: 'C (Craps)', winAmount, betArea: 'c' });
          newMessage += ` C wins! `;
        }
        // One-roll bet - always removed after roll
        return;
      }
      if (bet.area === 'e') {
        if (total === 11) {
          totalWinnings += bet.amount * 16; // 15:1 payout
          const winAmount = bet.amount * 15;
          winningBets.push({ betName: 'E (Eleven)', winAmount, betArea: 'e' });
          newMessage += ` E wins! `;
        }
        // One-roll bet - always removed after roll
        return;
      }
      if (bet.area === 'ce') {
        if ([2, 3, 12].includes(total)) {
          totalWinnings += bet.amount * 4; // Split bet, half wins at 7:1
          const winAmount = bet.amount * 3;
          winningBets.push({ betName: 'C&E (C)', winAmount, betArea: 'ce' });
          newMessage += ` C&E (C) wins! `;
        }
        if (total === 11) {
          totalWinnings += bet.amount * 8; // Split bet, half wins at 15:1
          const winAmount = bet.amount * 7;
          winningBets.push({ betName: 'C&E (E)', winAmount, betArea: 'ce' });
          newMessage += ` C&E (E) wins! `;
        }
        // C&E is one-roll bet - always removed after roll
        return;
      }

      // COME BET - Full implementation with transfer to numbers
      /* 
       * COME BET TESTING GUIDE:
       * -----------------------
       * 1. Place bet in COME area by clicking it
       * 2. SCENARIOS:
       *    a) Roll 7: Bet wins instantly (1:1 payout) - CONSOLE: "✅ COME BET WINS on 7!"
       *    b) Roll other number: Bet travels to that number - CONSOLE: "🚀 COME BET travels to number X"
       * 3. After bet travels to number:
       *    - Yellow "ADD ODDS" button appears on that number box
       *    - Click it to place odds (up to 3x-5x depending on number)
       *    - CONSOLE: "💰 COME ODDS placed on number X"
       * 4. WINNING:
       *    - If that number rolls again: Win come bet + odds - CONSOLE: "✅ COME X WINS!"
       *    - If 7 rolls: Lose both come bet and odds - CONSOLE: "❌ COME X LOSES on seven-out"
       * 5. VISUAL INDICATORS:
       *    - Blue "COME" box appears at top of number when bet travels there
       *    - Come odds chips displayed below come bet
       *    - Cannot remove come bets once they travel (authentic casino rules)
       */
      if (bet.area === 'come' && !bet.comePoint) {
        // Come bet is in the COME area (not yet transferred to a number)
        console.log(`🎲 COME BET in COME area: $${bet.amount} - rolled ${total}`);
        if (total === 7 || total === 11) {
          // 7 wins on come out, 11 travels to number in CRAPLESS CRAPS
          if (total === 7) {
            totalWinnings += bet.amount * 2; // Return original bet + winnings (1:1)
            newMessage += ` Come wins on 7! `;
            winningBets.push({ betName: 'Come Bet', winAmount: bet.amount, betArea: 'come' });
            console.log(`✅ COME BET WINS on 7! Payout: $${bet.amount}`);
            // Bet is cleared (one-roll decision)
          } else {
            // 11 becomes a come point in crapless craps
            const transferredBet = { ...bet, comePoint: total };
            betsToKeep.push(transferredBet);
            newMessage += ` Come bet travels to ${total}. `;
            console.log(`➡️ COME BET TRAVELS to ${total} - bet now on number ${total}`);
          }
        } else if (total === 2 || total === 3 || total === 12) {
          // In CRAPLESS CRAPS, 2, 3, 12 become come points (NOT losses)
          const transferredBet = { ...bet, comePoint: total };
          betsToKeep.push(transferredBet);
          newMessage += ` Come bet travels to ${total}. `;
          console.log(`➡️ COME BET TRAVELS to ${total} - bet now on number ${total}`);
        } else {
          // 4, 5, 6, 8, 9, 10 - Transfer the bet to that number
          const transferredBet = { ...bet, comePoint: total };
          betsToKeep.push(transferredBet);
          newMessage += ` Come bet travels to ${total}. `;
          console.log(`➡️ COME BET TRAVELS to ${total} - bet now on number ${total}`);
        }
      }
      
      // COME BET ON A NUMBER - Check if the come point hits
      if (bet.area === 'come' && bet.comePoint) {
        console.log(`🎲 COME BET on number ${bet.comePoint}: $${bet.amount} - rolled ${total}`);
        if (total === bet.comePoint) {
          // Come point made! Pay 1:1
          totalWinnings += bet.amount * 2; // Return bet + winnings
          newMessage += ` Come ${bet.comePoint} wins! `;
          winningBets.push({ betName: `Come ${bet.comePoint}`, winAmount: bet.amount, betArea: `come-number-${bet.comePoint}` });
          console.log(`✅ COME ${bet.comePoint} WINS! Payout: $${bet.amount}`);
          
          // Also pay come odds if present
          const comeOddsBet = placedBets.find(b => b.area === `comeOdds${bet.comePoint}`);
          if (comeOddsBet) {
            let oddsWin = 0;
            switch(bet.comePoint) {
              case 2:
              case 12:
                oddsWin = comeOddsBet.amount * 6; // 6:1
                break;
              case 3:
              case 11:
                oddsWin = comeOddsBet.amount * 3; // 3:1
                break;
              case 4:
              case 10:
                oddsWin = comeOddsBet.amount * 2; // 2:1
                break;
              case 5:
              case 9:
                oddsWin = Math.floor(comeOddsBet.amount * 1.5); // 3:2
                break;
              case 6:
              case 8:
                oddsWin = Math.floor(comeOddsBet.amount * 1.2); // 6:5
                break;
            }
            totalWinnings += comeOddsBet.amount + oddsWin; // Return bet + winnings
            newMessage += ` Come odds ${bet.comePoint} wins $${oddsWin}! `;
            winningBets.push({ betName: `Come Odds ${bet.comePoint}`, winAmount: oddsWin, betArea: `comeOdds${bet.comePoint}` });
            console.log(`✅ COME ODDS ${bet.comePoint} WINS! Odds bet: $${comeOddsBet.amount}, Payout: $${oddsWin}`);
          }
          // Both come bet and come odds are cleared
        } else if (total === 7) {
          // Seven-out - come bet loses
          newMessage += ` Come ${bet.comePoint} loses. `;
          console.log(`❌ COME ${bet.comePoint} LOSES on seven-out`);
          // Bet is cleared
        } else {
          // Number didn't hit, keep the bet
          betsToKeep.push(bet);
          console.log(`⏸️ COME ${bet.comePoint} stays on table (rolled ${total})`);
        }
      }
      
      // COME ODDS - Handle separately (they travel with the come bet but can be removed)
      if (bet.area.startsWith('comeOdds')) {
        const comeNumber = parseInt(bet.area.replace('comeOdds', ''));
        // Check if there's a come bet on this number
        const correspondingComeBet = placedBets.find(b => b.area === 'come' && b.comePoint === comeNumber);
        
        console.log(`🎲 COME ODDS on number ${comeNumber}: $${bet.amount} - rolled ${total}, come bet exists: ${!!correspondingComeBet}`);
        
        if (correspondingComeBet) {
          // Come bet still exists, check if we already handled it above
          if (total === comeNumber) {
            // Already paid out above, don't keep
            console.log(`   ✅ Come odds cleared (won with come bet)`);
          } else if (total === 7) {
            // Seven-out - odds lose
            // Already handled, don't keep
            console.log(`   ❌ Come odds cleared (lost on seven-out)`);
          } else {
            // Keep the odds bet
            betsToKeep.push(bet);
            console.log(`   ⏸️ Come odds stay on table`);
          }
        } else {
          // No corresponding come bet - this shouldn't happen, but clear it
          console.log(`   ⚠️ No corresponding come bet found - clearing orphaned odds`);
        }
      }

      // PLACE/BUY BETS - Only work if bonusBetsWorking is true
      if (bet.area.startsWith('place') || bet.area.startsWith('buy')) {
        const numStr = bet.area.replace('place', '').replace('buy', '')
        const placeNum = parseInt(numStr);
        
        if (!isNaN(placeNum) && bonusBetsWorking && total === placeNum) {
          if (bet.area.startsWith('buy')) {
            // Buy bets pay TRUE ODDS (bet stays on table, only winnings added)
            let winAmount = 0;
            switch(placeNum) {
              case 2:
              case 12:
                winAmount = bet.amount * 6; // 6:1
                break;
              case 3:
              case 11:
                winAmount = bet.amount * 3; // 3:1
                break;
              case 4:
              case 10:
                winAmount = bet.amount * 2; // 2:1
                break;
              case 5:
              case 9:
                winAmount = bet.amount * 1.5; // 3:2
                break;
              case 6:
              case 8:
                winAmount = bet.amount * 1.2; // 6:5
                break;
              default:
                winAmount = bet.amount;
            }
            totalWinnings += winAmount; // Only add winnings, bet stays on table
            newMessage += ` ${placeNum} wins $${winAmount.toFixed(2)}! `;
            winningBets.push({ betName: `Buy ${placeNum}`, winAmount, betArea: bet.area });
            betsToKeep.push(bet); // Keep the bet on the table
            // 🎙️ DEALER VOICE: Place/Buy bet win
            dealerVoice.announcePlaceBetWin(placeNum);
          } else {
            // Place bets pay HOUSE ODDS (bet stays on table, only winnings added)
            let winAmount = 0;
            switch(placeNum) {
              case 2:
              case 12:
                winAmount = bet.amount * 5.5; // 11:2 (11 for every 2 bet)
                break;
              case 3:
              case 11:
                winAmount = bet.amount * 2.75; // 11:4 (11 for every 4 bet)
                break;
              case 4:
              case 10:
                winAmount = bet.amount * 1.8; // 9:5 (9 for every 5 bet)
                break;
              case 5:
              case 9:
                winAmount = bet.amount * 1.4; // 7:5 (7 for every 5 bet)
                break;
              case 6:
              case 8:
                winAmount = bet.amount * 1.167; // 7:6 (7 for every 6 bet)
                break;
              default:
                winAmount = bet.amount;
            }
            totalWinnings += winAmount; // Only add winnings, bet stays on table
            newMessage += ` ${placeNum} wins $${winAmount.toFixed(2)}! `;
            winningBets.push({ betName: `Place ${placeNum}`, winAmount, betArea: bet.area });
            betsToKeep.push(bet); // Keep the bet on the table
            // 🎙️ DEALER VOICE: Place/Buy bet win
            dealerVoice.announcePlaceBetWin(placeNum);
          }
        } else if (gamePhase === 'point' && total === 7 && bonusBetsWorking) {
          // Place/Buy bets ONLY LOSE on 7 during POINT PHASE (seven-out)
          // Chips are removed from table, balance was already deducted when bet was placed
          console.log(`❌ ${bet.area} LOSES on seven-out - removing $${bet.amount} from table`);
          // Do NOT push to betsToKeep - bet is lost
        } else {
          // Keep bet in all other cases (different number, come out roll, or bets not working)
          betsToKeep.push(bet);
        }
      }

      // SIX box bet (same as place 6) - Only works if bonusBetsWorking is true
      if (bet.area === 'six') {
        if (bonusBetsWorking && total === 6) {
          const winAmount = bet.amount * 1.167; // 7:6
          totalWinnings += winAmount; // Only add winnings, bet stays on table
          newMessage += ` Six wins $${winAmount.toFixed(2)}! `;
          winningBets.push({ betName: 'Six', winAmount, betArea: 'six' });
          betsToKeep.push(bet); // Keep the bet on the table
        } else if (gamePhase === 'point' && total === 7 && bonusBetsWorking) {
          // Six bet ONLY LOSES on 7 during POINT PHASE (seven-out)
          console.log(`❌ Six bet LOSES on seven-out - removing $${bet.amount} from table`);
          // Do NOT push to betsToKeep - bet is lost
        } else {
          // Keep bet in all other cases
          betsToKeep.push(bet);
        }
      }
    });

    // Update state
    console.log('📊 ProcessRoll complete:', {
      rollTotal: total,
      gamePhase,
      point,
      betsBeforeRoll: placedBets.length,
      betsAfterRoll: betsToKeep.length,
      betsBeforeDetails: placedBets.map(b => `${b.area}:$${b.amount}`),
      betsAfterDetails: betsToKeep.map(b => `${b.area}:$${b.amount}`),
      totalBetBefore: placedBets.reduce((sum, bet) => sum + bet.amount, 0),
      totalBetAfter: betsToKeep.reduce((sum, bet) => sum + bet.amount, 0),
      bonusBetsWorking
    });
    
    // 🔒 VALIDATE ALL PAYOUTS FOR LEGITIMACY
    const balanceBefore = balance;
    const rollValidation = validateRoll(
      stats.totalRolls + 1,
      [die1, die2] as [number, number],
      gamePhase,
      point,
      placedBets,
      totalWinnings,
      balanceBefore,
      bonusBetsWorking
    );
    
    // Log validation to console
    logValidation(rollValidation);
    
    // Store validation in history (keep last 100 rolls)
    setValidationHistory(prev => [...prev.slice(-99), rollValidation]);
    
    // ⚠️ CRITICAL: If validation fails, log error but continue (avoid blocking gameplay)
    if (!rollValidation.isLegit) {
      console.error('🚨 PAYOUT VALIDATION FAILED! Check logs above for details.');
      console.error('Expected vs Actual difference detected - this should not happen!');
    }
    
    setPlacedBets(betsToKeep);
    
    // 🎲 LOG COME BETS AFTER ROLL
    const comeBetsAfterRoll = betsToKeep.filter(b => b.area === 'come');
    if (comeBetsAfterRoll.length > 0) {
      console.log(`🎲 COME BETS AFTER ROLL:`);
      comeBetsAfterRoll.forEach(bet => {
        if (bet.comePoint) {
          console.log(`   - $${bet.amount} on number ${bet.comePoint}`);
        } else {
          console.log(`   - $${bet.amount} in COME area (not yet traveled)`);
        }
      });
    }
    
    // 💰 APPLY WINNINGS WITH VERIFICATION
    const balanceAfterWinnings = balanceBefore + totalWinnings;
    setBalance(prev => {
      const newBalance = prev + totalWinnings;
      // Verify balance calculation is correct
      if (Math.abs(newBalance - balanceAfterWinnings) > 0.01) {
        console.error('🚨 BALANCE MISMATCH DETECTED!');
        console.error(`   Expected: $${balanceAfterWinnings.toFixed(2)}, Got: $${newBalance.toFixed(2)}`);
      }
      return newBalance;
    });
    
    console.log(`💰 ROLL RESULT: ${totalWinnings > 0 ? 'WIN' : 'LOSS'} - ${totalWinnings >= 0 ? '+' : ''}$${totalWinnings.toFixed(2)}`);
    console.log(`   Balance: $${balanceBefore.toFixed(2)} → $${balanceAfterWinnings.toFixed(2)}`);
    
    setLastWin(totalWinnings);
    setMessage(newMessage || `Rolled ${total}`);
    setLastWinDetails(winningBets);
    
    // NEW FEATURE - Track Streaks and Show Win Display
    if (totalWinnings > 0) {
      // 💰 Show win amount popup animation for each winning bet
      winningBets.forEach((winBet: any) => {
        if (winBet.winAmount > 0 && winBet.betArea) {
          showWinPopup(winBet.winAmount, false, winBet.betArea);
        }
      });
      
      // If no individual bet areas, show total win
      if (winningBets.length === 0 || !winningBets.some((wb: any) => wb.betArea)) {
        showWinPopup(totalWinnings);
      }
      // Update hot streak
      const newHotStreak = hotStreak + 1;
      setHotStreak(newHotStreak);
      setColdStreak(0);
      
      // Update longest hot streak
      if (newHotStreak > longestHotStreak) {
        setLongestHotStreak(newHotStreak);
      }
      
      // Track hot streak events
      if (profile?.email) {
        const playerDisplayName = profile.name || 'A player';
        
        // Hot Hand alert (5+ consecutive wins)
        if (newHotStreak === 5) {
          // 🎙️ DEALER VOICE: Hot shooter announcement
          dealerVoice.announceHotShooter(5);
          
          fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/stats/hot-streak`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${publicAnonKey}`,
              },
              body: JSON.stringify({
                message: `🔥 ${playerDisplayName} is on FIRE - 5 wins in a row!`,
                icon: '🔥',
                type: 'win_streak',
                playerName: playerDisplayName,
                streakCount: 5
              }),
            }
          ).catch(err => console.error('Failed to track hot streak:', err));
        }
        
        // Amazing streak alert (10+ consecutive wins)
        if (newHotStreak === 10) {
          // 🎙️ DEALER VOICE: Amazing shooter announcement
          dealerVoice.announceHotShooter(10);
          
          fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/stats/hot-streak`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${publicAnonKey}`,
              },
              body: JSON.stringify({
                message: `⚡ LEGENDARY! ${playerDisplayName} hit 10 WINS IN A ROW!`,
                icon: '⚡',
                type: 'mega_streak',
                playerName: playerDisplayName,
                streakCount: 10
              }),
            }
          ).catch(err => console.error('Failed to track hot streak:', err));
        }
        
        // Legendary streak alert (15+ consecutive wins)
        if (newHotStreak === 15) {
          // 🎙️ DEALER VOICE: Legendary shooter announcement
          dealerVoice.announceHotShooter(15);
          
          fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/stats/hot-streak`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${publicAnonKey}`,
              },
              body: JSON.stringify({
                message: `🌟 UNSTOPPABLE! ${playerDisplayName} reached 15 WINS IN A ROW!`,
                icon: '🌟',
                type: 'legendary_streak',
                playerName: playerDisplayName,
                streakCount: 15
              }),
            }
          ).catch(err => console.error('Failed to track hot streak:', err));
        }
      }
      
      // Update biggest win
      if (totalWinnings > stats.biggestWin) {
        setStats(prev => ({ ...prev, biggestWin: totalWinnings }));
      }
      
      // Format win details for display
      const formattedWinDetails = winningBets.map(bet => ({
        betType: bet.betName,
        betAmount: 0, // We don't track individual bet amounts in winningBets
        payout: bet.winAmount,
        odds: '1:1', // Default, could be enhanced later
      }));
      
      setCurrentWinDetails(formattedWinDetails);
      
      // Show win display for wins >= $50
      if (totalWinnings >= 50) {
        setShowWinDisplay(true);
        // 🎙️ DEALER VOICE: Big win announcement
        dealerVoice.announceBigWin(totalWinnings);
      }
      
      // Update achievements
      setAchievements(prev => prev.map(ach => {
        if (ach.id === 'first_win' && !ach.unlocked) {
          return { ...ach, progress: 1, unlocked: true };
        }
        if (ach.id === 'hot_streak_3' && newHotStreak >= 3) {
          return { ...ach, progress: newHotStreak, unlocked: true };
        }
        if (ach.id === 'hot_streak_5' && newHotStreak >= 5) {
          return { ...ach, progress: newHotStreak, unlocked: true };
        }
        if (ach.id === 'big_winner' && totalWinnings >= 1000) {
          return { ...ach, progress: 1, unlocked: true };
        }
        if (ach.id === 'millionaire') {
          const newBalance = balance + totalWinnings;
          return { ...ach, progress: newBalance >= 10000 ? 10000 : newBalance, unlocked: newBalance >= 10000 };
        }
        return ach;
      }));
    } else if (placedBets.length > 0) {
      // Lost bets - update cold streak
      const newColdStreak = coldStreak + 1;
      setColdStreak(newColdStreak);
      setHotStreak(0);
      
      if (newColdStreak > longestColdStreak) {
        setLongestColdStreak(newColdStreak);
      }
      
      // 💰 Show loss amount popup animation (net loss when winnings < amount bet)
      const totalBetAmount = placedBets.reduce((sum, bet) => sum + bet.amount, 0);
      const netLoss = totalBetAmount - betsToKeep.reduce((sum, bet) => sum + bet.amount, 0) + totalWinnings;
      if (netLoss < 0) {
        showWinPopup(Math.abs(netLoss), true); // true = isLoss
      }
    }
    
    // Track rolls for achievements
    setAchievements(prev => prev.map(ach => {
      if (ach.id === 'roll_100' && stats.totalRolls + 1 >= 100) {
        return { ...ach, progress: stats.totalRolls + 1, unlocked: true };
      }
      if (ach.id === 'roll_500' && stats.totalRolls + 1 >= 500) {
        return { ...ach, progress: stats.totalRolls + 1, unlocked: true };
      }
      return ach;
    }));
    
    // Track stats on server if player won
    if (totalWinnings > 0 && profile?.email) {
      // Add to jackpot total
      fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/stats/jackpot`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ amount: totalWinnings }),
          }
        ).then(() => {
          console.log(`💰 Jackpot tracked - Added $${totalWinnings} to global total`);
        }).catch(err => console.error('❌ Failed to track jackpot:', err));
      
      // Track hot streak events for big wins
      const playerDisplayName = profile.name || 'A player';
      
      // Big win alert (over $500)
      if (totalWinnings >= 500) {
        const message = totalWinnings >= 5000 
          ? `🎉 ${playerDisplayName} just hit JACKPOT - $${totalWinnings.toFixed(0)}!`
          : `💰 ${playerDisplayName} won $${totalWinnings.toFixed(0)}!`;
        
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/stats/hot-streak`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              message,
              icon: totalWinnings >= 5000 ? '👑' : '💰',
              type: totalWinnings >= 5000 ? 'jackpot' : 'big_win',
              playerName: playerDisplayName,
              amount: totalWinnings
            }),
          }
        ).catch(err => console.error('Failed to track hot streak:', err));
      }
    }
    
    // Increment game counter
    fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/stats/game`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
      }
    ).then(() => {
      console.log('✅ Game tracked - Total Games counter incremented');
    }).catch(err => console.error('❌ Failed to track game:', err));
    
    // Track player-specific stats
    if (profile?.email) {
      fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/player/stats`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: profile.email,
            wagered: totalBet,
            won: totalWinnings,
            isWin: totalWinnings > 0,
            rollNumber: dice1 + dice2
          }),
        }
      ).catch(err => console.error('Failed to track player stats:', err));
    }
    
    // Update game statistics
    // Only update biggestWin if this was actually a win (positive amount)
    const newBiggestWin = (totalWinnings > 0 && totalWinnings > stats.biggestWin) ? totalWinnings : stats.biggestWin;
    setStats(prev => ({
      ...prev,
      totalRolls: prev.totalRolls + 1,
      totalWins: totalWinnings > 0 ? prev.totalWins + 1 : prev.totalWins,
      totalLosses: totalWinnings < 0 ? prev.totalLosses + 1 : prev.totalLosses,
      biggestWin: newBiggestWin,
      totalWagered: prev.totalWagered + totalBet,
      totalWon: prev.totalWon + totalWinnings
    }));
    
    // 💾 Sync stats to server for leaderboard
    if (profile?.email) {
      fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/stats/update`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: profile.email,
            stats: {
              wins: totalWinnings > 0 ? 1 : 0, // Increment wins if this roll won
              losses: totalWinnings < 0 ? 1 : 0, // Increment losses if this roll lost
              rolls: 1, // Always increment roll count
              wagered: totalBet,
              biggestWin: newBiggestWin,
              level: level,
              xp: totalXpEarned, // Sync total XP earned for accurate tracking
            },
          }),
        }
      ).catch(err => console.error('Failed to sync stats to server:', err));
    }
    
    // 🎙️ DEALER VOICE: Additional callouts for big wins
    if (totalWinnings >= 500) {
      dealerVoice.announceBigWin(totalWinnings);
    }
  };

  const getOddsMultiplier = (point: number) => {
    // Crapless craps true odds payouts
    switch (point) {
      case 2:
      case 12:
        return 6; // 6:1
      case 3:
      case 11:
        return 3; // 3:1
      case 4:
      case 10:
        return 2; // 2:1
      case 5:
      case 9:
        return 1.5; // 3:2
      case 6:
      case 8:
        return 1.2; // 6:5
      default:
        return 0;
    }
  };

  // Debug: Log render state
  console.log('🎮 CrapsGame render state:', { 
    hasProfile: !!profile, 
    profileName: profile?.name,
    gameMode, 
    showingLogin: !profile,
    showingModeSelect: !!(profile && gameMode === 'modeSelect')
  });

  // Determine what to show based on state
  const shouldShowLogin = !profile;
  const shouldShowModeSelect = profile && gameMode === 'modeSelect';
  const shouldShowLoading = gameMode === 'loading';
  const shouldShowLobby = profile && gameMode === 'lobby';
  const shouldShowMultiplayer = profile && gameMode === 'multiplayer' && currentRoom;
  const shouldShowSinglePlayer = profile && gameMode === 'single';

  return (
    <div className="w-full min-h-screen bg-gray-900 pb-safe">
      {/* ONLY show ProfileLogin when not logged in (fullscreen login) */}
      {/* ProfileLogin in CrapsHeader handles the logged-in state */}
      {shouldShowLogin && (
        <div className="w-full h-full flex items-center justify-center">
          <ProfileLogin
            profile={profile}
            onLogin={handleLogin}
            onLogout={handleLogout}
            showFullScreen={true}
          />
        </div>
      )}

      {/* Loading Screen */}
      {shouldShowLoading && (
        <LoadingScreen
          message={loadingMessage}
          minDuration={1500}
        />
      )}

      {/* Show mode selection screen after login */}
      {shouldShowModeSelect && (
        <div className="w-full h-full">
          <ErrorBoundary>
            <ModeSelection
              profile={profile!}
              onSelectSinglePlayer={() => {
                console.log('🎮 Single Player selected');
                setLoadingMessage('Preparing Single Player Table');
                setGameMode('loading');
                setTimeout(() => {
                  console.log('🎮 Setting game mode to single');
                  setGameMode('single');
                }, 1500);
              }}
              onSelectMultiplayer={() => {
                console.log('🎮 Multiplayer selected');
                setLoadingMessage('Connecting to Multiplayer Lobby');
                setGameMode('loading');
                setTimeout(() => {
                  console.log('🎮 Setting game mode to lobby');
                  setGameMode('lobby');
                }, 1500);
              }}
              onLogout={() => {
                console.log('🚪 Logging out from mode select');
                handleLogout();
              }}
            />
          </ErrorBoundary>
        </div>
      )}

      {/* Show multiplayer lobby (dedicated page for browsing rooms) */}
      {shouldShowLobby && (
        <MultiplayerLobby
          playerName={profile.name}
          profile={profile}
          currentSettings={settings}
          onBalanceUpdate={handleBalanceUpdate}
          onJoinRoom={(roomId, host) => {
            setCurrentRoom(roomId);
            setIsHost(host);
            setLoadingMessage('Joining Multiplayer Room');
            setGameMode('loading');
            setTimeout(() => setGameMode('multiplayer'), 1500);
          }}
          onStartSinglePlayer={() => {
            setLoadingMessage('Preparing Single Player Table');
            setGameMode('loading');
            setTimeout(() => setGameMode('single'), 1500);
          }}
          onLogout={() => {
            setGameMode('modeSelect');
            handleLogout();
          }}
          onSettingsChange={(settings) => {
            // Update settings context
            updateSettings(settings);
            console.log('Settings changed:', settings);
          }}
          onBackToModeSelect={() => setGameMode('modeSelect')}
        />
      )}

      {/* Show multiplayer game */}
      {shouldShowMultiplayer && (
        <MultiplayerCrapsGame
          roomId={currentRoom!}
          playerName={profile!.name}
          playerAvatar={profile!.avatar || '🎲'}
          playerEmail={profile!.email}
          isHost={isHost}
          initialBalance={balance}
          onLeaveRoom={() => {
            console.log('🚪 Leaving multiplayer room');
            setGameMode('lobby');
            setCurrentRoom(null);
            setIsHost(false);
          }}
        />
      )}

      {/* Show single player game */}
      {shouldShowSinglePlayer && (
        <div className="min-h-screen max-h-screen overflow-y-auto p-4">
          {/* Header - Compact */}
          <div className="mb-4">
            <CrapsHeader 
              balance={balance}
              lastBet={lastBet}
              lastWin={lastWin}
              onShowStats={() => setShowStats(true)}
              profile={profile}
              onLogin={handleLogin}
              onLogout={handleLogout}
              totalBet={totalBet}
              onBalanceUpdate={handleBalanceUpdate}
              onAdminBalanceUpdate={handleAdminBalanceUpdate}
              onSettingsChange={(settings) => {
                updateSettings(settings);
                console.log('✅ Settings updated:', settings);
              }}
              currentSettings={settings}
              onShowProfile={() => setShowProfileSettings(true)}
              onBackToModeSelect={() => setGameMode('modeSelect')}
              onShowDailyRewards={() => setShowDailyRewards(true)}
              onOpenPlaylistSettings={() => setShowPlaylistSettings(true)}
              onShowRewards={() => setShowRewardsPanel(true)}
              onShowAchievements={() => setShowAchievements(true)}
              onShowLeaderboard={() => setShowLeaderboard(true)}
              onShowFriends={() => setShowFriends(true)}
              onShowLevelUp={() => setShowLevelUp(true)}
              hasLevelUpNotification={!!levelUpData}
              onShowPayoutVerifier={() => setShowPayoutVerifier(true)}
              onShowFairnessInfo={() => setShowFairnessInfo(true)}
            />
          </div>

          {showProfileSettings && profile && (
            <ProfileSettings
              isOpen={showProfileSettings}
              onClose={() => setShowProfileSettings(false)}
              profile={profile}
              onUpdateProfile={(updatedProfile) => {
                setProfile(updatedProfile);
                localStorage.setItem('rollers-paradise-profile', JSON.stringify(updatedProfile));
                console.log('✅ Profile updated and saved');
              }}
            />
          )}
          
          {showStats && profile && (
            <ProfileStatsModal 
              onClose={() => setShowStats(false)}
              playerName={profile.name}
              playerEmail={profile.email}
              currentBalance={balance}
            />
          )}

          {showLevelUp && levelUpData && (
            <LevelUpModal
              newLevel={levelUpData.newLevel}
              rewards={levelUpData.rewards}
              onClose={() => {
                setShowLevelUp(false);
                setLevelUpData(null);
              }}
            />
          )}

          {showLeaderboard && (
            <LeaderboardModal
              onClose={() => setShowLeaderboard(false)}
              currentPlayerEmail={profile?.email}
            />
          )}
          
          {/* Payout Verifier - Transparency Tool */}
          {showPayoutVerifier && (
            <PayoutVerifier onClose={() => setShowPayoutVerifier(false)} />
          )}
          
          {/* Fairness Information Modal */}
          {showFairnessInfo && (
            <FairnessModal onClose={() => setShowFairnessInfo(false)} />
          )}

          {/* Friends Panel */}
          {showFriends && profile && (
            <FriendsPanel
              playerEmail={profile.email}
              playerName={profile.name}
              onClose={() => setShowFriends(false)}
            />
          )}
          
          {/* 🔒 Security Dashboard (Admin Only) */}
          {showSecurityDashboard && (
            <SecurityDashboard
              onClose={() => setShowSecurityDashboard(false)}
            />
          )}
          
          {/* Table - Takes remaining space */}
          <div className="mb-4 relative">
            {/* ⚡ Quick Roll Flash Effect */}
            {showQuickRollFlash && (
              <div className="absolute inset-0 z-50 pointer-events-none">
                <div className="absolute inset-0 bg-yellow-400/40 animate-pulse" 
                     style={{ 
                       animation: 'flash 0.2s ease-out',
                       boxShadow: 'inset 0 0 100px rgba(250, 204, 21, 0.8)'
                     }} 
                />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                              text-white text-8xl font-black drop-shadow-2xl"
                     style={{
                       textShadow: '0 0 40px rgba(250, 204, 21, 1), 0 0 80px rgba(250, 204, 21, 0.8)'
                     }}>
                  {dice1} + {dice2}
                </div>
              </div>
            )}
            
            <CrapsTable 
              placedBets={placedBets}
              onPlaceBet={handlePlaceBet}
              onRemoveBet={handleRemoveBet}
              dice1={dice1}
              dice2={dice2}
              isRolling={isRolling}
              buttonsLocked={buttonsLocked}
              rollHistory={rollHistory}
              onRoll={handleRoll}
              canRoll={totalBet >= minBet}
              gamePhase={gamePhase}
              point={point}
              message={message}
              puckPosition={puckPosition}
              smallHit={smallHit}
              tallHit={tallHit}
              allHit={allHit}
              bonusBetsWorking={bonusBetsWorking}
              onToggleBonusBets={() => setBonusBetsWorking(!bonusBetsWorking)}
              showBuyPlaceBets={showBuyPlaceBets}
              onToggleBuyPlaceBets={() => setShowBuyPlaceBets(!showBuyPlaceBets)}
              winningNumbers={calculateWinningNumbers()}
              losingNumbers={calculateLosingNumbers()}
              onBetAcross={handleBetAcross}
            />
          </div>

          {/* Bottom Controls - Same layout as multiplayer */}
          <div className="bg-gray-800 border-t-2 border-yellow-500 w-full py-4 px-4">
            <div className="max-w-7xl">
              <div className="flex gap-4 items-start justify-start">
                {/* Chip Selector - Left */}
                <div className="flex-1">
                  <ChipSelector
                    selectedChip={selectedChip}
                    onSelectChip={setSelectedChip}
                    balance={balance}
                    onRoll={handleRoll}
                    totalBet={totalBet}
                    minBet={minBet}
                    isRolling={isRolling}
                    buttonsLocked={buttonsLocked}
                    dice1={dice1}
                    dice2={dice2}
                    lastWin={lastWin}
                  />
                </div>
                
                {/* Right Side Controls - All in one row */}
                <div className="flex-shrink-0 flex gap-3 items-center">
                  {/* Balance Display */}
                  <div className="bg-gradient-to-br from-green-600 to-green-800 backdrop-blur-sm rounded-lg border-2 border-green-300 shadow-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="text-lg">💰</div>
                      <div>
                        <div className="text-xs text-green-200 font-bold uppercase tracking-wide">
                          Balance
                        </div>
                        <div className="text-lg font-black tabular-nums text-white">
                          ${balance.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Last Win Display */}
                  <div className={`backdrop-blur-sm rounded-lg border-2 shadow-lg px-3 py-2 transition-all ${
                    lastWin > 0 
                      ? 'bg-gradient-to-br from-yellow-600 to-yellow-800 border-yellow-300' 
                      : 'bg-gradient-to-br from-gray-600 to-gray-800 border-gray-400'
                  }`}>
                    <div className="flex items-center gap-2">
                      <div className="text-lg">{lastWin > 0 ? '🎉' : '💸'}</div>
                      <div>
                        <div className={`text-xs font-bold uppercase tracking-wide ${
                          lastWin > 0 ? 'text-yellow-200' : 'text-gray-300'
                        }`}>
                          Last Win
                        </div>
                        <div className={`text-lg font-black tabular-nums ${
                          lastWin > 0 ? 'text-white' : 'text-gray-300'
                        }`}>
                          ${lastWin.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clear Bets Button */}
                  <button
                    onClick={handleClearBets}
                    disabled={totalBet === 0 || isRolling || buttonsLocked}
                    className="bg-gradient-to-b from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-all border-2 border-red-800 shadow-lg hover:shadow-xl font-bold"
                    style={{
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
                    }}
                    title="Clear all removable bets and return chips to balance"
                  >
                    <Trash2 className="w-5 h-5" />
                    <div className="text-sm">CLEAR</div>
                  </button>

                  {/* Undo Last Bet Button */}
                  <button
                    onClick={handleUndoLastBet}
                    disabled={betHistory.length === 0 || isRolling || buttonsLocked}
                    className="bg-gradient-to-b from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-all border-2 border-orange-800 shadow-lg hover:shadow-xl font-bold"
                    style={{
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
                    }}
                    title="Undo the most recent bet (cannot undo locked bets)"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <div className="text-sm">UNDO</div>
                  </button>

                  {/* Repeat Bets Button - Shows after 7-out */}
                  {showRepeatButton && (
                    <button
                      onClick={handleRepeatBets}
                      disabled={lastComeOutBets.length === 0 || isRolling || buttonsLocked}
                      className="bg-gradient-to-b from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-all border-2 border-green-800 shadow-lg hover:shadow-xl font-bold animate-pulse"
                      style={{
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
                      }}
                      title="Repeat your bets from before the point was established"
                    >
                      <RotateCcw className="w-5 h-5" />
                      <div className="text-sm">REPEAT</div>
                    </button>
                  )}

                  {/* Current Bet Display */}
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 backdrop-blur-sm rounded-lg border-2 border-blue-300 shadow-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <div className="text-lg">💰</div>
                      <div>
                        <div className="text-xs text-blue-200 font-bold uppercase tracking-wide">
                          Bet
                        </div>
                        <div className="text-lg font-black tabular-nums text-white">
                          ${totalBet}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Compact Timer - Made smaller */}
                  <CompactTimer
                    timer={bettingTimer}
                    maxDuration={BETTING_TIMER_DURATION}
                    isActive={bettingTimerActive}
                    isLocked={bettingLocked}
                    size="small"
                  />
                  
                  {/* ROLL BUTTON - Made smaller */}
                  {!isRolling && !bettingLocked && totalBet >= minBet && (
                    <button
                      onClick={handleRoll}
                      disabled={isRolling || bettingLocked || totalBet < minBet}
                      className="px-6 py-4 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 
                               text-white text-xl font-black rounded-xl shadow-2xl
                               transform hover:scale-105 active:scale-95 transition-all duration-200
                               border-3 border-yellow-400 hover:border-yellow-300
                               disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                               drop-shadow-[0_0_15px_rgba(239,68,68,0.6)]
                               animate-pulse"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">🎲</span>
                        <div>ROLL DICE</div>
                      </div>
                    </button>
                  )}
                  
                  {/* Show why button is disabled */}
                  {!isRolling && !bettingLocked && totalBet < minBet && (
                    <div className="px-4 py-3 bg-yellow-600/30 border-2 border-yellow-500 rounded-lg text-center">
                      <div className="text-yellow-200 font-bold text-sm">⚠️ Minimum bet: $3</div>
                      <div className="text-yellow-300 text-xs mt-1">Place your bets!</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Dice History - Horizontal scroll below controls */}
            <div className="px-4 pb-4 mt-4">
              <VisualDiceHistory rollHistory={rollHistory} />
            </div>
          </div>
          
          {/* Music Player - INVISIBLE AUTO-PLAY ONLY */}
          <MusicPlayer
            musicVolume={musicVolume}
            setMusicVolume={handleMusicVolumeChange}
            musicEnabled={musicEnabled}
            setMusicEnabled={handleMusicEnabledChange}
            customPlaylists={customPlaylists}
            onOpenPlaylistSettings={() => setShowPlaylistSettings(true)}
            isVisible={true}
            onToggleVisibility={() => {}}
          />
          
          {/* Playlist Settings Modal */}
          {showPlaylistSettings && (
            <PlaylistSettings
              isOpen={showPlaylistSettings}
              onClose={() => setShowPlaylistSettings(false)}
              playlists={customPlaylists}
              onUpdatePlaylists={(playlists) => {
                setCustomPlaylists(playlists);
                localStorage.setItem('rollers-paradise-playlists', JSON.stringify(playlists));
                console.log('✅ Playlists saved');
              }}
            />
          )}
          
          {/* Daily Rewards */}
          {showDailyRewards && (
            <DailyRewardModal
              isOpen={showDailyRewards}
              onClose={() => setShowDailyRewards(false)}
              onRewardClaimed={(chips, xp) => {
                // Add chips to balance
                setBalance(prevBalance => prevBalance + chips);
                console.log(`🎁 Daily reward added: $${chips} chips and ${xp} XP`);
              }}
            />
          )}
          
          {/* Rewards Panel */}
          <RewardsPanel
            isOpen={showRewardsPanel}
            onClose={() => setShowRewardsPanel(false)}
            onChipsAwarded={(chips) => {
              setBalance(prevBalance => prevBalance + chips);
              console.log(`🎁 Level rewards claimed: +$${chips} chips`);
            }}
          />
          
          {/* Quick Help Tooltip - Shows on first play */}
          <QuickHelpTooltip />
          
          {/* Win Display - Shows detailed win breakdown */}
          {showWinDisplay && (
            <WinDisplay
              totalWinnings={lastWin}
              winDetails={currentWinDetails}
              onClose={() => setShowWinDisplay(false)}
            />
          )}
          
          {/* Win Amount Popups */}
          {winPopups.map((popup) => (
            <WinAmountPopup
              key={popup.id}
              amount={popup.amount}
              x={popup.x}
              y={popup.y}
              isLoss={popup.isLoss}
              onComplete={() => removeWinPopup(popup.id)}
            />
          ))}

          
          {/* Achievement System Modal */}
          {showAchievements && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="max-w-5xl w-full max-h-[90vh] overflow-auto">
                <div className="mb-4 flex justify-end">
                  <button
                    onClick={() => setShowAchievements(false)}
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-bold"
                  >
                    CLOSE
                  </button>
                </div>
                <AchievementSystem
                  achievements={achievements}
                  profile={profile}
                  onClaim={(achievementId) => {
                    setAchievements(prev =>
                      prev.map(ach => {
                        if (ach.id === achievementId && ach.unlocked && !localStorage.getItem(`achievement-claimed-${ach.id}`)) {
                          setBalance(prevBalance => prevBalance + ach.reward);
                          localStorage.setItem(`achievement-claimed-${ach.id}`, 'true');
                          console.log(`🏆 Achievement claimed: ${ach.title} (+$${ach.reward})`);
                        }
                        return ach;
                      })
                    );
                  }}
                />
              </div>
            </div>
          )}
          

        </div>
      )}
    </div>
  );
}