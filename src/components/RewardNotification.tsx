import { useState, useEffect } from 'react';
import { X, Trophy, Crown, Gift, Sparkles, Medal, Star } from './Icons';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface RewardNotificationProps {
  playerEmail: string;
}

interface Notification {
  id: string;
  type: 'leaderboard_reward' | 'achievement' | 'bonus';
  title: string;
  message: string;
  reward: {
    chips?: number;
    xpBoost?: { multiplier: number; duration: number };
    badge?: string;
  };
  timestamp: number;
  read: boolean;
  leaderboardInfo?: {
    rank: number;
    category: string;
    timeframe: string;
    period: string;
  };
}

export function RewardNotification({ playerEmail }: RewardNotificationProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [claimingReward, setClaimingReward] = useState<string | null>(null);

  useEffect(() => {
    if (playerEmail) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [playerEmail]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/notifications?email=${encodeURIComponent(playerEmail)}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
        
        // Auto-show if there are unread notifications
        const unread = data.notifications?.filter((n: Notification) => !n.read);
        if (unread && unread.length > 0) {
          setShowNotifications(true);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const claimReward = async (notificationId: string) => {
    try {
      setClaimingReward(notificationId);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/notifications/claim`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: playerEmail,
            notificationId,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Reward claimed:', data);
        
        // Remove from notifications or mark as claimed
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        
        // Reload page to refresh balance/boosts
        window.location.reload();
      }
    } catch (error) {
      console.error('Failed to claim reward:', error);
    } finally {
      setClaimingReward(null);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/notifications/read`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: playerEmail,
            notificationId,
          }),
        }
      );

      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '🏆';
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-amber-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-purple-400 to-purple-600';
  };

  if (notifications.length === 0) return null;

  return (
    <>
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="fixed top-4 right-4 z-50 group"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
          <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 p-3 rounded-full shadow-2xl hover:scale-110 transition-transform">
            <Gift className="w-6 h-6 text-white" />
            {unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold animate-pulse border-2 border-white">
                {unreadCount}
              </div>
            )}
          </div>
        </div>
      </button>

      {/* Notifications Panel */}
      {showNotifications && (
        <div className="fixed inset-0 bg-black/80 flex items-start justify-end z-40 p-4 overflow-y-auto">
          <div className="relative max-w-md w-full animate-in slide-in-from-right-8 fade-in duration-300">
            {/* Close Button */}
            <button
              onClick={() => setShowNotifications(false)}
              className="absolute -left-12 top-0 bg-red-600 hover:bg-red-700 p-2 rounded-full shadow-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Notifications Container */}
            <div className="bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 rounded-3xl border-4 border-purple-600 shadow-2xl p-6 space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-white" style={{ fontSize: '1.5rem', fontWeight: 900 }}>
                    Rewards & Notifications
                  </h2>
                  <p className="text-purple-300 text-sm">
                    {unreadCount} unclaimed reward{unreadCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Notification List */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`relative group ${
                      notification.read ? 'opacity-60' : ''
                    }`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${getRankColor(notification.leaderboardInfo?.rank || 4)} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`} />
                    <div className="relative bg-gradient-to-br from-black via-gray-900 to-black border-2 border-purple-600 rounded-2xl p-5 shadow-xl">
                      {/* Header */}
                      <div className="flex items-start gap-3 mb-3">
                        {notification.leaderboardInfo && (
                          <div className="text-4xl">
                            {getRankIcon(notification.leaderboardInfo.rank)}
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="text-yellow-300" style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                            {notification.title}
                          </h3>
                          <p className="text-gray-300 text-sm mt-1">
                            {notification.message}
                          </p>
                        </div>
                      </div>

                      {/* Leaderboard Info */}
                      {notification.leaderboardInfo && (
                        <div className="bg-black/50 rounded-lg p-3 mb-3">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-400">Period:</span>
                              <span className="text-white ml-2 font-bold">
                                {notification.leaderboardInfo.period}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-400">Category:</span>
                              <span className="text-white ml-2 font-bold capitalize">
                                {notification.leaderboardInfo.category.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Rewards */}
                      <div className="space-y-2 mb-4">
                        {notification.reward.chips && (
                          <div className="flex items-center gap-2 text-green-400">
                            <Sparkles className="w-4 h-4" />
                            <span className="font-bold">
                              +${notification.reward.chips.toLocaleString()} chips
                            </span>
                          </div>
                        )}
                        {notification.reward.xpBoost && (
                          <div className="flex items-center gap-2 text-purple-400">
                            <Star className="w-4 h-4" />
                            <span className="font-bold">
                              {notification.reward.xpBoost.multiplier}x XP Boost ({notification.reward.xpBoost.duration}h)
                            </span>
                          </div>
                        )}
                        {notification.reward.badge && (
                          <div className="flex items-center gap-2 text-yellow-400">
                            <Medal className="w-4 h-4" />
                            <span className="font-bold">
                              {notification.reward.badge} Badge
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        {!notification.read && (
                          <button
                            onClick={() => claimReward(notification.id)}
                            disabled={claimingReward === notification.id}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white px-4 py-2 rounded-lg font-bold shadow-lg hover:shadow-green-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {claimingReward === notification.id ? (
                              <span className="flex items-center gap-2 justify-center">
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Claiming...
                              </span>
                            ) : (
                              <span className="flex items-center gap-2 justify-center">
                                <Gift className="w-4 h-4" />
                                Claim Reward
                              </span>
                            )}
                          </button>
                        )}
                        {notification.read && (
                          <div className="flex-1 bg-gray-700 text-gray-300 px-4 py-2 rounded-lg font-bold text-center">
                            ✓ Claimed
                          </div>
                        )}
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                          >
                            Dismiss
                          </button>
                        )}
                      </div>

                      {/* Timestamp */}
                      <p className="text-gray-500 text-xs mt-3 text-center">
                        {new Date(notification.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
