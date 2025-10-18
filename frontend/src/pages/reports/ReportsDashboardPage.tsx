import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Activity,
  Calendar,
  Filter,
  Download,
  Share2,
  Plus,
  Settings,
  Eye,
  EyeOff,
  RefreshCw,
  Maximize2,
  Minimize2,
  Grid,
  List,
  Search,
  ChevronDown,
  ChevronUp,
  Clock,
  Users,
  Target,
  Zap,
  Award,
  AlertTriangle,
  CheckCircle,
  FileText,
  Database,
  Layers,
  BarChart,
  LineChart,
  AreaChart,
  ScatterChart,
  Save,
  Trash2,
  Edit,
  Copy,
  Star,
  Bookmark,
  BookmarkOff,
  Bell,
  BellOff,
} from 'lucide-react';

interface Report {
  id: string;
  name: string;
  description: string;
  type:
    | 'burndown'
    | 'burnup'
    | 'velocity'
    | 'cumulative_flow'
    | 'team_performance'
    | 'sprint_comparison'
    | 'custom';
  category: 'sprint' | 'team' | 'project' | 'product' | 'custom';
  chartType: 'line' | 'bar' | 'pie' | 'area' | 'scatter';
  status: 'ready' | 'generating' | 'error';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isFavorite: boolean;
  isPublic: boolean;
  tags: string[];
  metrics: {
    views: number;
    shares: number;
    exports: number;
  };
  filters: ReportFilter[];
  config: ReportConfig;
}

interface ReportFilter {
  field: string;
  operator: string;
  value: any;
  label: string;
}

interface ReportConfig {
  dateRange: {
    start: string;
    end: string;
  };
  granularity: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  grouping: string[];
  metrics: string[];
  compareWith?: string;
  targets?: Record<string, number>;
}

interface SavedReport {
  id: string;
  name: string;
  description: string;
  config: ReportConfig;
  isDefault: boolean;
  isShared: boolean;
  createdAt: string;
}

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string;
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }>;
}

interface QuickStats {
  totalTasks: number;
  completedTasks: number;
  totalHours: number;
  teamVelocity: number;
  efficiency: number;
  onTimeDelivery: number;
  bugCount: number;
  customerSatisfaction: number;
}

const ReportsDashboardPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  const [showCreateReport, setShowCreateReport] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  });
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());

  // Mock data
  useEffect(() => {
    setTimeout(() => {
      const mockReports: Report[] = [
        {
          id: 'report-1',
          name: 'Sprint Burndown Chart',
          description: 'Track remaining work across the current sprint',
          type: 'burndown',
          category: 'sprint',
          chartType: 'line',
          status: 'ready',
          createdAt: '2024-01-15T10:00:00Z',
          updatedAt: '2024-01-15T14:30:00Z',
          createdBy: 'Alice Johnson',
          isFavorite: true,
          isPublic: true,
          tags: ['sprint', 'burndown', 'current'],
          metrics: {
            views: 145,
            shares: 12,
            exports: 8,
          },
          filters: [
            { field: 'sprint', operator: 'equals', value: 'sprint-12', label: 'Sprint 12' },
            { field: 'status', operator: 'not_equals', value: 'done', label: 'Active Tasks' },
          ],
          config: {
            dateRange: {
              start: '2024-01-01',
              end: '2024-01-15',
            },
            granularity: 'daily',
            grouping: ['status'],
            metrics: ['story_points', 'tasks'],
            targets: {
              ideal_burndown: 100,
            },
          },
        },
        {
          id: 'report-2',
          name: 'Team Velocity Report',
          description: 'Analyze team velocity across multiple sprints',
          type: 'velocity',
          category: 'team',
          chartType: 'bar',
          status: 'ready',
          createdAt: '2024-01-14T09:00:00Z',
          updatedAt: '2024-01-14T16:45:00Z',
          createdBy: 'Bob Smith',
          isFavorite: false,
          isPublic: true,
          tags: ['velocity', 'team', 'performance'],
          metrics: {
            views: 98,
            shares: 8,
            exports: 5,
          },
          filters: [
            { field: 'team', operator: 'equals', value: 'frontend', label: 'Frontend Team' },
            {
              field: 'date_range',
              operator: 'between',
              value: ['2024-01-01', '2024-01-15'],
              label: 'Last 2 weeks',
            },
          ],
          config: {
            dateRange: {
              start: '2023-10-01',
              end: '2024-01-15',
            },
            granularity: 'weekly',
            grouping: ['sprint'],
            metrics: ['velocity', 'commitment', 'completion'],
          },
        },
        {
          id: 'report-3',
          name: 'Cumulative Flow Diagram',
          description: 'Visualize work flow and identify bottlenecks',
          type: 'cumulative_flow',
          category: 'process',
          chartType: 'area',
          status: 'ready',
          createdAt: '2024-01-13T11:30:00Z',
          updatedAt: '2024-01-13T17:20:00Z',
          createdBy: 'Carol Davis',
          isFavorite: true,
          isPublic: false,
          tags: ['flow', 'process', 'bottlenecks'],
          metrics: {
            views: 76,
            shares: 6,
            exports: 3,
          },
          filters: [
            {
              field: 'project',
              operator: 'equals',
              value: 'ecommerce',
              label: 'E-commerce Project',
            },
          ],
          config: {
            dateRange: {
              start: '2024-01-01',
              end: '2024-01-15',
            },
            granularity: 'daily',
            grouping: ['status'],
            metrics: ['task_count'],
          },
        },
        {
          id: 'report-4',
          name: 'Team Performance Overview',
          description: 'Comprehensive team performance metrics',
          type: 'team_performance',
          category: 'team',
          chartType: 'bar',
          status: 'ready',
          createdAt: '2024-01-12T14:00:00Z',
          updatedAt: '2024-01-12T18:30:00Z',
          createdBy: 'David Wilson',
          isFavorite: false,
          isPublic: true,
          tags: ['performance', 'team', 'metrics'],
          metrics: {
            views: 124,
            shares: 15,
            exports: 10,
          },
          filters: [
            {
              field: 'teams',
              operator: 'in',
              value: ['frontend', 'backend'],
              label: 'Engineering Teams',
            },
          ],
          config: {
            dateRange: {
              start: '2024-01-01',
              end: '2024-01-15',
            },
            granularity: 'weekly',
            grouping: ['team', 'member'],
            metrics: ['efficiency', 'quality', 'velocity'],
          },
        },
        {
          id: 'report-5',
          name: 'Bug Trends Analysis',
          description: 'Track bug creation and resolution trends',
          type: 'custom',
          category: 'quality',
          chartType: 'line',
          status: 'generating',
          createdAt: '2024-01-15T08:00:00Z',
          updatedAt: '2024-01-15T08:00:00Z',
          createdBy: 'Eve Martinez',
          isFavorite: false,
          isPublic: true,
          tags: ['bugs', 'quality', 'trends'],
          metrics: {
            views: 23,
            shares: 2,
            exports: 1,
          },
          filters: [
            {
              field: 'priority',
              operator: 'in',
              value: ['high', 'critical'],
              label: 'High Priority Bugs',
            },
          ],
          config: {
            dateRange: {
              start: '2024-01-01',
              end: '2024-01-15',
            },
            granularity: 'daily',
            grouping: ['status'],
            metrics: ['created', 'resolved', ' reopened'],
          },
        },
      ];

      const mockSavedReports: SavedReport[] = [
        {
          id: 'saved-1',
          name: 'Weekly Performance Review',
          description: 'Standard weekly performance metrics for leadership',
          config: {
            dateRange: {
              start: '2024-01-08',
              end: '2024-01-15',
            },
            granularity: 'daily',
            grouping: ['team'],
            metrics: ['velocity', 'efficiency', 'quality'],
            compareWith: 'previous_week',
          },
          isDefault: true,
          isShared: true,
          createdAt: '2024-01-10T00:00:00Z',
        },
        {
          id: 'saved-2',
          name: 'Sprint Review Package',
          description: 'Complete sprint review report with all key metrics',
          config: {
            dateRange: {
              start: '2024-01-01',
              end: '2024-01-15',
            },
            granularity: 'daily',
            grouping: ['status', 'priority'],
            metrics: ['burndown', 'velocity', 'completion_rate'],
          },
          isDefault: false,
          isShared: false,
          createdAt: '2024-01-12T00:00:00Z',
        },
      ];

      const mockQuickStats: QuickStats = {
        totalTasks: 247,
        completedTasks: 189,
        totalHours: 1234,
        teamVelocity: 45,
        efficiency: 87,
        onTimeDelivery: 92,
        bugCount: 12,
        customerSatisfaction: 4.6,
      };

      setReports(mockReports);
      setSavedReports(mockSavedReports);
      setQuickStats(mockQuickStats);
      setIsLoading(false);
    }, 1000);
  }, []);

  const toggleReportExpansion = (reportId: string) => {
    const newExpanded = new Set(expandedReports);
    if (newExpanded.has(reportId)) {
      newExpanded.delete(reportId);
    } else {
      newExpanded.add(reportId);
    }
    setExpandedReports(newExpanded);
  };

  const toggleFavorite = (reportId: string) => {
    setReports(
      reports.map(report =>
        report.id === reportId ? { ...report, isFavorite: !report.isFavorite } : report
      )
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'generating':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'error':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50';
    }
  };

  const getChartIcon = (chartType: string) => {
    switch (chartType) {
      case 'line':
        return <LineChart className="w-5 h-5" />;
      case 'bar':
        return <BarChart className="w-5 h-5" />;
      case 'pie':
        return <PieChart className="w-5 h-5" />;
      case 'area':
        return <AreaChart className="w-5 h-5" />;
      case 'scatter':
        return <ScatterChart className="w-5 h-5" />;
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'burndown':
        return <TrendingUp className="w-5 h-5 text-red-500" />;
      case 'burnup':
        return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'velocity':
        return <Zap className="w-5 h-5 text-blue-500" />;
      case 'cumulative_flow':
        return <Layers className="w-5 h-5 text-purple-500" />;
      case 'team_performance':
        return <Users className="w-5 h-5 text-orange-500" />;
      case 'sprint_comparison':
        return <BarChart3 className="w-5 h-5 text-teal-500" />;
      default:
        return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch =
      report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
    const matchesType = typeFilter === 'all' || report.type === typeFilter;
    const matchesFavorite = !showFavorites || report.isFavorite;

    return matchesSearch && matchesCategory && matchesType && matchesFavorite;
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'sprint', label: 'Sprint' },
    { value: 'team', label: 'Team' },
    { value: 'project', label: 'Project' },
    { value: 'product', label: 'Product' },
    { value: 'quality', label: 'Quality' },
    { value: 'process', label: 'Process' },
    { value: 'custom', label: 'Custom' },
  ];

  const reportTypes = [
    { value: 'all', label: 'All Types' },
    { value: 'burndown', label: 'Burndown' },
    { value: 'burnup', label: 'Burnup' },
    { value: 'velocity', label: 'Velocity' },
    { value: 'cumulative_flow', label: 'Cumulative Flow' },
    { value: 'team_performance', label: 'Team Performance' },
    { value: 'sprint_comparison', label: 'Sprint Comparison' },
    { value: 'custom', label: 'Custom' },
  ];

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
        <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Comprehensive insights and performance metrics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Create Report
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      {quickStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {quickStats.totalTasks}
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                  +{quickStats.completedTasks} completed
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Target className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Team Velocity
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {quickStats.teamVelocity}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">points per sprint</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Zap className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Efficiency</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {quickStats.efficiency}%
                </p>
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  +5% from last sprint
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Activity className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  On-Time Delivery
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                  {quickStats.onTimeDelivery}%
                </p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">2 tasks delayed</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Saved Reports */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Quick Access Reports
          </h3>
          <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm">
            Manage Saved
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {savedReports.map(savedReport => (
            <div
              key={savedReport.id}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      {savedReport.name}
                    </h4>
                    {savedReport.isDefault && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded text-xs">
                        Default
                      </span>
                    )}
                    {savedReport.isShared && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded text-xs">
                        Shared
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {savedReport.description}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Created: {new Date(savedReport.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Report Library</h3>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {reportTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors ${
                showFavorites
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {showFavorites ? (
                <Star className="w-4 h-4 fill-current mr-2" />
              ) : (
                <Star className="w-4 h-4 mr-2" />
              )}
              Favorites
            </button>

            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Date Range:</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>

          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reports Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map(report => (
            <div
              key={report.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {getReportTypeIcon(report.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{report.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
                        >
                          {report.status}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {report.type}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => toggleFavorite(report.id)}
                      className="p-1 text-gray-400 hover:text-yellow-500"
                    >
                      <Star
                        className={`w-4 h-4 ${report.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`}
                      />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {report.description}
                </p>

                {/* Chart Preview */}
                <div className="h-32 bg-gray-50 dark:bg-gray-700/30 rounded-lg mb-4 flex items-center justify-center">
                  {getChartIcon(report.chartType)}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {report.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Metrics */}
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>{report.metrics.views}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Share2 className="w-3 h-3" />
                      <span>{report.metrics.shares}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Download className="w-3 h-3" />
                      <span>{report.metrics.exports}</span>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Report
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Expandable Details */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-700/30">
                <button
                  onClick={() => toggleReportExpansion(report.id)}
                  className="w-full flex items-center justify-center py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  {expandedReports.has(report.id) ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-1" />
                      Hide Details
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-1" />
                      Show Details
                    </>
                  )}
                </button>

                {expandedReports.has(report.id) && (
                  <div className="mt-4 space-y-3">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">Created by:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {report.createdBy}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900 dark:text-white">
                        Last updated:
                      </span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {new Date(report.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {report.filters.length > 0 && (
                      <div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          Active Filters:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {report.filters.map((filter, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-white dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded text-xs"
                            >
                              {filter.label}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map(report => (
            <div
              key={report.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    {getReportTypeIcon(report.type)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{report.name}</h3>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
                      >
                        {report.status}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {report.type}
                      </span>
                      {report.isFavorite && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {report.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>Created by {report.createdBy}</span>
                      <span>Updated {new Date(report.updatedAt).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{report.metrics.views}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Share2 className="w-3 h-3" />
                          <span>{report.metrics.shares}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedReport(report)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    View Report
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleFavorite(report.id)}
                    className="p-2 text-gray-400 hover:text-yellow-500"
                  >
                    <Star
                      className={`w-4 h-4 ${report.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <BarChart3 className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || categoryFilter !== 'all' || typeFilter !== 'all' || showFavorites
              ? 'No reports match your filters'
              : 'No reports created yet'}
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create Your First Report
          </button>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboardPage;
