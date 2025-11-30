import { Volume2, VolumeX } from './Icons';
import { useSettings } from '../contexts/SettingsContext';

export function MusicVolumeSlider() {
  const { settings, updateSettings } = useSettings();

  return (
    <div className="relative animate-in fade-in slide-in-from-right-12 duration-500" style={{ animationDelay: '0.2s' }}>
      <div className="bg-gradient-to-br from-blue-900/95 via-purple-900/95 to-blue-900/95 backdrop-blur-md px-4 py-3 rounded-xl border-3 border-blue-400 shadow-2xl">
        
        <div className="flex items-center gap-3">
          {settings.musicVolume > 0 ? (
            <Volume2 className="w-5 h-5 text-blue-200" />
          ) : (
            <VolumeX className="w-5 h-5 text-red-400" />
          )}
          
          <input
            type="range"
            min="0"
            max="100"
            value={settings.musicVolume}
            onInput={(e) => {
              const newVolume = parseInt((e.target as HTMLInputElement).value);
              updateSettings({ ...settings, musicVolume: newVolume });
              console.log(`🎵🔊 MUSIC VOLUME SLIDER CHANGED: ${newVolume}%`);
            }}
            onChange={(e) => {
              const newVolume = parseInt(e.target.value);
              updateSettings({ ...settings, musicVolume: newVolume });
              console.log(`📊 Updated Settings Context with musicVolume: ${newVolume}`);
            }}
            className="music-volume-slider w-32 h-2 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #60a5fa 0%, #60a5fa ${settings.musicVolume}%, #1e3a8a ${settings.musicVolume}%, #1e3a8a 100%)`,
            }}
          />
          
          <span className="text-blue-200 font-bold text-xs min-w-[35px]">
            {settings.musicVolume}%
          </span>
        </div>
      </div>
      
      {/* Global styles for volume slider */}
      <style dangerouslySetInnerHTML={{ __html: `
        .music-volume-slider::-webkit-slider-thumb {
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(251, 191, 36, 0.8), 0 0 20px rgba(245, 158, 11, 0.4);
          border: 2px solid white;
          transition: all 0.2s ease;
        }
        
        .music-volume-slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(251, 191, 36, 1), 0 0 40px rgba(245, 158, 11, 0.6);
        }
        
        .music-volume-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          cursor: pointer;
          box-shadow: 0 0 10px rgba(251, 191, 36, 0.8), 0 0 20px rgba(245, 158, 11, 0.4);
          border: 2px solid white;
          transition: all 0.2s ease;
          border: none;
        }
        
        .music-volume-slider::-moz-range-thumb:hover {
          transform: scale(1.2);
          box-shadow: 0 0 20px rgba(251, 191, 36, 1), 0 0 40px rgba(245, 158, 11, 0.6);
        }
      ` }} />
    </div>
  );
}