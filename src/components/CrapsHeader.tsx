import { TrendingUp, History, DollarSign, Settings, Music, Video, Home, Gift, HelpCircle, Trophy, Users } from './Icons';
import { ProfileLogin } from './ProfileLogin';
import { useState } from 'react';
import { CasinoStore } from './CasinoStore';
import { GameSettings, GameSettingsType } from './GameSettings';
import { StreamingPanel } from './StreamingPanel';
import { LevelDisplay } from './LevelDisplay';
import { DailyRewardsButton } from './DailyRewardsButton';
import { VIPPassModal } from './VIPPassModal';
import { MembershipModal } from './MembershipModal';
import { AdminPanel } from './AdminPanel';
import { useProgression } from '../contexts/ProgressionContext';
import { useVIP } from '../contexts/VIPContext';
import { useMembership } from '../contexts/MembershipContext';

interface CrapsHeaderProps {
  balance: number;
  lastBet: number;
  lastWin: number;
  onShowStats: () => void;
  onShowRollHistory?: () => void;
  profile: { name: string; email: string; avatar?: string } | null;
  onLogin: (profile: { name: string; email: string; avatar?: string }) => void;
  onLogout: () => void;
  totalBet: number;
  onBalanceUpdate?: (newBalance: number) => void;
  onAdminBalanceUpdate?: (newBalance: number) => Promise<void>;
  onSettingsChange?: (settings: GameSettingsType) => void;
  currentSettings?: GameSettingsType;
  onShowProfile?: () => void;
  onBackToModeSelect?: () => void;
  onShowDailyRewards?: () => void;
  onOpenPlaylistSettings?: () => void;
  onShowRewards?: () => void;
  onShowAchievements?: () => void;
  onShowLeaderboard?: () => void; // Add leaderboard prop
  onShowFriends?: () => void; // Add friends prop
  onShowLevelUp?: () => void; // NEW: Open level-up modal when player is ready
  hasLevelUpNotification?: boolean; // NEW: Show notification badge
  onShowPayoutVerifier?: () => void; // NEW: Open payout verifier for transparency
  onShowFairnessInfo?: () => void; // NEW: Show fairness & transparency documentation
}

