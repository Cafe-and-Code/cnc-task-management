import React, { useState, useEffect } from 'react'
import {
  Shield,
  Users,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Cloud,
  Server,
  Globe,
  Settings,
  Download,
  RefreshCw,
  Bell,
  AlertCircle as AlertTriangleIcon,
  BarChart3,
  PieChart,
  LineChart,
  FileText,
  Calendar,
  Filter,
  Search,
  Eye,
  EyeOff,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  Archive,
  Trash2,
  Edit,
  Plus,
  Wifi,
  WifiOff,
  HardDrive,
  MemoryStick,
  Cpu,
  Monitor,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  UserCheck,
  UserX,
  Mail,
  Phone,
  MapPin,
  Building,
  Package
} from 'lucide-react'

interface SystemMetrics {
  overview: {
    totalUsers: number
    activeUsers: number
    totalProjects: number
    activeProjects: number
    totalTasks: number
    completedTasks: number
    totalSprints: number
    activeSprints: number
    totalTeams: number
    activeTeams: number
  }
  performance: {
    responseTime: number
    uptime: number
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    bandwidth: number
    apiCalls: number
    errors: number
    warnings: number
  }
  activity: {
    logins: number
    pageViews: number
    actions: number
    comments: number
    uploads: number
    downloads: number
    errors: number
    logouts: number
  }
  storage: {
    totalSpace: number
    usedSpace: number
    availableSpace: number
    databaseSize: number
    fileSize: number
    backupSize: number
    cacheSize: number
  }
  security: {
    failedLogins: number
    blockedAttempts: number
    activeSessions: number
    securityEvents: number
    vulnerabilities: number
    certificates: number
    permissions: number
  }
}

interface RecentActivity {
  id: string
  type: 'login' | 'logout' | 'action' | 'error' | 'warning' | 'success'
  description: string
  userId: string
  userName: string
  userRole: string
  ipAddress: string
  userAgent: string
  timestamp: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  metadata?: any
}

interface SystemAlert {
  id: string
  type: 'error' | 'warning' | 'info' | 'success'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  component: string
  timestamp: string
  isRead: boolean
  actions?: Array<{
    label: string
    action: string
    url?: string
  }>
}

interface HealthCheck {
  id: string
  name: string
  status: 'healthy' | 'warning' | 'critical' | 'offline'
  lastCheck: string
  responseTime: number
  message: string
  details?: any
}

