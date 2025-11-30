// Daily Bonus System with 24-Hour Cooldown
// Fully persistent across sessions with Supabase database tracking
import { supabase } from '../lib/supabaseClient';

export interface DailyBonusStatus {
  canClaim: boolean;
  lastClaimTime: number | null;
  nextClaimTime: number | null;
  timeRemaining: number; // milliseconds until next claim
  bonusAmount: number;
}

const BONUS_AMOUNT = 500; // Free chips
const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const STORAGE_KEY_PREFIX = 'daily_bonus_';

class DailyBonusManager {
  private updateCallbacks: Set<() => void> = new Set();
  private intervalId: NodeJS.Timeout | null = null;

  constructor() {
    // Start countdown update loop
    if (typeof window !== 'undefined') {
      this.startCountdown();
    }
  }

  // Subscribe to status updates
  subscribe(callback: () => void) {
    this.updateCallbacks.add(callback);
    return () => this.updateCallbacks.delete(callback);
  }

  private notifySubscribers() {
    this.updateCallbacks.forEach(callback => callback());
  }

  private startCountdown() {
    // Update every second for accurate countdown
    this.intervalId = setInterval(() => {
      this.notifySubscribers();
    }, 1000);
  }

  // Get last claim time from Supabase or localStorage
  private async getLastClaimTime(userEmail: string): Promise<number | null> {
    try {
      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from('daily_bonuses')
        .select('last_claim_time')
        .eq('user_email', userEmail)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected for new users
        throw error;
      }

      if (data?.last_claim_time) {
        return new Date(data.last_claim_time).getTime();
      }

      // Fallback to localStorage if Supabase fails or no data
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + userEmail);
      return stored ? parseInt(stored, 10) : null;
    } catch (error) {
      console.error('Error fetching last claim time:', error);
      // Fallback to localStorage
      const stored = localStorage.getItem(STORAGE_KEY_PREFIX + userEmail);
      return stored ? parseInt(stored, 10) : null;
    }
  }

  // Save last claim time to both Supabase and localStorage
  private async saveLastClaimTime(userEmail: string, timestamp: number): Promise<void> {
    // Save to localStorage immediately
    localStorage.setItem(STORAGE_KEY_PREFIX + userEmail, timestamp.toString());

    // Try to save to Supabase
    try {
      const { error } = await supabase
        .from('daily_bonuses')
        .upsert({
          user_email: userEmail,
          last_claim_time: new Date(timestamp).toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_email',
        });

      if (error) {
        console.error('Error saving to Supabase:', error);
      }
    } catch (error) {
      console.error('Error saving last claim time to Supabase:', error);
      // localStorage is already saved, so we can continue
    }
  }

  // Get current bonus status for a user
  async getStatus(userEmail: string): Promise<DailyBonusStatus> {
    try {
      const lastClaim = await this.getLastClaimTime(userEmail);
      const now = Date.now();
      const nextClaim = lastClaim ? lastClaim + COOLDOWN_PERIOD : null;
      const canClaim = !lastClaim || now >= (lastClaim + COOLDOWN_PERIOD);
      const timeRemaining = nextClaim && nextClaim > now ? nextClaim - now : 0;

      return {
        canClaim,
        lastClaimTime: lastClaim,
        nextClaimTime: nextClaim,
        timeRemaining,
        bonusAmount: BONUS_AMOUNT,
      };
    } catch (error) {
      console.error('Error fetching daily bonus status:', error);
      // Return default state on error
      return {
        canClaim: true,
        lastClaimTime: null,
        nextClaimTime: null,
        timeRemaining: 0,
        bonusAmount: BONUS_AMOUNT,
      };
    }
  }

  // Claim the daily bonus
  async claim(userEmail: string): Promise<{ success: boolean; amount: number; message: string; nextClaimTime: number }> {
    try {
      // Check if user can claim
      const status = await this.getStatus(userEmail);
      
      if (!status.canClaim) {
        return {
          success: false,
          amount: 0,
          message: 'You have already claimed your daily bonus. Come back later!',
          nextClaimTime: status.nextClaimTime || Date.now() + COOLDOWN_PERIOD,
        };
      }

      // Record the claim
      const now = Date.now();
      await this.saveLastClaimTime(userEmail, now);

      // Update user's chip balance
      try {
        const { data: userData, error: fetchError } = await supabase
          .from('user_data')
          .select('chips')
          .eq('email', userEmail)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
          throw fetchError;
        }

        const currentBalance = userData?.chips || 5000;
        const newBalance = currentBalance + BONUS_AMOUNT;

        const { error: updateError } = await supabase
          .from('user_data')
          .upsert({
            email: userEmail,
            chips: newBalance,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'email',
          });

        if (updateError) {
          console.error('Error updating balance:', updateError);
        }
      } catch (error) {
        console.error('Error updating chips balance:', error);
      }
      
      // Notify subscribers that status has changed
      this.notifySubscribers();
      
      return {
        success: true,
        amount: BONUS_AMOUNT,
        message: `You received ${BONUS_AMOUNT} free chips!`,
        nextClaimTime: now + COOLDOWN_PERIOD,
      };
    } catch (error: any) {
      console.error('Error claiming bonus:', error);
      return {
        success: false,
        amount: 0,
        message: error.message || 'Failed to claim bonus',
        nextClaimTime: Date.now() + COOLDOWN_PERIOD,
      };
    }
  }

  // Format time remaining as human-readable string
  formatTimeRemaining(milliseconds: number): string {
    if (milliseconds <= 0) return 'Available now!';

    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  // Cleanup
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.updateCallbacks.clear();
  }
}

// Singleton instance
export const dailyBonusManager = new DailyBonusManager();
