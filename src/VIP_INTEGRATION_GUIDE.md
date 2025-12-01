# 🚀 VIP MEMBERSHIP - QUICK INTEGRATION GUIDE

## ⚡ **5-STEP INTEGRATION**

Follow these steps to add VIP membership to your game:

---

## **STEP 1: Wrap App with VIP Provider**

Update `/App.tsx`:

```typescript
import { VIPProvider } from './contexts/VIPContext';

// Inside App component, wrap everything:
<VIPProvider>
  <SettingsProvider>
    <ProgressionProvider>
      {/* Your existing app */}
    </ProgressionProvider>
  </SettingsProvider>
</VIPProvider>
```

---

## **STEP 2: Add VIP Button to Header**

Update `/components/CrapsHeader.tsx`:

```typescript
import { useVIP } from '../contexts/VIPContext';
import { VIPBadge } from './VIPBadge';
import { Crown } from 'lucide-react';

// Inside component:
const { vipStatus } = useVIP();
const [showVIPModal, setShowVIPModal] = useState(false);

// Add button next to settings:
{vipStatus.isVIP ? (
  <VIPBadge size="medium" />
) : (
  <button
    onClick={() => setShowVIPModal(true)}
    className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg transition-all"
  >
    <Crown className="w-5 h-5" />
    Get VIP
  </button>
)}
```

---

## **STEP 3: Add VIP Daily Bonus**

Update `/components/CrapsGame.tsx`:

```typescript
import { VIPDailyBonus } from './VIPDailyBonus';
import { useVIP } from '../contexts/VIPContext';

// Inside component:
const { vipStatus } = useVIP();

// Add to JSX (after other UI):
{vipStatus.isVIP && (
  <VIPDailyBonus
    onClaim={(amount) => {
      setBalance(prev => prev + amount);
      console.log(`🎁 VIP Daily Bonus claimed: $${amount}`);
    }}
  />
)}
```

---

## **STEP 4: Apply VIP Perks**

### **A) Daily Bonus Amount**

Update your daily bonus system:

```typescript
import { useVIP } from '../contexts/VIPContext';

const { getVIPPerks } = useVIP();
const perks = getVIPPerks();

// Use perks.dailyBonus instead of hardcoded 100
const bonusAmount = perks.dailyBonus; // 500 for VIP, 100 for free
```

### **B) XP Multiplier**

When awarding XP:

```typescript
const baseXP = 50;
const actualXP = Math.floor(baseXP * perks.xpMultiplier); // 1.25x for VIP
addXP(actualXP);
```

### **C) Max Bet Limit**

In chip selector:

```typescript
const maxBet = perks.maxBet; // 1000 for VIP, 500 for free

if (currentBet > maxBet) {
  alert(`Maximum bet is $${maxBet}. Upgrade to VIP for higher limits!`);
}
```

### **D) Show VIP Badge on Profile**

```typescript
{profile && (
  <div className="flex items-center gap-2">
    <span>{profile.name}</span>
    {vipStatus.isVIP && <VIPBadge size="small" />}
  </div>
)}
```

---

## **STEP 5: Add Purchase Modal**

Update `/components/CrapsGame.tsx`:

```typescript
import { VIPPassModal } from './VIPPassModal';
import { useVIP } from '../contexts/VIPContext';

// State:
const [showVIPModal, setShowVIPModal] = useState(false);
const { vipStatus, activateVIP } = useVIP();

// Purchase handler:
const handleVIPPurchase = async () => {
  // TODO: Integrate with payment processor (Stripe/PayPal)
  
  // For now, simulate purchase (REMOVE IN PRODUCTION):
  activateVIP('monthly');
  setShowVIPModal(false);
  
  alert('🎉 Welcome to Rollers Club VIP!');
  
  // Add welcome bonus
  setBalance(prev => prev + 5000);
};

// Add to JSX:
{showVIPModal && (
  <VIPPassModal
    onClose={() => setShowVIPModal(false)}
    onPurchase={handleVIPPurchase}
    isVIP={vipStatus.isVIP}
  />
)}
```

---

## 🎨 **OPTIONAL ENHANCEMENTS**

### **1. Show VIP-Only Table Themes**

```typescript
import { useVIP } from '../contexts/VIPContext';

const { vipStatus, getVIPPerks } = useVIP();
const perks = getVIPPerks();

// Filter themes based on VIP status
const availableThemes = allThemes.filter(theme => {
  if (theme.vipOnly) {
    return vipStatus.isVIP;
  }
  return true;
});
```

### **2. VIP Dice Colors**

```typescript
// In dice component:
const diceStyle = vipStatus.isVIP && selectedDiceColor 
  ? getDiceColorStyle(selectedDiceColor)
  : defaultDiceStyle;
```

### **3. VIP Leaderboard Badge**

```typescript
// In leaderboard component:
{player.isVIP && <VIPBadge size="small" showLabel={false} />}
```

### **4. VIP Notification**

Show toast when someone becomes VIP:

