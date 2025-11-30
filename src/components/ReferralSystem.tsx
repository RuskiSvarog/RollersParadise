import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Copy, Check, Gift, Users, DollarSign, X, Mail, MessageCircle, Facebook, Twitter } from 'lucide-react';
import { notify } from './NotificationCenter';

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarned: number;
  pendingRewards: number;
  referralCode: string;
}

interface Referral {
  id: string;
  name: string;
  joinedAt: number;
  status: 'pending' | 'active' | 'vip';
  earnedFromUser: number;
  level: number;
}

interface ReferralSystemProps {
  isOpen: boolean;
  onClose: () => void;
  playerEmail: string;
  playerName: string;
  onClaimReward: (amount: number) => void;
}

export function ReferralSystem({ isOpen, onClose, playerEmail, playerName, onClaimReward }: ReferralSystemProps) {
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    activeReferrals: 0,
    totalEarned: 0,
    pendingRewards: 0,
    referralCode: ''
  });
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadReferralData();
    }
  }, [isOpen, playerEmail]);

  const loadReferralData = () => {
    // Generate referral code from email
    const code = generateReferralCode(playerEmail);
    
    // Load or generate mock data
    const mockStats: ReferralStats = {
      totalReferrals: 12,
      activeReferrals: 8,
      totalEarned: 15000,
      pendingRewards: 2500,
      referralCode: code
    };

    const mockReferrals: Referral[] = [
      {
        id: '1',
        name: 'Sarah M.',
        joinedAt: Date.now() - 86400000 * 7,
        status: 'vip',
        earnedFromUser: 5000,
        level: 20
      },
      {
        id: '2',
        name: 'Mike R.',
        joinedAt: Date.now() - 86400000 * 14,
        status: 'active',
        earnedFromUser: 3500,
        level: 15
      },
      {
        id: '3',
        name: 'Emma L.',
        joinedAt: Date.now() - 86400000 * 3,
        status: 'active',
        earnedFromUser: 2000,
        level: 8
      },
      {
        id: '4',
        name: 'John D.',
        joinedAt: Date.now() - 86400000 * 1,
        status: 'pending',
        earnedFromUser: 0,
        level: 2
      }
    ];

    setStats(mockStats);
    setReferrals(mockReferrals);
  };

  const generateReferralCode = (email: string): string => {
    // Generate a unique code from email
    const hash = email.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    return Math.abs(hash).toString(36).toUpperCase().slice(0, 8);
  };

  const getReferralLink = (): string => {
    return `https://rollersparadise.com/join?ref=${stats.referralCode}`;
  };

  const copyReferralLink = () => {
    const link = getReferralLink();
    navigator.clipboard.writeText(link);
    setCopied(true);
    notify.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const shareViaEmail = () => {
    const subject = `Join me at Rollers Paradise Casino!`;
    const body = `Hey! I've been playing at Rollers Paradise and it's amazing! Use my referral link to get 1,000 FREE CHIPS when you sign up:\n\n${getReferralLink()}\n\nLet's play together!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    notify.info('Opening email client...');
  };

  const shareOnSocial = (platform: 'twitter' | 'facebook') => {
    const link = getReferralLink();
    const text = `Join me at Rollers Paradise Casino! 🎲 Use my referral link for bonus chips: `;
    
    if (platform === 'twitter') {
      window.open(
        `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`,
        '_blank'
      );
    } else {
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
        '_blank'
      );
    }
  };

  const claimPendingRewards = () => {
    if (stats.pendingRewards > 0) {
      onClaimReward(stats.pendingRewards);
      setStats({...stats, pendingRewards: 0, totalEarned: stats.totalEarned + stats.pendingRewards});
      notify.success(`Claimed $${stats.pendingRewards} referral rewards!`);
    }
  };

  const getTimeSince = (timestamp: number): string => {
    const days = Math.floor((Date.now() - timestamp) / 86400000);
    if (days === 0) return 'Today';
    if (days === 1) return '1 day ago';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    return `${Math.floor(days / 30)} months ago`;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gradient-to-br from-gray-900 via-green-900/30 to-gray-900 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border-4 border-green-500/50"
          style={{
            boxShadow: '0 0 60px rgba(34, 197, 94, 0.3)'
          }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 p-6 border-b-4 border-green-400">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Share2 className="w-8 h-8 text-white" />
                <div>
                  <h2 className="text-3xl font-black text-white">Refer & Earn</h2>
                  <p className="text-green-100 text-sm">
                    Invite friends and earn rewards together!
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-green-200 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-150px)]">
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-4 rounded-xl text-white">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-6 h-6" />
                  <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">Total</span>
                </div>
                <div className="text-3xl font-black mb-1">{stats.totalReferrals}</div>
                <div className="text-xs text-blue-200">Total Referrals</div>
              </div>

              <div className="bg-gradient-to-br from-green-600 to-green-700 p-4 rounded-xl text-white">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-6 h-6" />
                  <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">Active</span>
                </div>
                <div className="text-3xl font-black mb-1">{stats.activeReferrals}</div>
                <div className="text-xs text-green-200">Active Players</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-600 to-orange-600 p-4 rounded-xl text-white">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-6 h-6" />
                  <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">Earned</span>
                </div>
                <div className="text-3xl font-black mb-1">${stats.totalEarned.toLocaleString()}</div>
                <div className="text-xs text-yellow-200">Total Earned</div>
              </div>

              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-xl text-white">
                <div className="flex items-center justify-between mb-2">
                  <Gift className="w-6 h-6" />
                  <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded">Pending</span>
                </div>
                <div className="text-3xl font-black mb-1">${stats.pendingRewards.toLocaleString()}</div>
                <div className="text-xs text-purple-200">Ready to Claim</div>
              </div>
            </div>

            {/* Claim Rewards Button */}
            {stats.pendingRewards > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={claimPendingRewards}
                className="w-full mb-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-black text-xl rounded-xl shadow-2xl transition-all"
              >
                <Gift className="inline w-6 h-6 mr-2" />
                Claim ${stats.pendingRewards} Rewards!
              </motion.button>
            )}

            {/* Referral Link Section */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border-2 border-gray-700 mb-6">
              <h3 className="text-white font-bold text-lg mb-3 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-green-400" />
                Your Referral Link
              </h3>

              <div className="bg-gray-900 p-4 rounded-lg mb-4 border-2 border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="text"
                    value={getReferralLink()}
                    readOnly
                    className="flex-1 bg-transparent text-green-400 font-mono text-sm focus:outline-none"
                  />
                  <button
                    onClick={copyReferralLink}
                    className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
                <div className="text-xs text-gray-400">
                  Your code: <span className="text-green-400 font-bold">{stats.referralCode}</span>
                </div>
              </div>

              {/* Share Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={shareViaEmail}
                  className="py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Mail className="w-5 h-5" />
                  Email
                </button>
                <button
                  onClick={() => shareOnSocial('twitter')}
                  className="py-3 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Twitter className="w-5 h-5" />
                  Twitter
                </button>
                <button
                  onClick={() => shareOnSocial('facebook')}
                  className="py-3 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Facebook className="w-5 h-5" />
                  Facebook
                </button>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 p-6 rounded-xl border-2 border-green-500/50 mb-6">
              <h3 className="text-white font-bold text-lg mb-4">🎁 How It Works</h3>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <div className="text-white font-bold">Share Your Link</div>
                    <div className="text-gray-400 text-sm">Send your referral link to friends</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <div className="text-white font-bold">They Sign Up & Get 1,000 FREE CHIPS</div>
                    <div className="text-gray-400 text-sm">Your friend receives bonus virtual chips</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <div className="text-white font-bold">You Earn $500 + 10% Forever</div>
                    <div className="text-gray-400 text-sm">Get instant bonus + 10% of their purchases</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    💎
                  </div>
                  <div>
                    <div className="text-yellow-400 font-bold">VIP Bonus: If They Buy VIP</div>
                    <div className="text-gray-400 text-sm">Earn extra 1,000 FREE CHIPS when they upgrade!</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Referrals List */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-xl border-2 border-gray-700">
              <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-green-400" />
                Your Referrals ({referrals.length})
              </h3>

              {referrals.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-16 h-16 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No referrals yet</p>
                  <p className="text-gray-500 text-sm mt-2">Share your link to get started!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {referrals.map((referral, index) => (
                    <motion.div
                      key={referral.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-gray-900/50 p-4 rounded-lg border border-gray-700 hover:border-green-500/50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold">
                            {referral.name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-white font-bold">{referral.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                referral.status === 'vip' 
                                  ? 'bg-yellow-600 text-white'
                                  : referral.status === 'active'
                                  ? 'bg-green-600 text-white'
                                  : 'bg-gray-600 text-gray-300'
                              }`}>
                                {referral.status === 'vip' ? '👑 VIP' : referral.status.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-400">Lvl {referral.level}</span>
                            </div>
                            <div className="text-xs text-gray-400">
                              Joined {getTimeSince(referral.joinedAt)}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-green-400 font-bold">
                            +${referral.earnedFromUser.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-400">earned</div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
