import React from 'react';
import { useAppSelector } from '../../hooks/redux';
import { useRolePermission } from '../../components/auth/RoleBasedRoute';
import { Link } from 'react-router-dom';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  link?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  trend,
  link,
}) => {
  const content = (
    <div
      className={`bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 ${link ? 'cursor-pointer' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text-', 'bg-opacity-10 bg-')}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          <svg
            className={`h-4 w-4 ${trend.isPositive ? 'text-green-500' : 'text-red-500'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {trend.isPositive ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 7h8m0 0l-8-8-8 8M8 7H1"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 17h8m0 0l-8 8-8-8M8 17H1"
              />
            )}
          </svg>
          <span
            className={`ml-2 text-sm font-medium ${trend.isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
          >
            {trend.value}%
          </span>
          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">from last month</span>
        </div>
      )}
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }
  return content;
};

export const MetricsOverview: React.FC = () => {
  const { projects } = useAppSelector(state => state.projects);
  const { isManagement } = useRolePermission();

  // Mock data - in real implementation, this would come from API
  const metrics = {
    totalProjects: projects.length,
    activeProjects: projects.filter(p => p.status === 'Active').length,
    totalTasks: 0, // Would be calculated from projects
    completedTasks: 0, // Would be calculated from projects
    teamMembers: 0, // Would be calculated from projects
    averageVelocity: 0, // Would be calculated from sprints
  };

  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(change)),
      isPositive: change >= 0,
    };
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Projects Card */}
      <MetricCard
        title="Total Projects"
        value={metrics.totalProjects}
        subtitle={`${metrics.activeProjects} active`}
        color="text-blue-600 dark:text-blue-400"
        icon={
          <svg
            className="h-6 w-6 text-blue-600 dark:text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        }
        link="/projects"
        trend={calculateTrend(metrics.totalProjects, metrics.totalProjects - 2)}
      />

      {/* Tasks Card */}
      <MetricCard
        title="Tasks In Progress"
        value={metrics.totalTasks - metrics.completedTasks}
        subtitle={`${metrics.completedTasks} completed`}
        color="text-orange-600 dark:text-orange-400"
        icon={
          <svg
            className="h-6 w-6 text-orange-600 dark:text-orange-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        }
        trend={calculateTrend(metrics.totalTasks, metrics.totalTasks - 5)}
      />

      {/* Team Members Card */}
      <MetricCard
        title="Team Members"
        value={metrics.teamMembers}
        subtitle="Across all projects"
        color="text-green-600 dark:text-green-400"
        icon={
          <svg
            className="h-6 w-6 text-green-600 dark:text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v-1m0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
            />
          </svg>
        }
        link="/teams"
        trend={calculateTrend(metrics.teamMembers, metrics.teamMembers - 1)}
      />

      {/* Average Velocity Card - Only show to management */}
      {isManagement && (
        <MetricCard
          title="Average Velocity"
          value={metrics.averageVelocity}
          subtitle="Story points per sprint"
          color="text-purple-600 dark:text-purple-400"
          icon={
            <svg
              className="h-6 w-6 text-purple-600 dark:text-purple-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          }
          trend={calculateTrend(metrics.averageVelocity, metrics.averageVelocity - 8)}
        />
      )}
    </div>
  );
};
