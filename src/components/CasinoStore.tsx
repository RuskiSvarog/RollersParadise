import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, DollarSign, Clock, CreditCard, Sparkles, Crown, Zap, Star, Palette, Gift, TrendingUp, Shield, ShoppingBag } from './Icons';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface CasinoStoreProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  currentBalance: number;
  onBalanceUpdate: (newBalance: number) => void;
  isVIP: boolean;
  onVIPPurchase?: () => void;
}

interface ChipPackage {
  id: string;
  price: number;
  chips: number;
  bonus: number;
  label?: string;
  icon?: any;
  popular?: boolean;
}

interface PremiumItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: any;
  category: 'theme' | 'dice' | 'bundle';
  vipOnly?: boolean;
}

const chipPackages: ChipPackage[] = [
  {
    id: 'starter',
    price: 2.49,
    chips: 3000,
    bonus: 1.2,
    label: 'STARTER',
    icon: DollarSign,
  },
  {
    id: 'regular',
    price: 4.99,
    chips: 7000,
    bonus: 1.5,
    label: 'POPULAR',
    icon: Sparkles,
    popular: true,
  },
  {
    id: 'best',
    price: 9.99,
    chips: 15000,
    bonus: 2.0,
    label: 'BEST VALUE',
    icon: Sparkles,
  },
  {
    id: 'premium',
    price: 24.99,
    chips: 45000,
    bonus: 2.5,
    label: 'PREMIUM',
    icon: Crown,
  },
  {
    id: 'mega',
    price: 49.99,
    chips: 100000,
    bonus: 3.0,
    label: 'MEGA',
    icon: Zap,
  },
  {
    id: 'ultimate',
    price: 99.99,
    chips: 250000,
    bonus: 4.0,
    label: 'ULTIMATE',
    icon: Crown,
  },
];

const premiumItems: PremiumItem[] = [
  {
    id: 'gold-dice',
    name: 'Gold Dice',
    description: 'Luxurious 24K gold-plated dice',
    price: 1.99,
    icon: Sparkles,
    category: 'dice',
  },
  {
    id: 'diamond-dice',
    name: 'Diamond Dice',
    description: 'Sparkling diamond-encrusted dice',
    price: 2.99,
    icon: Sparkles,
    category: 'dice',
    vipOnly: true,
  },
  {
    id: 'neon-dice',
    name: 'Neon Dice',
    description: 'Glowing neon dice with RGB effects',
    price: 1.99,
    icon: Zap,
    category: 'dice',
  },
  {
    id: 'vegas-theme',
    name: 'Las Vegas Theme',
    description: 'Classic Vegas strip casino look',
    price: 3.99,
    icon: Palette,
    category: 'theme',
  },
  {
    id: 'monaco-theme',
    name: 'Monaco Theme',
    description: 'Elegant European casino style',
    price: 3.99,
    icon: Palette,
    category: 'theme',
    vipOnly: true,
  },
  {
    id: 'starter-bundle',
    name: 'Starter Bundle',
    description: '$10k chips + Gold Dice + Vegas Theme',
    price: 9.99,
    icon: Gift,
    category: 'bundle',
  },
  {
    id: 'high-roller-bundle',
    name: 'High Roller Bundle',
    description: '$50k chips + Diamond Dice + Monaco Theme',
    price: 29.99,
    icon: Crown,
    category: 'bundle',
    vipOnly: true,
  },
];

