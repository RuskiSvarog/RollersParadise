import { projectId, publicAnonKey } from './supabase/info';
import { toast } from '../components/ui/sonner';

export interface PaymentOptions {
  userEmail: string;
  type: 'chips' | 'vip';
  amount?: number; // for chips
  price: number;
  plan?: 'monthly' | 'yearly'; // for VIP
}

/**
 * Handles payment processing for both chip purchases and VIP memberships
 * Redirects to Stripe checkout and saves session state for return
 */
export async function processPayment(options: PaymentOptions): Promise<{ success: boolean; error?: string }> {
  const { userEmail, type, amount, price, plan } = options;

  try {
    // Save current state before redirect
    sessionStorage.setItem('purchaseInProgress', 'true');
    sessionStorage.setItem('returnPath', window.location.pathname);
    sessionStorage.setItem('purchaseDetails', JSON.stringify({
      type,
      amount,
      price,
      plan,
      timestamp: Date.now()
    }));

    // Save authentication state
    try {
      const authToken = localStorage.getItem('supabase.auth.token');
      if (authToken) {
        sessionStorage.setItem('savedAuthToken', authToken);
      }
    } catch (e) {
      console.warn('Could not save auth token:', e);
    }

    // Determine the API endpoint based on type
    const endpoint = type === 'chips' 
      ? `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/chips/buy`
      : `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/vip/purchase`;

    // Prepare request body
    const requestBody = type === 'chips'
      ? {
          email: userEmail,
          amount: amount,
          price: price
        }
      : {
          email: userEmail,
          plan: plan,
          price: price
        };

    console.log(`💳 Processing ${type} payment for ${userEmail}...`);

    // Make API request
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (!response.ok) {
      const error = data.error || `Failed to process ${type} payment`;
      toast.error('Payment Failed', {
        description: error
      });
      return { success: false, error };
    }

    // Check if Stripe checkout URL was returned
    if (data.checkoutUrl) {
      toast.success('Redirecting to secure payment...', {
        description: 'You will be redirected to Stripe checkout.'
      });
      
      // Redirect to Stripe checkout
      window.location.href = data.checkoutUrl;
      
      return { success: true };
    } else {
      // Direct purchase successful (fallback)
      toast.success('Purchase Successful!', {
        description: data.message || 'Your purchase has been processed.'
      });
      
      // Clear session data
      sessionStorage.removeItem('purchaseInProgress');
      sessionStorage.removeItem('returnPath');
      sessionStorage.removeItem('purchaseDetails');
      
      return { success: true };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Network error';
    console.error(`Error processing ${type} payment:`, error);
    
    toast.error('Payment Error', {
      description: 'Please check your connection and try again.'
    });
    
    return { success: false, error: errorMessage };
  }
}

/**
 * Handles return from payment (success or canceled)
 * Restores user session and provides feedback
 */
export function handlePaymentReturn(): {
  isPaymentReturn: boolean;
  success: boolean;
  canceled: boolean;
  purchaseDetails: any | null;
} {
  const urlParams = new URLSearchParams(window.location.search);
  const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
  
  const paymentSuccess = urlParams.get('payment_success') || hashParams.get('payment_success');
  const paymentCanceled = urlParams.get('payment_canceled') || hashParams.get('payment_canceled');
  
  if (!paymentSuccess && !paymentCanceled) {
    return {
      isPaymentReturn: false,
      success: false,
      canceled: false,
      purchaseDetails: null
    };
  }

  console.log('💳 Returning from payment flow...');

  // Restore authentication state
  try {
    const savedAuthToken = sessionStorage.getItem('savedAuthToken');
    if (savedAuthToken) {
      localStorage.setItem('supabase.auth.token', savedAuthToken);
      sessionStorage.removeItem('savedAuthToken');
    }
  } catch (e) {
    console.warn('Could not restore auth token:', e);
  }

  // Get purchase details
  let purchaseDetails = null;
  try {
    const detailsJson = sessionStorage.getItem('purchaseDetails');
    if (detailsJson) {
      purchaseDetails = JSON.parse(detailsJson);
    }
  } catch (e) {
    console.warn('Could not parse purchase details:', e);
  }

  // Clean up session storage
  sessionStorage.removeItem('returnPath');
  sessionStorage.removeItem('purchaseInProgress');
  sessionStorage.removeItem('purchaseDetails');

  // Show appropriate message
  if (paymentSuccess) {
    const type = purchaseDetails?.type || 'purchase';
    toast.success('Purchase Successful! 🎉', {
      description: type === 'chips' 
        ? `${purchaseDetails?.amount || 0} chips added to your balance!`
        : 'Your VIP membership is now active!',
      duration: 5000
    });
  } else if (paymentCanceled) {
    toast.info('Payment Canceled', {
      description: 'Your payment was canceled. No charges were made.',
      duration: 4000
    });
  }

  return {
    isPaymentReturn: true,
    success: !!paymentSuccess,
    canceled: !!paymentCanceled,
    purchaseDetails
  };
}

/**
 * Creates a VIP subscription through Stripe
 */
export async function createVIPSubscription(userEmail: string, plan: 'monthly' | 'yearly', price: number) {
  return processPayment({
    userEmail,
    type: 'vip',
    price,
    plan
  });
}

/**
 * Purchases chips through Stripe
 */
export async function purchaseChips(userEmail: string, amount: number, price: number) {
  return processPayment({
    userEmail,
    type: 'chips',
    amount,
    price
  });
}
