import React, { useState } from 'react';
import { X, Plus, Users, Settings, Trash2, Edit3, User, Crown, Shield, Zap } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  isActive: boolean;
}

interface Team {
  id: string;
  name: string;
  color: string;
  members: TeamMember[];
  capacity: number;
  leadId?: string;
  description?: string;
}

interface TeamManagementPanelProps {
  teams: Team[];
  allMembers: TeamMember[];
  onCreateTeam: (team: Omit<Team, 'id'>) => void;
  onUpdateTeam: (teamId: string, updates: Partial<Team>) => void;
  onDeleteTeam: (teamId: string) => void;
  onAddMemberToTeam: (teamId: string, memberId: string) => void;
  onRemoveMemberFromTeam: (teamId: string, memberId: string) => void;
  onClose: () => void;
}

export const TeamManagementPanel: React.FC<TeamManagementPanelProps> = ({
  teams,
  allMembers,
  onCreateTeam,
  onUpdateTeam,
  onDeleteTeam,
  onAddMemberToTeam,
  onRemoveMemberFromTeam,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'teams' | 'members'>('teams');
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState({
    name: '',
    color: 'blue',
    capacity: 10,
    description: '',
  });

  const teamColors = [
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'green', label: 'Green', class: 'bg-green-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { value: 'pink', label: 'Pink', class: 'bg-pink-500' },
    { value: 'gray', label: 'Gray', class: 'bg-gray-500' },
  ];

  const handleCreateTeam = () => {
    if (!newTeam.name.trim()) return;

    onCreateTeam({
      name: newTeam.name.trim(),
      color: newTeam.color,
      capacity: newTeam.capacity,
      description: newTeam.description.trim(),
      members: [],
    });

    setNewTeam({
      name: '',
      color: 'blue',
      capacity: 10,
      description: '',
    });
    setIsCreatingTeam(false);
  };

  const handleUpdateTeam = (teamId: string, updates: Partial<Team>) => {
    onUpdateTeam(teamId, updates);
    setEditingTeam(null);
  };

  const getAvailableMembers = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    const teamMemberIds = team?.members.map(m => m.id) || [];
    return allMembers.filter(m => !teamMemberIds.includes(m.id));
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'lead':
        return <Crown className="w-3 h-3" />;
      case 'senior':
        return <Shield className="w-3 h-3" />;
      case 'junior':
        return <Zap className="w-3 h-3" />;
      default:
        return <User className="w-3 h-3" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Team Management</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center space-x-1 p-6 pb-0 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'teams'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Teams ({teams.length})
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              activeTab === 'members'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            Members ({allMembers.length})
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {activeTab === 'teams' && (
            <div className="space-y-4">
              {/* Create Team Button */}
              {!isCreatingTeam && (
                <button
                  onClick={() => setIsCreatingTeam(true)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create New Team</span>
                </button>
              )}

              {/* Create Team Form */}
              {isCreatingTeam && (
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                    Create New Team
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Team Name *
                      </label>
                      <input
                        type="text"
                        value={newTeam.name}
                        onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                        placeholder="Enter team name..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Team Color
                        </label>
                        <div className="flex items-center space-x-2">
                          {teamColors.map(color => (
                            <button
                              key={color.value}
                              onClick={() => setNewTeam({ ...newTeam, color: color.value })}
                              className={`w-8 h-8 rounded-full ${color.class} ${
                                newTeam.color === color.value
                                  ? 'ring-2 ring-offset-2 ring-blue-500'
                                  : ''
                              }`}
                              title={color.label}
                            />
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Capacity
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="50"
                          value={newTeam.capacity}
                          onChange={e =>
                            setNewTeam({ ...newTeam, capacity: parseInt(e.target.value) || 1 })
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        value={newTeam.description}
                        onChange={e => setNewTeam({ ...newTeam, description: e.target.value })}
                        placeholder="Team description..."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div className="flex items-center justify-end space-x-3">
                      <button
                        onClick={() => {
                          setIsCreatingTeam(false);
                          setNewTeam({ name: '', color: 'blue', capacity: 10, description: '' });
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateTeam}
                        disabled={!newTeam.name.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Create Team
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Teams List */}
              {teams.map(team => (
                <div
                  key={team.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded-full bg-${team.color}-500`} />
                      <div>
                        {editingTeam === team.id ? (
                          <input
                            type="text"
                            value={team.name}
                            onChange={e => onUpdateTeam(team.id, { name: e.target.value })}
                            className="text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-blue-500 outline-none"
                            autoFocus
                          />
                        ) : (
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {team.name}
                          </h3>
                        )}
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {team.members.length} members • {team.capacity} capacity
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {editingTeam === team.id ? (
                        <>
                          <button
                            onClick={() => setEditingTeam(null)}
                            className="p-1 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                          >
                            <span className="text-sm">✓</span>
                          </button>
                          <button
                            onClick={() => setEditingTeam(null)}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setEditingTeam(team.id)}
                            className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                            <Settings className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteTeam(team.id)}
                            className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Team Members */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        Team Members
                      </h4>
                      <button
                        onClick={() => {
                          // In a real implementation, this would open a member selection modal
                          console.log('Add member to team:', team.id);
                        }}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        Add Member
                      </button>
                    </div>

                    {team.members.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        No members assigned to this team
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {team.members.map(member => (
                          <div
                            key={member.id}
                            className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                          >
                            <div className="flex items-center space-x-3">
                              {member.avatarUrl ? (
                                <img
                                  src={member.avatarUrl}
                                  alt={member.name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-sm font-medium text-gray-700 dark:text-gray-300">
                                  {member.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {member.name}
                                  </span>
                                  {getRoleIcon(member.role)}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                  {member.role}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <span
                                className={`w-2 h-2 rounded-full ${
                                  member.isActive ? 'bg-green-500' : 'bg-gray-400'
                                }`}
                              />
                              <button
                                onClick={() => onRemoveMemberFromTeam(team.id, member.id)}
                                className="p-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {allMembers.map(member => (
                  <div
                    key={member.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center text-lg font-medium text-gray-700 dark:text-gray-300">
                          {member.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white">{member.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.role}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">{member.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            member.isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {member.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                        Member of{' '}
                        {teams.filter(t => t.members.some(m => m.id === member.id)).length} team(s)
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {teams
                          .filter(t => t.members.some(m => m.id === member.id))
                          .map(team => (
                            <span
                              key={team.id}
                              className={`inline-flex items-center px-2 py-1 text-xs bg-${team.color}-100 text-${team.color}-700 rounded-full dark:bg-${team.color}-900/20 dark:text-${team.color}-400`}
                            >
                              {team.name}
                            </span>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
