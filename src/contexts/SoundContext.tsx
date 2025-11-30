import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

interface SoundContextType {
  playDiceRoll: () => void;
  playChipPlace: () => void;
  playChipRemove: () => void;
  playWin: (amount: number) => void;
  playSevenOut: () => void;
  playPointEstablished: () => void;
  playCallout: (message: string) => void;
  playDieLock: () => void;
  playButtonClick: () => void;
  playButtonHover: () => void;
  playModalOpen: () => void;
  playModalClose: () => void;
  playError: () => void;
  playJackpot: () => void;
  playHardwayWin: () => void;
  playPropBetWin: () => void;
  playClearBets: () => void;
  playBalanceUpdate: () => void;
  toggleAmbience: (enabled: boolean) => void;
  setMasterVolume: (volume: number) => void;
  setSoundEffectsVolume: (volume: number) => void;
  setAmbienceVolume: (volume: number) => void;
  setVoiceVolume: (volume: number) => void;
  masterVolume: number;
  soundEffectsVolume: number;
  ambienceVolume: number;
  voiceVolume: number;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  playNarrator: (text: string) => void;
  playHomeButtonSound: () => void;
  // NEW CRISP BET SOUNDS
  playPassLineBet: () => void;
  playComeBet: () => void;
  playFieldBet: () => void;
  playPointBet: () => void;
  playLowRoll: () => void;  // 2, 3
  playHighRoll: () => void;  // 11, 12
  playFieldWin: () => void;
  playPointWin: () => void;
  playComeWin: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

export function useSounds() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSounds must be used within SoundProvider');
  }
  return context;
}

interface SoundProviderProps {
  children: React.ReactNode;
}

