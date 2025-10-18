import React, { useMemo } from 'react';
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
} from 'recharts';
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react';

// Types
interface BurndownPoint {
  day: number;
  date: string;
  remaining: number;
  ideal: number;
  completed?: number;
}

interface SprintInfo {
  capacity: number;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
}

interface BurndownChartProps {
  data: BurndownPoint[];
  sprint: SprintInfo;
  height?: number;
  showGuidelines?: boolean;
  interactive?: boolean;
  compact?: boolean;
}

export const BurndownChart: React.FC<BurndownChartProps> = ({
  data,
  sprint,
  height = 300,
  showGuidelines = true,
  interactive = true,
  compact = false,
}) => {
  const chartData = useMemo(() => {
    return data.map(point => ({
      ...point,
      date: new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    }));
  }, [data]);

  const analytics = useMemo(() => {
    if (data.length === 0) return null;

    const latestPoint = data[data.length - 1];
    const totalDays = Math.ceil(
      (new Date(sprint.endDate).getTime() - new Date(sprint.startDate).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const daysElapsed = data.length;
    const daysRemaining = Math.max(0, totalDays - daysElapsed);

    const remainingPoints = latestPoint.remaining;
    const idealRemaining = latestPoint.ideal;
    const variance = remainingPoints - idealRemaining;

    const totalCompleted = sprint.capacity - remainingPoints;
    const averageDailyBurn = daysElapsed > 0 ? totalCompleted / daysElapsed : 0;
    const requiredDailyBurn = daysRemaining > 0 ? remainingPoints / daysRemaining : 0;

    // Predict if sprint will complete on time
    let prediction: 'on-track' | 'ahead' | 'behind' | 'at-risk';
    if (sprint.status === 'completed') {
      prediction = 'on-track';
    } else if (variance < -5) {
      prediction = 'ahead';
    } else if (variance > 5 && requiredDailyBurn > averageDailyBurn * 1.2) {
      prediction = 'at-risk';
    } else if (variance > 0) {
      prediction = 'behind';
    } else {
      prediction = 'on-track';
    }

    return {
      remainingPoints,
      totalCompleted,
      averageDailyBurn,
      requiredDailyBurn,
      variance,
      daysElapsed,
      daysRemaining,
      totalDays,
      prediction,
      completionRate: ((totalCompleted / sprint.capacity) * 100).toFixed(1),
    };
  }, [data, sprint]);

  const getPredictionColor = (prediction: string) => {
    switch (prediction) {
      case 'ahead':
        return 'text-green-600 dark:text-green-400';
      case 'on-track':
        return 'text-blue-600 dark:text-blue-400';
      case 'behind':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'at-risk':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPredictionIcon = (prediction: string) => {
    switch (prediction) {
      case 'ahead':
        return <TrendingUp className="w-4 h-4" />;
      case 'on-track':
        return <Minus className="w-4 h-4" />;
      case 'behind':
        return <TrendingDown className="w-4 h-4" />;
      case 'at-risk':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            Day {data.day} - {data.date}
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between space-x-4">
              <span className="text-blue-600 dark:text-blue-400">Remaining:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {data.remaining} pts
              </span>
            </div>
            <div className="flex items-center justify-between space-x-4">
              <span className="text-gray-500 dark:text-gray-400">Ideal:</span>
              <span className="font-medium text-gray-900 dark:text-white">{data.ideal} pts</span>
            </div>
            {data.completed !== undefined && (
              <div className="flex items-center justify-between space-x-4">
                <span className="text-green-600 dark:text-green-400">Completed:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {data.completed} pts
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
        <div className="text-center">
          <TrendingUp className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500 dark:text-gray-400">No burndown data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Analytics Summary */}
      {!compact && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Remaining</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {analytics.remainingPoints}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">points</p>
              </div>
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Daily Burn</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {analytics.averageDailyBurn.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">points/day</p>
              </div>
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Required Burn</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {analytics.requiredDailyBurn.toFixed(1)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">points/day</p>
              </div>
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                <TrendingUp className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">Progress</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {analytics.completionRate}%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">completed</p>
              </div>
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <Minus className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prediction Status */}
      <div
        className={`flex items-center justify-between p-4 rounded-lg border ${
          analytics.prediction === 'ahead'
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700'
            : analytics.prediction === 'on-track'
              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
              : analytics.prediction === 'behind'
                ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700'
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
        }`}
      >
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-lg ${
              analytics.prediction === 'ahead'
                ? 'bg-green-100 dark:bg-green-900/40'
                : analytics.prediction === 'on-track'
                  ? 'bg-blue-100 dark:bg-blue-900/40'
                  : analytics.prediction === 'behind'
                    ? 'bg-yellow-100 dark:bg-yellow-900/40'
                    : 'bg-red-100 dark:bg-red-900/40'
            }`}
          >
            {getPredictionIcon(analytics.prediction)}
          </div>
          <div>
            <div
              className={`font-medium ${
                analytics.prediction === 'ahead'
                  ? 'text-green-800 dark:text-green-200'
                  : analytics.prediction === 'on-track'
                    ? 'text-blue-800 dark:text-blue-200'
                    : analytics.prediction === 'behind'
                      ? 'text-yellow-800 dark:text-yellow-200'
                      : 'text-red-800 dark:text-red-200'
              }`}
            >
              Sprint is {analytics.prediction.replace('-', ' ')}
            </div>
            <div
              className={`text-sm ${
                analytics.prediction === 'ahead'
                  ? 'text-green-600 dark:text-green-400'
                  : analytics.prediction === 'on-track'
                    ? 'text-blue-600 dark:text-blue-400'
                    : analytics.prediction === 'behind'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-red-600 dark:text-red-400'
              }`}
            >
              {analytics.prediction === 'ahead' &&
                `${Math.abs(analytics.variance)} points ahead of schedule`}
              {analytics.prediction === 'on-track' && 'Progressing according to plan'}
              {analytics.prediction === 'behind' &&
                `${Math.abs(analytics.variance)} points behind schedule`}
              {analytics.prediction === 'at-risk' &&
                `May not complete on time. Need to increase velocity by ${((analytics.requiredDailyBurn / analytics.averageDailyBurn - 1) * 100).toFixed(0)}%`}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            Day {analytics.daysElapsed} of {analytics.totalDays}
          </span>
          {analytics.daysRemaining > 0 && (
            <span className="text-gray-600 dark:text-gray-400">
              {analytics.daysRemaining} days remaining
            </span>
          )}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="day"
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Sprint Day', position: 'insideBottom', offset: -5 }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              label={{ value: 'Story Points', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* Ideal line */}
            <Line
              type="monotone"
              dataKey="ideal"
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Ideal Burndown"
            />

            {/* Actual line */}
            <Line
              type="monotone"
              dataKey="remaining"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
              name="Actual Burndown"
            />

            {/* Guidelines */}
            {showGuidelines && (
              <>
                <ReferenceLine
                  y={0}
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  label="Goal"
                />
                <ReferenceLine
                  x={analytics.totalDays}
                  stroke="#ef4444"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  label="End"
                />
              </>
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Info */}
      {interactive && (
        <div className="flex items-start space-x-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">Understanding the Burndown Chart</p>
            <ul className="space-y-1 text-xs">
              <li>
                • <strong>Ideal Line:</strong> Perfect linear progress from start to finish
              </li>
              <li>
                • <strong>Actual Line:</strong> Real progress of your sprint
              </li>
              <li>
                • <strong>Above Ideal:</strong> Behind schedule (more work remaining than ideal)
              </li>
              <li>
                • <strong>Below Ideal:</strong> Ahead of schedule (less work remaining than ideal)
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

// Mock data generator for development
export const generateMockBurndownData = (
  capacity: number,
  days: number,
  variance: number = 0
): any[] => {
  const data = [];
  const startDate = new Date();

  for (let day = 0; day <= days; day++) {
    const date = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000);
    const idealRemaining = Math.max(0, capacity - (capacity * day) / days);

    // Add variance to actual progress
    const varianceAmount = (Math.random() - 0.5) * variance;
    const actualRemaining = Math.max(0, idealRemaining + varianceAmount);

    data.push({
      day,
      date: date.toISOString().split('T')[0],
      remaining: Math.round(actualRemaining),
      ideal: Math.round(idealRemaining),
      completed: day === 0 ? 0 : Math.round(capacity - actualRemaining),
    });
  }

  return data;
};
