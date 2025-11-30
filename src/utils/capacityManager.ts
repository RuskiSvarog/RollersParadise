/**
 * CAPACITY MANAGEMENT SYSTEM
 * 
 * Intelligently manages server capacity to maximize players per tier
 * and delay expensive infrastructure upgrades as long as possible.
 */

export interface CapacityConfig {
  tier: 'free' | 'pro' | 'pro-redis' | 'full-stack' | 'enterprise';
  maxConcurrent: number;
  safeConcurrent: number;
  prioritySlots: number; // Reserved for VIP/paying members
}

export interface CapacityStatus {
  currentLoad: number;
  maxCapacity: number;
  safeCapacity: number;
  availableSlots: number;
  prioritySlots: number;
  queueLength: number;
  capacityPercent: number;
  shouldEnableQueue: boolean;
  shouldEnableDegradation: boolean;
  shouldThrottle: boolean;
}

export interface OptimizationMode {
  enableQueue: boolean;
  enableDegradation: boolean;
  enableThrottling: boolean;
  disableAnimations: boolean;
  reducedUpdateFrequency: boolean;
  aggressiveCaching: boolean;
  compressionLevel: 'normal' | 'high' | 'maximum';
}

// Tier configurations
export const TIER_CONFIGS: Record<string, CapacityConfig> = {
  free: {
    tier: 'free',
    maxConcurrent: 200,
    safeConcurrent: 150,
    prioritySlots: 20, // 20 slots for VIP members
  },
  pro: {
    tier: 'pro',
    maxConcurrent: 700,
    safeConcurrent: 500,
    prioritySlots: 50,
  },
  'pro-redis': {
    tier: 'pro-redis',
    maxConcurrent: 1000,
    safeConcurrent: 800,
    prioritySlots: 100,
  },
  'full-stack': {
    tier: 'full-stack',
    maxConcurrent: 1500,
    safeConcurrent: 1200,
    prioritySlots: 150,
  },
  enterprise: {
    tier: 'enterprise',
    maxConcurrent: 4000,
    safeConcurrent: 3000,
    prioritySlots: 400,
  },
};

/**
 * Get current tier configuration from environment or default to free
 */
export function getCurrentTierConfig(): CapacityConfig {
  const tier = (process.env.NEXT_PUBLIC_TIER || 'free') as keyof typeof TIER_CONFIGS;
  return TIER_CONFIGS[tier] || TIER_CONFIGS.free;
}

/**
 * Calculate current capacity status
 */
export function getCapacityStatus(currentConnections: number): CapacityStatus {
  const config = getCurrentTierConfig();
  
  const capacityPercent = (currentConnections / config.safeConcurrent) * 100;
  const availableSlots = Math.max(0, config.maxConcurrent - currentConnections);
  const queueLength = Math.max(0, currentConnections - config.maxConcurrent);
  
  return {
    currentLoad: currentConnections,
    maxCapacity: config.maxConcurrent,
    safeCapacity: config.safeConcurrent,
    availableSlots,
    prioritySlots: config.prioritySlots,
    queueLength,
    capacityPercent,
    shouldEnableQueue: currentConnections >= config.maxConcurrent,
    shouldEnableDegradation: capacityPercent >= 80,
    shouldThrottle: capacityPercent >= 70,
  };
}

/**
 * Determine optimization mode based on capacity
 */
export function getOptimizationMode(capacityPercent: number): OptimizationMode {
  // Normal operation (0-70%)
  if (capacityPercent < 70) {
    return {
      enableQueue: false,
      enableDegradation: false,
      enableThrottling: false,
      disableAnimations: false,
      reducedUpdateFrequency: false,
      aggressiveCaching: false,
      compressionLevel: 'normal',
    };
  }
  
  // Light optimization (70-85%)
  if (capacityPercent < 85) {
    return {
      enableQueue: false,
      enableDegradation: false,
      enableThrottling: true,
      disableAnimations: false,
      reducedUpdateFrequency: true, // Reduce from 60fps to 30fps
      aggressiveCaching: true,
      compressionLevel: 'high',
    };
  }
  
  // Heavy optimization (85-100%)
  if (capacityPercent < 100) {
    return {
      enableQueue: false,
      enableDegradation: true,
      enableThrottling: true,
      disableAnimations: true, // Disable non-essential animations
      reducedUpdateFrequency: true, // 30fps or lower
      aggressiveCaching: true,
      compressionLevel: 'maximum',
    };
  }
  
  // Queue mode (100%+)
  return {
    enableQueue: true,
    enableDegradation: true,
    enableThrottling: true,
    disableAnimations: true,
    reducedUpdateFrequency: true,
    aggressiveCaching: true,
    compressionLevel: 'maximum',
  };
}

/**
 * Check if user has priority access (VIP, paying member, etc.)
 */
export function hasPriorityAccess(
  userEmail: string,
  membershipStatus?: any,
  vipStatus?: any
): boolean {
  // Owner always has priority
  if (userEmail === 'avgelatt@gmail.com') return true;
  
  // VIP members have priority
  if (vipStatus?.isActive) return true;
  
  // Platinum and Diamond members have priority
  if (membershipStatus?.tier === 'platinum' || membershipStatus?.tier === 'diamond') {
    return true;
  }
  
  return false;
}

/**
 * Calculate queue position and estimated wait time
 */
