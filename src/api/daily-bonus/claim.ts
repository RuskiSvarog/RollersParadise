// API endpoint to claim daily bonus
import type { NextApiRequest, NextApiResponse } from 'next';

// In-memory storage for demo (replace with real database in production)
const bonusClaimTimes = new Map<string, number>();

const BONUS_AMOUNT = 500;
const COOLDOWN_PERIOD = 24 * 60 * 60 * 1000; // 24 hours

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const now = Date.now();
  const lastClaimTime = bonusClaimTimes.get(email);

  // Check if user can claim
  if (lastClaimTime) {
    const timeSinceLastClaim = now - lastClaimTime;
    
    if (timeSinceLastClaim < COOLDOWN_PERIOD) {
      const timeRemaining = COOLDOWN_PERIOD - timeSinceLastClaim;
      const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
      const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
      
      return res.status(429).json({
        error: 'Too early to claim',
        message: `You can claim your next bonus in ${hours}h ${minutes}m`,
        nextClaimTime: lastClaimTime + COOLDOWN_PERIOD,
        timeRemaining,
      });
    }
  }

  // Record claim time
  bonusClaimTimes.set(email, now);

  // In production, also update user's chip balance in database
  // await updateUserChips(email, BONUS_AMOUNT);

  return res.status(200).json({
    success: true,
    amount: BONUS_AMOUNT,
    message: `You received ${BONUS_AMOUNT} FREE CHIPS!`,
    nextClaimTime: now + COOLDOWN_PERIOD,
    claimedAt: now,
  });
}
