import React, { useState, useEffect } from 'react';
import {
  UserPlus,
  Mail,
  Users,
  Search,
  Filter,
  X,
  Check,
  AlertCircle,
  Clock,
  Send,
  RefreshCw,
  Eye,
  EyeOff,
  MoreVertical,
  Settings,
  Trash2,
  Calendar,
  Copy,
  MessageSquare,
  Bell,
  BellOff,
  UserCheck,
  UserX,
  Shield,
  Briefcase,
  MapPin,
  Phone,
  Star,
  TrendingUp,
  TrendingDown,
  Activity,
} from 'lucide-react';

interface Invitation {
  id: string;
  email: string;
  role: string;
  department: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  sentAt: string;
  expiresAt: string;
  acceptedAt?: string;
  invitedBy: {
    id: string;
    name: string;
  };
  teamId: string;
  teamName: string;
  customFields?: Record<string, any>;
}

interface InvitableUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department: string;
  role: string;
  status: 'active' | 'inactive';
  skills: string[];
  location?: string;
  availability: 'available' | 'busy' | 'unavailable';
  lastActive: string;
  matchScore?: number;
}

interface MemberInvitationProps {
  teamId: string;
  teamName: string;
  onInvitationSent?: (invitation: Invitation) => void;
  onMemberJoined?: (userId: string) => void;
  className?: string;
}

