import { useState, useEffect } from 'react';
import { Volume2, VolumeX, Music } from './Icons';
import { SafeYouTubePlayer } from '../utils/youtubePlayerSafe';

interface MusicVolumeControlProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  onOpenPlaylistSettings: () => void;
}

export function MusicVolumeControl({ volume, onVolumeChange, onOpenPlaylistSettings }: MusicVolumeControlProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleVolumeChange = (newVolume: number) => {
    console.log(`🔊 Music volume changed to: ${Math.round(newVolume * 100)}%`);
    onVolumeChange(newVolume);
    
    // Also update YouTube player using safe wrapper (prevents DOM attachment errors)
    SafeYouTubePlayer.setVolume(newVolume * 100); // YouTube uses 0-100
  };

  return (
    <div className="fixed bottom-2 left-2 z-30">
      <div
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 border-purple-500 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in slide-in-from-bottom-4 duration-300"
        style={{
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.7), 0 0 30px rgba(168, 85, 247, 0.4)',
          width: '230px', // Reduced width since we removed fullscreen button
        }}
      >
        {/* HORIZONTAL LAYOUT - All controls in a row */}
        <div className="p-2 flex items-center gap-2">
          {/* Music Icon Button (Left) - Opens playlist settings */}
          <button
            onClick={onOpenPlaylistSettings}
            className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 flex items-center justify-center transition-all shadow-lg hover:scale-110 active:scale-95"
            title="🎵 Music Playlist - YouTube/Spotify Settings"
            style={{
              boxShadow: '0 0 20px rgba(236, 72, 153, 0.5), 0 4px 12px rgba(0, 0, 0, 0.5)'
            }}
          >
            <Music className="w-5 h-5 text-white drop-shadow-lg" />
          </button>

          {/* Volume Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-10 h-10 flex-shrink-0 rounded-lg bg-purple-600 hover:bg-purple-700 flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95"
            title={`🔊 Background Music Volume: ${Math.round(volume * 100)}%`}
          >
            {volume === 0 ? (
              <VolumeX className="w-5 h-5 text-white drop-shadow-lg" />
            ) : (
              <Volume2 className="w-5 h-5 text-white drop-shadow-lg" />
            )}
          </button>

          {/* Volume Slider - Always visible, expands for details */}
          <div className="flex-1 flex items-center gap-2">
            <input
              type="range"
              min="0"
              max="100"
              value={volume * 100}
              onInput={(e) => handleVolumeChange(Number((e.target as HTMLInputElement).value) / 100)}
              onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
              className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, #a855f7 0%, #a855f7 ${volume * 100}%, #374151 ${volume * 100}%, #374151 100%)`
              }}
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
            {isExpanded && (
              <span
                className="text-white text-xs font-bold min-w-[3ch] animate-in fade-in zoom-in-95 duration-200"
                style={{ width: 'auto' }}
              >
                {Math.round(volume * 100)}%
              </span>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          cursor: pointer;
          box-shadow: 0 0 8px rgba(168, 85, 247, 0.8);
          border: 2px solid white;
          transition: transform 0.2s ease;
        }

        .slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: linear-gradient(135deg, #a855f7, #ec4899);
          cursor: pointer;
          box-shadow: 0 0 8px rgba(168, 85, 247, 0.8);
          border: 2px solid white;
          transition: transform 0.2s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          transform: scale(1.2);
        }

        .slider::-moz-range-thumb:hover {
          transform: scale(1.2);
        }
      `}</style>
    </div>
  );
}
