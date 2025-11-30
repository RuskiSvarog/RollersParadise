/**
 * Device-Specific Optimal Settings System
 * Automatically applies the best settings for each device type
 */

import { GameSettingsType } from '../components/GameSettings';
import { DeviceInfo } from './deviceDetection';

export interface OptimalSettingsProfile {
  name: string;
  description: string;
  settings: Partial<GameSettingsType>;
  displayConfig: {
    viewport?: {
      width: number;
      initialScale: number;
      minimumScale: number;
      maximumScale: number;
    };
    fontSize: string;
    uiScale: number;
    showMobileOptimizations: boolean;
  };
  performanceConfig: {
    tier: 'low' | 'medium' | 'high';
    targetFPS: 30 | 60;
    enableParticles: boolean;
    enableShadows: boolean;
    enableBlur: boolean;
  };
  audioConfig: {
    enableSpatialAudio: boolean;
    enableEcho: boolean;
    optimalMasterVolume: number;
  };
}

/**
 * Desktop Optimal Settings (Windows, Mac, Linux)
 */
const DESKTOP_SETTINGS: OptimalSettingsProfile = {
  name: 'Desktop Optimized',
  description: 'Full-featured experience with all effects enabled',
  settings: {
    // Sound - Full quality
    masterVolume: 70,
    soundEffects: true,
    soundEffectsVolume: 80,
    backgroundMusic: true,
    musicVolume: 70,
    dealerVoice: true,
    dealerVolume: 70,
    ambientSounds: true,
    ambientCasinoSounds: true,
    ambienceVolume: 60,
    
    // Display - High quality
    tableFelt: 'green',
    chipStyle: 'classic',
    animationSpeed: 'normal',
    showBetAmounts: true,
    showOtherPlayerBets: true,
    highQualityGraphics: true,
    showWinAnimations: true,
    
    // Gameplay - Full features
    confirmBets: true,
    quickBetButtons: true,
    autoRebuy: true,
    autoRebuyAmount: 1000,
    timeBank: 30,
    betInputMethod: 'both',
    
    // Social - Enabled
    enableChat: true,
    enableEmotes: true,
    showPlayerAvatars: true,
    
    // Voice Chat - Enabled
    voiceChatEnabled: true,
  },
  displayConfig: {
    fontSize: '100%',
    uiScale: 1.0,
    showMobileOptimizations: false,
  },
  performanceConfig: {
    tier: 'high',
    targetFPS: 60,
    enableParticles: true,
    enableShadows: true,
    enableBlur: true,
  },
  audioConfig: {
    enableSpatialAudio: true,
    enableEcho: true,
    optimalMasterVolume: 70,
  },
};

/**
 * Mobile Phone Optimal Settings (iPhone, Android Phone)
 */
const MOBILE_SETTINGS: OptimalSettingsProfile = {
  name: 'Mobile Optimized',
  description: 'Balanced performance and battery life',
  settings: {
    // Sound - Moderate quality
    masterVolume: 60,
    soundEffects: true,
    soundEffectsVolume: 70,
    backgroundMusic: true,
    musicVolume: 50,
    dealerVoice: true,
    dealerVolume: 60,
    ambientSounds: true,
    ambientCasinoSounds: false, // Reduce for performance
    ambienceVolume: 40,
    
    // Display - Optimized for small screen
    tableFelt: 'green',
    chipStyle: 'classic',
    animationSpeed: 'fast', // Faster animations for responsiveness
    showBetAmounts: true,
    showOtherPlayerBets: true,
    highQualityGraphics: false, // Reduce for performance
    showWinAnimations: true,
    
    // Gameplay - Quick actions
    confirmBets: false, // Faster gameplay on mobile
    quickBetButtons: true,
    autoRebuy: true,
    autoRebuyAmount: 500,
    timeBank: 20,
    betInputMethod: 'buttons', // Touch-friendly
    
    // Social - Enabled
    enableChat: true,
    enableEmotes: true,
    showPlayerAvatars: true,
    
    // Voice Chat - Enabled but optimized
    voiceChatEnabled: true,
  },
  displayConfig: {
    viewport: {
      width: 1280,
      initialScale: 0.5,
      minimumScale: 0.1,
      maximumScale: 3.0,
    },
    fontSize: '110%', // Slightly larger for readability
    uiScale: 1.1,
    showMobileOptimizations: true,
  },
  performanceConfig: {
    tier: 'medium',
    targetFPS: 30,
    enableParticles: false,
    enableShadows: false,
    enableBlur: false,
  },
  audioConfig: {
    enableSpatialAudio: false,
    enableEcho: false,
    optimalMasterVolume: 60,
  },
};

