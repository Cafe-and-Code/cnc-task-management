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
import { format, addDays } from 'date-fns';

interface BurndownData {
  date: string;
  ideal: number;
  actual: number;
}

interface SprintProgressChartProps {
  className?: string;
}

export const SprintProgressChart: React.FC<SprintProgressChartProps> = ({ className = '' }) => {
  // Mock burndown data - in real implementation, this would come from API
  const burndownData: BurndownData[] = [
    { date: format(addDays(new Date(), -10), 'MMM dd'), ideal: 40, actual: 38 },
    { date: format(addDays(new Date(), -9), 'MMM dd'), ideal: 36, actual: 35 },
    { date: format(addDays(new Date(), -8), 'MMM dd'), ideal: 32, actual: 33 },
    { date: format(addDays(new Date(), -7), 'MMM dd'), ideal: 28, actual: 30 },
    { date: format(addDays(new Date(), -6), 'MMM dd'), ideal: 24, actual: 28 },
    { date: format(addDays(new Date(), -5), 'MMM dd'), ideal: 20, actual: 22 },
    { date: format(addDays(new Date(), -4), 'MMM dd'), ideal: 16, actual: 18 },
    { date: format(addDays(new Date(), -3), 'MMM dd'), ideal: 12, actual: 15 },
    { date: format(addDays(new Date(), -2), 'MMM dd'), ideal: 8, actual: 12 },
    { date: format(addDays(new Date(), -1), 'MMM dd'), ideal: 4, actual: 6 },
    { date: format(new Date(), 'MMM dd'), ideal: 0, actual: 0 },
  ];

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Sprint Progress</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Sprint 3 - 14 days remaining
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
                formatter={(value, name, props) => {
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
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-brand-primary">24</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Total Points</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">6</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">18</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Remaining</p>
          </div>
        </div>

        {/* Sprint Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Sprint Progress</span>
            <span>25%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-brand-primary h-2 rounded-full" style={{ width: '25%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
};
