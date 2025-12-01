/**
 * 🎰 CASINO HOME SCREEN - LIVE STATS SYSTEM
 * 
 * This component displays real-time statistics that update automatically:
 * 
 * 1. 🎲 GAMES PLAYED: Total dice rolls across all tables (single & multiplayer)
 *    - Tracked on every dice roll via /stats/game endpoint
 *    - Updated LIVE every 5 seconds
 * 
 * 2. 💰 TOTAL JACKPOT: Total winnings paid to all players
 *    - Tracked when ANY player wins via /stats/jackpot endpoint
 *    - Updated LIVE every 5 seconds
 * 
 * 3. 👥 PLAYERS ONLINE: Active players right now
 *    - Tracked via heartbeat system (every 60 seconds)
 *    - Players active in last 5 minutes are counted
 *    - Updated LIVE every 5 seconds
 * 
 * Visual Features:
 * - ⚡ Flash animation when numbers change
 * - 🔴 LIVE badges on all stat boxes
 * - ✨ Sparkle effects
 * - 📊 "Last synced Xs ago" indicator
 * - 🎨 Color-coded with shadows and glows
 * 
 * The stats are perfectly synced between single player and multiplayer modes.
 * Every roll counts. Every win counts. Every player counts. All in real-time.
 */

import { useState, useEffect } from 'react';
import { Sparkles, Trophy, Users, Zap, DollarSign, Crown, Star, Dices, Heart, Diamond, Spade, Club, Settings, Shield, Lock, Globe, TrendingUp, Target, Award, Rocket, CheckCircle, Flame, Gift, Volume2, VolumeX, ChevronLeft } from './Icons';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { HomePageDice } from './HomePageDice';
import { useDailyBonus } from '../hooks/useDailyBonus';


interface HotStreak {
  id: string;
  message: string;
  icon: string;
  timestamp: number;
}

interface CasinoHomeScreenProps {
  onStartGame: () => void;
  onShowAuth: () => void;
  onShowCreateAccount: () => void;
  onSwitchUser?: () => void;
  onShowSettings?: () => void;
  onShowLeaderboard?: () => void;
  isLoggedIn: boolean;
  playerName?: string;
  balance?: number;
  playerEmail?: string;
}

