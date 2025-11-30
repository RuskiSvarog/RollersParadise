import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';

interface SoundManagerProps {
  playDiceRoll: boolean;
  onDiceRollComplete?: () => void;
}

export function SoundManager({ playDiceRoll, onDiceRollComplete }: SoundManagerProps) {
  const { settings } = useSettings();
  const diceRollAudioRef = useRef<HTMLAudioElement | null>(null);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [errorLogged, setErrorLogged] = useState(false);

  // Update volume when settings change
  useEffect(() => {
    if (diceRollAudioRef.current) {
      const masterVol = settings.masterVolume / 100;
      const effectsVol = settings.soundEffectsVolume / 100;
      diceRollAudioRef.current.volume = masterVol * effectsVol * 0.6;
    }
  }, [settings.masterVolume, settings.soundEffectsVolume]);

  useEffect(() => {
    // Initialize audio element
    const audio = new Audio();
    const masterVol = settings.masterVolume / 100;
    const effectsVol = settings.soundEffectsVolume / 100;
    audio.volume = masterVol * effectsVol * 0.6;
    
    // Check if audio file exists before setting source
    audio.addEventListener('canplaythrough', () => {
      setAudioAvailable(true);
    });
    
    audio.addEventListener('error', () => {
      if (!errorLogged) {
        console.log('ℹ️ Dice roll sound not found. Place audio file at: public/audio/dice-roll.mp3');
        setErrorLogged(true);
      }
      setAudioAvailable(false);
    });
    
    // Set the source
    audio.src = '/audio/dice-roll.mp3';
    audio.load();
    
    diceRollAudioRef.current = audio;
    
    // Cleanup on unmount
    return () => {
      if (diceRollAudioRef.current) {
        diceRollAudioRef.current.pause();
        diceRollAudioRef.current = null;
      }
    };
  }, [errorLogged, settings.masterVolume, settings.soundEffectsVolume]);

  useEffect(() => {
    if (playDiceRoll && settings.soundEffects && diceRollAudioRef.current && audioAvailable) {
      // Reset audio to beginning
      diceRollAudioRef.current.currentTime = 0;
      
      // Play the sound
      diceRollAudioRef.current.play().catch((error) => {
        console.log('ℹ️ Audio play prevented:', error.message);
        // Browser might block autoplay, user interaction required
      });

      // Call completion callback when audio ends
      if (onDiceRollComplete) {
        diceRollAudioRef.current.onended = onDiceRollComplete;
      }
    } else if (playDiceRoll && onDiceRollComplete) {
      // If audio not available or sound effects disabled, still call the completion callback immediately
      onDiceRollComplete();
    }
  }, [playDiceRoll, onDiceRollComplete, audioAvailable, settings.soundEffects]);

  return null; // This component doesn't render anything
}

// Export a hook for controlling volume
export function useSoundVolume() {
  const setDiceRollVolume = (volume: number) => {
    const audio = document.querySelector('audio[src="/audio/dice-roll.mp3"]') as HTMLAudioElement;
    if (audio) {
      audio.volume = Math.max(0, Math.min(1, volume));
    }
  };

  return { setDiceRollVolume };
}
