import { useState, useEffect, lazy, Suspense } from 'react';
import { CrapsGame } from './components/CrapsGame';
import { TropicalDecorations } from './components/TropicalDecorations';
import { GameIntro } from './components/GameIntro';
import { CasinoHomeScreen } from './components/CasinoHomeScreen';
import { PasswordResetPage } from './components/PasswordResetPage';
import { LoadTestingDashboard } from './components/LoadTestingDashboard';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import { SoundProvider } from './contexts/SoundContext';
import { ProgressionProvider } from './contexts/ProgressionContext';
import { DailyRewardsProvider } from './contexts/DailyRewardsContext';
import { VIPProvider } from './contexts/VIPContext';
import { DailyChallengesProvider } from './contexts/DailyChallengesContext';
import { LoyaltyPointsProvider } from './contexts/LoyaltyPointsContext';
import { HandHistoryProvider } from './contexts/HandHistoryContext';
import { XPBoostProvider } from './contexts/XPBoostContext';
import { BoostInventoryProvider, useBoostInventory } from './contexts/BoostInventoryContext';
import { MembershipProvider } from './contexts/MembershipContext';
import { NotificationProvider, useNotification } from './components/NotificationSystem';
import { MusicPlayer } from './components/MusicPlayer';
import { Toaster } from './components/ui/sonner';
import { detectDeviceCapabilities, applyRecommendedSettings, enterFullscreen } from './utils/deviceDetection';
import { ConnectionStatus } from './components/ConnectionStatus';
import { SimpleErrorBoundary } from './components/SimpleErrorBoundary';
import { initializeErrorTracking } from './utils/simpleErrorReporter';
import { handlePaymentReturn, cleanupPaymentUrl } from './utils/paymentSuccessHandler';
import { ViewportController } from './components/ViewportController';
import { ErrorReportModal } from './components/ErrorReportModal';
import { ErrorDetails } from './utils/errorCodes';
import { DeviceConsentModal } from './components/DeviceConsentModal';
import { hasDeviceConsent, type DeviceInfo } from './utils/deviceDetection';
import { OptimalSettingsApplicator } from './components/OptimalSettingsApplicator';
import { trackWebVitals } from './utils/performanceOptimization';
import { 
  SettingsLoadingFallback, 
  ModalLoadingFallback, 
  CompactLoadingFallback 
} from './components/LazyLoadWrapper';
import { AdminErrorReports } from './components/AdminErrorReports';
import { QuickErrorCheck } from './components/QuickErrorCheck';
import { FriendsListManager } from './components/FriendsListManager';

// ⚡ PERFORMANCE OPTIMIZATION: Lazy load heavy components
// These components are loaded only when needed, reducing initial bundle size
const GameSettings = lazy(() => import('./components/GameSettings'));
const PlaylistSettings = lazy(() => import('./components/PlaylistSettings'));
const PermissionRequest = lazy(() => import('./components/PermissionRequest'));
const FullscreenToggle = lazy(() => import('./components/FullscreenToggle'));
const LeaderboardModal = lazy(() => import('./components/LeaderboardModal'));
const NotificationCenter = lazy(() => import('./components/NotificationCenter'));
const ActiveBoostsDisplay = lazy(() => import('./components/ActiveBoostsDisplay'));
const BoostInventory = lazy(() => import('./components/BoostInventory'));
const RewardNotification = lazy(() => import('./components/RewardNotification'));
const InteractiveTutorial = lazy(() => import('./components/InteractiveTutorial').then(m => ({ default: m.InteractiveTutorial })));

// Initialize performance tracking
if (typeof window !== 'undefined') {
  trackWebVitals();
}

