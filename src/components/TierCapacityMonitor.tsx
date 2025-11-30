import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Bell, TrendingUp, AlertTriangle, CheckCircle, DollarSign, Users, Activity, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface TierMetrics {
  registeredPlayers: number;
  concurrentPlayers: number;
  peakConcurrent: number;
  dailyActive: number;
  monthlyRevenue: number;
  averageResponseTime: number;
  errorRate: number;
  lastUpdated: Date;
}

interface TierCapacity {
  name: string;
  cost: number;
  maxConcurrent: number;
  safeCapacity: number;
  description: string;
  color: string;
}

const TIERS: TierCapacity[] = [
  {
    name: 'Free',
    cost: 0,
    maxConcurrent: 200,
    safeCapacity: 150,
    description: 'Testing & Early Launch',
    color: 'bg-gray-500'
  },
  {
    name: 'Pro',
    cost: 25,
    maxConcurrent: 700,
    safeCapacity: 500,
    description: 'Small Scale Launch',
    color: 'bg-blue-500'
  },
  {
    name: 'Pro + Redis',
    cost: 35,
    maxConcurrent: 1000,
    safeCapacity: 800,
    description: 'Medium Scale',
    color: 'bg-purple-500'
  },
  {
    name: 'Full Stack',
    cost: 50,
    maxConcurrent: 1500,
    safeCapacity: 1200,
    description: '1000+ Players Ready',
    color: 'bg-green-500'
  },
  {
    name: 'Enterprise',
    cost: 100,
    maxConcurrent: 4000,
    safeCapacity: 3000,
    description: '2000+ Players',
    color: 'bg-yellow-500'
  }
];

interface UpgradeAlert {
  level: 'info' | 'warning' | 'critical';
  title: string;
  message: string;
  recommendedTier: string;
  threshold: string;
  action: string;
}

