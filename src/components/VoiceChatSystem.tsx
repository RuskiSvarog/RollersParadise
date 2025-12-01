import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX, Flag, Bug, UserX, MessageSquareOff, Settings, Minimize2, Maximize2, MessageCircle, Send } from 'lucide-react';
import { createClient } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { toast } from 'sonner';

interface VoiceChatSystemProps {
  roomId: string;
  currentUserId: string;
  currentUserName: string;
  isHost: boolean;
  playerAvatar?: string;
}

interface VoiceParticipant {
  userId: string;
  userName: string;
  stream?: MediaStream;
  audioElement?: HTMLAudioElement;
  isMuted: boolean;
  isLocallyMuted: boolean; // Muted by current user
  isSpeaking: boolean;
}

interface Report {
  id: string;
  reporterId: string;
  reporterName: string;
  targetId?: string;
  targetName?: string;
  type: 'player' | 'bug';
  reason: string;
  description: string;
  timestamp: number;
  roomId: string;
  status: 'pending' | 'reviewed' | 'resolved';
}

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  timestamp: number;
}

export function VoiceChatSystem({ roomId, currentUserId, currentUserName, isHost, playerAvatar = '🎲' }: VoiceChatSystemProps) {
  const supabase = createClient();
  
  const [participants, setParticipants] = useState<Map<string, VoiceParticipant>>(new Map());
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMicEnabled, setIsMicEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [showPermissionRequest, setShowPermissionRequest] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBugReportModal, setShowBugReportModal] = useState(false);
  const [reportTarget, setReportTarget] = useState<{ id: string; name: string } | null>(null);
  const [hiddenChats, setHiddenChats] = useState<Set<string>>(new Set());
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<'voice' | 'chat'>('voice');
  
  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [chatChannel, setChatChannel] = useState<any>(null);
  const [isChatAvailable, setIsChatAvailable] = useState(true);
  
  // Audio device states
  const [audioInputDevices, setAudioInputDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioOutputDevices, setAudioOutputDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedInputDevice, setSelectedInputDevice] = useState<string>('default');
  const [selectedOutputDevice, setSelectedOutputDevice] = useState<string>('default');
  
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localAudioRef = useRef<HTMLAudioElement | null>(null);

  // Enumerate audio devices
  const enumerateAudioDevices = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const inputDevices = devices.filter(device => device.kind === 'audioinput');
      const outputDevices = devices.filter(device => device.kind === 'audiooutput');
      
      console.log('🎤 Found audio input devices:', inputDevices);
      console.log('🔊 Found audio output devices:', outputDevices);
      
      setAudioInputDevices(inputDevices);
      setAudioOutputDevices(outputDevices);
      
      // Load saved device preferences
      const savedInputDevice = localStorage.getItem('voiceChatInputDevice');
      const savedOutputDevice = localStorage.getItem('voiceChatOutputDevice');
      
      if (savedInputDevice && inputDevices.some(d => d.deviceId === savedInputDevice)) {
        setSelectedInputDevice(savedInputDevice);
      } else if (inputDevices.length > 0) {
        setSelectedInputDevice(inputDevices[0].deviceId);
      }
      
      if (savedOutputDevice && outputDevices.some(d => d.deviceId === savedOutputDevice)) {
        setSelectedOutputDevice(savedOutputDevice);
      } else if (outputDevices.length > 0) {
        setSelectedOutputDevice(outputDevices[0].deviceId);
      }
      
      return { inputDevices, outputDevices };
    } catch (error) {
      console.error('❌ Failed to enumerate devices:', error);
      return { inputDevices: [], outputDevices: [] };
    }
  };

  // Request microphone permission with specific device
  const requestMicPermission = async (deviceId?: string) => {
    try {
      console.log('🎤 Requesting microphone permission...', deviceId ? `for device: ${deviceId}` : '');
      
      // First, check if any microphone exists at all
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const inputDevices = devices.filter(d => d.kind === 'audioinput');
        
        if (inputDevices.length === 0) {
          console.error('❌ No microphone devices found');
          toast.error('No microphone found', {
            description: 'Please connect a microphone to use voice chat.'
          });
          setShowPermissionRequest(false);
          setHasPermission(false);
          return false;
        }
      } catch (enumError) {
        console.warn('⚠️ Could not enumerate devices initially');
      }
      
      // If a specific device was requested, verify it exists
      if (deviceId && deviceId !== 'default') {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const inputDevices = devices.filter(d => d.kind === 'audioinput' && d.deviceId);
          
          // Only check if we got actual device IDs (not empty list or default labels)
          if (inputDevices.length > 0 && inputDevices[0].label) {
            const deviceExists = inputDevices.some(d => d.deviceId === deviceId);
            if (!deviceExists) {
              console.warn('⚠️ Requested device not found, will use default device');
              deviceId = undefined;
            }
          }
        } catch (enumError) {
          console.warn('⚠️ Could not verify device, will try anyway');
        }
      }
      
      const constraints: MediaStreamConstraints = {
        audio: deviceId && deviceId !== 'default' ? {
          deviceId: { ideal: deviceId }, // Use 'ideal' instead of 'exact' to allow fallback
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } : {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setLocalStream(stream);
      setHasPermission(true);
      setShowPermissionRequest(false);
      
      // Enumerate devices after permission is granted
      await enumerateAudioDevices();
      
      toast.success('Microphone access granted!', {
        description: 'You can now use voice chat in this lobby.'
      });
      
      console.log('✅ Microphone permission granted');
      
      // Save permission to localStorage
      localStorage.setItem('voiceChatPermission', 'granted');
      
      return true;
    } catch (error: any) {
      console.log('⚠️ Microphone access:', error.name || 'Unknown error');
      
      // Handle specific error types
      if (error.name === 'NotFoundError') {
        // No microphone device available - this is fine, just hide voice chat
        console.log('ℹ️ No microphone detected - voice chat disabled');
        setShowPermissionRequest(false);
        setHasPermission(false);
        localStorage.removeItem('voiceChatPermission');
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        // User denied permission
        console.error('❌ Microphone permission denied by user');
        toast.error('Microphone access denied', {
          description: 'Please allow microphone access in your browser settings to use voice chat.'
        });
      } else if (error.name === 'OverconstrainedError') {
        // Device constraints couldn't be satisfied - try without constraints
        console.warn('⚠️ Device constraints failed, trying with default device...');
        try {
          const defaultStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          
          setLocalStream(defaultStream);
          setHasPermission(true);
          setShowPermissionRequest(false);
          await enumerateAudioDevices();
          
          toast.success('Connected with default microphone', {
            description: 'Your saved device settings were reset.'
          });
          
          localStorage.setItem('voiceChatPermission', 'granted');
          return true;
        } catch (retryError: any) {
          console.error('❌ Fallback to default microphone failed:', retryError);
          
          if (retryError.name === 'NotFoundError') {
            toast.error('No microphone detected', {
              description: 'Connect a microphone to enable voice chat.',
              duration: 5000
            });
          } else {
            toast.error('Microphone error', {
              description: 'Could not access any microphone device.'
            });
          }
        }
      } else {
        // Other errors
        console.error('❌ Unexpected microphone error:', error);
        toast.error('Microphone error', {
          description: 'An unexpected error occurred. Please try again.'
        });
      }
      
      setHasPermission(false);
      localStorage.setItem('voiceChatPermission', 'denied');
      return false;
    }
  };

  // Change input device (microphone)
  const changeInputDevice = async (deviceId: string) => {
    try {
      console.log('🎤 Changing input device to:', deviceId);
      
      // Verify device exists before attempting to switch
      const devices = await navigator.mediaDevices.enumerateDevices();
      const deviceExists = devices.some(d => d.kind === 'audioinput' && (d.deviceId === deviceId || deviceId === 'default'));
      
      if (!deviceExists && deviceId !== 'default') {
        toast.error('Device not found', {
          description: 'The selected microphone is no longer available.'
        });
        return;
      }
      
      // Stop current stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      // Request new stream with selected device
      const wasEnabled = isMicEnabled;
      const granted = await requestMicPermission(deviceId);
      
      if (!granted) {
        return;
      }
      
      // Restore mic enabled state
      if (wasEnabled && localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = true;
          setIsMicEnabled(true);
        }
      }
      
      setSelectedInputDevice(deviceId);
      localStorage.setItem('voiceChatInputDevice', deviceId);
      
      toast.success('Microphone changed', {
        description: 'Using new microphone device'
      });
    } catch (error) {
      console.error('❌ Failed to change input device:', error);
      toast.error('Failed to change microphone');
    }
  };

  // Change output device (speakers/headphones)
  const changeOutputDevice = async (deviceId: string) => {
    try {
      console.log('🔊 Changing output device to:', deviceId);
      
      setSelectedOutputDevice(deviceId);
      localStorage.setItem('voiceChatOutputDevice', deviceId);
      
      // Apply to all participant audio elements
      participants.forEach(participant => {
        if (participant.audioElement && 'setSinkId' in participant.audioElement) {
          (participant.audioElement as any).setSinkId(deviceId).catch((err: Error) => {
            console.error('Failed to set sink ID:', err);
          });
        }
      });
      
      toast.success('Audio output changed', {
        description: 'Using new audio output device'
      });
    } catch (error) {
      console.error('❌ Failed to change output device:', error);
      toast.error('Failed to change audio output');
    }
  };

  // Check if permission was previously granted
  useEffect(() => {
    const checkInitialPermission = async () => {
      try {
        // First, enumerate devices to see what's available
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasMicrophone = devices.some(d => d.kind === 'audioinput');
        
        if (!hasMicrophone) {
          console.log('ℹ️ No microphone detected, voice chat will be disabled');
          setHasPermission(false);
          localStorage.removeItem('voiceChatPermission'); // Clear saved permission
          await enumerateAudioDevices(); // Still enumerate to show the UI
          return;
        }
        
        const permission = localStorage.getItem('voiceChatPermission');
        if (permission === 'granted') {
          // Try to request permission, but don't use saved device yet
          await requestMicPermission();
        } else {
          // Still enumerate devices even without permission
          await enumerateAudioDevices();
        }
      } catch (error) {
        console.error('❌ Error checking initial permission:', error);
        await enumerateAudioDevices();
      }
    };
    
    checkInitialPermission();
  }, []);

  // Listen for device changes
  useEffect(() => {
    const handleDeviceChange = () => {
      console.log('🔄 Audio devices changed, re-enumerating...');
      enumerateAudioDevices();
    };
    
    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange);
    
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    };
  }, []);

  // Toggle microphone
  const toggleMic = async () => {
    // Check if any microphone is available first
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const hasMicrophone = devices.some(d => d.kind === 'audioinput');
      
      if (!hasMicrophone) {
        toast.error('No microphone detected', {
          description: 'Connect a microphone to use voice chat.',
          duration: 5000
        });
        return;
      }
    } catch (err) {
      console.error('❌ Could not check for microphone:', err);
    }
    
    if (!hasPermission) {
      setShowPermissionRequest(true);
      return;
    }

    if (!localStream) {
      const granted = await requestMicPermission(selectedInputDevice !== 'default' ? selectedInputDevice : undefined);
      if (granted) {
        setIsMicEnabled(true);
      }
      return;
    }

    const audioTrack = localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setIsMicEnabled(audioTrack.enabled);
      
      toast(audioTrack.enabled ? 'Microphone enabled' : 'Microphone muted', {
        icon: audioTrack.enabled ? '🎤' : '🔇'
      });
    }
  };

  // Mute specific participant (locally)
  const muteParticipant = (userId: string) => {
    setParticipants(prev => {
      const updated = new Map(prev);
      const participant = updated.get(userId);
      if (participant && participant.audioElement) {
        participant.audioElement.muted = !participant.isLocallyMuted;
        participant.isLocallyMuted = !participant.isLocallyMuted;
        updated.set(userId, { ...participant });
      }
      return updated;
    });
    
    const participant = participants.get(userId);
    toast(participant?.isLocallyMuted ? `Unmuted ${participant.userName}` : `Muted ${participant?.userName}`, {
      icon: participant?.isLocallyMuted ? '🔊' : '🔇'
    });
  };

  // Hide chat from specific user
  const toggleHideChat = (userId: string) => {
    setHiddenChats(prev => {
      const updated = new Set(prev);
      if (updated.has(userId)) {
        updated.delete(userId);
        toast('Chat messages visible', { icon: '👁️' });
      } else {
        updated.add(userId);
        toast('Chat messages hidden', { icon: '🚫' });
      }
      return updated;
    });
  };

  // Open report player modal
  const openReportPlayer = (userId: string, userName: string) => {
    setReportTarget({ id: userId, name: userName });
    setShowReportModal(true);
  };

  // Submit player report
  const submitPlayerReport = async (reason: string, description: string) => {
    const report: Report = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reporterId: currentUserId,
      reporterName: currentUserName,
      targetId: reportTarget?.id,
      targetName: reportTarget?.name,
      type: 'player',
      reason,
      description,
      timestamp: Date.now(),
      roomId,
      status: 'pending'
    };

    try {
      // Save to server
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/player-reports`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            id: report.id,
            reporter_id: report.reporterId,
            reporter_name: report.reporterName,
            target_id: report.targetId,
            target_name: report.targetName,
            type: report.type,
            reason: report.reason,
            description: report.description,
            timestamp: new Date(report.timestamp).toISOString(),
            room_id: report.roomId,
            status: report.status
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error saving report:', errorData);
        toast.error('Failed to submit report', {
          description: 'Please try again later.'
        });
        return;
      }

      toast.success('Report submitted successfully', {
        description: 'Our team will review your report shortly.'
      });
      
      setShowReportModal(false);
      setReportTarget(null);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report');
    }
  };

  // Submit bug report
  const submitBugReport = async (description: string, reproSteps: string) => {
    const report: Report = {
      id: `bug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      reporterId: currentUserId,
      reporterName: currentUserName,
      type: 'bug',
      reason: 'Bug Report',
      description: `${description}\n\nReproduction Steps:\n${reproSteps}`,
      timestamp: Date.now(),
      roomId,
      status: 'pending'
    };

    try {
      console.log('🐛 Submitting bug report:', report);
      
      // Save to server
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/bug-reports`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({
            id: report.id,
            reporter_id: report.reporterId,
            reporter_name: report.reporterName,
            type: report.type,
            description: report.description,
            timestamp: new Date(report.timestamp).toISOString(),
            room_id: report.roomId,
            status: report.status,
            reason: report.reason
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ Error saving bug report:', errorData);
        toast.error('Failed to submit bug report', {
          description: errorData.message || 'Please try again later.'
        });
        return;
      }

      const result = await response.json();
      console.log('✅ Bug report submitted successfully:', result);

      toast.success('Bug report submitted!', {
        description: 'Thank you for helping us improve!'
      });
      
      setShowBugReportModal(false);
    } catch (error) {
      console.error('❌ Error submitting bug report:', error);
      toast.error('Failed to submit bug report', {
        description: error instanceof Error ? error.message : 'Network error'
      });
    }
  };

  // Chat functionality
  useEffect(() => {
    try {
      setIsChatAvailable(true);
      
      // Subscribe to chat messages
      const channel = supabase
        .channel(`chat-${roomId}`, {
          config: {
            broadcast: { self: true }
          }
        })
        .on('broadcast', { event: 'message' }, ({ payload }) => {
          setMessages((prev) => [...prev, payload as ChatMessage]);
          if (activeTab !== 'chat' && payload.sender !== currentUserName) {
            setUnreadCount((prev) => prev + 1);
          }
        })
        .subscribe();

      setChatChannel(channel);

      return () => {
        channel.unsubscribe();
      };
    } catch (error) {
      console.error('Failed to initialize chat:', error);
      setIsChatAvailable(false);
    }
  }, [roomId, currentUserName, activeTab]);

  useEffect(() => {
    if (activeTab === 'chat') {
      setUnreadCount(0);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeTab, messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !chatChannel) return;

    const newMessage = inputMessage.trim();
    const message: ChatMessage = {
      id: Date.now().toString(),
      sender: currentUserName,
      avatar: playerAvatar,
      text: newMessage,
      timestamp: Date.now(),
    };

    chatChannel.send({
      type: 'broadcast',
      event: 'message',
      payload: message,
    });

    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop all tracks
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      
      // Close all peer connections
      peerConnections.current.forEach(pc => pc.close());
      peerConnections.current.clear();
    };
  }, [localStream]);

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Voice Chat Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-lg rounded-2xl border-2 border-purple-500/30 shadow-2xl"
        style={{ 
          width: isMinimized ? 'auto' : '300px',
          maxHeight: isMinimized ? 'auto' : '500px',
          padding: isMinimized ? '12px' : '16px' 
        }}
      >
        {/* Minimized View - Show mic and chat icons */}
        {isMinimized ? (
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMic}
              className={`p-2.5 rounded-xl transition-all shadow-lg ${
                isMicEnabled
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gray-600 hover:bg-gray-700'
              }`}
              title={isMicEnabled ? 'Microphone On' : 'Microphone Off'}
            >
              {isMicEnabled ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-gray-300" />}
            </button>
            <button
              onClick={() => {
                setIsMinimized(false);
                setActiveTab('chat');
              }}
              className="p-2.5 rounded-xl transition-all shadow-lg bg-blue-600 hover:bg-blue-700 relative"
              title="Chat"
            >
              <MessageCircle className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </button>
            {participants.size > 0 && (
              <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full font-bold">
                {participants.size}
              </span>
            )}
            <button
              onClick={() => setIsMinimized(false)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors ml-1"
              title="Expand"
            >
              <Maximize2 className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        ) : (
          <>
            {/* Header with Tabs */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1">
                  {/* Tabs */}
                  <button
                    onClick={() => setActiveTab('voice')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTab === 'voice'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Voice
                    {participants.size > 0 && (
                      <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                        {participants.size}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('chat')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 relative ${
                      activeTab === 'chat'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white/5 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    Chat
                    {unreadCount > 0 && activeTab !== 'chat' && (
                      <span className="bg-red-600 text-white px-1.5 py-0.5 rounded-full text-xs">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  {activeTab === 'voice' && (
                    <button
                      onClick={() => setShowVoiceSettings(!showVoiceSettings)}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Settings"
                    >
                      <Settings className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsMinimized(true)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    title="Minimize"
                  >
                    <Minimize2 className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>

            {/* Voice Tab Content */}
            {activeTab === 'voice' && (
              <>
                {/* Mic Toggle */}
            <button
              onClick={toggleMic}
              className={`w-full py-2.5 rounded-xl font-bold transition-all mb-3 text-sm ${
                isMicEnabled
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50'
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-300'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {isMicEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                {isMicEnabled ? 'Mic On' : 'Mic Off'}
              </div>
            </button>
            
            {/* No Microphone Warning */}
            {audioInputDevices.length === 0 && !hasPermission && (
              <div className="mb-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start gap-2">
                  <MicOff className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-yellow-400 font-semibold">No Microphone Detected</p>
                    <p className="text-xs text-yellow-400/80 mt-1">
                      Connect a microphone and refresh the page to enable voice chat.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Audio Device Settings */}
            <AnimatePresence>
              {showVoiceSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-3 overflow-hidden"
                >
              <div className="bg-white/5 rounded-lg p-3 space-y-3">
                <div>
                  <label className="text-xs text-gray-400 mb-1 block flex items-center gap-2">
                    <Mic className="w-3 h-3" />
                    Microphone
                  </label>
                  <select
                    value={selectedInputDevice}
                    onChange={(e) => changeInputDevice(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="default">Default Microphone</option>
                    {audioInputDevices.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Microphone ${device.deviceId.substring(0, 8)}...`}
                      </option>
                    ))}
                  </select>
                  {audioInputDevices.length === 0 && (
                    <p className="text-xs text-yellow-400 mt-1">
                      No microphones detected. Please plug in a microphone.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-xs text-gray-400 mb-1 block flex items-center gap-2">
                    <Volume2 className="w-3 h-3" />
                    Audio Output
                  </label>
                  <select
                    value={selectedOutputDevice}
                    onChange={(e) => changeOutputDevice(e.target.value)}
                    className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                  >
                    <option value="default">Default Speaker</option>
                    {audioOutputDevices.map(device => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Speaker ${device.deviceId.substring(0, 8)}...`}
                      </option>
                    ))}
                  </select>
                  {audioOutputDevices.length === 0 && (
                    <p className="text-xs text-yellow-400 mt-1">
                      No speakers detected. Please plug in headphones or speakers.
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-gray-700">
                  <p className="text-xs text-gray-400">
                    🎧 {audioInputDevices.length} microphone{audioInputDevices.length !== 1 ? 's' : ''} detected
                  </p>
                  <p className="text-xs text-gray-400">
                    🔊 {audioOutputDevices.length} audio output{audioOutputDevices.length !== 1 ? 's' : ''} detected
                  </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Participants List */}
            {participants.size > 0 && (
              <div className="mb-2">
                <div className="text-xs text-gray-400 mb-1.5">In Voice ({participants.size})</div>
                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                  {Array.from(participants.values()).map(participant => (
                    <div
                      key={participant.userId}
                      className="flex items-center justify-between p-1.5 bg-white/5 rounded-lg"
                    >
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${participant.isSpeaking ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                        <span className="text-xs text-white truncate max-w-[100px]">{participant.userName}</span>
                        {participant.isMuted && <MicOff className="w-3 h-3 text-red-500" />}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => muteParticipant(participant.userId)}
                          className="p-1 hover:bg-white/10 rounded"
                          title={participant.isLocallyMuted ? 'Unmute' : 'Mute'}
                        >
                          {participant.isLocallyMuted ? (
                            <VolumeX className="w-3.5 h-3.5 text-red-500" />
                          ) : (
                            <Volume2 className="w-3.5 h-3.5 text-gray-400" />
                          )}
                        </button>
                        <button
                          onClick={() => toggleHideChat(participant.userId)}
                          className="p-1 hover:bg-white/10 rounded"
                          title="Hide chat"
                        >
                          <MessageSquareOff className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button
                          onClick={() => openReportPlayer(participant.userId, participant.userName)}
                          className="p-1 hover:bg-white/10 rounded"
                          title="Report player"
                        >
                          <Flag className="w-3.5 h-3.5 text-yellow-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Report Bug Button */}
            <button
              onClick={() => setShowBugReportModal(true)}
              className="w-full py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-bold hover:from-orange-700 hover:to-red-700 transition-all flex items-center justify-center gap-2 text-sm"
            >
              <Bug className="w-3.5 h-3.5" />
              Report Bug
            </button>
              </>
            )}

            {/* Chat Tab Content */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-[320px]">
                {/* Messages Area */}
                <div 
                  className="flex-1 overflow-y-auto p-2 space-y-2 mb-2"
                  style={{
                    background: 'linear-gradient(to bottom, rgba(17, 24, 39, 0.4), rgba(31, 41, 55, 0.5))',
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(59, 130, 246, 0.5) rgba(31, 41, 55, 0.5)',
                  }}
                >
                  {!isChatAvailable ? (
                    <div className="text-center text-yellow-400 mt-12">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-xs">⚠️ Chat Unavailable</p>
                      <p className="text-xs text-gray-500">Realtime connection required</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-gray-400 mt-12">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                      <p className="text-xs">No messages yet</p>
                      <p className="text-xs text-gray-500">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-1.5 ${msg.sender === currentUserName ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        {/* Avatar */}
                        <div className="flex-shrink-0">
                          {msg.avatar && msg.avatar.startsWith('data:') ? (
                            <img
                              src={msg.avatar}
                              alt={msg.sender}
                              className="w-6 h-6 rounded-full border border-blue-500/50"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-600/80 border border-blue-400/50 flex items-center justify-center text-sm">
                              {msg.avatar || '🎲'}
                            </div>
                          )}
                        </div>

                        {/* Message Bubble */}
                        <div className={`flex flex-col ${msg.sender === currentUserName ? 'items-end' : 'items-start'} max-w-[75%]`}>
                          <div className="text-xs text-gray-400 mb-0.5 px-1">{msg.sender}</div>
                          <div
                            className={`px-2.5 py-1.5 rounded-xl shadow-md text-xs break-words ${
                              msg.sender === currentUserName
                                ? 'bg-blue-600/90 text-white'
                                : 'bg-gray-700/90 text-white'
                            }`}
                          >
                            {msg.text}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 px-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isChatAvailable ? "Type a message..." : "Chat unavailable"}
                      maxLength={200}
                      disabled={!isChatAvailable}
                      className="flex-1 bg-gray-700/80 border border-gray-600/50 rounded-lg px-2.5 py-1.5 text-white text-xs placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all disabled:opacity-50"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!inputMessage.trim() || !isChatAvailable}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 text-right">
                    {inputMessage.length}/200
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </motion.div>

      {/* Permission Request Modal */}
      <AnimatePresence>
        {showPermissionRequest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
            onClick={() => setShowPermissionRequest(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border-2 border-purple-500/50 max-w-md"
            >
              <div className="text-center">
                <Mic className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-white mb-4">Enable Voice Chat?</h2>
                <p className="text-gray-300 mb-6">
                  Allow microphone access to talk with other players in this lobby.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPermissionRequest(false)}
                    className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={async () => {
                      const granted = await requestMicPermission();
                      if (granted) setIsMicEnabled(true);
                    }}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:from-purple-600 hover:to-pink-600 transition-colors"
                  >
                    Allow
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Report Player Modal */}
      <AnimatePresence>
        {showReportModal && reportTarget && (
          <ReportPlayerModal
            targetName={reportTarget.name}
            onSubmit={submitPlayerReport}
            onClose={() => {
              setShowReportModal(false);
              setReportTarget(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Bug Report Modal */}
      <AnimatePresence>
        {showBugReportModal && (
          <BugReportModal
            onSubmit={submitBugReport}
            onClose={() => setShowBugReportModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Report Player Modal Component
function ReportPlayerModal({ 
  targetName, 
  onSubmit, 
  onClose 
}: { 
  targetName: string; 
  onSubmit: (reason: string, description: string) => void; 
  onClose: () => void;
}) {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const reasons = [
    'Abusive language',
    'Harassment',
    'Cheating/Exploitation',
    'Spam',
    'Inappropriate name',
    'Other'
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border-2 border-yellow-500/50 max-w-md w-full"
      >
        <div className="flex items-center gap-3 mb-6">
          <Flag className="w-8 h-8 text-yellow-500" />
          <h2 className="text-2xl font-bold text-white">Report Player</h2>
        </div>
        
        <p className="text-gray-300 mb-4">
          Reporting: <span className="font-bold text-white">{targetName}</span>
        </p>

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-300 mb-2">Reason</label>
          <select
            value={reason}
            onChange={e => setReason(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white focus:border-yellow-500 focus:outline-none"
          >
            <option value="">Select a reason...</option>
            {reasons.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-300 mb-2">Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Provide details about what happened..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (reason && description.trim()) {
                onSubmit(reason, description);
              } else {
                toast.error('Please fill in all fields');
              }
            }}
            disabled={!reason || !description.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-colors disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
          >
            Submit Report
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Bug Report Modal Component
function BugReportModal({ 
  onSubmit, 
  onClose 
}: { 
  onSubmit: (description: string, reproSteps: string) => void; 
  onClose: () => void;
}) {
  const [description, setDescription] = useState('');
  const [reproSteps, setReproSteps] = useState('');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-2xl border-2 border-orange-500/50 max-w-md w-full"
      >
        <div className="flex items-center gap-3 mb-6">
          <Bug className="w-8 h-8 text-orange-500" />
          <h2 className="text-2xl font-bold text-white">Report a Bug</h2>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-bold text-gray-300 mb-2">What happened?</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Describe the bug you encountered..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none resize-none"
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold text-gray-300 mb-2">How to reproduce?</label>
          <textarea
            value={reproSteps}
            onChange={e => setReproSteps(e.target.value)}
            placeholder="Steps to reproduce the bug..."
            rows={4}
            className="w-full px-4 py-3 bg-gray-800 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:border-orange-500 focus:outline-none resize-none"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (description.trim() && reproSteps.trim()) {
                onSubmit(description, reproSteps);
              } else {
                toast.error('Please fill in all fields');
              }
            }}
            disabled={!description.trim() || !reproSteps.trim()}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-bold hover:from-orange-600 hover:to-red-600 transition-colors disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed"
          >
            Submit Bug Report
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}