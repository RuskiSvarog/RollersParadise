// Audio Setup Guide - Logs helpful instructions to console
export function logAudioSetupGuide() {
  const hasShownGuide = sessionStorage.getItem('audio-setup-guide-shown');
  
  if (!hasShownGuide) {
    console.log('%c🎵 AUDIO SETUP GUIDE 🎰', 'background: #1a1a1a; color: #fbbf24; font-size: 16px; font-weight: bold; padding: 10px;');
    console.log('%cYour audio system is ready, but audio files are missing!', 'color: #10b981; font-size: 14px;');
    console.log('');
    console.log('%c📁 Required Files:', 'color: #fbbf24; font-weight: bold;');
    console.log('  1. public/audio/casino-background.mp3 - Background casino music');
    console.log('  2. public/audio/dice-roll.mp3 - Dice roll sound effect');
    console.log('');
    console.log('%c🎼 Get FREE Casino Music:', 'color: #fbbf24; font-weight: bold;');
    console.log('  • Pixabay: https://pixabay.com/music/search/smooth%20jazz/');
    console.log('  • Bensound: https://www.bensound.com/');
    console.log('  • YouTube Audio Library (in YouTube Studio)');
    console.log('');
    console.log('%c🎲 Dice Sound:', 'color: #fbbf24; font-weight: bold;');
    console.log('  • Your file: https://limewire.com/d/15Vz7#JXWrfUuWv8');
    console.log('  • Or Freesound: https://freesound.org/search/?q=dice+roll');
    console.log('');
    console.log('%c📖 Full Instructions:', 'color: #fbbf24; font-weight: bold;');
    console.log('  • Check: AUDIO_SETUP_INSTRUCTIONS.md');
    console.log('  • Check: RECOMMENDED_CASINO_MUSIC.md');
    console.log('');
    console.log('%c✅ Once files are added, the app will work automatically!', 'color: #10b981; font-size: 14px; font-weight: bold;');
    console.log('');
    
    sessionStorage.setItem('audio-setup-guide-shown', 'true');
  }
}
