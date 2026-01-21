'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Activity,
  Server,
  Database,
  Globe,
  CreditCard,
  Mail,
  Shield,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  Zap,
} from 'lucide-react';

interface ServiceHealth {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  latency: number;
  uptime: number;
  lastChecked: string;
  icon: any;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  activeConnections: number;
  requestsPerMinute: number;
  avgResponseTime: number;
  errorRate: number;
}

export default function AdminSystemPage() {
  const [services, setServices] = useState<ServiceHealth[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      // In production, this would call actual health endpoints
      // For demo, using mock data
      setServices([
        { name: 'API Server', status: 'operational', latency: 45, uptime: 99.98, lastChecked: 'Just now', icon: Server },
        { name: 'Database', status: 'operational', latency: 12, uptime: 99.99, lastChecked: 'Just now', icon: Database },
        { name: 'Blockchain Node', status: 'operational', latency: 230, uptime: 99.95, lastChecked: 'Just now', icon: Globe },
        { name: 'Payment Gateway', status: 'operational', latency: 89, uptime: 99.97, lastChecked: 'Just now', icon: CreditCard },
        { name: 'Email Service', status: 'operational', latency: 156, uptime: 99.90, lastChecked: 'Just now', icon: Mail },
        { name: 'Authentication', status: 'operational', latency: 34, uptime: 99.99, lastChecked: 'Just now', icon: Shield },
      ]);

      setMetrics({
        cpu: 42,
        memory: 68,
        disk: 54,
        network: 23,
        activeConnections: 1247,
        requestsPerMinute: 3420,
        avgResponseTime: 89,
        errorRate: 0.12,
      });
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSystemHealth();
    setRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'down':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-slate-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge className="bg-green-500/20 text-green-400">Operational</Badge>;
      case 'degraded':
        return <Badge className="bg-yellow-500/20 text-yellow-400">Degraded</Badge>;
      case 'down':
        return <Badge className="bg-red-500/20 text-red-400">Down</Badge>;
      default:
        return <Badge className="bg-slate-500/20 text-slate-400">Unknown</Badge>;
    }
  };

  const allOperational = services.every(s => s.status === 'operational');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Monitoring</h1>
          <p className="text-slate-400">Real-time platform health and performance</p>
        </div>
        <div className="flex items-center gap-4">
          {allOperational ? (
            <Badge className="bg-green-500/20 text-green-400 text-sm px-3 py-1">
              <CheckCircle className="mr-2 h-4 w-4" />
              All Systems Operational
            </Badge>
          ) : (
            <Badge className="bg-yellow-500/20 text-yellow-400 text-sm px-3 py-1">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Some Issues Detected
            </Badge>
          )}
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={refreshing}
            className="border-slate-600 text-slate-300"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Resource Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-slate-400">CPU Usage</span>
              </div>
              <span className="text-lg font-bold text-white">{metrics?.cpu}%</span>
            </div>
            <Progress value={metrics?.cpu} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <HardDrive className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-slate-400">Memory</span>
              </div>
              <span className="text-lg font-bold text-white">{metrics?.memory}%</span>
            </div>
            <Progress value={metrics?.memory} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-green-400" />
                <span className="text-sm text-slate-400">Disk</span>
              </div>
              <span className="text-lg font-bold text-white">{metrics?.disk}%</span>
            </div>
            <Progress value={metrics?.disk} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wifi className="h-4 w-4 text-cyan-400" />
                <span className="text-sm text-slate-400">Network</span>
              </div>
              <span className="text-lg font-bold text-white">{metrics?.network}%</span>
            </div>
            <Progress value={metrics?.network} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Performance Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Active Connections</p>
                <p className="text-xl font-bold text-white">{metrics?.activeConnections.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Requests/min</p>
                <p className="text-xl font-bold text-white">{metrics?.requestsPerMinute.toLocaleString()}</p>
              </div>
              <Zap className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Avg Response Time</p>
                <p className="text-xl font-bold text-white">{metrics?.avgResponseTime}ms</p>
              </div>
              <Clock className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Error Rate</p>
                <p className="text-xl font-bold text-green-400">{metrics?.errorRate}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Health */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Service Health</CardTitle>
          <CardDescription className="text-slate-400">
            Status of all platform services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {services.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between p-4 rounded-lg bg-slate-900"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-slate-800">
                    <service.icon className="h-5 w-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{service.name}</p>
                    <p className="text-sm text-slate-500">Last checked: {service.lastChecked}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Latency</p>
                    <p className="font-medium text-white">{service.latency}ms</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">Uptime</p>
                    <p className="font-medium text-green-400">{service.uptime}%</p>
                  </div>
                  {getStatusBadge(service.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Incidents */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Recent Incidents</CardTitle>
          <CardDescription className="text-slate-400">
            Last 7 days incident history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-center py-8 text-slate-500">
              <CheckCircle className="h-8 w-8 mr-3 text-green-500" />
              <span>No incidents in the last 7 days</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
