import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { 
  X, Crown, Star, TrendingUp, Gift, Palette, Zap, Shield, 
  Calendar, CheckCircle, Sparkles, Trophy, Gem, Rocket,
  ArrowUp, ArrowDown, Award, Users, Heart
} from 'lucide-react';

type MembershipTier = 'free' | 'basic' | 'silver' | 'gold' | 'platinum';

interface MembershipModalProps {
  onClose: () => void;
  onPurchase: (tier: MembershipTier, duration: 'monthly' | 'yearly', price: number) => void;
  onUpgrade: (fromTier: MembershipTier, toTier: MembershipTier, duration: 'monthly' | 'yearly', price: number) => void;
  onDowngrade: (fromTier: MembershipTier, toTier: MembershipTier) => void;
  currentTier: MembershipTier;
  currentDuration?: 'monthly' | 'yearly';
  expiresAt?: number;
  userEmail?: string; // Added for payment processing
}

interface TierBenefit {
  icon: JSX.Element;
  title: string;
  description: string;
  color: string;
}

interface TierPlan {
  tier: MembershipTier;
  name: string;
  tagline: string;
  icon: JSX.Element;
  gradient: string;
  borderColor: string;
  monthlyPrice: number;
  yearlyPrice: number;
  benefits: TierBenefit[];
  perks: {
    dailyBonus: number;
    xpMultiplier: number;
    maxBet: number;
    exclusiveThemes: number;
    exclusiveDice: number;
    boostCardsMonthly: number;
    boostCardsYearly: number;
    prioritySupport: boolean;
    earlyAccess: boolean;
    adFree: boolean;
    tournamentAccess: boolean;
    privateTablesMax: number;
  };
}

