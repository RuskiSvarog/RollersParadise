import { useState, useEffect } from 'react';
import { useFPSMonitor, useMemoryMonitor, useNetworkMonitor } from '../hooks/usePerformanceMonitor';
import { Button } from './ui/button';
import { X, Activity, Wifi, HardDrive, Zap } from 'lucide-react';

interface PerformanceMonitorProps {
  onClose?: () => void;
}

/**
 * Performance Monitor Component
 * Shows real-time performance metrics for debugging and optimization
 * Only visible in development mode or when enabled by user
 */
export function PerformanceMonitor({ onClose }: PerformanceMonitorProps) {
  const fps = useFPSMonitor();
  const memoryInfo = useMemoryMonitor();
  const networkInfo = useNetworkMonitor();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or if user enabled it
    const showMonitor = 
      process.env.NODE_ENV === 'development' || 
      localStorage.getItem('show_performance_monitor') === 'true';
    
    setIsVisible(showMonitor);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('show_performance_monitor', 'false');
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  // Determine FPS quality
  const getFPSQuality = (fps: number) => {
    if (fps >= 55) return { color: 'text-green-500', label: 'Excellent' };
    if (fps >= 45) return { color: 'text-yellow-500', label: 'Good' };
    if (fps >= 30) return { color: 'text-orange-500', label: 'Fair' };
    return { color: 'text-red-500', label: 'Poor' };
  };

  // Determine memory usage quality
  const getMemoryQuality = (used: number, total: number) => {
    const percentage = (used / total) * 100;
    if (percentage < 50) return { color: 'text-green-500', label: 'Low' };
    if (percentage < 75) return { color: 'text-yellow-500', label: 'Medium' };
    return { color: 'text-red-500', label: 'High' };
  };

  // Determine network quality
  const getNetworkQuality = (effectiveType: string) => {
    if (effectiveType === '4g') return { color: 'text-green-500', label: 'Fast' };
    if (effectiveType === '3g') return { color: 'text-yellow-500', label: 'Medium' };
    return { color: 'text-red-500', label: 'Slow' };
  };

  const fpsQuality = getFPSQuality(fps);
  const memoryQuality = memoryInfo 
    ? getMemoryQuality(memoryInfo.usedJSHeapSize, memoryInfo.totalJSHeapSize)
    : { color: 'text-gray-500', label: 'N/A' };
  const networkQuality = networkInfo
    ? getNetworkQuality(networkInfo.effectiveType)
    : { color: 'text-gray-500', label: 'N/A' };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-2xl z-[9999] min-w-[280px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 border-b border-gray-700 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-500" />
          <h3 className="text-white text-sm font-semibold">Performance</h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-6 w-6 p-0 hover:bg-gray-800"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Metrics */}
      <div className="space-y-3">
        {/* FPS */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-gray-400" />
            <span className="text-gray-400 text-xs">FPS</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`${fpsQuality.color} font-mono font-bold`}>
              {fps}
            </span>
            <span className="text-gray-500 text-xs">({fpsQuality.label})</span>
          </div>
        </div>

        {/* Memory */}
        {memoryInfo && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-xs">Memory</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`${memoryQuality.color} font-mono text-xs`}>
                {memoryInfo.usedJSHeapSize}MB / {memoryInfo.totalJSHeapSize}MB
              </span>
            </div>
          </div>
        )}

        {/* Network */}
        {networkInfo && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wifi className="w-4 h-4 text-gray-400" />
              <span className="text-gray-400 text-xs">Network</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`${networkQuality.color} text-xs uppercase`}>
                {networkInfo.effectiveType}
              </span>
              <span className="text-gray-500 text-xs">
                ({networkInfo.downlink}Mbps)
              </span>
            </div>
          </div>
        )}

        {/* Network RTT */}
        {networkInfo && (
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-xs ml-6">RTT</span>
            <span className="text-gray-300 text-xs font-mono">
              {networkInfo.rtt}ms
            </span>
          </div>
        )}

        {/* Data Saver */}
        {networkInfo && networkInfo.saveData && (
          <div className="flex items-center gap-2 text-yellow-500 text-xs">
            <span>⚠️</span>
            <span>Data Saver Mode Active</span>
          </div>
        )}
      </div>

      {/* Performance Tips */}
      {(fps < 45 || (memoryInfo && memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize > 0.75)) && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <p className="text-yellow-500 text-xs mb-1 font-semibold">⚠️ Performance Tips:</p>
          <ul className="text-gray-400 text-xs space-y-1">
            {fps < 45 && (
              <li>• Lower graphics quality in settings</li>
            )}
            {memoryInfo && memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize > 0.75 && (
              <li>• High memory usage - consider refreshing</li>
            )}
            {networkInfo && networkInfo.effectiveType !== '4g' && (
              <li>• Slow network - reduce background features</li>
            )}
          </ul>
        </div>
      )}

      {/* Dev Mode Badge */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
            🛠️ Development Mode
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * Toggle button for performance monitor
 */
export function PerformanceMonitorToggle() {
  const [isVisible, setIsVisible] = useState(
    localStorage.getItem('show_performance_monitor') === 'true'
  );

  const toggleMonitor = () => {
    const newState = !isVisible;
    setIsVisible(newState);
    localStorage.setItem('show_performance_monitor', String(newState));
    window.location.reload(); // Reload to show/hide monitor
  };

  // Only show toggle in development mode
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <Button
      onClick={toggleMonitor}
      variant="outline"
      size="sm"
      className="fixed bottom-4 left-4 z-[9999] bg-gray-900/90 backdrop-blur-sm border-gray-700"
      title="Toggle Performance Monitor"
    >
      <Activity className="w-4 h-4 mr-2" />
      {isVisible ? 'Hide' : 'Show'} Perf Monitor
    </Button>
  );
}
