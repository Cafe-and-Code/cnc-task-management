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

// Types
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'manager' | 'developer' | 'tester' | 'viewer';
  status: 'active' | 'inactive' | 'suspended' | 'pending';
  organization: string;
  team?: string;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  profilePicture?: string;
  phone?: string;
  location?: string;
  department?: string;
  permissions: string[];
  activity: UserActivity[];
  projectsCount: number;
  tasksAssigned: number;
  tasksCompleted: number;
  loginCount: number;
  storageUsed: number;
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
  role: string;
  status: string;
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
    suspended: 0,
    pending: 0,
    admins: 0,
    managers: 0,
    developers: 0,
    testers: 0,
    viewers: 0,
    newThisMonth: 0,
    onlineNow: 0,
  });

  const usersPerPage = 20;

  // Mock data
  useEffect(() => {
    const mockUsers: User[] = [
      {
        id: '1',
        email: 'john.doe@company.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'admin',
        status: 'active',
        organization: 'CNC Manufacturing',
        team: 'Development Team',
        lastLogin: '2024-01-15T10:30:00Z',
        createdAt: '2023-06-15T08:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        emailVerified: true,
        twoFactorEnabled: true,
        profilePicture: 'https://via.placeholder.com/40',
        phone: '+1-555-0123',
        location: 'New York, USA',
        department: 'IT',
        permissions: ['read', 'write', 'delete', 'admin'],
        activity: [],
        projectsCount: 8,
        tasksAssigned: 45,
        tasksCompleted: 38,
        loginCount: 247,
        storageUsed: 2048576,
      },
      {
        id: '2',
        email: 'jane.smith@company.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'manager',
        status: 'active',
        organization: 'CNC Manufacturing',
        team: 'Project Management',
        lastLogin: '2024-01-15T09:15:00Z',
        createdAt: '2023-08-20T10:30:00Z',
        updatedAt: '2024-01-14T16:45:00Z',
        emailVerified: true,
        twoFactorEnabled: false,
        phone: '+1-555-0124',
        location: 'Los Angeles, USA',
        department: 'Operations',
        permissions: ['read', 'write', 'manage'],
        activity: [],
        projectsCount: 12,
        tasksAssigned: 67,
        tasksCompleted: 59,
        loginCount: 189,
        storageUsed: 1536000,
      },
      {
        id: '3',
        email: 'mike.wilson@company.com',
        firstName: 'Mike',
        lastName: 'Wilson',
        role: 'developer',
        status: 'inactive',
        organization: 'CNC Manufacturing',
        team: 'Development Team',
        lastLogin: '2024-01-10T14:20:00Z',
        createdAt: '2023-09-10T11:00:00Z',
        updatedAt: '2024-01-10T14:20:00Z',
        emailVerified: true,
        twoFactorEnabled: false,
        phone: '+1-555-0125',
        location: 'Chicago, USA',
        department: 'Engineering',
        permissions: ['read', 'write'],
        activity: [],
        projectsCount: 6,
        tasksAssigned: 34,
        tasksCompleted: 28,
        loginCount: 156,
        storageUsed: 1024000,
      },
    ];

    // Add more mock users
    const additionalUsers: User[] = Array.from({ length: 47 }, (_, i) => ({
      id: `${i + 4}`,
      email: `user${i + 4}@company.com`,
      firstName: `User${i + 4}`,
      lastName: 'Test',
      role: ['admin', 'manager', 'developer', 'tester', 'viewer'][
        Math.floor(Math.random() * 5)
      ] as User['role'],
      status: ['active', 'inactive', 'suspended', 'pending'][
        Math.floor(Math.random() * 4)
      ] as User['status'],
      organization: 'CNC Manufacturing',
      team: `Team ${(i % 5) + 1}`,
      lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      emailVerified: Math.random() > 0.1,
      twoFactorEnabled: Math.random() > 0.7,
      phone: `+1-555-${String(i + 1000).padStart(4, '0')}`,
      location: [
        'New York, USA',
        'Los Angeles, USA',
        'Chicago, USA',
        'Houston, USA',
        'Phoenix, USA',
      ][i % 5],
      department: ['IT', 'Operations', 'Engineering', 'Quality', 'Maintenance'][i % 5],
      permissions: [['read'], ['read', 'write'], ['read', 'write', 'manage']][
        Math.floor(Math.random() * 3)
      ],
      activity: [],
      projectsCount: Math.floor(Math.random() * 15) + 1,
      tasksAssigned: Math.floor(Math.random() * 80) + 10,
      tasksCompleted: Math.floor(Math.random() * 70) + 5,
      loginCount: Math.floor(Math.random() * 300) + 10,
      storageUsed: Math.floor(Math.random() * 5000000) + 100000,
    }));

    setUsers([...mockUsers, ...additionalUsers]);
    setTotalUsers(50);

    // Calculate stats
    const stats = {
      total: additionalUsers.length + mockUsers.length,
      active:
        mockUsers.filter(u => u.status === 'active').length +
        additionalUsers.filter(u => u.status === 'active').length,
      inactive:
        mockUsers.filter(u => u.status === 'inactive').length +
        additionalUsers.filter(u => u.status === 'inactive').length,
      suspended:
        mockUsers.filter(u => u.status === 'suspended').length +
        additionalUsers.filter(u => u.status === 'suspended').length,
      pending:
        mockUsers.filter(u => u.status === 'pending').length +
        additionalUsers.filter(u => u.status === 'pending').length,
      admins:
        mockUsers.filter(u => u.role === 'admin').length +
        additionalUsers.filter(u => u.role === 'admin').length,
      managers:
        mockUsers.filter(u => u.role === 'manager').length +
        additionalUsers.filter(u => u.role === 'manager').length,
      developers:
        mockUsers.filter(u => u.role === 'developer').length +
        additionalUsers.filter(u => u.role === 'developer').length,
      testers:
        mockUsers.filter(u => u.role === 'tester').length +
        additionalUsers.filter(u => u.role === 'tester').length,
      viewers:
        mockUsers.filter(u => u.role === 'viewer').length +
        additionalUsers.filter(u => u.role === 'viewer').length,
      newThisMonth: 12,
      onlineNow: 8,
    };
    setUserStats(stats);
    setLoading(false);
  }, []);

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

  const handleStatusChange = async (userId: string, newStatus: User['status']) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId
          ? { ...user, status: newStatus, updatedAt: new Date().toISOString() }
          : user
      )
    );
  };

  const handleRoleChange = async (userId: string, newRole: User['role']) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === userId ? { ...user, role: newRole, updatedAt: new Date().toISOString() } : user
      )
    );
  };

  const handleDeleteUser = async (userId: string) => {
    if (
      window.confirm('Are you sure you want to delete this user? This action cannot be undone.')
    ) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      setSelectedUsers(prev => prev.filter(id => id !== userId));
      setTotalUsers(prev => prev - 1);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (window.confirm(`Are you sure you want to ${action} the selected users?`)) {
      // Handle bulk actions
      setSelectedUsers([]);
      setShowBulkActions(false);
    }
  };

  const getRoleColor = (role: User['role']) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      developer: 'bg-green-100 text-green-800',
      tester: 'bg-yellow-100 text-yellow-800',
      viewer: 'bg-gray-100 text-gray-800',
    };
    return colors[role];
  };

  const getStatusColor = (status: User['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-gray-100 text-gray-800',
    };
    return colors[status];
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
                    onChange={e => setFilters(prev => ({ ...prev, role: e.target.value }))}
                  >
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="developer">Developer</option>
                    <option value="tester">Tester</option>
                    <option value="viewer">Viewer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={filters.status}
                    onChange={e => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="pending">Pending</option>
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
                        <option value="suspended">Suspended</option>
                        <option value="pending">Pending</option>
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
            // Create new user
            const newUser: User = {
              id: Date.now().toString(),
              ...userData,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastLogin: '',
              emailVerified: userData.emailVerified,
              twoFactorEnabled: userData.twoFactorEnabled,
              activity: [],
              projectsCount: 0,
              tasksAssigned: 0,
              tasksCompleted: 0,
              loginCount: 0,
              storageUsed: 0,
              profilePicture: undefined,
            };
            setUsers(prev => [newUser, ...prev]);
            setTotalUsers(prev => prev + 1);
          } else if (showEditModal && selectedUser) {
            // Update existing user
            setUsers(prev =>
              prev.map(user =>
                user.id === selectedUser.id
                  ? { ...user, ...userData, updatedAt: new Date().toISOString() }
                  : user
              )
            );
          }
        }}
        user={selectedUser}
        mode={showCreateModal ? 'create' : 'edit'}
      />
    </div>
  );
};

export default UserManagementPage;
