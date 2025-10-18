import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  MoreVertical,
  Settings,
  Calendar,
  BarChart3,
  PieChart,
  Star,
  Award,
  Target,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
  status: 'active' | 'inactive' | 'busy' | 'away';
  tasksCompleted: number;
  tasksInProgress: number;
  hoursLogged: number;
  lastActive: string;
}

interface TeamMetrics {
  totalMembers: number;
  activeMembers: number;
  tasksCompleted: number;
  tasksInProgress: number;
  averageCompletionTime: number;
  totalHoursLogged: number;
  velocity: number;
  efficiency: number;
  satisfaction: number;
}

interface Team {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: string;
  updatedAt: string;
  leadId: string;
  leadName: string;
  members: TeamMember[];
  metrics: TeamMetrics;
  projects: Array<{
    id: string;
    name: string;
    status: string;
  }>;
  tags: string[];
}

const TeamsPage: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'members' | 'performance' | 'updated'>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data
  useEffect(() => {
    const mockTeams: Team[] = [
      {
        id: 'team-1',
        name: 'Frontend Development',
        description: 'Responsible for user interface development and user experience',
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        leadId: 'user-1',
        leadName: 'Alice Johnson',
        members: [
          {
            id: 'user-1',
            name: 'Alice Johnson',
            avatarUrl: 'https://picsum.photos/seed/alice/32/32.jpg',
            role: 'Team Lead',
            status: 'active',
            tasksCompleted: 42,
            tasksInProgress: 3,
            hoursLogged: 156,
            lastActive: '2024-01-15T14:30:00Z',
          },
          {
            id: 'user-2',
            name: 'Bob Smith',
            avatarUrl: 'https://picsum.photos/seed/bob/32/32.jpg',
            role: 'Senior Developer',
            status: 'active',
            tasksCompleted: 38,
            tasksInProgress: 5,
            hoursLogged: 142,
            lastActive: '2024-01-15T16:45:00Z',
          },
          {
            id: 'user-3',
            name: 'Carol Davis',
            avatarUrl: 'https://picsum.photos/seed/carol/32/32.jpg',
            role: 'UI/UX Designer',
            status: 'busy',
            tasksCompleted: 25,
            tasksInProgress: 4,
            hoursLogged: 98,
            lastActive: '2024-01-15T15:20:00Z',
          },
          {
            id: 'user-4',
            name: 'David Wilson',
            avatarUrl: 'https://picsum.photos/seed/david/32/32.jpg',
            role: 'Junior Developer',
            status: 'active',
            tasksCompleted: 18,
            tasksInProgress: 2,
            hoursLogged: 76,
            lastActive: '2024-01-15T11:15:00Z',
          },
        ],
        metrics: {
          totalMembers: 4,
          activeMembers: 3,
          tasksCompleted: 123,
          tasksInProgress: 14,
          averageCompletionTime: 3.2,
          totalHoursLogged: 472,
          velocity: 45,
          efficiency: 87,
          satisfaction: 4.5,
        },
        projects: [
          { id: 'proj-1', name: 'E-commerce Platform', status: 'active' },
          { id: 'proj-2', name: 'Mobile App Redesign', status: 'in-progress' },
        ],
        tags: ['frontend', 'react', 'ui/ux'],
      },
      {
        id: 'team-2',
        name: 'Backend Development',
        description: 'Server-side logic, APIs, and database management',
        status: 'active',
        createdAt: '2024-01-02T00:00:00Z',
        updatedAt: '2024-01-15T09:15:00Z',
        leadId: 'user-5',
        leadName: 'Eve Martinez',
        members: [
          {
            id: 'user-5',
            name: 'Eve Martinez',
            avatarUrl: 'https://picsum.photos/seed/eve/32/32.jpg',
            role: 'Tech Lead',
            status: 'active',
            tasksCompleted: 56,
            tasksInProgress: 4,
            hoursLogged: 189,
            lastActive: '2024-01-15T17:30:00Z',
          },
          {
            id: 'user-6',
            name: 'Frank Thompson',
            avatarUrl: 'https://picsum.photos/seed/frank/32/32.jpg',
            role: 'Backend Developer',
            status: 'active',
            tasksCompleted: 41,
            tasksInProgress: 6,
            hoursLogged: 167,
            lastActive: '2024-01-15T14:45:00Z',
          },
          {
            id: 'user-7',
            name: 'Grace Lee',
            avatarUrl: 'https://picsum.photos/seed/grace/32/32.jpg',
            role: 'DevOps Engineer',
            status: 'away',
            tasksCompleted: 29,
            tasksInProgress: 3,
            hoursLogged: 121,
            lastActive: '2024-01-14T10:30:00Z',
          },
        ],
        metrics: {
          totalMembers: 3,
          activeMembers: 2,
          tasksCompleted: 126,
          tasksInProgress: 13,
          averageCompletionTime: 2.8,
          totalHoursLogged: 477,
          velocity: 52,
          efficiency: 91,
          satisfaction: 4.7,
        },
        projects: [
          { id: 'proj-3', name: 'API Gateway', status: 'active' },
          { id: 'proj-4', name: 'Database Migration', status: 'completed' },
        ],
        tags: ['backend', 'api', 'devops'],
      },
      {
        id: 'team-3',
        name: 'Quality Assurance',
        description: 'Testing and quality assurance for all products',
        status: 'active',
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-15T11:00:00Z',
        leadId: 'user-8',
        leadName: 'Henry Chen',
        members: [
          {
            id: 'user-8',
            name: 'Henry Chen',
            avatarUrl: 'https://picsum.photos/seed/henry/32/32.jpg',
            role: 'QA Lead',
            status: 'active',
            tasksCompleted: 67,
            tasksInProgress: 2,
            hoursLogged: 201,
            lastActive: '2024-01-15T16:20:00Z',
          },
          {
            id: 'user-9',
            name: 'Iris Rodriguez',
            avatarUrl: 'https://picsum.photos/seed/iris/32/32.jpg',
            role: 'QA Engineer',
            status: 'active',
            tasksCompleted: 44,
            tasksInProgress: 5,
            hoursLogged: 134,
            lastActive: '2024-01-15T15:50:00Z',
          },
        ],
        metrics: {
          totalMembers: 2,
          activeMembers: 2,
          tasksCompleted: 111,
          tasksInProgress: 7,
          averageCompletionTime: 1.5,
          totalHoursLogged: 335,
          velocity: 38,
          efficiency: 94,
          satisfaction: 4.3,
        },
        projects: [
          { id: 'proj-5', name: 'Test Automation', status: 'active' },
          { id: 'proj-6', name: 'Performance Testing', status: 'in-progress' },
        ],
        tags: ['qa', 'testing', 'automation'],
      },
      {
        id: 'team-4',
        name: 'Product Management',
        description: 'Product strategy, planning, and stakeholder management',
        status: 'active',
        createdAt: '2024-01-04T00:00:00Z',
        updatedAt: '2024-01-14T16:30:00Z',
        leadId: 'user-10',
        leadName: 'Jack Anderson',
        members: [
          {
            id: 'user-10',
            name: 'Jack Anderson',
            avatarUrl: 'https://picsum.photos/seed/jack/32/32.jpg',
            role: 'Product Manager',
            status: 'active',
            tasksCompleted: 28,
            tasksInProgress: 8,
            hoursLogged: 89,
            lastActive: '2024-01-15T12:30:00Z',
          },
          {
            id: 'user-11',
            name: 'Karen White',
            avatarUrl: 'https://picsum.photos/seed/karen/32/32.jpg',
            role: 'Product Owner',
            status: 'inactive',
            tasksCompleted: 22,
            tasksInProgress: 1,
            hoursLogged: 67,
            lastActive: '2024-01-13T09:15:00Z',
          },
        ],
        metrics: {
          totalMembers: 2,
          activeMembers: 1,
          tasksCompleted: 50,
          tasksInProgress: 9,
          averageCompletionTime: 4.1,
          totalHoursLogged: 156,
          velocity: 25,
          efficiency: 78,
          satisfaction: 4.6,
        },
        projects: [
          { id: 'proj-7', name: 'Product Roadmap', status: 'active' },
          { id: 'proj-8', name: 'User Research', status: 'completed' },
        ],
        tags: ['product', 'strategy', 'planning'],
      },
    ];

    setTeams(mockTeams);
    setIsLoading(false);
  }, []);

  // Filter and sort teams
  useEffect(() => {
    let filtered = teams;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        team =>
          team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          team.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          team.leadName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          team.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(team => team.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'members':
          aValue = a.metrics.totalMembers;
          bValue = b.metrics.totalMembers;
          break;
        case 'performance':
          aValue = a.metrics.efficiency;
          bValue = b.metrics.efficiency;
          break;
        case 'updated':
          aValue = new Date(a.updatedAt).getTime();
          bValue = new Date(b.updatedAt).getTime();
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredTeams(filtered);
  }, [teams, searchQuery, statusFilter, sortBy, sortOrder]);

  const toggleTeamExpansion = (teamId: string) => {
    const newExpanded = new Set(expandedTeams);
    if (newExpanded.has(teamId)) {
      newExpanded.delete(teamId);
    } else {
      newExpanded.add(teamId);
    }
    setExpandedTeams(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'inactive':
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50';
      case 'archived':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
      case 'busy':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/20';
      case 'away':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 75) return 'text-blue-600 dark:text-blue-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teams</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage teams and track their performance
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4 mr-2" />
            Create Team
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Teams</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {teams.length}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Members</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {teams.reduce((sum, team) => sum + team.metrics.totalMembers, 0)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Teams</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {teams.filter(team => team.status === 'active').length}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Efficiency</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {Math.round(
                  teams.reduce((sum, team) => sum + team.metrics.efficiency, 0) / teams.length
                )}
                %
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="archived">Archived</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="name">Sort by Name</option>
              <option value="members">Sort by Members</option>
              <option value="performance">Sort by Performance</option>
              <option value="updated">Sort by Updated</option>
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className="grid grid-cols-2 gap-1 w-4 h-4">
                <div className="w-1.5 h-1.5 bg-current"></div>
                <div className="w-1.5 h-1.5 bg-current"></div>
                <div className="w-1.5 h-1.5 bg-current"></div>
                <div className="w-1.5 h-1.5 bg-current"></div>
              </div>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <div className="space-y-1 w-4 h-4">
                <div className="w-full h-0.5 bg-current"></div>
                <div className="w-full h-0.5 bg-current"></div>
                <div className="w-full h-0.5 bg-current"></div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Teams Grid/List */}
      <div
        className={
          viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'
        }
      >
        {filteredTeams.map(team => (
          <div
            key={team.id}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Team Header */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {team.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {team.name}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(team.status)}`}
                    >
                      {team.status}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                {team.description}
              </p>

              {/* Team Lead */}
              <div className="flex items-center space-x-2 mb-4">
                <img
                  src="https://picsum.photos/seed/lead/24/24.jpg"
                  alt={team.leadName}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Lead: {team.leadName}
                </span>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-4">
                {team.tags.map(tag => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Members</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {team.metrics.totalMembers}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Efficiency</p>
                  <p
                    className={`text-lg font-semibold ${getPerformanceColor(team.metrics.efficiency)}`}
                  >
                    {team.metrics.efficiency}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tasks Done</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {team.metrics.tasksCompleted}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Velocity</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {team.metrics.velocity}
                  </p>
                </div>
              </div>

              {/* Projects */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Projects</p>
                <div className="flex flex-wrap gap-1">
                  {team.projects.map(project => (
                    <span
                      key={project.id}
                      className={`px-2 py-1 rounded text-xs ${
                        project.status === 'active'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          : project.status === 'completed'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                      }`}
                    >
                      {project.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expand Button */}
              <button
                onClick={() => toggleTeamExpansion(team.id)}
                className="w-full flex items-center justify-center py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {expandedTeams.has(team.id) ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Show Details
                  </>
                )}
              </button>
            </div>

            {/* Expanded Details */}
            {expandedTeams.has(team.id) && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-700/30">
                <div className="space-y-4">
                  {/* Members */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Team Members
                    </h4>
                    <div className="space-y-2">
                      {team.members.map(member => (
                        <div key={member.id} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <img
                              src={member.avatarUrl}
                              alt={member.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {member.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {member.role}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}
                            >
                              {member.status}
                            </span>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {member.tasksCompleted} done
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {member.hoursLogged}h logged
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Performance Details */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                      Performance Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Avg Completion Time
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {team.metrics.averageCompletionTime} days
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Total Hours Logged
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {team.metrics.totalHoursLogged}h
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Team Satisfaction
                        </span>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {team.metrics.satisfaction}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          Last Updated
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDate(team.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex items-center space-x-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                      View Details
                    </button>
                    <button className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm">
                      View Reports
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg">
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredTeams.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {searchQuery || statusFilter !== 'all'
              ? 'No teams match your filters'
              : 'No teams created yet'}
          </p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Create Your First Team
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamsPage;
