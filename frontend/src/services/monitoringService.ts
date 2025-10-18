import apiClient from './apiClient';

// Types for system monitoring
export interface HealthCheck {
  id: string;
  name: string;
  type: 'service' | 'database' | 'api' | 'network' | 'security' | 'storage';
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  responseTime: number;
  lastCheck: string;
  uptime: number;
  description: string;
  endpoint?: string;
  dependencies: string[];
  metrics: {
    cpu: number;
    memory: number;
    disk: number;
    network: number;
  };
  errors: HealthError[];
}

export interface HealthError {
  id: string;
  type: 'timeout' | 'connection' | 'authentication' | 'permission' | 'resource' | 'configuration';
  message: string;
  timestamp: string;
  resolved: boolean;
  resolvedAt?: string;
}

export interface SystemMetric {
  name: string;
  current: number;
  previous: number;
  unit: string;
  status: 'normal' | 'warning' | 'critical';
  threshold: {
    warning: number;
    critical: number;
  };
  trend: 'up' | 'down' | 'stable';
  history: Array<{
    timestamp: string;
    value: number;
  }>;
}

export interface Alert {
  id: string;
  type: 'performance' | 'security' | 'availability' | 'capacity' | 'error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  component: string;
  timestamp: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved: boolean;
  resolvedAt?: string;
  metrics?: {
    current: number;
    threshold: number;
    unit: string;
  };
}

export interface SystemStatus {
  overall: 'healthy' | 'degraded' | 'critical';
  healthyServices: number;
  totalServices: number;
  activeAlerts: number;
  lastUpdated: string;
}

