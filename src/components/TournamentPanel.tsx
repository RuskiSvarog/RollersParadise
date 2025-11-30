import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, X, Clock, Users, DollarSign, Star, Crown, Zap, Calendar, Award, TrendingUp } from 'lucide-react';
import { notify } from './NotificationCenter';

interface Tournament {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly' | 'monthly' | 'special';
  status: 'upcoming' | 'active' | 'ended';
  prizePool: number;
  entryFee: number;
  maxPlayers: number;
  currentPlayers: number;
  startTime: number;
  endTime: number;
  prizes: {
    place: number;
    amount: number;
    bonus?: string;
  }[];
  requirements?: {
    minLevel?: number;
    vipOnly?: boolean;
  };
}

interface TournamentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  playerLevel: number;
  playerChips: number;
  isVIP: boolean;
}

export function TournamentPanel({ isOpen, onClose, playerLevel, playerChips, isVIP }: TournamentPanelProps) {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'upcoming'>('active');

  useEffect(() => {
    if (isOpen) {
      loadTournaments();
    }
  }, [isOpen]);

  const loadTournaments = () => {
    const now = Date.now();
    const oneHour = 3600000;
    const oneDay = 86400000;

    const mockTournaments: Tournament[] = [
      {
        id: '1',
        name: '🔥 Hot Roller Challenge',
        description: 'Win the most consecutive rolls in 1 hour!',
        type: 'daily',
        status: 'active',
        prizePool: 50000,
        entryFee: 500,
        maxPlayers: 100,
        currentPlayers: 67,
        startTime: now - oneHour,
        endTime: now + oneHour * 2,
        prizes: [
          { place: 1, amount: 25000, bonus: '🏆 Gold Trophy Badge' },
          { place: 2, amount: 15000, bonus: '🥈 Silver Trophy Badge' },
          { place: 3, amount: 10000, bonus: '🥉 Bronze Trophy Badge' },
        ]
      },
      {
        id: '2',
        name: '👑 VIP Exclusive: High Roller Showdown',
        description: 'VIP-only tournament with massive prizes!',
        type: 'weekly',
        status: 'active',
        prizePool: 250000,
        entryFee: 5000,
        maxPlayers: 50,
        currentPlayers: 32,
        startTime: now - oneDay,
        endTime: now + oneDay * 6,
        prizes: [
          { place: 1, amount: 150000, bonus: '💎 Diamond Dice + 1 Month VIP' },
          { place: 2, amount: 60000, bonus: '💎 Diamond Dice' },
          { place: 3, amount: 40000, bonus: '⭐ Special Avatar Frame' },
        ],
        requirements: {
          vipOnly: true,
          minLevel: 20
        }
      },
      {
        id: '3',
        name: '⚡ Speed Rolling Sprint',
        description: 'Make the most rolls in 30 minutes!',
        type: 'daily',
        status: 'upcoming',
        prizePool: 30000,
        entryFee: 300,
        maxPlayers: 150,
        currentPlayers: 0,
        startTime: now + oneHour * 3,
        endTime: now + oneHour * 4,
        prizes: [
          { place: 1, amount: 15000 },
          { place: 2, amount: 9000 },
          { place: 3, amount: 6000 },
        ]
      },
      {
        id: '4',
        name: '🎰 Weekend Mega Tournament',
        description: 'Biggest wins get the glory!',
        type: 'weekly',
        status: 'upcoming',
        prizePool: 500000,
        entryFee: 10000,
        maxPlayers: 200,
        currentPlayers: 0,
        startTime: now + oneDay * 2,
        endTime: now + oneDay * 4,
        prizes: [
          { place: 1, amount: 300000, bonus: '👑 Legendary Champion Badge' },
          { place: 2, amount: 120000, bonus: '🏆 Elite Winner Badge' },
          { place: 3, amount: 80000, bonus: '⭐ Pro Player Badge' },
        ],
        requirements: {
          minLevel: 15
        }
      },
      {
        id: '5',
        name: '🌟 Beginner\'s Luck Tournament',
        description: 'Perfect for new players!',
        type: 'daily',
        status: 'active',
        prizePool: 10000,
        entryFee: 100,
        maxPlayers: 100,
        currentPlayers: 45,
        startTime: now - oneHour * 2,
        endTime: now + oneHour * 4,
        prizes: [
          { place: 1, amount: 5000, bonus: '🌟 Rising Star Badge' },
          { place: 2, amount: 3000 },
          { place: 3, amount: 2000 },
        ],
        requirements: {
          minLevel: undefined
        }
      }
    ];

    setTournaments(mockTournaments);
  };

  const getTimeRemaining = (endTime: number): string => {
    const remaining = endTime - Date.now();
    if (remaining <= 0) return 'Ended';
    
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTimeUntilStart = (startTime: number): string => {
    const remaining = startTime - Date.now();
    if (remaining <= 0) return 'Started';
    
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `Starts in ${days}d ${hours % 24}h`;
    }
    if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
    return `Starts in ${minutes}m`;
  };

  const canJoinTournament = (tournament: Tournament): { canJoin: boolean; reason?: string } => {
    if (tournament.status === 'ended') {
      return { canJoin: false, reason: 'Tournament has ended' };
    }
    if (tournament.currentPlayers >= tournament.maxPlayers) {
      return { canJoin: false, reason: 'Tournament is full' };
    }
    if (playerChips < tournament.entryFee) {
      return { canJoin: false, reason: 'Not enough chips' };
    }
    if (tournament.requirements?.vipOnly && !isVIP) {
      return { canJoin: false, reason: 'VIP only' };
    }
    if (tournament.requirements?.minLevel && playerLevel < tournament.requirements.minLevel) {
      return { canJoin: false, reason: `Requires level ${tournament.requirements.minLevel}` };
    }
    return { canJoin: true };
  };

  const joinTournament = (tournament: Tournament) => {
    const { canJoin, reason } = canJoinTournament(tournament);
    
    if (!canJoin) {
      notify.warning(reason || 'Cannot join tournament');
      return;
    }

    // Deduct entry fee
    notify.success(`Joined ${tournament.name}! Entry fee: $${tournament.entryFee}`);
    
    // Update tournament players
    const updated = tournaments.map(t => 
      t.id === tournament.id 
        ? { ...t, currentPlayers: t.currentPlayers + 1 }
        : t
    );
    setTournaments(updated);
    setSelectedTournament(null);
  };

  const filteredTournaments = tournaments.filter(t => {
    if (activeFilter === 'all') return true;
    return t.status === activeFilter;
  });

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-br from-gray-900 via-purple-900/30 to-gray-900 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border-4 border-purple-500/50"
          style={{
            boxShadow: '0 0 60px rgba(168, 85, 247, 0.3)'
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 p-6 border-b-4 border-purple-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Trophy className="w-8 h-8 text-white" />
                <div>
                  <h2 className="text-3xl font-black text-white">Tournaments</h2>
                  <p className="text-purple-100 text-sm">
                    Compete for glory and prizes!
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-purple-200 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setActiveFilter('all')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeFilter === 'all'
                    ? 'bg-white text-purple-600'
                    : 'bg-purple-700/50 text-white hover:bg-purple-700'
                }`}
              >
                All Tournaments
              </button>
              <button
                onClick={() => setActiveFilter('active')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeFilter === 'active'
                    ? 'bg-white text-purple-600'
                    : 'bg-purple-700/50 text-white hover:bg-purple-700'
                }`}
              >
                🔥 Active
              </button>
              <button
                onClick={() => setActiveFilter('upcoming')}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${
                  activeFilter === 'upcoming'
                    ? 'bg-white text-purple-600'
                    : 'bg-purple-700/50 text-white hover:bg-purple-700'
                }`}
              >
                📅 Upcoming
              </button>
            </div>
          </div>

          {/* Tournament List */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="grid md:grid-cols-2 gap-4">
              {filteredTournaments.map((tournament, index) => {
                const { canJoin, reason } = canJoinTournament(tournament);
                
                return (
                  <motion.div
                    key={tournament.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border-2 ${
                      tournament.status === 'active'
                        ? 'border-green-500/50'
                        : 'border-gray-700'
                    } hover:border-purple-500 transition-all cursor-pointer`}
                    onClick={() => setSelectedTournament(tournament)}
                  >
                    {/* Tournament Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-lg mb-1">
                          {tournament.name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {tournament.description}
                        </p>
                      </div>
                      {tournament.status === 'active' && (
                        <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                          LIVE
                        </span>
                      )}
                    </div>

                    {/* Tournament Info */}
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-gray-900/50 p-2 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Prize Pool</div>
                        <div className="text-green-400 font-bold flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {tournament.prizePool.toLocaleString()}
                        </div>
                      </div>
                      <div className="bg-gray-900/50 p-2 rounded-lg">
                        <div className="text-xs text-gray-400 mb-1">Entry Fee</div>
                        <div className="text-yellow-400 font-bold flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {tournament.entryFee.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>Players</span>
                        <span>{tournament.currentPlayers}/{tournament.maxPlayers}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                          style={{ width: `${(tournament.currentPlayers / tournament.maxPlayers) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Time Info */}
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />
                        {tournament.status === 'active' 
                          ? getTimeRemaining(tournament.endTime)
                          : getTimeUntilStart(tournament.startTime)
                        }
                      </div>
                      {tournament.requirements?.vipOnly && (
                        <Crown className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>

                    {/* Join Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (canJoin) {
                          joinTournament(tournament);
                        } else {
                          notify.warning(reason || 'Cannot join');
                        }
                      }}
                      disabled={!canJoin}
                      className={`w-full mt-3 py-2 rounded-lg font-bold transition-all ${
                        canJoin
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white'
                          : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {canJoin ? 'Join Tournament' : reason}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Tournament Details Modal */}
          {selectedTournament && (
            <div 
              className="absolute inset-0 bg-black/90 flex items-center justify-center p-4 z-10"
              onClick={() => setSelectedTournament(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-2xl p-8 max-w-2xl w-full border-4 border-purple-500"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-3xl font-black text-white">
                    {selectedTournament.name}
                  </h3>
                  <button
                    onClick={() => setSelectedTournament(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <p className="text-gray-300 mb-6">{selectedTournament.description}</p>

                {/* Prize Breakdown */}
                <div className="bg-gray-900/50 rounded-xl p-4 mb-6">
                  <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Prize Breakdown
                  </h4>
                  <div className="space-y-2">
                    {selectedTournament.prizes.map((prize) => (
                      <div key={prize.place} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300">
                          {prize.place === 1 && '🥇'}
                          {prize.place === 2 && '🥈'}
                          {prize.place === 3 && '🥉'}
                          {prize.place > 3 && `${prize.place}th`}
                          {' '}Place
                        </span>
                        <div className="text-right">
                          <div className="text-green-400 font-bold">
                            ${prize.amount.toLocaleString()}
                          </div>
                          {prize.bonus && (
                            <div className="text-xs text-purple-400">{prize.bonus}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Join Button */}
                <button
                  onClick={() => {
                    const { canJoin } = canJoinTournament(selectedTournament);
                    if (canJoin) {
                      joinTournament(selectedTournament);
                    }
                  }}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xl rounded-xl transition-all"
                >
                  Join Tournament - ${selectedTournament.entryFee}
                </button>
              </motion.div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
