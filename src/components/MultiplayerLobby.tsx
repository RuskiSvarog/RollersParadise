import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogOut, Settings, Users, Crown, Sparkles, Trophy, Zap, DollarSign, TrendingUp, Target, Star, Dices, Flame, Gift } from './Icons';
import { GameSettings, GameSettingsType } from './GameSettings';
import { useDailyBonus } from '../hooks/useDailyBonus';
import { MusicVolumeSlider } from './MusicVolumeSlider';
import { LeaderboardModal } from './LeaderboardModal';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Room {
  id: string;
  name: string;
  host: string;
  hostAvatar?: string;
  players: number;
  maxPlayers: number;
  created: number;
  playerList?: Array<{ name: string; avatar?: string }>;
}

interface MultiplayerLobbyProps {
  playerName: string;
  onJoinRoom: (roomId: string, isHost: boolean) => void;
  onStartSinglePlayer: () => void;
  onLogout: () => void;
  profile: { name: string; email: string; avatar?: string };
  onSettingsChange?: (settings: GameSettingsType) => void;
  currentSettings?: GameSettingsType;
  onBackToModeSelect?: () => void;
  onBalanceUpdate?: (newBalance: number) => void;
}

interface HotStreak {
  id: string;
  message: string;
  icon: string;
  timestamp: number;
}

