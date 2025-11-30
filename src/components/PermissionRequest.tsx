import { useState } from 'react';
import { PrivacyPolicy } from './PrivacyPolicy';
import { ResponsibleGaming } from './ResponsibleGaming';
import { TermsOfService } from './TermsOfService';

interface PermissionRequestProps {
  isOpen: boolean;
  onComplete: (permissions: { audio: boolean; fullscreen: boolean }) => void;
  onQuit?: () => void;
}

// Simple SVG icons to replace lucide-react
const PlayIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

export function PermissionRequest({ isOpen, onComplete, onQuit }: PermissionRequestProps) {
  const [audioGranted, setAudioGranted] = useState(false);
  const [fullscreenGranted, setFullscreenGranted] = useState(false);
  const [fullscreenAvailable, setFullscreenAvailable] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [disagreedToTerms, setDisagreedToTerms] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [showResponsibleGaming, setShowResponsibleGaming] = useState(false);
  const [showTermsOfService, setShowTermsOfService] = useState(false);

  if (!isOpen) return null;

  const handleAgreeChange = (checked: boolean) => {
    if (checked) {
      setAgreedToTerms(true);
      setDisagreedToTerms(false);
    } else {
      setAgreedToTerms(false);
    }
  };

  const handleDisagreeChange = (checked: boolean) => {
    if (checked) {
      setDisagreedToTerms(true);
      setAgreedToTerms(false);
    } else {
      setDisagreedToTerms(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    // Increased threshold to 100px to trigger earlier
    const scrolledToBottom = element.scrollHeight - element.scrollTop <= element.clientHeight + 100;
    if (scrolledToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
      console.log('✅ User scrolled to bottom of agreement');
    }
  };

  const requestPermissions = async () => {
    console.log('🔍 requestPermissions called');
    console.log('  - agreedToTerms:', agreedToTerms);
    console.log('  - hasScrolledToBottom:', hasScrolledToBottom);
    
    if (!agreedToTerms || !hasScrolledToBottom) {
      console.log('❌ Cannot proceed - must agree to terms and scroll to bottom');
      return;
    }

    setIsRequesting(true);
    console.log('🎰 Starting game...');
    console.log('💾 Saving permissions to localStorage...');

    setTimeout(() => {
      localStorage.setItem('permissionsAccepted', 'true');
      localStorage.setItem('permissionsAcceptedDate', new Date().toISOString());
      console.log('✅ Terms accepted and saved to localStorage');
      
      setAudioGranted(true);
      setFullscreenGranted(true);
      
      console.log('✅ Calling onComplete - entering game!');
      onComplete({
        audio: true,
        fullscreen: true,
      });
    }, 500);
  };

  const skipPermissions = () => {
    onComplete({
      audio: false,
      fullscreen: false,
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" />

      {/* Permission modal */}
      <div
        className="relative w-[95vw] h-[95vh] transition-all duration-300"
        style={{ opacity: 1, transform: 'scale(1)' }}
      >
        <div
          className="rounded-3xl border-4 shadow-2xl overflow-hidden h-full flex flex-col"
          style={{
            background: 'linear-gradient(135deg, #14532d 0%, #15803d 30%, #16a34a 60%, #15803d 100%)',
            borderColor: '#fbbf24',
            boxShadow: '0 0 80px rgba(251, 191, 36, 0.6), 0 30px 100px rgba(0, 0, 0, 0.9)',
          }}
        >
          {/* Header */}
          <div
            className="p-4 text-center border-b-4"
            style={{
              background: 'linear-gradient(135deg, #b45309 0%, #d97706 25%, #f59e0b 50%, #d97706 75%, #b45309 100%)',
              borderColor: '#fbbf24',
            }}
          >
            <h1
              className="text-4xl font-bold uppercase tracking-wider mb-2"
              style={{
                color: '#fef3c7',
                textShadow: '0 0 30px rgba(251, 191, 36, 1), 0 6px 12px rgba(0, 0, 0, 1)',
                fontFamily: 'Georgia, serif',
                letterSpacing: '0.1em',
              }}
            >
              Welcome to Rollers Paradise
            </h1>
            <p
              className="text-base mb-2"
              style={{
                color: '#fde047',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                fontFamily: 'Georgia, serif',
              }}
            >
              The Premier Online Crapless Craps Experience
            </p>
            <div className="flex items-center justify-center gap-4 mb-3">
              <div className="h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent w-24" />
              <span className="text-yellow-400 text-2xl">♦</span>
              <div className="h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent w-24" />
            </div>

            {/* SCROLLABLE CONTRACT AGREEMENT */}
            {!audioGranted || !fullscreenGranted ? (
              <div className="mt-4 max-w-5xl mx-auto">
                {/* VIRTUAL CURRENCY DISCLAIMER - PROMINENT */}
                <div className="mb-4 bg-green-900/40 border-4 border-green-500 rounded-lg p-6" style={{
                  boxShadow: '0 0 40px rgba(34, 197, 94, 0.6)',
                }}>
                  <p className="text-2xl font-bold text-center text-green-400 mb-3">
                    ⚠️ IMPORTANT: THIS IS NOT REAL GAMBLING ⚠️
                  </p>
                  <div className="space-y-2 text-green-100">
                    <p className="text-center text-lg">
                      <strong>100% FREE ENTERTAINMENT - VIRTUAL CURRENCY ONLY</strong>
                    </p>
                    <ul className="space-y-1 text-base">
                      <li>✅ <strong>NO REAL MONEY:</strong> All chips and currency are virtual with ZERO monetary value</li>
                      <li>✅ <strong>NO DEPOSITS:</strong> You cannot deposit real money into this game</li>
                      <li>✅ <strong>NO WITHDRAWALS:</strong> You cannot cash out or convert virtual currency to real money</li>
                      <li>✅ <strong>ENTERTAINMENT ONLY:</strong> This is for fun, not real gambling</li>
                    </ul>
                  </div>
                </div>

                {/* Policy Links */}
                <div className="mb-4 flex flex-wrap gap-2 justify-center">
                  <button
                    onClick={() => setShowPrivacyPolicy(true)}
                    className="px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: '#60a5fa',
                      color: '#fff',
                      boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
                    }}
                  >
                    📜 Privacy Policy
                  </button>
                  <button
                    onClick={() => setShowResponsibleGaming(true)}
                    className="px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: '#34d399',
                      color: '#fff',
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
                    }}
                  >
                    🛡️ Responsible Gaming
                  </button>
                  <button
                    onClick={() => setShowTermsOfService(true)}
                    className="px-4 py-2 rounded-lg font-bold text-sm transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                      borderWidth: '2px',
                      borderStyle: 'solid',
                      borderColor: '#a78bfa',
                      color: '#fff',
                      boxShadow: '0 0 20px rgba(139, 92, 246, 0.4)',
                    }}
                  >
                    ⚖️ Terms of Service
                  </button>
                </div>

                {/* Contract Title */}
                <h2
                  className="text-2xl font-bold uppercase text-center mb-4"
                  style={{
                    color: '#fef3c7',
                    textShadow: '0 0 20px rgba(251, 191, 36, 0.8), 0 4px 8px rgba(0, 0, 0, 0.8)',
                    fontFamily: 'Georgia, serif',
                  }}
                >
                  📜 USER AGREEMENT & CONSENT
                </h2>

                {/* Warning to scroll */}
                {!hasScrolledToBottom && (
                  <div
                    className="text-center text-base mb-4 p-3 rounded-lg"
                    style={{
                      background: 'rgba(239, 68, 68, 0.3)',
                      border: '2px solid #ef4444',
                      color: '#fef3c7',
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                    }}
                  >
                    ⚠️ Please scroll through the entire agreement below to continue
                  </div>
                )}

                {/* Scrollable Contract Box - MUCH LARGER */}
                <div
                  className="rounded-xl border-4 overflow-hidden"
                  style={{
                    background: 'rgba(0, 0, 0, 0.6)',
                    borderColor: hasScrolledToBottom ? '#22c55e' : '#fbbf24',
                    boxShadow: hasScrolledToBottom 
                      ? '0 0 40px rgba(34, 197, 94, 0.5)'
                      : '0 0 30px rgba(251, 191, 36, 0.3)',
                  }}
                >
                  {/* Scroll Indicator */}
                  {!hasScrolledToBottom && (
                    <div
                      className="p-3 text-center border-b-2"
                      style={{
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        borderColor: '#fbbf24',
                      }}
                    >
                      <p className="text-sm font-bold" style={{ color: '#fef3c7' }}>
                        ⬇️ SCROLL DOWN TO READ THE ENTIRE AGREEMENT ⬇️
                      </p>
                    </div>
                  )}

                  {/* Contract Content - SCROLLABLE - MUCH LARGER */}
                  <div
                    onScroll={handleScroll}
                    className="p-8 overflow-y-auto text-left"
                    style={{
                      maxHeight: '70vh',
                      color: '#e5e7eb',
                      fontFamily: 'Georgia, serif',
                      lineHeight: '1.8',
                      paddingBottom: '24rem',
                    }}
                  >
                    <h3 className="text-xl font-bold mb-4" style={{ color: '#fbbf24' }}>
                      ROLLERS PARADISE - PERMISSIONS & CONSENT AGREEMENT
                    </h3>
                    <p className="mb-4">
                      <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
                    </p>
                    <p className="mb-4">
                      By clicking "I AGREE" and proceeding to use Rollers Paradise ("the Application"), you acknowledge that you have read, understood, and agree to be bound by the following terms and conditions.
                    </p>

                    <h4 className="text-lg font-bold mt-6 mb-3" style={{ color: '#fbbf24' }}>
                      1. PERMISSIONS REQUIRED
                    </h4>
                    <p className="mb-4">
                      To provide you with the optimal gaming experience, Rollers Paradise requires the following browser permissions:
                    </p>
                    <ul className="list-disc ml-6 mb-4 space-y-2">
                      <li><strong>Audio Playback:</strong> Required for background music, dealer voice callouts, sound effects, and overall audio experience during gameplay.</li>
                      <li><strong>Fullscreen Mode:</strong> Required to enable immersive fullscreen viewing for an authentic casino experience. You may exit fullscreen at any time by pressing the ESC key.</li>
                      <li><strong>Device Detection:</strong> Required to detect your device specifications (screen resolution, GPU capabilities, browser type) to automatically optimize graphics quality, animation speed, and performance settings for your specific hardware.</li>
                      <li><strong>Anti-Cheat Monitoring:</strong> Required to detect and prevent cheating software, game tampering, unauthorized modifications, console manipulation, and other fraudulent activities. This includes monitoring browser developer tools, detecting memory modification attempts, validating game state integrity, and analyzing gameplay patterns for suspicious behavior.</li>
                    </ul>

                    <h4 className="text-lg font-bold mt-6 mb-3" style={{ color: '#fbbf24' }}>
                      2. PRIVACY & DATA COLLECTION
                    </h4>
                    <p className="mb-4">
                      <strong>We take your privacy seriously.</strong> Rollers Paradise does NOT collect, store, or transmit any personal information beyond what is necessary for game functionality:
                    </p>
                    <ul className="list-disc ml-6 mb-4 space-y-2">
                      <li><strong>NO Personal Data:</strong> We do not access or collect personal information such as names, addresses, phone numbers, or payment details.</li>
                      <li><strong>NO File Access:</strong> We do not access, read, or modify any files or folders on your device.</li>
                      <li><strong>NO Tracking:</strong> We do not use cookies or tracking technologies for advertising purposes.</li>
                      <li><strong>NO Third-Party Sharing:</strong> We do not share any data with third parties for marketing or advertising.</li>
                      <li><strong>Device Optimization Only:</strong> Device specifications are used solely to provide you with the best possible gaming performance and are not stored or transmitted to external servers.</li>
                    </ul>

                    <h4 className="text-lg font-bold mt-6 mb-3" style={{ color: '#fbbf24' }}>
                      3. AUTOMATIC SETTINGS OPTIMIZATION
                    </h4>
                    <p className="mb-4">
                      Upon granting permissions, Rollers Paradise will:
                    </p>
                    <ul className="list-disc ml-6 mb-4 space-y-2">
                      <li>Detect your screen resolution and display capabilities</li>
                      <li>Analyze your device's GPU tier and processing power</li>
                      <li>Automatically configure optimal graphics quality settings</li>
                      <li>Set appropriate animation speeds and frame rates</li>
                      <li>Ensure smooth gameplay tailored to your device</li>
                    </ul>

                    <h4 className="text-lg font-bold mt-6 mb-3" style={{ color: '#fbbf24' }}>
                      4. VIRTUAL CURRENCY - NO REAL GAMBLING
                    </h4>
                    <div className="bg-green-900/30 border-2 border-green-500 rounded-lg p-4 mb-4">
                      <p className="mb-3 font-bold text-green-400">
                        ✅ THIS IS NOT REAL GAMBLING - 100% VIRTUAL CURRENCY
                      </p>
                      <p className="mb-2">
                        Rollers Paradise is a <strong>FREE ENTERTAINMENT APPLICATION</strong> using only virtual currency:
                      </p>
                      <ul className="list-disc ml-6 space-y-1">
                        <li>All chips, credits, and currency are <strong>100% VIRTUAL</strong></li>
                        <li>Virtual currency has <strong>ZERO REAL-WORLD MONETARY VALUE</strong></li>
                        <li>You <strong>CANNOT</strong> deposit real money</li>
                        <li>You <strong>CANNOT</strong> withdraw or cash out virtual currency</li>
                        <li>This is <strong>ENTERTAINMENT ONLY</strong>, not real gambling</li>
                      </ul>
                    </div>
                    <p className="mb-4 text-yellow-300">
                      <strong>BY ACCEPTING, YOU ACKNOWLEDGE:</strong> This application uses virtual currency with no monetary value. This is NOT real gambling.
                    </p>

                    <h4 className="text-lg font-bold mt-6 mb-3" style={{ color: '#fbbf24' }}>
                      5. ACCOUNT SECURITY
                    </h4>
                    <p className="mb-4">
                      To ensure fair play and prevent abuse:
                    </p>
                    <ul className="list-disc ml-6 mb-4 space-y-2">
                      <li>One account per email address</li>
                      <li>One account per IP address</li>
                      <li>Two-factor authentication available for enhanced security</li>
                      <li>Guest accounts do NOT save any data (no logs, no progress, no settings)</li>
                    </ul>

                    <h4 className="text-lg font-bold mt-6 mb-3" style={{ color: '#fbbf24' }}>
                      6. ANTI-CHEAT & SECURITY MONITORING
                    </h4>
                    <p className="mb-4">
                      <strong>BY ACCEPTING THESE TERMS, YOU EXPLICITLY CONSENT TO ANTI-CHEAT MONITORING.</strong> To ensure fair play for all users, Rollers Paradise employs comprehensive anti-cheat protection:
                    </p>
                    <ul className="list-disc ml-6 mb-4 space-y-2">
                      <li><strong>Developer Tools Detection:</strong> The application monitors for open browser developer consoles and debugging tools</li>
                      <li><strong>Game State Validation:</strong> All game actions (bets, rolls, wins) are validated server-side to prevent client-side manipulation</li>
                      <li><strong>Balance Verification:</strong> Player balances are continuously verified against server records to detect tampering</li>
                      <li><strong>Data Integrity Checks:</strong> Checksums and encryption are used to detect unauthorized modifications to game data</li>
                      <li><strong>Pattern Analysis:</strong> Gameplay patterns are analyzed to detect suspicious behavior or automated bots</li>
                      <li><strong>Rate Limiting:</strong> Actions are rate-limited to prevent exploitation through rapid requests</li>
                      <li><strong>IP & Device Tracking:</strong> IP addresses and device fingerprints are tracked to enforce one-account-per-user policies</li>
                    </ul>
                    <p className="mb-4">
                      <strong className="text-red-400">⚠️ CHEATING CONSEQUENCES:</strong> Any attempt to cheat, hack, modify, or exploit the game will result in immediate account suspension, balance reset, and permanent ban from all Rollers Paradise services. Security violations are logged and may be reported to authorities if necessary.
                    </p>

                    <h4 className="text-lg font-bold mt-6 mb-3" style={{ color: '#fbbf24' }}>
                      7. FAIRNESS & RANDOMNESS GUARANTEE
                    </h4>
                    <p className="mb-4">
                      We guarantee complete fairness:
                    </p>
                    <ul className="list-disc ml-6 mb-4 space-y-2">
                      <li>All dice rolls are generated using cryptographically secure random number generation</li>
                      <li>NO manipulation or bias in dice outcomes</li>
                      <li>Single-player and multiplayer modes use identical random generation algorithms</li>
                      <li>Complete transparency in odds and payouts</li>
                    </ul>

                    <h4 className="text-lg font-bold mt-6 mb-3" style={{ color: '#fbbf24' }}>
                      8. RESPONSIBLE GAMING & GAMBLING ADDICTION HELP
                    </h4>
                    <p className="mb-3">
                      While this application uses virtual currency, we recognize that some individuals may develop unhealthy gaming patterns. <strong>Help is available 24/7:</strong>
                    </p>
                    <div className="bg-blue-900/30 border-2 border-blue-500 rounded-lg p-4 mb-4">
                      <p className="font-bold text-blue-400 mb-2">🆘 Problem Gambling Help Resources:</p>
                      <ul className="space-y-1 text-sm">
                        <li><strong>National Council on Problem Gambling:</strong> <span className="text-blue-300">1-800-522-4700</span> (24/7)</li>
                        <li><strong>Text Support:</strong> Text "GAMBLER" to <span className="text-blue-300">53342</span></li>
                        <li><strong>Online Chat:</strong> <span className="text-blue-300">ncpgambling.org/chat</span></li>
                        <li><strong>Gamblers Anonymous:</strong> <span className="text-blue-300">www.gamblersanonymous.org</span></li>
                      </ul>
                      <p className="mt-2 text-xs text-gray-300">
                        Free, confidential support available. Click "Responsible Gaming" button above for international resources.
                      </p>
                    </div>
                    <p className="mb-4">
                      For detailed responsible gaming information and self-exclusion options, see our <strong>Responsible Gaming Policy</strong> (button above).
                    </p>

                    <h4 className="text-lg font-bold mt-6 mb-3" style={{ color: '#fbbf24' }}>
                      9. ACCESSIBILITY FOR ALL PLAYERS
                    </h4>
                    <p className="mb-4">
                      Rollers Paradise is designed for all players, including elderly users. We provide:
                    </p>
                    <ul className="list-disc ml-6 mb-4 space-y-2">
                      <li>Large, clear text and buttons</li>
                      <li>Simple, intuitive controls</li>
                      <li>Adjustable audio and visual settings</li>
                      <li>Voice callouts and audio cues</li>
                    </ul>

                    <h4 className="text-lg font-bold mt-6 mb-3" style={{ color: '#fbbf24' }}>
                      10. CONSENT TO FULLSCREEN MODE
                    </h4>
                    <p className="mb-4">
                      By agreeing to these terms, you consent to the Application automatically entering fullscreen mode after initial setup. You may exit fullscreen at any time using:
                    </p>
                    <ul className="list-disc ml-6 mb-4 space-y-2">
                      <li>Press the <strong>ESC</strong> key</li>
                      <li>Click the fullscreen toggle button in the top-right corner</li>
                      <li>Use your browser's exit fullscreen option</li>
                    </ul>

                    <h4 className="text-lg font-bold mt-6 mb-3" style={{ color: '#fbbf24' }}>
                      11. USER ACKNOWLEDGMENT
                    </h4>
                    <p className="mb-4">
                      By checking the "I AGREE" box below, you acknowledge and confirm that:
                    </p>
                    <ul className="list-disc ml-6 mb-4 space-y-2">
                      <li>You have read and understood this entire agreement</li>
                      <li>You consent to the permissions listed in Section 1</li>
                      <li>You understand the privacy protections outlined in Section 2</li>
                      <li>You consent to automatic device optimization as described in Section 3</li>
                      <li><strong className="text-green-300">You understand this uses virtual currency with NO real-world value (Section 4)</strong></li>
                      <li>You agree to the account security policies (Section 5)</li>
                      <li><strong className="text-red-300">You explicitly consent to anti-cheat monitoring and security measures (Section 6)</strong></li>
                      <li>You acknowledge the fairness guarantees (Section 7)</li>
                      <li>You are aware of responsible gaming resources (Section 8)</li>
                      <li>You consent to automatic fullscreen mode (Section 10)</li>
                    </ul>

                    <h4 className="text-lg font-bold mt-6 mb-3" style={{ color: '#fbbf24' }}>
                      12. MODIFICATIONS
                    </h4>
                    <p className="mb-4">
                      Rollers Paradise reserves the right to modify these terms at any time. Continued use of the Application constitutes acceptance of any changes.
                    </p>

                    <div
                      className="mt-8 p-6 rounded-lg border-2"
                      style={{
                        background: 'rgba(34, 197, 94, 0.2)',
                        borderColor: '#22c55e',
                      }}
                    >
                      <p className="text-center text-lg font-bold" style={{ color: '#86efac' }}>
                        ✅ END OF AGREEMENT
                      </p>
                      <p className="text-center mt-2" style={{ color: '#d1fae5' }}>
                        You have reached the end of the terms. Please make your selection below.
                      </p>
                    </div>

                    {/* Agreement Checkbox & Accept Button - INSIDE SCROLLABLE AREA AT BOTTOM */}
                    <div className="mt-6">
                      <div
                        className="rounded-lg p-6 border-3"
                        style={{
                          background: agreedToTerms ? 'rgba(34, 197, 94, 0.3)' : disagreedToTerms ? 'rgba(239, 68, 68, 0.3)' : 'rgba(0, 0, 0, 0.5)',
                          borderColor: agreedToTerms ? '#22c55e' : disagreedToTerms ? '#ef4444' : hasScrolledToBottom ? '#fbbf24' : '#9ca3af',
                        }}
                      >
                        <div className="space-y-4">
                          {/* I AGREE Checkbox */}
                          <label className={`flex items-center gap-3 ${!hasScrolledToBottom ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <input
                              type="checkbox"
                              checked={agreedToTerms}
                              onChange={(e) => handleAgreeChange(e.target.checked)}
                              disabled={!hasScrolledToBottom}
                              className="w-7 h-7 rounded cursor-pointer flex-shrink-0"
                              style={{
                                accentColor: '#22c55e',
                              }}
                            />
                            <span
                              className="text-lg leading-tight text-left"
                              style={{
                                color: '#fef3c7',
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                              }}
                            >
                              <strong>I AGREE</strong> - I have read and accept the User Agreement & Terms of Service
                            </span>
                          </label>

                          {/* I DISAGREE Checkbox */}
                          <label className={`flex items-center gap-3 ${!hasScrolledToBottom ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <input
                              type="checkbox"
                              checked={disagreedToTerms}
                              onChange={(e) => handleDisagreeChange(e.target.checked)}
                              disabled={!hasScrolledToBottom}
                              className="w-7 h-7 rounded cursor-pointer flex-shrink-0"
                              style={{
                                accentColor: '#ef4444',
                              }}
                            />
                            <span
                              className="text-lg leading-tight text-left"
                              style={{
                                color: '#fef3c7',
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                              }}
                            >
                              <strong>I DISAGREE</strong> - I do not accept the User Agreement & Terms of Service
                            </span>
                          </label>

                          {/* Warning Messages */}
                          {!hasScrolledToBottom && (
                            <div
                              className="text-center text-base mt-3 p-3 rounded"
                              style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#fef3c7',
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                              }}
                            >
                              ⚠️ You must scroll to the bottom first
                            </div>
                          )}
                          {hasScrolledToBottom && disagreedToTerms && (
                            <div
                              className="text-center text-base mt-3 p-3 rounded"
                              style={{
                                background: 'rgba(239, 68, 68, 0.2)',
                                color: '#fef3c7',
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                              }}
                            >
                              ❌ You must agree to the terms to play Rollers Paradise
                            </div>
                          )}
                          {hasScrolledToBottom && !agreedToTerms && !disagreedToTerms && (
                            <div
                              className="text-center text-base mt-3 p-3 rounded"
                              style={{
                                background: 'rgba(251, 191, 36, 0.2)',
                                color: '#fef3c7',
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                              }}
                            >
                              ✓ Agreement read. Please select "I AGREE" to continue
                            </div>
                          )}

                          {/* Accept Button */}
                          <div className="pt-3 border-t-2 border-yellow-600/30">
                            <button
                              onClick={() => {
                                console.log('🎯 Accept button clicked!');
                                requestPermissions();
                              }}
                              disabled={isRequesting || !agreedToTerms || !hasScrolledToBottom}
                              className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-lg font-bold uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
                              style={{
                                background: (agreedToTerms && hasScrolledToBottom)
                                  ? 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #14532d 100%)'
                                  : 'linear-gradient(135deg, #6b7280 0%, #4b5563 50%, #374151 100%)',
                                borderWidth: '3px',
                                borderStyle: 'solid',
                                borderColor: (agreedToTerms && hasScrolledToBottom) ? '#fbbf24' : '#9ca3af',
                                color: '#fef3c7',
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                                boxShadow: (agreedToTerms && hasScrolledToBottom)
                                  ? '0 0 40px rgba(251, 191, 36, 0.8), 0 8px 20px rgba(0, 0, 0, 0.7)'
                                  : '0 8px 20px rgba(0, 0, 0, 0.7)',
                                fontSize: '1.25rem',
                              }}
                            >
                              <PlayIcon />
                              {isRequesting ? 'STARTING GAME...' :
                               !hasScrolledToBottom ? 'SCROLL TO BOTTOM FIRST' :
                               disagreedToTerms ? 'MUST AGREE TO CONTINUE' :
                               !agreedToTerms ? 'SELECT I AGREE FIRST' :
                               'ACCEPT & ENTER GAME'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Indicator */}
                  {hasScrolledToBottom && (
                    <div
                      className="p-3 text-center border-t-2"
                      style={{
                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                        borderColor: '#fbbf24',
                      }}
                    >
                      <p className="text-sm font-bold" style={{ color: '#fef3c7' }}>
                        ✅ YOU HAVE READ THE ENTIRE AGREEMENT - YOU MAY NOW ACCEPT
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>

          {/* Content */}
          <div className="p-4 space-y-4 flex-1 overflow-y-auto">
            {/* Empty */}
          </div>

          {/* Footer */}
          <div
            className="p-4 flex gap-4 justify-center border-t-4"
            style={{
              background: 'rgba(0, 0, 0, 0.3)',
              borderColor: '#fbbf24',
            }}
          >
            {onQuit && (
              <button
                onClick={onQuit}
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase transition-all"
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)',
                  borderWidth: '3px',
                  borderStyle: 'solid',
                  borderColor: '#fbbf24',
                  color: '#fef3c7',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                  boxShadow: '0 0 30px rgba(251, 191, 36, 0.5), 0 8px 20px rgba(0, 0, 0, 0.5)',
                }}
              >
                <AlertCircleIcon />
                Exit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Policy Modals */}
      {showPrivacyPolicy && <PrivacyPolicy onClose={() => setShowPrivacyPolicy(false)} />}
      {showResponsibleGaming && <ResponsibleGaming onClose={() => setShowResponsibleGaming(false)} />}
      {showTermsOfService && <TermsOfService onClose={() => setShowTermsOfService(false)} />}
    </div>
  );
}

export default PermissionRequest;
