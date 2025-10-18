import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
  Area,
  AreaChart,
} from 'recharts';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  BarChart3,
  LineChart as LineChartIcon,
  Settings,
  Download,
  RefreshCw,
  Info,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Users,
  Eye,
  EyeOff,
  Maximize2,
  Filter,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface SprintVelocity {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  team: string;
  committed: number;
  completed: number;
  scopeChanges: number;
  actualVelocity: number;
  plannedVelocity: number;
  efficiency: number;
  memberCount: number;
  totalHours: number;
  averageTaskSize: number;
  bugCount: number;
  story: string;
}

interface VelocityMetrics {
  averageVelocity: number;
  medianVelocity: number;
  velocityRange: {
    min: number;
    max: number;
  };
  trend: 'improving' | 'declining' | 'stable';
  trendPercentage: number;
  consistency: number;
  predictability: number;
  capacityUtilization: number;
  qualityScore: number;
}

interface VelocityTrackingChartProps {
  data: SprintVelocity[];
  chartType?: 'bar' | 'line' | 'combined' | 'trend';
  showOptions?: boolean;
  showPredictability?: boolean;
  showEfficiency?: boolean;
  showQuality?: boolean;
  teamFilter?: string;
  timeRange?: number;
  height?: number;
  className?: string;
}