export const monitoringService = {
  // Get system health checks
  async getHealthChecks(): Promise<HealthCheck[]> {
    try {
      // In the future, this would call a real API endpoint
      // const response = await apiClient.get('/api/monitoring/health');
      // return response.data;

      // For now, return realistic simulated data
      return this.generateSimulatedHealthChecks();
    } catch (error) {
      console.error('Failed to fetch health checks:', error);
      return [];
    }
  },

  // Get system metrics
  async getSystemMetrics(): Promise<SystemMetric[]> {
    try {
      // In the future, this would call a real API endpoint
      // const response = await apiClient.get('/api/monitoring/metrics');
      // return response.data;

      // For now, return realistic simulated data
      return this.generateSimulatedMetrics();
    } catch (error) {
      console.error('Failed to fetch system metrics:', error);
      return [];
    }
  },

  // Get alerts
  async getAlerts(): Promise<Alert[]> {
    try {
      // In the future, this would call a real API endpoint
      // const response = await apiClient.get('/api/monitoring/alerts');
      // return response.data;

      // For now, return realistic simulated data
      return this.generateSimulatedAlerts();
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
      return [];
    }
  },

  // Get overall system status
  async getSystemStatus(): Promise<SystemStatus> {
    try {
      // In the future, this would call a real API endpoint
      // const response = await apiClient.get('/api/monitoring/status');
      // return response.data;

      const healthChecks = await this.getHealthChecks();
      const alerts = await this.getAlerts();

      const healthyServices = healthChecks.filter(hc => hc.status === 'healthy').length;
      const criticalIssues = healthChecks.filter(hc => hc.status === 'critical').length;
      const activeAlerts = alerts.filter(alert => !alert.resolved).length;

      let overall: 'healthy' | 'degraded' | 'critical';
      if (criticalIssues > 0) {
        overall = 'critical';
      } else if (activeAlerts > 0 || healthyServices < healthChecks.length) {
        overall = 'degraded';
      } else {
        overall = 'healthy';
      }

      return {
        overall,
        healthyServices,
        totalServices: healthChecks.length,
        activeAlerts,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to fetch system status:', error);
      return {
        overall: 'unknown',
        healthyServices: 0,
        totalServices: 0,
        activeAlerts: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
  },

  // Acknowledge alert
  async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<void> {
    try {
      // In the future, this would call a real API endpoint
      // await apiClient.post(`/api/monitoring/alerts/${alertId}/acknowledge`, { acknowledgedBy });

      console.log(`Alert ${alertId} acknowledged by ${acknowledgedBy}`);
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      throw error;
    }
  },

  // Resolve alert
  async resolveAlert(alertId: string): Promise<void> {
    try {
      // In the future, this would call a real API endpoint
      // await apiClient.post(`/api/monitoring/alerts/${alertId}/resolve`);

      console.log(`Alert ${alertId} resolved`);
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      throw error;
    }
  },

  // Simulated data generation methods (these would be removed when real API is implemented)

  generateSimulatedHealthChecks(): HealthCheck[] {
    return [
      {
        id: 'web-server',
        name: 'Web Server',
        type: 'service',
        status: Math.random() > 0.9 ? 'warning' : 'healthy',
        responseTime: Math.floor(Math.random() * 200) + 50,
        lastCheck: new Date().toISOString(),
        uptime: 99.5 + Math.random() * 0.5,
        description: 'Main application web server handling HTTP requests',
        endpoint: `${window.location.origin}/api/health`,
        dependencies: ['database', 'redis'],
        metrics: {
          cpu: Math.random() * 60 + 10,
          memory: Math.random() * 70 + 20,
          disk: Math.random() * 50 + 30,
          network: Math.random() * 80 + 10,
        },
        errors: Math.random() > 0.95 ? [{
          id: 'error-1',
          type: 'timeout',
          message: 'Response time exceeded threshold',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          resolved: false,
        }] : [],
      },
      {
        id: 'database',
        name: 'Primary Database',
        type: 'database',
        status: Math.random() > 0.95 ? 'warning' : 'healthy',
        responseTime: Math.floor(Math.random() * 100) + 20,
        lastCheck: new Date().toISOString(),
        uptime: 99.8 + Math.random() * 0.2,
        description: 'PostgreSQL primary database for application data',
        endpoint: 'postgresql://localhost:5432',
        dependencies: [],
        metrics: {
          cpu: Math.random() * 40 + 5,
          memory: Math.random() * 60 + 15,
          disk: Math.random() * 40 + 40,
          network: Math.random() * 50 + 5,
        },
        errors: [],
      },
      {
        id: 'redis-cache',
        name: 'Redis Cache',
        type: 'service',
        status: 'healthy',
        responseTime: Math.floor(Math.random() * 30) + 5,
        lastCheck: new Date().toISOString(),
        uptime: 99.9 + Math.random() * 0.1,
        description: 'Redis cache for session storage and caching',
        endpoint: 'redis://localhost:6379',
        dependencies: [],
        metrics: {
          cpu: Math.random() * 20 + 2,
          memory: Math.random() * 30 + 10,
          disk: 5,
          network: Math.random() * 40 + 5,
        },
        errors: [],
      },
      {
        id: 'api-gateway',
        name: 'API Gateway',
        type: 'api',
        status: Math.random() > 0.92 ? 'warning' : 'healthy',
        responseTime: Math.floor(Math.random() * 150) + 30,
        lastCheck: new Date().toISOString(),
        uptime: 99.3 + Math.random() * 0.7,
        description: 'API gateway handling routing and authentication',
        endpoint: `${window.location.origin}/api`,
        dependencies: ['web-server', 'auth-service'],
        metrics: {
          cpu: Math.random() * 50 + 10,
          memory: Math.random() * 60 + 20,
          disk: Math.random() * 30 + 20,
          network: Math.random() * 70 + 15,
        },
        errors: [],
      },
    ];
  },

  generateSimulatedMetrics(): SystemMetric[] {
    const generateHistory = (baseValue: number, variance: number) => {
      return Array.from({ length: 20 }, (_, i) => ({
        timestamp: new Date(Date.now() - (19 - i) * 5 * 60 * 1000).toISOString(),
        value: baseValue + (Math.random() - 0.5) * variance,
      }));
    };

    const cpuUsage = Math.random() * 60 + 20;
    const memoryUsage = Math.random() * 70 + 25;
    const diskUsage = Math.random() * 40 + 40;

    return [
      {
        name: 'CPU Usage',
        current: cpuUsage,
        previous: cpuUsage + (Math.random() - 0.5) * 10,
        unit: '%',
        status: cpuUsage > 80 ? 'critical' : cpuUsage > 60 ? 'warning' : 'normal',
        threshold: { warning: 70, critical: 90 },
        trend: Math.random() > 0.5 ? 'stable' : Math.random() > 0.5 ? 'up' : 'down',
        history: generateHistory(cpuUsage, 15),
      },
      {
        name: 'Memory Usage',
        current: memoryUsage,
        previous: memoryUsage + (Math.random() - 0.5) * 8,
        unit: '%',
        status: memoryUsage > 85 ? 'critical' : memoryUsage > 70 ? 'warning' : 'normal',
        threshold: { warning: 75, critical: 90 },
        trend: Math.random() > 0.5 ? 'stable' : Math.random() > 0.5 ? 'up' : 'down',
        history: generateHistory(memoryUsage, 12),
      },
      {
        name: 'Disk Usage',
        current: diskUsage,
        previous: diskUsage + (Math.random() - 0.5) * 2,
        unit: '%',
        status: diskUsage > 90 ? 'critical' : diskUsage > 80 ? 'warning' : 'normal',
        threshold: { warning: 80, critical: 95 },
        trend: 'up', // Disk usage generally trends up
        history: generateHistory(diskUsage, 3),
      },
      {
        name: 'Response Time',
        current: Math.random() * 300 + 100,
        previous: Math.random() * 300 + 100,
        unit: 'ms',
        status: Math.random() > 0.9 ? 'warning' : 'normal',
        threshold: { warning: 400, critical: 1000 },
        trend: Math.random() > 0.5 ? 'stable' : Math.random() > 0.5 ? 'up' : 'down',
        history: generateHistory(200, 50),
      },
      {
        name: 'Request Rate',
        current: Math.random() * 500 + 50,
        previous: Math.random() * 500 + 50,
        unit: 'req/s',
        status: 'normal',
        threshold: { warning: 1000, critical: 1500 },
        trend: Math.random() > 0.5 ? 'stable' : Math.random() > 0.5 ? 'up' : 'down',
        history: generateHistory(300, 100),
      },
    ];
  },

  generateSimulatedAlerts(): Alert[] {
    const alerts: Alert[] = [
      {
        id: 'alert-1',
        type: 'performance',
        severity: Math.random() > 0.7 ? 'low' : Math.random() > 0.5 ? 'medium' : 'high',
        title: 'High Memory Usage',
        description: 'Memory usage has exceeded 80% threshold',
        component: 'web-server',
        timestamp: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
        acknowledged: Math.random() > 0.6,
        resolved: Math.random() > 0.8,
        metrics: {
          current: 85,
          threshold: 80,
          unit: '%',
        },
      },
      {
        id: 'alert-2',
        type: 'availability',
        severity: 'critical',
        title: 'Database Connection Slow',
        description: 'Database response time is above normal thresholds',
        component: 'database',
        timestamp: new Date(Date.now() - Math.random() * 30 * 60 * 1000).toISOString(),
        acknowledged: Math.random() > 0.5,
        resolved: Math.random() > 0.7,
      },
      {
        id: 'alert-3',
        type: 'security',
        severity: 'high',
        title: 'Multiple Failed Login Attempts',
        description: 'Detected multiple failed login attempts from unusual IP',
        component: 'auth-service',
        timestamp: new Date(Date.now() - Math.random() * 120 * 60 * 1000).toISOString(),
        acknowledged: true,
        resolved: true,
        resolvedAt: new Date(Date.now() - Math.random() * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Filter out resolved alerts more than 24 hours old
    return alerts.filter(alert =>
      !alert.resolved ||
      (alert.resolvedAt && new Date(alert.resolvedAt) > new Date(Date.now() - 24 * 60 * 60 * 1000))
    );
  },
};