/**
 * Device Detection & Information Gathering
 * Required for game regulations and legal compliance
 */

export interface DeviceInfo {
  // Device Type
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'tv' | 'car' | 'tesla' | 'gaming-console' | 'unknown';
  deviceModel?: string;
  
  // Operating System
  os: string;
  osVersion?: string;
  
  // Browser
  browser: string;
  browserVersion?: string;
  
  // Screen Info
  screenWidth: number;
  screenHeight: number;
  screenResolution: string;
  pixelRatio: number;
  orientation: 'portrait' | 'landscape';
  
  // Hardware Info
  cores?: number;
  memory?: number;
  touchSupport: boolean;
  
  // Network
  connection?: string;
  
  // Special Detections
  isTesla: boolean;
  isCarBrowser: boolean;
  isTV: boolean;
  isGamingConsole: boolean;
  
  // Raw Data
  userAgent: string;
  platform: string;
  
  // Location (if permitted)
  timezone: string;
  language: string;
  
  // Timestamps
  detectedAt: string;
  
  // Consent
  consentGiven: boolean;
  consentTimestamp?: string;
}

/**
 * Detect if device is a Tesla
 */
function detectTesla(userAgent: string): boolean {
  return /Tesla/i.test(userAgent) || 
         /QtCarBrowser/i.test(userAgent);
}

/**
 * Detect if device is in a car
 */
function detectCarBrowser(userAgent: string): boolean {
  const carIndicators = [
    /Tesla/i,
    /QtCarBrowser/i,
    /CarPlay/i,
    /Android.*Automotive/i,
    /Audi/i,
    /BMW/i,
    /Mercedes/i,
    /Ford/i,
    /Volvo/i,
    /Polestar/i,
    /Rivian/i,
  ];
  
  return carIndicators.some(pattern => pattern.test(userAgent));
}

/**
 * Detect if device is a TV
 */
function detectTV(userAgent: string): boolean {
  const tvIndicators = [
    /SmartTV/i,
    /TV/i,
    /AppleTV/i,
    /Roku/i,
    /Fire TV/i,
    /Android TV/i,
    /webOS/i,
    /Tizen/i,
  ];
  
  return tvIndicators.some(pattern => pattern.test(userAgent));
}

/**
 * Detect if device is a gaming console
 */
function detectGamingConsole(userAgent: string): boolean {
  const consoleIndicators = [
    /PlayStation/i,
    /Xbox/i,
    /Nintendo/i,
    /Steam Deck/i,
  ];
  
  return consoleIndicators.some(pattern => pattern.test(userAgent));
}

/**
 * Detect operating system
 */
function detectOS(userAgent: string): { name: string; version?: string } {
  if (/Windows NT 10/i.test(userAgent)) return { name: 'Windows', version: '10' };
  if (/Windows NT 11/i.test(userAgent)) return { name: 'Windows', version: '11' };
  if (/Windows/i.test(userAgent)) return { name: 'Windows' };
  
  if (/Mac OS X ([\d._]+)/i.test(userAgent)) {
    const match = userAgent.match(/Mac OS X ([\d._]+)/i);
    return { name: 'macOS', version: match?.[1]?.replace(/_/g, '.') };
  }
  if (/Macintosh/i.test(userAgent)) return { name: 'macOS' };
  
  if (/Android ([\d.]+)/i.test(userAgent)) {
    const match = userAgent.match(/Android ([\d.]+)/i);
    return { name: 'Android', version: match?.[1] };
  }
  
  if (/iPhone OS ([\d_]+)/i.test(userAgent)) {
    const match = userAgent.match(/iPhone OS ([\d_]+)/i);
    return { name: 'iOS', version: match?.[1]?.replace(/_/g, '.') };
  }
  if (/iPad.*OS ([\d_]+)/i.test(userAgent)) {
    const match = userAgent.match(/iPad.*OS ([\d_]+)/i);
    return { name: 'iPadOS', version: match?.[1]?.replace(/_/g, '.') };
  }
  
  if (/Linux/i.test(userAgent)) return { name: 'Linux' };
  if (/CrOS/i.test(userAgent)) return { name: 'Chrome OS' };
  
  return { name: 'Unknown' };
}

/**
 * Detect browser
 */