/**
 * Tablet Optimal Settings (iPad, Android Tablet)
 */
const TABLET_SETTINGS: OptimalSettingsProfile = {
  name: 'Tablet Optimized',
  description: 'Enhanced visuals with good performance',
  settings: {
    // Sound - High quality
    masterVolume: 70,
    soundEffects: true,
    soundEffectsVolume: 75,
    backgroundMusic: true,
    musicVolume: 65,
    dealerVoice: true,
    dealerVolume: 70,
    ambientSounds: true,
    ambientCasinoSounds: true,
    ambienceVolume: 55,
    
    // Display - High quality
    tableFelt: 'green',
    chipStyle: 'classic',
    animationSpeed: 'normal',
    showBetAmounts: true,
    showOtherPlayerBets: true,
    highQualityGraphics: true,
    showWinAnimations: true,
    
    // Gameplay - Full features
    confirmBets: true,
    quickBetButtons: true,
    autoRebuy: true,
    autoRebuyAmount: 1000,
    timeBank: 30,
    betInputMethod: 'both',
    
    // Social - Enabled
    enableChat: true,
    enableEmotes: true,
    showPlayerAvatars: true,
    
    // Voice Chat - Enabled
    voiceChatEnabled: true,
  },
  displayConfig: {
    viewport: {
      width: 1280,
      initialScale: 0.7,
      minimumScale: 0.3,
      maximumScale: 3.0,
    },
    fontSize: '105%',
    uiScale: 1.0,
    showMobileOptimizations: true,
  },
  performanceConfig: {
    tier: 'high',
    targetFPS: 60,
    enableParticles: true,
    enableShadows: true,
    enableBlur: true,
  },
  audioConfig: {
    enableSpatialAudio: true,
    enableEcho: true,
    optimalMasterVolume: 70,
  },
};

/**
 * TV / Large Screen Optimal Settings
 */
const TV_SETTINGS: OptimalSettingsProfile = {
  name: 'TV Optimized',
  description: 'Large screen experience with enhanced visuals',
  settings: {
    // Sound - High volume for distance
    masterVolume: 80,
    soundEffects: true,
    soundEffectsVolume: 85,
    backgroundMusic: true,
    musicVolume: 75,
    dealerVoice: true,
    dealerVolume: 80,
    ambientSounds: true,
    ambientCasinoSounds: true,
    ambienceVolume: 70,
    
    // Display - Maximum quality
    tableFelt: 'green',
    chipStyle: 'classic',
    animationSpeed: 'normal',
    showBetAmounts: true,
    showOtherPlayerBets: true,
    highQualityGraphics: true,
    showWinAnimations: true,
    
    // Gameplay - Relaxed timing
    confirmBets: true,
    quickBetButtons: true,
    autoRebuy: true,
    autoRebuyAmount: 1000,
    timeBank: 45, // More time for remote control
    betInputMethod: 'both',
    
    // Social - Enabled
    enableChat: true,
    enableEmotes: true,
    showPlayerAvatars: true,
    
    // Voice Chat - Enabled
    voiceChatEnabled: true,
  },
  displayConfig: {
    fontSize: '130%', // Larger for TV viewing
    uiScale: 1.3,
    showMobileOptimizations: false,
  },
  performanceConfig: {
    tier: 'high',
    targetFPS: 60,
    enableParticles: true,
    enableShadows: true,
    enableBlur: true,
  },
  audioConfig: {
    enableSpatialAudio: true,
    enableEcho: true,
    optimalMasterVolume: 80,
  },
};

/**
 * Tesla / Car Browser Optimal Settings
 */
