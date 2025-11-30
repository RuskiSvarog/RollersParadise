import { useState } from 'react';

interface PlaylistSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: string[];
  onUpdatePlaylists: (playlists: string[]) => void;
}

// Simple SVG icons to replace lucide-react
const XIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const PlusIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const Trash2Icon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const MusicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"></path>
    <circle cx="6" cy="18" r="3"></circle>
    <circle cx="18" cy="16" r="3"></circle>
  </svg>
);

const YoutubeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
    <polyline points="15 3 21 3 21 9"></polyline>
    <line x1="10" y1="14" x2="21" y2="3"></line>
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

export function PlaylistSettings({ isOpen, onClose, playlists, onUpdatePlaylists }: PlaylistSettingsProps) {
  const [localPlaylists, setLocalPlaylists] = useState<string[]>(playlists || []);
  const [newPlaylistUrl, setNewPlaylistUrl] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isValidPlaylistUrl = (url: string): boolean => {
    // Allow any https:// URL
    if (url.startsWith('https://') || url.startsWith('http://')) {
      return true;
    }
    // YouTube playlist validation
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      return url.includes('list=') || url.includes('playlist');
    }
    // Spotify playlist/album/track validation
    if (url.includes('spotify.com')) {
      return url.includes('/playlist/') || url.includes('/album/') || url.includes('/track/');
    }
    return false;
  };

  const getPlaylistSource = (url: string): string => {
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'YouTube';
    if (url.includes('spotify.com')) return 'Spotify';
    return 'Unknown';
  };

  const handleAddPlaylist = () => {
    setError('');
    
    if (!newPlaylistUrl.trim()) {
      setError('Please enter a playlist URL');
      return;
    }

    if (!isValidPlaylistUrl(newPlaylistUrl)) {
      setError('Invalid playlist URL. Please use YouTube or Spotify playlist links.');
      return;
    }

    if (localPlaylists.includes(newPlaylistUrl)) {
      setError('This playlist is already added');
      return;
    }

    setLocalPlaylists([...localPlaylists, newPlaylistUrl]);
    setNewPlaylistUrl('');
  };

  const handleRemovePlaylist = (index: number) => {
    setLocalPlaylists(localPlaylists.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onUpdatePlaylists(localPlaylists);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 border-2 border-purple-500/30 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 text-white"><MusicIcon /></div>
            <h2 className="text-2xl font-bold text-white">Manage Playlists</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors p-1"
          >
            <div className="w-6 h-6"><XIcon /></div>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <div className="flex gap-3">
              <div className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"><AlertCircleIcon /></div>
              <div>
                <h3 className="text-blue-400 font-semibold mb-1">Supported Playlist Sources</h3>
                <p className="text-gray-300 text-sm mb-2">
                  Add your favorite music playlists to play while you game!
                </p>
                <ul className="text-gray-400 text-sm space-y-1">
                  <li className="flex items-center gap-2">
                    <div className="w-4 h-4 text-red-500"><YoutubeIcon /></div>
                    <span>YouTube Playlists (paste playlist URL)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-4 h-4 text-green-500"><MusicIcon /></div>
                    <span>Spotify Playlists, Albums & Tracks (paste link)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Add Playlist Form */}
          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">
              Add New Playlist
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlaylistUrl}
                onChange={(e) => {
                  setNewPlaylistUrl(e.target.value);
                  setError('');
                }}
                placeholder="Paste YouTube or Spotify playlist URL..."
                className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
              />
              <button
                onClick={handleAddPlaylist}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg shadow-purple-500/30"
              >
                <div className="w-5 h-5"><PlusIcon /></div>
                Add
              </button>
            </div>
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
            <p className="text-gray-500 text-xs mt-2">
              Example: https://www.youtube.com/playlist?list=PLxxxxxxx
            </p>
          </div>

          {/* Playlist List */}
          <div>
            <h3 className="text-white font-semibold mb-3">
              Your Playlists ({localPlaylists.length})
            </h3>
            
            {localPlaylists.length === 0 ? (
              <div className="text-center py-12 bg-gray-800/30 rounded-lg border border-gray-700/50">
                <div className="w-12 h-12 text-gray-600 mx-auto mb-3"><MusicIcon /></div>
                <p className="text-gray-400">No playlists added yet</p>
                <p className="text-gray-500 text-sm mt-1">Add your first playlist above!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {localPlaylists.map((playlist, index) => (
                  <div
                    key={index}
                    className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 flex items-center justify-between hover:border-purple-500/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getPlaylistSource(playlist) === 'YouTube' ? (
                        <div className="w-5 h-5 text-red-500 flex-shrink-0"><YoutubeIcon /></div>
                      ) : (
                        <div className="w-5 h-5 text-green-500 flex-shrink-0"><MusicIcon /></div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold text-sm">
                          {getPlaylistSource(playlist)} Playlist
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          {playlist}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={playlist}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-400 hover:text-purple-400 transition-colors"
                      >
                        <div className="w-4 h-4"><ExternalLinkIcon /></div>
                      </a>
                      <button
                        onClick={() => handleRemovePlaylist(index)}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <div className="w-4 h-4"><Trash2Icon /></div>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-900/50 border-t border-gray-800 p-6 flex items-center justify-between">
          <p className="text-gray-400 text-sm">
            {localPlaylists.length > 0 && `${localPlaylists.length} playlist${localPlaylists.length !== 1 ? 's' : ''} configured`}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all shadow-lg shadow-purple-500/30"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaylistSettings;
