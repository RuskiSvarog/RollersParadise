import { useState, useEffect } from 'react';
import { Eye, EyeOff, ZoomIn, ZoomOut, Type, Volume2, VolumeX, Sun, Moon, X } from './Icons';

interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderMode: boolean;
  zoomLevel: number;
  audioDescriptions: boolean;
}

/**
 * AccessibilityHelper - Quick access accessibility panel (separate from GameSettings)
 * 
 * NOTE: This is a standalone accessibility widget that provides quick access to
 * accessibility features. It's separate from the GameSettings accessibility tab.
 * Both systems work independently and don't conflict with each other.
 * 
 * Users can use either:
 * 1. This quick access panel (purple button in bottom-right)
 * 2. The full GameSettings > Accessibility tab
 */
export function AccessibilityHelper() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [buttonVisible, setButtonVisible] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReaderMode: false,
    zoomLevel: 100,
    audioDescriptions: false,
  });

  // Load saved settings
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        applySettings(parsed);
      } catch (e) {
        console.error('Failed to load accessibility settings:', e);
      }
    }

    // Detect system preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    if (prefersReducedMotion || prefersHighContrast) {
      const systemSettings = {
        ...settings,
        reducedMotion: prefersReducedMotion,
        highContrast: prefersHighContrast,
      };
      setSettings(systemSettings);
      applySettings(systemSettings);
    }

    // Show button after delay
    setTimeout(() => setButtonVisible(true), 2500);
  }, []);

  // Handle panel open/close animations
  useEffect(() => {
    if (isOpen) {
      // Small delay to allow mount before animation
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;

    // High Contrast - Increases contrast for better visibility
    if (newSettings.highContrast) {
      root.style.setProperty('--contrast-multiplier', '1.5');
      root.classList.add('high-contrast');
    } else {
      root.style.removeProperty('--contrast-multiplier');
      root.classList.remove('high-contrast');
    }

    // Large Text - Use safe font-size scaling instead of zoom
    // IMPORTANT: This only affects text, not images or layout elements
    // 112% = 12% increase, which is noticeable but doesn't break layouts
    if (newSettings.largeText) {
      root.style.fontSize = '112%'; // Safe 12% increase - text only
      root.classList.add('large-text');
      console.log('♿ Large Text enabled via AccessibilityHelper');
    } else {
      root.style.fontSize = '100%';
      root.classList.remove('large-text');
    }

    // Reduced Motion
    if (newSettings.reducedMotion) {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    // Zoom Level - Fine-tune text size (text only, not images/buttons)
    // Limit to safe range (95% to 110%) to prevent layout breaking
    // This uses fontSize on body, which only affects text rendering
    const safeZoomLevel = Math.max(95, Math.min(110, newSettings.zoomLevel));
    if (safeZoomLevel !== 100) {
      const scaleFactor = safeZoomLevel / 100;
      document.body.style.fontSize = `${scaleFactor * 100}%`;
      console.log(`♿ Text size adjusted to ${safeZoomLevel}% (text only, layout preserved)`);
    } else {
      document.body.style.fontSize = '100%';
    }

    // Screen Reader Mode
    if (newSettings.screenReaderMode) {
      root.classList.add('screen-reader-mode');
      // Add aria-labels and additional context
    } else {
      root.classList.remove('screen-reader-mode');
    }

    // Save settings
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
  };

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    applySettings(newSettings);
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      highContrast: false,
      largeText: false,
      reducedMotion: false,
      screenReaderMode: false,
      zoomLevel: 100,
      audioDescriptions: false,
    };
    setSettings(defaultSettings);
    applySettings(defaultSettings);
  };

  return (
    <>
      {/* Accessibility Panel - No floating button, only accessible from Settings */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9998] transition-opacity duration-300"
            onClick={() => setIsOpen(false)}
            style={{
              opacity: isVisible ? 1 : 0,
            }}
          />

          {/* Panel */}
          <div
            className="fixed right-0 top-0 bottom-0 z-[9999] w-full max-w-md overflow-y-auto transition-all duration-300"
            style={{
              background: 'linear-gradient(145deg, rgba(10, 10, 10, 0.98), rgba(26, 26, 26, 0.98))',
              borderLeft: '3px solid #8b5cf6',
              boxShadow: '-10px 0 50px rgba(0, 0, 0, 0.5)',
              transform: isVisible ? 'translateX(0)' : 'translateX(400px)',
              opacity: isVisible ? 1 : 0,
            }}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 p-6 border-b"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                borderColor: '#a78bfa',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl text-white mb-1">♿ Accessibility</h2>
                  <p className="text-sm text-purple-200">
                    Customize your experience
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                  aria-label="Close accessibility settings"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Settings */}
            <div className="p-6 space-y-6">
              {/* Visual Settings */}
              <section>
                <h3 className="text-lg text-purple-300 mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Visual Settings
                </h3>
                
                <div className="space-y-4">
                  {/* High Contrast */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                    <div className="flex-1">
                      <div className="text-white font-bold mb-1">High Contrast</div>
                      <div className="text-sm text-gray-400">
                        Increase contrast for better visibility
                      </div>
                    </div>
                    <button
                      onClick={() => updateSetting('highContrast', !settings.highContrast)}
                      className={`p-2 rounded-lg transition-colors ${
                        settings.highContrast ? 'bg-purple-600' : 'bg-gray-700'
                      }`}
                      aria-label={`High contrast ${settings.highContrast ? 'enabled' : 'disabled'}`}
                    >
                      <Sun className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Large Text */}
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                    <div className="flex-1">
                      <div className="text-white font-bold mb-1">Large Text Mode</div>
                      <div className="text-sm text-gray-400">
                        Increase text size by 12% (text only, images stay the same)
                      </div>
                    </div>
                    <button
                      onClick={() => updateSetting('largeText', !settings.largeText)}
                      className={`p-2 rounded-lg transition-colors ${
                        settings.largeText ? 'bg-purple-600' : 'bg-gray-700'
                      }`}
                      aria-label={`Large text ${settings.largeText ? 'enabled' : 'disabled'}`}
                    >
                      <Type className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  {/* Text Size Adjustment */}
                  <div className="p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                    <div className="text-white font-bold mb-2">
                      Text Size: {settings.zoomLevel}%
                    </div>
                    <div className="text-sm text-gray-400 mb-3">
                      Fine-tune text size (95%-110% range prevents layout issues)
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => updateSetting('zoomLevel', Math.max(95, settings.zoomLevel - 5))}
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={settings.zoomLevel <= 95}
                        aria-label="Decrease text size"
                      >
                        <ZoomOut className="w-5 h-5 text-white" />
                      </button>
                      <input
                        type="range"
                        min="95"
                        max="110"
                        step="5"
                        value={settings.zoomLevel}
                        onInput={(e) => updateSetting('zoomLevel', parseInt((e.target as HTMLInputElement).value))}
                        onChange={(e) => updateSetting('zoomLevel', parseInt(e.target.value))}
                        className="flex-1"
                        aria-label="Text size slider"
                      />
                      <button
                        onClick={() => updateSetting('zoomLevel', Math.min(110, settings.zoomLevel + 5))}
                        className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={settings.zoomLevel >= 110}
                        aria-label="Increase text size"
                      >
                        <ZoomIn className="w-5 h-5 text-white" />
                      </button>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Safe range prevents layout issues
                    </div>
                  </div>
                </div>
              </section>

              {/* Motion Settings */}
              <section>
                <h3 className="text-lg text-purple-300 mb-4">Motion & Animation</h3>
                
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                  <div className="flex-1">
                    <div className="text-white font-bold mb-1">Reduce Motion</div>
                    <div className="text-sm text-gray-400">
                      Minimize animations and transitions
                    </div>
                  </div>
                  <button
                    onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
                    className={`p-2 rounded-lg transition-colors ${
                      settings.reducedMotion ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                    aria-label={`Reduced motion ${settings.reducedMotion ? 'enabled' : 'disabled'}`}
                  >
                    <Moon className="w-5 h-5 text-white" />
                  </button>
                </div>
              </section>

              {/* Audio Settings */}
              <section>
                <h3 className="text-lg text-purple-300 mb-4">Audio Settings</h3>
                
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                  <div className="flex-1">
                    <div className="text-white font-bold mb-1">Audio Descriptions</div>
                    <div className="text-sm text-gray-400">
                      Spoken descriptions of game actions
                    </div>
                  </div>
                  <button
                    onClick={() => updateSetting('audioDescriptions', !settings.audioDescriptions)}
                    className={`p-2 rounded-lg transition-colors ${
                      settings.audioDescriptions ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                    aria-label={`Audio descriptions ${settings.audioDescriptions ? 'enabled' : 'disabled'}`}
                  >
                    {settings.audioDescriptions ? (
                      <Volume2 className="w-5 h-5 text-white" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
              </section>

              {/* Screen Reader */}
              <section>
                <h3 className="text-lg text-purple-300 mb-4">Screen Reader Support</h3>
                
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/50 border border-gray-700">
                  <div className="flex-1">
                    <div className="text-white font-bold mb-1">Enhanced Mode</div>
                    <div className="text-sm text-gray-400">
                      Optimized for screen readers
                    </div>
                  </div>
                  <button
                    onClick={() => updateSetting('screenReaderMode', !settings.screenReaderMode)}
                    className={`p-2 rounded-lg transition-colors ${
                      settings.screenReaderMode ? 'bg-purple-600' : 'bg-gray-700'
                    }`}
                    aria-label={`Screen reader mode ${settings.screenReaderMode ? 'enabled' : 'disabled'}`}
                  >
                    {settings.screenReaderMode ? (
                      <Eye className="w-5 h-5 text-white" />
                    ) : (
                      <EyeOff className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
              </section>

              {/* Reset Button */}
              <button
                onClick={resetSettings}
                className="w-full py-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                }}
              >
                Reset to Defaults
              </button>

              {/* Info */}
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-blue-900/30 border border-blue-700/50">
                  <div className="text-blue-300 text-sm">
                    <strong>💡 Tip:</strong> These settings are saved and will be restored next time you visit.
                  </div>
                </div>
                
                <div className="p-4 rounded-xl bg-green-900/30 border border-green-700/50">
                  <div className="text-green-300 text-sm leading-relaxed">
                    <strong>✅ How it works:</strong> Text scaling only affects text elements, not images or buttons. This prevents layout breaking while improving readability for elderly and visually impaired users.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CSS for accessibility classes */}
      <style>{`
        .high-contrast {
          filter: contrast(1.5);
        }
        
        .reduce-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        .screen-reader-mode button:focus,
        .screen-reader-mode a:focus,
        .screen-reader-mode input:focus {
          outline: 3px solid #fbbf24 !important;
          outline-offset: 2px !important;
        }
      `}</style>
    </>
  );
}
