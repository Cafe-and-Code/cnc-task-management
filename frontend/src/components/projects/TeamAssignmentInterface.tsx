import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../../hooks/redux';
import { UserRole } from '../../types/index';
import { useRolePermission } from '../../components/auth/RoleBasedRoute';
import { LoadingSpinner } from '../ui/LoadingSpinner';

interface TeamMember {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl?: string;
    role: UserRole;
  };
  role: 'ProductOwner' | 'ScrumMaster' | 'Developer' | 'Tester' | 'Stakeholder';
  joinedAt: string;
  isActive: boolean;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl?: string;
  role: UserRole;
  department?: string;
  skills?: string[];
  availability?: number;
}

interface TeamAssignmentProps {
  projectId: string;
  currentTeam?: TeamMember[];
  onTeamUpdate?: (team: TeamMember[]) => void;
  readOnly?: boolean;
}

const roleOptions = [
  {
    value: 'ProductOwner',
    label: 'Product Owner',
    description: 'Defines product requirements and priorities',
  },
  { value: 'ScrumMaster', label: 'Scrum Master', description: 'Facilitates the Scrum process' },
  {
    value: 'Developer',
    label: 'Developer',
    description: 'Develops and delivers product increments',
  },
  { value: 'Tester', label: 'Tester', description: 'Ensures quality through testing' },
  { value: 'Stakeholder', label: 'Stakeholder', description: 'Provides feedback and requirements' },
];