function detectBrowser(userAgent: string): { name: string; version?: string } {
  if (/Edg\/([\d.]+)/i.test(userAgent)) {
    const match = userAgent.match(/Edg\/([\d.]+)/i);
    return { name: 'Edge', version: match?.[1] };
  }
  
  if (/Chrome\/([\d.]+)/i.test(userAgent) && !/Edg/i.test(userAgent)) {
    const match = userAgent.match(/Chrome\/([\d.]+)/i);
    return { name: 'Chrome', version: match?.[1] };
  }
  
  if (/Safari\/([\d.]+)/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
    const match = userAgent.match(/Version\/([\d.]+)/i);
    return { name: 'Safari', version: match?.[1] };
  }
  
  if (/Firefox\/([\d.]+)/i.test(userAgent)) {
    const match = userAgent.match(/Firefox\/([\d.]+)/i);
    return { name: 'Firefox', version: match?.[1] };
  }
  
  if (/Tesla/i.test(userAgent)) {
    return { name: 'Tesla Browser' };
  }
  
  return { name: 'Unknown' };
}

/**
 * Detect device model (if possible)
 */
function detectDeviceModel(userAgent: string): string | undefined {
  // Tesla Models
  if (/Tesla Model S/i.test(userAgent)) return 'Tesla Model S';
  if (/Tesla Model 3/i.test(userAgent)) return 'Tesla Model 3';
  if (/Tesla Model X/i.test(userAgent)) return 'Tesla Model X';
  if (/Tesla Model Y/i.test(userAgent)) return 'Tesla Model Y';
  
  // iPhone Models
  if (/iPhone/i.test(userAgent)) {
    if (/iPhone14/i.test(userAgent)) return 'iPhone 14';
    if (/iPhone13/i.test(userAgent)) return 'iPhone 13';
    if (/iPhone12/i.test(userAgent)) return 'iPhone 12';
    return 'iPhone';
  }
  
  // iPad Models
  if (/iPad/i.test(userAgent)) {
    if (/iPad Pro/i.test(userAgent)) return 'iPad Pro';
    if (/iPad Air/i.test(userAgent)) return 'iPad Air';
    if (/iPad Mini/i.test(userAgent)) return 'iPad Mini';
    return 'iPad';
  }
  
  // Samsung
  if (/SM-[A-Z0-9]+/i.test(userAgent)) {
    const match = userAgent.match(/SM-([A-Z0-9]+)/i);
    return `Samsung ${match?.[0]}`;
  }
  
  return undefined;
}

/**
 * Detect device type
 */
function detectDeviceType(userAgent: string, isTesla: boolean, isCarBrowser: boolean, isTV: boolean, isGamingConsole: boolean): DeviceInfo['deviceType'] {
  if (isTesla) return 'tesla';
  if (isCarBrowser) return 'car';
  if (isTV) return 'tv';
  if (isGamingConsole) return 'gaming-console';
  
  // Mobile detection
  if (/Mobile|Android|iPhone/i.test(userAgent)) {
    // Tablet detection
    if (/iPad|Android.*Tablet|Tablet/i.test(userAgent)) {
      return 'tablet';
    }
    return 'mobile';
  }
  
  // Tablet-specific patterns
  if (/iPad|Tablet/i.test(userAgent)) {
    return 'tablet';
  }
  
  // Desktop
  if (/Windows|Macintosh|Linux/i.test(userAgent)) {
    return 'desktop';
  }
  
  return 'unknown';
}

/**
 * Get comprehensive device information
 */
export async function getDeviceInfo(): Promise<DeviceInfo> {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  // Special detections
  const isTesla = detectTesla(userAgent);
  const isCarBrowser = detectCarBrowser(userAgent);
  const isTV = detectTV(userAgent);
  const isGamingConsole = detectGamingConsole(userAgent);
  
  // OS and Browser
  const os = detectOS(userAgent);
  const browser = detectBrowser(userAgent);
  
  // Device type and model
  const deviceType = detectDeviceType(userAgent, isTesla, isCarBrowser, isTV, isGamingConsole);
  const deviceModel = detectDeviceModel(userAgent);
  
  // Screen info
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const pixelRatio = window.devicePixelRatio || 1;
  const orientation = window.innerWidth > window.innerHeight ? 'landscape' : 'portrait';
  
  // Hardware info
  const cores = (navigator as any).hardwareConcurrency;
  const memory = (navigator as any).deviceMemory;
  const touchSupport = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Network info
  const connection = (navigator as any).connection?.effectiveType;
  
  // Location info
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  
  const deviceInfo: DeviceInfo = {
    deviceType,
    deviceModel,
    os: os.name,
    osVersion: os.version,
    browser: browser.name,
    browserVersion: browser.version,
    screenWidth,
    screenHeight,
    screenResolution: `${screenWidth}x${screenHeight}`,
    pixelRatio,
    orientation,
    cores,
    memory,
    touchSupport,
    connection,
    isTesla,
    isCarBrowser,
    isTV,
    isGamingConsole,
    userAgent,
    platform,
    timezone,
    language,
    detectedAt: new Date().toISOString(),
    consentGiven: false,
  };
  
  return deviceInfo;
}

