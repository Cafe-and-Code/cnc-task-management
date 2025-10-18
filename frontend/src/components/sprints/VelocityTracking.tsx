import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  Calendar,
  Target,
  Users,
  AlertTriangle,
  Info,
  Filter,
  Download,
} from 'lucide-react';

// Types
interface SprintVelocity {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  capacity: number;
  committed: number;
  completed: number;
  velocity: number;
  efficiency: number;
  teamMembers: number;
  storyCount: number;
  status: 'completed' | 'active' | 'cancelled';
}

interface VelocityMetrics {
  averageVelocity: number;
  velocityRange: { min: number; max: number };
  velocityTrend: 'improving' | 'declining' | 'stable';
  averageEfficiency: number;
  consistency: number;
  predictability: number;
  recommendedCapacity: number;
}

interface VelocityTrackingProps {
  sprintData: SprintVelocity[];
  teamMembers?: Array<{ id: string; name: string; role: string }>;
  dateRange?: { start: string; end: string };
  showPredictions?: boolean;
  showRecommendations?: boolean;
  compact?: boolean;
  height?: number;
}

export const VelocityTracking: React.FC<VelocityTrackingProps> = ({
  sprintData,
  teamMembers = [],
  dateRange,
  showPredictions = true,
  showRecommendations = true,
  compact = false,
  height = 400,
}) => {
  const [viewMode, setViewMode] = useState<'chart' | 'table' | 'metrics'>('chart');
  const [metricFilter, setMetricFilter] = useState<'all' | 'velocity' | 'efficiency' | 'capacity'>(
    'all'
  );

  // Filter sprint data
  const filteredSprints = useMemo(() => {
    let filtered = sprintData.filter(sprint => sprint.status === 'completed');

    if (dateRange) {
      filtered = filtered.filter(sprint => {
        const sprintEnd = new Date(sprint.endDate);
        const rangeStart = new Date(dateRange.start);
        const rangeEnd = new Date(dateRange.end);
        return sprintEnd >= rangeStart && sprintEnd <= rangeEnd;
      });
    }

    return filtered.sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
  }, [sprintData, dateRange]);

  // Calculate velocity metrics
  const metrics = useMemo((): VelocityMetrics => {
    if (filteredSprints.length === 0) {
      return {
        averageVelocity: 0,
        velocityRange: { min: 0, max: 0 },
        velocityTrend: 'stable',
        averageEfficiency: 0,
        consistency: 0,
        predictability: 0,
        recommendedCapacity: 40,
      };
    }

    const velocities = filteredSprints.map(s => s.velocity);
    const averageVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
    const velocityRange = {
      min: Math.min(...velocities),
      max: Math.max(...velocities),
    };

    // Calculate trend
    const recentSprints = velocities.slice(-3);
    const olderSprints = velocities.slice(0, -3);
    const recentAvg =
      recentSprints.length > 0
        ? recentSprints.reduce((sum, v) => sum + v, 0) / recentSprints.length
        : averageVelocity;
    const olderAvg =
      olderSprints.length > 0
        ? olderSprints.reduce((sum, v) => sum + v, 0) / olderSprints.length
        : averageVelocity;

    let velocityTrend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentAvg > olderAvg * 1.1) velocityTrend = 'improving';
    else if (recentAvg < olderAvg * 0.9) velocityTrend = 'declining';

    // Calculate efficiency
    const efficiencies = filteredSprints.map(s => s.efficiency);
    const averageEfficiency = efficiencies.reduce((sum, e) => sum + e, 0) / efficiencies.length;

    // Calculate consistency (coefficient of variation)
    const variance =
      velocities.reduce((sum, v) => sum + Math.pow(v - averageVelocity, 2), 0) / velocities.length;
    const standardDeviation = Math.sqrt(variance);
    const consistency = averageVelocity > 0 ? (1 - standardDeviation / averageVelocity) * 100 : 0;

    // Calculate predictability (how close actual velocity is to commitment)
    const predictabilityScores = filteredSprints.map(s =>
      s.capacity > 0 ? 1 - Math.abs(s.velocity - s.capacity) / s.capacity : 0
    );
    const predictability =
      (predictabilityScores.reduce((sum, score) => sum + score, 0) / predictabilityScores.length) *
      100;

    // Recommended capacity (based on 85% of average velocity for safety)
    const recommendedCapacity = Math.round(averageVelocity * 0.85);

    return {
      averageVelocity: Math.round(averageVelocity),
      velocityRange: { min: Math.round(velocityRange.min), max: Math.round(velocityRange.max) },
      velocityTrend,
      averageEfficiency: Math.round(averageEfficiency * 100),
      consistency: Math.round(consistency),
      predictability: Math.round(predictability),
      recommendedCapacity,
    };
  }, [filteredSprints]);

  // Prepare chart data
  const chartData = useMemo(() => {
    return filteredSprints.map((sprint, index) => ({
      ...sprint,
      sprintNumber: index + 1,
      name: `Sprint ${index + 1}`,
      efficiency: Math.round(sprint.efficiency * 100),
      utilization: sprint.capacity > 0 ? Math.round((sprint.completed / sprint.capacity) * 100) : 0,
    }));
  }, [filteredSprints]);

  // Generate future predictions
  const predictionData = useMemo(() => {
    if (!showPredictions || filteredSprints.length < 3) return [];

    const lastSprint = filteredSprints[filteredSprints.length - 1];
    const predictions = [];

    for (let i = 1; i <= 3; i++) {
      const predictedVelocity = metrics.averageVelocity + (Math.random() - 0.5) * 10;
      predictions.push({
        sprintNumber: filteredSprints.length + i,
        name: `Sprint ${filteredSprints.length + i} (Predicted)`,
        predicted: Math.round(Math.max(0, predictedVelocity)),
        min: Math.round(Math.max(0, metrics.velocityRange.min - 5)),
        max: Math.round(metrics.velocityRange.max + 5),
      });
    }

    return predictions;
  }, [showPredictions, filteredSprints.length, metrics.averageVelocity, metrics.velocityRange]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 dark:text-green-400';
      case 'declining':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{data.name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between space-x-4">
              <span className="text-blue-600 dark:text-blue-400">Velocity:</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.velocity} pts</span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-green-600 dark:text-green-400">Completed:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.completed} pts
              </span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-purple-600 dark:text-purple-400">Efficiency:</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.efficiency}%</span>
            </div>
            {data.utilization !== undefined && (
              <div className="flex items-center justify-between space-x-4">
                <span className="text-yellow-600 dark:text-yellow-400">Utilization:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.utilization}%
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.averageVelocity}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Velocity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {metrics.averageEfficiency}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Efficiency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {metrics.consistency}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Consistency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {metrics.recommendedCapacity}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Recommended</div>
          </div>
        </div>

        {/* Trend Indicator */}
        <div className="flex items-center justify-center space-x-2 text-sm">
          {getTrendIcon(metrics.velocityTrend)}
          <span className={getTrendColor(metrics.velocityTrend)}>
            Velocity is {metrics.velocityTrend}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Velocity Tracking</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Team performance analysis and trends
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={metricFilter}
            onChange={e => setMetricFilter(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">All Metrics</option>
            <option value="velocity">Velocity</option>
            <option value="efficiency">Efficiency</option>
            <option value="capacity">Capacity</option>
          </select>
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {[
              { id: 'chart', label: 'Chart', icon: <BarChart3 className="w-4 h-4" /> },
              { id: 'table', label: 'Table', icon: <Calendar className="w-4 h-4" /> },
              { id: 'metrics', label: 'Metrics', icon: <Target className="w-4 h-4" /> },
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode.id
                    ? 'bg-white dark:bg-gray-800 text-brand-primary shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {mode.icon}
                <span>{mode.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Average Velocity</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.averageVelocity}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">points per sprint</p>
            </div>
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Efficiency</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {metrics.averageEfficiency}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">completion rate</p>
            </div>
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Consistency</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {metrics.consistency}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">predictability score</p>
            </div>
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Range</p>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {metrics.velocityRange.min}-{metrics.velocityRange.max}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">min-max velocity</p>
            </div>
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <BarChart3 className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Recommended</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {metrics.recommendedCapacity}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">next sprint capacity</p>
            </div>
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Users className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Trend Indicator */}
      <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
        {getTrendIcon(metrics.velocityTrend)}
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            Velocity Trend:{' '}
            {metrics.velocityTrend.charAt(0).toUpperCase() + metrics.velocityTrend.slice(1)}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Based on the last {Math.min(3, filteredSprints.length)} sprints
          </p>
        </div>
      </div>

      {/* Chart View */}
      {viewMode === 'chart' && (
        <div className="space-y-6">
          {/* Velocity Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sprint Velocity Over Time
            </h4>
            <ResponsiveContainer width="100%" height={height}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="sprintNumber" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="velocity"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                  name="Velocity"
                />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  strokeDasharray="5 5"
                  name="Completed"
                />
                {showPredictions && (
                  <Line
                    type="monotone"
                    dataKey="predicted"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    dot={false}
                    name="Predicted"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Efficiency Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Sprint Efficiency
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="sprintNumber" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="efficiency" fill="#10b981" name="Efficiency (%)" />
                <Bar dataKey="utilization" fill="#8b5cf6" name="Utilization (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Sprint
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Capacity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Committed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Velocity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Efficiency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Team Size
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {chartData.map(sprint => (
                  <tr key={sprint.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {sprint.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {sprint.capacity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {sprint.committed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {sprint.completed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {sprint.velocity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      <div className="flex items-center space-x-2">
                        <span>{sprint.efficiency}%</span>
                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              sprint.efficiency >= 90
                                ? 'bg-green-500'
                                : sprint.efficiency >= 70
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${sprint.efficiency}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {sprint.teamMembers}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Metrics View */}
      {viewMode === 'metrics' && (
        <div className="space-y-6">
          {/* Detailed Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Performance Analysis
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Total Sprints Analyzed
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {filteredSprints.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Velocity Trend</span>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(metrics.velocityTrend)}
                    <span className={`font-medium ${getTrendColor(metrics.velocityTrend)}`}>
                      {metrics.velocityTrend}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Consistency Score
                  </span>
                  <span
                    className={`font-medium ${
                      metrics.consistency >= 80
                        ? 'text-green-600 dark:text-green-400'
                        : metrics.consistency >= 60
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {metrics.consistency}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Predictability</span>
                  <span
                    className={`font-medium ${
                      metrics.predictability >= 80
                        ? 'text-green-600 dark:text-green-400'
                        : metrics.predictability >= 60
                          ? 'text-yellow-600 dark:text-yellow-400'
                          : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {metrics.predictability}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Capacity Planning
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average Velocity</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metrics.averageVelocity} pts
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Velocity Range</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metrics.velocityRange.min} - {metrics.velocityRange.max} pts
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Recommended Capacity
                  </span>
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    {metrics.recommendedCapacity} pts
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Safety Buffer</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {metrics.averageVelocity - metrics.recommendedCapacity} pts
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {showRecommendations && (
        <div className="space-y-4">
          {metrics.velocityTrend === 'declining' && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h5 className="font-medium text-red-800 dark:text-red-400">
                    Declining Velocity Detected
                  </h5>
                  <p className="text-sm text-red-700 dark:text-red-500 mt-1">
                    Consider reviewing sprint planning, story estimation, and team capacity. The
                    team may be overcommitted or facing external blockers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {metrics.consistency < 60 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h5 className="font-medium text-yellow-800 dark:text-yellow-400">
                    Inconsistent Velocity
                  </h5>
                  <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-1">
                    High variability in velocity may indicate estimation issues or external factors.
                    Consider standardizing story estimation and planning processes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {metrics.predictability < 70 && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <h5 className="font-medium text-blue-800 dark:text-blue-400">
                    Low Predictability
                  </h5>
                  <p className="text-sm text-blue-700 dark:text-blue-500 mt-1">
                    Team is frequently missing sprint commitments. Consider reducing capacity or
                    improving sprint planning accuracy.
                  </p>
                </div>
              </div>
            </div>
          )}

          {metrics.velocityTrend === 'improving' && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
              <div className="flex items-start space-x-3">
                <Target className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                <div>
                  <h5 className="font-medium text-green-800 dark:text-green-400">
                    Improving Performance
                  </h5>
                  <p className="text-sm text-green-700 dark:text-green-500 mt-1">
                    Team velocity is trending upward. Consider if this trend is sustainable and
                    whether capacity can be increased.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Mock data generator for development
export const generateMockVelocityData = (sprintCount: number = 10): SprintVelocity[] => {
  const sprints: SprintVelocity[] = [];
  const startDate = new Date();

  for (let i = 0; i < sprintCount; i++) {
    const sprintStart = new Date(startDate.getTime() + i * 14 * 24 * 60 * 60 * 1000);
    const sprintEnd = new Date(sprintStart.getTime() + 14 * 24 * 60 * 60 * 1000);
    const baseVelocity = 35 + Math.random() * 20;
    const capacity = 40 + Math.floor(Math.random() * 10);
    const completed = Math.round(baseVelocity + (Math.random() - 0.5) * 10);

    sprints.push({
      id: `sprint-${i + 1}`,
      name: `Sprint ${i + 1}`,
      startDate: sprintStart.toISOString().split('T')[0],
      endDate: sprintEnd.toISOString().split('T')[0],
      capacity,
      committed: Math.min(capacity, Math.round(baseVelocity + Math.random() * 5)),
      completed,
      velocity: completed,
      efficiency: completed / Math.max(capacity, completed),
      teamMembers: 4 + Math.floor(Math.random() * 3),
      storyCount: 6 + Math.floor(Math.random() * 8),
      status: 'completed',
    });
  }

  return sprints;
};