const MEMBERSHIP_TIERS: TierPlan[] = [
  {
    tier: 'basic',
    name: 'BASIC',
    tagline: 'Start Your Journey',
    icon: <Star className="w-8 h-8" />,
    gradient: 'from-blue-600 to-blue-800',
    borderColor: 'border-blue-500',
    monthlyPrice: 2.99,
    yearlyPrice: 24.99,
    benefits: [
      {
        icon: <Gift className="w-5 h-5" />,
        title: 'Daily Bonus',
        description: '$250 chips daily',
        color: 'from-blue-500 to-cyan-500'
      },
      {
        icon: <Star className="w-5 h-5" />,
        title: 'XP Boost',
        description: '+10% XP gain',
        color: 'from-purple-500 to-blue-500'
      },
      {
        icon: <Palette className="w-5 h-5" />,
        title: 'Themes',
        description: '2 exclusive felts',
        color: 'from-pink-500 to-purple-500'
      },
      {
        icon: <Sparkles className="w-5 h-5" />,
        title: 'Badge',
        description: 'Basic badge',
        color: 'from-blue-400 to-blue-600'
      }
    ],
    perks: {
      dailyBonus: 250,
      xpMultiplier: 1.10,
      maxBet: 750,
      exclusiveThemes: 2,
      exclusiveDice: 3,
      boostCardsMonthly: 2,
      boostCardsYearly: 15,
      prioritySupport: false,
      earlyAccess: false,
      adFree: true,
      tournamentAccess: true,
      privateTablesMax: 2
    }
  },
  {
    tier: 'silver',
    name: 'SILVER',
    tagline: 'Enhanced Experience',
    icon: <Award className="w-8 h-8" />,
    gradient: 'from-gray-400 to-gray-600',
    borderColor: 'border-gray-400',
    monthlyPrice: 5.99,
    yearlyPrice: 49.99,
    benefits: [
      {
        icon: <Gift className="w-5 h-5" />,
        title: 'Daily Bonus',
        description: '$500 chips daily',
        color: 'from-yellow-500 to-orange-500'
      },
      {
        icon: <Star className="w-5 h-5" />,
        title: 'XP Boost',
        description: '+25% XP gain',
        color: 'from-purple-500 to-pink-500'
      },
      {
        icon: <Palette className="w-5 h-5" />,
        title: 'Themes',
        description: '5 exclusive felts',
        color: 'from-blue-500 to-cyan-500'
      },
      {
        icon: <Sparkles className="w-5 h-5" />,
        title: 'Custom Dice',
        description: '8 unique styles',
        color: 'from-green-500 to-emerald-500'
      },
      {
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'Higher Limits',
        description: 'Bet up to $1,000',
        color: 'from-red-500 to-orange-500'
      },
      {
        icon: <Trophy className="w-5 h-5" />,
        title: 'Tournaments',
        description: 'Premium events',
        color: 'from-yellow-400 to-yellow-600'
      }
    ],
    perks: {
      dailyBonus: 500,
      xpMultiplier: 1.25,
      maxBet: 1000,
      exclusiveThemes: 5,
      exclusiveDice: 8,
      boostCardsMonthly: 4,
      boostCardsYearly: 30,
      prioritySupport: false,
      earlyAccess: true,
      adFree: true,
      tournamentAccess: true,
      privateTablesMax: 5
    }
  },
  {
    tier: 'gold',
    name: 'GOLD',
    tagline: 'Premium Status',
    icon: <Crown className="w-8 h-8" />,
    gradient: 'from-yellow-500 to-orange-600',
    borderColor: 'border-yellow-500',
    monthlyPrice: 9.99,
    yearlyPrice: 79.99,
    benefits: [
      {
        icon: <Gift className="w-5 h-5" />,
        title: 'Daily Bonus',
        description: '$1,000 chips daily',
        color: 'from-yellow-500 to-orange-500'
      },
      {
        icon: <Star className="w-5 h-5" />,
        title: 'XP Boost',
        description: '+50% XP gain',
        color: 'from-purple-500 to-pink-500'
      },
      {
        icon: <Palette className="w-5 h-5" />,
        title: 'Themes',
        description: '10 exclusive felts',
        color: 'from-blue-500 to-cyan-500'
      },
      {
        icon: <Sparkles className="w-5 h-5" />,
        title: 'Custom Dice',
        description: '15 unique styles',
        color: 'from-green-500 to-emerald-500'
      },
      {
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'Higher Limits',
        description: 'Bet up to $2,500',
        color: 'from-red-500 to-orange-500'
      },
      {
        icon: <Crown className="w-5 h-5" />,
        title: 'Gold Badge',
        description: 'Premium status',
        color: 'from-yellow-400 to-yellow-600'
      },
      {
        icon: <Shield className="w-5 h-5" />,
        title: 'Priority Support',
        description: '24/7 assistance',
        color: 'from-cyan-500 to-blue-500'
      },
      {
        icon: <Zap className="w-5 h-5" />,
        title: 'Early Access',
        description: 'New features first',
        color: 'from-indigo-500 to-purple-500'
      }
    ],
    perks: {
      dailyBonus: 1000,
      xpMultiplier: 1.50,
      maxBet: 2500,
      exclusiveThemes: 10,
      exclusiveDice: 15,
      boostCardsMonthly: 8,
      boostCardsYearly: 60,
      prioritySupport: true,
      earlyAccess: true,
      adFree: true,
      tournamentAccess: true,
      privateTablesMax: 10
    }
  },
  {
    tier: 'platinum',
    name: 'PLATINUM',
    tagline: 'Ultimate VIP Experience',
    icon: <Gem className="w-8 h-8" />,
    gradient: 'from-purple-600 via-pink-600 to-purple-600',
    borderColor: 'border-purple-500',
    monthlyPrice: 19.99,
    yearlyPrice: 149.99,
    benefits: [
      {
        icon: <Gift className="w-5 h-5" />,
        title: 'Daily Bonus',
        description: '$2,500 chips daily',
        color: 'from-yellow-500 to-orange-500'
      },
      {
        icon: <Star className="w-5 h-5" />,
        title: 'XP Boost',
        description: '+100% XP gain',
        color: 'from-purple-500 to-pink-500'
      },
      {
        icon: <Palette className="w-5 h-5" />,
        title: 'All Themes',
        description: 'Every table design',
        color: 'from-blue-500 to-cyan-500'
      },
      {
        icon: <Sparkles className="w-5 h-5" />,
        title: 'All Dice',
        description: 'Every dice style',
        color: 'from-green-500 to-emerald-500'
      },
      {
        icon: <TrendingUp className="w-5 h-5" />,
        title: 'Unlimited Limits',
        description: 'Bet up to $10,000',
        color: 'from-red-500 to-orange-500'
      },
      {
        icon: <Gem className="w-5 h-5" />,
        title: 'Platinum Badge',
        description: 'Elite status',
        color: 'from-purple-400 to-pink-600'
      },
      {
        icon: <Shield className="w-5 h-5" />,
        title: 'VIP Support',
        description: 'Instant priority',
        color: 'from-cyan-500 to-blue-500'
      },
      {
        icon: <Rocket className="w-5 h-5" />,
        title: 'Beta Access',
        description: 'Test new features',
        color: 'from-indigo-500 to-purple-500'
      },
      {
        icon: <Users className="w-5 h-5" />,
        title: 'Private Tables',
        description: 'Unlimited rooms',
        color: 'from-green-500 to-teal-500'
      },
      {
        icon: <Heart className="w-5 h-5" />,
        title: 'VIP Events',
        description: 'Exclusive access',
        color: 'from-pink-500 to-rose-500'
      }
    ],
    perks: {
      dailyBonus: 2500,
      xpMultiplier: 2.0,
      maxBet: 10000,
      exclusiveThemes: 999,
      exclusiveDice: 999,
      boostCardsMonthly: 20,
      boostCardsYearly: 150,
      prioritySupport: true,
      earlyAccess: true,
      adFree: true,
      tournamentAccess: true,
      privateTablesMax: 999
    }
  }
];

