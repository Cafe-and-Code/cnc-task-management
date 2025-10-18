import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Shield,
  Mail,
  Calendar,
  Activity,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  ChevronDown,
  Download,
  Upload,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MoreVertical,
  Eye,
} from 'lucide-react';
import UserFormModal from '../../components/admin/UserFormModal';
import { userService } from '../../services/userService';
import { UserRole } from '../../types/index';

// Types
interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: 'active' | 'inactive';
  organization?: string;
  team?: string;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
  emailVerified: boolean;
  twoFactorEnabled?: boolean;
  avatarUrl?: string;
  phone?: string;
  location?: string;
  department?: string;
  permissions?: string[];
  activity?: UserActivity[];
  projectsCount?: number;
  tasksAssigned?: number;
  tasksCompleted?: number;
  loginCount?: number;
  storageUsed?: number;
}

interface UserActivity {
  id: string;
  type:
    | 'login'
    | 'logout'
    | 'project_created'
    | 'task_updated'
    | 'file_uploaded'
    | 'settings_changed';
  description: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  projectId?: string;
  taskId?: string;
}

interface Filters {
  search: string;
  role: UserRole | '';
  status: 'active' | 'inactive' | '';
  organization: string;
  team: string;
  dateRange: string;
  emailVerified: string;
  twoFactor: string;
}

const UserManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    role: '',
    status: '',
    organization: '',
    team: '',
    dateRange: '',
    emailVerified: '',
    twoFactor: '',
  });
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    productOwners: 0,
    scrumMasters: 0,
    developers: 0,
    stakeholders: 0,
    newThisMonth: 0,
    onlineNow: 0,
  });

  const usersPerPage = 20;

  // Load users and statistics from API
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);

        // Load users with current page and filters
        const usersResponse = await userService.getUsers({
          page: currentPage,
          pageSize: usersPerPage,
          search: filters.search || undefined,
          role: filters.role || undefined,
          isActive: filters.status ? filters.status === 'active' : undefined,
        });

        // Transform API users to match component interface
        const transformedUsers: User[] = usersResponse.users.map(apiUser => ({
          id: apiUser.id,
          email: apiUser.email,
          firstName: apiUser.firstName,
          lastName: apiUser.lastName,
          role: apiUser.role,
          status: apiUser.isActive ? 'active' : 'inactive',
          organization: apiUser.organization || 'CNC Manufacturing', // Default value
          team: apiUser.team,
          lastLogin: apiUser.lastLoginAt,
          createdAt: apiUser.createdAt,
          emailVerified: apiUser.isEmailVerified,
          twoFactorEnabled: false, // Default value as API doesn't provide this
          avatarUrl: apiUser.avatarUrl,
          phone: apiUser.phone,
          location: apiUser.location,
          department: apiUser.department,
          projectsCount: apiUser.projectsCount || 0,
          tasksAssigned: apiUser.tasksAssigned || 0,
          tasksCompleted: apiUser.tasksCompleted || 0,
          loginCount: apiUser.loginCount || 0,
          storageUsed: apiUser.storageUsed || 0,
        }));

        setUsers(transformedUsers);
        setTotalUsers(usersResponse.pagination.totalCount);

        // Load user statistics
        const stats = await userService.getUserStats();
        setUserStats(stats);

      } catch (error) {
        console.error('Failed to load users:', error);
        // Set empty state on error
        setUsers([]);
        setTotalUsers(0);
        setUserStats({
          total: 0,
          active: 0,
          inactive: 0,
          admins: 0,
          productOwners: 0,
          scrumMasters: 0,
          developers: 0,
          stakeholders: 0,
          newThisMonth: 0,
          onlineNow: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, [currentPage, filters]);

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      !filters.search ||
      user.email.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
      user.lastName.toLowerCase().includes(filters.search.toLowerCase());

    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStatus = !filters.status || user.status === filters.status;
    const matchesOrg = !filters.organization || user.organization === filters.organization;
    const matchesTeam = !filters.team || user.team === filters.team;
    const matchesEmailVerified =
      !filters.emailVerified ||
      (filters.emailVerified === 'verified' && user.emailVerified) ||
      (filters.emailVerified === 'unverified' && !user.emailVerified);
    const matchesTwoFactor =
      !filters.twoFactor ||
      (filters.twoFactor === 'enabled' && user.twoFactorEnabled) ||
      (filters.twoFactor === 'disabled' && !user.twoFactorEnabled);

    return (
      matchesSearch &&
      matchesRole &&
      matchesStatus &&
      matchesOrg &&
      matchesTeam &&
      matchesEmailVerified &&
      matchesTwoFactor
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map(user => user.id));
    }
  };

  const handleStatusChange = async (userId: number, newStatus: User['status']) => {
    try {
      if (newStatus === 'active') {
        await userService.activateUser(userId);
      } else {
        await userService.deactivateUser(userId);
      }

      setUsers(prev =>
        prev.map(user =>
          user.id === userId
            ? { ...user, status: newStatus, updatedAt: new Date().toISOString() }
            : user
        )
      );
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('Failed to update user status. Please try again.');
    }
  };

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      await userService.updateUserRole(userId, newRole);

      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, role: newRole, updatedAt: new Date().toISOString() } : user
        )
      );
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update user role. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (
      window.confirm('Are you sure you want to delete this user? This action cannot be undone.')
    ) {
      try {
        // Note: Backend doesn't have a delete endpoint yet, this would need to be implemented
        // await userService.deleteUser(userId);

        setUsers(prev => prev.filter(user => user.id !== userId));
        setSelectedUsers(prev => prev.filter(id => id !== userId));
        setTotalUsers(prev => prev - 1);
      } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user. Please try again.');
      }
    }
  };

  const handleBulkAction = async (action: string) => {
    if (window.confirm(`Are you sure you want to ${action} the selected users?`)) {
      // Handle bulk actions
      setSelectedUsers([]);
      setShowBulkActions(false);
    }
  };

  const getRoleColor = (role: UserRole) => {
    const colors = {
      [UserRole.Admin]: 'bg-purple-100 text-purple-800',
      [UserRole.ProductOwner]: 'bg-blue-100 text-blue-800',
      [UserRole.ScrumMaster]: 'bg-green-100 text-green-800',
      [UserRole.Developer]: 'bg-yellow-100 text-yellow-800',
      [UserRole.Stakeholder]: 'bg-gray-100 text-gray-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: User['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatStorage = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
        <p className="text-gray-600">Manage system users, roles, and permissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.active}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Admins</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.admins}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Activity className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Online Now</p>
              <p className="text-2xl font-bold text-gray-900">{userStats.onlineNow}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
                  value={filters.search}
                  onChange={e => setFilters(prev => ({ ...prev, search: e.target.value }))}
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center px-4 py-2 rounded-lg border ${
                  showFilters
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'border-gray-300 text-gray-700'
                }`}
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                <ChevronDown
                  className={`w-4 h-4 ml-2 transform ${showFilters ? 'rotate-180' : ''}`}
                />
              </button>

              {selectedUsers.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">
                    {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={() => setShowBulkActions(!showBulkActions)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Bulk Actions
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>

              <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.role}
                    onChange={e => setFilters(prev => ({ ...prev, role: e.target.value as UserRole | '' }))}
                  >
                    <option value="">All Roles</option>
                    <option value={UserRole.Admin}>Admin</option>
                    <option value={UserRole.ProductOwner}>Product Owner</option>
                    <option value={UserRole.ScrumMaster}>Scrum Master</option>
                    <option value={UserRole.Developer}>Developer</option>
                    <option value={UserRole.Stakeholder}>Stakeholder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.status}
                    onChange={e => setFilters(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | '' }))}
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Verified
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.emailVerified}
                    onChange={e => setFilters(prev => ({ ...prev, emailVerified: e.target.value }))}
                  >
                    <option value="">All</option>
                    <option value="verified">Verified</option>
                    <option value="unverified">Unverified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    2FA Enabled
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.twoFactor}
                    onChange={e => setFilters(prev => ({ ...prev, twoFactor: e.target.value }))}
                  >
                    <option value="">All</option>
                    <option value="enabled">Enabled</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Organization
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.organization}
                    onChange={e => setFilters(prev => ({ ...prev, organization: e.target.value }))}
                  >
                    <option value="">All Organizations</option>
                    <option value="CNC Manufacturing">CNC Manufacturing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.team}
                    onChange={e => setFilters(prev => ({ ...prev, team: e.target.value }))}
                  >
                    <option value="">All Teams</option>
                    <option value="Development Team">Development Team</option>
                    <option value="Project Management">Project Management</option>
                    <option value="Team 1">Team 1</option>
                    <option value="Team 2">Team 2</option>
                    <option value="Team 3">Team 3</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Bulk Actions Panel */}
          {showBulkActions && selectedUsers.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleBulkAction('activate')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <UserCheck className="w-4 h-4 mr-2 inline" />
                    Activate
                  </button>
                  <button
                    onClick={() => handleBulkAction('deactivate')}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    <UserX className="w-4 h-4 mr-2 inline" />
                    Deactivate
                  </button>
                  <button
                    onClick={() => handleBulkAction('delete')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4 mr-2 inline" />
                    Delete
                  </button>
                </div>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300"
                    checked={
                      selectedUsers.length === paginatedUsers.length && paginatedUsers.length > 0
                    }
                    onChange={handleSelectAll}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Organization
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Storage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserSelection(user.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={
                          user.profilePicture ||
                          `https://ui-avatars.com/api/?name=${user.firstName}+${user.lastName}&background=6366f1&color=fff`
                        }
                        alt={user.firstName}
                        className="w-8 h-8 rounded-full mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="flex items-center space-x-4 mt-1">
                          {user.emailVerified && (
                            <span className="flex items-center text-xs text-green-600">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Verified
                            </span>
                          )}
                          {user.twoFactorEnabled && (
                            <span className="flex items-center text-xs text-blue-600">
                              <Shield className="w-3 h-3 mr-1" />
                              2FA
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}
                    >
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.organization}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.team || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(user.lastLogin)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatStorage(user.storageUsed)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowViewModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <select
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                        value={user.status}
                        onChange={e =>
                          handleStatusChange(user.id, e.target.value as User['status'])
                        }
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * usersPerPage + 1} to{' '}
              {Math.min(currentPage * usersPerPage, filteredUsers.length)} of {filteredUsers.length}{' '}
              results
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && (
                <>
                  <span>...</span>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    className={`px-3 py-1 rounded-lg ${
                      currentPage === totalPages
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Profile Section */}
                <div className="lg:col-span-1">
                  <div className="text-center">
                    <img
                      src={
                        selectedUser.profilePicture ||
                        `https://ui-avatars.com/api/?name=${selectedUser.firstName}+${selectedUser.lastName}&background=6366f1&color=fff&size=128`
                      }
                      alt={selectedUser.firstName}
                      className="w-32 h-32 rounded-full mx-auto mb-4"
                    />
                    <h3 className="text-lg font-bold text-gray-900">
                      {selectedUser.firstName} {selectedUser.lastName}
                    </h3>
                    <p className="text-gray-600">{selectedUser.email}</p>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-center space-x-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}
                        >
                          {selectedUser.role}
                        </span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedUser.status)}`}
                        >
                          {selectedUser.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Section */}
                <div className="lg:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Email:</dt>
                          <dd className="text-sm text-gray-900">{selectedUser.email}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Phone:</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedUser.phone || 'Not set'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Location:</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedUser.location || 'Not set'}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Organization</h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Organization:</dt>
                          <dd className="text-sm text-gray-900">{selectedUser.organization}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Team:</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedUser.team || 'Not assigned'}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Department:</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedUser.department || 'Not set'}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Security</h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Email Verified:</dt>
                          <dd className="text-sm">
                            {selectedUser.emailVerified ? (
                              <span className="text-green-600">✓ Verified</span>
                            ) : (
                              <span className="text-red-600">✗ Not verified</span>
                            )}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">2FA Enabled:</dt>
                          <dd className="text-sm">
                            {selectedUser.twoFactorEnabled ? (
                              <span className="text-green-600">✓ Enabled</span>
                            ) : (
                              <span className="text-red-600">✗ Disabled</span>
                            )}
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Activity</h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Member Since:</dt>
                          <dd className="text-sm text-gray-900">
                            {formatDate(selectedUser.createdAt)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Last Login:</dt>
                          <dd className="text-sm text-gray-900">
                            {formatDate(selectedUser.lastLogin)}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Total Logins:</dt>
                          <dd className="text-sm text-gray-900">{selectedUser.loginCount}</dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Projects & Tasks</h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Projects:</dt>
                          <dd className="text-sm text-gray-900">{selectedUser.projectsCount}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Tasks Assigned:</dt>
                          <dd className="text-sm text-gray-900">{selectedUser.tasksAssigned}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Tasks Completed:</dt>
                          <dd className="text-sm text-gray-900">{selectedUser.tasksCompleted}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Completion Rate:</dt>
                          <dd className="text-sm text-gray-900">
                            {selectedUser.tasksAssigned > 0
                              ? Math.round(
                                  (selectedUser.tasksCompleted / selectedUser.tasksAssigned) * 100
                                )
                              : 0}
                            %
                          </dd>
                        </div>
                      </dl>
                    </div>

                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Storage</h4>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Used:</dt>
                          <dd className="text-sm text-gray-900">
                            {formatStorage(selectedUser.storageUsed)}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Form Modal */}
      <UserFormModal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSubmit={async userData => {
          if (showCreateModal) {
            // Create new user - Note: Backend doesn't have create user endpoint yet
            // This would need to be implemented in the backend
            try {
              // await userService.createUser(userData);
              console.log('User creation not yet implemented in backend API');
              // For now, just reload the users list
              window.location.reload();
            } catch (error) {
              console.error('Failed to create user:', error);
              alert('Failed to create user. Please try again.');
            }
          } else if (showEditModal && selectedUser) {
            // Update existing user
            try {
              if (userData.role !== selectedUser.role) {
                await userService.updateUserRole(selectedUser.id, userData.role);
              }
              if (userData.status !== selectedUser.status) {
                if (userData.status === 'active') {
                  await userService.activateUser(selectedUser.id);
                } else {
                  await userService.deactivateUser(selectedUser.id);
                }
              }

              // Reload users to get updated data
              const usersResponse = await userService.getUsers({
                page: currentPage,
                pageSize: usersPerPage,
              });

              // Transform and update users
              const transformedUsers: User[] = usersResponse.users.map(apiUser => ({
                id: apiUser.id,
                email: apiUser.email,
                firstName: apiUser.firstName,
                lastName: apiUser.lastName,
                role: apiUser.role,
                status: apiUser.isActive ? 'active' : 'inactive',
                organization: apiUser.organization || 'CNC Manufacturing',
                team: apiUser.team,
                lastLogin: apiUser.lastLoginAt,
                createdAt: apiUser.createdAt,
                emailVerified: apiUser.isEmailVerified,
                twoFactorEnabled: false,
                avatarUrl: apiUser.avatarUrl,
                phone: apiUser.phone,
                location: apiUser.location,
                department: apiUser.department,
                projectsCount: apiUser.projectsCount || 0,
                tasksAssigned: apiUser.tasksAssigned || 0,
                tasksCompleted: apiUser.tasksCompleted || 0,
                loginCount: apiUser.loginCount || 0,
                storageUsed: apiUser.storageUsed || 0,
              }));

              setUsers(transformedUsers);
            } catch (error) {
              console.error('Failed to update user:', error);
              alert('Failed to update user. Please try again.');
            }
          }
        }}
        user={selectedUser}
        mode={showCreateModal ? 'create' : 'edit'}
      />
    </div>
  );
};

export default UserManagementPage;
