import React, { useState, useEffect } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface PasswordResetPageProps {
  onComplete?: () => void;
  testResetData?: { token: string; email: string } | null; // 🧪 For testing
}

export function PasswordResetPage({ onComplete, testResetData }: PasswordResetPageProps) {
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [loading, setLoading] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    console.log('🔧 PasswordResetPage component mounted');
    
    // 🧪 CHECK FOR TEST DATA FIRST
    if (testResetData) {
      console.log('🧪 TEST MODE: Using test data', testResetData);
      setToken(testResetData.token);
      setEmail(testResetData.email);
      setPageReady(true);
      return;
    }
    
    // Parse URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('resetToken');
    const emailParam = urlParams.get('resetEmail');

    console.log('🔧 Password Reset Page Loaded');
    console.log('🔧 Token from URL:', tokenParam);
    console.log('🔧 Email from URL:', emailParam);

    if (tokenParam && emailParam) {
      setToken(tokenParam);
      setEmail(decodeURIComponent(emailParam));
      setPageReady(true);
      console.log('✅ Reset page ready with email:', decodeURIComponent(emailParam));
    } else {
      console.log('❌ Missing token or email parameter');
      setMessage({ 
        text: 'Invalid reset link. Please request a new password reset.', 
        type: 'error' 
      });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      setMessage({ text: 'Password must be at least 8 characters', type: 'error' });
      return;
    }
    
    if (password !== confirmPassword) {
      setMessage({ text: 'Passwords do not match', type: 'error' });
      return;
    }
    
    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/auth/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email,
            newPassword: password,
            token
          })
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage({ 
          text: '✅ Password reset successfully! You can now log in with your new password.', 
          type: 'success' 
        });
        setPassword('');
        setConfirmPassword('');
        
        // Call completion callback after 2 seconds
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 2000);
      } else {
        setMessage({ text: data.error || 'Failed to reset password', type: 'error' });
      }
    } catch (error) {
      console.error('❌ Password reset error:', error);
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!pageReady && !message) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-800">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-purple-800 p-5">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8">
        <h1 className="text-center text-gray-800 mb-6">🎲 Reset Your Password</h1>
        
        {message && (
          <div className={`p-4 rounded-lg mb-5 text-center ${
            message.type === 'error' 
              ? 'bg-red-100 text-red-700 border border-red-300' 
              : 'bg-green-100 text-green-700 border border-green-300'
          }`}>
            {message.text}
          </div>
        )}

        {pageReady && !message?.type && (
          <form onSubmit={handleSubmit}>
            <div className="mb-5">
              <label className="block mb-2 text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                readOnly
                className="w-full p-3 border-2 border-gray-300 rounded-lg bg-gray-100"
              />
            </div>
            
            <div className="mb-5">
              <label className="block mb-2 text-gray-700">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 8 characters"
                required
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
              />
            </div>
            
            <div className="mb-5">
              <label className="block mb-2 text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-purple-600 focus:outline-none"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className={`w-full p-4 rounded-lg text-white transition-colors ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {loading ? 'RESETTING...' : 'RESET PASSWORD'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}