export function MultiplayerLobby({ playerName, onJoinRoom, onStartSinglePlayer, onLogout, profile, onSettingsChange, currentSettings, onBackToModeSelect, onBalanceUpdate }: MultiplayerLobbyProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [hotStreaks, setHotStreaks] = useState<HotStreak[]>([]);
  const [tickerPosition, setTickerPosition] = useState(0);
  const [stats, setStats] = useState({
    playersOnline: 0,
    totalGames: 0,
    totalJackpot: 0
  });
  
  // Daily Bonus System
  const { status: bonusStatus, claiming, claimBonus, formatCountdown } = useDailyBonus(profile?.email || null);

  // 🚀 SSE: Real-time stats updates (replaces polling!)
  useEffect(() => {
    console.log('🔥 Connecting to SSE streams for real-time updates...');
    
    let statsEventSource: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connectStats = () => {
      try {
        statsEventSource = new EventSource(
          `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/stats/stream`
        );

        statsEventSource.onopen = () => {
          console.log('✅ Stats SSE connection established');
        };

        statsEventSource.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'stats' && message.data) {
              setStats(message.data);
              console.log('📊 Stats updated via SSE:', message.data);
            } else if (message.type === 'connected') {
              console.log('✅ Stats SSE connected:', message.clientId);
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };

        statsEventSource.onerror = (error) => {
          console.error('SSE stats connection error, will reconnect in 5s');
          statsEventSource?.close();
          
          // Fallback to one-time fetch
          fetch(`https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/stats`, {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          })
            .then(r => r.json())
            .then(data => setStats(data))
            .catch(() => {});

          // Reconnect after 5 seconds
          reconnectTimer = setTimeout(connectStats, 5000);
        };
      } catch (error) {
        console.error('Failed to create SSE connection:', error);
      }
    };

    connectStats();

    return () => {
      console.log('🔌 Closing stats SSE connection');
      if (reconnectTimer) clearTimeout(reconnectTimer);
      statsEventSource?.close();
    };
  }, []);

  // 🚀 SSE: Real-time room updates (replaces polling!)
  useEffect(() => {
    // Initial load
    loadRooms();
    
    console.log('🔥 Connecting to rooms SSE stream...');
    
    let roomsEventSource: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connectRooms = () => {
      try {
        roomsEventSource = new EventSource(
          `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/rooms/stream`
        );

        roomsEventSource.onopen = () => {
          console.log('✅ Rooms SSE connection established');
        };

        roomsEventSource.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'rooms' && message.data) {
              setRooms(message.data);
              console.log('🏠 Rooms updated via SSE:', message.data.length, 'rooms');
            } else if (message.type === 'connected') {
              console.log('✅ Rooms SSE connected:', message.clientId);
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };

        roomsEventSource.onerror = (error) => {
          console.error('SSE rooms connection error, will reconnect in 5s');
          roomsEventSource?.close();
          
          // Reconnect after 5 seconds
          reconnectTimer = setTimeout(connectRooms, 5000);
        };
      } catch (error) {
        console.error('Failed to create SSE connection:', error);
      }
    };

    connectRooms();

    return () => {
      console.log('🔌 Closing rooms SSE connection');
      if (reconnectTimer) clearTimeout(reconnectTimer);
      roomsEventSource?.close();
    };
  }, []);

  // 🚀 SSE: Real-time hot streaks updates (replaces polling!)
  useEffect(() => {
    // Initial fetch
    const fetchHotStreaks = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/stats/hot-streaks`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.hotStreaks && data.hotStreaks.length > 0) {
            setHotStreaks(data.hotStreaks);
          } else {
            setHotStreaks([
              { id: '1', message: '🎰 Join a table and start rolling to see the action!', icon: '🎰', timestamp: Date.now() }
            ]);
          }
        }
      } catch (error) {
        console.error('Failed to fetch hot streaks:', error);
        setHotStreaks([
          { id: '1', message: '🎰 Join a table and start rolling to see the action!', icon: '🎰', timestamp: Date.now() }
        ]);
      }
    };

    fetchHotStreaks();

    // Connect to SSE stream for real-time updates
    console.log('🔥 Connecting to streaks SSE stream...');
    
    let streaksEventSource: EventSource | null = null;
    let reconnectTimer: NodeJS.Timeout | null = null;

    const connectStreaks = () => {
      try {
        streaksEventSource = new EventSource(
          `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/streaks/stream`
        );

        streaksEventSource.onopen = () => {
          console.log('✅ Streaks SSE connection established');
        };

        streaksEventSource.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'streaks' && message.data && message.data.length > 0) {
              setHotStreaks(message.data);
              console.log('🔥 Hot streaks updated via SSE');
            } else if (message.type === 'connected') {
              console.log('✅ Streaks SSE connected:', message.clientId);
            }
          } catch (error) {
            console.error('Error parsing SSE message:', error);
          }
        };

        streaksEventSource.onerror = (error) => {
          console.error('SSE streaks connection error, will reconnect in 5s');
          streaksEventSource?.close();
          
          // Reconnect after 5 seconds
          reconnectTimer = setTimeout(connectStreaks, 5000);
        };
      } catch (error) {
        console.error('Failed to create SSE connection:', error);
      }
    };

    connectStreaks();

    return () => {
      console.log('🔌 Closing streaks SSE connection');
      if (reconnectTimer) clearTimeout(reconnectTimer);
      streaksEventSource?.close();
    };
  }, []);

  // Hot streak ticker animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerPosition((prev) => (prev + 1) % hotStreaks.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [hotStreaks.length]);



  const loadRooms = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/rooms`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json') && response.ok) {
        const data = await response.json();
        setRooms(data.rooms || []);
      } else {
        // Server not available, show empty list
        setRooms([]);
      }
    } catch (error) {
      console.error('Failed to load rooms:', error);
      setRooms([]);
    }
  };

  const createRoom = async () => {
    if (!roomName.trim()) {
      alert('Please enter a room name');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/rooms/create`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            name: roomName,
            host: playerName,
            hostEmail: profile?.email,
            maxPlayers,
          }),
        }
      );
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Multiplayer server not available. Please try again later.');
      }
      
      if (response.ok) {
        const data = await response.json();
        
        // Track hot streak event for room creation
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/stats/hot-streak`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              message: `🎲 ${playerName} just opened "${roomName}" table!`,
              icon: '🎲',
              type: 'room_created',
              playerName: playerName,
              roomName: roomName
            }),
          }
        ).catch(err => console.error('Failed to track hot streak:', err));
        
        setShowCreateRoom(false);
        setRoomName('');
        onJoinRoom(data.roomId, true);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(errorData.error || 'Failed to create room');
      }
    } catch (error) {
      console.error('Failed to create room:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      alert(`❌ ${errorMessage}\n\nNote: Multiplayer requires a working server connection.`);
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = async (roomId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/rooms/${roomId}/join`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            playerName,
            playerEmail: profile?.email,
          }),
        }
      );
      
      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Multiplayer server not available. Please try again later.');
      }
      
      if (response.ok) {
        // Track hot streak event for joining room
        const room = rooms.find(r => r.id === roomId);
        if (room) {
          fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/stats/hot-streak`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${publicAnonKey}`,
              },
              body: JSON.stringify({
                message: `🌟 ${playerName} joined "${room.name}" - ${room.players + 1} players at the table!`,
                icon: '🌟',
                type: 'player_joined',
                playerName: playerName,
                roomName: room.name,
                playerCount: room.players + 1
              }),
            }
          ).catch(err => console.error('Failed to track hot streak:', err));
        }
        
        onJoinRoom(roomId, false);
      } else {
        const data = await response.json().catch(() => ({ error: 'Server error' }));
        throw new Error(data.error || 'Failed to join room');
      }
    } catch (error) {
      console.error('Failed to join room:', error);
      const errorMessage = error instanceof Error ? error.message : 'Network error';
      alert(`❌ ${errorMessage}\n\nNote: Multiplayer requires a working server connection.`);
    } finally {
      setLoading(false);
    }
  };

  const claimDailyBonus = async () => {
    const result = await claimBonus();
    if (result && result.success) {
      setShowDailyBonus(false);
      
      // Fetch updated balance from server
      if (onBalanceUpdate && profile?.email) {
        try {
          const response = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/chips/balance/${encodeURIComponent(profile.email)}`,
            {
              headers: { Authorization: `Bearer ${publicAnonKey}` },
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            onBalanceUpdate(data.balance);
          }
        } catch (error) {
          console.error('Failed to fetch updated balance:', error);
        }
      }
      
      alert(`🎉 Congratulations! You claimed ${result.amount} FREE CHIPS! 💰`);
    } else if (result) {
      alert(`❌ ${result.message}`);
    }
  };

  const formatJackpot = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    } else {
      return `$${amount.toFixed(0)}`;
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Vegas Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-black to-purple-950" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFD700' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Floating dice background */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`dice-bg-${i}`}
            className="absolute"
            style={{
              left: `${10 + i * 8}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 360],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 8 + i,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <Dices className="w-12 h-12 text-white/20" />
          </motion.div>
        ))}
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col h-full p-6 overflow-y-auto">
        
        {/* Header with Title and Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative inline-block">
                <motion.h1 
                  className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-600"
                  style={{ 
                    fontSize: '3rem', 
                    fontWeight: 900,
                    textShadow: '0 0 60px rgba(250,204,21,0.6), 0 0 30px rgba(234,179,8,0.8)',
                    letterSpacing: '0.05em',
                    WebkitTextStroke: '1px rgba(234,179,8,0.3)'
                  }}
                  animate={{
                    textShadow: [
                      '0 0 60px rgba(250,204,21,0.6), 0 0 30px rgba(234,179,8,0.8)',
                      '0 0 80px rgba(250,204,21,0.9), 0 0 50px rgba(234,179,8,1)',
                      '0 0 60px rgba(250,204,21,0.6), 0 0 30px rgba(234,179,8,0.8)',
                    ]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  🎲 LIVE TABLES 🎲
                </motion.h1>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                  <p className="text-yellow-300" style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.1em' }}>
                    JOIN THE ACTION • PLAY WITH FRIENDS • WIN BIG
                  </p>
                  <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                </div>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="flex gap-3"
            >
              {/* Daily Bonus Button */}
              <motion.button
                onClick={() => bonusStatus.canClaim && setShowDailyBonus(true)}
                className={`relative group ${!bonusStatus.canClaim ? 'cursor-not-allowed opacity-60' : ''}`}
                whileHover={bonusStatus.canClaim ? { scale: 1.05 } : {}}
                whileTap={bonusStatus.canClaim ? { scale: 0.95 } : {}}
                title={!bonusStatus.canClaim ? `Next bonus in: ${formatCountdown()}` : 'Claim your daily bonus!'}
              >
                {bonusStatus.canClaim && (
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                )}
                <div className={`relative px-4 py-3 rounded-xl border-2 shadow-xl ${
                  bonusStatus.canClaim 
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 border-pink-300' 
                    : 'bg-gradient-to-r from-gray-700 to-gray-600 border-gray-500'
                }`}>
                  <div className="flex items-center gap-2">
                    <Gift className={`w-5 h-5 ${bonusStatus.canClaim ? 'text-white' : 'text-gray-400'}`} />
                    <div className="flex flex-col items-start">
                      <span className={`${bonusStatus.canClaim ? 'text-white' : 'text-gray-400'}`} style={{ fontSize: '0.875rem', fontWeight: 800 }}>
                        {bonusStatus.canClaim ? 'DAILY BONUS' : 'CLAIMED'}
                      </span>
                      {!bonusStatus.canClaim && (
                        <span className="text-gray-500 text-xs">{formatCountdown()}</span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* Back Button */}
              {onBackToModeSelect && (
                <button
                  onClick={onBackToModeSelect}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl transition-colors border-2 border-gray-500"
                  style={{ fontSize: '0.875rem', fontWeight: 700 }}
                >
                  ← BACK
                </button>
              )}

              {/* Settings Button */}
              {onSettingsChange && (
                <button
                  onClick={() => setShowSettings(true)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded-xl transition-colors flex items-center gap-2 border-2 border-gray-500"
                  style={{ fontSize: '0.875rem', fontWeight: 700 }}
                >
                  <Settings className="w-4 h-4" />
                  SETTINGS
                </button>
              )}
              
              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="bg-red-700 hover:bg-red-600 text-white px-4 py-3 rounded-xl transition-colors flex items-center gap-2 border-2 border-red-500"
                style={{ fontSize: '0.875rem', fontWeight: 700 }}
              >
                <LogOut className="w-4 h-4" />
                LOGOUT
              </button>
            </motion.div>
          </div>

          {/* Player Welcome Badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center mt-4"
          >
            <div className="bg-black/60 border-2 border-yellow-500 rounded-full px-6 py-2 backdrop-blur-sm flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center text-lg border-2 border-green-300">
                {profile.avatar || '🎲'}
              </div>
              <span className="text-yellow-300" style={{ fontSize: '1rem', fontWeight: 700 }}>
                Welcome, {playerName}!
              </span>
              <Sparkles className="w-4 h-4 text-yellow-400" fill="currentColor" />
            </div>
          </motion.div>
        </div>

        {/* Live Stats - Vegas Style Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25 }}
          className="flex justify-between items-center gap-6 mb-6 px-4"
        >
          {/* Games Played */}
          <div className="relative group flex-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-gradient-to-br from-black via-purple-950 to-black border-4 border-purple-600 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                  <Trophy className="w-5 h-5 text-white" />
                </div>
                <span className="text-purple-400" style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                  GAMES PLAYED
                </span>
              </div>
              <p className="text-white" style={{ fontSize: '2.5rem', fontWeight: 900, textShadow: '0 0 20px rgba(168,85,247,0.5)' }}>
                {stats.totalGames.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Total Jackpot */}
          <div className="relative group flex-1">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-gradient-to-br from-black via-amber-950 to-black border-4 border-yellow-500 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                  <Crown className="w-5 h-5 text-black" />
                </div>
                <span className="text-yellow-400" style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                  TOTAL JACKPOT
                </span>
              </div>
              <p className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500" style={{ fontSize: '2.5rem', fontWeight: 900, textShadow: '0 0 20px rgba(250,204,21,0.5)' }}>
                {formatJackpot(stats.totalJackpot)}
              </p>
              <div className="absolute top-2 right-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Players Online */}
          <div className="relative group flex-1">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-gradient-to-br from-black via-red-950 to-black border-4 border-red-600 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-red-400" style={{ fontSize: '0.875rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                  PLAYERS ONLINE
                </span>
              </div>
              <p className="text-white" style={{ fontSize: '2.5rem', fontWeight: 900, textShadow: '0 0 20px rgba(239,68,68,0.5)' }}>
                {stats.playersOnline}
              </p>
              <div className="absolute top-2 right-2">
                <div className="w-2 h-2 bg-green-400 rounded-full shadow-lg shadow-green-400/50 animate-pulse" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mb-6 flex justify-center"
        >
          <button
            onClick={() => setShowLeaderboard(true)}
            className="relative group"
          >
            {/* Glow effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 rounded-2xl blur-xl animate-pulse" />
            
            <div className="relative bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-600 px-8 py-3 rounded-2xl shadow-2xl border-4 overflow-hidden hover:scale-105 active:scale-98 transition-transform" style={{ borderColor: '#FFD700', boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)' }}>
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />

              {/* Content */}
              <div className="relative flex items-center justify-center gap-3">
                <Trophy className="w-6 h-6 text-white" />
                <span 
                  className="text-white"
                  style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 900, 
                    letterSpacing: '0.1em',
                    textShadow: '0 0 20px rgba(255,215,0,0.8), 0 2px 10px rgba(0,0,0,1)'
                  }}
                >
                  VIEW LEADERBOARD
                </span>
                <Crown className="w-6 h-6 text-white" fill="currentColor" />
              </div>
              
              {/* Sub text */}
              <div className="relative text-center mt-1">
                <span className="text-yellow-200" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                  🏆 Compete with the best players! 🏆
                </span>
              </div>
            </div>
          </button>
        </motion.div>

        {/* Create Room Button - Vegas Style */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="mb-8 flex justify-center"
        >
          <button
            onClick={() => setShowCreateRoom(true)}
            disabled={loading}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
            <motion.div 
              className="relative bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 px-12 py-6 rounded-2xl shadow-2xl border-4 border-yellow-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-8 h-8 text-green-700" fill="currentColor" />
                </div>
                <div className="text-left">
                  <div className="text-white" style={{ fontSize: '1.5rem', fontWeight: 900, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                    ➕ CREATE NEW TABLE
                  </div>
                  <div className="text-green-200" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Host your own multiplayer game
                  </div>
                </div>
              </div>
            </motion.div>
          </button>
        </motion.div>

        {/* Live Tables Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Flame className="w-8 h-8 text-orange-500" fill="currentColor" />
            <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500" style={{ fontSize: '2rem', fontWeight: 800 }}>
              🔥 LIVE TABLES
            </h2>
            <div className="flex-1 h-1 bg-gradient-to-r from-orange-500 to-transparent rounded-full" />
            <div className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-bold animate-pulse">
              {rooms.length} ACTIVE
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2">
            {rooms.length === 0 ? (
              <div className="col-span-2 text-center py-12">
                <div className="bg-black/40 border-2 border-dashed border-gray-600 rounded-2xl p-8">
                  <Dices className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-400 text-lg mb-2" style={{ fontWeight: 600 }}>No tables available</p>
                  <p className="text-gray-500" style={{ fontSize: '0.875rem' }}>Be the first to create a table!</p>
                  <p className="text-gray-600 text-xs mt-2">Note: Multiplayer requires server connection</p>
                </div>
              </div>
            ) : (
              rooms.map((room, index) => (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group"
                >
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  
                  {/* Card */}
                  <div className="relative bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 border-3 border-purple-500 rounded-2xl p-5 shadow-2xl">
                    {/* Hot indicator for full/nearly full tables */}
                    {room.players >= room.maxPlayers - 1 && (
                      <div className="absolute -top-2 -right-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-pulse">
                        <Flame className="w-3 h-3" fill="currentColor" />
                        HOT!
                      </div>
                    )}

                    {/* Host info */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-xl shadow-lg border-3 border-yellow-300">
                          {room.hostAvatar || '🎲'}
                        </div>
                        <div>
                          <div className="text-yellow-400" style={{ fontSize: '1.125rem', fontWeight: 800 }}>
                            {room.name}
                          </div>
                          <div className="text-gray-400" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                            Host: {room.host}
                          </div>
                        </div>
                      </div>
                      <Crown className="w-6 h-6 text-yellow-400" fill="currentColor" />
                    </div>

                    {/* Player avatars */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex -space-x-2">
                        {room.playerList && room.playerList.length > 0 ? (
                          room.playerList.slice(0, 5).map((player, idx) => (
                            <div
                              key={idx}
                              className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center border-3 border-gray-900 shadow-lg"
                              title={player.name}
                              style={{ fontSize: '0.875rem' }}
                            >
                              {player.avatar || '👤'}
                            </div>
                          ))
                        ) : (
                          Array.from({ length: Math.min(room.players, 5) }).map((_, idx) => (
                            <div
                              key={idx}
                              className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center border-3 border-gray-900 shadow-lg"
                              style={{ fontSize: '0.875rem' }}
                            >
                              👤
                            </div>
                          ))
                        )}
                        {room.players > 5 && (
                          <div className="w-9 h-9 rounded-full bg-purple-700 flex items-center justify-center text-white border-3 border-gray-900 shadow-lg" style={{ fontSize: '0.75rem', fontWeight: 800 }}>
                            +{room.players - 5}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-purple-500">
                        <Users className="w-4 h-4 text-purple-400" />
                        <span className="text-white" style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                          {room.players}/{room.maxPlayers}
                        </span>
                      </div>
                    </div>

                    {/* Join button */}
                    <motion.button
                      onClick={() => joinRoom(room.id)}
                      disabled={loading || room.players >= room.maxPlayers}
                      className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all ${
                        room.players >= room.maxPlayers
                          ? 'bg-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500'
                      }`}
                      whileHover={room.players < room.maxPlayers ? { scale: 1.05 } : {}}
                      whileTap={room.players < room.maxPlayers ? { scale: 0.98 } : {}}
                    >
                      {room.players >= room.maxPlayers ? '🔒 TABLE FULL' : '🎲 JOIN TABLE'}
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>

        {/* Hot Streak Ticker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-auto"
        >
          <div className="bg-gradient-to-r from-red-900 via-orange-900 to-red-900 border-2 border-orange-500 rounded-xl p-3 shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-2 bg-orange-600 px-3 py-1 rounded-full">
                <Flame className="w-4 h-4 text-white" fill="currentColor" />
                <span className="text-white" style={{ fontSize: '0.75rem', fontWeight: 800 }}>HOT STREAKS</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-orange-500 to-transparent" />
            </div>
            <div className="relative h-16 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={tickerPosition}
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -50, opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 flex items-center"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className="text-3xl">{hotStreaks[tickerPosition]?.icon}</div>
                    <p className="text-yellow-300 flex-1" style={{ fontSize: '1.125rem', fontWeight: 700 }}>
                      {hotStreaks[tickerPosition]?.message}
                    </p>
                    <Sparkles className="w-5 h-5 text-yellow-400" fill="currentColor" />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Create Room Modal - Vegas Style */}
      <AnimatePresence>
        {showCreateRoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateRoom(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl blur-2xl opacity-60" />
              
              {/* Modal content */}
              <div className="relative bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 rounded-3xl p-8 max-w-md w-full border-4 border-green-500 shadow-2xl">
                <div className="text-center mb-6">
                  <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500" style={{ fontSize: '2rem', fontWeight: 900 }}>
                    🎲 CREATE TABLE 🎲
                  </h2>
                  <p className="text-green-300 mt-2" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    Set up your perfect game
                  </p>
                  <p className="text-blue-400 mt-1 text-xs">
                    💡 Note: Multiplayer uses local simulation in this environment
                  </p>
                </div>
                
                <div className="mb-6">
                  <label className="block text-yellow-400 mb-2" style={{ fontSize: '0.875rem', fontWeight: 700 }}>Table Name</label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="w-full px-4 py-3 bg-black/60 border-2 border-green-500 rounded-xl text-white focus:border-yellow-400 focus:outline-none"
                    style={{ fontSize: '1rem', fontWeight: 600 }}
                    placeholder="Enter table name..."
                    maxLength={50}
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-yellow-400 mb-2" style={{ fontSize: '0.875rem', fontWeight: 700 }}>Max Players</label>
                  <select
                    value={maxPlayers}
                    onChange={(e) => setMaxPlayers(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-black/60 border-2 border-green-500 rounded-xl text-white focus:border-yellow-400 focus:outline-none"
                    style={{ fontSize: '1rem', fontWeight: 600 }}
                  >
                    <option value={2}>2 Players</option>
                    <option value={4}>4 Players</option>
                    <option value={6}>6 Players</option>
                    <option value={8}>8 Players</option>
                  </select>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    onClick={createRoom}
                    disabled={loading || !roomName.trim()}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-6 py-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl border-2 border-green-400"
                    style={{ fontSize: '1rem', fontWeight: 800 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? '⏳ Creating...' : '✨ CREATE'}
                  </motion.button>
                  <motion.button
                    onClick={() => {
                      setShowCreateRoom(false);
                      setRoomName('');
                    }}
                    disabled={loading}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-4 rounded-xl transition-colors shadow-xl border-2 border-gray-500"
                    style={{ fontSize: '1rem', fontWeight: 800 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Bonus Modal */}
      <AnimatePresence>
        {showDailyBonus && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDailyBonus(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, rotateY: -90 }}
              animate={{ scale: 1, opacity: 1, rotateY: 0 }}
              exit={{ scale: 0.9, opacity: 0, rotateY: 90 }}
              transition={{ type: "spring", duration: 0.8 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl blur-3xl opacity-80 animate-pulse" />
              
              {/* Modal content */}
              <div className="relative bg-gradient-to-br from-pink-900 via-rose-950 to-pink-900 rounded-3xl p-8 max-w-md w-full border-4 border-pink-400 shadow-2xl">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-8xl mb-4"
                  >
                    🎁
                  </motion.div>
                  <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-400 mb-4" style={{ fontSize: '2.5rem', fontWeight: 900 }}>
                    {bonusStatus.canClaim ? 'DAILY BONUS!' : 'BONUS CLAIMED!'}
                  </h2>
                  <p className={`mb-6 ${bonusStatus.canClaim ? 'text-pink-200' : 'text-gray-400'}`} style={{ fontSize: '1.125rem', fontWeight: 600 }}>
                    {bonusStatus.canClaim ? 'Claim your free chips every day!' : 'Come back tomorrow for more chips!'}
                  </p>
                  
                  <div className={`border-2 rounded-2xl p-6 mb-6 ${bonusStatus.canClaim ? 'bg-black/60 border-yellow-400' : 'bg-gray-900/60 border-gray-600'}`}>
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <DollarSign className={`w-8 h-8 ${bonusStatus.canClaim ? 'text-yellow-400' : 'text-gray-500'}`} />
                      <span className={`${bonusStatus.canClaim ? 'text-yellow-300' : 'text-gray-500'}`} style={{ fontSize: '3rem', fontWeight: 900 }}>500</span>
                      <Sparkles className={`w-8 h-8 ${bonusStatus.canClaim ? 'text-yellow-400' : 'text-gray-500'}`} fill="currentColor" />
                    </div>
                    <p className={`${bonusStatus.canClaim ? 'text-yellow-200' : 'text-gray-500'}`} style={{ fontSize: '1rem', fontWeight: 700 }}>
                      FREE CHIPS
                    </p>
                  </div>

                  {!bonusStatus.canClaim && (
                    <div className="bg-gray-800/80 border-2 border-gray-600 rounded-xl p-4 mb-4">
                      <div className="text-center">
                        <div className="text-gray-300" style={{ fontSize: '1rem', fontWeight: 700 }}>
                          ⏰ Next Bonus Available In:
                        </div>
                        <div className="text-yellow-400 mt-2" style={{ fontSize: '2rem', fontWeight: 900 }}>
                          {formatCountdown()}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <motion.button
                      onClick={claimDailyBonus}
                      disabled={!bonusStatus.canClaim || claiming}
                      className={`flex-1 px-6 py-4 rounded-xl shadow-xl border-2 ${
                        bonusStatus.canClaim 
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-black border-yellow-300 cursor-pointer' 
                          : 'bg-gray-700 text-gray-500 border-gray-600 cursor-not-allowed'
                      }`}
                      style={{ fontSize: '1.125rem', fontWeight: 900 }}
                      whileHover={bonusStatus.canClaim ? { scale: 1.05 } : {}}
                      whileTap={bonusStatus.canClaim ? { scale: 0.98 } : {}}
                    >
                      {claiming ? '⏳ CLAIMING...' : bonusStatus.canClaim ? '🎉 CLAIM NOW!' : '🔒 ALREADY CLAIMED'}
                    </motion.button>
                  </div>
                  
                  <button
                    onClick={() => setShowDailyBonus(false)}
                    className="mt-3 text-gray-400 hover:text-white transition-colors"
                    style={{ fontSize: '0.875rem', fontWeight: 600 }}
                  >
                    Maybe later
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <LeaderboardModal
          onClose={() => setShowLeaderboard(false)}
          currentPlayerEmail={profile?.email}
        />
      )}

      {/* Settings Modal */}
      {onSettingsChange && (
        <GameSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          currentSettings={currentSettings}
          onSave={onSettingsChange}
        />
      )}
    </div>
  );
}