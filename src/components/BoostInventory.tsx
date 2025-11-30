import { useState } from 'react';
import { X, Sparkles, Clock, Zap, Crown, AlertCircle } from './Icons';
import { useBoostInventory, BoostCard } from '../contexts/BoostInventoryContext';
import { useXPBoost } from '../contexts/XPBoostContext';
import { useVIP } from '../contexts/VIPContext';
import { toast } from './ui/sonner';

interface BoostInventoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export function BoostInventory({ isOpen, onClose }: BoostInventoryProps) {
  const { boostCards, useBoostCard } = useBoostInventory();
  const { addBoost, activeBoosts } = useXPBoost();
  const { vipStatus } = useVIP();
  const [selectedCard, setSelectedCard] = useState<BoostCard | null>(null);

  const handleActivateBoost = (card: BoostCard) => {
    if (!vipStatus.isVIP && card.vipOnly) {
      toast.error('VIP membership required to use this boost!');
      return;
    }

    const result = useBoostCard(card.id);
    
    if (result.success) {
      // Add the boost to active boosts
      addBoost(card.name, card.multiplier, card.durationMinutes, 'boost-card');
      
      toast.success(
        <div>
          <div className="font-bold">{result.message}</div>
          <div className="text-sm">{card.multiplier}x XP for {card.durationMinutes >= 60 ? `${card.durationMinutes / 60} hours` : `${card.durationMinutes} minutes`}</div>
        </div>
      );
      
      setSelectedCard(null);
    } else {
      toast.error(result.message);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'from-gray-600 to-gray-700';
      case 'rare': return 'from-blue-600 to-blue-700';
      case 'epic': return 'from-purple-600 to-purple-700';
      case 'legendary': return 'from-yellow-500 to-orange-600';
      default: return 'from-gray-600 to-gray-700';
    }
  };

