import { useState, useEffect, useRef } from 'react';
import { Users, UserPlus, X, MessageCircle, TrendingUp, Search, Check, UserMinus, Clock, Mic, MicOff, Volume2, VolumeX, Phone, PhoneOff } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useSettings } from '../contexts/SettingsContext';

interface Friend {
  email: string;
  name: string;
  avatar?: string;
  level: number;
  isOnline: boolean;
  lastActive?: number;
}

interface FriendRequest {
  from: string;
  fromName: string;
  timestamp: number;
}

interface FriendStats {
  name: string;
  level: number;
  totalWins: number;
  totalLosses: number;
  biggestWin: number;
  totalRolls: number;
  avatar?: string;
}

interface Message {
  from: string;
  fromName: string;
  to: string;
  message: string;
  timestamp: number;
  read: boolean;
}

interface FriendsPanelProps {
  playerEmail: string;
  playerName: string;
  onClose: () => void;
}

export function FriendsPanel({ playerEmail, playerName, onClose }: FriendsPanelProps) {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [friendStats, setFriendStats] = useState<FriendStats | null>(null);
  const [unreadCount, setUnreadCount] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Voice Chat State
  const [voiceCallActive, setVoiceCallActive] = useState(false);
  const [micMuted, setMicMuted] = useState(false);
  const [mutedFriends, setMutedFriends] = useState<Set<string>>(new Set());
  const [isTalking, setIsTalking] = useState(false);
  const [friendTalking, setFriendTalking] = useState<Set<string>>(new Set());
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const signalIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadFriends();
    loadFriendRequests();
    loadUnreadCount();
    
    // Poll for updates every 10 seconds
    const interval = setInterval(() => {
      loadFriends();
      loadFriendRequests();
      loadUnreadCount();
      if (selectedFriend) {
        loadMessages(selectedFriend);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [playerEmail, selectedFriend]);

  const loadFriends = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/friends/list?email=${encodeURIComponent(playerEmail)}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error('Failed to load friends:', error);
    }
  };

  const loadFriendRequests = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/friends/requests?email=${encodeURIComponent(playerEmail)}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFriendRequests(data.requests || []);
      }
    } catch (error) {
      console.error('Failed to load friend requests:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/messages/unread?email=${encodeURIComponent(playerEmail)}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadByFriend || {});
      }
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/friends/search?q=${encodeURIComponent(searchQuery)}&email=${encodeURIComponent(playerEmail)}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results || []);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (toEmail: string) => {
    setLoading(true);
    setMessage('');
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/friends/request`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ fromEmail: playerEmail, toEmail })
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        setMessage('✅ Friend request sent!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage('❌ Failed to send friend request');
    } finally {
      setLoading(false);
    }
  };

  const acceptFriendRequest = async (friendEmail: string) => {
    setLoading(true);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/friends/accept`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email: playerEmail, friendEmail })
        }
      );

      if (response.ok) {
        setMessage('✅ Friend request accepted!');
        loadFriends();
        loadFriendRequests();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('❌ Failed to accept friend request');
    } finally {
      setLoading(false);
    }
  };

  const declineFriendRequest = async (friendEmail: string) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/friends/decline`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email: playerEmail, friendEmail })
        }
      );

      loadFriendRequests();
    } catch (error) {
      console.error('Failed to decline friend request:', error);
    }
  };

  const removeFriend = async (friendEmail: string) => {
    if (!confirm('Are you sure you want to remove this friend?')) return;

    setLoading(true);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/friends/remove`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ email: playerEmail, friendEmail })
        }
      );

      if (response.ok) {
        setMessage('✅ Friend removed');
        setSelectedFriend(null);
        loadFriends();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('❌ Failed to remove friend');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (friendEmail: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/messages/get?email=${encodeURIComponent(playerEmail)}&friendEmail=${encodeURIComponent(friendEmail)}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        
        // Mark as read
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/messages/read`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${publicAnonKey}`
            },
            body: JSON.stringify({ email: playerEmail, friendEmail })
          }
        );
        
        loadUnreadCount();
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedFriend) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/messages/send`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            fromEmail: playerEmail,
            toEmail: selectedFriend,
            message: newMessage
          })
        }
      );

      if (response.ok) {
        setNewMessage('');
        loadMessages(selectedFriend);
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const loadFriendStats = async (friendEmail: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/friends/stats?email=${encodeURIComponent(friendEmail)}`,
        {
          headers: { Authorization: `Bearer ${publicAnonKey}` }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFriendStats(data);
      } else {
        const data = await response.json();
        if (data.private) {
          setFriendStats(null);
          setMessage('🔒 This user has set their stats to private');
          setTimeout(() => setMessage(''), 3000);
        }
      }
    } catch (error) {
      console.error('Failed to load friend stats:', error);
    }
  };

  const openChat = (friendEmail: string) => {
    setSelectedFriend(friendEmail);
    loadMessages(friendEmail);
    setFriendStats(null);
  };

  const viewStats = (friendEmail: string) => {
    setSelectedFriend(friendEmail);
    loadFriendStats(friendEmail);
    setMessages([]);
  };

  // Voice Chat Functions
  const requestMicrophonePermission = async (): Promise<boolean> => {
    try {
      // Check if permissions API is available
      if (navigator.permissions) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        if (result.state === 'denied') {
          setMessage('❌ Microphone access denied. Please enable it in your browser settings.');
          setTimeout(() => setMessage(''), 5000);
          return false;
        }
      }

      // Request microphone access with user consent and selected device
      const audioConstraints: MediaTrackConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true
      };

      // Try to use selected input device from settings if available
      if (settings.voiceChatInputDevice && settings.voiceChatInputDevice !== 'default') {
        // Verify the specific device exists (only if we have permission and can see device labels)
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const inputDevices = devices.filter(d => d.kind === 'audioinput' && d.deviceId);
          
          // Only validate if we got actual device info (labels present means we have permission)
          if (inputDevices.length > 0 && inputDevices[0].label) {
            const deviceExists = inputDevices.some(d => d.deviceId === settings.voiceChatInputDevice);
            
            if (deviceExists) {
              audioConstraints.deviceId = { exact: settings.voiceChatInputDevice };
            } else {
              console.warn('⚠️ Saved microphone device not found, using default device');
            }
          } else {
            // No permission yet or no devices - try the saved device anyway
            audioConstraints.deviceId = { exact: settings.voiceChatInputDevice };
          }
        } catch (enumError) {
          console.warn('⚠️ Could not verify device, will try saved device anyway');
          audioConstraints.deviceId = { exact: settings.voiceChatInputDevice };
        }
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: audioConstraints
      });
      
      // Store the stream
      mediaStreamRef.current = stream;
      setPermissionGranted(true);
      return true;
    } catch (error: any) {
      console.error('Microphone permission error:', error);
      
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setMessage('❌ Microphone permission denied. Please allow microphone access in your browser settings.');
      } else if (error.name === 'NotFoundError') {
        // No microphone device available at all
        setMessage('❌ No microphone found. Please connect a microphone and refresh the page.');
      } else if (error.name === 'OverconstrainedError') {
        // Device constraints couldn't be satisfied - try without constraints
        console.warn('⚠️ Device constraints failed, trying with any available microphone...');
        try {
          const defaultStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaStreamRef.current = defaultStream;
          setPermissionGranted(true);
          setMessage('✅ Connected with default microphone');
          setTimeout(() => setMessage(''), 3000);
          return true;
        } catch (retryError: any) {
          console.error('❌ Fallback to default microphone failed:', retryError);
          setMessage('❌ Could not access any microphone device. Please check your system settings.');
        }
      } else {
        setMessage('❌ Failed to access microphone. Please check your device and browser settings.');
      }
      
      setTimeout(() => setMessage(''), 5000);
      return false;
    }
  };

  const initializeWebRTC = async () => {
    if (!selectedFriend) return;

    try {
      // Create peer connection with STUN/TURN servers for global connectivity
      const configuration: RTCConfiguration = {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' }
        ],
        iceCandidatePoolSize: 10
      };

      const peerConnection = new RTCPeerConnection(configuration);
      peerConnectionRef.current = peerConnection;

      // Add local stream to peer connection
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => {
          peerConnection.addTrack(track, mediaStreamRef.current!);
        });
      }

      // Handle incoming remote stream
      peerConnection.ontrack = async (event) => {
        if (event.streams && event.streams[0]) {
          if (!remoteAudioRef.current) {
            remoteAudioRef.current = new Audio();
            remoteAudioRef.current.autoplay = true;
          }
          remoteAudioRef.current.srcObject = event.streams[0];
          
          // Set output device if specified in settings
          if (settings.voiceChatOutputDevice && settings.voiceChatOutputDevice !== 'default') {
            try {
              // TypeScript workaround for setSinkId which is not in all browsers
              if ('setSinkId' in remoteAudioRef.current) {
                await (remoteAudioRef.current as any).setSinkId(settings.voiceChatOutputDevice);
                console.log('✅ Audio output device set:', settings.voiceChatOutputDevice);
              }
            } catch (error) {
              console.error('Failed to set audio output device:', error);
              setMessage('⚠️ Could not set output device. Using default.');
              setTimeout(() => setMessage(''), 3000);
            }
          }
          
          // Check if friend is muted
          if (mutedFriends.has(selectedFriend)) {
            remoteAudioRef.current.muted = true;
          }
        }
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = async (event) => {
        if (event.candidate) {
          // Send ICE candidate to peer via signaling server
          await sendSignal('ice-candidate', {
            candidate: event.candidate.toJSON(),
            to: selectedFriend,
            from: playerEmail
          });
        }
      };

      // Handle connection state changes
      peerConnection.onconnectionstatechange = () => {
        const state = peerConnection.connectionState;
        if (state === 'connected') {
          setConnectionStatus('connected');
          setMessage('✅ Voice call connected!');
          setTimeout(() => setMessage(''), 3000);
        } else if (state === 'disconnected' || state === 'failed' || state === 'closed') {
          setConnectionStatus('disconnected');
          if (voiceCallActive) {
            setMessage('⚠️ Connection lost. Trying to reconnect...');
            setTimeout(() => setMessage(''), 3000);
          }
        } else if (state === 'connecting') {
          setConnectionStatus('connecting');
        }
      };

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      
      await sendSignal('offer', {
        offer: offer,
        to: selectedFriend,
        from: playerEmail
      });

      // Start listening for signals
      startSignalPolling();

      setConnectionStatus('connecting');
    } catch (error) {
      console.error('WebRTC initialization error:', error);
      setMessage('❌ Failed to establish voice connection.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const sendSignal = async (type: string, data: any) => {
    try {
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/voice/signal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({ type, ...data })
        }
      );
    } catch (error) {
      console.error('Failed to send signal:', error);
    }
  };

  const startSignalPolling = () => {
    if (signalIntervalRef.current) {
      clearInterval(signalIntervalRef.current);
    }

    signalIntervalRef.current = setInterval(async () => {
      if (!selectedFriend || !voiceCallActive) return;

      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/voice/signals?email=${encodeURIComponent(playerEmail)}`,
          {
            headers: { Authorization: `Bearer ${publicAnonKey}` }
          }
        );

        if (response.ok) {
          const signals = await response.json();
          
          for (const signal of signals) {
            await handleSignal(signal);
          }
        }
      } catch (error) {
        console.error('Failed to poll signals:', error);
      }
    }, 1000); // Poll every second
  };

  const handleSignal = async (signal: any) => {
    if (!peerConnectionRef.current) return;

    try {
      if (signal.type === 'offer') {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal.offer));
        const answer = await peerConnectionRef.current.createAnswer();
        await peerConnectionRef.current.setLocalDescription(answer);
        
        await sendSignal('answer', {
          answer: answer,
          to: signal.from,
          from: playerEmail
        });
      } else if (signal.type === 'answer') {
        await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal.answer));
      } else if (signal.type === 'ice-candidate') {
        await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(signal.candidate));
      }
    } catch (error) {
      console.error('Signal handling error:', error);
    }
  };

  const startVoiceCall = async () => {
    // Show permission dialog first
    setShowPermissionDialog(true);
  };

  const confirmStartVoiceCall = async () => {
    setShowPermissionDialog(false);
    
    try {
      // Request microphone permission first
      const hasPermission = await requestMicrophonePermission();
      
      if (!hasPermission) {
        return;
      }

      // Create audio context for voice activity detection
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContextRef.current.createMediaStreamSource(mediaStreamRef.current!);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;
      source.connect(analyserRef.current);

      // Start monitoring voice activity
      monitorVoiceActivity();

      // Initialize WebRTC connection
      await initializeWebRTC();

      setVoiceCallActive(true);
      setMessage('🎙️ Voice call initiated. Connecting...');
      setTimeout(() => setMessage(''), 3000);

      // Notify backend that call started
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/voice/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            from: playerEmail,
            to: selectedFriend,
            timestamp: Date.now()
          })
        }
      );
    } catch (error) {
      console.error('Failed to start voice call:', error);
      setMessage('❌ Failed to start voice call. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const endVoiceCall = async () => {
    try {
      // Notify backend that call ended
      await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/voice/end`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            from: playerEmail,
            to: selectedFriend,
            timestamp: Date.now()
          })
        }
      );
    } catch (error) {
      console.error('Failed to notify backend:', error);
    }

    // Stop signal polling
    if (signalIntervalRef.current) {
      clearInterval(signalIntervalRef.current);
      signalIntervalRef.current = null;
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    // Stop remote audio
    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
      remoteAudioRef.current = null;
    }

    // Stop all audio tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    // Close audio context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setVoiceCallActive(false);
    setIsTalking(false);
    setConnectionStatus('disconnected');
    setPermissionGranted(false);
    setMessage('📞 Voice call ended.');
    setTimeout(() => setMessage(''), 3000);
  };

  const toggleMicrophone = () => {
    if (mediaStreamRef.current) {
      const audioTrack = mediaStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setMicMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleFriendMute = (friendEmail: string) => {
    const newMutedFriends = new Set(mutedFriends);
    if (newMutedFriends.has(friendEmail)) {
      newMutedFriends.delete(friendEmail);
      // Unmute remote audio
      if (remoteAudioRef.current) {
        remoteAudioRef.current.muted = false;
      }
    } else {
      newMutedFriends.add(friendEmail);
      // Mute remote audio
      if (remoteAudioRef.current) {
        remoteAudioRef.current.muted = true;
      }
    }
    setMutedFriends(newMutedFriends);
  };

  const monitorVoiceActivity = () => {
    if (!analyserRef.current) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    
    const checkActivity = () => {
      if (!analyserRef.current || !voiceCallActive) return;

      analyserRef.current.getByteFrequencyData(dataArray);
      
      // Calculate average volume
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
      
      // Threshold for talking detection (adjustable)
      const threshold = 25;
      setIsTalking(average > threshold && !micMuted);

      requestAnimationFrame(checkActivity);
    };

    checkActivity();
  };

  // Monitor remote audio for friend talking detection
  useEffect(() => {
    if (!voiceCallActive || !selectedFriend || !remoteAudioRef.current) return;

    let remoteAnalyser: AnalyserNode | null = null;
    let remoteAudioContext: AudioContext | null = null;

    try {
      // Create audio context for remote stream analysis
      remoteAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const remoteStream = remoteAudioRef.current.srcObject as MediaStream;
      
      if (remoteStream && remoteStream.getAudioTracks().length > 0) {
        const remoteSource = remoteAudioContext.createMediaStreamSource(remoteStream);
        remoteAnalyser = remoteAudioContext.createAnalyser();
        remoteAnalyser.fftSize = 256;
        remoteSource.connect(remoteAnalyser);

        const dataArray = new Uint8Array(remoteAnalyser.frequencyBinCount);
        
        const checkRemoteActivity = () => {
          if (!remoteAnalyser || !voiceCallActive) return;

          remoteAnalyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          
          const threshold = 25;
          if (average > threshold && !mutedFriends.has(selectedFriend)) {
            setFriendTalking(new Set([selectedFriend]));
          } else {
            setFriendTalking(new Set());
          }

          if (voiceCallActive) {
            requestAnimationFrame(checkRemoteActivity);
          }
        };

        checkRemoteActivity();
      }
    } catch (error) {
      console.error('Remote audio monitoring error:', error);
    }

    return () => {
      if (remoteAudioContext) {
        remoteAudioContext.close();
      }
    };
  }, [voiceCallActive, selectedFriend, mutedFriends]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const debounce = setTimeout(() => {
        searchUsers();
      }, 500);
      return () => clearTimeout(debounce);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  return (
    <>
      {/* Microphone Permission Dialog */}
      {showPermissionDialog && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-4 border-yellow-600 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="text-center">
              <div className="w-20 h-20 bg-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mic className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-white text-2xl font-bold mb-3">Microphone Access Required</h3>
              <p className="text-gray-300 mb-6">
                To use voice chat with your friends, Rollers Paradise needs access to your microphone.
              </p>
              <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-4 mb-6 text-left">
                <p className="text-blue-300 text-sm font-bold mb-2">🔒 Privacy & Security:</p>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Your voice is transmitted directly to your friend (peer-to-peer)</li>
                  <li>• Audio is NOT recorded or stored on our servers</li>
                  <li>• You can mute yourself or your friend at any time</li>
                  <li>• You can end the call whenever you want</li>
                  <li>• Microphone access is only used during active calls</li>
                </ul>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowPermissionDialog(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStartVoiceCall}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold transition-colors"
                >
                  Allow & Start Call
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-4 border-yellow-600 rounded-2xl w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-yellow-600/50">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-yellow-500" />
              <h2 className="text-white text-2xl font-bold">Friends</h2>
              {Object.keys(unreadCount).length > 0 && (
                <span className="bg-red-600 text-white px-2 py-1 rounded-full text-sm font-bold">
                  {Object.values(unreadCount).reduce((a: any, b: any) => a + b, 0)}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-red-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className="px-6 pt-4">
              <div className="bg-blue-600/20 border border-blue-600 rounded-lg p-3 text-white text-center">
                {message}
              </div>
            </div>
          )}

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-80 border-r border-yellow-600/50 flex flex-col">
            {/* Tabs */}
            <div className="flex border-b border-yellow-600/50">
              <button
                onClick={() => setActiveTab('friends')}
                className={`flex-1 px-4 py-3 font-bold transition-colors ${
                  activeTab === 'friends'
                    ? 'bg-yellow-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Friends ({friends.length})
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`flex-1 px-4 py-3 font-bold transition-colors relative ${
                  activeTab === 'requests'
                    ? 'bg-yellow-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Requests
                {friendRequests.length > 0 && (
                  <span className="absolute top-1 right-1 bg-red-600 text-white px-1.5 py-0.5 rounded-full text-xs font-bold">
                    {friendRequests.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('search')}
                className={`flex-1 px-4 py-3 font-bold transition-colors ${
                  activeTab === 'search'
                    ? 'bg-yellow-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-5 h-5 mx-auto" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'friends' && (
                <div className="space-y-2">
                  {friends.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">
                      No friends yet. Search to add friends!
                    </div>
                  ) : (
                    friends.map((friend) => (
                      <div
                        key={friend.email}
                        className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-yellow-600 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {friend.name[0].toUpperCase()}
                            </div>
                            {friend.isOnline && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-bold truncate">{friend.name}</div>
                            <div className="text-yellow-500 text-sm">Level {friend.level}</div>
                            <div className="text-gray-400 text-xs">
                              {friend.isOnline ? '🟢 Online' : '⚫ Offline'}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => openChat(friend.email)}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors relative"
                          >
                            <MessageCircle className="w-4 h-4" />
                            Chat
                            {unreadCount[friend.email] && (
                              <span className="absolute -top-1 -right-1 bg-red-600 text-white px-1.5 py-0.5 rounded-full text-xs">
                                {unreadCount[friend.email]}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              openChat(friend.email);
                              // Auto-start voice call
                              setTimeout(() => startVoiceCall(), 100);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                            title="Start Voice Call"
                          >
                            <Phone className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => viewStats(friend.email)}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                          >
                            <TrendingUp className="w-4 h-4" />
                            Stats
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="space-y-2">
                  {friendRequests.length === 0 ? (
                    <div className="text-gray-400 text-center py-8">
                      No pending friend requests
                    </div>
                  ) : (
                    friendRequests.map((request) => (
                      <div
                        key={request.from}
                        className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold">
                            {request.fromName[0].toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-bold">{request.fromName}</div>
                            <div className="text-gray-400 text-xs flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(request.timestamp).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => acceptFriendRequest(request.from)}
                            disabled={loading}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                            Accept
                          </button>
                          <button
                            onClick={() => declineFriendRequest(request.from)}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Decline
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'search' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-yellow-600 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    {loading && (
                      <div className="text-gray-400 text-center py-4">Searching...</div>
                    )}
                    
                    {!loading && searchQuery && searchResults.length === 0 && (
                      <div className="text-gray-400 text-center py-4">No users found</div>
                    )}

                    {searchResults.map((user) => (
                      <div
                        key={user.email}
                        className="bg-gray-800/50 rounded-lg p-3 border border-gray-700"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold">
                            {user.name[0].toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-bold">{user.name}</div>
                            <div className="text-yellow-500 text-sm">Level {user.level}</div>
                          </div>
                          <button
                            onClick={() => sendFriendRequest(user.email)}
                            disabled={loading}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                          >
                            <UserPlus className="w-4 h-4" />
                            Add
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col">
            {!selectedFriend ? (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                  <p>Select a friend to chat or view stats</p>
                </div>
              </div>
            ) : messages.length > 0 ? (
              // Chat View
              <>
                <div className="p-4 border-b border-yellow-600/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {friends.find((f) => f.email === selectedFriend)?.name[0].toUpperCase()}
                      </div>
                      {friendTalking.has(selectedFriend) && voiceCallActive && !mutedFriends.has(selectedFriend) && (
                        <div className="absolute -inset-1 bg-green-500 rounded-full animate-pulse opacity-50" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-bold">
                        {friends.find((f) => f.email === selectedFriend)?.name}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        {friends.find((f) => f.email === selectedFriend)?.isOnline
                          ? '🟢 Online'
                          : '⚫ Offline'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Voice Call Button */}
                    {!voiceCallActive ? (
                      <button
                        onClick={startVoiceCall}
                        className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors flex items-center gap-2"
                        title="Start Voice Call"
                      >
                        <Phone className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={endVoiceCall}
                        className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors animate-pulse flex items-center gap-2"
                        title="End Voice Call"
                      >
                        <PhoneOff className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => removeFriend(selectedFriend)}
                      className="text-red-500 hover:text-red-400 transition-colors p-2"
                      title="Remove Friend"
                    >
                      <UserMinus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Voice Call Controls */}
                {voiceCallActive && (
                  <div className="bg-gradient-to-r from-green-900/40 to-blue-900/40 border-b border-green-600/50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${isTalking ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                          <span className="text-white text-sm font-bold">
                            {isTalking ? '🎤 You are talking' : '🔇 You are silent'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Microphone Toggle */}
                        <button
                          onClick={toggleMicrophone}
                          className={`p-3 rounded-lg transition-all text-white font-bold ${
                            micMuted 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                          title={micMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                        >
                          {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                        
                        {/* Friend Speaker Toggle */}
                        <button
                          onClick={() => selectedFriend && toggleFriendMute(selectedFriend)}
                          className={`p-3 rounded-lg transition-all text-white font-bold ${
                            mutedFriends.has(selectedFriend || '') 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                          title={mutedFriends.has(selectedFriend || '') ? 'Unmute Friend' : 'Mute Friend'}
                        >
                          {mutedFriends.has(selectedFriend || '') ? (
                            <VolumeX className="w-5 h-5" />
                          ) : (
                            <Volume2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 text-gray-300 text-xs">
                      💡 <span className="font-bold">Tip:</span> Use the microphone button to mute yourself, and the speaker button to mute your friend. Green pulse indicates active talking.
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, index) => {
                    const isMe = msg.from === playerEmail;
                    return (
                      <div
                        key={index}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            isMe
                              ? 'bg-yellow-600 text-white'
                              : 'bg-gray-700 text-white'
                          }`}
                        >
                          <p>{msg.message}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-yellow-600/50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-yellow-600 focus:outline-none"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </>
            ) : friendStats ? (
              // Stats View
              <>
                <div className="p-4 border-b border-yellow-600/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {friendStats.name[0].toUpperCase()}
                      </div>
                      {friendTalking.has(selectedFriend || '') && voiceCallActive && !mutedFriends.has(selectedFriend || '') && (
                        <div className="absolute -inset-1 bg-green-500 rounded-full animate-pulse opacity-50" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{friendStats.name}</h3>
                      <p className="text-yellow-500 text-sm">Level {friendStats.level}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Voice Call Button */}
                    {!voiceCallActive ? (
                      <button
                        onClick={startVoiceCall}
                        className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg transition-colors flex items-center gap-2"
                        title="Start Voice Call"
                      >
                        <Phone className="w-5 h-5" />
                      </button>
                    ) : (
                      <button
                        onClick={endVoiceCall}
                        className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg transition-colors animate-pulse flex items-center gap-2"
                        title="End Voice Call"
                      >
                        <PhoneOff className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => removeFriend(selectedFriend)}
                      className="text-red-500 hover:text-red-400 transition-colors p-2"
                      title="Remove Friend"
                    >
                      <UserMinus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Voice Call Controls */}
                {voiceCallActive && (
                  <div className="bg-gradient-to-r from-green-900/40 to-blue-900/40 border-b border-green-600/50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${isTalking ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                          <span className="text-white text-sm font-bold">
                            {isTalking ? '🎤 You are talking' : '🔇 You are silent'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Microphone Toggle */}
                        <button
                          onClick={toggleMicrophone}
                          className={`p-3 rounded-lg transition-all text-white font-bold ${
                            micMuted 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-green-600 hover:bg-green-700'
                          }`}
                          title={micMuted ? 'Unmute Microphone' : 'Mute Microphone'}
                        >
                          {micMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                        
                        {/* Friend Speaker Toggle */}
                        <button
                          onClick={() => selectedFriend && toggleFriendMute(selectedFriend)}
                          className={`p-3 rounded-lg transition-all text-white font-bold ${
                            mutedFriends.has(selectedFriend || '') 
                              ? 'bg-red-600 hover:bg-red-700' 
                              : 'bg-blue-600 hover:bg-blue-700'
                          }`}
                          title={mutedFriends.has(selectedFriend || '') ? 'Unmute Friend' : 'Mute Friend'}
                        >
                          {mutedFriends.has(selectedFriend || '') ? (
                            <VolumeX className="w-5 h-5" />
                          ) : (
                            <Volume2 className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="mt-3 text-gray-300 text-xs">
                      💡 <span className="font-bold">Tip:</span> Use the microphone button to mute yourself, and the speaker button to mute your friend. Green pulse indicates active talking.
                    </div>
                  </div>
                )}

                <div className="flex-1 overflow-y-auto p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="text-gray-400 text-sm mb-1">Total Wins</div>
                      <div className="text-white text-2xl font-bold">
                        {friendStats.totalWins.toLocaleString()}
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="text-gray-400 text-sm mb-1">Total Losses</div>
                      <div className="text-white text-2xl font-bold">
                        {friendStats.totalLosses.toLocaleString()}
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="text-gray-400 text-sm mb-1">Biggest Win</div>
                      <div className="text-green-500 text-2xl font-bold">
                        ${friendStats.biggestWin.toLocaleString()}
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div className="text-gray-400 text-sm mb-1">Total Rolls</div>
                      <div className="text-white text-2xl font-bold">
                        {friendStats.totalRolls.toLocaleString()}
                      </div>
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 col-span-2">
                      <div className="text-gray-400 text-sm mb-1">Win Rate</div>
                      <div className="text-yellow-500 text-2xl font-bold">
                        {friendStats.totalWins + friendStats.totalLosses > 0
                          ? (
                              (friendStats.totalWins /
                                (friendStats.totalWins + friendStats.totalLosses)) *
                              100
                            ).toFixed(1)
                          : 0}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <p>Loading...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