/**
 * Get human-readable device description
 */
export function getDeviceDescription(deviceInfo: DeviceInfo): string {
  const parts: string[] = [];
  
  // Device model or type
  if (deviceInfo.deviceModel) {
    parts.push(deviceInfo.deviceModel);
  } else {
    const typeNames: Record<DeviceInfo['deviceType'], string> = {
      'tesla': 'Tesla Vehicle',
      'car': 'Car Browser',
      'tv': 'Smart TV',
      'gaming-console': 'Gaming Console',
      'desktop': 'Desktop Computer',
      'mobile': 'Mobile Phone',
      'tablet': 'Tablet',
      'unknown': 'Unknown Device',
    };
    parts.push(typeNames[deviceInfo.deviceType]);
  }
  
  // OS
  if (deviceInfo.os !== 'Unknown') {
    if (deviceInfo.osVersion) {
      parts.push(`${deviceInfo.os} ${deviceInfo.osVersion}`);
    } else {
      parts.push(deviceInfo.os);
    }
  }
  
  // Browser
  if (deviceInfo.browser !== 'Unknown') {
    if (deviceInfo.browserVersion) {
      parts.push(`${deviceInfo.browser} ${deviceInfo.browserVersion}`);
    } else {
      parts.push(deviceInfo.browser);
    }
  }
  
  return parts.join(' • ');
}

/**
 * Get device emoji icon
 */
export function getDeviceEmoji(deviceType: DeviceInfo['deviceType']): string {
  const emojiMap: Record<DeviceInfo['deviceType'], string> = {
    'tesla': '🚗',
    'car': '🚙',
    'tv': '📺',
    'gaming-console': '🎮',
    'desktop': '💻',
    'mobile': '📱',
    'tablet': '📱',
    'unknown': '🖥️',
  };
  
  return emojiMap[deviceType];
}

/**
 * Check if device type is allowed to play
 * (You can customize this based on regulations)
 */
export function isDeviceAllowedToPlay(deviceInfo: DeviceInfo): { allowed: boolean; reason?: string } {
  // Example: You might want to restrict certain devices
  // For now, we allow all devices but log them for compliance
  
  // Potential restriction example:
  // if (deviceInfo.isCarBrowser && !deviceInfo.isTesla) {
  //   return {
  //     allowed: false,
  //     reason: 'For safety reasons, playing while driving is not permitted.'
  //   };
  // }
  
  return { allowed: true };
}

/**
 * Store device info consent in localStorage
 */
export function storeDeviceConsent(deviceInfo: DeviceInfo): void {
  const consentData = {
    ...deviceInfo,
    consentGiven: true,
    consentTimestamp: new Date().toISOString(),
  };
  
  localStorage.setItem('casino_device_consent', JSON.stringify(consentData));
}

/**
 * Get stored device consent
 */
export function getStoredDeviceConsent(): DeviceInfo | null {
  try {
    const stored = localStorage.getItem('casino_device_consent');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to get stored device consent:', error);
  }
  return null;
}

/**
 * Check if user has given device consent
 */
export function hasDeviceConsent(): boolean {
  const stored = getStoredDeviceConsent();
  return stored !== null && stored.consentGiven === true;
}

/**
 * Clear device consent (for testing or user request)
 */
export function clearDeviceConsent(): void {
  localStorage.removeItem('casino_device_consent');
}

/**
 * Detect device capabilities for game optimization
 * (Legacy function for compatibility)
 */
