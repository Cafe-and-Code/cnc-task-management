import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Globe,
  Mail,
  Shield,
  Bell,
  Key,
  Server,
  Cloud,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  Download,
  Upload,
  Search,
  Filter,
  ChevronDown,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  AlertCircle,
  Copy,
  Edit,
  Trash2,
  Plus,
  FileText,
  Terminal,
  Code,
  Zap,
  Activity,
  Clock,
  Calendar,
  Users,
  UserCheck,
  Ban,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
} from 'lucide-react';

// Types
interface ConfigurationCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  settings: ConfigurationSetting[];
  permissions: string[];
  lastModified: string;
  modifiedBy: string;
}

interface ConfigurationSetting {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json' | 'array' | 'password' | 'select' | 'textarea';
  description: string;
  category: string;
  required: boolean;
  sensitive: boolean;
  encrypted: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    options?: string[];
  };
  defaultValue: any;
  environment: 'all' | 'development' | 'staging' | 'production';
  lastModified: string;
  modifiedBy: string;
}

interface ConfigurationHistory {
  id: string;
  settingId: string;
  settingKey: string;
  oldValue: any;
  newValue: any;
  changedBy: string;
  changedAt: string;
  environment: string;
  reason?: string;
}

interface EnvironmentConfig {
  name: string;
  displayName: string;
  status: 'active' | 'inactive' | 'maintenance';
  lastDeployed?: string;
  version: string;
  databaseUrl: string;
  redisUrl: string;
  apiEndpoint: string;
  features: Record<string, boolean>;
  limits: {
    maxUsers: number;
    maxProjects: number;
    storageLimit: number;
    apiRateLimit: number;
  };
}

interface SystemResource {
  name: string;
  type: 'database' | 'cache' | 'queue' | 'storage' | 'compute';
  status: 'healthy' | 'warning' | 'error';
  metrics: {
    cpu?: number;
    memory?: number;
    disk?: number;
    connections?: number;
    throughput?: number;
  };
  configuration: Record<string, any>;
  lastCheck: string;
}

const SystemConfigurationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [configCategories, setConfigCategories] = useState<ConfigurationCategory[]>([]);
  const [configHistory, setConfigHistory] = useState<ConfigurationHistory[]>([]);
  const [environments, setEnvironments] = useState<EnvironmentConfig[]>([]);
  const [systemResources, setSystemResources] = useState<SystemResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnvironment, setSelectedEnvironment] = useState('all');
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<ConfigurationSetting | null>(null);

  // Mock data generation
  useEffect(() => {
    const generateConfigCategories = (): ConfigurationCategory[] => [
      {
        id: 'general',
        name: 'General Settings',
        description: 'Basic system configuration and settings',
        icon: <Settings className="w-5 h-5" />,
        permissions: ['admin'],
        lastModified: '2024-01-15T10:30:00Z',
        modifiedBy: 'admin@company.com',
        settings: [
          {
            id: 'app_name',
            key: 'APP_NAME',
            value: 'CNC Task Management',
            type: 'string',
            description: 'Application name displayed in UI and emails',
            category: 'general',
            required: true,
            sensitive: false,
            encrypted: false,
            defaultValue: 'CNC Task Management',
            environment: 'all',
            lastModified: '2024-01-15T10:30:00Z',
            modifiedBy: 'admin@company.com',
          },
          {
            id: 'app_version',
            key: 'APP_VERSION',
            value: '2.1.0',
            type: 'string',
            description: 'Current application version',
            category: 'general',
            required: true,
            sensitive: false,
            encrypted: false,
            defaultValue: '1.0.0',
            environment: 'all',
            lastModified: '2024-01-10T09:15:00Z',
            modifiedBy: 'system',
          },
          {
            id: 'maintenance_mode',
            key: 'MAINTENANCE_MODE',
            value: false,
            type: 'boolean',
            description: 'Enable maintenance mode to disable user access',
            category: 'general',
            required: false,
            sensitive: false,
            encrypted: false,
            defaultValue: false,
            environment: 'all',
            lastModified: '2024-01-14T16:45:00Z',
            modifiedBy: 'admin@company.com',
          },
          {
            id: 'debug_mode',
            key: 'DEBUG_MODE',
            value: false,
            type: 'boolean',
            description: 'Enable debug logging and verbose output',
            category: 'general',
            required: false,
            sensitive: false,
            encrypted: false,
            defaultValue: false,
            environment: 'development',
            lastModified: '2024-01-12T11:20:00Z',
            modifiedBy: 'dev@company.com',
          },
        ],
      },
      {
        id: 'database',
        name: 'Database Configuration',
        description: 'Database connection and performance settings',
        icon: <Database className="w-5 h-5" />,
        permissions: ['admin', 'dba'],
        lastModified: '2024-01-14T14:20:00Z',
        modifiedBy: 'dba@company.com',
        settings: [
          {
            id: 'db_host',
            key: 'DB_HOST',
            value: 'postgres-prod.cnc-taskmanager.com',
            type: 'string',
            description: 'Database server hostname',
            category: 'database',
            required: true,
            sensitive: false,
            encrypted: false,
            defaultValue: 'localhost',
            environment: 'production',
            lastModified: '2024-01-14T14:20:00Z',
            modifiedBy: 'dba@company.com',
          },
          {
            id: 'db_port',
            key: 'DB_PORT',
            value: 5432,
            type: 'number',
            description: 'Database server port',
            category: 'database',
            required: true,
            sensitive: false,
            encrypted: false,
            defaultValue: 5432,
            validation: { min: 1, max: 65535 },
            environment: 'all',
            lastModified: '2024-01-10T09:15:00Z',
            modifiedBy: 'system',
          },
          {
            id: 'db_password',
            key: 'DB_PASSWORD',
            value: 'encrypted_password_here',
            type: 'password',
            description: 'Database connection password',
            category: 'database',
            required: true,
            sensitive: true,
            encrypted: true,
            defaultValue: '',
            environment: 'all',
            lastModified: '2024-01-08T13:45:00Z',
            modifiedBy: 'dba@company.com',
          },
          {
            id: 'db_pool_size',
            key: 'DB_POOL_SIZE',
            value: 20,
            type: 'number',
            description: 'Database connection pool size',
            category: 'database',
            required: false,
            sensitive: false,
            encrypted: false,
            defaultValue: 10,
            validation: { min: 1, max: 100 },
            environment: 'production',
            lastModified: '2024-01-12T15:30:00Z',
            modifiedBy: 'dba@company.com',
          },
        ],
      },
      {
        id: 'email',
        name: 'Email Configuration',
        description: 'SMTP settings and email templates',
        icon: <Mail className="w-5 h-5" />,
        permissions: ['admin'],
        lastModified: '2024-01-13T11:45:00Z',
        modifiedBy: 'admin@company.com',
        settings: [
          {
            id: 'smtp_host',
            key: 'SMTP_HOST',
            value: 'smtp.cnc-taskmanager.com',
            type: 'string',
            description: 'SMTP server hostname',
            category: 'email',
            required: true,
            sensitive: false,
            encrypted: false,
            defaultValue: 'localhost',
            environment: 'all',
            lastModified: '2024-01-13T11:45:00Z',
            modifiedBy: 'admin@company.com',
          },
          {
            id: 'smtp_port',
            key: 'SMTP_PORT',
            value: 587,
            type: 'number',
            description: 'SMTP server port',
            category: 'email',
            required: true,
            sensitive: false,
            encrypted: false,
            defaultValue: 587,
            validation: { min: 1, max: 65535 },
            environment: 'all',
            lastModified: '2024-01-10T09:15:00Z',
            modifiedBy: 'system',
          },
          {
            id: 'smtp_username',
            key: 'SMTP_USERNAME',
            value: 'noreply@cnc-taskmanager.com',
            type: 'string',
            description: 'SMTP authentication username',
            category: 'email',
            required: true,
            sensitive: false,
            encrypted: false,
            defaultValue: '',
            environment: 'all',
            lastModified: '2024-01-13T11:45:00Z',
            modifiedBy: 'admin@company.com',
          },
          {
            id: 'smtp_password',
            key: 'SMTP_PASSWORD',
            value: 'encrypted_smtp_password',
            type: 'password',
            description: 'SMTP authentication password',
            category: 'email',
            required: true,
            sensitive: true,
            encrypted: true,
            defaultValue: '',
            environment: 'all',
            lastModified: '2024-01-08T13:45:00Z',
            modifiedBy: 'admin@company.com',
          },
        ],
      },
      {
        id: 'security',
        name: 'Security Settings',
        description: 'Authentication, encryption, and security policies',
        icon: <Shield className="w-5 h-5" />,
        permissions: ['admin', 'security'],
        lastModified: '2024-01-15T09:20:00Z',
        modifiedBy: 'security@company.com',
        settings: [
          {
            id: 'jwt_secret',
            key: 'JWT_SECRET',
            value: 'encrypted_jwt_secret_here',
            type: 'password',
            description: 'JWT token signing secret',
            category: 'security',
            required: true,
            sensitive: true,
            encrypted: true,
            defaultValue: '',
            environment: 'all',
            lastModified: '2024-01-08T13:45:00Z',
            modifiedBy: 'security@company.com',
          },
          {
            id: 'encryption_key',
            key: 'ENCRYPTION_KEY',
            value: 'encrypted_key_here',
            type: 'password',
            description: 'Data encryption key',
            category: 'security',
            required: true,
            sensitive: true,
            encrypted: true,
            defaultValue: '',
            environment: 'all',
            lastModified: '2024-01-08T13:45:00Z',
            modifiedBy: 'security@company.com',
          },
          {
            id: 'session_timeout',
            key: 'SESSION_TIMEOUT',
            value: 30,
            type: 'number',
            description: 'User session timeout in minutes',
            category: 'security',
            required: false,
            sensitive: false,
            encrypted: false,
            defaultValue: 30,
            validation: { min: 5, max: 480 },
            environment: 'all',
            lastModified: '2024-01-12T16:30:00Z',
            modifiedBy: 'admin@company.com',
          },
        ],
      },
      {
        id: 'features',
        name: 'Feature Flags',
        description: 'Enable/disable features and functionality',
        icon: <Zap className="w-5 h-5" />,
        permissions: ['admin', 'product'],
        lastModified: '2024-01-15T08:15:00Z',
        modifiedBy: 'product@company.com',
        settings: [
          {
            id: 'feature_mobile_app',
            key: 'FEATURE_MOBILE_APP',
            value: true,
            type: 'boolean',
            description: 'Enable mobile application features',
            category: 'features',
            required: false,
            sensitive: false,
            encrypted: false,
            defaultValue: false,
            environment: 'all',
            lastModified: '2024-01-15T08:15:00Z',
            modifiedBy: 'product@company.com',
          },
          {
            id: 'feature_real_time',
            key: 'FEATURE_REAL_TIME',
            value: true,
            type: 'boolean',
            description: 'Enable real-time collaboration features',
            category: 'features',
            required: false,
            sensitive: false,
            encrypted: false,
            defaultValue: true,
            environment: 'all',
            lastModified: '2024-01-14T10:45:00Z',
            modifiedBy: 'product@company.com',
          },
          {
            id: 'feature_analytics',
            key: 'FEATURE_ANALYTICS',
            value: true,
            type: 'boolean',
            description: 'Enable analytics and reporting features',
            category: 'features',
            required: false,
            sensitive: false,
            encrypted: false,
            defaultValue: true,
            environment: 'all',
            lastModified: '2024-01-13T14:20:00Z',
            modifiedBy: 'product@company.com',
          },
        ],
      },
    ];

    const generateConfigHistory = (): ConfigurationHistory[] => [
      {
        id: 'hist-1',
        settingId: 'maintenance_mode',
        settingKey: 'MAINTENANCE_MODE',
        oldValue: false,
        newValue: true,
        changedBy: 'admin@company.com',
        changedAt: '2024-01-14T16:45:00Z',
        environment: 'production',
        reason: 'Scheduled maintenance for database upgrade',
      },
      {
        id: 'hist-2',
        settingId: 'db_pool_size',
        settingKey: 'DB_POOL_SIZE',
        oldValue: 10,
        newValue: 20,
        changedBy: 'dba@company.com',
        changedAt: '2024-01-12T15:30:00Z',
        environment: 'production',
        reason: 'Increase pool size for better performance',
      },
      {
        id: 'hist-3',
        settingId: 'feature_mobile_app',
        settingKey: 'FEATURE_MOBILE_APP',
        oldValue: false,
        newValue: true,
        changedBy: 'product@company.com',
        changedAt: '2024-01-15T08:15:00Z',
        environment: 'all',
        reason: 'Launch mobile application features',
      },
    ];

    const generateEnvironments = (): EnvironmentConfig[] => [
      {
        name: 'development',
        displayName: 'Development',
        status: 'active',
        version: '2.1.0-dev',
        databaseUrl: 'postgres://localhost:5432/cnc_dev',
        redisUrl: 'redis://localhost:6379/0',
        apiEndpoint: 'http://localhost:3000/api',
        features: {
          debugMode: true,
          mockData: true,
          hotReload: true,
        },
        limits: {
          maxUsers: 10,
          maxProjects: 50,
          storageLimit: 1073741824, // 1GB
          apiRateLimit: 100,
        },
      },
      {
        name: 'staging',
        displayName: 'Staging',
        status: 'active',
        lastDeployed: '2024-01-15T06:30:00Z',
        version: '2.1.0-staging',
        databaseUrl: 'postgres://staging-db.cnc-taskmanager.com:5432/cnc_staging',
        redisUrl: 'redis://staging-redis.cnc-taskmanager.com:6379/1',
        apiEndpoint: 'https://staging-api.cnc-taskmanager.com',
        features: {
          debugMode: false,
          mockData: false,
          hotReload: false,
          analyticsEnabled: true,
        },
        limits: {
          maxUsers: 100,
          maxProjects: 500,
          storageLimit: 10737418240, // 10GB
          apiRateLimit: 500,
        },
      },
      {
        name: 'production',
        displayName: 'Production',
        status: 'active',
        lastDeployed: '2024-01-14T22:15:00Z',
        version: '2.1.0',
        databaseUrl: 'postgres://prod-db.cnc-taskmanager.com:5432/cnc_prod',
        redisUrl: 'redis://prod-redis.cnc-taskmanager.com:6379/2',
        apiEndpoint: 'https://api.cnc-taskmanager.com',
        features: {
          debugMode: false,
          mockData: false,
          hotReload: false,
          analyticsEnabled: true,
          monitoringEnabled: true,
        },
        limits: {
          maxUsers: 10000,
          maxProjects: 50000,
          storageLimit: 107374182400, // 100GB
          apiRateLimit: 5000,
        },
      },
    ];

    const generateSystemResources = (): SystemResource[] => [
      {
        name: 'PostgreSQL Database',
        type: 'database',
        status: 'healthy',
        metrics: {
          cpu: 45,
          memory: 67,
          connections: 85,
          throughput: 1250,
        },
        configuration: {
          version: '13.7',
          maxConnections: 200,
          sharedBuffers: '256MB',
        },
        lastCheck: '2024-01-15T10:30:00Z',
      },
      {
        name: 'Redis Cache',
        type: 'cache',
        status: 'healthy',
        metrics: {
          memory: 23,
          connections: 45,
          throughput: 5000,
        },
        configuration: {
          version: '6.2.7',
          maxMemory: '1GB',
          evictionPolicy: 'allkeys-lru',
        },
        lastCheck: '2024-01-15T10:30:00Z',
      },
      {
        name: 'Application Server',
        type: 'compute',
        status: 'healthy',
        metrics: {
          cpu: 32,
          memory: 54,
          throughput: 850,
        },
        configuration: {
          instances: 3,
          maxMemory: '2GB',
          cpuCores: 2,
        },
        lastCheck: '2024-01-15T10:30:00Z',
      },
    ];

    setConfigCategories(generateConfigCategories());
    setConfigHistory(generateConfigHistory());
    setEnvironments(generateEnvironments());
    setSystemResources(generateSystemResources());
    setLoading(false);
  }, []);

  const handleSettingChange = (categoryId: string, settingId: string, newValue: any) => {
    setConfigCategories(prev =>
      prev.map(category => {
        if (category.id === categoryId) {
          return {
            ...category,
            settings: category.settings.map(setting => {
              if (setting.id === settingId) {
                return {
                  ...setting,
                  value: newValue,
                  lastModified: new Date().toISOString(),
                  modifiedBy: 'admin@company.com',
                };
              }
              return setting;
            }),
          };
        }
        return category;
      })
    );
    setHasChanges(true);
  };

  const handleSaveConfiguration = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    setHasChanges(false);
    // Show success message
  };

  const handleExportConfiguration = () => {
    // Export configuration to file
    console.log('Exporting configuration...');
  };

  const handleImportConfiguration = () => {
    // Import configuration from file
    console.log('Importing configuration...');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      healthy: 'text-green-600',
      warning: 'text-yellow-600',
      error: 'text-red-600',
      active: 'text-green-600',
      inactive: 'text-gray-600',
      maintenance: 'text-orange-600',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const filteredSettings =
    configCategories
      .find(cat => cat.id === activeTab)
      ?.settings.filter(setting => {
        const matchesSearch =
          !searchTerm ||
          setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          setting.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesEnvironment =
          selectedEnvironment === 'all' ||
          setting.environment === 'all' ||
          setting.environment === selectedEnvironment;

        return matchesSearch && matchesEnvironment;
      }) || [];

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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">System Configuration</h1>
            <p className="text-gray-600">Manage system settings, environments, and resources</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleImportConfiguration}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </button>
            <button
              onClick={handleExportConfiguration}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reload
            </button>
            {hasChanges && (
              <button
                onClick={handleSaveConfiguration}
                disabled={saving}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* System Resources Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {systemResources.map(resource => (
          <div key={resource.name} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div
                  className={`p-2 rounded-lg ${
                    resource.status === 'healthy'
                      ? 'bg-green-100'
                      : resource.status === 'warning'
                        ? 'bg-yellow-100'
                        : 'bg-red-100'
                  }`}
                >
                  {resource.type === 'database' && <Database className="w-5 h-5 text-green-600" />}
                  {resource.type === 'cache' && <MemoryStick className="w-5 h-5 text-green-600" />}
                  {resource.type === 'compute' && <Server className="w-5 h-5 text-green-600" />}
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900 text-sm">{resource.name}</h3>
                  <p className="text-xs text-gray-500 capitalize">{resource.type}</p>
                </div>
              </div>
              <div
                className={`w-2 h-2 rounded-full ${
                  resource.status === 'healthy'
                    ? 'bg-green-500'
                    : resource.status === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }`}
              ></div>
            </div>
            <div className="space-y-2">
              {resource.metrics.cpu && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">CPU:</span>
                  <span className={resource.metrics.cpu > 80 ? 'text-red-600' : 'text-gray-900'}>
                    {resource.metrics.cpu}%
                  </span>
                </div>
              )}
              {resource.metrics.memory && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Memory:</span>
                  <span className={resource.metrics.memory > 80 ? 'text-red-600' : 'text-gray-900'}>
                    {resource.metrics.memory}%
                  </span>
                </div>
              )}
              {resource.metrics.connections && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Connections:</span>
                  <span className="text-gray-900">{resource.metrics.connections}</span>
                </div>
              )}
              {resource.metrics.throughput && (
                <div className="flex justify-between text-xs">
                  <span className="text-gray-600">Throughput:</span>
                  <span className="text-gray-900">{resource.metrics.throughput}/s</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar - Categories */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
            </div>
            <div className="p-6">
              <nav className="space-y-2">
                {configCategories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left ${
                      activeTab === category.id
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8">{category.icon}</div>
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-gray-500">
                        {category.settings.length} settings
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Environment Selector */}
          <div className="bg-white rounded-lg shadow mt-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Environment</h2>
            </div>
            <div className="p-6">
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedEnvironment}
                onChange={e => setSelectedEnvironment(e.target.value)}
              >
                <option value="all">All Environments</option>
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {activeTab !== 'environments' && activeTab !== 'resources' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {configCategories.find(cat => cat.id === activeTab)?.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {configCategories.find(cat => cat.id === activeTab)?.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <input
                        type="text"
                        placeholder="Search settings..."
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={() => setShowSensitiveData(!showSensitiveData)}
                      className={`p-2 rounded-lg ${
                        showSensitiveData ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                      }`}
                      title={showSensitiveData ? 'Hide sensitive data' : 'Show sensitive data'}
                    >
                      {showSensitiveData ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {filteredSettings.map(setting => (
                    <div key={setting.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">{setting.key}</h3>
                            {setting.required && (
                              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                Required
                              </span>
                            )}
                            {setting.sensitive && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                Sensitive
                              </span>
                            )}
                            {setting.encrypted && (
                              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                Encrypted
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{setting.description}</p>
                          <div className="max-w-md">
                            {setting.type === 'boolean' && (
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  className="rounded border-gray-300"
                                  checked={setting.value}
                                  onChange={e =>
                                    handleSettingChange(activeTab, setting.id, e.target.checked)
                                  }
                                />
                                <span className="ml-2 text-sm text-gray-700">
                                  {setting.value ? 'Enabled' : 'Disabled'}
                                </span>
                              </label>
                            )}
                            {setting.type === 'string' && !setting.sensitive && (
                              <input
                                type="text"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={setting.value}
                                onChange={e =>
                                  handleSettingChange(activeTab, setting.id, e.target.value)
                                }
                              />
                            )}
                            {setting.type === 'password' && (
                              <div className="relative">
                                <input
                                  type={showSensitiveData ? 'text' : 'password'}
                                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  value={showSensitiveData ? setting.value : '••••••••'}
                                  onChange={e =>
                                    handleSettingChange(activeTab, setting.id, e.target.value)
                                  }
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowSensitiveData(!showSensitiveData)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                >
                                  {showSensitiveData ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            )}
                            {setting.type === 'number' && (
                              <input
                                type="number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={setting.value}
                                onChange={e =>
                                  handleSettingChange(
                                    activeTab,
                                    setting.id,
                                    parseInt(e.target.value)
                                  )
                                }
                                min={setting.validation?.min}
                                max={setting.validation?.max}
                              />
                            )}
                            {setting.type === 'select' && setting.validation?.options && (
                              <select
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={setting.value}
                                onChange={e =>
                                  handleSettingChange(activeTab, setting.id, e.target.value)
                                }
                              >
                                {setting.validation.options.map(option => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            )}
                            {setting.type === 'textarea' && (
                              <textarea
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={setting.value}
                                onChange={e =>
                                  handleSettingChange(activeTab, setting.id, e.target.value)
                                }
                                rows={3}
                              />
                            )}
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="text-xs text-gray-500">
                              Default: {setting.defaultValue}
                              {setting.environment !== 'all' && (
                                <span className="ml-2">Environment: {setting.environment}</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedSetting(setting);
                                  setShowHistoryModal(true);
                                }}
                                className="text-gray-400 hover:text-gray-600"
                                title="View history"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleSettingChange(activeTab, setting.id, setting.defaultValue)
                                }
                                className="text-gray-400 hover:text-gray-600"
                                title="Reset to default"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Environments Tab */}
          {activeTab === 'environments' && (
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Environments</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Manage different deployment environments
                </p>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {environments.map(env => (
                    <div key={env.name} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-medium text-gray-900">{env.displayName}</h3>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                env.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : env.status === 'maintenance'
                                    ? 'bg-orange-100 text-orange-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {env.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Version:</span>
                              <span className="ml-2 text-gray-900">{env.version}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">API Endpoint:</span>
                              <span className="ml-2 text-gray-900 font-mono text-xs">
                                {env.apiEndpoint}
                              </span>
                            </div>
                            {env.lastDeployed && (
                              <div>
                                <span className="text-gray-600">Last Deployed:</span>
                                <span className="ml-2 text-gray-900">
                                  {new Date(env.lastDeployed).toLocaleString()}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="mt-3">
                            <h4 className="font-medium text-gray-900 mb-2">Features</h4>
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(env.features).map(([key, value]) => (
                                <span
                                  key={key}
                                  className={`px-2 py-1 text-xs rounded-full ${
                                    value
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="mt-3">
                            <h4 className="font-medium text-gray-900 mb-2">Limits</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Max Users:</span>
                                <span className="ml-2 text-gray-900">
                                  {env.limits.maxUsers.toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Max Projects:</span>
                                <span className="ml-2 text-gray-900">
                                  {env.limits.maxProjects.toLocaleString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">Storage:</span>
                                <span className="ml-2 text-gray-900">
                                  {formatBytes(env.limits.storageLimit)}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-600">API Rate Limit:</span>
                                <span className="ml-2 text-gray-900">
                                  {env.limits.apiRateLimit}/min
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                            title="Deploy"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 text-gray-400 hover:text-gray-600"
                            title="Settings"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Configuration History Modal */}
      {showHistoryModal && selectedSetting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Configuration History</h2>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <h3 className="font-medium text-gray-900">{selectedSetting.key}</h3>
                <p className="text-sm text-gray-600">{selectedSetting.description}</p>
              </div>
              <div className="space-y-4">
                {configHistory
                  .filter(hist => hist.settingId === selectedSetting.id)
                  .map(history => (
                    <div key={history.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm text-gray-500">
                              {new Date(history.changedAt).toLocaleString()}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                              {history.environment}
                            </span>
                          </div>
                          <div className="text-sm">
                            <div className="mb-1">
                              <span className="text-gray-600">From:</span>
                              <span className="ml-2 text-gray-900 font-mono">
                                {JSON.stringify(history.oldValue)}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">To:</span>
                              <span className="ml-2 text-gray-900 font-mono">
                                {JSON.stringify(history.newValue)}
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 text-sm text-gray-600">
                            <span>By: {history.changedBy}</span>
                            {history.reason && (
                              <span className="ml-2">Reason: {history.reason}</span>
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
      )}
    </div>
  );
};

export default SystemConfigurationPage;
