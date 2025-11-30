import { useState } from 'react';
import { Menu, X, Trophy, Award, BookOpen, History, Lock, BarChart3, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuickAccessMenuProps {
  onOpenChallenges: () => void;
  onOpenLoyalty: () => void;
  onOpenTutorial: () => void;
  onOpenHistory: () => void;
  onOpenPrivateTables: () => void;
  onOpenStats: () => void;
  onOpenBoostInventory: () => void;
}

export function QuickAccessMenu({
  onOpenChallenges,
  onOpenLoyalty,
  onOpenTutorial,
  onOpenHistory,
  onOpenPrivateTables,
  onOpenStats,
  onOpenBoostInventory,
}: QuickAccessMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    {
      icon: Sparkles,
      label: 'XP Boost Cards',
      color: 'from-purple-600 to-blue-600',
      onClick: () => {
        onOpenBoostInventory();
        setIsOpen(false);
      },
    },
    {
      icon: Trophy,
      label: 'Daily Challenges',
      color: 'from-yellow-500 to-orange-500',
      onClick: () => {
        onOpenChallenges();
        setIsOpen(false);
      },
    },
    {
      icon: Award,
      label: 'Loyalty Program',
      color: 'from-purple-500 to-pink-500',
      onClick: () => {
        onOpenLoyalty();
        setIsOpen(false);
      },
    },
    {
      icon: BarChart3,
      label: 'Statistics',
      color: 'from-blue-500 to-cyan-500',
      onClick: () => {
        onOpenStats();
        setIsOpen(false);
      },
    },
    {
      icon: History,
      label: 'Hand History',
      color: 'from-green-500 to-emerald-500',
      onClick: () => {
        onOpenHistory();
        setIsOpen(false);
      },
    },
    {
      icon: Lock,
      label: 'Private Tables',
      color: 'from-indigo-500 to-purple-500',
      onClick: () => {
        onOpenPrivateTables();
        setIsOpen(false);
      },
    },
    {
      icon: BookOpen,
      label: 'Tutorial',
      color: 'from-red-500 to-orange-500',
      onClick: () => {
        onOpenTutorial();
        setIsOpen(false);
      },
    },
  ];

  return (
    <>
      {/* Main Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9998] p-4 rounded-full shadow-2xl transition-all"
        style={{
          background: isOpen
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #f59e0b, #d97706)',
          borderWidth: '3px',
          borderColor: '#fbbf24',
          boxShadow: '0 0 30px rgba(251, 191, 36, 0.6), 0 10px 40px rgba(0, 0, 0, 0.5)',
        }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-8 h-8 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Menu className="w-8 h-8 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Menu Items */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9997] bg-black/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Items */}
            <div className="fixed bottom-28 right-6 z-[9998] flex flex-col gap-3">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.button
                    key={item.label}
                    initial={{ opacity: 0, x: 50, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 50, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.05, x: -5 }}
                    onClick={item.onClick}
                    className="flex items-center gap-3 px-5 py-3 rounded-full shadow-xl border-2 border-yellow-400/50"
                    style={{
                      background: `linear-gradient(135deg, ${item.color})`,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
                    }}
                  >
                    <Icon className="w-6 h-6 text-white" />
                    <span className="text-white font-bold text-lg whitespace-nowrap">
                      {item.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
