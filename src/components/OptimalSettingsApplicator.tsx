/**
 * Optimal Settings Applicator
 * Automatically applies device-specific optimal settings on first load
 */

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getStoredDeviceConsent, DeviceInfo } from '../utils/deviceDetection';
import {
  getOptimalSettingsForDevice,
  applyDeviceDisplayConfig,
  shouldAutoApplySettings,
  markOptimalSettingsApplied,
  getSettingsDescription,
  OptimalSettingsProfile,
} from '../utils/deviceOptimalSettings';
import { useSettings } from '../contexts/SettingsContext';
import { CheckCircle, Settings, X } from 'lucide-react';

export function OptimalSettingsApplicator() {
  const { settings, updateSettings } = useSettings();
  const [showNotification, setShowNotification] = useState(false);
  const [deviceProfile, setDeviceProfile] = useState<OptimalSettingsProfile | null>(null);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);

  useEffect(() => {
    applyOptimalSettings();
  }, []);

  const applyOptimalSettings = async () => {
    try {
      // Get device info from stored consent
      const storedDevice = getStoredDeviceConsent();
      if (!storedDevice) {
        console.log('⏭️ No device consent found, skipping optimal settings');
        return;
      }

      setDeviceInfo(storedDevice);

      // Check if we should auto-apply settings
      if (!shouldAutoApplySettings()) {
        console.log('⏭️ User has custom settings, not auto-applying optimal settings');
        return;
      }

      console.log('🎯 Auto-applying optimal settings for device type:', storedDevice.deviceType);

      // Get optimal profile for this device
      const profile = getOptimalSettingsForDevice(storedDevice);
      setDeviceProfile(profile);

      // Apply display configuration immediately
      applyDeviceDisplayConfig(storedDevice, profile);

      // Update game settings
      if (profile.settings) {
        updateSettings({
          ...settings,
          ...profile.settings,
        });
        console.log('✅ Optimal game settings applied:', profile.name);
      }

      // Mark as applied
      markOptimalSettingsApplied();

      // Show success notification
      setShowNotification(true);

      // Auto-hide after 8 seconds
      setTimeout(() => {
        setShowNotification(false);
      }, 8000);

      // Log success
      console.log('✨ Optimal settings applied successfully!');
      console.log('📊 Profile:', profile.name);
      console.log('📋 Description:', profile.description);
      console.log('🎮 Features:', getSettingsDescription(profile));
    } catch (error) {
      console.error('❌ Failed to apply optimal settings:', error);
    }
  };

  const handleDismiss = () => {
    setShowNotification(false);
  };

  if (!showNotification || !deviceProfile || !deviceInfo) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-[9998] animate-in slide-in-from-right duration-500">
      <div className="bg-gradient-to-br from-green-900 via-green-800 to-green-900 border-2 border-green-600 rounded-2xl shadow-2xl shadow-green-900/50 max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-700 to-green-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-white" />
            <h3 className="text-white font-bold text-lg">Settings Optimized!</h3>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white/80 hover:text-white transition-colors p-1 hover:bg-white/10 rounded-lg"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Device Info */}
          <div className="flex items-start gap-4">
            <div className="bg-green-700/30 rounded-xl p-3 flex-shrink-0">
              <Settings className="w-6 h-6 text-green-300" />
            </div>
            <div className="flex-1">
              <p className="text-green-100 text-base leading-relaxed">
                We've automatically configured <strong>{deviceProfile.name}</strong> settings for your{' '}
                <strong>{deviceInfo.deviceModel || deviceInfo.deviceType}</strong> to give you the best experience!
              </p>
            </div>
          </div>

          {/* Profile Description */}
          <div className="bg-green-900/40 border border-green-700/50 rounded-xl p-4">
            <h4 className="text-green-300 font-semibold text-sm mb-2">What's Optimized:</h4>
            <p className="text-green-200 text-sm leading-relaxed mb-3">
              {deviceProfile.description}
            </p>
            <p className="text-green-300 text-xs">
              {getSettingsDescription(deviceProfile)}
            </p>
          </div>

          {/* Device-Specific Tips */}
          {deviceInfo.deviceType === 'mobile' && (
            <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-3">
              <p className="text-blue-200 text-sm">
                <strong>💡 Tip:</strong> You can pinch-to-zoom to see details on the casino table!
              </p>
            </div>
          )}

          {deviceInfo.deviceType === 'tablet' && (
            <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-3">
              <p className="text-blue-200 text-sm">
                <strong>💡 Tip:</strong> Rotate to landscape mode for the best gaming experience!
              </p>
            </div>
          )}

          {(deviceInfo.isTesla || deviceInfo.isCarBrowser) && (
            <div className="bg-orange-900/30 border border-orange-600/50 rounded-lg p-3">
              <p className="text-orange-200 text-sm">
                <strong>⚠️ Safety:</strong> Ensure you're parked safely before playing!
              </p>
            </div>
          )}

          {deviceInfo.isTV && (
            <div className="bg-purple-900/30 border border-purple-600/50 rounded-lg p-3">
              <p className="text-purple-200 text-sm">
                <strong>💡 Tip:</strong> Use your remote to navigate, and enjoy the big screen experience!
              </p>
            </div>
          )}

          {/* Customization Note */}
          <div className="text-center pt-2">
            <p className="text-green-300 text-sm">
              You can always change these settings in the{' '}
              <strong className="text-white">Settings menu</strong> ⚙️
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