export async function detectDeviceCapabilities() {
  const deviceInfo = await getDeviceInfo();
  
  return {
    isMobile: deviceInfo.deviceType === 'mobile' || deviceInfo.deviceType === 'tablet',
    isTablet: deviceInfo.deviceType === 'tablet',
    isDesktop: deviceInfo.deviceType === 'desktop',
    isTouchDevice: deviceInfo.touchSupport,
    screenWidth: deviceInfo.screenWidth,
    screenHeight: deviceInfo.screenHeight,
    pixelRatio: deviceInfo.pixelRatio,
    cores: deviceInfo.cores || 4,
    memory: deviceInfo.memory || 4,
    connectionType: deviceInfo.connection || 'unknown',
    orientation: deviceInfo.orientation,
    
    // Additional capabilities
    hasWebGL: (() => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch (e) {
        return false;
      }
    })(),
    
    hasWebAudio: typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined',
    
    hasFullscreen: document.fullscreenEnabled || (document as any).webkitFullscreenEnabled || (document as any).mozFullScreenEnabled || (document as any).msFullscreenEnabled,
    
    hasNotifications: 'Notification' in window,
    
    hasVibration: 'vibrate' in navigator,
    
    hasGeolocation: 'geolocation' in navigator,
    
    // Performance tier
    performanceTier: (() => {
      const cores = deviceInfo.cores || 4;
      const memory = deviceInfo.memory || 4;
      
      if (cores >= 8 && memory >= 8) return 'high';
      if (cores >= 4 && memory >= 4) return 'medium';
      return 'low';
    })(),
  };
}

/**
 * Apply recommended settings based on device capabilities
 * (Legacy function for compatibility)
 */
export async function applyRecommendedSettings(capabilities?: any) {
  if (!capabilities) {
    capabilities = await detectDeviceCapabilities();
  }
  
  console.log('📱 Applying recommended settings for device:', capabilities.performanceTier);
  
  // These settings can be used by the app
  const recommendations = {
    // Graphics settings
    enableAnimations: capabilities.performanceTier !== 'low',
    enableParticles: capabilities.performanceTier === 'high',
    enableShadows: capabilities.performanceTier === 'high',
    
    // Audio settings
    enableSoundEffects: capabilities.hasWebAudio,
    enableMusic: capabilities.hasWebAudio,
    
    // UI settings
    enableFullscreen: capabilities.hasFullscreen && !capabilities.isMobile,
    enableNotifications: capabilities.hasNotifications,
    enableVibration: capabilities.hasVibration && capabilities.isMobile,
    
    // Performance settings
    targetFPS: capabilities.performanceTier === 'high' ? 60 : 30,
    enableAutoQuality: true,
    
    // Mobile-specific
    showTouchControls: capabilities.isTouchDevice,
    enableGestures: capabilities.isTouchDevice,
    scaleFactor: capabilities.isMobile ? 1.2 : 1.0,
  };
  
  console.log('✅ Recommended settings:', recommendations);
  
  return recommendations;
}

/**
 * Enter fullscreen mode
 * (Legacy function for compatibility)
 */
export function enterFullscreen(): void {
  const elem = document.documentElement;
  
  if (elem.requestFullscreen) {
    elem.requestFullscreen().catch((err) => {
      console.warn('Failed to enter fullscreen:', err);
    });
  } else if ((elem as any).webkitRequestFullscreen) {
    (elem as any).webkitRequestFullscreen();
  } else if ((elem as any).mozRequestFullScreen) {
    (elem as any).mozRequestFullScreen();
  } else if ((elem as any).msRequestFullscreen) {
    (elem as any).msRequestFullscreen();
  }
}

/**
 * Exit fullscreen mode
 * Cross-browser compatible implementation
 */
export function exitFullscreen(): Promise<void> {
  if (document.exitFullscreen) {
    return document.exitFullscreen().catch((err) => {
      console.warn('Failed to exit fullscreen:', err);
    });
  } else if ((document as any).webkitExitFullscreen) {
    return (document as any).webkitExitFullscreen();
  } else if ((document as any).mozCancelFullScreen) {
    return (document as any).mozCancelFullScreen();
  } else if ((document as any).msExitFullscreen) {
    return (document as any).msExitFullscreen();
  }
  return Promise.resolve();
}

/**
 * Check if currently in fullscreen mode
 * Cross-browser compatible implementation
 */
export function isFullscreen(): boolean {
  return !!(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  );
}
