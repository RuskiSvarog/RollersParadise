/**
 * ⚡ Performance Optimization Utilities
 * Helps improve app performance through various techniques
 * Includes specialized monitoring for multiplayer timer system
 */

// 📊 Multiplayer Timer Performance Metrics
interface TimerPerformanceMetrics {
  timerStartTime: number;
  timerEndTime: number;
  totalDuration: number;
  missedTicks: number;
  averageTickAccuracy: number;
}

let timerMetrics: TimerPerformanceMetrics = {
  timerStartTime: 0,
  timerEndTime: 0,
  totalDuration: 0,
  missedTicks: 0,
  averageTickAccuracy: 0,
};

/**
 * Monitor multiplayer timer performance
 * Tracks accuracy and identifies any lag or missed ticks
 */
export function monitorTimerPerformance(timerValue: number, expectedDuration: number) {
  if (timerValue === expectedDuration) {
    // Timer just started
    timerMetrics.timerStartTime = Date.now();
    timerMetrics.missedTicks = 0;
    console.log('⏱️ [PERFORMANCE] Timer started - monitoring accuracy');
  } else if (timerValue === 0) {
    // Timer just ended
    timerMetrics.timerEndTime = Date.now();
    timerMetrics.totalDuration = (timerMetrics.timerEndTime - timerMetrics.timerStartTime) / 1000;
    const accuracy = (timerMetrics.totalDuration / expectedDuration) * 100;
    timerMetrics.averageTickAccuracy = accuracy;
    
    console.log('✅ [PERFORMANCE] Timer completed');
    console.log(`📊 Expected: ${expectedDuration}s | Actual: ${timerMetrics.totalDuration.toFixed(2)}s | Accuracy: ${accuracy.toFixed(2)}%`);
    console.log(`⚠️ Missed ticks: ${timerMetrics.missedTicks}`);
  }
}

/**
 * Get current timer performance metrics
 */
export function getTimerMetrics(): TimerPerformanceMetrics {
  return { ...timerMetrics };
}

/**
 * Debounce function to limit how often a function is called
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution frequency
 * @param func - Function to throttle
 * @param limit - Time limit in milliseconds
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load images with Intersection Observer
 * @param imageElements - Array of image elements to lazy load
 */
export function lazyLoadImages(imageElements: HTMLImageElement[]) {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          const src = img.dataset.src;
          if (src) {
            img.src = src;
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        }
      });
    });

    imageElements.forEach(img => imageObserver.observe(img));
  } else {
    // Fallback for older browsers
    imageElements.forEach(img => {
      const src = img.dataset.src;
      if (src) img.src = src;
    });
  }
}

/**
 * Preload critical resources
 * @param urls - Array of resource URLs to preload
 * @param type - Resource type (image, script, style, font)
 */
export function preloadResources(urls: string[], type: 'image' | 'script' | 'style' | 'font' = 'image') {
  const asMap: Record<string, string> = {
    image: 'image',
    script: 'script',
    style: 'style',
    font: 'font'
  };

  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = asMap[type];
    link.href = url;
    if (type === 'font') {
      link.crossOrigin = 'anonymous';
    }
    document.head.appendChild(link);
  });
}

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Get network connection quality
 */
export function getNetworkQuality(): 'slow' | 'medium' | 'fast' {
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    const effectiveType = connection?.effectiveType;
    
    if (effectiveType === '4g') return 'fast';
    if (effectiveType === '3g') return 'medium';
    return 'slow';
  }
  return 'medium'; // Default assumption
}

/**
 * Optimize based on device memory
 */
export function getMemoryTier(): 'low' | 'medium' | 'high' {
  if ('deviceMemory' in navigator) {
    const memory = (navigator as any).deviceMemory; // in GB
    if (memory >= 8) return 'high';
    if (memory >= 4) return 'medium';
    return 'low';
  }
  return 'medium'; // Default assumption
}

/**
 * Request idle callback wrapper with fallback
 */
export function requestIdleCallback(callback: () => void, timeout: number = 2000) {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(callback, { timeout });
  } else {
    setTimeout(callback, 1);
  }
}

/**
 * Measure component render performance
 */
export function measurePerformance(componentName: string, callback: () => void) {
  if (process.env.NODE_ENV === 'development') {
    const startTime = performance.now();
    callback();
    const endTime = performance.now();
    console.log(`[Performance] ${componentName} rendered in ${(endTime - startTime).toFixed(2)}ms`);
  } else {
    callback();
  }
}

/**
 * Optimize settings based on device capabilities
 */