export function MembershipModal({ 
  onClose, 
  onPurchase, 
  onUpgrade,
  onDowngrade,
  currentTier,
  currentDuration = 'monthly',
  expiresAt,
  userEmail
}: MembershipModalProps) {
  const [selectedTier, setSelectedTier] = useState<MembershipTier>(currentTier === 'free' ? 'silver' : currentTier);
  const [selectedDuration, setSelectedDuration] = useState<'monthly' | 'yearly'>(currentDuration);
  const [showComparison, setShowComparison] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Clear processing state on mount (in case user returned from payment)
  useEffect(() => {
    // Clear any stuck processing state
    setIsProcessing(false);
    
    // Clean up session flags if present
    const membershipInProgress = sessionStorage.getItem('membershipPurchaseInProgress');
    if (membershipInProgress) {
      const details = sessionStorage.getItem('membershipDetails');
      if (details) {
        try {
          const parsed = JSON.parse(details);
          // If more than 5 minutes old, clear it
          if (Date.now() - parsed.timestamp > 5 * 60 * 1000) {
            sessionStorage.removeItem('membershipPurchaseInProgress');
            sessionStorage.removeItem('membershipDetails');
          }
        } catch (e) {
          sessionStorage.removeItem('membershipPurchaseInProgress');
          sessionStorage.removeItem('membershipDetails');
        }
      }
    }
  }, []);

  const currentTierIndex = MEMBERSHIP_TIERS.findIndex(t => t.tier === currentTier);
  const selectedTierIndex = MEMBERSHIP_TIERS.findIndex(t => t.tier === selectedTier);
  const isUpgrade = selectedTierIndex > currentTierIndex && currentTier !== 'free';
  const isDowngrade = selectedTierIndex < currentTierIndex && currentTier !== 'free';
  const isNewPurchase = currentTier === 'free';

  const selectedPlan = MEMBERSHIP_TIERS.find(t => t.tier === selectedTier)!;
  const currentPlan = MEMBERSHIP_TIERS.find(t => t.tier === currentTier);

  const getPrice = () => {
    return selectedDuration === 'monthly' ? selectedPlan.monthlyPrice : selectedPlan.yearlyPrice;
  };

  const getSavingsPercentage = (plan: TierPlan) => {
    const monthlyTotal = plan.monthlyPrice * 12;
    const yearlySavings = monthlyTotal - plan.yearlyPrice;
    return Math.round((yearlySavings / monthlyTotal) * 100);
  };

  const handleAction = async () => {
    if (!userEmail) {
      setError('User email is required');
      return;
    }

    const price = getPrice();
    setIsProcessing(true);
    setError('');

    // Safety timeout: If still processing after 10 seconds, reset
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Payment process timeout - resetting loading state');
      setIsProcessing(false);
    }, 10000);
    
    try {
      // Save auth state before potential redirect
      try {
        const authToken = localStorage.getItem('supabase.auth.token');
        if (authToken) {
          sessionStorage.setItem('savedAuthToken', authToken);
        }
        sessionStorage.setItem('membershipPurchaseInProgress', 'true');
        sessionStorage.setItem('membershipDetails', JSON.stringify({
          tier: selectedTier,
          duration: selectedDuration,
          timestamp: Date.now()
        }));
      } catch (e) {
        console.warn('Could not save session data:', e);
      }

      if (isDowngrade) {
        // Downgrade doesn't require payment, just schedule it
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/membership/downgrade`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ 
              email: userEmail, 
              newTier: selectedTier 
            }),
          }
        );

        const data = await response.json();
        
        clearTimeout(timeoutId);
        if (response.ok) {
          onDowngrade(currentTier, selectedTier);
        } else {
          setError(data.error || 'Failed to schedule downgrade');
        }
        setIsProcessing(false);
      } else {
        // Purchase or upgrade requires Stripe payment
        const endpoint = isUpgrade 
          ? '/membership/upgrade' 
          : '/membership/purchase';
          
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f${endpoint}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({ 
              email: userEmail, 
              tier: selectedTier,
              newTier: selectedTier, // for upgrade
              duration: selectedDuration,
              price 
            }),
          }
        );

        const data = await response.json();
        
        if (!response.ok) {
          clearTimeout(timeoutId);
          setError(data.error || 'Failed to process membership');
          setIsProcessing(false);
          return;
        }

        // Redirect to Stripe checkout
        if (data.checkoutUrl) {
          clearTimeout(timeoutId); // Clear timeout before redirect
          window.location.href = data.checkoutUrl;
          // Don't set isProcessing to false - we're redirecting
        } else {
          // Direct activation (shouldn't happen for real payments)
          clearTimeout(timeoutId);
          if (isNewPurchase) {
            onPurchase(selectedTier, selectedDuration, price);
          } else if (isUpgrade) {
            onUpgrade(currentTier, selectedTier, selectedDuration, price);
          } else {
            onPurchase(selectedTier, selectedDuration, price);
          }
          setIsProcessing(false);
        }
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Error processing membership:', error);
      setError('Failed to process membership. Please try again.');
      setIsProcessing(false);
    }
  };

  const formatExpiry = () => {
    if (!expiresAt) return null;
    const date = new Date(expiresAt);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-y-auto border-2 border-gray-700"
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-900 p-6 border-b-2 border-purple-500/50 z-10 rounded-t-3xl">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            
            <div className="text-center">
              <motion.div
                animate={{ 
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className="inline-block mb-4"
              >
                <Crown className="w-16 h-16 text-yellow-400" strokeWidth={2} />
              </motion.div>
              <h2 className="text-5xl font-black text-white mb-2">
                ROLLERS PARADISE MEMBERSHIP
              </h2>
              <p className="text-purple-200 text-xl">
                Choose Your Experience • Unlock Exclusive Rewards • Join the Elite
              </p>
            </div>
          </div>

          {/* Current Status */}
          {currentTier !== 'free' && currentPlan && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-6 mt-6 p-5 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-2xl"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${currentPlan.gradient} flex items-center justify-center`}>
                    {currentPlan.icon}
                  </div>
                  <div>
                    <p className="text-green-400 font-bold text-xl flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Active {currentPlan.name} Member
                    </p>
                    <p className="text-green-300 text-sm">
                      {currentDuration === 'monthly' ? 'Monthly' : 'Yearly'} Plan
                      {expiresAt && ` • Renews: ${formatExpiry()}`}
                    </p>
                  </div>
                </div>
                
                {selectedTier !== currentTier && (
                  <div className="flex items-center gap-2 bg-black/30 px-4 py-2 rounded-lg">
                    {isUpgrade && (
                      <>
                        <ArrowUp className="w-5 h-5 text-green-400" />
                        <span className="text-green-400 font-bold">Upgrade Available</span>
                      </>
                    )}
                    {isDowngrade && (
                      <>
                        <ArrowDown className="w-5 h-5 text-orange-400" />
                        <span className="text-orange-400 font-bold">Downgrade Option</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Tier Selection */}
          <div className="p-6">
            <h3 className="text-2xl font-bold text-white text-center mb-6">
              {isNewPurchase ? 'Choose Your Membership Tier' : 'Manage Your Membership'}
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {MEMBERSHIP_TIERS.map((plan, index) => {
                const isCurrentTier = plan.tier === currentTier;
                const isSelected = plan.tier === selectedTier;
                const savings = getSavingsPercentage(plan);
                
                return (
                  <motion.button
                    key={plan.tier}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedTier(plan.tier)}
                    className={`relative p-5 rounded-2xl border-3 transition-all ${
                      isSelected
                        ? `${plan.borderColor} border-4 bg-gradient-to-br ${plan.gradient} shadow-2xl`
                        : isCurrentTier
                        ? 'border-green-500/50 bg-gradient-to-br from-gray-800 to-gray-900'
                        : 'border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-gray-600'
                    }`}
                  >
                    {/* Popular Badge */}
                    {plan.tier === 'gold' && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        MOST POPULAR
                      </div>
                    )}
                    
                    {/* Best Value Badge */}
                    {plan.tier === 'platinum' && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        BEST VALUE
                      </div>
                    )}

                    {/* Current Badge */}
                    {isCurrentTier && (
                      <div className="absolute -top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        CURRENT
                      </div>
                    )}

                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-3 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center ${isSelected ? 'text-white' : 'text-white/80'}`}>
                        {plan.icon}
                      </div>
                      
                      <h4 className={`text-2xl font-black mb-1 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                        {plan.name}
                      </h4>
                      <p className={`text-sm mb-3 ${isSelected ? 'text-white/90' : 'text-gray-400'}`}>
                        {plan.tagline}
                      </p>
                      
                      <div className="space-y-1 mb-3">
                        <div className="flex items-baseline justify-center gap-1">
                          <span className={`text-4xl font-black ${isSelected ? 'text-white' : 'text-gray-200'}`}>
                            ${selectedDuration === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                          </span>
                          <span className={`text-sm ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                            /{selectedDuration === 'monthly' ? 'mo' : 'yr'}
                          </span>
                        </div>
                        {selectedDuration === 'yearly' && (
                          <p className={`text-xs ${isSelected ? 'text-green-300' : 'text-green-400'} font-bold`}>
                            Save {savings}%!
                          </p>
                        )}
                      </div>

                      {/* Quick Benefits */}
                      <div className={`space-y-1 text-xs ${isSelected ? 'text-white/80' : 'text-gray-400'}`}>
                        <div className="flex items-center justify-center gap-1">
                          <Gift className="w-3 h-3" />
                          <span>${plan.perks.dailyBonus}/day</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          <span>+{((plan.perks.xpMultiplier - 1) * 100).toFixed(0)}% XP</span>
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-3 h-3" />
                          <span>${plan.perks.maxBet.toLocaleString()} max bet</span>
                        </div>
                      </div>

                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="mt-3"
                        >
                          <CheckCircle className="w-6 h-6 text-white mx-auto" />
                        </motion.div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Duration Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-800 p-2 rounded-xl border-2 border-gray-700 inline-flex gap-2">
                <button
                  onClick={() => setSelectedDuration('monthly')}
                  className={`px-6 py-3 rounded-lg font-bold transition-all ${
                    selectedDuration === 'monthly'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Calendar className="w-5 h-5 inline mr-2" />
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedDuration('yearly')}
                  className={`px-6 py-3 rounded-lg font-bold transition-all relative ${
                    selectedDuration === 'yearly'
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-gray-200'
                  }`}
                >
                  <Calendar className="w-5 h-5 inline mr-2" />
                  Yearly
                  <span className="ml-2 bg-yellow-400 text-black text-xs px-2 py-0.5 rounded-full font-black">
                    SAVE UP TO 40%
                  </span>
                </button>
              </div>
            </div>

            {/* Selected Plan Details */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border-2 border-gray-700 mb-8">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <div>
                  <h4 className="text-white font-bold text-2xl mb-1 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedPlan.gradient} flex items-center justify-center`}>
                      {selectedPlan.icon}
                    </div>
                    {selectedPlan.name} Membership Benefits
                  </h4>
                  <p className="text-gray-400">{selectedPlan.tagline}</p>
                </div>
                
                <button
                  onClick={() => setShowComparison(!showComparison)}
                  className="text-purple-400 hover:text-purple-300 text-sm font-bold flex items-center gap-2"
                >
                  {showComparison ? 'Hide' : 'Show'} Comparison
                  <TrendingUp className="w-4 h-4" />
                </button>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {selectedPlan.benefits.map((benefit, index) => (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-gray-900/50 p-4 rounded-xl border border-gray-700 hover:border-gray-600 transition-all"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-3 text-white`}>
                      {benefit.icon}
                    </div>
                    <h5 className="text-white font-bold text-sm mb-1">{benefit.title}</h5>
                    <p className="text-gray-400 text-xs">{benefit.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Comparison Table */}
            <AnimatePresence>
              {showComparison && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 overflow-hidden"
                >
                  <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-2xl p-6 border-2 border-purple-500/30">
                    <h4 className="text-white font-bold text-xl mb-4 text-center">
                      Membership Comparison
                    </h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-700">
                            <th className="text-left py-3 px-4 text-gray-400 font-bold">Feature</th>
                            {MEMBERSHIP_TIERS.map(tier => (
                              <th key={tier.tier} className="text-center py-3 px-4">
                                <div className="text-white font-bold">{tier.name}</div>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="text-gray-300">
                          <tr className="border-b border-gray-800">
                            <td className="py-3 px-4 font-semibold">Daily Bonus</td>
                            {MEMBERSHIP_TIERS.map(tier => (
                              <td key={tier.tier} className="text-center py-3 px-4 text-yellow-400">
                                ${tier.perks.dailyBonus}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b border-gray-800">
                            <td className="py-3 px-4 font-semibold">XP Boost</td>
                            {MEMBERSHIP_TIERS.map(tier => (
                              <td key={tier.tier} className="text-center py-3 px-4 text-purple-400">
                                +{((tier.perks.xpMultiplier - 1) * 100).toFixed(0)}%
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b border-gray-800">
                            <td className="py-3 px-4 font-semibold">Max Bet</td>
                            {MEMBERSHIP_TIERS.map(tier => (
                              <td key={tier.tier} className="text-center py-3 px-4 text-green-400">
                                ${tier.perks.maxBet.toLocaleString()}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b border-gray-800">
                            <td className="py-3 px-4 font-semibold">Exclusive Themes</td>
                            {MEMBERSHIP_TIERS.map(tier => (
                              <td key={tier.tier} className="text-center py-3 px-4">
                                {tier.perks.exclusiveThemes === 999 ? 'All' : tier.perks.exclusiveThemes}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b border-gray-800">
                            <td className="py-3 px-4 font-semibold">Exclusive Dice</td>
                            {MEMBERSHIP_TIERS.map(tier => (
                              <td key={tier.tier} className="text-center py-3 px-4">
                                {tier.perks.exclusiveDice === 999 ? 'All' : tier.perks.exclusiveDice}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b border-gray-800">
                            <td className="py-3 px-4 font-semibold">Priority Support</td>
                            {MEMBERSHIP_TIERS.map(tier => (
                              <td key={tier.tier} className="text-center py-3 px-4">
                                {tier.perks.prioritySupport ? '✓' : '−'}
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b border-gray-800">
                            <td className="py-3 px-4 font-semibold">Private Tables</td>
                            {MEMBERSHIP_TIERS.map(tier => (
                              <td key={tier.tier} className="text-center py-3 px-4">
                                {tier.perks.privateTablesMax === 999 ? '∞' : tier.perks.privateTablesMax}
                              </td>
                            ))}
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-red-900/30 border-2 border-red-500/50 rounded-xl p-4 text-center"
              >
                <p className="text-red-300 font-bold">⚠️ {error}</p>
              </motion.div>
            )}

            {/* Action Button */}
            <motion.button
              whileHover={{ scale: isProcessing ? 1 : 1.02 }}
              whileTap={{ scale: isProcessing ? 1 : 0.98 }}
              onClick={handleAction}
              disabled={(!isNewPurchase && selectedTier === currentTier && !isUpgrade && !isDowngrade) || isProcessing}
              className={`w-full py-6 rounded-2xl font-black text-2xl shadow-2xl transition-all border-4 ${
                isProcessing
                  ? 'bg-gray-600 text-gray-300 border-gray-500 cursor-wait'
                  : isUpgrade
                  ? 'bg-gradient-to-r from-green-500 via-green-400 to-green-500 hover:from-green-400 hover:via-green-300 hover:to-green-400 text-black border-green-300'
                  : isDowngrade
                  ? 'bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 hover:from-orange-400 hover:via-orange-300 hover:to-orange-400 text-black border-orange-300'
                  : isNewPurchase
                  ? `bg-gradient-to-r ${selectedPlan.gradient} hover:brightness-110 text-white border-white/20`
                  : 'bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 hover:from-blue-400 hover:via-blue-300 hover:to-blue-400 text-white border-blue-300'
              } ${!isNewPurchase && selectedTier === currentTier && !isUpgrade && !isDowngrade ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isProcessing ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block w-8 h-8 mr-2"
                    style={{ display: 'inline-block' }}
                  >
                    ⚙️
                  </motion.div>
                  PROCESSING PAYMENT...
                </>
              ) : isUpgrade ? (
                <>
                  <ArrowUp className="inline w-8 h-8 mr-2" />
                  UPGRADE TO {selectedPlan.name} - ${getPrice()}
                  <Sparkles className="inline w-8 h-8 ml-2" />
                </>
              ) : isDowngrade ? (
                <>
                  <ArrowDown className="inline w-8 h-8 mr-2" />
                  DOWNGRADE TO {selectedPlan.name}
                  <CheckCircle className="inline w-8 h-8 ml-2" />
                </>
              ) : isNewPurchase ? (
                <>
                  <Rocket className="inline w-8 h-8 mr-2" />
                  GET {selectedPlan.name} NOW - ${getPrice()}
                  <Sparkles className="inline w-8 h-8 ml-2" />
                </>
              ) : (
                <>
                  <CheckCircle className="inline w-8 h-8 mr-2" />
                  RENEW {selectedPlan.name} - ${getPrice()}
                </>
              )}
            </motion.button>

            {/* Downgrade Warning */}
            {isDowngrade && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 bg-orange-900/20 border-2 border-orange-500/50 rounded-xl p-4"
              >
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
                  <div className="text-sm text-orange-300">
                    <p className="font-bold mb-1">Downgrade Notice</p>
                    <p>
                      Your current benefits will remain active until your subscription expires on{' '}
                      <span className="font-semibold">{formatExpiry()}</span>. 
                      The new {selectedPlan.name} tier will take effect on your next billing cycle.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Trust Badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-400" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-400" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>10,000+ Happy Members</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-purple-400" />
                <span>Instant Activation</span>
              </div>
            </div>

            {/* Fine Print */}
            <p className="text-center text-xs text-gray-500 mt-6 leading-relaxed">
              Auto-renews {selectedDuration === 'monthly' ? 'monthly' : 'yearly'}. Cancel anytime from settings. 
              Benefits activate immediately upon purchase. Downgrades take effect at end of current billing period.
              This game uses fake money for entertainment purposes only. No real gambling.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
