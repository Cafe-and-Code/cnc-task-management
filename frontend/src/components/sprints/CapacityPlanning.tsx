import React, { useState, useMemo } from 'react';
import {
  Users,
  TrendingUp,
  Calendar,
  Target,
  Info,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
} from 'lucide-react';

// Types
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  skills: string[];
  capacity: number; // story points per sprint
  availability: number; // percentage (0-100)
  velocity: number; // actual average performance
  holidays: number; // days off in current sprint
  tasksInSprint: number;
  pointsAssigned: number;
  efficiency: number; // actual vs planned ratio
}

interface Story {
  id: string;
  title: string;
  storyPoints: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'backlog' | 'in_sprint' | 'completed';
  assigneeId?: string;
  requiredSkills: string[];
  estimatedHours: number;
}

interface SprintInfo {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  duration: number; // days
  capacity: number;
  stories: Story[];
}

interface CapacityPlanningProps {
  sprint: SprintInfo;
  teamMembers: TeamMember[];
  onUpdateMemberCapacity?: (memberId: string, capacity: number) => void;
  onAssignStory?: (storyId: string, memberId: string) => void;
  onUnassignStory?: (storyId: string) => void;
  onUpdateSprintCapacity?: (capacity: number) => void;
  compact?: boolean;
}

export const CapacityPlanning: React.FC<CapacityPlanningProps> = ({
  sprint,
  teamMembers,
  onUpdateMemberCapacity,
  onAssignStory,
  onUnassignStory,
  onUpdateSprintCapacity,
  compact = false,
}) => {
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [viewMode, setViewMode] = useState<'overview' | 'members' | 'stories' | 'analytics'>(
    'overview'
  );

  const analytics = useMemo(() => {
    const totalTeamCapacity = teamMembers.reduce((sum, member) => sum + member.capacity, 0);
    const adjustedCapacity = teamMembers.reduce(
      (sum, member) => sum + (member.capacity * member.availability) / 100,
      0
    );
    const totalAssigned = teamMembers.reduce((sum, member) => sum + member.pointsAssigned, 0);
    const utilizationRate = (totalAssigned / adjustedCapacity) * 100;

    const averageVelocity =
      teamMembers.reduce((sum, member) => sum + member.velocity, 0) / teamMembers.length;
    const averageEfficiency =
      teamMembers.reduce((sum, member) => sum + member.efficiency, 0) / teamMembers.length;

    const unassignedStories = sprint.stories.filter(story => !story.assigneeId);
    const unassignedPoints = unassignedStories.reduce((sum, story) => sum + story.storyPoints, 0);

    const availableCapacity = adjustedCapacity - totalAssigned;
    const riskLevel = utilizationRate > 95 ? 'high' : utilizationRate > 85 ? 'medium' : 'low';

    return {
      totalTeamCapacity,
      adjustedCapacity,
      totalAssigned,
      utilizationRate,
      averageVelocity,
      averageEfficiency,
      unassignedStories: unassignedStories.length,
      unassignedPoints,
      availableCapacity,
      riskLevel,
      teamMemberCount: teamMembers.length,
    };
  }, [teamMembers, sprint.stories]);

  const selectedMember = teamMembers.find(member => member.id === selectedMemberId);

  const handleCapacityChange = (memberId: string, delta: number) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member || !onUpdateMemberCapacity) return;

    const newCapacity = Math.max(5, Math.min(100, member.capacity + delta));
    onUpdateMemberCapacity(memberId, newCapacity);
  };

  const handleAvailabilityChange = (memberId: string, availability: number) => {
    // In a real implementation, this would update the member's availability
    console.log(`Updating availability for ${memberId} to ${availability}%`);
  };

  const handleStoryAssignment = (storyId: string, memberId: string) => {
    if (onAssignStory) {
      onAssignStory(storyId, memberId);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20';
      case 'low':
        return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50';
    }
  };

  const getSkillMatchScore = (member: TeamMember, story: Story): number => {
    if (story.requiredSkills.length === 0) return 100;
    const matchingSkills = story.requiredSkills.filter(skill => member.skills.includes(skill));
    return (matchingSkills.length / story.requiredSkills.length) * 100;
  };

  const getRecommendedAssignee = (story: Story): TeamMember | null => {
    const availableMembers = teamMembers.filter(member => {
      const currentLoad = (member.pointsAssigned / member.capacity) * 100;
      return currentLoad < 90; // Don't assign to overloaded members
    });

    if (availableMembers.length === 0) return null;

    return availableMembers.reduce((best, current) => {
      const bestScore = getSkillMatchScore(best, story);
      const currentScore = getSkillMatchScore(current, story);
      return currentScore > bestScore ? current : best;
    });
  };

  if (compact) {
    return (
      <div className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {analytics.adjustedCapacity}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Capacity</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {analytics.totalAssigned}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Assigned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {analytics.availableCapacity}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Available</div>
          </div>
          <div className="text-center">
            <div
              className={`text-2xl font-bold ${getRiskColor(analytics.riskLevel).split(' ')[0]}`}
            >
              {analytics.utilizationRate.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Utilization</div>
          </div>
        </div>

        {/* Risk Indicator */}
        {analytics.riskLevel !== 'low' && (
          <div className={`p-3 rounded-lg ${getRiskColor(analytics.riskLevel)}`}>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {analytics.riskLevel === 'high' ? 'High Risk: ' : ''}
                {analytics.riskLevel === 'medium' ? 'Medium Risk: ' : ''}
                Capacity utilization is {analytics.utilizationRate.toFixed(0)}%
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Capacity Planning</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Optimize team capacity and story assignments for {sprint.name}
          </p>
        </div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-sm text-brand-primary hover:text-brand-primary/80"
        >
          {showAdvanced ? 'Hide' : 'Show'} Advanced
        </button>
      </div>

      {/* View Mode Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
            { id: 'members', label: 'Team Members', icon: <Users className="w-4 h-4" /> },
            { id: 'stories', label: 'Story Assignment', icon: <Target className="w-4 h-4" /> },
            { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-4 h-4" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setViewMode(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                viewMode === tab.id
                  ? 'border-brand-primary text-brand-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <span className="flex items-center space-x-2">
                {tab.icon}
                <span>{tab.label}</span>
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {viewMode === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Capacity</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.adjustedCapacity}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">story points</p>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Assigned</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {analytics.totalAssigned}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {analytics.utilizationRate.toFixed(0)}% utilization
                  </p>
                </div>
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {analytics.availableCapacity}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">story points left</p>
                </div>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <Users className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Team Size</p>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {analytics.teamMemberCount}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">active members</p>
                </div>
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Capacity Utilization */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Capacity Utilization
            </h4>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Total Utilization</span>
                  <span
                    className={`font-medium ${getRiskColor(analytics.riskLevel).split(' ')[0]}`}
                  >
                    {analytics.utilizationRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      analytics.utilizationRate > 95
                        ? 'bg-red-500'
                        : analytics.utilizationRate > 85
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(analytics.utilizationRate, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Risk Alert */}
              {analytics.riskLevel !== 'low' && (
                <div className={`p-4 rounded-lg ${getRiskColor(analytics.riskLevel)}`}>
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="w-5 h-5 mt-0.5" />
                    <div>
                      <h5 className="font-medium mb-1">
                        {analytics.riskLevel === 'high' ? 'High Risk' : 'Medium Risk'}
                      </h5>
                      <p className="text-sm">
                        {analytics.riskLevel === 'high'
                          ? 'Team is over-allocated. Consider reducing story points or adding capacity.'
                          : 'Team is approaching capacity limits. Monitor closely.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Unassigned Stories */}
          {analytics.unassignedStories > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Unassigned Stories ({analytics.unassignedStories})
              </h4>
              <div className="space-y-3">
                {sprint.stories
                  .filter(story => !story.assigneeId)
                  .slice(0, 5)
                  .map(story => {
                    const recommendedAssignee = getRecommendedAssignee(story);
                    return (
                      <div
                        key={story.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {story.title}
                          </div>
                          <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                            <span>{story.storyPoints} pts</span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                story.priority === 'critical'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                  : story.priority === 'high'
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                    : story.priority === 'medium'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              }`}
                            >
                              {story.priority}
                            </span>
                          </div>
                        </div>
                        {recommendedAssignee && (
                          <button
                            onClick={() => handleStoryAssignment(story.id, recommendedAssignee.id)}
                            className="px-3 py-1 text-sm bg-brand-primary text-white rounded-md hover:bg-brand-primary/90"
                          >
                            Assign to {recommendedAssignee.name}
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
              {analytics.unassignedStories > 5 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                  ... and {analytics.unassignedStories - 5} more stories
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Team Members Tab */}
      {viewMode === 'members' && (
        <div className="space-y-4">
          {teamMembers.map(member => (
            <div
              key={member.id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-brand-primary rounded-full flex items-center justify-center text-white font-medium">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {member.name}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {member.skills.map(skill => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 dark:text-white">
                    {member.pointsAssigned} / {member.capacity}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {((member.pointsAssigned / member.capacity) * 100).toFixed(0)}% utilized
                  </div>
                </div>
              </div>

              {/* Member Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Base Capacity</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {member.capacity} pts
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Availability</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={member.availability}
                      onChange={e => handleAvailabilityChange(member.id, parseInt(e.target.value))}
                      className="flex-1"
                    />
                    <span className="text-sm font-medium text-gray-900 dark:text-white w-12">
                      {member.availability}%
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Velocity</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {member.velocity} pts/sprint
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency</span>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {(member.efficiency * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Capacity Adjustment */}
              <div className="mt-4 flex items-center space-x-3">
                <span className="text-sm text-gray-600 dark:text-gray-400">Adjust Capacity:</span>
                <button
                  onClick={() => handleCapacityChange(member.id, -5)}
                  className="p-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <input
                  type="number"
                  value={member.capacity}
                  onChange={e => {
                    const newCapacity = parseInt(e.target.value) || 0;
                    if (onUpdateMemberCapacity) {
                      onUpdateMemberCapacity(member.id, Math.max(5, Math.min(100, newCapacity)));
                    }
                  }}
                  className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <button
                  onClick={() => handleCapacityChange(member.id, 5)}
                  className="p-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Utilization Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      member.pointsAssigned / member.capacity > 0.9
                        ? 'bg-red-500'
                        : member.pointsAssigned / member.capacity > 0.7
                          ? 'bg-yellow-500'
                          : 'bg-green-500'
                    }`}
                    style={{
                      width: `${Math.min((member.pointsAssigned / member.capacity) * 100, 100)}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Story Assignment Tab */}
      {viewMode === 'stories' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stories List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Sprint Stories ({sprint.stories.length})
              </h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {sprint.stories.map(story => {
                  const assignee = story.assigneeId
                    ? teamMembers.find(m => m.id === story.assigneeId)
                    : null;
                  const recommendedAssignee = getRecommendedAssignee(story);

                  return (
                    <div
                      key={story.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        story.assigneeId
                          ? 'border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => setSelectedMemberId(story.assigneeId || null)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-gray-900 dark:text-white mb-1">
                            {story.title}
                          </h5>
                          <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400">
                            <span>{story.storyPoints} pts</span>
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                story.priority === 'critical'
                                  ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                  : story.priority === 'high'
                                    ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                                    : story.priority === 'medium'
                                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                              }`}
                            >
                              {story.priority}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          {assignee ? (
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {assignee.name}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Unassigned
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Skills Match */}
                      {story.requiredSkills.length > 0 && (
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Skills:</span>
                          {story.requiredSkills.map(skill => (
                            <span
                              key={skill}
                              className="inline-flex items-center px-1.5 py-0.5 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Recommended Assignee */}
                      {!story.assigneeId && recommendedAssignee && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-green-600 dark:text-green-400">
                            Recommended: {recommendedAssignee.name} (
                            {getSkillMatchScore(recommendedAssignee, story).toFixed(0)}% match)
                          </span>
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              handleStoryAssignment(story.id, recommendedAssignee.id);
                            }}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Assign
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Member Workload */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Team Workload
              </h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {teamMembers.map(member => (
                  <div
                    key={member.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedMemberId === member.id
                        ? 'border-brand-primary bg-brand-primary/5'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                    onClick={() => setSelectedMemberId(member.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-brand-primary rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {member.name}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {member.role}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {member.pointsAssigned} / {member.capacity}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {((member.pointsAssigned / member.capacity) * 100).toFixed(0)}% full
                        </div>
                      </div>
                    </div>

                    {/* Utilization Bar */}
                    <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          member.pointsAssigned / member.capacity > 0.9
                            ? 'bg-red-500'
                            : member.pointsAssigned / member.capacity > 0.7
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min((member.pointsAssigned / member.capacity) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>

                    {/* Assigned Stories Count */}
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {member.tasksInSprint} stories assigned
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analytics Tab */}
      {viewMode === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Team Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Team Performance
              </h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Average Velocity</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {analytics.averageVelocity.toFixed(1)} pts/sprint
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Average Efficiency
                  </span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {(analytics.averageEfficiency * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Capacity Utilization
                  </span>
                  <span
                    className={`font-medium ${getRiskColor(analytics.riskLevel).split(' ')[0]}`}
                  >
                    {analytics.utilizationRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Distribution Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Workload Distribution
              </h4>
              <div className="space-y-3">
                {teamMembers.map(member => (
                  <div key={member.id} className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-brand-primary rounded-full"></div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-900 dark:text-white">{member.name}</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {member.pointsAssigned} pts (
                          {((member.pointsAssigned / analytics.totalAssigned) * 100).toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-brand-primary"
                          style={{
                            width: `${(member.pointsAssigned / analytics.totalAssigned) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  Capacity Planning Recommendations
                </h4>
                <div className="space-y-2">
                  {analytics.utilizationRate > 95 && (
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Consider reducing sprint scope or adding more capacity to avoid burnout.
                      </p>
                    </div>
                  )}
                  {analytics.utilizationRate < 70 && (
                    <div className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Team has available capacity. Consider adding more stories or increasing
                        story point estimates.
                      </p>
                    </div>
                  )}
                  {analytics.unassignedStories > 0 && (
                    <div className="flex items-start space-x-2">
                      <Target className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {analytics.unassignedStories} stories still need assignment. Use skill
                        matching to optimize assignments.
                      </p>
                    </div>
                  )}
                  {analytics.averageEfficiency < 0.8 && (
                    <div className="flex items-start space-x-2">
                      <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        Team efficiency could be improved. Consider story breakdown or skill
                        development.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
