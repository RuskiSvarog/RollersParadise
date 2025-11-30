import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Mail, LogOut, X, Image, Upload, Lock, Phone, Key, ChevronDown, Settings, BarChart3, UserCircle, Eye, EyeOff } from './Icons';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { CasinoBackground } from './CasinoBackground';
import { ProfileSettings } from './ProfileSettings';
import { Security } from '../utils/security';

interface Profile {
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  securityPin?: string;
}

interface ProfileLoginProps {
  profile: Profile | null;
  onLogin: (profile: Profile) => void;
  onLogout: () => void;
  showFullScreen?: boolean;
  onShowSettings?: () => void;
  onShowStats?: () => void;
  onShowProfile?: () => void;
}

// Preset avatars
const PRESET_AVATARS = [
  '🎲', '🌴', '🎰', '🎯', '🏆', '⭐', '💎', '🔥',
  '👑', '🎪', '🎭', '🎨', '🎸', '🚀', '⚡', '💫',
  '🦁', '🐯', '🦅', '🐬', '🦋', '🌺', '🌸', '🌻'
];

export function ProfileLogin({ profile, onLogin, onLogout, showFullScreen = false, onShowSettings, onShowStats, onShowProfile }: ProfileLoginProps) {
  const [showModal, setShowModal] = useState(showFullScreen);
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Sync showModal with showFullScreen prop - ALWAYS show when fullscreen and no profile
  useEffect(() => {
    if (showFullScreen && !profile) {
      setShowModal(true);
    } else if (showFullScreen && profile) {
      // If profile exists in fullscreen mode, hide modal immediately
      // The parent component will handle showing ModeSelection
      console.log('✅ Profile exists in fullscreen mode, hiding login modal');
      setShowModal(false);
    }
  }, [showFullScreen, profile]);
  
  // Auto-close modal when profile is set in non-fullscreen mode
  useEffect(() => {
    if (profile && showModal && !showFullScreen) {
      console.log('✅ Profile detected, closing modal (non-fullscreen mode)');
      setShowModal(false);
    }
  }, [profile, showModal, showFullScreen]);
  
  // Check for auth mode from session storage
  const initialAuthMode = sessionStorage.getItem('auth-mode');
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot-password' | 'forgot-username' | 'verify-pin' | 'reset-password' | 'forgot-pin' | 'verify-security-answer'>(
    initialAuthMode === 'signup' ? 'signup' : 'signin'
  );
  const [step, setStep] = useState<'credentials' | 'avatar' | 'phone-setup'>('credentials');
  
  // Clear the auth mode flag after reading it
  useEffect(() => {
    if (initialAuthMode) {
      sessionStorage.removeItem('auth-mode');
    }
  }, [initialAuthMode]);
  
  // Debug: Log modal and mode changes
  useEffect(() => {
    console.log('🎭 ProfileLogin Modal state:', { 
      showModal, 
      mode, 
      showFullScreen, 
      hasProfile: !!profile,
      willRenderModal: showModal || (showFullScreen && !profile)
    });
  }, [showModal, mode, showFullScreen, profile]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [securityPin, setSecurityPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [customAvatar, setCustomAvatar] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [userIP, setUserIP] = useState<string | null>(null);
  
  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showNewConfirmPassword, setShowNewConfirmPassword] = useState(false);
  
  // Security Questions
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [recoveryEmail, setRecoveryEmail] = useState('');
  
  const SECURITY_QUESTIONS = [
    "What was the name of your first pet?",
    "What city were you born in?",
    "What is your mother's maiden name?",
    "What was the name of your first school?",
    "What is your favorite movie?",
    "What was the make of your first car?",
    "What is your favorite food?",
    "What street did you grow up on?"
  ];
  const [isLoadingIP, setIsLoadingIP] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem('rollers-paradise-credentials');
    if (savedCredentials) {
      try {
        const { email: savedEmail, password: savedPassword, rememberMe: savedRemember } = JSON.parse(savedCredentials);
        if (savedRemember) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
          console.log('✅ Auto-filled saved credentials');
        }
      } catch (error) {
        console.error('Failed to load saved credentials:', error);
      }
    }
  }, []);

  // Check for URL parameters on component mount (for password reset links)
  useEffect(() => {
    console.log('🔄 ProfileLogin mounted!');
    console.log('📍 Current showModal state:', showModal);
    console.log('📍 Current mode state:', mode);
    
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlMode = urlParams.get('mode');
      const token = urlParams.get('token');
      const emailParam = urlParams.get('email');

      console.log('🔍 Checking URL parameters:', {
        fullURL: window.location.href,
        search: window.location.search,
        mode: urlMode,
        token: token?.substring(0, 10) + '...',
        email: emailParam
      });

      if (urlMode === 'reset-password' && token && emailParam) {
        console.log('✅ Password reset link detected! Opening reset form...');
        console.log('📧 Email:', emailParam);
        console.log('🔑 Token:', token);
        setMode('reset-password');
        setResetToken(token);
        setEmail(decodeURIComponent(emailParam));
        setShowModal(true);
        console.log('✅ Modal should now be visible with reset form!');
        // Clean up URL after a short delay to ensure state is set
        setTimeout(() => {
          window.history.replaceState({}, '', window.location.pathname);
          console.log('🧹 URL cleaned up');
        }, 1000);
      }
    } catch (err) {
      console.error('❌ Error parsing URL parameters:', err);
      // Don't crash - just show error
      setError('Invalid reset link. Please request a new password reset.');
    }
  }, []);

  // Fetch user's IP address when component mounts
  useEffect(() => {
    const fetchIP = async () => {
      try {
        setIsLoadingIP(true);
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        setUserIP(data.ip);
      } catch (error) {
        console.error('Failed to fetch IP:', error);
        setUserIP('unknown-' + Date.now());
      } finally {
        setIsLoadingIP(false);
      }
    };
    
    fetchIP();
  }, []);

  useEffect(() => {
    setShowModal(showFullScreen);
  }, [showFullScreen]);

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

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Trim whitespace for validation
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    
    if (!trimmedEmail || !trimmedPassword) {
      setError('Please enter your email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/auth/signin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email: trimmedEmail, password: trimmedPassword, ip: userIP }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = data.error || 'Failed to sign in';
        
        // Enhanced error messages with recovery options
        if (errorMsg.includes('Invalid email or password')) {
          errorMsg = `${errorMsg}\n\n💡 Need help?\n• Click "Forgot Password?" to reset your password\n• Click "Forgot Username?" if you forgot which email you used\n• Make sure you're using the correct email address`;
        }
        
        setError(errorMsg);
        return;
      }

      // Check if 2FA is required
      if (data.requiresPin) {
        setMode('verify-pin');
        setSuccess('Please enter your security PIN');
        return;
      }

      console.log('🎉 Login successful! Calling onLogin with profile:', data.profile);
      
      // Save credentials if "Remember Me" is checked
      if (rememberMe) {
        localStorage.setItem('rollers-paradise-credentials', JSON.stringify({
          email: trimmedEmail,
          password: trimmedPassword,
          rememberMe: true
        }));
        console.log('✅ Credentials saved for auto-login');
      } else {
        // Clear saved credentials if "Remember Me" is unchecked
        localStorage.removeItem('rollers-paradise-credentials');
        console.log('❌ Credentials cleared');
      }
      
      // 🔒 SECURE: Save balance to localStorage if returned by server
      if (data.balance !== undefined) {
        // Load existing save data to preserve rollHistory and stats
        let existingSave: any = null;
        try {
          existingSave = Security.secureLoad(`rollers-paradise-save-${trimmedEmail}`, null);
        } catch (e) {}
        
        const saveData = {
          balance: data.balance,
          rollHistory: existingSave?.rollHistory || [],
          stats: existingSave?.stats || { wins: 0, losses: 0, totalWagered: 0, biggestWin: 0 },
          lastSaved: Date.now()
        };
        
        // Use secure save with encryption
        Security.secureSave(`rollers-paradise-save-${trimmedEmail}`, saveData);
        console.log('💰 Balance loaded from server on signin:', data.balance);
      }
      
      // Close modal first to prevent DOM conflicts
      setShowModal(false);
      
      // Then call onLogin after a delay to allow cleanup
      setTimeout(() => {
        onLogin(data.profile);
        console.log('✅ onLogin callback completed');
        resetForm();
      }, 300);
    } catch (error) {
      console.error('Sign in error:', error);
      setError('Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyPin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!securityPin.trim()) {
      setError('Please enter your security PIN');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/auth/verify-pin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email: email.trim(), pin: securityPin }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid PIN');
        return;
      }

      // 🔒 SECURE: Save balance to localStorage if returned by server
      if (data.balance !== undefined) {
        // Load existing save data to preserve rollHistory and stats
        let existingSave: any = null;
        try {
          existingSave = Security.secureLoad(`rollers-paradise-save-${data.profile.email}`, null);
        } catch (e) {}
        
        const saveData = {
          balance: data.balance,
          rollHistory: existingSave?.rollHistory || [],
          stats: existingSave?.stats || { wins: 0, losses: 0, totalWagered: 0, biggestWin: 0 },
          lastSaved: Date.now()
        };
        
        // Use secure save with encryption
        Security.secureSave(`rollers-paradise-save-${data.profile.email}`, saveData);
        console.log('💰 Balance loaded from server on PIN verify:', data.balance);
      }
      
      // Close modal first to prevent DOM conflicts
      setShowModal(false);
      
      // Then call onLogin after a delay to allow cleanup
      setTimeout(() => {
        onLogin(data.profile);
        resetForm();
      }, 300);
    } catch (error) {
      console.error('PIN verification error:', error);
      setError('Failed to verify PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recoveryEmail.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/auth/get-security-question`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email: recoveryEmail.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Email not found');
        return;
      }

      setSecurityQuestion(data.securityQuestion);
      setEmail(recoveryEmail.trim());
      setMode('verify-security-answer');
      setSuccess('Please answer your security question');
    } catch (error) {
      console.error('Forgot PIN error:', error);
      setError('Failed to retrieve security question. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySecurityAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!securityAnswer.trim()) {
      setError('Please enter your security answer');
      return;
    }

    if (!securityPin.trim() || securityPin.length < 4) {
      setError('New PIN must be at least 4 digits');
      return;
    }

    if (securityPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/auth/reset-pin`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ 
            email: email.trim(), 
            securityAnswer: securityAnswer.trim(),
            newPin: securityPin 
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid security answer');
        return;
      }

      setSuccess('PIN reset successfully! Please sign in with your new PIN.');
      setMode('signin');
      setSecurityPin('');
      setConfirmPin('');
      setSecurityAnswer('');
    } catch (error) {
      console.error('Reset PIN error:', error);
      setError('Failed to reset PIN. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    if (!password.trim() || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setStep('phone-setup');
  };

  const handlePhoneSetup = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phone.trim() || phone.length < 10) {
      setError('Please enter a valid phone number');
      return;
    }

    if (!securityPin.trim() || securityPin.length < 4) {
      setError('Security PIN must be at least 4 digits');
      return;
    }

    if (securityPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    if (!securityQuestion) {
      setError('Please select a security question');
      return;
    }

    if (!securityAnswer.trim()) {
      setError('Please provide an answer to your security question');
      return;
    }

    setError('');
    setStep('avatar');
  };

  const handleSignUpComplete = async () => {
    setIsLoading(true);
    setError('');

    try {
      const avatar = selectedAvatar === 'custom' ? customAvatar : selectedAvatar;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
            phone: phone.trim(),
            securityPin,
            securityQuestion,
            securityAnswer: securityAnswer.trim(),
            avatar,
            ip: userIP,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        let errorMsg = data.error || 'Failed to create account';
        
        // Enhanced error messages with recovery options
        if (errorMsg.includes('email already exists') || errorMsg.includes('email') && errorMsg.includes('taken')) {
          errorMsg = `${errorMsg}\n\n💡 If this is your account and you forgot your login info:\n• Click "Forgot Password?" to reset your password\n• Click "Forgot Username?" to recover your username`;
        } else if (errorMsg.includes('username') && errorMsg.includes('taken')) {
          errorMsg = `${errorMsg}\n\n💡 If this is your account:\n• Try signing in instead\n• Use "Forgot Password?" if you can't remember your password`;
        } else if (errorMsg.includes('device') || errorMsg.includes('IP')) {
          errorMsg = `${errorMsg}\n\n💡 If you forgot your existing account info:\n• Click "Forgot Password?" to reset\n• Click "Forgot Username?" to recover your username`;
        }
        
        setError(errorMsg);
        return;
      }

      // Save balance to localStorage if returned by server (NEW USER - no existing data)
      if (data.balance !== undefined) {
        const saveData = {
          balance: data.balance,
          rollHistory: [],
          stats: { wins: 0, losses: 0, totalWagered: 0, biggestWin: 0 },
          lastSaved: Date.now()
        };
        
        // 🔒 SECURE: Use secure save with encryption
        Security.secureSave(`rollers-paradise-save-${data.profile.email}`, saveData);
        console.log('💰 New user balance initialized:', data.balance);
      }
      
      // Close modal first to prevent DOM conflicts
      setShowModal(false);
      
      // Then call onLogin after a delay to allow cleanup
      setTimeout(() => {
        onLogin(data.profile);
        resetForm();
      }, 300);
    } catch (error) {
      console.error('Sign up error:', error);
      setError('Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔑 Sending forgot password request for:', email.trim());
      
      // ⚠️ IMPORTANT: When running in Figma preview, password reset links WON'T WORK
      // because the email link tries to open inside Figma's iframe system.
      // SOLUTION: Users should manually copy the reset link and open in a new tab!
      
      // Get the FULL current URL (including path) not just the origin
      let appUrl = window.location.href.split('?')[0]; // Remove any existing query params
      
      // 🎯 HARDCODE the Figma Make development URL so emails work correctly
      const figmaMakeUrl = 'https://www.figma.com/make/Xsp4OLzTXgMkPl3zh1ZaAt/Rollers-Paradise?node-id=0-1&p=f&t=kfc2lRNqsGyMfgYS-0';
      
      // If we're in Figma environment, use the hardcoded URL
      const isInFigmaIframe = window.parent !== window || window.location.origin.includes('figma.com');
      if (isInFigmaIframe) {
        appUrl = figmaMakeUrl;
      }
      
      console.log('📍 Full current URL:', window.location.href);
      console.log('📍 App URL for reset:', appUrl);
      console.log('📍 Is in Figma iframe?', isInFigmaIframe);
      
      if (isInFigmaIframe) {
        console.log('⚠️ Using hardcoded Figma Make URL for password reset');
      }
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/auth/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ 
            email: email.trim(),
            appUrl: appUrl // Send the app URL explicitly
          }),
        }
      );

      console.log('📨 Forgot password response status:', response.status);

      const data = await response.json();
      console.log('📨 Forgot password response data:', data);

      if (!response.ok) {
        console.error('❌ Forgot password error:', data.error);
        // Check if it's an email service configuration error
        if (data.error && data.error.includes('Email service not configured')) {
          setError('Email service is not configured yet. Please contact support or try again later.');
        } else {
          setError(data.error || 'Failed to send reset email');
        }
        return;
      }

      console.log('✅ Forgot password email sent successfully!');
      setSuccess('✅ Email sent! Once we get enough support, we\'ll purchase a custom domain to prevent emails from going to spam/junk folders.');
      setTimeout(() => {
        setMode('signin');
        setSuccess('');
      }, 8000);
    } catch (error) {
      console.error('💥 Forgot password error:', error);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotUsername = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/auth/forgot-username`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ email: email.trim() }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send username');
        return;
      }

      setSuccess('✅ Email sent! Once we get enough support, we\'ll purchase a custom domain to prevent emails from going to spam/junk folders.');
      setTimeout(() => {
        setMode('signin');
        setSuccess('');
      }, 8000);
    } catch (error) {
      console.error('Forgot username error:', error);
      setError('Failed to send username. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password.trim() || password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/auth/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            email: email.trim(),
            newPassword: password,
            token: resetToken,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to reset password');
        return;
      }

      setSuccess('Your password has been reset successfully! Redirecting to login...');
      setTimeout(() => {
        setMode('signin');
        setPassword('');
        setConfirmPassword('');
        setSuccess('');
      }, 2000);
    } catch (error) {
      console.error('Reset password error:', error);
      setError('Failed to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setPhone('');
    setSecurityPin('');
    setConfirmPin('');
    setVerificationCode('');
    setError('');
    setSuccess('');
    setStep('credentials');
    setSelectedAvatar(PRESET_AVATARS[0]);
    setCustomAvatar('');
  };

  const handleModalOpen = () => {
    setShowModal(true);
    setMode('signin');
    resetForm();
  };

  return (
    <>
      {/* Profile Button/Display */}
      {profile ? (
        <div className="relative">
          {/* Profile Dropdown Toggle */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900 px-4 py-2 rounded-lg shadow-lg border-2 border-purple-400 transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="text-2xl">{profile.avatar || '🎲'}</div>
              <div>
                <div className="text-xs text-purple-200">Welcome,</div>
                <div className="text-sm text-white font-semibold">{profile.name}</div>
              </div>
              <ChevronDown className={`w-4 h-4 text-white transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              {/* Backdrop to close dropdown */}
              <div 
                className="fixed inset-0 z-[9998]" 
                onClick={() => setShowDropdown(false)}
              />
              
              {/* Dropdown */}
              <div
                className="absolute top-full right-0 mt-2 w-64 bg-gradient-to-br from-gray-900 via-gray-800 to-black border-2 border-purple-500 rounded-xl shadow-2xl overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 zoom-in-95 duration-150"
                style={{
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(168, 85, 247, 0.2)',
                }}
              >
                  {/* Profile Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 border-b border-purple-500/30">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{profile.avatar || '🎲'}</div>
                      <div className="flex-1">
                        <div className="text-white font-semibold">{profile.name}</div>
                        <div className="text-xs text-purple-200">{profile.email}</div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items */}
                  <div className="py-2">
                    {/* Profile Settings */}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        if (onShowProfile) {
                          onShowProfile();
                        }
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-purple-600/20 transition-colors text-left"
                    >
                      <UserCircle className="w-5 h-5 text-purple-400" />
                      <div>
                        <div className="text-white text-sm font-medium">Profile Settings</div>
                        <div className="text-xs text-gray-400">Edit your profile</div>
                      </div>
                    </button>

                    {/* Game Settings */}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        if (onShowSettings) {
                          onShowSettings();
                        }
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-blue-600/20 transition-colors text-left"
                    >
                      <Settings className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="text-white text-sm font-medium">Game Settings</div>
                        <div className="text-xs text-gray-400">Graphics, audio & more</div>
                      </div>
                    </button>

                    {/* Game Statistics */}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        if (onShowStats) {
                          onShowStats();
                        }
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-green-600/20 transition-colors text-left"
                    >
                      <BarChart3 className="w-5 h-5 text-green-400" />
                      <div>
                        <div className="text-white text-sm font-medium">Game Statistics</div>
                        <div className="text-xs text-gray-400">View your stats</div>
                      </div>
                    </button>

                    {/* Divider */}
                    <div className="my-2 border-t border-gray-700" />

                    {/* Log Out */}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        if (confirm('Are you sure you want to log out?')) {
                          onLogout();
                        }
                      }}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-red-600/20 transition-colors text-left"
                    >
                      <LogOut className="w-5 h-5 text-red-400" />
                      <div>
                        <div className="text-white text-sm font-medium">Log Out</div>
                        <div className="text-xs text-gray-400">Sign out of your account</div>
                      </div>
                    </button>
                  </div>
                </div>
              </>
            )
          }
        </div>
      ) : (
        <button
          onClick={handleModalOpen}
          className="bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white px-6 py-2 rounded-lg shadow-lg flex items-center gap-2 transition-all border-2 border-green-400 animate-pulse"
        >
          <User className="w-5 h-5" />
          <div>
            <div className="text-xs">LOGIN / SIGNUP</div>
            <div className="text-[10px] opacity-80">Save Your Progress</div>
          </div>
        </button>
      )}

      {/* Login Modal */}
      {showModal && (
        <>
          {/* Backdrop - with casino background if fullscreen */}
          {showFullScreen ? (
            <div className="fixed inset-0 z-[9998]">
              <CasinoBackground />
            </div>
          ) : (
            <div
              className="fixed inset-0 bg-black/80 z-[9998] animate-in fade-in duration-300"
              onClick={() => setShowModal(false)}
            />
          )}

          {/* Modal */}
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] w-full max-w-md max-h-[90vh] overflow-y-auto animate-in zoom-in-95 slide-in-from-bottom-8 fade-in duration-300"
          >
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black border-4 rounded-2xl shadow-2xl p-8 m-4 relative overflow-hidden" style={{ borderColor: '#fbbf24', boxShadow: '0 0 50px rgba(251, 191, 36, 0.3), 0 20px 60px rgba(0, 0, 0, 0.8)' }}>
                {/* Decorative corner accents - casino style */}
                <div className="absolute top-0 left-0 w-32 h-32 pointer-events-none">
                  <div className="absolute top-4 left-4 w-16 h-1 bg-gradient-to-r from-yellow-400 to-transparent" />
                  <div className="absolute top-4 left-4 w-1 h-16 bg-gradient-to-b from-yellow-400 to-transparent" />
                  <div className="absolute top-6 left-6 text-yellow-400/20 text-4xl">♦</div>
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 pointer-events-none">
                  <div className="absolute top-4 right-4 w-16 h-1 bg-gradient-to-l from-yellow-400 to-transparent" />
                  <div className="absolute top-4 right-4 w-1 h-16 bg-gradient-to-b from-yellow-400 to-transparent" />
                  <div className="absolute top-6 right-6 text-yellow-400/20 text-4xl">♠</div>
                </div>
                <div className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none">
                  <div className="absolute bottom-4 left-4 w-16 h-1 bg-gradient-to-r from-yellow-400 to-transparent" />
                  <div className="absolute bottom-4 left-4 w-1 h-16 bg-gradient-to-t from-yellow-400 to-transparent" />
                  <div className="absolute bottom-6 left-6 text-yellow-400/20 text-4xl">♥</div>
                </div>
                <div className="absolute bottom-0 right-0 w-32 h-32 pointer-events-none">
                  <div className="absolute bottom-4 right-4 w-16 h-1 bg-gradient-to-l from-yellow-400 to-transparent" />
                  <div className="absolute bottom-4 right-4 w-1 h-16 bg-gradient-to-t from-yellow-400 to-transparent" />
                  <div className="absolute bottom-6 right-6 text-yellow-400/20 text-4xl">♣</div>
                </div>

                {/* Animated sparkle effects */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute text-yellow-400/40 text-2xl animate-pulse"
                      style={{
                        left: `${15 + (i * 15)}%`,
                        top: `${10 + (i % 3) * 30}%`,
                        animationDelay: `${i * 500}ms`,
                        animationDuration: '3s'
                      }}
                    >
                      ✦
                    </div>
                  ))}
                </div>

                {/* Close button - only show if not fullscreen */}
                {!showFullScreen && (
                  <button
                    onClick={() => setShowModal(false)}
                    className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-all z-10 shadow-lg hover:scale-110"
                    style={{ boxShadow: '0 0 20px rgba(220, 38, 38, 0.5)' }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                {/* Title */}
                <div className="text-center mb-6 relative z-10">
                  <div 
                    className="inline-block p-1 rounded-full mb-4 relative animate-pulse"
                    style={{ 
                      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)',
                      boxShadow: '0 0 30px rgba(251, 191, 36, 0.6), 0 10px 30px rgba(0, 0, 0, 0.5)'
                    }}
                  >
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-full">
                      {mode === 'verify-pin' ? (
                        <Lock className="w-12 h-12 text-yellow-400" />
                      ) : (
                        <User className="w-12 h-12 text-yellow-400" />
                      )}
                    </div>
                  </div>
                  <h2 className="text-4xl mb-2 relative">
                    <span 
                      className="bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 bg-clip-text text-transparent italic drop-shadow-lg" 
                      style={{ 
                        fontFamily: 'Georgia, serif',
                        textShadow: '0 0 20px rgba(251, 191, 36, 0.5), 0 2px 4px rgba(0, 0, 0, 0.8)'
                      }}
                    >
                      Rollers Paradise
                    </span>
                  </h2>
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-yellow-400/50" />
                    <p className="text-gray-300 text-sm uppercase tracking-wider">
                      {mode === 'signin' && '🎲 Sign In to Play'}
                      {mode === 'signup' && '⭐ Join the Paradise'}
                      {mode === 'forgot-password' && '🔑 Reset Password'}
                      {mode === 'forgot-username' && '📧 Recover Username'}
                      {mode === 'verify-pin' && '🔒 Security Check'}
                      {mode === 'reset-password' && '🔐 New Password'}
                      {mode === 'forgot-pin' && '🔑 Recover PIN'}
                      {mode === 'verify-security-answer' && '🛡️ Security Verification'}
                    </p>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-yellow-400/50" />
                  </div>
                  <p className="text-gray-400 text-xs italic">
                    {mode === 'signup' && 'Create your account and start rolling!'}
                    {mode === 'signin' && 'Welcome back, high roller!'}
                  </p>
                </div>

                {/* Sign In Form */}
                {mode === 'signin' && (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div>
                      <label className="block text-yellow-400/90 text-sm mb-2 font-semibold">Email Address</label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400/70 z-10" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError('');
                          }}
                          placeholder="your@email.com"
                          className="relative w-full pl-12 pr-4 py-3 bg-gray-800/80 border-2 border-yellow-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:bg-gray-800 transition-all backdrop-blur-sm"
                          style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-yellow-400/90 text-sm mb-2 font-semibold">Password</label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400/70 z-10" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setError('');
                          }}
                          placeholder="Enter your password"
                          className="relative w-full pl-12 pr-12 py-3 bg-gray-800/80 border-2 border-yellow-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:bg-gray-800 transition-all backdrop-blur-sm"
                          style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-400/70 hover:text-yellow-400 transition-colors z-10"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {/* Remember Me Checkbox */}
                    <div className="flex items-center gap-3 bg-gray-800/50 rounded-lg px-4 py-3 border border-yellow-500/20">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-5 h-5 rounded border-yellow-500/50 bg-gray-700 text-yellow-500 focus:ring-yellow-500 focus:ring-2 cursor-pointer"
                      />
                      <label htmlFor="rememberMe" className="text-gray-300 text-sm cursor-pointer flex-1">
                        💾 Remember me on this device (auto-fill login)
                      </label>
                    </div>

                    {error && (
                      <div
                        className="bg-red-600/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-sm animate-in fade-in slide-in-from-top-2 duration-300"
                      >
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading || isLoadingIP}
                      className="relative w-full py-4 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group text-lg tracking-wide hover:scale-[1.02] active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                        boxShadow: '0 0 30px rgba(16, 185, 129, 0.5), 0 8px 20px rgba(0, 0, 0, 0.4)',
                        border: '2px solid #34d399'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative text-white drop-shadow-lg">
                        {isLoading ? '🎲 SIGNING IN...' : '🎰 SIGN IN'}
                      </span>
                    </button>

                    <div className="flex gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot-password');
                          setError('');
                        }}
                        className="text-yellow-400 hover:text-yellow-500 transition-colors"
                      >
                        Forgot Password?
                      </button>
                      <span className="text-gray-500">|</span>
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot-username');
                          setError('');
                        }}
                        className="text-yellow-400 hover:text-yellow-500 transition-colors"
                      >
                        Forgot Username?
                      </button>
                    </div>


                  </form>
                )}

                {/* PIN Verification Form */}
                {mode === 'verify-pin' && (
                  <form onSubmit={handleVerifyPin} className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Security PIN</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showPin ? "text" : "password"}
                          value={securityPin}
                          onChange={(e) => {
                            setSecurityPin(e.target.value);
                            setError('');
                          }}
                          placeholder="Enter your PIN"
                          maxLength={6}
                          className="w-full pl-12 pr-12 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {success && (
                      <div
                        className="bg-green-600/20 border border-green-500 text-green-300 px-4 py-2 rounded-lg text-sm transition-all"
                      >
                        {success}
                      </div>
                    )}

                    {error && (
                      <div
                        className="bg-red-600/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-sm transition-all"
                      >
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white py-3 rounded-lg font-semibold transition-all border-2 border-green-400 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'VERIFYING...' : 'VERIFY PIN'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-pin');
                        setError('');
                        setSuccess('');
                      }}
                      className="w-full text-yellow-400 text-sm hover:text-yellow-300 transition-colors underline"
                    >
                      Forgot PIN?
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        resetForm();
                      }}
                      className="w-full text-gray-400 hover:text-gray-300 text-sm transition-colors"
                    >
                      ← Back to Sign In
                    </button>
                  </form>
                )}

                {/* Sign Up - Credentials */}
                {mode === 'signup' && step === 'credentials' && (
                  <form onSubmit={handleSignUpCredentials} className="space-y-4 relative z-10">
                    <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                      <p className="text-green-400 text-sm text-center">
                        🎰 <strong>Step 1:</strong> Create Your Account
                      </p>
                    </div>

                    <div>
                      <label className="block text-yellow-400/90 text-sm mb-2 font-semibold">Player Name</label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400/70 z-10" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            setError('');
                          }}
                          placeholder="Enter your name"
                          className="relative w-full pl-12 pr-4 py-3 bg-gray-800/80 border-2 border-yellow-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:bg-gray-800 transition-all backdrop-blur-sm"
                          style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-yellow-400/90 text-sm mb-2 font-semibold">Email Address</label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400/70 z-10" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError('');
                          }}
                          placeholder="your@email.com"
                          className="relative w-full pl-12 pr-4 py-3 bg-gray-800/80 border-2 border-yellow-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:bg-gray-800 transition-all backdrop-blur-sm"
                          style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 ml-1">🔒 One account per email</p>
                    </div>

                    <div>
                      <label className="block text-yellow-400/90 text-sm mb-2 font-semibold">Password</label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400/70 z-10" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setError('');
                          }}
                          placeholder="At least 8 characters"
                          className="relative w-full pl-12 pr-12 py-3 bg-gray-800/80 border-2 border-yellow-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:bg-gray-800 transition-all backdrop-blur-sm"
                          style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-400/70 hover:text-yellow-400 transition-colors z-10"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-yellow-400/90 text-sm mb-2 font-semibold">Confirm Password</label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-orange-400/20 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400/70 z-10" />
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setError('');
                          }}
                          placeholder="Re-enter password"
                          className="relative w-full pl-12 pr-12 py-3 bg-gray-800/80 border-2 border-yellow-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:bg-gray-800 transition-all backdrop-blur-sm"
                          style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-400/70 hover:text-yellow-400 transition-colors z-10"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <div
                        className="bg-red-600/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-sm transition-all"
                      >
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="relative w-full py-4 rounded-lg font-bold transition-all overflow-hidden group text-lg tracking-wide mt-2 hover:scale-105 active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                        boxShadow: '0 0 30px rgba(16, 185, 129, 0.5), 0 8px 20px rgba(0, 0, 0, 0.4)',
                        border: '2px solid #34d399'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative text-white drop-shadow-lg">
                        NEXT: SECURITY SETUP 🔒
                      </span>
                    </button>
                  </form>
                )}

                {/* Sign Up - Phone & PIN Setup */}
                {mode === 'signup' && step === 'phone-setup' && (
                  <form onSubmit={handlePhoneSetup} className="space-y-4 relative z-10">
                    <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                      <p className="text-purple-400 text-sm text-center">
                        🔐 <strong>Step 2:</strong> Secure Your Account
                      </p>
                      <p className="text-gray-400 text-xs text-center mt-1">
                        Add extra layers of protection
                      </p>
                    </div>

                    <div>
                      <label className="block text-yellow-400/90 text-sm mb-2 font-semibold">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400/70 z-10" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value.replace(/\D/g, ''));
                            setError('');
                          }}
                          placeholder="1234567890"
                          maxLength={15}
                          className="w-full pl-12 pr-4 py-3 bg-gray-800/80 border-2 border-yellow-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:bg-gray-800 transition-all backdrop-blur-sm"
                          style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 ml-1">📱 Used for account recovery</p>
                    </div>

                    <div>
                      <label className="block text-yellow-400/90 text-sm mb-2 font-semibold">Security PIN</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400/70 z-10" />
                        <input
                          type={showPin ? "text" : "password"}
                          value={securityPin}
                          onChange={(e) => {
                            setSecurityPin(e.target.value.replace(/\D/g, ''));
                            setError('');
                          }}
                          placeholder="4-6 digit PIN"
                          maxLength={6}
                          className="w-full pl-12 pr-12 py-3 bg-gray-800/80 border-2 border-yellow-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:bg-gray-800 transition-all backdrop-blur-sm"
                          style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPin(!showPin)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-400/70 hover:text-yellow-400 transition-colors z-10"
                        >
                          {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 mt-1 ml-1">🔐 Extra security for withdrawals</p>
                    </div>

                    <div>
                      <label className="block text-yellow-400/90 text-sm mb-2 font-semibold">Confirm PIN</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400/70 z-10" />
                        <input
                          type={showConfirmPin ? "text" : "password"}
                          value={confirmPin}
                          onChange={(e) => {
                            setConfirmPin(e.target.value.replace(/\D/g, ''));
                            setError('');
                          }}
                          placeholder="Re-enter PIN"
                          maxLength={6}
                          className="w-full pl-12 pr-12 py-3 bg-gray-800/80 border-2 border-yellow-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:bg-gray-800 transition-all backdrop-blur-sm"
                          style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPin(!showConfirmPin)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-yellow-400/70 hover:text-yellow-400 transition-colors z-10"
                        >
                          {showConfirmPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-blue-400 text-xs text-center mb-2">
                        🛡️ Security Question (for PIN recovery)
                      </p>
                    </div>

                    <div>
                      <label className="block text-yellow-400/90 text-sm mb-2 font-semibold">Choose a Security Question</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400/70 z-10" />
                        <select
                          value={securityQuestion}
                          onChange={(e) => {
                            setSecurityQuestion(e.target.value);
                            setError('');
                          }}
                          className="w-full pl-12 pr-4 py-3 bg-gray-800/80 border-2 border-yellow-500/30 rounded-lg text-white focus:outline-none focus:border-yellow-400 focus:bg-gray-800 transition-all backdrop-blur-sm appearance-none"
                          style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}
                        >
                          <option value="">Select a question...</option>
                          {SECURITY_QUESTIONS.map((q, i) => (
                            <option key={i} value={q}>{q}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-yellow-400/90 text-sm mb-2 font-semibold">Your Answer</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400/70 z-10" />
                        <input
                          type="text"
                          value={securityAnswer}
                          onChange={(e) => {
                            setSecurityAnswer(e.target.value);
                            setError('');
                          }}
                          placeholder="Your answer (case-insensitive)"
                          className="w-full pl-12 pr-4 py-3 bg-gray-800/80 border-2 border-yellow-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400 focus:bg-gray-800 transition-all backdrop-blur-sm"
                          style={{ boxShadow: '0 4px 15px rgba(0, 0, 0, 0.3)' }}
                        />
                      </div>
                      <p className="text-xs text-gray-400 mt-1 ml-1">💡 Remember this answer - you'll need it to recover your PIN</p>
                    </div>

                    {error && (
                      <div
                        className="bg-red-600/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-sm transition-all"
                      >
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="relative w-full py-4 rounded-lg font-bold transition-all overflow-hidden group text-lg tracking-wide mt-2 hover:scale-105 active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 50%, #6d28d9 100%)',
                        boxShadow: '0 0 30px rgba(139, 92, 246, 0.5), 0 8px 20px rgba(0, 0, 0, 0.4)',
                        border: '2px solid #a78bfa'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative text-white drop-shadow-lg">
                        NEXT: CHOOSE AVATAR 🎨
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('credentials')}
                      className="w-full text-yellow-400/70 hover:text-yellow-400 text-sm transition-colors mt-2 py-2"
                    >
                      ← Back to Credentials
                    </button>
                  </form>
                )}

                {/* Sign Up - Avatar Selection */}
                {mode === 'signup' && step === 'avatar' && (
                  <div className="space-y-4 relative z-10">
                    <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-lg p-4 mb-4">
                      <p className="text-orange-400 text-sm text-center">
                        🎨 <strong>Step 3:</strong> Choose Your Avatar
                      </p>
                      <p className="text-gray-400 text-xs text-center mt-1">
                        Pick your lucky icon
                      </p>
                    </div>
                    <div className="grid grid-cols-6 gap-3">
                      {PRESET_AVATARS.map((avatar, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setSelectedAvatar(avatar)}
                          className={`aspect-square rounded-lg border-2 flex items-center justify-center text-3xl transition-all hover:scale-110 active:scale-95 ${
                            selectedAvatar === avatar 
                              ? 'bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-400 shadow-lg' 
                              : 'bg-gray-800/60 border-yellow-500/20 hover:border-yellow-400/50'
                          }`}
                          style={selectedAvatar === avatar ? { boxShadow: '0 0 20px rgba(251, 191, 36, 0.4)' } : {}}
                        >
                          {avatar}
                        </button>
                      ))}
                    </div>
                    <div>
                      <label className="block text-yellow-400/90 text-sm mb-2 font-semibold">Or Upload Custom Avatar</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="w-full text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-2 file:border-yellow-500/30 file:bg-gray-800/80 file:text-yellow-400 hover:file:bg-gray-700 hover:file:border-yellow-400 file:transition-all cursor-pointer"
                      />
                      {customAvatar && (
                        <div 
                          className="mt-4 flex justify-center transition-all"
                        >
                          <div className="relative">
                            <img src={customAvatar} alt="Custom" className="w-24 h-24 rounded-full border-4 border-yellow-400 shadow-lg" style={{ boxShadow: '0 0 30px rgba(251, 191, 36, 0.5)' }} />
                            <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl">
                              ✓
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {error && (
                      <div
                        className="bg-red-600/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-sm transition-all"
                      >
                        {error}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleSignUpComplete}
                      disabled={isLoading}
                      className="relative w-full py-4 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group text-lg tracking-wide mt-2 hover:scale-105 active:scale-95"
                      style={{
                        background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)',
                        boxShadow: '0 0 30px rgba(245, 158, 11, 0.6), 0 8px 20px rgba(0, 0, 0, 0.4)',
                        border: '2px solid #fbbf24'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <span className="relative text-white drop-shadow-lg">
                        {isLoading ? '⏳ CREATING ACCOUNT...' : '🎰 CREATE ACCOUNT'}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('phone-setup')}
                      className="w-full text-yellow-400/70 hover:text-yellow-400 text-sm transition-colors mt-2 py-2"
                    >
                      ← Back to Security Setup
                    </button>
                  </div>
                )}

                {/* Forgot Password Form */}
                {mode === 'forgot-password' && (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError('');
                          }}
                          placeholder="your@email.com"
                          className="w-full pl-12 pr-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* CRITICAL SPAM WARNING */}
                    <div className="bg-blue-900/30 border-2 border-blue-500 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">💡</div>
                        <div className="flex-1">
                          <p className="text-blue-300 text-base mb-2">
                            <strong>Email Delivery Notice</strong>
                          </p>
                          <p className="text-blue-200 text-sm">
                            Once we get enough support, we'll purchase a custom domain to ensure emails don't go to spam/junk folders. Thank you for your patience!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-green-900/30 border border-green-500/50 rounded-lg p-4">
                      <p className="text-green-300 text-sm">
                        ✅ <strong>New!</strong> The email contains a special reset page that works everywhere - even in Figma preview! Just click the link in the email.
                      </p>
                    </div>

                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-600/20 border border-green-500 text-green-300 px-4 py-2 rounded-lg text-sm"
                      >
                        {success}
                      </motion.div>
                    )}

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-600/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white py-3 rounded-lg font-semibold transition-all border-2 border-green-400 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'SENDING...' : 'SEND RESET LINK'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setError('');
                        setSuccess('');
                      }}
                      className="w-full text-gray-400 hover:text-gray-300 text-sm transition-colors"
                    >
                      ← Back to Sign In
                    </button>
                  </form>
                )}

                {/* Forgot Username Form */}
                {mode === 'forgot-username' && (
                  <form onSubmit={handleForgotUsername} className="space-y-4">
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            setError('');
                          }}
                          placeholder="your@email.com"
                          className="w-full pl-12 pr-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                        />
                      </div>
                    </div>

                    {/* CRITICAL SPAM WARNING */}
                    <div className="bg-blue-900/30 border-2 border-blue-500 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-3xl">💡</div>
                        <div className="flex-1">
                          <p className="text-blue-300 text-base mb-2">
                            <strong>Email Delivery Notice</strong>
                          </p>
                          <p className="text-blue-200 text-sm">
                            Once we get enough support, we'll purchase a custom domain to ensure emails don't go to spam/junk folders. Thank you for your patience!
                          </p>
                        </div>
                      </div>
                    </div>

                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-600/20 border border-green-500 text-green-300 px-4 py-2 rounded-lg text-sm"
                      >
                        {success}
                      </motion.div>
                    )}

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-600/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white py-3 rounded-lg font-semibold transition-all border-2 border-green-400 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'SENDING...' : 'SEND USERNAME'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setError('');
                        setSuccess('');
                      }}
                      className="w-full text-gray-400 hover:text-gray-300 text-sm transition-colors"
                    >
                      ← Back to Sign In
                    </button>
                  </form>
                )}

                {/* Forgot PIN Form */}
                {mode === 'forgot-pin' && (
                  <form onSubmit={handleForgotPin} className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-4">
                      <p className="text-blue-400 text-sm text-center">
                        🔑 Enter your email to recover your PIN
                      </p>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="email"
                          value={recoveryEmail}
                          onChange={(e) => {
                            setRecoveryEmail(e.target.value);
                            setError('');
                          }}
                          placeholder="your@email.com"
                          className="w-full pl-12 pr-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                        />
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-600/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-600/20 border border-green-500 text-green-300 px-4 py-2 rounded-lg text-sm"
                      >
                        {success}
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white py-3 rounded-lg font-semibold transition-all border-2 border-blue-400 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'CHECKING...' : 'CONTINUE'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode('verify-pin');
                        setError('');
                        setSuccess('');
                        setRecoveryEmail('');
                      }}
                      className="w-full text-gray-400 text-sm hover:text-gray-300 transition-colors"
                    >
                      ← Back to PIN verification
                    </button>
                  </form>
                )}

                {/* Verify Security Answer Form */}
                {mode === 'verify-security-answer' && (
                  <form onSubmit={handleVerifySecurityAnswer} className="space-y-4">
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4 mb-4">
                      <p className="text-purple-400 text-sm text-center">
                        🛡️ Answer your security question to reset your PIN
                      </p>
                    </div>

                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <p className="text-gray-400 text-xs mb-2">Security Question:</p>
                      <p className="text-white">{securityQuestion}</p>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Your Answer</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={securityAnswer}
                          onChange={(e) => {
                            setSecurityAnswer(e.target.value);
                            setError('');
                          }}
                          placeholder="Enter your answer"
                          className="w-full pl-12 pr-4 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2">New PIN</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={securityPin}
                          onChange={(e) => {
                            setSecurityPin(e.target.value.replace(/\D/g, ''));
                            setError('');
                          }}
                          placeholder="4-6 digit PIN"
                          maxLength={6}
                          className="w-full pl-12 pr-12 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Confirm New PIN</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showNewConfirmPassword ? "text" : "password"}
                          value={confirmPin}
                          onChange={(e) => {
                            setConfirmPin(e.target.value.replace(/\D/g, ''));
                            setError('');
                          }}
                          placeholder="Re-enter PIN"
                          maxLength={6}
                          className="w-full pl-12 pr-12 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewConfirmPassword(!showNewConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          {showNewConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-600/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-600/20 border border-green-500 text-green-300 px-4 py-2 rounded-lg text-sm"
                      >
                        {success}
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-br from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white py-3 rounded-lg font-semibold transition-all border-2 border-purple-400 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'RESETTING...' : 'RESET PIN'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-pin');
                        setError('');
                        setSuccess('');
                        setSecurityAnswer('');
                        setSecurityPin('');
                        setConfirmPin('');
                      }}
                      className="w-full text-gray-400 text-sm hover:text-gray-300 transition-colors"
                    >
                      ← Back
                    </button>
                  </form>
                )}

                {/* Reset Password Form */}
                {mode === 'reset-password' && (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    {/* Debug info */}
                    <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3 mb-4">
                      <p className="text-blue-300 text-xs">
                        ✅ Reset form loaded for: <strong>{email}</strong>
                      </p>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 text-sm mb-2">New Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showNewPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            setError('');
                          }}
                          placeholder="At least 8 characters"
                          className="w-full pl-12 pr-12 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-gray-300 text-sm mb-2">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showNewConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            setError('');
                          }}
                          placeholder="Re-enter password"
                          className="w-full pl-12 pr-12 py-3 bg-gray-700 border-2 border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewConfirmPassword(!showNewConfirmPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          {showNewConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-600/20 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-sm"
                      >
                        {error}
                      </motion.div>
                    )}

                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-green-600/20 border border-green-500 text-green-300 px-4 py-2 rounded-lg text-sm"
                      >
                        {success}
                      </motion.div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-gradient-to-br from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white py-3 rounded-lg font-semibold transition-all border-2 border-green-400 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'SETTING NEW PASSWORD...' : 'SET NEW PASSWORD'}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMode('signin');
                        setError('');
                        setSuccess('');
                      }}
                      className="w-full text-gray-400 hover:text-gray-300 text-sm transition-colors"
                    >
                      ← Back to Sign In
                    </button>
                  </form>
                )}

                {/* Mode Toggle */}
                {(mode === 'signin' || mode === 'signup') && step === 'credentials' && (
                  <div className="mt-6 text-center relative z-10">
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <div className="h-px flex-1 bg-gradient-to-r from-transparent to-yellow-500/30" />
                      <span className="text-gray-500 text-xs uppercase tracking-wider">Or</span>
                      <div className="h-px flex-1 bg-gradient-to-l from-transparent to-yellow-500/30" />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setMode(mode === 'signin' ? 'signup' : 'signin');
                        setError('');
                        setStep('credentials');
                      }}
                      className="text-yellow-400 hover:text-yellow-300 transition-all font-medium hover:underline decoration-2 underline-offset-4"
                    >
                      {mode === 'signin' ? "✨ Don't have an account? Sign up" : '🎯 Already have an account? Sign in'}
                    </button>
                  </div>
                )}

                {/* Info */}
                {mode === 'signup' && (
                  <div className="mt-6 text-center text-xs relative z-10">
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4 space-y-2">
                      <p className="text-blue-300">🌴 Your game progress will be saved securely</p>
                      <p className="text-purple-300">💾 Access your account from any device</p>
                      <p className="text-green-300">🔒 One account per email and device</p>
                      <p className="text-yellow-300">🎰 100% Fair & Random Gameplay</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )
      }
    </>
  );
}