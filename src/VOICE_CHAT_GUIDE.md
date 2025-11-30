# 🎤 Voice Chat System - Complete Guide

## Overview
Rollers Paradise features a **fully functional voice chat system** that allows players in the same game lobby to communicate using their microphones and headsets. The system includes comprehensive controls for muting individual players, device selection, and player reporting.

---

## ✅ Features Implemented

### 🎙️ **Core Voice Chat**
- ✅ Real-time voice communication between all players in a lobby
- ✅ Microphone permission handling with user-friendly prompts
- ✅ Automatic device detection (microphones and speakers/headphones)
- ✅ Visual indicators showing who is currently speaking
- ✅ Push-to-talk and always-on microphone modes

### 🔊 **Audio Controls**
- ✅ **Global Microphone Toggle** - Turn your mic on/off instantly
- ✅ **Mute Individual Players** - Mute any player locally (only you won't hear them)
- ✅ **Device Selection**:
  - Choose your microphone/headset from dropdown
  - Choose your audio output (speakers/headphones) from dropdown
  - Settings are saved and persist across sessions
- ✅ **Hot-swapping** - Switch devices without leaving the game
- ✅ **Echo Cancellation** - Built-in noise reduction and echo cancellation
- ✅ **Auto Gain Control** - Automatic volume normalization

### 👥 **Player Management**
- ✅ **Mute Specific Players** - Click the mute icon next to any player
- ✅ **Hide Chat from Players** - Hide text messages from specific players
- ✅ **Report System**:
  - Report abusive/inappropriate players
  - Submit bug reports
  - All reports go to admin dashboard for review
- ✅ **Visual Status Indicators**:
  - 🎤 Green mic = Player is speaking
  - 🔇 Red mic = Player is muted
  - 🔊 Speaker icon = Audio controls

### 💬 **Integrated Text Chat**
- ✅ Real-time text chat as backup communication
- ✅ Tabbed interface (Voice tab + Chat tab)
- ✅ Unread message notifications
- ✅ Option to minimize the entire voice/chat panel

---

## 🎮 How Players Use It

### **First Time Setup**

1. **Join a Multiplayer Lobby**
   - When you join a lobby, the Voice Chat panel appears in the bottom-left corner

2. **Grant Microphone Permission**
   - Click the microphone button
   - Browser will ask: "Allow access to your microphone?"
   - Click "Allow" to enable voice chat
   - **Note**: If no microphone is detected, voice chat will be disabled (game still works fine)

3. **Select Your Devices (Optional)**
   - Click the Settings ⚙️ icon in the Voice tab
   - Choose your preferred microphone (e.g., headset mic, USB mic)
   - Choose your preferred audio output (e.g., headphones, speakers)
   - Settings are automatically saved

### **During Gameplay**

#### **Toggle Your Microphone**
- Click the 🎤 mic button to turn your mic on/off
- Green = You're transmitting
- Gray = You're muted

#### **Mute Other Players**
- Each player has a 🔊 speaker icon next to their name
- Click it to mute/unmute that specific player
- This is **local only** - only YOU won't hear them
- Useful if someone has background noise or you want privacy

#### **Switch Between Voice & Chat**
- Click the "Voice" tab to see who's in voice chat
- Click the "Chat" tab to send text messages
- Red notification badge shows unread messages

#### **Minimize the Panel**
- Click the Minimize icon to collapse the panel
- You'll still be connected to voice chat
- Quick access buttons for mic and chat remain visible

#### **Report a Player**
- Click the Flag 🚩 icon next to a player's name
- Select a reason (harassment, cheating, spam, etc.)
- Add description
- Submit - admins will review

### **Troubleshooting for Players**

| Issue | Solution |
|-------|----------|
| **Can't hear anyone** | 1. Check your audio output device in Settings<br>2. Make sure you haven't muted individual players<br>3. Check your system volume |
| **Others can't hear me** | 1. Make sure your mic is enabled (green button)<br>2. Check microphone selection in Settings<br>3. Grant microphone permission if prompted |
| **Echo or feedback** | 1. Use headphones instead of speakers<br>2. Ask others to use headphones<br>3. Reduce microphone volume |
| **Microphone not detected** | 1. Plug in a microphone or headset<br>2. Refresh the page<br>3. Check browser permissions (Settings → Privacy → Microphone) |

---

## 🔧 Technical Implementation

### **Architecture**
```
Player 1 (Browser) <─── WebRTC P2P ───> Player 2 (Browser)
        │                                      │
        └────── Signaling Server ──────────────┘
                 (Supabase)
```

### **Components**

#### **VoiceChatSystem.tsx**
The main voice chat component with:
- WebRTC peer-to-peer connections for low-latency audio
- MediaStream API for microphone/speaker access
- Real-time participant tracking
- Device enumeration and selection
- Mute controls (global and per-player)
- Text chat integration
- Report submission system

#### **Key Functions**

```typescript
// Request microphone access
requestMicPermission(deviceId?: string): Promise<boolean>

// Toggle local microphone on/off
toggleMic(): void

// Mute/unmute specific player (local only)
muteParticipant(userId: string): void

// Change microphone device
changeInputDevice(deviceId: string): Promise<void>

// Change audio output device (speakers/headphones)
changeOutputDevice(deviceId: string): Promise<void>

// Hide chat messages from specific user
toggleHideChat(userId: string): void

// Report a player
submitPlayerReport(reason: string, description: string): Promise<void>

// Report a bug
submitBugReport(description: string, reproSteps: string): Promise<void>
```

### **Server Endpoints**

```typescript
// Store player reports
POST /make-server-67091a4f/player-reports
Body: {
  id, reporter_id, reporter_name, target_id, target_name,
  type, reason, description, timestamp, room_id, status
}

// Store bug reports  
POST /make-server-67091a4f/bug-reports
Body: {
  id, reporter_id, reporter_name, type, description,
  timestamp, room_id, status
}
```

### **Browser Compatibility**
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari (iOS may have limitations)
- ✅ Mobile browsers (with microphone access)

### **Privacy & Security**
- 🔒 All audio is peer-to-peer (not stored on servers)
- 🔒 Microphone permission required (users must explicitly allow)
- 🔒 Individual mute controls give users full privacy
- 🔒 Reports are encrypted and only visible to admins
- 🔒 No recording functionality (live communication only)

---

## 🎯 Feature Highlights

### **Accessibility for All Ages**
The voice chat system is designed to be **senior-friendly**:
- ✅ Large, clear buttons
- ✅ High contrast visual indicators
- ✅ Simple on/off toggles (no complex settings required)
- ✅ Text chat as backup if voice doesn't work
- ✅ Auto-detection of devices (no manual configuration needed)
- ✅ Persistent settings (set once, works every time)

### **Professional Casino Experience**
- ✅ Players can chat and celebrate wins together
- ✅ Build community and friendships
- ✅ Call out bets like in a real casino
- ✅ Social interaction enhances the gambling experience
- ✅ Reduced isolation for solo players

### **Admin Moderation**
- ✅ All player reports stored in database
- ✅ Admins can review reports from dashboard
- ✅ Timestamps and full context provided
- ✅ Bug reports help improve the platform
- ✅ Automatic abuse detection (future enhancement)

---

## 📱 User Interface

### **Minimized View**
```
┌────────────────┐
│ 🎤  💬(2)  👥3 │  ← Collapsed state
└────────────────┘
```

### **Expanded Voice Tab**
```
┌─────────────────────────┐
│ 🔊 Voice    💬 Chat     │  ← Tab switcher
├─────────────────────────┤
│ ⚙️ Mic: Headset        │  ← Device settings
│    🔊 Out: Speakers     │
├─────────────────────────┤
│ 🎤 You (speaking)       │  ← Current user
│ 🎤 Player2  🔊 🚩      │  ← Other players
│ 🔇 Player3  🔊 🚩      │     with controls
└─────────────────────────┘
```

### **Expanded Chat Tab**
```
┌─────────────────────────┐
│ 🔊 Voice    💬 Chat     │
├─────────────────────────┤
│ Player1: Good roll!     │
│ You: Thanks!            │
│ Player2: Let's go! 🎲  │
├─────────────────────────┤
│ Type message...    Send │
└─────────────────────────┘
```

---

## 🚀 Current Status

### ✅ **FULLY IMPLEMENTED & WORKING**
All voice chat features are 100% production-ready and functional:

- ✅ WebRTC peer-to-peer voice communication
- ✅ Microphone and speaker device selection
- ✅ Individual player mute controls
- ✅ Visual speaking indicators
- ✅ Text chat integration
- ✅ Report system (players and bugs)
- ✅ Device hot-swapping
- ✅ Persistent settings storage
- ✅ Error handling and graceful degradation
- ✅ Mobile and desktop support
- ✅ Senior/accessibility friendly UI

### 🎮 **How to Test**

1. Open two browser windows (or use two devices)
2. Log in as different users in each
3. Create a multiplayer lobby in one window
4. Join the lobby from the second window
5. Grant microphone permission in both
6. Click the mic button to enable your microphone
7. Start talking - you should hear each other!
8. Test muting individual players
9. Switch devices in Settings

---

## 💡 Tips for Best Experience

### **For Players**
- 🎧 **Use headphones** to prevent echo and feedback
- 🎤 **Position your mic** properly (not too close, avoid breathing sounds)
- 🔊 **Adjust volume** in Settings if others are too loud/quiet
- 🙊 **Mute when not talking** in noisy environments
- 💬 **Use text chat** as backup if voice quality is poor

### **For Admins**
- 📊 Monitor player reports regularly
- 🚫 Take action on abusive players
- 🐛 Review bug reports to improve the platform
- 📢 Communicate with players about known issues
- ⚖️ Enforce community guidelines fairly

---

## 🎉 Summary

The **Rollers Paradise voice chat system** is a complete, professional-grade communication solution that:

✅ **Works out of the box** - No complex setup required  
✅ **Gives users full control** - Mute anyone, switch devices, minimize panel  
✅ **Protects privacy** - All audio is peer-to-peer, no recording  
✅ **Accessible to all ages** - Simple, clear interface  
✅ **Moderator-friendly** - Comprehensive reporting system  
✅ **Production-ready** - Fully tested and deployed  

Players can now enjoy a **truly social casino experience**, talking and celebrating together while playing crapless craps - just like in a real casino! 🎲🎉
