import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Users, Clock, Zap, Crown, TrendingDown } from 'lucide-react';
import { Progress } from './ui/progress';

interface QueuePosition {
  position: number;
  estimatedWaitTime: number;
  totalInQueue: number;
  currentCapacity: number;
  maxCapacity: number;
  hasPriority: boolean;
}

interface CapacityQueueScreenProps {
  queuePosition: QueuePosition | null;
  onRetry: () => void;
  onUpgradeToVIP: () => void;
  userEmail: string;
  isVIP: boolean;
}

export function CapacityQueueScreen({
  queuePosition,
  onRetry,
  onUpgradeToVIP,
  userEmail,
  isVIP
}: CapacityQueueScreenProps) {
  const [countdown, setCountdown] = useState(30);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  useEffect(() => {
    // Auto-retry countdown
    if (!queuePosition) return;
    
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onRetry();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [queuePosition, onRetry]);

  useEffect(() => {
    // Show upgrade prompt after 30 seconds if not VIP
    if (!isVIP && queuePosition && queuePosition.position > 5) {
      const timer = setTimeout(() => {
        setShowUpgradePrompt(true);
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [isVIP, queuePosition]);

  if (!queuePosition) return null;

  const capacityPercent = (queuePosition.currentCapacity / queuePosition.maxCapacity) * 100;
  const estimatedMinutes = Math.ceil(queuePosition.estimatedWaitTime / 60);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-red-900/95 via-orange-900/95 to-yellow-900/95 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full p-8 bg-gray-900 border-4 border-orange-500 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-4 mb-8">
          <div className="flex justify-center">
            <div className="relative">
              <Users className="w-20 h-20 text-orange-500 animate-pulse" />
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                {queuePosition.totalInQueue}
              </div>
            </div>
          </div>
          
          <h2 className="text-white text-4xl font-black uppercase tracking-wider">
            🎲 Server At Capacity
          </h2>
          
          <p className="text-orange-200 text-lg">
            Rollers Paradise is experiencing high player volume!
          </p>
        </div>

        {/* Capacity Status */}
        <div className="space-y-4 mb-8">
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-6 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-white font-bold">Current Server Load</span>
              <Badge variant="destructive" className="text-lg px-3 py-1">
                {capacityPercent.toFixed(0)}% FULL
              </Badge>
            </div>
            <Progress value={capacityPercent} className="h-4 bg-white/20" />
            <div className="text-white/90 text-sm mt-2">
              {queuePosition.currentCapacity} / {queuePosition.maxCapacity} players online
            </div>
          </div>

          {/* Queue Position */}
          {queuePosition.hasPriority ? (
            <div className="bg-gradient-to-r from-yellow-600 to-amber-600 p-6 rounded-xl border-2 border-yellow-400">
              <div className="flex items-center gap-3 mb-3">
                <Crown className="w-8 h-8 text-yellow-200" />
                <div>
                  <div className="text-white font-bold text-xl">VIP Priority Access</div>
                  <div className="text-yellow-100 text-sm">You're at the front of the queue!</div>
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-4">
                <div className="text-yellow-100 text-sm mb-2">Priority Position</div>
                <div className="text-white text-4xl font-black">
                  #{queuePosition.position}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800 p-6 rounded-xl border-2 border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-white font-bold text-xl">Your Queue Position</div>
                  <div className="text-gray-400 text-sm">{queuePosition.totalInQueue} players waiting</div>
                </div>
                <div className="text-right">
                  <div className="text-white text-5xl font-black">
                    #{queuePosition.position}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-gray-300">
                <Clock className="w-5 h-5" />
                <span>Estimated wait: <strong className="text-white">{estimatedMinutes} minute{estimatedMinutes !== 1 ? 's' : ''}</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Auto-retry countdown */}
        <div className="bg-blue-900/50 border-2 border-blue-500 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-400" />
              <span className="text-blue-200">Auto-checking for available slot...</span>
            </div>
            <Badge variant="outline" className="text-blue-300 border-blue-400">
              {countdown}s
            </Badge>
          </div>
          <Progress value={(countdown / 30) * 100} className="h-2 mt-2 bg-blue-950" />
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onRetry}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-6 text-lg font-bold"
            size="lg"
          >
            <Zap className="w-5 h-5 mr-2" />
            Try to Connect Now
          </Button>

          {!isVIP && (showUpgradePrompt || queuePosition.position > 10) && (
            <Button
              onClick={onUpgradeToVIP}
              className="w-full bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white py-6 text-lg font-bold border-2 border-yellow-400 animate-pulse"
              size="lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              Skip Queue with VIP Membership
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full border-2 border-gray-600 text-gray-300 hover:bg-gray-800 py-4"
          >
            Refresh Page
          </Button>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <TrendingDown className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="text-sm text-gray-400">
              <strong className="text-white">Why am I seeing this?</strong><br />
              Our servers are currently at maximum capacity to ensure the best experience for all players. 
              {isVIP ? (
                <span className="text-yellow-400"> As a VIP member, you have priority access and will connect soon!</span>
              ) : (
                <span> We're adding more players as soon as slots become available.</span>
              )}
            </div>
          </div>
        </div>

        {/* Tips while waiting */}
        {!queuePosition.hasPriority && queuePosition.position > 5 && (
          <div className="mt-4 bg-purple-900/30 border border-purple-600 rounded-lg p-4">
            <div className="text-purple-200 font-bold mb-2">💡 Pro Tips While You Wait:</div>
            <ul className="text-purple-300 text-sm space-y-1 list-disc list-inside">
              <li>VIP members get instant priority access</li>
              <li>Off-peak hours (late night/early morning) have shorter waits</li>
              <li>The page will auto-retry every 30 seconds</li>
              <li>Keep this tab open - you won't lose your position!</li>
            </ul>
          </div>
        )}
      </Card>
    </div>
  );
}
