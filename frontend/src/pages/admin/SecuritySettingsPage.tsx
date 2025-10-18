import React, { useState, useEffect } from 'react';
import {
  Shield,
  Lock,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Users,
  Globe,
  Wifi,
  Mail,
  Smartphone,
  Clock,
  Download,
  Upload,
  RefreshCw,
  Save,
  Ban,
  UserCheck,
  FileText,
  Database,
  Activity,
  Zap,
  Bell,
  Filter,
  Search,
  ChevronDown,
  MoreVertical,
  Info,
  AlertCircle,
  KeyRound,
  Fingerprint,
  ShieldCheck,
  ShieldAlert,
  LockKeyhole,
  UserMinus,
  UserPlus,
} from 'lucide-react';

// Types
interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  category: 'authentication' | 'authorization' | 'session' | 'password' | 'api' | 'network';
  settings: Record<string, any>;
  lastModified: string;
  modifiedBy: string;
}

interface SecurityEvent {
  id: string;
  type:
    | 'login_attempt'
    | 'failed_login'
    | 'password_change'
    | 'permission_denied'
    | 'suspicious_activity'
    | 'data_access'
    | 'api_call';
  severity: 'low' | 'medium' | 'high' | 'critical';
  user?: string;
  ip: string;
  userAgent: string;
  description: string;
  timestamp: string;
  resolved: boolean;
  details?: {
    userId?: string;
    resource?: string;
    action?: string;
    location?: string;
    device?: string;
  };
}

interface IPWhitelist {
  id: string;
  ip: string;
  label: string;
  description: string;
  enabled: boolean;
  createdAt: string;
  createdBy: string;
  lastAccessed?: string;
}

interface APIKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  createdBy: string;
  createdAt: string;
  lastUsed?: string;
  expiresAt?: string;
  enabled: boolean;
  usageCount: number;
  rateLimit: number;
}

interface SecuritySettings {
  authentication: {
    twoFactorRequired: boolean;
    twoFactorMethods: string[];
    sessionTimeout: number;
    maxLoginAttempts: number;
    lockoutDuration: number;
    passwordMinLength: number;
    passwordRequireUppercase: boolean;
    passwordRequireLowercase: boolean;
    passwordRequireNumbers: boolean;
    passwordRequireSymbols: boolean;
    passwordExpiryDays: number;
    preventPasswordReuse: number;
  };
  session: {
    idleTimeout: number;
    absoluteTimeout: number;
    concurrentSessions: number;
    secureCookies: boolean;
    sameSitePolicy: string;
  };
  api: {
    rateLimitingEnabled: boolean;
    rateLimitPerMinute: number;
    apiKeyRequired: boolean;
    corsEnabled: boolean;
    allowedOrigins: string[];
    encryptionRequired: boolean;
  };
  network: {
    ipWhitelistEnabled: boolean;
    allowedIPs: string[];
    geoBlockingEnabled: boolean;
    allowedCountries: string[];
    vpnBlockingEnabled: boolean;
  };
  audit: {
    logAllEvents: boolean;
    logRetentionDays: number;
    realTimeAlerts: boolean;
    emailNotifications: boolean;
    alertThresholds: {
      failedLogins: number;
      suspiciousActivity: number;
      dataAccess: number;
    };
  };
}

const SecuritySettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('policies');
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    authentication: {
      twoFactorRequired: false,
      twoFactorMethods: ['totp', 'sms'],
      sessionTimeout: 30,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSymbols: false,
      passwordExpiryDays: 90,
      preventPasswordReuse: 3,
    },
    session: {
      idleTimeout: 20,
      absoluteTimeout: 120,
      concurrentSessions: 3,
      secureCookies: true,
      sameSitePolicy: 'strict',
    },
    api: {
      rateLimitingEnabled: true,
      rateLimitPerMinute: 100,
      apiKeyRequired: false,
      corsEnabled: true,
      allowedOrigins: ['http://localhost:3000'],
      encryptionRequired: true,
    },
    network: {
      ipWhitelistEnabled: false,
      allowedIPs: [],
      geoBlockingEnabled: false,
      allowedCountries: [],
      vpnBlockingEnabled: false,
    },
    audit: {
      logAllEvents: true,
      logRetentionDays: 90,
      realTimeAlerts: true,
      emailNotifications: true,
      alertThresholds: {
        failedLogins: 5,
        suspiciousActivity: 3,
        dataAccess: 10,
      },
    },
  });

  const [securityPolicies, setSecurityPolicies] = useState<SecurityPolicy[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [ipWhitelist, setIPWhitelist] = useState<IPWhitelist[]>([]);
  const [apiKeys, setAPIKeys] = useState<APIKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);
  const [eventFilter, setEventFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data generation
  useEffect(() => {
    const generateSecurityPolicies = (): SecurityPolicy[] => [
      {
        id: 'policy-1',
        name: 'Strong Password Policy',
        description: 'Enforces strong password requirements across the system',
        enabled: true,
        category: 'password',
        settings: {
          minLength: 12,
          requireUppercase: true,
          requireLowercase: true,
          requireNumbers: true,
          requireSymbols: true,
          expiryDays: 90,
          preventReuse: 5,
        },
        lastModified: '2024-01-10T10:30:00Z',
        modifiedBy: 'admin@company.com',
      },
      {
        id: 'policy-2',
        name: 'Multi-Factor Authentication',
        description: 'Requires two-factor authentication for all admin users',
        enabled: true,
        category: 'authentication',
        settings: {
          requiredForRoles: ['admin', 'manager'],
          methods: ['totp', 'sms', 'email'],
          backupCodes: true,
          gracePeriod: 7,
        },
        lastModified: '2024-01-08T14:20:00Z',
        modifiedBy: 'security@company.com',
      },
      {
        id: 'policy-3',
        name: 'Session Management',
        description: 'Controls user session timeout and concurrent sessions',
        enabled: true,
        category: 'session',
        settings: {
          idleTimeout: 20,
          absoluteTimeout: 480,
          maxConcurrentSessions: 3,
          secureCookies: true,
        },
        lastModified: '2024-01-05T09:15:00Z',
        modifiedBy: 'admin@company.com',
      },
      {
        id: 'policy-4',
        name: 'API Rate Limiting',
        description: 'Limits API requests to prevent abuse',
        enabled: true,
        category: 'api',
        settings: {
          requestsPerMinute: 100,
          burstLimit: 200,
          blockDuration: 15,
          excludeInternalIPs: true,
        },
        lastModified: '2024-01-03T16:45:00Z',
        modifiedBy: 'api-team@company.com',
      },
    ];

    const generateSecurityEvents = (): SecurityEvent[] => [
      {
        id: 'event-1',
        type: 'failed_login',
        severity: 'medium',
        user: 'john.doe@company.com',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        description: 'Multiple failed login attempts detected',
        timestamp: '2024-01-15T10:30:00Z',
        resolved: false,
        details: {
          userId: 'user-123',
          attempts: 5,
          location: 'New York, USA',
        },
      },
      {
        id: 'event-2',
        type: 'suspicious_activity',
        severity: 'high',
        user: 'jane.smith@company.com',
        ip: '185.220.101.45',
        userAgent: 'Mozilla/5.0 (compatible; bot/1.0)',
        description: 'Login from suspicious IP address detected',
        timestamp: '2024-01-15T09:15:00Z',
        resolved: true,
        details: {
          userId: 'user-456',
          location: 'Unknown',
          device: 'Desktop',
        },
      },
      {
        id: 'event-3',
        type: 'permission_denied',
        severity: 'medium',
        user: 'mike.wilson@company.com',
        ip: '10.0.0.25',
        userAgent: 'curl/7.68.0',
        description: 'Attempted access to restricted resource',
        timestamp: '2024-01-15T08:45:00Z',
        resolved: false,
        details: {
          userId: 'user-789',
          resource: '/admin/users',
          action: 'DELETE',
        },
      },
      {
        id: 'event-4',
        type: 'password_change',
        severity: 'low',
        user: 'sarah.jones@company.com',
        ip: '192.168.1.50',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        description: 'Password changed successfully',
        timestamp: '2024-01-15T07:30:00Z',
        resolved: true,
      },
    ];

    const generateIPWhitelist = (): IPWhitelist[] => [
      {
        id: 'ip-1',
        ip: '192.168.1.0/24',
        label: 'Office Network',
        description: 'Main office network range',
        enabled: true,
        createdAt: '2024-01-01T00:00:00Z',
        createdBy: 'admin@company.com',
        lastAccessed: '2024-01-15T10:30:00Z',
      },
      {
        id: 'ip-2',
        ip: '10.0.0.100',
        label: 'Admin Console',
        description: 'Dedicated admin workstation',
        enabled: true,
        createdAt: '2024-01-02T00:00:00Z',
        createdBy: 'security@company.com',
      },
      {
        id: 'ip-3',
        ip: '203.0.113.0/24',
        label: 'VPN Network',
        description: 'Corporate VPN range',
        enabled: false,
        createdAt: '2024-01-03T00:00:00Z',
        createdBy: 'it-department@company.com',
      },
    ];

    const generateAPIKeys = (): APIKey[] => [
      {
        id: 'key-1',
        name: 'Production API Key',
        key: 'sk_live_51H2j3k...8mN9pQ',
        permissions: ['read', 'write'],
        createdBy: 'api-team@company.com',
        createdAt: '2024-01-01T00:00:00Z',
        lastUsed: '2024-01-15T10:30:00Z',
        expiresAt: '2024-12-31T23:59:59Z',
        enabled: true,
        usageCount: 1250,
        rateLimit: 1000,
      },
      {
        id: 'key-2',
        name: 'Integration Key',
        key: 'sk_test_51H2j3k...8mN9pQ',
        permissions: ['read'],
        createdBy: 'integration@company.com',
        createdAt: '2024-01-05T00:00:00Z',
        lastUsed: '2024-01-14T15:20:00Z',
        enabled: true,
        usageCount: 450,
        rateLimit: 100,
      },
      {
        id: 'key-3',
        name: 'Deprecated Key',
        key: 'sk_old_51H2j3k...8mN9pQ',
        permissions: ['read', 'write', 'delete'],
        createdBy: 'legacy@company.com',
        createdAt: '2023-06-01T00:00:00Z',
        enabled: false,
        usageCount: 89,
        rateLimit: 500,
      },
    ];

    setSecurityPolicies(generateSecurityPolicies());
    setSecurityEvents(generateSecurityEvents());
    setIPWhitelist(generateIPWhitelist());
    setAPIKeys(generateAPIKeys());
    setLoading(false);
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    // Show success message
  };

  const handleTogglePolicy = (policyId: string) => {
    setSecurityPolicies(prev =>
      prev.map(policy =>
        policy.id === policyId ? { ...policy, enabled: !policy.enabled } : policy
      )
    );
  };

  const handleResolveEvent = (eventId: string) => {
    setSecurityEvents(prev =>
      prev.map(event => (event.id === eventId ? { ...event, resolved: true } : event))
    );
  };

  const getSeverityColor = (severity: SecurityEvent['severity']) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800',
    };
    return colors[severity];
  };

  const getCategoryIcon = (category: SecurityPolicy['category']) => {
    const icons = {
      authentication: <LockKeyhole className="w-4 h-4" />,
      authorization: <ShieldCheck className="w-4 h-4" />,
      session: <Clock className="w-4 h-4" />,
      password: <Key className="w-4 h-4" />,
      api: <Globe className="w-4 h-4" />,
      network: <Wifi className="w-4 h-4" />,
    };
    return icons[category];
  };

  const filteredEvents = securityEvents
    .filter(event => {
      if (eventFilter === 'all') return true;
      if (eventFilter === 'unresolved') return !event.resolved;
      if (eventFilter === 'critical') return event.severity === 'critical';
      return event.type === eventFilter;
    })
    .filter(
      event =>
        !searchTerm ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.user?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Settings</h1>
        <p className="text-gray-600">Manage system security policies and monitor security events</p>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <ShieldCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Security Score</p>
              <p className="text-2xl font-bold text-gray-900">92%</p>
              <p className="text-xs text-green-600">Excellent</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <LockKeyhole className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Policies</p>
              <p className="text-2xl font-bold text-gray-900">
                {securityPolicies.filter(p => p.enabled).length}/{securityPolicies.length}
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
              <p className="text-sm font-medium text-gray-600">Unresolved Events</p>
              <p className="text-2xl font-bold text-gray-900">
                {securityEvents.filter(e => !e.resolved).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Key className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">API Keys</p>
              <p className="text-2xl font-bold text-gray-900">
                {apiKeys.filter(k => k.enabled).length}/{apiKeys.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {['policies', 'authentication', 'events', 'api', 'network'].map(tab => (
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

      {/* Policies Tab */}
      {activeTab === 'policies' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Security Policies</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage system-wide security policies and rules
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {securityPolicies.map(policy => (
                  <div key={policy.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {getCategoryIcon(policy.category)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{policy.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{policy.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Category: {policy.category}</span>
                            <span>
                              Modified: {new Date(policy.lastModified).toLocaleDateString()}
                            </span>
                            <span>By: {policy.modifiedBy}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleTogglePolicy(policy.id)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                            policy.enabled ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              policy.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Tab */}
      {activeTab === 'authentication' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Authentication Settings</h2>
              <p className="text-sm text-gray-600 mt-1">
                Configure password policies and authentication methods
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Password Settings */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Password Policy</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Length
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={securitySettings.authentication.passwordMinLength}
                        onChange={e =>
                          setSecuritySettings(prev => ({
                            ...prev,
                            authentication: {
                              ...prev.authentication,
                              passwordMinLength: parseInt(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Days
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={securitySettings.authentication.passwordExpiryDays}
                        onChange={e =>
                          setSecuritySettings(prev => ({
                            ...prev,
                            authentication: {
                              ...prev.authentication,
                              passwordExpiryDays: parseInt(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={securitySettings.authentication.passwordRequireUppercase}
                        onChange={e =>
                          setSecuritySettings(prev => ({
                            ...prev,
                            authentication: {
                              ...prev.authentication,
                              passwordRequireUppercase: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span className="ml-2 text-sm text-gray-700">Require uppercase letters</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={securitySettings.authentication.passwordRequireLowercase}
                        onChange={e =>
                          setSecuritySettings(prev => ({
                            ...prev,
                            authentication: {
                              ...prev.authentication,
                              passwordRequireLowercase: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span className="ml-2 text-sm text-gray-700">Require lowercase letters</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={securitySettings.authentication.passwordRequireNumbers}
                        onChange={e =>
                          setSecuritySettings(prev => ({
                            ...prev,
                            authentication: {
                              ...prev.authentication,
                              passwordRequireNumbers: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span className="ml-2 text-sm text-gray-700">Require numbers</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        className="rounded border-gray-300"
                        checked={securitySettings.authentication.passwordRequireSymbols}
                        onChange={e =>
                          setSecuritySettings(prev => ({
                            ...prev,
                            authentication: {
                              ...prev.authentication,
                              passwordRequireSymbols: e.target.checked,
                            },
                          }))
                        }
                      />
                      <span className="ml-2 text-sm text-gray-700">Require special characters</span>
                    </label>
                  </div>
                </div>

                {/* Session Settings */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Session Management</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Idle Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={securitySettings.session.idleTimeout}
                        onChange={e =>
                          setSecuritySettings(prev => ({
                            ...prev,
                            session: {
                              ...prev.session,
                              idleTimeout: parseInt(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Absolute Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={securitySettings.session.absoluteTimeout}
                        onChange={e =>
                          setSecuritySettings(prev => ({
                            ...prev,
                            session: {
                              ...prev.session,
                              absoluteTimeout: parseInt(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Login Protection */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">Login Protection</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={securitySettings.authentication.maxLoginAttempts}
                        onChange={e =>
                          setSecuritySettings(prev => ({
                            ...prev,
                            authentication: {
                              ...prev.authentication,
                              maxLoginAttempts: parseInt(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lockout Duration (minutes)
                      </label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={securitySettings.authentication.lockoutDuration}
                        onChange={e =>
                          setSecuritySettings(prev => ({
                            ...prev,
                            authentication: {
                              ...prev.authentication,
                              lockoutDuration: parseInt(e.target.value),
                            },
                          }))
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  disabled={saving}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Security Events</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Monitor and respond to security events
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    value={eventFilter}
                    onChange={e => setEventFilter(e.target.value)}
                  >
                    <option value="all">All Events</option>
                    <option value="unresolved">Unresolved</option>
                    <option value="critical">Critical</option>
                    <option value="failed_login">Failed Logins</option>
                    <option value="suspicious_activity">Suspicious Activity</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {filteredEvents.map(event => (
                  <div
                    key={event.id}
                    className={`border rounded-lg p-4 ${
                      event.resolved ? 'border-gray-200 bg-gray-50' : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`p-2 rounded-lg ${
                            event.severity === 'critical'
                              ? 'bg-red-100'
                              : event.severity === 'high'
                                ? 'bg-orange-100'
                                : event.severity === 'medium'
                                  ? 'bg-yellow-100'
                                  : 'bg-gray-100'
                          }`}
                        >
                          {event.severity === 'critical' && (
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          )}
                          {event.severity === 'high' && (
                            <ShieldAlert className="w-4 h-4 text-orange-600" />
                          )}
                          {event.severity === 'medium' && (
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                          )}
                          {event.severity === 'low' && <Info className="w-4 h-4 text-gray-600" />}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{event.description}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span>Type: {event.type.replace(/_/g, ' ')}</span>
                            <span>User: {event.user || 'N/A'}</span>
                            <span>IP: {event.ip}</span>
                            <span>{new Date(event.timestamp).toLocaleString()}</span>
                          </div>
                          {event.details && (
                            <div className="mt-2 text-sm text-gray-500">
                              {Object.entries(event.details).map(([key, value]) => (
                                <span key={key} className="mr-3">
                                  {key}: {value}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(event.severity)}`}
                        >
                          {event.severity.toUpperCase()}
                        </span>
                        {event.resolved && (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            RESOLVED
                          </span>
                        )}
                        {!event.resolved && (
                          <button
                            onClick={() => handleResolveEvent(event.id)}
                            className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Tab */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">API Keys</h2>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Key className="w-4 h-4 mr-2" />
                  Generate API Key
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {apiKeys.map(apiKey => (
                  <div key={apiKey.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{apiKey.name}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>Created: {new Date(apiKey.createdAt).toLocaleDateString()}</span>
                          <span>Usage: {apiKey.usageCount} calls</span>
                          <span>Rate Limit: {apiKey.rateLimit}/min</span>
                          {apiKey.expiresAt && (
                            <span>Expires: {new Date(apiKey.expiresAt).toLocaleDateString()}</span>
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="text-sm text-gray-600">
                            Key:
                            <span className="font-mono ml-1">
                              {showPasswords ? apiKey.key : apiKey.key.substring(0, 20) + '...'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="flex flex-wrap gap-1">
                            {apiKey.permissions.map(permission => (
                              <span
                                key={permission}
                                className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs"
                              >
                                {permission}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => setShowPasswords(!showPasswords)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showPasswords ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Network Tab */}
      {activeTab === 'network' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">IP Whitelist</h2>
                <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Wifi className="w-4 h-4 mr-2" />
                  Add IP Address
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {ipWhitelist.map(ip => (
                  <div key={ip.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{ip.label}</h3>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                          <span>IP: {ip.ip}</span>
                          <span>Created: {new Date(ip.createdAt).toLocaleDateString()}</span>
                          <span>By: {ip.createdBy}</span>
                          {ip.lastAccessed && (
                            <span>
                              Last accessed: {new Date(ip.lastAccessed).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {ip.description && (
                          <p className="text-sm text-gray-500 mt-2">{ip.description}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                            ip.enabled ? 'bg-green-600' : 'bg-gray-200'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              ip.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
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

export default SecuritySettingsPage;