export function TierCapacityMonitor() {
  const [metrics, setMetrics] = useState<TierMetrics>({
    registeredPlayers: 0,
    concurrentPlayers: 0,
    peakConcurrent: 0,
    dailyActive: 0,
    monthlyRevenue: 0,
    averageResponseTime: 0,
    errorRate: 0,
    lastUpdated: new Date()
  });

  const [currentTier, setCurrentTier] = useState<TierCapacity>(TIERS[0]);
  const [alerts, setAlerts] = useState<UpgradeAlert[]>([]);
  const [showAlerts, setShowAlerts] = useState(false);
  const [historicalData, setHistoricalData] = useState<any[]>([]);

  // Load metrics from server
  useEffect(() => {
    loadMetrics();
    const interval = setInterval(loadMetrics, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Check for upgrade alerts whenever metrics change
  useEffect(() => {
    checkUpgradeAlerts();
  }, [metrics, currentTier]);

  const loadMetrics = async () => {
    try {
      const response = await fetch('https://kckprtabirvtmhehnczg.supabase.co/functions/v1/make-server-67091a4f/tier-metrics', {
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtja3BydGFiaXJ2dG1oZWhuY3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTY0NTcsImV4cCI6MjA3OTY3MjQ1N30.8WLhaDCjzs0QGgitJnUSzMgAJ2OyeUOp1l3t-TBNGcE`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMetrics({
          ...data,
          lastUpdated: new Date()
        });
        
        // Store historical data
        setHistoricalData(prev => [...prev.slice(-100), {
          timestamp: new Date(),
          concurrent: data.concurrentPlayers,
          registered: data.registeredPlayers
        }]);
      }
    } catch (error) {
      console.error('Failed to load tier metrics:', error);
    }
  };

  const checkUpgradeAlerts = () => {
    const newAlerts: UpgradeAlert[] = [];
    const currentIndex = TIERS.findIndex(t => t.name === currentTier.name);
    const nextTier = TIERS[currentIndex + 1];

    // Calculate percentages
    const concurrentPercent = (metrics.concurrentPlayers / currentTier.safeCapacity) * 100;
    const peakPercent = (metrics.peakConcurrent / currentTier.safeCapacity) * 100;
    const registeredPercent = (metrics.registeredPlayers / (currentTier.safeCapacity * 10)) * 100; // Assuming 10:1 ratio

    // Critical: At or exceeding capacity
    if (metrics.concurrentPlayers >= currentTier.safeCapacity) {
      newAlerts.push({
        level: 'critical',
        title: '🚨 CRITICAL: Capacity Exceeded!',
        message: `You have ${metrics.concurrentPlayers} concurrent players, but your safe capacity is ${currentTier.safeCapacity}. Upgrade NOW to prevent performance issues!`,
        recommendedTier: nextTier?.name || 'Contact Support',
        threshold: '100% of safe capacity',
        action: 'UPGRADE IMMEDIATELY'
      });
    }
    // Warning: 80% capacity
    else if (concurrentPercent >= 80) {
      newAlerts.push({
        level: 'warning',
        title: '⚠️ WARNING: Approaching Capacity',
        message: `You're at ${concurrentPercent.toFixed(0)}% of safe capacity (${metrics.concurrentPlayers}/${currentTier.safeCapacity} concurrent players). Plan to upgrade soon.`,
        recommendedTier: nextTier?.name || 'Current tier sufficient',
        threshold: '80% of safe capacity',
        action: 'Plan upgrade in next 2-4 weeks'
      });
    }
    // Peak warning
    else if (metrics.peakConcurrent >= currentTier.safeCapacity * 0.9) {
      newAlerts.push({
        level: 'warning',
        title: '📊 Peak Traffic Warning',
        message: `Your peak concurrent players (${metrics.peakConcurrent}) is approaching capacity limits. Consider upgrading before next peak.`,
        recommendedTier: nextTier?.name || 'Current tier sufficient',
        threshold: '90% peak capacity',
        action: 'Monitor closely, prepare to upgrade'
      });
    }

    // Revenue-based upgrade recommendation
    const tierROI = (metrics.monthlyRevenue / currentTier.cost) * 100;
    const nextTierROI = nextTier ? (metrics.monthlyRevenue / nextTier.cost) * 100 : 0;

    if (nextTier && metrics.monthlyRevenue >= nextTier.cost * 5 && concurrentPercent >= 50) {
      newAlerts.push({
        level: 'info',
        title: '💰 ROI: Upgrade Justified!',
        message: `Your monthly revenue ($${metrics.monthlyRevenue}) is ${(metrics.monthlyRevenue / nextTier.cost).toFixed(1)}x the cost of ${nextTier.name} tier ($${nextTier.cost}). You can afford to upgrade for better scalability.`,
        recommendedTier: nextTier.name,
        threshold: `Revenue: $${nextTier.cost * 5}/month`,
        action: 'Upgrade when convenient'
      });
    }

    // Milestone achievements
    if (metrics.registeredPlayers >= 100 && currentTier.name === 'Free' && !alerts.some(a => a.title.includes('100 players'))) {
      newAlerts.push({
        level: 'info',
        title: '🎉 Milestone: 100 Registered Players!',
        message: `Congratulations! You've reached 100 registered players. Consider upgrading to Pro ($25/month) when you hit 200 registered players or 50 concurrent.`,
        recommendedTier: 'Pro',
        threshold: '100 registered players',
        action: 'Monitor growth, upgrade at 200 registered'
      });
    }

    if (metrics.registeredPlayers >= 500 && currentTier.name === 'Pro') {
      newAlerts.push({
        level: 'info',
        title: '🎯 Goal Progress: 500 Players!',
        message: `You're growing! 500 registered players achieved. Next milestone: Add Redis at 800 registered players.`,
        recommendedTier: 'Pro + Redis',
        threshold: '500 registered players',
        action: 'Plan upgrade at 800 registered'
      });
    }

    if (metrics.concurrentPlayers >= 1000) {
      newAlerts.push({
        level: 'info',
        title: '🏆 ACHIEVEMENT UNLOCKED: 1000 Concurrent Players!',
        message: `YOU DID IT! 1000 concurrent players! This is a massive success! Make sure you're on Full Stack tier ($50/month) minimum.`,
        recommendedTier: 'Full Stack or Enterprise',
        threshold: '1000 concurrent - THE GOAL!',
        action: 'CELEBRATE! 🎉'
      });
    }

    setAlerts(newAlerts);

    // Show toast notifications for critical/warning alerts
    newAlerts.forEach(alert => {
      if (alert.level === 'critical') {
        toast.error(alert.title, {
          description: alert.message,
          duration: 10000,
          action: {
            label: 'View Details',
            onClick: () => setShowAlerts(true)
          }
        });
      } else if (alert.level === 'warning' && !showAlerts) {
        toast.warning(alert.title, {
          description: alert.message,
          duration: 8000
        });
      }
    });
  };

  const getCurrentTierIndex = () => {
    return TIERS.findIndex(t => t.name === currentTier.name);
  };

  const getNextTier = () => {
    const currentIndex = getCurrentTierIndex();
    return TIERS[currentIndex + 1];
  };

  const calculateProgress = () => {
    return Math.min((metrics.concurrentPlayers / currentTier.safeCapacity) * 100, 100);
  };

  const getProgressColor = () => {
    const progress = calculateProgress();
    if (progress >= 100) return 'bg-red-500';
    if (progress >= 80) return 'bg-yellow-500';
    if (progress >= 60) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStatusBadge = () => {
    const progress = calculateProgress();
    if (progress >= 100) return { label: 'CRITICAL', color: 'destructive' };
    if (progress >= 80) return { label: 'WARNING', color: 'warning' };
    if (progress >= 60) return { label: 'MONITOR', color: 'default' };
    return { label: 'HEALTHY', color: 'success' };
  };

  const status = getStatusBadge();

  return (
    <div className="space-y-6">
      {/* Header with Alert Count */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="flex items-center gap-2">
            <Activity className="size-5" />
            Tier Capacity Monitor
          </h2>
          <p className="text-muted-foreground">
            Track your growth and know exactly when to upgrade
          </p>
        </div>
        
        {alerts.length > 0 && (
          <Button
            variant={alerts.some(a => a.level === 'critical') ? 'destructive' : 'default'}
            onClick={() => setShowAlerts(!showAlerts)}
            className="relative"
          >
            <Bell className="size-4 mr-2" />
            {alerts.length} Alert{alerts.length !== 1 ? 's' : ''}
            {alerts.some(a => a.level === 'critical') && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Current Status Card */}
      <Card className="p-6 border-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h3>Current Tier: {currentTier.name}</h3>
                <Badge variant={status.color as any}>{status.label}</Badge>
              </div>
              <p className="text-muted-foreground">{currentTier.description}</p>
            </div>
            <div className="text-right">
              <div className="text-muted-foreground">Monthly Cost</div>
              <div className="flex items-center gap-1">
                <DollarSign className="size-5" />
                <span>{currentTier.cost}/mo</span>
              </div>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="size-4" />
                Concurrent Players: {metrics.concurrentPlayers} / {currentTier.safeCapacity}
              </span>
              <span className={calculateProgress() >= 80 ? 'text-red-500 font-bold' : ''}>
                {calculateProgress().toFixed(1)}%
              </span>
            </div>
            <Progress value={calculateProgress()} className={getProgressColor()} />
            <div className="text-sm text-muted-foreground">
              Safe Capacity: {currentTier.safeCapacity} | Maximum: {currentTier.maxConcurrent}
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm text-muted-foreground">Registered</div>
              <div className="flex items-center gap-1">
                <Users className="size-4" />
                <span>{metrics.registeredPlayers}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Peak Concurrent</div>
              <div className="flex items-center gap-1">
                <TrendingUp className="size-4" />
                <span>{metrics.peakConcurrent}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Monthly Revenue</div>
              <div className="flex items-center gap-1">
                <DollarSign className="size-4" />
                <span>${metrics.monthlyRevenue}</span>
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Daily Active</div>
              <div className="flex items-center gap-1">
                <Activity className="size-4" />
                <span>{metrics.dailyActive}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Alerts Section */}
      {showAlerts && alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2">
            <AlertTriangle className="size-5" />
            Active Alerts & Recommendations
          </h3>
          {alerts.map((alert, index) => (
            <Card 
              key={index}
              className={`p-4 border-l-4 ${
                alert.level === 'critical' ? 'border-l-red-500 bg-red-50 dark:bg-red-950' :
                alert.level === 'warning' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950' :
                'border-l-blue-500 bg-blue-50 dark:bg-blue-950'
              }`}
            >
              <div className="space-y-2">
                <div className="font-bold">{alert.title}</div>
                <p>{alert.message}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm pt-2 border-t">
                  <div>
                    <span className="text-muted-foreground">Threshold: </span>
                    <span className="font-medium">{alert.threshold}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recommended: </span>
                    <span className="font-medium">{alert.recommendedTier}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Action: </span>
                    <span className="font-medium">{alert.action}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Upgrade Path */}
      <Card className="p-6">
        <h3 className="mb-4 flex items-center gap-2">
          <Zap className="size-5" />
          Your Path to 1000 Concurrent Players
        </h3>
        <div className="space-y-3">
          {TIERS.map((tier, index) => {
            const isCurrentTier = tier.name === currentTier.name;
            const isPastTier = index < getCurrentTierIndex();
            const isNextTier = index === getCurrentTierIndex() + 1;
            
            return (
              <div
                key={tier.name}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCurrentTier ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' :
                  isPastTier ? 'border-gray-300 opacity-50' :
                  isNextTier ? 'border-green-500' :
                  'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                      <span className="font-bold">{tier.name}</span>
                      {isCurrentTier && <Badge>CURRENT</Badge>}
                      {isNextTier && <Badge variant="outline">NEXT</Badge>}
                      {isPastTier && <CheckCircle className="size-4 text-green-500" />}
                    </div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {tier.description} • {tier.safeCapacity} safe / {tier.maxConcurrent} max concurrent
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">${tier.cost}/mo</div>
                    {isNextTier && metrics.monthlyRevenue >= tier.cost * 2 && (
                      <div className="text-xs text-green-600">✓ ROI Positive</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Quick Stats */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <div className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">Progress to Goal: 1000 Concurrent Players</div>
          <div className="text-3xl font-bold">
            {((metrics.concurrentPlayers / 1000) * 100).toFixed(1)}%
          </div>
          <Progress value={(metrics.concurrentPlayers / 1000) * 100} className="bg-white dark:bg-gray-800" />
          <div className="text-sm">
            {metrics.concurrentPlayers} / 1,000 concurrent players
          </div>
          {metrics.concurrentPlayers >= 1000 && (
            <div className="text-2xl animate-bounce">
              🎉 GOAL ACHIEVED! 🎉
            </div>
          )}
        </div>
      </Card>

      {/* Last Updated */}
      <div className="text-xs text-center text-muted-foreground">
        Last updated: {metrics.lastUpdated.toLocaleString()}
      </div>
    </div>
  );
}
