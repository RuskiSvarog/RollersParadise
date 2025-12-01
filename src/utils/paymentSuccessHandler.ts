/**
 * Payment Success Handler
 * 
 * Handles post-payment actions:
 * 1. Fetches updated user profile from Supabase
 * 2. Updates local state with new chips/membership
 * 3. Shows success message
 * 4. Returns user to previous screen
 * 5. NO SIGN-IN REQUIRED!
 */

import { projectId, publicAnonKey } from './supabase/info';
import { toast } from 'sonner';

export interface PaymentSuccessData {
  type: 'chips' | 'membership';
  amount?: number;
  membershipTier?: string;
  userEmail: string;
}

/**
 * Fetch fresh user data from server after payment
 */
export async function fetchUpdatedUserProfile(email: string): Promise<any> {
  try {
    console.log('🔄 Fetching updated user profile for:', email);
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/user/profile`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }

    const data = await response.json();
    console.log('✅ Updated profile fetched:', data);
    
    return data.profile;
  } catch (error) {
    console.error('❌ Error fetching updated profile:', error);
    throw error;
  }
}

/**
 * Handle successful chip purchase
 */
export async function handleChipPurchaseSuccess(
  email: string,
  amount: number,
  onBalanceUpdate: (newBalance: number) => void,
  onProfileUpdate: (profile: any) => void
): Promise<void> {
  try {
    console.log('💰 Handling chip purchase success:', { email, amount });

    // First, confirm the payment with the backend
    const confirmResponse = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/chips/confirm-payment`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, amount }),
      }
    );

    if (!confirmResponse.ok) {
      throw new Error('Failed to confirm payment');
    }

    const confirmData = await confirmResponse.json();
    console.log('✅ Payment confirmed on server:', confirmData);

    // Now fetch fresh user data
    const updatedProfile = await fetchUpdatedUserProfile(email);

    // Update local storage
    if (updatedProfile) {
      localStorage.setItem('casino_user', JSON.stringify(updatedProfile));
      
      // Update parent component state
      onProfileUpdate(updatedProfile);
      
      if (updatedProfile.chips !== undefined) {
        onBalanceUpdate(updatedProfile.chips);
      }

      // Show success message
      toast.success('🎉 Purchase Successful!', {
        description: `Added $${amount} chips to your account!`,
        duration: 5000,
      });

      console.log('✅ Chip purchase applied successfully');
    }
  } catch (error) {
    console.error('❌ Error applying chip purchase:', error);
    toast.error('Purchase completed but there was an error updating your balance', {
      description: 'Please refresh the page or contact support',
      duration: 7000,
    });
  }
}

/**
 * Handle successful membership purchase/upgrade
 */
export async function handleMembershipPurchaseSuccess(
  email: string,
  tier: string,
  duration: string,
  onProfileUpdate: (profile: any) => void
): Promise<void> {
  try {
    console.log('👑 Handling membership purchase success:', { email, tier, duration });

    // First, confirm the membership with the backend
    const confirmResponse = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/membership/confirm`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify({ email, tier, duration }),
      }
    );

    if (!confirmResponse.ok) {
      throw new Error('Failed to confirm membership');
    }

    const confirmData = await confirmResponse.json();
    console.log('✅ Membership confirmed on server:', confirmData);

    // Now fetch fresh user data
    const updatedProfile = await fetchUpdatedUserProfile(email);

    // Update local storage
    if (updatedProfile) {
      localStorage.setItem('casino_user', JSON.stringify(updatedProfile));
      
      // Update parent component state
      onProfileUpdate(updatedProfile);

      // Show success message based on tier
      const tierNames: Record<string, string> = {
        bronze: '🥉 Bronze',
        silver: '🥈 Silver',
        gold: '🥇 Gold',
        platinum: '💎 Platinum',
      };

      const tierName = tierNames[tier] || tier;
      const durationText = duration === 'monthly' ? 'Monthly' : 'Annual';

      toast.success('🎉 Membership Activated!', {
        description: `You are now a ${tierName} member! (${durationText})`,
        duration: 5000,
      });

      console.log('✅ Membership applied successfully');
    }
  } catch (error) {
    console.error('❌ Error applying membership:', error);
    toast.error('Purchase completed but there was an error updating your membership', {
      description: 'Please refresh the page or contact support',
      duration: 7000,
    });
  }
}

/**
 * Main payment success handler
 * Called when user returns from Stripe checkout
 */
export async function handlePaymentReturn(
  urlParams: URLSearchParams,
  hashParams: URLSearchParams,
  currentProfile: any,
  onBalanceUpdate: (newBalance: number) => void,
  onProfileUpdate: (profile: any) => void
): Promise<boolean> {
  const paymentSuccess = urlParams.get('payment_success') || hashParams.get('payment_success');
  const membershipSuccess = urlParams.get('membership_success') || hashParams.get('membership_success');
  const paymentCanceled = urlParams.get('payment_canceled') || hashParams.get('payment_canceled');
  const membershipCanceled = urlParams.get('membership_cancelled') || hashParams.get('membership_cancelled');

  // Check if this is a payment return
  if (!paymentSuccess && !membershipSuccess && !paymentCanceled && !membershipCanceled) {
    return false; // Not a payment return
  }

  console.log('💳 Payment return detected:', {
    paymentSuccess,
    membershipSuccess,
    paymentCanceled,
    membershipCanceled,
  });

  // Handle cancellations
  if (paymentCanceled) {
    toast.info('Payment Canceled', {
      description: 'No charges were made to your account',
      duration: 4000,
    });
    return true;
  }

  if (membershipCanceled) {
    toast.info('Membership Purchase Canceled', {
      description: 'No charges were made to your account',
      duration: 4000,
    });
    return true;
  }

  // Get user email
  const email = currentProfile?.email;
  if (!email) {
    console.error('❌ No email found for payment processing');
    toast.error('Error processing payment', {
      description: 'Please sign in and try again',
    });
    return true;
  }

  // Handle successful chip purchase
  if (paymentSuccess) {
    const amount = parseInt(urlParams.get('amount') || hashParams.get('amount') || '0');
    await handleChipPurchaseSuccess(email, amount, onBalanceUpdate, onProfileUpdate);
    return true;
  }

  // Handle successful membership purchase
  if (membershipSuccess) {
    const tier = urlParams.get('tier') || hashParams.get('tier') || 'bronze';
    const duration = urlParams.get('duration') || hashParams.get('duration') || 'monthly';
    await handleMembershipPurchaseSuccess(email, tier, duration, onProfileUpdate);
    return true;
  }

  return true;
}

/**
 * Clean up URL parameters after processing payment
 */
export function cleanupPaymentUrl(): void {
  const url = new URL(window.location.href);
  
  // Remove payment-related parameters
  url.searchParams.delete('payment_success');
  url.searchParams.delete('payment_canceled');
  url.searchParams.delete('membership_success');
  url.searchParams.delete('membership_cancelled');
  url.searchParams.delete('amount');
  url.searchParams.delete('tier');
  url.searchParams.delete('email');

  // Update URL without reload
  window.history.replaceState({}, document.title, url.toString());
  
  console.log('🧹 Payment URL parameters cleaned');
}