const TESLA_SETTINGS: OptimalSettingsProfile = {
  name: 'Tesla Optimized',
  description: 'Simplified interface for vehicle displays',
  settings: {
    // Sound - Moderate (car audio)
    masterVolume: 50,
    soundEffects: true,
    soundEffectsVolume: 60,
    backgroundMusic: true,
    musicVolume: 40,
    dealerVoice: true,
    dealerVolume: 60,
    ambientSounds: false, // Reduce distractions
    ambientCasinoSounds: false,
    ambienceVolume: 30,
    
    // Display - High visibility
    tableFelt: 'green',
    chipStyle: 'classic',
    animationSpeed: 'fast',
    showBetAmounts: true,
    showOtherPlayerBets: true,
    highQualityGraphics: true,
    showWinAnimations: true,
    
    // Gameplay - Quick and simple
    confirmBets: false,
    quickBetButtons: true,
    autoRebuy: true,
    autoRebuyAmount: 1000,
    timeBank: 20,
    betInputMethod: 'buttons',
    
    // Social - Minimal
    enableChat: false, // Reduce distractions
    enableEmotes: true,
    showPlayerAvatars: true,
    
    // Voice Chat - Disabled for safety
    voiceChatEnabled: false,
  },
  displayConfig: {
    fontSize: '120%',
    uiScale: 1.2,
    showMobileOptimizations: false,
  },
  performanceConfig: {
    tier: 'high',
    targetFPS: 60,
    enableParticles: false, // Reduce distractions
    enableShadows: true,
    enableBlur: false,
  },
  audioConfig: {
    enableSpatialAudio: false,
    enableEcho: false,
    optimalMasterVolume: 50,
  },
};

/**
 * Gaming Console Optimal Settings
 */
const CONSOLE_SETTINGS: OptimalSettingsProfile = {
  name: 'Console Optimized',
  description: 'Controller-friendly with TV optimization',
  settings: {
    // Sound - High quality
    masterVolume: 75,
    soundEffects: true,
    soundEffectsVolume: 80,
    backgroundMusic: true,
    musicVolume: 70,
    dealerVoice: true,
    dealerVolume: 75,
    ambientSounds: true,
    ambientCasinoSounds: true,
    ambienceVolume: 65,
    
    // Display - Console optimized
    tableFelt: 'green',
    chipStyle: 'classic',
    animationSpeed: 'normal',
    showBetAmounts: true,
    showOtherPlayerBets: true,
    highQualityGraphics: true,
    showWinAnimations: true,
    
    // Gameplay - Controller friendly
    confirmBets: true,
    quickBetButtons: true,
    autoRebuy: true,
    autoRebuyAmount: 1000,
    timeBank: 40,
    betInputMethod: 'buttons', // Controller-friendly
    
    // Social - Enabled
    enableChat: true,
    enableEmotes: true,
    showPlayerAvatars: true,
    
    // Voice Chat - Enabled
    voiceChatEnabled: true,
  },
  displayConfig: {
    fontSize: '125%',
    uiScale: 1.2,
    showMobileOptimizations: false,
  },
  performanceConfig: {
    tier: 'high',
    targetFPS: 60,
    enableParticles: true,
    enableShadows: true,
    enableBlur: true,
  },
  audioConfig: {
    enableSpatialAudio: true,
    enableEcho: true,
    optimalMasterVolume: 75,
  },
};

/**
 * Get optimal settings profile for a device
 */
export function getOptimalSettingsForDevice(deviceInfo: DeviceInfo): OptimalSettingsProfile {
  console.log('🎯 Getting optimal settings for device:', deviceInfo.deviceType);

  switch (deviceInfo.deviceType) {
    case 'tesla':
      console.log('✅ Applying Tesla-optimized settings');
      return TESLA_SETTINGS;
    
    case 'car':
      console.log('✅ Applying car browser settings (Tesla profile)');
      return TESLA_SETTINGS; // Use Tesla settings for all car browsers
    
    case 'tv':
      console.log('✅ Applying TV-optimized settings');
      return TV_SETTINGS;
    
    case 'gaming-console':
      console.log('✅ Applying gaming console settings');
      return CONSOLE_SETTINGS;
    
    case 'tablet':
      console.log('✅ Applying tablet-optimized settings');
      return TABLET_SETTINGS;
    
    case 'mobile':
      console.log('✅ Applying mobile-optimized settings');
      return MOBILE_SETTINGS;
    
    case 'desktop':
      console.log('✅ Applying desktop-optimized settings');
      return DESKTOP_SETTINGS;
    
    default:
      console.log('⚠️ Unknown device type, using desktop settings');
      return DESKTOP_SETTINGS;
  }
}

/**
 * Apply device-specific display configuration
 */
