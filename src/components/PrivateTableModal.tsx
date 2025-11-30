import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, Copy, Users, Settings as SettingsIcon } from 'lucide-react';
import { motion } from 'motion/react';

interface PrivateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePrivateTable: (settings: PrivateTableSettings) => void;
  onJoinPrivateTable: (code: string) => void;
}

export interface PrivateTableSettings {
  tableName: string;
  password: string;
  maxPlayers: number;
  minBet: number;
  maxBet: number;
  allowSpectators: boolean;
  friendsOnly: boolean;
}

export function PrivateTableModal({ isOpen, onClose, onCreatePrivateTable, onJoinPrivateTable }: PrivateTableModalProps) {
  const [mode, setMode] = useState<'menu' | 'create' | 'join'>('menu');
  const [joinCode, setJoinCode] = useState('');
  const [settings, setSettings] = useState<PrivateTableSettings>({
    tableName: '',
    password: '',
    maxPlayers: 8,
    minBet: 3,
    maxBet: 100,
    allowSpectators: true,
    friendsOnly: false,
  });
  const [generatedCode, setGeneratedCode] = useState('');

  const generateRoomCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleCreateTable = () => {
    if (!settings.tableName.trim()) {
      alert('Please enter a table name');
      return;
    }

    const code = generateRoomCode();
    setGeneratedCode(code);
    onCreatePrivateTable(settings);
  };

  const handleJoinTable = () => {
    if (!joinCode.trim()) {
      alert('Please enter a room code');
      return;
    }
    onJoinPrivateTable(joinCode.toUpperCase());
  };

  const copyCodeToClipboard = () => {
    navigator.clipboard.writeText(generatedCode);
    alert('Room code copied to clipboard!');
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{
        background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.95) 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl shadow-2xl max-w-2xl w-full border-4"
        style={{
          background: 'linear-gradient(135deg, #14532d 0%, #15803d 20%, #16a34a 40%, #15803d 60%, #14532d 100%)',
          borderColor: '#fbbf24',
          boxShadow: '0 0 60px rgba(251, 191, 36, 0.6), 0 20px 80px rgba(0, 0, 0, 0.8)',
        }}
      >
        {/* HEADER */}
        <div
          className="p-6 flex justify-between items-center border-b-4"
          style={{
            background: 'linear-gradient(135deg, #b45309 0%, #d97706 25%, #f59e0b 50%, #d97706 75%, #b45309 100%)',
            borderColor: '#fbbf24',
          }}
        >
          <div className="flex items-center gap-3">
            <Lock className="w-10 h-10" style={{ color: '#fbbf24' }} />
            <div>
              <h2
                className="text-3xl font-bold"
                style={{
                  color: '#fef3c7',
                  textShadow: '0 0 15px rgba(251, 191, 36, 0.8)',
                }}
              >
                🔐 Private Tables
              </h2>
              <p className="text-sm" style={{ color: '#86efac' }}>
                Play with friends only
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="transition-all hover:scale-110"
            style={{ color: '#fef3c7' }}
          >
            <X className="w-7 h-7" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6">
          {mode === 'menu' && (
            <div className="space-y-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setMode('create')}
                className="w-full p-6 rounded-xl font-bold text-xl transition-all border-2"
                style={{
                  background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                  borderColor: '#60a5fa',
                  color: '#fff',
                  boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
                }}
              >
                <Users className="w-12 h-12 mx-auto mb-2" />
                Create Private Table
                <p className="text-sm mt-2 opacity-90">Host a custom table for your friends</p>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => setMode('join')}
                className="w-full p-6 rounded-xl font-bold text-xl transition-all border-2"
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  borderColor: '#4ade80',
                  color: '#fff',
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)',
                }}
              >
                <Lock className="w-12 h-12 mx-auto mb-2" />
                Join Private Table
                <p className="text-sm mt-2 opacity-90">Enter a room code to join</p>
              </motion.button>
            </div>
          )}

          {mode === 'create' && !generatedCode && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('menu')}
                className="text-white hover:text-yellow-400 transition-colors mb-4"
              >
                ← Back
              </button>

              <div>
                <label className="text-white font-bold mb-2 block">Table Name *</label>
                <input
                  type="text"
                  value={settings.tableName}
                  onChange={(e) => setSettings({ ...settings, tableName: e.target.value })}
                  placeholder="e.g., John's High Rollers"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border-2 border-gray-700 focus:border-yellow-400 outline-none"
                  maxLength={30}
                />
              </div>

              <div>
                <label className="text-white font-bold mb-2 block">Password (Optional)</label>
                <input
                  type="password"
                  value={settings.password}
                  onChange={(e) => setSettings({ ...settings, password: e.target.value })}
                  placeholder="Leave blank for no password"
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border-2 border-gray-700 focus:border-yellow-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-white font-bold mb-2 block">Max Players</label>
                  <select
                    value={settings.maxPlayers}
                    onChange={(e) => setSettings({ ...settings, maxPlayers: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border-2 border-gray-700"
                  >
                    <option value={2}>2 Players</option>
                    <option value={4}>4 Players</option>
                    <option value={6}>6 Players</option>
                    <option value={8}>8 Players</option>
                    <option value={10}>10 Players</option>
                  </select>
                </div>

                <div>
                  <label className="text-white font-bold mb-2 block">Min Bet</label>
                  <select
                    value={settings.minBet}
                    onChange={(e) => setSettings({ ...settings, minBet: parseInt(e.target.value) })}
                    className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border-2 border-gray-700"
                  >
                    <option value={1}>$1</option>
                    <option value={3}>$3</option>
                    <option value={5}>$5</option>
                    <option value={10}>$10</option>
                    <option value={25}>$25</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-white font-bold mb-2 block">Max Bet</label>
                <select
                  value={settings.maxBet}
                  onChange={(e) => setSettings({ ...settings, maxBet: parseInt(e.target.value) })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white border-2 border-gray-700"
                >
                  <option value={50}>$50</option>
                  <option value={100}>$100</option>
                  <option value={500}>$500</option>
                  <option value={1000}>$1,000</option>
                  <option value={5000}>$5,000</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowSpectators}
                    onChange={(e) => setSettings({ ...settings, allowSpectators: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span>Allow Spectators</span>
                </label>

                <label className="flex items-center gap-2 text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.friendsOnly}
                    onChange={(e) => setSettings({ ...settings, friendsOnly: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <span>Friends Only</span>
                </label>
              </div>

              <button
                onClick={handleCreateTable}
                className="w-full py-4 rounded-xl font-bold text-xl transition-all"
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#fff',
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)',
                }}
              >
                Create Table
              </button>
            </div>
          )}

          {mode === 'create' && generatedCode && (
            <div className="text-center space-y-6">
              <div className="text-green-400 text-6xl mb-4">✅</div>
              <h3 className="text-white text-2xl font-bold">Table Created!</h3>
              
              <div className="bg-gray-800 rounded-xl p-6 border-2 border-yellow-400">
                <p className="text-gray-400 mb-2">Your Room Code:</p>
                <div className="text-5xl font-bold text-yellow-400 mb-4 tracking-wider">
                  {generatedCode}
                </div>
                <button
                  onClick={copyCodeToClipboard}
                  className="flex items-center gap-2 mx-auto px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <Copy className="w-5 h-5" />
                  Copy Code
                </button>
              </div>

              <p className="text-white">Share this code with your friends to let them join!</p>

              <button
                onClick={onClose}
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors"
              >
                Start Playing
              </button>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-4">
              <button
                onClick={() => setMode('menu')}
                className="text-white hover:text-yellow-400 transition-colors mb-4"
              >
                ← Back
              </button>

              <div>
                <label className="text-white font-bold mb-2 block">Enter Room Code</label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXX"
                  maxLength={6}
                  className="w-full px-4 py-4 rounded-lg bg-gray-800 text-white text-center text-3xl font-bold border-2 border-gray-700 focus:border-yellow-400 outline-none tracking-wider"
                />
              </div>

              <button
                onClick={handleJoinTable}
                disabled={joinCode.length !== 6}
                className="w-full py-4 rounded-xl font-bold text-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  color: '#fff',
                  boxShadow: '0 0 20px rgba(34, 197, 94, 0.5)',
                }}
              >
                Join Table
              </button>

              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4 text-blue-200 text-sm">
                <p className="text-xs">
                  💡 Ask your friend for their 6-character room code to join their private table.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