export const TeamAssignmentInterface: React.FC<TeamAssignmentProps> = ({
  projectId,
  currentTeam = [],
  onTeamUpdate,
  readOnly = false,
}) => {
  const { user } = useAppSelector(state => state.auth);
  const { isManagement, isAdmin } = useRolePermission();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(currentTeam);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedMemberRole, setSelectedMemberRole] = useState<string>('');
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Mock data - in real implementation, this would come from API
  useEffect(() => {
    const loadAvailableUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Mock users data
        const mockUsers: User[] = [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            role: UserRole.Developer,
            department: 'Engineering',
            skills: ['React', 'TypeScript', 'Node.js'],
            availability: 80,
          },
          {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            role: UserRole.Developer,
            department: 'Engineering',
            skills: ['Python', 'Django', 'PostgreSQL'],
            availability: 100,
          },
          {
            id: '3',
            firstName: 'Mike',
            lastName: 'Johnson',
            email: 'mike.johnson@example.com',
            role: UserRole.ScrumMaster,
            department: 'Product',
            skills: ['Agile', 'Scrum', 'Project Management'],
            availability: 90,
          },
          {
            id: '4',
            firstName: 'Sarah',
            lastName: 'Wilson',
            email: 'sarah.wilson@example.com',
            role: UserRole.ProductOwner,
            department: 'Product',
            skills: ['Product Management', 'User Research', 'Analytics'],
            availability: 75,
          },
          {
            id: '5',
            firstName: 'Tom',
            lastName: 'Brown',
            email: 'tom.brown@example.com',
            role: UserRole.Developer,
            department: 'Engineering',
            skills: ['Testing', 'QA', 'Automation'],
            availability: 60,
          },
          {
            id: '6',
            firstName: 'Emily',
            lastName: 'Davis',
            email: 'emily.davis@example.com',
            role: UserRole.Developer,
            department: 'Design',
            skills: ['UI/UX', 'Figma', 'CSS'],
            availability: 85,
          },
        ];

        // Filter out users already in the team
        const currentTeamUserIds = currentTeam.map(member => member.user.id);
        const available = mockUsers.filter(user => !currentTeamUserIds.includes(user.id));

        setAvailableUsers(available);
      } catch (error: any) {
        console.error('Failed to load available users:', error);
        setError(error.message || 'Failed to load available users');
      } finally {
        setIsLoading(false);
      }
    };

    loadAvailableUsers();
  }, [currentTeam]);

  const filteredUsers = availableUsers.filter(user => {
    const matchesSearch =
      !searchQuery ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = !selectedRole || user.role === selectedRole;

    return matchesSearch && matchesRole;
  });

  const handleAddMember = async () => {
    if (!selectedUser || !selectedMemberRole) return;

    try {
      setIsAddingMember(true);
      setError(null);

      const newMember: TeamMember = {
        id: `team-${Date.now()}`,
        user: selectedUser,
        role: selectedMemberRole as any,
        joinedAt: new Date().toISOString(),
        isActive: true,
      };

      const updatedTeam = [...teamMembers, newMember];
      setTeamMembers(updatedTeam);

      // Remove user from available users
      setAvailableUsers(prev => prev.filter(u => u.id !== selectedUser.id));

      // Notify parent component
      onTeamUpdate?.(updatedTeam);

      // Reset form
      setSelectedUser(null);
      setSelectedMemberRole('');
      setShowAddMemberModal(false);
    } catch (error: any) {
      console.error('Failed to add team member:', error);
      setError(error.message || 'Failed to add team member');
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (readOnly) return;

    try {
      const member = teamMembers.find(m => m.id === memberId);
      if (!member) return;

      const updatedTeam = teamMembers.filter(m => m.id !== memberId);
      setTeamMembers(updatedTeam);

      // Add user back to available users
      setAvailableUsers(prev => [...prev, member.user]);

      // Notify parent component
      onTeamUpdate?.(updatedTeam);
    } catch (error: any) {
      console.error('Failed to remove team member:', error);
      setError(error.message || 'Failed to remove team member');
    }
  };

  const handleUpdateMemberRole = async (memberId: string, newRole: string) => {
    if (readOnly) return;

    try {
      const updatedTeam = teamMembers.map(member =>
        member.id === memberId ? { ...member, role: newRole as any } : member
      );
      setTeamMembers(updatedTeam);

      // Notify parent component
      onTeamUpdate?.(updatedTeam);
    } catch (error: any) {
      console.error('Failed to update member role:', error);
      setError(error.message || 'Failed to update member role');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ProductOwner':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'ScrumMaster':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Developer':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'Tester':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Stakeholder':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getUserInitials = (user: User) => {
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Current Team */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Current Team ({teamMembers.length})
          </h3>
          {!readOnly && (isManagement || isAdmin) && (
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary/90"
            >
              <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Member
            </button>
          )}
        </div>

        {teamMembers.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              No team members
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Get started by adding team members to this project
            </p>
            {!readOnly && (isManagement || isAdmin) && (
              <div className="mt-6">
                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-brand-primary hover:bg-brand-primary/90"
                >
                  <svg
                    className="h-4 w-4 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Team Member
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teamMembers.map(member => (
              <div
                key={member.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-full bg-brand-primary flex items-center justify-center text-white font-medium">
                      {getUserInitials(member.user)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.user.firstName} {member.user.lastName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.user.email}
                      </p>
                    </div>
                  </div>
                  {!readOnly && (isManagement || isAdmin) && (
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Role
                    </label>
                    {!readOnly && (isManagement || isAdmin) ? (
                      <select
                        value={member.role}
                        onChange={e => handleUpdateMemberRole(member.id, e.target.value)}
                        className="block w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {roleOptions.map(role => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}
                      >
                        {roleOptions.find(r => r.value === member.role)?.label}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                    <span
                      className={`inline-flex items-center ${member.isActive ? 'text-green-500' : 'text-gray-400'}`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-1 ${member.isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                      ></div>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Users */}
      {!readOnly && (isManagement || isAdmin) && availableUsers.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Available Users ({availableUsers.length})
          </h3>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search users by name or email..."
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Roles</option>
              <option value={UserRole.Developer}>Developers</option>
              <option value={UserRole.ProductOwner}>Product Owners</option>
              <option value={UserRole.ScrumMaster}>Scrum Masters</option>
              <option value={UserRole.Stakeholder}>Stakeholders</option>
            </select>
          </div>

          {/* Available Users List */}
          <div className="space-y-3">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No users found matching your criteria
              </div>
            ) : (
              filteredUsers.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center space-x-4">
                    <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-600 dark:text-gray-300 font-medium">
                      {getUserInitials(user)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email} • {user.department}
                      </p>
                      {user.skills && user.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {user.skills.slice(0, 3).map((skill, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                            >
                              {skill}
                            </span>
                          ))}
                          {user.skills.length > 3 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{user.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedUser(user);
                      setSelectedMemberRole('Developer');
                      setShowAddMemberModal(true);
                    }}
                    className="px-3 py-1.5 text-sm font-medium text-brand-primary hover:text-brand-primary/80 border border-brand-primary hover:bg-brand-primary/10 rounded-md transition-colors"
                  >
                    Add to Team
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowAddMemberModal(false)}
            ></div>

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-brand-primary flex items-center justify-center text-white font-medium">
                    {getUserInitials(selectedUser)}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                      Add {selectedUser.firstName} {selectedUser.lastName} to Team
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Role
                  </label>
                  <div className="space-y-2">
                    {roleOptions.map(role => (
                      <label
                        key={role.value}
                        className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={selectedMemberRole === role.value}
                          onChange={e => setSelectedMemberRole(e.target.value)}
                          className="h-4 w-4 text-brand-primary focus:ring-brand-primary border-gray-300"
                        />
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {role.label}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {role.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleAddMember}
                  disabled={isAddingMember || !selectedMemberRole}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-brand-primary text-base font-medium text-white hover:bg-brand-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingMember ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Adding...</span>
                    </>
                  ) : (
                    'Add to Team'
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowAddMemberModal(false);
                    setSelectedUser(null);
                    setSelectedMemberRole('');
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-2 bg-white dark:bg-gray-800 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-primary sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