export function getOptimizedSettings() {
  const networkQuality = getNetworkQuality();
  const memoryTier = getMemoryTier();
  const reducedMotion = prefersReducedMotion();

  return {
    enableAnimations: !reducedMotion && memoryTier !== 'low',
    enableParticles: memoryTier === 'high' && networkQuality === 'fast',
    imageQuality: networkQuality === 'slow' ? 'low' : networkQuality === 'medium' ? 'medium' : 'high',
    enableShadows: memoryTier !== 'low',
    maxFPS: memoryTier === 'low' ? 30 : 60,
    enableBlur: memoryTier !== 'low',
    preloadAssets: networkQuality !== 'slow' && memoryTier !== 'low'
  };
}

/**
 * Bundle size analyzer (development only)
 */
export function analyzeBundleSize() {
  if (process.env.NODE_ENV === 'development') {
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach(script => {
      const src = (script as HTMLScriptElement).src;
      if (src && !src.includes('node_modules')) {
        fetch(src)
          .then(response => response.blob())
          .then(blob => {
            totalSize += blob.size;
            console.log(`[Bundle] ${src.split('/').pop()}: ${(blob.size / 1024).toFixed(2)} KB`);
          });
      }
    });

    setTimeout(() => {
      console.log(`[Bundle] Total estimated size: ${(totalSize / 1024).toFixed(2)} KB`);
    }, 2000);
  }
}

/**
 * Cache management for localStorage
 */
export class CacheManager {
  private static readonly MAX_CACHE_SIZE = 5 * 1024 * 1024; // 5MB
  private static readonly CACHE_PREFIX = 'casino_cache_';

  static set(key: string, value: any, ttl: number = 3600000) { // 1 hour default
    try {
      const item = {
        value,
        expiry: Date.now() + ttl
      };
      localStorage.setItem(this.CACHE_PREFIX + key, JSON.stringify(item));
      this.cleanupOldCache();
    } catch (e) {
      console.warn('Cache storage failed:', e);
    }
  }

  static get<T>(key: string): T | null {
    try {
      const itemStr = localStorage.getItem(this.CACHE_PREFIX + key);
      if (!itemStr) return null;

      const item = JSON.parse(itemStr);
      if (Date.now() > item.expiry) {
        localStorage.removeItem(this.CACHE_PREFIX + key);
        return null;
      }

      return item.value;
    } catch (e) {
      console.warn('Cache retrieval failed:', e);
      return null;
    }
  }

  static remove(key: string) {
    localStorage.removeItem(this.CACHE_PREFIX + key);
  }

  static clear() {
    Object.keys(localStorage)
      .filter(key => key.startsWith(this.CACHE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  }

  private static cleanupOldCache() {
    const keys = Object.keys(localStorage).filter(key => key.startsWith(this.CACHE_PREFIX));
    
    // Remove expired items
    keys.forEach(key => {
      try {
        const item = JSON.parse(localStorage.getItem(key) || '{}');
        if (item.expiry && Date.now() > item.expiry) {
          localStorage.removeItem(key);
        }
      } catch (e) {
        localStorage.removeItem(key);
      }
    });

    // Check total size and remove oldest if needed
    const totalSize = new Blob(Object.values(localStorage)).size;
    if (totalSize > this.MAX_CACHE_SIZE) {
      const cacheItems = keys
        .map(key => {
          try {
            const item = JSON.parse(localStorage.getItem(key) || '{}');
            return { key, expiry: item.expiry || 0 };
          } catch {
            return { key, expiry: 0 };
          }
        })
        .sort((a, b) => a.expiry - b.expiry);

      // Remove oldest 25%
      const removeCount = Math.ceil(cacheItems.length * 0.25);
      cacheItems.slice(0, removeCount).forEach(item => {
        localStorage.removeItem(item.key);
      });
    }
  }
}

/**
 * Web Vitals tracking
 */
export function trackWebVitals() {
  if (process.env.NODE_ENV === 'production') {
    // Track Largest Contentful Paint (LCP)
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as any;
      console.log('[Web Vitals] LCP:', lastEntry.renderTime || lastEntry.loadTime);
    });
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

    // Track First Input Delay (FID)
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        console.log('[Web Vitals] FID:', entry.processingStart - entry.startTime);
      });
    });
    fidObserver.observe({ entryTypes: ['first-input'] });

    // Track Cumulative Layout Shift (CLS)
    let clsScore = 0;
    const clsObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!(entry as any).hadRecentInput) {
          clsScore += (entry as any).value;
        }
      }
      console.log('[Web Vitals] CLS:', clsScore);
    });
    clsObserver.observe({ entryTypes: ['layout-shift'] });
  }
}
