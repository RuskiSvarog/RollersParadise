import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  Clock,
  DollarSign,
  Eye,
  Bell,
  Mic
} from './Icons';
import { SupportTab } from './SupportTab';
import { AudioDeviceSettings } from './AudioDeviceSettings';

export interface GameSettingsType {
  // Sound Settings
  masterVolume: number;
  soundEffects: boolean;
  soundEffectsVolume: number;
  backgroundMusic: boolean;
  musicVolume: number;
  dealerVoice: boolean;
  dealerVolume: number;
  ambientSounds: boolean;
  ambientCasinoSounds: boolean;
  ambienceVolume: number;
  
  // Display Settings
  tableFelt: 'green' | 'blue' | 'red' | 'purple' | 'black';
  chipStyle: 'classic' | 'modern' | 'luxury';
  animationSpeed: 'slow' | 'normal' | 'fast' | 'instant';
  showBetAmounts: boolean;
  showOtherPlayerBets: boolean;
  highQualityGraphics: boolean;
  
  // Gameplay Settings
  confirmBets: boolean;
  quickBetButtons: boolean;
  autoRebuy: boolean;
  autoRebuyAmount: number;
  timeBank: number;
  betInputMethod: 'slider' | 'buttons' | 'both';
  showWinAnimations: boolean;
  quickRollMode: boolean;  // ⚡ Instant results without dice animation
  
  // Chat & Social
  enableChat: boolean;
  enableEmotes: boolean;
  showPlayerAvatars: boolean;
  mutePlayers: string[];
  
  // Privacy & Account
  showBalance: boolean;
  showHandHistory: boolean;
  saveGameStats: boolean;
  notifications: boolean;
  emailNotifications: boolean;
  
  // Accessibility
  highContrast: boolean;
  largeText: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  screenReader: boolean;
  
  // Voice Chat Audio Devices
  voiceChatInputDevice: string;
  voiceChatOutputDevice: string;
  voiceChatEnabled: boolean;
}

export const defaultSettings: GameSettingsType = {
  // Sound Settings
  masterVolume: 70,
  soundEffects: true,
  soundEffectsVolume: 80,
  backgroundMusic: false, // DEFAULT OFF - users can enable in settings
  musicVolume: 70,
  dealerVoice: true,
  dealerVolume: 70,
  ambientSounds: true,
  ambientCasinoSounds: true,
  ambienceVolume: 60,
  
  // Display Settings
  tableFelt: 'green',
  chipStyle: 'classic',
  animationSpeed: 'normal',
  showBetAmounts: true,
  showOtherPlayerBets: true,
  highQualityGraphics: true,
  
  // Gameplay Settings
  confirmBets: true,
  quickBetButtons: true,
  autoRebuy: true,
  autoRebuyAmount: 1000,
  timeBank: 30,
  betInputMethod: 'both',
  showWinAnimations: true,
  quickRollMode: false,
  
  // Chat & Social
  enableChat: true,
  enableEmotes: true,
  showPlayerAvatars: true,
  mutePlayers: [],
  
  // Privacy & Account
  showBalance: true,
  showHandHistory: true,
  saveGameStats: true,
  notifications: true,
  emailNotifications: true,
  
  // Accessibility
  highContrast: false,
  largeText: false,
  colorBlindMode: 'none',
  screenReader: false,
  
  // Voice Chat Audio Devices
  voiceChatInputDevice: 'default',
  voiceChatOutputDevice: 'default',
  voiceChatEnabled: true,
};

interface GameSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: GameSettingsType) => void;
  currentSettings?: GameSettingsType;
  defaultTab?: 'sound' | 'display' | 'gameplay' | 'chat' | 'privacy' | 'accessibility' | 'voicechat' | 'support';
  onShowTutorial?: () => void;
}

