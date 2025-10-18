import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Eye,
  EyeOff,
  RefreshCw,
  ChevronDown,
  MoreVertical,
  Database,
  Globe,
  Mail,
  Settings,
  Key,
  Users,
  Lock,
  Unlock,
  Edit,
  Trash2,
  Plus,
  Activity,
  Zap,
  Server,
  Wifi,
  Smartphone,
  Monitor,
  Tablet,
  MapPin,
  Fingerprint,
  AlertCircle,
  Ban,
  UserCheck,
  UserMinus,
  UserPlus,
} from 'lucide-react';

// Types
interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  category:
    | 'authentication'
    | 'authorization'
    | 'data_access'
    | 'configuration'
    | 'security'
    | 'system'
    | 'user_management'
    | 'api'
    | 'file_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'warning';
  resource: string;
  resourceId?: string;
  details: {
    description: string;
    ip: string;
    userAgent: string;
    location?: string;
    device?: string;
    oldValue?: any;
    newValue?: any;
    additionalData?: Record<string, any>;
  };
  session: {
    id: string;
    duration?: number;
    source: 'web' | 'mobile' | 'api' | 'cli';
  };
  compliance: {
    regulations: string[];
    retentionPeriod: number;
    archived: boolean;
  };
  metadata: {
    requestId: string;
    traceId: string;
    correlationId?: string;
    version: string;
    environment: string;
  };
}

interface AuditFilter {
  dateRange: string;
  startDate: string;
  endDate: string;
  userId: string;
  category: string;
  severity: string;
  status: string;
  action: string;
  resource: string;
  ipAddress: string;
  environment: string;
  searchTerm: string;
}

interface LogStatistics {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  successRate: number;
  failureRate: number;
  criticalEvents: number;
  topUsers: Array<{
    userId: string;
    userName: string;
    actionCount: number;
  }>;
  topActions: Array<{
    action: string;
    count: number;
    category: string;
  }>;
  categoryDistribution: Record<string, number>;
  severityDistribution: Record<string, number>;
}

