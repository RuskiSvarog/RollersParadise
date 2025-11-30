/**
 * LOAD TESTING DASHBOARD
 * Real-time monitoring of system performance under load
 * Developer: Ruski (avgelatt@gmail.com, 913-213-8666)
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Activity, Users, Database, Zap, AlertCircle, CheckCircle, TrendingUp, Server } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface PerformanceStats {
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
    size: number;
  };
  sse: {
    totalClients: number;
    channels: Record<string, number>;
  };
  timestamp: number;
}

interface SystemMetrics {
  playersOnline: number;
  totalGames: number;
  totalJackpot: number;
  responseTime: number;
}

export function LoadTestingDashboard() {
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [errorRate, setErrorRate] = useState(0);
  const [avgResponseTime, setAvgResponseTime] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);

  // Fetch performance stats
  const fetchPerformanceStats = async () => {
    const startTime = Date.now();
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/performance/stats`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      setPerformanceStats(data);
      setAvgResponseTime(prev => prev === 0 ? responseTime : (prev + responseTime) / 2);
      setRequestCount(prev => prev + 1);
    } catch (error) {
      console.error('Performance stats error:', error);
      setErrors(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${error}`]);
      setErrorRate(prev => prev + 1);
    }
  };

  // Fetch system metrics
  const fetchSystemMetrics = async () => {
    const startTime = Date.now();
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-67091a4f/stats`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;
      
      setSystemMetrics({ ...data, responseTime });
      setRequestCount(prev => prev + 1);
    } catch (error) {
      console.error('System metrics error:', error);
      setErrors(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${error}`]);
      setErrorRate(prev => prev + 1);
    }
  };

  // Start monitoring
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      fetchPerformanceStats();
      fetchSystemMetrics();
    }, 5000); // Every 5 seconds

    // Initial fetch
    fetchPerformanceStats();
    fetchSystemMetrics();

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const getHealthStatus = () => {
    const errorPercentage = requestCount > 0 ? (errorRate / requestCount) * 100 : 0;
    if (errorPercentage > 5) return { status: 'critical', color: 'red', label: 'CRITICAL' };
    if (errorPercentage > 1) return { status: 'warning', color: 'yellow', label: 'WARNING' };
    if (avgResponseTime > 2000) return { status: 'warning', color: 'yellow', label: 'SLOW' };
    return { status: 'healthy', color: 'green', label: 'HEALTHY' };
  };

  const health = getHealthStatus();
  const errorPercentage = requestCount > 0 ? (errorRate / requestCount) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="flex items-center gap-3">
              <Activity className="w-8 h-8" />
              Load Testing Dashboard
            </h1>
            <p className="text-purple-200 mt-2">
              Real-time performance monitoring for Rollers Paradise
            </p>
          </div>
          
          <Button
            onClick={() => setIsMonitoring(!isMonitoring)}
            variant={isMonitoring ? "destructive" : "default"}
            size="lg"
          >
            {isMonitoring ? 'Stop Monitoring' : 'Start Monitoring'}
          </Button>
        </div>

        {/* Health Status */}
        <Card className="border-2" style={{ borderColor: health.color }}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {health.status === 'healthy' ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-yellow-500" />
                )}
                System Health
              </span>
              <Badge
                variant={health.status === 'healthy' ? 'default' : 'destructive'}
                className="text-lg px-4 py-2"
              >
                {health.label}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-400 mb-1">Avg Response Time</p>
                <p className="text-2xl">{avgResponseTime.toFixed(0)}ms</p>
                <Progress 
                  value={Math.min((avgResponseTime / 2000) * 100, 100)} 
                  className="mt-2"
                />
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-1">Error Rate</p>
                <p className="text-2xl">{errorPercentage.toFixed(2)}%</p>
                <Progress 
                  value={Math.min((errorPercentage / 5) * 100, 100)} 
                  className="mt-2"
                />
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-1">Total Requests</p>
                <p className="text-2xl">{requestCount}</p>
              </div>
              
              <div>
                <p className="text-sm text-gray-400 mb-1">Failed Requests</p>
                <p className="text-2xl text-red-400">{errorRate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Metrics */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Players Online
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl">{systemMetrics?.playersOnline || 0}</p>
              {systemMetrics && (
                <p className="text-sm text-gray-400 mt-2">
                  Response: {systemMetrics.responseTime}ms
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Total Games
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl">{systemMetrics?.totalGames || 0}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Total Jackpot
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl">${systemMetrics?.totalJackpot || 0}</p>
            </CardContent>
          </Card>
        </div>

        {/* Cache Performance */}
        {performanceStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Cache Performance
              </CardTitle>
              <CardDescription>
                Server-side caching reduces database load
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Cache Hit Rate</p>
                  <p className="text-3xl text-green-400">
                    {(performanceStats.cache.hitRate * 100).toFixed(1)}%
                  </p>
                  <Progress 
                    value={performanceStats.cache.hitRate * 100} 
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Cache Hits</p>
                  <p className="text-3xl">{performanceStats.cache.hits}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Cache Misses</p>
                  <p className="text-3xl">{performanceStats.cache.misses}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-400 mb-1">Cache Size</p>
                  <p className="text-3xl">{performanceStats.cache.size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SSE Connections */}
        {performanceStats && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                SSE Connections
              </CardTitle>
              <CardDescription>
                Real-time Server-Sent Events connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Active Connections</p>
                  <p className="text-4xl">{performanceStats.sse.totalClients}</p>
                </div>
                
                <div className="grid md:grid-cols-4 gap-4">
                  {Object.entries(performanceStats.sse.channels).map(([channel, count]) => (
                    <div key={channel} className="bg-gray-800 rounded-lg p-4">
                      <p className="text-sm text-gray-400">{channel}</p>
                      <p className="text-2xl">{count} clients</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Errors */}
        {errors.length > 0 && (
          <Card className="border-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-5 h-5" />
                Recent Errors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-300 bg-red-900/20 p-2 rounded">
                    {error}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>How to Run Load Tests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="mb-2">1. Install Artillery (if not installed):</p>
              <code className="block bg-gray-800 p-3 rounded">
                npm install -g artillery
              </code>
            </div>
            
            <div>
              <p className="mb-2">2. Set environment variables:</p>
              <code className="block bg-gray-800 p-3 rounded">
                export SUPABASE_PROJECT_ID="{projectId}"<br/>
                export SUPABASE_ANON_KEY="{publicAnonKey.substring(0, 20)}..."
              </code>
            </div>
            
            <div>
              <p className="mb-2">3. Run a test:</p>
              <code className="block bg-gray-800 p-3 rounded">
                # Simple test (50 players)<br/>
                artillery run load-testing/simple-test.yml<br/>
                <br/>
                # Stress test (up to 1000 players)<br/>
                artillery run load-testing/stress-test.yml<br/>
                <br/>
                # SSE connection test<br/>
                artillery run load-testing/sse-test.yml
              </code>
            </div>
            
            <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
              <p className="text-blue-300">
                💡 <strong>Pro Tip:</strong> Keep this dashboard open while running load tests to see real-time metrics!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
