import { useState, useEffect, useRef } from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface MusicPlayerProps {
  musicVolume: number;
  setMusicVolume: (volume: number) => void;
  musicEnabled: boolean;
  setMusicEnabled: (enabled: boolean) => void;
  customPlaylists: string[];
  onOpenPlaylistSettings: () => void;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export function MusicPlayer({ 
  musicVolume, 
  setMusicVolume, 
  musicEnabled, 
  setMusicEnabled,
  customPlaylists,
  onOpenPlaylistSettings,
  isVisible,
  onToggleVisibility
}: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true); // AUTO-PLAY BACKGROUND MUSIC
  const [hasAutoPlayed, setHasAutoPlayed] = useState(false);
  
  // USE SETTINGS CONTEXT FOR VOLUME!
  const { settings } = useSettings();
  const actualVolume = settings.musicVolume; // This is 0-100
  
  const youtubePlayerRef = useRef<any>(null);
  const youtubeContainerRef = useRef<HTMLDivElement | null>(null);
  const [youtubeReady, setYoutubeReady] = useState(false);
  const [playerReady, setPlayerReady] = useState(false); // Track if player instance is ready
  
  // Auto-play default casino music on mount
  useEffect(() => {
    if (!hasAutoPlayed && musicEnabled) {
      const autoplayTimer = setTimeout(() => {
        console.log('🎵 Auto-playing default casino music...');
        setIsPlaying(true);
        setHasAutoPlayed(true);
      }, 1000);
      
      return () => clearTimeout(autoplayTimer);
    }
  }, [hasAutoPlayed, musicEnabled]);

  // Load YouTube iframe API
  useEffect(() => {
    if ((window as any).YT) {
      setYoutubeReady(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://www.youtube.com/iframe_api"]');
    if (existingScript) {
      const checkInterval = setInterval(() => {
        if ((window as any).YT && (window as any).YT.Player) {
          clearInterval(checkInterval);
          setYoutubeReady(true);
        }
      }, 100);
      
      setTimeout(() => clearInterval(checkInterval), 10000);
      return;
    }

    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    tag.async = true;
    document.head.appendChild(tag);

    (window as any).onYouTubeIframeAPIReady = () => {
      console.log('✅ YouTube API loaded and ready');
      setYoutubeReady(true);
    };
  }, []);

  // Setup YouTube player for custom playlist
  useEffect(() => {
    if (customPlaylists.length === 0) {
      if (youtubePlayerRef.current) {
        // Clear global reference FIRST before destroying
        (window as any).youtubePlayer = null;
        
        // Mark as not ready immediately
        setPlayerReady(false);
        
        try {
          // Only call destroy if it's a function
          if (typeof youtubePlayerRef.current.destroy === 'function') {
            youtubePlayerRef.current.destroy();
          }
        } catch (e) {
          console.warn('Error destroying YouTube player:', e);
        }
        youtubePlayerRef.current = null;
      }
      return;
    }

    const playlistUrl = customPlaylists[0];
    console.log('🎵 Processing custom playlist URL:', playlistUrl);

    const youtubePlaylistMatch = playlistUrl.match(/[?&]list=([^&]+)/);
    const youtubeVideoMatch = playlistUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
    
    if (youtubePlaylistMatch || youtubeVideoMatch) {
      const playlistId = youtubePlaylistMatch ? youtubePlaylistMatch[1] : null;
      const videoId = youtubeVideoMatch ? youtubeVideoMatch[1] : null;
      
      console.log('🎬 YouTube detected - Playlist:', playlistId, 'Video:', videoId);
      
      const initYouTubePlayer = () => {
        if (!youtubeContainerRef.current) {
          console.warn('YouTube container ref not ready');
          return;
        }

        if (!(window as any).YT || !(window as any).YT.Player) {
          console.warn('YouTube API not ready yet');
          return;
        }

        // Clear global reference FIRST
        (window as any).youtubePlayer = null;
        
        // Reset player ready state before destroying old player
        setPlayerReady(false);

        if (youtubePlayerRef.current) {
          try {
            // Only call destroy if it's a function
            if (typeof youtubePlayerRef.current.destroy === 'function') {
              youtubePlayerRef.current.destroy();
            }
          } catch (e) {
            console.warn('Error destroying YouTube player:', e);
          }
          youtubePlayerRef.current = null;
        }

        if (youtubeContainerRef.current) {
          youtubeContainerRef.current.innerHTML = '';
        }
        
        try {
          console.log('🎬 Initializing YouTube player...');
          
          // Verify container exists
          if (!youtubeContainerRef.current) {
            console.error('❌ YouTube container ref is null, cannot create player');
            return;
          }
          
          const playerDiv = document.createElement('div');
          playerDiv.id = `youtube-player-${Date.now()}`;
          youtubeContainerRef.current.appendChild(playerDiv);
          
          const playerVars: any = {
            autoplay: 1, // AUTO-PLAY ENABLED
            controls: 0,
          };
          
          if (playlistId) {
            playerVars.listType = 'playlist';
            playerVars.list = playlistId;
            playerVars.loop = 1;
          } else if (videoId) {
            playerVars.loop = 1;
            playerVars.playlist = videoId;
          }
          
          // Create player but DON'T store ref yet - wait for onReady
          new (window as any).YT.Player(playerDiv, {
            height: '0',
            width: '0',
            videoId: videoId || undefined,
            playerVars,
            events: {
              onReady: (event: any) => {
                console.log('✅ YouTube player ready event fired!');
                
                // Use event.target which is guaranteed to be ready
                const player = event.target;
                
                // Helper function to initialize player after verification
                const initializePlayerAfterReady = (readyPlayer: any) => {
                  try {
                    // Verify player exists
                    if (!readyPlayer) {
                      console.warn('⚠️ Ready player is null or undefined');
                      return;
                    }
                    
                    // Verify player has iframe attached to DOM
                    let iframe = null;
                    try {
                      if (typeof readyPlayer.getIframe === 'function') {
                        iframe = readyPlayer.getIframe();
                      }
                    } catch (iframeErr) {
                      console.warn('⚠️ Could not get iframe:', iframeErr);
                    }
                    
                    if (!iframe || !document.body.contains(iframe)) {
                      console.warn('⚠️ Player iframe not attached to DOM, cannot initialize');
                      return;
                    }
                    
                    // Store the reference BEFORE setTimeout
                    youtubePlayerRef.current = readyPlayer;
                    
                    // Use setTimeout to ensure API is fully ready for calls
                    setTimeout(() => {
                      try {
                        // Use ref.current instead of closure variable
                        const currentPlayer = youtubePlayerRef.current;
                        
                        // Double check player still exists
                        if (!currentPlayer) {
                          console.error('❌ Player reference lost during initialization');
                          return;
                        }
                        
                        // Verify setVolume is available
                        if (typeof currentPlayer.setVolume === 'function') {
                          try {
                            // Set initial volume
                            currentPlayer.setVolume(actualVolume);
                            console.log(`🔊 Initial volume set to ${actualVolume}%`);
                          } catch (volErr) {
                            console.warn('⚠️ Could not set volume:', volErr);
                          }
                        }
                        
                        // Mark player as ready AFTER volume is set
                        setPlayerReady(true);
                        
                        // Expose globally AFTER all setup is done
                        (window as any).youtubePlayer = currentPlayer;
                        console.log('✅ YouTube player fully initialized');
                        
                        // AUTO-PLAY
                        if (typeof currentPlayer.playVideo === 'function') {
                          try {
                            currentPlayer.playVideo();
                            setIsPlaying(true);
                            console.log('▶️ Auto-playing YouTube background music');
                          } catch (playErr) {
                            console.warn('⚠️ Could not auto-play:', playErr);
                          }
                        }
                      } catch (e) {
                        console.error('Error in delayed player initialization:', e);
                      }
                    }, 100); // Small delay to ensure DOM is settled
                  } catch (e) {
                    console.error('Error in player initialization:', e);
                  }
                };
                
                // Wait for iframe to be FULLY attached to DOM with proper retry logic
                const verifyAndInitialize = (attempt = 1, maxAttempts = 10) => {
                  try {
                    // Check if player still exists
                    if (!player) {
                      console.error('❌ Player reference is null, cannot verify');
                      return;
                    }
                    
                    // Check if getIframe method exists
                    if (typeof player.getIframe !== 'function') {
                      if (attempt < maxAttempts) {
                        console.log(`⏳ Waiting for getIframe method (attempt ${attempt}/${maxAttempts})...`);
                        setTimeout(() => verifyAndInitialize(attempt + 1, maxAttempts), 200);
                      } else {
                        console.error('❌ getIframe method never became available');
                      }
                      return;
                    }
                    
                    // Try to get the iframe
                    let iframe;
                    try {
                      iframe = player.getIframe();
                    } catch (iframeError) {
                      // getIframe() can throw if called too early
                      if (attempt < maxAttempts) {
                        console.log(`⏳ getIframe() threw error, retrying (attempt ${attempt}/${maxAttempts})...`);
                        setTimeout(() => verifyAndInitialize(attempt + 1, maxAttempts), 200);
                      } else {
                        console.error('❌ getIframe() never stopped throwing errors');
                      }
                      return;
                    }
                    
                    // Check if iframe is in DOM
                    if (!iframe || !document.body.contains(iframe)) {
                      if (attempt < maxAttempts) {
                        console.log(`⏳ Waiting for iframe to attach to DOM (attempt ${attempt}/${maxAttempts})...`);
                        setTimeout(() => verifyAndInitialize(attempt + 1, maxAttempts), 200);
                      } else {
                        console.error('❌ Iframe never attached to DOM');
                      }
                      return;
                    }
                    
                    // Success - iframe is attached
                    console.log('✅ YouTube iframe verified in DOM');
                    initializePlayerAfterReady(player);
                  } catch (e) {
                    console.error('Error in verifyAndInitialize:', e);
                    if (attempt < maxAttempts) {
                      setTimeout(() => verifyAndInitialize(attempt + 1, maxAttempts), 200);
                    }
                  }
                };
                
                // Start verification process
                verifyAndInitialize();
              },
              onStateChange: (event: any) => {
                if (event.data === (window as any).YT.PlayerState.PLAYING) {
                  setIsPlaying(true);
                }
                if (event.data === (window as any).YT.PlayerState.PAUSED) {
                  setIsPlaying(false);
                }
              },
              onError: (event: any) => {
                console.error('YouTube player error:', event.data);
              }
            },
          });
        } catch (e) {
          console.error('❌ Error creating YouTube player:', e);
        }
      };

      if (youtubeReady) {
        initYouTubePlayer();
      } else {
        console.log('⏳ Waiting for YouTube API to be ready...');
        const checkInterval = setInterval(() => {
          if ((window as any).YT && (window as any).YT.Player) {
            console.log('✅ YouTube API now ready, initializing player');
            clearInterval(checkInterval);
            setYoutubeReady(true);
            initYouTubePlayer();
          }
        }, 100);
        
        setTimeout(() => clearInterval(checkInterval), 10000);
      }
      
      return;
    }
    
  }, [customPlaylists, youtubeReady]);

  // Update volume - SEPARATE EFFECT TO PREVENT PLAYBACK INTERRUPTION
  useEffect(() => {
    // Only attempt to set volume if player is confirmed ready
    if (!playerReady || !youtubePlayerRef.current) {
      console.log('⏸️ Skipping volume update - player not ready yet');
      return;
    }

    try {
      // Verify getIframe method exists before calling
      if (typeof youtubePlayerRef.current.getIframe !== 'function') {
        console.warn('⚠️ getIframe method not available, skipping volume update');
        return;
      }

      // Verify player iframe is still in DOM
      let iframe;
      try {
        iframe = youtubePlayerRef.current.getIframe();
      } catch (e) {
        console.warn('⚠️ Error calling getIframe, player may not be attached to DOM');
        return;
      }

      if (!iframe || !document.body.contains(iframe)) {
        console.warn('⚠️ Player iframe not in DOM, skipping volume update');
        return;
      }

      // Double-check player is ready before making API calls
      if (typeof youtubePlayerRef.current.setVolume !== 'function') {
        console.warn('⚠️ setVolume method not available yet');
        return;
      }

      // Set volume - YouTube API expects 0-100
      youtubePlayerRef.current.setVolume(actualVolume);
      console.log(`🔊🎵 VOLUME UPDATED TO: ${Math.round(actualVolume)}%`);
      console.log(`📊 Settings Context musicVolume: ${settings.musicVolume}`);
      
      // Expose volume getter for debugging - with safety checks
      (window as any).getMusicVolume = () => {
        try {
          if (!youtubePlayerRef.current) {
            return null;
          }
          
          // Verify method exists before calling
          if (typeof youtubePlayerRef.current.getIframe !== 'function') {
            return null;
          }

          // Check iframe is in DOM
          let iframe;
          try {
            iframe = youtubePlayerRef.current.getIframe();
          } catch (e) {
            return null;
          }

          if (!iframe || !document.body.contains(iframe)) {
            return null;
          }
          
          if (typeof youtubePlayerRef.current.getVolume === 'function') {
            const currentVol = youtubePlayerRef.current.getVolume();
            console.log(`🔊 Current YouTube volume: ${currentVol}%`);
            return currentVol;
          }
          return null;
        } catch (e) {
          // Silent fallback - don't spam console
          return null;
        }
      };
    } catch (e) {
      // Silent fallback - player might not be fully ready
      console.warn('⚠️ Volume update skipped - player not fully ready');
    }
  }, [actualVolume, playerReady, settings.musicVolume]);

  return (
    <>
      {/* Hidden YouTube iframe - NO UI, JUST BACKGROUND MUSIC */}
      <div ref={youtubeContainerRef} style={{ display: 'none' }} />
    </>
  );
}