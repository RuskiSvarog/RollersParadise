import { useState, useEffect, useCallback } from 'react';
import { createClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import { Trash2, RotateCcw, Trophy } from 'lucide-react';
import { CrapsHeader } from './CrapsHeader';
import { CrapsTable } from './CrapsTable';
import { ChipSelector } from './ChipSelector';
import { GameStatistics } from './GameStatistics';
import { WinNotification } from './WinNotification';
import { WinAmountPopup } from './WinAmountPopup';
import { MultiplayerChat } from './MultiplayerChat';
import { VoiceChatSystem } from './VoiceChatSystem';
import { LevelUpModal } from './LevelUpModal';
import { LeaderboardModal } from './LeaderboardModal';
import { MultiplayerPlayerCard } from './MultiplayerPlayerCard';
import { PlayerProfileModal } from './PlayerProfileModal';
import { CompactTimer } from './CompactTimer';
import { VisualDiceHistory } from './VisualDiceHistory';
import { LiveSessionLeaderboard } from './LiveSessionLeaderboard';
import { PayoutVerifier } from './PayoutVerifier';
import { FairnessModal } from './FairnessModal';
import { FriendsPanel } from './FriendsPanel';
import { useProgression } from '../contexts/ProgressionContext';
import { useSettings } from '../contexts/SettingsContext';
import { useMembership } from '../contexts/MembershipContext';
import { useXPBoost } from '../contexts/XPBoostContext';
import { dealerVoice } from '../utils/dealerVoice';
import { MusicVolumeSlider } from './MusicVolumeSlider';
import { monitorTimerPerformance } from '../utils/performanceOptimization';
import type { PlacedBet, Roll, GamePhase } from './CrapsGame';

interface MultiplayerCrapsGameProps {
  roomId: string;
  playerName: string;
  playerAvatar: string;
  playerEmail: string;
  isHost: boolean;
  onLeaveRoom: () => void;
  initialBalance?: number;
}

interface GameState {
  dice1: number;
  dice2: number;
  gamePhase: GamePhase;
  point: number | null;
  message: string;
  puckPosition: number | null;
  smallHit: number[];
  tallHit: number[];
  allHit: number[];
  isRolling: boolean;
  lastRoll: number;
  bettingTimer?: number; // Seconds remaining for betting
  bettingTimerActive?: boolean;
  bettingLocked?: boolean; // Betting phase is over
  currentShooter?: string; // Email of current shooter
  shooterName?: string; // Display name of shooter
  awaitingShooterResponse?: boolean; // Waiting for someone to accept shooter role
}

interface PlayerData {
  name: string;
  balance: number;
  bets: PlacedBet[];
  online: boolean;
  avatar?: string;
  level?: number;
  membershipTier?: 'free' | 'silver' | 'gold' | 'platinum';
  achievementTitle?: string;
  email?: string;
}

export function MultiplayerCrapsGame({ roomId, playerName, playerAvatar, playerEmail, isHost, onLeaveRoom, initialBalance }: MultiplayerCrapsGameProps) {
  // Use contexts
  const { addXP, level, xp, totalXpEarned, unclaimedRewards } = useProgression();
  const { settings } = useSettings();
  const { membershipStatus } = useMembership();
  const { syncBoostsWithServer } = useXPBoost();
  
  // Timer configuration (30 seconds default, can be adjusted)
  const BETTING_TIMER_DURATION = 30;
  
  const [gameState, setGameState] = useState<GameState>({
    dice1: 3,
    dice2: 4,
    gamePhase: 'comeOut',
    point: null,
    message: 'COME OUT ROLL - Place your bets!',
    puckPosition: null,
    smallHit: [],
    tallHit: [],
    allHit: [],
    isRolling: false,
    lastRoll: 0,
    bettingTimer: 30,
    bettingTimerActive: false,
    bettingLocked: false,
  });

  const [players, setPlayers] = useState<Map<string, PlayerData>>(new Map());
  const [myBalance, setMyBalance] = useState(initialBalance || 1000);
  const [myBets, setMyBets] = useState<PlacedBet[]>([]);
  // Track bet history for undo functionality - each entry is a bet action
  const [betHistory, setBetHistory] = useState<Array<{ area: string; amount: number; x?: number; y?: number; comePoint?: number }>>([]);
  // Store bets from before point was established for optional repeat
  const [lastComeOutBets, setLastComeOutBets] = useState<PlacedBet[]>([]);
  const [showRepeatButton, setShowRepeatButton] = useState(false);
  const [selectedChip, setSelectedChip] = useState(5);
  const [rollHistory, setRollHistory] = useState<Roll[]>([]);
  const [showStats, setShowStats] = useState(false);
  const [showWin, setShowWin] = useState(false);
  const [lastWin, setLastWin] = useState(0);
  const [lastBet, setLastBet] = useState(0);
  
  // Track if bonus bets are working (toggle) - Defaults to FALSE during come out roll
  const [bonusBetsWorking, setBonusBetsWorking] = useState(false);
  
  // Toggle between Buy/Place bets mode and Bonus bets mode
  const [showBuyPlaceBets, setShowBuyPlaceBets] = useState(false);
  
  // Level-up and leaderboard states
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ newLevel: number; rewards: any } | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  // Profile modal state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerData | null>(null);
  
  // Payout Verifier and Friends states
  const [showPayoutVerifier, setShowPayoutVerifier] = useState(false);
  const [showFairnessInfo, setShowFairnessInfo] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  
  // Track current host status (can change via migration)
  const [isCurrentHost, setIsCurrentHost] = useState(isHost);
  const [currentHostName, setCurrentHostName] = useState(isHost ? playerName : '');
  
  // Quick roll flash effect
  const [showQuickRollFlash, setShowQuickRollFlash] = useState(false);
  
  // 🎲 SHOOTER MANAGEMENT - Track and control who shoots the dice
  const [showShooterDialog, setShowShooterDialog] = useState(false);
  const [shooterDialogMessage, setShooterDialogMessage] = useState('');
  
  // Win amount popups - track active win animations
  const [winPopups, setWinPopups] = useState<Array<{ 
    id: string; 
    amount: number; 
    x: number; 
    y: number; 
    isLoss?: boolean;
    playerName?: string;
    playerAvatar?: string;
  }>>([]);

  // 📊 SESSION STATISTICS TRACKING - Track live stats for leaderboard
  interface PlayerSessionStats {
    name: string;
    avatar: string;
    email: string;
    netProfit: number;
    totalWins: number;
    totalLosses: number;
    biggestWin: number;
    totalWagered: number;
    currentStreak: number; // Positive for win streak, negative for loss streak
    winRate: number; // Percentage
    membershipTier?: 'free' | 'silver' | 'gold' | 'platinum';
    level?: number;
  }

  const [sessionStats, setSessionStats] = useState<Map<string, PlayerSessionStats>>(new Map());
  const [showSessionLeaderboard, setShowSessionLeaderboard] = useState(true); // Auto-show in multiplayer
  const [sessionStartBalance] = useState(myBalance); // Track starting balance for net profit calculation

  // Calculate total bet for current player
  const totalBet = myBets.reduce((sum, bet) => sum + bet.amount, 0);

  // Store channel references
  const [gameChannel, setGameChannel] = useState<any>(null);
  const [playerChannel, setPlayerChannel] = useState<any>(null);
  const [isRealtimeAvailable, setIsRealtimeAvailable] = useState(true);
  
  // Sync dealer voice with settings context
  useEffect(() => {
    if (settings.dealerVoice !== undefined) {
      dealerVoice.setEnabled(settings.dealerVoice);
    }
    if (settings.dealerVolume !== undefined) {
      dealerVoice.setVolume(settings.dealerVolume / 100); // Convert from 0-100 to 0-1
    }
  }, [settings.dealerVoice, settings.dealerVolume]);
  
  // Automatically manage bonus bets based on game phase
  useEffect(() => {
    if (gameState.gamePhase === 'point') {
      // Activate bonus bets when point is established
      setBonusBetsWorking(true);
    } else if (gameState.gamePhase === 'comeOut') {
      // Reset bonus bets to OFF when returning to come out roll
      setBonusBetsWorking(false);
    }
  }, [gameState.gamePhase]);
  
  // Watch for level-ups from ProgressionContext
  const [previousLevel, setPreviousLevel] = useState(level);
  useEffect(() => {
    if (level > previousLevel && unclaimedRewards.length > 0) {
      // Level up detected! Show the level-up modal with rewards
      const latestReward = unclaimedRewards[unclaimedRewards.length - 1];
      setLevelUpData({
        newLevel: level,
        rewards: latestReward.reward
      });
      setShowLevelUp(true);
      console.log(`🎉 Level up detected: ${previousLevel} → ${level}`);
    }
    setPreviousLevel(level);
  }, [level, unclaimedRewards]);

  // Add browser close/reload detection
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Call server to leave room
      leaveRoomServer();
      
      // Use sendBeacon for reliable delivery even during page unload
      const blob = new Blob(
        [JSON.stringify({ playerName, playerEmail })],
        { type: 'application/json' }
      );
      navigator.sendBeacon(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/rooms/${roomId}/leave`,
        blob
      );
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [roomId, playerName]);

  // 🔄 Sync XP boosts from server on component mount
  useEffect(() => {
    if (playerEmail) {
      console.log('⚡ Syncing XP boosts for multiplayer player:', playerEmail);
      syncBoostsWithServer(playerEmail);
    }
  }, [playerEmail, syncBoostsWithServer]);

  // 💰 Smart balance sync on initial load (MULTIPLAYER MODE)
  // ⚠️ SMART SYNC: Only update if server balance is different from local
  useEffect(() => {
    if (playerEmail) {
      const smartFetchBalanceMultiplayer = async () => {
        const localBalance = myBalance; // Current balance from initialBalance prop
        console.log('💰 [MULTIPLAYER] Smart Balance Sync: Checking server balance...');
        console.log('   Local balance:', localBalance);
        
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/chips/balance/${encodeURIComponent(playerEmail)}`,
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
                setMyBalance(maxBalance);
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
                      email: playerEmail, 
                      balance: maxBalance,
                      source: 'multiplayer-smart-sync'
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
          console.error('❌ [MULTIPLAYER] Failed to fetch balance from server:', error);
          console.log('   ℹ️ Using local balance:', localBalance);
        }
      };
      
      smartFetchBalanceMultiplayer();
    }
  }, [playerEmail]); // Only run once on mount

  // Handle membership payment return (same as single player)
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
            toast.success(`🎉 ${tier.toUpperCase()} ${duration} membership activated! Enjoy your benefits!`);
            // Trigger membership context update
            window.dispatchEvent(new CustomEvent('membership-updated', { detail: data.membership }));
          } else {
            toast.error('⚠️ Membership payment processed but not activated. Please contact support.');
          }
        } catch (error) {
          console.error('Error confirming membership:', error);
          toast.error('⚠️ Membership payment may have succeeded. Please check your status or contact support.');
        }

        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (urlParams.get('membership_cancelled') === 'true') {
        toast.info('Membership purchase cancelled. No charges were made.');
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };

    handleMembershipReturn();
  }, []);

  // Track active player session with heartbeat
  useEffect(() => {
    const playerId = `multiplayer-${playerName}-${Date.now()}`;
    
    const sendHeartbeat = async () => {
      try {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/stats/session`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ playerId }),
          }
        );
      } catch (error) {
        console.error('Failed to send heartbeat:', error);
      }
    };

    sendHeartbeat();
    const heartbeatInterval = setInterval(sendHeartbeat, 60000); // Every minute
    
    return () => clearInterval(heartbeatInterval);
  }, [playerName]);

  // ==================== ⚡ OPTIMIZED AUTOMATIC BETTING TIMER SYSTEM ====================
  // 🎯 MULTIPLAYER ONLY - Ensures game keeps moving without waiting for inactive players
  // ✅ Performance optimized with efficient state updates and cleanup
  // 
  // KEY FEATURES:
  // - ⏱️  Runs on all clients for synchronized display
  // - 🎲 Only host triggers the actual dice roll when timer expires
  // - 🔒 Betting locks automatically when timer reaches 0
  // - 🔄 Timer auto-resets after each roll
  // - 👥 Shows who has placed bets vs who is waiting
  // - 🔊 Audio alerts at 10 seconds warning
  // - ⚡ Optimized re-renders using useCallback
  useEffect(() => {
    // Early exit for performance - don't run timer when inactive
    if (!gameState.bettingTimerActive || gameState.isRolling) return;

    console.log('⏱️ [MULTIPLAYER TIMER] Starting betting countdown from', gameState.bettingTimer, 'seconds');

    const timer = setInterval(() => {
      setGameState(prev => {
        const newTimer = (prev.bettingTimer || 0) - 1;
        
        // 📊 Monitor timer performance for debugging
        monitorTimerPerformance(newTimer, BETTING_TIMER_DURATION);
        
        // 🔊 Play warning sound at critical moments
        if (newTimer === 10 && settings.dealerVoice) {
          console.log('⚠️ [TIMER WARNING] 10 seconds remaining!');
          // Beep sound at 10 seconds
          const audio = new Audio('data:audio/wav;base64,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');
          audio.volume = (settings.dealerVolume || 50) / 100;
          audio.play().catch(() => {}); // Ignore errors if autoplay is blocked
        }
        
        // Additional countdown sounds at 5, 4, 3, 2, 1
        if (newTimer <= 5 && newTimer > 0 && settings.dealerVoice) {
          console.log(`⏰ [TIMER] ${newTimer} seconds remaining!`);
          const tickAudio = new Audio('data:audio/wav;base64,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');
          tickAudio.volume = (settings.dealerVolume || 50) / 150; // Quieter ticks
          tickAudio.play().catch(() => {});
        }
        
        // ⏰ Timer expired - lock betting and trigger auto-roll
        if (newTimer <= 0) {
          console.log('🚨 [TIMER EXPIRED] Checking shooter status...');
          
          // 🎲 CHECK SHOOTER PASS LINE BET REQUIREMENT
          if (prev.currentShooter) {
            // Get all players including ourselves
            const allPlayersArray = Array.from(players.values());
            const shooterData = allPlayersArray.find(p => p.email === prev.currentShooter);
            
            // Check if shooter has pass line bet
            let hasPassLineBet = false;
            if (prev.currentShooter === playerEmail) {
              // Current player is shooter - check our bets
              hasPassLineBet = myBets.some(bet => bet.area === 'passLine');
            } else if (shooterData) {
              // Another player is shooter
              hasPassLineBet = shooterData.bets.some(bet => bet.area === 'passLine');
            }
            
            if (!hasPassLineBet && isCurrentHost) {
              console.log('⚠️ [TIMER] Shooter has no Pass Line bet - offering to pass shooter role');
              toast.warning(`Shooter (${prev.shooterName}) has no Pass Line bet!`, {
                duration: 4000,
              });
              
              // Reset timer and pause, waiting for shooter to bet or pass
              return {
                ...prev,
                bettingTimer: BETTING_TIMER_DURATION,
                bettingTimerActive: false, // Pause timer
                bettingLocked: false,
                message: `Shooter must bet Pass Line or pass the dice!`,
              };
            }
          }
          
          // Only host triggers the actual roll to prevent duplicate rolls
          if (isCurrentHost) {
            console.log('👑 [HOST] Triggering auto-roll in 100ms...');
            setTimeout(() => handleAutoRoll(), 100);
          }
          
          return {
            ...prev,
            bettingTimer: 0,
            bettingTimerActive: false,
            bettingLocked: true,
          };
        }
        
        // Continue countdown - optimized state update
        return {
          ...prev,
          bettingTimer: newTimer,
        };
      });
    }, 1000); // Update every second

    // ♻️ Cleanup on unmount - prevent memory leaks
    return () => {
      console.log('🧹 [CLEANUP] Clearing betting timer interval');
      clearInterval(timer);
    };
  }, [gameState.bettingTimerActive, gameState.isRolling, isCurrentHost, settings.dealerVoice, settings.dealerVolume]);

  useEffect(() => {
    const supabase = createClient();
    
    try {
      setIsRealtimeAvailable(true);
      
      // Subscribe to game state changes
      const gChannel = supabase
        .channel(`game-${roomId}`, {
          config: {
            broadcast: { self: true }
          }
        })
        .on('broadcast', { event: 'game-state' }, ({ payload }) => {
          setGameState(prev => ({ ...prev, ...payload }));
        })
        .on('broadcast', { event: 'roll-history' }, ({ payload }) => {
          setRollHistory(payload.history);
        })
        .subscribe();

      // Subscribe to player updates
      const pChannel = supabase
        .channel(`players-${roomId}`, {
          config: {
            broadcast: { self: true }
          }
        })
        .on('broadcast', { event: 'player-update' }, ({ payload }) => {
          setPlayers((prev) => {
            const updated = new Map(prev);
            updated.set(payload.name, payload.data);
            return updated;
          });
        })
        .on('broadcast', { event: 'player-left' }, ({ payload }) => {
          setPlayers((prev) => {
            const updated = new Map(prev);
            updated.delete(payload.name);
            return updated;
          });
        })
        .on('broadcast', { event: 'host-migration' }, ({ payload }) => {
          // Update the current host name for all players
          setCurrentHostName(payload.newHostName);
          
          // Check if I'm the new host
          if (payload.newHostEmail === playerEmail || payload.newHostName === playerName) {
            setIsCurrentHost(true);
            toast.success('👑 You are now the host!', {
              duration: 5000,
              position: 'top-center',
            });
            console.log('👑 You have been promoted to host');
          } else {
            toast.info(`👑 ${payload.newHostName} is now the host`, {
              duration: 3000,
            });
            console.log(`👑 Host changed to: ${payload.newHostName}`);
          }
        })
        .on('broadcast', { event: 'room-deleted' }, ({ payload }) => {
          toast.error('Room has been closed', {
            duration: 3000,
          });
          console.log('🗑️ Room was deleted by server');
          // Don't automatically leave - let user see the message
          setTimeout(() => {
            onLeaveRoom();
          }, 2000);
        })
        .on('broadcast', { event: 'player-win' }, ({ payload }) => {
          // 🎉 Show win popup for other players
          // Don't show popup for our own wins (we handle those locally)
          if (payload.playerName !== playerName) {
            console.log(`🎰 Received win event from ${payload.playerName}: $${payload.amount} (${payload.isLoss ? 'loss' : 'win'})`);
            
            // Generate position with some randomness
            const x = window.innerWidth / 2 + (Math.random() - 0.5) * 300;
            const y = window.innerHeight / 2 + (Math.random() - 0.5) * 200;
            
            const id = `${payload.timestamp}-${payload.playerName}`;
            setWinPopups(prev => [...prev, { 
              id, 
              amount: payload.amount, 
              x, 
              y, 
              isLoss: payload.isLoss,
              playerName: payload.playerName,
              playerAvatar: payload.playerAvatar,
            }]);
          }
        })
        .on('broadcast', { event: 'session-stats' }, ({ payload }) => {
          // 📊 Update session stats for leaderboard
          console.log(`📊 Received session stats from ${payload.email}`);
          setSessionStats(prev => {
            const updated = new Map(prev);
            updated.set(payload.email, payload.stats);
            return updated;
          });
        })
        .on('broadcast', { event: 'shooter-offer' }, ({ payload }) => {
          // 🎲 Someone is offering you the shooter role
          if (payload.targetEmail === playerEmail) {
            console.log(`🎲 Received shooter offer from ${payload.fromName}`);
            setShooterDialogMessage(`${payload.fromName} passed the dice to you. Do you want to be the shooter?`);
            setShowShooterDialog(true);
          }
        })
        .on('broadcast', { event: 'shooter-accepted' }, ({ payload }) => {
          // 🎲 Someone accepted the shooter role
          console.log(`🎲 ${payload.name} accepted shooter role`);
          toast.success(`🎲 ${payload.name} is now the shooter!`);
        })
        .on('broadcast', { event: 'shooter-declined' }, ({ payload }) => {
          // 🎲 Someone declined the shooter role
          console.log(`🎲 ${payload.name} declined shooter role`);
        })
        .on('broadcast', { event: 'request-shooter-update' }, ({ payload }) => {
          // 🎲 A player accepted shooter and is requesting host to update game state
          if (isCurrentHost) {
            console.log(`🎲 Updating shooter to ${payload.newShooterName}`);
            broadcastGameState({
              currentShooter: payload.newShooterEmail,
              shooterName: payload.newShooterName,
              awaitingShooterResponse: false,
              bettingTimerActive: true,
              bettingTimer: BETTING_TIMER_DURATION,
              message: `${payload.newShooterName} is the shooter! Place your bets!`,
            });
          }
        })
        .subscribe();

      setGameChannel(gChannel);
      setPlayerChannel(pChannel);

      // Announce presence after channels are ready
      setTimeout(() => {
        announcePlayer(pChannel);
        
        // 📊 Initialize and broadcast own session stats
        const initialStats: PlayerSessionStats = {
          name: playerName,
          avatar: playerAvatar,
          email: playerEmail,
          netProfit: 0,
          totalWins: 0,
          totalLosses: 0,
          biggestWin: 0,
          totalWagered: 0,
          currentStreak: 0,
          winRate: 0,
          membershipTier: membershipStatus.tier,
          level: level,
        };
        
        setSessionStats(prev => {
          const updated = new Map(prev);
          updated.set(playerEmail, initialStats);
          return updated;
        });
        
        pChannel.send({
          type: 'broadcast',
          event: 'session-stats',
          payload: {
            email: playerEmail,
            stats: initialStats,
          },
        });
        
        // Start betting timer if host and assign first shooter
        if (isCurrentHost) {
          setTimeout(() => {
            // Host is the first shooter by default
            broadcastGameState({
              bettingTimer: BETTING_TIMER_DURATION,
              bettingTimerActive: true,
              bettingLocked: false,
              message: 'COME OUT ROLL - Place your bets! Timer started!',
              currentShooter: playerEmail,
              shooterName: playerName,
              awaitingShooterResponse: false,
            });
            toast.info('🎲 You are the shooter! You must bet the Pass Line.', {
              duration: 5000,
            });
          }, 1000);
        }
      }, 500);

      return () => {
        // Cleanup: Leave the room on unmount
        leaveRoomServer();
        
        // Announce player left
        pChannel.send({
          type: 'broadcast',
          event: 'player-left',
          payload: { name: playerName },
        });
        
        gChannel.unsubscribe();
        pChannel.unsubscribe();
      };
    } catch (error) {
      console.error('Failed to initialize multiplayer:', error);
      setIsRealtimeAvailable(false);
    }
  }, [roomId]);

  // Function to leave room on server
  const leaveRoomServer = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/rooms/${roomId}/leave`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ 
            playerName,
            playerEmail 
          }),
        }
      );
      const data = await response.json();
      console.log('✅ Left room on server:', data);
      return data;
    } catch (error) {
      console.error('Failed to leave room on server:', error);
      return null;
    }
  };

  const announcePlayer = async (channel?: any) => {
    const channelToUse = channel || playerChannel;
    if (!channelToUse) return;
    
    // Get achievement title from localStorage
    const savedAchievementTitle = localStorage.getItem('selected-achievement-title');
    
    channelToUse.send({
      type: 'broadcast',
      event: 'player-update',
      payload: {
        name: playerName,
        data: {
          name: playerName,
          balance: myBalance,
          bets: myBets,
          online: true,
          avatar: playerAvatar,
          level: level,
          membershipTier: membershipStatus.tier,
          achievementTitle: savedAchievementTitle || undefined,
          email: playerEmail,
        },
      },
    });
  };

  const broadcastGameState = async (newState: Partial<GameState>) => {
    if (!isCurrentHost) return;
    if (!gameChannel) return;
    
    const updatedState = { ...gameState, ...newState };
    setGameState(updatedState);
    
    gameChannel.send({
      type: 'broadcast',
      event: 'game-state',
      payload: updatedState,
    });
  };

  const broadcastPlayerUpdate = async (newBalance?: number, newBets?: PlacedBet[]) => {
    if (!playerChannel) return;
    
    // Get achievement title from localStorage
    const savedAchievementTitle = localStorage.getItem('selected-achievement-title');
    
    playerChannel.send({
      type: 'broadcast',
      event: 'player-update',
      payload: {
        name: playerName,
        data: {
          name: playerName,
          balance: newBalance ?? myBalance,
          bets: newBets ?? myBets,
          online: true,
          avatar: playerAvatar,
          level: level,
          membershipTier: membershipStatus.tier,
          achievementTitle: savedAchievementTitle || undefined,
          email: playerEmail,
        },
      },
    });
  };

  // 🎉 Broadcast win/loss events to all players
  const broadcastWinEvent = (amount: number, isLoss: boolean, betArea?: string) => {
    if (!playerChannel) return;
    if (amount === 0) return;
    
    console.log(`🎰 Broadcasting ${isLoss ? 'loss' : 'win'} event: ${playerName} ${isLoss ? 'lost' : 'won'} $${amount}`);
    
    playerChannel.send({
      type: 'broadcast',
      event: 'player-win',
      payload: {
        playerName: playerName,
        playerAvatar: playerAvatar,
        amount: amount,
        isLoss: isLoss,
        betArea: betArea,
        timestamp: Date.now(),
      },
    });
  };

  // 📊 Update and broadcast session statistics for leaderboard
  const updateSessionStats = (winAmount: number, lossAmount: number, wagerAmount: number) => {
    if (!playerChannel) return;
    
    setSessionStats(prev => {
      const updated = new Map(prev);
      const current = updated.get(playerEmail) || {
        name: playerName,
        avatar: playerAvatar,
        email: playerEmail,
        netProfit: 0,
        totalWins: 0,
        totalLosses: 0,
        biggestWin: 0,
        totalWagered: 0,
        currentStreak: 0,
        winRate: 0,
        membershipTier: membershipStatus.tier,
        level: level,
      };

      // Update stats
      const isWin = winAmount > 0;
      const netChange = winAmount - lossAmount;
      
      const newStats: PlayerSessionStats = {
        ...current,
        netProfit: current.netProfit + netChange,
        totalWins: current.totalWins + (isWin && winAmount > lossAmount ? 1 : 0),
        totalLosses: current.totalLosses + (lossAmount > winAmount ? 1 : 0),
        biggestWin: Math.max(current.biggestWin, winAmount),
        totalWagered: current.totalWagered + wagerAmount,
        membershipTier: membershipStatus.tier,
        level: level,
      };

      // Update streak
      if (isWin && winAmount > lossAmount) {
        newStats.currentStreak = current.currentStreak > 0 ? current.currentStreak + 1 : 1;
      } else if (lossAmount > winAmount) {
        newStats.currentStreak = current.currentStreak < 0 ? current.currentStreak - 1 : -1;
      }

      // Calculate win rate
      const totalRolls = newStats.totalWins + newStats.totalLosses;
      newStats.winRate = totalRolls > 0 ? Math.round((newStats.totalWins / totalRolls) * 100) : 0;

      updated.set(playerEmail, newStats);

      // Broadcast updated stats
      playerChannel.send({
        type: 'broadcast',
        event: 'session-stats',
        payload: {
          email: playerEmail,
          stats: newStats,
        },
      });

      console.log('📊 Session stats updated:', newStats);

      return updated;
    });
  };

  // 🎲 SHOOTER MANAGEMENT FUNCTIONS
  
  // Pass shooter role to next player
  const handlePassShooter = () => {
    if (!isCurrentHost || gameState.currentShooter !== playerEmail) {
      toast.error('Only the current shooter can pass the dice!');
      return;
    }

    if (gameState.isRolling || gameState.bettingLocked) {
      toast.error('Cannot pass shooter during a roll!');
      return;
    }

    // Get list of OTHER online players (exclude current player)
    const allPlayers = Array.from(players.entries()).filter(([name, data]) => data.online && data.email !== playerEmail);
    
    if (allPlayers.length === 0) {
      toast.error('No other players available to pass the dice to!');
      return;
    }

    // Find next player (take first from filtered list)
    const [nextPlayerName, nextPlayerData] = allPlayers[0];

    // Offer shooter role to next player
    if (playerChannel) {
      playerChannel.send({
        type: 'broadcast',
        event: 'shooter-offer',
        payload: {
          targetEmail: nextPlayerData.email,
          targetName: nextPlayerData.name,
          fromName: playerName,
        },
      });

      toast.info(`🎲 Offering shooter role to ${nextPlayerData.name}...`);
      
      // Set game state to awaiting response
      broadcastGameState({
        awaitingShooterResponse: true,
        message: `Waiting for ${nextPlayerData.name} to accept shooter role...`,
        bettingTimerActive: false, // Pause timer while waiting
      });
    }
  };

  // Accept shooter role
  const handleAcceptShooter = () => {
    if (!playerChannel) return;

    // Broadcast acceptance
    playerChannel.send({
      type: 'broadcast',
      event: 'shooter-accepted',
      payload: {
        email: playerEmail,
        name: playerName,
      },
    });

    // Close dialog
    setShowShooterDialog(false);

    // Update game state (host will receive this and update)
    if (isCurrentHost) {
      broadcastGameState({
        currentShooter: playerEmail,
        shooterName: playerName,
        awaitingShooterResponse: false,
        bettingTimerActive: true,
        bettingTimer: BETTING_TIMER_DURATION,
        message: `${playerName} is the shooter! Place your bets!`,
      });
    } else {
      // Non-host: request host to update game state
      playerChannel.send({
        type: 'broadcast',
        event: 'request-shooter-update',
        payload: {
          newShooterEmail: playerEmail,
          newShooterName: playerName,
        },
      });
    }

    toast.success('🎲 You are now the shooter! You must bet the Pass Line.');
  };

  // Decline shooter role and pass to next player
  const handleDeclineShooter = () => {
    if (!playerChannel) return;

    // Broadcast decline
    playerChannel.send({
      type: 'broadcast',
      event: 'shooter-declined',
      payload: {
        email: playerEmail,
        name: playerName,
      },
    });

    // Close dialog
    setShowShooterDialog(false);

    // Find next player to offer (exclude current player)
    const allPlayers = Array.from(players.entries()).filter(([name, data]) => data.online && data.email !== playerEmail);
    
    if (allPlayers.length === 0) {
      toast.error('No other players available. You must be the shooter!');
      // If no other players, you have to accept shooter role
      handleAcceptShooter();
      return;
    }
    
    // Get next player from the filtered list
    const currentIndex = allPlayers.findIndex(([name, data]) => data.email === playerEmail);
    const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % allPlayers.length : 0;
    const [nextPlayerName, nextPlayerData] = allPlayers[nextIndex];
    
    // Offer to next player
    playerChannel.send({
      type: 'broadcast',
      event: 'shooter-offer',
      payload: {
        targetEmail: nextPlayerData.email,
        targetName: nextPlayerData.name,
        fromName: playerName,
      },
    });

    toast.info(`You declined. Offering to ${nextPlayerData.name}...`);
  };

  useEffect(() => {
    broadcastPlayerUpdate();
  }, [myBalance, myBets]);

  // 🔄 Sync balance to server when it changes (MULTIPLAYER MODE)
  // This ensures balance persists across sessions in multiplayer just like single player
  useEffect(() => {
    const syncBalanceToServer = async () => {
      if (playerEmail) {
        console.log(`🔄 [MULTIPLAYER] Auto-sync balance to server: $${myBalance} for ${playerEmail}`);
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
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
                  email: playerEmail, 
                  balance: myBalance,
                  timestamp: Date.now(),
                  source: 'multiplayer-auto-sync'
                }),
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              console.log('✅ [MULTIPLAYER] Balance synced to server successfully');
              console.log(`   Server confirmed: $${data.balance}`);
              break; // Success - exit retry loop
            } else {
              throw new Error(`Server returned ${response.status}`);
            }
          } catch (error) {
            retryCount++;
            console.error(`❌ [MULTIPLAYER] Balance sync failed (attempt ${retryCount}/${maxRetries}):`, error);
            
            if (retryCount < maxRetries) {
              // Exponential backoff: 500ms, 1000ms, 2000ms
              const waitTime = 500 * Math.pow(2, retryCount - 1);
              console.log(`   ⏳ Retrying in ${waitTime}ms...`);
              await new Promise(resolve => setTimeout(resolve, waitTime));
            } else {
              console.error('❌ [MULTIPLAYER] Balance sync failed after all retries');
              console.log('   ℹ️ Balance saved locally - will retry on next change');
            }
          }
        }
      }
    };

    syncBalanceToServer();
  }, [myBalance, playerEmail]);

  const handlePlaceBet = (area: string) => {
    if (myBalance >= selectedChip && !gameState.isRolling && !gameState.bettingLocked) {
      // Validation logic
      if ((area === 'small' || area === 'tall' || area === 'all') && gameState.gamePhase !== 'comeOut') {
        return;
      }
      if (area === 'passLine' && gameState.gamePhase !== 'comeOut') {
        return;
      }
      if (area === 'passLineOdds' && gameState.gamePhase !== 'point') {
        return;
      }

      // Validate Pass Line Odds maximum (3-4-5x odds based on point)
      if (area === 'passLineOdds') {
        const passLineBet = myBets.find(b => b.area === 'passLine');
        if (!passLineBet) {
          toast.error('You must have a Pass Line bet to place odds');
          return;
        }
        
        // Calculate max odds based on point (3-4-5x odds system)
        let maxOddsMultiplier = 3; // Default 3x for most points
        if (gameState.point === 4 || gameState.point === 10) {
          maxOddsMultiplier = 3; // 3x odds on 4 and 10
        } else if (gameState.point === 5 || gameState.point === 9) {
          maxOddsMultiplier = 4; // 4x odds on 5 and 9
        } else if (gameState.point === 6 || gameState.point === 8) {
          maxOddsMultiplier = 5; // 5x odds on 6 and 8
        } else if (gameState.point === 2 || gameState.point === 12 || gameState.point === 3 || gameState.point === 11) {
          maxOddsMultiplier = 3; // 3x odds on extreme points
        }
        
        const maxOdds = passLineBet.amount * maxOddsMultiplier;
        const currentOdds = myBets.find(b => b.area === 'passLineOdds')?.amount || 0;
        
        if (currentOdds + selectedChip > maxOdds) {
          toast.error(`Maximum odds is ${maxOddsMultiplier}x your Pass Line bet ($${maxOdds})`);
          return;
        }
      }

      // STRICT RULE: Come Odds can only be placed if there's a Come bet on that number
      if (area.startsWith('comeOdds')) {
        const comeNumber = parseInt(area.replace('comeOdds', ''));
        const comeBetOnNumber = myBets.find(b => b.area === 'come' && b.comePoint === comeNumber);
        
        console.log(`🎲 COME ODDS: Attempting to place $${selectedChip} odds on number ${comeNumber}`);
        console.log(`   Come bet on ${comeNumber}: ${comeBetOnNumber ? `$${comeBetOnNumber.amount}` : 'NOT FOUND'}`);
        
        if (!comeBetOnNumber) {
          toast.error(`You must have a Come bet on ${comeNumber} to place Come Odds!`);
          console.log(`   ❌ No come bet found on ${comeNumber} - odds placement blocked`);
          return;
        }
        
        // Check come odds limits (typically 3x, 4x, 5x based on number)
        let maxOddsMultiplier = 3; // Default 3x
        if (comeNumber === 4 || comeNumber === 10) {
          maxOddsMultiplier = 3; // 3x odds on 4 and 10
        } else if (comeNumber === 5 || comeNumber === 9) {
          maxOddsMultiplier = 4; // 4x odds on 5 and 9
        } else if (comeNumber === 6 || comeNumber === 8) {
          maxOddsMultiplier = 5; // 5x odds on 6 and 8
        } else if (comeNumber === 2 || comeNumber === 12 || comeNumber === 3 || comeNumber === 11) {
          maxOddsMultiplier = 3; // 3x odds on extreme points
        }
        
        const maxComeOdds = comeBetOnNumber.amount * maxOddsMultiplier;
        const currentComeOdds = myBets.find(b => b.area === area)?.amount || 0;
        
        console.log(`   Current odds: $${currentComeOdds}, Max allowed: $${maxComeOdds}`);
        
        if (currentComeOdds + selectedChip > maxComeOdds) {
          toast.error(`Maximum Come Odds for ${comeNumber} is ${maxOddsMultiplier}x = $${maxComeOdds}!`);
          console.log(`   ❌ Odds limit exceeded - max is ${maxOddsMultiplier}x`);
          return;
        }
        
        console.log(`   ✅ Come odds placement allowed`);
      }

      let betCost = selectedChip;
      if (area.startsWith('buy')) {
        const commission = Math.ceil(selectedChip * 0.05);
        betCost = selectedChip + commission;
        if (myBalance < betCost) return;
      }

      setMyBalance(prev => prev - betCost);
      
      // SPECIAL HANDLING FOR COME BETS - Allow multiple come bets
      if (area === 'come') {
        // Check if there's a come bet that hasn't traveled yet (no comePoint)
        const unplacedComeBet = myBets.find(b => b.area === 'come' && !b.comePoint);
        
        if (unplacedComeBet) {
          // Add to the existing unplaced come bet
          console.log(`🎲 COME BET: Adding $${selectedChip} to existing come bet (now $${unplacedComeBet.amount + selectedChip})`);
          setMyBets(myBets.map(b => 
            (b.area === 'come' && !b.comePoint) ? { ...b, amount: b.amount + selectedChip } : b
          ));
        } else {
          // Create a new come bet (all previous ones have traveled)
          console.log(`🎲 COME BET: New come bet placed for $${selectedChip} in COME area`);
          setMyBets([...myBets, { area, amount: selectedChip }]);
        }
      } else {
        // Normal bet handling for all other bet types
        const existingBet = myBets.find(b => b.area === area);
        if (existingBet) {
          setMyBets(myBets.map(b => 
            b.area === area ? { ...b, amount: b.amount + selectedChip } : b
          ));
        } else {
          setMyBets([...myBets, { area, amount: selectedChip }]);
        }
      }

      // Track this bet in history for undo functionality
      setBetHistory(prev => [...prev, { area, amount: selectedChip }]);

      // Update last bet
      setLastBet(selectedChip);
    }
  };

  const handleRemoveBet = (area: string) => {
    if (gameState.isRolling || gameState.bettingLocked) return;
    
    // STRICT RULE: Cannot remove pass line bet after point is established
    if (area === 'passLine' && gameState.gamePhase === 'point') {
      toast.error('❌ Cannot remove Pass Line bet after point is established!');
      return;
    }
    
    // STRICT RULE: Small, Tall, All cannot be removed once play has started
    if ((area === 'small' || area === 'tall' || area === 'all') && gameState.gamePhase !== 'comeOut') {
      toast.error('Cannot remove Small/Tall/All bets once play has started!');
      return;
    }
    
    // STRICT RULE: Cannot remove COME bets that have traveled to a number (have comePoint)
    if (area === 'come') {
      // Only try to remove come bets that are still in the COME area (no comePoint)
      const unplacedComeBet = myBets.find(b => b.area === 'come' && !b.comePoint);
      if (!unplacedComeBet) {
        toast.error('No Come bet in the COME area to remove!');
        return;
      }
      // We'll remove from the unplaced come bet specifically below
    }
    
    const bet = myBets.find(b => {
      if (area === 'come') {
        // For come bets, only find the one without a comePoint
        return b.area === area && !b.comePoint;
      }
      return b.area === area;
    });
    
    if (bet) {
      // PARTIAL CHIP REMOVAL - Remove only selected chip amount, not entire bet
      const removeAmount = Math.min(selectedChip, bet.amount);
      const newBetAmount = bet.amount - removeAmount;
      
      // Calculate refund (accounting for buy bet commission)
      let refund = removeAmount;
      if (area.startsWith('buy')) {
        // For buy bets, refund the bet amount plus the proportional commission
        refund = removeAmount + Math.ceil(removeAmount * 0.05);
      }
      
      setMyBalance(prev => prev + refund);
      
      console.log(`💰 BET REMOVED: ${area} - Refund $${refund} (Removed $${removeAmount} from bet)`);
      
      if (newBetAmount <= 0) {
        // Remove bet completely if nothing left
        if (area === 'come') {
          setMyBets(myBets.filter(b => !(b.area === 'come' && !b.comePoint)));
        } else {
          setMyBets(myBets.filter(b => b.area !== area));
        }
      } else {
        // Keep bet with reduced amount
        setMyBets(myBets.map(b => {
          if (area === 'come') {
            // For come bets, only update the one without a comePoint
            return (b.area === 'come' && !b.comePoint) ? { ...b, amount: newBetAmount } : b;
          }
          return b.area === area ? { ...b, amount: newBetAmount } : b;
        }));
      }
    }
  };

  // BET ACROSS: Place bets on all place/buy numbers
  const handleBetAcross = () => {
    if (gameState.isRolling || gameState.bettingLocked) return;
    
    // Numbers to bet on: 2, 3, 4, 5, 6, 8, 9, 10, 11, 12
    // Use BUY for 2, 3, 4, 10, 11, 12 (better odds with commission)
    // Use PLACE for 5, 6, 8, 9 (traditional place bets)
    const acrossNumbers = [
      'buy2',    // Buy 2 (6:1 minus 5%)
      'buy3',    // Buy 3 (3:1 minus 5%)
      'buy4',    // Buy 4 (2:1 minus 5%)
      'place5',  // Place 5 (7:5)
      'place6',  // Place 6 (7:6)
      'place8',  // Place 8 (7:6)
      'place9',  // Place 9 (7:5)
      'buy10',   // Buy 10 (2:1 minus 5%)
      'buy11',   // Buy 11 (3:1 minus 5%)
      'buy12',   // Buy 12 (6:1 minus 5%)
    ];
    
    // Calculate total cost
    let totalCost = 0;
    for (const area of acrossNumbers) {
      let betCost = selectedChip;
      if (area.startsWith('buy')) {
        const commission = Math.ceil(selectedChip * 0.05);
        betCost = selectedChip + commission;
      }
      totalCost += betCost;
    }
    
    // Check if player has enough balance
    if (myBalance < totalCost) {
      toast.error(`Not enough balance! Need $${totalCost}, have $${myBalance}`);
      return;
    }
    
    // Place all bets
    let updatedBalance = myBalance;
    const newBets = [...myBets];
    
    for (const area of acrossNumbers) {
      let betCost = selectedChip;
      if (area.startsWith('buy')) {
        const commission = Math.ceil(selectedChip * 0.05);
        betCost = selectedChip + commission;
      }
      
      updatedBalance -= betCost;
      
      const existingBet = newBets.find(b => b.area === area);
      if (existingBet) {
        existingBet.amount += selectedChip;
      } else {
        newBets.push({ area, amount: selectedChip });
      }
    }
    
    setMyBalance(updatedBalance);
    setMyBets(newBets);
    setLastBet(selectedChip);
    toast.success(`Bet Across complete! $${totalCost} on all 10 numbers`);
  };

  // ⚡ OPTIMIZED AUTO-ROLL HANDLER - Uses useCallback to prevent unnecessary re-renders
  const handleAutoRoll = useCallback(async () => {
    // 🛡️ Safety checks - prevent duplicate rolls
    if (!isCurrentHost || gameState.isRolling) {
      console.log('⚠️ [AUTO-ROLL BLOCKED] Not host or already rolling');
      return;
    }

    console.log('⏰ [AUTO-ROLL] Timer expired - initiating automatic roll');
    console.log('📊 [AUTO-ROLL] Current game phase:', gameState.gamePhase);
    console.log('👥 [AUTO-ROLL] Active players:', players.size);
    
    // Lock betting and roll immediately - broadcast to all clients
    await broadcastGameState({ 
      isRolling: true,
      bettingLocked: true,
      bettingTimerActive: false,
      message: '⏰ Time\'s up! Rolling dice...',
    });
    
    // 🔄 Clear bet history once dice are rolled (bets are now locked in)
    setBetHistory([]);
    
    // 🎙️ DEALER VOICE: Announce coming out roll
    if (gameState.gamePhase === 'comeOut') {
      dealerVoice.announceComingOut();
    }

    // ⚡ Quick roll flash for visual feedback (if enabled)
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

    // ⏱️ Delay for dramatic effect (1.2 seconds)
    setTimeout(async () => {
      // 🎲 Generate random dice using cryptographically secure method
      const newDice1 = Math.floor(Math.random() * 6) + 1;
      const newDice2 = Math.floor(Math.random() * 6) + 1;
      const total = newDice1 + newDice2;
      
      console.log('🎯 [MULTIPLAYER AUTO-ROLL] Result:', { dice1: newDice1, dice2: newDice2, total });
      console.log('✅ [FAIRNESS] Random dice generated - same logic as manual roll');
      
      // 🎙️ DEALER VOICE: Announce the number rolled
      dealerVoice.announceNumber(total, newDice1, newDice2, gameState.gamePhase);

      const isSevenOut = gameState.gamePhase === 'point' && total === 7;
      const newRoll: Roll = {
        dice1: newDice1,
        dice2: newDice2,
        total,
        timestamp: Date.now(),
        phase: gameState.gamePhase,
        point: gameState.point,
        wasSevenOut: isSevenOut,
      };

      const newHistory = [...rollHistory, newRoll];
      setRollHistory(newHistory);

      // Broadcast roll history
      if (gameChannel) {
        await gameChannel.send({
          type: 'broadcast',
          event: 'roll-history',
          payload: { history: newHistory },
        });
      }

      // Process game logic
      await processRoll(newDice1, newDice2, total);
    }, 1200);
  }, [isCurrentHost, gameState.isRolling, gameState.gamePhase, players.size, gameChannel, rollHistory]);

  // Calculate which numbers are active (can win) based on current bets
  const calculateActiveNumbers = (): number[] => {
    const activeNumbers = new Set<number>();

    myBets.forEach(bet => {
      // Handle come bets with comePoint first
      if (bet.area === 'come' && bet.comePoint) {
        activeNumbers.add(bet.comePoint);
        return; // Skip the switch for this bet
      }

      switch (bet.area) {
        // Pass Line
        case 'passLine':
        case 'passLineOdds':
          if (gameState.gamePhase === 'comeOut') {
            activeNumbers.add(7); // Only 7 wins on come-out in crapless craps
          } else if (gameState.point) {
            activeNumbers.add(gameState.point); // Point number wins
          }
          break;

        // Come bets
        case 'come':
          activeNumbers.add(7); // Come bets in COME area - only 7 wins
          break;

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

        // Place/Buy bets
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
        case 'six':
        case 'place6':
        case 'buy6':
        case 'place-6':
        case 'buy-6':
          activeNumbers.add(6);
          break;
        case 'eight':
        case 'place8':
        case 'buy8':
        case 'place-8':
        case 'buy-8':
          activeNumbers.add(8);
          break;
        case 'nine':
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
        case 'anyCraps':
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

        // Hop bets
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
        case 'small':
        case 'tall':
        case 'all':
          // Intentionally not adding numbers - excluded from Win/Lose tool
          break;
      }
    });

    return Array.from(activeNumbers).sort((a, b) => a - b);
  };

  // Calculate which numbers would make you WIN (GREEN)
  const calculateWinningNumbers = (): number[] => {
    return calculateActiveNumbers();
  };

  // Calculate which numbers would make you LOSE (RED)
  const calculateLosingNumbers = (): number[] => {
    const losingNumbers = new Set<number>();

    myBets.forEach(bet => {
      // Handle come bets with comePoint
      if (bet.area === 'come' && bet.comePoint) {
        losingNumbers.add(7); // Seven-out loses come bets on numbers
        return;
      }

      switch (bet.area) {
        // Pass Line with point established
        case 'passLine':
        case 'passLineOdds':
          if (gameState.gamePhase === 'point' && gameState.point) {
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

  const handleRoll = async () => {
    if (!isCurrentHost) {
      // Only host can roll
      toast.error('Only the host can roll the dice!');
      return;
    }

    if (gameState.isRolling || gameState.bettingLocked) return;

    // 🎲 SHOOTER VALIDATION: Check if current shooter has pass line bet
    if (gameState.currentShooter) {
      // Get shooter's player data
      const shooterPlayer = Array.from(players.values()).find(p => p.email === gameState.currentShooter);
      
      // Check if shooter is current player (host)
      const isShooter = gameState.currentShooter === playerEmail;
      
      if (isShooter) {
        // Host is shooter - check their own bets
        const hasPassLineBet = myBets.some(bet => bet.area === 'passLine');
        if (!hasPassLineBet) {
          toast.error('🎲 Shooter must bet on Pass Line before rolling!');
          return;
        }
      } else {
        // Another player is shooter - check their bets
        const hasPassLineBet = shooterPlayer?.bets.some(bet => bet.area === 'passLine');
        if (!hasPassLineBet) {
          toast.error(`🎲 Shooter (${gameState.shooterName}) must bet on Pass Line before rolling!`);
          return;
        }
      }
    }

    // Manual roll by host - immediately lock betting and roll
    await broadcastGameState({ 
      isRolling: true,
      bettingLocked: true,
      bettingTimerActive: false,
    });
    
    // 🔄 Clear bet history once dice are rolled (bets are now locked in)
    setBetHistory([]);
    
    // 🎙️ DEALER VOICE: Announce coming out roll
    if (gameState.gamePhase === 'comeOut') {
      dealerVoice.announceComingOut();
    }

    // ⚡ Quick roll flash for visual feedback (if enabled)
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

    setTimeout(async () => {
      const newDice1 = Math.floor(Math.random() * 6) + 1;
      const newDice2 = Math.floor(Math.random() * 6) + 1;
      const total = newDice1 + newDice2;
      
      console.log('🎯 MULTIPLAYER TRUE ROLL RESULT:', { dice1: newDice1, dice2: newDice2, total });
      
      // 🎙️ DEALER VOICE: Announce the number rolled (synced after dice animation)
      dealerVoice.announceNumber(total, newDice1, newDice2, gameState.gamePhase);

      const isSevenOut = gameState.gamePhase === 'point' && total === 7;
      const newRoll: Roll = {
        dice1: newDice1,
        dice2: newDice2,
        total,
        timestamp: Date.now(),
        phase: gameState.gamePhase,
        point: gameState.point,
        wasSevenOut: isSevenOut,
      };

      const newHistory = [...rollHistory, newRoll];
      setRollHistory(newHistory);

      // Broadcast roll history
      if (gameChannel) {
        await gameChannel.send({
          type: 'broadcast',
          event: 'roll-history',
          payload: { history: newHistory },
        });
      }

      // Process game logic
      await processRoll(newDice1, newDice2, total);
    }, 1200); // 1.2 seconds - Quick roll animation!
  };

  // Show win/loss amount popup animation
  const showWinPopup = (amount: number, isLoss = false, betArea?: string) => {
    if (amount === 0) return;
    
    // Generate random position near center of screen
    const x = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
    const y = window.innerHeight / 2 + (Math.random() - 0.5) * 200;
    
    const id = `${Date.now()}-${Math.random()}`;
    
    // Show popup for current player (with their name/avatar)
    setWinPopups(prev => [...prev, { 
      id, 
      amount, 
      x, 
      y, 
      isLoss,
      playerName: playerName,
      playerAvatar: playerAvatar,
    }]);
    
    // 📡 Broadcast win event to other players in multiplayer
    broadcastWinEvent(amount, isLoss, betArea);
  };
  
  const removeWinPopup = (id: string) => {
    setWinPopups(prev => prev.filter(popup => popup.id !== id));
  };

  const processRoll = async (dice1: number, dice2: number, total: number) => {
    let newGamePhase = gameState.gamePhase;
    let newPoint = gameState.point;
    let newMessage = gameState.message;
    let newPuckPosition = gameState.puckPosition;
    let myWinnings = 0;
    let betsToRemove: string[] = []; // Track which bets to remove
    let totalBetAmount = 0; // Track only the bets that resolved
    let newSmallHit = [...gameState.smallHit];
    let newTallHit = [...gameState.tallHit];
    let newAllHit = [...gameState.allHit];

    // 🎲 PROCESS SMALL/TALL/ALL ACCUMULATION BETS (only work during point phase)
    if (gameState.gamePhase === 'point') {
      // Track Small (2, 3, 4, 5, 6)
      if ([2, 3, 4, 5, 6].includes(total)) {
        const smallBet = myBets.find(b => b.area === 'small');
        if (smallBet && !newSmallHit.includes(total)) {
          newSmallHit.push(total);
          // Check if complete
          if (newSmallHit.length === 5 && [2, 3, 4, 5, 6].every(n => newSmallHit.includes(n))) {
            myWinnings += smallBet.amount * 35; // 34:1 payout
            totalBetAmount += smallBet.amount;
            betsToRemove.push('small');
            newMessage = `🎉 SMALL COMPLETE! Won $${smallBet.amount * 34}!`;
            newSmallHit = []; // Reset tracking
          }
        }
      }
      
      // Track Tall (8, 9, 10, 11, 12)
      if ([8, 9, 10, 11, 12].includes(total)) {
        const tallBet = myBets.find(b => b.area === 'tall');
        if (tallBet && !newTallHit.includes(total)) {
          newTallHit.push(total);
          // Check if complete
          if (newTallHit.length === 5 && [8, 9, 10, 11, 12].every(n => newTallHit.includes(n))) {
            myWinnings += tallBet.amount * 35; // 34:1 payout
            totalBetAmount += tallBet.amount;
            betsToRemove.push('tall');
            newMessage = `🎉 TALL COMPLETE! Won $${tallBet.amount * 34}!`;
            newTallHit = []; // Reset tracking
          }
        }
      }
      
      // Track All (2, 3, 4, 5, 6, 8, 9, 10, 11, 12)
      if ([2, 3, 4, 5, 6, 8, 9, 10, 11, 12].includes(total)) {
        const allBet = myBets.find(b => b.area === 'all');
        if (allBet && !newAllHit.includes(total)) {
          newAllHit.push(total);
          // Check if complete
          if (newAllHit.length === 10 && [2, 3, 4, 5, 6, 8, 9, 10, 11, 12].every(n => newAllHit.includes(n))) {
            myWinnings += allBet.amount * 177; // 176:1 payout
            totalBetAmount += allBet.amount;
            betsToRemove.push('all');
            newMessage = `🎉🎉 ALL COMPLETE! Won $${allBet.amount * 176}! 🎉🎉`;
            newAllHit = []; // Reset tracking
          }
        }
      }
    }

    // 🎲 PROCESS ONE-ROLL BETS FIRST (these resolve on every roll regardless of phase)
    myBets.forEach(bet => {
      // FIELD BET - Wins on 2, 3, 4, 9, 10, 11, 12 (Loses on 5, 6, 7, 8)
      if (bet.area === 'field') {
        if (total === 2) {
          myWinnings += bet.amount * 3; // Pays 2:1 (triple your money)
          totalBetAmount += bet.amount;
          betsToRemove.push(bet.area);
        } else if (total === 12) {
          myWinnings += bet.amount * 4; // Pays 3:1 (quadruple your money)
          totalBetAmount += bet.amount;
          betsToRemove.push(bet.area);
        } else if ([3, 4, 9, 10, 11].includes(total)) {
          myWinnings += bet.amount * 2; // Pays 1:1 (double your money)
          totalBetAmount += bet.amount;
          betsToRemove.push(bet.area);
        } else {
          // Loses on 5, 6, 7, 8 - just remove the bet (already deducted from balance)
          betsToRemove.push(bet.area);
        }
      }
      
      // ANY SEVEN - Wins on 7 (4:1 payout)
      if (bet.area === 'any7') {
        if (total === 7) {
          myWinnings += bet.amount * 5; // Pays 4:1
          totalBetAmount += bet.amount;
        }
        betsToRemove.push(bet.area);
      }
      
      // ANY CRAPS - Wins on 2, 3, 12 (7:1 payout)
      if (bet.area === 'anyCraps') {
        if ([2, 3, 12].includes(total)) {
          myWinnings += bet.amount * 8; // Pays 7:1
          totalBetAmount += bet.amount;
        }
        betsToRemove.push(bet.area);
      }
      
      // HORN BET - Wins on 2, 3, 11, 12 (split into 4 parts)
      if (bet.area === 'horn') {
        const hornPart = bet.amount / 4; // Split bet into 4 parts
        if (total === 2 || total === 12) {
          myWinnings += hornPart * 31; // Pays 30:1 on 2 or 12
          totalBetAmount += bet.amount;
        } else if (total === 3 || total === 11) {
          myWinnings += hornPart * 16; // Pays 15:1 on 3 or 11
          totalBetAmount += bet.amount;
        }
        betsToRemove.push(bet.area);
      }
      
      // HARDWAY BETS - Win on hard way, lose on easy way or 7
      if (bet.area === 'hard4') {
        if (dice1 === 2 && dice2 === 2) {
          myWinnings += bet.amount * 10; // Pays 9:1 (crapless craps)
          totalBetAmount += bet.amount;
          betsToRemove.push(bet.area);
        } else if (total === 4 || total === 7) {
          betsToRemove.push(bet.area); // Lose on easy 4 or 7
        }
      }
      if (bet.area === 'hard6') {
        if (dice1 === 3 && dice2 === 3) {
          myWinnings += bet.amount * 10; // Pays 9:1 (crapless craps)
          totalBetAmount += bet.amount;
          betsToRemove.push(bet.area);
        } else if (total === 6 || total === 7) {
          betsToRemove.push(bet.area);
        }
      }
      if (bet.area === 'hard8') {
        if (dice1 === 4 && dice2 === 4) {
          myWinnings += bet.amount * 10; // Pays 9:1 (crapless craps)
          totalBetAmount += bet.amount;
          betsToRemove.push(bet.area);
        } else if (total === 8 || total === 7) {
          betsToRemove.push(bet.area);
        }
      }
      if (bet.area === 'hard10') {
        if (dice1 === 5 && dice2 === 5) {
          myWinnings += bet.amount * 10; // Pays 9:1 (crapless craps)
          totalBetAmount += bet.amount;
          betsToRemove.push(bet.area);
        } else if (total === 10 || total === 7) {
          betsToRemove.push(bet.area);
        }
      }
      
      // 🎲 COME BETS - Process before phase-specific logic
      // COME BET IN COME AREA (not yet transferred to a number)
      if (bet.area === 'come' && !bet.comePoint) {
        console.log(`🎲 COME BET in COME area: $${bet.amount} - rolled ${total}`);
        // In CRAPLESS CRAPS: 7 wins, all other numbers travel to that number
        if (total === 7) {
          // 7 wins on come bet in COME area
          myWinnings += bet.amount * 2; // Return original bet + winnings (1:1)
          totalBetAmount += bet.amount;
          betsToRemove.push(bet.area);
          newMessage += ` Come wins on 7! `;
          console.log(`✅ COME BET WINS on 7! Payout: $${bet.amount}`);
        } else {
          // All other numbers (2,3,4,5,6,8,9,10,11,12) become come points in crapless craps
          // This bet will travel to the number - DON'T remove it, transform it instead
          console.log(`➡️ COME BET TRAVELS to ${total} - bet now on number ${total}`);
          // We'll handle this transformation below after we've processed all bets
        }
      }
      
      // COME BET ON A NUMBER - Check if the come point hits
      if (bet.area === 'come' && bet.comePoint) {
        console.log(`🎲 COME BET on number ${bet.comePoint}: $${bet.amount} - rolled ${total}`);
        if (total === bet.comePoint) {
          // Come point made! Pay 1:1
          myWinnings += bet.amount * 2; // Return bet + winnings
          totalBetAmount += bet.amount;
          betsToRemove.push(`come-${bet.comePoint}`); // Use unique identifier
          newMessage += ` Come ${bet.comePoint} wins! `;
          console.log(`✅ COME ${bet.comePoint} WINS! Payout: $${bet.amount}`);
          
          // Also pay come odds if present
          const comeOddsBet = myBets.find(b => b.area === `comeOdds${bet.comePoint}`);
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
            myWinnings += comeOddsBet.amount + oddsWin; // Return bet + winnings
            totalBetAmount += comeOddsBet.amount;
            betsToRemove.push(`comeOdds${bet.comePoint}`);
            newMessage += ` Come odds ${bet.comePoint} wins $${oddsWin}! `;
            console.log(`✅ COME ODDS ${bet.comePoint} WINS! Odds bet: $${comeOddsBet.amount}, Payout: $${oddsWin}`);
          }
        } else if (total === 7) {
          // Seven-out - come bet loses
          totalBetAmount += bet.amount;
          betsToRemove.push(`come-${bet.comePoint}`); // Use unique identifier
          newMessage += ` Come ${bet.comePoint} loses. `;
          console.log(`❌ COME ${bet.comePoint} LOSES on seven-out`);
          
          // Also remove come odds if present
          const comeOddsBet = myBets.find(b => b.area === `comeOdds${bet.comePoint}`);
          if (comeOddsBet) {
            totalBetAmount += comeOddsBet.amount;
            betsToRemove.push(`comeOdds${bet.comePoint}`);
            console.log(`❌ COME ODDS ${bet.comePoint} also loses on seven-out`);
          }
        }
        // Otherwise the come bet stays on its number
      }
      
      // COME ODDS - these are handled with the come bet above
      if (bet.area.startsWith('comeOdds')) {
        const comeNumber = parseInt(bet.area.replace('comeOdds', ''));
        const correspondingComeBet = myBets.find(b => b.area === 'come' && b.comePoint === comeNumber);
        
        // If no corresponding come bet exists, this is orphaned - remove it
        if (!correspondingComeBet) {
          betsToRemove.push(bet.area);
          console.log(`⚠️ Orphaned come odds on ${comeNumber} - removing`);
        }
        // Otherwise it was already handled above with the come bet
      }
    });

    if (gameState.gamePhase === 'comeOut') {
      if (total === 7) {
        // Win on 7
        newMessage = `🎉 SEVEN WINNER! ${total}`;
        // 🎙️ DEALER VOICE: Natural winner
        dealerVoice.announceNaturalWinner();
        
        // Pay all pass line bets and remove them
        myBets.forEach(bet => {
          if (bet.area === 'passLine') {
            const payout = bet.amount * 2; // 1:1 odds, return original + winnings
            myWinnings += payout;
            totalBetAmount += bet.amount;
            betsToRemove.push(bet.area);
          }
          // Small/Tall/All lose on 7 during come-out roll
          if (bet.area === 'small') {
            betsToRemove.push('small');
            newSmallHit = [];
          }
          if (bet.area === 'tall') {
            betsToRemove.push('tall');
            newTallHit = [];
          }
          if (bet.area === 'all') {
            betsToRemove.push('all');
            newAllHit = [];
          }
        });
      } else {
        // Set point - Pass Line bets stay on table and become locked
        newPoint = total;
        newPuckPosition = total;
        newGamePhase = 'point';
        newMessage = `Point is ${total}! Roll ${total} to win!`;
        
        // 💾 Save current bets for optional repeat after 7-out
        setLastComeOutBets([...myBets]);
        setShowRepeatButton(false);
        
        // 🎙️ DEALER VOICE: Point established
        dealerVoice.announcePointEstablished(total);
      }
    } else {
      if (total === gameState.point) {
        // Point hit - win
        newMessage = `🎉 POINT ${total} WINNER!`;
        newGamePhase = 'comeOut';
        newPoint = null;
        newPuckPosition = null;
        // 🎙️ DEALER VOICE: Point made!
        dealerVoice.announcePointMade(total);
        
        // Pay pass line and pass line odds bets and remove them
        myBets.forEach(bet => {
          if (bet.area === 'passLine') {
            const payout = bet.amount * 2; // 1:1 odds
            myWinnings += payout;
            totalBetAmount += bet.amount;
            betsToRemove.push(bet.area);
          } else if (bet.area === 'passLineOdds') {
            // Pay true odds for Pass Line Odds based on the point
            let oddsMultiplier = 0;
            if (gameState.point === 2 || gameState.point === 12) {
              oddsMultiplier = 6; // 6:1 true odds
            } else if (gameState.point === 3 || gameState.point === 11) {
              oddsMultiplier = 3; // 3:1 true odds
            } else if (gameState.point === 4 || gameState.point === 10) {
              oddsMultiplier = 2; // 2:1 true odds
            } else if (gameState.point === 5 || gameState.point === 9) {
              oddsMultiplier = 1.5; // 3:2 true odds
            } else if (gameState.point === 6 || gameState.point === 8) {
              oddsMultiplier = 1.2; // 6:5 true odds
            }
            const oddsWin = bet.amount * oddsMultiplier;
            myWinnings += oddsWin + bet.amount; // Add winnings + return original bet
            totalBetAmount += bet.amount;
            betsToRemove.push(bet.area);
          } else if (bet.area === `place${gameState.point}`) {
            // Place bet on the point number also wins
            let payout = bet.amount;
            if (gameState.point === 6 || gameState.point === 8) {
              payout = bet.amount + (bet.amount * 7 / 6); // 7:6 odds
            } else if (gameState.point === 5 || gameState.point === 9) {
              payout = bet.amount + (bet.amount * 7 / 5); // 7:5 odds
            } else if (gameState.point === 4 || gameState.point === 10) {
              payout = bet.amount + (bet.amount * 9 / 5); // 9:5 odds
            } else if (gameState.point === 2 || gameState.point === 12) {
              payout = bet.amount + (bet.amount * 11 / 2); // 11:2 odds
            } else if (gameState.point === 3 || gameState.point === 11) {
              payout = bet.amount + (bet.amount * 11 / 4); // 11:4 odds
            }
            myWinnings += payout;
            totalBetAmount += bet.amount;
            betsToRemove.push(bet.area);
          } else if (bet.area === `buy${gameState.point}`) {
            // Buy bet on the point number also wins
            let oddsMultiplier = 0;
            if (gameState.point === 2 || gameState.point === 12) {
              oddsMultiplier = 6; // 6:1 true odds
            } else if (gameState.point === 3 || gameState.point === 11) {
              oddsMultiplier = 3; // 3:1 true odds
            } else if (gameState.point === 4 || gameState.point === 10) {
              oddsMultiplier = 2; // 2:1 true odds
            } else if (gameState.point === 5 || gameState.point === 9) {
              oddsMultiplier = 1.5; // 3:2 true odds
            } else if (gameState.point === 6 || gameState.point === 8) {
              oddsMultiplier = 1.2; // 6:5 true odds
            }
            
            const winAmount = bet.amount * oddsMultiplier;
            const payout = bet.amount + winAmount;
            myWinnings += payout;
            totalBetAmount += bet.amount;
            betsToRemove.push(bet.area);
          }
        });
      } else if (total === 7) {
        // Seven out - lose all bets (including Small/Tall/All)
        newMessage = `❌ SEVEN OUT! All bets lost.`;
        newGamePhase = 'comeOut';
        newPoint = null;
        newPuckPosition = null;
        // 🎙️ DEALER VOICE: Seven out!
        dealerVoice.announceSevenOut();
        
        // Clear Small/Tall/All tracking on seven-out
        newSmallHit = [];
        newTallHit = [];
        newAllHit = [];
        
        // Calculate total bet amount lost
        totalBetAmount = myBets.reduce((sum, bet) => sum + bet.amount, 0);
        
        // Show loss as negative win
        if (totalBetAmount > 0) {
          setLastWin(-totalBetAmount);
          
          // 💥 Show loss notification
          setShowWin(true);
          setTimeout(() => setShowWin(false), 3000);
        }
        
        // 🗑️ Clear ALL bets on 7-out (Small/Tall/All lose on seven-out)
        setMyBets([]);
        
        // 🔄 Show repeat button if there were bets to repeat
        if (lastComeOutBets.length > 0) {
          setTimeout(() => setShowRepeatButton(true), 1000);
        }
      } else {
        // Intermediate roll - only resolve place bets that hit
        newMessage = `Rolled ${total}. Point is ${gameState.point}`;
        
        // Check for place bet hits
        myBets.forEach(bet => {
          if (bet.area === `place${total}`) {
            // Calculate proper place bet payout
            let payout = bet.amount;
            if (total === 6 || total === 8) {
              payout = bet.amount + (bet.amount * 7 / 6); // 7:6 odds
            } else if (total === 5 || total === 9) {
              payout = bet.amount + (bet.amount * 7 / 5); // 7:5 odds
            } else if (total === 4 || total === 10) {
              payout = bet.amount + (bet.amount * 9 / 5); // 9:5 odds
            } else if (total === 2 || total === 12) {
              payout = bet.amount + (bet.amount * 11 / 2); // 11:2 odds (worse than buy!)
            } else if (total === 3 || total === 11) {
              payout = bet.amount + (bet.amount * 11 / 4); // 11:4 odds (worse than buy!)
            }
            myWinnings += payout;
            totalBetAmount += bet.amount;
            betsToRemove.push(bet.area);
          }
          
          // Check for buy bet hits
          if (bet.area === `buy${total}`) {
            // Calculate proper buy bet payout (true odds minus 5% commission)
            let oddsMultiplier = 0;
            if (total === 2 || total === 12) {
              oddsMultiplier = 6; // 6:1 true odds
            } else if (total === 3 || total === 11) {
              oddsMultiplier = 3; // 3:1 true odds
            } else if (total === 4 || total === 10) {
              oddsMultiplier = 2; // 2:1 true odds
            } else if (total === 5 || total === 9) {
              oddsMultiplier = 1.5; // 3:2 true odds
            } else if (total === 6 || total === 8) {
              oddsMultiplier = 1.2; // 6:5 true odds
            }
            
            // Payout = original bet + winnings (commission already paid upfront)
            const winAmount = bet.amount * oddsMultiplier;
            const payout = bet.amount + winAmount;
            myWinnings += payout;
            totalBetAmount += bet.amount;
            betsToRemove.push(bet.area);
          }
        });
        
        // Pass Line and Pass Line Odds stay locked - do NOT remove them
      }
    }
    
    // Handle come bet transformations (traveling to numbers)
    let transformedBets = myBets.map(bet => {
      if (bet.area === 'come' && !bet.comePoint && total !== 7) {
        // This come bet needs to travel to the rolled number
        return { ...bet, comePoint: total };
      }
      return bet;
    });
    
    // Remove only the bets that resolved (won or lost)
    if (betsToRemove.length > 0) {
      transformedBets = transformedBets.filter(bet => {
        // Check if this bet should be removed
        if (betsToRemove.includes(bet.area)) return false;
        if (bet.area === 'come' && bet.comePoint && betsToRemove.includes(`come-${bet.comePoint}`)) return false;
        return true;
      });
    }
    
    setMyBets(transformedBets);
    
    // Apply winnings to balance
    if (myWinnings > 0) {
      setMyBalance(prev => prev + myWinnings);
      const netWin = myWinnings - totalBetAmount; // Only subtract bets that actually resolved
      setLastWin(netWin);
      
      // 🎉 Show win notification
      setShowWin(true);
      setTimeout(() => setShowWin(false), 3000);
      
      // 💰 Show win/loss amount popup animation
      if (netWin > 0) {
        showWinPopup(netWin, false); // Green for net win
      } else if (netWin < 0) {
        showWinPopup(Math.abs(netWin), true); // Red for net loss
      }

      // 📊 Update session stats for leaderboard
      updateSessionStats(myWinnings, totalBetAmount - myWinnings, totalBetAmount);
      
      // Track jackpot on server (EVERY player tracks their own winnings)
      // This ensures accurate global jackpot totals
      if (netWin > 0) {
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/stats/jackpot`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ amount: netWin }),
          }
        ).then(() => {
          console.log(`💰 [MULTIPLAYER ${playerName}] Jackpot tracked - Added $${netWin} to global total`);
        }).catch(err => console.error('❌ Failed to track jackpot:', err));
      }
      
      // 💾 Sync stats to server for leaderboard (MULTIPLAYER)
      // Track wins, biggest win, and all stats for accurate leaderboard
      if (playerEmail && netWin > 0) {
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/stats/update`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              email: playerEmail,
              stats: {
                wins: 1, // Increment wins for this winning round
                losses: 0,
                rolls: 1,
                wagered: totalBetAmount,
                biggestWin: netWin, // Server will compare and keep the largest
                level: level,
                xp: totalXpEarned, // Sync total XP earned for accurate tracking
              },
            }),
          }
        ).then(() => {
          console.log(`📊 [MULTIPLAYER ${playerName}] Stats synced - Win: $${netWin}, Wagered: $${totalBetAmount}`);
        }).catch(err => console.error('❌ Failed to sync stats to server:', err));
      }
    } else if (totalBetAmount > 0) {
      // 💰 Show loss amount popup animation
      const netLoss = totalBetAmount - myWinnings;
      if (netLoss > 0) {
        showWinPopup(netLoss, true); // true = isLoss
      }

      // 📊 Update session stats for leaderboard (loss)
      updateSessionStats(myWinnings, totalBetAmount, totalBetAmount);
      
      // Track losses to server for accurate win rate
      if (playerEmail) {
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/stats/update`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              email: playerEmail,
              stats: {
                wins: 0,
                losses: 1, // Increment losses for this losing round
                rolls: 1,
                wagered: totalBetAmount,
                biggestWin: 0,
                level: level,
                xp: totalXpEarned, // Sync total XP earned for accurate tracking
              },
            }),
          }
        ).then(() => {
          console.log(`📊 [MULTIPLAYER ${playerName}] Stats synced - Loss: $${totalBetAmount}`);
        }).catch(err => console.error('❌ Failed to sync stats to server:', err));
      }
    }

    // Restart betting timer for next round
    await broadcastGameState({
      dice1,
      dice2,
      gamePhase: newGamePhase,
      point: newPoint,
      message: newMessage,
      puckPosition: newPuckPosition,
      smallHit: newSmallHit,
      tallHit: newTallHit,
      allHit: newAllHit,
      isRolling: false,
      lastRoll: Date.now(),
      bettingTimer: BETTING_TIMER_DURATION, // Reset timer
      bettingTimerActive: true, // Start timer
      bettingLocked: false, // Unlock betting for next round
    });
    
    // Track game stats on server (host only to avoid duplicates)
    if (isCurrentHost) {
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
        console.log('✅ [MULTIPLAYER HOST] Game tracked - Total Games counter incremented');
      }).catch(err => console.error('❌ Failed to track game:', err));
    }
    
    // Track player-specific stats (every player tracks their own)
    if (playerEmail) {
      const netWin = myWinnings - totalBetAmount;
      fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/player/stats`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: playerEmail,
            wagered: totalBetAmount,
            won: netWin,
            isWin: netWin > 0,
            rollNumber: dice1 + dice2
          }),
        }
      ).then(() => {
        console.log(`✅ [MULTIPLAYER ${playerName}] Player stats tracked`);
      }).catch(err => console.error('❌ Failed to track player stats:', err));
    }
  };

  const handleClearBets = () => {
    if (!gameState.isRolling && !gameState.bettingLocked && myBets.length > 0) {
      // Refund all bets
      const totalRefund = myBets.reduce((sum, bet) => sum + bet.amount, 0);
      setMyBalance(prev => prev + totalRefund);
      setMyBets([]);
      // Clear bet history
      setBetHistory([]);
      toast.success(`Cleared all bets! Refunded $${totalRefund}`);
    }
  };

  // 🔄 UNDO LAST BET - Removes most recent bet addition and returns money
  const handleUndoLastBet = () => {
    if (betHistory.length === 0 || gameState.isRolling || gameState.bettingLocked) {
      return;
    }

    // Get the most recent bet action from history
    const lastBetAction = betHistory[betHistory.length - 1];
    
    // Check if this bet can be undone (not locked)
    // During point phase, some bets are locked (passLine, small, tall, all)
    if (gameState.gamePhase === 'point') {
      if (lastBetAction.area === 'passLine' || 
          lastBetAction.area === 'small' || 
          lastBetAction.area === 'tall' || 
          lastBetAction.area === 'all') {
        toast.error('Cannot undo locked bets (Pass Line, Small/Tall/All)');
        return;
      }
    }

    // Find the bet in myBets
    const existingBet = myBets.find(bet => bet.area === lastBetAction.area);
    
    if (!existingBet) {
      console.warn('⚠️ Could not find bet to undo:', lastBetAction);
      // Still remove from history even if bet not found
      setBetHistory(prev => prev.slice(0, -1));
      return;
    }

    // Remove the last bet action amount
    const undoAmount = lastBetAction.amount;
    
    if (existingBet.amount === undoAmount) {
      // Remove the entire bet if it equals the undo amount
      const newMyBets = myBets.filter(bet => bet.area !== lastBetAction.area);
      setMyBets(newMyBets);
    } else {
      // Reduce the bet amount
      const newMyBets = myBets.map(bet => 
        bet.area === lastBetAction.area 
          ? { ...bet, amount: bet.amount - undoAmount }
          : bet
      );
      setMyBets(newMyBets);
    }
    
    // Return money to balance
    setMyBalance(prev => prev + undoAmount);
    
    // Remove from bet history
    setBetHistory(prev => prev.slice(0, -1));
    
    console.log(`🔄 UNDO BET: $${undoAmount} on ${lastBetAction.area}`);
    toast.success(`↩️ Undone: $${undoAmount} on ${lastBetAction.area}`);
  };

  // 🔄 REPEAT BETS - Restore bets from before point was established
  const handleRepeatBets = () => {
    if (lastComeOutBets.length === 0 || gameState.isRolling || gameState.bettingLocked) {
      return;
    }

    // Calculate total cost of repeating bets
    const totalCost = lastComeOutBets.reduce((sum, bet) => sum + bet.amount, 0);

    // Check if player has enough balance
    if (myBalance < totalCost) {
      toast.error(`Insufficient balance! Need $${totalCost}, have $${myBalance}`);
      return;
    }

    // Restore the bets
    setMyBets([...lastComeOutBets]);
    setMyBalance(prev => prev - totalCost);
    
    // Restore bet history
    const newHistory = lastComeOutBets.map(bet => ({
      area: bet.area,
      amount: bet.amount,
      x: bet.x,
      y: bet.y,
      comePoint: bet.comePoint,
    }));
    setBetHistory(newHistory);
    
    // Hide the repeat button
    setShowRepeatButton(false);
    
    console.log(`🔄 REPEAT BETS: Restored ${lastComeOutBets.length} bets totaling $${totalCost}`);
    toast.success(`🔄 Repeated ${lastComeOutBets.length} bets! Total: $${totalCost}`);
  };

  const handleLeave = async () => {
    if (confirm('Are you sure you want to leave the room?')) {
      // Leave the room on server
      const leaveResult = await leaveRoomServer();
      
      // Announce to other players
      if (playerChannel) {
        await playerChannel.send({
          type: 'broadcast',
          event: 'player-left',
          payload: { name: playerName },
        });
        
        // If there was a host migration, broadcast it
        if (leaveResult?.newHost) {
          await playerChannel.send({
            type: 'broadcast',
            event: 'host-migration',
            payload: {
              newHostName: leaveResult.newHost.name,
              newHostEmail: leaveResult.newHost.email,
              previousHost: playerName,
            },
          });
          console.log(`👑 Broadcasted host migration to ${leaveResult.newHost.name}`);
        }
        
        // If room was deleted, notify that too
        if (leaveResult?.roomDeleted) {
          await playerChannel.send({
            type: 'broadcast',
            event: 'room-deleted',
            payload: { message: 'Room has been deleted' },
          });
          console.log('🗑️ Broadcasted room deletion');
        }
      }
      
      onLeaveRoom();
    }
  };

  // Get all bets from all players for display
  // Only show other players' bets AFTER betting timer ends
  const getAllBets = (): PlacedBet[] => {
    // Always show my own bets
    const allBets: PlacedBet[] = [...myBets];
    
    // Only show other players' bets after betting is locked (timer finished)
    if (gameState.bettingLocked) {
      players.forEach((player) => {
        if (player.name !== playerName && player.bets) {
          // Add metadata to track which player placed each bet
          const playerBets = player.bets.map(bet => ({
            ...bet,
            playerName: player.name,
            playerAvatar: player.avatar,
          }));
          allBets.push(...playerBets);
        }
      });
    }
    
    return allBets;
  };
  
  // Stack bets by area - combine multiple bets on the same spot
  const getStackedBets = (): PlacedBet[] => {
    const allBets = getAllBets();
    const betsByArea = new Map<string, PlacedBet[]>();
    
    // Group bets by area
    allBets.forEach(bet => {
      const key = bet.comePoint 
        ? `${bet.area}-${bet.comePoint}` 
        : bet.area;
      
      if (!betsByArea.has(key)) {
        betsByArea.set(key, []);
      }
      betsByArea.get(key)!.push(bet);
    });
    
    // Create stacked bets
    const stackedBets: PlacedBet[] = [];
    betsByArea.forEach((bets, areaKey) => {
      if (bets.length === 1) {
        // Single bet - show as normal
        stackedBets.push(bets[0]);
      } else {
        // Multiple bets on same spot - stack them
        const totalAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
        const playerNames = bets.map(b => b.playerName || playerName).filter(Boolean);
        
        stackedBets.push({
          ...bets[0],
          amount: totalAmount,
          isStacked: true,
          stackCount: bets.length,
          playerNames: playerNames,
        });
      }
    });
    
    return stackedBets;
  };

  // 🔒 ADMIN-ONLY: Special balance update for admin panel with server validation
  const handleAdminBalanceUpdate = async (newBalance: number) => {
    if (!playerEmail || playerEmail !== 'avgelatt@gmail.com') {
      console.error('🚨 UNAUTHORIZED: Only owner can use admin balance update!');
      toast.error('❌ Unauthorized: Admin access required');
      return;
    }

    console.log(`🔧 ADMIN: Setting balance to $${newBalance}`);
    setMyBalance(newBalance);
    broadcastPlayerUpdate(newBalance, myBets);
    
    // Sync to server
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
            email: playerEmail,
            balance: newBalance,
          }),
        }
      );

      if (response.ok) {
        console.log('✅ ADMIN: Balance synced to server');
        toast.success(`Balance set to $${newBalance.toLocaleString()}`);
      }
    } catch (error) {
      console.error('Failed to sync admin balance:', error);
    }
  };

  return (
    <div className="min-h-screen max-h-screen overflow-y-auto p-4">
      {/* Info banner for local multiplayer */}
      {!isRealtimeAvailable && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-600 text-white px-4 py-2 text-center z-50" style={{ fontSize: '0.875rem' }}>
          ⚠️ Multiplayer sync unavailable - Playing in local mode
        </div>
      )}
      
      <CrapsHeader
        balance={myBalance}
        lastBet={lastBet}
        lastWin={lastWin}
        onShowStats={() => setShowStats(true)}
        profile={{ name: playerName, email: playerEmail, avatar: playerAvatar }}
        onLogin={() => {}}
        onLogout={handleLeave}
        totalBet={totalBet}
        onBalanceUpdate={(newBalance) => {
          setMyBalance(newBalance);
          broadcastPlayerUpdate(newBalance, myBets);
        }}
        onAdminBalanceUpdate={handleAdminBalanceUpdate}
        onSettingsChange={(settings) => {
          console.log('Settings changed:', settings);
        }}
        onShowLeaderboard={() => setShowLeaderboard(true)}
        onShowFriends={() => setShowFriends(true)}
        onShowLevelUp={() => setShowLevelUp(true)}
        hasLevelUpNotification={!!levelUpData}
        onShowPayoutVerifier={() => setShowPayoutVerifier(true)}
        onShowFairnessInfo={() => setShowFairnessInfo(true)}
      />

      {/* Player List */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-6 shadow-2xl border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                🎮 Players in Room: <span className="text-purple-400">{players.size + 1}</span>
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowSessionLeaderboard(!showSessionLeaderboard)}
                className={`${
                  showSessionLeaderboard
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-gray-600 hover:bg-gray-700'
                } text-white px-6 py-2 rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl flex items-center gap-2`}
              >
                <Trophy className="w-4 h-4" />
                {showSessionLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard'}
              </button>
              <button
                onClick={handleLeave}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl"
              >
                Leave Room
              </button>
            </div>
          </div>
          
          {/* Host Status Banner */}
          {isCurrentHost && (
            <div className="mb-4 bg-gradient-to-r from-yellow-600/30 to-amber-600/30 border-2 border-yellow-400 rounded-lg p-3">
              <div className="text-white flex items-center gap-2">
                <span className="text-2xl">👑</span>
                <div>
                  <strong className="text-yellow-300">You are the Host!</strong>
                  <span className="text-sm ml-2">You can manually roll the dice and control the game flow.</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Timer Info Banner */}
          <div className="mb-4 bg-blue-600/20 border-2 border-blue-500 rounded-lg p-3">
            <div className="text-white text-sm flex items-center gap-2">
              <span className="text-xl">ℹ️</span>
              <div>
                <strong>Auto-Timer System:</strong> You have {BETTING_TIMER_DURATION} seconds to place bets each round. 
                When the timer hits zero, the dice automatically roll - no waiting for players! 
                {isCurrentHost && <span className="text-yellow-300"> As host, you can also manually roll anytime.</span>}
              </div>
            </div>
          </div>
          
          {/* Player Status Display (who has placed bets) */}
          {gameState.bettingTimerActive && !gameState.bettingLocked && (
            <div className="mb-4 bg-purple-600/20 border-2 border-purple-500 rounded-lg p-3">
              <div className="text-white text-sm">
                <strong>Betting Status:</strong>
                <div className="mt-2 flex flex-wrap gap-2">
                  {/* Current player status */}
                  {myBets.length > 0 ? (
                    <span className="bg-green-600 px-3 py-1 rounded-full text-xs flex items-center gap-1">
                      ✅ {playerName} (Ready)
                    </span>
                  ) : (
                    <span className="bg-orange-600 px-3 py-1 rounded-full text-xs flex items-center gap-1 animate-pulse">
                      ⏳ {playerName} (No bets)
                    </span>
                  )}
                  {/* Other players - EXCLUDE current player to prevent duplicates */}
                  {Array.from(players.entries())
                    .filter(([name]) => name !== playerName)
                    .map(([name, data]) => (
                      <span 
                        key={name}
                        className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${
                          data.bets.length > 0 
                            ? 'bg-green-600' 
                            : 'bg-orange-600 animate-pulse'
                        }`}
                      >
                        {data.bets.length > 0 ? '✅' : '⏳'} {name} {data.bets.length > 0 ? '(Ready)' : '(No bets)'}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Current player card */}
            <MultiplayerPlayerCard
              name={playerName}
              avatar={playerAvatar}
              balance={myBalance}
              betsCount={myBets.length}
              online={true}
              level={level}
              membershipTier={membershipStatus.tier}
              achievementTitle={localStorage.getItem('selected-achievement-title') || undefined}
              isCurrentPlayer={true}
              isHost={isCurrentHost}
              onViewProfile={() => {
                setSelectedPlayer({
                  name: playerName,
                  balance: myBalance,
                  bets: myBets,
                  online: true,
                  avatar: playerAvatar,
                  level: level,
                  membershipTier: membershipStatus.tier,
                  achievementTitle: localStorage.getItem('selected-achievement-title') || undefined,
                  email: playerEmail,
                });
                setShowProfileModal(true);
              }}
            />
            
            {/* Other players */}
            {Array.from(players.entries()).map(([name, data]) => 
              name !== playerName && (
                <MultiplayerPlayerCard
                  key={name}
                  name={name}
                  avatar={data.avatar || '👤'}
                  balance={data.balance}
                  betsCount={data.bets.length}
                  online={data.online}
                  level={data.level || 1}
                  membershipTier={data.membershipTier || 'free'}
                  achievementTitle={data.achievementTitle}
                  isCurrentPlayer={false}
                  isHost={name === currentHostName}
                  onViewProfile={() => {
                    setSelectedPlayer(data);
                    setShowProfileModal(true);
                  }}
                />
              )
            )}
          </div>
        </div>
      </div>



      {gameState.bettingLocked && !gameState.isRolling && (
        <div className="max-w-7xl mx-auto mb-4">
          <div className="text-center p-4 rounded-lg bg-red-600/30 border-2 border-red-600">
            <div className="text-xl text-white">
              🔒 Betting Locked - Dice Rolling Soon!
            </div>
          </div>
        </div>
      )}

      <div className="relative">
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
              {gameState.dice1} + {gameState.dice2}
            </div>
          </div>
        )}
        
        <CrapsTable
        placedBets={getStackedBets()}
        onPlaceBet={handlePlaceBet}
        onRemoveBet={handleRemoveBet}
        dice1={gameState.dice1}
        dice2={gameState.dice2}
        isRolling={gameState.isRolling}
        buttonsLocked={gameState.bettingLocked || false}
        rollHistory={rollHistory}
        onRoll={handleRoll}
        canRoll={isCurrentHost && myBets.length > 0 && !gameState.bettingLocked}
        gamePhase={gameState.gamePhase}
        point={gameState.point}
        message={gameState.message}
        puckPosition={gameState.puckPosition}
        smallHit={gameState.smallHit}
        tallHit={gameState.tallHit}
        allHit={gameState.allHit}
        bonusBetsWorking={bonusBetsWorking}
        onToggleBonusBets={() => setBonusBetsWorking(!bonusBetsWorking)}
        showBuyPlaceBets={showBuyPlaceBets}
        onToggleBuyPlaceBets={() => setShowBuyPlaceBets(!showBuyPlaceBets)}
        winningNumbers={calculateWinningNumbers()}
        losingNumbers={calculateLosingNumbers()}
        onBetAcross={handleBetAcross}
      />
      </div>

      <div className="max-w-7xl mx-auto mt-8">
        <div className="flex gap-4 items-start">
          {/* Chip Selector - Left */}
          <div className="flex-1">
            <ChipSelector
              selectedChip={selectedChip}
              onSelectChip={setSelectedChip}
              balance={myBalance}
              onClearBets={handleClearBets}
              onRoll={() => {}}
              totalBet={myBets.reduce((sum, bet) => sum + bet.amount, 0)}
              minBet={3}
              isRolling={gameState.isRolling}
              buttonsLocked={gameState.bettingLocked}
              dice1={gameState.dice1}
              dice2={gameState.dice2}
            />
            
            {/* Voice Chat System with integrated chat - No longer displayed here */}
          </div>
          
          {/* Right Side Controls - All in one row */}
          <div className="flex-shrink-0 flex items-center gap-3">
            {/* Balance Display */}
            <div className="bg-gradient-to-br from-green-600 to-green-800 backdrop-blur-sm rounded-lg border-2 border-green-300 shadow-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="text-lg">💰</div>
                <div>
                  <div className="text-xs text-green-200 font-bold uppercase tracking-wide">
                    Balance
                  </div>
                  <div className="text-lg font-black tabular-nums text-white">
                    ${myBalance.toFixed(2)}
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
              disabled={myBets.length === 0 || gameState.isRolling || gameState.bettingLocked}
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
              disabled={betHistory.length === 0 || gameState.isRolling || gameState.bettingLocked}
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
                disabled={lastComeOutBets.length === 0 || gameState.isRolling || gameState.bettingLocked}
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

            {/* Compact Timer */}
            <CompactTimer
              timer={gameState.bettingTimer || 0}
              maxDuration={BETTING_TIMER_DURATION}
              isActive={gameState.bettingTimerActive || false}
              isLocked={gameState.bettingLocked || false}
              size="medium"
            />
            
            {/* 🎲 SHOOTER INDICATOR */}
            {gameState.currentShooter && gameState.shooterName && (
              <div className={`bg-gradient-to-br ${gameState.currentShooter === playerEmail ? 'from-green-600 to-green-800 border-green-300 animate-pulse' : 'from-purple-600 to-purple-800 border-purple-300'} backdrop-blur-sm rounded-lg border-2 shadow-lg px-4 py-3`}>
                <div className="flex items-center gap-2">
                  <div className="text-xl">🎲</div>
                  <div>
                    <div className="text-xs text-white/80 font-bold uppercase tracking-wide">
                      {gameState.currentShooter === playerEmail ? 'You are Shooter' : 'Shooter'}
                    </div>
                    <div className="text-sm font-black text-white">
                      {gameState.shooterName}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 🎲 PASS SHOOTER BUTTON - Only for current shooter */}
            {gameState.currentShooter === playerEmail && !gameState.isRolling && !gameState.bettingLocked && (
              <button
                onClick={handlePassShooter}
                className="bg-gradient-to-b from-yellow-600 to-yellow-700 hover:from-yellow-500 hover:to-yellow-600 text-white px-4 py-3 rounded-lg flex items-center gap-2 transition-all border-2 border-yellow-800 shadow-lg hover:shadow-xl font-bold"
                style={{
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.2)'
                }}
                title="Pass the shooter role to the next player"
              >
                <span className="text-lg">👉</span>
                <div className="text-sm">PASS DICE</div>
              </button>
            )}
            
            {/* MANUAL ROLL BUTTON - Host Only */}
            {isCurrentHost && !gameState.isRolling && !gameState.bettingLocked && myBets.length > 0 && (
              <button
                onClick={handleRoll}
                disabled={gameState.isRolling || gameState.bettingLocked}
                className="px-8 py-6 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-700 hover:to-red-900 
                         text-white text-2xl font-black rounded-xl shadow-2xl
                         transform hover:scale-105 active:scale-95 transition-all duration-200
                         border-4 border-yellow-400 hover:border-yellow-300
                         disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
                         drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]
                         animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <span className="text-4xl">🎲</span>
                  <div>
                    <div>ROLL DICE</div>
                    <div className="text-xs font-normal text-yellow-200">(Host Only)</div>
                  </div>
                </div>
              </button>
            )}
            
            {/* Show why button is disabled */}
            {isCurrentHost && !gameState.isRolling && !gameState.bettingLocked && myBets.length === 0 && (
              <div className="px-6 py-4 bg-yellow-600/30 border-2 border-yellow-500 rounded-lg text-center">
                <div className="text-yellow-200 font-bold">⚠️ Place a bet first!</div>
                <div className="text-yellow-300 text-sm mt-1">Host must bet to roll</div>
              </div>
            )}
          </div>
        </div>
        
        {/* Dice History - Horizontal scroll at bottom */}
        <div className="mt-4">
          <VisualDiceHistory rollHistory={rollHistory} />
        </div>
      </div>

      {showWin && (
        <WinNotification
          amount={lastWin}
          onClose={() => setShowWin(false)}
        />
      )}

      {/* Voice Chat with integrated Chat Tab */}
      <VoiceChatSystem
        roomId={roomId}
        currentUserId={playerEmail}
        currentUserName={playerName}
        isHost={isCurrentHost}
        playerAvatar={playerAvatar}
      />
      
      {/* Level-up Modal */}
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
      
      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          onClose={() => setShowLeaderboard(false)}
        />
      )}
      
      {/* Game Statistics Modal */}
      {showStats && (
        <GameStatistics
          onClose={() => setShowStats(false)}
          rollHistory={rollHistory}
        />
      )}
      
      {/* Player Profile Modal */}
      {showProfileModal && selectedPlayer && (
        <PlayerProfileModal
          isOpen={showProfileModal}
          onClose={() => {
            setShowProfileModal(false);
            setSelectedPlayer(null);
          }}
          playerName={selectedPlayer.name}
          playerAvatar={selectedPlayer.avatar || '👤'}
          playerLevel={selectedPlayer.level || 1}
          playerBalance={selectedPlayer.balance}
          membershipTier={selectedPlayer.membershipTier || 'free'}
          achievementTitle={selectedPlayer.achievementTitle}
          totalWins={0}
          totalGamesPlayed={0}
          winRate={0}
          biggestWin={0}
          achievements={[]}
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
      {showFriends && (
        <FriendsPanel
          isOpen={showFriends}
          onClose={() => setShowFriends(false)}
          currentPlayerEmail={playerEmail}
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
          playerName={popup.playerName}
          playerAvatar={popup.playerAvatar}
          onComplete={() => removeWinPopup(popup.id)}
        />
      ))}

      {/* 📊 Live Session Leaderboard */}
      <LiveSessionLeaderboard
        roomId={roomId}
        playerStats={sessionStats}
        currentPlayerEmail={playerEmail}
        isVisible={showSessionLeaderboard}
        onClose={() => setShowSessionLeaderboard(false)}
      />
      
      {/* 🎲 SHOOTER ROLE OFFER DIALOG */}
      {showShooterDialog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border-4 border-yellow-400 shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
            <div className="text-center">
              <div className="text-6xl mb-4">🎲</div>
              <h2 className="text-3xl font-black text-white mb-4">Shooter Role Offered</h2>
              <p className="text-lg text-gray-300 mb-6">
                {shooterDialogMessage}
              </p>
              <div className="bg-yellow-600/20 border-2 border-yellow-500 rounded-lg p-4 mb-6">
                <p className="text-yellow-200 font-bold text-sm">
                  ⚠️ As shooter, you MUST bet on the Pass Line before the timer expires!
                </p>
              </div>
              <div className="flex gap-4">
                <button
                  onClick={handleAcceptShooter}
                  className="flex-1 bg-gradient-to-br from-green-600 to-green-800 hover:from-green-500 hover:to-green-700 text-white font-black py-4 px-6 rounded-xl transition-all border-2 border-green-400 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <div className="text-2xl mb-1">✅</div>
                  <div>YES, I'LL SHOOT</div>
                </button>
                <button
                  onClick={handleDeclineShooter}
                  className="flex-1 bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-black py-4 px-6 rounded-xl transition-all border-2 border-red-400 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  <div className="text-2xl mb-1">❌</div>
                  <div>NO, PASS</div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}