import React, { useState, useEffect } from 'react';
import { Users, UserPlus, UserX, Shield, Code, Eye, X, Search, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { OWNER_INFO } from '../utils/adminPermissions';

interface Friend {
  id: string;
  username: string;
  email: string;
  status: 'pending' | 'accepted' | 'blocked';
  added_at: string;
  is_admin?: boolean;
  admin_role?: 'admin' | 'coder' | 'viewer';
}

/**
 * Friends List Manager - Ruski's Control Panel
 * Add friends and grant them admin/coder access to error reports
 */
export function FriendsListManager({ isOwner }: { isOwner: boolean }) {
  const [showModal, setShowModal] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [showGrantAccess, setShowGrantAccess] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'coder' | 'viewer'>('coder');

  // Get current user email from localStorage
  const getUserEmail = (): string | null => {
    try {
      const savedProfile = localStorage.getItem('userProfile');
      if (savedProfile) {
        const profile = JSON.parse(savedProfile);
        return profile.email || null;
      }
    } catch (error) {
      console.error('Error getting user email:', error);
    }
    return null;
  };

  // Fetch friends list
  const fetchFriends = async () => {
    try {
      setLoading(true);
      const userEmail = getUserEmail();
      
      if (!userEmail) return;

      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/friends/list`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Error fetching friends:', error);
      toast.error('Failed to load friends list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showModal && isOwner) {
      fetchFriends();
    }
  }, [showModal, isOwner]);

  // Add friend by email
  const handleAddFriend = async () => {
    if (!searchEmail) {
      toast.error('Please enter an email address');
      return;
    }

    try {
      const ownerEmail = getUserEmail();
      if (!ownerEmail) {
        toast.error('You must be logged in');
        return;
      }

      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/friends/add`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ownerEmail,
            friendEmail: searchEmail,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Friend added!', {
          description: `${searchEmail} has been added to your friends list`,
        });
        setSearchEmail('');
        fetchFriends();
      } else {
        toast.error('Failed to add friend', {
          description: data.error || 'Unknown error',
        });
      }
    } catch (error) {
      console.error('Error adding friend:', error);
      toast.error('Failed to add friend');
    }
  };

  // Remove friend
  const handleRemoveFriend = async (friendId: string, friendEmail: string) => {
    try {
      const ownerEmail = getUserEmail();
      if (!ownerEmail) {
        toast.error('You must be logged in');
        return;
      }

      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/friends/remove`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ownerEmail,
            friendId,
          }),
        }
      );

      if (response.ok) {
        toast.success('Friend removed');
        fetchFriends();
      } else {
        toast.error('Failed to remove friend');
      }
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    }
  };

  // Grant admin access to friend
  const handleGrantAccess = async () => {
    if (!selectedFriend) return;

    try {
      const ownerEmail = getUserEmail();
      if (!ownerEmail) {
        toast.error('You must be logged in');
        return;
      }

      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/friends/grant-admin`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ownerEmail,
            friendEmail: selectedFriend.email,
            role: selectedRole,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success('Access granted!', {
          description: `${selectedFriend.username} now has ${selectedRole} access`,
        });
        setShowGrantAccess(false);
        setSelectedFriend(null);
        fetchFriends();
      } else {
        toast.error('Failed to grant access', {
          description: data.error || 'Unknown error',
        });
      }
    } catch (error) {
      console.error('Error granting access:', error);
      toast.error('Failed to grant access');
    }
  };

  // Revoke admin access
  const handleRevokeAccess = async (friendEmail: string) => {
    try {
      const ownerEmail = getUserEmail();
      if (!ownerEmail) {
        toast.error('You must be logged in');
        return;
      }

      const { projectId, publicAnonKey } = await import('../utils/supabase/info');
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/friends/revoke-admin`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ownerEmail,
            friendEmail,
          }),
        }
      );

      if (response.ok) {
        toast.success('Access revoked');
        fetchFriends();
      } else {
        toast.error('Failed to revoke access');
      }
    } catch (error) {
      console.error('Error revoking access:', error);
      toast.error('Failed to revoke access');
    }
  };

  if (!isOwner) {
    return null;
  }

  return (
    <>
      {/* Floating Friends Button */}
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 right-6 z-40 bg-gradient-to-br from-blue-600 to-purple-700 p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all border-4 border-blue-400"
        style={{ boxShadow: '0 0 30px rgba(59,130,246,0.6)' }}
      >
        <Users className="w-6 h-6 text-white" />
        {friends.length > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
            {friends.length}
          </div>
        )}
      </button>

      {/* Friends List Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/95 backdrop-blur-sm">
          <div className="bg-gray-900 border-4 border-blue-600 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col m-4">
            {/* Header */}
            <div className="bg-blue-900/40 border-b-4 border-blue-600 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-400" />
                  <div>
                    <h2 className="text-3xl font-bold text-white">Friends & Admin Access</h2>
                    <p className="text-gray-300">Manage your friends and grant error report access</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
                >
                  <X className="w-4 h-4" />
                  Close
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Add Friend Section */}
              <div className="bg-gray-800 border-2 border-green-600 rounded-xl p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-green-400" />
                  Add Friend
                </h3>
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddFriend()}
                      placeholder="Enter friend's email..."
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white focus:border-green-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleAddFriend}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
                  >
                    Add Friend
                  </button>
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  💡 Add friends first, then grant them admin/coder access to view error reports
                </div>
              </div>

              {/* Friends List */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white mb-4">Your Friends ({friends.length})</h3>
                {loading ? (
                  <div className="text-center py-12">
                    <p className="text-white text-xl">Loading friends...</p>
                  </div>
                ) : friends.length === 0 ? (
                  <div className="text-center py-12 bg-gray-800 rounded-xl border-2 border-gray-700">
                    <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-xl">No friends yet</p>
                    <p className="text-gray-500 mt-2">Add friends using their email above</p>
                  </div>
                ) : (
                  friends.map((friend) => (
                    <div
                      key={friend.id}
                      className={`bg-gray-800 border-2 rounded-xl p-4 ${
                        friend.is_admin ? 'border-yellow-600' : 'border-gray-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            friend.is_admin ? 'bg-gradient-to-br from-yellow-500 to-amber-600' : 'bg-gradient-to-br from-blue-500 to-purple-700'
                          }`}>
                            {friend.is_admin ? (
                              <Shield className="w-6 h-6 text-white" />
                            ) : (
                              <Users className="w-6 h-6 text-white" />
                            )}
                          </div>
                          <div>
                            <div className="text-white font-bold flex items-center gap-2">
                              {friend.username}
                              {friend.is_admin && (
                                <span className="bg-yellow-900/50 text-yellow-300 px-2 py-0.5 rounded-full text-xs font-bold">
                                  {friend.admin_role?.toUpperCase()}
                                </span>
                              )}
                            </div>
                            <div className="text-gray-400 text-sm">{friend.email}</div>
                            <div className="text-gray-500 text-xs mt-1">
                              Added {new Date(friend.added_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {friend.is_admin ? (
                            <>
                              <div className="text-green-400 text-sm font-bold flex items-center gap-1">
                                <Check className="w-4 h-4" />
                                Has Access
                              </div>
                              <button
                                onClick={() => handleRevokeAccess(friend.email)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-all"
                              >
                                Revoke
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => {
                                setSelectedFriend(friend);
                                setShowGrantAccess(true);
                              }}
                              className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1"
                            >
                              <Shield className="w-4 h-4" />
                              Grant Access
                            </button>
                          )}
                          <button
                            onClick={() => handleRemoveFriend(friend.id, friend.email)}
                            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-lg transition-all"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-900/80 border-t-4 border-gray-700 p-4">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-400">
                  👑 Owner: {OWNER_INFO.username} ({OWNER_INFO.email})
                </div>
                <div className="text-blue-400 font-bold">
                  {friends.filter(f => f.is_admin).length} friends with admin access
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grant Access Modal */}
      {showGrantAccess && selectedFriend && (
        <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/95 backdrop-blur-sm">
          <div className="bg-gray-900 border-4 border-yellow-600 rounded-2xl max-w-md w-full p-6 m-4">
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-yellow-400" />
              Grant Admin Access
            </h3>
            <p className="text-gray-300 mb-6">
              Give <strong className="text-white">{selectedFriend.username}</strong> access to view error reports?
            </p>

            <div className="space-y-3 mb-6">
              <label className="flex items-center gap-3 p-4 bg-gray-800 border-2 border-gray-700 rounded-lg cursor-pointer hover:border-yellow-500 transition-all">
                <input
                  type="radio"
                  name="role"
                  value="viewer"
                  checked={selectedRole === 'viewer'}
                  onChange={() => setSelectedRole('viewer')}
                  className="w-5 h-5"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-gray-400" />
                    <span className="text-white font-bold">Viewer</span>
                  </div>
                  <div className="text-gray-400 text-sm">Can only view error reports</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-gray-800 border-2 border-gray-700 rounded-lg cursor-pointer hover:border-yellow-500 transition-all">
                <input
                  type="radio"
                  name="role"
                  value="coder"
                  checked={selectedRole === 'coder'}
                  onChange={() => setSelectedRole('coder')}
                  className="w-5 h-5"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Code className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-bold">Coder</span>
                  </div>
                  <div className="text-gray-400 text-sm">Full access to view and download reports</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 bg-gray-800 border-2 border-gray-700 rounded-lg cursor-pointer hover:border-yellow-500 transition-all">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={selectedRole === 'admin'}
                  onChange={() => setSelectedRole('admin')}
                  className="w-5 h-5"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-400" />
                    <span className="text-white font-bold">Admin</span>
                  </div>
                  <div className="text-gray-400 text-sm">Full access (same as coder)</div>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleGrantAccess}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
              >
                Grant Access
              </button>
              <button
                onClick={() => {
                  setShowGrantAccess(false);
                  setSelectedFriend(null);
                }}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-bold transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}