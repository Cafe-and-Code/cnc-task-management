import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface BurndownData {
  date: string;
  ideal: number;
  actual: number;
}

interface SprintProgressChartProps {
  className?: string;
}

export const SprintProgressChart: React.FC<SprintProgressChartProps> = ({ className = '' }) => {
  // Burndown data - should be populated from API
  const burndownData: BurndownData[] = [];

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sprint Progress</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {burndownData.length > 0 ? 'Active Sprint' : 'No active sprint'}
          </span>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={burndownData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#fff',
                }}
                formatter={(value, name) => {
                  if (name === 'ideal' || name === 'actual') {
                    return [`${value} story points`, name];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="ideal"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                name="Ideal"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ fill: '#f59e0b' }}
                name="Actual"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sprint Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-primary">
              {burndownData.length > 0 ? burndownData[0]?.ideal || '-' : '-'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Points</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {burndownData.length > 0
                ? burndownData[0]?.ideal - (burndownData[burndownData.length - 1]?.actual || 0) || '-'
                : '-'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {burndownData.length > 0 ? burndownData[burndownData.length - 1]?.actual || '-' : '-'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
          </div>
        </div>

        {/* Sprint Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Sprint Progress</span>
            <span>
              {burndownData.length > 0
                ? Math.round(
                    ((burndownData[0]?.ideal - (burndownData[burndownData.length - 1]?.actual || 0)) /
                      (burndownData[0]?.ideal || 1)) *
                      100
                  )
                : 0}
              %
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-brand-primary"
              style={{
                width:
                  burndownData.length > 0
                    ? `${Math.round(
                        ((burndownData[0]?.ideal - (burndownData[burndownData.length - 1]?.actual || 0)) /
                          (burndownData[0]?.ideal || 1)) *
                          100
                      )}%`
                    : '0%',
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