export function GameSettings({ isOpen, onClose, onSave, currentSettings, defaultTab = 'display', onShowTutorial }: GameSettingsProps) {
  const [settings, setSettings] = useState<GameSettingsType>(currentSettings || defaultSettings);
  const [activeTab, setActiveTab] = useState<'sound' | 'display' | 'gameplay' | 'chat' | 'privacy' | 'accessibility' | 'voicechat' | 'support'>(defaultTab);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<GameSettingsType>(currentSettings || defaultSettings);

  useEffect(() => {
    if (currentSettings) {
      setSettings(currentSettings);
    }
  }, [currentSettings]);

  useEffect(() => {
    if (isOpen && currentSettings) {
      setOriginalSettings(currentSettings);
      setHasChanges(false);
    }
  }, [isOpen, currentSettings]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  const updateSetting = <K extends keyof GameSettingsType>(key: K, value: GameSettingsType[K], immediate: boolean = false) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Always mark as having changes, even for immediate saves
    setHasChanges(true);
    
    // Don't do immediate save - let user click Save Settings button
    // This ensures consistent behavior for all settings
  };

  const handleSave = () => {
    onSave(settings);
    setHasChanges(false);
    setOriginalSettings(settings);
    
    const notification = document.createElement('div');
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        padding: 30px 60px;
        border-radius: 16px;
        font-size: 24px;
        font-weight: bold;
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
        z-index: 99999;
        text-align: center;
        border: 4px solid white;
      ">
        ✅ SETTINGS SAVED!<br/>
        <span style="font-size: 16px; opacity: 0.9;">Your preferences have been updated</span>
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
      onClose();
    }, 1500);
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setHasChanges(true);
  };

  const handleCancel = () => {
    if (hasChanges) {
      onSave(originalSettings);
      setSettings(originalSettings);
      setHasChanges(false);
      
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
          color: white;
          padding: 25px 50px;
          border-radius: 16px;
          font-size: 20px;
          font-weight: bold;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
          z-index: 99999;
          text-align: center;
          border: 4px solid white;
        ">
          ↩️ CHANGES REVERTED<br/>
          <span style="font-size: 14px; opacity: 0.9;">Settings restored to previous values</span>
        </div>
      `;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.remove();
      }, 1500);
    }
    onClose();
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'display' as const, label: 'Display', icon: Monitor },
    { id: 'sound' as const, label: 'Sound', icon: Volume2 },
    { id: 'gameplay' as const, label: 'Gameplay', icon: Gamepad2 },
    { id: 'chat' as const, label: 'Chat & Social', icon: MessageSquare },
    { id: 'privacy' as const, label: 'Privacy', icon: Shield },
    { id: 'accessibility' as const, label: 'Accessibility', icon: Eye },
    { id: 'voicechat' as const, label: 'Voice Chat', icon: Mic },
    { id: 'support' as const, label: 'Support', icon: Bell },
  ];

  const modalContent = (
    <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4">
      <div 
        className="bg-gradient-to-br from-gray-900 to-gray-950 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border-4 border-yellow-600 flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 p-5 flex justify-between items-center border-b-4 border-yellow-800">
          <div className="flex items-center gap-3">
            <SettingsIcon className="w-7 h-7 text-white" />
            <div>
              <h2 className="text-white text-xl font-black">GAME SETTINGS</h2>
              <p className="text-yellow-100 text-xs">Customize your casino experience</p>
            </div>
          </div>
          <button 
            onClick={handleCancel} 
            className="text-white hover:text-yellow-200 transition-colors"
            title={hasChanges ? "Close without saving (will revert changes)" : "Close"}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 bg-gray-900 border-r-2 border-gray-800 p-3 space-y-1.5 overflow-y-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all font-semibold text-sm ${
                    activeTab === tab.id
                      ? 'bg-yellow-600 text-white shadow-lg'
                      : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Display Tab */}
            {activeTab === 'display' && (
              <div className="space-y-5">
                <h3 className="text-white text-xl font-black mb-3">🎨 Display Settings</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-white font-semibold mb-2 block">Table Felt Color</label>
                    <div className="flex gap-3">
                      {(['green', 'blue', 'red', 'purple', 'black'] as const).map((color) => (
                        <button
                          key={color}
                          onClick={() => updateSetting('tableFelt', color)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            settings.tableFelt === color
                              ? 'bg-yellow-600 text-white shadow-lg'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {color.charAt(0).toUpperCase() + color.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-white font-semibold mb-2 block">Chip Style</label>
                    <div className="flex gap-3">
                      {(['classic', 'modern', 'luxury'] as const).map((style) => (
                        <button
                          key={style}
                          onClick={() => updateSetting('chipStyle', style)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            settings.chipStyle === style
                              ? 'bg-yellow-600 text-white shadow-lg'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {style.charAt(0).toUpperCase() + style.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-white font-semibold mb-2 block">Animation Speed</label>
                    <div className="flex gap-3">
                      {(['slow', 'normal', 'fast', 'instant'] as const).map((speed) => (
                        <button
                          key={speed}
                          onClick={() => updateSetting('animationSpeed', speed)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            settings.animationSpeed === speed
                              ? 'bg-yellow-600 text-white shadow-lg'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {speed.charAt(0).toUpperCase() + speed.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <ToggleSetting
                    label="Show Bet Amounts"
                    description="Display bet amounts on the table"
                    enabled={settings.showBetAmounts}
                    onChange={(value) => updateSetting('showBetAmounts', value)}
                    icon={DollarSign}
                  />

                  <ToggleSetting
                    label="Show Other Players' Bets"
                    description="See what other players are betting"
                    enabled={settings.showOtherPlayerBets}
                    onChange={(value) => updateSetting('showOtherPlayerBets', value)}
                    icon={Eye}
                  />

                  <ToggleSetting
                    label="High Quality Graphics"
                    description="Enhanced visual quality (may affect performance)"
                    enabled={settings.highQualityGraphics}
                    onChange={(value) => updateSetting('highQualityGraphics', value)}
                    icon={Monitor}
                  />
                </div>
              </div>
            )}

            {/* Sound Tab */}
            {activeTab === 'sound' && (
              <div className="space-y-5">
                <h3 className="text-white text-xl font-black mb-3">🔊 Sound Settings</h3>
                
                {/* Info Banner about Casino Music */}
                <div className="p-4 bg-blue-900/30 border-2 border-blue-500/50 rounded-lg mb-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">🎵</div>
                    <div>
                      <div className="text-blue-200 font-bold">Casino Music Available!</div>
                      <div className="text-blue-300 text-sm mt-1">
                        Turn on Background Music below to enjoy casino ambience while you play.
                        You can customize your music playlist anytime through the music player icon in the bottom-right corner.
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <SliderSetting
                    label="Master Volume"
                    value={settings.masterVolume}
                    onChange={(value) => updateSetting('masterVolume', value, true)}
                    icon={Volume2}
                  />

                  <ToggleSetting
                    label="Sound Effects"
                    description="Dice rolls, chip sounds, etc."
                    enabled={settings.soundEffects}
                    onChange={(value) => updateSetting('soundEffects', value)}
                    icon={Volume2}
                  />

                  {settings.soundEffects && (
                    <SliderSetting
                      label="Sound Effects Volume"
                      value={settings.soundEffectsVolume}
                      onChange={(value) => updateSetting('soundEffectsVolume', value, true)}
                    />
                  )}

                  <ToggleSetting
                    label="Background Music"
                    description="Casino ambience music - Enable this to enjoy background music while you play!"
                    enabled={settings.backgroundMusic}
                    onChange={(value) => updateSetting('backgroundMusic', value)}
                    icon={Volume2}
                  />

                  {settings.backgroundMusic && (
                    <SliderSetting
                      label="Music Volume"
                      value={settings.musicVolume}
                      onChange={(value) => updateSetting('musicVolume', value, true)}
                    />
                  )}

                  <ToggleSetting
                    label="Dealer Voice"
                    description="Voice announcements from the dealer"
                    enabled={settings.dealerVoice}
                    onChange={(value) => updateSetting('dealerVoice', value)}
                    icon={Volume2}
                  />

                  {settings.dealerVoice && (
                    <SliderSetting
                      label="Dealer Voice Volume"
                      value={settings.dealerVolume}
                      onChange={(value) => updateSetting('dealerVolume', value, true)}
                    />
                  )}

                  <ToggleSetting
                    label="Ambient Casino Sounds"
                    description="Background casino atmosphere"
                    enabled={settings.ambientCasinoSounds}
                    onChange={(value) => updateSetting('ambientCasinoSounds', value)}
                    icon={Volume2}
                  />

                  {settings.ambientCasinoSounds && (
                    <SliderSetting
                      label="Ambience Volume"
                      value={settings.ambienceVolume}
                      onChange={(value) => updateSetting('ambienceVolume', value, true)}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Gameplay Tab */}
            {activeTab === 'gameplay' && (
              <div className="space-y-5">
                <h3 className="text-white text-xl font-black mb-3">🎮 Gameplay Settings</h3>
                
                <div className="space-y-4">
                  <ToggleSetting
                    label="Confirm Bets"
                    description="Require confirmation before placing bets"
                    enabled={settings.confirmBets}
                    onChange={(value) => updateSetting('confirmBets', value)}
                    icon={Shield}
                  />

                  <ToggleSetting
                    label="Quick Bet Buttons"
                    description="Show quick access betting buttons"
                    enabled={settings.quickBetButtons}
                    onChange={(value) => updateSetting('quickBetButtons', value)}
                    icon={Gamepad2}
                  />

                  <ToggleSetting
                    label="Auto Rebuy"
                    description="Automatically rebuy when balance is low"
                    enabled={settings.autoRebuy}
                    onChange={(value) => updateSetting('autoRebuy', value)}
                    icon={DollarSign}
                  />

                  {settings.autoRebuy && (
                    <div>
                      <label className="text-white font-semibold mb-2 block">Auto Rebuy Amount</label>
                      <input
                        type="number"
                        min="100"
                        max="10000"
                        step="100"
                        value={settings.autoRebuyAmount}
                        onChange={(e) => updateSetting('autoRebuyAmount', parseInt(e.target.value))}
                        className="w-full bg-gray-800 text-white px-4 py-2 rounded-lg border-2 border-gray-700 focus:border-yellow-600 outline-none"
                      />
                    </div>
                  )}

                  <div>
                    <label className="text-white font-semibold mb-2 block">Bet Input Method</label>
                    <div className="flex gap-3">
                      {(['slider', 'buttons', 'both'] as const).map((method) => (
                        <button
                          key={method}
                          onClick={() => updateSetting('betInputMethod', method)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            settings.betInputMethod === method
                              ? 'bg-yellow-600 text-white shadow-lg'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {method.charAt(0).toUpperCase() + method.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <ToggleSetting
                    label="Win Animations"
                    description="Show animations when you win"
                    enabled={settings.showWinAnimations}
                    onChange={(value) => updateSetting('showWinAnimations', value)}
                    icon={Gamepad2}
                  />

                  <ToggleSetting
                    label="⚡ Quick Roll Mode"
                    description="Instant dice results with sound effects (no animation delay)"
                    enabled={settings.quickRollMode}
                    onChange={(value) => updateSetting('quickRollMode', value)}
                    icon={Clock}
                  />
                </div>
              </div>
            )}

            {/* Chat & Social Tab */}
            {activeTab === 'chat' && (
              <div className="space-y-5">
                <h3 className="text-white text-xl font-black mb-3">💬 Chat & Social Settings</h3>
                
                <div className="space-y-4">
                  <ToggleSetting
                    label="Enable Chat"
                    description="Show chat messages from other players"
                    enabled={settings.enableChat}
                    onChange={(value) => updateSetting('enableChat', value)}
                    icon={MessageSquare}
                  />

                  <ToggleSetting
                    label="Enable Emotes"
                    description="Allow emoji reactions and emotes"
                    enabled={settings.enableEmotes}
                    onChange={(value) => updateSetting('enableEmotes', value)}
                    icon={MessageSquare}
                  />

                  <ToggleSetting
                    label="Show Player Avatars"
                    description="Display profile pictures for players"
                    enabled={settings.showPlayerAvatars}
                    onChange={(value) => updateSetting('showPlayerAvatars', value)}
                    icon={Eye}
                  />
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className="space-y-5">
                <h3 className="text-white text-xl font-black mb-3">🔒 Privacy & Account Settings</h3>
                
                <div className="space-y-4">
                  <ToggleSetting
                    label="Show Balance"
                    description="Display your balance to other players"
                    enabled={settings.showBalance}
                    onChange={(value) => updateSetting('showBalance', value)}
                    icon={Eye}
                  />

                  <ToggleSetting
                    label="Show Hand History"
                    description="Keep track of your game history"
                    enabled={settings.showHandHistory}
                    onChange={(value) => updateSetting('showHandHistory', value)}
                    icon={Clock}
                  />

                  <ToggleSetting
                    label="Save Game Statistics"
                    description="Track wins, losses, and other stats"
                    enabled={settings.saveGameStats}
                    onChange={(value) => updateSetting('saveGameStats', value)}
                    icon={Shield}
                  />

                  <ToggleSetting
                    label="Notifications"
                    description="Receive in-game notifications"
                    enabled={settings.notifications}
                    onChange={(value) => updateSetting('notifications', value)}
                    icon={Bell}
                  />

                  <ToggleSetting
                    label="Email Notifications"
                    description="Receive updates via email"
                    enabled={settings.emailNotifications}
                    onChange={(value) => updateSetting('emailNotifications', value)}
                    icon={Bell}
                  />
                </div>
              </div>
            )}

            {/* Accessibility Tab */}
            {activeTab === 'accessibility' && (
              <div className="space-y-5">
                <h3 className="text-white text-xl font-black mb-3">♿ Accessibility Settings</h3>
                
                <div className="space-y-4">
                  <ToggleSetting
                    label="High Contrast Mode"
                    description="Increase contrast for better visibility"
                    enabled={settings.highContrast}
                    onChange={(value) => updateSetting('highContrast', value)}
                    icon={Eye}
                  />

                  <ToggleSetting
                    label="Large Text"
                    description="Increase text size throughout the game"
                    enabled={settings.largeText}
                    onChange={(value) => updateSetting('largeText', value)}
                    icon={Eye}
                  />

                  <div>
                    <label className="text-white font-semibold mb-2 block">Color Blind Mode</label>
                    <div className="flex gap-3 flex-wrap">
                      {(['none', 'protanopia', 'deuteranopia', 'tritanopia'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => updateSetting('colorBlindMode', mode)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                            settings.colorBlindMode === mode
                              ? 'bg-yellow-600 text-white shadow-lg'
                              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                          }`}
                        >
                          {mode === 'none' ? 'None' : mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <ToggleSetting
                    label="Screen Reader Support"
                    description="Enable additional screen reader features"
                    enabled={settings.screenReader}
                    onChange={(value) => updateSetting('screenReader', value)}
                    icon={Eye}
                  />
                </div>
              </div>
            )}

            {/* Voice Chat Tab */}
            {activeTab === 'voicechat' && (
              <div className="space-y-5">
                <h3 className="text-white text-xl font-black mb-3">🎤 Voice Chat Settings</h3>
                
                <div className="space-y-4">
                  <ToggleSetting
                    label="Enable Voice Chat"
                    description="Allow voice communication with friends during gameplay"
                    enabled={settings.voiceChatEnabled}
                    onChange={(value) => updateSetting('voiceChatEnabled', value)}
                    icon={Mic}
                  />

                  {settings.voiceChatEnabled && (
                    <div className="mt-4">
                      <AudioDeviceSettings 
                        initialInputDevice={settings.voiceChatInputDevice}
                        initialOutputDevice={settings.voiceChatOutputDevice}
                        onDevicesChange={(inputDevice, outputDevice) => {
                          updateSetting('voiceChatInputDevice', inputDevice, true);
                          updateSetting('voiceChatOutputDevice', outputDevice, true);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Support Tab */}
            {activeTab === 'support' && <SupportTab onShowTutorial={onShowTutorial} />}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900 border-t-2 border-gray-800 p-4 flex justify-between items-center">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Defaults
          </button>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-all font-semibold"
              title={hasChanges ? "Cancel changes and revert to previous settings" : "Close"}
            >
              {hasChanges ? '↩️ Cancel & Revert' : 'Close'}
            </button>
            <button
              onClick={handleSave}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all font-bold ${
                hasChanges
                  ? 'bg-yellow-600 text-white hover:bg-yellow-700 shadow-lg'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
              disabled={!hasChanges}
            >
              <Save className="w-4 h-4" />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

function ToggleSetting({ 
  label, 
  description, 
  enabled, 
  onChange,
  icon: Icon 
}: { 
  label: string; 
  description: string; 
  enabled: boolean; 
  onChange: (value: boolean) => void;
  icon?: any;
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-800 rounded-lg border-2 border-gray-700 hover:border-gray-600 transition-all">
      <div className="flex items-center gap-3">
        {Icon && <Icon className={`w-5 h-5 ${enabled ? 'text-green-400' : 'text-gray-500'}`} />}
        <div>
          <div className="text-white font-semibold">{label}</div>
          <div className="text-gray-400 text-sm">{description}</div>
        </div>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`relative w-14 h-8 rounded-full transition-all ${
          enabled ? 'bg-green-600' : 'bg-gray-600'
        }`}
      >
        <div
          className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-200"
          style={{ left: enabled ? '28px' : '4px' }}
        />
      </button>
    </div>
  );
}

function SliderSetting({ 
  label, 
  value, 
  onChange,
  icon: Icon 
}: { 
  label: string; 
  value: number; 
  onChange: (value: number) => void;
  icon?: any;
}) {
  return (
    <div 
      className="p-4 bg-gray-800 rounded-lg border-2 border-gray-700"
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
    >
      <div className="flex items-center gap-3 mb-3">
        {Icon && <Icon className="w-5 h-5 text-yellow-400" />}
        <div className="flex-1">
          <div className="text-white font-semibold">{label}</div>
          <div className="text-gray-400 text-sm">{value}%</div>
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => {
          e.stopPropagation();
          onChange(parseInt(e.target.value));
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        style={{
          background: `linear-gradient(to right, #eab308 0%, #eab308 ${value}%, #374151 ${value}%, #374151 100%)`
        }}
      />
    </div>
  );
}

export default GameSettings;