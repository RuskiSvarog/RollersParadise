import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

/**
 * ViewportController - Desktop Mode Helper
 * 
 * Instead of forcing desktop mode, this component:
 * - Detects if user is on mobile/tablet NOT in desktop mode
 * - Shows helpful instructions on how to enable desktop mode
 * - Instructions are device-specific (iOS Safari, Android Chrome, etc.)
 * - User can dismiss the message
 * - Does NOT force anything automatically
 */

export function ViewportController() {
  const [showHelp, setShowHelp] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{
    type: 'ios' | 'android' | 'desktop' | 'other';
    browser: string;
    isInDesktopMode: boolean;
  } | null>(null);

  useEffect(() => {
    console.log('🖥️ ===== VIEWPORT CONTROLLER =====');
    console.log('Checking device and viewport mode...');

    // Detect device type
    const userAgent = navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
    const isAndroid = /Android/i.test(userAgent);
    const isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    // Detect browser
    let browser = 'Unknown';
    if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
      browser = 'Safari';
    } else if (/Chrome/i.test(userAgent)) {
      browser = 'Chrome';
    } else if (/Firefox/i.test(userAgent)) {
      browser = 'Firefox';
    } else if (/Edge/i.test(userAgent)) {
      browser = 'Edge';
    }

    // Check if in desktop mode
    // Desktop mode usually has viewport width >= 1024 and/or specific user agent strings
    const viewportWidth = window.innerWidth;
    const screenWidth = window.screen.width;
    
    // Heuristic: If on mobile device but viewport is very wide, likely in desktop mode
    const isLikelyDesktopMode = isMobileDevice && (
      viewportWidth >= 1024 || 
      userAgent.includes('X11') ||
      (screenWidth >= 1024 && viewportWidth >= 1024)
    );

    const deviceType = isIOS ? 'ios' : isAndroid ? 'android' : !isMobileDevice ? 'desktop' : 'other';

    const info = {
      type: deviceType,
      browser,
      isInDesktopMode: !isMobileDevice || isLikelyDesktopMode
    };

    setDeviceInfo(info);

    console.log('Device Detection:', {
      userAgent,
      deviceType,
      browser,
      viewportWidth,
      screenWidth,
      isInDesktopMode: info.isInDesktopMode,
      isMobileDevice
    });

    // Show help if on mobile and NOT in desktop mode
    // Check if user has dismissed it this session
    const hasDismissed = sessionStorage.getItem('desktop-mode-help-dismissed');
    
    if (isMobileDevice && !info.isInDesktopMode && !hasDismissed) {
      console.log('📱 Mobile device detected WITHOUT desktop mode - showing help');
      // Show help after 1 second
      setTimeout(() => {
        setShowHelp(true);
      }, 1000);
    } else if (isMobileDevice && info.isInDesktopMode) {
      console.log('✅ Mobile device IN desktop mode - perfect!');
    } else {
      console.log('✅ Desktop device detected');
    }

    // Standard responsive viewport for everyone
    const existingViewport = document.querySelector('meta[name="viewport"]');
    if (existingViewport) {
      existingViewport.remove();
    }

    const viewport = document.createElement('meta');
    viewport.name = 'viewport';
    viewport.content = 'width=device-width, initial-scale=1.0, minimum-scale=0.5, maximum-scale=3.0, user-scalable=yes';
    document.head.appendChild(viewport);

    console.log('✅ Standard responsive viewport applied');
    console.log('====================================');
  }, []);

  const handleDismiss = () => {
    setShowHelp(false);
    sessionStorage.setItem('desktop-mode-help-dismissed', 'true');
    console.log('✅ Desktop mode help dismissed');
  };

  if (!showHelp || !deviceInfo) {
    return null;
  }

  return (
    <DesktopModeHelper 
      deviceType={deviceInfo.type}
      browser={deviceInfo.browser}
      onDismiss={handleDismiss}
    />
  );
}

interface DesktopModeHelperProps {
  deviceType: 'ios' | 'android' | 'desktop' | 'other';
  browser: string;
  onDismiss: () => void;
}