const MemberInvitation: React.FC<MemberInvitationProps> = ({
  teamId,
  teamName,
  onInvitationSent,
  onMemberJoined,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'invite' | 'pending' | 'history'>('invite');
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [invitableUsers, setInvitableUsers] = useState<InvitableUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<InvitableUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showCustomMessage, setShowCustomMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  // Mock data
  useEffect(() => {
    const mockInvitations: Invitation[] = [
      {
        id: 'inv-1',
        email: 'john.doe@example.com',
        role: 'Senior Developer',
        department: 'Engineering',
        message: 'We would love to have you join our frontend team!',
        status: 'pending',
        sentAt: '2024-01-14T10:00:00Z',
        expiresAt: '2024-01-21T10:00:00Z',
        invitedBy: {
          id: 'user-1',
          name: 'Alice Johnson',
        },
        teamId,
        teamName,
      },
      {
        id: 'inv-2',
        email: 'jane.smith@example.com',
        role: 'UI/UX Designer',
        department: 'Design',
        status: 'accepted',
        sentAt: '2024-01-12T14:30:00Z',
        expiresAt: '2024-01-19T14:30:00Z',
        acceptedAt: '2024-01-13T09:15:00Z',
        invitedBy: {
          id: 'user-1',
          name: 'Alice Johnson',
        },
        teamId,
        teamName,
      },
      {
        id: 'inv-3',
        email: 'mike.wilson@example.com',
        role: 'DevOps Engineer',
        department: 'Engineering',
        status: 'declined',
        sentAt: '2024-01-10T11:00:00Z',
        expiresAt: '2024-01-17T11:00:00Z',
        invitedBy: {
          id: 'user-2',
          name: 'Bob Smith',
        },
        teamId,
        teamName,
      },
      {
        id: 'inv-4',
        email: 'sarah.jones@example.com',
        role: 'Product Manager',
        department: 'Product',
        status: 'expired',
        sentAt: '2024-01-05T16:00:00Z',
        expiresAt: '2024-01-12T16:00:00Z',
        invitedBy: {
          id: 'user-1',
          name: 'Alice Johnson',
        },
        teamId,
        teamName,
      },
    ];

    const mockInvitableUsers: InvitableUser[] = [
      {
        id: 'user-10',
        name: 'David Brown',
        email: 'david.brown@company.com',
        avatar: 'https://picsum.photos/seed/david/40/40.jpg',
        department: 'Engineering',
        role: 'Full Stack Developer',
        status: 'active',
        skills: ['React', 'Node.js', 'Python', 'AWS'],
        location: 'San Francisco, CA',
        availability: 'available',
        lastActive: '2024-01-15T14:30:00Z',
        matchScore: 92,
      },
      {
        id: 'user-11',
        name: 'Emma Davis',
        email: 'emma.davis@company.com',
        avatar: 'https://picsum.photos/seed/emma/40/40.jpg',
        department: 'Design',
        role: 'Product Designer',
        status: 'active',
        skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
        location: 'New York, NY',
        availability: 'available',
        lastActive: '2024-01-15T11:45:00Z',
        matchScore: 88,
      },
      {
        id: 'user-12',
        name: 'Chris Wilson',
        email: 'chris.wilson@company.com',
        avatar: 'https://picsum.photos/seed/chris/40/40.jpg',
        department: 'Engineering',
        role: 'Backend Developer',
        status: 'active',
        skills: ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'],
        location: 'Austin, TX',
        availability: 'busy',
        lastActive: '2024-01-15T16:20:00Z',
        matchScore: 75,
      },
      {
        id: 'user-13',
        name: 'Lisa Anderson',
        email: 'lisa.anderson@company.com',
        avatar: 'https://picsum.photos/seed/lisa/40/40.jpg',
        department: 'QA',
        role: 'QA Engineer',
        status: 'active',
        skills: ['Selenium', 'Cypress', 'Test Planning', 'Agile'],
        location: 'Seattle, WA',
        availability: 'available',
        lastActive: '2024-01-15T09:30:00Z',
        matchScore: 81,
      },
      {
        id: 'user-14',
        name: 'Tom Martinez',
        email: 'tom.martinez@company.com',
        avatar: 'https://picsum.photos/seed/tom/40/40.jpg',
        department: 'DevOps',
        role: 'DevOps Engineer',
        status: 'inactive',
        skills: ['Kubernetes', 'Jenkins', 'Terraform', 'AWS'],
        location: 'Denver, CO',
        availability: 'unavailable',
        lastActive: '2024-01-10T14:15:00Z',
        matchScore: 68,
      },
    ];

    setInvitations(mockInvitations);
    setInvitableUsers(mockInvitableUsers);
  }, [teamId, teamName]);

  const departments = ['all', 'Engineering', 'Design', 'Product', 'QA', 'DevOps', 'Marketing'];
  const roles = [
    'Senior Developer',
    'Developer',
    'UI/UX Designer',
    'Product Manager',
    'QA Engineer',
    'DevOps Engineer',
  ];

  const filteredUsers = invitableUsers.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDepartment = departmentFilter === 'all' || user.department === departmentFilter;
    const matchesAvailability =
      availabilityFilter === 'all' || user.availability === availabilityFilter;

    return matchesSearch && matchesDepartment && matchesAvailability;
  });

  const pendingInvitations = invitations.filter(inv => inv.status === 'pending');
  const pastInvitations = invitations.filter(inv => inv.status !== 'pending');

  const toggleUserSelection = (user: InvitableUser) => {
    if (selectedUsers.find(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const sendInvitations = async () => {
    if (selectedUsers.length === 0 || !selectedRole) return;

    setIsSending(true);

    // Simulate API call
    setTimeout(() => {
      const newInvitations: Invitation[] = selectedUsers.map(user => ({
        id: `inv-${Date.now()}-${user.id}`,
        email: user.email,
        role: selectedRole,
        department: user.department,
        message: customMessage || undefined,
        status: 'pending',
        sentAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        invitedBy: {
          id: 'current-user',
          name: 'Current User',
        },
        teamId,
        teamName,
      }));

      setInvitations([...newInvitations, ...invitations]);
      setSelectedUsers([]);
      setSelectedRole('');
      setCustomMessage('');
      setShowCustomMessage(false);
      setIsSending(false);

      newInvitations.forEach(invitation => {
        onInvitationSent?.(invitation);
      });
    }, 1500);
  };

  const resendInvitation = (invitationId: string) => {
    setInvitations(
      invitations.map(inv =>
        inv.id === invitationId
          ? {
              ...inv,
              sentAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            }
          : inv
      )
    );
  };

  const cancelInvitation = (invitationId: string) => {
    setInvitations(invitations.filter(inv => inv.id !== invitationId));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'accepted':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'declined':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'expired':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available':
        return 'text-green-600 dark:text-green-400';
      case 'busy':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'unavailable':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-blue-600 dark:text-blue-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <UserCheck className="w-4 h-4" />;
      case 'declined':
        return <UserX className="w-4 h-4" />;
      case 'expired':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Team Invitations
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Invite members to join {teamName}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.location.reload()}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {pendingInvitations.length}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <UserCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Accepted</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {invitations.filter(inv => inv.status === 'accepted').length}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <UserX className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Declined</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {invitations.filter(inv => inv.status === 'declined').length}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {invitableUsers.filter(u => u.availability === 'available').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8 px-6">
          {[
            { id: 'invite', label: 'Invite Members', count: filteredUsers.length },
            { id: 'pending', label: 'Pending Invitations', count: pendingInvitations.length },
            { id: 'history', label: 'Invitation History', count: pastInvitations.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Invite Members Tab */}
        {activeTab === 'invite' && (
          <div className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Select Role for Invitation *
              </label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                className="w-full md:w-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="">Select a role...</option>
                {roles.map(role => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Message */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Custom Message (Optional)
                </label>
                <button
                  type="button"
                  onClick={() => setShowCustomMessage(!showCustomMessage)}
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                >
                  {showCustomMessage ? 'Hide' : 'Add'} Message
                </button>
              </div>

              {showCustomMessage && (
                <textarea
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Add a personal message to the invitation..."
                />
              )}
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or skills..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <select
                value={departmentFilter}
                onChange={e => setDepartmentFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept === 'all' ? 'All Departments' : dept}
                  </option>
                ))}
              </select>

              <select
                value={availabilityFilter}
                onChange={e => setAvailabilityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="all">All Availability</option>
                <option value="available">Available</option>
                <option value="busy">Busy</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            {/* Selected Users Summary */}
            {selectedUsers.length > 0 && (
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {selectedUsers.length} user{selectedUsers.length > 1 ? 's' : ''} selected
                  </h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      {showPreview ? 'Hide' : 'Show'} Preview
                    </button>
                    <button
                      onClick={() => setSelectedUsers([])}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm"
                    >
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <span
                      key={user.id}
                      className="inline-flex items-center px-3 py-1 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-full text-sm"
                    >
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-4 h-4 rounded-full mr-2"
                      />
                      {user.name}
                      <button
                        onClick={() => toggleUserSelection(user)}
                        className="ml-2 text-blue-500 hover:text-blue-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Preview */}
                {showPreview && (
                  <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                      Invitation Preview
                    </h5>
                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                      <p>
                        <strong>To:</strong> {selectedUsers.map(u => u.email).join(', ')}
                      </p>
                      <p>
                        <strong>Role:</strong> {selectedRole}
                      </p>
                      <p>
                        <strong>Team:</strong> {teamName}
                      </p>
                      {customMessage && (
                        <p>
                          <strong>Message:</strong> {customMessage}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Users List */}
            <div className="space-y-3">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No users found matching your criteria</p>
                </div>
              ) : (
                filteredUsers.map(user => {
                  const isSelected = selectedUsers.find(u => u.id === user.id);
                  return (
                    <div
                      key={user.id}
                      className={`p-4 border rounded-lg transition-colors ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            checked={!!isSelected}
                            onChange={() => toggleUserSelection(user)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />

                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-12 h-12 rounded-full"
                          />

                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-medium text-gray-900 dark:text-white">
                                {user.name}
                              </h3>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(user.availability)}`}
                              >
                                {user.availability}
                              </span>
                              {user.matchScore && (
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(user.matchScore)}`}
                                >
                                  {user.matchScore}% match
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {user.role} • {user.department}
                            </p>
                            <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                              <span>{user.email}</span>
                              {user.location && (
                                <span className="flex items-center space-x-1">
                                  <MapPin className="w-3 h-3" />
                                  <span>{user.location}</span>
                                </span>
                              )}
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                  Last active: {new Date(user.lastActive).toLocaleDateString()}
                                </span>
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {user.skills.slice(0, 5).map(skill => (
                                <span
                                  key={skill}
                                  className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                                >
                                  {skill}
                                </span>
                              ))}
                              {user.skills.length > 5 && (
                                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                                  +{user.skills.length - 5} more
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Send Invitations Button */}
            {selectedUsers.length > 0 && (
              <div className="flex justify-center">
                <button
                  onClick={sendInvitations}
                  disabled={isSending || !selectedRole}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <div className="flex items-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sending...
                    </div>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send {selectedUsers.length} Invitation{selectedUsers.length > 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Pending Invitations Tab */}
        {activeTab === 'pending' && (
          <div className="space-y-4">
            {pendingInvitations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No pending invitations</p>
              </div>
            ) : (
              pendingInvitations.map(invitation => (
                <div
                  key={invitation.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {invitation.email}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invitation.status)}`}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {invitation.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {invitation.role} • {invitation.department}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>Sent: {new Date(invitation.sentAt).toLocaleDateString()}</span>
                          <span>
                            Expires: {new Date(invitation.expiresAt).toLocaleDateString()}
                          </span>
                          <span>Invited by: {invitation.invitedBy.name}</span>
                        </div>
                        {invitation.message && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">
                            "{invitation.message}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => resendInvitation(invitation.id)}
                        className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Resend
                      </button>
                      <button
                        onClick={() => cancelInvitation(invitation.id)}
                        className="flex items-center px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Invitation History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {pastInvitations.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No invitation history</p>
              </div>
            ) : (
              pastInvitations.map(invitation => (
                <div
                  key={invitation.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(invitation.status)}`}
                      >
                        {getStatusIcon(invitation.status)}
                      </div>

                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {invitation.email}
                          </h3>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invitation.status)}`}
                          >
                            {getStatusIcon(invitation.status)}
                            {invitation.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {invitation.role} • {invitation.department}
                        </p>
                        <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span>Sent: {new Date(invitation.sentAt).toLocaleDateString()}</span>
                          {invitation.acceptedAt && (
                            <span>
                              Accepted: {new Date(invitation.acceptedAt).toLocaleDateString()}
                            </span>
                          )}
                          <span>Invited by: {invitation.invitedBy.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {invitation.status === 'expired' && (
                        <button
                          onClick={() => resendInvitation(invitation.id)}
                          className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Resend
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberInvitation;
