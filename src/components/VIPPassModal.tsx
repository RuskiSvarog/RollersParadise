import { useState } from 'react';
import { X, Crown, Star, TrendingUp, Gift, Palette, Zap, Shield, Calendar, CheckCircle, Sparkles } from './Icons';

interface VIPPassModalProps {
  onClose: () => void;
  onPurchase: (plan: 'monthly' | 'yearly', price: number) => void;
  isVIP: boolean;
}

export function VIPPassModal({ onClose, onPurchase, isVIP }: VIPPassModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  
  const planPrices = {
    monthly: 4.99,
    yearly: 35.99
  };

  const benefits = [
    {
      icon: <Gift className="w-6 h-6" />,
      title: 'Daily VIP Bonus',
      description: '$500 chips every day',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: '25% XP Boost',
      description: 'Level up faster',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: 'Exclusive Themes',
      description: '5 premium table designs',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: 'Custom Dice',
      description: '10 unique dice styles',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Higher Limits',
      description: 'Bet up to $1,000',
      color: 'from-red-500 to-orange-500'
    },
    {
      icon: <Crown className="w-6 h-6" />,
      title: 'VIP Badge',
      description: 'Show off your status',
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Early Access',
      description: 'New features first',
      color: 'from-indigo-500 to-purple-500'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Priority Support',
      description: '24/7 VIP support',
      color: 'from-cyan-500 to-blue-500'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="animate-in zoom-in-95 slide-in-from-bottom-4 fade-in duration-300">
        <div
          className="bg-gradient-to-br from-gray-900 via-purple-900/50 to-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-4 border-yellow-500/50"
          style={{
            boxShadow: '0 0 60px rgba(234, 179, 8, 0.3), inset 0 0 60px rgba(168, 85, 247, 0.1)'
          }}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 p-6 border-b-4 border-yellow-400 z-10">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:text-yellow-200 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            
            <div className="text-center">
              <div
                className="inline-block animate-wiggle"
              >
                <Crown className="w-16 h-16 text-white mx-auto mb-2" strokeWidth={2.5} />
              </div>
              <h2 className="text-5xl font-black text-white mb-2" style={{ textShadow: '0 4px 8px rgba(0,0,0,0.3)' }}>
                ROLLERS CLUB VIP
              </h2>
              <p className="text-yellow-100 text-xl font-bold">
                Premium Membership • Exclusive Rewards • Ultimate Experience
              </p>
            </div>
          </div>

          {/* Current Status (if VIP) */}
          {isVIP && (
            <div
              className="animate-in fade-in slide-in-from-top-2 duration-300"
              className="mx-6 mt-6 p-4 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-2 border-green-500 rounded-xl"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <div>
                  <p className="text-green-400 font-bold text-lg">Active VIP Member</p>
                  <p className="text-green-300 text-sm">Renews: January 27, 2026</p>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Plans */}
          <div className="p-6 grid md:grid-cols-2 gap-4">
            {/* Monthly Plan */}
            <button
              onClick={() => setSelectedPlan('monthly')}
              className={`p-6 rounded-xl border-4 transition-all hover:scale-[1.02] active:scale-[0.98] ${
                selectedPlan === 'monthly'
                  ? 'border-yellow-500 bg-gradient-to-br from-yellow-600/20 to-orange-600/20'
                  : 'border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <Calendar className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-white mb-1">Monthly Pass</h3>
                <div className="flex items-baseline justify-center gap-1 mb-2">
                  <span className="text-5xl font-black text-yellow-400">$4.99</span>
                  <span className="text-gray-400">/month</span>
                </div>
                <p className="text-gray-300 text-sm">
                  Billed monthly • Cancel anytime
                </p>
                {selectedPlan === 'monthly' && (
                  <div
                    className="mt-3 animate-in zoom-in duration-200"
                  >
                    <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                  </div>
                )}
              </div>
            </button>

            {/* Yearly Plan (Best Value) */}
            <button
              onClick={() => setSelectedPlan('yearly')}
              className={`p-6 rounded-xl border-4 transition-all relative hover:scale-[1.02] active:scale-[0.98] ${
                selectedPlan === 'yearly'
                  ? 'border-yellow-500 bg-gradient-to-br from-yellow-600/20 to-orange-600/20'
                  : 'border-gray-600 bg-gradient-to-br from-gray-800 to-gray-900 hover:border-gray-500'
              }`}
            >
              {/* Best Value Badge */}
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                SAVE 40%
              </div>
              
              <div className="text-center">
                <Calendar className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <h3 className="text-2xl font-bold text-white mb-1">Yearly Pass</h3>
                <div className="flex items-baseline justify-center gap-1 mb-1">
                  <span className="text-5xl font-black text-yellow-400">$35.99</span>
                  <span className="text-gray-400">/year</span>
                </div>
                <p className="text-green-400 text-sm font-bold mb-1">
                  Just $2.99/month!
                </p>
                <p className="text-gray-400 text-xs line-through">
                  Regular price: $59.88/year
                </p>
                {selectedPlan === 'yearly' && (
                  <div
                    className="mt-3 animate-in zoom-in duration-200"
                  >
                    <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                  </div>
                )}
              </div>
            </button>
          </div>

          {/* Benefits Grid */}
          <div className="px-6 pb-6">
            <h3 className="text-2xl font-bold text-center text-white mb-4">
              🎁 What You Get
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {benefits.map((benefit, index) => (
                <div
                  key={benefit.title}
                  className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border-2 border-gray-700 hover:border-yellow-500/50 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-3`}>
                    {benefit.icon}
                  </div>
                  <h4 className="text-white font-bold mb-1">{benefit.title}</h4>
                  <p className="text-gray-400 text-sm">{benefit.description}</p>
                </div>
              ))}
            </div>

            {/* What's Included Section */}
            <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 p-6 rounded-xl border-2 border-purple-500/50 mb-6">
              <h4 className="text-white font-bold text-xl mb-4 text-center">✨ What's Included</h4>
              <div className="space-y-3 text-gray-300">
                <div className="flex items-start gap-3">
                  <div className="text-green-400 text-xl">✓</div>
                  <div>
                    <div className="font-semibold text-white">Daily VIP Bonus</div>
                    <div className="text-sm">Get bonus chips every day you log in</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-400 text-xl">✓</div>
                  <div>
                    <div className="font-semibold text-white">Exclusive XP Boosts</div>
                    <div className="text-sm">Level up faster with premium multipliers</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-400 text-xl">✓</div>
                  <div>
                    <div className="font-semibold text-white">Premium Table Felts</div>
                    <div className="text-sm">Unlock exclusive table designs and colors</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-400 text-xl">✓</div>
                  <div>
                    <div className="font-semibold text-white">VIP Badge & Status</div>
                    <div className="text-sm">Show off your membership to other players</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="text-green-400 text-xl">✓</div>
                  <div>
                    <div className="font-semibold text-white">Priority Support</div>
                    <div className="text-sm">Get help faster when you need it</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Purchase Button */}
            <button
              onClick={() => onPurchase(selectedPlan, planPrices[selectedPlan])}
              className="w-full py-6 bg-gradient-to-r from-yellow-500 via-yellow-400 to-yellow-500 hover:from-yellow-400 hover:via-yellow-300 hover:to-yellow-400 text-black font-black text-2xl rounded-xl shadow-2xl transition-all border-4 border-yellow-300 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                boxShadow: '0 10px 40px rgba(234, 179, 8, 0.5), inset 0 2px 10px rgba(255, 255, 255, 0.3)'
              }}
            >
              {isVIP ? (
                <>🔄 RENEW VIP PASS - ${planPrices[selectedPlan]}</>
              ) : (
                <>
                  <Crown className="inline w-8 h-8 mr-2" />
                  GET VIP ACCESS NOW - ${planPrices[selectedPlan]}
                  <Sparkles className="inline w-8 h-8 ml-2" />
                </>
              )}
            </button>

            {/* Trust Badges */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-400" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-blue-400" />
                <span>Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span>5,000+ Happy VIPs</span>
              </div>
            </div>

            {/* Fine Print */}
            <p className="text-center text-xs text-gray-500 mt-4">
              Auto-renews {selectedPlan === 'monthly' ? 'monthly' : 'yearly'}. Cancel anytime from settings. 
              VIP benefits activate immediately upon purchase. 
              This game uses fake money for entertainment purposes only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
