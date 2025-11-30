import { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { useSounds } from '../contexts/SoundContext';

/**
 * This component bridges the Settings Context to the Sound Context
 * It updates sound volumes whenever settings change
 */
export function SettingsSoundBridge() {
  const { settings } = useSettings();
  const { 
    setMasterVolume, 
    setSoundEffectsVolume, 
    setVoiceVolume,
    setSoundEnabled 
  } = useSounds();

  useEffect(() => {
    // Update master volume (0-100 to 0-1)
    setMasterVolume(settings.masterVolume / 100);
  }, [settings.masterVolume, setMasterVolume]);

  useEffect(() => {
    // Update sound effects volume (0-100 to 0-1)
    setSoundEffectsVolume(settings.soundEffectsVolume / 100);
  }, [settings.soundEffectsVolume, setSoundEffectsVolume]);

  useEffect(() => {
    // Update voice volume (0-100 to 0-1)
    setVoiceVolume(settings.dealerVolume / 100);
  }, [settings.dealerVolume, setVoiceVolume]);

  useEffect(() => {
    // Update sound enabled state
    setSoundEnabled(settings.soundEffects);
  }, [settings.soundEffects, setSoundEnabled]);

  // This component doesn't render anything
  return null;
}
