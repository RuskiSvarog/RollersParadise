import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Monitor, 
  Gamepad2,
  MessageSquare,
  Shield,
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Palette,
  Eye,
  Zap,
  Sparkles,
  Music,
  Mic,
  Speaker,
  Headphones,
  Image,
  Film,
  Gauge,
  Layout,
  Type,
  Accessibility,
  Hand,
  Keyboard,
  MousePointer,
  Users,
  Lock,
  Globe,
  Bell,
  Target,
  Boxes,
  Layers,
  Circle
} from 'lucide-react'

;

export interface AdvancedGameSettingsType {
  // ===== AUDIO SETTINGS (10+) =====
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  voiceVolume: number;
  ambientVolume: number;
  musicGenre: 'jazz' | 'lounge' | 'electronic' | 'orchestral' | 'rock' | 'custom';
  voiceType: 'male' | 'female' | 'robotic' | 'off';
  sfxPack: 'classic' | 'modern' | 'luxury' | 'retro';
  audioQuality: 'low' | 'medium' | 'high' | 'lossless';
  muteOnTabSwitch: boolean;
  spatialAudio: boolean;
  
  // ===== VISUAL/DISPLAY SETTINGS (20+) =====
  tableFeltColor: 'green' | 'blue' | 'red' | 'purple' | 'black' | 'teal' | 'burgundy';
  tableLayout: 'classic' | 'modern' | 'luxury' | 'minimalist';
  chipDesign: 'classic' | 'modern' | 'luxury' | 'neon' | 'casino' | 'custom';
  diceSkin: 'classic' | 'gold' | 'diamond' | 'neon' | 'transparent' | 'ivory';
  backgroundTheme: 'tropical' | 'vegas' | 'neon' | 'luxury' | 'space' | 'underwater' | 'casino';
  animationSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  graphicsQuality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: '720p' | '1080p' | '1440p' | '4K';
  fpsTarget: 30 | 60 | 120 | 144 | 240;
  showBetAmounts: boolean;
  showOtherPlayerBets: boolean;
  showStatistics: boolean;
  lightingEffects: boolean;
  particleEffects: boolean;
  winAnimations: boolean;
  glowEffects: boolean;
  shadowQuality: 'none' | 'low' | 'medium' | 'high';
  antiAliasing: boolean;
  bloomEffect: boolean;
  vignette: boolean;
  
  // ===== GAMEPLAY SETTINGS (12+) =====
  confirmBets: boolean;
  quickBetButtons: boolean;
  autoRebuy: boolean;
  autoRebuyAmount: number;
  timeBank: number;
  betInputMethod: 'slider' | 'buttons' | 'keyboard' | 'both';
  defaultBetAmount: number;
  maxBetLimit: number;
  autoClearBets: boolean;
  rollSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  showOddsCalculator: boolean;
  autoAcceptOdds: boolean;
  
  // ===== INTERFACE/UI SETTINGS (12+) =====
  uiScale: number; // 80-150%
  uiPosition: 'top' | 'bottom' | 'left' | 'right';
  chatPosition: 'right' | 'left' | 'bottom';
  showMiniMap: boolean;
  showPlayerList: boolean;
  hudTransparency: number; // 0-100
  buttonSize: 'small' | 'medium' | 'large' | 'xlarge';
  fontSize: 'small' | 'medium' | 'large' | 'xlarge';
  fontFamily: 'default' | 'arial' | 'georgia' | 'courier' | 'impact';
  colorScheme: 'default' | 'dark' | 'light' | 'colorful';
  showTooltips: boolean;
  tooltipDelay: number; // ms
  
  // ===== ACCESSIBILITY SETTINGS (12+) =====
  highContrast: boolean;
  largeText: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  screenReader: boolean;
  reducedMotion: boolean;
  keyboardShortcuts: boolean;
  oneHandMode: boolean;
  touchFeedback: boolean;
  audioDescriptions: boolean;
  simplifiedUI: boolean;
  focusIndicators: boolean;
  flashingLights: boolean; // disable for photosensitivity
  
  // ===== SOCIAL/PRIVACY SETTINGS (8+) =====
  showBalance: boolean;
  showProfile: boolean;
  enableChat: boolean;
  enableEmotes: boolean;
  showAvatar: boolean;
  onlineStatus: 'online' | 'away' | 'invisible';
  allowFriendRequests: boolean;
  mutedPlayers: string[];
}

export const defaultAdvancedSettings: AdvancedGameSettingsType = {
  // Audio
  masterVolume: 70,
  sfxVolume: 80,
  musicVolume: 60,
  voiceVolume: 70,
  ambientVolume: 40,
  musicGenre: 'jazz',
  voiceType: 'male',
  sfxPack: 'classic',
  audioQuality: 'high',
  muteOnTabSwitch: false,
  spatialAudio: true,
  
  // Visual
  tableFeltColor: 'green',
  tableLayout: 'classic',
  chipDesign: 'classic',
  diceSkin: 'classic',
  backgroundTheme: 'casino',
  animationSpeed: 'normal',
  graphicsQuality: 'high',
  resolution: '1080p',
  fpsTarget: 60,
  showBetAmounts: true,
  showOtherPlayerBets: true,
  showStatistics: true,
  lightingEffects: true,
  particleEffects: true,
  winAnimations: true,
  glowEffects: true,
  shadowQuality: 'medium',
  antiAliasing: true,
  bloomEffect: true,
  vignette: false,
  
  // Gameplay
  confirmBets: false,
  quickBetButtons: true,
  autoRebuy: false,
  autoRebuyAmount: 1000,
  timeBank: 30,
  betInputMethod: 'both',
  defaultBetAmount: 5,
  maxBetLimit: 10000,
  autoClearBets: false,
  rollSpeed: 'normal',
  showOddsCalculator: true,
  autoAcceptOdds: false,
  
  // UI
  uiScale: 100,
  uiPosition: 'top',
  chatPosition: 'right',
  showMiniMap: false,
  showPlayerList: true,
  hudTransparency: 10,
  buttonSize: 'medium',
  fontSize: 'medium',
  fontFamily: 'default',
  colorScheme: 'default',
  showTooltips: true,
  tooltipDelay: 500,
  
  // Accessibility
  highContrast: false,
  largeText: false,
  colorBlindMode: 'none',
  screenReader: false,
  reducedMotion: false,
  keyboardShortcuts: true,
  oneHandMode: false,
  touchFeedback: true,
  audioDescriptions: false,
  simplifiedUI: false,
  focusIndicators: true,
  flashingLights: true,
  
  // Social
  showBalance: true,
  showProfile: true,
  enableChat: true,
  enableEmotes: true,
  showAvatar: true,
  onlineStatus: 'online',
  allowFriendRequests: true,
  mutedPlayers: [],
};