  const getRarityBorder = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400';
      case 'rare': return 'border-blue-400';
      case 'epic': return 'border-purple-400';
      case 'legendary': return 'border-yellow-400';
      default: return 'border-gray-400';
    }
  };

  const getRarityGlow = (rarity: string) => {
    switch (rarity) {
      case 'common': return '0 0 20px rgba(156, 163, 175, 0.5)';
      case 'rare': return '0 0 20px rgba(59, 130, 246, 0.5)';
      case 'epic': return '0 0 20px rgba(168, 85, 247, 0.5)';
      case 'legendary': return '0 0 30px rgba(251, 191, 36, 0.7)';
      default: return '0 0 20px rgba(156, 163, 175, 0.5)';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
      />

      {/* Modal */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-300"
        style={{
          border: '3px solid #fbbf24',
          boxShadow: '0 0 50px rgba(251, 191, 36, 0.4), 0 20px 60px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-5 border-b-2 border-yellow-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-yellow-400" />
              <div>
                <h2 className="text-white text-2xl font-bold">XP Boost Inventory</h2>
                <p className="text-blue-200 text-sm">Activate your boost cards for temporary XP multipliers</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-yellow-400 transition-colors p-2 hover:bg-white/10 rounded-lg"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
          {/* VIP Notice for non-VIP users */}
          {!vipStatus.isVIP && (
            <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border-2 border-purple-500 rounded-xl p-4 mb-6 flex items-start gap-3">
              <Crown className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-yellow-400 font-bold mb-1">VIP Members Only</h3>
                <p className="text-gray-300 text-sm">
                  Boost cards are an exclusive VIP membership benefit. Upgrade to VIP to unlock powerful XP multipliers you can activate anytime!
                </p>
              </div>
            </div>
          )}

          {/* Active Boosts Summary */}
          {activeBoosts.length > 0 && (
            <div className="bg-green-900/30 border-2 border-green-500 rounded-xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-green-400" />
                <h3 className="text-green-400 font-bold">Currently Active Boosts</h3>
              </div>
              <div className="space-y-2">
                {activeBoosts.map(boost => (
                  <div key={boost.id} className="flex items-center justify-between text-sm">
                    <span className="text-white">{boost.name}</span>
                    <span className="text-green-400 font-bold">{boost.multiplier}x XP</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Boost Cards Grid */}
          {boostCards.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-gray-400 text-xl font-bold mb-2">No Boost Cards</h3>
              <p className="text-gray-500">
                {vipStatus.isVIP 
                  ? 'You\'ll receive boost cards as part of your VIP membership benefits!'
                  : 'Upgrade to VIP membership to get exclusive boost cards!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {boostCards.map(card => (
                <div
                  key={card.id}
                  className={`bg-gradient-to-br ${getRarityColor(card.rarity)} rounded-xl p-5 border-2 ${getRarityBorder(card.rarity)} cursor-pointer relative overflow-hidden hover:scale-105 hover:-translate-y-1 transition-all duration-300`}
                  style={{ boxShadow: getRarityGlow(card.rarity) }}
                  onClick={() => setSelectedCard(card)}
                >
                  {/* Rarity Badge */}
                  <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-xs font-bold uppercase">
                    {card.rarity}
                  </div>

                  {/* Quantity Badge */}
                  <div className="absolute top-2 left-2 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                    x{card.quantity}
                  </div>

                  {/* Card Icon */}
                  <div className="text-6xl text-center mb-3 mt-6">
                    {card.icon}
                  </div>

                  {/* Card Info */}
                  <h3 className="text-white font-bold text-lg text-center mb-2">{card.name}</h3>
                  <p className="text-gray-200 text-sm text-center mb-3">{card.description}</p>

                  {/* Stats */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-200">Multiplier:</span>
                      <span className="text-yellow-400 font-bold">{card.multiplier}x</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-200">Duration:</span>
                      <span className="text-green-400 font-bold">
                        {card.durationMinutes >= 60 
                          ? `${card.durationMinutes / 60}h` 
                          : `${card.durationMinutes}m`}
                      </span>
                    </div>
                  </div>

                  {/* VIP Badge */}
                  {card.vipOnly && (
                    <div className="mt-3 flex items-center justify-center gap-1 text-yellow-400 text-xs">
                      <Crown className="w-3 h-3" />
                      <span className="font-bold">VIP EXCLUSIVE</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activation Confirmation Modal */}
      {selectedCard && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
          <div
            onClick={() => setSelectedCard(null)}
            className="absolute inset-0 bg-black/60 animate-in fade-in duration-300"
          />

          <div
            className={`relative bg-gradient-to-br ${getRarityColor(selectedCard.rarity)} rounded-2xl p-8 border-4 ${getRarityBorder(selectedCard.rarity)} max-w-md w-full animate-in fade-in zoom-in-95 duration-300`}
            style={{ boxShadow: getRarityGlow(selectedCard.rarity) }}
          >
              <div className="text-center">
                <div className="text-8xl mb-4">{selectedCard.icon}</div>
                <h2 className="text-white text-2xl font-bold mb-2">{selectedCard.name}</h2>
                <p className="text-gray-200 mb-4">{selectedCard.description}</p>

                <div className="bg-black/30 rounded-lg p-4 mb-6 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">XP Multiplier:</span>
                    <span className="text-yellow-400 font-bold text-xl">{selectedCard.multiplier}x</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Duration:</span>
                    <span className="text-green-400 font-bold text-xl">
                      {selectedCard.durationMinutes >= 60 
                        ? `${selectedCard.durationMinutes / 60} hours` 
                        : `${selectedCard.durationMinutes} minutes`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Remaining:</span>
                    <span className="text-white font-bold text-xl">x{selectedCard.quantity}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedCard(null)}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleActivateBoost(selectedCard)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-400 hover:to-green-500 text-white py-3 rounded-lg font-bold transition-all"
                    style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)' }}
                  >
                    Activate! ⚡
                  </button>
                </div>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BoostInventory;
