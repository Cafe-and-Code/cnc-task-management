import React, { useState } from 'react';
import {
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Filter,
  RefreshCw,
} from 'lucide-react';
import { WIPLimitsIndicator } from './WIPLimitsIndicator';

interface ColumnData {
  id: string;
  title: string;
  currentCount: number;
  limit: number;
  averageTime: number;
  throughput: number;
}

interface WIPManagementPanelProps {
  columns: ColumnData[];
  onLimitChange: (columnId: string, newLimit: number) => void;
  onRefresh: () => void;
  className?: string;
}

export const WIPManagementPanel: React.FC<WIPManagementPanelProps> = ({
  columns,
  onLimitChange,
  onRefresh,
  className = '',
}) => {
  const [viewMode, setViewMode] = useState<'overview' | 'detailed' | 'analytics'>('overview');
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'sprint'>('sprint');

  const totalTasks = columns.reduce((sum, col) => sum + col.currentCount, 0);
  const totalLimit = columns.reduce((sum, col) => sum + col.limit, 0);
  const overallPercentage = totalLimit > 0 ? (totalTasks / totalLimit) * 100 : 0;

  const overLimitColumns = columns.filter(col => col.currentCount > col.limit);
  const nearLimitColumns = columns.filter(col => {
    const percentage = (col.currentCount / col.limit) * 100;
    return percentage >= 80 && percentage < 100;
  });

  const getOverallStatus = () => {
    if (overLimitColumns.length > 0) return 'critical';
    if (nearLimitColumns.length > 0) return 'warning';
    return 'healthy';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700';
      case 'warning':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700';
      case 'healthy':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-700';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="w-4 h-4" />;
      case 'warning':
        return <Clock className="w-4 h-4" />;
      case 'healthy':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const formatTime = (hours: number) => {
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    return `${days}d ${remainingHours}h`;
  };

  const calculateFlowEfficiency = () => {
    const avgCycleTime = columns.reduce((sum, col) => sum + col.averageTime, 0) / columns.length;
    const avgWaitTime = avgCycleTime * 0.3; // Assume 30% wait time
    return (((avgCycleTime - avgWaitTime) / avgCycleTime) * 100).toFixed(1);
  };

  const overallStatus = getOverallStatus();

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${getStatusColor(overallStatus)}`}>
            {getStatusIcon(overallStatus)}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">WIP Management</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {totalTasks}/{totalLimit} total tasks ({overallPercentage.toFixed(1)}% utilized)
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={e => setTimeRange(e.target.value as any)}
            className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="day">Last 24h</option>
            <option value="week">Last Week</option>
            <option value="sprint">Current Sprint</option>
          </select>

          <button
            onClick={onRefresh}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* View Mode Tabs */}
      <div className="flex items-center space-x-1 p-2 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setViewMode('overview')}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            viewMode === 'overview'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setViewMode('detailed')}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            viewMode === 'detailed'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Detailed
        </button>
        <button
          onClick={() => setViewMode('analytics')}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
            viewMode === 'analytics'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          Analytics
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {viewMode === 'overview' && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Total Tasks</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">{totalTasks}</p>
                  </div>
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Avg. Cycle Time</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatTime(
                        Math.round(
                          columns.reduce((sum, col) => sum + col.averageTime, 0) / columns.length
                        )
                      )}
                    </p>
                  </div>
                  <Clock className="w-4 h-4 text-gray-500" />
                </div>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Flow Efficiency</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {calculateFlowEfficiency()}%
                    </p>
                  </div>
                  <TrendingUp className="w-4 h-4 text-gray-500" />
                </div>
              </div>
            </div>

            {/* Quick Status */}
            <div className="space-y-3">
              {columns.map(column => (
                <WIPLimitsIndicator
                  key={column.id}
                  columnId={column.id}
                  columnTitle={column.title}
                  currentCount={column.currentCount}
                  limit={column.limit}
                  onLimitChange={newLimit => onLimitChange(column.id, newLimit)}
                  showControls={true}
                  compact={false}
                />
              ))}
            </div>
          </div>
        )}

        {viewMode === 'detailed' && (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 px-3 font-medium text-gray-900 dark:text-white">
                      Column
                    </th>
                    <th className="text-center py-2 px-3 font-medium text-gray-900 dark:text-white">
                      Current
                    </th>
                    <th className="text-center py-2 px-3 font-medium text-gray-900 dark:text-white">
                      Limit
                    </th>
                    <th className="text-center py-2 px-3 font-medium text-gray-900 dark:text-white">
                      Utilization
                    </th>
                    <th className="text-center py-2 px-3 font-medium text-gray-900 dark:text-white">
                      Avg Time
                    </th>
                    <th className="text-center py-2 px-3 font-medium text-gray-900 dark:text-white">
                      Throughput
                    </th>
                    <th className="text-center py-2 px-3 font-medium text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th className="text-center py-2 px-3 font-medium text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {columns.map(column => {
                    const percentage = (column.currentCount / column.limit) * 100;
                    const isOverLimit = column.currentCount > column.limit;
                    const isNearLimit = percentage >= 80 && percentage < 100;

                    return (
                      <tr key={column.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-2 px-3 font-medium text-gray-900 dark:text-white">
                          {column.title}
                        </td>
                        <td className="text-center py-2 px-3 text-gray-900 dark:text-white">
                          {column.currentCount}
                        </td>
                        <td className="text-center py-2 px-3 text-gray-900 dark:text-white">
                          {column.limit}
                        </td>
                        <td className="text-center py-2 px-3">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              isOverLimit
                                ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                                : isNearLimit
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400'
                                  : 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            }`}
                          >
                            {percentage.toFixed(0)}%
                          </span>
                        </td>
                        <td className="text-center py-2 px-3 text-gray-900 dark:text-white">
                          {formatTime(column.averageTime)}
                        </td>
                        <td className="text-center py-2 px-3 text-gray-900 dark:text-white">
                          {column.throughput}/day
                        </td>
                        <td className="text-center py-2 px-3">
                          {isOverLimit ? (
                            <span className="text-red-600 dark:text-red-400">Over Limit</span>
                          ) : isNearLimit ? (
                            <span className="text-yellow-600 dark:text-yellow-400">Near Limit</span>
                          ) : (
                            <span className="text-green-600 dark:text-green-400">Healthy</span>
                          )}
                        </td>
                        <td className="text-center py-2 px-3">
                          <button
                            onClick={() => onLimitChange(column.id, column.limit + 1)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => onLimitChange(column.id, Math.max(1, column.limit - 1))}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 ml-2"
                          >
                            -1
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="space-y-4">
            {/* Flow Metrics */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Flow Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Average Cycle Time
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {formatTime(
                      Math.round(
                        columns.reduce((sum, col) => sum + col.averageTime, 0) / columns.length
                      )
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Average Throughput
                  </p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {Math.round(
                      columns.reduce((sum, col) => sum + col.throughput, 0) / columns.length
                    )}{' '}
                    tasks/day
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Flow Efficiency</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {calculateFlowEfficiency()}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">WIP Utilization</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {overallPercentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-3">
                Optimization Recommendations
              </h4>
              <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
                {overLimitColumns.length > 0 && (
                  <li>
                    • Consider increasing limits for {overLimitColumns.map(c => c.title).join(', ')}{' '}
                    columns
                  </li>
                )}
                {nearLimitColumns.length > 0 && (
                  <li>• Monitor {nearLimitColumns.map(c => c.title).join(', ')} columns closely</li>
                )}
                <li>• Focus on completing existing tasks before starting new ones</li>
                <li>• Identify and remove blockers causing task accumulation</li>
                <li>• Consider re-balancing team resources across columns</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