interface AdvancedGameSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AdvancedGameSettingsType;
  onSettingsChange: (settings: AdvancedGameSettingsType) => void;
}

type SettingsTab = 'audio' | 'visual' | 'gameplay' | 'ui' | 'accessibility' | 'social';

export function AdvancedGameSettings({ isOpen, onClose, settings, onSettingsChange }: AdvancedGameSettingsProps) {
  const [localSettings, setLocalSettings] = useState<AdvancedGameSettingsType>(settings);
  const [activeTab, setActiveTab] = useState<SettingsTab>('visual');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleChange = <K extends keyof AdvancedGameSettingsType>(
    key: K,
    value: AdvancedGameSettingsType[K]
  ) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    setHasChanges(true);
    
    // APPLY SETTINGS IMMEDIATELY IN REAL-TIME
    applySettingInRealTime(key, value, newSettings);
  };

  // Apply settings in real-time as user changes them
  const applySettingInRealTime = <K extends keyof AdvancedGameSettingsType>(
    key: K,
    value: AdvancedGameSettingsType[K],
    allSettings: AdvancedGameSettingsType
  ) => {
    // Audio settings - apply immediately
    if (key === 'masterVolume' || key === 'musicVolume' || key === 'sfxVolume' || key === 'voiceVolume' || key === 'ambientVolume') {
      // Find all audio elements and update volume
      const audioElements = document.querySelectorAll('audio, video');
      audioElements.forEach((el: any) => {
        if (el.volume !== undefined) {
          const volumePercent = (allSettings.masterVolume / 100);
          
          if (el.classList.contains('music') || el.id === 'background-music') {
            el.volume = (allSettings.musicVolume / 100) * volumePercent;
          } else if (el.classList.contains('sfx')) {
            el.volume = (allSettings.sfxVolume / 100) * volumePercent;
          } else if (el.classList.contains('voice')) {
            el.volume = (allSettings.voiceVolume / 100) * volumePercent;
          } else if (el.classList.contains('ambient')) {
            el.volume = (allSettings.ambientVolume / 100) * volumePercent;
          }
        }
      });
      console.log(`🔊 ${key} changed to ${value}% - Applied to all audio elements`);
    }
    
    // Visual settings - apply to body/document
    if (key === 'tableFeltColor') {
      document.body.setAttribute('data-table-felt', value as string);
      console.log(`🎨 Table felt color changed to ${value}`);
    }
    
    if (key === 'graphicsQuality') {
      document.body.setAttribute('data-quality', value as string);
      console.log(`🖥️ Graphics quality changed to ${value}`);
    }
    
    if (key === 'resolution') {
      document.body.setAttribute('data-resolution', value as string);
      console.log(`📺 Resolution changed to ${value}`);
    }
    
    if (key === 'animationSpeed') {
      document.body.setAttribute('data-animation-speed', value as string);
      console.log(`⚡ Animation speed changed to ${value}`);
    }
    
    if (key === 'backgroundTheme') {
      document.body.setAttribute('data-theme', value as string);
      console.log(`🌈 Background theme changed to ${value}`);
    }
    
    // Accessibility settings
    if (key === 'highContrast') {
      if (value) {
        document.body.classList.add('high-contrast');
      } else {
        document.body.classList.remove('high-contrast');
      }
      console.log(`🔆 High contrast mode: ${value ? 'ON' : 'OFF'}`);
    }
    
    if (key === 'largeText') {
      const body = document.body;
      if (value) {
        body.classList.add('large-text');
        body.style.fontSize = '112%'; // Safe, realistic text increase
      } else {
        body.classList.remove('large-text');
        body.style.fontSize = '100%';
      }
      console.log(`📝 Large text mode: ${value ? 'ON (112%)' : 'OFF (100%)'}`);
    }
    
    if (key === 'colorBlindMode') {
      // Remove all color blind classes
      document.body.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
      if (value !== 'none') {
        document.body.classList.add(value as string);
      }
      console.log(`👁️ Color blind mode: ${value}`);
    }
    
    if (key === 'reducedMotion') {
      if (value) {
        document.body.classList.add('reduce-motion');
        document.body.setAttribute('data-animations', 'disabled');
      } else {
        document.body.classList.remove('reduce-motion');
        document.body.removeAttribute('data-animations');
      }
      console.log(`🏃 Reduced motion: ${value ? 'ON' : 'OFF'}`);
    }
    
    if (key === 'particleEffects') {
      if (!value) {
        document.body.classList.add('disable-particles');
      } else {
        document.body.classList.remove('disable-particles');
      }
      console.log(`✨ Particle effects: ${value ? 'ON' : 'OFF'}`);
    }
    
    if (key === 'winAnimations') {
      if (!value) {
        document.body.classList.add('disable-win-animations');
      } else {
        document.body.classList.remove('disable-win-animations');
      }
      console.log(`🎉 Win animations: ${value ? 'ON' : 'OFF'}`);
    }
    
    if (key === 'uiScale') {
      document.documentElement.style.setProperty('zoom', `${value / 100}`);
      console.log(`🔍 UI Scale changed to ${value}%`);
    }
    
    if (key === 'hudTransparency') {
      const hudElements = document.querySelectorAll('.hud, .ui-panel, [class*="hud-"]');
      hudElements.forEach((el: any) => {
        el.style.opacity = `${1 - (value as number) / 100}`;
      });
      console.log(`👻 HUD transparency changed to ${value}%`);
    }
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    setHasChanges(false);
    // Save to localStorage
    localStorage.setItem('advancedGameSettings', JSON.stringify(localSettings));
  };

  const handleReset = () => {
    if (confirm('Reset all settings to default? This cannot be undone.')) {
      setLocalSettings(defaultAdvancedSettings);
      setHasChanges(true);
    }
  };

  if (!isOpen) return null;

  const tabs: { id: SettingsTab; label: string; icon: any; count: number }[] = [
    { id: 'audio', label: 'Audio', icon: Headphones, count: 11 },
    { id: 'visual', label: 'Visual', icon: Eye, count: 21 },
    { id: 'gameplay', label: 'Gameplay', icon: Gamepad2, count: 12 },
    { id: 'ui', label: 'Interface', icon: Layout, count: 12 },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility, count: 12 },
    { id: 'social', label: 'Social', icon: Users, count: 8 },
  ];

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(8px)',
        }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-7xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl"
          style={{
            background: 'linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
            border: '3px solid',
            borderImage: 'linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f59e0b 100%) 1',
            boxShadow: '0 0 60px rgba(168, 85, 247, 0.4)',
          }}
        >
          {/* Header */}
          <div 
            className="relative p-6 border-b-2"
            style={{ 
              borderColor: 'rgba(168, 85, 247, 0.3)',
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)',
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <SettingsIcon className="w-10 h-10 text-purple-500" />
                </motion.div>
                <div>
                  <h2 className="text-4xl font-black" style={{ color: '#a855f7' }}>
                    ADVANCED GAME SETTINGS
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Customize every aspect of your gaming experience • 76 Options Available
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {hasChanges && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: 'rgba(251, 191, 36, 0.2)',
                      border: '1px solid rgba(251, 191, 36, 0.5)',
                      color: '#fbbf24',
                    }}
                  >
                    ⚠️ UNSAVED CHANGES
                  </motion.div>
                )}
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg transition-all hover:bg-red-600/20"
                  style={{ color: '#ef4444' }}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div 
            className="flex gap-2 p-4 overflow-x-auto"
            style={{ 
              background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.8) 0%, rgba(26, 26, 26, 0.8) 100%)',
              borderBottom: '2px solid rgba(168, 85, 247, 0.2)',
            }}
          >
            {tabs.map((tab) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-3 px-6 py-3 rounded-xl transition-all whitespace-nowrap"
                style={{
                  background: activeTab === tab.id 
                    ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.3) 0%, rgba(236, 72, 153, 0.3) 100%)'
                    : 'rgba(26, 26, 26, 0.5)',
                  border: `2px solid ${activeTab === tab.id ? '#a855f7' : 'rgba(168, 85, 247, 0.2)'}`,
                  color: activeTab === tab.id ? '#fff' : '#9ca3af',
                  boxShadow: activeTab === tab.id ? '0 0 20px rgba(168, 85, 247, 0.4)' : 'none',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <tab.icon className="w-5 h-5" />
                <span className="font-bold">{tab.label}</span>
                <span 
                  className="px-2 py-0.5 rounded-full text-xs font-bold"
                  style={{
                    background: activeTab === tab.id ? 'rgba(251, 191, 36, 0.3)' : 'rgba(156, 163, 175, 0.2)',
                    color: activeTab === tab.id ? '#fbbf24' : '#9ca3af',
                  }}
                >
                  {tab.count}
                </span>
              </motion.button>
            ))}
          </div>

          {/* Settings Content */}
          <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 300px)' }}>
            {activeTab === 'audio' && <AudioSettings settings={localSettings} onChange={handleChange} />}
            {activeTab === 'visual' && <VisualSettings settings={localSettings} onChange={handleChange} />}
            {activeTab === 'gameplay' && <GameplaySettings settings={localSettings} onChange={handleChange} />}
            {activeTab === 'ui' && <UISettings settings={localSettings} onChange={handleChange} />}
            {activeTab === 'accessibility' && <AccessibilitySettings settings={localSettings} onChange={handleChange} />}
            {activeTab === 'social' && <SocialSettings settings={localSettings} onChange={handleChange} />}
          </div>

          {/* Footer Actions */}
          <div 
            className="p-6 border-t-2 flex items-center justify-between"
            style={{ 
              borderColor: 'rgba(168, 85, 247, 0.3)',
              background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(26, 26, 26, 0.95) 100%)',
            }}
          >
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all"
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '2px solid rgba(239, 68, 68, 0.5)',
                color: '#ef4444',
              }}
            >
              <RotateCcw className="w-5 h-5" />
              Reset to Default
            </button>
            
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl font-bold transition-all"
                style={{
                  background: 'rgba(156, 163, 175, 0.2)',
                  border: '2px solid rgba(156, 163, 175, 0.5)',
                  color: '#9ca3af',
                }}
              >
                Cancel
              </button>
              <motion.button
                onClick={handleSave}
                className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  border: '2px solid rgba(168, 85, 247, 0.5)',
                  color: '#fff',
                  boxShadow: '0 0 30px rgba(168, 85, 247, 0.5)',
                }}
                whileHover={{ scale: 1.05, boxShadow: '0 0 40px rgba(168, 85, 247, 0.7)' }}
                whileTap={{ scale: 0.95 }}
              >
                <Save className="w-5 h-5" />
                Save Settings
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}