export function applyDeviceDisplayConfig(
  deviceInfo: DeviceInfo,
  profile: OptimalSettingsProfile
): void {
  console.log('🖥️ Applying device display configuration...');
  
  const { displayConfig } = profile;
  
  // Apply viewport settings for mobile devices
  if (displayConfig.viewport && (deviceInfo.deviceType === 'mobile' || deviceInfo.deviceType === 'tablet')) {
    const viewport = document.querySelector('meta[name="viewport"]') as HTMLMetaElement;
    if (viewport) {
      const { width, initialScale, minimumScale, maximumScale } = displayConfig.viewport;
      viewport.content = `width=${width}, initial-scale=${initialScale}, minimum-scale=${minimumScale}, maximum-scale=${maximumScale}, user-scalable=yes`;
      console.log(`✅ Viewport configured: ${viewport.content}`);
    }
  }
  
  // Apply font size
  document.body.style.fontSize = displayConfig.fontSize;
  console.log(`✅ Font size: ${displayConfig.fontSize}`);
  
  // Apply UI scale via CSS variable
  document.documentElement.style.setProperty('--ui-scale', displayConfig.uiScale.toString());
  console.log(`✅ UI scale: ${displayConfig.uiScale}x`);
  
  // Apply mobile optimizations flag
  if (displayConfig.showMobileOptimizations) {
    document.body.classList.add('mobile-optimized');
    console.log('✅ Mobile optimizations enabled');
  } else {
    document.body.classList.remove('mobile-optimized');
  }
  
  // Apply performance tier class
  document.body.setAttribute('data-performance-tier', profile.performanceConfig.tier);
  console.log(`✅ Performance tier: ${profile.performanceConfig.tier}`);
  
  // Device-specific adjustments
  switch (deviceInfo.deviceType) {
    case 'tesla':
    case 'car':
      document.body.classList.add('vehicle-mode');
      console.log('✅ Vehicle mode enabled (safety-focused UI)');
      break;
    
    case 'tv':
      document.body.classList.add('tv-mode');
      document.body.style.cursor = 'none'; // Hide cursor for TV remote
      console.log('✅ TV mode enabled (large screen UI)');
      break;
    
    case 'gaming-console':
      document.body.classList.add('console-mode');
      console.log('✅ Console mode enabled (controller-friendly UI)');
      break;
    
    case 'mobile':
      document.body.classList.add('touch-optimized');
      // Larger touch targets
      document.documentElement.style.setProperty('--touch-target-size', '48px');
      console.log('✅ Touch optimization enabled (larger tap targets)');
      break;
    
    case 'tablet':
      document.body.classList.add('touch-optimized');
      document.documentElement.style.setProperty('--touch-target-size', '44px');
      console.log('✅ Tablet touch optimization enabled');
      break;
  }
  
  console.log('✨ Display configuration applied successfully!');
}

/**
 * Get user-friendly description of applied settings
 */
export function getSettingsDescription(profile: OptimalSettingsProfile): string {
  const features: string[] = [];
  
  if (profile.performanceConfig.tier === 'high') {
    features.push('Maximum graphics quality');
  } else if (profile.performanceConfig.tier === 'medium') {
    features.push('Balanced performance');
  } else {
    features.push('Optimized for battery life');
  }
  
  if (profile.performanceConfig.targetFPS === 60) {
    features.push('60 FPS animations');
  } else {
    features.push('30 FPS (power saving)');
  }
  
  if (profile.audioConfig.enableSpatialAudio) {
    features.push('Spatial audio');
  }
  
  if (profile.displayConfig.showMobileOptimizations) {
    features.push('Touch-optimized controls');
  }
  
  return features.join(' • ');
}

/**
 * Check if settings should be auto-applied
 * (Don't override user's custom settings)
 */
export function shouldAutoApplySettings(): boolean {
  const hasCustomSettings = localStorage.getItem('rollers-paradise-settings');
  const hasAppliedOptimal = localStorage.getItem('optimal-settings-applied');
  
  // Only auto-apply if:
  // 1. User doesn't have custom settings, OR
  // 2. User hasn't been shown the optimal settings yet
  return !hasCustomSettings || !hasAppliedOptimal;
}

/**
 * Mark that optimal settings have been applied
 */
export function markOptimalSettingsApplied(): void {
  localStorage.setItem('optimal-settings-applied', 'true');
  localStorage.setItem('optimal-settings-applied-date', new Date().toISOString());
}

/**
 * Reset to allow re-applying optimal settings
 */
export function resetOptimalSettingsFlag(): void {
  localStorage.removeItem('optimal-settings-applied');
  localStorage.removeItem('optimal-settings-applied-date');
}
