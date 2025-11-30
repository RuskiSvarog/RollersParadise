import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameSettingsType } from '../components/GameSettings';
import { setDealerVolume, setDealerEnabled } from '../utils/dealerVoice';

const defaultSettings: GameSettingsType = {
  // Sound Settings - 🔇 MUSIC OFF BY DEFAULT (User must enable)
  masterVolume: 70,
  soundEffects: true,  // ✅ ON BY DEFAULT!
  soundEffectsVolume: 80,
  backgroundMusic: false,  // 🔇 OFF BY DEFAULT - User controls music!
  musicVolume: 70,
  dealerVoice: true,  // ✅ ON BY DEFAULT!
  dealerVolume: 70,
  ambientSounds: true,  // ✅ ON BY DEFAULT!
  ambientCasinoSounds: true,  // ✅ ON BY DEFAULT!
  ambienceVolume: 60,
  
  // Display Settings - ✅ ALL ON BY DEFAULT!
  tableFelt: 'green',
  chipStyle: 'classic',
  animationSpeed: 'normal',
  showBetAmounts: true,
  showOtherPlayerBets: true,
  highQualityGraphics: true,
  
  // Gameplay Settings - ✅ ALL ON BY DEFAULT!
  confirmBets: true,  // ✅ ON BY DEFAULT!
  quickBetButtons: true,
  autoRebuy: true,  // ✅ ON BY DEFAULT!
  autoRebuyAmount: 1000,
  timeBank: 30,
  betInputMethod: 'both',
  showWinAnimations: true,
  quickRollMode: false,  // ⚡ OFF BY DEFAULT - Instant results without animation
  
  // Chat & Social - ✅ ALL ON BY DEFAULT!
  enableChat: true,
  enableEmotes: true,
  showPlayerAvatars: true,
  mutePlayers: [],
  
  // Privacy & Account - ✅ ALL ON BY DEFAULT!
  showBalance: true,
  showHandHistory: true,
  saveGameStats: true,
  notifications: true,
  emailNotifications: true,  // ✅ ON BY DEFAULT!
  
  // Accessibility - DEFAULTS (OFF unless needed for accessibility)
  highContrast: false,
  largeText: false,
  colorBlindMode: 'none',
  screenReader: false,
  
  // Voice Chat Audio Devices
  voiceChatInputDevice: 'default',
  voiceChatOutputDevice: 'default',
  voiceChatEnabled: true,
};

interface SettingsContextType {
  settings: GameSettingsType;
  updateSettings: (newSettings: GameSettingsType) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<GameSettingsType>(() => {
    // Load settings from localStorage on mount
    try {
      const saved = localStorage.getItem('rollers-paradise-settings');
      if (saved) {
        return { ...defaultSettings, ...JSON.parse(saved) };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return defaultSettings;
  });

  // Apply settings whenever they change
  useEffect(() => {
    applySettings(settings);
    
    // Sync dealer voice with settings
    const dealerActualVolume = (settings.dealerVolume / 100) * (settings.masterVolume / 100);
    setDealerVolume(dealerActualVolume);
    setDealerEnabled(settings.dealerVoice);
    
    // Save to localStorage
    try {
      localStorage.setItem('rollers-paradise-settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);

  const updateSettings = (newSettings: GameSettingsType) => {
    console.log('🔄 Updating settings with:', newSettings);
    setSettings(prevSettings => {
      const updated = { ...prevSettings, ...newSettings };
      console.log('✅ Settings updated! New musicVolume:', updated.musicVolume);
      return updated;
    });
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Apply settings to the DOM and CSS
function applySettings(settings: GameSettingsType) {
  const root = document.documentElement;
  const body = document.body;

  console.log('🎨 Applying settings:', settings);

  // Apply animations based on speed
  body.setAttribute('data-animation-speed', settings.animationSpeed);
  if (settings.animationSpeed === 'instant') {
    root.classList.add('reduce-motion');
  } else {
    root.classList.remove('reduce-motion');
  }
  console.log(`✅ Animation speed: ${settings.animationSpeed}`);

  // Apply text size - Use safe 112% increase (realistic and prevents layout issues)
  if (settings.largeText) {
    root.classList.add('large-text');
    body.style.fontSize = '112%'; // Subtle but noticeable improvement
    console.log('✅ Large text enabled (112%)');
  } else {
    root.classList.remove('large-text');
    body.style.fontSize = '100%';
    console.log('✅ Normal text (100%)');
  }

  // Apply high contrast
  if (settings.highContrast) {
    root.classList.add('high-contrast');
    console.log('✅ High contrast enabled');
  } else {
    root.classList.remove('high-contrast');
    console.log('✅ Normal contrast');
  }

  // Apply colorblind mode
  root.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
  if (settings.colorBlindMode !== 'none') {
    root.classList.add(settings.colorBlindMode);
    console.log(`✅ Color blind mode: ${settings.colorBlindMode}`);
  }

  // Apply table felt color
  body.setAttribute('data-table-felt', settings.tableFelt);
  console.log(`✅ Table felt: ${settings.tableFelt}`);

  // Apply chip style
  body.setAttribute('data-chip-style', settings.chipStyle);
  console.log(`✅ Chip style: ${settings.chipStyle}`);

  // Apply graphics quality
  body.setAttribute('data-quality', settings.highQualityGraphics ? 'high' : 'low');
  console.log(`✅ Graphics quality: ${settings.highQualityGraphics ? 'high' : 'low'}`);

  // Win animations
  if (!settings.showWinAnimations) {
    root.classList.add('disable-win-animations');
    console.log('✅ Win animations disabled');
  } else {
    root.classList.remove('disable-win-animations');
    console.log('✅ Win animations enabled');
  }

  // Screen reader support
  if (settings.screenReader) {
    body.setAttribute('aria-live', 'polite');
    console.log('✅ Screen reader support enabled');
  } else {
    body.removeAttribute('aria-live');
  }

  console.log('✨ All settings applied successfully!');
}