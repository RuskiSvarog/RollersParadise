import React, { useState, useEffect } from 'react';
import { 
  getDeviceInfo, 
  getDeviceDescription, 
  getDeviceEmoji, 
  storeDeviceConsent,
  isDeviceAllowedToPlay,
  type DeviceInfo 
} from '../utils/deviceDetection';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface DeviceConsentModalProps {
  onConsent: (deviceInfo: DeviceInfo) => void;
  onDecline: () => void;
}

/**
 * Device Consent Modal
 * REQUIRED before playing - for legal compliance and game regulations
 */
export function DeviceConsentModal({ onConsent, onDecline }: DeviceConsentModalProps) {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Detect device on mount
    getDeviceInfo().then((info) => {
      setDeviceInfo(info);
      setIsLoading(false);
    });
  }, []);

  const handleAccept = async () => {
    if (!deviceInfo) return;

    // Check if device is allowed
    const { allowed, reason } = isDeviceAllowedToPlay(deviceInfo);
    
    if (!allowed) {
      toast.error('Device Not Allowed', {
        description: reason || 'This device is not permitted to play.',
        duration: 8000,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Store consent locally first
      storeDeviceConsent(deviceInfo);

      // Mark as consented
      const consentedInfo: DeviceInfo = {
        ...deviceInfo,
        consentGiven: true,
        consentTimestamp: new Date().toISOString(),
      };

      // Try to send to backend for compliance logging (non-blocking)
      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/device-consent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            deviceInfo: deviceInfo,
            consentGiven: true,
            consentTimestamp: new Date().toISOString(),
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.warn('⚠️ Failed to record device consent on server:', errorText);
          // Don't block the user - continue anyway
        } else {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const result = await response.json();
            console.log('✅ Device consent recorded on server:', result);
          } else {
            console.warn('⚠️ Server returned non-JSON response:', await response.text());
          }
        }
      } catch (apiError) {
        console.warn('⚠️ Failed to record device consent on server (non-blocking):', apiError);
        // Continue - local storage is sufficient for now
      }

      toast.success('✅ Device Verified', {
        description: 'You can now play Rollers Paradise!',
        duration: 3000,
      });

      onConsent(consentedInfo);
    } catch (error) {
      console.error('❌ Critical error in device consent:', error);
      toast.error('Failed to verify device. Please try again.', {
        duration: 5000,
      });
      setIsSubmitting(false);
    }
  };

  const handleDecline = () => {
    toast.error('Device Permission Required', {
      description: 'You must allow device detection to play. This is required for legal compliance.',
      duration: 8000,
    });
    onDecline();
  };

  if (isLoading || !deviceInfo) {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border-2 border-green-600 p-8 max-w-2xl w-full shadow-2xl">
          <div className="text-center">
            <div className="w-20 h-20 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-white text-xl">Detecting your device...</p>
          </div>
        </div>
      </div>
    );
  }

  const deviceDescription = getDeviceDescription(deviceInfo);
  const deviceEmoji = getDeviceEmoji(deviceInfo.deviceType);

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border-2 border-green-600 p-8 max-w-3xl w-full shadow-2xl my-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">{deviceEmoji}</div>
          <h1 className="text-4xl font-bold text-white mb-2">
            🎰 Device Verification Required
          </h1>
          <p className="text-gray-300 text-lg">
            For legal compliance and game regulations
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="text-4xl">⚠️</div>
            <div>
              <h3 className="text-yellow-100 font-bold text-xl mb-3">
                Required Permission
              </h3>
              <p className="text-white leading-relaxed text-base">
                To comply with gaming regulations and ensure responsible gaming practices, 
                we are <strong className="text-yellow-100">required by law</strong> to collect and verify your device information 
                before you can play. This helps us prevent fraud, ensure fair play, and comply 
                with legal requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Detected Device */}
        <div className="bg-green-900/20 border-2 border-green-600 rounded-xl p-6 mb-6">
          <h3 className="text-green-300 font-bold text-xl mb-4 text-center">
            📱 Detected Device
          </h3>
          <div className="bg-gray-900/50 rounded-lg p-4 mb-4">
            <p className="text-white text-center text-lg font-medium">
              {deviceDescription}
            </p>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm mb-1">Device Type</div>
              <div className="text-white font-medium capitalize">
                {deviceInfo.deviceType.replace('-', ' ')}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm mb-1">Screen Size</div>
              <div className="text-white font-medium">
                {deviceInfo.screenResolution}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm mb-1">Browser</div>
              <div className="text-white font-medium">
                {deviceInfo.browser}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-gray-400 text-sm mb-1">Operating System</div>
              <div className="text-white font-medium">
                {deviceInfo.os}
              </div>
            </div>
          </div>

          {/* Show Details Toggle */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full mt-4 text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
          >
            {showDetails ? '▼ Hide Technical Details' : '▶ Show Technical Details'}
          </button>

          {/* Technical Details */}
          {showDetails && (
            <div className="mt-4 bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-gray-400">Timezone:</div>
                  <div className="text-gray-300">{deviceInfo.timezone}</div>
                  
                  <div className="text-gray-400">Language:</div>
                  <div className="text-gray-300">{deviceInfo.language}</div>
                  
                  <div className="text-gray-400">Touch Support:</div>
                  <div className="text-gray-300">{deviceInfo.touchSupport ? 'Yes' : 'No'}</div>
                  
                  <div className="text-gray-400">Pixel Ratio:</div>
                  <div className="text-gray-300">{deviceInfo.pixelRatio}x</div>
                  
                  {deviceInfo.cores && (
                    <>
                      <div className="text-gray-400">CPU Cores:</div>
                      <div className="text-gray-300">{deviceInfo.cores}</div>
                    </>
                  )}
                  
                  {deviceInfo.memory && (
                    <>
                      <div className="text-gray-400">Memory:</div>
                      <div className="text-gray-300">{deviceInfo.memory} GB</div>
                    </>
                  )}
                  
                  {deviceInfo.connection && (
                    <>
                      <div className="text-gray-400">Connection:</div>
                      <div className="text-gray-300">{deviceInfo.connection}</div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* What We Collect */}
        <div className="bg-blue-500/15 border-2 border-blue-400 rounded-xl p-6 mb-6">
          <h3 className="text-blue-100 font-bold text-lg mb-3">
            📋 What Information We Collect
          </h3>
          <ul className="space-y-2 text-gray-100 text-base">
            <li className="flex items-start gap-2">
              <span className="text-blue-300">•</span>
              <span>Device type and model (computer, phone, tablet, Tesla, etc.)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-300">•</span>
              <span>Operating system and browser information</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-300">•</span>
              <span>Screen resolution and display settings</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-300">•</span>
              <span>Timezone and language preferences</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-300">•</span>
              <span>Hardware capabilities (for game performance)</span>
            </li>
          </ul>
        </div>

        {/* Why We Need This */}
        <div className="bg-purple-500/15 border-2 border-purple-400 rounded-xl p-6 mb-6">
          <h3 className="text-purple-100 font-bold text-lg mb-3">
            🛡️ Why This Is Required
          </h3>
          <ul className="space-y-2 text-gray-100 text-base">
            <li className="flex items-start gap-2">
              <span className="text-purple-300">✓</span>
              <span><strong className="text-white">Legal Compliance:</strong> Gaming regulations require device verification</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-300">✓</span>
              <span><strong className="text-white">Fraud Prevention:</strong> Detect multiple accounts and cheating</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-300">✓</span>
              <span><strong className="text-white">Fair Play:</strong> Ensure equal gameplay for all users</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-300">✓</span>
              <span><strong className="text-white">Security:</strong> Protect your account from unauthorized access</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-purple-300">✓</span>
              <span><strong className="text-white">Performance:</strong> Optimize game experience for your device</span>
            </li>
          </ul>
        </div>

        {/* Special Device Notices */}
        {deviceInfo.isTesla && (
          <div className="bg-orange-500/20 border-2 border-orange-400 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🚗</div>
              <div>
                <h3 className="text-orange-100 font-bold text-lg mb-2">
                  Tesla Detected
                </h3>
                <p className="text-white text-base">
                  We've detected you're playing from a Tesla vehicle. Please ensure you are 
                  <strong className="text-orange-100"> parked safely</strong> and not driving. Gaming while driving is dangerous 
                  and may be illegal in your jurisdiction.
                </p>
              </div>
            </div>
          </div>
        )}

        {deviceInfo.isCarBrowser && !deviceInfo.isTesla && (
          <div className="bg-orange-500/20 border-2 border-orange-400 rounded-xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">🚙</div>
              <div>
                <h3 className="text-orange-100 font-bold text-lg mb-2">
                  Vehicle Browser Detected
                </h3>
                <p className="text-white text-base">
                  We've detected you're playing from a vehicle. Please ensure you are 
                  <strong className="text-orange-100"> parked safely</strong> and not driving. Your safety is our priority.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="bg-gray-800/80 border-2 border-gray-600 rounded-xl p-5 mb-6">
          <p className="text-gray-200 text-sm text-center leading-relaxed">
            🔒 Your privacy is important to us. Device information is collected solely for 
            legal compliance, security, and improving your gaming experience. We do not sell 
            or share your information with third parties. By accepting, you agree to our 
            device detection and data collection practices as outlined in our Privacy Policy.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleDecline}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            ❌ Decline (Cannot Play)
          </button>
          <button
            onClick={handleAccept}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                ✅ Accept & Play
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-gray-300 text-sm">
            By clicking "Accept & Play", you acknowledge that you meet the legal age requirement 
            and agree to device detection for compliance purposes.
          </p>
        </div>
      </div>
    </div>
  );
}