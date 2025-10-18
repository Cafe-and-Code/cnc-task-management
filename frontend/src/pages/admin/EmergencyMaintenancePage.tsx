import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Shield,
  Ban,
  Users,
  Clock,
  Zap,
  Server,
  Database,
  Wifi,
  RefreshCw,
  Play,
  Pause,
  Square,
  CheckCircle,
  XCircle,
  Info,
  AlertCircle,
  Power,
  PowerOff,
  Settings,
  Bell,
  Mail,
  Smartphone,
  Monitor,
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Save,
  Download,
  Upload,
  Calendar,
  Timer,
  Activity,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  ChevronDown,
  Search,
  Filter,
  Copy,
  ExternalLink,
  Terminal,
  FileText,
  Archive,
  HardDrive,
  Cpu,
  MemoryStick,
  Cloud,
  Radio,
  UserCheck,
  UserMinus,
  UserPlus,
} from 'lucide-react';

// Types
interface MaintenanceMode {
  enabled: boolean;
  reason: string;
  message: string;
  startTime: string;
  endTime?: string;
  affectedSystems: string[];
  allowedUsers: string[];
  notifications: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
    webhook: boolean;
  };
  bypassCode?: string;
  createdBy: string;
  createdAt: string;
  lastModified: string;
}

interface EmergencyProcedure {
  id: string;
  name: string;
  description: string;
  category: 'shutdown' | 'restart' | 'isolation' | 'backup' | 'restore' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  steps: Array<{
    order: number;
    title: string;
    description: string;
    command?: string;
    expectedDuration: number;
    requiresConfirmation: boolean;
    rollbackStep?: string;
  }>;
  prerequisites: string[];
  risks: string[];
  rollbackAvailable: boolean;
  lastExecuted?: string;
  executedBy?: string;
  successRate?: number;
}

interface SystemStatus {
  component: string;
  type: 'database' | 'application' | 'cache' | 'queue' | 'storage' | 'network' | 'security';
  status: 'operational' | 'degraded' | 'offline' | 'maintenance' | 'critical';
  metrics?: {
    responseTime?: number;
    errorRate?: number;
    throughput?: number;
    connections?: number;
    cpu?: number;
    memory?: number;
    disk?: number;
  };
  lastCheck: string;
  issues: Array<{
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    detectedAt: string;
  }>;
}

interface MaintenanceSchedule {
  id: string;
  title: string;
  description: string;
  type: 'planned' | 'emergency' | 'security';
  startTime: string;
  endTime: string;
  duration: number;
  affectedSystems: string[];
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdBy: string;
  assignedTo?: string;
  notifications: {
    advanceNotice: number; // hours
    stakeholders: string[];
    channels: string[];
  };
  procedures: string[];
  checklist: Array<{
    item: string;
    completed: boolean;
    completedBy?: string;
    completedAt?: string;
  }>;
}

interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  department: string;
  priority: 1 | 2 | 3 | 4 | 5;
  contact: {
    email: string;
    phone: string;
    sms: string;
    slack?: string;
  };
  availability: {
    hours: string;
    timezone: string;
    onCall: boolean;
    lastContacted?: string;
  };
  responsibilities: string[];
}

const EmergencyMaintenancePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [maintenanceMode, setMaintenanceMode] = useState<MaintenanceMode>({
    enabled: false,
    reason: '',
    message: '',
    startTime: '',
    affectedSystems: [],
    allowedUsers: [],
    notifications: {
      email: true,
      sms: false,
      inApp: true,
      webhook: false,
    },
    createdBy: 'admin@company.com',
    createdAt: '',
    lastModified: '',
  });
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [emergencyProcedures, setEmergencyProcedures] = useState<EmergencyProcedure[]>([]);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<MaintenanceSchedule[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProcedureModal, setShowProcedureModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [selectedProcedure, setSelectedProcedure] = useState<EmergencyProcedure | null>(null);
  const [executingStep, setExecutingStep] = useState<string | null>(null);
  const [showBypassCode, setShowBypassCode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data generation
  useEffect(() => {
    const generateSystemStatus = (): SystemStatus[] => [
      {
        component: 'Application Server',
        type: 'application',
        status: 'operational',
        metrics: {
          responseTime: 120,
          errorRate: 0.1,
          throughput: 850,
          cpu: 45,
          memory: 67,
        },
        lastCheck: '2024-01-15T10:30:00Z',
        issues: [],
      },
      {
        component: 'Primary Database',
        type: 'database',
        status: 'operational',
        metrics: {
          responseTime: 25,
          connections: 85,
          cpu: 32,
          memory: 54,
          disk: 67,
        },
        lastCheck: '2024-01-15T10:30:00Z',
        issues: [],
      },
      {
        component: 'Redis Cache',
        type: 'cache',
        status: 'degraded',
        metrics: {
          memory: 89,
          connections: 145,
          throughput: 5000,
        },
        lastCheck: '2024-01-15T10:29:00Z',
        issues: [
          {
            type: 'high_memory_usage',
            description: 'Memory usage is approaching 90%',
            severity: 'medium',
            detectedAt: '2024-01-15T10:15:00Z',
          },
        ],
      },
      {
        component: 'Message Queue',
        type: 'queue',
        status: 'operational',
        metrics: {
          throughput: 1250,
          connections: 25,
          cpu: 12,
          memory: 34,
        },
        lastCheck: '2024-01-15T10:30:00Z',
        issues: [],
      },
      {
        component: 'File Storage',
        type: 'storage',
        status: 'operational',
        metrics: {
          disk: 45,
          throughput: 250,
        },
        lastCheck: '2024-01-15T10:30:00Z',
        issues: [],
      },
      {
        component: 'Load Balancer',
        type: 'network',
        status: 'operational',
        metrics: {
          responseTime: 15,
          throughput: 2100,
          connections: 1250,
        },
        lastCheck: '2024-01-15T10:30:00Z',
        issues: [],
      },
    ];

    const generateEmergencyProcedures = (): EmergencyProcedure[] => [
      {
        id: 'proc-1',
        name: 'Emergency System Shutdown',
        description: 'Gracefully shutdown all system components in case of emergency',
        category: 'shutdown',
        severity: 'critical',
        steps: [
          {
            order: 1,
            title: 'Notify all active users',
            description:
              'Send immediate notification to all logged-in users about impending shutdown',
            expectedDuration: 2,
            requiresConfirmation: true,
            rollbackStep: 'Cancel user notifications',
          },
          {
            order: 2,
            title: 'Stop accepting new requests',
            description: 'Configure load balancer to stop accepting new requests',
            command: 'lbctl --stop-accepting-requests',
            expectedDuration: 1,
            requiresConfirmation: true,
          },
          {
            order: 3,
            title: 'Wait for active requests to complete',
            description: 'Monitor active requests and wait for them to complete or timeout',
            expectedDuration: 5,
            requiresConfirmation: false,
          },
          {
            order: 4,
            title: 'Shutdown application servers',
            description: 'Gracefully shutdown all application server instances',
            command: 'systemctl stop app-server',
            expectedDuration: 3,
            requiresConfirmation: true,
          },
          {
            order: 5,
            title: 'Shutdown database connections',
            description: 'Close all database connections and shutdown database services',
            command: 'systemctl stop postgresql',
            expectedDuration: 2,
            requiresConfirmation: true,
          },
        ],
        prerequisites: ['System administrator access', 'Backup verification'],
        risks: ['Data loss if backup not current', 'Extended downtime if rollback fails'],
        rollbackAvailable: true,
        lastExecuted: '2024-01-10T14:30:00Z',
        executedBy: 'admin@company.com',
        successRate: 95,
      },
      {
        id: 'proc-2',
        name: 'Database Emergency Restart',
        description: 'Restart database services in case of failure or performance issues',
        category: 'restart',
        severity: 'high',
        steps: [
          {
            order: 1,
            title: 'Enable maintenance mode',
            description: 'Put application into maintenance mode to prevent new connections',
            expectedDuration: 1,
            requiresConfirmation: true,
          },
          {
            order: 2,
            title: 'Check database status',
            description: 'Verify current database status and identify issues',
            command: 'pg_isready -h localhost',
            expectedDuration: 1,
            requiresConfirmation: false,
          },
          {
            order: 3,
            title: 'Stop database service',
            description: 'Stop the PostgreSQL database service',
            command: 'systemctl stop postgresql',
            expectedDuration: 2,
            requiresConfirmation: true,
          },
          {
            order: 4,
            title: 'Perform integrity check',
            description: 'Run database integrity check before restart',
            command: 'pg_controldata /var/lib/postgresql/data',
            expectedDuration: 3,
            requiresConfirmation: false,
          },
          {
            order: 5,
            title: 'Start database service',
            description: 'Start the PostgreSQL database service',
            command: 'systemctl start postgresql',
            expectedDuration: 2,
            requiresConfirmation: true,
          },
          {
            order: 6,
            title: 'Verify connectivity',
            description: 'Test database connectivity and perform health checks',
            expectedDuration: 2,
            requiresConfirmation: false,
          },
          {
            order: 7,
            title: 'Disable maintenance mode',
            description: 'Take application out of maintenance mode',
            expectedDuration: 1,
            requiresConfirmation: true,
          },
        ],
        prerequisites: ['Database administrator access', 'Recent backup available'],
        risks: ['Data corruption during restart', 'Extended service interruption'],
        rollbackAvailable: true,
        lastExecuted: '2024-01-12T09:15:00Z',
        executedBy: 'dba@company.com',
        successRate: 98,
      },
      {
        id: 'proc-3',
        name: 'Security Incident Response',
        description: 'Isolate affected systems and contain security breach',
        category: 'security',
        severity: 'critical',
        steps: [
          {
            order: 1,
            title: 'Identify affected systems',
            description: 'Identify all systems potentially affected by the security incident',
            expectedDuration: 5,
            requiresConfirmation: false,
          },
          {
            order: 2,
            title: 'Isolate compromised systems',
            description: 'Network isolation of compromised systems to prevent lateral movement',
            command: 'iptables -A INPUT -s <compromised_ip> -j DROP',
            expectedDuration: 2,
            requiresConfirmation: true,
          },
          {
            order: 3,
            title: 'Force logout all sessions',
            description: 'Immediately invalidate all user sessions',
            command: 'redis-cli FLUSHALL',
            expectedDuration: 1,
            requiresConfirmation: true,
          },
          {
            order: 4,
            title: 'Change all credentials',
            description: 'Reset all system credentials and API keys',
            expectedDuration: 10,
            requiresConfirmation: true,
          },
          {
            order: 5,
            title: 'Enable enhanced monitoring',
            description: 'Enable comprehensive security monitoring and logging',
            expectedDuration: 3,
            requiresConfirmation: false,
          },
        ],
        prerequisites: ['Security team coordination', 'Incident response plan'],
        risks: ['Service disruption during isolation', 'Potential data exposure'],
        rollbackAvailable: false,
        successRate: 85,
      },
    ];

    const generateMaintenanceSchedule = (): MaintenanceSchedule[] => [
      {
        id: 'sched-1',
        title: 'Monthly Security Updates',
        description: 'Apply security patches and updates to all systems',
        type: 'planned',
        startTime: '2024-01-20T02:00:00Z',
        endTime: '2024-01-20T06:00:00Z',
        duration: 240,
        affectedSystems: ['Application Server', 'Database', 'Load Balancer'],
        impact: 'medium',
        status: 'scheduled',
        createdBy: 'admin@company.com',
        assignedTo: 'ops-team@company.com',
        notifications: {
          advanceNotice: 48,
          stakeholders: ['all-users', 'management', 'support'],
          channels: ['email', 'in-app', 'slack'],
        },
        procedures: ['proc-1', 'proc-2'],
        checklist: [
          { item: 'Create system backup', completed: false },
          { item: 'Notify stakeholders', completed: false },
          { item: 'Apply security patches', completed: false },
          { item: 'Verify system functionality', completed: false },
          { item: 'Update documentation', completed: false },
        ],
      },
      {
        id: 'sched-2',
        title: 'Emergency Database Maintenance',
        description: 'Emergency maintenance to resolve performance issues',
        type: 'emergency',
        startTime: '2024-01-15T11:00:00Z',
        endTime: '2024-01-15T13:00:00Z',
        duration: 120,
        affectedSystems: ['Primary Database', 'Application Server'],
        impact: 'high',
        status: 'in_progress',
        createdBy: 'dba@company.com',
        assignedTo: 'database-team@company.com',
        notifications: {
          advanceNotice: 1,
          stakeholders: ['management', 'support'],
          channels: ['email', 'slack', 'sms'],
        },
        procedures: ['proc-2'],
        checklist: [
          {
            item: 'Enable maintenance mode',
            completed: true,
            completedBy: 'admin@company.com',
            completedAt: '2024-01-15T11:00:00Z',
          },
          {
            item: 'Create emergency backup',
            completed: true,
            completedBy: 'dba@company.com',
            completedAt: '2024-01-15T11:05:00Z',
          },
          { item: 'Perform database optimization', completed: false },
          { item: 'Restore normal operations', completed: false },
        ],
      },
    ];

    const generateEmergencyContacts = (): EmergencyContact[] => [
      {
        id: 'contact-1',
        name: 'John Smith',
        role: 'System Administrator',
        department: 'IT Operations',
        priority: 1,
        contact: {
          email: 'john.smith@company.com',
          phone: '+1-555-0101',
          sms: '+1-555-0101',
          slack: '@johnsmith',
        },
        availability: {
          hours: '24/7',
          timezone: 'EST',
          onCall: true,
          lastContacted: '2024-01-15T09:30:00Z',
        },
        responsibilities: ['System maintenance', 'Emergency response', 'Backup management'],
      },
      {
        id: 'contact-2',
        name: 'Sarah Johnson',
        role: 'Database Administrator',
        department: 'Database Team',
        priority: 1,
        contact: {
          email: 'sarah.johnson@company.com',
          phone: '+1-555-0102',
          sms: '+1-555-0102',
          slack: '@sarahj',
        },
        availability: {
          hours: '24/7',
          timezone: 'EST',
          onCall: true,
        },
        responsibilities: ['Database maintenance', 'Performance tuning', 'Backup verification'],
      },
      {
        id: 'contact-3',
        name: 'Mike Chen',
        role: 'Security Officer',
        department: 'Security',
        priority: 1,
        contact: {
          email: 'mike.chen@company.com',
          phone: '+1-555-0103',
          sms: '+1-555-0103',
          slack: '@mikechen',
        },
        availability: {
          hours: '24/7',
          timezone: 'PST',
          onCall: false,
        },
        responsibilities: ['Security incident response', 'Vulnerability management', 'Compliance'],
      },
    ];

    setSystemStatus(generateSystemStatus());
    setEmergencyProcedures(generateEmergencyProcedures());
    setMaintenanceSchedule(generateMaintenanceSchedule());
    setEmergencyContacts(generateEmergencyContacts());
    setLoading(false);
  }, []);

  const handleEnableMaintenanceMode = () => {
    setMaintenanceMode(prev => ({
      ...prev,
      enabled: true,
      startTime: new Date().toISOString(),
      createdBy: 'admin@company.com',
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }));
    setShowMaintenanceModal(false);
  };

  const handleDisableMaintenanceMode = () => {
    setMaintenanceMode(prev => ({
      ...prev,
      enabled: false,
      endTime: new Date().toISOString(),
      lastModified: new Date().toISOString(),
    }));
  };

  const handleExecuteProcedure = async (procedureId: string) => {
    const procedure = emergencyProcedures.find(p => p.id === procedureId);
    if (!procedure) return;

    setSelectedProcedure(procedure);
    setShowProcedureModal(true);
  };

  const handleExecuteStep = async (stepOrder: number) => {
    setExecutingStep(`step-${stepOrder}`);
    // Simulate step execution
    await new Promise(resolve => setTimeout(resolve, 2000));
    setExecutingStep(null);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      operational: 'text-green-600',
      degraded: 'text-yellow-600',
      offline: 'text-red-600',
      maintenance: 'text-blue-600',
      critical: 'text-red-600',
      scheduled: 'text-blue-600',
      in_progress: 'text-yellow-600',
      completed: 'text-green-600',
      cancelled: 'text-gray-600',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      operational: <CheckCircle className="w-5 h-5" />,
      degraded: <AlertTriangle className="w-5 h-5" />,
      offline: <XCircle className="w-5 h-5" />,
      maintenance: <Settings className="w-5 h-5" />,
      critical: <AlertTriangle className="w-5 h-5" />,
      scheduled: <Calendar className="w-5 h-5" />,
      in_progress: <RefreshCw className="w-5 h-5 animate-spin" />,
      completed: <CheckCircle className="w-5 h-5" />,
      cancelled: <XCircle className="w-5 h-5" />,
    };
    return icons[status as keyof typeof icons] || <Info className="w-5 h-5" />;
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency Maintenance</h1>
            <p className="text-gray-600">
              Critical system control and emergency response procedures
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {maintenanceMode.enabled ? (
              <button
                onClick={handleDisableMaintenanceMode}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <PowerOff className="w-4 h-4 mr-2" />
                Disable Maintenance Mode
              </button>
            ) : (
              <button
                onClick={() => setShowMaintenanceModal(true)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Enable Maintenance Mode
              </button>
            )}
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Bell className="w-4 h-4 mr-2" />
              Test Notifications
            </button>
          </div>
        </div>
      </div>

      {/* Maintenance Mode Status */}
      <div
        className={`rounded-lg p-4 mb-8 ${
          maintenanceMode.enabled
            ? 'bg-yellow-50 border border-yellow-200'
            : 'bg-green-50 border border-green-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div
              className={`p-2 rounded-lg ${
                maintenanceMode.enabled ? 'bg-yellow-100' : 'bg-green-100'
              }`}
            >
              {maintenanceMode.enabled ? (
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              ) : (
                <CheckCircle className="w-6 h-6 text-green-600" />
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {maintenanceMode.enabled ? 'Maintenance Mode Active' : 'System Operational'}
              </h3>
              <p className="text-sm text-gray-600">
                {maintenanceMode.enabled
                  ? `Started at ${new Date(maintenanceMode.startTime).toLocaleString()}`
                  : 'All systems are operating normally'}
              </p>
            </div>
          </div>
          {maintenanceMode.enabled && (
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowBypassCode(!showBypassCode)}
                className="flex items-center px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Key className="w-4 h-4 mr-2" />
                {showBypassCode ? 'Hide' : 'Show'} Bypass Code
              </button>
            </div>
          )}
        </div>
        {maintenanceMode.enabled && showBypassCode && (
          <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-yellow-800">Emergency Bypass Code</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Share this code only with authorized personnel who need emergency access
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <code className="px-3 py-2 bg-white rounded text-yellow-800 font-mono">
                  EMERGENCY-2024-BYPASS
                </code>
                <button className="p-1 text-yellow-600 hover:bg-yellow-200 rounded">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'procedures', 'schedule', 'contacts'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* System Status Grid */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">System Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {systemStatus.map(system => (
                <div key={system.component} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div
                        className={`p-2 rounded-lg ${
                          system.status === 'operational'
                            ? 'bg-green-100'
                            : system.status === 'degraded'
                              ? 'bg-yellow-100'
                              : system.status === 'offline'
                                ? 'bg-red-100'
                                : system.status === 'maintenance'
                                  ? 'bg-blue-100'
                                  : 'bg-gray-100'
                        }`}
                      >
                        {system.type === 'application' && (
                          <Server className="w-5 h-5 text-green-600" />
                        )}
                        {system.type === 'database' && (
                          <Database className="w-5 h-5 text-green-600" />
                        )}
                        {system.type === 'cache' && (
                          <MemoryStick className="w-5 h-5 text-green-600" />
                        )}
                        {system.type === 'queue' && <Radio className="w-5 h-5 text-green-600" />}
                        {system.type === 'storage' && (
                          <HardDrive className="w-5 h-5 text-green-600" />
                        )}
                        {system.type === 'network' && <Wifi className="w-5 h-5 text-green-600" />}
                      </div>
                      <div className="ml-3">
                        <h3 className="font-medium text-gray-900">{system.component}</h3>
                        <p className="text-sm text-gray-500 capitalize">{system.type}</p>
                      </div>
                    </div>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        system.status === 'operational'
                          ? 'bg-green-500'
                          : system.status === 'degraded'
                            ? 'bg-yellow-500'
                            : system.status === 'offline'
                              ? 'bg-red-500'
                              : system.status === 'maintenance'
                                ? 'bg-blue-500'
                                : 'bg-gray-500'
                      }`}
                    ></div>
                  </div>

                  {/* Metrics */}
                  {system.metrics && (
                    <div className="space-y-2 mb-4">
                      {system.metrics.responseTime && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Response:</span>
                          <span
                            className={
                              system.metrics.responseTime > 500 ? 'text-red-600' : 'text-gray-900'
                            }
                          >
                            {system.metrics.responseTime}ms
                          </span>
                        </div>
                      )}
                      {system.metrics.cpu && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">CPU:</span>
                          <span
                            className={system.metrics.cpu > 80 ? 'text-red-600' : 'text-gray-900'}
                          >
                            {system.metrics.cpu}%
                          </span>
                        </div>
                      )}
                      {system.metrics.memory && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Memory:</span>
                          <span
                            className={
                              system.metrics.memory > 85 ? 'text-red-600' : 'text-gray-900'
                            }
                          >
                            {system.metrics.memory}%
                          </span>
                        </div>
                      )}
                      {system.metrics.connections && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Connections:</span>
                          <span className="text-gray-900">{system.metrics.connections}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Issues */}
                  {system.issues.length > 0 && (
                    <div className="space-y-2">
                      {system.issues.map((issue, index) => (
                        <div key={index} className="p-2 bg-red-50 rounded text-xs text-red-700">
                          <div className="font-medium">{issue.type.replace(/_/g, ' ')}</div>
                          <div>{issue.description}</div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 text-xs text-gray-500">
                    Last check: {new Date(system.lastCheck).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Maintenance */}
          {maintenanceSchedule.filter(s => s.status === 'in_progress').length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Maintenance</h2>
              <div className="space-y-4">
                {maintenanceSchedule
                  .filter(s => s.status === 'in_progress')
                  .map(schedule => (
                    <div key={schedule.id} className="bg-white rounded-lg shadow p-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900">{schedule.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{schedule.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Started: {new Date(schedule.startTime).toLocaleString()}</span>
                            <span>Duration: {formatDuration(schedule.duration)}</span>
                            <span>Impact: {schedule.impact}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RefreshCw className="w-5 h-5 text-yellow-600 animate-spin" />
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(schedule.impact)}`}
                          >
                            {schedule.impact.toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-2">Progress</h4>
                        <div className="space-y-2">
                          {schedule.checklist.map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                className="rounded border-gray-300"
                                readOnly
                              />
                              <span
                                className={`text-sm ${item.completed ? 'text-gray-900' : 'text-gray-500'}`}
                              >
                                {item.item}
                              </span>
                              {item.completed && item.completedBy && (
                                <span className="text-xs text-gray-400">
                                  by {item.completedBy} at{' '}
                                  {item.completedAt &&
                                    new Date(item.completedAt).toLocaleTimeString()}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Procedures Tab */}
      {activeTab === 'procedures' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Emergency Procedures</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search procedures..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {emergencyProcedures
              .filter(
                proc =>
                  !searchTerm ||
                  proc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  proc.description.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map(procedure => (
                <div key={procedure.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{procedure.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{procedure.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(procedure.severity)}`}
                      >
                        {procedure.severity.toUpperCase()}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800`}
                      >
                        {procedure.category}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        {procedure.steps.reduce((total, step) => total + step.expectedDuration, 0)}{' '}
                        minutes total
                      </span>
                    </div>
                    <div className="flex items-center text-sm">
                      <AlertTriangle className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-gray-600">
                        {procedure.risks.length} risk{procedure.risks.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    {procedure.successRate && (
                      <div className="flex items-center text-sm">
                        <TrendingUp className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{procedure.successRate}% success rate</span>
                      </div>
                    )}
                    {procedure.lastExecuted && (
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">
                          Last executed: {new Date(procedure.lastExecuted).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      {procedure.steps.length} steps •{' '}
                      {procedure.rollbackAvailable ? 'Rollback available' : 'No rollback'}
                    </div>
                    <button
                      onClick={() => handleExecuteProcedure(procedure.id)}
                      className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Execute
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Schedule Tab */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Maintenance Schedule</h2>
            <button
              onClick={() => setShowScheduleModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Schedule Maintenance
            </button>
          </div>

          <div className="space-y-4">
            {maintenanceSchedule.map(schedule => (
              <div key={schedule.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-medium text-gray-900">{schedule.title}</h3>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          schedule.type === 'planned'
                            ? 'bg-blue-100 text-blue-800'
                            : schedule.type === 'emergency'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-orange-100 text-orange-800'
                        }`}
                      >
                        {schedule.type}
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(schedule.impact)}`}
                      >
                        {schedule.impact} impact
                      </span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(schedule.status)}`}
                      >
                        {schedule.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{schedule.description}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span>
                        <Calendar className="w-4 h-4 inline mr-1" />
                        {new Date(schedule.startTime).toLocaleString()}
                      </span>
                      <span>
                        <Clock className="w-4 h-4 inline mr-1" />
                        {formatDuration(schedule.duration)}
                      </span>
                      <span>
                        <Users className="w-4 h-4 inline mr-1" />
                        {schedule.assignedTo || schedule.createdBy}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {schedule.status === 'scheduled' && (
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                    {schedule.status === 'in_progress' && (
                      <button
                        className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                        title="View Progress"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {schedule.status === 'in_progress' && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Progress</h4>
                    <div className="w-full bg-yellow-200 rounded-full h-2 mb-2">
                      <div
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{
                          width: `${(schedule.checklist.filter(item => item.completed).length / schedule.checklist.length) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-sm text-yellow-700">
                      {schedule.checklist.filter(item => item.completed).length} of{' '}
                      {schedule.checklist.length} tasks completed
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contacts Tab */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <h2 className="text-lg font-semibold text-gray-900">Emergency Contacts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {emergencyContacts
              .sort((a, b) => a.priority - b.priority)
              .map(contact => (
                <div key={contact.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{contact.name}</h3>
                      <p className="text-sm text-gray-600">{contact.role}</p>
                      <p className="text-xs text-gray-500">{contact.department}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {contact.priority === 1 && (
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          Priority 1
                        </span>
                      )}
                      {contact.availability.onCall && (
                        <div className="flex items-center text-green-600">
                          <Smartphone className="w-4 h-4 mr-1" />
                          <span className="text-xs">On Call</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <Mail className="w-4 h-4 text-gray-400 mr-2" />
                      <a
                        href={`mailto:${contact.contact.email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {contact.contact.email}
                      </a>
                    </div>
                    <div className="flex items-center text-sm">
                      <Smartphone className="w-4 h-4 text-gray-400 mr-2" />
                      <a
                        href={`tel:${contact.contact.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {contact.contact.phone}
                      </a>
                    </div>
                    {contact.contact.slack && (
                      <div className="flex items-center text-sm">
                        <Monitor className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="text-gray-600">{contact.contact.slack}</span>
                      </div>
                    )}
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Availability</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Hours: {contact.availability.hours}</div>
                      <div>Timezone: {contact.availability.timezone}</div>
                      {contact.availability.lastContacted && (
                        <div>
                          Last contacted:{' '}
                          {new Date(contact.availability.lastContacted).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Responsibilities</h4>
                    <div className="flex flex-wrap gap-1">
                      {contact.responsibilities.map((responsibility, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                        >
                          {responsibility}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Emergency Procedure Execution Modal */}
      {showProcedureModal && selectedProcedure && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Execute Emergency Procedure</h2>
                <button
                  onClick={() => {
                    setShowProcedureModal(false);
                    setSelectedProcedure(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900">{selectedProcedure.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{selectedProcedure.description}</p>
                <div className="flex items-center space-x-4 mt-3">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(selectedProcedure.severity)}`}
                  >
                    {selectedProcedure.severity.toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {selectedProcedure.steps.length} steps •{' '}
                    {selectedProcedure.steps.reduce(
                      (total, step) => total + step.expectedDuration,
                      0
                    )}{' '}
                    minutes
                  </span>
                  {selectedProcedure.rollbackAvailable && (
                    <span className="text-sm text-green-600">Rollback available</span>
                  )}
                </div>
              </div>

              {selectedProcedure.prerequisites.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">Prerequisites</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {selectedProcedure.prerequisites.map((prereq, index) => (
                      <li key={index}>• {prereq}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedProcedure.risks.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Risks</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {selectedProcedure.risks.map((risk, index) => (
                      <li key={index}>• {risk}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Procedure Steps</h4>
                {selectedProcedure.steps.map((step, index) => (
                  <div key={step.order} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                            {step.order}
                          </span>
                          <h5 className="font-medium text-gray-900">{step.title}</h5>
                          <span className="text-sm text-gray-500">{step.expectedDuration} min</span>
                          {step.requiresConfirmation && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                              Requires confirmation
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-2">{step.description}</p>
                        {step.command && (
                          <div className="mt-3 p-2 bg-gray-100 rounded">
                            <code className="text-xs text-gray-800">{step.command}</code>
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleExecuteStep(step.order)}
                        disabled={executingStep === `step-${step.order}`}
                        className="flex items-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        {executingStep === `step-${step.order}` ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Executing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Execute
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowProcedureModal(false);
                    setSelectedProcedure(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Execute All Steps
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmergencyMaintenancePage;
