import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { 
  Zap, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Gauge,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { 
  getCapacityStatus, 
  getOptimizationMode, 
  getOptimizationPotential,
  getCapacitySavings,
  getCurrentTierConfig,
  shouldDisableFeature
} from '../utils/capacityManager';

export function CapacityOptimizationPanel() {
  const [currentConnections, setCurrentConnections] = useState(0);
  const [queueLength, setQueueLength] = useState(0);
  const [optimizationsEnabled, setOptimizationsEnabled] = useState<string[]>([]);
  const [daysSinceOptimization, setDaysSinceOptimization] = useState(0);

  useEffect(() => {
    loadCapacityData();
    const interval = setInterval(loadCapacityData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadCapacityData = async () => {
    try {
      const response = await fetch('https://kckprtabirvtmhehnczg.supabase.co/functions/v1/make-server-67091a4f/capacity-status', {
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtja3BydGFiaXJ2dG1oZWhuY3pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQwOTY0NTcsImV4cCI6MjA3OTY3MjQ1N30.8WLhaDCjzs0QGgitJnUSzMgAJ2OyeUOp1l3t-TBNGcE`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentConnections(data.currentConnections || 0);
        setQueueLength(data.queueLength || 0);
        setOptimizationsEnabled(data.optimizationsEnabled || []);
        setDaysSinceOptimization(data.daysSinceOptimization || 0);
      }
    } catch (error) {
      console.error('Failed to load capacity data:', error);
    }
  };

  const config = getCurrentTierConfig();
  const status = getCapacityStatus(currentConnections);
  const mode = getOptimizationMode(status.capacityPercent);
  const potential = getOptimizationPotential(config.safeConcurrent, currentConnections);
  const savings = getCapacitySavings(config.tier, daysSinceOptimization);

  const getStatusColor = () => {
    if (status.capacityPercent >= 100) return 'text-red-500';
    if (status.capacityPercent >= 85) return 'text-orange-500';
    if (status.capacityPercent >= 70) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getStatusLabel = () => {
    if (status.capacityPercent >= 100) return 'AT CAPACITY';
    if (status.capacityPercent >= 85) return 'HEAVY LOAD';
    if (status.capacityPercent >= 70) return 'MODERATE LOAD';
    return 'NORMAL';
  };

  const optimizationFeatures = [
    {
      name: 'Connection Throttling',
      enabled: mode.enableThrottling,
      impact: '+10% capacity',
      description: 'Reduces update frequency from 60fps to 30fps',
    },
    {
      name: 'Graceful Degradation',
      enabled: mode.enableDegradation,
      impact: '+15% capacity',
      description: 'Disables non-essential animations and effects',
    },
    {
      name: 'Aggressive Caching',
      enabled: mode.aggressiveCaching,
      impact: '+5% capacity',
      description: 'Caches more data to reduce database load',
    },
    {
      name: 'Player Queue System',
      enabled: mode.enableQueue,
      impact: 'Unlimited',
      description: 'Players wait in queue when server full',
    },
    {
      name: 'Compression (Maximum)',
      enabled: mode.compressionLevel === 'maximum',
      impact: '+5% capacity',
      description: 'Maximum data compression for network efficiency',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="flex items-center gap-2">
          <Gauge className="size-5" />
          Capacity Optimization System
        </h2>
        <p className="text-muted-foreground">
          Squeeze more players from your current tier before upgrading
        </p>
      </div>

      {/* Current Status */}
      <Card className="p-6 border-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Current Load</div>
              <div className={`text-3xl font-bold ${getStatusColor()}`}>
                {status.capacityPercent.toFixed(1)}%
              </div>
            </div>
            <Badge 
              variant={status.capacityPercent >= 85 ? 'destructive' : 'default'}
              className="text-lg px-4 py-2"
            >
              {getStatusLabel()}
            </Badge>
          </div>

          <Progress 
            value={status.capacityPercent} 
            className={status.capacityPercent >= 85 ? 'bg-red-200' : 'bg-gray-200'}
          />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <div className="text-sm text-muted-foreground">Connected</div>
              <div className="text-xl font-bold">{currentConnections}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Safe Capacity</div>
              <div className="text-xl font-bold">{config.safeConcurrent}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Available</div>
              <div className="text-xl font-bold">{status.availableSlots}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">In Queue</div>
              <div className="text-xl font-bold">{queueLength}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Optimization Potential */}
      <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-500">
        <h3 className="flex items-center gap-2 mb-4">
          <TrendingUp className="size-5 text-green-600" />
          Optimization Potential
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-green-400">
            <div className="text-sm text-muted-foreground mb-1">With Throttling</div>
            <div className="text-2xl font-bold text-green-600">
              +{potential.withThrottling} players
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ~10% more capacity
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-green-400">
            <div className="text-sm text-muted-foreground mb-1">With Degradation</div>
            <div className="text-2xl font-bold text-green-600">
              +{potential.withDegradation} players
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ~15% more capacity
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border-2 border-green-400">
            <div className="text-sm text-muted-foreground mb-1">Total Potential</div>
            <div className="text-2xl font-bold text-green-600">
              +{potential.totalPotential} players
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ~25% more capacity
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-green-100 dark:bg-green-900/30 rounded-lg border border-green-400">
          <div className="flex items-start gap-2">
            <Zap className="size-5 text-green-600 mt-0.5" />
            <div className="text-sm">
              <strong className="text-green-700 dark:text-green-400">Optimization Active!</strong><br />
              <span className="text-green-600 dark:text-green-300">
                You can handle <strong>{config.safeConcurrent + potential.totalPotential}</strong> concurrent players 
                on your current tier before needing to upgrade!
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Money Saved */}
      {daysSinceOptimization > 0 && (
        <Card className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950 dark:to-amber-950 border-2 border-yellow-500">
          <h3 className="flex items-center gap-2 mb-4">
            <DollarSign className="size-5 text-yellow-600" />
            Cost Savings
          </h3>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 border-2 border-yellow-400">
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">Money Saved by Delaying Upgrade</div>
              <div className="text-5xl font-black text-yellow-600">
                ${savings.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                Over the past {daysSinceOptimization} days
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-400">
            <div className="text-sm text-yellow-700 dark:text-yellow-300">
              <strong>How?</strong> By using optimization techniques, you've delayed upgrading 
              to the next tier, saving ${(savings / daysSinceOptimization).toFixed(2)}/day!
            </div>
          </div>
        </Card>
      )}

      {/* Active Optimizations */}
      <Card className="p-6">
        <h3 className="flex items-center gap-2 mb-4">
          <Settings className="size-5" />
          Active Optimization Features
        </h3>

        <div className="space-y-3">
          {optimizationFeatures.map((feature, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-all ${
                feature.enabled
                  ? 'bg-green-50 dark:bg-green-950 border-green-500'
                  : 'bg-gray-50 dark:bg-gray-900 border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  {feature.enabled ? (
                    <CheckCircle className="size-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="size-5 text-gray-400 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="font-bold mb-1">{feature.name}</div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {feature.description}
                    </div>
                    {feature.enabled && (
                      <Badge variant="outline" className="text-xs">
                        {feature.impact} capacity boost
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge 
                  variant={feature.enabled ? 'default' : 'outline'}
                  className={feature.enabled ? 'bg-green-600' : ''}
                >
                  {feature.enabled ? 'ACTIVE' : 'INACTIVE'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recommendations */}
      {status.capacityPercent >= 70 && (
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 border-2 border-orange-500">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-6 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-bold text-orange-700 dark:text-orange-400 mb-2">
                Recommendations
              </h3>
              
              {status.capacityPercent >= 100 ? (
                <div className="space-y-2 text-sm">
                  <p className="text-orange-600 dark:text-orange-300">
                    🚨 <strong>AT CAPACITY!</strong> Players are entering a queue.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-orange-600 dark:text-orange-300 ml-4">
                    <li>Queue system is active - VIP members skip queue</li>
                    <li>All optimizations enabled - running at maximum</li>
                    <li><strong>Plan to upgrade soon</strong> - can't delay much longer</li>
                  </ul>
                </div>
              ) : status.capacityPercent >= 85 ? (
                <div className="space-y-2 text-sm">
                  <p className="text-orange-600 dark:text-orange-300">
                    ⚠️ <strong>HEAVY LOAD!</strong> Optimizations are active.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-orange-600 dark:text-orange-300 ml-4">
                    <li>Graceful degradation enabled - some effects disabled</li>
                    <li>Connection throttling active - 30fps mode</li>
                    <li>Monitor closely - upgrade if load stays high</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <p className="text-orange-600 dark:text-orange-300">
                    📊 <strong>MODERATE LOAD</strong> - Light optimizations active.
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-orange-600 dark:text-orange-300 ml-4">
                    <li>Connection throttling enabled - slight performance reduction</li>
                    <li>Aggressive caching active - less database load</li>
                    <li>Still room to grow - no urgent action needed</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Info */}
      <div className="text-xs text-center text-muted-foreground">
        Last updated: {new Date().toLocaleTimeString()} • Updates every 5 seconds
      </div>
    </div>
  );
}
