import { useState } from 'react';
import { Trophy, Star, Check, X } from 'lucide-react';

interface Achievement {
  id: string;
  title: string;
  unlocked: boolean;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementTitleSelectorProps {
  achievements: Achievement[];
  currentTitle?: string;
  onClose: () => void;
}

const RARITY_COLORS = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
};

export function AchievementTitleSelector({ achievements, currentTitle, onClose }: AchievementTitleSelectorProps) {
  const [selectedTitle, setSelectedTitle] = useState<string>(currentTitle || '');

  const unlockedAchievements = achievements.filter(a => a.unlocked);

  const handleSelect = (title: string) => {
    setSelectedTitle(title);
    localStorage.setItem('selected-achievement-title', title);
  };

  const handleClear = () => {
    setSelectedTitle('');
    localStorage.removeItem('selected-achievement-title');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative bg-gradient-to-br from-gray-900 via-purple-950 to-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border-2 border-purple-500">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Trophy className="w-8 h-8 text-yellow-300" />
              <h2 className="text-2xl font-bold text-white">Select Achievement Title</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-purple-100 text-sm mt-2">
            Choose an unlocked achievement to display as your title
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-180px)]">
          {/* Clear button */}
          <div className="mb-4">
            <button
              onClick={handleClear}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedTitle === ''
                  ? 'bg-green-500/20 border-green-500'
                  : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold">No Title</span>
                {selectedTitle === '' && <Check className="w-5 h-5 text-green-400" />}
              </div>
            </button>
          </div>

          {/* Achievement titles */}
          <div className="space-y-3">
            {unlockedAchievements.length === 0 ? (
              <div className="text-center py-8">
                <Star className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No achievements unlocked yet!</p>
                <p className="text-gray-500 text-sm mt-2">Play the game to unlock achievements</p>
              </div>
            ) : (
              unlockedAchievements.map((achievement) => (
                <button
                  key={achievement.id}
                  onClick={() => handleSelect(achievement.title)}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedTitle === achievement.title
                      ? 'bg-green-500/20 border-green-500'
                      : 'bg-gray-800/50 border-gray-700 hover:border-purple-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Trophy className={`w-5 h-5 ${RARITY_COLORS[achievement.rarity]}`} />
                      <div>
                        <div className="text-white font-semibold italic">"{achievement.title}"</div>
                        <div className={`text-xs uppercase tracking-wider ${RARITY_COLORS[achievement.rarity]}`}>
                          {achievement.rarity}
                        </div>
                      </div>
                    </div>
                    {selectedTitle === achievement.title && (
                      <Check className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900/50 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition-all"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
}