// Individual Settings Components
function AudioSettings({ settings, onChange }: { settings: AdvancedGameSettingsType; onChange: any }) {
  return (
    <div className="space-y-6">
      <SettingSection title="Volume Controls" icon={Volume2}>
        <SliderSetting
          label="Master Volume"
          value={settings.masterVolume}
          onChange={(v) => onChange('masterVolume', v)}
          icon={Speaker}
        />
        <SliderSetting
          label="Sound Effects"
          value={settings.sfxVolume}
          onChange={(v) => onChange('sfxVolume', v)}
          icon={Zap}
        />
        <SliderSetting
          label="Background Music"
          value={settings.musicVolume}
          onChange={(v) => onChange('musicVolume', v)}
          icon={Music}
        />
        <SliderSetting
          label="Dealer Voice"
          value={settings.voiceVolume}
          onChange={(v) => onChange('voiceVolume', v)}
          icon={Mic}
        />
        <SliderSetting
          label="Ambient Sounds"
          value={settings.ambientVolume}
          onChange={(v) => onChange('ambientVolume', v)}
          icon={Headphones}
        />
      </SettingSection>

      <SettingSection title="Audio Preferences" icon={Music}>
        <SelectSetting
          label="Music Genre"
          value={settings.musicGenre}
          options={[
            { value: 'jazz', label: '.sax Jazz' },
            { value: 'lounge', label: '🎹 Lounge' },
            { value: 'electronic', label: '🎧 Electronic' },
            { value: 'orchestral', label: '🎻 Orchestral' },
            { value: 'rock', label: '🎸 Rock' },
            { value: 'custom', label: '💿 Custom' },
          ]}
          onChange={(v) => onChange('musicGenre', v)}
        />
        <SelectSetting
          label="Voice Type"
          value={settings.voiceType}
          options={[
            { value: 'male', label: '👨 Male Voice' },
            { value: 'female', label: '👩 Female Voice' },
            { value: 'robotic', label: '🤖 Robotic' },
            { value: 'off', label: '🔇 Off' },
          ]}
          onChange={(v) => onChange('voiceType', v)}
        />
        <SelectSetting
          label="Sound Effects Pack"
          value={settings.sfxPack}
          options={[
            { value: 'classic', label: '🎲 Classic Casino' },
            { value: 'modern', label: '✨ Modern' },
            { value: 'luxury', label: '💎 Luxury' },
            { value: 'retro', label: '📻 Retro' },
          ]}
          onChange={(v) => onChange('sfxPack', v)}
        />
        <SelectSetting
          label="Audio Quality"
          value={settings.audioQuality}
          options={[
            { value: 'low', label: 'Low (64kbps)' },
            { value: 'medium', label: 'Medium (128kbps)' },
            { value: 'high', label: 'High (256kbps)' },
            { value: 'lossless', label: 'Lossless (FLAC)' },
          ]}
          onChange={(v) => onChange('audioQuality', v)}
        />
      </SettingSection>

      <SettingSection title="Advanced Audio" icon={Sparkles}>
        <ToggleSetting
          label="Mute on Tab Switch"
          description="Automatically mute audio when you switch to another tab"
          value={settings.muteOnTabSwitch}
          onChange={(v) => onChange('muteOnTabSwitch', v)}
        />
        <ToggleSetting
          label="Spatial Audio"
          description="3D positional audio for immersive experience"
          value={settings.spatialAudio}
          onChange={(v) => onChange('spatialAudio', v)}
        />
      </SettingSection>
    </div>
  );
}

