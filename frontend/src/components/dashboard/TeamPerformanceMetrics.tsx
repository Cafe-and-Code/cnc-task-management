import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  tasksCompleted: number;
  tasksInProgress: number;
  velocity: number;
  efficiency: number;
}

interface PerformanceData {
  name: string;
  value: number;
  color: string;
}

export const TeamPerformanceMetrics: React.FC = () => {
  // Team performance data - should be populated from API
  const teamMembers: TeamMember[] = [];

  const performanceDistribution: PerformanceData[] = [];

  const getPerformanceColor = (efficiency: number) => {
    if (efficiency >= 90) return 'text-green-600 dark:text-green-400';
    if (efficiency >= 80) return 'text-blue-600 dark:text-blue-400';
    if (efficiency >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getPerformanceLabel = (efficiency: number) => {
    if (efficiency >= 90) return 'Excellent';
    if (efficiency >= 80) return 'Good';
    if (efficiency >= 70) return 'Average';
    return 'Below Average';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Team Performance</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">Last 30 days</span>
        </div>

        {/* Team Overview Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{teamMembers.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Team Members</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {teamMembers.length > 0
                ? Math.round(
                    teamMembers.reduce((sum, m) => sum + m.velocity, 0) / teamMembers.length
                  )
                : '-'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Velocity</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {teamMembers.length > 0
                ? Math.round(
                    teamMembers.reduce((sum, m) => sum + m.efficiency, 0) / teamMembers.length
                  )
                : '-'}
              %
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Avg Efficiency</p>
          </div>
        </div>

        {/* Performance Distribution Chart */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Performance Distribution
          </h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={performanceDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {performanceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap justify-center gap-3 mt-3">
            {performanceDistribution.map(item => (
              <div key={item.name} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {item.name}: {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Team Members Performance */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Individual Performance
          </h4>
          <div className="space-y-3">
            {teamMembers.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-brand-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {member.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {member.name}
                    </p>
                    <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                      <span>{member.tasksCompleted} completed</span>
                      <span>•</span>
                      <span>{member.tasksInProgress} in progress</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-medium ${getPerformanceColor(member.efficiency)}`}>
                    {member.efficiency}%
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {getPerformanceLabel(member.efficiency)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Velocity Chart */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Sprint Velocity Trend
          </h4>
          <div className="h-32">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamMembers}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <YAxis tick={{ fontSize: 10 }} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff',
                  }}
                  formatter={(value, name) => {
                    if (name === 'velocity') {
                      return [`${value} points`, 'Velocity'];
                    }
                    return [value, name];
                  }}
                />
                <Bar dataKey="velocity" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