export function CasinoStore({ isOpen, onClose, userEmail, currentBalance, onBalanceUpdate, isVIP, onVIPPurchase }: CasinoStoreProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [canClaimFree, setCanClaimFree] = useState(false);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState('');
  const [activeTab, setActiveTab] = useState<'chips' | 'vip' | 'premium'>('chips');

  // Clear loading state on mount (in case user returned from payment)
  useEffect(() => {
    // Clear any stuck loading state
    setIsLoading(false);
    
    // Clean up session flags if present
    const purchaseInProgress = sessionStorage.getItem('purchaseInProgress');
    if (purchaseInProgress) {
      const details = sessionStorage.getItem('purchaseDetails');
      if (details) {
        try {
          const parsed = JSON.parse(details);
          // If more than 5 minutes old, clear it
          if (Date.now() - parsed.timestamp > 5 * 60 * 1000) {
            sessionStorage.removeItem('purchaseInProgress');
            sessionStorage.removeItem('purchaseDetails');
          }
        } catch (e) {
          sessionStorage.removeItem('purchaseInProgress');
          sessionStorage.removeItem('purchaseDetails');
        }
      }
    }
  }, []);

  // Check if user can claim free chips
  useEffect(() => {
    if (isOpen && userEmail) {
      checkFreeClaim();
    }
  }, [isOpen, userEmail]);

  // Update countdown timer
  useEffect(() => {
    if (!canClaimFree && isOpen && userEmail) {
      const interval = setInterval(() => {
        checkFreeClaim();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [canClaimFree, isOpen, userEmail]);

  const checkFreeClaim = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/chips/can-claim/${encodeURIComponent(userEmail)}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` },
          signal: controller.signal,
        }
      );
      
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        setCanClaimFree(data.canClaim);

        if (!data.canClaim && data.nextClaimTime) {
          const now = Date.now();
          const next = data.nextClaimTime;
          const diff = next - now;

          if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            setTimeUntilNextClaim(`${hours}h ${minutes}m ${seconds}s`);
          }
        }
      }
    } catch (error) {
      // Silently fail
    }
  };

  const handleClaimFree = async () => {
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/chips/claim-free`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email: userEmail }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage('🎉 Claimed 1,000 FREE CHIPS!');
        onBalanceUpdate(data.balance);
        setCanClaimFree(false);
      } else {
        setError(data.error || 'Failed to claim free chips');
      }
    } catch (error) {
      console.error('Error claiming free chips:', error);
      setError('Failed to claim free chips. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyPackage = async (pkg: ChipPackage) => {
    setIsLoading(true);
    setError('');
    setMessage('');

    // Safety timeout: If still loading after 10 seconds, reset
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Chip purchase timeout - resetting loading state');
      setIsLoading(false);
    }, 10000);

    const useTestMode = false;

    if (useTestMode) {
      setError('❌ Test mode is disabled. Please use real payment method.');
      setIsLoading(false);
      return;
    } else {
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/chips/buy`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ 
              email: userEmail, 
              amount: pkg.chips,
              price: pkg.price
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          clearTimeout(timeoutId);
          setError(data.error || 'Failed to buy chips');
          setIsLoading(false);
          return;
        }

        if (data.checkoutUrl) {
          clearTimeout(timeoutId); // Clear timeout before redirect
          setMessage('Redirecting to payment...');
          window.location.href = data.checkoutUrl;
        } else {
          clearTimeout(timeoutId);
          setMessage(data.message || 'Purchase successful!');
          if (data.balance) {
            onBalanceUpdate(data.balance);
          }
          setIsLoading(false);
        }
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('Error buying chips:', error);
        setError('Failed to buy chips. Please try again.');
        setIsLoading(false);
      }
    }
  };

  const handleVIPPurchase = () => {
    if (onVIPPurchase) {
      onVIPPurchase();
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.95) 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div 
        className="rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto border-4"
        style={{
          background: 'linear-gradient(135deg, #14532d 0%, #15803d 20%, #16a34a 40%, #15803d 60%, #14532d 100%)',
          borderColor: '#fbbf24',
          boxShadow: '0 0 60px rgba(251, 191, 36, 0.6), 0 20px 80px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* HEADER */}
        <div 
          className="sticky top-0 p-6 flex justify-between items-center border-b-4 z-10"
          style={{
            background: 'linear-gradient(135deg, #b45309 0%, #d97706 25%, #f59e0b 50%, #d97706 75%, #b45309 100%)',
            borderColor: '#fbbf24',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.2)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <ShoppingBag className="w-12 h-12" style={{ color: '#fbbf24' }} />
              <Sparkles 
                className="w-6 h-6 absolute -top-1 -right-1 animate-pulse" 
                style={{ color: '#fde047' }} 
              />
            </div>
            <div>
              <h2 
                className="text-4xl font-bold uppercase tracking-wider"
                style={{ 
                  color: '#fef3c7',
                  textShadow: '0 0 20px rgba(251, 191, 36, 0.8), 0 4px 8px rgba(0, 0, 0, 0.8)',
                }}
              >
                🎰 Casino Store 🎰
              </h2>
              <p 
                className="text-lg font-bold mt-1"
                style={{ 
                  color: '#86efac',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                }}
              >
                Balance: ${currentBalance.toLocaleString()} {isVIP && '| 👑 VIP Member'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="transition-all hover:scale-110 hover:rotate-90"
            style={{ color: '#fef3c7' }}
          >
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* TABS */}
        <div className="bg-black/30 border-b-2 border-yellow-400/50 flex">
          <button
            onClick={() => setActiveTab('chips')}
            className={`flex-1 py-4 px-6 font-bold text-lg transition-all ${
              activeTab === 'chips' 
                ? 'bg-green-600 text-white border-b-4 border-yellow-400' 
                : 'text-gray-300 hover:bg-green-700/30'
            }`}
          >
            <DollarSign className="w-6 h-6 inline mr-2" />
            Chip Packages
          </button>
          <button
            onClick={() => setActiveTab('vip')}
            className={`flex-1 py-4 px-6 font-bold text-lg transition-all ${
              activeTab === 'vip' 
                ? 'bg-purple-600 text-white border-b-4 border-yellow-400' 
                : 'text-gray-300 hover:bg-purple-700/30'
            }`}
          >
            <Crown className="w-6 h-6 inline mr-2" />
            VIP Membership
          </button>
          <button
            onClick={() => setActiveTab('premium')}
            className={`flex-1 py-4 px-6 font-bold text-lg transition-all ${
              activeTab === 'premium' 
                ? 'bg-blue-600 text-white border-b-4 border-yellow-400' 
                : 'text-gray-300 hover:bg-blue-700/30'
            }`}
          >
            <Sparkles className="w-6 h-6 inline mr-2" />
            Premium Items
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          {/* FREE CHIPS SECTION - Always visible */}
          <div 
            className="mb-8 rounded-2xl p-6 border-4 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%)',
              borderColor: '#60a5fa',
              boxShadow: '0 0 40px rgba(59, 130, 246, 0.6), 0 10px 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            <div 
              className="absolute inset-0 opacity-20"
              style={{
                background: 'radial-gradient(circle at 20% 50%, rgba(251, 191, 36, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(251, 191, 36, 0.4) 0%, transparent 50%)',
              }}
            />
            
            <div className="relative z-10 flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Clock className="w-12 h-12 animate-pulse" style={{ color: '#fde047' }} />
                <div>
                  <h3 
                    className="text-3xl font-bold uppercase tracking-wide"
                    style={{ 
                      color: '#fef3c7',
                      textShadow: '0 0 15px rgba(251, 191, 36, 0.8), 0 2px 6px rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    🎁 Daily Free Chips! 🎁
                  </h3>
                  <p 
                    className="text-lg font-bold mt-1"
                    style={{ 
                      color: '#a5f3fc',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    Claim 1,000 FREE CHIPS every 24 hours!
                  </p>
                </div>
              </div>
              {!canClaimFree && (
                <div className="text-right">
                  <p 
                    className="text-sm uppercase tracking-wide"
                    style={{ color: '#bae6fd' }}
                  >
                    Next claim in:
                  </p>
                  <p 
                    className="text-2xl font-mono font-bold"
                    style={{ 
                      color: '#fde047',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    {timeUntilNextClaim}
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={handleClaimFree}
              disabled={!canClaimFree || isLoading}
              className={`relative w-full py-4 rounded-xl font-bold text-xl uppercase tracking-wider transition-all duration-300 border-2 ${
                canClaimFree && !isLoading
                  ? 'hover:scale-105 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              style={{
                background: canClaimFree 
                  ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)' 
                  : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                borderColor: canClaimFree ? '#fbbf24' : '#9ca3af',
                color: '#fff',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                boxShadow: canClaimFree 
                  ? '0 0 30px rgba(34, 197, 94, 0.6), 0 6px 20px rgba(0, 0, 0, 0.5)' 
                  : '0 4px 12px rgba(0, 0, 0, 0.3)',
              }}
            >
              {isLoading ? 'CLAIMING...' : canClaimFree ? '🎉 CLAIM FREE $1,000 NOW! 🎉' : '⏰ Come Back Soon!'}
            </button>
          </div>

          {/* TAB CONTENT */}
          {activeTab === 'chips' && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-6 h-6 text-yellow-400" />
                <h3 className="text-white text-2xl font-bold">Buy Chip Packages</h3>
              </div>
              <p className="text-green-200 text-sm mb-6">
                Get bonus chips with every purchase! Higher packages = Better value!
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chipPackages.map((pkg) => {
                  const Icon = pkg.icon;
                  const bonusPercent = ((pkg.bonus - 1) * 100).toFixed(0);

                  return (
                    <div
                      key={pkg.id}
                      className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-5 border-2 transition-all hover:scale-105 ${
                        pkg.popular
                          ? 'border-yellow-400 shadow-lg shadow-yellow-500/50'
                          : 'border-gray-600 hover:border-yellow-500'
                      }`}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                          ⭐ BEST VALUE
                        </div>
                      )}

                      {pkg.label && !pkg.popular && (
                        <div className="flex items-center gap-1 mb-2">
                          {Icon && <Icon className="w-4 h-4 text-yellow-400" />}
                          <span className="text-yellow-400 text-xs font-bold">{pkg.label}</span>
                        </div>
                      )}

                      <div className="text-center mb-3">
                        <div className="text-white text-4xl font-bold mb-1">
                          ${pkg.price}
                        </div>
                        <div className="text-gray-400 text-sm">USD</div>
                      </div>

                      <div className="border-t border-gray-700 my-3"></div>

                      <div className="text-center mb-3">
                        <div className="text-green-400 text-3xl font-bold mb-1">
                          ${pkg.chips.toLocaleString()}
                        </div>
                        <div className="text-gray-400 text-sm">in chips</div>
                      </div>

                      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-md p-2 text-center mb-4">
                        <div className="text-white font-bold">
                          +{bonusPercent}% BONUS
                        </div>
                        <div className="text-green-200 text-xs">
                          ${(pkg.chips - pkg.price).toLocaleString()} extra chips!
                        </div>
                      </div>

                      <button
                        onClick={() => handleBuyPackage(pkg)}
                        disabled={isLoading}
                        className={`w-full py-3 rounded-lg font-bold transition-all ${
                          pkg.popular
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-gray-900 hover:from-yellow-400 hover:to-yellow-500 shadow-lg'
                            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {isLoading ? 'Processing...' : 'Buy Now'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'vip' && (
            <div>
              <div className="text-center mb-8">
                <div className="inline-block animate-bounce">
                  <Crown className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
                </div>
                <h3 className="text-4xl font-bold text-white mb-2">
                  Rollers Club VIP Pass
                </h3>
                <p className="text-yellow-200 text-xl">
                  Premium Membership • Exclusive Rewards • Ultimate Experience
                </p>
              </div>

              {/* EXCLUSIVE BOOST CARDS CALLOUT - VIP ONLY */}
              <div className="mb-8 bg-gradient-to-br from-purple-900/80 to-blue-900/80 border-4 border-yellow-400 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-400/10 rounded-full blur-3xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold uppercase">
                      VIP Exclusive
                    </div>
                    <Sparkles className="w-6 h-6 text-yellow-400" />
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white mb-3">
                    🎴 XP Boost Cards - Activate Anytime!
                  </h3>
                  <p className="text-gray-200 mb-4">
                    VIP members receive powerful XP boost cards that can be <strong className="text-yellow-400">activated whenever you want</strong>! 
                    Unlike passive bonuses, YOU control when to activate your boosts for maximum XP gains.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="text-yellow-400 font-bold mb-1">Monthly Members Get:</div>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>⚡ 3x 24-Hour XP Boost Cards (1.5x XP)</li>
                        <li>🔥 5x 1-Hour XP Surge Cards (2x XP)</li>
                      </ul>
                    </div>
                    <div className="bg-black/30 rounded-lg p-3">
                      <div className="text-yellow-400 font-bold mb-1">Yearly Members Get:</div>
                      <ul className="text-sm text-gray-300 space-y-1">
                        <li>⚡ 10x 24-Hour Boost Cards</li>
                        <li>🔥 15x 1-Hour Surge Cards</li>
                        <li>💎 5x Mega Boost Cards (3x XP!)</li>
                        <li>🎯 2x Weekend Warrior Cards (48hrs)</li>
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-lg p-3 text-yellow-200 text-sm">
                    <strong>⚠️ Non-Members:</strong> Boost cards are VIP-only! Regular players don't have access to these powerful multipliers.
                  </div>
                </div>
              </div>

              {/* VIP Benefits Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: Gift, title: 'Daily VIP Bonus', desc: '$500 chips daily', color: 'from-yellow-500 to-orange-500' },
                  { icon: Star, title: '25% Passive XP', desc: 'Always on bonus', color: 'from-purple-500 to-pink-500' },
                  { icon: Palette, title: 'Exclusive Themes', desc: '5 premium designs', color: 'from-blue-500 to-cyan-500' },
                  { icon: Sparkles, title: 'Custom Dice', desc: '10 unique styles', color: 'from-green-500 to-emerald-500' },
                  { icon: TrendingUp, title: 'Higher Limits', desc: 'Bet up to $1,000', color: 'from-red-500 to-orange-500' },
                  { icon: Crown, title: 'VIP Badge', desc: 'Show your status', color: 'from-yellow-400 to-yellow-600' },
                  { icon: Zap, title: 'Early Access', desc: 'New features first', color: 'from-indigo-500 to-purple-500' },
                  { icon: Shield, title: 'Priority Support', desc: '24/7 VIP support', color: 'from-cyan-500 to-blue-500' },
                ].map((benefit, idx) => {
                  const Icon = benefit.icon;
                  return (
                    <div
                      key={idx}
                      className={`bg-gradient-to-br ${benefit.color} p-4 rounded-xl text-white text-center transition-transform hover:scale-105`}
                    >
                      <Icon className="w-8 h-8 mx-auto mb-2" />
                      <div className="font-bold mb-1">{benefit.title}</div>
                      <div className="text-sm opacity-90">{benefit.desc}</div>
                    </div>
                  );
                })}
              </div>

              {/* VIP Pricing */}
              <div className="max-w-md mx-auto">
                <div className="bg-gradient-to-br from-purple-900 to-gray-900 rounded-2xl p-8 border-4 border-yellow-500">
                  <div className="text-center mb-6">
                    <div className="text-yellow-400 text-6xl font-bold mb-2">
                      $4.99
                    </div>
                    <div className="text-gray-300 text-xl">per month</div>
                    <div className="text-green-400 text-sm mt-2">
                      Cancel anytime • No commitment
                    </div>
                  </div>

                  {isVIP ? (
                    <div className="text-center">
                      <div className="bg-green-500 text-white py-4 rounded-xl font-bold text-xl mb-4">
                        ✅ Active VIP Member
                      </div>
                      <p className="text-gray-300 text-sm">
                        Thank you for being a VIP member! Enjoy all premium benefits.
                      </p>
                    </div>
                  ) : (
                    <button
                      onClick={handleVIPPurchase}
                      className="w-full py-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white font-bold text-xl rounded-xl transition-all hover:scale-105"
                      style={{
                        boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)',
                      }}
                    >
                      🚀 Upgrade to VIP Now!
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'premium' && (
            <div>
              <h3 className="text-white text-2xl font-bold mb-6">Premium Customizations</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {premiumItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      className={`bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-5 border-2 transition-transform hover:scale-105 ${
                        item.vipOnly ? 'border-yellow-500' : 'border-gray-600'
                      }`}
                    >
                      {item.vipOnly && (
                        <div className="flex items-center gap-1 mb-2">
                          <Crown className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 text-xs font-bold">VIP EXCLUSIVE</span>
                        </div>
                      )}

                      <Icon className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                      
                      <div className="text-center">
                        <h4 className="text-white text-xl font-bold mb-2">{item.name}</h4>
                        <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                        
                        <div className="text-green-400 text-2xl font-bold mb-4">
                          ${item.price}
                        </div>

                        <button
                          disabled={item.vipOnly && !isVIP}
                          className={`w-full py-3 rounded-lg font-bold transition-all ${
                            item.vipOnly && !isVIP
                              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-500 hover:to-blue-600'
                          }`}
                        >
                          {item.vipOnly && !isVIP ? '🔒 VIP Only' : 'Coming Soon'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-blue-200 text-sm">
                <p className="mb-2">💡 <strong>Premium Items Coming Soon!</strong></p>
                <p className="text-xs">
                  Custom dice designs, exclusive themes, and special bundles will be available for purchase soon. Stay tuned!
                </p>
              </div>
            </div>
          )}

          {/* MESSAGES */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg mt-6">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 p-3 rounded-lg mt-6">
              {message}
            </div>
          )}

          {/* INFO */}
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-blue-200 text-sm mt-6">
            <p className="mb-2">💡 <strong>Why shop at Casino Store?</strong></p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>All-in-one shopping for chips, VIP membership, and premium items</li>
              <li>Secure payment processing via Stripe</li>
              <li>Instant delivery of all digital items</li>
              <li>24/7 customer support for all purchases</li>
              <li>Support Rollers Paradise development</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
