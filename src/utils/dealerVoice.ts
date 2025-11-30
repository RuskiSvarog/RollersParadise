// Dealer Voice System - Realistic Casino Callouts
// Uses Web Speech API for authentic dealer announcements

export interface DealerCallout {
  text: string;
  priority: 'high' | 'normal' | 'low';
}

class DealerVoiceManager {
  private synthesis: SpeechSynthesis | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private volume: number = 0.8;
  private enabled: boolean = true;
  private queue: DealerCallout[] = [];
  private isSpeaking: boolean = false;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.loadVoices();
      
      // Voices load asynchronously
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synthesis) return;
    
    const voices = this.synthesis.getVoices();
    
    // Prefer male US English voices for authentic casino dealer sound
    this.voice = voices.find(v => 
      v.lang === 'en-US' && v.name.includes('Male')
    ) || voices.find(v => 
      v.lang === 'en-US'
    ) || voices[0] || null;
  }

  setVolume(volume: number) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled && this.synthesis) {
      this.synthesis.cancel();
      this.queue = [];
      this.isSpeaking = false;
    }
  }

  private processQueue() {
    if (this.isSpeaking || this.queue.length === 0 || !this.enabled) return;
    
    const callout = this.queue.shift();
    if (!callout) return;
    
    this.speak(callout.text);
  }

  private speak(text: string) {
    if (!this.synthesis || !this.enabled) return;
    
    // Cancel any ongoing speech for immediate callouts
    this.synthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.voice) {
      utterance.voice = this.voice;
    }
    
    utterance.volume = this.volume;
    utterance.rate = 1.1; // Slightly faster for natural casino pace
    utterance.pitch = 0.95; // Natural pitch for conversational tone
    
    utterance.onstart = () => {
      this.isSpeaking = true;
    };
    
    utterance.onend = () => {
      this.isSpeaking = false;
      // Process next in queue after a brief pause
      setTimeout(() => this.processQueue(), 200);
    };
    
    utterance.onerror = () => {
      this.isSpeaking = false;
      this.processQueue();
    };
    
    this.synthesis.speak(utterance);
  }

  announce(text: string, priority: 'high' | 'normal' | 'low' = 'normal') {
    if (!this.enabled) return;
    
    if (priority === 'high') {
      // High priority - clear queue and speak immediately
      this.queue = [];
      this.speak(text);
    } else {
      // Add to queue
      this.queue.push({ text, priority });
      this.processQueue();
    }
  }

  // === COME-OUT ROLL CALLOUTS ===
  
  announceComingOut() {
    this.announce("Coming out!", 'high');
  }

  // === NUMBER CALLOUTS ===
  
  announceNumber(total: number, dice1: number, dice2: number, phase: 'comeOut' | 'point') {
    const callout = this.getNumberCallout(total, dice1, dice2, phase);
    this.announce(callout, 'high');
  }

  private getNumberCallout(total: number, dice1: number, dice2: number, phase: 'comeOut' | 'point'): string {
    const diceCombo = `${dice1} and ${dice2}`;
    const isHard = dice1 === dice2;
    
    switch (total) {
      case 2:
        return phase === 'comeOut' 
          ? `Two! Aces, ${diceCombo}. Two's the point.`
          : `Two! Aces, ${diceCombo}.`;
      
      case 3:
        return phase === 'comeOut'
          ? `Three! Ace deuce, ${diceCombo}. Three's the point.`
          : `Three! Ace deuce, ${diceCombo}.`;
      
      case 4:
        if (isHard) {
          return phase === 'comeOut'
            ? `Four, hard four! ${diceCombo}. Four's the point!`
            : `Four, hard four! ${diceCombo}.`;
        }
        return phase === 'comeOut'
          ? `Four, little Joe! ${diceCombo}. Four's the point!`
          : `Four, easy four! ${diceCombo}.`;
      
      case 5:
        return phase === 'comeOut'
          ? `Five, no field! ${diceCombo}. Five's the point!`
          : `Five, no field! ${diceCombo}.`;
      
      case 6:
        if (isHard) {
          return phase === 'comeOut'
            ? `Six, hard six! ${diceCombo}. Six is the point!`
            : `Six, hard six! ${diceCombo}.`;
        }
        return phase === 'comeOut'
          ? `Six! ${diceCombo}. Six is the point!`
          : `Six, easy six! ${diceCombo}.`;
      
      case 7:
        return phase === 'comeOut'
          ? `Seven, winner! ${diceCombo}. Pay the line!`
          : `Seven out! ${diceCombo}. Line away!`;
      
      case 8:
        if (isHard) {
          return phase === 'comeOut'
            ? `Eight, hard eight! ${diceCombo}. Eight is the point!`
            : `Eight, hard eight! ${diceCombo}.`;
        }
        return phase === 'comeOut'
          ? `Eight! ${diceCombo}. Eight is the point!`
          : `Eight, easy eight! ${diceCombo}.`;
      
      case 9:
        return phase === 'comeOut'
          ? `Nine, center field! ${diceCombo}. Nine's the point!`
          : `Nine, center field! ${diceCombo}.`;
      
      case 10:
        if (isHard) {
          return phase === 'comeOut'
            ? `Ten, hard ten! ${diceCombo}. Ten is the point!`
            : `Ten, hard ten! ${diceCombo}.`;
        }
        return phase === 'comeOut'
          ? `Ten! ${diceCombo}. Ten is the point!`
          : `Ten, easy ten! ${diceCombo}.`;
      
      case 11:
        return phase === 'comeOut'
          ? `Yo leven! ${diceCombo}. Eleven's the point.`
          : `Yo! ${diceCombo}.`;
      
      case 12:
        return phase === 'comeOut'
          ? `Twelve, midnight! Boxcars, ${diceCombo}. Twelve's the point.`
          : `Twelve, boxcars! ${diceCombo}.`;
      
      default:
        return `${total}, ${diceCombo}.`;
    }
  }

  // === POINT CALLOUTS ===
  
  announcePointMade(point: number) {
    const callouts = {
      2: "Two! Point made! Winner!",
      3: "Three! Point made! Winner!",
      4: "Four! Point made! Winner winner!",
      5: "Five! Point made! Winner!",
      6: "Six! Point made! Pay the line!",
      8: "Eight! Point made! Pay the line!",
      9: "Nine! Point made! Winner!",
      10: "Ten! Point made! Winner!",
      11: "Yo! Point made! Winner!",
      12: "Midnight! Point made! Winner!"
    };
    
    this.announce(callouts[point as keyof typeof callouts] || `${point} made!`, 'high');
  }

  announceSevenOut() {
    this.announce("Seven out! Line away!", 'high');
  }

  // === BET CALLOUTS ===
  
  announceFieldWin(total: number) {
    if (total === 2) {
      this.announce("Two in the field, double pay!", 'normal');
    } else if (total === 12) {
      this.announce("Twelve in the field, triple pay!", 'normal');
    } else {
      this.announce("Field winner!", 'normal');
    }
  }

  announceHardwayWin(number: number) {
    const callouts = {
      4: "Hard four, winner!",
      6: "Hard six, winner!", 
      8: "Hard eight, winner!",
      10: "Hard ten, winner!"
    };
    this.announce(callouts[number as keyof typeof callouts] || "Hardway winner!", 'normal');
  }

  announceHardwayLoss(number: number) {
    const callouts = {
      4: "Easy four, down it goes.",
      6: "Easy six, down it goes.",
      8: "Easy eight, down it goes.", 
      10: "Easy ten, down it goes."
    };
    this.announce(callouts[number as keyof typeof callouts] || "Easy way, down.", 'normal');
  }

  announcePlaceBetWin(number: number) {
    this.announce(`${number} winner, pay the ${number}!`, 'normal');
  }

  announceBigWin(amount: number) {
    if (amount >= 1000) {
      this.announce("Big winner, nice roll!", 'high');
    } else if (amount >= 500) {
      this.announce("Winner, good roll!", 'normal');
    }
  }

  // === GAME STATE CALLOUTS ===
  
  announceNewShooter() {
    this.announce("New shooter coming out, place your bets!", 'normal');
  }

  announceLastCall() {
    this.announce("Last call for bets!", 'normal');
  }

  announceNoBets() {
    this.announce("No more bets!", 'high');
  }

  announceSameShooter() {
    this.announce("Same shooter, bets down!", 'normal');
  }

  // === SPECIAL CALLOUTS ===
  
  announceHotShooter(rollCount: number) {
    if (rollCount === 5) {
      this.announce("Hot shooter right here!", 'normal');
    } else if (rollCount === 10) {
      this.announce("Shooter's on fire, keep it going!", 'normal');
    } else if (rollCount === 15) {
      this.announce("Monster roll, what a shooter!", 'normal');
    }
  }

  announceNaturalWinner() {
    this.announce("Natural seven, winner! Pay the line!", 'high');
  }

  announcePointEstablished(point: number) {
    this.announce(`Point is ${point}`, 'high');
  }
}

// Singleton instance
export const dealerVoice = new DealerVoiceManager();

// Export for settings integration
export const setDealerVolume = (volume: number) => dealerVoice.setVolume(volume);
export const setDealerEnabled = (enabled: boolean) => dealerVoice.setEnabled(enabled);