function DesktopModeHelper({ deviceType, browser, onDismiss }: DesktopModeHelperProps) {
  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[999999] p-4"
      style={{ 
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <div 
        className="bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 rounded-2xl shadow-2xl max-w-md w-full p-6 relative border-4 border-purple-400/30"
        style={{ 
          animation: 'slideUp 0.4s ease-out',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        {/* Icon */}
        <div className="text-center mb-4">
          <div className="text-6xl mb-2">🎰</div>
          <h2 className="text-2xl text-white mb-2">
            Welcome to Rollers Paradise!
          </h2>
          <p className="text-purple-200">
            For the best experience, please enable <strong>Desktop Mode</strong>
          </p>
        </div>

        {/* Instructions based on device */}
        <div className="bg-black/30 rounded-xl p-4 mb-4 text-white">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <span className="text-xl">📱</span>
            <span>How to Enable Desktop Mode:</span>
          </h3>

          {deviceType === 'ios' && browser === 'Safari' && (
            <ol className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-purple-300 font-semibold">1.</span>
                <span>Tap the <strong>aA</strong> icon in the address bar (top left or right)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-300 font-semibold">2.</span>
                <span>Select <strong>"Request Desktop Website"</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-300 font-semibold">3.</span>
                <span>The page will reload in desktop mode ✅</span>
              </li>
            </ol>
          )}

          {deviceType === 'android' && browser === 'Chrome' && (
            <ol className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-purple-300 font-semibold">1.</span>
                <span>Tap the <strong>⋮</strong> menu icon (top right)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-300 font-semibold">2.</span>
                <span>Check the box for <strong>"Desktop site"</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-300 font-semibold">3.</span>
                <span>The page will reload in desktop mode ✅</span>
              </li>
            </ol>
          )}

          {deviceType === 'android' && browser !== 'Chrome' && (
            <ol className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-purple-300 font-semibold">1.</span>
                <span>Look for the <strong>menu icon</strong> (⋮ or ☰) in your browser</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-300 font-semibold">2.</span>
                <span>Find and enable <strong>"Desktop site"</strong> or <strong>"Request Desktop Site"</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-300 font-semibold">3.</span>
                <span>The page will reload in desktop mode ✅</span>
              </li>
            </ol>
          )}

          {deviceType === 'ios' && browser !== 'Safari' && (
            <ol className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-purple-300 font-semibold">1.</span>
                <span>Look for the <strong>menu icon</strong> in your browser</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-300 font-semibold">2.</span>
                <span>Find and enable <strong>"Desktop site"</strong> or <strong>"Request Desktop Site"</strong></span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-300 font-semibold">3.</span>
                <span>The page will reload in desktop mode ✅</span>
              </li>
              <li className="flex gap-2 mt-3 pt-3 border-t border-purple-400/30">
                <span className="text-yellow-300">💡</span>
                <span className="text-purple-200 italic text-xs">
                  Tip: For best results on iOS, use Safari browser
                </span>
              </li>
            </ol>
          )}

          {deviceType === 'other' && (
            <ol className="space-y-2 text-sm">
              <li className="flex gap-2">
                <span className="text-purple-300 font-semibold">1.</span>
                <span>Open your browser's <strong>menu</strong> (usually ⋮ or ☰)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-300 font-semibold">2.</span>
                <span>Look for <strong>"Desktop site"</strong>, <strong>"Request Desktop"</strong>, or similar option</span>
              </li>
              <li className="flex gap-2">
                <span className="text-purple-300 font-semibold">3.</span>
                <span>Enable it and the page will reload ✅</span>
              </li>
            </ol>
          )}
        </div>

        {/* Why desktop mode */}
        <div className="bg-purple-500/20 rounded-xl p-3 mb-4 border border-purple-400/30">
          <p className="text-sm text-purple-100">
            <strong className="text-white">Why Desktop Mode?</strong><br/>
            Rollers Paradise is designed as a full casino experience with detailed betting areas and controls. Desktop mode ensures you can see and interact with all features properly.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onDismiss}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 px-6 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Got It! 👍
          </button>
        </div>

        {/* Dismiss note */}
        <p className="text-center text-xs text-purple-300 mt-3">
          You can still play without desktop mode, but the experience may not be optimal.
        </p>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Device Detection Hook
 * Returns information about the current device
 */
export function useDeviceInfo() {
  const userAgent = navigator.userAgent;
  const isMobileDevice = /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTablet = /iPad|Android/i.test(userAgent) && !/Mobile/i.test(userAgent);
  const isMobile = isMobileDevice && !isTablet;
  const isIOS = /iPhone|iPad|iPod/i.test(userAgent);
  const isAndroid = /Android/i.test(userAgent);
  
  return {
    isMobileDevice,
    isTablet,
    isMobile,
    isIOS,
    isAndroid,
    isDesktop: !isMobileDevice,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    orientation: window.innerWidth > window.innerHeight ? 'landscape' : 'portrait'
  };
}