export function calculateQueuePosition(
  currentConnections: number,
  queuedUsers: Array<{ email: string; timestamp: number; hasPriority: boolean }>,
  userEmail: string
): { position: number; estimatedWaitTime: number } {
  const user = queuedUsers.find(u => u.email === userEmail);
  if (!user) {
    return { position: queuedUsers.length + 1, estimatedWaitTime: 300 };
  }
  
  // Priority users go to front of queue
  if (user.hasPriority) {
    const priorityQueue = queuedUsers.filter(u => u.hasPriority);
    const position = priorityQueue.findIndex(u => u.email === userEmail) + 1;
    
    // Priority users wait much less - assume 5 seconds per position
    return { position, estimatedWaitTime: position * 5 };
  }
  
  // Regular users - account for priority users ahead
  const priorityAhead = queuedUsers.filter(u => u.hasPriority).length;
  const regularQueue = queuedUsers.filter(u => !u.hasPriority);
  const position = regularQueue.findIndex(u => u.email === userEmail) + 1 + priorityAhead;
  
  // Regular users wait longer - assume 30 seconds per position
  return { position, estimatedWaitTime: position * 30 };
}

/**
 * Clean up stale connections aggressively
 */
export function getStaleConnectionThreshold(capacityPercent: number): number {
  // Normal: 5 minutes of inactivity
  if (capacityPercent < 70) return 5 * 60 * 1000;
  
  // Busy: 3 minutes of inactivity
  if (capacityPercent < 85) return 3 * 60 * 1000;
  
  // Very busy: 1 minute of inactivity
  return 1 * 60 * 1000;
}

/**
 * Get update frequency based on capacity
 */
export function getUpdateFrequency(capacityPercent: number): number {
  // Normal: 60 updates per second (every 16ms)
  if (capacityPercent < 70) return 16;
  
  // Busy: 30 updates per second (every 33ms)
  if (capacityPercent < 85) return 33;
  
  // Very busy: 15 updates per second (every 66ms)
  return 66;
}

/**
 * Get SSE update interval based on capacity
 */
export function getSSEUpdateInterval(capacityPercent: number): number {
  // Normal: Every 1 second
  if (capacityPercent < 70) return 1000;
  
  // Busy: Every 2 seconds
  if (capacityPercent < 85) return 2000;
  
  // Very busy: Every 5 seconds
  return 5000;
}

/**
 * Determine if feature should be disabled based on capacity
 */
export function shouldDisableFeature(
  feature: 'animations' | 'particles' | 'sound-effects' | 'voice-chat' | '3d-effects',
  capacityPercent: number
): boolean {
  const disableThresholds: Record<string, number> = {
    'animations': 95,      // Disable at 95%
    'particles': 90,       // Disable at 90%
    'sound-effects': 100,  // Never disable (too important)
    'voice-chat': 100,     // Never disable (core feature)
    '3d-effects': 85,      // Disable at 85%
  };
  
  return capacityPercent >= disableThresholds[feature];
}

/**
 * Calculate how many more players can be squeezed out with optimizations
 */
export function getOptimizationPotential(
  currentCapacity: number,
  currentConnections: number
): {
  withThrottling: number;
  withDegradation: number;
  withQueue: number;
  totalPotential: number;
} {
  const baseRoom = currentCapacity - currentConnections;
  
  return {
    // Throttling: ~10% more capacity
    withThrottling: Math.floor(currentCapacity * 0.10),
    
    // Degradation: ~15% more capacity
    withDegradation: Math.floor(currentCapacity * 0.15),
    
    // Queue: Can handle unlimited (but with wait times)
    withQueue: 999999,
    
    // Total without queue: ~25% more capacity
    totalPotential: Math.floor(currentCapacity * 0.25),
  };
}

/**
 * Get capacity savings estimate ($ saved by delaying upgrade)
 */
export function getCapacitySavings(
  currentTier: string,
  daysDelayed: number
): number {
  const tierCosts: Record<string, number> = {
    free: 0,
    pro: 25,
    'pro-redis': 35,
    'full-stack': 50,
    enterprise: 100,
  };
  
  const nextTierCosts: Record<string, string> = {
    free: 'pro',
    pro: 'pro-redis',
    'pro-redis': 'full-stack',
    'full-stack': 'enterprise',
    enterprise: 'enterprise',
  };
  
  const currentCost = tierCosts[currentTier] || 0;
  const nextTier = nextTierCosts[currentTier];
  const nextCost = tierCosts[nextTier] || currentCost;
  const monthlySavings = nextCost - currentCost;
  
  return (monthlySavings / 30) * daysDelayed;
}

/**
 * Storage key for capacity metrics
 */
const CAPACITY_METRICS_KEY = 'rollers-paradise-capacity-metrics';

export interface CapacityMetrics {
  timestamp: number;
  connections: number;
  queueLength: number;
  capacityPercent: number;
  optimizationsEnabled: string[];
}

/**
 * Log capacity metrics for analysis
 */
export function logCapacityMetrics(metrics: CapacityMetrics): void {
  try {
    const stored = localStorage.getItem(CAPACITY_METRICS_KEY);
    const history: CapacityMetrics[] = stored ? JSON.parse(stored) : [];
    
    history.push(metrics);
    
    // Keep last 1000 entries
    if (history.length > 1000) {
      history.shift();
    }
    
    localStorage.setItem(CAPACITY_METRICS_KEY, JSON.stringify(history));
  } catch (error) {
    console.error('Failed to log capacity metrics:', error);
  }
}

/**
 * Get capacity metrics history
 */
export function getCapacityMetricsHistory(): CapacityMetrics[] {
  try {
    const stored = localStorage.getItem(CAPACITY_METRICS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get capacity metrics:', error);
    return [];
  }
}