const AuditLogPage: React.FC = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [statistics, setStatistics] = useState<LogStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AuditFilter>({
    dateRange: '7',
    startDate: '',
    endDate: '',
    userId: '',
    category: '',
    severity: '',
    status: '',
    action: '',
    resource: '',
    ipAddress: '',
    environment: 'all',
    searchTerm: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalLogs, setTotalLogs] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [showExportModal, setShowExportModal] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(30);

  const logsPerPage = 50;

  // Mock data generation
  useEffect(() => {
    const generateAuditLogs = (): AuditLog[] => {
      const categories: AuditLog['category'][] = [
        'authentication',
        'authorization',
        'data_access',
        'configuration',
        'security',
        'system',
        'user_management',
        'api',
        'file_access',
      ];

      const severities: AuditLog['severity'][] = ['low', 'medium', 'high', 'critical'];
      const statuses: AuditLog['status'][] = ['success', 'failure', 'warning'];
      const sources: AuditLog['session']['source'][] = ['web', 'mobile', 'api', 'cli'];

      const actions = [
        'login',
        'logout',
        'password_change',
        'profile_update',
        'user_created',
        'user_deleted',
        'permission_granted',
        'permission_revoked',
        'data_exported',
        'data_imported',
        'config_updated',
        'system_backup',
        'api_call',
        'file_uploaded',
        'file_downloaded',
        'role_assigned',
        'role_removed',
        'session_created',
        'session_terminated',
        'security_scan',
        'vulnerability_fixed',
        'compliance_check',
        'audit_exported',
      ];

      const users = [
        { id: '1', name: 'John Doe', email: 'john.doe@company.com' },
        { id: '2', name: 'Jane Smith', email: 'jane.smith@company.com' },
        { id: '3', name: 'Mike Wilson', email: 'mike.wilson@company.com' },
        { id: '4', name: 'Sarah Johnson', email: 'sarah.johnson@company.com' },
        { id: '5', name: 'Admin User', email: 'admin@company.com' },
      ];

      const resources = [
        'User Management',
        'Project Settings',
        'Database',
        'API Gateway',
        'File Storage',
        'Security Configuration',
        'Backup System',
        'Audit Logs',
        'User Profile',
        'System Configuration',
      ];

      return Array.from({ length: 500 }, (_, i) => {
        const user = users[Math.floor(Math.random() * users.length)];
        const category = categories[Math.floor(Math.random() * categories.length)];
        const severity = severities[Math.floor(Math.random() * severities.length)];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const action = actions[Math.floor(Math.random() * actions.length)];
        const source = sources[Math.floor(Math.random() * sources.length)];
        const resource = resources[Math.floor(Math.random() * resources.length)];

        const timestamp = new Date(
          Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
        ).toISOString();

        return {
          id: `audit-${i + 1}`,
          timestamp,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          action,
          category,
          severity,
          status,
          resource,
          resourceId:
            Math.random() > 0.5 ? `resource-${Math.floor(Math.random() * 1000)}` : undefined,
          details: {
            description: `${action} performed on ${resource}`,
            ip: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            location: ['New York, USA', 'Los Angeles, USA', 'London, UK', 'Tokyo, Japan'][
              Math.floor(Math.random() * 4)
            ],
            device: ['Desktop', 'Mobile', 'Tablet'][Math.floor(Math.random() * 3)],
            oldValue: Math.random() > 0.7 ? 'old_value' : undefined,
            newValue: Math.random() > 0.7 ? 'new_value' : undefined,
            additionalData:
              Math.random() > 0.8
                ? {
                    sessionId: `session-${Math.floor(Math.random() * 10000)}`,
                    requestId: `req-${Math.floor(Math.random() * 100000)}`,
                    processingTime: Math.floor(Math.random() * 1000),
                  }
                : undefined,
          },
          session: {
            id: `session-${Math.floor(Math.random() * 10000)}`,
            duration: Math.floor(Math.random() * 3600),
            source,
          },
          compliance: {
            regulations: ['GDPR', 'SOX', 'HIPAA'].filter(() => Math.random() > 0.5),
            retentionPeriod: 2555, // 7 years
            archived: Math.random() > 0.95,
          },
          metadata: {
            requestId: `req-${Math.floor(Math.random() * 100000)}`,
            traceId: `trace-${Math.floor(Math.random() * 100000)}`,
            correlationId:
              Math.random() > 0.5 ? `corr-${Math.floor(Math.random() * 100000)}` : undefined,
            version: '2.1.0',
            environment: ['development', 'staging', 'production'][Math.floor(Math.random() * 3)],
          },
        };
      }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    };

    const generateStatistics = (): LogStatistics => {
      const logs = generateAuditLogs();
      const now = new Date();
      const today = now.toDateString();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const todayLogs = logs.filter(log => new Date(log.timestamp).toDateString() === today);
      const weekLogs = logs.filter(log => new Date(log.timestamp) >= weekAgo);
      const monthLogs = logs.filter(log => new Date(log.timestamp) >= monthAgo);

      const successLogs = logs.filter(log => log.status === 'success');
      const failureLogs = logs.filter(log => log.status === 'failure');
      const criticalLogs = logs.filter(log => log.severity === 'critical');

      // Top users
      const userActionCounts = logs.reduce(
        (acc, log) => {
          const key = `${log.userId}-${log.userName}`;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const topUsers = Object.entries(userActionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([key, count]) => {
          const [userId, userName] = key.split('-');
          return { userId, userName, actionCount: count };
        });

      // Top actions
      const actionCounts = logs.reduce(
        (acc, log) => {
          const key = `${log.action}-${log.category}`;
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const topActions = Object.entries(actionCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([key, count]) => {
          const [action, category] = key.split('-');
          return { action, category, count };
        });

      // Category distribution
      const categoryDistribution = logs.reduce(
        (acc, log) => {
          acc[log.category] = (acc[log.category] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      // Severity distribution
      const severityDistribution = logs.reduce(
        (acc, log) => {
          acc[log.severity] = (acc[log.severity] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      return {
        total: logs.length,
        today: todayLogs.length,
        thisWeek: weekLogs.length,
        thisMonth: monthLogs.length,
        successRate: (successLogs.length / logs.length) * 100,
        failureRate: (failureLogs.length / logs.length) * 100,
        criticalEvents: criticalLogs.length,
        topUsers,
        topActions,
        categoryDistribution,
        severityDistribution,
      };
    };

    setAuditLogs(generateAuditLogs());
    setStatistics(generateStatistics());
    setTotalLogs(500);
    setLoading(false);
  }, []);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // Refresh data
      console.log('Refreshing audit logs...');
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  // Filter logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch =
      !filters.searchTerm ||
      log.action.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
      log.details.description.toLowerCase().includes(filters.searchTerm.toLowerCase());

    const matchesDateRange = () => {
      if (!filters.dateRange) return true;
      const days = parseInt(filters.dateRange);
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      return new Date(log.timestamp) >= startDate;
    };

    const matchesCategory = !filters.category || log.category === filters.category;
    const matchesSeverity = !filters.severity || log.severity === filters.severity;
    const matchesStatus = !filters.status || log.status === filters.status;
    const matchesAction = !filters.action || log.action.includes(filters.action);
    const matchesResource = !filters.resource || log.resource.includes(filters.resource);
    const matchesUser = !filters.userId || log.userId === filters.userId;
    const matchesIP = !filters.ipAddress || log.details.ip.includes(filters.ipAddress);
    const matchesEnvironment =
      filters.environment === 'all' || log.metadata.environment === filters.environment;

    return (
      matchesSearch &&
      matchesDateRange() &&
      matchesCategory &&
      matchesSeverity &&
      matchesStatus &&
      matchesAction &&
      matchesResource &&
      matchesUser &&
      matchesIP &&
      matchesEnvironment
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const handleExport = () => {
    console.log(`Exporting audit logs as ${exportFormat}`);
    setShowExportModal(false);
  };

  const getCategoryIcon = (category: AuditLog['category']) => {
    const icons = {
      authentication: <Lock className="w-4 h-4" />,
      authorization: <Shield className="w-4 h-4" />,
      data_access: <Database className="w-4 h-4" />,
      configuration: <Settings className="w-4 h-4" />,
      security: <Eye className="w-4 h-4" />,
      system: <Server className="w-4 h-4" />,
      user_management: <Users className="w-4 h-4" />,
      api: <Globe className="w-4 h-4" />,
      file_access: <FileText className="w-4 h-4" />,
    };
    return icons[category] || <Info className="w-4 h-4" />;
  };

  const getStatusColor = (status: AuditLog['status']) => {
    const colors = {
      success: 'text-green-600 bg-green-100',
      failure: 'text-red-600 bg-red-100',
      warning: 'text-yellow-600 bg-yellow-100',
    };
    return colors[status];
  };

  const getSeverityColor = (severity: AuditLog['severity']) => {
    const colors = {
      low: 'text-gray-600 bg-gray-100',
      medium: 'text-yellow-600 bg-yellow-100',
      high: 'text-orange-600 bg-orange-100',
      critical: 'text-red-600 bg-red-100',
    };
    return colors[severity];
  };

  const getSourceIcon = (source: string) => {
    const icons = {
      web: <Monitor className="w-4 h-4" />,
      mobile: <Smartphone className="w-4 h-4" />,
      api: <Globe className="w-4 h-4" />,
      cli: <Terminal className="w-4 h-4" />,
    };
    return icons[source as keyof typeof icons] || <Globe className="w-4 h-4" />;
  };

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Logs</h1>
            <p className="text-gray-600">
              Comprehensive audit trail for compliance and security monitoring
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
              onClick={() => setShowExportModal(true)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Logs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.total.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">All time</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statistics.successRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500">
                  {statistics.failureRate.toFixed(1)}% failure
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
                <p className="text-sm font-medium text-gray-600">Critical Events</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.criticalEvents}</p>
                <p className="text-xs text-gray-500">Last 30 days</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Activity</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.today}</p>
                <p className="text-xs text-gray-500">Last 24 hours</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search audit logs..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  value={filters.searchTerm}
                  onChange={e => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-lg border ${
                  showFilters
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown
                  className={`w-4 h-4 ml-2 transform ${showFilters ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            <div className="text-sm text-gray-600">
              Showing {paginatedLogs.length} of {filteredLogs.length} logs
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.dateRange}
                    onChange={e => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                  >
                    <option value="1">Last 24 hours</option>
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.category}
                    onChange={e => setFilters(prev => ({ ...prev, category: e.target.value }))}
                  >
                    <option value="">All Categories</option>
                    <option value="authentication">Authentication</option>
                    <option value="authorization">Authorization</option>
                    <option value="data_access">Data Access</option>
                    <option value="configuration">Configuration</option>
                    <option value="security">Security</option>
                    <option value="system">System</option>
                    <option value="user_management">User Management</option>
                    <option value="api">API</option>
                    <option value="file_access">File Access</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.severity}
                    onChange={e => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                  >
                    <option value="">All Severities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.status}
                    onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="">All Statuses</option>
                    <option value="success">Success</option>
                    <option value="failure">Failure</option>
                    <option value="warning">Warning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Environment
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.environment}
                    onChange={e => setFilters(prev => ({ ...prev, environment: e.target.value }))}
                  >
                    <option value="all">All Environments</option>
                    <option value="development">Development</option>
                    <option value="staging">Staging</option>
                    <option value="production">Production</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="User ID or email"
                    value={filters.userId}
                    onChange={e => setFilters(prev => ({ ...prev, userId: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="IP address"
                    value={filters.ipAddress}
                    onChange={e => setFilters(prev => ({ ...prev, ipAddress: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Resource name"
                    value={filters.resource}
                    onChange={e => setFilters(prev => ({ ...prev, resource: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Audit Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      <div>{new Date(log.timestamp).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                      <div className="text-xs text-gray-500">{log.userEmail}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      {log.action === 'login' && <Lock className="w-4 h-4 mr-2 text-gray-400" />}
                      {log.action === 'logout' && <Unlock className="w-4 h-4 mr-2 text-gray-400" />}
                      {log.action === 'user_created' && (
                        <UserPlus className="w-4 h-4 mr-2 text-gray-400" />
                      )}
                      {log.action === 'user_deleted' && (
                        <UserMinus className="w-4 h-4 mr-2 text-gray-400" />
                      )}
                      {log.action === 'permission_granted' && (
                        <Shield className="w-4 h-4 mr-2 text-gray-400" />
                      )}
                      {log.action === 'config_updated' && (
                        <Settings className="w-4 h-4 mr-2 text-gray-400" />
                      )}
                      {log.action === 'api_call' && (
                        <Globe className="w-4 h-4 mr-2 text-gray-400" />
                      )}
                      {log.action === 'file_uploaded' && (
                        <Upload className="w-4 h-4 mr-2 text-gray-400" />
                      )}
                      {log.action === 'file_downloaded' && (
                        <Download className="w-4 h-4 mr-2 text-gray-400" />
                      )}
                      <span>{log.action.replace(/_/g, ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        log.category === 'authentication'
                          ? 'bg-blue-100 text-blue-800'
                          : log.category === 'authorization'
                            ? 'bg-purple-100 text-purple-800'
                            : log.category === 'data_access'
                              ? 'bg-green-100 text-green-800'
                              : log.category === 'configuration'
                                ? 'bg-yellow-100 text-yellow-800'
                                : log.category === 'security'
                                  ? 'bg-red-100 text-red-800'
                                  : log.category === 'system'
                                    ? 'bg-gray-100 text-gray-800'
                                    : 'bg-indigo-100 text-indigo-800'
                      }`}
                    >
                      {getCategoryIcon(log.category)}
                      <span className="ml-1">{log.category.replace(/_/g, ' ')}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.resource}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(log.status)}`}
                    >
                      {log.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(log.severity)}`}
                    >
                      {log.severity.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-gray-500">
                      {getSourceIcon(log.session.source)}
                      <span className="ml-1 text-xs capitalize">{log.session.source}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Wifi className="w-4 h-4 mr-1 text-gray-400" />
                      {log.details.ip}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedLog(log);
                        setShowDetailsModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * logsPerPage + 1} to{' '}
              {Math.min(currentPage * logsPerPage, filteredLogs.length)} of {filteredLogs.length}{' '}
              logs
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span>...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Log Details Modal */}
      {showDetailsModal && selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Audit Log Details</h2>
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
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Timestamp:</dt>
                      <dd className="text-sm text-gray-900">
                        {new Date(selectedLog.timestamp).toLocaleString()}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">User:</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedLog.userName} ({selectedLog.userEmail})
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Action:</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedLog.action.replace(/_/g, ' ')}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Category:</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedLog.category.replace(/_/g, ' ')}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Resource:</dt>
                      <dd className="text-sm text-gray-900">{selectedLog.resource}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Status:</dt>
                      <dd className="text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedLog.status)}`}
                        >
                          {selectedLog.status.toUpperCase()}
                        </span>
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Severity:</dt>
                      <dd className="text-sm">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(selectedLog.severity)}`}
                        >
                          {selectedLog.severity.toUpperCase()}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                {/* Session Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Information</h3>
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Session ID:</dt>
                      <dd className="text-sm text-gray-900 font-mono">{selectedLog.session.id}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Source:</dt>
                      <dd className="text-sm text-gray-900 capitalize">
                        {selectedLog.session.source}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">IP Address:</dt>
                      <dd className="text-sm text-gray-900">{selectedLog.details.ip}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Location:</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedLog.details.location || 'Unknown'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">Device:</dt>
                      <dd className="text-sm text-gray-900">
                        {selectedLog.details.device || 'Unknown'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-gray-600">User Agent:</dt>
                      <dd className="text-sm text-gray-900 break-all">
                        {selectedLog.details.userAgent}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-sm text-gray-700">{selectedLog.details.description}</p>
              </div>

              {/* Changes */}
              {(selectedLog.details.oldValue !== undefined ||
                selectedLog.details.newValue !== undefined) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Changes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedLog.details.oldValue !== undefined && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">Previous Value:</h4>
                        <div className="p-3 bg-gray-50 rounded text-sm font-mono">
                          {JSON.stringify(selectedLog.details.oldValue, null, 2)}
                        </div>
                      </div>
                    )}
                    {selectedLog.details.newValue !== undefined && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-1">New Value:</h4>
                        <div className="p-3 bg-gray-50 rounded text-sm font-mono">
                          {JSON.stringify(selectedLog.details.newValue, null, 2)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Data */}
              {selectedLog.details.additionalData && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Data</h3>
                  <div className="p-4 bg-gray-50 rounded">
                    <pre className="text-sm text-gray-700 overflow-x-auto">
                      {JSON.stringify(selectedLog.details.additionalData, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Technical Details</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Request ID:</dt>
                    <dd className="text-gray-900 font-mono">{selectedLog.metadata.requestId}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Trace ID:</dt>
                    <dd className="text-gray-900 font-mono">{selectedLog.metadata.traceId}</dd>
                  </div>
                  {selectedLog.metadata.correlationId && (
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Correlation ID:</dt>
                      <dd className="text-gray-900 font-mono">
                        {selectedLog.metadata.correlationId}
                      </dd>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Version:</dt>
                    <dd className="text-gray-900">{selectedLog.metadata.version}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-600">Environment:</dt>
                    <dd className="text-gray-900 capitalize">{selectedLog.metadata.environment}</dd>
                  </div>
                </dl>
              </div>

              {/* Compliance Information */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Compliance</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Regulations:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedLog.compliance.regulations.map(regulation => (
                        <span
                          key={regulation}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                        >
                          {regulation}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Retention:</h4>
                    <p className="text-sm text-gray-900">
                      {selectedLog.compliance.retentionPeriod} days
                    </p>
                    <p className="text-sm text-gray-500">
                      Status: {selectedLog.compliance.archived ? 'Archived' : 'Active'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Export Audit Logs</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Format
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="format"
                        value="csv"
                        checked={exportFormat === 'csv'}
                        onChange={e => setExportFormat(e.target.value as any)}
                        className="mr-2"
                      />
                      <span className="text-sm">CSV (Comma Separated Values)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="format"
                        value="json"
                        checked={exportFormat === 'json'}
                        onChange={e => setExportFormat(e.target.value as any)}
                        className="mr-2"
                      />
                      <span className="text-sm">JSON (JavaScript Object Notation)</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="format"
                        value="pdf"
                        checked={exportFormat === 'pdf'}
                        onChange={e => setExportFormat(e.target.value as any)}
                        className="mr-2"
                      />
                      <span className="text-sm">PDF (Portable Document Format)</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Export Options
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm">Include current filters</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" defaultChecked />
                      <span className="text-sm">Include detailed metadata</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Include compliance information</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Compress file (ZIP)</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Export Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogPage;
