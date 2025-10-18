import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Download,
  Calendar,
  Filter,
  RefreshCw,
  Settings,
  FileText,
  Activity,
  Zap,
  Database,
  Globe,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  BarChart,
  PieChart as PieChartIcon,
  Download as DownloadIcon,
  Upload,
  Share2,
  Target,
  ArrowUp,
  ArrowDown,
  Minus,
  MoreVertical,
  ChevronDown,
  Search,
  Mail,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react';

// Types
interface UsageMetric {
  name: string;
  value: number;
  previousValue: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  unit: string;
  icon: React.ReactNode;
  color: string;
}

interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    fill?: boolean;
  }>;
}

interface UserActivityData {
  date: string;
  activeUsers: number;
  newUsers: number;
  returningUsers: number;
  totalSessions: number;
  avgSessionDuration: number;
  bounceRate: number;
}

interface FeatureUsageData {
  feature: string;
  usage: number;
  users: number;
  growth: number;
  category: string;
}

interface DeviceData {
  device: string;
  users: number;
  percentage: number;
  sessions: number;
}

interface GeographicData {
  country: string;
  users: number;
  percentage: number;
  cities: Array<{
    name: string;
    users: number;
  }>;
}

interface FilterOptions {
  dateRange: string;
  startDate: string;
  endDate: string;
  granularity: 'hour' | 'day' | 'week' | 'month';
  organization: string;
  userSegment: string;
  featureCategory: string;
}

const UsageAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: '30',
    startDate: '',
    endDate: '',
    granularity: 'day',
    organization: 'all',
    userSegment: 'all',
    featureCategory: 'all',
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [usageMetrics, setUsageMetrics] = useState<UsageMetric[]>([]);
  const [userActivityData, setUserActivityData] = useState<UserActivityData[]>([]);
  const [featureUsageData, setFeatureUsageData] = useState<FeatureUsageData[]>([]);
  const [deviceData, setDeviceData] = useState<DeviceData[]>([]);
  const [geographicData, setGeographicData] = useState<GeographicData[]>([]);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json' | 'pdf'>('csv');
  const [showExportModal, setShowExportModal] = useState(false);

  // Mock data generation
  useEffect(() => {
    const generateUsageMetrics = (): UsageMetric[] => [
      {
        name: 'Total Users',
        value: 45230,
        previousValue: 42100,
        change: 7.4,
        changeType: 'increase',
        unit: 'users',
        icon: <Users className="w-5 h-5" />,
        color: 'blue',
      },
      {
        name: 'Active Users',
        value: 12450,
        previousValue: 11800,
        change: 5.5,
        changeType: 'increase',
        unit: 'users',
        icon: <Activity className="w-5 h-5" />,
        color: 'green',
      },
      {
        name: 'Page Views',
        value: 892340,
        previousValue: 845200,
        change: 5.6,
        changeType: 'increase',
        unit: 'views',
        icon: <Eye className="w-5 h-5" />,
        color: 'purple',
      },
      {
        name: 'Sessions',
        value: 234560,
        previousValue: 228900,
        change: 2.5,
        changeType: 'increase',
        unit: 'sessions',
        icon: <Clock className="w-5 h-5" />,
        color: 'orange',
      },
      {
        name: 'Avg Session Duration',
        value: 8.5,
        previousValue: 8.2,
        change: 3.7,
        changeType: 'increase',
        unit: 'minutes',
        icon: <Target className="w-5 h-5" />,
        color: 'indigo',
      },
      {
        name: 'Bounce Rate',
        value: 32.4,
        previousValue: 35.1,
        change: -7.7,
        changeType: 'decrease',
        unit: '%',
        icon: <TrendingDown className="w-5 h-5" />,
        color: 'red',
      },
    ];

    const generateUserActivityData = (): UserActivityData[] => {
      const days = parseInt(filters.dateRange) || 30;
      return Array.from({ length: days }, (_, i) => {
        const date = new Date(Date.now() - (days - i - 1) * 24 * 60 * 60 * 1000);
        return {
          date: date.toISOString().split('T')[0],
          activeUsers: Math.floor(Math.random() * 2000) + 10000,
          newUsers: Math.floor(Math.random() * 200) + 300,
          returningUsers: Math.floor(Math.random() * 1500) + 9000,
          totalSessions: Math.floor(Math.random() * 5000) + 20000,
          avgSessionDuration: Math.random() * 4 + 6,
          bounceRate: Math.random() * 15 + 25,
        };
      });
    };

    const generateFeatureUsageData = (): FeatureUsageData[] => [
      { feature: 'Project Management', usage: 8945, users: 3456, growth: 12.3, category: 'Core' },
      { feature: 'Task Tracking', usage: 12456, users: 4567, growth: 8.7, category: 'Core' },
      {
        feature: 'Team Collaboration',
        usage: 6789,
        users: 2345,
        growth: 15.2,
        category: 'Collaboration',
      },
      {
        feature: 'File Sharing',
        usage: 4567,
        users: 1234,
        growth: -2.1,
        category: 'Collaboration',
      },
      { feature: 'Time Tracking', usage: 3456, users: 987, growth: 23.4, category: 'Productivity' },
      { feature: 'Reporting', usage: 2345, users: 678, growth: 6.8, category: 'Analytics' },
      { feature: 'Mobile App', usage: 5678, users: 1890, growth: 34.5, category: 'Mobile' },
      { feature: 'API Usage', usage: 18900, users: 234, growth: 45.6, category: 'Integration' },
    ];

    const generateDeviceData = (): DeviceData[] => [
      { device: 'Desktop', users: 12450, percentage: 65.2, sessions: 45670 },
      { device: 'Mobile', users: 5230, percentage: 27.4, sessions: 18900 },
      { device: 'Tablet', users: 1350, percentage: 7.1, sessions: 4890 },
      { device: 'Other', users: 180, percentage: 0.3, sessions: 650 },
    ];

    const generateGeographicData = (): GeographicData[] => [
      {
        country: 'United States',
        users: 12450,
        percentage: 45.2,
        cities: [
          { name: 'New York', users: 3456 },
          { name: 'San Francisco', users: 2890 },
          { name: 'Chicago', users: 1567 },
          { name: 'Los Angeles', users: 1234 },
        ],
      },
      {
        country: 'United Kingdom',
        users: 5670,
        percentage: 20.6,
        cities: [
          { name: 'London', users: 3456 },
          { name: 'Manchester', users: 890 },
          { name: 'Birmingham', users: 567 },
        ],
      },
      {
        country: 'Germany',
        users: 3450,
        percentage: 12.5,
        cities: [
          { name: 'Berlin', users: 1234 },
          { name: 'Munich', users: 890 },
          { name: 'Hamburg', users: 567 },
        ],
      },
      {
        country: 'Canada',
        users: 2340,
        percentage: 8.5,
        cities: [
          { name: 'Toronto', users: 1234 },
          { name: 'Vancouver', users: 567 },
        ],
      },
      {
        country: 'Australia',
        users: 1890,
        percentage: 6.9,
        cities: [
          { name: 'Sydney', users: 890 },
          { name: 'Melbourne', users: 567 },
        ],
      },
    ];

    setUsageMetrics(generateUsageMetrics());
    setUserActivityData(generateUserActivityData());
    setFeatureUsageData(generateFeatureUsageData());
    setDeviceData(generateDeviceData());
    setGeographicData(generateGeographicData());
    setLoading(false);
  }, [filters.dateRange]);

  const handleExport = () => {
    console.log(`Exporting data as ${exportFormat}`);
    setShowExportModal(false);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getChangeIcon = (type: 'increase' | 'decrease' | 'neutral') => {
    switch (type) {
      case 'increase':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'decrease':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device) {
      case 'Desktop':
        return <Monitor className="w-4 h-4" />;
      case 'Mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'Tablet':
        return <Tablet className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Usage Analytics</h1>
            <p className="text-gray-600">
              Comprehensive insights into system usage and user behavior
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <DownloadIcon className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Filters</h3>
          <button
            onClick={() =>
              setFilters({
                dateRange: '30',
                startDate: '',
                endDate: '',
                granularity: 'day',
                organization: 'all',
                userSegment: 'all',
                featureCategory: 'all',
              })
            }
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear Filters
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.dateRange}
              onChange={e => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Granularity</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.granularity}
              onChange={e => setFilters(prev => ({ ...prev, granularity: e.target.value as any }))}
            >
              <option value="hour">Hourly</option>
              <option value="day">Daily</option>
              <option value="week">Weekly</option>
              <option value="month">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.organization}
              onChange={e => setFilters(prev => ({ ...prev, organization: e.target.value }))}
            >
              <option value="all">All Organizations</option>
              <option value="cnc-manufacturing">CNC Manufacturing</option>
              <option value="tech-solutions">Tech Solutions</option>
              <option value="engineering-corp">Engineering Corp</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">User Segment</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.userSegment}
              onChange={e => setFilters(prev => ({ ...prev, userSegment: e.target.value }))}
            >
              <option value="all">All Users</option>
              <option value="new">New Users</option>
              <option value="returning">Returning Users</option>
              <option value="active">Active Users</option>
              <option value="inactive">Inactive Users</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.startDate}
              onChange={e => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.endDate}
              onChange={e => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'users', 'features', 'devices', 'geographic'].map(tab => (
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
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {usageMetrics.map(metric => (
              <div key={metric.name} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.name}</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatNumber(metric.value)}
                      <span className="text-sm text-gray-500 ml-1">{metric.unit}</span>
                    </p>
                  </div>
                  <div className={`p-3 bg-${metric.color}-100 rounded-lg`}>{metric.icon}</div>
                </div>
                <div className="flex items-center mt-4">
                  {getChangeIcon(metric.changeType)}
                  <span
                    className={`ml-2 text-sm ${
                      metric.changeType === 'increase'
                        ? 'text-green-600'
                        : metric.changeType === 'decrease'
                          ? 'text-red-600'
                          : 'text-gray-600'
                    }`}
                  >
                    {Math.abs(metric.change)}% from last period
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* User Activity Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity Trends</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <LineChart className="w-12 h-12 mx-auto mb-4" />
                <p>Interactive chart showing user activity over time</p>
                <p className="text-sm">Would integrate with Chart.js or similar library</p>
              </div>
            </div>
          </div>

          {/* Feature Usage */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Usage</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Users
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Growth
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {featureUsageData.map(feature => (
                    <tr key={feature.feature}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {feature.feature}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(feature.usage)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatNumber(feature.users)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {feature.growth > 0 ? (
                            <ArrowUp className="w-4 h-4 text-green-600 mr-1" />
                          ) : (
                            <ArrowDown className="w-4 h-4 text-red-600 mr-1" />
                          )}
                          <span
                            className={`text-sm ${
                              feature.growth > 0 ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {Math.abs(feature.growth)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                          {feature.category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-8">
          {/* User Activity Timeline */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity Timeline</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <BarChart className="w-12 h-12 mx-auto mb-4" />
                <p>Daily active users, new users, and session trends</p>
              </div>
            </div>
          </div>

          {/* User Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Session Duration</span>
                  <span className="text-lg font-semibold text-gray-900">8.5 min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Bounce Rate</span>
                  <span className="text-lg font-semibold text-gray-900">32.4%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Pages per Session</span>
                  <span className="text-lg font-semibold text-gray-900">4.2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">New vs Returning</span>
                  <span className="text-lg font-semibold text-gray-900">23% / 77%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Retention</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Day 1</span>
                    <span className="text-sm font-medium text-gray-900">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Day 7</span>
                    <span className="text-sm font-medium text-gray-900">62%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Day 30</span>
                    <span className="text-sm font-medium text-gray-900">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600">Day 90</span>
                    <span className="text-sm font-medium text-gray-900">28%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '28%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Features Tab */}
      {activeTab === 'features' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Adoption</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <PieChartIcon className="w-12 h-12 mx-auto mb-4" />
                <p>Feature adoption and usage distribution</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Feature Engagement Matrix</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {featureUsageData.map(feature => (
                <div key={feature.feature} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">{feature.feature}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Usage:</span>
                      <span className="font-medium">{formatNumber(feature.usage)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Users:</span>
                      <span className="font-medium">{formatNumber(feature.users)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Growth:</span>
                      <span
                        className={`font-medium ${
                          feature.growth > 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {feature.growth > 0 ? '+' : ''}
                        {feature.growth}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min((feature.users / 45230) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Devices Tab */}
      {activeTab === 'devices' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Distribution</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <PieChartIcon className="w-12 h-12 mx-auto mb-4" />
                  <p>Device type distribution</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Details</h3>
              <div className="space-y-4">
                {deviceData.map(device => (
                  <div key={device.device} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getDeviceIcon(device.device)}
                      <div>
                        <div className="font-medium text-gray-900">{device.device}</div>
                        <div className="text-sm text-gray-500">{device.sessions} sessions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">{formatNumber(device.users)}</div>
                      <div className="text-sm text-gray-500">{device.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Geographic Tab */}
      {activeTab === 'geographic' && (
        <div className="space-y-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
            <div className="h-64 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <Globe className="w-12 h-12 mx-auto mb-4" />
                <p>World map with user distribution</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Countries</h3>
            <div className="space-y-4">
              {geographicData.map(country => (
                <div
                  key={country.country}
                  className="border-b border-gray-200 pb-4 last:border-b-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{country.country}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">
                        {formatNumber(country.users)}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">({country.percentage}%)</span>
                    </div>
                  </div>
                  <div className="ml-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {country.cities.map(city => (
                        <div key={city.name} className="text-sm">
                          <span className="text-gray-600">{city.name}:</span>
                          <span className="text-gray-900 ml-1">{formatNumber(city.users)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Export Analytics Data</h3>
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
                      <span className="text-sm">Include charts and graphs</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" className="mr-2" />
                      <span className="text-sm">Include raw data</span>
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
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageAnalyticsPage;
