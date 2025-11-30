import { useState, useEffect } from 'react';
import { Maximize, Minimize } from './Icons';
import { enterFullscreen, exitFullscreen, isFullscreen } from '../utils/deviceDetection';

function FullscreenToggle() {
  const [fullscreen, setFullscreen] = useState(false);

  useEffect(() => {
    // Check fullscreen status on mount
    setFullscreen(isFullscreen());

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      setFullscreen(isFullscreen());
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (fullscreen) {
      await exitFullscreen();
    } else {
      await enterFullscreen();
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      className="fixed top-4 right-4 z-[150] px-4 py-3 rounded-lg font-bold uppercase transition-all hover:scale-110 active:scale-95"
      style={{
        background: fullscreen
          ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 50%, #b91c1c 100%)'
          : 'linear-gradient(135deg, #16a34a 0%, #15803d 50%, #14532d 100%)',
        borderColor: '#fbbf24',
        border: '3px solid',
        color: '#fef3c7',
        textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
        boxShadow: '0 0 30px rgba(251, 191, 36, 0.5), 0 8px 20px rgba(0, 0, 0, 0.5)',
      }}
      title={fullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen (F11)'}
    >
      <div className="flex items-center gap-2">
        {fullscreen ? (
          <>
            <Minimize className="w-5 h-5" />
            <span className="hidden sm:inline">Exit Fullscreen</span>
          </>
        ) : (
          <>
            <Maximize className="w-5 h-5" />
            <span className="hidden sm:inline">Fullscreen</span>
          </>
        )}
      </div>
    </button>
  );
}

export default FullscreenToggle;