const VelocityTrackingChart: React.FC<VelocityTrackingChartProps> = ({
  data,
  chartType = 'bar',
  showOptions = true,
  showPredictability = true,
  showEfficiency = true,
  showQuality = true,
  teamFilter = 'all',
  timeRange = 10,
  height = 400,
  className = '',
}) => {
  const [filteredData, setFilteredData] = useState<SprintVelocity[]>([]);
  const [velocityMetrics, setVelocityMetrics] = useState<VelocityMetrics | null>(null);
  const [showCommitted, setShowCommitted] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const [showAverage, setShowAverage] = useState(true);
  const [showPredictabilityBand, setShowPredictabilityBand] = useState(false);
  const [showTrendLine, setShowTrendLine] = useState(true);
  const [metric, setMetric] = useState<'velocity' | 'efficiency' | 'throughput'>('velocity');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedInfo, setExpandedInfo] = useState(false);

  // Mock data generation
  useEffect(() => {
    const generateMockData = (): SprintVelocity[] => {
      const sprints: SprintVelocity[] = [];
      const teams = ['Frontend', 'Backend', 'QA', 'DevOps'];

      for (let i = 0; i < timeRange; i++) {
        const team = teams[i % teams.length];
        const plannedVelocity = 40 + Math.floor(Math.random() * 20);
        const actualVelocity = plannedVelocity + Math.floor((Math.random() - 0.5) * 15);
        const scopeChanges = Math.floor((Math.random() - 0.7) * 10);

        sprints.push({
          id: `sprint-${i + 1}`,
          name: `Sprint ${i + 1}`,
          startDate: new Date(Date.now() - (timeRange - i) * 14 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          endDate: new Date(Date.now() - (timeRange - i - 1) * 14 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
          team,
          committed: plannedVelocity,
          completed: actualVelocity,
          scopeChanges,
          actualVelocity,
          plannedVelocity,
          efficiency: Math.min(
            100,
            Math.max(0, (actualVelocity / plannedVelocity) * 100 + Math.random() * 10 - 5)
          ),
          memberCount: 4 + Math.floor(Math.random() * 4),
          totalHours: 240 + Math.floor(Math.random() * 80),
          averageTaskSize: 3 + Math.random() * 4,
          bugCount: Math.floor(Math.random() * 8),
          story: `Sprint ${i + 1} completed with ${actualVelocity >= plannedVelocity ? 'success' : 'challenges'}`,
        });
      }

      return sprints;
    };

    setIsLoading(true);
    setTimeout(() => {
      const mockData = generateMockData();
      const filtered =
        teamFilter === 'all' ? mockData : mockData.filter(sprint => sprint.team === teamFilter);

      setFilteredData(filtered);
      calculateVelocityMetrics(filtered);
      setIsLoading(false);
    }, 500);
  }, [timeRange, teamFilter]);

  const calculateVelocityMetrics = (sprints: SprintVelocity[]) => {
    if (sprints.length === 0) return;

    const velocities = sprints.map(s => s.actualVelocity);
    const efficiencies = sprints.map(s => s.efficiency);

    const averageVelocity = velocities.reduce((sum, v) => sum + v, 0) / velocities.length;
    const medianVelocity = velocities.sort((a, b) => a - b)[Math.floor(velocities.length / 2)];

    const velocityRange = {
      min: Math.min(...velocities),
      max: Math.max(...velocities),
    };

    // Calculate trend
    const recentVelocities = velocities.slice(-3);
    const olderVelocities = velocities.slice(0, -3);
    const recentAvg = recentVelocities.reduce((sum, v) => sum + v, 0) / recentVelocities.length;
    const olderAvg =
      olderVelocities.length > 0
        ? olderVelocities.reduce((sum, v) => sum + v, 0) / olderVelocities.length
        : recentAvg;

    const trendPercentage = ((recentAvg - olderAvg) / olderAvg) * 100;
    const trend = trendPercentage > 5 ? 'improving' : trendPercentage < -5 ? 'declining' : 'stable';

    // Calculate consistency (standard deviation)
    const variance =
      velocities.reduce((sum, v) => sum + Math.pow(v - averageVelocity, 2), 0) / velocities.length;
    const standardDeviation = Math.sqrt(variance);
    const consistency = Math.max(0, 100 - (standardDeviation / averageVelocity) * 100);

    // Calculate predictability (how often velocity is close to average)
    const predictableCount = velocities.filter(
      v => Math.abs(v - averageVelocity) <= averageVelocity * 0.2
    ).length;
    const predictability = (predictableCount / velocities.length) * 100;

    // Calculate capacity utilization
    const avgEfficiency = efficiencies.reduce((sum, e) => sum + e, 0) / efficiencies.length;

    // Calculate quality score (inverse of bug count per velocity)
    const avgBugsPerPoint =
      sprints.reduce((sum, s) => sum + s.bugCount / s.actualVelocity, 0) / sprints.length;
    const qualityScore = Math.max(0, 100 - avgBugsPerPoint * 20);

    setVelocityMetrics({
      averageVelocity: Math.round(averageVelocity),
      medianVelocity: Math.round(medianVelocity),
      velocityRange,
      trend,
      trendPercentage: Math.round(trendPercentage),
      consistency: Math.round(consistency),
      predictability: Math.round(predictability),
      capacityUtilization: Math.round(avgEfficiency),
      qualityScore: Math.round(qualityScore),
    });
  };

  const getChartData = () => {
    return filteredData.map(sprint => {
      const baseData = {
        name: sprint.name,
        sprint: sprint.id,
        team: sprint.team,
        committed: sprint.committed,
        completed: sprint.completed,
        actualVelocity: sprint.actualVelocity,
        efficiency: sprint.efficiency,
        bugCount: sprint.bugCount,
      };

      if (showAverage && velocityMetrics) {
        return {
          ...baseData,
          average: velocityMetrics.averageVelocity,
          target: sprint.plannedVelocity,
        };
      }

      return baseData;
    });
  };

  const getPredictabilityData = () => {
    if (!velocityMetrics) return [];

    return filteredData.map(sprint => ({
      name: sprint.name,
      actual: sprint.actualVelocity,
      upperBound: velocityMetrics.averageVelocity * 1.2,
      lowerBound: velocityMetrics.averageVelocity * 0.8,
      average: velocityMetrics.averageVelocity,
    }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getTrendIcon = () => {
    if (!velocityMetrics) return null;

    switch (velocityMetrics.trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getChartComponent = () => {
    const chartData = getChartData();

    switch (chartType) {
      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {showCommitted && <Bar dataKey="committed" fill="#94a3b8" name="Committed" />}
            {showCompleted && <Bar dataKey="completed" fill="#3b82f6" name="Completed" />}
            {showAverage && velocityMetrics && (
              <ReferenceLine
                y={velocityMetrics.averageVelocity}
                stroke="#10b981"
                strokeDasharray="3 3"
              />
            )}
          </BarChart>
        );

      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {showCommitted && (
              <Line
                type="monotone"
                dataKey="committed"
                stroke="#94a3b8"
                strokeWidth={2}
                name="Committed"
              />
            )}
            {showCompleted && (
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Completed"
              />
            )}
            {showAverage && velocityMetrics && (
              <ReferenceLine
                y={velocityMetrics.averageVelocity}
                stroke="#10b981"
                strokeDasharray="3 3"
              />
            )}
          </LineChart>
        );

      case 'combined':
        return (
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {showCommitted && <Bar dataKey="committed" fill="#94a3b8" name="Committed" />}
            {showCompleted && (
              <Line
                type="monotone"
                dataKey="completed"
                stroke="#3b82f6"
                strokeWidth={3}
                name="Completed"
              />
            )}
            {showAverage && velocityMetrics && (
              <ReferenceLine
                y={velocityMetrics.averageVelocity}
                stroke="#10b981"
                strokeDasharray="3 3"
              />
            )}
          </ComposedChart>
        );

      case 'trend':
        return (
          <AreaChart data={getPredictabilityData()}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
            <YAxis stroke="#6b7280" fontSize={12} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {showPredictabilityBand && (
              <Area
                type="monotone"
                dataKey="upperBound"
                fill="#10b981"
                fillOpacity={0.1}
                stroke="none"
              />
            )}

            <Area
              type="monotone"
              dataKey="lowerBound"
              fill="#ef4444"
              fillOpacity={0.1}
              stroke="none"
            />

            <Line
              type="monotone"
              dataKey="actual"
              stroke="#3b82f6"
              strokeWidth={3}
              name="Actual Velocity"
            />

            {showTrendLine && velocityMetrics && (
              <Line
                type="monotone"
                dataKey="average"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Average"
              />
            )}
          </AreaChart>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className={`${className} flex items-center justify-center`} style={{ height }}>
        <div className="animate-pulse w-full">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            <span>Velocity Tracking</span>
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Team performance and sprint velocity analysis
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Download className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <Maximize2 className="w-4 h-4" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metrics Overview */}
      {velocityMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Average Velocity
                </p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
                  {velocityMetrics.averageVelocity}
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  {getTrendIcon()}
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {velocityMetrics.trendPercentage}%
                  </span>
                </div>
              </div>
              <Zap className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Consistency</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {velocityMetrics.consistency}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {velocityMetrics.consistency >= 80
                    ? 'Very Stable'
                    : velocityMetrics.consistency >= 60
                      ? 'Stable'
                      : 'Variable'}
                </p>
              </div>
              <Activity className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Predictability</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {velocityMetrics.predictability}%
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">±20% of average</p>
              </div>
              <Target className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Velocity Range</p>
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {velocityMetrics.velocityRange.min} - {velocityMetrics.velocityRange.max}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  Range of {velocityMetrics.velocityRange.max - velocityMetrics.velocityRange.min}{' '}
                  points
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
      )}

      {/* Chart Options */}
      {showOptions && (
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Chart Type:</span>
              <select
                value={chartType}
                onChange={e => {
                  /* Handle chart type change */
                }}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="combined">Combined</option>
                <option value="trend">Trend Analysis</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700 dark:text-gray-300">Team:</span>
              <select
                value={teamFilter}
                onChange={e => {
                  /* Handle team filter change */
                }}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Teams</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="QA">QA</option>
                <option value="DevOps">DevOps</option>
              </select>
            </div>

            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={showCommitted}
                  onChange={e => setShowCommitted(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Committed</span>
              </label>

              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={showCompleted}
                  onChange={e => setShowCompleted(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Completed</span>
              </label>

              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={showAverage}
                  onChange={e => setShowAverage(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Average</span>
              </label>

              {chartType === 'trend' && (
                <label className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={showPredictabilityBand}
                    onChange={e => setShowPredictabilityBand(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700 dark:text-gray-300">Predictability Band</span>
                </label>
              )}
            </div>
          </div>

          <button
            onClick={() => setExpandedInfo(!expandedInfo)}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {expandedInfo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {getChartComponent()}
        </ResponsiveContainer>
      </div>

      {/* Additional Info */}
      {expandedInfo && velocityMetrics && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
            Detailed Analysis
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                <strong>Velocity Trend:</strong> {velocityMetrics.trend} (
                {velocityMetrics.trendPercentage}%)
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                <strong>Median Velocity:</strong> {velocityMetrics.medianVelocity} points
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                <strong>Capacity Utilization:</strong> {velocityMetrics.capacityUtilization}%
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Quality Score:</strong> {velocityMetrics.qualityScore}/100
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                <strong>Predictability:</strong> {velocityMetrics.predictability}% of sprints within
                20% of average
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-1">
                <strong>Consistency:</strong> {velocityMetrics.consistency}% (lower variation =
                higher consistency)
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                <strong>Analysis:</strong> {getAnalysisText(velocityMetrics)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {velocityMetrics && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              <p className="font-medium mb-1">Recommendations</p>
              <ul className="space-y-1">
                {getRecommendations(velocityMetrics).map((rec, index) => (
                  <li key={index} className="flex items-start space-x-1">
                    <span className="text-blue-600 dark:text-blue-400">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getAnalysisText = (metrics: VelocityMetrics): string => {
  if (metrics.trend === 'improving' && metrics.consistency >= 70) {
    return 'Excellent performance with consistent improvement';
  } else if (metrics.trend === 'improving') {
    return 'Good improvement trend, focus on consistency';
  } else if (metrics.trend === 'declining') {
    return 'Performance declining, investigate root causes';
  } else if (metrics.consistency >= 80) {
    return 'Stable performance, maintain current practices';
  } else {
    return 'Variable performance, improve predictability';
  }
};

const getRecommendations = (metrics: VelocityMetrics): string[] => {
  const recommendations = [];

  if (metrics.trend === 'declining') {
    recommendations.push('Analyze recent sprints to identify performance issues');
    recommendations.push('Consider adjusting sprint commitments or team capacity');
  }

  if (metrics.consistency < 60) {
    recommendations.push('Focus on improving story estimation accuracy');
    recommendations.push('Reduce scope changes during sprints');
  }

  if (metrics.predictability < 70) {
    recommendations.push('Work on more consistent velocity across sprints');
    recommendations.push('Address factors causing velocity fluctuations');
  }

  if (metrics.capacityUtilization < 80) {
    recommendations.push('Optimize team capacity utilization');
    recommendations.push('Review work allocation and team workload');
  }

  if (metrics.qualityScore < 70) {
    recommendations.push('Invest in quality improvement initiatives');
    recommendations.push('Balance velocity with code quality and testing');
  }

  if (recommendations.length === 0) {
    recommendations.push('Maintain current performance and continue monitoring');
    recommendations.push('Share best practices with other teams');
  }

  return recommendations;
};

export default VelocityTrackingChart;