const AdminDashboardPage: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
  const [healthChecks, setHealthChecks] = useState<HealthCheck[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h')
  const [showFilters, setShowFilters] = useState(false)
  const [expandedSection, setExpandedSection] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'projects' | 'system' | 'security' | 'analytics'>('overview')

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      const mockMetrics: SystemMetrics = {
        overview: {
          totalUsers: 1247,
          activeUsers: 892,
          totalProjects: 156,
          activeProjects: 89,
          totalTasks: 3421,
          completedTasks: 2876,
          totalSprints: 234,
          activeSprints: 45,
          totalTeams: 42,
          activeTeams: 38
        },
        performance: {
          responseTime: 245,
          uptime: 99.8,
          cpuUsage: 67,
          memoryUsage: 58,
          diskUsage: 73,
          bandwidth: 45,
          apiCalls: 45678,
          errors: 23,
          warnings: 45
        },
        activity: {
          logins: 1247,
          pageViews: 45678,
          actions: 8934,
          comments: 2345,
          uploads: 567,
          downloads: 1234,
          errors: 23,
          logouts: 355
        },
        storage: {
          totalSpace: 500000000000, // 500GB
          usedSpace: 234567890123, // 234GB
          availableSpace: 265432109877,
          databaseSize: 45678901234,
          fileSize: 12345678901,
          backupSize: 34567890123,
          cacheSize: 5678901234
        },
        security: {
          failedLogins: 234,
          blockedAttempts: 1456,
          activeSessions: 892,
          securityEvents: 45,
          vulnerabilities: 3,
          certificates: 12,
          permissions: 2456
        }
      }

      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'login',
          description: 'User logged in successfully',
          userId: 'user-1',
          userName: 'John Doe',
          userRole: 'Admin',
          ipAddress: '192.168.1.100',
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          timestamp: new Date().toISOString(),
          severity: 'low',
          metadata: { location: 'New York, USA' }
        },
        {
          id: '2',
          type: 'warning',
          description: 'High memory usage detected on web server',
          userId: 'system',
          userName: 'System',
          userRole: 'System',
          ipAddress: '127.0.0.1',
          userAgent: 'System',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          severity: 'medium',
          metadata: { server: 'web-01', value: 87 }
        },
        {
          id: '3',
          type: 'action',
          description: 'User created new project "Mobile App Redesign"',
          userId: 'user-2',
          userName: 'Jane Smith',
          userRole: 'Project Manager',
          ipAddress: '192.168.1.101',
          userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
          severity: 'low',
          metadata: { projectId: 'proj-123' }
        },
        {
          id: '4',
          type: 'error',
          description: 'Database connection timeout',
          userId: 'system',
          userName: 'System',
          userRole: 'System',
          ipAddress: '127.0.0.1',
          userAgent: 'System',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          severity: 'high',
          metadata: { database: 'primary', error: 'Connection timeout' }
        },
        {
          id: '5',
          type: 'success',
          description: 'Backup completed successfully',
          userId: 'system',
          userName: 'System',
          userRole: 'System',
          ipAddress: '127.0.0.1',
          userAgent: 'System',
          timestamp: new Date(Date.now() - 20 * 60000).toISOString(),
          severity: 'low',
          metadata: { backupId: 'backup-123', size: '4.5GB' }
        }
      ]

      const mockAlerts: SystemAlert[] = [
        {
          id: 'alert-1',
          type: 'warning',
          title: 'High Memory Usage',
          message: 'Web server memory usage is above 80% (87%)',
          severity: 'medium',
          component: 'Web Server',
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          isRead: false,
          actions: [
            { label: 'View Details', action: 'view' },
            { label: 'Clear Cache', action: 'clear-cache' }
          ]
        },
        {
          id: 'alert-2',
          type: 'error',
          title: 'Database Connection Failed',
          message: 'Unable to connect to primary database',
          severity: 'critical',
          component: 'Database',
          timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
          isRead: false,
          actions: [
            { label: 'Troubleshoot', action: 'troubleshoot' },
            { label: 'Switch to Backup', action: 'switch-backup' }
          ]
        },
        {
          id: 'alert-3',
          type: 'info',
          title: 'Security Update Available',
          message: 'System security patch available for installation',
          severity: 'low',
          component: 'Security',
          timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
          isRead: true,
          actions: [
            { label: 'Update Now', action: 'update' },
            { label: 'Schedule Later', action: 'schedule' }
          ]
        }
      ]

      const mockHealthChecks: HealthCheck[] = [
        {
          id: 'hc-1',
          name: 'Web Server',
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          responseTime: 123,
          message: 'All systems operational'
        },
        {
          id: 'hc-2',
          name: 'Database',
          status: 'critical',
          lastCheck: new Date(Date.now() - 30000).toISOString(),
          responseTime: 5000,
          message: 'Connection timeout',
          details: { attempts: 3, lastError: 'Connection refused' }
        },
        {
          id: 'hc-3',
          name: 'API Gateway',
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          responseTime: 45,
          message: 'Running normally'
        },
        {
          id: 'hc-4',
          name: 'Authentication Service',
          status: 'healthy',
          lastCheck: new Date().toISOString(),
          responseTime: 67,
          message: 'Authentication working correctly'
        },
        {
          id: 'hc-5',
          name: 'File Storage',
          status: 'warning',
          lastCheck: new Date().toISOString(),
          responseTime: 234,
          message: 'Storage usage at 73%',
          details: { usage: 73, threshold: 80 }
        }
      ]

      setSystemMetrics(mockMetrics)
      setRecentActivity(mockActivity)
      setSystemAlerts(mockAlerts)
      setHealthChecks(mockHealthChecks)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh
    setTimeout(() => {
      setIsRefreshing(false)
    }, 2000)
  }

  const handleMarkAlertAsRead = (alertId: string) => {
    setSystemAlerts(alerts =>
      alerts.map(alert =>
        alert.id === alertId ? { ...alert, isRead: true } : alert
      )
    )
  }

  const handleHealthCheck = async (checkId: string) => {
    // Simulate health check
    setHealthChecks(checks =>
      checks.map(check =>
        check.id === checkId
          ? { ...check, lastCheck: new Date().toISOString(), status: 'healthy' }
          : check
      )
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20'
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20'
      case 'critical':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20'
      case 'offline':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      case 'high':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'low':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
    }
  }

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatPercentage = (value: number): string => {
    return `${Math.round(value * 100)}%`
  }

  const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleString()
  }

  const getTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    }
    return 'Just now'
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Shield className="w-6 h-6" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            System overview and administration
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systemMetrics?.overview.totalUsers.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {systemMetrics?.overview.activeUsers.toLocaleString() || '0'} active
                </p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Database className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Projects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systemMetrics?.overview.totalProjects.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {systemMetrics?.overview.activeProjects.toLocaleString() || '0'} active
                </p>
              </div>
            </div>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systemMetrics?.overview.totalTasks.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400">
                  {systemMetrics?.overview.completedTasks.toLocaleString() || '0'} completed
                </p>
              </div>
            </div>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <Zap className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Uptime</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {systemMetrics?.performance.uptime || 0}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {systemMetrics?.performance.responseTime}ms avg response
                </p>
              </div>
            </div>
            <div className={`w-5 h-5 ${systemMetrics?.performance.uptime > 99 ? 'text-green-500' : 'text-yellow-500'}`}>
              {systemMetrics?.performance.uptime > 99 ? <CheckCircle /> : <AlertTriangle />}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart3 /> },
            { id: 'users', label: 'Users', icon: <Users /> },
            { id: 'projects', label: 'Projects', icon: <Database /> },
            { id: 'system', label: 'System', icon: <Server /> },
            { id: 'security', label: 'Security', icon: <Shield /> },
            { id: 'analytics', label: 'Analytics', icon: <LineChart /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Health */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    System Health
                  </h3>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    {healthChecks.map((check) => (
                      <div
                        key={check.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${getStatusColor(check.status)}`}
                      >
                        <div className="flex items-center space-x-3">
                          {check.status === 'healthy' && <CheckCircle className="w-5 h-5 text-green-500" />}
                          {check.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                          {check.status === 'critical' && <XCircle className="w-5 h-5 text-red-500" />}
                          {check.status === 'offline' && <WifiOff className="w-5 h-5 text-gray-500" />}

                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {check.name}
                              </h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(check.status)}`}>
                                {check.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {check.message}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {check.responseTime}ms
                            </p>
                          </div>

                          <button
                            onClick={() => handleHealthCheck(check.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* System Alerts */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    System Alerts
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-full text-xs">
                      {systemAlerts.filter(a => !a.isRead).length}
                    </span>
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  {systemAlerts.slice(0, 5).map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} ${
                        !alert.isRead ? 'border-opacity-100' : 'border-opacity-50'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded ${getSeverityColor(alert.type)}`}>
                          {alert.type === 'error' && <XCircle className="w-5 h-5" />}
                          {alert.type === 'warning' && <AlertTriangle className="w-5 h-5" />}
                          {alert.type === 'info' && <Info className="w-5 h-5" />}
                          {alert.type === 'success' && <CheckCircle className="w-5 h-5" />}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {alert.title}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${getSeverityColor(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {alert.message}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {alert.component} • {getTimeAgo(alert.timestamp)}
                            </span>

                            <div className="flex items-center space-x-2">
                              {alert.actions?.map((action, index) => (
                                <button
                                  key={index}
                                  className="px-3 py-1 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600"
                                >
                                  {action.label}
                                </button>
                              ))}

                              {!alert.isRead && (
                                <button
                                  onClick={() => handleMarkAlertAsRead(alert.id)}
                                  className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Mark as Read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>

          {/* Storage Usage */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Storage Usage
              </h3>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    Total Storage
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {formatBytes(systemMetrics?.storage.totalSpace || 0)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(systemMetrics?.storage.usedSpace || 0) / (systemMetrics?.storage.totalSpace || 1) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <span>{formatBytes(systemMetrics?.storage.usedSpace || 0)} used</span>
                  <span>{formatBytes(systemMetrics?.storage.availableSpace || 0)} available</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Database</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatBytes(systemMetrics?.storage.databaseSize || 0)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Files</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatBytes(systemMetrics?.storage.fileSize || 0)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Backups</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatBytes(systemMetrics?.storage.backupSize || 0)}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Cache</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {formatBytes(systemMetrics?.storage.cacheSize || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Performance Metrics */}
        {activeTab === 'system' && systemMetrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Performance Metrics
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">CPU Usage</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatPercentage(systemMetrics.performance.cpuUsage / 100)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        systemMetrics.performance.cpuUsage > 80
                          ? 'bg-red-600'
                          : systemMetrics.performance.cpuUsage > 60
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${systemMetrics.performance.cpuUsage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Memory Usage</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatPercentage(systemMetrics.performance.memoryUsage / 100)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        systemMetrics.performance.memoryUsage > 80
                          ? 'bg-red-600'
                          : systemMetrics.performance.memoryUsage > 60
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${systemMetrics.performance.memoryUsage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Disk Usage</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatPercentage(systemMetrics.performance.diskUsage / 100)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        systemMetrics.performance.diskUsage > 80
                          ? 'bg-red-600'
                          : systemMetrics.performance.diskUsage > 60
                          ? 'bg-yellow-600'
                          : 'bg-green-600'
                      }`}
                      style={{ width: `${systemMetrics.performance.diskUsage}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Bandwidth</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatBytes(systemMetrics.performance.bandwidth * 1024 * 1024)}/s
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="h-2 bg-blue-600 rounded-full" style={{ width: '45%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  API Metrics
                </h3>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">API Calls</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {systemMetrics.performance.apiCalls.toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Errors</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                      {systemMetrics.performance.errors}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Warnings</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                      {systemMetrics.performance.warnings}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Response Time</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {systemMetrics.performance.responseTime}ms
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        {activeTab === 'overview' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Recent Activity
                </h3>
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                  View All
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {recentActivity.slice(0, 10).map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
                  >
                    <div className={`p-2 rounded-full ${getSeverityColor(activity.severity)}`}>
                      {activity.type === 'login' && <UserCheck className="w-4 h-4" />}
                      {activity.type === 'logout' && <UserX className="w-4 h-4" />}
                      {activity.type === 'action' && <Activity className="w-4 h-4" />}
                      {activity.type === 'error' && <XCircle className="w-4 h-4" />}
                      {activity.type === 'warning' && <AlertTriangle className="w-4 h-4" />}
                      {activity.type === 'success' && <CheckCircle className="w-4 h-4" />}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.description}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {getTimeAgo(activity.timestamp)}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 mt-1">
                        <img
                          src={`https://picsum.photos/seed/${activity.userId}/32/32.jpg`}
                          alt={activity.userName}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {activity.userName}
                        </span>
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                          {activity.userRole}
                        </span>
                      </div>

                      {activity.ipAddress && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          IP: {activity.ipAddress}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminDashboardPage