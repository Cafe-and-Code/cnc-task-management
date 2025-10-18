import React, { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  AreaChart,
  BarChart,
  Bar,
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
  Settings,
  Download,
  Maximize2,
  RefreshCw,
  Eye,
  EyeOff,
  Zap,
  Clock,
  BarChart3,
  LineChart as LineChartIcon,
  AreaChart as AreaChartIcon,
} from 'lucide-react';

interface ChartDataPoint {
  date: string;
  day: number;
  ideal: number;
  actual: number;
  remaining: number;
  completed: number;
  scope?: number;
  projected?: number;
}

interface SprintData {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  currentDay: number;
  totalStoryPoints: number;
  completedStoryPoints: number;
  remainingStoryPoints: number;
  totalTasks: number;
  completedTasks: number;
  remainingTasks: number;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  team: string;
  velocity: number;
}

interface BurndownBurnupChartProps {
  data: SprintData;
  chartType: 'burndown' | 'burnup';
  showOptions?: boolean;
  showProjection?: boolean;
  showScope?: boolean;
  granularity?: 'daily' | 'weekly';
  metric?: 'story_points' | 'tasks' | 'hours';
  height?: number;
  className?: string;
}

const BurndownBurnupChart: React.FC<BurndownBurnupChartProps> = ({
  data,
  chartType,
  showOptions = true,
  showProjection = true,
  showScope = false,
  granularity = 'daily',
  metric = 'story_points',
  height = 400,
  className = '',
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [showIdealLine, setShowIdealLine] = useState(true);
  const [showProjectionLine, setShowProjectionLine] = useState(true);
  const [showGuideLines, setShowGuideLines] = useState(true);
  const [showDataLabels, setShowDataLabels] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Generate mock chart data
  useEffect(() => {
    const generateChartData = (): ChartDataPoint[] => {
      const points: ChartDataPoint[] = [];
      const startDate = new Date(data.startDate);
      const endDate = new Date(data.endDate);
      const totalDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const totalValue =
        metric === 'story_points'
          ? data.totalStoryPoints
          : metric === 'tasks'
            ? data.totalTasks
            : data.totalStoryPoints * 2; // Estimated hours

      const completedValue =
        metric === 'story_points'
          ? data.completedStoryPoints
          : metric === 'tasks'
            ? data.completedTasks
            : data.completedStoryPoints * 2;

      // Generate daily data points
      for (let i = 0; i <= totalDays; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);

        // Ideal burndown/burnup line
        const idealValue =
          chartType === 'burndown'
            ? totalValue - totalValue * (i / totalDays)
            : totalValue * (i / totalDays);

        // Actual progress with some randomness for realism
        let actualValue: number;
        if (chartType === 'burndown') {
          // For burndown, remaining work decreases over time
          const progressFactor = Math.min(i / totalDays, completedValue / totalValue);
          const variance = (Math.random() - 0.5) * totalValue * 0.1; // ±10% variance
          actualValue = Math.max(0, totalValue - totalValue * progressFactor + variance);
        } else {
          // For burnup, completed work increases over time
          const progressFactor = Math.min(i / totalDays, completedValue / totalValue);
          const variance = (Math.random() - 0.5) * totalValue * 0.1;
          actualValue = Math.min(totalValue, totalValue * progressFactor + variance);
        }

        // Projected line (from current day to end)
        let projectedValue: number | undefined;
        if (showProjection && i >= data.currentDay && chartType === 'burndown') {
          const remainingDays = totalDays - data.currentDay;
          const currentRemaining = totalValue - actualValue;
          const dailyRate = currentRemaining / remainingDays;
          projectedValue = Math.max(0, currentRemaining - dailyRate * (i - data.currentDay));
        }

        // Scope changes (for burnup charts)
        let scopeValue: number | undefined;
        if (chartType === 'burnup' && showScope) {
          // Simulate some scope changes
          if (i === Math.floor(totalDays * 0.3)) {
            scopeValue = totalValue * 1.1; // 10% scope increase
          } else if (i === Math.floor(totalDays * 0.7)) {
            scopeValue = totalValue * 0.95; // 5% scope reduction
          } else {
            scopeValue = totalValue;
          }
        }

        points.push({
          date: currentDate.toISOString().split('T')[0],
          day: i + 1,
          ideal: Math.round(idealValue),
          actual: Math.round(actualValue),
          remaining: Math.round(totalValue - actualValue),
          completed: Math.round(actualValue),
          scope: scopeValue ? Math.round(scopeValue) : undefined,
          projected: projectedValue ? Math.round(projectedValue) : undefined,
        });
      }

      return points;
    };

    setIsLoading(true);
    setTimeout(() => {
      setChartData(generateChartData());
      setIsLoading(false);
    }, 500);
  }, [data, chartType, showProjection, showScope, metric]);

  const chartMetrics = useMemo(() => {
    if (chartData.length === 0) return null;

    const latestData = chartData[Math.min(data.currentDay, chartData.length - 1)];
    const totalDays = chartData.length - 1;
    const remainingDays = Math.max(0, totalDays - data.currentDay);

    // Calculate if we're on track
    const onTrack =
      chartType === 'burndown'
        ? latestData.actual <= latestData.ideal
        : latestData.actual >= latestData.ideal;

    // Calculate completion percentage
    const completionPercentage =
      metric === 'story_points'
        ? (data.completedStoryPoints / data.totalStoryPoints) * 100
        : (data.completedTasks / data.totalTasks) * 100;

    // Calculate predicted completion
    let predictedCompletion: string | null = null;
    if (chartType === 'burndown' && remainingDays > 0) {
      const remainingWork = latestData.remaining;
      const dailyRate =
        data.currentDay > 0 ? (chartData[0].actual - latestData.actual) / data.currentDay : 0;
      const predictedDaysToComplete = dailyRate > 0 ? remainingWork / dailyRate : Infinity;

      if (predictedDaysToComplete <= remainingDays) {
        predictedCompletion = 'On Track';
      } else {
        const extraDays = Math.ceil(predictedDaysToComplete - remainingDays);
        predictedCompletion = `${extraDays} days late`;
      }
    }

    return {
      onTrack,
      completionPercentage,
      predictedCompletion,
      remainingWork: latestData.remaining,
      dailyRate:
        data.currentDay > 0 ? (chartData[0].actual - latestData.actual) / data.currentDay : 0,
    };
  }, [chartData, data, chartType, metric]);

  const formatTooltipValue = (value: number, name: string) => {
    const suffix = metric === 'hours' ? 'h' : metric === 'tasks' ? ' tasks' : ' points';
    return [`${value}${suffix}`, name];
  };

  const formatXAxisTick = (value: string) => {
    const date = new Date(value);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getChartColor = (type: string) => {
    switch (type) {
      case 'ideal':
        return '#10b981'; // green
      case 'actual':
        return '#3b82f6'; // blue
      case 'projected':
        return '#f59e0b'; // amber
      case 'scope':
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Day {label} - {formatXAxisTick(label)}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}{' '}
              {metric === 'hours' ? 'h' : metric === 'tasks' ? 'tasks' : 'points'}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {chartType === 'burndown' ? 'Sprint Burndown' : 'Sprint Burnup'} Chart
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {data.name} •{' '}
            {metric === 'story_points' ? 'Story Points' : metric === 'tasks' ? 'Tasks' : 'Hours'}
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

      {/* Metrics Cards */}
      {chartMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div
            className={`p-4 rounded-lg border ${
              chartMetrics.onTrack
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {chartMetrics.onTrack ? (
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              )}
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {chartMetrics.onTrack ? 'On Track' : 'At Risk'}
              </span>
            </div>
            {chartMetrics.predictedCompletion && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {chartMetrics.predictedCompletion}
              </p>
            )}
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Completion</span>
            </div>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-1">
              {Math.round(chartMetrics.completionPercentage)}%
            </p>
          </div>

          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Daily Rate</span>
            </div>
            <p className="text-lg font-semibold text-purple-600 dark:text-purple-400 mt-1">
              {Math.round(chartMetrics.dailyRate)}
              <span className="text-sm font-normal">
                /{metric === 'hours' ? 'h' : metric === 'tasks' ? 'tasks' : 'points'}
              </span>
            </p>
          </div>

          <div className="p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">Remaining</span>
            </div>
            <p className="text-lg font-semibold text-orange-600 dark:text-orange-400 mt-1">
              {chartMetrics.remainingWork}
              <span className="text-sm font-normal">
                {metric === 'hours' ? 'h' : metric === 'tasks' ? 'tasks' : 'points'}
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Chart Options */}
      {showOptions && (
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showIdealLine}
                onChange={e => setShowIdealLine(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Ideal Line</span>
            </label>

            {showProjection && (
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={showProjectionLine}
                  onChange={e => setShowProjectionLine(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Projection</span>
              </label>
            )}

            {chartType === 'burnup' && (
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={showScope}
                  onChange={e => setShowScope(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 dark:text-gray-300">Scope Changes</span>
              </label>
            )}

            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showGuideLines}
                onChange={e => setShowGuideLines(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Guide Lines</span>
            </label>

            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showDataLabels}
                onChange={e => setShowDataLabels(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-700 dark:text-gray-300">Data Labels</span>
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={metric}
              onChange={e => {
                /* Handle metric change */
              }}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="story_points">Story Points</option>
              <option value="tasks">Tasks</option>
              <option value="hours">Hours</option>
            </select>

            <select
              value={granularity}
              onChange={e => {
                /* Handle granularity change */
              }}
              className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>
      )}

      {/* Chart */}
      <div style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'burndown' ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tickFormatter={formatXAxisTick} stroke="#6b7280" fontSize={12} />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                label={{
                  value:
                    metric === 'hours' ? 'Hours' : metric === 'tasks' ? 'Tasks' : 'Story Points',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {showIdealLine && (
                <Line
                  type="monotone"
                  dataKey="ideal"
                  stroke={getChartColor('ideal')}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Ideal"
                />
              )}

              <Line
                type="monotone"
                dataKey="actual"
                stroke={getChartColor('actual')}
                strokeWidth={3}
                dot={{ fill: getChartColor('actual'), strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
                name="Actual"
              />

              {showProjectionLine && chartData.some(d => d.projected !== undefined) && (
                <Line
                  type="monotone"
                  dataKey="projected"
                  stroke={getChartColor('projected')}
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={false}
                  name="Projected"
                />
              )}

              {showGuideLines && (
                <>
                  <ReferenceLine y={0} stroke="#10b981" strokeWidth={2} strokeDasharray="3 3" />
                  <ReferenceLine
                    x={data.currentDay}
                    stroke="#6b7280"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    label="Today"
                  />
                </>
              )}
            </LineChart>
          ) : (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="day" tickFormatter={formatXAxisTick} stroke="#6b7280" fontSize={12} />
              <YAxis
                stroke="#6b7280"
                fontSize={12}
                label={{
                  value:
                    metric === 'hours' ? 'Hours' : metric === 'tasks' ? 'Tasks' : 'Story Points',
                  angle: -90,
                  position: 'insideLeft',
                }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {showIdealLine && (
                <Line
                  type="monotone"
                  dataKey="ideal"
                  stroke={getChartColor('ideal')}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Ideal"
                />
              )}

              <Area
                type="monotone"
                dataKey="completed"
                stroke={getChartColor('actual')}
                fill={getChartColor('actual')}
                fillOpacity={0.3}
                strokeWidth={2}
                name="Completed"
              />

              {showScope && chartData.some(d => d.scope !== undefined) && (
                <Line
                  type="monotone"
                  dataKey="scope"
                  stroke={getChartColor('scope')}
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Scope"
                />
              )}

              {showGuideLines && (
                <>
                  <ReferenceLine
                    y={metric === 'story_points' ? data.totalStoryPoints : data.totalTasks}
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                    label="Total Scope"
                  />
                  <ReferenceLine
                    x={data.currentDay}
                    stroke="#6b7280"
                    strokeWidth={1}
                    strokeDasharray="3 3"
                    label="Today"
                  />
                </>
              )}
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Chart Info */}
      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start space-x-2">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Chart Information</p>
            <p>
              {chartType === 'burndown'
                ? 'This chart shows the remaining work over time. The ideal line represents the perfect burndown rate, while the actual line shows real progress.'
                : 'This chart shows the completed work over time. The ideal line represents the perfect burnup rate, while the actual area shows real progress.'}
            </p>
            {chartMetrics && !chartMetrics.onTrack && (
              <p className="mt-2 text-yellow-800 dark:text-yellow-200">
                ⚠️ The team is currently behind schedule. Consider adjusting scope or increasing
                velocity.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BurndownBurnupChart;
