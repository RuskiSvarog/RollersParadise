import { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from './Icons';

type ConnectionState = 'online' | 'offline' | 'slow' | 'checking';

export function ConnectionStatus() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('online');
  const [showStatus, setShowStatus] = useState(false);
  const [lastOnlineTime, setLastOnlineTime] = useState<number>(Date.now());
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      console.log('✅ Connection restored');
      setConnectionState('online');
      setLastOnlineTime(Date.now());
      setShowStatus(true);
      setIsVisible(true);
      
      // Hide after 3 seconds
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setShowStatus(false), 300);
      }, 3000);
    };

    const handleOffline = () => {
      console.warn('⚠️ Connection lost');
      setConnectionState('offline');
      setShowStatus(true);
      setIsVisible(true);
    };

    // Check connection quality
    const checkConnectionQuality = async () => {
      if (!navigator.onLine) {
        setConnectionState('offline');
        return;
      }

      // Check if we can reach the internet
      try {
        const start = Date.now();
        const response = await fetch('https://www.google.com/favicon.ico', {
          mode: 'no-cors',
          cache: 'no-cache',
        });
        const duration = Date.now() - start;

        if (duration > 3000) {
          setConnectionState('slow');
          setShowStatus(true);
          setIsVisible(true);
          setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => setShowStatus(false), 300);
          }, 5000);
        } else {
          setConnectionState('online');
          if (showStatus && connectionState !== 'offline') {
            setTimeout(() => {
              setIsVisible(false);
              setTimeout(() => setShowStatus(false), 300);
            }, 2000);
          }
        }
      } catch (error) {
        // Network request failed, but we might still be online
        // Don't immediately assume offline
        console.warn('Connection check failed, but may still be online');
      }
    };

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check connection quality every 30 seconds
    const qualityCheckInterval = setInterval(checkConnectionQuality, 30000);

    // Initial check
    if (!navigator.onLine) {
      handleOffline();
    } else {
      checkConnectionQuality();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(qualityCheckInterval);
    };
  }, [showStatus, connectionState]);

  const getStatusConfig = () => {
    switch (connectionState) {
      case 'offline':
        return {
          icon: <WifiOff className="w-5 h-5" />,
          text: 'No Internet Connection',
          subtext: 'Some features may be unavailable',
          color: '#ef4444',
          bgGradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.95), rgba(220, 38, 38, 0.95))',
        };
      case 'slow':
        return {
          icon: <AlertCircle className="w-5 h-5" />,
          text: 'Slow Connection',
          subtext: 'Game may experience delays',
          color: '#f59e0b',
          bgGradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.95), rgba(217, 119, 6, 0.95))',
        };
      case 'checking':
        return {
          icon: <Wifi className="w-5 h-5 animate-pulse" />,
          text: 'Checking Connection',
          subtext: 'Please wait...',
          color: '#3b82f6',
          bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.95), rgba(37, 99, 235, 0.95))',
        };
      default: // online
        return {
          icon: <CheckCircle className="w-5 h-5" />,
          text: 'Connection Restored',
          subtext: 'All features available',
          color: '#22c55e',
          bgGradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(21, 128, 61, 0.95))',
        };
    }
  };

  const config = getStatusConfig();

  // Always show if offline, otherwise only show when toggled
  const shouldShow = connectionState === 'offline' || showStatus;

  if (!shouldShow) return null;

  return (
    <div
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-[9997] pointer-events-none transition-all duration-300"
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translate(-50%, 0)' : 'translate(-50%, -100px)',
      }}
    >
      <div
        className="rounded-2xl shadow-2xl px-6 py-4 min-w-[320px]"
        style={{
          background: config.bgGradient,
          border: `2px solid ${config.color}`,
          boxShadow: `0 0 40px ${config.color}66, 0 10px 30px rgba(0, 0, 0, 0.5)`,
        }}
      >
        <div className="flex items-center gap-3">
          {/* Icon */}
          <div
            className="p-2 rounded-full"
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
            }}
          >
            {config.icon}
          </div>

          {/* Text */}
          <div className="flex-1">
            <div className="text-white font-bold text-sm">
              {config.text}
            </div>
            <div className="text-white/80 text-xs">
              {config.subtext}
            </div>
          </div>

          {/* Animated indicator */}
          {connectionState === 'offline' && (
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1 h-4 bg-white/50 rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 200}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Offline Mode Info */}
        {connectionState === 'offline' && (
          <div className="mt-3 pt-3 border-t border-white/20 text-white/70 text-xs">
            💾 Your progress is saved locally and will sync when connection is restored.
          </div>
        )}
      </div>
    </div>
  );
}

// Compact connection indicator for header
export function ConnectionIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="flex items-center gap-2">
      <div
        className="w-2 h-2 rounded-full transition-all duration-300"
        style={{
          background: isOnline ? '#22c55e' : '#ef4444',
          boxShadow: isOnline 
            ? '0 0 10px rgba(34, 197, 94, 0.8)' 
            : '0 0 10px rgba(239, 68, 68, 0.8)',
          opacity: isOnline ? 1 : 0.6,
        }}
      />
      <span className="text-xs text-gray-400">
        {isOnline ? 'Online' : 'Offline'}
      </span>
    </div>
  );
}