export function CrapsHeader({ balance, lastBet, lastWin, onShowStats, onShowRollHistory, profile, onLogin, onLogout, totalBet, onBalanceUpdate, onAdminBalanceUpdate, onSettingsChange, currentSettings, onShowProfile, onBackToModeSelect, onShowDailyRewards, onOpenPlaylistSettings, onShowRewards, onShowAchievements, onShowLeaderboard, onShowFriends, onShowLevelUp, hasLevelUpNotification, onShowPayoutVerifier, onShowFairnessInfo }: CrapsHeaderProps) {
  const [showChipStore, setShowChipStore] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'sound' | 'display' | 'gameplay' | 'chat' | 'privacy' | 'accessibility'>('display');
  const [showStreaming, setShowStreaming] = useState(false);
  const [volume, setVolume] = useState(0.7); // 70% default volume
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [showVIPModal, setShowVIPModal] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const { unclaimedRewards } = useProgression();
  const { vipStatus, activateVIP } = useVIP();
  const { membershipStatus, purchaseMembership, upgradeMembership, downgradeMembership } = useMembership();

  // Check if user is admin (Ruski)
  const isAdmin = profile?.email === 'avgelatt@gmail.com';
  
  // Debug logging to help troubleshoot
  console.log('🔧 Admin Check:', { 
    profileEmail: profile?.email, 
    isAdmin,
    profileExists: !!profile 
  });

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
  };

  const openSettingsWithTab = (tab: 'sound' | 'display' | 'gameplay' | 'chat' | 'privacy' | 'accessibility') => {
    setSettingsTab(tab);
    setShowSettings(true);
  };

  return (
    <div 
      className="flex justify-between items-start mb-2 px-8 py-6"
      style={{
        background: 'linear-gradient(180deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.95) 100%)',
        borderBottom: '4px solid',
        borderImage: 'linear-gradient(90deg, #b45309, #d97706, #f59e0b, #fbbf24, #f59e0b, #d97706, #b45309) 1',
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.6), 0 0 50px rgba(251, 191, 36, 0.25), inset 0 -2px 10px rgba(251, 191, 36, 0.15)',
        minHeight: '110px',
      }}
    >
      {/* LEFT SIDE - Empty (Music controls moved to bottom left) */}
      <div className="flex gap-3 items-center">
        {/* Music controls now in bottom left corner */}
      </div>

      {/* CENTER - Logo */}
      <div className="text-center">
        <div 
          className="text-gray-300 text-xs mb-1 uppercase tracking-wider"
          style={{ textShadow: '0 2px 6px rgba(0, 0, 0, 1)' }}
        >
          Minimum bet: $3
        </div>
        
        {/* ROLLERS PARADISE with flashy casino border */}
        <div 
          className="px-8 py-4 rounded-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(217, 70, 239, 0.2) 50%, rgba(251, 191, 36, 0.2) 100%)',
            border: '4px solid',
            borderImage: 'linear-gradient(45deg, #8b5cf6, #d946ef, #fbbf24, #d946ef, #8b5cf6) 1',
            boxShadow: `
              0 0 25px rgba(139, 92, 246, 0.6),
              0 0 45px rgba(217, 70, 239, 0.4),
              0 0 65px rgba(251, 191, 36, 0.3),
              inset 0 0 25px rgba(251, 191, 36, 0.15)
            `,
            animation: 'borderPulse 3s ease-in-out infinite',
            position: 'relative',
          }}
        >
          {/* Corner decorations */}
          <div style={{
            position: 'absolute',
            top: '-6px',
            left: '-6px',
            width: '20px',
            height: '20px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(139, 92, 246, 0.8)',
          }} />
          <div style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            width: '20px',
            height: '20px',
            background: 'linear-gradient(135deg, #fbbf24 0%, #fb923c 100%)',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            left: '-6px',
            width: '20px',
            height: '20px',
            background: 'linear-gradient(135deg, #fbbf24 0%, #fb923c 100%)',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)',
          }} />
          <div style={{
            position: 'absolute',
            bottom: '-6px',
            right: '-6px',
            width: '20px',
            height: '20px',
            background: 'linear-gradient(135deg, #d946ef 0%, #8b5cf6 100%)',
            borderRadius: '50%',
            boxShadow: '0 0 10px rgba(217, 70, 239, 0.8)',
          }} />
          
          <div className="text-4xl uppercase tracking-wider">
            <span 
              className="italic font-bold"
              style={{ 
                fontFamily: 'cursive',
                color: '#fbbf24',
                textShadow: '0 0 25px rgba(251, 191, 36, 1), 0 0 35px rgba(251, 146, 60, 0.6), 0 2px 10px rgba(0, 0, 0, 1)',
                fontSize: '2.5rem',
              }}
            >
              Rollers
            </span>
            {' '}
            <span 
              className="italic font-bold"
              style={{ 
                fontFamily: 'cursive',
                color: '#fb923c',
                textShadow: '0 0 25px rgba(251, 146, 60, 1), 0 0 35px rgba(251, 191, 36, 0.6), 0 2px 10px rgba(0, 0, 0, 1)',
                fontSize: '2.5rem',
              }}
            >
              Paradise
            </span>
          </div>
        </div>
        
        <div 
          className="text-yellow-300 text-xs tracking-widest mt-1 uppercase"
          style={{ textShadow: '0 2px 6px rgba(0, 0, 0, 1)' }}
        >
          🌴 Casino Experience 🌴
        </div>
      </div>

      <div className="flex flex-col gap-3 items-end">
        {/* TOP ROW - Balance, Casino Store, Daily Rewards, Level Display, Profile, Settings, Streaming, Home */}
        <div className="flex gap-4 items-center">
          {/* Current Bet and Last Win removed - now shown in bottom betting panel */}
          
          <div 
            className="px-6 py-3 rounded-xl border-2 shadow-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.3) 100%)',
              borderColor: '#22c55e',
              boxShadow: '0 0 40px rgba(34, 197, 94, 0.5), 0 4px 15px rgba(0, 0, 0, 0.6)',
              border: '3px solid #22c55e',
            }}
          >
            <div 
              className="uppercase tracking-widest mb-1 text-center"
              style={{ 
                color: '#86efac', 
                textShadow: '0 2px 6px rgba(0, 0, 0, 0.9)',
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: '12px',
                letterSpacing: '3px',
              }}
            >
              💰 BALANCE 💰
            </div>
            <div 
              className="text-center font-black"
              style={{ 
                color: '#4ade80',
                textShadow: '0 0 25px rgba(74, 222, 128, 0.8), 0 2px 8px rgba(0, 0, 0, 1)',
                fontFamily: 'Impact, Arial Black, sans-serif',
                fontSize: '28px',
                letterSpacing: '2px',
              }}
            >
              ${balance.toFixed(2)}
            </div>
          </div>
          
          {profile && onBalanceUpdate && (
            <button 
              onClick={() => setShowChipStore(true)}
              className="relative group px-4 py-3 rounded-lg border-2 shadow-xl transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #14532d 100%)',
                borderColor: '#fbbf24',
                boxShadow: '0 0 25px rgba(251, 191, 36, 0.5), 0 6px 20px rgba(0, 0, 0, 0.5)',
              }}
              title="Casino Store"
            >
              {/* Animated shine effect */}
              <div 
                className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(135deg, transparent 0%, rgba(251, 191, 36, 0.3) 50%, transparent 100%)',
                  animation: 'shine 2s infinite',
                }}
              />
              
              <div className="relative flex items-center gap-2">
                <DollarSign className="w-5 h-5" style={{ color: '#fbbf24' }} />
                <div className="text-left">
                  <div 
                    className="text-sm font-bold uppercase tracking-wide"
                    style={{ 
                      color: '#fbbf24',
                      textShadow: '0 0 10px rgba(251, 191, 36, 0.8), 0 2px 4px rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    Casino Store
                  </div>
                  <div className="text-xs" style={{ color: '#86efac' }}>
                    Chips, VIP & More!
                  </div>
                </div>
              </div>
            </button>
          )}
          
          {/* Daily Rewards Button */}
          {onShowDailyRewards && (
            <DailyRewardsButton onClick={onShowDailyRewards} />
          )}
          
          {/* Level & XP Display */}
          <LevelDisplay />
          
          <ProfileLogin 
            profile={profile}
            onLogin={onLogin}
            onLogout={onLogout}
            onShowSettings={() => setShowSettings(true)}
            onShowStats={onShowStats}
            onShowProfile={onShowProfile}
          />
          
          <button 
            onClick={() => openSettingsWithTab('gameplay')}
            className="w-12 h-12 rounded-lg border-2 shadow-xl flex items-center justify-center transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #4b5563 0%, #374151 100%)',
              borderColor: '#9ca3af',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            }}
          >
            <Settings className="w-6 h-6" style={{ color: '#d1d5db' }} />
          </button>
          
          {/* Streaming Button */}
          <button 
            onClick={() => setShowStreaming(true)}
            className="w-12 h-12 rounded-lg border-2 shadow-xl flex items-center justify-center transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
              borderColor: '#f87171',
              boxShadow: '0 0 20px rgba(220, 38, 38, 0.5), 0 4px 12px rgba(0, 0, 0, 0.5)',
            }}
            title="Streaming & Recording"
          >
            <Video className="w-6 h-6" style={{ color: '#fef2f2' }} />
          </button>
          
          {onBackToModeSelect && (
            <button 
              onClick={onBackToModeSelect}
              className="w-14 h-14 sm:w-12 sm:h-12 rounded-lg border-3 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #4b5563 0%, #374151 100%)',
                borderColor: '#9ca3af',
                boxShadow: '0 0 15px rgba(156, 163, 175, 0.5), 0 4px 12px rgba(0, 0, 0, 0.5)',
              }}
              title="Back to Home"
            >
              <Home className="w-7 h-7 sm:w-6 sm:h-6" style={{ color: '#d1d5db' }} />
            </button>
          )}
        </div>

        {/* BOTTOM ROW - Rewards, Level Up, Leaderboard, Friends, Payout Verifier, Fairness */}
        <div className="flex gap-4 items-center">
          {/* Rewards Button - Always visible, shows badge when there are unclaimed rewards */}
          {onShowRewards && (
            <button 
              onClick={onShowRewards}
              className="w-14 h-14 sm:w-12 sm:h-12 rounded-lg border-3 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 relative"
              style={{
                background: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)',
                borderColor: '#f0abfc',
                boxShadow: '0 0 25px rgba(236, 72, 153, 0.7), 0 4px 12px rgba(0, 0, 0, 0.5)',
              }}
              title={unclaimedRewards.length > 0 
                ? `${unclaimedRewards.length} Unclaimed Reward${unclaimedRewards.length > 1 ? 's' : ''}` 
                : 'View Rewards'}
            >
              <Gift className="w-7 h-7 sm:w-6 sm:h-6" style={{ color: '#fdf4ff' }} />
              {/* Notification badge - only show when there are unclaimed rewards */}
              {unclaimedRewards.length > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold w-6 h-6 sm:w-5 sm:h-5 rounded-full flex items-center justify-center animate-pulse">
                  {unclaimedRewards.length}
                </div>
              )}
            </button>
          )}
          
          {/* Level Up Notification Button - NON-BLOCKING! - Enhanced for mobile */}
          {onShowLevelUp && hasLevelUpNotification && (
            <button 
              onClick={onShowLevelUp}
              className="w-14 h-14 sm:w-12 sm:h-12 rounded-lg border-3 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 relative animate-pulse"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                borderColor: '#fef3c7',
                boxShadow: '0 0 35px rgba(251, 191, 36, 0.9), 0 4px 12px rgba(0, 0, 0, 0.5)',
              }}
              title="🎉 LEVEL UP! Click to view your rewards"
            >
              <span className="text-3xl sm:text-2xl">🎉</span>
              {/* Pulsing notification badge */}
              <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold px-2 sm:px-1.5 rounded-full flex items-center justify-center animate-bounce">
                NEW
              </div>
            </button>
          )}
          
          {/* Leaderboard Button - Enhanced for mobile visibility */}
          {onShowLeaderboard && (
            <button 
              onClick={onShowLeaderboard}
              className="w-14 h-14 sm:w-12 sm:h-12 rounded-lg border-3 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderColor: '#fbbf24',
                boxShadow: '0 0 25px rgba(251, 191, 36, 0.7), 0 4px 12px rgba(0, 0, 0, 0.5)',
              }}
              title="Leaderboard - Top Players"
            >
              <Trophy className="w-7 h-7 sm:w-6 sm:h-6" style={{ color: '#fef3c7' }} />
            </button>
          )}
          
          {/* Friends Button - Enhanced for mobile visibility */}
          {onShowFriends && profile && (
            <button 
              onClick={onShowFriends}
              className="w-14 h-14 sm:w-12 sm:h-12 rounded-lg border-3 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                borderColor: '#60a5fa',
                boxShadow: '0 0 25px rgba(96, 165, 250, 0.7), 0 4px 12px rgba(0, 0, 0, 0.5)',
              }}
              title="Friends - Chat & Connect"
            >
              <Users className="w-7 h-7 sm:w-6 sm:h-6" style={{ color: '#dbeafe' }} />
            </button>
          )}
          
          {/* Payout Verifier Button - Transparency & Fairness */}
          {onShowPayoutVerifier && (
            <button 
              onClick={onShowPayoutVerifier}
              className="w-12 h-12 rounded-lg border-2 shadow-xl flex items-center justify-center transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderColor: '#6ee7b7',
                boxShadow: '0 0 20px rgba(16, 185, 129, 0.5), 0 4px 12px rgba(0, 0, 0, 0.5)',
              }}
              title="🔍 Payout Verifier - Test & Verify All Payouts"
            >
              <span className="text-2xl">🔍</span>
            </button>
          )}
          
          {/* Fairness Info Button - Complete Transparency Documentation */}
          {onShowFairnessInfo && (
            <button 
              onClick={onShowFairnessInfo}
              className="w-12 h-12 rounded-lg border-2 shadow-xl flex items-center justify-center transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                borderColor: '#34d399',
                boxShadow: '0 0 20px rgba(5, 150, 105, 0.5), 0 4px 12px rgba(0, 0, 0, 0.5)',
              }}
              title="🛡️ Fairness & Transparency - How We Ensure Fair Play"
            >
              <span className="text-2xl">🛡️</span>
            </button>
          )}
          
          {/* Admin Panel Button - Only visible to Ruski */}
          {isAdmin && profile && onAdminBalanceUpdate && (
            <button 
              onClick={() => setShowAdminPanel(true)}
              className="w-12 h-12 rounded-lg border-2 shadow-xl flex items-center justify-center transition-all hover:scale-105 animate-pulse"
              style={{
                background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
                borderColor: '#fca5a5',
                boxShadow: '0 0 30px rgba(220, 38, 38, 0.8), 0 4px 12px rgba(0, 0, 0, 0.5)',
              }}
              title="🔧 Admin Tools - Balance & Testing Controls"
            >
              <span className="text-2xl">🔧</span>
            </button>
          )}
        </div>
      </div>

      {/* CasinoStore Modal */}
      {profile && onBalanceUpdate && (
        <CasinoStore
          isOpen={showChipStore}
          onClose={() => setShowChipStore(false)}
          userEmail={profile.email}
          currentBalance={balance}
          onBalanceUpdate={onBalanceUpdate}
          isVIP={membershipStatus.tier !== 'free'}
          onVIPPurchase={() => {
            setShowMembershipModal(true);
            setShowChipStore(false);
          }}
        />
      )}

      {/* GameSettings Modal */}
      {onSettingsChange && (
        <GameSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          currentSettings={currentSettings}
          onSave={onSettingsChange}
          defaultTab={settingsTab}
        />
      )}
      
      {/* Streaming Panel */}
      <StreamingPanel
        isOpen={showStreaming}
        onClose={() => setShowStreaming(false)}
        profile={profile}
      />
      
      {/* VIP Pass Modal */}
      {showVIPModal && (
        <VIPPassModal
          onClose={() => setShowVIPModal(false)}
          onPurchase={(plan, price) => {
            activateVIP(plan);
            setShowVIPModal(false);
          }}
          isVIP={vipStatus.isVIP}
        />
      )}
      
      {/* Membership Modal - Multi-tier system with upgrade/downgrade */}
      {showMembershipModal && profile && (
        <MembershipModal
          onClose={() => setShowMembershipModal(false)}
          onPurchase={(tier, duration, price) => {
            purchaseMembership(tier, duration, true);
            setShowMembershipModal(false);
          }}
          onUpgrade={(fromTier, toTier, duration, price) => {
            upgradeMembership(toTier, duration, true);
            setShowMembershipModal(false);
          }}
          onDowngrade={(fromTier, toTier) => {
            downgradeMembership(toTier);
            setShowMembershipModal(false);
          }}
          currentTier={membershipStatus.tier}
          currentDuration={membershipStatus.duration || 'monthly'}
          expiresAt={membershipStatus.expiresAt || undefined}
          userEmail={profile.email}
        />
      )}
      
      {/* Admin Panel */}
      {isAdmin && profile && onAdminBalanceUpdate && (
        <AdminPanel
          isOpen={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
          currentBalance={balance}
          onSetBalance={onAdminBalanceUpdate}
          userEmail={profile.email}
        />
      )}
    </div>
  );
}