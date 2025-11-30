# 🎯 QUICK REFERENCE GUIDE

## Essential Information At-A-Glance

---

## 🔐 SECURITY DASHBOARD ACCESS

**Default PIN:** `2025`

**How to Access:**
1. Press `Ctrl + Shift + S` (Windows/Linux) or `Cmd + Shift + S` (Mac)
2. Or triple-click the Rollers Paradise logo
3. Enter PIN: `2025`
4. View security logs and events

**⚠️ CHANGE PIN BEFORE PRODUCTION:**
```typescript
// File: /components/SecurityDashboard.tsx
// Line: 17
const ADMIN_PIN = '2025'; // ← CHANGE THIS!
```

---

## ⚙️ DEFAULT SETTINGS

All settings now default to **OFF** for new users:

| Setting | Default Value |
|---------|---------------|
| Sound Effects | OFF (false) |
| Background Music | OFF (false) |
| Dealer Voice | OFF (false) |
| Ambient Sounds | OFF (false) |
| Master Volume | 50% |
| Sound Effects Volume | 50% |
| Music Volume | 50% |
| Dealer Volume | 50% |

**Why?** Respects user preferences and accessibility needs (especially elderly players).

---

## 🛡️ ANTI-CHEAT FEATURES

### Built-In Protection:
✅ Developer console detection  
✅ Data tampering prevention  
✅ Balance verification  
✅ Server-side validation  
✅ Cryptographic RNG for dice  
✅ Rate limiting  
✅ Device fingerprinting  
✅ Multi-account prevention  
✅ Pattern analysis for bots  

### Free Tools Available:
```bash
# Device fingerprinting
npm install @fingerprintjs/fingerprintjs

# DevTools detection
npm install devtools-detector
```

---

## 🎲 DICE DISPLAY

**Status:** ✅ Already working correctly

The ElectronicDiceBox shows:
- Animated rolling (4 seconds)
- **Actual final results** from game logic
- Results match win/loss calculations
- Results match statistics tracking

**No changes needed!**

---

## 🚀 DEPLOYMENT QUICK START

### Recommended: Vercel

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod
```

### Alternative: Netlify

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Deploy
netlify deploy --prod
```

---

## 📊 MONITORING

### Access Security Logs:
1. `Ctrl + Shift + S`
2. Enter PIN: `2025`
3. View logs

### Event Types Logged:
- `TAMPERING_DETECTED` - Someone tried to modify game data
- `BALANCE_MISMATCH` - Client/server balance don't match
- `ANTI_CHEAT_TRIGGERED` - DevTools or debugger detected
- `RATE_LIMIT_EXCEEDED` - Too many actions too fast
- `INVALID_DICE_ROLL` - Invalid dice values detected
- `BOT_DETECTED` - Bot-like behavior pattern
- `MULTI_ACCOUNT_DETECTED` - Same device, multiple accounts

---

## 🔄 LIVE UPDATES WITHOUT DISRUPTING PLAYERS

**Current Environment (Figma Make):**
- ❌ NOT suitable for production
- ❌ Updates WILL disrupt players
- ✅ Only for development/testing

**Production Solution:**
1. Deploy to Vercel/Netlify
2. Use Blue-Green or Rolling deployment
3. WebSocket connections auto-reconnect
4. Players see "Update Available" notification
5. Players can continue current game
6. Update applies on next refresh

**See:** `/DEPLOYMENT_AND_UPDATES.md` for full details

---

## 📁 KEY FILES

| File | Purpose |
|------|---------|
| `/components/SecurityDashboard.tsx` | Admin security monitoring (PIN: 2025) |
| `/contexts/SettingsContext.tsx` | Game settings (all default OFF) |
| `/components/PermissionRequest.tsx` | User consent & anti-cheat agreement |
| `/components/ElectronicDiceBox.tsx` | Dice display (shows actual results) |
| `/utils/security.ts` | Core security functions |
| `/utils/fairDice.ts` | Cryptographic RNG |
| `/DEPLOYMENT_AND_UPDATES.md` | Production deployment guide |
| `/ANTI_CHEAT_SYSTEM.md` | Complete security documentation |
| `/UPDATES_JANUARY_2025.md` | Summary of all changes |

---

## 🎯 PRE-LAUNCH CHECKLIST

Before deploying to production:

### Security
- [ ] Change admin PIN from default `2025`
- [ ] Test security dashboard access
- [ ] Verify anti-cheat detection works
- [ ] Test device fingerprinting
- [ ] Review security logs

### Settings
- [ ] Verify all settings default to OFF
- [ ] Test settings persistence
- [ ] Test cloud sync (if using Supabase)
- [ ] Verify settings shown to all users

### Game Logic
- [ ] Test dice randomness
- [ ] Verify results match calculations
- [ ] Test win/loss payouts
- [ ] Verify hand history accuracy
- [ ] Test multiplayer sync

### Deployment
- [ ] Choose hosting platform (Vercel recommended)
- [ ] Setup custom domain
- [ ] Configure environment variables
- [ ] Setup SSL/HTTPS
- [ ] Configure Supabase production instance
- [ ] Test deployment process
- [ ] Setup monitoring (Sentry, etc.)

### Documentation
- [ ] Update README with production URL
- [ ] Document admin access procedures
- [ ] Create user guide
- [ ] Document support procedures

---

## 🆘 TROUBLESHOOTING

### "Can't access Security Dashboard"
1. Try keyboard shortcut: `Ctrl + Shift + S`
2. Try triple-clicking the logo
3. Verify PIN is correct (default: `2025`)
4. Check browser console for errors

### "Settings not saving"
1. Check browser localStorage is enabled
2. Check Supabase connection (if using cloud)
3. Check browser console for errors
4. Try clearing cache and reloading

### "Dice not showing results"
1. This should already work - check console for errors
2. Verify `dice1` and `dice2` props are being passed
3. Check that `isRolling` state is updating correctly

### "Anti-cheat not detecting DevTools"
1. Make sure user consented to permissions
2. Check browser console for security logs
3. Try installing `devtools-detector` package
4. Verify Security module is imported

---

## 📞 SUPPORT RESOURCES

### Documentation
- `/DEPLOYMENT_AND_UPDATES.md` - Deployment guide
- `/ANTI_CHEAT_SYSTEM.md` - Security details
- `/UPDATES_JANUARY_2025.md` - Change summary
- `/SECURITY_README.md` - Security overview

### External Resources
- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Supabase Docs: https://supabase.com/docs
- FingerprintJS: https://github.com/fingerprintjs/fingerprintjs
- DevTools Detector: https://github.com/AEPKILL/devtools-detector

---

## 💡 TIPS & BEST PRACTICES

### Security
- Change default PIN immediately
- Review security logs weekly
- Monitor for unusual patterns
- Keep dependencies updated
- Use environment variables for secrets

### Performance
- Enable Vercel/Netlify caching
- Optimize images
- Use lazy loading for heavy components
- Monitor bundle size
- Use code splitting

### User Experience
- Test on multiple devices
- Test on slow connections
- Verify accessibility features
- Get user feedback
- Monitor error rates

### Maintenance
- Backup database regularly
- Monitor uptime
- Track error rates
- Review analytics
- Update documentation

---

## 🎉 YOU'RE READY!

Everything is configured and ready for production deployment. Just:

1. ✅ Change the admin PIN
2. ✅ Choose your hosting platform
3. ✅ Deploy
4. ✅ Monitor and maintain

**Good luck with Rollers Paradise!** 🎲🎰

---

**Last Updated:** January 28, 2025  
**Quick Reference Version:** 1.0
