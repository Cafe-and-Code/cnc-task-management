import React, { useState, useEffect } from 'react';
import {
  Database,
  Download,
  Upload,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Settings,
  Play,
  Pause,
  Trash2,
  Eye,
  Search,
  Filter,
  ChevronDown,
  Save,
  HardDrive,
  Cloud,
  Shield,
  FileText,
  Archive,
  Zap,
  Activity,
  Server,
  Globe,
  Lock,
  Unlock,
  Info,
  AlertCircle,
  MoreVertical,
  Download as DownloadIcon,
  Upload as UploadIcon,
} from 'lucide-react';

// Types
interface BackupJob {
  id: string;
  name: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'running' | 'completed' | 'failed' | 'scheduled' | 'paused';
  schedule: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  createdAt: string;
  lastRun?: string;
  nextRun?: string;
  size: number;
  compressionEnabled: boolean;
  encryptionEnabled: boolean;
  retentionDays: number;
  destination: 'local' | 's3' | 'azure' | 'gcs';
  destinationPath: string;
  includedComponents: string[];
  excludedComponents: string[];
  notifications: {
    email: boolean;
    slack: boolean;
    webhook: boolean;
  };
  health: {
    successRate: number;
    avgDuration: number;
    lastSuccess?: string;
    lastFailure?: string;
  };
}

interface BackupRecord {
  id: string;
  jobId: string;
  jobName: string;
  type: 'full' | 'incremental' | 'differential';
  status: 'completed' | 'failed' | 'running';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  size: number;
  compressedSize: number;
  fileCount: number;
  location: string;
  checksum: string;
  createdBy: string;
  verified: boolean;
  errors?: string[];
  components: string[];
}

interface RestoreJob {
  id: string;
  backupId: string;
  backupName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  duration?: number;
  components: string[];
  targetLocation: string;
  overwriteExisting: boolean;
  createdBy: string;
  progress: {
    percentage: number;
    currentComponent: string;
    estimatedTimeRemaining?: number;
  };
  errors?: string[];
  warnings?: string[];
}

interface BackupStorage {
  provider: 'local' | 's3' | 'azure' | 'gcs';
  totalSpace: number;
  usedSpace: number;
  availableSpace: number;
  location: string;
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastVerified?: string;
  credentials: {
    encrypted: boolean;
    lastRotated?: string;
  };
}

const BackupRestorePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('jobs');
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>([]);
  const [backupRecords, setBackupRecords] = useState<BackupRecord[]>([]);
  const [restoreJobs, setRestoreJobs] = useState<RestoreJob[]>([]);
  const [storageInfo, setStorageInfo] = useState<BackupStorage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBackup, setSelectedBackup] = useState<BackupRecord | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock data generation
  useEffect(() => {
    const generateBackupJobs = (): BackupJob[] => [
      {
        id: 'job-1',
        name: 'Daily Full Backup',
        type: 'full',
        status: 'scheduled',
        schedule: '0 2 * * *',
        frequency: 'daily',
        createdAt: '2024-01-01T00:00:00Z',
        lastRun: '2024-01-15T02:00:00Z',
        nextRun: '2024-01-16T02:00:00Z',
        size: 25000000000, // 25GB
        compressionEnabled: true,
        encryptionEnabled: true,
        retentionDays: 30,
        destination: 's3',
        destinationPath: 's3://cnc-backups/daily/',
        includedComponents: ['database', 'files', 'config'],
        excludedComponents: ['cache', 'logs'],
        notifications: {
          email: true,
          slack: false,
          webhook: false,
        },
        health: {
          successRate: 98.5,
          avgDuration: 1800, // 30 minutes
          lastSuccess: '2024-01-15T02:00:00Z',
          lastFailure: '2024-01-12T02:00:00Z',
        },
      },
      {
        id: 'job-2',
        name: 'Hourly Incremental Backup',
        type: 'incremental',
        status: 'running',
        schedule: '0 * * * *',
        frequency: 'hourly',
        createdAt: '2024-01-05T00:00:00Z',
        lastRun: '2024-01-15T10:00:00Z',
        nextRun: '2024-01-15T11:00:00Z',
        size: 500000000, // 500MB
        compressionEnabled: true,
        encryptionEnabled: true,
        retentionDays: 7,
        destination: 'local',
        destinationPath: '/var/backups/incremental/',
        includedComponents: ['database', 'files'],
        excludedComponents: [],
        notifications: {
          email: false,
          slack: true,
          webhook: true,
        },
        health: {
          successRate: 99.2,
          avgDuration: 300, // 5 minutes
          lastSuccess: '2024-01-15T09:00:00Z',
        },
      },
      {
        id: 'job-3',
        name: 'Weekly Configuration Backup',
        type: 'full',
        status: 'completed',
        schedule: '0 3 * * 0',
        frequency: 'weekly',
        createdAt: '2024-01-01T00:00:00Z',
        lastRun: '2024-01-14T03:00:00Z',
        nextRun: '2024-01-21T03:00:00Z',
        size: 100000000, // 100MB
        compressionEnabled: true,
        encryptionEnabled: false,
        retentionDays: 90,
        destination: 'azure',
        destinationPath: 'azure://cnc-storage/backups/config/',
        includedComponents: ['config', 'secrets'],
        excludedComponents: [],
        notifications: {
          email: true,
          slack: true,
          webhook: false,
        },
        health: {
          successRate: 100,
          avgDuration: 120, // 2 minutes
          lastSuccess: '2024-01-14T03:00:00Z',
        },
      },
    ];

    const generateBackupRecords = (): BackupRecord[] => [
      {
        id: 'backup-1',
        jobId: 'job-1',
        jobName: 'Daily Full Backup',
        type: 'full',
        status: 'completed',
        startedAt: '2024-01-15T02:00:00Z',
        completedAt: '2024-01-15T02:28:45Z',
        duration: 1725,
        size: 25000000000,
        compressedSize: 8750000000,
        fileCount: 15234,
        location: 's3://cnc-backups/daily/backup_20240115_0200.tar.gz.enc',
        checksum: 'sha256:abc123def456...',
        createdBy: 'system',
        verified: true,
        components: ['database', 'files', 'config'],
      },
      {
        id: 'backup-2',
        jobId: 'job-2',
        jobName: 'Hourly Incremental Backup',
        type: 'incremental',
        status: 'running',
        startedAt: '2024-01-15T10:00:00Z',
        size: 250000000,
        compressedSize: 75000000,
        fileCount: 234,
        location: '/var/backups/incremental/backup_20240115_1000.tar.gz',
        checksum: 'sha256:def456ghi789...',
        createdBy: 'system',
        verified: false,
        components: ['database', 'files'],
      },
      {
        id: 'backup-3',
        jobId: 'job-1',
        jobName: 'Daily Full Backup',
        type: 'full',
        status: 'failed',
        startedAt: '2024-01-12T02:00:00Z',
        completedAt: '2024-01-12T02:15:30Z',
        duration: 930,
        size: 0,
        compressedSize: 0,
        fileCount: 0,
        location: '',
        checksum: '',
        createdBy: 'system',
        verified: false,
        components: ['database', 'files', 'config'],
        errors: ['Connection timeout to S3 bucket', 'Insufficient disk space'],
      },
    ];

    const generateRestoreJobs = (): RestoreJob[] => [
      {
        id: 'restore-1',
        backupId: 'backup-1',
        backupName: 'Daily Full Backup - 2024-01-15',
        status: 'completed',
        startedAt: '2024-01-14T15:30:00Z',
        completedAt: '2024-01-14T16:45:20Z',
        duration: 4520,
        components: ['database'],
        targetLocation: '/var/tmp/restore-20240114/',
        overwriteExisting: false,
        createdBy: 'admin@company.com',
        progress: {
          percentage: 100,
          currentComponent: 'Completed',
        },
        warnings: ['Some configuration files were overwritten', 'Index rebuild required'],
      },
      {
        id: 'restore-2',
        backupId: 'backup-2',
        backupName: 'Hourly Incremental Backup - 2024-01-15',
        status: 'running',
        startedAt: '2024-01-15T11:30:00Z',
        components: ['files', 'config'],
        targetLocation: '/var/tmp/restore-20240115/',
        overwriteExisting: true,
        createdBy: 'admin@company.com',
        progress: {
          percentage: 67,
          currentComponent: 'files',
          estimatedTimeRemaining: 600,
        },
      },
    ];

    const generateStorageInfo = (): BackupStorage[] => [
      {
        provider: 's3',
        totalSpace: 1000000000000, // 1TB
        usedSpace: 450000000000, // 450GB
        availableSpace: 550000000000, // 550GB
        location: 'us-east-1',
        connectionStatus: 'connected',
        lastVerified: '2024-01-15T10:00:00Z',
        credentials: {
          encrypted: true,
          lastRotated: '2024-01-01T00:00:00Z',
        },
      },
      {
        provider: 'local',
        totalSpace: 500000000000, // 500GB
        usedSpace: 125000000000, // 125GB
        availableSpace: 375000000000, // 375GB
        location: '/var/backups',
        connectionStatus: 'connected',
        credentials: {
          encrypted: false,
        },
      },
      {
        provider: 'azure',
        totalSpace: 200000000000, // 200GB
        usedSpace: 15000000000, // 15GB
        availableSpace: 185000000000, // 185GB
        location: 'eastus',
        connectionStatus: 'connected',
        lastVerified: '2024-01-14T15:00:00Z',
        credentials: {
          encrypted: true,
          lastRotated: '2023-12-15T00:00:00Z',
        },
      },
    ];

    setBackupJobs(generateBackupJobs());
    setBackupRecords(generateBackupRecords());
    setRestoreJobs(generateRestoreJobs());
    setStorageInfo(generateStorageInfo());
    setLoading(false);
  }, []);

  const handleRunBackup = (jobId: string) => {
    setBackupJobs(prev =>
      prev.map(job => (job.id === jobId ? { ...job, status: 'running' } : job))
    );
  };

  const handlePauseJob = (jobId: string) => {
    setBackupJobs(prev => prev.map(job => (job.id === jobId ? { ...job, status: 'paused' } : job)));
  };

  const handleStartRestore = (backupId: string) => {
    const backup = backupRecords.find(b => b.id === backupId);
    if (backup) {
      const newRestoreJob: RestoreJob = {
        id: `restore-${Date.now()}`,
        backupId,
        backupName: backup.jobName,
        status: 'running',
        startedAt: new Date().toISOString(),
        components: backup.components,
        targetLocation: '/var/tmp/restore/',
        overwriteExisting: false,
        createdBy: 'admin@company.com',
        progress: {
          percentage: 0,
          currentComponent: 'Preparing',
        },
      };
      setRestoreJobs(prev => [newRestoreJob, ...prev]);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      scheduled: 'bg-yellow-100 text-yellow-800',
      paused: 'bg-gray-100 text-gray-800',
      pending: 'bg-purple-100 text-purple-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStorageIcon = (provider: string) => {
    const icons = {
      local: <HardDrive className="w-5 h-5" />,
      s3: <Cloud className="w-5 h-5" />,
      azure: <Database className="w-5 h-5" />,
      gcs: <Server className="w-5 h-5" />,
    };
    return icons[provider as keyof typeof icons] || <HardDrive className="w-5 h-5" />;
  };

  const getConnectionStatusColor = (status: string) => {
    const colors = {
      connected: 'text-green-600',
      disconnected: 'text-red-600',
      error: 'text-yellow-600',
    };
    return colors[status as keyof typeof colors] || 'text-gray-600';
  };

  const formatBytes = (bytes: number) => {
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const filteredRecords = backupRecords.filter(record => {
    const matchesSearch =
      !searchTerm ||
      record.jobName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesType = typeFilter === 'all' || record.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
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
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Backup & Restore</h1>
        <p className="text-gray-600">Manage system backups and disaster recovery operations</p>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {storageInfo.map(storage => (
          <div key={storage.provider} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div
                  className={`p-2 rounded-lg ${storage.connectionStatus === 'connected' ? 'bg-green-100' : 'bg-red-100'}`}
                >
                  {getStorageIcon(storage.provider)}
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-900 capitalize">{storage.provider}</h3>
                  <p className="text-xs text-gray-500">{storage.location}</p>
                </div>
              </div>
              <div
                className={`w-2 h-2 rounded-full ${
                  storage.connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'
                }`}
              ></div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Used:</span>
                <span className="font-medium">{formatBytes(storage.usedSpace)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available:</span>
                <span className="font-medium">{formatBytes(storage.availableSpace)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${(storage.usedSpace / storage.totalSpace) * 100}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{((storage.usedSpace / storage.totalSpace) * 100).toFixed(1)}% used</span>
                <span className={getConnectionStatusColor(storage.connectionStatus)}>
                  {storage.connectionStatus}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {['jobs', 'backups', 'restore', 'storage'].map(tab => (
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

      {/* Backup Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Backup Jobs</h2>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {backupJobs.map(job => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(job.status)}`}>
                          {job.status === 'running' && (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                          )}
                          {job.status === 'completed' && <CheckCircle className="w-5 h-5" />}
                          {job.status === 'failed' && <XCircle className="w-5 h-5" />}
                          {job.status === 'scheduled' && <Clock className="w-5 h-5" />}
                          {job.status === 'paused' && <Pause className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{job.name}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span>Type: {job.type}</span>
                            <span>Frequency: {job.frequency}</span>
                            <span>Size: {formatBytes(job.size)}</span>
                            <span>Retention: {job.retentionDays} days</span>
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span>Destination: {job.destination.toUpperCase()}</span>
                            <span>Success Rate: {job.health.successRate}%</span>
                            <span>Avg Duration: {formatDuration(job.health.avgDuration)}</span>
                          </div>
                          {job.lastRun && (
                            <div className="mt-2 text-sm text-gray-500">
                              Last run: {new Date(job.lastRun).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {job.status === 'scheduled' && (
                          <button
                            onClick={() => handleRunBackup(job.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded"
                            title="Run now"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                        )}
                        {job.status === 'running' && (
                          <button
                            onClick={() => handlePauseJob(job.id)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"
                            title="Pause"
                          >
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setShowScheduleModal(true)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Schedule"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {job.compressionEnabled && <Archive className="w-3 h-3" />}
                        <span>Compression</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {job.encryptionEnabled && <Lock className="w-3 h-3" />}
                        <span>Encryption</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Globe className="w-3 h-3" />
                        <span>{job.includedComponents.join(', ')}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backups Tab */}
      {activeTab === 'backups' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Backup History</h2>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search backups..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="running">Running</option>
                  </select>
                  <select
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="full">Full</option>
                    <option value="incremental">Incremental</option>
                    <option value="differential">Differential</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Backup
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Duration
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map(backup => (
                      <tr key={backup.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {backup.jobName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {backup.components.join(', ')}
                            </div>
                            {backup.verified && (
                              <div className="flex items-center mt-1">
                                <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                                <span className="text-xs text-green-600">Verified</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              backup.type === 'full'
                                ? 'bg-blue-100 text-blue-800'
                                : backup.type === 'incremental'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {backup.type.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(backup.status)}`}
                          >
                            {backup.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div>{formatBytes(backup.size)}</div>
                            {backup.compressedSize < backup.size && (
                              <div className="text-xs text-gray-500">
                                → {formatBytes(backup.compressedSize)} (compressed)
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {backup.duration ? formatDuration(backup.duration) : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div>{new Date(backup.startedAt).toLocaleDateString()}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(backup.startedAt).toLocaleTimeString()}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            {backup.status === 'completed' && (
                              <button
                                onClick={() => handleStartRestore(backup.id)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Restore"
                              >
                                <UploadIcon className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              className="text-green-600 hover:text-green-900"
                              title="Download"
                            >
                              <DownloadIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setSelectedBackup(backup)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="text-red-600 hover:text-red-900" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restore Tab */}
      {activeTab === 'restore' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Restore Operations</h2>
                <button
                  onClick={() => setShowRestoreModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <UploadIcon className="w-4 h-4 mr-2" />
                  Start Restore
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {restoreJobs.map(job => (
                  <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${getStatusColor(job.status)}`}>
                          {job.status === 'running' && (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                          )}
                          {job.status === 'completed' && <CheckCircle className="w-5 h-5" />}
                          {job.status === 'failed' && <XCircle className="w-5 h-5" />}
                          {job.status === 'pending' && <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{job.backupName}</h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span>Components: {job.components.join(', ')}</span>
                            <span>Target: {job.targetLocation}</span>
                            <span>Created by: {job.createdBy}</span>
                          </div>
                          <div className="mt-2 text-sm text-gray-500">
                            Started: {new Date(job.startedAt).toLocaleString()}
                          </div>
                          {job.status === 'running' && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">
                                  {job.progress.currentComponent}
                                </span>
                                <span className="font-medium">{job.progress.percentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${job.progress.percentage}%` }}
                                ></div>
                              </div>
                              {job.progress.estimatedTimeRemaining && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Estimated time remaining:{' '}
                                  {formatDuration(job.progress.estimatedTimeRemaining)}
                                </div>
                              )}
                            </div>
                          )}
                          {job.warnings && job.warnings.length > 0 && (
                            <div className="mt-3 p-2 bg-yellow-50 rounded text-sm text-yellow-700">
                              {job.warnings.length} warning(s)
                            </div>
                          )}
                          {job.errors && job.errors.length > 0 && (
                            <div className="mt-3 p-2 bg-red-50 rounded text-sm text-red-700">
                              {job.errors.length} error(s)
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {job.status === 'completed' && job.duration && (
                          <span className="text-sm text-gray-500">
                            {formatDuration(job.duration)}
                          </span>
                        )}
                        <button className="p-2 text-gray-400 hover:text-gray-600">
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

      {/* Storage Tab */}
      {activeTab === 'storage' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Storage Configuration</h2>
              <p className="text-sm text-gray-600 mt-1">
                Manage backup storage destinations and settings
              </p>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {storageInfo.map(storage => (
                  <div key={storage.provider} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div
                          className={`p-2 rounded-lg ${
                            storage.connectionStatus === 'connected' ? 'bg-green-100' : 'bg-red-100'
                          }`}
                        >
                          {getStorageIcon(storage.provider)}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 capitalize">
                            {storage.provider} Storage
                          </h3>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span>Location: {storage.location}</span>
                            <span>Total: {formatBytes(storage.totalSpace)}</span>
                            <span>Used: {formatBytes(storage.usedSpace)}</span>
                            <span className={getConnectionStatusColor(storage.connectionStatus)}>
                              {storage.connectionStatus}
                            </span>
                          </div>
                          {storage.lastVerified && (
                            <div className="mt-2 text-sm text-gray-500">
                              Last verified: {new Date(storage.lastVerified).toLocaleString()}
                            </div>
                          )}
                          <div className="mt-3">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${(storage.usedSpace / storage.totalSpace) * 100}%`,
                                }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Test Connection"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600" title="Settings">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        {storage.credentials.encrypted ? (
                          <>
                            <Lock className="w-3 h-3" />
                            <span>Encrypted credentials</span>
                          </>
                        ) : (
                          <>
                            <Unlock className="w-3 h-3" />
                            <span>Unencrypted credentials</span>
                          </>
                        )}
                      </div>
                      {storage.credentials.lastRotated && (
                        <div className="text-xs text-gray-500">
                          Last rotated:{' '}
                          {new Date(storage.credentials.lastRotated).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backup Details Modal */}
      {selectedBackup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Backup Details</h2>
                <button
                  onClick={() => setSelectedBackup(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Basic Information</h3>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-gray-600">Job Name:</dt>
                      <dd className="text-gray-900">{selectedBackup.jobName}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Type:</dt>
                      <dd className="text-gray-900 capitalize">{selectedBackup.type}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Status:</dt>
                      <dd className="text-gray-900 capitalize">{selectedBackup.status}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Created by:</dt>
                      <dd className="text-gray-900">{selectedBackup.createdBy}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Size & Duration</h3>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-gray-600">Original Size:</dt>
                      <dd className="text-gray-900">{formatBytes(selectedBackup.size)}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Compressed Size:</dt>
                      <dd className="text-gray-900">
                        {formatBytes(selectedBackup.compressedSize)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">File Count:</dt>
                      <dd className="text-gray-900">{selectedBackup.fileCount.toLocaleString()}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Duration:</dt>
                      <dd className="text-gray-900">
                        {selectedBackup.duration ? formatDuration(selectedBackup.duration) : 'N/A'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Components</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedBackup.components.map(component => (
                      <span
                        key={component}
                        className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-sm"
                      >
                        {component}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Location & Verification</h3>
                  <dl className="grid grid-cols-1 gap-2 text-sm">
                    <div>
                      <dt className="text-gray-600">Location:</dt>
                      <dd className="text-gray-900 font-mono text-xs break-all">
                        {selectedBackup.location}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Checksum:</dt>
                      <dd className="text-gray-900 font-mono text-xs">{selectedBackup.checksum}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Verified:</dt>
                      <dd className="text-gray-900">
                        {selectedBackup.verified ? (
                          <span className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center text-yellow-600">
                            <AlertCircle className="w-4 h-4 mr-1" />
                            Not verified
                          </span>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>

                {selectedBackup.errors && selectedBackup.errors.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">Errors</h3>
                    <div className="space-y-2">
                      {selectedBackup.errors.map((error, index) => (
                        <div key={index} className="p-2 bg-red-50 rounded text-sm text-red-700">
                          {error}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedBackup(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleStartRestore(selectedBackup.id)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Start Restore
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupRestorePage;