function VisualSettings({ settings, onChange }: { settings: AdvancedGameSettingsType; onChange: any }) {
  return (
    <div className="space-y-6">
      <SettingSection title="Table Appearance" icon={Palette}>
        <ColorSelectSetting
          label="Table Felt Color"
          value={settings.tableFeltColor}
          options={[
            { value: 'green', label: 'Classic Green', color: '#15803d' },
            { value: 'blue', label: 'Royal Blue', color: '#1e40af' },
            { value: 'red', label: 'Ruby Red', color: '#991b1b' },
            { value: 'purple', label: 'Purple Velvet', color: '#6b21a8' },
            { value: 'black', label: 'Onyx Black', color: '#0a0a0a' },
            { value: 'teal', label: 'Teal Wave', color: '#0f766e' },
            { value: 'burgundy', label: 'Burgundy', color: '#7c2d12' },
          ]}
          onChange={(v) => onChange('tableFeltColor', v)}
        />
        <SelectSetting
          label="Table Layout"
          value={settings.tableLayout}
          options={[
            { value: 'classic', label: '🎰 Classic Vegas' },
            { value: 'modern', label: '✨ Modern' },
            { value: 'luxury', label: '💎 Luxury' },
            { value: 'minimalist', label: '⚪ Minimalist' },
          ]}
          onChange={(v) => onChange('tableLayout', v)}
        />
        <SelectSetting
          label="Chip Design"
          value={settings.chipDesign}
          options={[
            { value: 'classic', label: '🎲 Classic' },
            { value: 'modern', label: '✨ Modern' },
            { value: 'luxury', label: '💎 Luxury' },
            { value: 'neon', label: '🌟 Neon' },
            { value: 'casino', label: '🎰 Casino Style' },
            { value: 'custom', label: '🎨 Custom' },
          ]}
          onChange={(v) => onChange('chipDesign', v)}
        />
        <SelectSetting
          label="Dice Skin"
          value={settings.diceSkin}
          options={[
            { value: 'classic', label: '🎲 Classic White' },
            { value: 'gold', label: '🏆 Gold' },
            { value: 'diamond', label: '💎 Diamond' },
            { value: 'neon', label: '🌈 Neon' },
            { value: 'transparent', label: '🔮 Transparent' },
            { value: 'ivory', label: '🦷 Ivory' },
          ]}
          onChange={(v) => onChange('diceSkin', v)}
        />
      </SettingSection>

      <SettingSection title="Background & Theme" icon={Image}>
        <SelectSetting
          label="Background Theme"
          value={settings.backgroundTheme}
          options={[
            { value: 'tropical', label: '🌴 Tropical Paradise' },
            { value: 'vegas', label: '🎰 Classic Vegas' },
            { value: 'neon', label: '🌆 Neon City' },
            { value: 'luxury', label: '💎 Luxury Suite' },
            { value: 'space', label: '🚀 Space Casino' },
            { value: 'underwater', label: '🌊 Underwater' },
            { value: 'casino', label: '🃏 Casino Floor' },
          ]}
          onChange={(v) => onChange('backgroundTheme', v)}
        />
      </SettingSection>

      <SettingSection title="Graphics & Performance" icon={Gauge}>
        <SelectSetting
          label="Graphics Quality"
          value={settings.graphicsQuality}
          options={[
            { value: 'low', label: '📱 Low (Best Performance)' },
            { value: 'medium', label: '💻 Medium (Balanced)' },
            { value: 'high', label: '🖥️ High (Recommended)' },
            { value: 'ultra', label: '🎮 Ultra (Best Quality)' },
          ]}
          onChange={(v) => onChange('graphicsQuality', v)}
        />
        <SelectSetting
          label="Resolution"
          value={settings.resolution}
          options={[
            { value: '720p', label: '720p (HD)' },
            { value: '1080p', label: '1080p (Full HD)' },
            { value: '1440p', label: '1440p (2K)' },
            { value: '4K', label: '4K (Ultra HD)' },
          ]}
          onChange={(v) => onChange('resolution', v)}
        />
        <SelectSetting
          label="FPS Target"
          value={settings.fpsTarget.toString()}
          options={[
            { value: '30', label: '30 FPS' },
            { value: '60', label: '60 FPS (Recommended)' },
            { value: '120', label: '120 FPS' },
            { value: '144', label: '144 FPS' },
            { value: '240', label: '240 FPS (High-End)' },
          ]}
          onChange={(v) => onChange('fpsTarget', parseInt(v))}
        />
        <SelectSetting
          label="Shadow Quality"
          value={settings.shadowQuality}
          options={[
            { value: 'none', label: 'None (Best Performance)' },
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
          onChange={(v) => onChange('shadowQuality', v)}
        />
      </SettingSection>

      <SettingSection title="Visual Effects" icon={Sparkles}>
        <SelectSetting
          label="Animation Speed"
          value={settings.animationSpeed}
          options={[
            { value: 'slow', label: '🐌 Slow (2x duration)' },
            { value: 'normal', label: '⚡ Normal' },
            { value: 'fast', label: '🚀 Fast (0.5x duration)' },
            { value: 'instant', label: '⚡⚡ Instant' },
          ]}
          onChange={(v) => onChange('animationSpeed', v)}
        />
        <ToggleSetting
          label="Show Bet Amounts"
          description="Display bet amounts on chips"
          value={settings.showBetAmounts}
          onChange={(v) => onChange('showBetAmounts', v)}
        />
        <ToggleSetting
          label="Show Other Players' Bets"
          description="View bets placed by other players in multiplayer"
          value={settings.showOtherPlayerBets}
          onChange={(v) => onChange('showOtherPlayerBets', v)}
        />
        <ToggleSetting
          label="Show Statistics Overlay"
          description="Display real-time statistics during gameplay"
          value={settings.showStatistics}
          onChange={(v) => onChange('showStatistics', v)}
        />
        <ToggleSetting
          label="Lighting Effects"
          description="Dynamic lighting and shadows"
          value={settings.lightingEffects}
          onChange={(v) => onChange('lightingEffects', v)}
        />
        <ToggleSetting
          label="Particle Effects"
          description="Confetti, sparkles, and other particle systems"
          value={settings.particleEffects}
          onChange={(v) => onChange('particleEffects', v)}
        />
        <ToggleSetting
          label="Win Animations"
          description="Celebratory animations on wins"
          value={settings.winAnimations}
          onChange={(v) => onChange('winAnimations', v)}
        />
        <ToggleSetting
          label="Glow Effects"
          description="Neon glow around UI elements"
          value={settings.glowEffects}
          onChange={(v) => onChange('glowEffects', v)}
        />
        <ToggleSetting
          label="Anti-Aliasing"
          description="Smooth edges (requires more GPU)"
          value={settings.antiAliasing}
          onChange={(v) => onChange('antiAliasing', v)}
        />
        <ToggleSetting
          label="Bloom Effect"
          description="Bright lights bloom effect"
          value={settings.bloomEffect}
          onChange={(v) => onChange('bloomEffect', v)}
        />
        <ToggleSetting
          label="Vignette"
          description="Darkened edges for cinematic effect"
          value={settings.vignette}
          onChange={(v) => onChange('vignette', v)}
        />
      </SettingSection>
    </div>
  );
}

function GameplaySettings({ settings, onChange }: { settings: AdvancedGameSettingsType; onChange: any }) {
  return (
    <div className="space-y-6">
      <SettingSection title="Betting Options" icon={Target}>
        <ToggleSetting
          label="Confirm Bets"
          description="Require confirmation before placing bets"
          value={settings.confirmBets}
          onChange={(v) => onChange('confirmBets', v)}
        />
        <ToggleSetting
          label="Quick Bet Buttons"
          description="Show quick betting shortcuts"
          value={settings.quickBetButtons}
          onChange={(v) => onChange('quickBetButtons', v)}
        />
        <SelectSetting
          label="Bet Input Method"
          value={settings.betInputMethod}
          options={[
            { value: 'slider', label: '🎚️ Slider Only' },
            { value: 'buttons', label: '🔘 Buttons Only' },
            { value: 'keyboard', label: '⌨️ Keyboard Only' },
            { value: 'both', label: '🎛️ All Methods' },
          ]}
          onChange={(v) => onChange('betInputMethod', v)}
        />
        <NumberInputSetting
          label="Default Bet Amount"
          value={settings.defaultBetAmount}
          onChange={(v) => onChange('defaultBetAmount', v)}
          min={1}
          max={1000}
          step={1}
        />
        <NumberInputSetting
          label="Max Bet Limit"
          value={settings.maxBetLimit}
          onChange={(v) => onChange('maxBetLimit', v)}
          min={100}
          max={100000}
          step={100}
        />
      </SettingSection>

      <SettingSection title="Auto Features" icon={Zap}>
        <ToggleSetting
          label="Auto-Rebuy Chips"
          description="Automatically purchase chips when balance is low"
          value={settings.autoRebuy}
          onChange={(v) => onChange('autoRebuy', v)}
        />
        {settings.autoRebuy && (
          <NumberInputSetting
            label="Auto-Rebuy Amount"
            value={settings.autoRebuyAmount}
            onChange={(v) => onChange('autoRebuyAmount', v)}
            min={100}
            max={10000}
            step={100}
          />
        )}
        <ToggleSetting
          label="Auto-Clear Bets After Roll"
          description="Automatically clear losing bets"
          value={settings.autoClearBets}
          onChange={(v) => onChange('autoClearBets', v)}
        />
        <ToggleSetting
          label="Auto-Accept Odds Bets"
          description="Automatically accept optimal odds"
          value={settings.autoAcceptOdds}
          onChange={(v) => onChange('autoAcceptOdds', v)}
        />
      </SettingSection>

      <SettingSection title="Game Speed" icon={Gauge}>
        <NumberInputSetting
          label="Time Bank (seconds)"
          value={settings.timeBank}
          onChange={(v) => onChange('timeBank', v)}
          min={10}
          max={120}
          step={5}
        />
        <SelectSetting
          label="Roll Speed"
          value={settings.rollSpeed}
          options={[
            { value: 'slow', label: '🐌 Slow (3 seconds)' },
            { value: 'normal', label: '⚡ Normal (2 seconds)' },
            { value: 'fast', label: '🚀 Fast (1 second)' },
            { value: 'instant', label: '⚡⚡ Instant' },
          ]}
          onChange={(v) => onChange('rollSpeed', v)}
        />
      </SettingSection>

      <SettingSection title="Helpers & Tools" icon={Boxes}>
        <ToggleSetting
          label="Show Odds Calculator"
          description="Display probability calculator for bets"
          value={settings.showOddsCalculator}
          onChange={(v) => onChange('showOddsCalculator', v)}
        />
      </SettingSection>
    </div>
  );
}

function UISettings({ settings, onChange }: { settings: AdvancedGameSettingsType; onChange: any }) {
  return (
    <div className="space-y-6">
      <SettingSection title="Interface Layout" icon={Layout}>
        <SliderSetting
          label="UI Scale"
          value={settings.uiScale}
          onChange={(v) => onChange('uiScale', v)}
          min={80}
          max={150}
          icon={Layers}
        />
        <SelectSetting
          label="UI Position"
          value={settings.uiPosition}
          options={[
            { value: 'top', label: '⬆️ Top' },
            { value: 'bottom', label: '⬇️ Bottom' },
            { value: 'left', label: '⬅️ Left' },
            { value: 'right', label: '➡️ Right' },
          ]}
          onChange={(v) => onChange('uiPosition', v)}
        />
        <SelectSetting
          label="Chat Position"
          value={settings.chatPosition}
          options={[
            { value: 'right', label: '➡️ Right Side' },
            { value: 'left', label: '⬅️ Left Side' },
            { value: 'bottom', label: '⬇️ Bottom' },
          ]}
          onChange={(v) => onChange('chatPosition', v)}
        />
        <SliderSetting
          label="HUD Transparency"
          value={settings.hudTransparency}
          onChange={(v) => onChange('hudTransparency', v)}
          min={0}
          max={100}
          icon={Eye}
        />
      </SettingSection>

      <SettingSection title="Visual Elements" icon={Eye}>
        <ToggleSetting
          label="Show Mini-Map"
          description="Display table overview in corner"
          value={settings.showMiniMap}
          onChange={(v) => onChange('showMiniMap', v)}
        />
        <ToggleSetting
          label="Show Player List"
          description="Display list of active players"
          value={settings.showPlayerList}
          onChange={(v) => onChange('showPlayerList', v)}
        />
        <ToggleSetting
          label="Show Tooltips"
          description="Display helpful tooltips on hover"
          value={settings.showTooltips}
          onChange={(v) => onChange('showTooltips', v)}
        />
        {settings.showTooltips && (
          <NumberInputSetting
            label="Tooltip Delay (ms)"
            value={settings.tooltipDelay}
            onChange={(v) => onChange('tooltipDelay', v)}
            min={0}
            max={2000}
            step={100}
          />
        )}
      </SettingSection>

      <SettingSection title="Typography & Style" icon={Type}>
        <SelectSetting
          label="Button Size"
          value={settings.buttonSize}
          options={[
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
            { value: 'xlarge', label: 'Extra Large' },
          ]}
          onChange={(v) => onChange('buttonSize', v)}
        />
        <SelectSetting
          label="Font Size"
          value={settings.fontSize}
          options={[
            { value: 'small', label: 'Small (12px)' },
            { value: 'medium', label: 'Medium (16px)' },
            { value: 'large', label: 'Large (20px)' },
            { value: 'xlarge', label: 'Extra Large (24px)' },
          ]}
          onChange={(v) => onChange('fontSize', v)}
        />
        <SelectSetting
          label="Font Family"
          value={settings.fontFamily}
          options={[
            { value: 'default', label: 'Default (System)' },
            { value: 'arial', label: 'Arial' },
            { value: 'georgia', label: 'Georgia (Serif)' },
            { value: 'courier', label: 'Courier (Monospace)' },
            { value: 'impact', label: 'Impact (Bold)' },
          ]}
          onChange={(v) => onChange('fontFamily', v)}
        />
        <SelectSetting
          label="Color Scheme"
          value={settings.colorScheme}
          options={[
            { value: 'default', label: '🎨 Default' },
            { value: 'dark', label: '🌙 Dark Mode' },
            { value: 'light', label: '☀️ Light Mode' },
            { value: 'colorful', label: '🌈 Colorful' },
          ]}
          onChange={(v) => onChange('colorScheme', v)}
        />
      </SettingSection>
    </div>
  );
}

function AccessibilitySettings({ settings, onChange }: { settings: AdvancedGameSettingsType; onChange: any }) {
  return (
    <div className="space-y-6">
      <SettingSection title="Visual Accessibility" icon={Eye}>
        <ToggleSetting
          label="High Contrast Mode"
          description="Increase contrast for better visibility"
          value={settings.highContrast}
          onChange={(v) => onChange('highContrast', v)}
        />
        <ToggleSetting
          label="Large Text"
          description="Increase all text sizes by 12% for better readability (text only, images stay the same)"
          value={settings.largeText}
          onChange={(v) => onChange('largeText', v)}
        />
        <SelectSetting
          label="Color Blind Mode"
          value={settings.colorBlindMode}
          options={[
            { value: 'none', label: 'None (Default Colors)' },
            { value: 'protanopia', label: '🔴 Protanopia (Red-Blind)' },
            { value: 'deuteranopia', label: '🟢 Deuteranopia (Green-Blind)' },
            { value: 'tritanopia', label: '🔵 Tritanopia (Blue-Blind)' },
          ]}
          onChange={(v) => onChange('colorBlindMode', v)}
        />
        <ToggleSetting
          label="Focus Indicators"
          description="Show clear focus outlines for keyboard navigation"
          value={settings.focusIndicators}
          onChange={(v) => onChange('focusIndicators', v)}
        />
        <ToggleSetting
          label="Disable Flashing Lights"
          description="Prevent rapid flashing (photosensitivity protection)"
          value={!settings.flashingLights}
          onChange={(v) => onChange('flashingLights', !v)}
        />
      </SettingSection>

      <SettingSection title="Motion & Animation" icon={Zap}>
        <ToggleSetting
          label="Reduced Motion"
          description="Minimize animations and transitions"
          value={settings.reducedMotion}
          onChange={(v) => onChange('reducedMotion', v)}
        />
        <ToggleSetting
          label="Simplified UI"
          description="Remove decorative elements for cleaner interface"
          value={settings.simplifiedUI}
          onChange={(v) => onChange('simplifiedUI', v)}
        />
      </SettingSection>

      <SettingSection title="Input & Control" icon={Hand}>
        <ToggleSetting
          label="Keyboard Shortcuts"
          description="Enable keyboard shortcuts for quick actions"
          value={settings.keyboardShortcuts}
          onChange={(v) => onChange('keyboardShortcuts', v)}
        />
        <ToggleSetting
          label="One-Hand Mode"
          description="Optimize controls for one-handed use"
          value={settings.oneHandMode}
          onChange={(v) => onChange('oneHandMode', v)}
        />
        <ToggleSetting
          label="Touch/Click Feedback"
          description="Haptic feedback and visual confirmation"
          value={settings.touchFeedback}
          onChange={(v) => onChange('touchFeedback', v)}
        />
      </SettingSection>

      <SettingSection title="Audio & Narration" icon={Mic}>
        <ToggleSetting
          label="Screen Reader Support"
          description="Enable screen reader compatibility"
          value={settings.screenReader}
          onChange={(v) => onChange('screenReader', v)}
        />
        <ToggleSetting
          label="Audio Descriptions"
          description="Narrate visual elements and actions"
          value={settings.audioDescriptions}
          onChange={(v) => onChange('audioDescriptions', v)}
        />
      </SettingSection>

      <div 
        className="p-4 rounded-xl"
        style={{
          background: 'rgba(34, 197, 94, 0.1)',
          border: '2px solid rgba(34, 197, 94, 0.3)',
        }}
      >
        <p className="text-sm" style={{ color: '#86efac' }}>
          ♿ <strong>Accessibility Commitment:</strong> We're dedicated to making Rollers Paradise accessible to everyone. 
          If you need additional accommodations, please contact support.
        </p>
      </div>
    </div>
  );
}

function SocialSettings({ settings, onChange }: { settings: AdvancedGameSettingsType; onChange: any }) {
  return (
    <div className="space-y-6">
      <SettingSection title="Profile & Privacy" icon={Shield}>
        <ToggleSetting
          label="Show Balance"
          description="Display your chip balance to other players"
          value={settings.showBalance}
          onChange={(v) => onChange('showBalance', v)}
        />
        <ToggleSetting
          label="Show Profile"
          description="Make your profile visible to others"
          value={settings.showProfile}
          onChange={(v) => onChange('showProfile', v)}
        />
        <ToggleSetting
          label="Show Avatar"
          description="Display your avatar in multiplayer"
          value={settings.showAvatar}
          onChange={(v) => onChange('showAvatar', v)}
        />
        <SelectSetting
          label="Online Status"
          value={settings.onlineStatus}
          options={[
            { value: 'online', label: '🟢 Online (Visible to all)' },
            { value: 'away', label: '🟡 Away (Auto after 5min)' },
            { value: 'invisible', label: '⚫ Invisible (Appear offline)' },
          ]}
          onChange={(v) => onChange('onlineStatus', v)}
        />
      </SettingSection>

      <SettingSection title="Communication" icon={MessageSquare}>
        <ToggleSetting
          label="Enable Chat"
          description="Allow sending and receiving chat messages"
          value={settings.enableChat}
          onChange={(v) => onChange('enableChat', v)}
        />
        <ToggleSetting
          label="Enable Emotes"
          description="Use emoji reactions and emotes"
          value={settings.enableEmotes}
          onChange={(v) => onChange('enableEmotes', v)}
        />
        <ToggleSetting
          label="Allow Friend Requests"
          description="Receive friend requests from other players"
          value={settings.allowFriendRequests}
          onChange={(v) => onChange('allowFriendRequests', v)}
        />
      </SettingSection>

      <div 
        className="p-4 rounded-xl"
        style={{
          background: 'rgba(59, 130, 246, 0.1)',
          border: '2px solid rgba(59, 130, 246, 0.3)',
        }}
      >
        <p className="text-sm" style={{ color: '#93c5fd' }}>
          🔒 <strong>Privacy Notice:</strong> Your privacy is important. We never share your personal information. 
          Muted players: {settings.mutedPlayers.length} player(s) blocked.
        </p>
      </div>
    </div>
  );
}

// Reusable Setting Components
function SettingSection({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <div 
      className="p-6 rounded-xl"
      style={{
        background: 'linear-gradient(135deg, rgba(26, 26, 26, 0.8) 0%, rgba(10, 10, 10, 0.8) 100%)',
        border: '2px solid rgba(168, 85, 247, 0.2)',
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <Icon className="w-6 h-6" style={{ color: '#a855f7' }} />
        <h3 className="text-2xl font-bold" style={{ color: '#fff' }}>{title}</h3>
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </div>
  );
}

function SliderSetting({ label, value, onChange, min = 0, max = 100, icon: Icon }: any) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4" style={{ color: '#a855f7' }} />}
          <label className="text-sm font-bold" style={{ color: '#fff' }}>{label}</label>
        </div>
        <span className="text-sm font-mono px-3 py-1 rounded-lg" style={{ background: 'rgba(168, 85, 247, 0.2)', color: '#a855f7' }}>
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onInput={(e) => onChange(parseInt((e.target as HTMLInputElement).value))}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="slider w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{
          background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${value}%, rgba(168, 85, 247, 0.2) ${value}%, rgba(168, 85, 247, 0.2) 100%)`,
        }}
      />
    </div>
  );
}

function ToggleSetting({ label, description, value, onChange }: any) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <div className="text-sm font-bold mb-1" style={{ color: '#fff' }}>{label}</div>
        {description && <div className="text-xs" style={{ color: '#9ca3af' }}>{description}</div>}
      </div>
      <button
        onClick={() => onChange(!value)}
        className="relative w-14 h-7 rounded-full transition-all flex-shrink-0"
        style={{
          background: value ? 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)' : 'rgba(156, 163, 175, 0.3)',
          boxShadow: value ? '0 0 20px rgba(168, 85, 247, 0.5)' : 'none',
        }}
      >
        <motion.div
          className="absolute top-1 w-5 h-5 bg-white rounded-full"
          animate={{
            left: value ? '30px' : '4px',
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  );
}

function SelectSetting({ label, value, options, onChange }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold block" style={{ color: '#fff' }}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 rounded-lg text-sm font-bold cursor-pointer transition-all"
        style={{
          background: 'rgba(26, 26, 26, 0.8)',
          border: '2px solid rgba(168, 85, 247, 0.3)',
          color: '#fff',
        }}
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function ColorSelectSetting({ label, value, options, onChange }: any) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-bold block" style={{ color: '#fff' }}>{label}</label>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
        {options.map((opt: any) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className="p-4 rounded-xl transition-all"
            style={{
              background: opt.color,
              border: value === opt.value ? '3px solid #a855f7' : '2px solid rgba(255, 255, 255, 0.2)',
              boxShadow: value === opt.value ? '0 0 20px rgba(168, 85, 247, 0.6)' : 'none',
            }}
          >
            <div className="text-xs font-bold text-center text-white drop-shadow-lg">
              {opt.label}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function NumberInputSetting({ label, value, onChange, min, max, step }: any) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold block" style={{ color: '#fff' }}>{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || min)}
          min={min}
          max={max}
          step={step}
          className="flex-1 p-3 rounded-lg text-sm font-bold"
          style={{
            background: 'rgba(26, 26, 26, 0.8)',
            border: '2px solid rgba(168, 85, 247, 0.3)',
            color: '#fff',
          }}
        />
        <span className="text-xs text-gray-400">({min}-{max})</span>
      </div>
    </div>
  );
}