import { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, Headphones, CheckCircle, XCircle, Play, Square } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';

interface AudioDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'audiooutput';
}

interface AudioDeviceSettingsProps {
  onDevicesChange?: (inputDevice: string, outputDevice: string) => void;
  initialInputDevice?: string;
  initialOutputDevice?: string;
}

export function AudioDeviceSettings({ onDevicesChange, initialInputDevice, initialOutputDevice }: AudioDeviceSettingsProps) {
  const [inputDevices, setInputDevices] = useState<AudioDevice[]>([]);
  const [outputDevices, setOutputDevices] = useState<AudioDevice[]>([]);
  const [selectedInput, setSelectedInput] = useState<string>(initialInputDevice || 'default');
  const [selectedOutput, setSelectedOutput] = useState<string>(initialOutputDevice || 'default');
  const [micLevel, setMicLevel] = useState<number>(0);
  const [isTesting, setIsTesting] = useState(false);
  const [isPlayingTest, setIsPlayingTest] = useState(false);
  const [micTestStatus, setMicTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [speakerTestStatus, setSpeakerTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [permissionGranted, setPermissionGranted] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const testAudioRef = useRef<HTMLAudioElement | null>(null);
  const initializedRef = useRef(false);

  // Load devices on mount
  useEffect(() => {
    loadAudioDevices();
    
    // Load saved preferences
    const savedInput = localStorage.getItem('audio-input-device');
    const savedOutput = localStorage.getItem('audio-output-device');
    
    if (savedInput) setSelectedInput(savedInput);
    if (savedOutput) setSelectedOutput(savedOutput);

    return () => {
      stopMicTest();
    };
  }, []);

  // Set default devices when devices are loaded (only once)
  useEffect(() => {
    if (initializedRef.current) return; // Already initialized
    
    if (inputDevices.length > 0 && outputDevices.length > 0) {
      initializedRef.current = true;
      
      // Only set defaults if current selection is 'default' or empty
      if (selectedInput === 'default' || !selectedInput) {
        const savedInput = localStorage.getItem('audio-input-device');
        if (savedInput && inputDevices.find(d => d.deviceId === savedInput)) {
          setSelectedInput(savedInput);
        } else if (inputDevices.length > 0) {
          setSelectedInput(inputDevices[0].deviceId);
        }
      }
      
      if (selectedOutput === 'default' || !selectedOutput) {
        const savedOutput = localStorage.getItem('audio-output-device');
        if (savedOutput && outputDevices.find(d => d.deviceId === savedOutput)) {
          setSelectedOutput(savedOutput);
        } else if (outputDevices.length > 0) {
          setSelectedOutput(outputDevices[0].deviceId);
        }
      }
    }
  }, [inputDevices, outputDevices, selectedInput, selectedOutput]); // Only run when devices or initial selection changes

  // Notify parent when devices change
  useEffect(() => {
    if (onDevicesChange) {
      onDevicesChange(selectedInput, selectedOutput);
    }
    
    // Save preferences
    localStorage.setItem('audio-input-device', selectedInput);
    localStorage.setItem('audio-output-device', selectedOutput);
  }, [selectedInput, selectedOutput]); // Remove onDevicesChange from dependencies to prevent infinite loop

  const loadAudioDevices = async () => {
    try {
      // Check if we already have permission by enumerating devices first
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const inputs: AudioDevice[] = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 5)}`,
          kind: 'audioinput'
        }));

      const outputs: AudioDevice[] = devices
        .filter(device => device.kind === 'audiooutput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Speaker ${device.deviceId.slice(0, 5)}`,
          kind: 'audiooutput'
        }));

      // Check if we have permission by seeing if devices have labels
      const hasLabels = inputs.some(d => d.label && !d.label.includes('Microphone ')) || 
                        outputs.some(d => d.label && !d.label.includes('Speaker '));
      
      if (hasLabels || inputs.length > 0) {
        setPermissionGranted(true);
        setInputDevices(inputs);
        setOutputDevices(outputs);
      } else {
        setPermissionGranted(false);
      }
    } catch (error) {
      console.error('Failed to load audio devices:', error);
      setPermissionGranted(false);
    }
  };

  const startMicTest = async () => {
    try {
      setIsTesting(true);
      setMicTestStatus('testing');

      // If specific device selected, verify it exists (only if we can see device labels)
      if (selectedInput) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const inputDevices = devices.filter(d => d.kind === 'audioinput' && d.deviceId);
          
          // Only validate if we got device labels (means permission granted before)
          if (inputDevices.length > 0 && inputDevices[0].label) {
            const deviceExists = inputDevices.some(d => d.deviceId === selectedInput);
            if (!deviceExists) {
              console.warn('⚠️ Selected device not found, using default device');
              setSelectedInput('');
            }
          }
        } catch (enumError) {
          console.warn('⚠️ Could not verify device, will try anyway');
        }
      }

      // Get microphone stream with selected device
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: selectedInput ? { exact: selectedInput } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      mediaStreamRef.current = stream;

      // Create audio context and analyser
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 256;

      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);

      // Monitor audio levels
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const checkLevel = () => {
        if (!analyserRef.current || !isTesting) return;

        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        const normalizedLevel = Math.min(100, (average / 128) * 100);
        
        setMicLevel(normalizedLevel);

        // Update status based on audio detection
        if (normalizedLevel > 10) {
          setMicTestStatus('success');
        }

        animationFrameRef.current = requestAnimationFrame(checkLevel);
      };

      checkLevel();
    } catch (error: any) {
      console.error('Microphone test failed:', error);
      
      // Handle device not found
      if (error.name === 'NotFoundError') {
        console.error('❌ No microphone device found');
        alert('No microphone found. Please connect a microphone and try again.');
        setMicTestStatus('error');
        setIsTesting(false);
      } else if (error.name === 'OverconstrainedError') {
        // Constraints couldn't be satisfied - try with default device
        console.warn('⚠️ Device constraints failed, retrying with default microphone...');
        try {
          // Try with default device (no constraints)
          const defaultStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          
          mediaStreamRef.current = defaultStream;
          setSelectedInput(''); // Clear invalid selection
          
          // Continue with test using default device
          audioContextRef.current = new AudioContext();
          analyserRef.current = audioContextRef.current.createAnalyser();
          analyserRef.current.fftSize = 256;

          const source = audioContextRef.current.createMediaStreamSource(defaultStream);
          source.connect(analyserRef.current);

          const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
          
          const checkLevel = () => {
            if (!analyserRef.current || !isTesting) return;

            analyserRef.current.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
            const normalizedLevel = Math.min((average / 128) * 100, 100);
            setMicLevel(normalizedLevel);

            if (normalizedLevel > 10) {
              setMicTestStatus('success');
            }

            animationFrameRef.current = requestAnimationFrame(checkLevel);
          };

          checkLevel();
          return;
        } catch (retryError: any) {
          console.error('❌ Fallback failed:', retryError);
          if (retryError.name === 'NotFoundError') {
            alert('No microphone found. Please connect a microphone and try again.');
          } else {
            alert('Could not access microphone. Please check your browser settings.');
          }
          setMicTestStatus('error');
          setIsTesting(false);
        }
      } else {
        // Other errors
        setMicTestStatus('error');
        setIsTesting(false);
      }
    }
  };

  const stopMicTest = () => {
    setIsTesting(false);
    setMicLevel(0);

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;

    if (micTestStatus === 'testing') {
      setMicTestStatus('idle');
    }
  };

  const playSpeakerTest = async () => {
    try {
      setIsPlayingTest(true);
      setSpeakerTestStatus('testing');

      // Create test tone (440 Hz A note for 2 seconds)
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = 440; // A4 note
      
      // Fade in/out for smooth sound
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
      gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 1.5);
      gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 2);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Try to set output device (not all browsers support this)
      if ('setSinkId' in audioContext.destination && selectedOutput) {
        try {
          await (audioContext.destination as any).setSinkId(selectedOutput);
        } catch (err) {
          console.log('Setting output device not supported:', err);
        }
      }

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 2);

      setSpeakerTestStatus('success');

      // Wait for sound to finish
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsPlayingTest(false);
      
      // Reset status after delay
      setTimeout(() => {
        setSpeakerTestStatus('idle');
      }, 1000);

      audioContext.close();
    } catch (error) {
      console.error('Speaker test failed:', error);
      setSpeakerTestStatus('error');
      setIsPlayingTest(false);
    }
  };

  const requestPermission = async () => {
    try {
      console.log('🎤 Requesting audio permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Audio permission granted!');
      
      // Stop the test stream immediately (we just needed to get permission)
      stream.getTracks().forEach(track => track.stop());
      
      // Update permission state
      setPermissionGranted(true);
      
      // Load available devices
      await loadAudioDevices();
    } catch (error: any) {
      console.log('⚠️ Audio device access:', error.name || 'Unknown error');
      
      if (error.name === 'NotFoundError') {
        console.log('ℹ️ No microphone detected - voice chat will be unavailable');
        // Don't show intrusive alert - user may not need voice chat
      } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        alert('Microphone permission was denied. Please allow microphone access in your browser settings and try again.');
      } else {
        console.log('ℹ️ Could not access microphone - this is optional');
      }
    }
  };

  if (!permissionGranted) {
    return (
      <Card className="p-6">
        <div className="text-center space-y-4">
          <Mic className="w-12 h-12 mx-auto text-gray-400" />
          <div>
            <h3 className="text-lg mb-2">Microphone Access Required</h3>
            <p className="text-sm text-gray-400 mb-4">
              To configure audio devices and test your microphone, we need access to your audio devices.
            </p>
            <Button onClick={requestPermission}>
              <Mic className="w-4 h-4 mr-2" />
              Grant Audio Access
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Microphone Input Selection */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mic className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg">Microphone Input</h3>
        </div>

        <div className="space-y-4">
          {/* Device Selection */}
          <div>
            <label className="block text-sm mb-2 text-gray-300">Select Microphone</label>
            <select
              value={selectedInput}
              onChange={(e) => setSelectedInput(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {inputDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </select>
          </div>

          {/* Microphone Test */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-300">Test Microphone</label>
              {micTestStatus === 'success' && (
                <span className="flex items-center gap-1 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Microphone Working!
                </span>
              )}
              {micTestStatus === 'error' && (
                <span className="flex items-center gap-1 text-red-400 text-sm">
                  <XCircle className="w-4 h-4" />
                  Test Failed
                </span>
              )}
            </div>

            <Button
              onClick={isTesting ? stopMicTest : startMicTest}
              variant={isTesting ? 'destructive' : 'default'}
              className="w-full"
            >
              {isTesting ? (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Stop Testing
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Test Microphone
                </>
              )}
            </Button>

            {/* Visual Level Meter */}
            {isTesting && (
              <div className="mt-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400 min-w-[60px]">Level:</span>
                  <div className="flex-1 h-4 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-100"
                      style={{ width: `${micLevel}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-400 min-w-[45px]">{Math.round(micLevel)}%</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Speak into your microphone to see the level meter respond
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Speaker/Headphone Output Selection */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Headphones className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg">Audio Output</h3>
        </div>

        <div className="space-y-4">
          {/* Device Selection */}
          <div>
            <label className="block text-sm mb-2 text-gray-300">Select Output Device</label>
            <select
              value={selectedOutput}
              onChange={(e) => setSelectedOutput(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {outputDevices.map(device => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </select>
          </div>

          {/* Speaker Test */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-gray-300">Test Speakers/Headphones</label>
              {speakerTestStatus === 'success' && (
                <span className="flex items-center gap-1 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  Playing Test Sound!
                </span>
              )}
              {speakerTestStatus === 'error' && (
                <span className="flex items-center gap-1 text-red-400 text-sm">
                  <XCircle className="w-4 h-4" />
                  Test Failed
                </span>
              )}
            </div>

            <Button
              onClick={playSpeakerTest}
              disabled={isPlayingTest}
              className="w-full"
              variant="secondary"
            >
              {isPlayingTest ? (
                <>
                  <Volume2 className="w-4 h-4 mr-2 animate-pulse" />
                  Playing Test Sound...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Play Test Sound
                </>
              )}
            </Button>

            <p className="text-xs text-gray-500 mt-2">
              You should hear a clear tone (A note at 440 Hz) for 2 seconds
            </p>
          </div>
        </div>
      </Card>

      {/* Info Card */}
      <Card className="p-4 bg-blue-500/10 border-blue-500/20">
        <div className="flex gap-3">
          <Volume2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm space-y-1">
            <p className="text-blue-300">
              <strong>Tip:</strong> Test your devices before starting a voice chat to ensure everything works properly.
            </p>
            <ul className="text-blue-300/80 space-y-1 mt-2 ml-4 list-disc">
              <li>Your microphone should show green levels when you speak</li>
              <li>The test sound should be clear and audible in your selected output</li>
              <li>Settings are automatically saved for future sessions</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
