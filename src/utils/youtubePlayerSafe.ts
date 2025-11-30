/**
 * 🔒 SAFE YOUTUBE PLAYER WRAPPER
 * 
 * This utility ensures ALL YouTube API calls are made ONLY after the player
 * is fully attached to the DOM, preventing the error:
 * "The YouTube player is not attached to the DOM"
 */

interface SafeYouTubePlayer {
  setVolume: (volume: number) => void;
  playVideo: () => void;
  pauseVideo: () => void;
  getVolume: () => number | null;
  isReady: () => boolean;
}

/**
 * Safely get the YouTube player from window with full validation
 */
function getYouTubePlayer(): any | null {
  try {
    const player = (window as any).youtubePlayer;
    
    // Check if player exists
    if (!player || player === null) {
      return null;
    }
    
    // Check if player has getIframe method
    if (typeof player.getIframe !== 'function') {
      return null;
    }
    
    // Verify iframe is attached to DOM
    try {
      const iframe = player.getIframe();
      if (!iframe || !document.body.contains(iframe)) {
        return null;
      }
    } catch (e) {
      // getIframe() can throw if player not ready
      return null;
    }
    
    return player;
  } catch (e) {
    // Silently return null if any error
    return null;
  }
}

/**
 * Create a safe wrapper around the YouTube player
 * All methods check if player is ready before making API calls
 */
export const SafeYouTubePlayer: SafeYouTubePlayer = {
  /**
   * Check if the YouTube player is ready and attached to DOM
   */
  isReady: (): boolean => {
    return getYouTubePlayer() !== null;
  },
  
  /**
   * Safely set volume (0-100)
   */
  setVolume: (volume: number): void => {
    try {
      const player = getYouTubePlayer();
      if (player && typeof player.setVolume === 'function') {
        player.setVolume(volume);
      }
    } catch (e) {
      // Silently fail - don't spam console
    }
  },
  
  /**
   * Safely play video
   */
  playVideo: (): void => {
    try {
      const player = getYouTubePlayer();
      if (player && typeof player.playVideo === 'function') {
        player.playVideo();
      }
    } catch (e) {
      // Silently fail
    }
  },
  
  /**
   * Safely pause video
   */
  pauseVideo: (): void => {
    try {
      const player = getYouTubePlayer();
      if (player && typeof player.pauseVideo === 'function') {
        player.pauseVideo();
      }
    } catch (e) {
      // Silently fail
    }
  },
  
  /**
   * Safely get current volume
   */
  getVolume: (): number | null => {
    try {
      const player = getYouTubePlayer();
      if (player && typeof player.getVolume === 'function') {
        return player.getVolume();
      }
    } catch (e) {
      // Silently fail
    }
    return null;
  }
};

/**
 * Execute a function only when YouTube player is ready
 * Useful for delayed operations that depend on player
 */
export function whenYouTubePlayerReady(callback: (player: any) => void, maxWaitMs: number = 5000): void {
  const startTime = Date.now();
  
  const checkReady = () => {
    const player = getYouTubePlayer();
    
    if (player) {
      callback(player);
      return;
    }
    
    // Keep checking until maxWaitMs
    if (Date.now() - startTime < maxWaitMs) {
      setTimeout(checkReady, 100);
    }
  };
  
  checkReady();
}