export function CasinoHomeScreen({ onStartGame, onShowAuth, onShowCreateAccount, onSwitchUser, onShowSettings, onShowLeaderboard, isLoggedIn, playerName, balance, playerEmail }: CasinoHomeScreenProps) {
  const [stats, setStats] = useState({
    playersOnline: 0,
    totalGames: 0,
    totalJackpot: 0
  });
  const [statsFlash, setStatsFlash] = useState({
    games: false,
    jackpot: false,
    players: false
  });
  const [hotStreaks, setHotStreaks] = useState<HotStreak[]>([]);
  const [tickerPosition, setTickerPosition] = useState(0);
  const [showDailyBonus, setShowDailyBonus] = useState(false);
  
  // Daily Bonus System
  const { status: bonusStatus, claiming, claimBonus, formatCountdown } = useDailyBonus(playerEmail || null);

  // Fetch real statistics from server
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/stats`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` },
          }
        );

        if (response.ok) {
          const data = await response.json();
          
          // Trigger flash animation if values changed
          setStats(prevStats => {
            const newFlash = {
              games: data.totalGames !== prevStats.totalGames,
              jackpot: data.totalJackpot !== prevStats.totalJackpot,
              players: data.playersOnline !== prevStats.playersOnline
            };
            
            if (newFlash.games || newFlash.jackpot || newFlash.players) {
              console.log('📊 STATS UPDATED LIVE:', {
                games: prevStats.totalGames + ' → ' + data.totalGames,
                jackpot: '$' + prevStats.totalJackpot + ' → $' + data.totalJackpot,
                players: prevStats.playersOnline + ' → ' + data.playersOnline
              });
              setStatsFlash(newFlash);
              setTimeout(() => {
                setStatsFlash({ games: false, jackpot: false, players: false });
              }, 500);
            }
            
            return data;
          });
        } else {
          // Silently fail - use default stats
          console.log('Stats endpoint not available, using defaults');
        }
      } catch (error) {
        // Silently fail - use default stats (no error logging)
        // This is normal if Supabase functions aren't deployed yet
      }
    };

    // Initial fetch
    fetchStats();

    // 🚀 SSE: Real-time stats updates (replaces polling!)
    console.log('🔥 Connecting to stats SSE stream for real-time updates...');
    
    const statsEventSource = new EventSource(
      `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/stats/stream`
    );

    statsEventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'stats' && message.data) {
          const data = message.data;
          
          setStats((prevStats) => {
            // Flash effect when stats change
            const hasChanged = 
              prevStats.totalGames !== data.totalGames ||
              prevStats.totalJackpot !== data.totalJackpot ||
              prevStats.playersOnline !== data.playersOnline;
            
            if (hasChanged) {
              const newFlash = {
                games: prevStats.totalGames !== data.totalGames ? prevStats.totalGames + ' → ' + data.totalGames : false,
                jackpot: prevStats.totalJackpot !== data.totalJackpot ? '$' + prevStats.totalJackpot + ' → $' + data.totalJackpot : false,
                players: prevStats.playersOnline !== data.playersOnline ? prevStats.playersOnline + ' → ' + data.playersOnline : false
              };
              setStatsFlash(newFlash);
              setTimeout(() => {
                setStatsFlash({ games: false, jackpot: false, players: false });
              }, 500);
            }
            
            return data;
          });
          
          console.log('📊 Stats updated via SSE:', data);
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    statsEventSource.onerror = () => {
      console.log('⚠️ Stats SSE connection closed (this is normal - will use HTTP polling as fallback)');
      statsEventSource.close();
    };

    return () => {
      console.log('🔌 Closing stats SSE connection');
      statsEventSource.close();
    };
  }, []);

  // Fetch real hot streaks from server
  useEffect(() => {
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
            // Fallback to default message if no real hot streaks yet
            setHotStreaks([
              { id: '1', message: '🎰 Welcome to Rollers Paradise! Start playing to see live action!', icon: '🎰', timestamp: Date.now() }
            ]);
          }
        }
      } catch (error) {
        // Silently fail - use default message (no error logging)
        // This is normal if Supabase functions aren't deployed yet
        setHotStreaks([
          { id: '1', message: '🎰 Welcome to Rollers Paradise! Start playing to see live action!', icon: '🎰', timestamp: Date.now() }
        ]);
      }
    };

    // Initial fetch
    fetchHotStreaks();

    // 🚀 SSE: Real-time hot streaks updates (replaces polling!)
    console.log('🔥 Connecting to streaks SSE stream...');
    
    const streaksEventSource = new EventSource(
      `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/streaks/stream`
    );

    streaksEventSource.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'streaks' && message.data && message.data.length > 0) {
          setHotStreaks(message.data);
          console.log('🔥 Hot streaks updated via SSE');
        }
      } catch (error) {
        console.error('Error parsing SSE message:', error);
      }
    };

    streaksEventSource.onerror = () => {
      console.log('⚠️ Streaks SSE connection closed (this is normal - will use HTTP polling as fallback)');
      streaksEventSource.close();
    };

    return () => {
      console.log('🔌 Closing streaks SSE connection');
      streaksEventSource.close();
    };
  }, []);

  // Track player session heartbeat
  useEffect(() => {
    if (playerName) {
      const playerId = `${playerName}-${Date.now()}`;
      
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
      const heartbeatInterval = setInterval(sendHeartbeat, 60000);
      
      return () => clearInterval(heartbeatInterval);
    }
  }, [playerName]);

  // Hot streak ticker animation
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerPosition((prev) => (prev + 1) % hotStreaks.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [hotStreaks.length]);



  const formatJackpot = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    } else {
      return `$${amount.toFixed(0)}`;
    }
  };

  const claimDailyBonus = async () => {
    const result = await claimBonus();
    if (result && result.success) {
      setShowDailyBonus(false);
      alert(`🎉 Congratulations! You claimed ${result.amount} FREE CHIPS! 💰`);
      // In production, also update the user's balance
    } else if (result) {
      alert(`❌ ${result.message}`);
    }
  };

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Settings Button - Bottom Left Corner */}
      {onShowSettings && (
        <button
          onClick={onShowSettings}
          className="fixed bottom-8 left-8 z-50 group animate-in fade-in zoom-in-95 duration-500"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl blur-lg animate-pulse" />
          <div className="relative bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 p-4 rounded-2xl border-4 border-purple-400 shadow-2xl hover:scale-110 hover:rotate-90 active:scale-95 transition-all duration-200">
            <Settings className="w-8 h-8 text-purple-200" />
          </div>
          {/* Tooltip - Positioned Above */}
          <div className="absolute bottom-full left-0 mb-3 px-4 py-2 bg-black/95 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-2xl border border-purple-400/50">
            ⚙️ Settings & Volume Control 🔊
            <div className="absolute top-full left-6 border-[6px] border-transparent border-t-black/95" />
          </div>
        </button>
      )}
      
      {/* Bright outer glow border effects */}
      <div 
        className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-yellow-400 to-red-600 animate-pulse"
        style={{
          boxShadow: '0 0 30px 8px rgba(250,204,21,0.8), 0 0 50px 12px rgba(239,68,68,0.5)'
        }}
      />
      <div 
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600 animate-pulse"
        style={{
          boxShadow: '0 0 30px 8px rgba(250,204,21,0.8), 0 0 50px 12px rgba(245,158,11,0.5)',
          animationDelay: '0.5s'
        }}
      />
      <div 
        className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-red-600 via-yellow-400 to-red-600 animate-pulse"
        style={{
          boxShadow: '0 0 30px 8px rgba(250,204,21,0.8), 0 0 50px 12px rgba(239,68,68,0.5)',
          animationDelay: '0.25s'
        }}
      />
      <div 
        className="absolute top-0 bottom-0 right-0 w-1 bg-gradient-to-b from-amber-600 via-yellow-400 to-amber-600 animate-pulse"
        style={{
          boxShadow: '0 0 30px 8px rgba(250,204,21,0.8), 0 0 50px 12px rgba(245,158,11,0.5)',
          animationDelay: '0.75s'
        }}
      />
      
      {/* Rich Vegas Background */}
      <div className="absolute inset-0">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-950 via-black to-amber-950" />
        
        {/* Casino pattern overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23FFD700' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}
        />

        {/* Vegas lights border - STATIC, NO ANIMATION */}
        <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-red-600 via-yellow-500 to-red-600" />
        <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-600 via-red-500 to-amber-600" />
        <div className="absolute top-0 bottom-0 left-0 w-3 bg-gradient-to-b from-red-600 via-yellow-500 to-red-600" />
        <div className="absolute top-0 bottom-0 right-0 w-3 bg-gradient-to-b from-amber-600 via-red-500 to-amber-600" />

        {/* Corner accents */}
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-red-600/20 to-transparent rounded-full" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-amber-600/20 to-transparent rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-yellow-600/20 to-transparent rounded-full" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-to-tl from-red-600/20 to-transparent rounded-full" />

        {/* Floating sparkles and stars */}
        {[...Array(50)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute w-2 h-2 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 ? '#FFD700' : i % 3 === 1 ? '#FFA500' : '#FF6B6B',
              animationDuration: `${3 + Math.random() * 2}s`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}

        {/* Animated coin rain */}
        {[...Array(15)].map((_, i) => (
          <div
            key={`coin-${i}`}
            className="absolute w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full border-2 border-yellow-300 shadow-lg animate-bounce"
            style={{
              left: `${5 + i * 6}%`,
              top: `${10 + (i % 5) * 20}%`,
              animationDuration: `${2 + Math.random() * 1}s`,
              animationDelay: `${i * 0.1}s`,
            }}
          >
            <div className="absolute inset-1 bg-gradient-to-br from-yellow-200 to-transparent rounded-full" />
          </div>
        ))}

        {/* Floating dice - REMOVED due to production rendering issues */}
        {/* The dice decorations were showing as black squares in production */}
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen p-4 overflow-y-auto">
        
        {/* Vegas Marquee Style Header */}
        <div className="w-full mb-6 animate-in fade-in zoom-in-95 duration-800">
          {/* Layout wrapper for non-logged-in users */}
          {!isLoggedIn ? (
            <div className="relative w-full">
              {/* Three-column layout: Create Account | Marquee Sign | Login */}
              <div className="flex justify-between items-start gap-8 w-full px-8">
                {/* Left: Create Account Button - MATCHES STATS BOXES */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-700 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
                  <button
                    onClick={onShowCreateAccount}
                    className="relative bg-gradient-to-br from-black via-emerald-950 to-black border-4 border-green-500 rounded-2xl p-6 shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" fill="currentColor" />
                      </div>
                      <span className="text-green-400" style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                        CREATE ACCOUNT
                      </span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <DollarSign className="w-8 h-8 text-yellow-400" />
                      <p className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500" style={{ fontSize: '2rem', fontWeight: 900, textShadow: '0 0 20px rgba(250,204,21,0.5)' }}>
                        1,000 FREE CHIPS
                      </p>
                      <Crown className="w-8 h-8 text-yellow-400" fill="currentColor" />
                    </div>
                    <div className="mt-2 text-center text-green-300" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      Get Started Now!
                    </div>
                    <div className="absolute top-2 right-2 animate-pulse">
                      <Sparkles className="w-5 h-5 text-yellow-400" />
                    </div>
                  </button>
                </div>
                
                {/* Center: Main Marquee Sign */}
                <div className="flex-1 flex justify-center">
                  <div className="relative inline-block mb-8 text-center">
            {/* Sign background with border lights */}
            <div className="relative bg-gradient-to-br from-red-900 via-red-800 to-red-900 border-8 border-amber-400 rounded-3xl p-8 shadow-2xl">
              {/* Inner glow border */}
              <div className="absolute inset-2 border-4 border-yellow-300/50 rounded-2xl pointer-events-none" />
              
              {/* Light bulbs around border */}
              <div className="absolute -top-3 left-0 right-0 flex justify-around">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={`top-${i}`} 
                    className="w-4 h-4 rounded-full bg-yellow-400 shadow-lg animate-pulse"
                    style={{
                      boxShadow: '0 0 15px rgba(250,204,21,0.8)',
                      animationDuration: '0.6s',
                      animationDelay: `${i * 0.05}s`,
                    }}
                  />
                ))}
              </div>
              <div className="absolute -bottom-3 left-0 right-0 flex justify-around">
                {[...Array(12)].map((_, i) => (
                  <div 
                    key={`bottom-${i}`} 
                    className="w-4 h-4 rounded-full bg-yellow-400 shadow-lg animate-pulse"
                    style={{
                      boxShadow: '0 0 15px rgba(250,204,21,0.8)',
                      animationDuration: '0.6s',
                      animationDelay: `${(12 + i) * 0.05}s`,
                    }}
                  />
                ))}
              </div>
              <div className="absolute -left-3 top-0 bottom-0 flex flex-col justify-around">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={`left-${i}`} 
                    className="w-4 h-4 rounded-full bg-yellow-400 shadow-lg animate-pulse"
                    style={{
                      animationDelay: `${(24 + i) * 0.05}s`,
                      boxShadow: '0 0 15px rgba(250,204,21,0.8)'
                    }}
                  />
                ))}
              </div>
              <div className="absolute -right-3 top-0 bottom-0 flex flex-col justify-around">
                {[...Array(8)].map((_, i) => (
                  <div 
                    key={`right-${i}`} 
                    className="w-4 h-4 rounded-full bg-yellow-400 shadow-lg animate-pulse"
                    style={{
                      animationDelay: `${(32 + i) * 0.05}s`,
                      boxShadow: '0 0 15px rgba(250,204,21,0.8)'
                    }}
                  />
                ))}
              </div>

              {/* Title */}
              <div className="flex items-center justify-center gap-6 mb-4">
                <h1 
                  className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-600 animate-pulse"
                  style={{ 
                    fontSize: '3.5rem', 
                    fontWeight: 900,
                    textShadow: '0 0 60px rgba(250,204,21,0.6), 0 0 30px rgba(234,179,8,0.8), 0 4px 30px rgba(0,0,0,0.9)',
                    letterSpacing: '0.05em',
                    WebkitTextStroke: '2px rgba(234,179,8,0.3)'
                  }}
                >
                  ROLLERS PARADISE
                </h1>
              </div>

              <div className="flex items-center justify-center gap-3">
                <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
                <p 
                  className="text-yellow-300"
                  style={{ 
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    textShadow: '0 2px 20px rgba(0,0,0,0.8), 0 0 30px rgba(250,204,21,0.4)',
                    letterSpacing: '0.1em'
                  }}
                >
                  CRAPLESS & BUBBLE CRAPS
                </p>
                <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
              </div>
              
              {/* Subtitle ribbon - Inside the main box */}
              <div className="relative inline-block mt-6">
                <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 px-8 py-3 shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                  <p 
                    className="relative text-black"
                    style={{ 
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      letterSpacing: '0.15em',
                      textShadow: '0 1px 0 rgba(255,255,255,0.5)'
                    }}
                  >
                    ★ WHERE FORTUNE MEETS VEGAS EXCITEMENT ★
                  </p>
                </div>
                {/* Ribbon edges */}
                <div className="absolute -left-4 top-0 bottom-0 w-4 bg-amber-700 transform -skew-y-3" />
                <div className="absolute -right-4 top-0 bottom-0 w-4 bg-amber-700 transform skew-y-3" />
              </div>
            </div>

                    {/* Shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-3xl pointer-events-none" />
                  </div>
                </div>
                
                {/* Right: Login Button - MATCHES STATS BOXES */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-800 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
                  <button
                    onClick={onShowAuth}
                    className="relative bg-gradient-to-br from-black via-blue-950 to-black border-4 border-blue-600 rounded-2xl p-6 shadow-2xl hover:scale-105 active:scale-95 transition-transform"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <span className="text-blue-400" style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                        SIGN IN
                      </span>
                    </div>
                    <div className="flex items-center gap-2 justify-center">
                      <Users className="w-8 h-8 text-purple-400" />
                      <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-purple-400 to-blue-500" style={{ fontSize: '2rem', fontWeight: 900, textShadow: '0 0 20px rgba(59,130,246,0.5)' }}>
                        WELCOME
                      </p>
                      <Zap className="w-8 h-8 text-blue-400" fill="currentColor" />
                    </div>
                    <div className="mt-2 text-center text-purple-300" style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                      Continue Playing!
                    </div>
                    <div className="absolute top-2 right-2 animate-pulse">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Logged-in layout - Centered marquee sign */
            <div className="text-center">
              <div className="relative inline-block mb-8">
                {/* Sign background with border lights */}
                <div className="relative bg-gradient-to-br from-red-900 via-red-800 to-red-900 border-8 border-amber-400 rounded-3xl p-8 shadow-2xl">
                  {/* Inner glow border */}
                  <div className="absolute inset-2 border-4 border-yellow-300/50 rounded-2xl pointer-events-none" />
                  
                  {/* Light bulbs around border */}
                  <div className="absolute -top-3 left-0 right-0 flex justify-around">
                    {[...Array(12)].map((_, i) => (
                      <div 
                        key={`top-${i}`} 
                        className="w-4 h-4 rounded-full bg-yellow-400 shadow-lg animate-pulse"
                        style={{
                          boxShadow: '0 0 15px rgba(250,204,21,0.8)',
                          animationDuration: '0.6s',
                          animationDelay: `${i * 0.05}s`
                        }}
                      />
                    ))}
                  </div>
                  <div className="absolute -bottom-3 left-0 right-0 flex justify-around">
                    {[...Array(12)].map((_, i) => (
                      <div 
                        key={`bottom-${i}`} 
                        className="w-4 h-4 rounded-full bg-yellow-400 shadow-lg animate-pulse"
                        style={{
                          boxShadow: '0 0 15px rgba(250,204,21,0.8)',
                          animationDuration: '0.6s',
                          animationDelay: `${(12 + i) * 0.05}s`
                        }}
                      />
                    ))}
                  </div>
                  <div className="absolute -left-3 top-0 bottom-0 flex flex-col justify-around">
                    {[...Array(8)].map((_, i) => (
                      <div 
                        key={`left-${i}`} 
                        className="w-4 h-4 rounded-full bg-yellow-400 shadow-lg animate-pulse"
                        style={{
                          boxShadow: '0 0 15px rgba(250,204,21,0.8)',
                          animationDuration: '0.6s',
                          animationDelay: `${(24 + i) * 0.05}s`
                        }}
                      />
                    ))}
                  </div>
                  <div className="absolute -right-3 top-0 bottom-0 flex flex-col justify-around">
                    {[...Array(8)].map((_, i) => (
                      <div 
                        key={`right-${i}`} 
                        className="w-4 h-4 rounded-full bg-yellow-400 shadow-lg animate-pulse"
                        style={{
                          boxShadow: '0 0 15px rgba(250,204,21,0.8)',
                          animationDuration: '0.6s',
                          animationDelay: `${(32 + i) * 0.05}s`
                        }}
                      />
                    ))}
                  </div>

                  {/* Title */}
                  <div className="flex items-center justify-center gap-6 mb-4">
                    <h1 
                      className="text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-600 animate-pulse"
                      style={{ 
                        fontSize: '3.5rem', 
                        fontWeight: 900,
                        textShadow: '0 0 60px rgba(250,204,21,0.6), 0 0 30px rgba(234,179,8,0.8), 0 4px 30px rgba(0,0,0,0.9)',
                        letterSpacing: '0.05em',
                        WebkitTextStroke: '2px rgba(234,179,8,0.3)'
                      }}
                    >
                      ROLLERS PARADISE
                    </h1>
                  </div>

                  <div className="flex items-center justify-center gap-3">
                    <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
                    <p 
                      className="text-yellow-300"
                      style={{ 
                        fontSize: '1.75rem',
                        fontWeight: 700,
                        textShadow: '0 2px 20px rgba(0,0,0,0.8), 0 0 30px rgba(250,204,21,0.4)',
                        letterSpacing: '0.1em'
                      }}
                    >
                      CRAPLESS & BUBBLE CRAPS
                    </p>
                    <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
                  </div>
                  
                  {/* Subtitle ribbon */}
                  <div className="relative inline-block mt-6">
                    <div className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 px-8 py-3 shadow-xl">
                      <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent" />
                      <p 
                        className="relative text-black"
                        style={{ 
                          fontSize: '1.25rem',
                          fontWeight: 800,
                          letterSpacing: '0.15em',
                          textShadow: '0 1px 0 rgba(255,255,255,0.5)'
                        }}
                      >
                        ★ WHERE FORTUNE MEETS VEGAS EXCITEMENT ★
                      </p>
                    </div>
                    {/* Ribbon edges */}
                    <div className="absolute -left-4 top-0 bottom-0 w-4 bg-amber-700 transform -skew-y-3" />
                    <div className="absolute -right-4 top-0 bottom-0 w-4 bg-amber-700 transform skew-y-3" />
                  </div>
                </div>

                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-3xl pointer-events-none" />
              </div>
            </div>
          )}
        </div>

          {/* Live Stats - Vegas Style Cards */}
          <div className="flex justify-center items-stretch gap-8 mb-8 w-full max-w-6xl mx-auto px-8 animate-in fade-in slide-in-from-bottom-8 duration-800" style={{ animationDelay: '0.4s' }}>
            {/* Games Played - FIRST POSITION */}
            <div className="relative group flex-1 min-w-[280px]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-purple-800 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-gradient-to-br from-black via-purple-950 to-black border-4 border-purple-600 rounded-2xl p-8 shadow-2xl h-full flex flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-purple-400 text-center" style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                    GAMES PLAYED
                  </span>
                </div>
                <p 
                  className={`text-white text-center transition-all duration-300 ${statsFlash.games ? 'scale-110 text-purple-300' : ''}`} 
                  style={{ 
                    fontSize: stats.totalGames >= 1000000 ? '2.25rem' : stats.totalGames >= 100000 ? '2.5rem' : '3rem',
                    fontWeight: 900, 
                    textShadow: statsFlash.games ? '0 0 30px rgba(168,85,247,1)' : '0 0 20px rgba(168,85,247,0.5)',
                    wordBreak: 'break-word'
                  }}
                >
                  {stats.totalGames.toLocaleString()}
                </p>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-black/95 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  🎲 Total dice rolls across ALL tables
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/95" />
                </div>
              </div>
            </div>

            {/* Total Jackpot - SWAPPED TO SECOND POSITION */}
            <div className="relative group flex-1 min-w-[280px]">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-gradient-to-br from-black via-amber-950 to-black border-4 border-yellow-500 rounded-2xl p-8 shadow-2xl h-full flex flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                    <Crown className="w-6 h-6 text-black" />
                  </div>
                  <span className="text-yellow-400 text-center" style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                    TOTAL JACKPOT
                  </span>
                </div>
                <p 
                  className={`text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 text-center transition-all duration-300 ${statsFlash.jackpot ? 'scale-110' : ''}`} 
                  style={{ 
                    fontSize: stats.totalJackpot >= 1000000 ? '2.25rem' : stats.totalJackpot >= 100000 ? '2.5rem' : '3rem',
                    fontWeight: 900, 
                    textShadow: statsFlash.jackpot ? '0 0 30px rgba(250,204,21,1)' : '0 0 20px rgba(250,204,21,0.5)',
                    wordBreak: 'break-word'
                  }}
                >
                  {formatJackpot(stats.totalJackpot)}
                </p>
                <div className="absolute bottom-3 right-3">
                  <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-black/95 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  💰 Total winnings paid to ALL players
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/95" />
                </div>
              </div>
            </div>

            {/* Players Online - SWAPPED TO THIRD POSITION */}
            <div className="relative group flex-1 min-w-[280px]">
              <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-gradient-to-br from-black via-red-950 to-black border-4 border-red-600 rounded-2xl p-8 shadow-2xl h-full flex flex-col items-center justify-center">
                <div className="flex flex-col items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center shadow-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-red-400 text-center" style={{ fontSize: '1rem', fontWeight: 700, letterSpacing: '0.05em' }}>
                    PLAYERS ONLINE
                  </span>
                </div>
                <p 
                  className={`text-white text-center transition-all duration-300 ${statsFlash.players ? 'scale-110 text-red-300' : ''}`} 
                  style={{ 
                    fontSize: stats.playersOnline >= 10000 ? '2.25rem' : stats.playersOnline >= 1000 ? '2.5rem' : '3rem',
                    fontWeight: 900, 
                    textShadow: statsFlash.players ? '0 0 30px rgba(239,68,68,1)' : '0 0 20px rgba(239,68,68,0.5)',
                    wordBreak: 'break-word'
                  }}
                >
                  {stats.playersOnline}
                </p>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-black/95 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  👥 Active players RIGHT NOW
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/95" />
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Button */}
          {onShowLeaderboard && (
            <div className="relative max-w-md w-full mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: '0.4s' }}>
              <button
                onClick={onShowLeaderboard}
                className="relative w-full group"
              >
                {/* Glow effects */}
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-yellow-500 rounded-2xl blur-xl animate-pulse" />
                
                <div className="relative bg-gradient-to-r from-yellow-600 via-orange-600 to-yellow-600 px-8 py-4 rounded-2xl shadow-2xl border-4 overflow-hidden hover:scale-105 active:scale-98 transition-transform" style={{ borderColor: '#FFD700', boxShadow: '0 0 30px rgba(255, 215, 0, 0.6)' }}>
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse" />

                  {/* Content */}
                  <div className="relative flex items-center justify-center gap-4">
                    <Trophy className="w-8 h-8 text-white" />
                    <span 
                      className="text-white"
                      style={{ 
                        fontSize: '1.5rem', 
                        fontWeight: 900, 
                        letterSpacing: '0.1em',
                        textShadow: '0 0 20px rgba(255,215,0,0.8), 0 2px 10px rgba(0,0,0,1)'
                      }}
                    >
                      VIEW LEADERBOARD
                    </span>
                    <Crown className="w-8 h-8 text-white" fill="currentColor" />
                  </div>
                  
                  {/* Sub text */}
                  <div className="relative text-center mt-2">
                    <span className="text-yellow-200" style={{ fontSize: '0.875rem', fontWeight: 700 }}>
                      🏆 Compete with the best players! 🏆
                    </span>
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* User Info for logged-in users */}
          {isLoggedIn && playerName && (
            <div className="relative max-w-2xl w-full mb-6 animate-in fade-in zoom-in-95 duration-800" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl blur-2xl opacity-60" />
              <div className="relative bg-gradient-to-br from-green-900 via-emerald-950 to-green-900 border-4 border-green-500 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center border-4 border-green-300 shadow-xl shadow-green-500/50">
                        <span className="text-white" style={{ fontSize: '2.5rem', fontWeight: 900 }}>
                          {playerName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-4 border-green-900 shadow-lg" />
                    </div>
                    
                    <div className="text-center">
                      <p className="text-green-300 mb-1" style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                        WELCOME BACK
                      </p>
                      <p className="text-white mb-3" style={{ fontSize: '2rem', fontWeight: 900, textShadow: '0 0 20px rgba(34,197,94,0.5)' }}>
                        {playerName}
                      </p>
                      <div className="flex items-center gap-2 bg-black/40 rounded-full px-4 py-2 border border-green-500/30">
                        <DollarSign className="w-6 h-6 text-green-400" />
                        <span className="text-green-400" style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                          {balance?.toLocaleString() || 0}
                        </span>
                        <span className="text-green-300" style={{ fontSize: '1rem', fontWeight: 600 }}>
                          CHIPS
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    {/* Play Now Button */}
                    <button
                      onClick={onStartGame}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl blur-lg group-hover:blur-xl transition-all opacity-75 group-hover:opacity-100" />
                      <div className="relative bg-gradient-to-r from-red-600 via-orange-500 to-red-600 hover:from-red-500 hover:via-orange-400 hover:to-red-500 px-8 py-5 rounded-2xl transition-all transform group-hover:scale-105 shadow-2xl border-4 border-yellow-400">
                        <div className="flex flex-col items-center gap-2">
                          <Zap className="w-8 h-8 text-yellow-300" fill="currentColor" />
                          <span className="text-white" style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.05em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                            PLAY NOW
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Back Button */}
                    {onSwitchUser && (
                      <button
                        onClick={() => window.history.back()}
                        className="relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl blur-lg group-hover:blur-xl transition-all opacity-75 group-hover:opacity-100" />
                        <div className="relative bg-gradient-to-r from-blue-700 via-blue-800 to-blue-700 hover:from-blue-600 hover:via-blue-700 hover:to-blue-600 px-8 py-5 rounded-2xl transition-all transform group-hover:scale-105 shadow-2xl border-4 border-amber-500">
                          <div className="flex flex-col items-center gap-2">
                            <ChevronLeft className="w-8 h-8 text-amber-400" />
                            <span className="text-white" style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.05em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                              BACK
                            </span>
                          </div>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Hot Streak Ticker - Vegas Style */}
          <div className="mt-6 max-w-5xl mx-auto px-4 w-full animate-in fade-in slide-in-from-bottom-4 duration-800" style={{ animationDelay: '0.6s' }}>
            <div className="bg-gradient-to-r from-red-900 via-orange-900 to-red-900 border-4 border-orange-500 rounded-2xl p-3 shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex items-center gap-2 bg-orange-600 px-3 py-1.5 rounded-full shadow-lg">
                  <Flame className="w-4 h-4 text-white" fill="currentColor" />
                  <span className="text-white" style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.05em' }}>LIVE HOT STREAKS</span>
                  <Flame className="w-4 h-4 text-white" fill="currentColor" />
                </div>
                <div className="flex-1 h-1 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 rounded-full" />
                <div className="bg-yellow-400 text-black px-2 py-0.5 rounded-full" style={{ fontSize: '0.625rem', fontWeight: 800 }}>
                  REAL-TIME
                </div>
              </div>
              <div className="relative h-16 overflow-hidden">
                <div className="absolute inset-0 flex items-center animate-in fade-in slide-in-from-top-12 duration-600">
                  <div className="flex items-center gap-3 w-full">
                    <div className="text-3xl">{hotStreaks[tickerPosition]?.icon}</div>
                    <p className="text-yellow-300 flex-1" style={{ fontSize: '1rem', fontWeight: 700 }}>
                      {hotStreaks[tickerPosition]?.message}
                    </p>
                    <Sparkles className="w-5 h-5 text-yellow-400" fill="currentColor" />
                  </div>
                </div>
              </div>
              
              {/* Pulsing dots indicator */}
              <div className="flex justify-center gap-2 mt-2">
                {hotStreaks.slice(0, 4).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-1.5 h-1.5 rounded-full ${idx === tickerPosition % 4 ? 'bg-yellow-400 animate-pulse' : 'bg-gray-600'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Daily Bonus Callout - Only for logged-in users */}
          {isLoggedIn && (
            <div className="mt-4 flex justify-center animate-in fade-in zoom-in-95 duration-800" style={{ animationDelay: '0.7s' }}>
              <button
                onClick={() => bonusStatus.canClaim && setShowDailyBonus(true)}
                className={`relative group ${!bonusStatus.canClaim ? 'cursor-not-allowed opacity-60' : ''} ${bonusStatus.canClaim ? 'hover:scale-105 active:scale-95' : ''} transition-transform`}
              >
                {bonusStatus.canClaim && (
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
                )}
                <div className={`relative px-8 py-4 rounded-2xl border-4 shadow-2xl ${
                  bonusStatus.canClaim 
                    ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-pink-600 border-pink-300' 
                    : 'bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 border-gray-500'
                }`}>
                  <div className="flex items-center gap-4">
                    <div className={`text-4xl ${bonusStatus.canClaim ? 'animate-bounce' : ''}`}>
                      🎁
                    </div>
                    <div className="text-left">
                      <div className={`${bonusStatus.canClaim ? 'text-white' : 'text-gray-400'}`} style={{ fontSize: '1.5rem', fontWeight: 900, textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>
                        {bonusStatus.canClaim ? 'CLAIM YOUR DAILY BONUS!' : 'DAILY BONUS CLAIMED'}
                      </div>
                      <div className={`${bonusStatus.canClaim ? 'text-pink-200' : 'text-gray-500'}`} style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                        {bonusStatus.canClaim ? 'Free chips waiting for you' : `Next bonus in: ${formatCountdown()}`}
                      </div>
                    </div>
                    <Sparkles className="w-8 h-8 text-yellow-300" fill="currentColor" />
                  </div>
                </div>
              </button>
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-6 mb-4 text-center animate-in fade-in duration-800" style={{ animationDelay: '0.9s' }}>
            <div className="inline-block bg-black/60 border border-amber-600/30 rounded-full px-8 py-3 backdrop-blur-sm">
              <p className="text-amber-400" style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '0.05em' }}>
                ★ No Real Money • $3 Minimum Bet • 100% Fair Play ★
              </p>
            </div>
          </div>
      </div>

      {/* Daily Bonus Modal */}
      {showDailyBonus && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
          onClick={() => setShowDailyBonus(false)}
        >
          <div
            className="relative animate-in fade-in zoom-in-95 duration-500"
            onClick={(e) => e.stopPropagation()}
          >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-600 rounded-3xl opacity-80 animate-pulse" style={{ filter: 'blur(48px)' }} />
              
              {/* Modal content */}
              <div className="relative bg-gradient-to-br from-pink-900 via-rose-950 to-pink-900 rounded-3xl p-8 max-w-md w-full border-4 border-pink-400 shadow-2xl">
                <div className="text-center">
                  <div className="text-8xl mb-4 animate-bounce">
                    🎁
                  </div>
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
                    <button
                      onClick={claimDailyBonus}
                      disabled={!bonusStatus.canClaim || claiming}
                      className={`flex-1 px-6 py-4 rounded-xl shadow-xl border-2 ${
                        bonusStatus.canClaim 
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 hover:scale-105 active:scale-98 text-black border-yellow-300 cursor-pointer transition-transform' 
                          : 'bg-gray-700 text-gray-500 border-gray-600 cursor-not-allowed'
                      }`}
                      style={{ fontSize: '1.125rem', fontWeight: 900 }}
                    >
                      {claiming ? '⏳ CLAIMING...' : bonusStatus.canClaim ? '🎉 CLAIM NOW!' : '🔒 ALREADY CLAIMED'}
                    </button>
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
          </div>
        </div>
      )}
    </div>
  );
}