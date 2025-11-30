import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Key, Camera, Save, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from './Icons';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Profile {
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  securityPin?: string;
  statsPublic?: boolean;
}

interface ProfileSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  onUpdateProfile: (profile: Profile) => void;
}

// Preset avatars
const PRESET_AVATARS = [
  '🎲', '🌴', '🎰', '🎯', '🏆', '⭐', '💎', '🔥',
  '👑', '🎪', '🎭', '🎨', '🎸', '🚀', '⚡', '💫',
  '🦁', '🐯', '🦅', '🐬', '🦋', '🌺', '🌸', '🌻'
];

export function ProfileSettings({ isOpen, onClose, profile, onUpdateProfile }: ProfileSettingsProps) {
  const [name, setName] = useState(profile?.name || '');
  const [email, setEmail] = useState(profile?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityPin, setSecurityPin] = useState(profile?.securityPin || '');
  const [selectedAvatar, setSelectedAvatar] = useState(profile?.avatar || PRESET_AVATARS[0]);
  const [customAvatar, setCustomAvatar] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'avatar' | 'privacy'>('profile');
  const [isExiting, setIsExiting] = useState(false);
  const [statsPublic, setStatsPublic] = useState(profile?.statsPublic !== false); // Default to public

  // Update local state when profile changes
  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setEmail(profile.email);
      setPhone(profile.phone || '');
      setSecurityPin(profile.securityPin || '');
      setSelectedAvatar(profile.avatar || PRESET_AVATARS[0]);
      setStatsPublic(profile.statsPublic !== false);
    }
  }, [profile]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image must be less than 2MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setCustomAvatar(reader.result as string);
        setSelectedAvatar('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setError('');
    setSuccess('');

    // Validation
    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (securityPin && !/^\d{4}$/.test(securityPin)) {
      setError('Security PIN must be 4 digits');
      return;
    }

    if (phone && !/^[\d\s-()]+$/.test(phone)) {
      setError('Invalid phone number format');
      return;
    }

    setIsLoading(true);

    try {
      const finalAvatar = selectedAvatar === 'custom' ? customAvatar : selectedAvatar;
      
      // Prepare update data
      const updateData: any = {
        name: name.trim(),
        email: email.trim(),
        avatar: finalAvatar,
        phone: phone.trim() || undefined,
        securityPin: securityPin || undefined,
      };

      // If password is being changed, include it
      if (newPassword) {
        updateData.password = newPassword;
        updateData.currentPassword = currentPassword;
      }

      // Call backend API to update profile
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/profile/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`,
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      // Update local profile
      const updatedProfile: Profile = {
        name: updateData.name,
        email: updateData.email,
        avatar: updateData.avatar,
        phone: updateData.phone,
        securityPin: updateData.securityPin,
      };

      onUpdateProfile(updatedProfile);
      
      // Save to localStorage as well (SKIP FOR GUESTS)
      const isGuest = updatedProfile.email.includes('@temporary.local');
      if (!isGuest) {
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
      }

      setSuccess('Profile updated successfully!');
      
      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Close modal after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (err: any) {
      console.error('Profile update error:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrivacyUpdate = async () => {
    if (!profile) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/settings/stats-privacy`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: profile.email,
            statsPublic,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update privacy settings');
      }

      // Update local profile
      const updatedProfile = {
        ...profile,
        statsPublic,
      };

      onUpdateProfile(updatedProfile);
      setSuccess('Privacy settings updated!');
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update privacy settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsExiting(false);
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${
        isExiting ? 'animate-out fade-out duration-300' : 'animate-in fade-in duration-300'
      }`}
      onClick={handleClose}
    >
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] overflow-auto rounded-xl shadow-2xl ${
          isExiting
            ? 'animate-out zoom-out-95 fade-out duration-300'
            : 'animate-in zoom-in-95 fade-in duration-300'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.98) 100%)',
          border: '2px solid rgba(251, 191, 36, 0.3)',
          boxShadow: '0 0 60px rgba(251, 191, 36, 0.4), 0 20px 60px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 px-6 py-4 border-b border-yellow-500/30 bg-gray-900/95 backdrop-blur-sm flex items-center justify-between">
          <h2 className="text-2xl text-yellow-400" style={{ textShadow: '0 0 20px rgba(251, 191, 36, 0.6)' }}>
            ⚙️ Profile Settings
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-yellow-500/20 bg-gray-800/50">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 px-6 py-3 text-sm transition-all ${
              activeTab === 'profile'
                ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <User className="w-4 h-4 inline mr-2" />
            Profile Info
          </button>
          <button
            onClick={() => setActiveTab('avatar')}
            className={`flex-1 px-6 py-3 text-sm transition-all ${
              activeTab === 'avatar'
                ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Camera className="w-4 h-4 inline mr-2" />
            Avatar
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 px-6 py-3 text-sm transition-all ${
              activeTab === 'security'
                ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Lock className="w-4 h-4 inline mr-2" />
            Security
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex-1 px-6 py-3 text-sm transition-all ${
              activeTab === 'privacy'
                ? 'bg-yellow-500/20 text-yellow-400 border-b-2 border-yellow-400'
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
          >
            <Eye className="w-4 h-4 inline mr-2" />
            Privacy
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <p className="text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <p className="text-green-400">{success}</p>
            </div>
          )}

          {/* Profile Info Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
              {/* Name Field */}
              <div>
                <label className="block text-yellow-400 text-sm mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Display Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-800/50 border border-yellow-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="Enter your name"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-yellow-400 text-sm mb-2">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-800/50 border border-yellow-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-yellow-400 text-sm mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-gray-800/50 border border-yellow-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          )}

          {/* Avatar Tab */}
          {activeTab === 'avatar' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
              {/* Current Avatar Preview */}
              <div className="text-center">
                <div className="inline-block relative">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-6xl border-4 border-yellow-400 shadow-lg">
                    {selectedAvatar === 'custom' ? (
                      <img src={customAvatar} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      selectedAvatar
                    )}
                  </div>
                </div>
              </div>

              {/* Preset Avatars */}
              <div>
                <label className="block text-yellow-400 text-sm mb-3">Choose a Preset Avatar</label>
                <div className="grid grid-cols-8 gap-3">
                  {PRESET_AVATARS.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                        selectedAvatar === avatar
                          ? 'bg-yellow-400 scale-110 shadow-lg ring-2 ring-yellow-300'
                          : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Avatar Upload */}
              <div>
                <label className="block text-yellow-400 text-sm mb-3">Or Upload Custom Avatar</label>
                <div className="flex items-center gap-4">
                  <label className="flex-1 bg-gray-800/50 border border-yellow-500/30 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-700/50 transition-colors">
                    <Camera className="w-5 h-5 inline mr-2 text-yellow-400" />
                    <span className="text-white">Choose Image (Max 2MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-gray-400 text-xs mt-2">Supported formats: JPG, PNG, GIF</p>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
              {/* Change Password Section */}
              <div className="bg-gray-800/30 rounded-lg p-4 border border-yellow-500/20">
                <h3 className="text-yellow-400 mb-4">Change Password</h3>
                
                {/* Current Password */}
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-gray-900/50 border border-yellow-500/30 rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-gray-900/50 border border-yellow-500/30 rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                      placeholder="Enter new password (min 6 chars)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-gray-300 text-sm mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-gray-900/50 border border-yellow-500/30 rounded-lg px-4 py-3 pr-12 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Security PIN */}
              <div className="bg-gray-800/30 rounded-lg p-4 border border-yellow-500/20">
                <h3 className="text-yellow-400 mb-4">Security PIN</h3>
                <div>
                  <label className="block text-gray-300 text-sm mb-2">
                    <Key className="w-4 h-4 inline mr-2" />
                    4-Digit PIN (Optional)
                  </label>
                  <input
                    type="text"
                    value={securityPin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setSecurityPin(value);
                    }}
                    className="w-full bg-gray-900/50 border border-yellow-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-400 transition-colors"
                    placeholder="Enter 4-digit PIN"
                    maxLength={4}
                  />
                  <p className="text-gray-400 text-xs mt-2">
                    Used for additional account security and verification
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
              {/* Stats Privacy Section */}
              <div className="bg-gray-800/30 rounded-lg p-4 border border-yellow-500/20">
                <h3 className="text-yellow-400 mb-4">Statistics Privacy</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <label className="text-gray-300 font-medium">Public Statistics</label>
                      <p className="text-gray-400 text-sm mt-1">
                        Allow friends to view your game statistics (wins, losses, level, etc.)
                      </p>
                    </div>
                    <button
                      onClick={() => setStatsPublic(!statsPublic)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        statsPublic ? 'bg-green-500' : 'bg-gray-600'
                      }`}
                    >
                      <div
                        className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                          statsPublic ? 'translate-x-7' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                    <p className="text-blue-300 text-sm">
                      {statsPublic
                        ? '✓ Your stats are visible to friends'
                        : '🔒 Your stats are private'}
                    </p>
                  </div>

                  <button
                    onClick={handlePrivacyUpdate}
                    disabled={isLoading}
                    className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                        Updating...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save Privacy Settings
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Privacy Information */}
              <div className="bg-gray-800/30 rounded-lg p-4 border border-yellow-500/20">
                <h3 className="text-yellow-400 mb-3">Privacy Information</h3>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>• Your email address is never shown to other players</p>
                  <p>• Only friends can send you messages</p>
                  <p>• Your statistics are only visible to friends when set to public</p>
                  <p>• Your online status is visible to all players</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 px-6 py-4 border-t border-yellow-500/30 bg-gray-900/95 backdrop-blur-sm flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={isLoading}
            className="px-6 py-2 rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-400 hover:to-yellow-500 text-black font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