function AppContent() {
  const { settings } = useSettings();
  const { addBoostCard } = useBoostInventory();
  const notification = useNotification();
  const [showIntro, setShowIntro] = useState(false); // Changed to false - no intro
  const [hasSeenIntro, setHasSeenIntro] = useState(true); // Changed to true - always skip intro
  const [showHomeScreen, setShowHomeScreen] = useState(true);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showBoostInventory, setShowBoostInventory] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [profile, setProfile] = useState<{ name: string; email: string; avatar?: string } | null>(null);
  const [testResetData, setTestResetData] = useState<{ token: string; email: string } | null>(null);
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);
  const [hasAcceptedPermissions, setHasAcceptedPermissions] = useState(false);
  const [authMode, setShowAuthMode] = useState<'login' | 'signup'>('login');
  const [errorReportDetails, setErrorReportDetails] = useState<ErrorDetails | null>(null);
  const [showLoadTesting, setShowLoadTesting] = useState(false);
  
  // 🚨 DEVICE CONSENT - REQUIRED FOR LEGAL COMPLIANCE
  const [hasDeviceConsentState, setHasDeviceConsentState] = useState<boolean>(false);
  const [showDeviceConsent, setShowDeviceConsent] = useState<boolean>(false);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  // 🎓 AUTO-SHOW TUTORIAL for new players
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('tutorial-completed');
    const tutorialSkipped = localStorage.getItem('tutorial-skipped');
    
    // Only auto-show if user hasn't completed OR skipped the tutorial
    if (!tutorialCompleted && !tutorialSkipped) {
      // Show tutorial after a brief delay so home screen renders first
      const timer = setTimeout(() => {
        console.log('🎓 First-time player detected - showing tutorial');
        setShowTutorial(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []); // Run once on mount

  // ♿ Apply accessibility settings from GameSettings
  // NOTE: This works alongside AccessibilityHelper without conflicts
  // Both systems use the same CSS properties, so the last one applied wins
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    console.log('♿ ===== ACCESSIBILITY SETTINGS (GameSettings) =====');
    console.log('Large Text:', settings.largeText ? 'ENABLED (112%)' : 'disabled');
    console.log('High Contrast:', settings.highContrast ? 'ENABLED (1.5x)' : 'disabled');
    console.log('Color Blind Mode:', settings.colorBlindMode || 'none');
    console.log('Screen Reader:', settings.screenReader ? 'ENABLED' : 'disabled');
    console.log('====================================================');

    // Large Text Mode - Increase text size ONLY (not images/buttons)
    if (settings.largeText) {
      // Apply 12% increase to base font size - ONLY affects text, not images/layout
      // This is a safe, tested value that improves readability without breaking layouts
      root.style.fontSize = '112%';
      root.classList.add('large-text-mode');
      console.log('✅ Large text enabled: Root fontSize = 112% (text only)');
      console.log('   ✓ Images stay the same size');
      console.log('   ✓ Buttons and controls stay the same size');
      console.log('   ✓ Layout remains stable and functional');
      
      // Show helpful info notification (only once per session)
      const hasSeenLargeTextInfo = sessionStorage.getItem('large-text-info-shown');
      if (!hasSeenLargeTextInfo) {
        sessionStorage.setItem('large-text-info-shown', 'true');
        console.log('ℹ️ Large Text Mode increases text size by 12% without affecting images or layout');
      }
    } else {
      root.style.fontSize = '100%';
      root.classList.remove('large-text-mode');
      console.log('ℹ️ Large text disabled: Root fontSize = 100%');
    }

    // High Contrast Mode - Increase contrast for better visibility
    if (settings.highContrast) {
      root.style.setProperty('--contrast-multiplier', '1.5');
      root.classList.add('high-contrast-mode');
      console.log('✅ High contrast enabled: 1.5x contrast');
    } else {
      root.style.removeProperty('--contrast-multiplier');
      root.classList.remove('high-contrast-mode');
    }

    // Color Blind Mode - Apply appropriate filters
    if (settings.colorBlindMode && settings.colorBlindMode !== 'none') {
      root.classList.add('color-blind-mode');
      root.setAttribute('data-color-blind-mode', settings.colorBlindMode);
      
      // Apply SVG filters for color blind modes
      const filters: Record<string, string> = {
        protanopia: 'url(#protanopia-filter)',
        deuteranopia: 'url(#deuteranopia-filter)',
        tritanopia: 'url(#tritanopia-filter)',
      };
      
      if (filters[settings.colorBlindMode]) {
        body.style.filter = filters[settings.colorBlindMode];
        console.log(`✅ Color blind mode enabled: ${settings.colorBlindMode}`);
      }
    } else {
      root.classList.remove('color-blind-mode');
      root.removeAttribute('data-color-blind-mode');
      body.style.filter = '';
    }

    // Screen Reader Mode - Enhanced accessibility
    if (settings.screenReader) {
      root.classList.add('screen-reader-mode');
      console.log('✅ Screen reader mode enabled');
    } else {
      root.classList.remove('screen-reader-mode');
    }

  }, [settings.largeText, settings.highContrast, settings.colorBlindMode, settings.screenReader]);

  // 🔧 DEBUG: Add window function to test password reset
  useEffect(() => {
    // Test function for password reset flow (development only)
    if (process.env.NODE_ENV === 'development') {
      (window as any).testPasswordReset = () => {
        setTestResetData({
          token: 'test-token-12345',
          email: 'test@example.com'
        });
        setShowPasswordReset(true);
        setShowIntro(false);
        setHasSeenIntro(true);
        setShowPermissionRequest(false);
        setHasAcceptedPermissions(true);
      };
    }
  }, []);

  // Music player state - 🔇 MUSIC OFF BY DEFAULT (User must enable)
  const [musicVolume, setMusicVolume] = useState(0.7); // DEFAULT TO 70% VOLUME
  const [musicEnabled, setMusicEnabled] = useState(false); // 🔇 MUSIC OFF BY DEFAULT!
  const [customPlaylists, setCustomPlaylists] = useState<string[]>(['https://www.youtube.com/watch?v=TSA6GD9MioM']); // DEFAULT BACKGROUND MUSIC
  const [showPlaylistSettings, setShowPlaylistSettings] = useState(false);
  const [showMusicPlayer, setShowMusicPlayer] = useState(true); // Always visible

  // 🚨 Initialize simple error reporting for AI assistant
  useEffect(() => {
    initializeErrorTracking();

    console.log('%c🤖 AI ERROR REPORTING', 'color: #3b82f6; font-size: 18px; font-weight: bold;');
    console.log('%c✅ Initialized', 'color: #10b981; font-weight: bold;');
    console.log('%cErrors are sent to Supabase for AI assistant to review', 'color: #8b5cf6;');
    console.log('  • Automatic error capture');
    console.log('  • Stored in Supabase: ai_error_reports table');
    console.log('  • Ask AI: "Check error reports" to see and fix errors');
    console.log('─'.repeat(60));
  }, []);

  // 📧 Global Error Report Modal Handler
  useEffect(() => {
    const handleShowErrorReport = (event: any) => {
      const errorDetails: ErrorDetails = event.detail;
      console.log('📧 Showing error report modal for:', errorDetails.code);
      setErrorReportDetails(errorDetails);
    };

    window.addEventListener('show-error-report-modal', handleShowErrorReport);

    return () => {
      window.removeEventListener('show-error-report-modal', handleShowErrorReport);
    };
  }, []);

  useEffect(() => {
    const checkPaymentAndInit = async () => {
      // Check for password reset parameters FIRST
      const urlParams = new URLSearchParams(window.location.search);
      
      // Also check hash parameters (Figma might use # instead of ?)
      const hashParams = new URLSearchParams(window.location.hash.replace('#', ''));
      
      const resetToken = urlParams.get('resetToken') || hashParams.get('resetToken');
      const resetEmail = urlParams.get('resetEmail') || hashParams.get('resetEmail');
      
      if (resetToken && resetEmail) {
        setShowPasswordReset(true);
        setShowIntro(false);
        setHasSeenIntro(true);
        setShowHomeScreen(false);
        return; // Skip all other checks
      }

      // CHECK FOR LOAD TESTING DASHBOARD ROUTE
      if (urlParams.get('loadtest') === 'true' || window.location.hash === '#loadtest') {
        console.log('🔧 Loading Load Testing Dashboard');
        setShowLoadTesting(true);
        setShowIntro(false);
        setHasSeenIntro(true);
        setShowHomeScreen(false);
        return; // Skip all other checks
      }

      // CHECK FOR PAYMENT RETURN - Restore session and update data after payment
      const isPaymentReturn = await handlePaymentReturn(
        urlParams,
        hashParams,
        profile,
        (newBalance) => {
          // Update balance in CrapsGame via profile update
          const updatedProfile = { ...profile, chips: newBalance };
          setProfile(updatedProfile);
          localStorage.setItem('casino_user', JSON.stringify(updatedProfile));
        },
        (updatedProfile) => {
          // Update entire profile
          setProfile(updatedProfile);
          localStorage.setItem('casino_user', JSON.stringify(updatedProfile));
        }
      );
      
      if (isPaymentReturn) {
        console.log('💳 Returning from payment flow - data updated!');
        
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
        
        // Clean up session storage
        try {
          sessionStorage.removeItem('returnPath');
          sessionStorage.removeItem('purchaseInProgress');
          sessionStorage.removeItem('purchaseDetails');
        } catch (e) {
          console.warn('Could not clean up session storage:', e);
        }
        
        // Clean up URL parameters
        cleanupPaymentUrl();
        
        // Skip intro and permissions check - go straight to game
        setShowIntro(false);
        setHasSeenIntro(true);
        setHasAcceptedPermissions(true);
        setShowHomeScreen(false); // Skip home screen, go directly to game
        
        return; // Skip other checks
      }

      // 🚨 CHECK DEVICE CONSENT - REQUIRED FOR LEGAL COMPLIANCE
      const deviceConsentGiven = hasDeviceConsent();
      console.log('🔒 Checking device consent:', deviceConsentGiven);
      
      if (deviceConsentGiven) {
        console.log('✅ Device consent already given');
        setHasDeviceConsentState(true);
        setShowDeviceConsent(false);
      } else {
        console.log('⚠️ Device consent NOT given - REQUIRED to play');
        setHasDeviceConsentState(false);
        setShowDeviceConsent(true); // Show immediately - required!
        return; // Don't continue until consent is given
      }

      // CHECK PERMISSIONS ACCEPTANCE - CRITICAL FIRST CHECK
      const permissionsAccepted = localStorage.getItem('permissionsAccepted');
      console.log('🔒 Checking permissions acceptance:', permissionsAccepted);
      
      if (permissionsAccepted === 'true') {
        console.log('✅ Permissions already accepted');
        setHasAcceptedPermissions(true);
        setShowPermissionRequest(false);
      } else {
        console.log('⚠️ Permissions NOT accepted - will show modal after intro');
        setHasAcceptedPermissions(false);
      }
      
      // Check if user has seen intro this session
      const seenIntro = sessionStorage.getItem('hasSeenIntro');
      if (seenIntro === 'true') {
        setShowIntro(false);
        setHasSeenIntro(true);
        
        // If they haven't accepted permissions, show it immediately
        if (permissionsAccepted !== 'true') {
          setShowPermissionRequest(true);
        }
      }

      // Check for URL parameters (other modes)
      const mode = urlParams.get('mode');
      
      // If there's a mode parameter (reset-password, etc.), skip intro and go to auth
      if (mode) {
        console.log('🔗 Detected URL mode:', mode);
        setShowIntro(false);
        setHasSeenIntro(true);
        setShowHomeScreen(false); // Go directly to game screen which shows auth
        setShowAuthPrompt(true); // FORCE SHOW AUTH MODAL
      }

      // Check for saved profile
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        try {
          setProfile(JSON.parse(savedProfile));
        } catch (e) {
          console.error('Failed to load profile:', e);
        }
      }
    };

    // Call the async function
    checkPaymentAndInit();
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setShowIntro(false);
    setHasSeenIntro(true);
    
    // Check if they've already accepted permissions
    const permissionsAccepted = localStorage.getItem('permissionsAccepted');
    if (permissionsAccepted !== 'true') {
      // Show permission request if not already accepted
      setShowPermissionRequest(true);
    }
  };

  const handlePermissionsComplete = async (permissions: { audio: boolean; fullscreen: boolean }) => {
    console.log('✅ Permissions granted:', permissions);
    
    // 🖥️ DETECT DEVICE CAPABILITIES AND APPLY OPTIMAL SETTINGS
    console.log('🔍 Detecting device capabilities...');
    const deviceCapabilities = detectDeviceCapabilities();
    const recommendedSettings = applyRecommendedSettings(deviceCapabilities);
    console.log('✅ Device optimized with recommended settings:', recommendedSettings);
    
    // Save to localStorage (already done in PermissionRequest component)
    localStorage.setItem('permissionsAccepted', 'true');
    localStorage.setItem('permissionsAcceptedDate', new Date().toISOString());
    
    // If user is logged in, save to server (Supabase)
    if (profile && profile.email) {
      try {
        console.log('💾 Saving permissions acceptance and device info to server...');
        const { data, error } = await supabase
          .from('players')
          .update({ 
            permissions_accepted: true,
            permissions_accepted_date: new Date().toISOString(),
            device_capabilities: deviceCapabilities,
            recommended_settings: recommendedSettings
          })
          .eq('email', profile.email);
        
        if (error) {
          console.error('❌ Error saving to server:', error);
        } else {
          console.log('✅ Permissions and device info saved to server successfully');
        }
      } catch (err) {
        console.error('❌ Exception saving to server:', err);
      }
    }
    
    setShowPermissionRequest(false);
    setHasAcceptedPermissions(true);
    // Continue to home screen
  };

  const handlePermissionsQuit = async () => {
    console.log('❌ User declined permissions - exiting game');
    // Show a farewell message and close the window/tab
    const confirmed = await notification.showConfirm({
      title: 'Leave Rollers Paradise?',
      message: 'Are you sure you want to leave? The game requires these permissions to function properly.',
      confirmText: 'Leave',
      cancelText: 'Stay',
      type: 'warning'
    });
    
    if (confirmed) {
      // Try to close the window/tab
      window.close();
      
      // If window.close() doesn't work (can only close windows opened by script),
      // redirect to a blank page or show a goodbye message
      setTimeout(() => {
        document.body.innerHTML = `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #14532d 0%, #15803d 30%, #16a34a 60%, #15803d 100%);
            font-family: system-ui, -apple-system, sans-serif;
            color: #fef3c7;
            text-align: center;
            padding: 20px;
          ">
            <div style="
              background: rgba(0, 0, 0, 0.5);
              padding: 60px 40px;
              border-radius: 20px;
              border: 4px solid #fbbf24;
              box-shadow: 0 0 80px rgba(251, 191, 36, 0.6);
            ">
              <h1 style="
                font-size: 48px;
                margin-bottom: 20px;
                text-shadow: 0 0 20px rgba(251, 191, 36, 0.8);
              ">Thank You for Visiting! 👋</h1>
              <p style="
                font-size: 24px;
                margin-bottom: 30px;
                color: #fde047;
              ">We hope to see you again at Rollers Paradise!</p>
              <p style="
                font-size: 18px;
                color: #86efac;
              ">You can close this tab now.</p>
            </div>
          </div>
        `;
      }, 100);
    }
  };

  const handleStartGame = () => {
    // Require authentication
    if (!profile) {
      setShowAuthPrompt(true);
      return;
    }
    setShowHomeScreen(false);
  };

  const handleShowAuth = () => {
    // Clear any existing profile to force login screen
    localStorage.removeItem('rollers-paradise-profile');
    setProfile(null);
    // Go to game which will show the login screen
    setShowHomeScreen(false);
  };

  const handleShowCreateAccount = () => {
    // Clear any existing profile to force signup screen
    localStorage.removeItem('rollers-paradise-profile');
    setProfile(null);
    // Go directly to signup mode - set flag for CrapsGame to read
    sessionStorage.setItem('auth-mode', 'signup');
    setShowHomeScreen(false);
  };

  const handleLogin = (userProfile: { name: string; email: string; avatar?: string }) => {
    setProfile(userProfile);
    localStorage.setItem('userProfile', JSON.stringify(userProfile));
    console.log('✅ User profile saved to localStorage');
    setShowAuthPrompt(false);
  };

  const handleLogout = async () => {
    // Check if user wants to keep "Remember Me" active
    const savedCredentials = localStorage.getItem('rollers-paradise-credentials');
    let keepCredentials = false;
    
    if (savedCredentials) {
      keepCredentials = await notification.showConfirm({
        title: 'Keep Login Saved?',
        message: 'Would you like to keep your login saved for next time?',
        confirmText: 'Keep Saved',
        cancelText: 'Forget Me',
        type: 'info'
      });
      
      if (!keepCredentials) {
        localStorage.removeItem('rollers-paradise-credentials');
        console.log('❌ Saved credentials cleared on logout');
      } else {
        console.log('✅ Saved credentials kept for next login');
      }
    }
    
    setProfile(null);
    localStorage.removeItem('userProfile');
    setShowHomeScreen(true);
  };

  // 🚨 Device Consent Handlers - REQUIRED FOR LEGAL COMPLIANCE
  const handleDeviceConsent = (deviceInfoData: DeviceInfo) => {
    console.log('✅ Device consent given:', deviceInfoData);
    setDeviceInfo(deviceInfoData);
    setHasDeviceConsentState(true);
    setShowDeviceConsent(false);
    
    // Continue with app initialization
    setShowPermissionRequest(!hasAcceptedPermissions);
  };

  const handleDeviceConsentDecline = () => {
    console.log('❌ Device consent declined - cannot play');
    // Show message and exit
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-center;
        min-height: 100vh;
        background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 30%, #b91c1c 60%, #991b1b 100%);
        font-family: system-ui, -apple-system, sans-serif;
        color: #fef3c7;
        text-align: center;
        padding: 20px;
      ">
        <div style="
          background: rgba(0, 0, 0, 0.5);
          padding: 60px 40px;
          border-radius: 20px;
          border: 4px solid #ef4444;
          box-shadow: 0 0 80px rgba(239, 68, 68, 0.6);
          max-width: 600px;
        ">
          <div style="font-size: 80px; margin-bottom: 20px;">⚠️</div>
          <h1 style="
            font-size: 36px;
            margin-bottom: 20px;
            text-shadow: 0 0 20px rgba(239, 68, 68, 0.8);
          ">Device Verification Required</h1>
          <p style="
            font-size: 20px;
            margin-bottom: 30px;
            color: #fde047;
          ">To comply with gaming regulations, we are <strong>required by law</strong> to verify your device before you can play.</p>
          <p style="
            font-size: 18px;
            color: #86efac;
            margin-bottom: 20px;
          ">This is mandatory for:</p>
          <ul style="
            text-align: left;
            font-size: 16px;
            color: #fde68a;
            margin: 0 auto 30px;
            max-width: 400px;
          ">
            <li style="margin-bottom: 10px;">✓ Legal compliance</li>
            <li style="margin-bottom: 10px;">✓ Fraud prevention</li>
            <li style="margin-bottom: 10px;">✓ Fair play enforcement</li>
            <li style="margin-bottom: 10px;">✓ Account security</li>
          </ul>
          <p style="
            font-size: 16px;
            color: #fed7aa;
          ">You can close this tab now or refresh to try again.</p>
        </div>
      </div>
    `;
  };

  // Settings state and handler
  const [showSettings, setShowSettings] = useState(false);

  const handleShowSettings = () => {
    setShowSettings(true);
  };

  // Get balance from CrapsGame if needed
  const [balance, setBalance] = useState(1000);

  // Sync MusicPlayer volume with settings in real-time
  useEffect(() => {
    // Calculate music volume from settings: masterVolume * musicVolume (both 0-100)
    const actualVolume = (settings.masterVolume / 100) * (settings.musicVolume / 100);
    setMusicVolume(actualVolume);
    setMusicEnabled(settings.backgroundMusic);
    console.log(`🎵 Music volume synced from settings: ${Math.round(actualVolume * 100)}%`);
  }, [settings.masterVolume, settings.musicVolume, settings.backgroundMusic]);

  // Listen for VIP boost card rewards
  useEffect(() => {
    const handleBoostRewards = (event: any) => {
      const { rewards, plan } = event.detail;
      console.log(`🎁 Receiving VIP boost rewards for ${plan} plan:`, rewards);
      
      rewards.forEach((reward: { type: string; quantity: number }) => {
        addBoostCard(reward.type, reward.quantity);
      });
    };

    const handleMembershipBoostRewards = (event: any) => {
      const { rewards, tier, duration } = event.detail;
      console.log(`🎁 Receiving ${tier} ${duration} membership boost rewards:`, rewards);
      
      rewards.forEach((reward: { type: string; quantity: number }) => {
        addBoostCard(reward.type, reward.quantity);
      });
    };

    window.addEventListener('vip-boost-rewards', handleBoostRewards);
    window.addEventListener('membership-boost-rewards', handleMembershipBoostRewards);
    return () => {
      window.removeEventListener('vip-boost-rewards', handleBoostRewards);
      window.removeEventListener('membership-boost-rewards', handleMembershipBoostRewards);
    };
  }, [addBoostCard]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gray-900">
      {/* 🚨 DEVICE CONSENT MODAL - REQUIRED FOR LEGAL COMPLIANCE */}
      {showDeviceConsent && (
        <DeviceConsentModal
          onConsent={handleDeviceConsent}
          onDecline={handleDeviceConsentDecline}
        />
      )}

      {/* Desktop Mode Helper - Shows instructions for mobile users */}
      <ViewportController />
      
      {/* 🎯 Auto-Apply Optimal Settings Based on Device */}
      {hasDeviceConsentState && <OptimalSettingsApplicator />}
      
      {/* SVG Filters for Color Blind Modes */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <defs>
          {/* Protanopia (Red-Blind) Filter */}
          <filter id="protanopia-filter">
            <feColorMatrix type="matrix" values="
              0.567, 0.433, 0,     0, 0
              0.558, 0.442, 0,     0, 0
              0,     0.242, 0.758, 0, 0
              0,     0,     0,     1, 0
            "/>
          </filter>
          
          {/* Deuteranopia (Green-Blind) Filter */}
          <filter id="deuteranopia-filter">
            <feColorMatrix type="matrix" values="
              0.625, 0.375, 0,   0, 0
              0.7,   0.3,   0,   0, 0
              0,     0.3,   0.7, 0, 0
              0,     0,     0,   1, 0
            "/>
          </filter>
          
          {/* Tritanopia (Blue-Blind) Filter */}
          <filter id="tritanopia-filter">
            <feColorMatrix type="matrix" values="
              0.95, 0.05,  0,     0, 0
              0,    0.433, 0.567, 0, 0
              0,    0.475, 0.525, 0, 0
              0,    0,     0,     1, 0
            "/>
          </filter>
        </defs>
      </svg>

      {/* Connection Status Monitor */}
      <ConnectionStatus />
      
      {/* Notification System */}
      <Suspense fallback={null}>
        <NotificationCenter enabled={true} />
      </Suspense>
      
      {/* Active XP Boosts Display */}
      {profile && (
        <Suspense fallback={<CompactLoadingFallback />}>
          <ActiveBoostsDisplay />
        </Suspense>
      )}
      
      {/* Leaderboard Reward Notifications */}
      {profile?.email && (
        <Suspense fallback={null}>
          <RewardNotification playerEmail={profile.email} />
        </Suspense>
      )}
      
      {/* Admin Error Reports Viewer - Access with ?admin-reports=true or Ctrl+Shift+Alt+R */}
      <AdminErrorReports />
      
      {/* Quick Error Check - Access with ?check-errors */}
      <QuickErrorCheck />
      
      {/* Friends List & Admin Access Manager - Only for Owner (Ruski) */}
      <FriendsListManager isOwner={profile?.email === 'avgelatt@gmail.com'} />
      
      {/* Toast Container */}
      <Toaster 
        position="top-right" 
        richColors 
        expand={false}
        theme="dark"
      />


      
      {/* MUSIC PLAYER - ALWAYS VISIBLE ON ALL PAGES */}
      {!showIntro && (
        <>
          <MusicPlayer
            musicVolume={musicVolume}
            setMusicVolume={setMusicVolume}
            musicEnabled={musicEnabled}
            setMusicEnabled={setMusicEnabled}
            customPlaylists={customPlaylists}
            onOpenPlaylistSettings={() => setShowPlaylistSettings(true)}
            isVisible={showMusicPlayer}
            onToggleVisibility={() => setShowMusicPlayer(!showMusicPlayer)}
          />

          <Suspense fallback={<SettingsLoadingFallback />}>
            <PlaylistSettings
              isOpen={showPlaylistSettings}
              onClose={() => setShowPlaylistSettings(false)}
              playlists={customPlaylists}
              onUpdatePlaylists={setCustomPlaylists}
            />
          </Suspense>
        </>
      )}

      {/* Show intro on first load */}
      {showIntro && <GameIntro onComplete={handleIntroComplete} />}

      {/* Show home screen if not playing yet */}
      {!showIntro && showHomeScreen && (
        <CasinoHomeScreen
          onStartGame={handleStartGame}
          onShowAuth={handleShowAuth}
          onShowCreateAccount={handleShowCreateAccount}
          onSwitchUser={handleLogout}
          onShowSettings={handleShowSettings}
          onShowLeaderboard={() => setShowLeaderboard(true)}
          isLoggedIn={!!profile}
          playerName={profile?.name}
          balance={balance}
          playerEmail={profile?.email}
        />
      )}

      {/* Show game once user starts playing - NO BACKGROUND, JUST TABLE */}
      {!showIntro && !showHomeScreen && !showPasswordReset && !showLoadTesting && (
        <div className="relative z-10">
          <SimpleErrorBoundary>
            <CrapsGame />
          </SimpleErrorBoundary>
        </div>
      )}

      {/* Show password reset page if needed */}
      {showPasswordReset && (
        <PasswordResetPage
          onComplete={() => {
            setShowPasswordReset(false);
            setShowHomeScreen(true);
          }}
          testResetData={testResetData}
        />
      )}

      {/* Show load testing dashboard if requested */}
      {showLoadTesting && (
        <LoadTestingDashboard />
      )}

      {/* Show permission request if needed */}
      {showPermissionRequest && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <PermissionRequest
            isOpen={showPermissionRequest}
            onComplete={handlePermissionsComplete}
            onQuit={handlePermissionsQuit}
          />
        </Suspense>
      )}

      {/* Game Settings Modal */}
      {showSettings && (
        <Suspense fallback={<SettingsLoadingFallback />}>
          <GameSettings
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            onSave={(settings) => {
              console.log('Settings saved:', settings);
              // Settings are handled by SettingsContext
              // Don't close modal here - let GameSettings component handle modal closing
            }}
            onShowTutorial={() => {
              setShowTutorial(true);
              setShowSettings(false); // Close settings when opening tutorial
            }}
          />
        </Suspense>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <LeaderboardModal
            onClose={() => setShowLeaderboard(false)}
            currentPlayerEmail={profile?.email}
          />
        </Suspense>
      )}

      {/* Boost Inventory Modal */}
      <Suspense fallback={<ModalLoadingFallback />}>
        <BoostInventory 
          isOpen={showBoostInventory}
          onClose={() => setShowBoostInventory(false)}
        />
      </Suspense>

      {/* Interactive Tutorial Modal */}
      {showTutorial && (
        <Suspense fallback={<ModalLoadingFallback />}>
          <InteractiveTutorial
            isOpen={showTutorial}
            onClose={() => setShowTutorial(false)}
            onComplete={() => {
              setShowTutorial(false);
              console.log('✅ Tutorial completed!');
            }}
          />
        </Suspense>
      )}

      {/* Global Error Report Modal - Shows anywhere, anytime */}
      {errorReportDetails && (
        <ErrorReportModal
          errorDetails={errorReportDetails}
          onClose={() => setErrorReportDetails(null)}
          onReportSent={() => {
            setErrorReportDetails(null);
            console.log('✅ Error report sent successfully');
          }}
        />
      )}

      {/* Floating Boost Inventory Button - Only show when logged in */}
      {profile && !showHomeScreen && (
        <button
          onClick={() => setShowBoostInventory(true)}
          className="fixed bottom-6 left-6 z-[9998] p-4 rounded-full shadow-2xl transition-all hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, #9333ea, #7c3aed)',
            borderWidth: '3px',
            borderColor: '#fbbf24',
            boxShadow: '0 0 30px rgba(147, 51, 234, 0.6), 0 10px 40px rgba(0, 0, 0, 0.5)',
          }}
        >
          <span className="text-4xl">🎴</span>
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <SettingsProvider>
        <SoundProvider>
          <VIPProvider>
            <MembershipProvider>
              <XPBoostProvider>
                <BoostInventoryProvider>
                  <ProgressionProvider>
                    <DailyRewardsProvider>
                      <DailyChallengesProvider>
                        <LoyaltyPointsProvider>
                          <HandHistoryProvider>
                            <AppContent />
                          </HandHistoryProvider>
                        </LoyaltyPointsProvider>
                      </DailyChallengesProvider>
                    </DailyRewardsProvider>
                  </ProgressionProvider>
                </BoostInventoryProvider>
              </XPBoostProvider>
            </MembershipProvider>
          </VIPProvider>
        </SoundProvider>
      </SettingsProvider>
    </NotificationProvider>
  );
}