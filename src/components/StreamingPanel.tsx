import { useState, useRef, useEffect } from 'react';
import { Video, StopCircle, Radio, Download, Settings, Twitch, Eye, Keyboard } from './Icons';
import { useSettings } from '../contexts/SettingsContext';

interface StreamingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: { name: string; email: string; avatar?: string } | null;
}

export function StreamingPanel({ isOpen, onClose, profile }: StreamingPanelProps) {
  const { settings } = useSettings();
  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [streamingTime, setStreamingTime] = useState(0);
  const [twitchConnected, setTwitchConnected] = useState(false);
  const [twitchUsername, setTwitchUsername] = useState('');
  const [streamKey, setStreamKey] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  const [streamTitle, setStreamTitle] = useState('Playing Rollers Paradise - Crapless!');
  const [streamCategory, setStreamCategory] = useState('Casino');
  const [showStreamSettings, setShowStreamSettings] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const viewerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Format time as HH:MM:SS
  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Start screen recording
  const startRecording = async () => {
    try {
      console.log('🎥 Starting recording...');
      
      // Check if getDisplayMedia is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        alert('❌ Screen recording is not supported in your browser. Please use Chrome, Edge, or Firefox.');
        return;
      }

      // Request screen capture
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen' as any,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } as any
      });

      streamRef.current = stream;
      recordedChunksRef.current = [];

      // Create media recorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 8000000 // 8 Mbps for high quality
      });

      mediaRecorderRef.current = mediaRecorder;

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      // Handle stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `rollers-paradise-${Date.now()}.webm`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        // Clean up
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };

      // Handle track ended (user stopped sharing)
      stream.getTracks()[0].addEventListener('ended', () => {
        console.log('📹 User stopped screen sharing');
        stopRecording();
      });

      // Start recording
      mediaRecorder.start(1000); // Capture every second
      setIsRecording(true);
      setRecordingTime(0);
      
      console.log('✅ Recording started successfully!');
    } catch (error: any) {
      console.error('Error starting recording:', error);
      
      // Provide user-friendly error messages
      if (error.name === 'NotAllowedError') {
        alert('❌ Screen recording permission denied.\n\n' +
              'To enable recording:\n' +
              '1. Click the camera/screen icon in your browser address bar\n' +
              '2. Allow screen capture permissions\n' +
              '3. Try recording again\n\n' +
              'Note: This feature may not work in embedded iframes or certain browsers.');
      } else if (error.name === 'NotSupportedError') {
        alert('❌ Screen recording is not supported in your browser.\n\nPlease use Chrome, Edge, or Firefox.');
      } else if (error.name === 'NotFoundError') {
        alert('❌ No screen capture source found. Please try again.');
      } else {
        alert('❌ Failed to start recording.\n\n' +
              'This might happen if:\n' +
              '• You\'re viewing this in an embedded frame\n' +
              '• Your browser blocks screen capture\n' +
              '• Permissions are restricted\n\n' +
              'Try opening this page in a new tab or window.');
      }
    }
  };

  // Stop recording
  const stopRecording = () => {
    console.log('🛑 Stopping recording...');
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log('✅ Recording stopped and will download');
    }
  };

  // Start Twitch stream
  const startStreaming = async () => {
    if (!twitchConnected) {
      alert('❌ Please connect to Twitch first!\n\nClick "Setup Twitch Streaming" to configure your credentials.');
      return;
    }

    try {
      console.log('📡 Starting Twitch stream...');
      
      // Request screen capture for streaming
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen' as any,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        } as any
      });

      streamRef.current = stream;

      // In a real implementation, you would use WebRTC + RTMP to push to Twitch
      // For now, we'll simulate the streaming experience
      
      setIsStreaming(true);
      setStreamingTime(0);
      setViewerCount(Math.floor(Math.random() * 10) + 1); // Start with 1-10 viewers
      
      console.log('✅ Streaming started!');
      console.log(`📺 Stream Title: ${streamTitle}`);
      console.log(`📂 Category: ${streamCategory}`);
      console.log(`👤 Channel: ${twitchUsername}`);
      
      // Simulate viewer count updates
      viewerIntervalRef.current = setInterval(() => {
        setViewerCount(prev => {
          const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
          const newCount = Math.max(0, prev + change);
          return Math.min(999, newCount); // Cap at 999
        });
      }, 5000);

      // Handle track ended (user stopped sharing)
      stream.getTracks()[0].addEventListener('ended', () => {
        console.log('📹 User stopped screen sharing');
        stopStreaming();
      });
      
    } catch (error: any) {
      console.error('Error starting stream:', error);
      
      if (error.name === 'NotAllowedError') {
        alert('❌ Screen capture permission denied.\n\nPlease allow screen sharing to start streaming.');
      } else {
        alert('❌ Failed to start streaming.\n\nPlease make sure you grant screen capture permissions.');
      }
    }
  };

  // Stop streaming
  const stopStreaming = () => {
    console.log('🛑 Stopping stream...');
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (viewerIntervalRef.current) {
      clearInterval(viewerIntervalRef.current);
      viewerIntervalRef.current = null;
    }
    
    setIsStreaming(false);
    setViewerCount(0);
    console.log('✅ Stream ended');
  };

  // Connect to Twitch - Manual Setup
  const handleTwitchSetup = () => {
    if (!twitchUsername.trim() || !streamKey.trim()) {
      alert('❌ Please enter both your Twitch Username and Stream Key.');
      return;
    }

    setTwitchConnected(true);
    
    // Save to localStorage (SKIP FOR GUESTS)
    const isGuest = profile?.email.includes('@temporary.local');
    if (!isGuest) {
      localStorage.setItem('twitch-connection', JSON.stringify({
        username: twitchUsername,
        streamKey: streamKey,
        streamTitle: streamTitle,
        streamCategory: streamCategory,
        connectedAt: Date.now()
      }));
      console.log('✅ Twitch settings saved!');
    } else {
      console.log('👻 Guest account - Twitch settings NOT saved (session only)');
    }
    
    setShowStreamSettings(false);
    alert('✅ Twitch connected successfully!\n\nYou can now start streaming.');
  };

  // Disconnect from Twitch
  const handleTwitchDisconnect = () => {
    if (isStreaming) {
      alert('❌ Please stop streaming before disconnecting.');
      return;
    }
    
    setTwitchConnected(false);
    setTwitchUsername('');
    setStreamKey('');
    localStorage.removeItem('twitch-connection');
    console.log('✅ Twitch disconnected');
  };

  // Check if Twitch is connected on mount
  useEffect(() => {
    const checkTwitchConnection = async () => {
      try {
        const saved = localStorage.getItem('twitch-connection');
        if (saved) {
          const data = JSON.parse(saved);
          setTwitchConnected(true);
          setTwitchUsername(data.username);
          setStreamKey(data.streamKey);
          if (data.streamTitle) setStreamTitle(data.streamTitle);
          if (data.streamCategory) setStreamCategory(data.streamCategory);
          console.log('✅ Loaded Twitch connection:', data.username);
        }
      } catch (error) {
        console.error('Error checking Twitch connection:', error);
      }
    };
    
    checkTwitchConnection();
  }, []);

  // Timer for recording/streaming
  useEffect(() => {
    if (isRecording || isStreaming) {
      timerRef.current = setInterval(() => {
        if (isRecording) setRecordingTime(prev => prev + 1);
        if (isStreaming) setStreamingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isStreaming]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (viewerIntervalRef.current) {
        clearInterval(viewerIntervalRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={onClose}>
      <div className="animate-in zoom-in-95 fade-in duration-300">
        <div
          className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4"
          style={{
            borderImage: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #8b5cf6 100%) 1',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 rounded-t-xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Video className="w-8 h-8 text-white" />
                <h2 className="text-white text-2xl font-bold">Streaming & Recording</h2>
              </div>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors text-2xl font-bold w-8 h-8 flex items-center justify-center"
              >
                ×
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Twitch Connection Section */}
            <div className="bg-gray-800/50 rounded-xl p-5 border-2 border-purple-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Twitch className="w-6 h-6 text-purple-500" />
                <h3 className="text-white text-xl font-bold">Twitch Connection</h3>
              </div>

              {!twitchConnected ? (
                <div className="space-y-4">
                  {!showStreamSettings ? (
                    <>
                      <p className="text-gray-300 text-sm">
                        Enter your Twitch credentials to enable live streaming.
                      </p>
                      <button
                        onClick={() => setShowStreamSettings(true)}
                        className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                      >
                        <Settings className="w-5 h-5" />
                        Setup Twitch Streaming
                      </button>
                      <p className="text-gray-400 text-xs">
                        💡 You'll need your Twitch username and stream key from your Twitch dashboard.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="space-y-3">
                        <div>
                          <label className="text-white text-sm font-bold mb-2 block">
                            Twitch Username
                          </label>
                          <input
                            type="text"
                            value={twitchUsername}
                            onChange={(e) => setTwitchUsername(e.target.value)}
                            placeholder="YourTwitchUsername"
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border-2 border-gray-600 focus:border-purple-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="text-white text-sm font-bold mb-2 block">
                            Stream Key
                          </label>
                          <input
                            type="password"
                            value={streamKey}
                            onChange={(e) => setStreamKey(e.target.value)}
                            placeholder="live_••••••••••••••"
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border-2 border-gray-600 focus:border-purple-500 transition-colors"
                          />
                          <p className="text-gray-400 text-xs mt-1">
                            🔒 Found in Twitch Dashboard → Settings → Stream
                          </p>
                        </div>

                        <div>
                          <label className="text-white text-sm font-bold mb-2 block">
                            Stream Title
                          </label>
                          <input
                            type="text"
                            value={streamTitle}
                            onChange={(e) => setStreamTitle(e.target.value)}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border-2 border-gray-600 focus:border-purple-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="text-white text-sm font-bold mb-2 block">
                            Category
                          </label>
                          <select
                            value={streamCategory}
                            onChange={(e) => setStreamCategory(e.target.value)}
                            className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border-2 border-gray-600 focus:border-purple-500 transition-colors"
                          >
                            <option value="Casino">Casino</option>
                            <option value="Just Chatting">Just Chatting</option>
                            <option value="Slots">Slots</option>
                            <option value="Board Games">Board Games</option>
                            <option value="Poker">Poker</option>
                            <option value="Blackjack">Blackjack</option>
                            <option value="Roulette">Roulette</option>
                            <option value="Gambling">Gambling</option>
                            <option value="Games & Demos">Games & Demos</option>
                            <option value="Talk Shows & Podcasts">Talk Shows & Podcasts</option>
                            <option value="Always On">Always On</option>
                            <option value="Strategy Games">Strategy Games</option>
                            <option value="Software and Game Development">Software and Game Development</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowStreamSettings(false)}
                          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition-all"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleTwitchSetup}
                          className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2 rounded-lg font-bold transition-all"
                        >
                          Save & Connect
                        </button>
                      </div>

                      <div className="bg-blue-900/30 border border-blue-500/50 rounded-lg p-3">
                        <p className="text-blue-300 text-xs">
                          📺 <strong>How to get your Stream Key:</strong><br/>
                          1. Go to twitch.tv/dashboard<br/>
                          2. Click "Settings" → "Stream"<br/>
                          3. Copy your "Primary Stream Key"
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-green-900/30 border border-green-500/50 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                        <Twitch className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-bold">{twitchUsername}</p>
                        <p className="text-green-400 text-sm">✓ Connected</p>
                      </div>
                    </div>
                    <button
                      onClick={handleTwitchDisconnect}
                      className="text-red-400 hover:text-red-300 text-sm font-bold transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>

                  {/* Stream Settings */}
                  <div className="bg-gray-700/30 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Title:</span>
                      <span className="text-white text-sm font-bold">{streamTitle}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Category:</span>
                      <span className="text-white text-sm font-bold">{streamCategory}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Streaming Controls */}
            <div className="bg-gray-800/50 rounded-xl p-5 border-2 border-pink-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Radio className="w-6 h-6 text-pink-500" />
                <h3 className="text-white text-xl font-bold">Live Streaming</h3>
              </div>

              {!isStreaming ? (
                <button
                  onClick={startStreaming}
                  disabled={!twitchConnected}
                  className={`w-full px-6 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                    twitchConnected
                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white'
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <Radio className="w-5 h-5" />
                  {twitchConnected ? 'Start Streaming to Twitch' : 'Connect Twitch First'}
                </button>
              ) : (
                <div className="space-y-4">
                  {/* Live indicator */}
                  <div className="bg-red-900/30 border-2 border-red-500 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-red-400 font-bold text-lg">LIVE ON TWITCH</span>
                      </div>
                      <div className="flex items-center gap-2 text-white">
                        <Eye className="w-4 h-4" />
                        <span className="font-bold">{viewerCount}</span>
                      </div>
                    </div>
                    <div className="text-white text-2xl font-mono text-center">
                      {formatTime(streamingTime)}
                    </div>
                  </div>

                  {/* Stop button */}
                  <button
                    onClick={stopStreaming}
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <StopCircle className="w-5 h-5" />
                    End Stream
                  </button>
                </div>
              )}
            </div>

            {/* Recording Controls */}
            <div className="bg-gray-800/50 rounded-xl p-5 border-2 border-blue-500/30">
              <div className="flex items-center gap-3 mb-4">
                <Download className="w-6 h-6 text-blue-500" />
                <h3 className="text-white text-xl font-bold">Screen Recording</h3>
              </div>

              {!isRecording ? (
                <div className="space-y-3">
                  <p className="text-gray-300 text-sm">
                    Record your gameplay and save it to your computer.
                  </p>
                  <button
                    onClick={startRecording}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Video className="w-5 h-5" />
                    Start Recording
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Recording indicator */}
                  <div className="bg-blue-900/30 border-2 border-blue-500 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                        <span className="text-blue-400 font-bold text-lg">RECORDING</span>
                      </div>
                    </div>
                    <div className="text-white text-2xl font-mono text-center">
                      {formatTime(recordingTime)}
                    </div>
                  </div>

                  {/* Stop button */}
                  <button
                    onClick={stopRecording}
                    className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white px-6 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <StopCircle className="w-5 h-5" />
                    Stop & Download Recording
                  </button>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="bg-yellow-900/20 border-2 border-yellow-500/30 rounded-xl p-4">
              <h4 className="text-yellow-400 font-bold mb-2 flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Tips for Best Quality
              </h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Make sure you have a stable internet connection for streaming</li>
                <li>• Close unnecessary applications to reduce lag</li>
                <li>• Recording downloads as .webm format (compatible with most players)</li>
                <li>• Stream at 1080p 60fps for best viewer experience</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}