export function SoundProvider({ children }: SoundProviderProps) {
  const [masterVolume, setMasterVolume] = useState(1.0);
  const [soundEffectsVolume, setSoundEffectsVolume] = useState(1.0);
  const [ambienceVolume, setAmbienceVolume] = useState(1.0);
  const [voiceVolume, setVoiceVolume] = useState(1.0);
  const [soundEnabled, setSoundEnabled] = useState(true); // SOUNDS ON BY DEFAULT! 🔊
  const [audioInitialized, setAudioInitialized] = useState(false); // Track if audio is ready
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const diceAudioRef = useRef<HTMLAudioElement | null>(null); // PRELOAD DICE SOUND!

  // Initialize Audio Context and expose globally
  useEffect(() => {
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // PRELOAD DICE SOUND - Avoid autoplay policy issues!
      console.log('🎲 Preloading dice sound...');
      const diceAudio = new Audio('https://files.catbox.moe/94jo46.mp3');
      diceAudio.preload = 'auto';
      diceAudio.load();
      
      diceAudio.addEventListener('canplaythrough', () => {
        console.log('✅ Dice sound loaded successfully!');
        diceAudioRef.current = diceAudio;
      });
      
      diceAudio.addEventListener('error', (e) => {
        console.error('❌ Failed to load dice sound:', e);
        console.log('Will use fallback synthesized dice sound');
      });
      
      // Expose sound context globally for settings integration
      (window as any).soundContext = {
        setMasterVolume,
        setSoundEffectsVolume,
        setAmbienceVolume,
        setVoiceVolume,
        setSoundEnabled
      };
      console.log('🔊 Sound Context exposed globally for real-time volume control');
    } catch (e) {
      console.warn('Web Audio API not supported');
    }
    
    return () => {
      delete (window as any).soundContext;
      if (diceAudioRef.current) {
        diceAudioRef.current.pause();
        diceAudioRef.current = null;
      }
    };
  }, []);

  // Play synthesized sound using Web Audio API
  const playTone = useCallback((frequency: number, duration: number, volume: number, type: OscillatorType = 'sine') => {
    if (!soundEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;
    gainNode.gain.setValueAtTime(volume * masterVolume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [soundEnabled, masterVolume]);

  // Play noise (for dice rolling effect)
  const playNoise = useCallback((duration: number, volume: number) => {
    if (!soundEnabled || !audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const source = ctx.createBufferSource();
    const gainNode = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    source.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.value = 800;

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    gainNode.gain.value = volume * masterVolume * soundEffectsVolume;

    source.start(ctx.currentTime);
  }, [soundEnabled, masterVolume, soundEffectsVolume]);

  // DICE ROLL - Realistic tumbling sound
  const playDiceRoll = useCallback(() => {
    console.log('🎲 playDiceRoll called!');
    
    // CREATE FRESH AUDIO ELEMENT EVERY TIME!
    try {
      const audio = new Audio('https://files.catbox.moe/94jo46.mp3');
      const effectiveVolume = masterVolume * soundEffectsVolume;
      audio.volume = Math.min(effectiveVolume, 1.0);
      
      console.log('🎲 ATTEMPTING TO PLAY DICE SOUND - Volume:', audio.volume);
      
      audio.play()
        .then(() => {
          console.log('✅ SUCCESS! Dice sound is playing!');
        })
        .catch(err => {
          console.error('❌ Custom dice sound play failed:', err);
          console.log('Using fallback synthesized dice sound');
          playFallbackDiceSound();
        });
    } catch (err) {
      console.error('❌ Error creating audio:', err);
      playFallbackDiceSound();
    }

    // Fallback synthesized dice sound
    function playFallbackDiceSound() {
      console.log('🎵 Playing fallback synthesized dice sound');
      const impacts = [0, 0.12, 0.25, 0.38, 0.55, 0.75, 1.0, 1.3, 1.65, 2.0];
      impacts.forEach((delay, index) => {
        setTimeout(() => {
          const volume = (0.15 - index * 0.012) * soundEffectsVolume;
          playTone(180 + Math.random() * 60, 0.03, volume * 0.6, 'triangle');
          if (index < 6) {
            playTone(120 + Math.random() * 40, 0.02, volume * 0.3, 'sine');
          }
        }, delay * 1000);
      });
    }
  }, [soundEffectsVolume, masterVolume, playTone]);

  // CHIP PLACE - Casino chip clink (MUCH QUIETER!)
  const playChipPlace = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.08; // MUCH QUIETER! (was 0.25)
    
    // Higher frequency for realistic chip clink (ceramic/plastic sound)
    // Main chip impact
    playTone(2400 + Math.random() * 200, 0.03, effectiveVolume * 0.4, 'triangle');
    
    // Secondary chip settling sounds (gentle stack) - only play ONE additional sound
    setTimeout(() => {
      playTone(2200 + Math.random() * 150, 0.02, effectiveVolume * 0.25, 'sine');
    }, 25);
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  // CHIP REMOVE - Casino chip clink (MUCH QUIETER!)
  const playChipRemove = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.08; // MUCH QUIETER! (was 0.25)
    
    // Higher frequency for realistic chip clink (ceramic/plastic sound)
    // Main chip impact
    playTone(2400 + Math.random() * 200, 0.03, effectiveVolume * 0.4, 'triangle');
    
    // Secondary chip settling sounds (gentle stack) - only play ONE additional sound
    setTimeout(() => {
      playTone(2200 + Math.random() * 150, 0.02, effectiveVolume * 0.25, 'sine');
    }, 25);
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  // WIN SOUND - Different sounds based on win amount with MUCH more excitement!
  const playWin = useCallback((amount: number) => {
    if (!soundEnabled) return;

    console.log('🎰 PLAYING WIN SOUND - Amount: $' + amount.toFixed(2));
    
    const effectiveVolume = masterVolume * soundEffectsVolume;
    console.log('🔊 Volumes - Master:', masterVolume, 'SFX:', soundEffectsVolume, 'Effective:', effectiveVolume);

    if (amount < 50) {
      console.log('✨ Small win tier (<$50) - Single ding');
      // Small win ($0-$50) - Single bright ding with light chime
      playTone(1047, 0.15, effectiveVolume * 0.35, 'sine'); // High C
      setTimeout(() => playTone(1319, 0.12, effectiveVolume * 0.25, 'sine'), 80);
      
      // Add coin drop sound
      setTimeout(() => {
        playTone(1500 + Math.random() * 200, 0.04, effectiveVolume * 0.2, 'triangle');
      }, 150);
    } else if (amount < 200) {
      console.log('💰 Medium win tier ($50-$200) - Double ding + cascade');
      // Medium win ($50-$200) - Double ding with coin cascade
      playTone(1047, 0.18, effectiveVolume * 0.4, 'sine');
      setTimeout(() => playTone(1319, 0.18, effectiveVolume * 0.4, 'sine'), 100);
      
      // Coins dropping cascade
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          playTone(1800 + Math.random() * 400, 0.03, effectiveVolume * 0.15, 'triangle');
        }, 200 + i * 35);
      }
      
      // Final chime
      setTimeout(() => playTone(1568, 0.2, effectiveVolume * 0.3, 'sine'), 500);
    } else if (amount < 500) {
      console.log('🎉 BIG WIN tier ($200-$500) - Triple ding + fanfare + cheers!');
      // Big win ($200-$500) - Triple ding with fanfare and celebration
      playTone(1047, 0.2, effectiveVolume * 0.45, 'sine');
      setTimeout(() => playTone(1319, 0.2, effectiveVolume * 0.45, 'sine'), 120);
      setTimeout(() => playTone(1568, 0.25, effectiveVolume * 0.5, 'sine'), 240);
      
      // Coin waterfall
      for (let i = 0; i < 15; i++) {
        setTimeout(() => {
          playTone(1600 + Math.random() * 600, 0.04, effectiveVolume * 0.2, 'triangle');
        }, 350 + i * 30);
      }
      
      // Victory fanfare
      setTimeout(() => {
        [1047, 1319, 1568, 2093].forEach((freq, i) => {
          setTimeout(() => {
            playTone(freq, 0.15, effectiveVolume * 0.4, 'sine');
            playTone(freq * 2, 0.15, effectiveVolume * 0.2, 'sine');
          }, i * 90);
        });
      }, 700);
      
      // Crowd cheer simulation (layered tones)
      setTimeout(() => {
        playTone(400, 0.3, effectiveVolume * 0.15, 'sawtooth');
        playTone(450, 0.3, effectiveVolume * 0.12, 'sawtooth');
        playTone(380, 0.3, effectiveVolume * 0.1, 'sawtooth');
      }, 900);
    } else {
      console.log('🚨💎 HUGE JACKPOT WIN tier ($500+) - FULL CELEBRATION!!!');
      // HUGE WIN ($500+) - Full jackpot celebration with sirens and explosions!
      // Jackpot siren alarm
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          playTone(800, 0.15, effectiveVolume * 0.4, 'square');
          setTimeout(() => playTone(1200, 0.15, effectiveVolume * 0.4, 'square'), 150);
        }, i * 300);
      }
      
      // Massive coin avalanche
      for (let i = 0; i < 25; i++) {
        setTimeout(() => {
          playTone(1400 + Math.random() * 800, 0.05, effectiveVolume * 0.25, 'triangle');
        }, 500 + i * 40);
      }
      
      // Epic fanfare (1.5 seconds)
      setTimeout(() => {
        [523, 659, 784, 1047, 1319, 1568, 2093, 2637].forEach((freq, i) => {
          setTimeout(() => {
            playTone(freq, 0.2, effectiveVolume * 0.5, 'sine');
            playTone(freq * 2, 0.2, effectiveVolume * 0.3, 'sine');
            playTone(freq * 3, 0.2, effectiveVolume * 0.15, 'sine');
            // Sparkle on every other note
            if (i % 2 === 0) {
              setTimeout(() => playTone(freq * 4, 0.08, effectiveVolume * 0.1, 'sine'), 40);
            }
          }, i * 120);
        });
      }, 1500);
      
      // Crowd roar (extended celebration)
      setTimeout(() => {
        playTone(350, 0.6, effectiveVolume * 0.2, 'sawtooth');
        playTone(400, 0.6, effectiveVolume * 0.18, 'sawtooth');
        playTone(450, 0.6, effectiveVolume * 0.15, 'sawtooth');
        playTone(380, 0.6, effectiveVolume * 0.13, 'sawtooth');
      }, 2500);
      
      // Final explosion/crash
      setTimeout(() => {
        playNoise(0.3, effectiveVolume * 0.3);
        playTone(100, 0.2, effectiveVolume * 0.35, 'sawtooth');
      }, 3200);
    }
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone, playNoise]);

  // SEVEN OUT - Losing sound
  const playSevenOut = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.4;
    
    // Descending disappointment sound
    playTone(400, 0.3, effectiveVolume, 'sawtooth');
    setTimeout(() => playTone(300, 0.3, effectiveVolume, 'sawtooth'), 150);
    setTimeout(() => playTone(200, 0.5, effectiveVolume, 'sawtooth'), 300);
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  // POINT ESTABLISHED
  const playPointEstablished = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.35;
    
    // Triumphant horn fanfare for establishing the point!
    playTone(392, 0.18, effectiveVolume * 0.6, 'sine');
    playTone(330, 0.18, effectiveVolume * 0.5, 'sine'); // Harmony
    setTimeout(() => {
      playTone(523, 0.25, effectiveVolume * 0.65, 'sine');
      playTone(440, 0.25, effectiveVolume * 0.5, 'sine'); // Harmony
    }, 120);
    
    // Victory flourish
    setTimeout(() => {
      playTone(659, 0.2, effectiveVolume * 0.55, 'sine');
      playTone(523, 0.2, effectiveVolume * 0.4, 'sine'); // Harmony
    }, 280);
    
    // Crowd cheer (subtle)
    setTimeout(() => {
      playTone(380, 0.25, effectiveVolume * 0.12, 'sawtooth');
      playTone(420, 0.25, effectiveVolume * 0.1, 'sawtooth');
    }, 450);
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  // VOICE CALLOUTS - Using Speech Synthesis API
  const playCallout = useCallback((message: string) => {
    if (!soundEnabled || voiceVolume === 0) return;

    try {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.volume = masterVolume * voiceVolume;
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      
      // Try to find a good voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Male')) || voices[0];
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis not supported', e);
    }
  }, [soundEnabled, masterVolume, voiceVolume]);

  // DIE LOCK - Sound when die locks on value
  const playDieLock = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.3;
    
    // Sharp click/thud when die settles
    playTone(300, 0.08, effectiveVolume * 0.7, 'triangle');
    setTimeout(() => playTone(250, 0.06, effectiveVolume * 0.5, 'sine'), 20);
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  // BUTTON CLICK - Sound when button is clicked
  const playButtonClick = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.2;
    
    // Pleasant button click
    playTone(800, 0.04, effectiveVolume, 'sine');
    setTimeout(() => playTone(1000, 0.03, effectiveVolume * 0.6, 'sine'), 20);
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  // BUTTON HOVER - Subtle sound when button is hovered
  const playButtonHover = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.15;
    
    // Very subtle hover tone
    playTone(1200, 0.02, effectiveVolume, 'sine');
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  // MODAL OPEN - Whoosh in sound
  const playModalOpen = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.25;
    
    // Rising whoosh
    playTone(200, 0.15, effectiveVolume * 0.4, 'sine');
    setTimeout(() => playTone(400, 0.12, effectiveVolume * 0.5, 'sine'), 40);
    setTimeout(() => playTone(600, 0.1, effectiveVolume * 0.3, 'sine'), 80);
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  // MODAL CLOSE - Whoosh out sound
  const playModalClose = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.25;
    
    // Falling whoosh
    playTone(600, 0.1, effectiveVolume * 0.3, 'sine');
    setTimeout(() => playTone(400, 0.12, effectiveVolume * 0.5, 'sine'), 40);
    setTimeout(() => playTone(200, 0.15, effectiveVolume * 0.4, 'sine'), 80);
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  // ERROR - Buzzer sound for invalid actions
  const playError = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.35;
    
    // Double buzz error sound
    playTone(200, 0.1, effectiveVolume, 'sawtooth');
    setTimeout(() => playTone(180, 0.1, effectiveVolume, 'sawtooth'), 120);
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  // JACKPOT - Massive celebration for Small/Tall/All wins
  const playJackpot = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.5;
    
    // Epic ascending fanfare with harmonics
    [392, 494, 587, 698, 784, 880, 988, 1047, 1175, 1319].forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, 0.25, effectiveVolume * 0.5, 'sine');
        playTone(freq * 2, 0.25, effectiveVolume * 0.3, 'sine');
        playTone(freq * 3, 0.25, effectiveVolume * 0.15, 'sine');
        // Add some sparkle
        if (i % 2 === 0) {
          setTimeout(() => playTone(freq * 4, 0.1, effectiveVolume * 0.1, 'sine'), 50);
        }
      }, i * 100);
    });
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  // HARDWAY WIN - Special sound for hardway hits
  const playHardwayWin = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.35;
    
    // Distinctive hardway chime (C major chord)
    playTone(523, 0.3, effectiveVolume, 'sine'); // C
    playTone(659, 0.3, effectiveVolume * 0.8, 'sine'); // E
    playTone(784, 0.3, effectiveVolume * 0.6, 'sine'); // G
    
    // Follow with ascending flourish
    setTimeout(() => playTone(1047, 0.2, effectiveVolume * 0.5, 'sine'), 150);
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  // PROP BET WIN - Special sound for prop bets (Snake Eyes, Yo, etc.)
  const playPropBetWin = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.35;
    
    // Exciting prop bet sound (quick ascending run)
    [659, 784, 880, 1047].forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, 0.12, effectiveVolume, 'sine');
        playTone(freq * 2, 0.12, effectiveVolume * 0.4, 'sine');
      }, i * 60);
    });
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  // CLEAR BETS - Swoosh sound for clearing all bets
  const playClearBets = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.3;
    
    // Whoosh sound (descending sweep)
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        const freq = 2000 - (i * 150);
        playTone(freq, 0.05, effectiveVolume * (0.5 - i * 0.04), 'sine');
      }, i * 20);
    }
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  // BALANCE UPDATE - Cash register sound
  const playBalanceUpdate = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.25;
    
    // Cha-ching cash register sound
    playTone(1000, 0.08, effectiveVolume, 'square');
    setTimeout(() => playTone(1200, 0.08, effectiveVolume * 0.8, 'square'), 60);
    setTimeout(() => playTone(800, 0.15, effectiveVolume * 0.6, 'triangle'), 120);
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  // BACKGROUND AMBIENCE
  const toggleAmbience = useCallback((enabled: boolean) => {
    if (!ambienceRef.current && enabled) {
      // Create subtle background ambience using oscillators
      if (!audioContextRef.current) return;
      
      // We'll create a very subtle background hum
      // In a real app, you'd load an actual ambience audio file
    }
  }, []);

  // NARRATOR - Using Speech Synthesis API
  const playNarrator = useCallback((text: string) => {
    if (!soundEnabled || voiceVolume === 0) return;

    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.volume = masterVolume * voiceVolume;
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      
      // Try to find a good voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Male')) || voices[0];
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis not supported', e);
    }
  }, [soundEnabled, masterVolume, voiceVolume]);

  // HOME BUTTON SOUND - Using Speech Synthesis API
  const playHomeButtonSound = useCallback(() => {
    if (!soundEnabled || voiceVolume === 0) return;

    try {
      const utterance = new SpeechSynthesisUtterance('Home');
      utterance.volume = masterVolume * voiceVolume;
      utterance.rate = 1.1;
      utterance.pitch = 1.0;
      
      // Try to find a good voice
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.includes('Male')) || voices[0];
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis not supported', e);
    }
  }, [soundEnabled, masterVolume, voiceVolume]);

  // NEW CRISP BET SOUNDS
  const playPassLineBet = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.25;
    
    // Bright ascending chime for Pass Line
    playTone(880, 0.08, effectiveVolume, 'sine'); // A
    setTimeout(() => playTone(1047, 0.08, effectiveVolume * 0.8, 'sine'), 50); // C
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  const playComeBet = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.25;
    
    // Bright double chime for Come bet
    playTone(784, 0.08, effectiveVolume, 'sine'); // G
    setTimeout(() => playTone(988, 0.08, effectiveVolume * 0.8, 'sine'), 50); // B
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  const playFieldBet = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.25;
    
    // Sharp, crisp field bet sound
    playTone(1175, 0.06, effectiveVolume, 'sine'); // D
    setTimeout(() => playTone(1319, 0.06, effectiveVolume * 0.7, 'sine'), 40); // E
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  const playPointBet = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.25;
    
    // Deep, solid tone for placing numbers
    playTone(659, 0.1, effectiveVolume, 'sine'); // E
    setTimeout(() => playTone(523, 0.08, effectiveVolume * 0.6, 'sine'), 60); // C
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  const playLowRoll = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.3;
    
    // Deep rumble for craps numbers
    playTone(196, 0.15, effectiveVolume, 'sine'); // G low
    playTone(147, 0.15, effectiveVolume * 0.7, 'triangle'); // D low
    setTimeout(() => playTone(165, 0.12, effectiveVolume * 0.5, 'sawtooth'), 80);
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  const playHighRoll = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.3;
    
    // High bright chime for yo-leven and box cars
    playTone(1568, 0.12, effectiveVolume, 'sine'); // G high
    setTimeout(() => playTone(1976, 0.1, effectiveVolume * 0.8, 'sine'), 60); // B high
    setTimeout(() => playTone(2349, 0.08, effectiveVolume * 0.5, 'sine'), 120); // D high
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  const playFieldWin = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.35;
    
    // Quick victory chime
    playTone(1319, 0.12, effectiveVolume, 'sine'); // E
    setTimeout(() => playTone(1568, 0.12, effectiveVolume * 0.8, 'sine'), 70); // G
    
    // Coin cascade
    for (let i = 0; i < 5; i++) {
      setTimeout(() => {
        playTone(1800 + Math.random() * 400, 0.03, effectiveVolume * 0.2, 'triangle');
      }, 150 + i * 25);
    }
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  const playPointWin = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.4;
    
    // Triumphant chord progression
    playTone(523, 0.18, effectiveVolume, 'sine'); // C
    playTone(659, 0.18, effectiveVolume * 0.8, 'sine'); // E harmony
    
    setTimeout(() => {
      playTone(784, 0.2, effectiveVolume, 'sine'); // G
      playTone(659, 0.2, effectiveVolume * 0.7, 'sine'); // E harmony
    }, 120);
    
    setTimeout(() => {
      playTone(1047, 0.25, effectiveVolume * 0.9, 'sine'); // C high
      playTone(784, 0.25, effectiveVolume * 0.6, 'sine'); // G harmony
    }, 260);
    
    // Victory sparkles
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        playTone(2093 + Math.random() * 500, 0.04, effectiveVolume * 0.15, 'sine');
      }, 350 + i * 30);
    }
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  const playComeWin = useCallback(() => {
    if (!soundEnabled) return;

    const effectiveVolume = masterVolume * soundEffectsVolume * 0.38;
    
    // Ascending victory scale
    [784, 880, 988, 1175].forEach((freq, i) => {
      setTimeout(() => {
        playTone(freq, 0.15, effectiveVolume, 'sine');
        playTone(freq * 1.5, 0.15, effectiveVolume * 0.5, 'sine'); // Add harmony
      }, i * 80);
    });
    
    // Coin celebration
    setTimeout(() => {
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          playTone(1600 + Math.random() * 600, 0.04, effectiveVolume * 0.2, 'triangle');
        }, i * 30);
      }
    }, 350);
  }, [soundEnabled, masterVolume, soundEffectsVolume, playTone]);

  return (
    <SoundContext.Provider
      value={{
        playDiceRoll,
        playChipPlace,
        playChipRemove,
        playWin,
        playSevenOut,
        playPointEstablished,
        playCallout,
        playDieLock,
        playButtonClick,
        playButtonHover,
        playModalOpen,
        playModalClose,
        playError,
        playJackpot,
        playHardwayWin,
        playPropBetWin,
        playClearBets,
        playBalanceUpdate,
        toggleAmbience,
        setMasterVolume,
        setSoundEffectsVolume,
        setAmbienceVolume,
        setVoiceVolume,
        masterVolume,
        soundEffectsVolume,
        ambienceVolume,
        voiceVolume,
        soundEnabled,
        setSoundEnabled,
        playNarrator,
        playHomeButtonSound,
        // NEW CRISP BET SOUNDS
        playPassLineBet,
        playComeBet,
        playFieldBet,
        playPointBet,
        playLowRoll,
        playHighRoll,
        playFieldWin,
        playPointWin,
        playComeWin,
      }}
    >
      {children}
    </SoundContext.Provider>
  );
}