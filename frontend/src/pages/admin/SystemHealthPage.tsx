import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Database,
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  HardDrive,
  Wifi,
  Users,
  RefreshCw,
  Settings,
  BarChart3,
  Bell,
  FileText,
  Download,
  Search,
  Filter,
  ChevronDown,
  Info,
  AlertCircle,
  Heart,
  Thermometer,
  Cpu,
  MemoryStick,
  Monitor,
  Router,
  Cloud,
  Lock,
  Eye,
  Calendar,
  MoreVertical,
} from 'lucide-react';
import { monitoringService, HealthCheck, SystemMetric, Alert } from '../../services/monitoringService';

const SystemHealthPage: React.FC = () => {
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(30);
  const [selectedComponent, setSelectedComponent] = useState<HealthCheck | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [alertFilter, setAlertFilter] = useState('all');
  const [componentFilter, setComponentFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('1h');

  // Load monitoring data from service
  useEffect(() => {
    const loadMonitoringData = async () => {
      try {
        setLoading(true);

        // Load all monitoring data in parallel
        const [healthChecksData, systemMetricsData, alertsData] = await Promise.all([
          monitoringService.getHealthChecks(),
          monitoringService.getSystemMetrics(),
          monitoringService.getAlerts(),
        ]);

        setHealthChecks(healthChecksData);
        setSystemMetrics(systemMetricsData);
        setAlerts(alertsData);

      } catch (error) {
        console.error('Failed to load monitoring data:', error);
        // Set empty state on error
        setHealthChecks([]);
        setSystemMetrics([]);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    loadMonitoringData();
  }, []);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(async () => {
      try {
        // Refresh data using monitoring service
        const [healthChecksData, systemMetricsData, alertsData] = await Promise.all([
          monitoringService.getHealthChecks(),
          monitoringService.getSystemMetrics(),
          monitoringService.getAlerts(),
        ]);

        setHealthChecks(healthChecksData);
        setSystemMetrics(systemMetricsData);
        setAlerts(alertsData);

      } catch (error) {
        console.error('Failed to refresh monitoring data:', error);
      }
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getStatusColor = (status: HealthCheck['status']) => {
    const colors = {
      healthy: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      critical: 'text-red-600 bg-red-100',
      unknown: 'text-gray-600 bg-gray-100',
    };
    return colors[status];
  };

  const getStatusIcon = (status: HealthCheck['status']) => {
    const icons = {
      healthy: <CheckCircle className="w-5 h-5" />,
      warning: <AlertTriangle className="w-5 h-5" />,
      critical: <XCircle className="w-5 h-5" />,
      unknown: <AlertCircle className="w-5 h-5" />,
    };
    return icons[status];
  };

  const getMetricColor = (status: SystemMetric['status']) => {
    const colors = {
      normal: 'text-green-600',
      warning: 'text-yellow-600',
      critical: 'text-red-600',
    };
    return colors[status];
  };

  const getSeverityColor = (severity: Alert['severity']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[severity];
  };

  const getComponentIcon = (type: HealthCheck['type']) => {
    const icons = {
      service: <Server className="w-5 h-5" />,
      database: <Database className="w-5 h-5" />,
      api: <Globe className="w-5 h-5" />,
      network: <Wifi className="w-5 h-5" />,
      security: <Shield className="w-5 h-5" />,
      storage: <HardDrive className="w-5 h-5" />,
    };
    return icons[type];
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      await monitoringService.acknowledgeAlert(alertId, 'admin@company.com');

      // Update local state to reflect the change
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId
            ? {
                ...alert,
                acknowledged: true,
                acknowledgedBy: 'admin@company.com',
                acknowledgedAt: new Date().toISOString(),
              }
            : alert
        )
      );
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      alert('Failed to acknowledge alert. Please try again.');
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    try {
      await monitoringService.resolveAlert(alertId);

      // Update local state to reflect the change
      setAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId
            ? {
                ...alert,
                resolved: true,
                resolvedAt: new Date().toISOString(),
              }
            : alert
        )
      );
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      alert('Failed to resolve alert. Please try again.');
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    if (alertFilter === 'all') return true;
    if (alertFilter === 'unacknowledged') return !alert.acknowledged;
    if (alertFilter === 'unresolved') return !alert.resolved;
    if (alertFilter === 'critical') return alert.severity === 'critical';
    return true;
  });

  const filteredHealthChecks = healthChecks.filter(check => {
    if (componentFilter === 'all') return true;
    return check.type === componentFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">System Health</h1>
            <p className="text-gray-600">
              Real-time monitoring of system components and performance
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Auto-refresh:</label>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  autoRefresh ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {autoRefresh ? 'ON' : 'OFF'}
              </button>
            </div>
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              value={refreshInterval}
              onChange={e => setRefreshInterval(Number(e.target.value))}
              disabled={!autoRefresh}
            >
              <option value={10}>10s</option>
              <option value={30}>30s</option>
              <option value={60}>1m</option>
              <option value={300}>5m</option>
            </select>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Healthy Services</p>
              <p className="text-2xl font-bold text-gray-900">
                {healthChecks.filter(c => c.status === 'healthy').length}/{healthChecks.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Warnings</p>
              <p className="text-2xl font-bold text-gray-900">
                {healthChecks.filter(c => c.status === 'warning').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Critical Issues</p>
              <p className="text-2xl font-bold text-gray-900">
                {healthChecks.filter(c => c.status === 'critical').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(
                  healthChecks.reduce((sum, c) => sum + c.responseTime, 0) / healthChecks.length
                )}
                ms
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Health Checks */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Service Health</h2>
                <div className="flex items-center space-x-3">
                  <select
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                    value={componentFilter}
                    onChange={e => setComponentFilter(e.target.value)}
                  >
                    <option value="all">All Components</option>
                    <option value="service">Services</option>
                    <option value="database">Databases</option>
                    <option value="api">APIs</option>
                    <option value="storage">Storage</option>
                  </select>
                  <select
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                    value={timeRange}
                    onChange={e => setTimeRange(e.target.value)}
                  >
                    <option value="1h">Last Hour</option>
                    <option value="24h">Last 24 Hours</option>
                    <option value="7d">Last 7 Days</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                {filteredHealthChecks.map(check => (
                  <div
                    key={check.id}
                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedComponent(check);
                      setShowDetailsModal(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(check.status)}`}>
                          {getComponentIcon(check.type)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{check.name}</h3>
                          <p className="text-sm text-gray-600">{check.description}</p>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-xs text-gray-500">
                              Response: {check.responseTime}ms
                            </span>
                            <span className="text-xs text-gray-500">
                              Uptime: {check.uptime.toFixed(1)}%
                            </span>
                            <span className="text-xs text-gray-500">
                              Last check: {new Date(check.lastCheck).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div
                          className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(check.status)}`}
                        >
                          {getStatusIcon(check.status)}
                          <span>{check.status.toUpperCase()}</span>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metrics Bar */}
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">CPU</span>
                          <span
                            className={getMetricColor(
                              check.metrics.cpu > 80
                                ? 'critical'
                                : check.metrics.cpu > 60
                                  ? 'warning'
                                  : 'normal'
                            )}
                          >
                            {check.metrics.cpu.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div
                            className={`h-1 rounded-full ${
                              check.metrics.cpu > 80
                                ? 'bg-red-500'
                                : check.metrics.cpu > 60
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                            }`}
                            style={{ width: `${check.metrics.cpu}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Memory</span>
                          <span
                            className={getMetricColor(
                              check.metrics.memory > 85
                                ? 'critical'
                                : check.metrics.memory > 70
                                  ? 'warning'
                                  : 'normal'
                            )}
                          >
                            {check.metrics.memory.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div
                            className={`h-1 rounded-full ${
                              check.metrics.memory > 85
                                ? 'bg-red-500'
                                : check.metrics.memory > 70
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                            }`}
                            style={{ width: `${check.metrics.memory}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Disk</span>
                          <span
                            className={getMetricColor(
                              check.metrics.disk > 90
                                ? 'critical'
                                : check.metrics.disk > 75
                                  ? 'warning'
                                  : 'normal'
                            )}
                          >
                            {check.metrics.disk.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div
                            className={`h-1 rounded-full ${
                              check.metrics.disk > 90
                                ? 'bg-red-500'
                                : check.metrics.disk > 75
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                            }`}
                            style={{ width: `${check.metrics.disk}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Network</span>
                          <span className="text-gray-900">{check.metrics.network.toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full"
                            style={{ width: `${check.metrics.network}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {check.errors.length > 0 && (
                      <div className="mt-3 p-2 bg-red-50 rounded text-xs text-red-700">
                        {check.errors.length} error(s) detected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* System Metrics */}
          <div className="bg-white rounded-lg shadow mt-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">System Metrics</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {systemMetrics.map(metric => (
                  <div key={metric.name} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{metric.name}</h3>
                      <span className={`text-sm ${getMetricColor(metric.status)}`}>
                        {metric.current.toFixed(1)}
                        {metric.unit}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      {metric.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-500" />}
                      {metric.trend === 'down' && (
                        <TrendingDown className="w-4 h-4 text-green-500" />
                      )}
                      {metric.trend === 'stable' && <Activity className="w-4 h-4 text-gray-500" />}
                      <span className="text-xs text-gray-600">
                        {metric.previous.toFixed(1)}
                        {metric.unit} → {metric.current.toFixed(1)}
                        {metric.unit}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          metric.status === 'critical'
                            ? 'bg-red-500'
                            : metric.status === 'warning'
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min((metric.current / 100) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>0</span>
                      <span>
                        Warning: {metric.threshold.warning}
                        {metric.unit}
                      </span>
                      <span>
                        Critical: {metric.threshold.critical}
                        {metric.unit}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Alerts Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Alerts</h2>
                <div className="flex items-center space-x-2">
                  <select
                    className="px-2 py-1 border border-gray-300 rounded-lg text-xs"
                    value={alertFilter}
                    onChange={e => setAlertFilter(e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="unacknowledged">Unacknowledged</option>
                    <option value="unresolved">Unresolved</option>
                    <option value="critical">Critical</option>
                  </select>
                  <button className="text-gray-400 hover:text-gray-600">
                    <Bell className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredAlerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`border rounded-lg p-4 ${
                      alert.resolved
                        ? 'border-gray-200 bg-gray-50'
                        : alert.acknowledged
                          ? 'border-yellow-200 bg-yellow-50'
                          : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}
                        >
                          {alert.severity.toUpperCase()}
                        </span>
                        {alert.acknowledged && !alert.resolved && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            ACKNOWLEDGED
                          </span>
                        )}
                        {alert.resolved && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            RESOLVED
                          </span>
                        )}
                      </div>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                    <h3 className="font-medium text-gray-900 mb-1">{alert.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{alert.description}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(alert.timestamp).toLocaleString()}</span>
                      <span className="font-medium">{alert.component}</span>
                    </div>
                    {alert.metrics && (
                      <div className="mt-2 p-2 bg-white rounded text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Current:</span>
                          <span className="font-medium">
                            {alert.metrics.current}
                            {alert.metrics.unit}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Threshold:</span>
                          <span className="font-medium">
                            {alert.metrics.threshold}
                            {alert.metrics.unit}
                          </span>
                        </div>
                      </div>
                    )}
                    {!alert.resolved && (
                      <div className="mt-3 flex space-x-2">
                        {!alert.acknowledged && (
                          <button
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                            className="flex-1 px-2 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button
                          onClick={() => handleResolveAlert(alert.id)}
                          className="flex-1 px-2 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Component Details Modal */}
      {showDetailsModal && selectedComponent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedComponent.name} Details
                </h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Component Information
                  </h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Type:</dt>
                      <dd className="text-sm text-gray-900 capitalize">{selectedComponent.type}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Status:</dt>
                      <dd
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedComponent.status)}`}
                      >
                        {selectedComponent.status.toUpperCase()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Response Time:</dt>
                      <dd className="text-sm text-gray-900">{selectedComponent.responseTime}ms</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Uptime:</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedComponent.uptime.toFixed(2)}%
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Last Check:</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(selectedComponent.lastCheck).toLocaleString()}
                      </dd>
                    </div>
                    {selectedComponent.endpoint && (
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Endpoint:</dt>
                        <dd className="text-sm text-gray-900 break-all">
                          {selectedComponent.endpoint}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Resource Usage</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">CPU Usage</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedComponent.metrics.cpu.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            selectedComponent.metrics.cpu > 80
                              ? 'bg-red-500'
                              : selectedComponent.metrics.cpu > 60
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${selectedComponent.metrics.cpu}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Memory Usage</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedComponent.metrics.memory.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            selectedComponent.metrics.memory > 85
                              ? 'bg-red-500'
                              : selectedComponent.metrics.memory > 70
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${selectedComponent.metrics.memory}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Disk Usage</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedComponent.metrics.disk.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            selectedComponent.metrics.disk > 90
                              ? 'bg-red-500'
                              : selectedComponent.metrics.disk > 75
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${selectedComponent.metrics.disk}%` }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">Network I/O</span>
                        <span className="text-sm font-medium text-gray-900">
                          {selectedComponent.metrics.network.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${selectedComponent.metrics.network}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedComponent.dependencies.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dependencies</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedComponent.dependencies.map(dep => (
                      <span
                        key={dep}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                      >
                        {dep}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedComponent.errors.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Errors</h3>
                  <div className="space-y-3">
                    {selectedComponent.errors.map(error => (
                      <div
                        key={error.id}
                        className="border border-red-200 rounded-lg p-4 bg-red-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              error.resolved
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {error.type.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(error.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-900 mb-1">{error.message}</p>
                        {error.resolved && (
                          <p className="text-xs text-green-600">
                            Resolved at {new Date(error.resolvedAt!).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemHealthPage;
