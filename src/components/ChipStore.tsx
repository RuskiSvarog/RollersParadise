import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, DollarSign, Clock, CreditCard, Sparkles, Crown, Zap } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ChipStoreProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
  currentBalance: number;
  onBalanceUpdate: (newBalance: number) => void;
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

// REAL MONEY CHIP PACKAGES - HALF PRICE, BETTER PROFIT MARGINS
// Chips are worth LESS per dollar (better profit for house)
// Average casino profit margin: 40-50%
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

export function ChipStore({ isOpen, onClose, userEmail, currentBalance, onBalanceUpdate }: ChipStoreProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [canClaimFree, setCanClaimFree] = useState(false);
  const [timeUntilNextClaim, setTimeUntilNextClaim] = useState('');

  // Check if user can claim free chips
  useEffect(() => {
    if (isOpen && userEmail) {
      checkFreeClaim();
    }
  }, [isOpen, userEmail]);

  // Update countdown timer - only when modal is open
  useEffect(() => {
    if (!canClaimFree && isOpen && userEmail) {
      const interval = setInterval(() => {
        checkFreeClaim();
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [canClaimFree, isOpen, userEmail]);

  const checkFreeClaim = async () => {
    // Silently handle errors - don't spam console
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
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
      // Silently fail - this runs every second, so we don't want to spam console
      // The UI will just show the claim button as disabled until connection works
      // Handles both network errors and timeout aborts
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

  const handleBuyPackage = async (pkg: ChipPackage) => {
    setIsLoading(true);
    setError('');
    setMessage('');

    // Safety timeout: If still loading after 10 seconds, reset
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ Chip purchase timeout - resetting loading state');
      setIsLoading(false);
    }, 10000);

    console.log('🛒 Attempting purchase:', {
      userEmail,
      chips: pkg.chips,
      price: pkg.price,
      currentBalance
    });

    // REAL MONEY MODE - STRIPE PAYMENT REQUIRED
    // Users MUST pay real money via Stripe to purchase chips
    
    // Save current state before redirect
    try {
      sessionStorage.setItem('purchaseInProgress', 'true');
      sessionStorage.setItem('returnPath', window.location.pathname);
      sessionStorage.setItem('purchaseDetails', JSON.stringify({
        package: pkg,
        timestamp: Date.now()
      }));
    } catch (e) {
      console.warn('Could not save session data:', e);
    }

    // Removed test mode - production payments only
    const useTestMode = false;

    if (useTestMode) {
      // This path never executes - kept for backwards compatibility
      setError('❌ Payment system is in production mode.');
      setIsLoading(false);
      return;
    } else {
      // Real Stripe mode (won't work in Figma Make)
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

        // Check if Stripe checkout URL was returned (real payment)
        if (data.checkoutUrl) {
          // Save authentication state before redirect
          try {
            const authToken = localStorage.getItem('supabase.auth.token');
            if (authToken) {
              sessionStorage.setItem('savedAuthToken', authToken);
            }
          } catch (e) {
            console.warn('Could not save auth token:', e);
          }
          
          clearTimeout(timeoutId); // Clear timeout before redirect
          // Redirect to Stripe checkout
          setMessage('Redirecting to secure payment...');
          window.location.href = data.checkoutUrl;
          // Don't set isLoading to false - we're redirecting
        } else {
          // Direct purchase successful
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

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.95) 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div 
        className="rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto border-4"
        style={{
          background: 'linear-gradient(135deg, #14532d 0%, #15803d 20%, #16a34a 40%, #15803d 60%, #14532d 100%)',
          borderColor: '#fbbf24',
          boxShadow: '0 0 60px rgba(251, 191, 36, 0.6), 0 20px 80px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* EXCITING HEADER */}
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
              <DollarSign className="w-12 h-12" style={{ color: '#fbbf24' }} />
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
                💰 Chip Store 💰
              </h2>
              <p 
                className="text-lg font-bold mt-1"
                style={{ 
                  color: '#86efac',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                }}
              >
                Balance: ${currentBalance.toLocaleString()} | Buy More & Win Big!
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

        {/* Content */}
        <div className="p-6">
          {/* FREE CHIPS - MAKE IT POP! */}
          <div 
            className="mb-8 rounded-2xl p-6 border-4 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #1e40af 100%)',
              borderColor: '#60a5fa',
              boxShadow: '0 0 40px rgba(59, 130, 246, 0.6), 0 10px 30px rgba(0, 0, 0, 0.5)',
            }}
          >
            {/* Animated sparkles background */}
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

          {/* BUY CHIPS SECTION */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-6 h-6 text-yellow-400" />
              <h3 className="text-white text-xl">Buy Chip Packages</h3>
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
                    className={`relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-5 border-2 transition-all hover:scale-105 hover:shadow-xl ${
                      pkg.popular
                        ? 'border-yellow-400 shadow-lg shadow-yellow-500/50'
                        : 'border-gray-600 hover:border-yellow-500'
                    }`}
                  >
                    {/* Popular Badge */}
                    {pkg.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs">
                        ⭐ BEST VALUE
                      </div>
                    )}

                    {/* Label */}
                    {pkg.label && !pkg.popular && (
                      <div className="flex items-center gap-1 mb-2">
                        {Icon && <Icon className="w-4 h-4 text-yellow-400" />}
                        <span className="text-yellow-400 text-xs">{pkg.label}</span>
                      </div>
                    )}

                    {/* Price */}
                    <div className="text-center mb-3">
                      <div className="text-white text-4xl mb-1">
                        ${pkg.price}
                      </div>
                      <div className="text-gray-400 text-sm">USD</div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-700 my-3"></div>

                    {/* Chips */}
                    <div className="text-center mb-3">
                      <div className="text-green-400 text-3xl mb-1">
                        ${pkg.chips}
                      </div>
                      <div className="text-gray-400 text-sm">in chips</div>
                    </div>

                    {/* Bonus */}
                    <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-md p-2 text-center mb-4">
                      <div className="text-white">
                        +{bonusPercent}% BONUS
                      </div>
                      <div className="text-green-200 text-xs">
                        ${pkg.chips - pkg.price} extra chips!
                      </div>
                    </div>

                    {/* Buy Button */}
                    <button
                      onClick={() => handleBuyPackage(pkg)}
                      disabled={isLoading}
                      className={`w-full py-3 rounded-lg transition-all ${
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

          {/* MESSAGES */}
          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg mb-4">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-500/20 border border-green-500 text-green-200 p-3 rounded-lg mb-4">
              {message}
            </div>
          )}

          {/* INFO */}
          <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-blue-200 text-sm">
            <p className="mb-2">💡 <strong>Why buy chips?</strong></p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Keep playing when you run out of free chips</li>
              <li>Get bonus chips with every purchase (up to 400% bonus!)</li>
              <li>Support Rollers Paradise development</li>
              <li>Secure payment processing via Stripe</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}