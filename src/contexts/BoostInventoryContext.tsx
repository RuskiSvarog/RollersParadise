import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface BoostCard {
  id: string;
  name: string;
  description: string;
  multiplier: number; // 1.5 = 50% bonus, 2.0 = 100% bonus (double XP)
  durationMinutes: number;
  quantity: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  vipOnly: boolean;
}

interface BoostInventoryContextType {
  boostCards: BoostCard[];
  addBoostCard: (cardType: string, quantity?: number) => void;
  useBoostCard: (cardId: string) => { success: boolean; message: string };
  getCardQuantity: (cardId: string) => number;
  hasAnyBoostCards: boolean;
}

const BoostInventoryContext = createContext<BoostInventoryContextType | undefined>(undefined);

export function useBoostInventory() {
  const context = useContext(BoostInventoryContext);
  if (!context) {
    throw new Error('useBoostInventory must be used within BoostInventoryProvider');
  }
  return context;
}

// Default boost card templates
const BOOST_CARD_TEMPLATES: Record<string, Omit<BoostCard, 'id' | 'quantity'>> = {
  'xp-boost-24h': {
    name: '24-Hour XP Boost',
    description: '50% bonus XP for 24 hours',
    multiplier: 1.5,
    durationMinutes: 1440, // 24 hours
    rarity: 'rare',
    icon: '⚡',
    vipOnly: true,
  },
  'xp-boost-1h': {
    name: '1-Hour XP Surge',
    description: '100% bonus XP (2x) for 1 hour',
    multiplier: 2.0,
    durationMinutes: 60,
    rarity: 'epic',
    icon: '🔥',
    vipOnly: true,
  },
  'xp-boost-mega': {
    name: 'Mega XP Boost',
    description: '200% bonus XP (3x) for 30 minutes',
    multiplier: 3.0,
    durationMinutes: 30,
    rarity: 'legendary',
    icon: '💎',
    vipOnly: true,
  },
  'xp-boost-weekend': {
    name: 'Weekend Warrior',
    description: '75% bonus XP for 48 hours',
    multiplier: 1.75,
    durationMinutes: 2880, // 48 hours
    rarity: 'epic',
    icon: '🎯',
    vipOnly: true,
  },
};

export function BoostInventoryProvider({ children }: { children: ReactNode }) {
  const [boostCards, setBoostCards] = useState<BoostCard[]>([]);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('boost-inventory-v1');
      if (saved) {
        const data = JSON.parse(saved);
        setBoostCards(data.cards || []);
        console.log('✅ Loaded boost inventory:', data.cards?.length || 0, 'card types');
      }
    } catch (error) {
      console.error('Error loading boost inventory:', error);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (boostCards.length >= 0) {
      const data = {
        cards: boostCards,
        lastSaved: Date.now(),
      };
      localStorage.setItem('boost-inventory-v1', JSON.stringify(data));
    }
  }, [boostCards]);

  const addBoostCard = (cardType: string, quantity: number = 1) => {
    const template = BOOST_CARD_TEMPLATES[cardType];
    if (!template) {
      console.error('❌ Unknown boost card type:', cardType);
      return;
    }

    setBoostCards(prev => {
      // Check if card already exists
      const existing = prev.find(card => 
        card.name === template.name && 
        card.multiplier === template.multiplier &&
        card.durationMinutes === template.durationMinutes
      );

      if (existing) {
        // Increase quantity
        return prev.map(card => 
          card.id === existing.id 
            ? { ...card, quantity: card.quantity + quantity }
            : card
        );
      } else {
        // Add new card
        const newCard: BoostCard = {
          id: `card-${Date.now()}-${Math.random()}`,
          ...template,
          quantity,
        };
        return [...prev, newCard];
      }
    });

    console.log(`🎴 Added ${quantity}x ${template.name} boost card(s) to inventory`);
  };

  const useBoostCard = (cardId: string): { success: boolean; message: string } => {
    const card = boostCards.find(c => c.id === cardId);
    
    if (!card) {
      return { success: false, message: 'Boost card not found' };
    }

    if (card.quantity <= 0) {
      return { success: false, message: 'No boost cards remaining' };
    }

    // Decrease quantity
    setBoostCards(prev => 
      prev.map(c => 
        c.id === cardId 
          ? { ...c, quantity: c.quantity - 1 }
          : c
      ).filter(c => c.quantity > 0) // Remove cards with 0 quantity
    );

    console.log(`✅ Used boost card: ${card.name} (${card.quantity - 1} remaining)`);
    
    return { 
      success: true, 
      message: `Activated ${card.name}!`,
    };
  };

  const getCardQuantity = (cardId: string): number => {
    const card = boostCards.find(c => c.id === cardId);
    return card?.quantity || 0;
  };

  const hasAnyBoostCards = boostCards.some(card => card.quantity > 0);

  return (
    <BoostInventoryContext.Provider
      value={{
        boostCards,
        addBoostCard,
        useBoostCard,
        getCardQuantity,
        hasAnyBoostCards,
      }}
    >
      {children}
    </BoostInventoryContext.Provider>
  );
}
