import React from 'react';
import { Users, ChevronDown, ChevronRight, MoreHorizontal, UserPlus, Settings } from 'lucide-react';

interface SwimlaneMember {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
  isActive: boolean;
}

interface SwimlaneHeaderProps {
  teamId: string;
  teamName: string;
  members: SwimlaneMember[];
  taskCount: number;
  capacity: number;
  color: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onAddMember: () => void;
  onSettings: () => void;
  showAvatars?: boolean;
  compact?: boolean;
}

export const SwimlaneHeader: React.FC<SwimlaneHeaderProps> = ({
  teamId,
  teamName,
  members,
  taskCount,
  capacity,
  color,
  isExpanded,
  onToggleExpand,
  onAddMember,
  onSettings,
  showAvatars = true,
  compact = false,
}) => {
  const activeMembers = members.filter(m => m.isActive);
  const utilizationPercentage = capacity > 0 ? (taskCount / capacity) * 100 : 0;

  const getUtilizationColor = () => {
    if (utilizationPercentage >= 100) return 'text-red-600 dark:text-red-400';
    if (utilizationPercentage >= 80) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-green-600 dark:text-green-400';
  };

  const getTeamColorClasses = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700';
      case 'green':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700';
      case 'purple':
        return 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-700';
      case 'orange':
        return 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-700';
      case 'pink':
        return 'bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-700';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700';
    }
  };

  if (compact) {
    return (
      <div className={`flex items-center justify-between p-2 border-b ${getTeamColorClasses()}`}>
        <div className="flex items-center space-x-2">
          <button
            onClick={onToggleExpand}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            )}
          </button>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{teamName}</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{taskCount} tasks</span>
        </div>

        {showAvatars && (
          <div className="flex items-center space-x-1">
            {activeMembers.slice(0, 3).map(member => (
              <div
                key={member.id}
                className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-xs"
                title={member.name}
              >
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-700 dark:text-gray-300">{member.name.charAt(0)}</span>
                )}
              </div>
            ))}
            {activeMembers.length > 3 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                +{activeMembers.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`p-4 border-b ${getTeamColorClasses()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onToggleExpand}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">{teamName}</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {activeMembers.length} active members
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Task Count and Capacity */}
          <div className="text-right">
            <div className={`text-lg font-bold ${getUtilizationColor()}`}>
              {taskCount}/{capacity}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {utilizationPercentage.toFixed(0)}% utilized
            </div>
          </div>

          {/* Team Members */}
          {showAvatars && (
            <div className="flex items-center space-x-2">
              <div className="flex -space-x-2">
                {activeMembers.slice(0, 4).map(member => (
                  <div
                    key={member.id}
                    className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm border-2 border-white dark:border-gray-800"
                    title={`${member.name} - ${member.role}`}
                  >
                    {member.avatarUrl ? (
                      <img
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {member.name.charAt(0)}
                      </span>
                    )}
                  </div>
                ))}
                {activeMembers.length > 4 && (
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-400 border-2 border-white dark:border-gray-800">
                    +{activeMembers.length - 4}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-1">
            <button
              onClick={onAddMember}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Add team member"
            >
              <UserPlus className="w-4 h-4" />
            </button>
            <button
              onClick={onSettings}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Team settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Capacity Bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
          <span>Team Capacity</span>
          <span>{capacity - taskCount} slots available</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              utilizationPercentage >= 100
                ? 'bg-red-500'
                : utilizationPercentage >= 80
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(utilizationPercentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mt-3">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900 dark:text-white">{taskCount}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Active Tasks</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {Math.round((taskCount / activeMembers.length) * 10) / 10}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Tasks/Member</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {activeMembers.filter(m => m.isActive).length}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Available</div>
        </div>
      </div>
    </div>
  );
};
