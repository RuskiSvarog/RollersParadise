import { useEffect, useRef, useState } from 'react';

/**
 * Hook to monitor component performance
 * Tracks render time, re-render count, and provides optimization suggestions
 */
export function usePerformanceMonitor(componentName: string) {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderCount: 0,
    averageRenderTime: 0,
    lastRenderTime: 0
  });

  useEffect(() => {
    renderCount.current += 1;
    const endTime = performance.now();
    const renderTime = endTime - startTime.current;

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${componentName} - Render #${renderCount.current} took ${renderTime.toFixed(2)}ms`);
      
      // Warn about excessive re-renders
      if (renderCount.current > 10 && renderTime > 16.67) {
        console.warn(`[Performance Warning] ${componentName} is re-rendering frequently (${renderCount.current} times) and slowly (${renderTime.toFixed(2)}ms). Consider using React.memo or useMemo.`);
      }
    }

    setPerformanceMetrics(prev => ({
      renderCount: renderCount.current,
      averageRenderTime: (prev.averageRenderTime * (renderCount.current - 1) + renderTime) / renderCount.current,
      lastRenderTime: renderTime
    }));

    startTime.current = performance.now();
  });

  return performanceMetrics;
}

/**
 * Hook to track FPS (frames per second)
 */
export function useFPSMonitor() {
  const [fps, setFPS] = useState(60);
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const rafId = useRef<number>();

  useEffect(() => {
    const measureFPS = () => {
      frameCount.current++;
      const currentTime = performance.now();
      
      if (currentTime >= lastTime.current + 1000) {
        const currentFPS = Math.round((frameCount.current * 1000) / (currentTime - lastTime.current));
        setFPS(currentFPS);
        frameCount.current = 0;
        lastTime.current = currentTime;
      }
      
      rafId.current = requestAnimationFrame(measureFPS);
    };

    rafId.current = requestAnimationFrame(measureFPS);

    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return fps;
}

/**
 * Hook to monitor memory usage
 */
export function useMemoryMonitor() {
  const [memoryInfo, setMemoryInfo] = useState<{
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  } | null>(null);

  useEffect(() => {
    const checkMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMemoryInfo({
          usedJSHeapSize: Math.round(memory.usedJSHeapSize / 1048576), // Convert to MB
          totalJSHeapSize: Math.round(memory.totalJSHeapSize / 1048576),
          jsHeapSizeLimit: Math.round(memory.jsHeapSizeLimit / 1048576)
        });
      }
    };

    checkMemory();
    const interval = setInterval(checkMemory, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

/**
 * Hook to detect slow network
 */
export function useNetworkMonitor() {
  const [networkInfo, setNetworkInfo] = useState<{
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  } | null>(null);

  useEffect(() => {
    const updateNetworkInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        setNetworkInfo({
          effectiveType: connection.effectiveType || 'unknown',
          downlink: connection.downlink || 0,
          rtt: connection.rtt || 0,
          saveData: connection.saveData || false
        });
      }
    };

    updateNetworkInfo();

    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', updateNetworkInfo);

      return () => {
        connection.removeEventListener('change', updateNetworkInfo);
      };
    }
  }, []);

  return networkInfo;
}

/**
 * Hook to track component mount time
 */
export function useMountTime(componentName: string) {
  useEffect(() => {
    const mountTime = performance.now();
    
    return () => {
      const unmountTime = performance.now();
      const lifetimeMs = unmountTime - mountTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Lifecycle] ${componentName} was mounted for ${(lifetimeMs / 1000).toFixed(2)}s`);
      }
    };
  }, [componentName]);
}

/**
 * Hook to warn about expensive renders
 */
export function useRenderWarning(componentName: string, threshold: number = 16.67) {
  const renderStartTime = useRef(performance.now());

  useEffect(() => {
    const renderTime = performance.now() - renderStartTime.current;
    
    if (process.env.NODE_ENV === 'development' && renderTime > threshold) {
      console.warn(
        `[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render (threshold: ${threshold}ms). ` +
        'This exceeds 60fps (16.67ms per frame) and may cause jank.'
      );
    }

    renderStartTime.current = performance.now();
  });
}

/**
 * Hook for lazy state initialization
 * Only computes initial state when component first mounts
 */
export function useLazyState<T>(initializer: () => T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(initializer);
  return [state, setState];
}

/**
 * Hook to debounce a value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Hook to throttle a callback
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRan = useRef(Date.now());

  return ((...args: Parameters<T>) => {
    if (Date.now() - lastRan.current >= delay) {
      callback(...args);
      lastRan.current = Date.now();
    }
  }) as T;
}
