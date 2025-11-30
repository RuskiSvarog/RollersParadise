# 🚀 DEPLOYMENT & LIVE UPDATES GUIDE

## Overview

This document explains how to deploy Rollers Paradise to production and handle live updates without disrupting active players.

---

## 🔧 Current Environment (Figma Make)

**Figma Make is a DEVELOPMENT environment**, not a production hosting platform. It's designed for:
- Rapid prototyping
- UI/UX testing
- Feature development
- Client demonstrations

### Limitations:
- ❌ No persistent hosting
- ❌ No custom domain support
- ❌ No scalability for multiple users
- ❌ No zero-downtime deployment
- ❌ Limited to development/testing only

---

## 🌐 Production Deployment Options

To deploy Rollers Paradise for real users, you need to move to a **production hosting platform**. Here are the recommended options:

### **Option 1: Vercel (Recommended for React Apps)**

**Why Vercel?**
- ✅ Zero-downtime deployments
- ✅ Automatic HTTPS/SSL
- ✅ Global CDN for fast loading
- ✅ Automatic Git integration
- ✅ Preview deployments for testing
- ✅ Free tier available

**Setup:**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy
vercel --prod
```

**Zero-Downtime Updates:**
- Push code to GitHub
- Vercel automatically builds and deploys
- New version goes live instantly
- Old connections remain active until players refresh
- No interruption to active games

---

### **Option 2: Netlify**

**Why Netlify?**
- ✅ Similar to Vercel
- ✅ Easy drag-and-drop deployment
- ✅ Automatic SSL
- ✅ Continuous deployment from Git

**Setup:**
```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod
```

---

### **Option 3: AWS Amplify**

**Why AWS Amplify?**
- ✅ Enterprise-grade scalability
- ✅ Integrated with AWS services
- ✅ Advanced monitoring and analytics
- ✅ Auto-scaling for high traffic

**Setup:**
- Connect your GitHub repository
- Configure build settings
- Deploy with automatic CI/CD

---

### **Option 4: Self-Hosted (VPS/Dedicated Server)**

**Why Self-Hosted?**
- ✅ Complete control
- ✅ Custom configurations
- ✅ No vendor lock-in

**Recommended Providers:**
- DigitalOcean
- Linode
- AWS EC2
- Google Cloud Compute Engine

**Setup:**
```bash
# 1. Build production bundle
npm run build