```typescript
import { toast } from 'sonner@2.0.3';

// After purchase:
toast.success(
  '🎉 Welcome to Rollers Club VIP!',
  {
    description: 'Claim your $5,000 welcome bonus now!',
    duration: 5000
  }
);
```

---

## 💳 **PAYMENT INTEGRATION**

### **Using Stripe (Recommended):**

```typescript
import { loadStripe } from '@stripe/stripe-js';

const handleVIPPurchase = async (plan: 'monthly' | 'yearly') => {
  try {
    const stripe = await loadStripe('your_stripe_public_key');
    
    // Create checkout session on your backend
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        plan,
        email: profile.email,
        userId: profile.id
      })
    });
    
    const session = await response.json();
    
    // Redirect to Stripe Checkout
    const result = await stripe?.redirectToCheckout({
      sessionId: session.id
    });
    
    if (result?.error) {
      alert(result.error.message);
    }
  } catch (error) {
    console.error('Payment error:', error);
    alert('Payment failed. Please try again.');
  }
};
```

### **Backend Webhook (Node.js/Supabase Edge Function):**

```typescript
// Handle Stripe webhook
export default async function handler(req: Request) {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  try {
    const event = stripe.webhooks.constructEvent(
      await req.text(),
      sig,
      webhookSecret
    );
    
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Activate VIP for user
      await supabase
        .from('users')
        .update({
          is_vip: true,
          vip_plan: session.metadata.plan,
          vip_expires_at: calculateExpiry(session.metadata.plan)
        })
        .eq('email', session.customer_email);
      
      console.log('✅ VIP activated:', session.customer_email);
    }
    
    return new Response(JSON.stringify({ received: true }), {
      status: 200
    });
  } catch (error) {
    console.error('Webhook error:', error);
    return new Response('Webhook error', { status: 400 });
  }
}
```

---

## 🗄️ **DATABASE SCHEMA**

Add VIP fields to users table:

```sql
ALTER TABLE users ADD COLUMN is_vip BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN vip_plan VARCHAR(10); -- 'monthly' or 'yearly'
ALTER TABLE users ADD COLUMN vip_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN vip_joined_at TIMESTAMP;
ALTER TABLE users ADD COLUMN last_daily_bonus TIMESTAMP;
ALTER TABLE users ADD COLUMN total_months_subscribed INTEGER DEFAULT 0;
```

---

## 🧪 **TESTING CHECKLIST**

- [ ] VIP badge appears after purchase
- [ ] Daily bonus shows $500 for VIP
- [ ] XP multiplier works (1.25x)
- [ ] Max bet increases to $1,000
- [ ] VIP themes unlock
- [ ] VIP dice unlock
- [ ] Daily bonus timer accurate
- [ ] Can't claim twice in 24h
- [ ] Expiry countdown works
- [ ] Auto-renewal works
- [ ] Cancellation works
- [ ] Refunds handled properly
- [ ] VIP status syncs across devices

---

## 🚨 **COMMON ISSUES & FIXES**

### **Issue: VIP badge not showing**
```typescript
// Make sure VIPProvider wraps the app
// Check vipStatus.isVIP is true
console.log('VIP Status:', vipStatus);
```

### **Issue: Daily bonus claimable multiple times**
```typescript
// Verify canClaimDailyBonus() logic
// Check lastDailyBonus timestamp
// Use server-side validation
```

### **Issue: Payment not activating VIP**
```typescript
// Check webhook is receiving events
// Verify Stripe webhook secret
// Check database update query
// Ensure frontend refreshes VIP status
```

---

## 📊 **ANALYTICS TO TRACK**

```typescript
// Track VIP events
analytics.track('VIP_Modal_Opened', { source: 'header_button' });
analytics.track('VIP_Plan_Selected', { plan: 'monthly' });
analytics.track('VIP_Purchase_Started', { plan, price });
analytics.track('VIP_Purchase_Completed', { plan, price });
analytics.track('VIP_Daily_Bonus_Claimed', { amount: 500 });
analytics.track('VIP_Cancelled', { reason });
analytics.track('VIP_Expired', { duration_days });
```

---

## ✅ **DEPLOYMENT CHECKLIST**

- [ ] Test in development
- [ ] Test payments in Stripe test mode
- [ ] Set up production Stripe account
- [ ] Configure webhook endpoint
- [ ] Add SSL certificate
- [ ] Test production payments
- [ ] Set up subscription management
- [ ] Configure cancellation flow
- [ ] Set up email notifications
- [ ] Test refund process
- [ ] Add customer support contact
- [ ] Document terms of service
- [ ] Add privacy policy
- [ ] Comply with local laws
- [ ] Soft launch to 10% users
- [ ] Monitor first 100 purchases
- [ ] Full rollout

---

## 🎉 **YOU'RE READY!**

After following these steps:
- ✅ VIP system fully integrated
- ✅ Payment processing works
- ✅ Perks applied correctly
- ✅ UI looks professional
- ✅ Ready to generate revenue!

**Estimated Integration Time:** 2-4 hours  
**Expected First Month Revenue:** $100-$2,000+  
**Long-term Potential:** $10k-500k+ annually

---

**GO MAKE MONEY! 💰🚀**