# 2. Upload to server
scp -r build/* user@your-server:/var/www/rollers-paradise

# 3. Configure Nginx reverse proxy
# 4. Setup SSL with Let's Encrypt
# 5. Configure process manager (PM2, systemd)
```

---

## 🔄 Zero-Downtime Deployment Strategy

### **How to Update Without Disrupting Players**

#### **1. Blue-Green Deployment**

```
┌─────────────┐
│   Users     │
└──────┬──────┘
       │
   Load Balancer
       │
   ┌───┴────┐
   │        │
┌──▼──┐  ┌──▼──┐
│Blue │  │Green│
│(Old)│  │(New)│
└─────┘  └─────┘
```

**Process:**
1. Deploy new version to "Green" environment
2. Run tests on Green
3. Switch traffic from Blue to Green
4. Keep Blue running for rollback
5. After verification, shut down Blue

**Tools:**
- Kubernetes
- AWS Elastic Beanstalk
- Heroku
- Docker + Load Balancer

---

#### **2. Rolling Updates (Kubernetes)**

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: rollers-paradise
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1
      maxSurge: 1
  template:
    spec:
      containers:
      - name: app
        image: rollers-paradise:v2.0
```

**Benefits:**
- Gradual rollout
- Always maintains minimum replicas
- Automatic rollback on failure

---

#### **3. Canary Deployment**

```
1. Deploy to 10% of users
2. Monitor for errors
3. If successful, deploy to 50%
4. If successful, deploy to 100%
```

**Implementation:**
```javascript
// server.js
const version = Math.random() < 0.1 ? 'v2' : 'v1';
res.sendFile(`/var/www/rollers-paradise/${version}/index.html`);
```

---

## 🎮 Handling Active Game Sessions

### **WebSocket Connection Management**

```typescript
// Server-side websocket handler
wss.on('connection', (ws) => {
  ws.on('close', () => {
    console.log('Client disconnected - maintaining game state');
    // Keep game state in database for 5 minutes
    setTimeout(() => {
      if (!ws.reconnected) {
        cleanupGameState(ws.sessionId);
      }
    }, 300000);
  });
});
```

### **Client-Side Reconnection Logic**

```typescript
// Add to your multiplayer game component
useEffect(() => {
  let reconnectAttempts = 0;
  
  const handleDisconnect = () => {
    console.log('⚠️ Connection lost - attempting reconnect...');
    
    const reconnect = setInterval(() => {
      if (reconnectAttempts < 5) {
        connectToServer();
        reconnectAttempts++;
      } else {
        clearInterval(reconnect);
        showReconnectModal();
      }
    }, 2000);
  };
  
  socket.on('disconnect', handleDisconnect);
}, []);
```

---

## 📊 Monitoring Active Deployments

### **Health Checks**

```javascript
// /api/health
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: process.env.APP_VERSION,
    uptime: process.uptime(),
    activeConnections: wss.clients.size,
    timestamp: Date.now()
  });
});
```

### **Real-Time Monitoring Tools**

1. **New Relic** - Application performance monitoring
2. **Datadog** - Infrastructure and application monitoring
3. **Sentry** - Error tracking
4. **LogRocket** - Session replay and debugging

---

## 🔐 Database Migrations During Updates

### **Safe Migration Strategy**

```sql
-- 1. Add new column (backward compatible)
ALTER TABLE users ADD COLUMN new_feature VARCHAR(255) DEFAULT NULL;

-- 2. Migrate data (background job)
UPDATE users SET new_feature = old_feature WHERE new_feature IS NULL;

-- 3. After deployment completes, make required
ALTER TABLE users MODIFY COLUMN new_feature VARCHAR(255) NOT NULL;
```

### **Supabase Migrations**

```bash
# Create migration
supabase migration new add_new_feature

# Test locally
supabase db reset

# Deploy to production
supabase db push
```

---

## 📱 Progressive Web App (PWA) Updates

### **Service Worker Update Strategy**

```javascript
// service-worker.js
self.addEventListener('install', (event) => {
  // Force new service worker to activate immediately
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // Clear old caches
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CURRENT_CACHE)
          .map(name => caches.delete(name))
      );
    })
  );
});
```

### **Notify Users of Updates**

```typescript
// App.tsx
useEffect(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'installed') {
            showUpdateNotification();
          }
        });
      });
    });
  }
}, []);

function showUpdateNotification() {
  toast({
    title: "🎉 New version available!",
    description: "Refresh to get the latest features",
    action: <Button onClick={() => window.location.reload()}>Refresh</Button>
  });
}
```

---

## 🚨 Rollback Strategy

### **Instant Rollback Process**

```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# Kubernetes
kubectl rollout undo deployment/rollers-paradise

# Manual (Git)
git revert HEAD
git push origin main
```

### **Database Rollback**

```sql
-- Always create backups before migrations
pg_dump rollers_paradise > backup_$(date +%Y%m%d_%H%M%S).sql

-- Restore if needed
psql rollers_paradise < backup_20250128_120000.sql
```

---

## 📈 Gradual Feature Rollout

### **Feature Flags**

```typescript
// Feature flag system
const features = {
  newDiceAnimation: {
    enabled: process.env.REACT_APP_ENV === 'production' ? false : true,
    rollout: 0.25 // 25% of users
  }
};

function useFeature(featureName: string) {
  const userId = useCurrentUser()?.id;
  const feature = features[featureName];
  
  if (!feature.enabled) return false;
  
  // Deterministic rollout based on user ID
  const hash = hashCode(userId);
  return (hash % 100) < (feature.rollout * 100);
}

// Usage
const showNewDice = useFeature('newDiceAnimation');
```

---

## 🔔 Update Notifications to Players

### **In-Game Update Banner**

```typescript
// components/UpdateBanner.tsx
export function UpdateBanner() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  
  useEffect(() => {
    // Check for updates every 5 minutes
    const interval = setInterval(async () => {
      const response = await fetch('/api/version');
      const { version } = await response.json();
      
      if (version !== process.env.REACT_APP_VERSION) {
        setUpdateAvailable(true);
      }
    }, 300000);
    
    return () => clearInterval(interval);
  }, []);
  
  if (!updateAvailable) return null;
  
  return (
    <motion.div
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 bg-yellow-500 text-black p-4 text-center z-50"
    >
      🎉 A new version is available! 
      <button 
        onClick={() => window.location.reload()} 
        className="ml-4 bg-black text-yellow-500 px-4 py-2 rounded"
      >
        Update Now
      </button>
    </motion.div>
  );
}
```

---

## 📝 Deployment Checklist

Before deploying updates:

- [ ] Run all tests (`npm test`)
- [ ] Check TypeScript errors (`npm run type-check`)
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Verify database migrations work
- [ ] Backup database
- [ ] Check environment variables are set
- [ ] Review security settings
- [ ] Test WebSocket connections
- [ ] Verify payment integration (if applicable)
- [ ] Check anti-cheat system is working
- [ ] Monitor error logs after deployment
- [ ] Have rollback plan ready
- [ ] Notify users of scheduled maintenance (if needed)

---

## 🎯 Recommended Production Stack

```
Frontend:
- Vercel or Netlify
- React + TypeScript
- Tailwind CSS

Backend:
- Supabase (Database + Auth + Storage)
- Supabase Edge Functions (Server logic)

Real-Time:
- Supabase Realtime (WebSocket)

Monitoring:
- Sentry (Error tracking)
- Vercel Analytics (Performance)
- Supabase Dashboard (Database metrics)

CI/CD:
- GitHub Actions
- Automatic deployments on merge to main

CDN:
- Cloudflare (DDoS protection, caching)
```

---

## 💡 Best Practices

1. **Always test in staging first**
2. **Deploy during low-traffic hours**
3. **Monitor error rates after deployment**
4. **Keep old versions running for 24h**
5. **Communicate updates to users**
6. **Have 24/7 monitoring alerts**
7. **Keep deployment logs**
8. **Use semantic versioning**
9. **Tag releases in Git**
10. **Document all changes**

---

## 🆘 Emergency Procedures

### **Site Down - Quick Recovery**

```bash
# 1. Check service status
curl https://rollersparadise.com/health

# 2. Check error logs
vercel logs

# 3. Rollback immediately
vercel rollback

# 4. Investigate issue
# 5. Fix and redeploy
# 6. Post-mortem analysis
```

---

## 📞 Support

For production deployment assistance:
- Vercel Support: https://vercel.com/support
- Netlify Support: https://www.netlify.com/support/
- Supabase Support: https://supabase.com/support

---

**Last Updated:** January 28, 2025
**Version:** 1.0
